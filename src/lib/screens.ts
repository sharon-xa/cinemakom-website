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

/**
 * Style for an <img>: the screen's tiny preview (scripts/placeholders.sh) as
 * its background, shown until the real image has loaded.
 */
export function placeholder(name: string): string {
  const data = (placeholders as Record<string, string>)[name];
  if (!data) throw new Error(`No placeholder for ${name}: run scripts/placeholders.sh`);
  return `background-image:url(${data})`;
}

export const isPhone = (img: ImageMetadata) => img.height > img.width;
