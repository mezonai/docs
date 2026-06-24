export const LOCALE_STORAGE_KEY = "mezon_docs_lan";

export const DEFAULT_LOCALE = "en";

// Add a new language here (and in docusaurus.config.ts i18n.locales) to support it.
// The default locale is served at the root (/docs/...); others under /docs/<code>/...
export const LOCALE_CONFIG: Record<string, { label: string }> = {
  en: { label: "English" },
  vi: { label: "Tiếng Việt" },
};

export const SUPPORTED_LOCALES = Object.keys(LOCALE_CONFIG);

export function isSupportedLocale(value: string | null | undefined): boolean {
  return !!value && SUPPORTED_LOCALES.includes(value);
}

export function getStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore (private mode / disabled storage) */
  }
}

// Derive the locale a given (within-site) pathname is serving.
export function localeFromPathname(pathname: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  for (const locale of SUPPORTED_LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (rest === `/${locale}` || rest.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return DEFAULT_LOCALE;
}
