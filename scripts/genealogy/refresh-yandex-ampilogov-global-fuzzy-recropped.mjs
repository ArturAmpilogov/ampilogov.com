#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const runName = "yandex-archive-ampilogov-global-fuzzy-2026-09-10";
const manifest = JSON.parse(await readFile(path.join(root, `data/genealogy/searches/${runName}.json`), "utf8"));
const base = JSON.parse(await readFile(path.join(root, `data/genealogy/searches/${runName}-local-ocr.json`), "utf8"));
const assisted = JSON.parse(await readFile(path.join(root, `data/genealogy/searches/${runName}-local-ocr-assisted.json`), "utf8"));
const keys = new Set([
  "28ad9379-ae01-40ee-80fe-cf0139b0056d/124",
  "240ea1a2-1983-4c7e-b322-767fe18f1373/69",
  "db9db1ae-5dab-47ec-9351-48369144b5af/42",
  "6f3d154a-c332-4703-8efa-eb3514c2155a/172",
  "402365bb-75f1-4326-8e51-a08710b1c44a/219",
  "0d24d92d-6f06-4ca8-a5ba-0e7aad3f4477/45",
]);
const keyOf = (value) => `${value.catalogId}/${value.scanNumber}`;
const baseByKey = new Map(base.readings.map((reading) => [keyOf(reading), reading]));
const assistedByKey = new Map(assisted.readings.map((reading) => [keyOf(reading), reading]));
const rows = [...new Map(manifest.batches.flatMap((batch) => batch.results).filter((row) => keys.has(keyOf(row))).map((row) => [keyOf(row), row])).values()];

const normalize = (value) => String(value ?? "").toLowerCase().replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф").replace(/[^а-яё]/gu, "");
const forms = ["ампилогов", "анпилогов", "аппилогов", "амфилогов", "анфилогов", "онпилогов", "ампилов", "анпилов", "вампилов", "акпилогов", "алпилогов", "амтилогов"];
const distance = (left, right) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0]; previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const saved = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = saved;
    }
  }
  return previous[right.length];
};
const confirmation = (value) => {
  const joined = normalize(value);
  if (forms.some((form) => joined.includes(form))) return "confirmed-exact-after-removing-line-breaks";
  const tokens = String(value ?? "").match(/[А-Яа-яЁёѢѣІіѲѳЪъЬь-]{5,32}/gu) ?? [];
  const minimum = Math.min(99, ...tokens.flatMap((token) => forms.map((form) => distance(normalize(token), form))));
  if (minimum <= 2) return "confirmed-close-by-independent-local-ocr";
  if (minimum <= 4) return "corroborated-with-old-print-or-handwriting-ocr-distortion";
  return "not-confirmed-by-local-ocr";
};
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const dimensions = async (file) => { const data = await readFile(file); return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`; };

for (const row of rows) {
  const sourcePath = path.join(root, "data/genealogy/sources/yandex", `${row.sourceId}.json`);
  const source = JSON.parse(await readFile(sourcePath, "utf8"));
  const reading = baseByKey.get(keyOf(row));
  const assistedReading = assistedByKey.get(keyOf(row));
  const target = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId, `${String(row.scanNumber).padStart(4, "0")}-target-entry.png`);
  const fragment = source.evidence.fragments.find((item) => item.kind === "target-entry");
  fragment.sha256 = await digest(target);
  source.evidence.quality.targetDimensions = await dimensions(target);
  source.transcription.localOcr = reading?.text ?? "";
  source.transcription.localOcrWithSurnameLexicon = assistedReading?.text ?? "";
  source.transcription.collation = {
    baseLocalOcr: confirmation(reading?.text),
    assistedLocalOcr: confirmation(assistedReading?.text),
    yandexTextBlocksUsedForNavigationAndCollation: true,
  };
  await writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
}

console.log(JSON.stringify({ refreshedSources: rows.length }));
