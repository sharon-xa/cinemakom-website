// Release asset matching, shared by the build (release.ts) and the in-page
// refresh script. Assets carry the tag in their names
// (cinemakom-v1.2.0-android-arm64-v8a.apk), so they are matched by suffix only.
// Keep this file dependency-free and small: it ships to the browser.

export const TARGETS = [
  'android-arm64-v8a',
  'android-armeabi-v7a',
  'android-x86_64',
  'windows-x64',
  'linux-x64',
] as const;

export type Target = (typeof TARGETS)[number];

export const SUFFIXES: Record<Target, string> = {
  'android-arm64-v8a': '-android-arm64-v8a.apk',
  'android-armeabi-v7a': '-android-armeabi-v7a.apk',
  'android-x86_64': '-android-x86_64.apk',
  'windows-x64': '-windows-x64.zip',
  'linux-x64': '-linux-x64.tar.gz',
};

/** The target an asset name belongs to, or undefined for anything else (iOS, macOS, checksums…). */
export function targetOf(name: string): Target | undefined {
  for (const t of TARGETS) if (name.endsWith(SUFFIXES[t])) return t;
  return undefined;
}
