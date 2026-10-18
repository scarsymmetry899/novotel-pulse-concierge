import os
import json
import time
import requests
import stitch_client

PROJECT_ID = stitch_client.PROJECT_ID
DESIGN_SYSTEM = "assets/4825844436918427474"

SCREENS = [
    {
        "id": "1_onboarding_mini_app",
        "title": "1. 3-Step Chip-Based Guest Onboarding Mini-App (<30s Data Capture)",
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
        "id": "2_in_stay_concierge_hub",
        "title": "2. Guest In-Stay Concierge Hub & Live Facility Board",
        "deviceType": "MOBILE",
        "prompt": """Design the main guest dashboard for the "Novotel Pulse Concierge" mobile mini-app (393x852). 
Color palette: Space Cadet (#171E52) as the dominant structural accent, Blue Zodiac (#0F1155) for ambient depth, Persian Blue (#1E22AA) for interactive buttons, and crisp white (#FFFFFF) against a clean pearl backdrop (#F8F9FC).

Visual Structure:
- Welcome Header: Subdued luxury card displaying "Suite 412 • Executive Residence", guest name, with a discreet champagne gold (#C5A880) "Accor Live Limitless Platinum" status badge.
- Live Facility Status Deck (Horizontal Carousel):
  - Card 1 (Heated Infinity Pool): Live temperature tag "28.5°C • Calm (30% Occupied)", lap hours (6:00 - 22:00), 1-tap "Reserve Cabana" pill button.
  - Card 2 (InBalance Fitness Centre): "24/7 Access • Trainer on Duty", quick locker pass trigger.
  - Card 3 (Tennis & Padel Courts): "Court 1 Available • 17:00 Slot Open", 1-tap booking drawer.
  - Card 4 (Wellness Spa): "Hydrotherapy Open", treatment menu trigger.
- Instant Butler & Housekeeping Quick-Dispatch Bar:
  - Grid of four luxury quick-tap buttons with subtle micro-borders:
    1. "Warm My Towels (Scheduled: 21:00)"
    2. "Evening Turndown"
    3. "Ice & Glassware"
    4. "Nespresso & Water Refill"
- Live Dispatch Timeline Pill:
  - Active tracking widget for current requests: "Heated Towels" -> 4-stage connected dot progress bar: [Requested] -> [Prepared] -> [En Route] -> [Delivered], with active step pulsing in Persian Blue (#1E22AA).
- Bottom Navigation Bar: Floating blurred glass dock with 4 minimalist icons: [Home], [Wellness & Sports], [Dining], [Butler Desk]."""
    },
    {
        "id": "3_operations_command_portal",
        "title": "3. Cross-Department Front Desk & Operations Command Portal",
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
        "id": "4_qr_welcome_card_handoff",
        "title": "4. One-Scan QR Welcome Card & Digital Key Handoff Interface",
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
        "id": "5_whatsapp_concierge_previews",
        "title": "5. WhatsApp Conversational Concierge Card Previews",
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

def generate_screen(screen_spec):
    print(f"=== Starting generation for: {screen_spec['title']} ===")
    args = {
        "projectId": PROJECT_ID,
        "prompt": screen_spec["prompt"],
        "deviceType": screen_spec["deviceType"],
        "designSystem": DESIGN_SYSTEM,
        "modelId": "GEMINI_3_8_FLASH"
    }
    
    start_time = time.time()
    try:
        res = stitch_client.call_stitch("generate_screen_from_text", args, timeout=240)
        print(f"Direct response received in {time.time() - start_time:.1f}s")
        return res
    except Exception as e:
        print(f"Call exception: {e}. Polling get_screen / list_screens...")
        return None

if __name__ == "__main__":
    import sys
    idx = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    generate_screen(SCREENS[idx])
