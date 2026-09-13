#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pagesRoot = "/private/tmp/anpilogov-exact-current-page";
const output = path.join(
  root,
  "data/genealogy/searches/yandex-archive-anpilogov-exact-2026-09-12-pages-001-025.json",
);
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
    });
    sourcesByUrl.set(url, linked);
  }
}

const rows = [];
const seen = new Set();
for (let page = 1; page <= 25; page++) {
  const html = await readFile(`${pagesRoot}${page}.html`, "utf8");
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
    if (!linked.length) throw new Error(`Без Record: ${canonicalUrl}`);
    const duplicate = seen.has(canonicalUrl);
    seen.add(canonicalUrl);
    rows.push({
      ordinal: rows.length + 1,
      page,
      position: position + 1,
      catalogId: item.parentId,
      scanNumber: item.sheetPageNumber,
      canonicalUrl,
      dates: [item.dateFrom, item.dateTo].filter(Boolean),
      title: (props.breadcrumbs?.[item.parentId] ?? []).at(-1)?.name ?? item.name,
      indexSnippet: (item.snippet ?? "").replace(/[\u0000-\u001f\u007f\[\]]/g, "").trim(),
      status: duplicate ? "complete-duplicate-position" : "complete-with-primary-record",
      sourceIds: [...new Set(linked.map((entry) => entry.sourceId))].sort(),
      sourceFiles: [...new Set(linked.map((entry) => entry.sourceFile))].sort(),
      evidencePaths: [...new Set(linked.flatMap((entry) => entry.evidencePaths))].sort(),
    });
  }
}

const uniqueUrls = new Set(rows.map((row) => row.canonicalUrl));
const uniquePublicRecordScans = [...uniqueUrls].filter((url) =>
  (sourcesByUrl.get(url) ?? []).some((source) => source.isRecord === true && source.publicCore !== false)
).length;
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-exact-2026-09-12-pages-001-025",
  status: "complete",
  capturedAt: "2026-09-12",
  verifiedAt: "2026-09-12",
  query: {
    text: "Анпилогов",
    index: "archive",
    updateDate: false,
    rankMode: "by_date",
    sortOrder: "ascending",
    excludeSeen: false,
    url: searchUrl,
  },
  liveSearch: {
    reportedResultCount: 1674,
    reportedPageCount: 100,
    reviewedPageRange: [1, 25],
    rowsPerPage: 10,
  },
  policy: {
    manuallyReadPrimaryScans: true,
    yandexOcrUsedOnlyForNavigation: true,
    fullAndEnlargedEvidenceRequired: true,
    privateVercelBlobBackupRequired: true,
    publicCutoffYear: 1950,
  },
  progress: {
    pagesReviewed: 25,
    rowsReviewed: rows.length,
    uniqueScansReviewed: uniqueUrls.size,
    duplicatePositions: rows.length - uniqueUrls.size,
    alreadyCoveredUniqueScans: uniqueUrls.size - 1,
    newlyProcessedUniqueScans: 1,
    uniquePublicRecordScans,
    uniqueResearchReviewScans: uniqueUrls.size - uniquePublicRecordScans,
    rowsRemaining: 0,
  },
  newFindings: [
    {
      canonicalUrl: "https://yandex.ru/archive/catalog/60745ac7-4693-48f7-83c3-5b76a9196448/243",
      sourceId: "YA-60745AC7-243",
      summary: "Запись № 141 о рождении 4 апреля и крещении 6 апреля 1848 года Георгия Афанасьевича Анпилогова; также названы родители и двое восприемников-Анпилоговых.",
    },
  ],
  pages: Array.from({ length: 25 }, (_, index) => {
    const page = index + 1;
    const pageRows = rows.filter((row) => row.page === page);
    return {
      page,
      reviewStatus: "complete",
      rows: pageRows.length,
      uniqueScans: new Set(pageRows.map((row) => row.canonicalUrl)).size,
      refs: pageRows.map((row) => `${row.catalogId}/${row.scanNumber}`),
    };
  }),
  results: rows,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.progress));
