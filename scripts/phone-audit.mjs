// Phone audit over the Chrome DevTools Protocol (Node's built-in WebSocket, no
// dependencies). Loads a page as a 3x touch phone with an Android user agent and
// prints JSON: horizontal overflow, tap targets under 44 px, text under 13 px,
// images and transferred bytes. Optionally saves a full-page screenshot.
//
//   npm run build && npm run preview
//   chrome-headless-shell --remote-debugging-port=9333 about:blank &
//   node scripts/phone-audit.mjs 9333 http://127.0.0.1:4321/ 360 780 [out.png]
//
// (Any Chrome works; Playwright's cached chrome-headless-shell renders true
// phone widths, the full Chrome binary clamps headless windows to 500 px.)
const [port, url, w, h, out] = process.argv.slice(2);
const width = Number(w), height = Number(h);
import { writeFileSync } from 'node:fs';

const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
const events = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else events.push(m);
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await send('Page.enable');
await send('Network.enable');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 3, mobile: true });
await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A145F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36' });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url });
for (let i = 0; i < 100 && !events.some((e) => e.method === 'Page.loadEventFired'); i++) await sleep(100);
// Scroll through so lazy images load, then back to the top.
await send('Runtime.evaluate', { expression: `(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)})()`, awaitPromise: true });
await sleep(800);

const audit = `(() => {
  const vw = innerWidth;
  const res = { vw, scrollWidth: document.documentElement.scrollWidth, overflow: [], smallTargets: [], inlineSmall: [], tinyText: [], images: [], bytes: 0 };
  const inScroller = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(s.overflowX) && p !== document.body && p !== document.documentElement) return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if ((r.right > vw + 0.5 || r.left < -0.5) && !inScroller(el) && getComputedStyle(el).position !== 'fixed')
      res.overflow.push({ tag: el.tagName, cls: String(el.className).slice(0, 60), left: Math.round(r.left), right: Math.round(r.right) });
  }
  for (const el of document.querySelectorAll('a, button, summary, input, label, [tabindex]')) {
    const r = el.getBoundingClientRect();
    if (!r.width) continue;
    // A visually hidden input inside its label: the label is the target.
    if (el.matches('input.sr-only') && el.closest('label')) continue;
    const item = { text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 40), w: Math.round(r.width), h: Math.round(r.height) };
    if (r.height < 44 || r.width < 44) {
      const inline = getComputedStyle(el).display === 'inline' && el.closest('p, li, dd');
      (inline ? res.inlineSmall : res.smallTargets).push(item);
    }
  }
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (walker.nextNode()) {
    const el = walker.currentNode.parentElement;
    if (!walker.currentNode.textContent.trim() || seen.has(el)) continue;
    seen.add(el);
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || el.closest('[aria-hidden=true], .sr-only')) continue;
    if (parseFloat(s.fontSize) < 13) res.tinyText.push({ text: el.textContent.trim().slice(0, 40), size: s.fontSize });
  }
  for (const img of document.images) {
    const r = img.getBoundingClientRect();
    res.images.push({ src: (img.currentSrc || '').split('/').pop().slice(0, 50), shown: Math.round(r.width), natural: img.naturalWidth, complete: img.complete });
  }
  for (const e of performance.getEntriesByType('resource')) res.bytes += e.transferSize || 0;
  const nav = performance.getEntriesByType('navigation')[0];
  res.bytes += nav ? nav.transferSize : 0;
  res.height = document.documentElement.scrollHeight;
  return JSON.stringify(res);
})()`;
const r = await send('Runtime.evaluate', { expression: audit, returnByValue: true });
console.log(r.result.result.value);
if (out) {
  const m = await send('Page.getLayoutMetrics');
  const fullH = Math.ceil(m.result.cssContentSize.height);
  await send('Emulation.setDeviceMetricsOverride', { width, height: Math.min(fullH, 12000), deviceScaleFactor: 1, mobile: true });
  await sleep(500);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
}
await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`);
process.exit(0);
