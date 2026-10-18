import os
import json
import time
import requests
import stitch_client

PROJECT_ID = stitch_client.PROJECT_ID
DESIGN_SYSTEM = "assets/4825844436918427474"
OUTPUT_DIR = "screens"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROMPTS = [
    {
        "index": 1,
        "key": "screen_1_onboarding",
        "title": "3-Step Chip-Based Guest Onboarding Mini-App (<30s Data Capture)",
        "deviceType": "MOBILE",
        "prompt": """Design an ultra-luxurious, frictionless 3-step onboarding flow for a mobile web mini-app inside an iOS Safari/WhatsApp viewport (393x852). 
Brand: Novotel. Primary color palette: Novotel Space Cadet (#171E52), Persian Blue (#1E22AA), and Blue Zodiac (#0F1155), set over a refined porcelain canvas (#F8F9FC) with crisp white cards (#FFFFFF) and muted slate borders (#E2E5F0).

Layout & Atmosphere:
- Header: Elegant serif typography ("Tailor Your Sanctuary") in #171E52, with a minimalist 3-segment progress indicator filled with Persian Blue (#1E22AA).
- Stepper Flow:
  - Step 1 (Wellness & Active Recreation): Multi-select pill chips featuring micro-icons: [Heated Outdoor Pool 28°C], [InBalance Gym 24/7], [Padel / Tennis Court], [Sauna & Hydrotherapy]. Selected chips turn solid Novotel Space Cadet (#171E52) with white text and a glowing 1px Persian Blue border. Unselected chips are crisp white with #5E6482 text.
  - Step 2 (Rest & Sleep Experience): Pill selection for pillows: [Ergonomic Memory Foam], [Goose Down], [Organic Buckwheat]. Quick-toggle bath warmth card: "Pre-warm Bath Towels for Evening" with an intuitive circular time pill dial (e.g., 20:30). Temperature slider set at 20°C with frosted glass indicator.
  - Step 3 (Dining & Refreshments): Selection chips for [The Square Buffet (7:00 AM)] vs [In-Room Express Continental Tray], minibar toggles: [San Pellegrino Sparkling], [Oat Milk], [Artisanal Espresso], and allergen tags [Gluten-Free], [Nut Allergy], [Lactose-Free].
- Micro-interactions: Floating bottom bar with auto-save checkmark and a broad, elegant button styled in #171E52 labeled "Enter Your Residence", with smooth corner radius (rounded-2xl) and subtle gold-tinted shadow."""
    },
    {
        "index": 3,
        "key": "screen_3_operations_portal",
        "title": "Cross-Department Front Desk & Operations Command Portal",
        "deviceType": "DESKTOP",
        "prompt": """Design a high-density, professional desktop operations command center (1440x900) for Novotel Front Desk, Housekeeping, and Wellness coordinators.
Aesthetic: Polished corporate luxury. Sidebar in deep Novotel Space Cadet (#171E52), header in Blue Zodiac (#0F1155), main canvas in soft workspace grey (#F4F6FB), and action elements accented in Persian Blue (#1E22AA).

Layout & Components:
- Top Navigation Bar: Novotel crest logo, real-time clock, shift selector ("Morning Shift • Tower A"), global search bar for guest names/room numbers, and active alerts counter.
- Left Sidebar Navigation:
  - Nav items with clean monochrome icons: [All Residences], [Wellness & Tennis Dispatch], [Housekeeping & Towel Queue], [F&B Breakfast Roster], [WhatsApp Messenger Logs].
- Central Command Area - Two-Column Split View:
  - Left Column (Room Grid & VIP Indicators - 60% width):
    - Grid of room status cards (Room 301, 302, 408, 412).
    - Room 412 VIP Card highlighted with a subtle champagne bronze border: Guest details, Arrival 14:00, with clear, color-coded pill tags:
      - [Tennis Booked: 17:00] (Emerald green tag)
      - [Towels Warming: 21:00] (Amber warm tag)
      - [Dietary: Celiac / Nut Allergy] (Rose warning tag)
      - [Room Temp: 20°C Pre-Set]
  - Right Column (Live Department Dispatch Kanban - 40% width):
    - Columns: "Incoming Requests", "In Preparation", "Butler En Route", "Completed".
    - Rich interactive cards: "Room 412: 2x Bath Towels Warmed & Delivered", with assigned staff avatar, countdown timer ("12 mins remaining"), and a 1-click action: "Notify Guest via WhatsApp".
- Bottom Action Drawer:
  - Fast-action toolbar: "Generate Guest QR Card", "Send Magic WhatsApp Welcome Link", "Broadcast Pool Notice"."""
    },
    {
        "index": 4,
        "key": "screen_4_qr_welcome_card",
        "title": "One-Scan QR Welcome Card & Digital Key Handoff Interface",
        "deviceType": "MOBILE",
        "prompt": """Design an elegant printable guest welcome card and digital handoff modal (Aspect ratio 16:9 and 9:16 mobile overlay).
Theme: Novotel Executive Lounge Welcome Experience.
Primary Color: Novotel Space Cadet (#171E52) gradient fading into Blue Zodiac (#0F1155), with crisp white typography and metallic champagne gold (#C5A880) fine-line filigree borders.

Elements & Content:
- Central Hero QR Code: High-contrast white QR code framed inside a rounded card with a subtle 1px Persian Blue (#1E22AA) halo.
- Copy:
  - Subtitle: "NOVOEL HOTELS & RESORTS • YOUR SANCTUARY AWAITS" (uppercase, spaced sans-serif).
  - Main Heading: "Scan to Unlock Your Bespoke Stay" (Editorial Playfair Display serif).
  - Bulleted VIP Perks:
    • Instant Pool & Tennis Court Reservation
    • One-Tap Towel Warming & Turndown Service
    • Direct Butler Messaging via WhatsApp
- Bottom Action Strip:
  - "Prefer WhatsApp? Tap below to receive your private access link instantly via SMS or WhatsApp."
  - Two discrete branded buttons: [Send via WhatsApp] styled in brand dark blue with clean icon, [Open Direct Portal]."""
    },
    {
        "index": 5,
        "key": "screen_5_whatsapp_previews",
        "title": "WhatsApp Conversational Concierge Card Previews",
        "deviceType": "MOBILE",
        "prompt": """Design the rich preview cards and conversational message UI for the Novotel Concierge WhatsApp Business integration (Mobile layout, 393x852).
Style: Native WhatsApp dark/light chat bubble standard enriched with Novotel brand assets.

Screenshots to showcase:
- Message 1: Pre-Arrival Welcome Card
  - Sender: "Novotel Concierge (Verified Green Badge)"
  - Rich Link Preview Header: Editorial photo of the Novotel heated pool deck bathed in dusk light.
  - Title: "Welcome to Novotel, Mr. Hastings"
  - Body: "Your Executive Suite 412 is being prepared. Customize your bedding, warm towel timings, and tennis court access ahead of arrival."
  - Interactive WhatsApp CTA Buttons: [Personalize My Stay] (Opens Mini-App directly), [Call Concierge].
- Message 2: Live Action Confirmation Card
  - Body: "✓ Butler Service Confirmed: Your heated bath towels are scheduled for delivery to Suite 412 at 20:30. Room temperature set to 20°C."
  - CTA Button: [Track Request in Mini-App]."""
    }
]

def generate_and_save(item):
    print(f"\n=======================================================")
    print(f"Generating Screen {item['index']}: {item['title']}")
    print(f"Device: {item['deviceType']}")
    print(f"=======================================================")
    
    args = {
        "projectId": PROJECT_ID,
        "prompt": item["prompt"],
        "deviceType": item["deviceType"],
        "designSystem": DESIGN_SYSTEM,
        "modelId": "GEMINI_3_8_FLASH"
    }

    start_time = time.time()
    res = stitch_client.call_stitch("generate_screen_from_text", args, timeout=300)
    elapsed = time.time() - start_time
    print(f"Generated Screen {item['index']} in {elapsed:.1f}s")
    
    raw_path = os.path.join(OUTPUT_DIR, f"{item['key']}_raw.json")
    with open(raw_path, "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2)

    try:
        structured = res.get("structuredContent", {})
        outputs = structured.get("outputComponents", [])
        screen_data = None
        for comp in outputs:
            if "design" in comp and "screens" in comp["design"]:
                screens = comp["design"]["screens"]
                if screens:
                    screen_data = screens[0]
                    break
        
        if screen_data:
            html_url = screen_data.get("htmlCode", {}).get("downloadUrl")
            img_url = screen_data.get("screenshot", {}).get("downloadUrl")
            title = screen_data.get("title", item["title"])

            if html_url:
                html_resp = requests.get(html_url, timeout=30)
                html_file = os.path.join(OUTPUT_DIR, f"{item['key']}.html")
                with open(html_file, "w", encoding="utf-8") as f:
                    f.write(html_resp.text)
                print(f"Saved HTML to {html_file} ({len(html_resp.text)} bytes)")

            if img_url:
                img_resp = requests.get(img_url, timeout=30)
                img_file = os.path.join(OUTPUT_DIR, f"{item['key']}.png")
                with open(img_file, "wb") as f:
                    f.write(img_resp.content)
                print(f"Saved Screenshot to {img_file} ({len(img_resp.content)} bytes)")
    except Exception as e:
        print(f"Error parsing/saving screen assets: {e}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        target_idx = int(sys.argv[1])
        item = next((p for p in PROMPTS if p["index"] == target_idx), None)
        if item:
            generate_and_save(item)
    else:
        for p in PROMPTS:
            generate_and_save(p)
