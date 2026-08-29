import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

export type MapDirectoryManifest = {
  schemaVersion: number;
  generatedAt: string;
  version: string;
  directoryPath: string;
  range: { minYear: number; maxYear: number };
  stats: {
    indexedPlaces: number;
    mappedPlaces: number;
    approximatePlaces: number;
    records: number;
    migrations: number;
  };
};

let manifest: MapDirectoryManifest | null = null;

export function getMapDirectoryManifest() {
  manifest ??= JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/map-directory.json"),
    "utf8",
  )) as MapDirectoryManifest;
  return manifest;
}
