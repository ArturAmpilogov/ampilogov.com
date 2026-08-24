import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { PeopleDirectoryIndex, RecordsDirectoryIndex } from "@/lib/directory-index-types";

const INDEX_ROOT = path.join(process.cwd(), "data/genealogy/indexes");

let recordsIndex: RecordsDirectoryIndex | null = null;
let peopleIndex: PeopleDirectoryIndex | null = null;

function readIndex<T>(file: string) {
  return JSON.parse(readFileSync(path.join(INDEX_ROOT, file), "utf8")) as T;
}

export function getRecordsDirectoryIndex() {
  recordsIndex ??= readIndex<RecordsDirectoryIndex>("records-directory.json");
  return recordsIndex;
}

export function getPeopleDirectoryIndex() {
  peopleIndex ??= readIndex<PeopleDirectoryIndex>("people-directory.json");
  return peopleIndex;
}
