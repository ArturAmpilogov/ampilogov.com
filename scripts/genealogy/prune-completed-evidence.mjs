#!/usr/bin/env node

// Removes local evidence only when every source that references it is complete.
// The canonical object path remains in source JSON and in private Vercel Blob.
// Run `genealogy:evidence:upload -- --verify` immediately before `--apply`.

import { readdir, readFile, stat, unlink } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const sourceRoot = path.join(root, "data/genealogy/sources");
const allowedRoots = [
  "data/genealogy/evidence-private/",
  "public/archive/evidence/",
];

async function filesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesRecursive(absolute) : [absolute];
  }));
  return nested.flat();
}

function evidencePaths(evidence) {
  if (!evidence || typeof evidence !== "object") return [];
  const values = [evidence.path, evidence.localBackup];
  for (const fragment of evidence.fragments ?? []) values.push(fragment?.path);
  for (const copy of evidence.parallelCopies ?? []) {
    values.push(copy?.path);
    for (const fragment of copy?.fragments ?? []) values.push(fragment?.path);
  }
  return [...new Set(values.filter((value) =>
    typeof value === "string" && allowedRoots.some((prefix) => value.startsWith(prefix))))];
}

function completed(source) {
  if (source.isRecord === false) return false;
  const transcription = String(source.transcription?.status ?? "").toLowerCase();
  const review = String(source.review?.status ?? "").toLowerCase();
  const positive = transcription.startsWith("complete")
    || review.startsWith("complete")
    || review.startsWith("reviewed")
    || review.startsWith("false-positive");
  const unfinished = /pending|in-progress|not-reviewed|not-transcribed/.test(`${transcription} ${review}`);
  return positive && !unfinished;
}

const references = new Map();
for (const file of (await filesRecursive(sourceRoot)).filter((file) => file.endsWith(".json"))) {
  const source = JSON.parse(await readFile(file, "utf8"));
  const isComplete = completed(source);
  for (const pathname of evidencePaths(source.evidence)) {
    const state = references.get(pathname) ?? { complete: false, incomplete: false };
    state.complete ||= isComplete;
    state.incomplete ||= !isComplete;
    references.set(pathname, state);
  }
}

const removable = [];
for (const [pathname, state] of references) {
  if (!state.complete || state.incomplete || pathname.endsWith(".part")) continue;
  const absolute = path.join(root, pathname);
  try {
    const metadata = await stat(absolute);
    if (metadata.isFile()) removable.push({ pathname, absolute, size: metadata.size });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

removable.sort((left, right) => left.pathname.localeCompare(right.pathname));
const bytes = removable.reduce((sum, file) => sum + file.size, 0);
console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  files: removable.length,
  bytes,
  gibibytes: Number((bytes / 1024 / 1024 / 1024).toFixed(2)),
}, null, 2));

if (apply) {
  for (const file of removable) await unlink(file.absolute);
  console.log(`Removed ${removable.length} locally mirrored evidence files.`);
} else {
  for (const file of removable.slice(0, 20)) console.log(file.pathname);
  if (removable.length > 20) console.log(`… and ${removable.length - 20} more`);
}
