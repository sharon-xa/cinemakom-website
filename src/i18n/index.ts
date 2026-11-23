import ar from './ar';
import en, { type Dict } from './en';
import type { Locale } from '../lib/format';

export type { Dict } from './en';
export type { Locale } from '../lib/format';

export const LOCALES: readonly Locale[] = ['ar', 'en'];
export const dicts: Record<Locale, Dict> = { ar, en };

export function dict(locale: Locale): Dict {
  return dicts[locale];
}

export function other(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

/** Fills "{name}" placeholders: fill('v{version}', { version: '1.0.0' }). */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
}
