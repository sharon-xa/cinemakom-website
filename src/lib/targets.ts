// Release asset matching, shared by the build (release.ts) and the in-page
// refresh script (refresh.ts). Assets carry the tag in their names
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

/** Each target's suffix: "-<target>" and its file type. One pattern, so the browser copy stays tiny. */
const SUFFIX = /-(android-(?:arm64-v8a|armeabi-v7a|x86_64)\.apk|windows-x64\.zip|linux-x64\.tar\.gz)$/;

/** The target an asset name belongs to, or undefined for anything else (iOS, macOS, checksums…). */
export function targetOf(name: string): Target | undefined {
  return name.match(SUFFIX)?.[1]!.replace(/\.(apk|zip|tar\.gz)$/, '') as Target | undefined;
}
