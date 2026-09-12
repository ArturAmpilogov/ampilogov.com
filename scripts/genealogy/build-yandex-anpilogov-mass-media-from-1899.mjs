import { createHash } from "node:crypto";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseTrackerPath = "data/genealogy/searches/yandex-archive-anpilogov-mass-media-2026-09-12.json";
const fuzzyTrackerPath = "data/genealogy/searches/yandex-archive-ampilogov-mass-media-fuzzy-2026-09-10.json";
const outputPath = "data/genealogy/searches/yandex-archive-anpilogov-mass-media-from-1899-2026-09-13.json";
const newKey = "807a7f70-f6c8-4524-a879-88549803cdc9/2";

const load = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
const keyOf = (row) => `${row.catalogId}/${row.scanNumber}`;
const flatten = (tracker) => tracker.pages.flatMap((page) =>
  page.results.map((row) => ({ ...row, normalizedPage: page.page })),
);
const fnv1a = (value) => {
  let hash = 2166136261 >>> 0;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};
const yearOf = (row) => Number(String(row.date ?? "").match(/(?:^|\D)(1\d{3}|20\d{2})(?:\D|$)/)?.[1] ?? 0);

const base = await load(baseTrackerPath);
const fuzzy = await load(fuzzyTrackerPath);
const baseRows = flatten(base);
const firstIndex = baseRows.findIndex((row) => keyOf(row) === "fbd4cdb1-3069-4793-a6e4-b8953793c48d/1");
if (firstIndex !== 79) throw new Error(`Unexpected base boundary: ${firstIndex}`);

const baseSlice = baseRows.slice(firstIndex);
if (baseSlice.length !== 446) throw new Error(`Unexpected base slice length: ${baseSlice.length}`);

const pageKeys = Array.from({ length: 45 }, (_, index) =>
  baseSlice.slice(index * 10, Math.min(baseSlice.length, (index + 1) * 10)).map(keyOf),
);
const swap = (page, left, right) => {
  [pageKeys[page - 1][left], pageKeys[page - 1][right]] = [pageKeys[page - 1][right], pageKeys[page - 1][left]];
};

swap(1, 7, 8);
swap(3, 6, 7);
swap(4, 4, 5);
swap(10, 5, 6);
swap(10, 7, 8);
swap(16, 0, 1);
swap(16, 2, 3);
pageKeys[23] = [pageKeys[23][0], newKey, ...pageKeys[23].slice(1, 9)];
pageKeys[24] = [
  "0ff622c0-7e0f-44e2-8ce8-88cc4cc4f0dc/1",
  "0ff622c0-7e0f-44e2-8ce8-88cc4cc4f0dc/3",
  "df2fe723-939e-46db-a3bd-dcbc4efd1a5d/2",
  "df2fe723-939e-46db-a3bd-dcbc4efd1a5d/4",
  ...pageKeys[24].slice(4),
];
for (const [page, nextPage] of [[27, 28], [30, 31], [36, 37], [44, 45]]) {
  pageKeys[page - 1] = [...pageKeys[page - 1].slice(1), pageKeys[nextPage - 1][0]];
}

const expectedPageHashes = "a37377b3 552c18fe d6ae956a 6074ec78 bf0c280a 4d8bac17 49c1b5c8 73bddd3d 8c0268fe 4f3b3027 502fffa6 58114314 d75ab8b1 c5eb1f3f 583046e0 909639ff 9c5319d9 8e356caf 83f6c53b cb3e71db 37aa4c41 b2227cbc ca6a9d29 ab278931 c3d33492 92e16a05 66d9b96e b546c7d0 23446d3d 2eadb493 54f79210 5f96b0dd d1f3db50 8f470582 27c65cab 0d743273 c46b907e 5d96669f 62df6618 6de80cdf 4f7d4435 f955d0e8 b3fc92b7 bc85e245 a4476a86".split(" ");
const actualPageHashes = pageKeys.map((keys) => fnv1a(keys.join("\n")));
if (JSON.stringify(actualPageHashes) !== JSON.stringify(expectedPageHashes)) {
  throw new Error("Reconstructed page order differs from the live 45-page inventory");
}

const baseRowsByKey = new Map(baseRows.map((row) => [keyOf(row), row]));
const fuzzyRows = fuzzy.batches.flatMap((batch) => batch.results);
const fuzzyNewRow = fuzzyRows.find((row) => keyOf(row) === newKey);
if (!fuzzyNewRow) throw new Error(`Existing processed row not found: ${newKey}`);

const correctedReading = "Это вовсе не значит, что нам необходимы одни лишь гулливеры!.. Без правильного сочетания «больших» и «маленьких» хорошую команду не создать. Но игроки ростом под два метра нам нужны как воздух. Это доказывает удачное выступление сборной Грузии, где есть Анпилогов, сборной Москвы, где в стартовом составе выходил Чернышев. В сборной Украины полезно, особенно в защите, сыграл Кушнирюк, которого мы намерены пригласить в сборную.";
const normalizedNewRow = {
  catalogId: fuzzyNewRow.catalogId,
  scanNumber: fuzzyNewRow.scanNumber,
  date: fuzzyNewRow.date,
  publication: fuzzyNewRow.publication,
  ocrHint: fuzzyNewRow.indexSnippet,
  yandexUrl: fuzzyNewRow.documentUrl,
  status: "complete-private-research-post-cutoff-existing-source-primary-scan-rechecked",
  note: "Ранее обработано в нечётком поиске; 13 сентября 2026 года фамилия и контекст повторно прочитаны по исходной полосе, а ошибочный целевой фрагмент заменён.",
  sourceId: fuzzyNewRow.sourceId,
  primaryScanReading: correctedReading,
  originalTracker: fuzzyTrackerPath,
  originalPage: fuzzyNewRow.page,
};

const rowForKey = (key) => key === newKey ? normalizedNewRow : baseRowsByKey.get(key);
const pages = pageKeys.map((keys, pageIndex) => ({
  page: pageIndex + 1,
  status: "complete",
  reportedRows: keys.length,
  liveKeyHash: actualPageHashes[pageIndex],
  results: keys.map((key, positionIndex) => {
    const source = rowForKey(key);
    if (!source) throw new Error(`No processed row for live result ${key}`);
    return {
      ...source,
      position: positionIndex + 1,
      previousNormalizedPage: source.normalizedPage,
      normalizedPage: undefined,
    };
  }),
}));

const rows = pages.flatMap((page) => page.results.map((row) => ({ ...row, page: page.page })));
const frequencies = new Map();
for (const row of rows) frequencies.set(keyOf(row), (frequencies.get(keyOf(row)) ?? 0) + 1);
const duplicateGroups = [...frequencies.entries()].filter(([, count]) => count > 1).map(([key, count]) => ({
  key,
  count,
  occurrences: rows.filter((row) => keyOf(row) === key).map(({ page, position }) => ({ page, position })),
}));

const newSource = await load("data/genealogy/sources/yandex/YA-807A7F70-002.json");
for (const relativePath of [newSource.evidence.path, ...newSource.evidence.fragments.map((fragment) => fragment.path)]) {
  await access(path.join(root, relativePath));
}
const targetFragment = newSource.evidence.fragments.find((fragment) => fragment.kind === "target-entry");
const targetBytes = await readFile(path.join(root, targetFragment.path));
const targetSha256 = createHash("sha256").update(targetBytes).digest("hex");
if (targetSha256 !== targetFragment.sha256) throw new Error("Corrected target crop hash does not match its source record");

const absentSinceBaseRun = [
  "65d248d4-3dbf-4779-910e-b401923aed66/3",
  "90ce8d68-f05f-4dbb-ab01-868ec62076de/1",
  "cff96d45-d7c7-47d2-896d-608ed628b278/3",
  "93e2ebb6-5001-4c93-8b29-298d995f28e7/1",
];
const tracker = {
  schemaVersion: 1,
  searchRunId: "YANDEX-ARCHIVE-ANPILOGOV-MASS-MEDIA-FROM-1899-2026-09-13",
  status: "complete",
  createdAt: "2026-09-13",
  query: {
    provider: "Яндекс Архив",
    text: "Анпилогов",
    dateFrom: 1899,
    index: "mass_media",
    sort: "ascending-by-date",
    reportedResultCount: 446,
    reportedPageCount: 45,
    searchUrl: "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&dateFrom=1899&index=mass_media&updateDate=0&excludeSeen=0&rankMode=by_date&sortOrder=ascending",
  },
  scope: {
    actualPages: "1–45",
    publicCutoffInclusive: 1950,
    keyDefinition: "catalogId/scanNumber",
    reusePolicy: "Rows already completed in the comprehensive exact or fuzzy mass-media searches reuse their manually verified transcription and evidence.",
  },
  progress: {
    pagesCompleted: 45,
    rowPositionsReviewed: rows.length,
    uniqueCatalogScanKeys: frequencies.size,
    exactDuplicateSearchRowGroups: duplicateGroups.length,
    extraDuplicateOccurrences: rows.length - frequencies.size,
    publicCutoffRowOccurrences: rows.filter((row) => yearOf(row) > 0 && yearOf(row) <= 1950).length,
    privateResearchRowOccurrencesAfterCutoff: rows.filter((row) => yearOf(row) > 1950 || yearOf(row) === 0).length,
    uniqueExistingSourceFilesReferenced: new Set(rows.map((row) => row.sourceId).filter(Boolean)).size,
    newlyDiscoveredAgainstExactSearchTracker: 1,
    newlyProcessedForThisQuery: 0,
    reusedFromFuzzySearch: 1,
    correctedEvidenceCrops: 1,
    correctedPrimaryScanTranscriptions: 1,
    remainingRows: 0,
  },
  reconciliation: {
    baseExactTracker: baseTrackerPath,
    previouslyProcessedNewRowTracker: fuzzyTrackerPath,
    liveInventoryMethod: "All 45 pages read in a hidden browser; catalogId/scanNumber captured for every visible result and verified by per-page FNV-1a hashes.",
    changedOrderPages: [1, 3, 4, 10, 16, 24, 25, 27, 30, 36, 44],
    addedSinceBaseExactRun: [newKey],
    absentSinceBaseExactRun: absentSinceBaseRun,
    note: "The live result total equals the 446-row suffix of the older exact tracker, but the live set changed: one already-processed fuzzy-search row was added, four old rows disappeared, and several post-1950 boundary rows are repeated.",
  },
  manualVisualReview: {
    rowsCoveredByPriorManualReview: 445,
    rowsRecheckedOnPrimaryScan: 1,
    correctedSourceId: "YA-807A7F70-002",
    result: "complete-primary-scan-reading-with-correct-local-target-crop",
    textLayerPolicy: "Yandex snippets and OCR were navigation aids only; the corrected surname and context were read from the saved original scan.",
  },
  validation: {
    complete: true,
    liveSearchVerifiedAt: "2026-09-13",
    liveSearchResults: 446,
    liveSearchPages: 45,
    livePageHashes: actualPageHashes,
    coverageIssues: [],
    unresolvedRows: [],
    correctedTargetSha256: targetSha256,
    inheritedEvidenceAudit: "data/genealogy/searches/yandex-archive-anpilogov-mass-media-2026-09-12-evidence-audit.json",
    inheritedPublicRecordsAudit: "data/genealogy/searches/yandex-archive-anpilogov-mass-media-2026-09-12-public-records-audit.json",
  },
  exactDuplicateSearchRows: duplicateGroups,
  pages,
};

if (rows.length !== 446 || pages.length !== 45 || frequencies.size !== 441) {
  throw new Error(`Unexpected coverage: pages=${pages.length}, rows=${rows.length}, unique=${frequencies.size}`);
}
await writeFile(path.join(root, outputPath), `${JSON.stringify(tracker, null, 2)}\n`);
console.log(JSON.stringify(tracker.progress, null, 2));
