import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { RecordsDirectoryIndex } from "@/lib/directory-index-types";

let recordsIndex: RecordsDirectoryIndex | null = null;

export function getRecordsDirectoryIndex() {
  recordsIndex ??= JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/records-directory.json"),
    "utf8",
  )) as RecordsDirectoryIndex;
  return recordsIndex;
}
