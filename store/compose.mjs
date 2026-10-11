// Composes store screenshots from raw captures (see store/capture.mjs).
// Usage: node store/compose.mjs <raw-dir>
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAW = process.argv[2];
const HERE = dirname(fileURLToPath(import.meta.url));
const ICON = readFileSync(join(HERE, '..', 'assets', 'icon.png')).toString('base64');

const COLORS = { focus: '#E5533D', break: '#2A9D8F', settings: '#E5533D', long: '#3D6FD8' };
const SCREENS = [
  { id: '1-focus', color: COLORS.focus },
  { id: '2-break', color: COLORS.break },
  { id: '3-settings', color: COLORS.settings },
  { id: '4-long', color: COLORS.long },
];
const COPY = {
  en: [
    ['Focus in 25-minute sprints', 'The pomodoro method, beautifully simple.'],
    ['Take breaks that recharge you', 'Short and long breaks, timed for you.'],
    ['Make every timer yours', 'Adjust focus and break lengths in a tap.'],
    ['Track your daily progress', 'Watch your focus sessions add up.'],
  ],
  tr: [
    ['25 dakikalık seanslarla odaklan', 'Pomodoro yöntemi, sade ve şık.'],
    ['Seni yenileyen molalar ver', 'Kısa ve uzun molalar senin için zamanlanır.'],
    ['Süreleri sana göre ayarla', 'Odak ve mola sürelerini tek dokunuşla değiştir.'],
    ['Günlük ilerlemeni takip et', 'Tamamladığın odak seanslarını gör.'],
  ],
};
const TARGETS = [
  { dir: 'ios-6.9', w: 1320, h: 2868, src: 'phone', ratio: 852 / 393 },
  { dir: 'ipad-13', w: 2064, h: 2752, src: 'ipad', ratio: 1376 / 1032 },
  { dir: 'android-phone', w: 1080, h: 1920, src: 'phone', ratio: 852 / 393 },
];
const FEATURE = {
  en: ['Pomodoro', 'The focus timer that keeps it simple.'],
  tr: ['Pomodoro', 'Sade ve şık odak zamanlayıcısı.'],
};

const dataUrl = (p) => `data:image/png;base64,${readFileSync(p).toString('base64')}`;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * f));
  return `rgb(${c.join(',')})`;
}

function screenshotPage({ w, h, ratio }, color, title, subtitle, img) {
  const head = h * 0.2;
  let devH = h - head - h * 0.05;
  let devW = devH / ratio;
  if (devW > w * 0.84) { devW = w * 0.84; devH = devW * ratio; }
  const bezel = Math.round(devW * 0.03);
  const radius = Math.round(devW * (ratio > 1.6 ? 0.13 : 0.05));
  const fs = Math.min(w * 0.075, h * 0.042);
  return `<html><head><style>
    body{margin:0;width:${w}px;height:${h}px;overflow:hidden;font-family:Inter,sans-serif;
      background:linear-gradient(180deg,${shade(color, 0.82)},${shade(color, 0.62)});color:#fff;text-align:center}
    h1{margin:${h * 0.055}px ${w * 0.06}px 0;font-size:${fs}px;font-weight:800;letter-spacing:-0.02em;line-height:1.12;text-wrap:balance}
    p{margin:${fs * 0.35}px ${w * 0.08}px 0;font-size:${fs * 0.5}px;font-weight:500;opacity:.88;text-wrap:balance}
    .dev{position:absolute;left:${(w - devW) / 2}px;top:${head}px;width:${devW}px;height:${devH}px;box-sizing:border-box;
      padding:${bezel}px;background:#121212;border-radius:${radius + bezel}px;box-shadow:0 ${h * 0.012}px ${h * 0.03}px rgba(0,0,0,.35)}
    .dev img{width:100%;height:100%;border-radius:${radius}px;display:block;object-fit:cover}
  </style></head><body><h1>${title}</h1><p>${subtitle}</p><div class="dev"><img src="${img}"></div></body></html>`;
}

function featurePage(title, tagline, phone) {
  return `<html><head><style>
    body{margin:0;width:1024px;height:500px;overflow:hidden;font-family:Inter,sans-serif;color:#fff;
      background:linear-gradient(135deg,#F2674F,#C93A26)}
    .icon{position:absolute;left:70px;top:150px;width:200px;height:200px;border-radius:46px;box-shadow:0 12px 30px rgba(0,0,0,.25)}
    h1{position:absolute;left:300px;top:160px;margin:0;font-size:72px;font-weight:800;letter-spacing:-0.02em}
    p{position:absolute;left:302px;top:258px;margin:0;width:360px;font-size:26px;font-weight:500;opacity:.9;line-height:1.35}
    .dev{position:absolute;right:40px;top:70px;width:250px;height:542px;box-sizing:border-box;padding:8px;background:#121212;
      border-radius:40px;box-shadow:0 12px 30px rgba(0,0,0,.35)}
    .dev img{width:100%;height:100%;border-radius:32px;display:block}
  </style></head><body><img class="icon" src="data:image/png;base64,${ICON}"><h1>${title}</h1><p>${tagline}</p>
  <div class="dev"><img src="${phone}"></div></body></html>`;
}

const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium' });
async function render(html, w, h, out) {
  mkdirSync(dirname(out), { recursive: true });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out });
  await page.close();
}

for (const lang of ['en', 'tr']) {
  for (const t of TARGETS) {
    for (const [i, s] of SCREENS.entries()) {
      const [title, sub] = COPY[lang][i];
      const img = dataUrl(join(RAW, `${t.src}-${lang}-${s.id}.png`));
      await render(screenshotPage(t, s.color, title, sub, img), t.w, t.h,
        join(HERE, 'screenshots', t.dir, lang, `0${s.id}.png`));
    }
  }
  const [title, tagline] = FEATURE[lang];
  await render(featurePage(title, tagline, dataUrl(join(RAW, `phone-${lang}-1-focus.png`))), 1024, 500,
    join(HERE, 'screenshots', 'google-play-feature', `${lang}.png`));
}
await browser.close();
