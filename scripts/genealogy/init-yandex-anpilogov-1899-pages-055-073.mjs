#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pagePrefix = "/private/tmp/anpilogov-1899-page-";
const output = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-from-1899-2026-09-12-pages-055-073.json");
const searchUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&dateFrom=1899&is_digitized=0&updateDate=0&searchZone=name%3Bsheet&rankMode=by_date&sortOrder=ascending&index=archive&excludeSeen=0";
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
      documentOnlyVisuallyConfirmed: source.evidence?.quality?.documentOnlyVisuallyConfirmed === true,
      targetRowsVisuallyConfirmed: source.evidence?.quality?.targetRowsVisuallyConfirmed === true,
      controlAreaVisuallyConfirmed: source.evidence?.quality?.controlAreaVisuallyConfirmed === true,
      hasLegacyOriginalAndCleanCopy: Boolean(
        source.evidence?.path
        && source.evidence?.localBackup
        && source.evidence?.fragments?.length,
      ),
    });
    sourcesByUrl.set(url, linked);
  }
}

const rows = [];
const seen = new Set();
for (let page = 55; page <= 73; page++) {
  const html = await readFile(`${pagePrefix}${page}.html`, "utf8");
  const from = html.indexOf(marker);
  const to = from < 0 ? -1 : html.indexOf("</script>", from);
  if (from < 0 || to < 0) throw new Error(`Нет __NEXT_DATA__ на странице ${page}`);
  const props = JSON.parse(html.slice(from + marker.length, to)).props.pageProps;
  const expectedItems = page === 73 ? 4 : 10;
  if (Number(props.pageNum) !== page || Number(props.totalDocs) !== 724 || Number(props.totalPages) !== 73 || props.items.length !== expectedItems) {
    throw new Error(`Нестабильная страница ${page}`);
  }
  for (let position = 0; position < props.items.length; position++) {
    const item = props.items[position];
    const documentUrl = `https://yandex.ru/archive/catalog/${item.parentId}/${item.sheetPageNumber}`;
    const linked = sourcesByUrl.get(documentUrl) ?? [];
    const duplicate = seen.has(documentUrl);
    seen.add(documentUrl);
    const visuallyConfirmed = linked.some((entry) => (
      entry.documentOnlyVisuallyConfirmed
      && (entry.targetRowsVisuallyConfirmed || entry.controlAreaVisuallyConfirmed)
    ) || entry.hasLegacyOriginalAndCleanCopy);
    rows.push({
      absolutePosition: (page - 1) * 10 + position + 1,
      page,
      position: position + 1,
      catalogId: item.parentId,
      scanNumber: item.sheetPageNumber,
      nodeId: item.nodeId,
      documentUrl,
      dateFrom: item.dateFrom,
      dateTo: item.dateTo,
      title: (props.breadcrumbs?.[item.parentId] ?? []).at(-1)?.name ?? item.name,
      indexSnippet: (item.snippet ?? "").replace(/[\u0000-\u001f\u007f\[\]]/g, "").trim(),
      status: duplicate ? "duplicate-position-in-range" : linked.length ? (visuallyConfirmed ? "existing-visually-confirmed" : "existing-needs-visual-audit") : "pending-new-source",
      capture: !duplicate && !linked.length,
      sourceIds: [...new Set(linked.map((entry) => entry.sourceId))].sort(),
      sourceFiles: [...new Set(linked.map((entry) => entry.sourceFile))].sort(),
      evidencePaths: [...new Set(linked.flatMap((entry) => entry.evidencePaths))].sort(),
    });
  }
}

const uniqueRows = [...new Map(rows.map((row) => [row.documentUrl, row]).reverse()).values()].reverse();
const pending = uniqueRows.filter((row) => row.status === "pending-new-source");
const needsAudit = uniqueRows.filter((row) => row.status === "existing-needs-visual-audit");
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-from-1899-2026-09-12-pages-055-073",
  status: pending.length || needsAudit.length ? "in-progress" : "complete",
  capturedAt: "2026-09-12",
  query: { text: "Анпилогов", dateFrom: 1899, index: "archive", searchZone: "name;sheet", isDigitized: false, updateDate: false, rankMode: "by_date", sortOrder: "ascending", excludeSeen: false, url: searchUrl },
  liveSearch: { reportedResultCount: 724, reportedPageCount: 73, reviewedPageRange: [55, 73], rowsPerFullPage: 10 },
  policy: { manuallyReadPrimaryScans: true, yandexOcrUsedOnlyForNavigation: true, fullAndEnlargedEvidenceRequired: true, privateVercelBlobBackupRequired: true, publicCutoffYear: 1950 },
  progress: {
    pagesInventoried: 19,
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
