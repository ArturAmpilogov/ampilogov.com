import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

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

let registry: SourceRegistryIndex | null = null;

export function getSourceRegistryIndex() {
  registry ??= JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/source-registry.json"),
    "utf8",
  )) as SourceRegistryIndex;
  return registry;
}
