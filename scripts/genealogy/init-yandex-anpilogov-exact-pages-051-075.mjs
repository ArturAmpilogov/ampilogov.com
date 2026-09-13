#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pagePrefix = "/private/tmp/anpilogov-exact-current-page";
const output = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-exact-2026-09-12-pages-051-075.json");
const searchUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&updateDate=0&rankMode=by_date&sortOrder=ascending&index=archive&excludeSeen=0";
const marker = '<script id="__NEXT_DATA__" type="application/json">';

async function filesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursive(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }))).flat();
}

function canonicalYandexUrl(value) {
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
for (const file of await filesRecursive(path.join(root, "data/genealogy/sources"))) {
  let source;
  try {
    source = JSON.parse(await readFile(file, "utf8"));
  } catch {
    continue;
  }
  if (!source.sourceId) continue;
  const evidencePaths = [source.evidence?.path]
    .concat(source.evidence?.fragments?.map((fragment) => fragment.path) ?? [])
    .filter(Boolean);
  for (const url of collectUrls(source)) {
    const linked = sourcesByUrl.get(url) ?? [];
    linked.push({
      sourceId: source.sourceId,
      sourceFile: path.relative(root, file),
      evidencePaths,
      reviewStatus: source.review?.status ?? null,
      isRecord: source.isRecord ?? null,
      publicCore: source.publicCore ?? null,
      documentOnlyVisuallyConfirmed: source.evidence?.quality?.documentOnlyVisuallyConfirmed === true,
      targetRowsVisuallyConfirmed: source.evidence?.quality?.targetRowsVisuallyConfirmed === true,
    });
    sourcesByUrl.set(url, linked);
  }
}

const rows = [];
const seenInRange = new Set();
for (let page = 51; page <= 75; page++) {
  const html = await readFile(`${pagePrefix}${page}.html`, "utf8");
  const from = html.indexOf(marker);
  const to = from < 0 ? -1 : html.indexOf("</script>", from);
  if (from < 0 || to < 0) throw new Error(`Нет __NEXT_DATA__ на странице ${page}`);
  const props = JSON.parse(html.slice(from + marker.length, to)).props.pageProps;
  if (Number(props.pageNum) !== page || Number(props.totalDocs) !== 1674 || Number(props.totalPages) !== 100 || props.items.length !== 10) {
    throw new Error(`Нестабильная страница ${page}`);
  }
  for (let position = 0; position < props.items.length; position++) {
    const item = props.items[position];
    const canonicalUrl = `https://yandex.ru/archive/catalog/${item.parentId}/${item.sheetPageNumber}`;
    const linked = sourcesByUrl.get(canonicalUrl) ?? [];
    const duplicateInRange = seenInRange.has(canonicalUrl);
    seenInRange.add(canonicalUrl);
    const visuallyConfirmed = linked.some((entry) => entry.documentOnlyVisuallyConfirmed && entry.targetRowsVisuallyConfirmed);
    rows.push({
      absolutePosition: (page - 1) * 10 + position + 1,
      page,
      position: position + 1,
      catalogId: item.parentId,
      scanNumber: item.sheetPageNumber,
      nodeId: item.nodeId,
      documentUrl: canonicalUrl,
      dateFrom: item.dateFrom,
      dateTo: item.dateTo,
      title: (props.breadcrumbs?.[item.parentId] ?? []).at(-1)?.name ?? item.name,
      indexSnippet: (item.snippet ?? "").replace(/[\u0000-\u001f\u007f\[\]]/g, "").trim(),
      status: duplicateInRange ? "duplicate-position-in-range" : linked.length ? (visuallyConfirmed ? "existing-visually-confirmed" : "existing-needs-visual-audit") : "pending-new-source",
      sourceIds: [...new Set(linked.map((entry) => entry.sourceId))].sort(),
      sourceFiles: [...new Set(linked.map((entry) => entry.sourceFile))].sort(),
      evidencePaths: [...new Set(linked.flatMap((entry) => entry.evidencePaths))].sort(),
    });
  }
}

// Keep the first occurrence: later repeated search positions are deliberately
// marked as duplicates and must not hide the source status of the first row.
const uniqueRows = [...new Map(rows.map((row) => [row.documentUrl, row]).reverse()).values()].reverse();
const pending = uniqueRows.filter((row) => row.status === "pending-new-source");
const needsAudit = uniqueRows.filter((row) => row.status === "existing-needs-visual-audit");
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-exact-2026-09-12-pages-051-075",
  status: pending.length || needsAudit.length ? "in-progress" : "complete",
  capturedAt: "2026-09-12",
  query: { text: "Анпилогов", index: "archive", updateDate: false, rankMode: "by_date", sortOrder: "ascending", excludeSeen: false, url: searchUrl },
  liveSearch: { reportedResultCount: 1674, reportedPageCount: 100, reviewedPageRange: [51, 75], rowsPerPage: 10 },
  policy: { manuallyReadPrimaryScans: true, yandexOcrUsedOnlyForNavigation: true, fullAndEnlargedEvidenceRequired: true, privateVercelBlobBackupRequired: true, publicCutoffYear: 1950 },
  progress: {
    pagesInventoried: 25,
    rowsFound: rows.length,
    uniqueScansInRange: uniqueRows.length,
    duplicatePositions: rows.length - uniqueRows.length,
    existingVisuallyConfirmed: uniqueRows.filter((row) => row.status === "existing-visually-confirmed").length,
    existingNeedsVisualAudit: needsAudit.length,
    pendingNewSources: pending.length,
  },
  results: rows,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.progress));
for (const row of [...needsAudit, ...pending]) console.log(`${row.status}\t${row.page}:${row.position}\t${row.catalogId}/${row.scanNumber}\t${row.indexSnippet}`);
