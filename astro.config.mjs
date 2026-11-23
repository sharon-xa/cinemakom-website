// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// The site lives at https://cinemakom.sharon-xa.com/ (a Render static site).
// Every internal link goes through url() in src/lib/url.ts, so another domain
// or a base path is a change to `site` (and `base`) here and nothing else.
export default defineConfig({
  site: 'https://cinemakom.sharon-xa.com',
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
    // One small stylesheet: inline it so the first paint needs no extra request.
    inlineStylesheets: 'always',
  },
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'ar', locales: { ar: 'ar-IQ', en: 'en' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
