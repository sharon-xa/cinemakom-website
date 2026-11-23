import { describe, expect, it } from 'vitest';
import ar from '../src/i18n/ar';
import en from '../src/i18n/en';
import { fill } from '../src/i18n';

/** Every path to a leaf ("faq.items.3.q"), so both languages can be compared. */
function shape(v: unknown, path = ''): string[] {
  if (Array.isArray(v)) return [`${path}[${v.length}]`, ...v.flatMap((x, i) => shape(x, `${path}.${i}`))];
  if (v && typeof v === 'object')
    return Object.entries(v).flatMap(([k, x]) => shape(x, path ? `${path}.${k}` : k));
  return [path];
}

function leaves(v: unknown): string[] {
  if (typeof v === 'string') return [v];
  if (v && typeof v === 'object') return Object.values(v).flatMap(leaves);
  return [];
}

describe('dictionaries', () => {
  it('have the same keys and list lengths', () => {
    expect(shape(ar)).toEqual(shape(en));
  });

  it('use the same placeholders in each string', () => {
    const a = leaves(ar);
    const e = leaves(en);
    const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    e.forEach((s, i) => expect(ph(a[i]!), `string ${i}: ${s}`).toBe(ph(s)));
  });

  it('never use Eastern Arabic digits', () => {
    for (const s of leaves(ar)) expect(s).not.toMatch(/[٠-٩۰-۹]/);
  });

  it('never mention Apple downloads beyond the one FAQ answer', () => {
    const hits = leaves(en).filter((s) => /iphone|ipad|mac\b|ios|apple/i.test(s));
    expect(hits).toEqual([en.faq.items[6]!.q]); // only the FAQ question
  });

  it('never call the app official', () => {
    for (const s of [...leaves(en)]) expect(s).not.toMatch(/\bofficial (app|client|partner)/i);
  });

  it('has 5–7 features and 6–9 questions', () => {
    expect(en.features.items.length).toBeGreaterThanOrEqual(5);
    expect(en.features.items.length).toBeLessThanOrEqual(7);
    expect(en.faq.items.length).toBeGreaterThanOrEqual(6);
    expect(en.faq.items.length).toBeLessThanOrEqual(9);
  });
});

describe('fill', () => {
  it('fills known placeholders and keeps unknown ones', () => {
    expect(fill('v{version} · {date} {x}', { version: '1.0.0', date: '20 Nov 2026' })).toBe('v1.0.0 · 20 Nov 2026 {x}');
  });
});

describe('screenshots', () => {
  it('every screenshot has a loading preview (scripts/placeholders.sh)', async () => {
    const { readdirSync } = await import('node:fs');
    const placeholders = (await import('../src/data/placeholders.json')).default as Record<string, { w: number; h: number; webp: string }>;
    const files = readdirSync('src/assets/screens').filter((f) => f.endsWith('.png')).map((f) => f.replace(/\.png$/, ''));
    expect(Object.keys(placeholders).sort()).toEqual(files.sort());
    for (const v of Object.values(placeholders)) {
      expect(v.w).toBeGreaterThan(0);
      expect(v.h).toBeGreaterThan(0);
      expect(v.webp).toMatch(/^UklGR/); // RIFF: a WebP file
    }
  });

  it('every strip item names a screenshot that exists', async () => {
    const { existsSync } = await import('node:fs');
    for (const d of [ar, en]) for (const s of d.screens.items) expect(existsSync(`src/assets/screens/${s.file}.png`), s.file).toBe(true);
  });
});
