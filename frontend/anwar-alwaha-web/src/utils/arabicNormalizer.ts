/**
 * Arabic Text Normalization & Tokenization Utility
 * Used for zero-latency instant search matching & synonym extraction
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenizeArabic(text: string): string[] {
  const norm = normalizeArabic(text);
  if (!norm) return [];
  return norm.split(/\s+/).filter((t) => t.length > 0);
}
