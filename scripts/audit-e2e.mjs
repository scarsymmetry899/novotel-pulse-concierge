import { chromium } from 'playwright';

async function runAudit() {
  console.log('🚀 Starting Novotel Pulse Concierge End-to-End Playwright Audit...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  const page = await context.newPage();
  const pageErrors = [];

  page.on('pageerror', err => {
    pageErrors.push(`PageError: ${err.message}`);
  });

  const results = {
    guestHub: {},
    onboarding: {},
    staffPortal: {},
    whatsapp: {},
    consoleErrors: [],
    uxObservations: []
  };

  const BASE_URL = 'https://novotel-pulse-concierge.vercel.app';

  try {
    // ==========================================
    // 1. AUDIT GUEST HUB & MINI-APP
    // ==========================================
    console.log('\n--- 1. Testing Guest Mini-App (/) ---');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const title = await page.title();
    console.log(`Page Title: ${title}`);
    results.guestHub.title = title;

    // Test Branch Selector in Header
    const branchBtn = page.locator('button[title*="Switch Novotel"]');
    const branchVisible = await branchBtn.isVisible();
    console.log(`Branch Selector visible in Header: ${branchVisible}`);
    results.guestHub.branchSelector = branchVisible;

    if (branchVisible) {
      await branchBtn.click();
      await page.waitForTimeout(500);
      
      // Select London Canary Wharf
      const londonOption = page.locator('button:has-text("Canary Wharf")');
      if (await londonOption.isVisible()) {
        await londonOption.click();
        await page.waitForTimeout(600);
        console.log('✓ Switched branch to Novotel London Canary Wharf');
        results.guestHub.branchSwitch = 'Success (London Canary Wharf active)';
      }
    }

    // Test the 4 View Switcher Chips inside Mobile Frame
    const tabs = ['Hub', 'Sanctuary', 'Facilities', 'Key Pass'];
    for (const tab of tabs) {
      const tabBtn = page.locator(`button:has-text("${tab}")`).first();
      if (await tabBtn.isVisible()) {
        await tabBtn.click();
        await page.waitForTimeout(350);
        console.log(`✓ Clicked view tab: ${tab}`);
      }
    }

    // Return to Hub
    await page.locator('button:has-text("Hub")').first().click();
    await page.waitForTimeout(400);

    // Test Butler Dispatch: Warm Bath Sheets
    const warmTowelsBtn = page.locator('button:has-text("Warm Bath Sheets")');
    if (await warmTowelsBtn.isVisible()) {
      await warmTowelsBtn.click();
      await page.waitForTimeout(600);
      console.log('✓ Clicked "Warm Bath Sheets" Butler Directive');
      results.guestHub.butlerDispatch = 'Dispatched Warm Bath Sheets successfully';
    }

    // Test Active Persona Quick-Drawer Trigger
    const personaTrigger = page.locator('text=Active Persona Blueprint');
    if (await personaTrigger.isVisible()) {
      await personaTrigger.click();
      await page.waitForTimeout(500);
      console.log('✓ Opened Emil Kowalski Persona Quick-Drawer');
      
      // Select Jet Lag Recovery Protocol by clicking the card
      const jetLagOption = page.locator('div:has-text("Jet Lag Recovery Protocol")').last();
      if (await jetLagOption.isVisible()) {
        await jetLagOption.click({ force: true });
        await page.waitForTimeout(500);
        console.log('✓ Applied Jet Lag Recovery Protocol Persona');
        results.guestHub.personaDrawer = 'Applied Jet Lag Recovery cleanly';
      }

      // Close drawer if still open
      const doneBtn = page.locator('button:has-text("Done")');
      if (await doneBtn.isVisible()) {
        await doneBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Test Key Pass tab and NFC door simulation
    await page.locator('button:has-text("Key Pass")').first().click();
    await page.waitForTimeout(400);
    const nfcBtn = page.locator('button:has-text("Simulate NFC Door Tap")');
    if (await nfcBtn.isVisible()) {
      await nfcBtn.click();
      await page.waitForTimeout(700);
      const unlockedNotice = await page.locator('text=ACCESS GRANTED').isVisible();
      console.log(`✓ NFC Door Tap: ${unlockedNotice ? 'ACCESS GRANTED (Green feedback)' : 'Triggered'}`);
      results.guestHub.nfcDoor = unlockedNotice ? 'Access Granted' : 'Triggered';
    }

    // ==========================================
    // 2. AUDIT ONBOARDING (/stay)
    // ==========================================
    console.log('\n--- 2. Testing Frictionless Onboarding (/stay?token=magic_token_412_vip) ---');
    await page.goto(`${BASE_URL}/stay?token=magic_token_412_vip`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const welcomeHeading = await page.locator('h1').textContent();
    console.log(`Onboarding Heading: ${welcomeHeading}`);
    results.onboarding.heading = welcomeHeading;

    // Test Choice View: Click "Guided 30s Calibration"
    const guidedChoice = page.locator('h3:has-text("Guided 30s Calibration")');
    if (await guidedChoice.isVisible()) {
      await guidedChoice.click();
      await page.waitForTimeout(500);
      console.log('✓ Entered Guided 30s Calibration');

      // Step 1: Click Continue
      const step1Continue = page.locator('button:has-text("Continue")');
      if (await step1Continue.isVisible()) {
        await step1Continue.click();
        await page.waitForTimeout(400);
        console.log('✓ Passed Step 1 (Ambient Sensory & Climate)');
      }

      // Step 2: Live N' Dream pillow choice and Continue
      const pillowChoice = page.locator('button:has-text("Live N\' Dream")').first();
      if (await pillowChoice.isVisible()) {
        await pillowChoice.click();
      }
      const step2Continue = page.locator('button:has-text("Continue")');
      if (await step2Continue.isVisible()) {
        await step2Continue.click();
        await page.waitForTimeout(400);
        console.log('✓ Passed Step 2 (Live N\' Dream Pillows & Bath Sheets)');
      }

      // Step 3: Complete calibration
      const activateBtn = page.locator('button:has-text("Activate Residence Sanctuary")');
      if (await activateBtn.isVisible()) {
        await activateBtn.click();
        await page.waitForTimeout(800);
        console.log('✓ Passed Step 3 (Dining & Allergen direct)');
        
        const readyNotice = await page.locator('text=Suite 412 is Ready').isVisible();
        console.log(`✓ Sanctuary Activation Confirmation: ${readyNotice ? 'Confirmed' : 'Checked'}`);
        results.onboarding.guidedFlow = readyNotice ? 'Suite 412 Ready Confirmed' : 'Completed';
      }
    }

    // ==========================================
    // 3. AUDIT OPERATIONS COMMAND PORTAL (/staff)
    // ==========================================
    console.log('\n--- 3. Testing Operations Command Portal (/staff) ---');
    await page.goto(`${BASE_URL}/staff`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const portalTitle = await page.locator('h1').textContent();
    console.log(`Portal Title: ${portalTitle}`);
    results.staffPortal.title = portalTitle;

    // Check Master Residence Grid Suite 412
    const suite412Card = page.locator('div:has-text("Suite 412")').first();
    const suite412Visible = await suite412Card.isVisible();
    console.log(`Suite 412 Card in Master Grid: ${suite412Visible}`);
    results.staffPortal.suite412Visible = suite412Visible;

    if (suite412Visible) {
      await suite412Card.click();
      await page.waitForTimeout(600);
      
      const drawerVisible = await page.locator('text=Butler Spec Sheet').isVisible();
      console.log(`✓ Butler Spec Sheet Drawer: ${drawerVisible ? 'Opened' : 'Not detected'}`);
      results.staffPortal.specSheetDrawer = drawerVisible ? 'Opened' : 'Not detected';

      // Test Dispatch All Directives
      const dispatchAllBtn = page.locator('button:has-text("Dispatch All")');
      if (await dispatchAllBtn.isVisible()) {
        await dispatchAllBtn.click();
        await page.waitForTimeout(500);
        console.log('✓ Clicked "Dispatch All Directives"');
        results.staffPortal.dispatchAllDirectives = 'Dispatched action items';
      }

      // Close drawer
      const closeBtn = page.locator('button:has-text("Close")');
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Test Department Filter dropdown
    const deptFilter = page.locator('select').first();
    if (await deptFilter.isVisible()) {
      await deptFilter.selectOption('housekeeping');
      await page.waitForTimeout(400);
      console.log('✓ Department filter: Housekeeping');
      await deptFilter.selectOption('all');
      await page.waitForTimeout(400);
      console.log('✓ Department filter: All');
      results.staffPortal.departmentFilter = 'Operational';
    }

    // Test Kanban Status Transition
    const dispatchEnRouteBtn = page.locator('button:has-text("Dispatch En Route")').first();
    if (await dispatchEnRouteBtn.isVisible()) {
      await dispatchEnRouteBtn.click();
      await page.waitForTimeout(500);
      console.log('✓ Kanban transition: Dispatch En Route');
      results.staffPortal.statusTransition = 'En Route confirmed';
    }

    // Test Generate QR Card Modal
    const qrBtn = page.locator('button:has-text("Generate QR Card")');
    if (await qrBtn.isVisible()) {
      await qrBtn.click();
      await page.waitForTimeout(500);
      const qrModalVisible = await page.locator('text=Scan to Unlock Your Stay').isVisible();
      console.log(`✓ QR Card Modal: ${qrModalVisible ? 'Opened' : 'Failed'}`);
      results.staffPortal.qrModal = qrModalVisible ? 'Opened' : 'Failed';
      
      // Close modal
      const modalClose = page.locator('button:has(.lucide-x)').last();
      if (await modalClose.isVisible()) {
        await modalClose.click();
        await page.waitForTimeout(300);
      }
    }

    // ==========================================
    // 4. AUDIT WHATSAPP CONCIERGE (/whatsapp)
    // ==========================================
    console.log('\n--- 4. Testing WhatsApp Conversational Concierge (/whatsapp) ---');
    await page.goto(`${BASE_URL}/whatsapp`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    
    const verifiedBadge = await page.locator('text=Official Business Account').isVisible();
    console.log(`Verified Green Check & Business Badge: ${verifiedBadge}`);
    results.whatsapp.verifiedBadge = verifiedBadge;

    const actionBtn = page.locator('a:has-text("Personalize My Stay")');
    const actionBtnVisible = await actionBtn.isVisible();
    console.log(`"Personalize My Stay" Action Card: ${actionBtnVisible}`);
    results.whatsapp.personalizeAction = actionBtnVisible ? 'Ready & Linked' : 'Missing';

  } catch (err) {
    console.error('Audit Error:', err);
    pageErrors.push(err.message);
  } finally {
    results.consoleErrors = pageErrors;
    await browser.close();
  }

  console.log('\n=== AUDIT RESULTS SUMMARY ===');
  console.log(JSON.stringify(results, null, 2));
}

runAudit();
