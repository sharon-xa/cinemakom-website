// Locale formatting with Western digits (0–9) in Arabic too (GUIDE §10.2).

export type Locale = 'ar' | 'en';

export const INTL_LOCALE: Record<Locale, string> = {
  ar: 'ar-IQ-u-nu-latn',
  en: 'en-GB',
};

const UNIT_MB: Record<Locale, string> = { ar: 'ميغابايت', en: 'MB' };

/** "39 MB" / "39 ميغابايت". Mebibytes, which is what phones and Windows show as MB. */
export function formatSize(bytes: number, locale: Locale): string {
  const mb = bytes / (1024 * 1024);
  const n = new Intl.NumberFormat(INTL_LOCALE[locale], {
    maximumFractionDigits: mb < 10 ? 1 : 0,
  }).format(mb);
  return `${n} ${UNIT_MB[locale]}`;
}

/** "20 Nov 2026" / "20 تشرين الثاني 2026", in Baghdad time. */
export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: locale === 'ar' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'Asia/Baghdad',
  }).format(new Date(iso));
}
