// Russian is the source language and keeps the unprefixed URLs; the other
// locales live under /en, /uk and /be. next.config.ts rewrites unprefixed paths
// to /ru internally, so every page sits under app/[locale].
export const locales = ["ru", "en", "uk", "be"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";
export const translatedLocales = locales.filter((locale) => locale !== defaultLocale);

export const localeNames: Record<Locale, { native: string; english: string }> = {
  ru: { native: "Русский", english: "Russian" },
  en: { native: "English", english: "English" },
  uk: { native: "Українська", english: "Ukrainian" },
  be: { native: "Беларуская", english: "Belarusian" },
};

/** BCP 47 tags for Intl APIs and hreflang. */
export const localeTags: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en",
  uk: "uk-UA",
  be: "be-BY",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function toLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

/** Prefixes an absolute site path with the locale; Russian paths stay unprefixed. */
export function localizePath(locale: Locale, path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const unprefixed = stripLocale(path).path;
  if (locale === defaultLocale) return unprefixed;
  return unprefixed === "/" ? `/${locale}` : `/${locale}${unprefixed}`;
}

/** Splits "/en/records?x" into the locale and the Russian-equivalent path "/records?x". */
export function stripLocale(path: string): { locale: Locale; path: string } {
  const match = path.match(/^\/(ru|en|uk|be)(?=[/?#]|$)/);
  if (!match) return { locale: defaultLocale, path };
  const rest = path.slice(match[0].length);
  return { locale: match[1] as Locale, path: rest.startsWith("/") ? rest : `/${rest}` };
}
