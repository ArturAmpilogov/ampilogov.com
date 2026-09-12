#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const capturedAt = new Date().toISOString().slice(0, 10);
const runName = process.argv[2] || `yandex-archive-unprocessed-recapture-${capturedAt}`;
const mode = process.argv[3] || "recapture";
const sourceRoot = path.join(root, "data/genealogy/sources");
const manifestPath = path.join(root, `data/genealogy/searches/${runName}.json`);

const filesRecursive = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) return filesRecursive(file);
  return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
}))).flat();

const pendingStatus = "needs-recapture-before-family-record";
const grouped = new Map();
for (const file of await filesRecursive(sourceRoot)) {
  let source;
  try { source = JSON.parse(await readFile(file, "utf8")); } catch { continue; }
  const reviewStatus = source.review?.status ?? "";
  const transcriptionStatus = source.transcription?.status ?? "";
  const explicitlyNeedsRecapture = reviewStatus === pendingStatus || transcriptionStatus === pendingStatus;
  const followupIncomplete = ["needs-review", "needs-human-review", "needs-recapture-for-overview", "partial", "primary-scan-partially-verified"].includes(reviewStatus) ||
    ["partial", "partial-primary-scan-transcription", "primary-scan-quality-review", "name-index"].includes(transcriptionStatus);
  const excludedAsAlreadyCompleted = reviewStatus.startsWith("complete-source-preserved") || reviewStatus === "primary-scan-reviewed-no-match";
  if (mode === "followup" ? (!followupIncomplete || excludedAsAlreadyCompleted) : !explicitlyNeedsRecapture) continue;
  const catalogId = source.collection?.catalogId;
  const scanNumber = Number(source.collection?.scanNumber);
  if (!catalogId || !Number.isInteger(scanNumber)) continue;
  const key = `${catalogId}/${scanNumber}`;
  const item = grouped.get(key) ?? {
    catalogId,
    scanNumber,
    documentUrl: source.links?.documentUrl ?? `https://yandex.ru/archive/catalog/${catalogId}/${scanNumber}`,
    title: source.collection?.title ?? source.collection?.asRead ?? "Архивный источник, требующий повторной съёмки",
    publication: source.collection?.publication ?? "",
    date: source.event?.date?.display ?? "дата не установлена",
    indexSnippet: source.indexData?.querySnippet ?? source.transcription?.indexNote ?? source.transcription?.literal ?? "",
    sourceIds: [],
  };
  item.sourceIds.push(source.sourceId);
  grouped.set(key, item);
}

const results = [...grouped.values()].sort((left, right) => left.catalogId.localeCompare(right.catalogId) || left.scanNumber - right.scanNumber)
  .map((row, index) => ({
    absolutePosition: index + 1,
    page: null,
    position: null,
    ...row,
    status: "pending-existing-record-full-recapture-and-reading",
    capture: true,
  }));
const sourceCards = results.reduce((sum, row) => sum + row.sourceIds.length, 0);
const manifest = {
  schemaVersion: 1,
  searchRunId: runName,
  status: "inventory-complete-processing-in-progress",
  createdAt: capturedAt,
  queryText: "Ампилогов",
  evidenceRoot: mode === "followup"
    ? `data/genealogy/evidence-private/yandex-followup-${capturedAt}`
    : `data/genealogy/evidence-private/yandex-recapture-${capturedAt}`,
  scope: mode === "followup"
    ? "Yandex Archive source cards with genuinely incomplete transcription or review status after completed and rejected cards were excluded"
    : "All Yandex Archive source cards explicitly marked needs-recapture-before-family-record",
  rules: {
    indexIsNavigationOnly: true,
    localOriginalReadingHasPriority: true,
    fullOriginalAndEnlargedFragmentsRequired: true,
    publicEvidenceLinkMustRemainYandexOnly: true,
    publicCutoffYearInclusive: 1950,
  },
  progress: {
    pagesInventoried: 0,
    rowsFoundOnAccessiblePages: results.length,
    sourceCardsFound: sourceCards,
    rowsCompleted: 0,
    uniqueScansPending: results.length,
    rowsRemaining: results.length,
  },
  batches: [{
    index: "archive-recapture",
    searchUrl: null,
    reportedPages: 0,
    reportedResults: results.length,
    accessibleRows: results.length,
    results,
  }],
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ manifestPath, sourceCards, uniqueScans: results.length }, null, 2));
