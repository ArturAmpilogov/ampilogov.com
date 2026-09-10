#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("Нужен путь к манифесту");

const filesRecursive = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? filesRecursive(file) : entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
}))).flat();
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const dimensions = async (file) => { const data = await readFile(file); return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`; };

const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
const rows = [...new Map(manifest.batches.flatMap((batch) => batch.results).map((row) => [`${row.catalogId}/${row.scanNumber}`, row])).values()];
const sources = new Map();
for (const file of await filesRecursive(path.join(root, "data/genealogy/sources"))) {
  try {
    const source = JSON.parse(await readFile(file, "utf8"));
    if (source.sourceId) sources.set(source.sourceId, { file, source, dirty: false });
  } catch {}
}

let refreshed = 0;
for (const row of rows) {
  const sourceId = row.sourceId ?? row.sourceIds?.[0];
  const entry = sources.get(sourceId);
  if (!entry) throw new Error(`Нет источника для ${row.catalogId}/${row.scanNumber}`);
  const prefix = String(row.scanNumber).padStart(4, "0");
  const directory = `data/genealogy/evidence-private/yandex/${row.catalogId}`;
  const fullPath = `${directory}/${prefix}-full-view.png`;
  const headerPath = `${directory}/${prefix}-header.png`;
  const targetPath = `${directory}/${prefix}-target-entry.png`;
  const full = path.join(root, fullPath);
  const header = path.join(root, headerPath);
  const target = path.join(root, targetPath);
  const candidates = [entry.source.evidence, ...(entry.source.evidence?.parallelCopies ?? [])].filter(Boolean);
  let evidence = candidates.find((item) => item.path === fullPath || item.localBackup === fullPath);
  if (!evidence) {
    evidence = {
      catalogId: row.catalogId,
      scanNumber: row.scanNumber,
      captureStatus: "complete-with-local-copy",
      captureType: "yandex-archive-original-image-download-with-enlarged-fragments",
      path: fullPath,
      localBackup: fullPath,
      capturedAt: "2026-09-10",
      fragments: [],
      quality: {},
      publicDisplay: false,
      rightsNote: "Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив.",
    };
    entry.source.evidence ??= {};
    entry.source.evidence.parallelCopies = [...(entry.source.evidence.parallelCopies ?? []), evidence];
  }
  evidence.sha256 = await digest(full);
  evidence.fragments ??= [];
  let headerFragment = evidence.fragments.find((item) => item.path === headerPath || item.kind === "header");
  if (!headerFragment) { headerFragment = { kind: "header", path: headerPath }; evidence.fragments.push(headerFragment); }
  headerFragment.path = headerPath;
  headerFragment.sha256 = await digest(header);
  headerFragment.description ??= "Фрагмент исходного листа, фиксирующий заголовок или структуру документа.";
  let targetFragment = evidence.fragments.find((item) => item.path === targetPath || item.kind === "target-entry");
  if (!targetFragment) { targetFragment = { kind: "target-entry", path: targetPath }; evidence.fragments.push(targetFragment); }
  targetFragment.path = targetPath;
  targetFragment.sha256 = await digest(target);
  targetFragment.description ??= "Крупный фрагмент целевого упоминания без интерфейса Яндекса.";
  evidence.quality ??= {};
  evidence.quality.fullDimensions = await dimensions(full);
  evidence.quality.targetDimensions = await dimensions(target);
  evidence.quality.originalImageDownloaded = true;
  evidence.quality.headerAndTargetGeneratedFromOriginal = true;
  entry.dirty = true;
  refreshed++;
}

let written = 0;
for (const { file, source, dirty } of sources.values()) {
  if (!dirty) continue;
  await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
  written++;
}
console.log(JSON.stringify({ refreshedEvidenceSets: refreshed, sourceFilesWritten: written }));
