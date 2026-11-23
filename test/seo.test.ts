import { describe, expect, it } from 'vitest';
import { jsonForScript, jsonLd, llmsTxt, plain, robotsTxt } from '../src/lib/seo';
import { sampleRelease } from '../src/lib/release';
import { dicts, LOCALES } from '../src/i18n';

const release = sampleRelease();

describe('structured data', () => {
  for (const locale of LOCALES) {
    const t = dicts[locale];
    const data = jsonLd({ locale, page: 'home', title: t.meta.title, description: t.meta.description, release, faq: true });
    const text = JSON.stringify(data);
    const graph = data['@graph'] as Record<string, unknown>[];
    const app = graph.find((n) => n['@type'] === 'SoftwareApplication')!;

    it(`${locale}: describes the app with the release version, free`, () => {
      expect(app.softwareVersion).toBe(release.version);
      expect(app.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' });
      expect(app.name).toBe(t.brand.name);
    });

    it(`${locale}: has the FAQ in the page language, as plain text`, () => {
      const page = graph.find((n) => Array.isArray(n['@type']))!;
      const qs = page.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      expect(qs.map((q) => q.name)).toEqual(t.faq.items.map((i) => i.q));
      for (const q of qs) expect(q.acceptedAnswer.text).not.toMatch(/<|\{issues\}/);
    });

    it(`${locale}: never has ratings, reviews or a brand claim`, () => {
      expect(text).not.toMatch(/aggregateRating|review|ratingValue|"brand"/i);
    });

    it(`${locale}: uses only the site's own URLs and GitHub`, () => {
      for (const u of text.match(/https?:\/\/[^"\s]+/g)!) {
        expect(u).toMatch(/^https:\/\/(cinemakom\.sharon-xa\.com\/|github\.com\/sharon-xa|schema\.org)/);
      }
    });
  }

  it('escapes "<" so text cannot close the script tag', () => {
    expect(jsonForScript({ a: '</script><b>' })).toBe('{"a":"\\u003c/script>\\u003cb>"}');
  });
});

describe('robots.txt and llms.txt', () => {
  it('robots.txt allows everything and points at the sitemap', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n\nSitemap: https://cinemakom.sharon-xa.com/sitemap-index.xml\n');
  });

  const llms = llmsTxt(release);
  it('llms.txt starts with the title and summary (llmstxt.org)', () => {
    expect(llms).toMatch(/^# Cinemakom \(سينماكم\)\n\n> /);
    expect(llms).toContain(dicts.en.footer.disclaimer);
    expect(llms).toContain(dicts.ar.footer.disclaimer);
  });

  it('llms.txt lists every file of the release with its link', () => {
    for (const f of Object.values(release.files)) expect(llms).toContain(`[${f!.name}](${f!.url})`);
    expect(llms).toContain(`Latest version: ${release.version}`);
  });

  it('llms.txt has both FAQs as plain text', () => {
    for (const l of LOCALES) for (const i of dicts[l].faq.items) expect(llms).toContain(i.q);
    expect(llms).not.toMatch(/<(em|a|strong|code)\b/);
  });

  it('plain() strips our markup', () => {
    expect(plain('Use <em>Option&nbsp;2</em> &amp; <a href="#x">go</a>.')).toBe('Use Option 2 & go.');
  });
});
