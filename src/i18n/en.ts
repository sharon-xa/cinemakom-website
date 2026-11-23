// English copy. Every user-facing string lives here or in ar.ts (same keys).
// Strings marked "html" may hold <em>, <strong>, <code> and <a>: they are ours,
// and rendered with set:html. "{name}" placeholders are filled by fill().

const en = {
  meta: {
    lang: 'en',
    dir: 'ltr',
    // The search title leads with what people search for; social cards get the tagline.
    title: 'Cinemakom: free app for Cinemana on Android, TV, Windows and Linux',
    ogTitle: 'Cinemakom: Cinemana, from a better seat',
    description:
      'A free, unofficial app for watching Cinemana’s movies and series on Android phones, Android TV, Windows and Linux. Works on Earthlink in Iraq.',
    ogAlt: 'Cinemakom: a free, unofficial app for Cinemana',
    tvTitle: 'Download Cinemakom for Android TV and TV boxes',
    tvDescription: 'Download Cinemakom for Android TV, Google TV and TV boxes.',
    notFoundTitle: 'This screen is dark · Cinemakom',
  },
  brand: {
    name: 'Cinemakom',
    latin: 'CINEMAKOM',
    arabic: 'سينماكم',
    home: 'Cinemakom, home',
  },
  nav: {
    skip: 'Skip to content',
    download: 'Download',
    questions: 'Questions',
    github: 'GitHub',
    githubLabel: 'Cinemakom on GitHub',
    switchTo: 'العربية',
    switchLabel: 'اقرأ هذه الصفحة بالعربية',
    switchLang: 'ar',
    menu: 'Main',
  },
  hero: {
    eyebrow: 'Now showing',
    // One entry per line of the sign.
    headline: ['Cinemana,', 'from a better seat.'],
    lede: 'Cinemakom is a free, unofficial app for watching Cinemana’s movies and series on your phone, TV and computer.',
    cta: 'Download',
    caption: 'Version {version} · {date}',
    platformsLabel: 'Runs on',
    platforms: ['Android', 'Android TV', 'Windows', 'Linux'],
    earthlinkTitle: 'Earthlink only',
    earthlink: 'Works only on an Earthlink connection in Iraq. Titles you download play anywhere.',
    phoneAlt: 'Cinemakom’s Home screen on a phone: a large banner, a Play button and rows of posters.',
    desktopAlt: 'Cinemakom on a computer: the Home screen with a side menu, Continue watching and rows of posters.',
  },
  ticket: {
    eyebrow: 'Before you download',
    title: 'Is this for you?',
    stub: ['Admit one', 'Earthlink', 'Iraq'],
    stubLabel: 'Admission: Earthlink, Iraq',
    facts: [
      {
        title: 'You need Earthlink in Iraq',
        body: 'Browsing and streaming only work on an Earthlink connection, because that’s the only way to reach Cinemana.',
      },
      {
        title: 'Downloads go anywhere',
        body: 'Movies and episodes you download play offline, on any network, in any country.',
      },
      {
        title: 'Free. No account.',
        body: 'Nothing to pay and nothing to sign up for. Install it and watch.',
      },
    ],
  },
  features: {
    eyebrow: 'Tonight’s programme',
    title: 'What it does',
    items: [
      {
        title: 'All of Cinemana',
        body: 'Browse movies and series by genre, sort them, filter by language. Series open on their seasons and episodes, and even very long anime seasons come in tidy blocks.',
      },
      {
        title: 'Find anything',
        body: 'Search by title, or by an actor’s or director’s name. Your recent searches are kept.',
      },
      {
        title: 'A player that knows the job',
        body: 'Up to 4K, Arabic and English subtitles, playback speed, Skip intro and next episode. It picks up where you stopped.',
      },
      {
        title: 'Downloads that hold on',
        body: 'Choose the quality (sizes shown), take whole seasons, pause and resume. Built for slow, unstable connections, with subtitles saved too.',
      },
      {
        title: 'A real TV app',
        body: 'Android TV and TV boxes get their own interface, driven entirely by the remote.',
      },
      {
        title: 'Yours, and private',
        body: 'No ads, no account, no tracking. Continue watching and Favorites stay on your device. In English or Arabic, fully right to left.',
      },
    ],
  },
  screens: {
    eyebrow: 'Stills',
    title: 'A look inside',
    hint: 'Swipe for more',
    items: [
      {
        file: 'phone-details-movie-en',
        caption: 'A movie’s page',
        alt: 'A movie’s details on a phone: the poster, title, year and genre, Play and Favorite buttons, the story and the cast.',
      },
      {
        file: 'desktop-player-quality-en',
        caption: 'Quality up to 4K',
        alt: 'The player on a computer with the quality menu open, from 2160p (4K) down to 240p, with Arabic subtitles on.',
      },
      {
        file: 'phone-downloads-en',
        caption: 'Downloads, paused and resumed',
        alt: 'The Downloads screen on a phone: one download in progress with its speed and time left, and finished downloads below.',
      },
      {
        file: 'phone-episodes-en',
        caption: 'Episodes, ready to download',
        alt: 'A season’s episode list on a phone, each row with a large episode number and a download button.',
      },
      {
        file: 'phone-continue-en',
        caption: 'Continue watching',
        alt: 'The Library on a phone, showing Continue watching with the next episode and how much is left.',
      },
      {
        file: 'desktop-favorites-en',
        caption: 'Favorites, on your device',
        alt: 'The Library on a computer, showing three favorite posters.',
      },
    ],
  },
  download: {
    eyebrow: 'Box office',
    title: 'Download',
    pick: 'Pick the device you’ll watch on',
    pickNote: 'You can download here and install it on another device.',
    stepDevice: 'Step 1',
    stepFile: 'Step 2',
    devicesLabel: 'Device',
    devices: {
      phone: { name: 'Android phone or tablet', note: 'Android 7.0 or newer' },
      tv: { name: 'Android TV, Google TV or TV box', note: 'Android 7.0 or newer' },
      windows: { name: 'Windows computer', note: 'Windows 10 or 11, 64-bit' },
      linux: { name: 'Linux computer', note: '64-bit (x86-64)' },
    },
    buttons: {
      phone: 'Download for Android phones',
      tv1: 'Download for TV',
      tv2: 'Download Option 2',
      windows: 'Download for Windows',
      linux: 'Download for Linux',
    },
    tv: {
      option1: 'Option 1',
      option1Why: 'Works on nearly every TV. Many TVs run 32-bit Android, even with a 64-bit chip.',
      option2: 'Option 2',
      option2Why: 'Use this only if Option 1 says <em>App not installed</em>. Some newer TVs run 64-bit apps only.', // html
    },
    other: {
      title: 'Other versions',
      armv7: {
        title: 'For older phones',
        why: 'Try it if the main file says <em>App not installed</em>.', // html
      },
      x86: { title: 'Chromebooks and emulators', why: 'For Android on Intel or AMD processors.' },
    },
    tech: 'File',
    notYet: 'Not in this release yet.',
    notYetLink: 'See every version on GitHub',
    allVersions: 'All versions on GitHub',
    install: 'How to install',
    update: 'Updating',
    check: 'Check the file',
    checkNote:
      'If you want to be sure the file arrived whole, compare its SHA-256 checksum with this one.',
    checkCommand: 'On a computer:',
    qr: 'On a computer? Scan this with your phone to open this download there.',
    qrAlt: 'QR code that opens the Android download on this site',
    tvAddressLead: 'On the TV, type this address:',
    sample: 'Sample release data: this local build couldn’t reach GitHub.',
    steps: {
      android: [
        'Open the file you downloaded (tap the notification, or find it in your browser’s downloads).',
        'If Android asks, let your browser <strong>Install unknown apps</strong>, then go back and tap <em>Install</em>.',
        'If Play Protect warns you, choose <em>Install anyway</em>. It warns about every app that isn’t from the Play Store.',
      ],
      androidUpdate: [
        'Download the new version here and install it over the old one. Your favorites, history and downloads stay.',
        '<strong>Only if you have version 1.0.0:</strong> uninstall it once before installing a newer version. Version 1.0.0 was signed with a temporary key and every later version uses the permanent one, so Android won’t install over it. Uninstalling clears its favorites and history.',
      ],
      tvWays: 'Three ways to get the file onto the TV:',
      tv: [
        '<strong>Downloader app</strong> (by AFTVnews, free on the TV’s Play Store): open it, type the address above, then pick the TV file on the page that opens.',
        '<strong>A USB stick:</strong> download the file on a computer, copy it to the stick, plug it into the TV and open the file with the TV’s file manager.',
        '<strong>A file-sending app</strong> such as <em>Send Files to TV</em>, installed on both the phone and the TV: download on the phone, then send it.',
      ],
      tvAfter: [
        'When the TV asks, allow the app that opens the file (Downloader, the file manager…) to install unknown apps.',
        'If you see <em>App not installed</em>, download Option 2 instead.',
      ],
      windows: [
        'Right-click the downloaded zip and choose <em>Extract all</em>. Put it in a folder you’ll keep, such as <code dir="ltr">Documents\\Cinemakom</code>. Keep all its files together: the app needs every one of them.',
        'Open <code dir="ltr">cinemakom.exe</code> in that folder.',
        'If you see <em>Windows protected your PC</em>, choose <em>More info</em>, then <em>Run anyway</em>. Windows shows this for apps without a paid signature.',
      ],
      windowsUpdate:
        'Close Cinemakom, then extract the new zip over the old folder. Your favorites and history are stored elsewhere, so they stay.',
      linuxDeps: 'Install libmpv, which plays the video:',
      linuxRun: 'Extract the download and start the app:',
      linuxDesktop: 'Optional: add Cinemakom to your app menu.',
      linuxDesktopNote: 'This keeps the app in <code dir="ltr">~/.local/opt/cinemakom</code> and adds its icon and menu entry.',
      distros: { debian: 'Debian, Ubuntu, Mint', fedora: 'Fedora', arch: 'Arch, Manjaro' },
    },
  },
  faq: {
    eyebrow: 'Questions',
    title: 'Good questions',
    items: [
      {
        q: 'Why does it only work on Earthlink?',
        a: 'Cinemana, Shabakaty’s streaming service, only opens on Earthlink’s network in Iraq. Cinemakom shows Cinemana’s library, so it works wherever Cinemana works and nowhere else.',
      },
      {
        q: 'Is it official?',
        a: 'No. Cinemakom is an independent project. It isn’t made by, or affiliated with, Earthlink, Shabakaty or Cinemana. It’s a different app for the same library.',
      },
      { q: 'Is it free?', a: 'Yes, completely. No ads, no subscription, nothing to buy.' },
      {
        q: 'Do I need an account?',
        a: 'No. There’s no sign-in. Your favorites and history are stored only on your device.',
      },
      {
        q: 'Which Android file do I need?',
        a: 'For a phone or tablet, the main phone file. For a TV or TV box, Option 1. If a file says <em>App not installed</em>, try the other one: a wrong file does no harm. <a href="#download">Go to the downloads</a>.',
      },
      {
        q: 'Does it work outside Iraq, or on another provider?',
        a: 'Browsing and streaming don’t: they need Earthlink. Titles you downloaded while on Earthlink play anywhere, offline.',
      },
      {
        q: 'Is there an iPhone or Mac version?',
        a: 'No. Cinemakom is for Android phones and tablets, Android TV, Windows and Linux.',
      },
      {
        q: 'How do I update?',
        a: 'Download the new version from this page and install it over the old one. Your favorites, history and downloads stay. If you have version 1.0.0, uninstall it once first (it was signed with a temporary key). This page always offers the newest version.',
      },
      {
        q: 'Where do I report a problem?',
        a: 'On GitHub: <a href="{issues}">open an issue</a> and say which device and version you use.',
      },
    ],
  },
  footer: {
    disclaimer:
      'Cinemakom is an independent project. It isn’t made by, or affiliated with, Earthlink, Shabakaty or Cinemana.',
    source: 'Source code on GitHub',
    built: 'This page offers Cinemakom {tag}, released {date}.',
    fonts: 'Typefaces: Big Shoulders Display, Reem Kufi, IBM Plex Sans and IBM Plex Sans Arabic, under the SIL Open Font License.',
    licences: 'Font licences',
    switchLead: 'Language:',
  },
  tvPage: {
    lead: 'A free, unofficial app for Cinemana. It works only on an Earthlink connection in Iraq.',
    option2: 'Option 2: if Option 1 says <em>App not installed</em>', // html
    option2Note: 'Some newer TVs run 64-bit apps only.',
    after: 'When it has downloaded, open the file and allow this app to install unknown apps.',
    other: 'Phone, Windows or Linux? Open the full site',
  },
  notFound: {
    eyebrow: 'Error 404',
    title: 'This screen is dark',
    body: 'The page you were looking for isn’t showing here. It may have moved, or the address may have a typo.',
    home: 'Back to the home page',
  },
};

export default en;
export type Dict = typeof en;
