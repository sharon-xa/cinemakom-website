#!/usr/bin/env node
// Fails when src/ uses physical left/right utilities or CSS properties.
// The site is Arabic-first (RTL), so layout must use logical properties:
// ms/me, ps/pe, start/end, text-start/text-end, border-s/e, rounded-s/e.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const exts = new Set(['.astro', '.ts', '.css', '.mjs', '.js', '.html']);

const rules = [
  // Tailwind utilities, with optional variant (md:, hover:) and negative prefix.
  {
    re: /(?<![\w-])-?(?:ml|mr|pl|pr|left|right|text-left|text-right|border-l|border-r|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|scroll-ml|scroll-mr|scroll-pl|scroll-pr|float-left|float-right|clear-left|clear-right)-[\w[.\/]/,
    why: 'physical Tailwind utility',
  },
  { re: /(?<![\w-])(?:float|clear)-(?:left|right)(?![\w-])/, why: 'physical float/clear' },
  { re: /(?<![\w-])text-(?:left|right)(?![\w-])/, why: 'physical text alignment' },
  // Custom CSS properties and values.
  {
    re: /(?<![\w-])(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)\s*:/,
    why: 'physical CSS property',
  },
  { re: /(?<![\w-])(?:left|right)\s*:\s*[-\d.a-z(]/, why: 'physical CSS offset' },
  { re: /text-align\s*:\s*(?:left|right)/, why: 'physical text-align' },
  { re: /float\s*:\s*(?:left|right)/, why: 'physical float' },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (exts.has(name.slice(name.lastIndexOf('.')))) yield path;
  }
}

let problems = 0;
for (const file of walk(join(root, 'src'))) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('lint-rtl-ignore')) return;
    for (const { re, why } of rules) {
      const m = line.match(re);
      if (m) {
        problems++;
        console.error(`${relative(root, file)}:${i + 1}: ${why}: "${m[0]}"`);
      }
    }
  });
}

if (problems) {
  console.error(`\nlint:rtl: ${problems} problem(s). Use logical properties (start/end, ms/me, ps/pe).`);
  process.exit(1);
}
console.log('lint:rtl: no physical left/right found');
