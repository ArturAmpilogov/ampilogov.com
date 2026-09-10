#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilogov-global-fuzzy-2026-09-10.json");
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
    source.transcription.status = confirmed ? "complete-primary-scan-dual-ocr-collation" : "complete-with-explicit-reading-uncertainty";
    source.review.status = confirmed ? "complete-primary-scan-collation-with-local-evidence" : "complete-but-reading-uncertain";
    source.review.transcriptionConfidence = confirmed ? "medium-high" : "medium-with-explicit-uncertainty";
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
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ uniqueProcessedScans: groups.size, stronglyConfirmed: strong, explicitlyUncertain: uncertain }, null, 2));
