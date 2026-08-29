import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { PeopleDirectoryIndex } from "@/lib/directory-index-types";

let peopleIndex: PeopleDirectoryIndex | null = null;

export function getPeopleDirectoryIndex() {
  peopleIndex ??= JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/people-directory.json"),
    "utf8",
  )) as PeopleDirectoryIndex;
  return peopleIndex;
}
