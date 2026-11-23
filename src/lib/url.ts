// Every internal URL goes through here (GUIDE §10.1), so a custom domain or a
// new base path is a change to astro.config.mjs only.
import type { Locale } from './format';

export type Page = 'home' | 'tv';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const SITE = (import.meta.env.SITE ?? 'https://sharon-xa.github.io').replace(/\/$/, '');

/** A path inside the site: url('fonts/x.woff2') → '/cinemakom-website/fonts/x.woff2'. */
export function url(path = ''): string {
  return BASE + path.replace(/^\/+/, '');
}

/** The URL of a page in a language: pageUrl('en', 'tv') → '/cinemakom-website/en/tv/'. */
export function pageUrl(locale: Locale, page: Page, hash = ''): string {
  const prefix = locale === 'en' ? 'en/' : '';
  const rest = page === 'tv' ? 'tv/' : '';
  return url(prefix + rest) + (hash ? `#${hash.replace(/^#/, '')}` : '');
}

/** The same URL with the site's origin, for canonical, hreflang, Open Graph and QR codes. */
export function absolute(path: string): string {
  return SITE + path;
}

/** The short TV address people type on a remote: 'sharon-xa.github.io/cinemakom-website/tv'. */
export function tvAddress(locale: Locale = 'ar'): string {
  return absolute(pageUrl(locale, 'tv'))
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
}
