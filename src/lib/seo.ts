// What search engines and AI assistants read: JSON-LD structured data for each
// page, /llms.txt and /robots.txt. Built from the dictionaries and the release,
// so it never goes stale and says the same as the page.
//
// Never add ratings or reviews (the app has none), and never describe the app
// as Cinemana's, Shabakaty's or Earthlink's.
import { dict, dicts, fill, LOCALES, type Locale } from '../i18n';
import { TARGETS } from './targets';
import { ISSUES_URL, REPO_URL, type Release } from './release';
import { formatDate, formatSize } from './format';
import { absolute, pageUrl, tvAddress, url, type Page } from './url';

export const AUTHOR = { name: 'sharon-xa', url: 'https://github.com/sharon-xa' };

export const OPERATING_SYSTEMS = 'Android 7.0+, Android TV, Google TV, Windows 10, Windows 11, Linux (x86-64)';

/** Our own strings with <em>, <a>… → plain text. */
export function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

/** JSON for a <script type="application/ld+json">: "<" escaped so text can't close the tag. */
export function jsonForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const origin = () => absolute(url());

/** The other names people know the app by, in the page's language first. */
function names(locale: Locale): { name: string; alternateName: string[] } {
  const t = dict(locale);
  const all = [t.brand.name, t.brand.arabic, dicts.en.brand.name];
  const [name, ...rest] = [...new Set(all)];
  return { name: name!, alternateName: rest };
}

export type JsonLdInput = {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
  release: Release;
  /** Absolute URLs of screenshots of the app. */
  screenshots?: string[];
  /** Adds the FAQ as FAQPage (home page only). */
  faq?: boolean;
};

/** One @graph per page: the site, the page, the app and (on home) the FAQ. */
export function jsonLd({ locale, page, title, description, release, screenshots = [], faq = false }: JsonLdInput) {
  const t = dict(locale);
  const pageId = absolute(pageUrl(locale, page));
  const site = origin();
  const author = { '@type': 'Person', '@id': `${site}#author`, ...AUTHOR, sameAs: [AUTHOR.url] };
  const app = {
    '@type': 'SoftwareApplication',
    '@id': `${site}#app`,
    ...names(locale),
    description: t.meta.description,
    url: absolute(pageUrl(locale, 'home')),
    applicationCategory: 'MultimediaApplication',
    operatingSystem: OPERATING_SYSTEMS,
    softwareVersion: release.version,
    datePublished: release.publishedAt,
    releaseNotes: release.pageUrl,
    downloadUrl: absolute(pageUrl(locale, page === 'tv' ? 'tv' : 'home', page === 'tv' ? '' : 'download')),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
    inLanguage: [...LOCALES],
    countriesSupported: 'IQ',
    image: absolute(url(`og-${locale}.png`)),
    ...(screenshots.length ? { screenshot: screenshots } : {}),
    author: { '@id': author['@id'] },
    sameAs: [REPO_URL],
  };
  const webPage = {
    '@type': faq ? ['WebPage', 'FAQPage'] : 'WebPage',
    '@id': pageId,
    url: pageId,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': `${site}#website` },
    about: { '@id': app['@id'] },
    primaryImageOfPage: absolute(url(`og-${locale}.png`)),
    ...(faq
      ? {
          mainEntity: t.faq.items.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: plain(fill(item.a, { issues: ISSUES_URL })) },
          })),
        }
      : {}),
  };
  const website = {
    '@type': 'WebSite',
    '@id': `${site}#website`,
    url: site,
    ...names(locale),
    inLanguage: [...LOCALES],
    publisher: { '@id': author['@id'] },
  };
  return { '@context': 'https://schema.org', '@graph': [website, webPage, app, author] };
}

export function robotsTxt(): string {
  return ['User-agent: *', 'Allow: /', '', `Sitemap: ${absolute(url('sitemap-index.xml'))}`, ''].join('\n');
}

/**
 * /llms.txt (llmstxt.org): a plain summary for AI assistants and their
 * crawlers, in English then Arabic, with the current release's files.
 */
export function llmsTxt(release: Release): string {
  const en = dicts.en;
  const ar = dicts.ar;
  const home = (l: Locale, hash = '') => absolute(pageUrl(l, 'home', hash));
  const devices: { name: string; note: string; targets: string[] }[] = [
    { ...en.download.devices.phone, targets: ['android-arm64-v8a', 'android-armeabi-v7a', 'android-x86_64'] },
    { ...en.download.devices.tv, targets: ['android-armeabi-v7a', 'android-arm64-v8a'] },
    { ...en.download.devices.windows, targets: ['windows-x64'] },
    { ...en.download.devices.linux, targets: ['linux-x64'] },
  ];
  const file = (target: string) => {
    const f = release.files[target as (typeof TARGETS)[number]];
    return f ? `[${f.name}](${f.url}) (${formatSize(f.bytes, 'en')})` : null;
  };
  const qa = (l: Locale) =>
    dicts[l].faq.items.map((i) => `### ${i.q}\n\n${plain(fill(i.a, { issues: ISSUES_URL }))}\n`).join('\n');
  const features = (l: Locale) => dicts[l].features.items.map((i) => `- **${i.title}:** ${i.body}`).join('\n');

  return `# Cinemakom (سينماكم)

> ${en.meta.description} ${en.footer.disclaimer}

Cinemakom is an independent app for Cinemana, Shabakaty's streaming library of movies and series. It is free, needs no account, has no ads and no tracking, and is in Arabic and English. It is open source (MIT licence) on GitHub. There is no iPhone, iPad, Mac or Apple TV version.

- Latest version: ${release.version}, released ${formatDate(release.publishedAt, 'en')}
- Works only on an Earthlink internet connection in Iraq (because Cinemana is only reachable there). Downloaded titles play offline anywhere.
- Website: ${home('en')} (English), ${home('ar')} (Arabic)
- On a TV, type: ${tvAddress()}

## Download

- [Download page (English)](${home('en', 'download')}): pick the device, then the file, with install steps
- [صفحة التحميل (Arabic)](${home('ar', 'download')})
- [TV download page](${absolute(pageUrl('en', 'tv'))}): for Android TV, Google TV and TV boxes
- [All versions on GitHub](${release.allReleasesUrl})

${devices
  .map((d) => `### ${d.name}: ${d.note}\n\n${d.targets.map(file).filter(Boolean).map((f) => `- ${f}`).join('\n') || `- ${en.download.notYet}`}`)
  .join('\n\n')}

## Features

${features('en')}

## Questions

${qa('en')}
## بالعربية

> ${ar.meta.description} ${ar.footer.disclaimer}

- آخر إصدار: ${release.version}، ${formatDate(release.publishedAt, 'ar')}
- الموقع: ${home('ar')}
- على التلفاز اكتب: ${tvAddress()}

### المزايا

${features('ar')}

### أسئلة

${qa('ar').replace(/^### /gm, '#### ')}
## Optional

- [Source code](${REPO_URL})
- [Report a problem](${ISSUES_URL})
`;
}
