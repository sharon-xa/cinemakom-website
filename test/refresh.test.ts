import { describe, expect, it, vi } from 'vitest';
import { apply, newer, parse, refresh, type El, type Root } from '../src/lib/refresh';
import sample from '../src/data/release.sample.json';

/** A fake element: just the bits refresh.ts touches. */
function el(attrs: Record<string, string>, text = ''): El & { attrs: Record<string, string> } {
  return {
    attrs: { ...attrs },
    textContent: text,
    hidden: false,
    getAttribute(n) {
      return this.attrs[n] ?? null;
    },
    setAttribute(n, v) {
      this.attrs[n] = v;
    },
  };
}

/** A fake page with one of each hook, as Download.astro and the TV page render them. */
function page() {
  const nodes = {
    phone: el({ 'data-target': 'android-arm64-v8a', href: 'old-phone' }),
    tv: el({ 'data-target': 'android-armeabi-v7a', href: 'old-tv' }),
    size: el({ 'data-target-size': 'android-arm64-v8a' }, '39 MB'),
    name: el({ 'data-target-name': 'linux-x64' }, 'cinemakom-v1.0.0-linux-x64.tar.gz'),
    sums: el({ 'data-sums': '' }),
    version: el({ 'data-version': 'version' }, '1.0.0'),
    tag: el({ 'data-version': 'tag' }, 'v1.0.0'),
    date: el({ 'data-version': 'date' }, '20 Nov 2026'),
  };
  const all = Object.values(nodes);
  const root: Root = {
    querySelectorAll(sel) {
      const attr = sel.replace(/^\[|\]$/g, '');
      return all.filter((n) => attr in n.attrs);
    },
  };
  return { root, nodes };
}

/** The saved v1.0.0 answer, re-tagged as a newer release with bigger files. */
function release(tag: string) {
  const json = structuredClone(sample) as typeof sample;
  json.tag_name = tag;
  json.published_at = '2026-12-01T09:00:00Z';
  for (const a of json.assets) {
    a.name = a.name.replace('v1.0.0', tag);
    a.browser_download_url = a.browser_download_url.replaceAll('v1.0.0', tag);
    a.size += 1024 * 1024;
  }
  return json;
}

const memory = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};
const ok = (json: unknown) => vi.fn(async () => new Response(JSON.stringify(json), { status: 200 })) as unknown as typeof fetch;

describe('parse', () => {
  it('finds the five files of a release and ignores the rest (iOS, macOS, checksums)', () => {
    const r = parse(sample)!;
    expect(r.tag).toBe('v1.0.0');
    expect(Object.keys(r.files).sort()).toEqual(
      ['android-arm64-v8a', 'android-armeabi-v7a', 'android-x86_64', 'linux-x64', 'windows-x64'].sort(),
    );
  });

  it('refuses links that are not on github.com', () => {
    const j = release('v1.1.0');
    j.assets[0]!.browser_download_url = 'https://evil.example/x.apk';
    const r = parse(j)!;
    expect(Object.values(r.files).every((f) => f!.url.startsWith('https://github.com/'))).toBe(true);
  });

  it('returns null for answers that are not a release', () => {
    expect(parse(null)).toBeNull();
    expect(parse({ message: 'API rate limit exceeded' })).toBeNull();
    expect(parse({ tag_name: 'nightly', published_at: 'x', assets: [] })).toBeNull();
  });
});

describe('newer', () => {
  it('compares versions number by number', () => {
    expect(newer('v1.1.0', 'v1.0.0')).toBe(true);
    expect(newer('v1.10.0', 'v1.9.2')).toBe(true);
    expect(newer('v2.0.0', 'v10.0.0')).toBe(false);
    expect(newer('v1.0.0', 'v1.0.0')).toBe(false);
    expect(newer('v1.0.0', 'v1.0.1')).toBe(false);
  });
});

describe('apply', () => {
  it('swaps every link, size, name and version for a newer release, and hides the old checksums', () => {
    const { root, nodes } = page();
    expect(apply(root, parse(release('v1.1.0'))!, 'v1.0.0', 'en')).toBe(true);
    expect(nodes.phone.attrs.href).toBe(
      'https://github.com/sharon-xa/cinemakom/releases/download/v1.1.0/cinemakom-v1.1.0-android-arm64-v8a.apk',
    );
    expect(nodes.tv.attrs.href).toMatch(/v1\.1\.0-android-armeabi-v7a\.apk$/);
    expect(nodes.size.textContent).toBe('40 MB');
    expect(nodes.name.textContent).toBe('cinemakom-v1.1.0-linux-x64.tar.gz');
    expect(nodes.sums.hidden).toBe(true);
    expect([nodes.version.textContent, nodes.tag.textContent, nodes.date.textContent]).toEqual(['1.1.0', 'v1.1.0', '1 Dec 2026']);
  });

  it('formats for Arabic pages with Western digits', () => {
    const { root, nodes } = page();
    apply(root, parse(release('v1.1.0'))!, 'v1.0.0', 'ar');
    expect(nodes.size.textContent).toBe('40 ميغابايت');
    expect(nodes.date.textContent).toBe('1 كانون الأول 2026');
  });

  it('leaves the page alone when the release is the same or older', () => {
    for (const tag of ['v1.0.0', 'v0.9.0']) {
      const { root, nodes } = page();
      expect(apply(root, parse(release(tag))!, 'v1.0.0', 'en')).toBe(false);
      expect(nodes.phone.attrs.href).toBe('old-phone');
      expect(nodes.sums.hidden).toBe(false);
    }
  });

  it('keeps the built link for a file the new release lacks', () => {
    const j = release('v1.1.0');
    j.assets = j.assets.filter((a) => !a.name.endsWith('-android-armeabi-v7a.apk'));
    const { root, nodes } = page();
    apply(root, parse(j)!, 'v1.0.0', 'en');
    expect(nodes.tv.attrs.href).toBe('old-tv');
    expect(nodes.phone.attrs.href).toMatch(/v1\.1\.0/);
  });
});

describe('refresh', () => {
  const failures: [string, typeof fetch][] = [
    ['the network fails', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))) as unknown as typeof fetch],
    ['GitHub refuses (rate limit)', vi.fn(async () => new Response('{"message":"API rate limit exceeded"}', { status: 403 })) as unknown as typeof fetch],
    ['GitHub sends junk', vi.fn(async () => new Response('<html>', { status: 200 })) as unknown as typeof fetch],
  ];
  for (const [what, f] of failures) {
    it(`does nothing when ${what}`, async () => {
      const { root, nodes } = page();
      const storage = memory();
      expect(await refresh({ root, baked: 'v1.0.0', locale: 'en', fetch: f, storage })).toBe(false);
      expect(nodes.phone.attrs.href).toBe('old-phone');
      expect(nodes.version.textContent).toBe('1.0.0');
      expect(storage.m.size).toBe(0);
    });
  }

  it('gives up after the timeout', async () => {
    const hang = vi.fn(
      (_: unknown, init?: RequestInit) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener('abort', () => reject(init.signal!.reason))),
    ) as unknown as typeof fetch;
    const { root, nodes } = page();
    expect(await refresh({ root, baked: 'v1.0.0', locale: 'en', fetch: hang, timeoutMs: 20 })).toBe(false);
    expect(nodes.phone.attrs.href).toBe('old-phone');
  });

  it('applies a newer release and asks GitHub only once per session', async () => {
    const storage = memory();
    const f = ok(release('v1.1.0'));
    const first = page();
    expect(await refresh({ root: first.root, baked: 'v1.0.0', locale: 'en', fetch: f, storage })).toBe(true);
    expect(first.nodes.phone.attrs.href).toMatch(/v1\.1\.0/);
    const second = page();
    expect(await refresh({ root: second.root, baked: 'v1.0.0', locale: 'en', fetch: f, storage })).toBe(true);
    expect(second.nodes.phone.attrs.href).toMatch(/v1\.1\.0/);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('works without storage (blocked in private mode)', async () => {
    const { root, nodes } = page();
    expect(await refresh({ root, baked: 'v1.0.0', locale: 'en', fetch: ok(release('v1.1.0')) })).toBe(true);
    expect(nodes.phone.attrs.href).toMatch(/v1\.1\.0/);
  });
});
