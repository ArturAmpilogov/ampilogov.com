import type { Metadata } from "next";
import { defaultLocale, type Locale, localeTags, locales, localizePath } from "@/i18n/config";

/**
 * hreflang alternates for a page that exists in every locale. Pass only the
 * locales that really have the page (cards are translated gradually).
 */
export function localeAlternates(
  locale: Locale,
  path: string,
  available: readonly Locale[] = locales,
): Metadata["alternates"] {
  return {
    canonical: localizePath(locale, path),
    languages: {
      ...Object.fromEntries(available.map((entry) => [localeTags[entry], localizePath(entry, path)])),
      "x-default": localizePath(defaultLocale, path),
    },
  };
}
