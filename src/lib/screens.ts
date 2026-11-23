// The app's screenshots (src/assets/screens/*.png), by file name without extension.
import type { ImageMetadata } from 'astro';
import placeholders from '../data/placeholders.json';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/screens/*.png', { eager: true });

export const screens: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.replace(/^.*\/|\.png$/g, ''), mod.default]),
);

export function screen(name: string): ImageMetadata {
  const img = screens[name];
  if (!img) throw new Error(`No screenshot src/assets/screens/${name}.png`);
  return img;
}

type Preview = { w: number; h: number; webp: string };

/**
 * Style for an <img>: the screen's tiny preview (scripts/placeholders.sh) as
 * its background, shown until the real image has loaded. The 32 px preview
 * sits in a small SVG with a Gaussian blur, so it scales up smooth instead of
 * blocky (a loading placeholder, not a visual effect; it is covered once the
 * image arrives). The alpha step keeps the blurred edges from fading out.
 */
export function placeholder(name: string): string {
  const p = (placeholders as Record<string, Preview>)[name];
  if (!p) throw new Error(`No placeholder for ${name}: run scripts/placeholders.sh`);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.w} ${p.h}" preserveAspectRatio="none">` +
    `<filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="1.1"/>` +
    `<feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter>` +
    `<image width="100%" height="100%" preserveAspectRatio="none" filter="url(#b)" href="data:image/webp;base64,${p.webp}"/></svg>`;
  return `background-image:url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export const isPhone = (img: ImageMetadata) => img.height > img.width;
