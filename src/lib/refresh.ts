// The in-page release refresh (GUIDE §5.4): a small safety net for when the
// site hasn't been rebuilt yet after a release. It runs in the browser (via
// src/components/Refresh.astro, inlined into the page) and in the tests.
//
// 1. Ask GitHub for the latest release: at most once per browser session
//    (the answer is kept in sessionStorage), with a 4-second timeout.
// 2. If it is newer than the tag this page was built with, point every
//    download at the new files: [data-target] links, [data-target-size] and
//    [data-target-name] texts, [data-version] texts. Checksums can't be
//    refreshed without another download, so [data-sums] blocks are hidden
//    rather than left wrong.
// 3. Any failure does nothing. Many Iraqi users share one IP address, so
//    GitHub's 60 anonymous requests per hour often run out: the page built
//    into the HTML must always be complete and correct on its own.
import { targetOf, type Target } from './targets';
import { formatDate, formatSize, type Locale } from './format';

export const API_LATEST = 'https://api.github.com/repos/sharon-xa/cinemakom/releases/latest';
const KEY = 'cinemakom-latest';

/** What we keep of GitHub's answer. */
export type Latest = {
  tag: string;
  date: string;
  files: Partial<Record<Target, { url: string; bytes: number; name: string }>>;
};

/** GitHub's JSON → Latest, or null if it isn't a usable release. Same suffix matching as the build. */
export function parse(json: unknown): Latest | null {
  const j = json as { tag_name?: unknown; published_at?: unknown; assets?: unknown };
  if (typeof j?.tag_name != 'string' || !/^v\d/.test(j.tag_name) || typeof j.published_at != 'string' || !Array.isArray(j.assets))
    return null;
  const files: Latest['files'] = {};
  for (const a of j.assets as { name: string; size: number; browser_download_url: string }[]) {
    const t = targetOf(String(a?.name));
    // Only links to GitHub itself, and real files.
    if (t && String(a.browser_download_url).startsWith('https://github.com/') && a.size > 0)
      files[t] = { url: a.browser_download_url, bytes: a.size, name: a.name };
  }
  return { tag: j.tag_name, date: j.published_at, files };
}

/** True if tag a is a later version than tag b ("v1.10.0" > "v1.9.2"): digit runs compare as numbers. */
export const newer = (a: string, b: string): boolean => a.localeCompare(b, 'en', { numeric: true }) > 0;

/** The little of the DOM this needs, so the tests can pass plain objects. */
export type Root = { querySelectorAll(selector: string): ArrayLike<El> | Iterable<El> };
export type El = {
  textContent: string | null;
  hidden: boolean;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
};

/** Updates the page to `latest` if it is newer than `baked`. Returns whether it did. */
export function apply(root: Root, latest: Latest, baked: string, locale: Locale): boolean {
  if (!newer(latest.tag, baked)) return false;
  const each = (s: string, f: (el: El, v: string) => void) =>
    Array.from(root.querySelectorAll(`[${s}]`) as ArrayLike<El>, (el) => f(el, el.getAttribute(s)!));
  const file = (v: string) => latest.files[v as Target];
  each('data-target', (el, v) => file(v) && el.setAttribute('href', file(v)!.url));
  each('data-target-size', (el, v) => file(v) && (el.textContent = formatSize(file(v)!.bytes, locale)));
  each('data-target-name', (el, v) => file(v) && (el.textContent = file(v)!.name));
  each('data-sums', (el) => (el.hidden = true));
  each('data-version', (el, v) => {
    el.textContent = v == 'date' ? formatDate(latest.date, locale) : v == 'tag' ? latest.tag : latest.tag.slice(1);
  });
  return true;
}

type Env = {
  root: Root;
  baked: string;
  locale: Locale;
  fetch: typeof fetch;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
  timeoutMs?: number;
};

/** The whole refresh. Never throws. */
export async function refresh(env: Env): Promise<boolean> {
  try {
    let latest: Latest | null = null;
    const kept = env.storage?.getItem(KEY);
    if (kept) latest = JSON.parse(kept) as Latest;
    else {
      const res = await env.fetch(API_LATEST, { signal: AbortSignal.timeout(env.timeoutMs ?? 4000) });
      if (!res.ok) return false;
      latest = parse(await res.json());
      if (latest) env.storage?.setItem(KEY, JSON.stringify(latest));
    }
    return latest ? apply(env.root, latest, env.baked, env.locale) : false;
  } catch {
    return false;
  }
}
