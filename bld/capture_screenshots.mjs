import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../fst/metadata/android/en-US/images/phoneScreenshots');
mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844, deviceScaleFactor: 2 };
const delay = ms => new Promise(r => setTimeout(r, ms));

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport(PHONE);

page.on('console', msg => {
  if (msg.type() === 'error') console.error('[PAGE]', msg.text().substring(0, 150));
});

console.log('Loading app...');
await page.goto('http://localhost:1420/', { waitUntil: 'networkidle2', timeout: 30000 });
await page.waitForFunction(() => document.querySelector('#root')?.children.length > 0, { timeout: 15000 });
await delay(600);

// ── Screenshot 1: Onboarding screen (empty) ──
await page.screenshot({ path: `${OUT}/1_onboarding_empty.png` });
console.log('✓ Screenshot 1: Onboarding empty');

// Get only visible text inputs (not hidden file inputs)
const visibleInputs = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('input')).map((el, i) => ({
    index: i,
    type: el.type,
    placeholder: el.placeholder,
    visible: el.offsetParent !== null && el.type !== 'file' && el.type !== 'hidden',
    rect: el.getBoundingClientRect(),
  }));
});
console.log('Visible inputs:', JSON.stringify(visibleInputs, null, 2));

// Fill via page.evaluate to avoid click issues
await page.evaluate(() => {
  const inputs = Array.from(document.querySelectorAll('input')).filter(
    el => el.type !== 'file' && el.type !== 'hidden' && el.offsetParent !== null
  );

  const setVal = (el, val) => {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(el, val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // inputs[0] = Public Name
  if (inputs[0]) setVal(inputs[0], 'Ben');
  // inputs[1] = Date of Birth
  if (inputs[1]) setVal(inputs[1], '1998-04-20');
});

await delay(700); // Let validation run

// ── Screenshot 2: DOB filled with validation ──
await page.screenshot({ path: `${OUT}/2_onboarding_dob.png` });
console.log('✓ Screenshot 2: DOB filled');

// Fill bio via textarea
await page.evaluate(() => {
  const textarea = document.querySelector('textarea');
  if (textarea) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    nativeSetter.call(textarea, 'P2P proximity mesh developer.');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
  }
});
await delay(300);

// ── Screenshot 3: Fully completed form ──
await page.screenshot({ path: `${OUT}/3_onboarding_complete.png` });
console.log('✓ Screenshot 3: Onboarding complete');

// Click Save button
const saved = await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll('button')).find(b =>
    b.textContent.trim().toLowerCase().includes('save') && !b.disabled
  );
  if (btn) { btn.click(); return true; }
  return false;
});
console.log('Save clicked:', saved);
await delay(2000);

// ── Screenshot 4: Discovery screen ──
await page.screenshot({ path: `${OUT}/4_discovery.png` });
console.log('✓ Screenshot 4: Discovery screen');
const discText = await page.evaluate(() => document.body.innerText.substring(0, 200));
console.log('Discovery text:', discText);

// Click on the swipe card (try multiple selectors)
const cardClicked = await page.evaluate(() => {
  const selectors = ['.swipe-card', '[class*="card"]', '[class*="swipe"]', '[class*="profile"]'];
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el && el.offsetParent !== null) {
      el.click();
      return sel;
    }
  }
  return null;
});
console.log('Card selector clicked:', cardClicked);
if (!cardClicked) {
  await page.mouse.click(195, 380);
  console.log('Fallback: clicked center');
}
await delay(800);

// ── Screenshot 5: Profile detail overlay ──
await page.screenshot({ path: `${OUT}/5_detail_overlay.png` });
console.log('✓ Screenshot 5: Profile detail overlay');

const overlayText = await page.evaluate(() => document.body.innerText.substring(0, 300));
console.log('Overlay text:', overlayText.substring(0, 150));

await browser.close();
console.log(`
✅ Screenshots saved to: ${OUT}`);
