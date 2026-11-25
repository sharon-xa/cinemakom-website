import { describe, expect, it, vi, afterEach } from 'vitest';
import sample from '../src/data/release.sample.json';
import sampleSums from '../src/data/release.sample.SHA256SUMS.txt?raw';
import {
  pickAssets,
  parseSums,
  sumsUrl,
  missingRequired,
  loadRelease,
  sampleReleaseV2,
  targetOf,
  ReleaseDataError,
} from '../src/lib/release';
import { TARGETS, targetOf as browserTargetOf } from '../src/lib/targets';
import { formatDate, formatSize } from '../src/lib/format';

const sums = parseSums(sampleSums);
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

describe('targetOf', () => {
  it('matches by suffix whatever the tag', () => {
    expect(targetOf('cinemakom-v9.9.9-beta1-android-arm64-v8a.apk')).toBe('android-arm64-v8a');
    expect(targetOf('cinemakom-v1.0.0-linux-x64.tar.gz')).toBe('linux-x64-tar');
    expect(targetOf('cinemakom-v1.0.0-windows-x64.zip')).toBe('windows-x64');
    expect(targetOf('cinemakom-v2.0.0-windows-x64-setup.exe')).toBe('windows-x64-setup');
    expect(targetOf('cinemakom-v2.0.0-linux-x64.AppImage')).toBe('linux-x64');
  });
  it('ignores everything else', () => {
    expect(targetOf('cinemakom-v1.0.0-ios-unsigned.ipa')).toBeUndefined();
    expect(targetOf('cinemakom-v1.0.0-macos.dmg')).toBeUndefined();
    expect(targetOf('SHA256SUMS.txt')).toBeUndefined();
    expect(targetOf('cinemakom-v1.0.0-android-arm64-v8a.apk.sig')).toBeUndefined();
    expect(targetOf('cinemakom-v2.0.0-linux-x64.AppImage.zsync')).toBeUndefined();
    expect(targetOf('cinemakom-v2.0.0-linux-x64-sources.tar')).toBeUndefined();
    expect(targetOf('cinemakom-v2.0.0-windows-x64.exe')).toBeUndefined();
    expect(targetOf('install.sh')).toBeUndefined();
  });
  it('leaves the tarball to the build: the browser copy never needs it', () => {
    expect(browserTargetOf('cinemakom-v1.0.0-linux-x64.tar.gz')).toBeUndefined();
    expect(browserTargetOf('cinemakom-v2.0.0-windows-x64-setup.exe')).toBe('windows-x64-setup');
  });
});

describe('pickAssets on the saved v1.0.0 answer', () => {
  const r = pickAssets(sample, sums);

  it('reads the release fields', () => {
    expect(r.tag).toBe('v1.0.0');
    expect(r.version).toBe('1.0.0');
    expect(r.publishedAt).toBe('2026-11-20T00:11:09Z');
    expect(r.pageUrl).toBe('https://github.com/sharon-xa/cinemakom/releases/tag/v1.0.0');
    expect(r.allReleasesUrl).toBe('https://github.com/sharon-xa/cinemakom/releases');
  });

  it('finds its five files and nothing else', () => {
    expect(Object.keys(r.files).sort()).toEqual(
      ['android-arm64-v8a', 'android-armeabi-v7a', 'android-x86_64', 'linux-x64-tar', 'windows-x64'].sort(),
    );
    expect(r.installScript).toBe(false);
    const names = Object.values(r.files).map((f) => f!.name);
    expect(names.some((n) => /ios|macos|SHA256/.test(n))).toBe(false);
  });

  it('keeps exact links, sizes and checksums', () => {
    expect(r.files['android-arm64-v8a']).toEqual({
      name: 'cinemakom-v1.0.0-android-arm64-v8a.apk',
      url: 'https://github.com/sharon-xa/cinemakom/releases/download/v1.0.0/cinemakom-v1.0.0-android-arm64-v8a.apk',
      bytes: 41012432,
      sha256: '0afdc0ed1f6ed9b8f4ec8ed34fc58b4fadf71daa7642ea9eb850c6746a6d9fcd',
    });
    expect(r.files['android-armeabi-v7a']!.bytes).toBe(37606128);
    expect(r.files['windows-x64']!.sha256).toBe('4109e068caf41c8915a9d7641b3da614a8a2377a086e7d96ff9bb3107e73fa26');
    expect(r.files['linux-x64-tar']!.bytes).toBe(14118851);
    expect(missingRequired(r)).toEqual([]);
  });

  it('works without checksums', () => {
    const bare = pickAssets(sample);
    expect(bare.files['linux-x64-tar']!.sha256).toBeUndefined();
    expect(sumsUrl(sample)).toMatch(/\/SHA256SUMS\.txt$/);
  });
});

describe('pickAssets on a v2.0.0-style release', () => {
  const r = sampleReleaseV2();

  it('finds the installer, the zip, the AppImage and install.sh, and nothing else', () => {
    expect(Object.keys(r.files).sort()).toEqual(TARGETS.filter((t) => t !== 'linux-x64-tar').sort());
    expect(r.files['windows-x64-setup']!.name).toBe('cinemakom-v2.0.0-windows-x64-setup.exe');
    expect(r.files['linux-x64']!.name).toBe('cinemakom-v2.0.0-linux-x64.AppImage');
    expect(r.files['linux-x64']!.sha256).toBe('a'.repeat(64));
    expect(r.installScript).toBe(true);
    expect(missingRequired(r)).toEqual([]);
  });

  it('only trusts an install.sh hosted on github.com', () => {
    const json = clone(sample);
    json.assets.push({ ...json.assets[0]!, name: 'install.sh', browser_download_url: 'https://evil.example/install.sh' });
    expect(pickAssets(json).installScript).toBe(false);
  });
});

describe('pickAssets on other answers', () => {
  it('handles a release missing Linux', () => {
    const json = clone(sample);
    json.assets = json.assets.filter((a) => !a.name.endsWith('-linux-x64.tar.gz'));
    const r = pickAssets(json, sums);
    expect(r.files['linux-x64-tar']).toBeUndefined();
    expect(r.files['windows-x64']).toBeDefined();
    expect(missingRequired(r)).toEqual([]);
  });

  it('reports missing Android files', () => {
    const json = clone(sample);
    json.assets = json.assets.filter((a) => !a.name.includes('-android-'));
    expect(missingRequired(pickAssets(json))).toEqual([
      'android-arm64-v8a',
      'android-armeabi-v7a',
      'android-x86_64',
    ]);
  });

  it('skips assets with broken links or sizes', () => {
    const json = clone(sample);
    const a = json.assets.find((x) => x.name.endsWith('-windows-x64.zip'))!;
    a.browser_download_url = 'http://evil.example/x.zip';
    expect(pickAssets(json).files['windows-x64']).toBeUndefined();
  });

  it.each([
    ['null', null],
    ['a string', 'nope'],
    ['an array', []],
    ['a rate-limit answer', { message: 'API rate limit exceeded for 1.2.3.4.', documentation_url: 'x' }],
    ['no assets', { tag_name: 'v1.0.0', published_at: '2026-11-20T00:11:09Z', html_url: 'https://github.com/x' }],
    ['a bad date', { ...sample, published_at: 'yesterday' }],
  ])('rejects %s with a readable error', (_label, junk) => {
    expect(() => pickAssets(junk)).toThrow(ReleaseDataError);
    try {
      pickAssets(junk);
    } catch (e) {
      expect((e as Error).message).toMatch(/^[A-Z].{15,}\.$|"\.$/);
    }
  });

  it('includes the GitHub message when there is one', () => {
    expect(() => pickAssets({ message: 'Not Found' })).toThrow(/GitHub said: "Not Found"/);
  });
});

describe('parseSums', () => {
  it('reads sha256sum output, including binary-mode stars and CRLF', () => {
    const m = parseSums(`${'a'.repeat(64)}  one.apk\r\n${'B'.repeat(64)} *two.zip\nnot a line\n`);
    expect(m.get('one.apk')).toBe('a'.repeat(64));
    expect(m.get('two.zip')).toBe('b'.repeat(64));
    expect(m.size).toBe(2);
  });
});

describe('loadRelease failure rules', () => {
  afterEach(() => vi.unstubAllGlobals());

  const failFetch = () =>
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503, statusText: 'Unavailable' })));

  it('fails the build in CI when GitHub is unreachable', async () => {
    failFetch();
    await expect(loadRelease({ CI: 'true' })).rejects.toThrow(/in CI, so the build stops/);
  });

  it('falls back to the sample locally', async () => {
    failFetch();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const r = await loadRelease({});
    expect(r.source).toBe('sample');
    expect(r.tag).toBe('v1.0.0');
  });

  it('fails in CI when the release has no Android files', async () => {
    const json = clone(sample);
    json.assets = json.assets.filter((a) => !a.name.includes('-android-'));
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(json)));
    await expect(loadRelease({ CI: 'true' })).rejects.toThrow(/no file for android-arm64-v8a/);
  });

  it('uses the live release and its checksums', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.endsWith('SHA256SUMS.txt') ? new Response(sampleSums) : Response.json(sample),
      ),
    );
    const r = await loadRelease({ CI: 'true', GITHUB_TOKEN: 't' });
    expect(r.source).toBe('github');
    expect(r.files['android-x86_64']!.sha256).toMatch(/^947ce6/);
    const calls = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[0]![1].headers.Authorization).toBe('Bearer t');
    expect(calls[1]![1].headers.Authorization).toBeUndefined(); // never send the token off api.github.com
  });
});

describe('format', () => {
  it('formats sizes with Western digits', () => {
    expect(formatSize(41012432, 'en')).toBe('39 MB');
    expect(formatSize(41012432, 'ar')).toBe('39 ميغابايت');
    expect(formatSize(5 * 1024 * 1024 + 300_000, 'en')).toBe('5.3 MB');
  });
  it('formats dates in Baghdad time', () => {
    expect(formatDate('2026-11-20T00:11:09Z', 'en')).toBe('20 Nov 2026');
    expect(formatDate('2026-11-19T22:30:00Z', 'en')).toBe('20 Nov 2026');
    expect(formatDate('2026-11-20T00:11:09Z', 'ar')).toMatch(/^20 .+ 2026$/);
  });
});
