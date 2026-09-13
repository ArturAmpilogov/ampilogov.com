import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { PeopleDirectoryIndex } from "@/lib/directory-index-types";

// Read at request time by the dynamic routes that use it, so the file must be
// named in `outputFileTracingIncludes` in next.config.ts. The path below is
// built from process.cwd() and the tracer cannot follow it; a new runtime
// reader without an entry there deploys fine and then 500s on ENOENT.
let peopleIndex: PeopleDirectoryIndex | null = null;

export function getPeopleDirectoryIndex() {
  peopleIndex ??= JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/people-directory.json"),
    "utf8",
  )) as PeopleDirectoryIndex;
  return peopleIndex;
}
