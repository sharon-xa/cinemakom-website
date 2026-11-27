# AGENTS.md

Guidance for AI coding agents (Claude Code, Codex, etc.) working in this repository.

## What this is
The website of **Cinemakom** (سينماكم), a free, unofficial Flutter app for Cinemana that works only on Earthlink in Iraq. The site explains the app and gives easy downloads from the app's GitHub Releases (`sharon-xa/cinemakom`). Static **Astro** + **Tailwind CSS v4**, hosted as a **Render** static site at `https://cinemakom.sharon-xa.com/`. The full brief is `docs/GUIDE.md` (the build guide this repo started from): read it before larger changes.

The app's source is at `~/Projects/personal/cinemakom`. Read it for assets and facts (fonts, `branding/`, `docs/DESIGN.md`, `.github/workflows/release.yml`). **Never modify it.**

## Commands
```bash
npm install
npm run dev        # local dev server
npm run check      # astro check (types)
npm test           # vitest
npm run lint:rtl   # fails on physical left/right classes
npm run build      # static site in dist/ (fetches the latest release; GITHUB_TOKEN raises the rate limit)
npm run budgets    # CSS ≤ 20 KB, JS ≤ 2.5 KB per page (after build)
npm run preview    # serve dist/
scripts/fonts.sh   # rebuild the WOFF2 subsets from fonts-src/
scripts/placeholders.sh  # rebuild the screenshots' loading previews
```
All of check, test, lint:rtl, build and budgets must pass before you finish.

## Rules
- **Release data comes from the GitHub API at build time** (`src/lib/release.ts`). Never hardcode a version, file name, size or link. Match assets by suffix. In CI a failed fetch or a missing Android file fails the build.
- **No device auto-detection.** The visitor picks the device; never reorder, preselect by user agent, or hide files.
- **The download picker works without JavaScript** (radio inputs + `:has()`, all panels shown when `:has()` is unsupported). The only client JS is the inline release refresh and the Linux commands' copy buttons (≤ 2.5 KB together), and the site must be fully correct without it.
- **Design:** the app's Marquee system (`docs/GUIDE.md` §8, from the app's `docs/DESIGN.md`). Only the `@theme` tokens: no Tailwind default colours, no hardcoded colours, fonts or radii in markup. One dark theme. No shadows, blur or decorative gradients. `bulb` is scarce. Nothing loops; respect `prefers-reduced-motion`.
- **Two languages:** Arabic at `/` (RTL), English at `/en/`. Every string in `src/i18n/ar.ts` and `src/i18n/en.ts` (same keys). Logical properties only (`ms/me/ps/pe/start/end`); never left/right. No letter-spacing or uppercase on Arabic. Western digits everywhere. Mixed-direction snippets in `<bdi>`.
- **Links:** every internal URL through the `url()` helper (`import.meta.env.BASE_URL`).
- **Performance budgets:** home first view ≤ 350 KB compressed, CSS ≤ 20 KB, JS ≤ 2.5 KB, CLS 0, Lighthouse mobile ≥ 95 / 100 / 100 / 100. Self-hosted subset WOFF2 fonts; images through `astro:assets`.
- **The logo** is the app's SVGs from `branding/`, inlined. Never redraw or alter it.
- **Screenshots:** after adding or changing one in `src/assets/screens/`, run `scripts/placeholders.sh` (its tiny preview shows while the real image loads; a test fails if one is missing). Give every screenshot `<img>` `style={placeholder(name)}` and the `lqip` class.
- **Phones first:** most visitors are on Android phones. Check every change at 320, 360 and 412 px in both languages (`scripts/phone-audit.mjs`: no sideways scroll, tap targets ≥ 44 px, text ≥ 13 px). The site must work in Chrome 111+ (Android 7 stops at Chrome 119): no `:dir()` (use `[dir='rtl']`), write `-webkit-mask`/`-webkit-mask-composite` before `mask`, and treat `text-wrap` and similar as extras.
- **Search and AI assistants:** every indexed page has its own title and description per language (search terms first: Cinemana / سينمانا, Android TV, Windows…), canonical, `hreflang`, Open Graph and JSON-LD from `src/lib/seo.ts`; the home page adds the FAQ. `/robots.txt` allows all crawlers, AI ones included; `/llms.txt` summarises the site in both languages from the dictionaries and release. Structured data never has ratings or reviews and never names Cinemana, Shabakaty or Earthlink as the brand or publisher. Real text in the HTML (no text in images, no content that needs JS).
- Keep `/tv/` and `/en/tv/` working forever: people type that address on their TVs.
- Run `prettier`/formatters only on files you changed.

## Don'ts
- Never say or imply the site or app is official, or affiliated with Earthlink, Shabakaty or Cinemana. No logos or branding of theirs.
- No Apple downloads or promises (iOS, macOS, tvOS are not supported).
- No ratings, scores, likes or "top rated" anything (the app has none).
- No analytics, trackers, cookies, cookie banners, font CDNs or third-party embeds. The only third-party request at runtime is the optional GitHub API refresh.
- Never call Shabakaty or Cinemana hosts from the site.
- Don't host release files in this repo.
- Don't commit tokens or secrets.
- Don't push, publish or change repo settings unless the owner asks.
- **Git:** commit directly on `main`; no branches unless asked.

## Status
- [x] W0 Project
- [x] W1 Release data
- [x] W2 Layout, fonts, i18n
- [x] W3 Home page (owner reviewed)
- [x] W4 Download flow + TV page
- [x] W5 Runtime refresh + deploy workflow
- [x] W6 Polish and budgets
