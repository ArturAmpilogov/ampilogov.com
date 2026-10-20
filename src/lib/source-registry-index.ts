import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { defaultLocale, type Locale } from "@/i18n/config";

export type SourceRegistryEntry = {
  sourceId: string;
  id: string;
  title: string;
  type: string;
  status: string;
  path: string;
};

export type SourceRegistryIndex = {
  schemaVersion: number;
  generatedAt: string;
  version: string;
  intro: string;
  groups: Array<{
    title: string;
    entries: SourceRegistryEntry[];
  }>;
};

const registries = new Map<Locale, SourceRegistryIndex>();

/** The registry in the locale when translations/<locale>/docs/research/sources.md exists, else Russian. */
export function getSourceRegistryIndex(locale: Locale = defaultLocale) {
  const cached = registries.get(locale);
  if (cached) return cached;
  const indexes = path.join(process.cwd(), "data/genealogy/indexes");
  const localized = path.join(indexes, `source-registry.${locale}.json`);
  const file = locale !== defaultLocale && existsSync(localized) ? localized : path.join(indexes, "source-registry.json");
  const registry = JSON.parse(readFileSync(file, "utf8")) as SourceRegistryIndex;
  registries.set(locale, registry);
  return registry;
}
