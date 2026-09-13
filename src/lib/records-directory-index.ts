import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";

import type { RecordsDirectoryIndex } from "@/lib/directory-index-types";

// Read at request time by the dynamic routes that use it, so the file must be
// named in `outputFileTracingIncludes` in next.config.ts. The path below is
// built from process.cwd() and the tracer cannot follow it; a new runtime
// reader without an entry there deploys fine and then 500s on ENOENT.
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
