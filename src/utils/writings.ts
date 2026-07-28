export type WritingLanguage = 'tr' | 'en';

export function getReadingMinutes(content?: string): number {
  const plainText = (content ?? '')
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return 1;
  }

  const wordCount = plainText.split(' ').filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function formatWritingDate(
  date: Date,
  language: WritingLanguage = 'tr'
): string {
  return new Intl.DateTimeFormat(
    language === 'tr' ? 'tr-TR' : 'en-US',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }
  ).format(date);
}

export function getWritingHref(id: string): string {
  const normalizedId = id.replace(/\/index$/, '');
  return `/writings/${normalizedId}`;
}
