import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { RecordsDirectoryIndex } from "@/lib/directory-index-types";

// Read at request time by the dynamic routes that use it, so the file must be
// named in `outputFileTracingIncludes` in next.config.ts. The path below is
// built from process.cwd() and the tracer cannot follow it; a new runtime
// reader without an entry there deploys fine and then 500s on ENOENT.
let recordsIndex: RecordsDirectoryIndex | null = null;

function readRecordsDirectoryIndex() {
  return JSON.parse(readFileSync(
    path.join(process.cwd(), "data/genealogy/indexes/records-directory.json"),
    "utf8",
  )) as RecordsDirectoryIndex;
}

// The index is ~20 MB and every record page reads it, so production parses it
// once per process: parsing it per page made the build quadratic in the number
// of records. The dev server rereads it to pick up regenerated indexes.
export function getRecordsDirectoryIndex() {
  if (process.env.NODE_ENV !== "production") return readRecordsDirectoryIndex();
  recordsIndex ??= readRecordsDirectoryIndex();
  return recordsIndex;
}
