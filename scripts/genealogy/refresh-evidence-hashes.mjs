#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const files = process.argv.slice(2);
if (!files.length) {
  console.error("Usage: node scripts/genealogy/refresh-evidence-hashes.mjs source.json [...]");
  process.exit(1);
}

async function hash(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function refreshEvidence(evidence) {
  if (!evidence) return;
  if (evidence.path) evidence.sha256 = await hash(evidence.path);
  for (const fragment of evidence.fragments ?? []) {
    if (fragment.path) fragment.sha256 = await hash(fragment.path);
  }
  for (const copy of evidence.parallelCopies ?? []) {
    if (copy.path) copy.sha256 = await hash(copy.path);
    for (const fragment of copy.fragments ?? []) {
      if (fragment.path) fragment.sha256 = await hash(fragment.path);
    }
  }
}

for (const file of files) {
  const source = JSON.parse(await readFile(file, "utf8"));
  await refreshEvidence(source.evidence);
  await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
  console.log(file);
}
