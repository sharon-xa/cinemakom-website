// The app's screenshots (src/assets/screens/*.png), by file name without extension.
import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/screens/*.png', { eager: true });

export const screens: Record<string, ImageMetadata> = Object.fromEntries(
  Object.entries(files).map(([path, mod]) => [path.replace(/^.*\/|\.png$/g, ''), mod.default]),
);

export function screen(name: string): ImageMetadata {
  const img = screens[name];
  if (!img) throw new Error(`No screenshot src/assets/screens/${name}.png`);
  return img;
}

export const isPhone = (img: ImageMetadata) => img.height > img.width;
