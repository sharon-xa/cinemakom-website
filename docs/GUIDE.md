# Cinemakom website: build guide

You are building the website for **Cinemakom**, a Flutter app. This guide is everything you need. The app's owner wrote the brief, and a session working in the app repo turned it into this guide. The decisions in §2 are made: don't ask about them again.

**Before anything else:**
1. Read this whole guide once.
2. Create `AGENTS.md` in the project root from **Appendix A** (copy it as written), and a `CLAUDE.md` that contains just the line `@AGENTS.md`.
3. Then work through the milestones in §11, in order. Tick them off in `AGENTS.md` → "Status" as you finish them.

The app's source is at `~/Projects/personal/cinemakom` (called **the app repo** below). You may **read** it for assets and facts. **Never modify it** (another session works there).

---

## 1. What the site is for

The owner's brief, in short:

1. **Say what Cinemakom is.** It is a free, unofficial replacement app (a frontend) for **Cinemana**, the streaming service by Shabakaty. Cinemana is only reachable on the **Earthlink** network in Iraq, so Cinemakom only works for people in Iraq whose internet provider is Earthlink. The site must make that clear *before* someone downloads.
2. **Let people download the app easily, without GitHub.** Most visitors will find GitHub's release page confusing. The site offers plain, big download buttons.
3. **Guide them to the right file. Don't auto-detect.** People often download on one device for another (an APK fetched on a phone, then installed on a TV that needs the 32-bit build). So the site asks *which device will run the app*, and explains each file in plain words. It never picks or hides a file based on the visitor's browser.
4. **Update itself.** When the owner publishes a GitHub release, the site shows the new version and links to its files with **no manual edit**. §5 is how.
5. **Look like the app.** Same colours, fonts, radii and motifs (the "Marquee" design, §8). The owner wants it **as beautiful as possible**, and **very fast and small**.

**Who visits:** people in Iraq, mostly on Android phones, often on slow or unstable connections, many with an Android TV or TV box. Many read Arabic first.

---

## 2. Decisions already made (don't re-ask)

| Topic | Decision |
|---|---|
| Stack | **Astro** (static output) + **Tailwind CSS v4**. No UI framework (no React/Vue/Svelte islands). Extra libraries only when they clearly pay for themselves |
| Repo | A **separate repo**: `sharon-xa/cinemakom-website` (the owner creates it; §10) |
| Hosting | **Render** static site, built by Render from `main`. Address: `https://cinemakom.sharon-xa.com/` (the owner's domain). *Changed by the owner on 2026-11-23; this guide first planned GitHub Pages at `sharon-xa.github.io/cinemakom-website/`* |
| Languages | **Arabic first** at `/`, **English** at `/en/`. Every page exists in both. A visible switch on every page. No automatic redirect by browser language |
| Download source | The app repo's **GitHub Releases** (`sharon-xa/cinemakom`). The site never hosts the files itself |
| Device choice | The visitor picks the device. No auto-detection, no reordering by user agent |
| Updates | Build-time release data + automatic redeploys + a tiny runtime refresh (§5) |
| Design | The app's Marquee system (§8). One theme, dark only |
| Git | Commit directly on `main`. No branches unless the owner asks. Don't push until the owner has created the repo; ask before the first push |

---

## 3. Facts about the app (checked 2026-11-23)

- **Repo:** `https://github.com/sharon-xa/cinemakom` (public). *Since 2026-11-23 it has an MIT `LICENSE`, so "open source" is accurate.*
- **Platforms:** Android phones and tablets, **Android TV / Google TV / TV boxes**, **Windows**, **Linux**. Apple platforms (iPhone, iPad, Mac, Apple TV) are **not supported**, by the owner's decision. Never offer or mention Apple downloads, except one FAQ line saying there's no iPhone/Mac version.
- **Release workflow:** pushing a tag `v*` builds everything and publishes a GitHub Release with these assets (`<tag>` is e.g. `v1.2.0`):

  | Asset | For |
  |---|---|
  | `cinemakom-<tag>-android-arm64-v8a.apk` | Android phones and tablets (64-bit, nearly every phone since ~2017) |
  | `cinemakom-<tag>-android-armeabi-v7a.apk` | Android TVs, TV boxes and older 32-bit phones. Runs on most 64-bit devices too |
  | `cinemakom-<tag>-android-x86_64.apk` | Chromebooks and Android emulators |
  | `cinemakom-<tag>-windows-x64-setup.exe` | *From v2.0.0.* The Windows installer (Inno Setup): per user, no admin rights, into `%LOCALAPPDATA%\Programs\Cinemakom`, Start menu entry (desktop shortcut if ticked), Installed apps entry. Installs over the last version, offering to close a running Cinemakom. English and Arabic screens. Uninstalling asks before removing the library and settings, never deletes downloaded videos |
  | `cinemakom-<tag>-windows-x64.zip` | 64-bit Windows, tested on Windows 11 (never write "Windows 10": nobody has tested it). Portable: extract, run `cinemakom.exe` |
  | `cinemakom-<tag>-linux-x64.AppImage` (+ `.zsync`) | *From v2.0.0.* 64-bit Linux from 2022 on (glibc 2.35+: Ubuntu 22.04+, Debian 12+, Fedora, Arch). Brings its own player (mpv/FFmpeg), nothing to install. `chmod +x` and run; static runtime (no libfuse2), needs FUSE itself, fallback `--appimage-extract-and-run`. Gear Lever, AppImageLauncher and AppImageUpdate update it via zsync |
  | `install.sh` | *From v2.0.0.* `curl -fsSL https://github.com/sharon-xa/cinemakom/releases/latest/download/install.sh \| bash`: per user, no sudo, checks the AppImage against `SHA256SUMS.txt` and unpacks it into `~/.local/lib/cinemakom` (no FUSE), adds the menu entry and a `cinemakom` command. Run again to update; `bash -s -- --uninstall` removes it (library and downloads stay). 404 while the latest release has no `install.sh` |
  | `cinemakom-<tag>-linux-x64-sources.tar` | *From v2.0.0.* Source of the bundled GPL libraries. Not a download for users: never show it |
  | `cinemakom-<tag>-linux-x64.tar.gz` | *v1.0.0 only.* Contains `cinemakom/` (the app) and `cinemakom/packaging/` (a `.desktop` file and icons); needs libmpv |
  | `SHA256SUMS.txt` | Checksums of all of the above |

  **The v2.0.0 switch.** v1.0.0 is still the latest release; v2.0.0 drops the tarball and adds the installer, the AppImage and `install.sh`. The site follows whichever release is latest: with v1.0.0 it shows the zip and tarball steps, and once a release has `-windows-x64-setup.exe`, `-linux-x64.AppImage` and `install.sh` it shows the new ones (the release's deploy hook rebuilds the site). **Once v2.0.0 is out, remove the tarball branch:** the `linux-x64-tar` target, its match in `release.ts`, the tarball panel in `Download.astro`, the `linuxDeps`/`linuxRun`/`linuxDesktop*`/`linuxUpdate`/`distros` strings, `sampleReleaseV2()`, and the libmpv note below. No Flatpak, Flathub, .deb, .rpm, AUR, Snap, winget, Microsoft Store or code signing is planned: never mention them as coming.

  The current release, **v1.0.0**, also carries old `ios-unsigned.ipa` and `macos.dmg` assets from before Apple was dropped. **Ignore every asset you don't recognise.** Match assets by their **suffix** (`-android-arm64-v8a.apk` etc.), never by the full name, because the tag is inside the name.
  Releases whose tag contains `-` (e.g. `v1.3.0-beta1`) are prereleases. GitHub's `releases/latest` endpoint already skips prereleases and drafts: use it, and show only that release.
- **Android:** needs **Android 7.0 or newer** (minSdk 24). The owner's test TV (a TCL Google TV) runs 32-bit Android, which is why TVs get `armeabi-v7a`.
- **Linux (v1.0.0's tarball only):** the app plays video through **libmpv**, which must be installed. *Checked on the distros' package sites, 2026-11-24:* Debian 12+, Ubuntu 24.04+ and Mint 22+ `sudo apt install libmpv2`; Debian 11, Ubuntu 22.04 and Mint 21 `sudo apt install libmpv1`; Fedora `sudo dnf install mpv-libs` (in Fedora's own repos now, no RPM Fusion needed); Arch `sudo pacman -S mpv`.
- **Windows and Linux builds are unsigned**, so Windows shows SmartScreen ("Windows protected your PC" → *More info* → *Run anyway*), for the installer and usually for the zip's `cinemakom.exe` too.
- **Linux GPU decoding:** say "uses the GPU to decode video where it can (tested on NVIDIA)". Intel and AMD (VA-API) haven't been tested on real hardware.
- **Upgrading from v1.0.0 (desktop):** the library moves by itself on first start (Linux checked; Windows not yet checked on a real machine, so say "should carry over" there). Linux tarball users delete `~/.local/opt/cinemakom`; `install.sh` writes the same `.desktop` and icon names, so the old menu entry is replaced. Windows zip users can delete the old folder.
- **Earthlink:** browsing and streaming need an Earthlink connection. **Downloaded titles play offline, anywhere.**
- **What the app does** (safe to claim):
  - Browse Cinemana's movies and series: a Home page with a hero carousel and rows, genres with sorting and language filters, series with seasons and episodes (long anime seasons split into blocks).
  - Search by title **or by actor/director name**, with recent searches.
  - Player: quality up to **4K**, Arabic/English subtitles (styled anime subtitles on desktop), speed, fit modes, **Skip intro**, next episode, resume where you stopped, seek-bar previews.
  - **Downloads** for offline viewing: pick the quality (sizes shown), whole seasons, pause and resume, built to survive slow and unstable connections, subtitles saved too.
  - **Continue watching** and **Favorites**, stored on the device.
  - A separate **TV interface** driven entirely by the remote.
  - **English and Arabic** (full right-to-left layout), chosen on first launch.
  - **No ads, no account, no tracking.** It never calls Shabakaty's analytics or ad hosts. Favorites and history never leave the device.
- **What it does not have (don't claim it):** no ratings or scores of any kind, no parental controls, no sign-in, no sync between devices, no iPhone/Mac app, no Play Store listing.

---

## 4. Tech stack and budgets

- **Astro, latest stable**, `output: 'static'`. Create with `npm create astro@latest` (minimal template, TypeScript strict). Node is v26 on this machine, npm 12. Pin the Node version in `.nvmrc` so CI matches.
- **Tailwind v4** through its Vite plugin (`npx astro add tailwind`). Configuration lives in CSS (`@theme`), not in a JS config file.
- **Zero client frameworks.** The only client JavaScript is the release refresh script (§5.4), under **2 KB minified**, inlined. The download picker works **without JavaScript** (§6.3).
- **Images:** `astro:assets` (`<Picture>`) to produce AVIF and WebP at a few widths, with `width`/`height` set so nothing shifts. Only the hero image loads eagerly (`fetchpriority="high"`); everything else is `loading="lazy"`.
- **Fonts:** self-hosted WOFF2, subset (§8.2). **No Google Fonts or any font CDN.**
- **Allowed small dev tools:** `vitest` (tests), `@astrojs/check` + `typescript` (type checks), `qrcode` (build-time SVG QR codes, §6.4), `@astrojs/sitemap`. Ask before adding anything else.

**Budgets** (check them in M6, fail the work if they're missed):

| What | Budget |
|---|---|
| Home page, first view on a phone (HTML + CSS + JS + fonts + images), compressed | **≤ 350 KB** |
| CSS | ≤ 20 KB compressed |
| JavaScript | ≤ 2 KB, inline |
| Lighthouse (mobile, both languages) | Performance ≥ 95, Accessibility 100, Best Practices 100, SEO 100 |
| Layout shift | 0 |

---

## 5. Automatic updates (the important part)

**Goal:** the owner publishes a release in the app repo, and within minutes the site shows the new version, its date, file sizes and links. Nothing to edit, nothing to click.

### 5.1 Build-time release data

`src/lib/release.ts`:
- `fetchLatestRelease()`: `GET https://api.github.com/repos/sharon-xa/cinemakom/releases/latest` with `Accept: application/vnd.github+json` and, when `GITHUB_TOKEN` is set (it is in CI), `Authorization: Bearer $GITHUB_TOKEN` (5,000 requests/hour instead of 60).
- `pickAssets(json)`: a **pure function** that turns the API answer into:
  ```ts
  type Release = {
    tag: string;            // "v1.0.0"
    version: string;        // "1.0.0"
    publishedAt: string;    // ISO date
    pageUrl: string;        // html_url of the release
    allReleasesUrl: string; // https://github.com/sharon-xa/cinemakom/releases
    files: Partial<Record<Target, { name: string; url: string; bytes: number; sha256?: string }>>;
  };
  type Target = 'android-arm64-v8a' | 'android-armeabi-v7a' | 'android-x86_64' | 'windows-x64-setup' | 'windows-x64' | 'linux-x64' | 'linux-x64-tar';
  ```
  Match each target by suffix (`-android-arm64-v8a.apk`, `-android-armeabi-v7a.apk`, `-android-x86_64.apk`, `-windows-x64-setup.exe`, `-windows-x64.zip`, `-linux-x64.AppImage`, and v1.0.0's `-linux-x64.tar.gz` as `linux-x64-tar`, build only). `installScript` is true when the release has an asset named exactly `install.sh`. Use `browser_download_url` as the link. Skip anything else.
- Also download `SHA256SUMS.txt` (when present) and fill in `sha256` per file.
- **Failure rules:**
  - **In CI** (`process.env.CI`): if the API call fails, or the release lacks any **Android** file, the build **fails**. Render then keeps serving the last good deploy. (Render sets `CI=true` during builds.) Never deploy a site with missing or broken download links.
  - A missing Windows or Linux file is not fatal: that device card says "Not in this release yet" and links to the releases page.
  - **Locally, offline:** fall back to `src/data/release.sample.json` (a real API answer saved once; the v1.0.0 one is perfect because it includes the iOS/macOS assets to ignore), and show a dev-only "sample release data" note.
- Load it **once per build** and share it with every page (a module-level promise is enough).
- Also emit **`/version.json`** (`{ "tag": "v1.0.0", "builtAt": "…" }`) as a static endpoint. The scheduled check in §5.2 reads it.

Show the version, date (formatted per locale, **Western digits 0–9 in Arabic too**) and size of each file ("v1.0.0 · 20 Nov 2026 · 39 MB").

### 5.2 Redeploys

Render builds and serves the site. `render.yaml` at the repo root (a Render Blueprint) describes the static site: `runtime: static`, build command `npm ci && npm run check && npm test && npm run build`, `staticPublishPath: dist`, response headers (long caching for the hashed `/_astro/*` files, basic security headers) and redirects (`/tv` → `/tv/`, `/en/tv` → `/en/tv/`). Node comes from `.nvmrc`. Pull-request previews off. What starts a build:

| Trigger | Why |
|---|---|
| Push to `main` | Site changes (Render's auto-deploy) |
| The Render **deploy hook** | **The main path:** the app's release workflow requests the site's secret deploy-hook URL the moment a release is published (owner step, Appendix B). No token to renew |
| `schedule` every 6 hours | Safety net if the ping was missed: `.github/workflows/release-check.yml` in the site repo compares `releases/latest`'s `tag_name` with the live `/version.json` and requests the deploy hook only when they differ, so it costs seconds. *GitHub turns off scheduled workflows after 60 days without repository activity, which is why it's only a net* |
| Manual | Render's "Manual Deploy" button, or the check workflow's "Run workflow" button |

Render's build machines share IP addresses, so GitHub's anonymous limit (60 API requests per hour per IP) can run out: the Render service gets a `GITHUB_TOKEN` environment variable (owner step) so the release fetch never hits it.

### 5.3 Why links point at exact files

Release assets have the version in their names, so a link like `releases/latest/download/<name>` can't stay fixed. The build writes the exact `browser_download_url` of each file instead. That's also better for users: they see which version they're getting.

### 5.4 Runtime refresh (small safety net)

An inline script (≤ 2 KB) on download sections only:
1. Fetches `https://api.github.com/repos/sharon-xa/cinemakom/releases/latest` (CORS is allowed), with a 4-second timeout, at most once per browser session (cache the answer in `sessionStorage`).
2. If `tag_name` differs from the baked tag, updates every element marked `data-target="android-arm64-v8a"` etc. (its `href`, size and filename) and every `data-version` text, using the same suffix matching as `pickAssets`. Put that matching in one small shared module and test it.
3. **Any failure does nothing.** Iraqi ISPs put many users behind one shared IP, so GitHub's limit of 60 anonymous requests per hour per IP will often run out. The baked links must always be complete and correct without this script.

### 5.5 Last resort

Every download area has a small "All versions on GitHub" link to `https://github.com/sharon-xa/cinemakom/releases`.

---

## 6. The download flow

### 6.1 Rules
- The visitor chooses **the device that will run Cinemakom**. Say plainly at the top: "You can download here and install it on another device."
- Each file is explained in everyday words. Technical names (`arm64-v8a`) appear only in small type, for people who know.
- Every button says what it gives: **"Download for Android phones · 39 MB"**.
- A button is a plain `<a href>` to the file. No interstitials, no countdowns, no "thank you" page.

### 6.2 Devices (step 1)

Four big option cards, in this order:

| Card | Recommended file | Also offered (under "Other versions") |
|---|---|---|
| **Android phone or tablet** | `arm64-v8a` | `armeabi-v7a` ("For older phones. Try it if the main file says *App not installed*"), `x86_64` ("Chromebooks and emulators") |
| **Android TV, Google TV or TV box** | **Option 1:** `armeabi-v7a` ("Works on nearly every TV. Many TVs run 32-bit Android, even with a 64-bit chip") | **Option 2**, shown right under Option 1 (not hidden in "Other versions"): `arm64-v8a` ("Use this only if Option 1 says *App not installed*. Some newer TVs run 64-bit apps only") |
| **Windows computer** | `windows-x64-setup.exe` (v1.0.0: `windows-x64.zip`) | The portable `windows-x64.zip` |
| **Linux computer** | The `install.sh` command (v1.0.0: `linux-x64.tar.gz`) | The `linux-x64.AppImage` |

**TV options are labelled.** Both TV files are always visible as "Option 1" and "Option 2", each saying when to use it, so nobody has to know what 32-bit means. The install steps end with: "If you see *App not installed*, download Option 2 instead." (The owner chose this over a bigger universal APK, 2026-11-23.)

No Apple card. Selected card: 2 px `bulb` border and a filled radio dot, like the app's first-launch language cards.

### 6.3 Without JavaScript

Build the picker from **radio inputs** (one `name`, real `<label>`s) and reveal the matching panel with CSS `:has()`:
- By default **all panels are visible** (stacked). Inside `@supports selector(:has(*))`, hide the panels whose radio isn't checked, and check the Android phone radio by default.
- That way old TV browsers without `:has()` still see every option. Keyboard and screen readers get a normal radio group.
- Each card also has an `id` (`#android`, `#tv`, `#windows`, `#linux`) so links can open the right one (`:target` or a matching radio).

### 6.4 Each panel (step 2)

- The **primary button** (`bulb` pill) for the recommended file, with version and size.
- "Other versions" as a `<details>` with the alternatives, each with its one-line reason.
- "How to install" as a `<details>` with short numbered steps:
  - **Android:** open the downloaded file; if asked, allow your browser to "Install unknown apps"; if Play Protect warns, choose *Install anyway* (it warns about any app that isn't from the Play Store). **Updating:** download the new version and install it over the old one; favorites, history and downloads stay. *One exception:* anyone who has **v1.0.0** must uninstall it once before installing a newer version (v1.0.0 was signed with a temporary key; every release after it uses the permanent one). Say this in the update steps and in the FAQ while v1.0.0 users may still be around.
  - **Android TV:** the panel shows the short TV address in large type (`cinemakom.sharon-xa.com/tv`) and three ways in:
    1. *Downloader* app (by AFTVnews, free on the TV's Play Store): type the address, then pick the TV file on the page that opens.
    2. A USB stick: download the file on a computer, copy it over, open it with the TV's file manager.
    3. A file-sending app such as *Send Files to TV* on the phone and the TV.
    Then: allow the app that opens it to install unknown apps.
  - **Windows (from v2.0.0):** open the installer, SmartScreen (*More info* → *Run anyway*), follow the setup. "Portable version (zip)", "Updating" and "Uninstalling" as their own `<details>`. The app repo's README ("Install") and `docs/PACKAGING.md` are the source of truth.
  - **Windows (v1.0.0):** unzip the whole folder somewhere permanent (keep its files together), open `cinemakom.exe`. SmartScreen: *More info* → *Run anyway*.
  - **Linux (from v2.0.0):** the `install.sh` one-liner first, then the requirements line, then "Or use the AppImage" (`chmod +x`, run; the FUSE fallback; AppImage managers). "Updating" (run the command again; moving from the tarball) and "Uninstalling" (`--uninstall`).
  - **Linux (v1.0.0):** install libmpv (the three commands from §3), extract, run `./cinemakom/cinemakom`. Optional: install the `.desktop` file and icons from `cinemakom/packaging/`. **Read `linux/packaging/` in the app repo and write exact commands that match it**; don't guess paths.
- "Check the file" as a small `<details>`: the SHA-256 for the cautious.
- On wide screens only, the phone panel shows a **QR code** (generated at build time as inline SVG with `qrcode`) pointing to the site's `#android` section, so someone on a computer can scan it with their phone.

### 6.5 The TV page (`/tv/` and `/en/tv/`)

A page made for TV browsers (the Downloader app's browser, the TV's own browser), 960 × 540 CSS px at 2×:
- The logo, one sentence, and **one huge button**: "Download for TV" (`armeabi-v7a`), with the version and size. Below it, a second, smaller but still remote-sized button: **"Option 2: if Option 1 says *App not installed*"** (`arm64-v8a`), with one line: "Some newer TVs run 64-bit apps only."
- Big text (body ≥ 24 px), big targets (≥ 64 px tall), an obvious focus ring (3 px `bulb`), everything reachable with the arrow keys in a straight line. No hover-only things, no `<details>` that hide the main action.
- The short address is what the owner tells people to type, so keep `/tv/` working forever.

---

## 7. Pages and content

### 7.1 Site map
- `/` (Arabic) and `/en/`: the one-page site (sections below).
- `/tv/` and `/en/tv/`: the TV page (§6.5).
- `/404.html`: a friendly "this screen is dark" page in both languages, with links home.
- `/version.json` (§5.1). `sitemap-index.xml`, `robots.txt`.
- A credits section or page for the fonts' SIL OFL licences.

### 7.2 Home page sections (in order)
1. **Header:** the logo lockup, links (Download, Questions), the language switch ("English" on Arabic pages, "العربية" on English ones), a GitHub link (icon + label).
2. **Hero** (§8.5): eyebrow, headline, one paragraph, the primary **Download** button (jumps to §6), the current version and date in a caption, and the Earthlink notice right under the button (it's the most important fact on the page).
3. **"Is this for you?"**: the admission-ticket block (§8.5): you need an Earthlink connection in Iraq; downloaded titles play anywhere; free, no account.
4. **Features:** the "programme" (§8.5), 5–7 items from §3.
5. **Screenshots:** a horizontal strip (CSS scroll-snap) of phone and desktop screens, matching the page's language (Arabic screens on Arabic pages where they exist). Plus the TV if TV screenshots are available (§9).
6. **Download** (§6).
7. **Questions:** 6–9 `<details>` items: Why only Earthlink? Is it official? (No: §7.3.) Is it free? Do I need an account? Which Android file do I need? Does it work outside Iraq or on another provider? (Only downloaded titles.) Is there an iPhone or Mac version? (No.) How do I update? Where do I report a problem? (GitHub issues: `https://github.com/sharon-xa/cinemakom/issues`.)
8. **Footer:** the mark, the disclaimer (§7.3), GitHub, language switch, font credits, the version the site was built with.

### 7.3 Copy

Write it short, warm and concrete. Every string lives in one dictionary per language (`src/i18n/ar.ts`, `src/i18n/en.ts`) with the same keys; pages never hold literal text. Drafts for the key lines (improve them, keep their meaning; **the owner proofreads the Arabic before launch**):

| Key | English | Arabic |
|---|---|---|
| eyebrow | NOW SHOWING | يُعرض الآن |
| headline | Cinemana, from a better seat. | سينمانا، بس أحلى. *(the owner chose this Iraqi line on 2026-11-23)* |
| lede | Cinemakom is a free, unofficial app for watching Cinemana's movies and series on your phone, TV and computer. | سينماكم تطبيق مجاني وغير رسمي لمشاهدة أفلام ومسلسلات سينمانا على هاتفك وتلفازك وحاسوبك. |
| earthlink | Works only on an Earthlink connection in Iraq. Cinemana itself is only reachable through Earthlink, so Cinemakom is too. Titles you download play anywhere. | يعمل فقط عبر إنترنت إيرثلنك في العراق، لأن سينمانا نفسها لا تُفتح إلا عبر إيرثلنك. أما ما تحمّله فيعمل في أي مكان. |
| pick | Pick the device you'll watch on | اختر الجهاز الذي ستشاهد عليه |
| pickNote | You can download here and install it on another device. | يمكنك التحميل من هنا وتثبيته على جهاز آخر. |
| disclaimer | Cinemakom is an independent project. It isn't made by, or affiliated with, Earthlink, Shabakaty or Cinemana. | سينماكم مشروع مستقل، ليس من صنع إيرثلنك أو شبكتي أو سينمانا ولا يتبع لأيٍّ منها. |

Names: Cinemakom / **سينماكم**, Cinemana / سينمانا, Earthlink / إيرثلنك, Shabakaty / شبكتي.

---

## 8. Design: Marquee on the web

The full system is `docs/DESIGN.md` in the app repo. **Read its §1–§5 and §7.** Below is what matters for the site.

**The idea:** the neighbourhood picture palace after dark (a nod to the old cinema halls of Al-Rasheed Street, without turning into a costume). Deep cocoa surfaces and warm bulb light, so **the posters in the screenshots are the only real colour on the page**. Beauty comes from big confident type, the bulb motif, generous space, and restraint, not from effects.

### 8.1 Colour

Put these in Tailwind's `@theme`, and **remove Tailwind's default palette** (`--color-*: initial;` first), so no off-brand colour can sneak in:

| Token | Hex | Use |
|---|---|---|
| `night` | `#15100C` | Page background |
| `screen` | `#000000` | Behind screenshots in device frames, if needed |
| `booth` | `#221A14` | Surfaces: cards, panels, the picker cards |
| `booth-raised` | `#2C221A` | Selected or hovered surfaces |
| `nav-bar` | `#1B1510` | The header bar |
| `velvet` | `#3A2C21` | Dividers, outlines |
| `velvet-strong` | `#5A4634` | Outlined-button borders, inactive bulbs |
| `cream` | `#F4EAD7` | Primary text and icons |
| `cream-soft` | `#CDBEA5` | Long text |
| `dust` | `#B9A88E` | Captions, metadata |
| `dust-dim` | `#6E5C47` | Decorative only (never text that must be read) |
| `bulb` | `#F4B740` | **The one accent:** the primary button, focus rings, lit bulbs, numerals |
| `bulb-bright` | `#FFD27A` | Hovered/pressed accent |
| `on-bulb` | `#1A1208` | Text on `bulb` |
| `ember` | `#E8735A` | Warnings and errors only (e.g. the "Earthlink only" icon may use it sparingly, or stay `bulb`) |

Rules (from the app): **bulb is scarce** (one primary action per view, plus indicators; never a large background). **No shadows, no blur, no decorative gradients.** Surfaces separate by tone (`night` → `booth` → `booth-raised`). If you believe one soft glow on lit bulbs would lift the hero, build it as an **experiment**, keep it off by default, and show the owner both versions.

### 8.2 Type

| Role | Latin | Arabic |
|---|---|---|
| **Display** (hero, section titles, numerals, wordmark) | Big Shoulders Display 800–900 | Reem Kufi 700 |
| **UI** (everything else) | IBM Plex Sans 400/500/600 | IBM Plex Sans Arabic 400/500/600 |

- Font files: `~/Projects/personal/cinemakom/assets/fonts/` (`BigShouldersDisplay-Variable.ttf`, `ReemKufi-Variable.ttf`, `IBMPlexSans-Variable.ttf`, `IBMPlexSansArabic-{Regular,Medium,SemiBold}.ttf`) with their licences in `assets/fonts/licenses/`. Copy them into a `fonts-src/` folder and write `scripts/fonts.sh` that makes the WOFF2 files with fontTools' `pyftsubset` (installed: fontTools 4.68; WOFF2 needs the `brotli` module, check it). Commit the WOFF2 output and the script.
- **Subset by script** and declare `unicode-range`, so an Arabic page doesn't fetch Latin display glyphs it never shows: Latin (U+0000–00FF, U+2010–2027, U+2030–203A, U+20AC), Arabic (U+0600–06FF, U+0750–077F, U+FB50–FDFF, U+FE70–FEFF, U+200C–200F). Pin variable axes to the weights used (Big Shoulders `wght` 800–900, Plex Sans 400–600, Reem Kufi 700) with `fontTools.varLib.instancer` to shrink them.
- Font stacks: `--font-display: "Big Shoulders Display", "Reem Kufi", system-ui, sans-serif;` `--font-ui: "IBM Plex Sans", "IBM Plex Sans Arabic", system-ui, sans-serif;`. `font-display: swap`. Preload only the hero's display font for the page's language.
- **Arabic rules:** never letter-spacing or uppercase on Arabic. Tracked Latin styles (eyebrow 0.16 em, section titles 0.04 em) drop their tracking on Arabic pages. Arabic display text needs line height ~1.3 where Latin capitals use 0.9; Arabic body text ≥ 1.6.
- Scale (scale it up fluidly for the web with `clamp()`): hero 58 px in the app → `clamp(3.5rem, 11vw, 9rem)` here; section title 22 → `clamp(1.75rem, 4vw, 2.75rem)`; body 15 → 17 px; caption 12 → 14 px; eyebrow 12, tracked, `bulb`; numerals in Big Shoulders 900, tabular, `bulb`.

### 8.3 Space and shape

- Spacing in multiples of 4. Page gutter 20 px on phones, 32 from 600 px, 48 from 1200 px. Content max width ~1200 px; reading text max ~65 characters.
- **Radii:** 6 thumbnails · 10 posters · 12 cards · 16 panels · pill (full) for buttons. Put them in `@theme` as `--radius-thumb/poster/card/panel`.
- Buttons: primary = `bulb` pill, `on-bulb` label + icon, 48–56 px tall. Secondary = outlined pill (`velvet-strong` border, `cream` label). Touch targets ≥ 44 × 44.
- Icons: outlined, 1.8 px stroke, inline SVG (a handful: download, TV, phone, monitor, Linux/terminal, GitHub, check, chevron, globe). No icon font, no icon library at runtime.
- Focus: a 2 px `bulb` ring with 2 px offset on everything focusable (`:focus-visible`), 3 px on the TV page.

### 8.4 Motion

- 150 ms ease-out for state changes. Nothing loops.
- The marquee bulbs in the hero light in sequence **once** on load (a CSS chase, about 1.2 s), then all stay lit. *(The owner asked for no dark bulbs, 2026-11-23: they read as broken. In the hero's bulb-framed sign, two chases start at opposite corners and meet at the other two, the owner's idea.)*
- `prefers-reduced-motion: reduce` → no animation at all.
- Only `transform` and `opacity` animate.

### 8.5 The motifs and the page's composition

Make each section feel like part of one picture palace:

- **The logo.** The mark is a solid `bulb` ticket stub with **ك** knocked out of it (ك is the "your" in سينماكم: *your* cinema). SVGs: `~/Projects/personal/cinemakom/branding/` (`mark-full.svg` ≥ 48 px, `mark-small.svg` 24–47 px, `mark-tiny.svg` < 24 px, `app-icon.svg`). Inline them; never redraw the mark. **The lockup** = the mark beside **CINEMAKOM** (Big Shoulders 800, `cream`) over **سينماكم** (Reem Kufi 700, `bulb`); on Arabic pages the Arabic name leads. Favicon: `mark-tiny.svg` as `favicon.svg`, plus a 32 px PNG and a 180 px PNG made from `app-icon.svg` with `rsvg-convert`.
- **Hero: the marquee sign.** A huge two-line wordmark/headline set in the display face, framed above and below by a row of small `bulb` dots (5–7 px, gaps 6–8 px; inactive ones `velvet-strong`), the way the sign over a cinema door is framed by bulbs. Beside it on wide screens (below it on phones): a phone screenshot of the Home screen in a CSS-drawn device frame (`booth` body, radius ~36 px, a thin `velvet` edge), overlapping a desktop screenshot set back behind it. The posters in those screens bring the colour.
- **"Is this for you?" as an admission ticket.** A wide `booth` ticket with notched ends (a CSS `mask` with two half-circle cut-outs; a mask isn't a visible gradient) and a dashed `velvet` perforation line dividing a stub. The stub reads like a ticket stamp: "ADMIT ONE · EARTHLINK · IRAQ" (Arabic: "تذكرة دخول · إيرثلنك · العراق"); the main part holds the three facts.
- **Features as tonight's programme.** A list where each item opens with a big `bulb` numeral ("01", "02", …, Big Shoulders 900, tabular), like the app's episode rows, then a `cream` title and a `cream-soft` line. Two columns on wide screens.
- **Screenshots as a film strip.** Rounded screenshots (radius 12) in a scroll-snap row on `night`, with `dust` captions. Optionally a thin row of perforation dots above and below, in `velvet` (subtle; it's the film-strip nod, not a costume).
- **Download as the box office.** The four device cards are tickets too (smaller, `booth`, radius 12, a device icon, the name in `title` weight). The chosen card lights its border in `bulb`.
- **Section titles** in the display face (Latin uppercase, tracked), with an eyebrow above each in `bulb`.
- Use the bulb row **at most twice** on the page (the hero and, optionally, the footer). It is never a divider between every section.

Check the result at 360, 768 and 1440 px wide, in **both languages**, and adjust until it looks considered at every size, not just stacked.

---

## 9. Screenshots

- Use the app's own screenshots: `~/Projects/personal/cinemakom/build/screenshots/` (phones 780 × 1688, desktop 2560 × 1600). Good ones: `20-phone-home-live`, `22-phone-details-hero`, `23-phone-details-series`, `54-phone-player-ar`, `60-phone-library-continue`, `70-phone-downloads`, `30-desktop-home-live`, `50-desktop-player`, and the Arabic ones (`40-phone-home-ar-live`, `41-phone-details-ar`, `74-phone-downloads-ar`). Look at them before picking: choose those that look best.
- Copy the chosen ones into `src/assets/screens/` with clear names. `astro:assets` makes the small AVIF/WebP versions; commit only the PNG originals you use.
- TV screenshots: there are none in that folder right now. If you want them, **ask the owner** to run `fvm flutter test integration_test/tv_screenshots_test.dart -d linux` in the app repo (it writes `tv-*.png` there). Don't run it yourself.
- Screenshots are pictures: give them `alt` text that says what the screen shows ("The Home screen: a hero banner and rows of posters").

---

## 10. Hosting, i18n and RTL

### 10.1 Astro config
- `site: 'https://cinemakom.sharon-xa.com'` (no `base`: the site is at the domain's root), `trailingSlash: 'always'`. **Every internal link and asset URL goes through `import.meta.env.BASE_URL`** (write one `url()` helper and use it everywhere), so moving to a custom domain later is a one-line change.
- `i18n: { locales: ['ar', 'en'], defaultLocale: 'ar', routing: { prefixDefaultLocale: false } }`.
- `<html lang="ar" dir="rtl">` on Arabic pages, `lang="en" dir="ltr"` on English. `hreflang` alternates (+ `x-default` → Arabic) on every page. The switch links to the same page in the other language.
- Per-language `<title>`, meta description and Open Graph tags. One 1200 × 630 `og.png` per language, made from an SVG with `rsvg-convert` (`scripts/og.sh`), committed.

### 10.2 RTL rules
- **Only logical properties.** Tailwind: `ms-* me-* ps-* pe-* start-* end-* text-start text-end border-s border-e rounded-s rounded-e`. Never `ml- mr- pl- pr- left- right- text-left text-right` (and no `left`/`right` in custom CSS). Add `npm run lint:rtl`, a small script that greps `src/` for those and fails; run it in CI.
- Icons that point (chevrons, arrows) flip in RTL (`rtl:-scale-x-100`). Logos, the ticket mark, and screenshots don't.
- Mixed text ("v1.0.0 · 39 MB" inside Arabic) goes in `<bdi>` or `dir="ltr"` spans, or the parts swap places. File names and commands are always `dir="ltr"` with `<code>`.
- Numbers: Western digits (0–9) in Arabic too. Format sizes and dates with `Intl` using `ar-IQ-u-nu-latn` / `en-GB`.

### 10.3 Deploy
A Render static site (§5.2) on the owner's subdomain `cinemakom.sharon-xa.com` (a DNS-only `CNAME` at Cloudflare: Cloudflare's proxy stays off, so Render issues the certificate and nothing is cached or injected twice). *Checked on the live site, 2026-11-24:* a missing page gets our `404.html` with status 404; `/tv`, `/TV`, `/en/tv` and `/en` redirect (301) to their slash forms; HTTP redirects to HTTPS; pages are brotli-compressed with the `render.yaml` headers; `/_astro/*` is cached for a year and `/version.json` is not; the only outside request is the refresh's one call to `api.github.com`; Lighthouse mobile 99–100 / 100 / 100 / 100 with CLS 0.

---

## 11. Milestones

Each milestone ends with `npm run check`, `npm test`, `npm run build`, `npm run lint:rtl` passing, and a commit.

- **W0. Project.** Astro + Tailwind v4, TypeScript strict, `.nvmrc`, scripts (`dev`, `build`, `preview`, `check`, `test`, `lint:rtl`), `AGENTS.md`/`CLAUDE.md`, `.gitignore`, the `@theme` tokens, `git init`. *Done when:* a blank page in `night` with "سينماكم" in Reem Kufi builds.
- **W1. Release data.** `src/lib/release.ts`, `pickAssets` with tests against the saved v1.0.0 answer (all five targets found, iOS/macOS ignored, sizes and checksums right, a release missing Linux handled, a junk answer rejected without throwing an unreadable error), `/version.json`. *Done when:* the build prints the release it used.
- **W2. Layout, fonts, i18n.** WOFF2 subsets, the base layout, header, footer, language switch, both dictionaries, `hreflang`, `url()` helper. *Done when:* `/` and `/en/` render in the right direction with the right fonts, and switching keeps you on the same page.
- **W3. Home page.** Hero, ticket, programme, screenshots, Questions, all from §7–§8. *Done when:* the owner has seen it at phone and desktop widths in both languages. Show them screenshots of the result (or a running `npm run preview`) and adjust before W4.
- **W4. Download flow + TV page.** §6 in full, the no-JS picker, install steps, QR, `/tv/`. *Done when:* with JavaScript disabled every file is reachable; arrow keys alone can reach the TV button at 960 × 540; each button's link matches the release.
- **W5. Runtime refresh + deploy workflow.** §5.2 and §5.4, `404.html`, sitemap, robots. *Done when:* a test shows the refresh swapping links for a newer fake release and doing nothing on a failed fetch, and the workflow file passes a YAML/`actionlint` check if available.
- **W6. Polish and budgets.** Lighthouse on the built site (mobile, both languages), sizes against §4's budgets, accessibility (contrast, headings in order, labels, `alt`, focus order), `prefers-reduced-motion`. Then hand over the owner steps (§12).

---

## 12. Owner steps (tell the owner at the end; don't do them yourself)

1. Create the **public** repo `sharon-xa/cinemakom-website` on GitHub (empty). Then you (the agent) may add the remote and push, once the owner says so.
2. **Render:** New → Blueprint, pick `sharon-xa/cinemakom-website` (it reads `render.yaml`). In the service's Environment, add `GITHUB_TOKEN`: a fine-grained GitHub token with **Public repositories (read-only)** access and no permissions, used only to raise the API rate limit during builds.
3. **The domain:** in the service's Settings → Custom Domains, add `cinemakom.sharon-xa.com`. At the DNS provider of `sharon-xa.com`, add a `CNAME` record `cinemakom` → the service's `….onrender.com` address. Render issues the certificate.
4. **Instant updates (recommended):** copy the service's **Deploy Hook** URL (Settings). Store it as the Actions secret `RENDER_DEPLOY_HOOK` in **both** the app repo (for Appendix B) and the site repo (for the 6-hourly check). Then add the step in **Appendix B** to the app's `release.yml`. Without it, the 6-hourly check and the runtime refresh still update the site, just later. The hook URL is a secret: anyone with it can start builds.
5. **Search engines:** in [Google Search Console](https://search.google.com/search-console), add a *Domain* property for `sharon-xa.com` (verified with a DNS TXT record, so nothing goes in this repo) and submit `https://cinemakom.sharon-xa.com/sitemap-index.xml`. Then in [Bing Webmaster Tools](https://www.bing.com/webmasters), import the site from Search Console: Bing's index also feeds ChatGPT search and Copilot.
6. **Links to the site** (the biggest ranking signal for a new site): set the app repo's *About → Website* to `https://cinemakom.sharon-xa.com/`, add topics (`cinemana`, `earthlink`, `iraq`, `android-tv`, `flutter`), link the site from the app's README and release notes, and share it where Iraqi Earthlink users talk about Cinemana.
7. Proofread the Arabic copy, including the page titles.

---

## Appendix A: `AGENTS.md` for the site repo (copy as written)

~~~~markdown
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
npm run preview    # serve dist/
scripts/fonts.sh   # rebuild the WOFF2 subsets from fonts-src/
```
All of check, test, lint:rtl and build must pass before you finish.

## Rules
- **Release data comes from the GitHub API at build time** (`src/lib/release.ts`). Never hardcode a version, file name, size or link. Match assets by suffix. In CI a failed fetch or a missing Android file fails the build.
- **No device auto-detection.** The visitor picks the device; never reorder, preselect by user agent, or hide files.
- **The download picker works without JavaScript** (radio inputs + `:has()`, all panels shown when `:has()` is unsupported). The only client JS is the inline release refresh (≤ 2 KB), and the site must be fully correct without it.
- **Design:** the app's Marquee system (`docs/GUIDE.md` §8, from the app's `docs/DESIGN.md`). Only the `@theme` tokens: no Tailwind default colours, no hardcoded colours, fonts or radii in markup. One dark theme. No shadows, blur or decorative gradients. `bulb` is scarce. Nothing loops; respect `prefers-reduced-motion`.
- **Two languages:** Arabic at `/` (RTL), English at `/en/`. Every string in `src/i18n/ar.ts` and `src/i18n/en.ts` (same keys). Logical properties only (`ms/me/ps/pe/start/end`); never left/right. No letter-spacing or uppercase on Arabic. Western digits everywhere. Mixed-direction snippets in `<bdi>`.
- **Links:** every internal URL through the `url()` helper (`import.meta.env.BASE_URL`).
- **Performance budgets:** home first view ≤ 350 KB compressed, CSS ≤ 20 KB, JS ≤ 2 KB, CLS 0, Lighthouse mobile ≥ 95 / 100 / 100 / 100. Self-hosted subset WOFF2 fonts; images through `astro:assets`.
- **The logo** is the app's SVGs from `branding/`, inlined. Never redraw or alter it.
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
- [ ] W0 Project
- [ ] W1 Release data
- [ ] W2 Layout, fonts, i18n
- [ ] W3 Home page (owner reviewed)
- [ ] W4 Download flow + TV page
- [ ] W5 Runtime refresh + deploy workflow
- [ ] W6 Polish and budgets
~~~~

Also copy this guide into the repo as `docs/GUIDE.md`, so the brief stays with the code.

---

## Appendix B: the step for the app's `release.yml` (owner adds it)

Append to the end of the `publish` job's `steps` in `~/Projects/personal/cinemakom/.github/workflows/release.yml`, after `softprops/action-gh-release`:

```yaml
      - name: Update the website
        if: ${{ !contains(github.ref_name, '-') }}   # prereleases don't change the site
        continue-on-error: true                       # a failed ping never fails a release
        env:
          HOOK: ${{ secrets.RENDER_DEPLOY_HOOK }}
        run: curl -fsS -X POST "$HOOK" > /dev/null
```

**Android updates (fixed 2026-11-23):** from the next release on, every APK is signed with the same permanent key, so updates install over the old version and keep the user's data. Only v1.0.0 was signed with a temporary key, so its users uninstall once (§6.4).
