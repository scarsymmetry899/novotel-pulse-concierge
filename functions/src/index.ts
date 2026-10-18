/**
 * Google Cloud Functions (2nd Gen, TypeScript)
 * Novotel Pulse Concierge - Zero-Download Magic Link & Real-time Dispatch
 */

import { onRequest } from "firebase-functions/v2/https";
import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Helper: Send WhatsApp Message via Meta Graph API / WhatsApp Business Cloud API
 */
async function sendWhatsAppNotification(to: string, messageBody: string) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`[WhatsApp Mock Dispatch] To: ${to} | Content: ${messageBody}`);
    return;
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to.replace(/[^0-9]/g, ""),
        type: "text",
        text: { preview_url: true, body: messageBody }
      })
    });
    const result = await res.json();
    console.log("[WhatsApp Sent]", result);
  } catch (err) {
    console.error("[WhatsApp Error]", err);
  }
}

/**
 * Helper: Send Interactive Card to Department Google Chat Space
 */
async function sendGoogleChatAlert(spaceWebhookUrl: string, title: string, subtitle: string, fields: Array<{ label: string; value: string }>) {
  if (!spaceWebhookUrl) {
    console.log(`[Google Chat Mock] Title: ${title} | ${JSON.stringify(fields)}`);
    return;
  }

  try {
    await fetch(spaceWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cards: [
          {
            header: {
              title: `[Novotel Operations] ${title}`,
              subtitle: subtitle,
              imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=128&q=80"
            },
            sections: [
              {
                widgets: fields.map(f => ({
                  keyValue: {
                    topLabel: f.label,
                    content: f.value
                  }
                }))
              }
            ]
          }
        ]
      })
    });
  } catch (err) {
    console.error("[Google Chat Error]", err);
  }
}

/**
 * 1. exchangeStayToken
 * Validates incoming magic link tokens, verifies timestamp/hash against /stays/{stayId},
 * and mints a Firebase Custom Auth Token with { stayId, roomId, role: 'guest' }.
 */
export const exchangeStayToken = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const { token } = req.body;
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "Missing or invalid token" });
    return;
  }

  try {
    // Search active stay matching token hash
    const query = await db.collection("stays")
      .where("accessTokenHash", "==", token)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (query.empty) {
      res.status(401).json({ error: "Invalid or expired guest access token" });
      return;
    }

    const stayDoc = query.docs[0];
    const stayData = stayDoc.data();

    // Verify stay checkout has not passed
    const now = new Date();
    const checkOut = stayData.checkOut ? (stayData.checkOut.toDate ? stayData.checkOut.toDate() : new Date(stayData.checkOut)) : null;
    if (checkOut && now > checkOut) {
      res.status(403).json({ error: "Stay has ended. Please contact front desk." });
      return;
    }

    // Mint Custom Token with strict room claims
    const customToken = await admin.auth().createCustomToken(stayDoc.id, {
      stayId: stayDoc.id,
      roomId: stayData.roomId,
      role: "guest"
    });

    res.status(200).json({
      customToken,
      stayId: stayDoc.id,
      roomId: stayData.roomId,
      guestName: stayData.guestName
    });
  } catch (err: any) {
    console.error("[exchangeStayToken Error]", err);
    res.status(500).json({ error: "Internal server error authenticating token" });
  }
});

/**
 * 2. sendWhatsAppWelcome
 * Triggers when front desk creates a stay document; sends localized WhatsApp message with magic link.
 */
export const sendWhatsAppWelcome = onDocumentCreated("stays/{stayId}", async (event) => {
  const stay = event.data?.data();
  if (!stay || !stay.guestPhone || stay.whatsappOptIn === false) {
    return;
  }

  const magicLink = `https://novotel-pulse.web.app/stay?token=${stay.accessTokenHash || event.params.stayId}`;
  const message = `Welcome to Novotel Hotels & Resorts, ${stay.guestName}. ` +
    `Your digital sanctuary is ready. Personalize your bedding, pool access, and heated bath towels in under 30 seconds: ${magicLink}`;

  await sendWhatsAppNotification(stay.guestPhone, message);
});

/**
 * 3. routeServiceRequest
 * Triggers on create in /stays/{stayId}/requests/{requestId}
 * - Routes to department Google Chat Space
 * - Sends WhatsApp confirmation to guest
 */
export const routeServiceRequest = onDocumentCreated("stays/{stayId}/requests/{requestId}", async (event) => {
  const req = event.data?.data();
  if (!req) return;

  const stayDoc = await db.collection("stays").doc(event.params.stayId).get();
  const stay = stayDoc.data();

  // Send interactive card to staff Google Chat
  const webhookEnvMap: Record<string, string | undefined> = {
    housekeeping: process.env.GOOGLE_CHAT_HOUSEKEEPING_WEBHOOK,
    wellness: process.env.GOOGLE_CHAT_WELLNESS_WEBHOOK,
    fnb: process.env.GOOGLE_CHAT_FNB_WEBHOOK,
    front_desk: process.env.GOOGLE_CHAT_FRONTDESK_WEBHOOK,
  };

  const webhook = webhookEnvMap[req.department];
  if (webhook) {
    await sendGoogleChatAlert(
      webhook,
      `New Request: ${req.serviceType}`,
      `Room ${req.roomId} • ${stay?.guestName || "Guest"}`,
      [
        { label: "Details", value: req.details || "Standard service requested" },
        { label: "Target Time", value: req.scheduledTime || "Immediate dispatch" },
        { label: "Status", value: req.status.toUpperCase() }
      ]
    );
  }

  // Send WhatsApp confirmation to guest if phone available
  if (stay?.guestPhone && stay?.whatsappOptIn !== false) {
    const confirmation = `Novotel Concierge: Your request for "${req.serviceType}" ` +
      (req.scheduledTime ? `at ${req.scheduledTime} ` : "") +
      `has been received by our ${req.department} team. Tracking in your mini-app.`;
    await sendWhatsAppNotification(stay.guestPhone, confirmation);
  }
});

/**
 * 4. notifyRequestStatusChange
 * Triggers on update in /stays/{stayId}/requests/{requestId}
 * Pushes WhatsApp updates when status becomes in_progress ("En route") or completed.
 */
export const notifyRequestStatusChange = onDocumentUpdated("stays/{stayId}/requests/{requestId}", async (event) => {
  const before = event.data?.before.data();
  const after = event.data?.after.data();

  if (!before || !after || before.status === after.status) {
    return;
  }

  const stayDoc = await db.collection("stays").doc(event.params.stayId).get();
  const stay = stayDoc.data();

  if (!stay?.guestPhone || stay?.whatsappOptIn === false) {
    return;
  }

  let statusMsg = "";
  if (after.status === "in_progress") {
    statusMsg = `✓ Butler Service Update: Your request for "${after.serviceType}" is now in preparation and en route to your residence.`;
  } else if (after.status === "completed") {
    statusMsg = `✓ Delivered: Your request for "${after.serviceType}" has been fulfilled. Please let us know if we may tailor anything further.`;
  }

  if (statusMsg) {
    await sendWhatsAppNotification(stay.guestPhone, statusMsg);
  }
});
