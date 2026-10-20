#!/usr/bin/env node
// Lists which record and person cards have a translation in translations/<locale>/.
// The site links to a localized card only when it is listed here; untranslated
// cards stay on their Russian URL. Run after adding or removing card translations
// (it also runs before `dev` and `build`).
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const locales = ["en", "uk", "be"];
const kinds = ["records", "people"];
const outputPath = path.join(root, "src/i18n/card-translations.json");

const manifest = Object.fromEntries(locales.map((locale) => [
  locale,
  Object.fromEntries(kinds.map((kind) => {
    const directory = path.join(root, "translations", locale, kind);
    const ids = existsSync(directory)
      ? readdirSync(directory)
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.slice(0, -".json".length))
        .sort()
      : [];
    return [kind, ids];
  })),
]));

const next = `${JSON.stringify(manifest, null, 2)}\n`;
writeFileSync(outputPath, next);
const counts = locales
  .map((locale) => `${locale}: ${kinds.map((kind) => `${manifest[locale][kind].length} ${kind}`).join(", ")}`)
  .join("; ");
console.log(`Card translations — ${counts}`);
