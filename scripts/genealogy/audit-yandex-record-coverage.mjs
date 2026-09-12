#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const options = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  options.set(process.argv[index], process.argv[index + 1]);
}

const trackerFile = options.get("--tracker");
const trackerStatuses = new Set(String(options.get("--statuses") ?? "")
  .split(",").map((value) => value.trim()).filter(Boolean));
const trackerPairs = trackerFile
  ? (JSON.parse(readFileSync(trackerFile, "utf8")).results ?? [])
    .filter((row) => !trackerStatuses.size || trackerStatuses.has(row.status))
    .map((row) => `${row.catalogId}/${row.scanNumber}`)
  : [];
const pairs = String(options.get("--pairs") ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean)
  .concat(trackerPairs);
if (!pairs.length) throw new Error("Нужен --pairs catalog-prefix/scan,... или --tracker FILE");

const normalized = (catalogId, scanNumber) =>
  `${String(catalogId).slice(0, 8).toLowerCase()}/${Number(scanNumber)}`;
const wanted = new Set(pairs.map((value) => {
  const [catalogId, scanNumber] = value.split("/");
  return normalized(catalogId, scanNumber);
}));

const sourceFiles = execFileSync("rg", ["--files", "data/genealogy/sources"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
const covered = new Map();
for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  const value = JSON.parse(text);
  const candidates = [];
  if (value.collection?.catalogId && value.collection?.scanNumber != null) {
    candidates.push([value.collection.catalogId, value.collection.scanNumber]);
  }
  if (value.evidence?.catalogId && value.evidence?.scanNumber != null) {
    candidates.push([value.evidence.catalogId, value.evidence.scanNumber]);
  }
  for (const match of text.matchAll(/archive\/catalog\/([0-9a-f-]{36})\/(\d+)/gi)) {
    candidates.push([match[1], match[2]]);
  }
  for (const [catalogId, scanNumber] of candidates) {
    const key = normalized(catalogId, scanNumber);
    if (wanted.has(key)) covered.set(key, { file, sourceId: value.sourceId });
  }
}

const trackerMatches = new Map();
const searchFiles = execFileSync("rg", ["--files", "data/genealogy/searches"], { encoding: "utf8" })
  .trim().split("\n").filter((file) => file.endsWith(".json"));
const visit = (value, file) => {
  if (!value || typeof value !== "object") return;
  if (value.catalogId && value.scanNumber != null) {
    const key = normalized(value.catalogId, value.scanNumber);
    if (wanted.has(key)) {
      const matches = trackerMatches.get(key) ?? [];
      matches.push({
        file,
        status: value.status,
        sourceId: value.sourceId,
        primaryScanReading: value.primaryScanReading,
        capture: value.capture,
      });
      trackerMatches.set(key, matches);
    }
  }
  for (const nested of Object.values(value)) visit(nested, file);
};
for (const file of searchFiles) {
  try { visit(JSON.parse(readFileSync(file, "utf8")), file); } catch { /* unrelated audit fragments */ }
}

const results = [...wanted].map((key) => ({
  key,
  source: covered.get(key) ?? null,
  trackerMatches: trackerMatches.get(key) ?? [],
}));
console.log(JSON.stringify({
  checked: results.length,
  covered: results.filter((row) => row.source).length,
  uncovered: results.filter((row) => !row.source).length,
  results,
}, null, 2));
