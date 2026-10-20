import type { Locale } from "@/i18n/config";

/**
 * Co-located UI strings: Russian is the source and fixes the shape; every other
 * locale must provide the same keys. Values may be functions for plurals and
 * interpolation.
 */
export function defineCopy<T extends object>(
  ru: T,
  translations: Record<Exclude<Locale, "ru">, NoInfer<T>>,
): Record<Locale, T> {
  return { ru, ...translations };
}

/** Picks the plural form by CLDR rules: forms are { one, few, many, other }. */
export function plural(
  locale: Locale,
  count: number,
  forms: { one: string; few?: string; many?: string; other: string },
) {
  const category = new Intl.PluralRules(locale).select(count);
  const form = forms[category as keyof typeof forms] ?? forms.other;
  return form.replace("#", count.toLocaleString(locale));
}
