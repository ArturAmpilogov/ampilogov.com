#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runName = process.argv[2] || "yandex-archive-ampilogov-global-fuzzy-2026-09-10";
const manifestPath = path.join(root, `data/genealogy/searches/${runName}.json`);
const sourceRoot = path.join(root, "data/genealogy/sources");

const filesRecursive = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? filesRecursive(file) : entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
}))).flat();

const sourceFiles = new Map();
for (const file of await filesRecursive(sourceRoot)) {
  try {
    const source = JSON.parse(await readFile(file, "utf8"));
    if (source.sourceId) sourceFiles.set(source.sourceId, { file, source });
  } catch {}
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const rows = manifest.batches.flatMap((batch) => batch.results);
const groups = new Map();
for (const row of rows.filter((item) => item.status !== "existing-complete")) {
  const key = `${row.catalogId}/${row.scanNumber}`;
  const group = groups.get(key) ?? [];
  group.push(row);
  groups.set(key, group);
}

let strong = 0;
let uncertain = 0;
let publicNewRecords = 0;
for (const group of groups.values()) {
  const row = group[0];
  const entry = sourceFiles.get(row.sourceId);
  if (!entry) throw new Error(`Нет источника ${row.sourceId}`);
  const { file, source } = entry;
  const states = [source.transcription?.collation?.baseLocalOcr, source.transcription?.collation?.assistedLocalOcr].filter(Boolean);
  const confirmed = states.some((state) => state.startsWith("confirmed-exact") || state.startsWith("confirmed-close"));
  const wasExisting = group.some((item) => item.sourceIds?.length);
  if (confirmed) strong++;
  else uncertain++;

  if (!wasExisting) {
    const localLiteral = confirmed
      ? ([source.transcription?.localOcr, source.transcription?.localOcrWithSurnameLexicon]
        .find((text) => /(?:ампилог|анпилог|аппилог|амфилог|анфилог|онпилог|ампилов|анпилов|вампилов)/iu.test(text ?? ""))
        ?? source.transcription?.localOcr ?? source.transcription?.localOcrWithSurnameLexicon)
      : (source.transcription?.localOcr || source.transcription?.localOcrWithSurnameLexicon);
    if (localLiteral) {
      source.transcription.literal = localLiteral;
      source.transcription.modernInterpretation = localLiteral.replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф").replace(/ъ\b/giu, "").replace(/\s+/g, " ").trim();
    }
    source.transcription.status = confirmed ? "complete-primary-scan-dual-ocr-collation" : "complete-with-explicit-reading-uncertainty";
    source.review.status = confirmed ? "complete-primary-scan-collation-with-local-evidence" : "complete-but-reading-uncertain";
    source.review.transcriptionConfidence = confirmed ? "medium-high" : "medium-with-explicit-uncertainty";
    if (!confirmed) {
      source.publicCore = false;
      source.isRecord = false;
      if (source.cardKind === "named-primary-record") source.cardKind = "research-material-unconfirmed-fuzzy-hit";
      for (const item of group) {
        if (item.status === "complete-with-local-evidence") item.status = "complete-unconfirmed-fuzzy-research-material";
        item.primaryScanReading = source.transcription.literal;
      }
    } else if (source.publicCore) {
      publicNewRecords += group.length;
    }
  } else if (!confirmed && source.review?.status === "complete-source-preserved-with-local-ocr-collation") {
    source.review.status = "complete-source-preserved-with-explicit-ocr-uncertainty";
    source.review.transcriptionConfidence ??= "medium-with-explicit-uncertainty";
  }
  if (!confirmed) {
    source.review ??= {};
    source.review.unresolved = [...new Set([
      ...(source.review.unresolved ?? []),
      "Фамильная форма не была уверенно воспроизведена локальным OCR; сверять с сохранённым крупным фрагментом.",
    ])];
  }
  await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
}

manifest.processingSummary.readingsWithExplicitUncertainty = uncertain;
manifest.processingSummary.readingsStronglyConfirmedByLocalOcr = strong;
manifest.processingSummary.publicNewRowsStronglyConfirmed = publicNewRecords;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ uniqueProcessedScans: groups.size, stronglyConfirmed: strong, explicitlyUncertain: uncertain, publicNewRowsStronglyConfirmed: publicNewRecords }, null, 2));
