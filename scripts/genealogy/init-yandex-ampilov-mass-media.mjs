#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const inputPath = "/private/tmp/yandex-ampilov-mass-media-browser-export.json";
const outputPath = path.join(
  root,
  "data/genealogy/searches/yandex-archive-ampilov-mass-media-2026-09-10.json",
);
const sourcesRoot = path.join(root, "data/genealogy/sources");
const evidenceRoot = path.join(root, "data/genealogy/evidence-private/yandex");

async function filesRecursive(directory, suffix = "") {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return filesRecursive(entryPath, suffix);
      return entry.isFile() && (!suffix || entry.name.endsWith(suffix))
        ? [entryPath]
        : [];
    }),
  );
  return nested.flat();
}

function canonicalYandexUrl(value) {
  if (typeof value !== "string" || !value.includes("yandex.ru/archive/catalog/")) {
    return null;
  }
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function collectUrls(value, urls = new Set()) {
  if (typeof value === "string") {
    const url = canonicalYandexUrl(value);
    if (url) urls.add(url);
  } else if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectUrls(item, urls);
  }
  return urls;
}

const sourcesByUrl = new Map();
for (const file of await filesRecursive(sourcesRoot, ".json")) {
  let source;
  try {
    source = JSON.parse(await readFile(file, "utf8"));
  } catch {
    continue;
  }
  if (!source.sourceId) continue;
  for (const url of collectUrls(source)) {
    const linked = sourcesByUrl.get(url) ?? [];
    linked.push({
      sourceId: source.sourceId,
      reviewStatus: source.review?.status ?? "",
    });
    sourcesByUrl.set(url, linked);
  }
}

const raw = JSON.parse(await readFile(inputPath, "utf8"));
const results = [];
for (const row of raw) {
  const linked = sourcesByUrl.get(row.documentUrl) ?? [];
  const number = String(row.scanNumber).padStart(4, "0");
  const directory = path.join(evidenceRoot, row.catalogId);
  const evidence = await filesRecursive(directory);
  const hasFull = evidence.some((file) => path.basename(file) === `${number}-full-view.png`);
  const hasHeader = evidence.some((file) => path.basename(file) === `${number}-header.png`);
  const hasTarget = evidence.some((file) =>
    path.basename(file).startsWith(`${number}-target-entry`),
  );
  const hasCompleteEvidence = hasFull && hasHeader && hasTarget;
  const sourceComplete = linked.some((item) => item.reviewStatus.startsWith("complete"));
  const status = linked.length && hasCompleteEvidence && sourceComplete
    ? "existing-complete"
    : linked.length
      ? "pending-existing-record-evidence-upgrade"
      : "pending-primary-scan-review";
  results.push({
    ...row,
    status,
    capture: status !== "existing-complete",
    sourceIds: linked.length
      ? [...new Set(linked.map((item) => item.sourceId))].sort()
      : undefined,
  });
}

const pending = results.filter((row) => row.capture);
const uniquePending = new Set(
  pending.map((row) => `${row.catalogId}/${row.scanNumber}`),
);
const inventory = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-ampilov-mass-media-2026-09-10",
  status: "inventory-complete-processing-in-progress",
  createdAt: "2026-09-10",
  queryText: "Ампилов",
  rules: {
    sort: "ascending-by-date",
    exactQuery: true,
    deduplicateByCatalogAndScan: true,
    verifyAgainstPrimaryScan: true,
    localEvidenceRequired: true,
    publicYandexLinkOnly: true,
    publicCutoffYear: 1950,
  },
  progress: {
    pagesInventoried: 17,
    rowsFound: 163,
    rowsCompleted: results.length - pending.length,
    uniqueScansPending: uniquePending.size,
    rowsRemaining: pending.length,
  },
  batches: [
    {
      index: "mass_media",
      searchUrl:
        "https://yandex.ru/archive/search?text=%D0%90%D0%BC%D0%BF%D0%B8%D0%BB%D0%BE%D0%B2&index=mass_media&updateDate=0&excludeSeen=0&rankMode=by_date&sortOrder=ascending",
      reportedPages: 17,
      reportedResults: 163,
      results,
    },
  ],
};

await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
console.log(JSON.stringify(inventory.progress));
