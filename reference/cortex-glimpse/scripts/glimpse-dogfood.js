'use strict';

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const http = require('http');

const OUT = path.join(__dirname, '..', '.tmp', 'glimpse-dogfood');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:3788';
const INV = process.env.GLIMPSE_INVITE || 'cb3dbaef8526';
const RID = process.env.GLIMPSE_ROOM || 'room_mt1e5tqq_29fda867';

function req(method, url, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const r = http.request(
      {
        hostname: '127.0.0.1',
        port: 3788,
        path: url,
        method,
        headers: data
          ? { 'content-type': 'application/json', 'content-length': Buffer.byteLength(data) }
          : {}
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(text);
          } catch {
            json = null;
          }
          resolve({ status: res.statusCode, text, json });
        });
      }
    );
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

(async () => {
  const log = [];
  const push = (k, v) => {
    log.push({ k, v });
    process.stdout.write(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}\n`);
  };

  const css = await req('GET', '/play/glimpse/static/glimpse.css');
  push('css', css.status);
  const js = await req('GET', '/play/glimpse/static/client.js');
  push('js', js.status);

  let start = await req('POST', `/api/glimpse/rooms/${RID}/start`, { itemId: 'movie:terminator-2' });
  push('start', { status: start.status, phase: start.json && start.json.phase, clip: start.json && start.json.clip, mediaType: start.json && start.json.mediaType });
  if (start.status !== 200) {
    start = await req('POST', `/api/glimpse/rooms/${RID}/start`, { itemId: 'movie:terminator-2' });
    push('start-retry', start.json);
  }

  const clip = await req('GET', `/play/glimpse/${INV}/clip`);
  push('clip', clip.json);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (msg) => push('console', `${msg.type()} ${msg.text()}`));
  page.on('pageerror', (err) => push('pageerror', String(err)));

  await page.goto(`${BASE}/play/glimpse/${INV}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, '01-join.png'), fullPage: true });
  push('join-title', await page.title());
  push('join-text', (await page.locator('body').innerText()).slice(0, 800));

  await page.fill('#name', 'Sam');
  await page.click('#join');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '02-seated.png'), fullPage: true });
  push('seated-text', (await page.locator('body').innerText()).slice(0, 1200));
  push('hear-visible', await page.locator('[data-gl="hear"]').isVisible().catch(() => false));
  push('yt-html', await page.locator('[data-gl="yt"]').innerHTML().catch(() => ''));

  if (await page.locator('[data-gl="hear"]').isVisible()) {
    await page.click('[data-gl="hear"]');
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(OUT, '03-clip.png'), fullPage: true });

  if (await page.locator('#guess').isVisible()) {
    await page.fill('#guess', 'terminator 2');
    await page.click('#submit');
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(OUT, '04-locked.png'), fullPage: true });
  push('locked-text', (await page.locator('body').innerText()).slice(0, 1200));

  const lock = await req('POST', `/api/glimpse/rooms/${RID}/lock`, {});
  push('lock-table', { status: lock.status, phase: lock.json && lock.json.phase });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, '05-reveal.png'), fullPage: true });
  push('reveal-text', (await page.locator('body').innerText()).slice(0, 1500));

  const stage = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await stage.goto(`${BASE}/play/glimpse/${INV}/stage`, { waitUntil: 'networkidle' });
  await stage.screenshot({ path: path.join(OUT, '06-stage.png'), fullPage: true });
  push('stage-text', (await stage.locator('body').innerText()).slice(0, 800));

  const hostPage = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  const hostHtml = path.join(__dirname, '..', 'data', 'cortex-skills', 'glimpse', 'ui', 'index.html');
  // host UI talks to /api/glimpse on same origin — serve it via the live server isn't mounted.
  // Open guest play as second evidence instead if host static isn't on this mini server.
  await hostPage.goto(`${BASE}/glimpse/play.html`, { waitUntil: 'domcontentloaded' }).catch(() => null);

  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 2));
  await browser.close();
  process.stdout.write(`WROTE ${OUT}\n`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
