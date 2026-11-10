import { createRequire } from 'module';
const require = createRequire('C:/Users/hansen/AppData/Roaming/npm/node_modules/playwright/');
const { chromium } = require('playwright');
const out = process.argv[2];
const browser = await chromium.launch();
const errs = [];
for (const [f, w, h] of [['merc-1-playmat', 1440, 900], ['merc-2-sheet', 1440, 900], ['merc-3-tray', 1440, 900], ['merc-4-mat', 1440, 900], ['merc-5-phone', 1700, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', e => errs.push(f + ': ' + String(e)));
  await page.goto(`http://localhost:8099/HavenMap/campaign/mockups/${f}.html`);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/${f}.png` });
  await page.close();
}
console.log(errs);
await browser.close();
