import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defaultLocale, type Locale } from "@/i18n/config";

/**
 * A record or person card translation: translations/<locale>/<kind>/<id>.json.
 *
 * Cards are rendered from Russian data, and the page logic keeps working on the
 * Russian values. A translation is a dictionary from a displayed Russian string
 * to its translation, applied only when the string is rendered. When the Russian
 * data changes, the old entry simply stops matching and the new text shows in
 * Russian until it is translated again, so a stale translation never shows
 * outdated facts. Literal transcriptions of documents are never translated.
 *
 * `pnpm i18n:card <locale> <records|people> <id>` creates or refreshes the file
 * with every translatable string of the card.
 */
export type CardTranslationFile = {
  locale: Exclude<Locale, "ru">;
  kind: CardKind;
  id: string;
  strings: Record<string, string>;
};

export type CardKind = "records" | "people";

export type CardTranslator = {
  /** True when the locale has a translation file for this card. */
  translated: boolean;
  t: (value: string) => string;
  /** Translates an optional value, keeping null/undefined. */
  tMaybe: <T extends string | null | undefined>(value: T) => T;
};

const identity: CardTranslator = {
  translated: true,
  t: (value) => value,
  tMaybe: (value) => value,
};

const TRANSLATIONS_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), "translations");

export function cardTranslationPath(locale: Locale, kind: CardKind, id: string) {
  return path.join(TRANSLATIONS_ROOT, locale, kind, `${id}.json`);
}

export function getCardTranslator(locale: Locale, kind: CardKind, id: string): CardTranslator {
  if (locale === defaultLocale) return identity;
  const file = cardTranslationPath(locale, kind, id);
  if (!existsSync(file)) return { translated: false, t: identity.t, tMaybe: identity.tMaybe };
  const { strings } = JSON.parse(readFileSync(file, "utf8")) as CardTranslationFile;
  const lookup = (value: string) => {
    const translated = strings[value];
    return translated === undefined || translated === "" ? value : translated;
  };
  return {
    translated: true,
    t: lookup,
    tMaybe: <T extends string | null | undefined>(value: T) => (typeof value === "string" ? lookup(value) : value) as T,
  };
}
