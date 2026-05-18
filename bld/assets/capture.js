const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  const screenshotDir = '/home/bensiv/Projects/aura/fst/metadata/android/en-US/images/phoneScreenshots';
  fs.mkdirSync(screenshotDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // Forward page console logs to terminal
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('error') || text.includes('Exception')) {
      console.log(`[PAGE ERROR LOG] ${text}`);
    } else {
      console.log(`[PAGE LOG] ${text}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`[PAGE EXCEPTION] ${err.toString()}`);
  });
  
  // Set high-quality 9:16 portrait viewport size (standard 1080x1920)
  console.log('Setting viewport...');
  await page.setViewport({
    width: 540,
    height: 960,
    deviceScaleFactor: 2
  });

  console.log('Navigating to http://localhost:1420/...');
  await page.goto('http://localhost:1420/', { waitUntil: 'networkidle2' });

  // Step 1: Onboarding Screen
  console.log('Waiting for onboarding screen...');
  await page.waitForSelector('.setup-screen');
  await sleep(1500);

  // Fill in the form fields
  console.log('Filling onboarding form...');
  await page.type('input[placeholder="e.g. Alex"]', 'Alex');
  await sleep(300);
  await page.type('textarea[placeholder="What kind of energy are you projecting today?"]', 'Local mesh enthusiast. Passionate about decentralized protocols, zero-knowledge proofs, and great coffee!');
  await sleep(300);
  
  // Click "Interested In: Women" to ensure Jamie Chen appears first
  const womenBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('.selector-btn'));
    return buttons.find(btn => btn.textContent.trim() === 'Women');
  });
  if (womenBtn && womenBtn.asElement()) {
    await womenBtn.asElement().click();
  }
  await sleep(300);

  await page.type('input[placeholder="e.g. coding, music, art"]', 'coding, p2p, zkp, coffee');
  await sleep(500);

  // Capture Onboarding screenshot (1.png)
  console.log('Capturing 1.png (Onboarding)...');
  await page.screenshot({ path: path.join(screenshotDir, '1.png') });
  await sleep(500);

  // Click Save Profile
  console.log('Clicking Save Profile...');
  await page.click('.btn-save-header');
  await sleep(2500); // Wait for transition

  // Now in Discovery Screen. The first card should be Jamie Chen (Woman)
  // Step 3: Discovery card screenshot (3.png)
  console.log('Waiting for Discovery Screen (Jamie Chen card)...');
  await page.waitForSelector('.swipe-card');
  await sleep(1500); // Let layout stabilize
  console.log('Capturing 3.png (Jamie Chen card)...');
  await page.screenshot({ path: path.join(screenshotDir, '3.png') });
  await sleep(500);

  // Step 4: Click card to open Profile Detail Overlay (4.png)
  console.log('Clicking card to open details...');
  await page.click('.swipe-card');
  await page.waitForSelector('.profile-detail-overlay');
  await sleep(1500); // Wait for transition animation
  console.log('Capturing 4.png (Jamie Chen Profile Detail)...');
  await page.screenshot({ path: path.join(screenshotDir, '4.png') });
  await sleep(500);

  // Close the overlay
  console.log('Closing details...');
  await page.click('.btn-close-detail');
  await page.waitForSelector('.profile-detail-overlay', { hidden: true });
  await sleep(1000);

  // Step 5: Match Screen (5.png)
  // Click Heart/Like button on the card or in actions
  console.log('Clicking Like (Heart)...');
  await page.click('.action-btn.like');
  await page.waitForSelector('.match-overlay');
  await sleep(1500); // Wait for transition animation
  console.log('Capturing 5.png (Celebratory Match)...');
  await page.screenshot({ path: path.join(screenshotDir, '5.png') });
  await sleep(500);

  // Step 6: Chat Screen (6.png)
  // Click "Send a Message" button in match overlay
  console.log('Clicking Send a Message...');
  await page.click('.btn-primary.match-btn.pulse');
  await page.waitForSelector('.chat-screen');
  await sleep(1500); // Wait for transition

  // Type a custom message and send
  console.log('Typing chat message...');
  await page.type('footer.chat-input-area input[type="text"]', 'Hi Jamie! Love your focus on coffee and art. Let\'s chat!');
  await sleep(500);
  console.log('Clicking send...');
  await page.click('button.send-btn');
  await sleep(1500); // Wait for message to appear

  // Drag the rating slider slightly to demonstrate rating interaction
  console.log('Setting resonance rating range slider...');
  await page.evaluate(() => {
    const slider = document.querySelector('.chat-rating-bar input[type="range"]');
    if (slider) {
      slider.value = '4.5';
      slider.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1000);

  console.log('Capturing 6.png (Chat Screen)...');
  await page.screenshot({ path: path.join(screenshotDir, '6.png') });
  await sleep(500);

  // Click back to return to Discovery Screen (which renders the MatchScreen overlay again)
  console.log('Clicking chat back button...');
  await page.click('header.chat-header button.icon-btn');
  await page.waitForSelector('.chat-screen', { hidden: true });
  await sleep(1500);

  // Dismiss the re-appearing MatchScreen
  console.log('Dismissing match overlay...');
  await page.waitForSelector('.match-overlay');
  await page.click('.match-overlay button.btn-secondary.match-btn');
  await page.waitForSelector('.match-overlay', { hidden: true });
  await sleep(1500);

  // Step 7: Swipes History Screen (7.png)
  // Open Sidebar Menu using a highly robust selector
  console.log('Opening sidebar menu...');
  await page.click('button[title="Menu"]');
  await page.waitForSelector('.sidebar-overlay');
  await sleep(1000);

  // Click Swipes
  console.log('Clicking Swipes item...');
  const swipesItem = await page.evaluateHandle(() => {
    const items = Array.from(document.querySelectorAll('.sidebar-item'));
    return items.find(item => item.textContent.trim().includes('Swipes'));
  });
  if (swipesItem && swipesItem.asElement()) {
    await swipesItem.asElement().click();
  }
  await page.waitForSelector('.sidebar-overlay', { hidden: true });
  await sleep(1500); // Wait for history to load

  console.log('Capturing 7.png (Swipes History)...');
  await page.screenshot({ path: path.join(screenshotDir, '7.png') });
  await sleep(500);

  // Click back to return to Discovery
  console.log('Returning to Discovery from Swipes...');
  await page.click('header.header button.icon-btn');
  await sleep(1500);

  // Step 8: Settings Screen (8.png)
  // Open Sidebar Menu again
  console.log('Opening sidebar menu again...');
  await page.click('button[title="Menu"]');
  await page.waitForSelector('.sidebar-overlay');
  await sleep(1000);

  // Click Settings
  console.log('Clicking Settings item...');
  const settingsItem = await page.evaluateHandle(() => {
    const items = Array.from(document.querySelectorAll('.sidebar-item'));
    return items.find(item => item.textContent.trim().includes('Settings'));
  });
  if (settingsItem && settingsItem.asElement()) {
    await settingsItem.asElement().click();
  }
  await page.waitForSelector('.sidebar-overlay', { hidden: true });
  await sleep(1500); // Wait for Settings screen to render

  // Hover/focus over an InfoTip icon in settings to display premium zero-knowledge details
  console.log('Opening ZK Proximity InfoTip...');
  await page.evaluate(() => {
    const infotip = document.querySelector('.infotip-root');
    if (infotip) {
      infotip.scrollIntoView({ block: 'center' });
      infotip.focus();
    }
  });
  await sleep(1000);

  console.log('Capturing 8.png (Settings)...');
  await page.screenshot({ path: path.join(screenshotDir, '8.png') });
  await sleep(500);

  // Click back to return to Discovery
  console.log('Returning to Discovery from Settings...');
  await page.click('header.header button.btn-icon');
  await sleep(1500);

  // Step 2: Radar Scanner animation (2.png)
  // Clear the swipe queue (Alex Rivera and Sam Wilson)
  console.log('Clearing remaining swipe queue to trigger radar scanner...');
  while (await page.$('.swipe-card')) {
    console.log('Passing profile...');
    await page.click('.action-btn.pass');
    await sleep(1000); // Wait for swipe transition
  }
  await sleep(1500); // Let radar scanner render

  console.log('Capturing 2.png (Radar Scanner)...');
  await page.screenshot({ path: path.join(screenshotDir, '2.png') });
  await sleep(500);

  console.log('All 8 screenshots successfully captured!');
  await browser.close();
})();
