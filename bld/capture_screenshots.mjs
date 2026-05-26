import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let OUT = path.resolve(__dirname, '../fst/metadata/android/en-US/images/phoneScreenshots');
mkdirSync(OUT, { recursive: true });

const PHONE = {
  width: 540,
  height: 960,
  deviceScaleFactor: 2
};
const delay = ms => new Promise(r => setTimeout(r, ms));

console.log('Launching browser...');
const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
});

async function runThemeCapture(themeMode) {
  const folderName = themeMode === 'dark' ? 'sevenInchScreenshots' : 'phoneScreenshots';
  OUT = path.resolve(__dirname, `../fst/metadata/android/en-US/images/${folderName}`);
  mkdirSync(OUT, { recursive: true });
  const suffix = '';
  console.log(`\n===========================================================`);
  console.log(`Starting automated screenshot capture for theme: ${themeMode.toUpperCase()}`);
  console.log(`===========================================================`);
  
  const page = await browser.newPage();
  await page.setViewport(PHONE);
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error' || text.includes('error') || text.includes('Exception')) {
      console.error(`[PAGE ERROR ${themeMode}]`, text.substring(0, 150));
    } else {
      console.log(`[PAGE ${themeMode}]`, text.substring(0, 150));
    }
  });

  try {
    console.log(`Loading app for ${themeMode} theme...`);
    await page.goto('http://localhost:1420/', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Inject the theme into localStorage
    await page.evaluate((theme) => {
      localStorage.clear();
      localStorage.setItem('aura-theme', theme);
    }, themeMode);
    
    // Reload to apply the localStorage setting
    await page.reload({ waitUntil: 'networkidle2' });
    
    await page.waitForSelector('.setup-screen', { timeout: 15000 });
    await delay(1000);

    // ── 1. Secure Onboarding (1.png) ──
    console.log('Filling onboarding form...');
    await page.type('input[type="text"]', 'Taylor');
    await delay(300);
    await page.type('input[placeholder="YYYY-MM-DD (e.g. 1998-04-20)"]', '1998-04-20');
    await delay(300);
    await page.type('textarea[placeholder="What kind of energy are you projecting today?"]', 'Local mesh enthusiast. Passionate about decentralized protocols, zero-knowledge proofs, and great coffee!');
    await delay(300);

    // Click "Interested In: Women" to ensure Jamie Chen appears first in Discovery
    console.log('Setting Interested In: Women...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.selector-btn'));
      const womenBtn = buttons.find(btn => btn.textContent.trim() === 'Women');
      if (womenBtn) womenBtn.click();
    });
    await delay(300);

    await page.type('input[placeholder="e.g. coding, music, art"]', 'coding, p2p, zkp, coffee');
    await delay(500);

    console.log(`Capturing 1${suffix}.png (Secure Onboarding)...`);
    await page.screenshot({ path: path.join(OUT, `1${suffix}.png`) });
    await delay(500);

    // Click Save Profile
    console.log('Saving profile...');
    await page.click('.btn-save-header');
    await delay(2500); // Wait for transition

    // ── 3. Swipe Discovery (3.png) ──
    console.log('Waiting for Discovery Screen...');
    await page.waitForSelector('.swipe-card', { timeout: 10000 });
    await delay(1500);

    console.log(`Capturing 3${suffix}.png (Swipe Discovery)...`);
    await page.screenshot({ path: path.join(OUT, `3${suffix}.png`) });
    await delay(500);

    // ── 4. Profile Details (4.png) ──
    console.log('Clicking swipe card for details...');
    await page.click('.swipe-card');
    await page.waitForSelector('.profile-detail-overlay', { timeout: 5000 });
    await delay(1500);

    console.log(`Capturing 4${suffix}.png (Profile Details)...`);
    await page.screenshot({ path: path.join(OUT, `4${suffix}.png`) });
    await delay(500);

    // Close details overlay
    console.log('Closing detail overlay...');
    await page.click('.btn-close-detail');
    await page.waitForSelector('.profile-detail-overlay', { hidden: true, timeout: 5000 });
    await delay(1000);

    // ── 5. Mutual Match (5.png) ──
    console.log('Clicking Like (Heart button)...');
    await page.click('.action-btn.like');
    await page.waitForSelector('.match-overlay', { timeout: 5000 });
    await delay(1500);

    console.log(`Capturing 5${suffix}.png (Mutual Match Celebration)...`);
    await page.screenshot({ path: path.join(OUT, `5${suffix}.png`) });
    await delay(500);

    // ── 6. Encrypted P2P Chat (6.png) ──
    console.log('Clicking Send a Message...');
    await page.click('.btn-primary.match-btn.pulse');
    await page.waitForSelector('.chat-screen', { timeout: 5000 });
    await delay(1500);

    console.log('Typing chat message...');
    await page.type('.chat-input-area input[type="text"]', "Hi Jamie! Love your focus on coffee and art. Let's chat!");
    await delay(500);
    console.log('Sending message...');
    await page.click('button.send-btn');
    await delay(1500); // Let the message render in feed

    // Set rating slider to 4.5
    console.log('Adjusting resonance rating slider...');
    await page.evaluate(() => {
      const slider = document.querySelector('.chat-rating-bar input[type="range"]');
      if (slider) {
        slider.value = '4.5';
        slider.dispatchEvent(new Event('change', { bubbles: true }));
        slider.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(1000);

    console.log(`Capturing 6${suffix}.png (Encrypted P2P Chat)...`);
    await page.screenshot({ path: path.join(OUT, `6${suffix}.png`) });
    await delay(500);

    // Return to Discovery
    console.log('Clicking chat back button...');
    await page.click('header.chat-header button.btn-icon');
    await page.waitForSelector('.chat-screen', { hidden: true, timeout: 5000 });
    await delay(1500);

    // Dismiss match overlay
    console.log('Dismissing match celebration overlay...');
    await page.waitForSelector('.match-overlay', { timeout: 5000 });
    await page.click('.match-overlay button.btn-secondary.match-btn');
    await page.waitForSelector('.match-overlay', { hidden: true, timeout: 5000 });
    await delay(1500);

    // ── 7. Swipes History (7.png) ──
    console.log('Opening sidebar menu...');
    await page.click('button[title="Menu"]');
    await page.waitForSelector('.sidebar-overlay', { timeout: 5000 });
    await delay(1000);

    console.log('Clicking Swipes item in sidebar...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.sidebar-item'));
      const swipesItem = items.find(item => item.textContent.trim().includes('Swipes'));
      if (swipesItem) swipesItem.click();
    });
    await page.waitForSelector('.sidebar-overlay', { hidden: true, timeout: 5000 });
    await page.waitForSelector('.header', { timeout: 5000 });
    await delay(1500);

    console.log(`Capturing 7${suffix}.png (Swipes History)...`);
    await page.screenshot({ path: path.join(OUT, `7${suffix}.png`) });
    await delay(500);

    // Return to Discovery from Swipes
    console.log('Returning to Discovery from Swipes...');
    await page.click('header.header button.icon-btn');
    await delay(1500);

    // ── 8. Settings & ZK InfoTip (8.png) ──
    console.log('Opening sidebar menu again...');
    await page.click('button[title="Menu"]');
    await page.waitForSelector('.sidebar-overlay', { timeout: 5000 });
    await delay(1000);

    console.log('Clicking Settings item in sidebar...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.sidebar-item'));
      const settingsItem = items.find(item => item.textContent.trim().includes('Settings'));
      if (settingsItem) settingsItem.click();
    });
    await page.waitForSelector('.sidebar-overlay', { hidden: true, timeout: 5000 });
    await delay(1000);

    console.log('Opening Advanced Privacy Controls accordion...');
    await page.click('.settings-accordion-btn');
    await page.waitForSelector('.range-slider', { timeout: 5000 });
    await delay(1500);

    console.log('Opening ZK Proximity Circle InfoTip...');
    await page.evaluate(() => {
      const infotips = Array.from(document.querySelectorAll('.infotip-root'));
      const zkInfotip = infotips[1] || infotips[0];
      if (zkInfotip) {
        zkInfotip.scrollIntoView({ block: 'center' });
        zkInfotip.focus();
      }
    });
    await delay(1000);

    console.log(`Capturing 8${suffix}.png (ZK Proximity Settings)...`);
    await page.screenshot({ path: path.join(OUT, `8${suffix}.png`) });
    await delay(500);

    // Return to Discovery from Settings
    console.log('Returning to Discovery from Settings...');
    await page.click('header.header button.btn-icon');
    await delay(1500);

    // ── 2. Proximity Radar (2.png) ──
    console.log('Clearing swipe queue to get empty radar scan screen...');
    let swipeCardExists = true;
    while (swipeCardExists) {
      const card = await page.$('.swipe-card');
      if (card) {
        console.log('Passing a card...');
        await page.click('.action-btn.pass');
        await delay(1200); // Wait for transition
      } else {
        swipeCardExists = false;
      }
    }
    await delay(2000); // Let radar animation stabilize

    console.log(`Capturing 2${suffix}.png (Proximity Radar)...`);
    await page.screenshot({ path: path.join(OUT, `2${suffix}.png`) });
    await delay(500);

    console.log(`✅ ${themeMode.toUpperCase()} screenshots successfully captured!`);
  } catch (error) {
    console.error(`❌ Error during ${themeMode} screenshot capture:`, error);
  } finally {
    await page.close();
  }
}

try {
  // Capture Light Theme first
  await runThemeCapture('light');
  
  // Capture Dark Theme second
  await runThemeCapture('dark');
  
  console.log('\n✅ All theme screenshots successfully captured and saved to:', OUT);
} catch (globalError) {
  console.error('❌ Global error during theme screenshot run:', globalError);
} finally {
  await browser.close();
}
