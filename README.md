<p align="center">
  <img src="src/assets/brand/app-icon.svg" width="96" height="96" alt="">
</p>

<h1 align="center">Cinemakom · سينماكم</h1>

<p align="center">
  <strong>Cinemana, from a better seat.</strong><br>
  The website of Cinemakom, a free, unofficial app for Cinemana on Android, Android TV, Windows and Linux.
</p>

<p align="center">
  <a href="https://sharon-xa.github.io/cinemakom-website/"><strong>العربية</strong></a>
  &nbsp;·&nbsp;
  <a href="https://sharon-xa.github.io/cinemakom-website/en/"><strong>English</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/sharon-xa/cinemakom">The app</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/sharon-xa/cinemakom/releases">All releases</a>
</p>

<p align="center"><a href="#العربية">العربية</a> · <a href="#english">English</a> · <a href="#for-developers">For developers</a></p>

---

<div dir="rtl" lang="ar">

## العربية

<img src="public/og-ar.png" alt="سينماكم: سينمانا من مقعد أفضل" width="100%">

**سينماكم** تطبيق مجاني وغير رسمي لمشاهدة أفلام ومسلسلات سينمانا على الهاتف والتلفاز والحاسوب. هذا المستودع هو موقع التطبيق، ومنه تحمّل أحدث إصدار.

### حمّل التطبيق

افتح **[sharon-xa.github.io/cinemakom-website](https://sharon-xa.github.io/cinemakom-website/)** واختر الجهاز الذي ستشاهد عليه. يعرض الموقع دائماً أحدث إصدار، مع خطوات التثبيت لكل جهاز.

على التلفاز، اكتب هذا العنوان في تطبيق Downloader أو في المتصفح:

<p dir="ltr" align="right"><code>sharon-xa.github.io/cinemakom-website/tv</code></p>

| الجهاز | الملف |
| --- | --- |
| هاتف أو جهاز لوحي أندرويد (7.0 أو أحدث) | ملف APK للهواتف |
| Android TV أو Google TV أو TV Box | ملف التلفاز (الخيار 1، والخيار 2 إن ظهرت رسالة «لم يتم تثبيت التطبيق») |
| ويندوز 10 أو 11، ‏64 بت | ملف zip |
| لينكس، ‏64 بت | ملف tar.gz (يحتاج libmpv) |

### قبل أن تحمّل

- **يعمل عبر إيرثلنك في العراق فقط.** سينمانا نفسها لا تُفتح إلا عبر إيرثلنك، وكذلك سينماكم. أما ما تحمّله فيعمل دون إنترنت وفي أي مكان.
- **مجاني وبلا حساب.** لا إعلانات ولا اشتراك ولا تتبّع. المفضلة وسجل المشاهدة يبقيان على جهازك.
- **لا يوجد إصدار لآيفون أو ماك.**

### مشكلة أو اقتراح؟

افتح [بلاغاً في مستودع التطبيق](https://github.com/sharon-xa/cinemakom/issues)، واذكر جهازك ورقم الإصدار.

> سينماكم مشروع مستقل، ليس من صنع إيرثلنك أو شبكتي أو سينمانا ولا يتبع لأيٍّ منها.

</div>

---

## English

<img src="public/og-en.png" alt="Cinemakom: Cinemana, from a better seat" width="100%">

**Cinemakom** is a free, unofficial app for watching Cinemana's movies and series on your phone, TV and computer. This repository is its website, where you download the latest version.

### Download

Open **[sharon-xa.github.io/cinemakom-website/en](https://sharon-xa.github.io/cinemakom-website/en/)** and pick the device you'll watch on. The site always offers the newest release, with install steps for each device.

On a TV, type this address into the Downloader app or the TV's browser:

```
sharon-xa.github.io/cinemakom-website/tv
```

| Device | File |
| --- | --- |
| Android phone or tablet (Android 7.0 or newer) | The phone APK |
| Android TV, Google TV or TV box | The TV file (Option 1; Option 2 if it says *App not installed*) |
| Windows 10 or 11, 64-bit | A zip |
| Linux, 64-bit | A tar.gz (needs libmpv) |

### Before you download

- **It works only on Earthlink in Iraq.** Cinemana itself only opens on Earthlink's network, so Cinemakom does too. Titles you download play offline, anywhere.
- **Free, with no account.** No ads, no subscription, no tracking. Favorites and history stay on your device.
- **There's no iPhone or Mac version.**

### Found a problem?

[Open an issue in the app's repository](https://github.com/sharon-xa/cinemakom/issues) and say which device and version you use.

> Cinemakom is an independent project. It isn't made by, or affiliated with, Earthlink, Shabakaty or Cinemana.

---

## For developers

A static site built with [Astro](https://astro.build) and [Tailwind CSS v4](https://tailwindcss.com), hosted on GitHub Pages. Arabic is the default language at `/` (right to left); English is at `/en/`. The app itself lives in [sharon-xa/cinemakom](https://github.com/sharon-xa/cinemakom).

### How it stays up to date

The site never hardcodes a version, file name, size or link.

1. **At build time**, `src/lib/release.ts` reads the latest release from the GitHub API, matches each file by the end of its name (`-android-arm64-v8a.apk`, `-windows-x64.zip`…) and reads `SHA256SUMS.txt` for the checksums. It also writes `/version.json`.
2. **The app's release workflow** pings this repo (`repository_dispatch`) when a release is published, and the site rebuilds within minutes. A check every 6 hours catches a missed ping by comparing the latest tag with the live `/version.json`.
3. **In the browser**, a small inline script (under 2 KB) asks GitHub for the latest release and updates the links if the page is out of date. The page is fully correct without it.

In CI, a failed fetch or a release with no Android files **fails the build**, so a broken page is never deployed. Locally, the build falls back to a saved copy of v1.0.0 (`src/data/release.sample.json`) and says so on the page.

### Principles

- **No device auto-detection.** Visitors pick their device; nothing is reordered, preselected or hidden.
- **Works without JavaScript.** The device picker is radio inputs and `:has()`; browsers without `:has()` see every panel.
- **Private and light.** No analytics, cookies, font CDNs or third-party embeds. Fonts are self-hosted WOFF2 subsets. Budgets: home page ≤ 350 KB compressed, CSS ≤ 20 KB, JS ≤ 2 KB, CLS 0.
- **The app's Marquee design**: one dark theme with a single gold accent, the app's own logo SVGs and typefaces.
- **Right to left done properly.** Logical properties only (`ms`, `pe`, `start`, `end`), enforced by `npm run lint:rtl`. No uppercase or letter-spacing on Arabic. Western digits everywhere.

### Develop

Needs Node 26 (`.nvmrc`).

```bash
npm install
npm run dev        # dev server at http://localhost:4321/cinemakom-website/
npm run check      # type check (astro check)
npm test           # unit tests (vitest)
npm run lint:rtl   # fails on physical left/right classes and properties
npm run build      # static site in dist/
npm run preview    # serve dist/
```

`npm run build` calls the GitHub API. Set `GITHUB_TOKEN` to raise the rate limit, or `RELEASE_SAMPLE=1` to use the saved release and work offline.

Check, test, `lint:rtl` and build must all pass before a change is merged.

Two scripts rebuild the generated assets, which are committed:

```bash
scripts/fonts.sh   # WOFF2 subsets in src/assets/fonts/ from fonts-src/ (Python; sets up fontTools itself)
scripts/og.sh      # link-preview images public/og-ar.png and public/og-en.png (needs rsvg-convert)
```

### Layout

```
src/
  pages/        index.astro (Arabic), en/, tv/, version.json.ts
  views/        page bodies shared by both languages
  components/   Hero, Ticket, Programme, Screens, Download, Faq, Header, Footer…
  i18n/         ar.ts and en.ts: every string on the site, with the same keys
  lib/          release.ts (release data), targets.ts, format.ts, url.ts
  styles/       global.css (Marquee @theme tokens), fonts.css
  assets/       brand SVGs, font subsets, app screenshots
fonts-src/      source TTFs and their licences
test/           vitest tests for release parsing and the dictionaries
docs/GUIDE.md   the full build brief
AGENTS.md       rules for contributors and AI coding agents
```

To change any wording, edit `src/i18n/en.ts` and `src/i18n/ar.ts` together; the tests fail if their keys differ.

### Contributing

Read [`AGENTS.md`](AGENTS.md) first: it lists the rules the site keeps (and the things it never does). Bug reports about the app belong in the [app's issues](https://github.com/sharon-xa/cinemakom/issues).

### Credits

Typefaces: [Big Shoulders Display](https://github.com/xotypeco/big_shoulders), [Reem Kufi](https://github.com/aliftype/reem-kufi), [IBM Plex Sans and IBM Plex Sans Arabic](https://github.com/IBM/plex), all under the [SIL Open Font License](public/licenses/).

### Licence

The site's code is under the [MIT License](LICENSE). The typefaces keep their own licence (OFL, above). The Cinemakom logo and the app screenshots come from the [app's repository](https://github.com/sharon-xa/cinemakom).
