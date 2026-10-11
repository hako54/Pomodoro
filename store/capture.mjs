import { chromium } from 'playwright';
// Usage: node store/capture.mjs <raw-output-dir> [url]  (serve the web export first)
const OUT = process.argv[2];
const URL = process.argv[3] ?? 'http://localhost:8765/';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const devices = { phone: { width: 393, height: 852, dpr: 3 }, ipad: { width: 1032, height: 1376, dpr: 2 } };
const labels = {
  en: { start: 'START', focus: 'Focus', settings: 'Settings', done: 'Done', long: 'Long Break' },
  tr: { start: 'BAŞLAT', focus: 'Odaklan', settings: 'Ayarlar', done: 'Tamam', long: 'Uzun Mola' },
};
for (const [dev, v] of Object.entries(devices)) for (const lang of ['en', 'tr']) {
  const L = labels[lang];
  const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.dpr,
    locale: lang === 'tr' ? 'tr-TR' : 'en-US' });
  const page = await ctx.newPage();
  await page.clock.install({ time: new Date('2026-10-12T10:00:00') });
  await page.addInitScript(() => {
    if (!localStorage.getItem('seeded')) {
      localStorage.setItem('seeded', '1');
      localStorage.setItem('pomodoro.stats', JSON.stringify({ date: '2026-10-12', completed: 3 }));
    }
  });
  await page.goto(URL);
  await page.clock.runFor(1000);
  const tap = async (text) => { await page.getByText(text, { exact: true }).first().click(); await page.clock.runFor(500); };
  const shot = async (name) => { await page.clock.runFor(600); await page.screenshot({ path: `${OUT}/${dev}-${lang}-${name}.png` }); };
  // Complete two focus sessions so the cycle dots and daily count look lived-in.
  for (let i = 0; i < 2; i++) {
    if (i) await tap(L.focus);
    await tap(L.start);
    await page.clock.runFor(25 * 60 * 1000 + 1000);
  }
  // 1. Short break running
  await tap(L.start); await page.clock.runFor(73 * 1000); await shot('2-break');
  // 2. Focus running at 18:42
  await tap(L.focus); await tap(L.start); await page.clock.runFor((6 * 60 + 18) * 1000 - 1100); await shot('1-focus');
  // 3. Settings
  await page.getByLabel(L.settings).click(); await page.clock.runFor(1000); await page.waitForTimeout(1500); await shot('3-settings');
  await tap(L.done); await page.clock.runFor(1000); await page.waitForTimeout(1500);
  // 4. Long break
  await tap(L.long); await shot('4-long');
  await ctx.close();
}
await browser.close();
