// Build-time release data (docs/GUIDE.md §5.1).
//
// The site's download links come from the app's latest GitHub release, fetched
// once per build. Nothing about a release (version, file name, size, link) is
// ever hardcoded.
import { TARGETS, targetOf as currentTarget, type Target } from './targets';
import sampleJson from '../data/release.sample.json';
import sampleSums from '../data/release.sample.SHA256SUMS.txt?raw';

export type { Target } from './targets';

export const REPO = 'sharon-xa/cinemakom';
export const API_LATEST = `https://api.github.com/repos/${REPO}/releases/latest`;
export const ALL_RELEASES_URL = `https://github.com/${REPO}/releases`;
export const ISSUES_URL = `https://github.com/${REPO}/issues`;
export const REPO_URL = `https://github.com/${REPO}`;
/** The Linux install script, always the latest release's (so running it again updates). */
export const INSTALL_SCRIPT = 'install.sh';
export const INSTALL_SCRIPT_URL = `${REPO_URL}/releases/latest/download/${INSTALL_SCRIPT}`;

/** Without these the site can't offer Android, so a CI build stops. */
export const REQUIRED_TARGETS: readonly Target[] = [
  'android-arm64-v8a',
  'android-armeabi-v7a',
  'android-x86_64',
];

export type ReleaseFile = { name: string; url: string; bytes: number; sha256?: string };

export type Release = {
  tag: string;
  version: string;
  publishedAt: string;
  pageUrl: string;
  allReleasesUrl: string;
  files: Partial<Record<Target, ReleaseFile>>;
  /** The release has install.sh (from v2.0.0): Linux installs with one command. */
  installScript: boolean;
  /** Where the data came from; 'sample' only happens in local builds. */
  source: 'github' | 'sample';
};

export class ReleaseDataError extends Error {
  override name = 'ReleaseDataError';
}

const SUMS_NAME = 'SHA256SUMS.txt';

/** targetOf, plus v1.0.0's Linux tarball (remove with the linux-x64-tar target). */
export function targetOf(name: string): Target | undefined {
  return currentTarget(name) ?? (name.endsWith('-linux-x64.tar.gz') ? 'linux-x64-tar' : undefined);
}

type ApiAsset = { name?: unknown; size?: unknown; browser_download_url?: unknown };

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Parses `sha256sum` output ("<hex>  <name>" per line) into name → hash. */
export function parseSums(text: string): Map<string, string> {
  const sums = new Map<string, string>();
  for (const line of text.split(/\r?\n/)) {
    const m = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i);
    if (m) sums.set(m[2]!.trim(), m[1]!.toLowerCase());
  }
  return sums;
}

/** The URL of SHA256SUMS.txt in an API answer, if the release has one. */
export function sumsUrl(json: unknown): string | undefined {
  if (!isRecord(json) || !Array.isArray(json.assets)) return undefined;
  const a = (json.assets as ApiAsset[]).find((x) => isRecord(x) && x.name === SUMS_NAME);
  return typeof a?.browser_download_url === 'string' ? a.browser_download_url : undefined;
}

/**
 * Turns a GitHub `releases/latest` answer into the site's Release.
 * Pure: no network, no environment. Throws ReleaseDataError (with a sentence
 * a human can act on) when the answer isn't a usable release.
 */
export function pickAssets(json: unknown, sums: Map<string, string> = new Map()): Omit<Release, 'source'> {
  if (!isRecord(json)) throw new ReleaseDataError('The GitHub answer is not a JSON object.');
  const { tag_name, published_at, html_url, assets } = json;
  if (typeof tag_name !== 'string' || !/^v\d/.test(tag_name)) {
    const msg = typeof json.message === 'string' ? ` GitHub said: "${json.message}".` : '';
    throw new ReleaseDataError(`The GitHub answer has no usable tag_name (got ${JSON.stringify(tag_name)}).${msg}`);
  }
  if (typeof published_at !== 'string' || Number.isNaN(Date.parse(published_at))) {
    throw new ReleaseDataError(`Release ${tag_name} has no valid published_at date.`);
  }
  if (typeof html_url !== 'string' || !html_url.startsWith('https://github.com/')) {
    throw new ReleaseDataError(`Release ${tag_name} has no html_url on github.com.`);
  }
  if (!Array.isArray(assets)) throw new ReleaseDataError(`Release ${tag_name} has no assets list.`);

  const files: Release['files'] = {};
  let installScript = false;
  for (const a of assets as ApiAsset[]) {
    if (!isRecord(a) || typeof a.name !== 'string') continue;
    if (a.name === INSTALL_SCRIPT) {
      installScript = typeof a.browser_download_url === 'string' && a.browser_download_url.startsWith('https://github.com/');
      continue;
    }
    const target = targetOf(a.name);
    if (!target) continue; // iOS, macOS, checksums, anything new: ignored.
    const url = a.browser_download_url;
    const bytes = a.size;
    if (typeof url !== 'string' || !url.startsWith('https://github.com/')) continue;
    if (typeof bytes !== 'number' || !(bytes > 0)) continue;
    const sha256 = sums.get(a.name);
    files[target] = { name: a.name, url, bytes, ...(sha256 ? { sha256 } : {}) };
  }

  return {
    tag: tag_name,
    version: tag_name.replace(/^v/, ''),
    publishedAt: published_at,
    pageUrl: html_url,
    allReleasesUrl: ALL_RELEASES_URL,
    files,
    installScript,
  };
}

/** Required targets the release doesn't have. */
export function missingRequired(release: Pick<Release, 'files'>): Target[] {
  return REQUIRED_TARGETS.filter((t) => !release.files[t]);
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
  if (!res.ok) throw new ReleaseDataError(`GET ${url} answered ${res.status} ${res.statusText}.`);
  return res;
}

/** Fetches the latest (non-prerelease, non-draft) release and its checksums. */
export async function fetchLatestRelease(env: NodeJS.ProcessEnv = process.env): Promise<Release> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'cinemakom-website-build',
  };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;

  const json: unknown = await (await fetchWithTimeout(API_LATEST, { headers }, 20_000)).json();
  let sums = new Map<string, string>();
  const sumsHref = sumsUrl(json);
  if (sumsHref) {
    const text = await (await fetchWithTimeout(sumsHref, { headers: { 'User-Agent': headers['User-Agent']! } }, 30_000)).text();
    sums = parseSums(text);
  }
  return { ...pickAssets(json, sums), source: 'github' };
}

export function sampleRelease(): Release {
  return { ...pickAssets(sampleJson, parseSums(sampleSums)), source: 'sample' };
}

/**
 * A made-up v2.0.0 with v2's files (installer, AppImage, install.sh; no
 * tarball, no Apple files), to see and test the new install steps before
 * v2.0.0 is published: RELEASE_SAMPLE=v2 npm run dev. Remove it with the
 * linux-x64-tar target.
 */
export function sampleReleaseV2(): Release {
  const json = JSON.parse(JSON.stringify(sampleJson).replaceAll('v1.0.0', 'v2.0.0')) as typeof sampleJson;
  const dl = 'https://github.com/sharon-xa/cinemakom/releases/download/v2.0.0/';
  const add = (name: string, size: number) => ({ ...json.assets[0]!, name, size, browser_download_url: dl + name });
  json.assets = [
    ...json.assets.filter((a) => a.name.includes('-android-') || a.name.endsWith('-windows-x64.zip')),
    add('cinemakom-v2.0.0-windows-x64-setup.exe', 31_457_280),
    add('cinemakom-v2.0.0-linux-x64.AppImage', 62_914_560),
    add('cinemakom-v2.0.0-linux-x64.AppImage.zsync', 196_608),
    add('cinemakom-v2.0.0-linux-x64-sources.tar', 104_857_600),
    add('install.sh', 6_144),
    add('SHA256SUMS.txt', 900),
  ];
  const sums = parseSums(sampleSums.replaceAll('v1.0.0', 'v2.0.0'));
  sums.set('cinemakom-v2.0.0-windows-x64-setup.exe', 'e'.repeat(64));
  sums.set('cinemakom-v2.0.0-linux-x64.AppImage', 'a'.repeat(64));
  return { ...pickAssets(json, sums), source: 'sample' };
}

/**
 * Decides what a build uses (the failure rules of §5.1):
 * - CI: the live release, complete with Android files, or the build fails.
 * - Local: the live release; if that fails (offline, rate limit), the sample.
 * - RELEASE_SAMPLE=1 forces the sample (fast offline work); RELEASE_SAMPLE=v2
 *   the made-up v2.0.0.
 */
export async function loadRelease(env: NodeJS.ProcessEnv = process.env): Promise<Release> {
  const ci = Boolean(env.CI);
  if (env.RELEASE_SAMPLE === '1' && !ci) return sampleRelease();
  if (env.RELEASE_SAMPLE === 'v2' && !ci) return sampleReleaseV2();
  let release: Release;
  try {
    release = await fetchLatestRelease(env);
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    if (ci) throw new ReleaseDataError(`Could not load the latest release in CI, so the build stops. ${why}`);
    console.warn(`[release] Live release data unavailable (${why}). Using src/data/release.sample.json.`);
    return sampleRelease();
  }
  const missing = missingRequired(release);
  if (missing.length && ci) {
    throw new ReleaseDataError(`Release ${release.tag} has no file for ${missing.join(', ')}, so the build stops.`);
  }
  return release;
}

let cached: Promise<Release> | undefined;

/** The release for this build: fetched once, shared by every page. */
export function getRelease(): Promise<Release> {
  cached ??= loadRelease().then((r) => {
    const got = TARGETS.filter((t) => r.files[t]).join(', ');
    console.log(`[release] Using ${r.tag} (${r.source}), published ${r.publishedAt}. Files: ${got}.`);
    return r;
  });
  return cached;
}
