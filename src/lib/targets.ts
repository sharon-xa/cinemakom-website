// Release asset matching, shared by the build (release.ts) and the in-page
// refresh script (refresh.ts). Assets carry the tag in their names
// (cinemakom-v1.2.0-android-arm64-v8a.apk), so they are matched by suffix only.
// Keep this file dependency-free and small: it ships to the browser.

export const TARGETS = [
  'android-arm64-v8a',
  'android-armeabi-v7a',
  'android-x86_64',
  'windows-x64-setup',
  'windows-x64',
  'linux-x64',
  // The v1.0.0 tarball (needs libmpv). Releases from v2.0.0 have the AppImage
  // instead: drop this (and its match in release.ts) once v1.0.0 is no longer
  // the latest release.
  'linux-x64-tar',
] as const;

export type Target = (typeof TARGETS)[number];

/** Each target's suffix: "-<target>" and its file type. One pattern, so the browser copy stays tiny. */
const SUFFIX = /-(android-(?:arm64-v8a|armeabi-v7a|x86_64)\.apk|windows-x64(?:-setup\.exe|\.zip)|linux-x64\.AppImage)$/;

/**
 * The target an asset name belongs to, or undefined for anything else (iOS,
 * macOS, checksums, .zsync…). The v1.0.0 tarball is matched in release.ts
 * only: the in-page refresh only applies newer releases, which have none.
 */
export function targetOf(name: string): Target | undefined {
  return name.match(SUFFIX)?.[1]!.replace(/\.\w+$/, '') as Target | undefined;
}
