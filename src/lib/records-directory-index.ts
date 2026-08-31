import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { RecordsDirectoryIndex } from "@/lib/directory-index-types";

let recordsIndex: RecordsDirectoryIndex | null = null;

export function getRecordsDirectoryIndex() {
  const currentIndex = JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/records-directory.json"),
    "utf8",
  )) as RecordsDirectoryIndex;
  if (process.env.NODE_ENV !== "production") return currentIndex;
  recordsIndex ??= currentIndex;
  return recordsIndex;
}
