# Novotel Pulse Concierge

> **Executive Leisure & Elevated Hospitality**  
> An ultra-responsive, zero-download Mobile Mini-App for guests paired with a cross-department Front Desk & Operations Command Portal. Designed strictly to Novotel & Accor 5-star brand identity and enterprise standards.

[![Google Cloud Platform](https://img.shields.io/badge/GCP-Cloud_Run_%26_Functions_2nd_Gen-4285F4?logo=google-cloud&logoColor=white)](https://cloud.google.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Custom_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Supabase](https://img.shields.io/badge/Supabase-Active_Realtime_Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 1. System Architecture & Dual Backend

Novotel Pulse Concierge provides an enterprise dual-backend architecture:
1. **Google Cloud Platform & Firebase Native**:
   - **Hosting**: Google Cloud Run / Firebase App Hosting
   - **Database**: Cloud Firestore (Native mode) with strict room-level security rules (`firestore.rules`)
   - **Authentication**: Firebase Custom Auth Tokens scoped to `{ stayId, roomId, role: 'guest' }`
   - **Event Pipeline**: Cloud Functions 2nd Gen (TypeScript) for Meta WhatsApp Graph API & Google Chat Webhook dispatches
2. **Supabase Realtime PostgreSQL**:
   - Live hosted project on Supabase (`ncvzbrobotjckqpcekla`) with instant WebSocket publications across `rooms`, `stays`, `preferences`, `service_requests`, and `facilities`.

```
                    ┌────────────────────────┐
                    │ Front Desk / Reception │
                    └───────────┬────────────┘
                                │ Creates Stay / Scans NFC Card
                                ▼
         ┌──────────────────────────────────────────────────┐
         │ 2nd Gen Cloud Function: sendWhatsAppWelcome      │
         └──────────────────────┬───────────────────────────┘
                                │ Meta Graph API (SMS / WhatsApp)
                                ▼
         ┌──────────────────────────────────────────────────┐
         │ Guest WhatsApp: One-Scan Magic Link (/stay?token)│
         └──────────────────────┬───────────────────────────┘
                                │ Zero-Login Auto Authentication
                                ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ Novotel Pulse Mobile Mini-App (iOS Safari / WhatsApp Webview)│
    ├─────────────────────────────────────────────────────────────┤
    │  • 3-Step Pill/Chip Onboarding (<30s)                       │
    │  • In-Residence Concierge Hub & Live Facility Telemetry     │
    │  • 1-Tap Butler Quick-Dispatch (Warmed Towels, Turndown)     │
    │  • Contactless NFC Room Key Pass Simulator                  │
    └──────────────────────┬──────────────────────────────────────┘
                           │ Realtime Updates (Firestore / Supabase)
                           ▼
    ┌─────────────────────────────────────────────────────────────┐
    │ Front Desk & Operations Command Portal (/staff)             │
    ├─────────────────────────────────────────────────────────────┤
    │  • Master Residence Grid (Room 412 VIP Card with Gold Aura) │
    │  • Live Department Dispatch Kanban (Housekeeping / Wellness)│
    │  • One-Click WhatsApp Guest Dispatch & QR Badge Generator   │
    └─────────────────────────────────────────────────────────────┘
```

---

## 2. Master Brand Token Dictionary

Every screen and interaction strictly enforces Novotel’s verified brand identity:

```json
{
  "brand": "Novotel Hotels & Resorts",
  "theme": "Executive Leisure & Elevated Hospitality",
  "colors": {
    "primary": "#171E52",         // Novotel Space Cadet (Structural anchor)
    "primaryDeep": "#0F1155",     // Blue Zodiac (Surfaces, cards, headers)
    "accentElectric": "#1E22AA",  // Persian Blue (Active chips, focus rings, CTAs)
    "accentLuxury": "#C5A880",    // Brushed Champagne Gold (VIP badges, ratings)
    "canvasLight": "#F8F9FC",     // Premium Porcelain Travertine
    "surfaceWhite": "#FFFFFF",    // Crisp Card White
    "borderMuted": "#E2E5F0",     // Refined Slate Outline
    "textPrimary": "#171E52",
    "textSecondary": "#5E6482"
  },
  "typography": {
    "displaySerif": "Playfair Display (Editorial Luxury)",
    "bodySans": "Plus Jakarta Sans (Precision & Clarity)"
  }
}
```

---

## 3. Key Deliverables & Code Structure

- **`app/page.tsx`**: Mobile-first Guest Mini-App (393px iOS/WhatsApp viewport) with:
  - 3-Step Onboarding Stepper (Wellness, Sleep & Bath Warming, Dining & Allergens)
  - In-Stay Concierge Hub with Live Pool Telemetry (28.5°C) & 4-Stage Dispatch Timeline
  - Contactless Digital Keycard & NFC Unlock Simulator
- **`app/staff/page.tsx`**: 1440x900 Cross-Department Operations Command Portal with room status grid, VIP indicators, live Kanban, and 1-click WhatsApp notify.
- **`app/stay/page.tsx`**: Tokenized frictionless entry (`/stay?token=<TOKEN>`) validating guest credentials with zero logins.
- **`app/whatsapp/page.tsx`**: Native WhatsApp Business conversational previews with verified green checkmark, rich media headers, and interactive action buttons.
- **`firestore.rules`**: Production-ready Firestore Security Rules guaranteeing database-level room isolation (cross-room enumeration is blocked with `permission-denied`).
- **`functions/src/index.ts`**: Google Cloud Functions 2nd Gen in TypeScript:
  1. `exchangeStayToken`: Validates magic link hashes and mints custom guest tokens.
  2. `sendWhatsAppWelcome`: Fires localized onboarding invitation upon stay creation.
  3. `routeServiceRequest`: Dispatches interactive cards to department Google Chat spaces (`#housekeeping-alerts`, `#wellness-desk`).
  4. `notifyRequestStatusChange`: Sends real-time WhatsApp updates when butler status transitions to `in_progress` ("En route") or `completed`.
- **`types/hospitality.ts`**: Strict TypeScript interfaces for rooms, stays, preferences, requests, facilities, and webhook payloads.
- **`lib/supabase.ts` & `lib/mockData.ts`**: Live Supabase PostgreSQL client + offline fallback mock dataset.

---

## 4. Local Development

```bash
# Clone repository
git clone https://github.com/scarsymmetry899/novotel-pulse-concierge.git
cd novotel-pulse-concierge

# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the Guest Mobile Mini-App.  
Visit [http://localhost:3000/staff](http://localhost:3000/staff) for the Operations Command Portal.  
Visit [http://localhost:3000/whatsapp](http://localhost:3000/whatsapp) for the WhatsApp Business conversational preview.

---

## 5. Deployment Options

### A. Vercel
Deploy seamlessly using Vercel CLI or Git integration:
```bash
vercel --prod
```

### B. Google Cloud Run / Firebase App Hosting
Build and containerize for Google Cloud Run:
```bash
# Build Google Cloud Run container
gcloud builds submit --tag gcr.io/PROJECT_ID/novotel-pulse-concierge
gcloud run deploy novotel-pulse-concierge --image gcr.io/PROJECT_ID/novotel-pulse-concierge --platform managed --region us-central1 --allow-unauthenticated

# Deploy Cloud Functions & Firestore Rules
firebase deploy --only functions,firestore:rules
```

---

## 6. License
Novotel & Accor Hospitality Standard. All rights reserved.
