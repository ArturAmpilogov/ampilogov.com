#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runNames = [
  "yandex-archive-ampilogov-global-fuzzy-from-1909-2026-09-11",
  "yandex-archive-ampilogov-global-fuzzy-from-1912-2026-09-11",
  "yandex-archive-ampilogov-global-fuzzy-from-1930-2026-09-11",
  "yandex-archive-unprocessed-recapture-2026-09-11",
  "yandex-archive-unprocessed-followup-2026-09-11",
];
const sourceRoot = path.join(root, "data/genealogy/sources");
const outputPath = path.join(root, "data/genealogy/searches/yandex-owned-content-review-2026-09-11.json");

const filesRecursive = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) return filesRecursive(file);
  return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
}))).flat();

const sourceFileById = new Map();
for (const file of await filesRecursive(sourceRoot)) {
  try {
    const source = JSON.parse(await readFile(file, "utf8"));
    if (source.sourceId) sourceFileById.set(source.sourceId, file);
  } catch {}
}

const owned = new Map();
for (const runName of runNames) {
  const manifest = JSON.parse(await readFile(path.join(root, `data/genealogy/searches/${runName}.json`), "utf8"));
  for (const row of manifest.batches.flatMap((batch) => batch.results)) {
    const ids = [...new Set([...(row.sourceIds ?? []), row.sourceId].filter(Boolean))];
    for (const sourceId of ids) {
      const item = owned.get(sourceId) ?? { sourceId, runNames: [], rows: [] };
      if (!item.runNames.includes(runName)) item.runNames.push(runName);
      item.rows.push({
        runName,
        catalogId: row.catalogId,
        scanNumber: row.scanNumber,
        date: row.date,
        title: row.title,
        publication: row.publication,
        indexSnippet: row.indexSnippet,
        primaryScanReading: row.primaryScanReading,
        status: row.status,
      });
      owned.set(sourceId, item);
    }
  }
}

const items = [];
for (const item of owned.values()) {
  const file = sourceFileById.get(item.sourceId);
  if (!file) {
    items.push({ ...item, sourceFile: null, inventoryStatus: "source-file-missing" });
    continue;
  }
  const source = JSON.parse(await readFile(file, "utf8"));
  const reviewStatus = source.review?.status ?? "";
  const transcriptionStatus = source.transcription?.status ?? "";
  const deepReviewedInOwnedCampaign = Boolean(source.review?.deepReviewedAt && source.review?.deepReviewScope);
  const automatedStatus = /(?:local-ocr|ocr-uncertainty|primary-scan-collation|reading-uncertain)/i.test(`${reviewStatus} ${transcriptionStatus}`);
  const inventoryStatus = deepReviewedInOwnedCampaign
    ? "owned-deep-reviewed"
    : automatedStatus
      ? "owned-automated-reading-needs-deep-review"
      : "owned-existing-reading-preserved";
  items.push({
    ...item,
    sourceFile: path.relative(root, file).split(path.sep).join("/"),
    catalogId: source.collection?.catalogId,
    scanNumber: source.collection?.scanNumber,
    currentReviewStatus: reviewStatus,
    currentTranscriptionStatus: transcriptionStatus,
    currentCardKind: source.cardKind ?? null,
    currentLiteral: source.transcription?.literal ?? "",
    evidencePath: source.evidence?.path ?? null,
    hasEventDate: Boolean(source.event?.date?.display || source.event?.date?.iso),
    hasEventPlace: Boolean(source.event?.place?.normalized && source.event.place.normalized !== "не установлено"),
    hasLinkedPerson: Boolean(source.mentions?.some((mention) => mention.personId)),
    deepReviewedInOwnedCampaign,
    inventoryStatus,
  });
}

items.sort((left, right) => left.sourceId.localeCompare(right.sourceId));
const uniqueScans = new Set(items.map((item) => `${item.catalogId}/${Number(item.scanNumber)}`));
const output = {
  schemaVersion: 1,
  createdAt: new Date().toISOString(),
  scopeRule: "Only Source IDs explicitly recorded by the five listed runs from this conversation. No status- or catalog-based expansion is permitted.",
  runNames,
  summary: {
    manifestRows: runNames.reduce((sum, runName) => sum + items.filter((item) => item.runNames.includes(runName)).length, 0),
    uniqueSourceIds: items.length,
    uniqueScans: uniqueScans.size,
    sourceFilesMissing: items.filter((item) => !item.sourceFile).length,
    automatedReadingsNeedingDeepReview: items.filter((item) => item.inventoryStatus === "owned-automated-reading-needs-deep-review").length,
    existingReadingsPreserved: items.filter((item) => item.inventoryStatus === "owned-existing-reading-preserved").length,
    withEventDate: items.filter((item) => item.hasEventDate).length,
    withEventPlace: items.filter((item) => item.hasEventPlace).length,
    withLinkedPerson: items.filter((item) => item.hasLinkedPerson).length,
    deepReviewedInOwnedCampaign: items.filter((item) => item.deepReviewedInOwnedCampaign).length,
    remainingCampaignDeepReview: items.filter((item) => !item.deepReviewedInOwnedCampaign).length,
    campaignConfirmedRecords: items.filter((item) => item.deepReviewedInOwnedCampaign && item.currentCardKind === "named-primary-record").length,
    campaignRejectedIndexHits: items.filter((item) => item.deepReviewedInOwnedCampaign && /no-match/.test(item.currentReviewStatus)).length,
  },
  items,
};
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ outputPath, ...output.summary }, null, 2));
