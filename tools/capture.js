/**
 * Renders the portfolio in headless Chrome: assets/og.png (social preview) and
 * check screenshots in tools/shots/ (desktop and mobile, dark and light).
 * Also reports console errors, broken images and horizontal overflow.
 * Usage: node --experimental-websocket tools/capture.js  (needs Chrome; CHROME_PATH to override)
 */
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROOT = path.join(__dirname, '..');
const SHOTS = path.join(__dirname, 'shots');
const PORT = 9339;
const url = (file) => `file:///${path.join(ROOT, file).replace(/\\/g, '/')}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const JOBS = [
  { name: 'og', file: 'tools/og.html', width: 1200, height: 630, out: path.join(ROOT, 'assets', 'og.png') },
  { name: 'desktop-dark', file: 'index.html', width: 1440, height: 900, scheme: 'dark', full: true },
  { name: 'desktop-light', file: 'index.html', width: 1440, height: 900, scheme: 'light', full: true },
  { name: 'mobile-dark', file: 'index.html', width: 390, height: 844, scheme: 'dark', full: true, mobile: true },
  { name: 'desktop-hero', file: 'index.html', width: 1440, height: 900, scheme: 'dark' },
  // With animations on: the terminal has finished typing by now.
  { name: 'desktop-hero-typed', file: 'index.html', width: 1440, height: 900, scheme: 'dark', motion: true, wait: 12000 },
  { name: 'desktop-hero-typing', file: 'index.html', width: 1440, height: 900, scheme: 'dark', motion: true, wait: 3000 },
];

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${path.join(os.tmpdir(), 'portfolio-capture')}`, '--hide-scrollbars', 'about:blank',
  ]);
  try {
    let page = null;
    for (let i = 0; i < 40 && !page; i += 1) {
      await sleep(250);
      try {
        page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find((t) => t.type === 'page');
      } catch (_) {
        // not up yet
      }
    }
    if (!page) throw new Error('headless Chrome did not start');
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 0;
    const pending = new Map();
    const problems = [];
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        id += 1;
        pending.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      } else if (m.method === 'Runtime.exceptionThrown') {
        problems.push(`exception: ${m.params.exceptionDetails.text}`);
      } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
        problems.push(`console error: ${m.params.args.map((a) => a.value || a.description).join(' ')}`);
      }
    };
    await new Promise((r) => (ws.onopen = r));
    await send('Runtime.enable');
    await send('Page.enable');
    for (const job of JOBS) {
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: job.scheme || 'dark' }, { name: 'prefers-reduced-motion', value: job.motion ? 'no-preference' : 'reduce' }] });
      await send('Emulation.setDeviceMetricsOverride', { width: job.width, height: job.height, deviceScaleFactor: 1, mobile: Boolean(job.mobile) });
      await send('Page.navigate', { url: url(job.file) });
      await sleep(job.wait || 1800);
      // Show every section (as if scrolled through) and gather layout facts.
      const facts = await send('Runtime.evaluate', {
        returnByValue: true,
        expression: `(() => {
          document.querySelectorAll('.reveal').forEach((n) => n.classList.add('is-in'));
          const broken = [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.getAttribute('src'));
          return { height: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth > window.innerWidth, broken };
        })()`,
      });
      const { height, overflowX, broken } = facts.result.result.value;
      if (overflowX) problems.push(`${job.name}: page scrolls sideways`);
      if (broken.length) problems.push(`${job.name}: broken images ${broken.join(', ')}`);
      const clipHeight = job.full ? height : job.height;
      if (job.full) await send('Emulation.setDeviceMetricsOverride', { width: job.width, height: clipHeight, deviceScaleFactor: 1, mobile: Boolean(job.mobile) });
      await sleep(400);
      const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: job.width, height: clipHeight, scale: 1 } });
      const out = job.out || path.join(SHOTS, `${job.name}.png`);
      fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
      console.log(`saved ${path.relative(ROOT, out)} (${job.width}x${clipHeight})`);
    }
    console.log(problems.length ? `PROBLEMS:\n${problems.join('\n')}` : 'no problems found');
    ws.close();
  } finally {
    chrome.kill();
  }
})().catch((err) => {
  console.error('CAPTURE FAILED', err);
  process.exit(1);
});
