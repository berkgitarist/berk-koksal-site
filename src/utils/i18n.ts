export type SiteLanguage = 'en' | 'tr';

const TURKISH_PREFIX = '/tr';

type UrlParts = {
  pathname: string;
  suffix: string;
};

function splitUrlParts(value: string): UrlParts {
  const match = value.match(/^([^?#]*)(.*)$/);

  return {
    pathname: match?.[1] || '/',
    suffix: match?.[2] || '',
  };
}

function normalizePathname(pathname: string): string {
  let path = pathname.trim();

  if (!path) {
    return '/';
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  path = path.replace(/\/{2,}/g, '/');

  if (path === TURKISH_PREFIX) {
    return `${TURKISH_PREFIX}/`;
  }

  if (path !== '/' && !path.endsWith('/')) {
    path = `${path}/`;
  }

  return path;
}

export function getLanguageFromPath(
  value: string
): SiteLanguage {
  const { pathname } = splitUrlParts(value);
  const path = normalizePathname(pathname);

  return path === `${TURKISH_PREFIX}/` ||
    path.startsWith(`${TURKISH_PREFIX}/`)
    ? 'tr'
    : 'en';
}

export function stripLanguagePrefix(
  value: string
): string {
  const { pathname, suffix } = splitUrlParts(value);
  const path = normalizePathname(pathname);

  if (
    path === TURKISH_PREFIX ||
    path === `${TURKISH_PREFIX}/`
  ) {
    return `/${suffix}`;
  }

  if (path.startsWith(`${TURKISH_PREFIX}/`)) {
    const withoutPrefix = path.slice(TURKISH_PREFIX.length);

    return `${withoutPrefix || '/'}${suffix}`;
  }

  return `${path}${suffix}`;
}

export function localizePath(
  value: string,
  language: SiteLanguage
): string {
  const { pathname, suffix } = splitUrlParts(value);
  const basePath = normalizePathname(
    splitUrlParts(stripLanguagePrefix(pathname)).pathname
  );

  if (language === 'tr') {
    const localized =
      basePath === '/'
        ? `${TURKISH_PREFIX}/`
        : `${TURKISH_PREFIX}${basePath}`;

    return `${localized}${suffix}`;
  }

  return `${basePath}${suffix}`;
}

export function getLanguageSwitchHref(
  currentUrl: string,
  targetLanguage: SiteLanguage
): string {
  /*
   * Universal language switcher.
   * There is intentionally NO page whitelist here.
   * Any mirrored EN/TR route keeps the same page automatically.
   *
   * Examples:
   * /poems/                  <-> /tr/poems/
   * /full-biography/         <-> /tr/full-biography/
   * /biography/              <-> /tr/biography/
   * /albums/helll/           <-> /tr/albums/helll/
   * /writings/example/       <-> /tr/writings/example/
   * /anything/new/in/future/ <-> /tr/anything/new/in/future/
   *
   * Query parameters are preserved here. URL fragments (#section)
   * are preserved by nav.astro in the browser because fragments are
   * not sent to Astro on the server.
   */
  return localizePath(currentUrl, targetLanguage);
}
