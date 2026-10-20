import cardTranslations from "@/i18n/card-translations.json";
import { defaultLocale, type Locale, localizePath, stripLocale } from "@/i18n/config";

type CardKind = "records" | "people";

const translatedCards = new Map(
  Object.entries(cardTranslations as Record<string, Record<CardKind, string[]>>).map(([locale, kinds]) => [
    locale,
    { records: new Set(kinds.records), people: new Set(kinds.people) },
  ]),
);

export function hasCardTranslation(locale: Locale, kind: CardKind, id: string) {
  return locale === defaultLocale || Boolean(translatedCards.get(locale)?.[kind].has(id));
}

/** Translated card ids for a locale, used by generateStaticParams. */
export function translatedCardIds(locale: Locale, kind: CardKind) {
  return [...(translatedCards.get(locale)?.[kind] ?? [])];
}

/**
 * Localizes an internal href. Record and person cards are translated gradually,
 * so a card without a translation keeps its Russian URL instead of a 404.
 */
export function localizeHref(locale: Locale, href: string) {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const { path } = stripLocale(href);
  if (/^\/(archive|api|artwork|generated)(\/|$)/.test(path)) return path;
  const card = path.match(/^\/(records|people)\/([^/?#]+)(\/backup)?/);
  if (card) {
    if (card[3]) return path;
    if (!hasCardTranslation(locale, card[1] as CardKind, decodeURIComponent(card[2]))) return path;
  }
  return localizePath(locale, path);
}
