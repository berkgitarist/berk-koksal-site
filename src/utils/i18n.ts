export type SiteLanguage = 'en' | 'tr';

export const DEFAULT_LANGUAGE: SiteLanguage = 'en';

/*
 * Türkçe karşılığı hazır olan route'ları burada tutuyoruz.
 * Yeni bir Türkçe sayfa eklediğimizde sadece bu listeye ekleyeceğiz.
 */
export const translatedRoutes = new Set<string>([
  '/',
  '/biography/',
  '/full-biography/',
  '/quranic-concepts/',
  '/neo-sacred-zikr/',
  '/writings/',
]);

export function normalizePath(pathname: string): string {
  if (!pathname) return '/';

  let path = pathname.split('?')[0]?.split('#')[0] ?? '/';

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  if (path !== '/' && !path.endsWith('/')) {
    path = `${path}/`;
  }

  return path;
}

export function getLanguageFromPath(pathname: string): SiteLanguage {
  const path = normalizePath(pathname);

  return path === '/tr/' || path.startsWith('/tr/')
    ? 'tr'
    : 'en';
}

export function stripLanguagePrefix(pathname: string): string {
  const path = normalizePath(pathname);

  if (path === '/tr/') {
    return '/';
  }

  if (path.startsWith('/tr/')) {
    const withoutPrefix = path.slice(3);
    return normalizePath(withoutPrefix || '/');
  }

  return path;
}

export function hasTurkishVersion(pathname: string): boolean {
  return translatedRoutes.has(stripLanguagePrefix(pathname));
}

export function localizePath(
  pathname: string,
  language: SiteLanguage
): string {
  const basePath = stripLanguagePrefix(pathname);

  if (language === 'en') {
    return basePath;
  }

  if (!translatedRoutes.has(basePath)) {
    return basePath;
  }

  if (basePath === '/') {
    return '/tr/';
  }

  return `/tr${basePath}`;
}

export function getLanguageSwitchHref(
  pathname: string,
  targetLanguage: SiteLanguage
): string {
  const basePath = stripLanguagePrefix(pathname);

  // Yazı detaylarında birebir çevrilmiş karşı slug olup olmadığını
  // henüz eşleştirmiyoruz. Dil değiştirildiğinde güvenli biçimde
  // ilgili dilin Yazılar ana sayfasına dönüyoruz.
  const isWritingDetail =
    basePath.startsWith('/writings/') &&
    basePath !== '/writings/';

  if (isWritingDetail) {
    return targetLanguage === 'tr'
      ? '/tr/writings/'
      : '/writings/';
  }

  if (targetLanguage === 'en') {
    return basePath;
  }

  if (translatedRoutes.has(basePath)) {
    return localizePath(basePath, 'tr');
  }

  return '/tr/';
}
