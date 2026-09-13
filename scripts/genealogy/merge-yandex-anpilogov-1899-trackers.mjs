#!/usr/bin/env node

import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const trackerPaths = [
  "data/genealogy/searches/yandex-archive-anpilogov-exact-datefrom1899-2026-09-12-pages-001-018.json",
  "data/genealogy/searches/yandex-archive-anpilogov-exact-2026-09-12-pages-019-036.json",
  "data/genealogy/searches/yandex-archive-anpilogov-after1899-2026-09-12-pages-037-054.json",
  "data/genealogy/searches/yandex-archive-anpilogov-from-1899-2026-09-12-pages-055-073.json",
];
const outputPath = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-from-1899-2026-09-12-pages-001-073.json");
const queryUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&dateFrom=1899&is_digitized=0&updateDate=0&searchZone=name%3Bsheet&rankMode=by_date&sortOrder=ascending&index=archive&excludeSeen=0";

async function filesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursive(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }))).flat();
}

function canonicalUrl(value) {
  if (typeof value !== "string" || !value.includes("yandex.ru/archive/catalog/")) return null;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function collectUrls(value, urls = new Set()) {
  if (typeof value === "string") {
    const url = canonicalUrl(value);
    if (url) urls.add(url);
  } else if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectUrls(item, urls);
  }
  return urls;
}

const sourcesByUrl = new Map();
for (const file of await filesRecursive(path.join(root, "data/genealogy/sources"))) {
  let source;
  try { source = JSON.parse(await readFile(file, "utf8")); } catch { continue; }
  if (!source.sourceId) continue;
  const evidencePaths = [source.evidence?.path, ...(source.evidence?.fragments?.map((fragment) => fragment.path) ?? [])].filter(Boolean);
  const evidencePresent = [];
  for (const evidencePath of evidencePaths) {
    try { await access(path.join(root, evidencePath)); evidencePresent.push(evidencePath); } catch {}
  }
  for (const url of collectUrls(source)) {
    const entries = sourcesByUrl.get(url) ?? [];
    entries.push({ sourceId: source.sourceId, sourceFile: path.relative(root, file), evidencePaths, evidencePresent });
    sourcesByUrl.set(url, entries);
  }
}

const rows = [];
for (const trackerPath of trackerPaths) {
  const tracker = JSON.parse(await readFile(path.join(root, trackerPath), "utf8"));
  rows.push(...(tracker.results ?? []));
}
rows.sort((left, right) => Number(left.page) - Number(right.page) || Number(left.position) - Number(right.position));

const seen = new Set();
const results = rows.map((row) => {
  const documentUrl = canonicalUrl(row.documentUrl ?? row.canonicalUrl ?? row.url)
    ?? `https://yandex.ru/archive/catalog/${row.catalogId}/${row.scanNumber}`;
  const linked = sourcesByUrl.get(documentUrl) ?? [];
  const duplicate = seen.has(documentUrl);
  seen.add(documentUrl);
  return {
    absolutePosition: (Number(row.page) - 1) * 10 + Number(row.position),
    page: Number(row.page),
    position: Number(row.position),
    catalogId: row.catalogId,
    scanNumber: Number(row.scanNumber),
    documentUrl,
    title: row.title ?? null,
    dates: row.dates ?? [row.dateFrom, row.dateTo].filter(Boolean),
    indexSnippet: row.indexSnippet ?? null,
    status: duplicate ? "complete-duplicate-position" : linked.length ? "complete-primary-source" : "missing-primary-source",
    sourceIds: [...new Set(linked.map((entry) => entry.sourceId))].sort(),
    sourceFiles: [...new Set(linked.map((entry) => entry.sourceFile))].sort(),
    evidencePaths: [...new Set(linked.flatMap((entry) => entry.evidencePaths))].sort(),
    evidencePresent: [...new Set(linked.flatMap((entry) => entry.evidencePresent))].sort(),
  };
});

if (results.length !== 724) throw new Error(`Ожидалось 724 позиции, получено ${results.length}`);
const uniqueResults = [...new Map(results.map((row) => [row.documentUrl, row])).values()];
const missing = uniqueResults.filter((row) => row.status === "missing-primary-source");
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-from-1899-2026-09-12-pages-001-073",
  status: missing.length ? "in-progress" : "complete",
  capturedAt: "2026-09-12",
  verifiedAt: missing.length ? null : "2026-09-12",
  query: { text: "Анпилогов", dateFrom: 1899, index: "archive", searchZone: ["name", "sheet"], isDigitized: false, updateDate: false, rankMode: "by_date", sortOrder: "ascending", excludeSeen: false, url: queryUrl },
  liveSearch: { reportedResultCount: 724, reportedPageCount: 73, reviewedPageRange: [1, 73] },
  policy: { manuallyReadPrimaryScans: true, yandexOcrUsedOnlyForNavigation: true, fullHeaderTargetEvidenceRequired: true, privateVercelBlobBackupRequired: true, publicCutoffYear: 1950 },
  progress: {
    pagesReviewed: 73,
    rowsReviewed: results.length,
    uniqueScansReviewed: uniqueResults.length,
    duplicatePositions: results.length - uniqueResults.length,
    coveredUniqueScans: uniqueResults.length - missing.length,
    missingUniqueScans: missing.length,
    rowsRemaining: missing.length,
  },
  componentTrackers: trackerPaths,
  results,
};

await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.progress));
for (const row of missing) console.log(`missing\t${row.page}:${row.position}\t${row.catalogId}/${row.scanNumber}`);
