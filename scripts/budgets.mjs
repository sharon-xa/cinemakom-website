// Budgets for the built site (GUIDE §4), checked after every build: fails if a
// page's CSS or JavaScript grows past its limit, so a slow page never ships.
//   npm run build && npm run budgets
// The first-view total (≤ 350 KB compressed) and CLS 0 need a browser: measure
// them with Lighthouse (W6 in AGENTS.md); these are the parts a build can check.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const LIMITS = {
  css: 20 * 1024, // compressed, per page (all of it is inline)
  js: 2 * 1024, // uncompressed: the inline release refresh is the only script
  html: 60 * 1024, // compressed, the whole page with its inline CSS and JS
};

const dist = new URL('../dist/', import.meta.url).pathname;
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(dist);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const gz = (s) => gzipSync(Buffer.from(s), { level: 9 }).length;
let failed = false;
for (const page of pages.sort()) {
  const html = readFileSync(page, 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
  const js = [...html.matchAll(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('');
  const external = [...html.matchAll(/<(?:script|link)[^>]+(?:src|href)="[^"]+\.(?:js|css)"/g)].length;
  const sizes = { css: gz(css), js: Buffer.byteLength(js), html: brotliCompressSync(Buffer.from(html)).length };
  const over = Object.entries(sizes).filter(([k, v]) => v > LIMITS[k]);
  if (external) over.push(['external CSS/JS files', external]);
  console.log(
    `${over.length ? '✗' : '✓'} ${page.slice(dist.length).padEnd(18)} css ${kb(sizes.css)} · js ${sizes.js} B · page ${kb(sizes.html)}`,
  );
  for (const [k, v] of over) console.log(`    over budget: ${k} ${typeof v === 'number' && k !== 'external CSS/JS files' ? kb(v) : v}`);
  if (over.length) failed = true;
}
if (failed) process.exit(1);
