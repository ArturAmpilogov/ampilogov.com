#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const manifestArgument = args.get("--manifest");
const outputArgument = args.get("--output");
const binary = args.get("--binary") ?? "/private/tmp/ocr-local-vision";
const concurrency = Math.max(1, Number(args.get("--concurrency") ?? 6));
if (!manifestArgument || !outputArgument) throw new Error("Нужны --manifest и --output");

const manifest = JSON.parse(await readFile(path.resolve(root, manifestArgument), "utf8"));
const evidenceRoot = path.resolve(root, manifest.evidenceRoot ?? "data/genealogy/evidence-private/yandex");
const only = new Set(String(args.get("--only") ?? "").split(",").filter(Boolean));
let rows = [...new Map(
  manifest.batches.flatMap((batch) => batch.results)
    .filter((row) => row.capture !== false || only.has(`${row.catalogId}/${row.scanNumber}`))
    .map((row) => [`${row.catalogId}/${row.scanNumber}`, row]),
).values()];
if (only.size) rows = rows.filter((row) => only.has(`${row.catalogId}/${row.scanNumber}`));
if (args.get("--skip-missing") === "true") {
  const availability = await Promise.all(rows.map(async (row) => {
    const prefix = String(row.scanNumber).padStart(4, "0");
    const imagePath = path.join(evidenceRoot, row.catalogId, `${prefix}-target-entry.png`);
    try { await access(imagePath); return true; } catch { return false; }
  }));
  rows = rows.filter((_, index) => availability[index]);
}
const onlyUnconfirmedFrom = args.get("--only-unconfirmed-from");
if (onlyUnconfirmedFrom) {
  const prior = JSON.parse(await readFile(path.resolve(root, onlyUnconfirmedFrom), "utf8"));
  const confirmed = new Set(prior.readings.filter((reading) => {
    const normalized = reading.text.toLowerCase().replace(/[^а-яёѣі]/gu, "").replaceAll("ѣ", "е").replaceAll("і", "и");
    return ["ампилог", "анпилог", "аппилог", "амфилог", "анфилог", "онпилог", "ампилов", "анпилов", "вампилов"]
      .some((stem) => normalized.includes(stem));
  }).map((reading) => `${reading.catalogId}/${reading.scanNumber}`));
  rows = rows.filter((row) => !confirmed.has(`${row.catalogId}/${row.scanNumber}`));
}
const readings = new Array(rows.length);
let cursor = 0;
let completed = 0;

const worker = async () => {
  while (true) {
    const index = cursor++;
    if (index >= rows.length) return;
    const row = rows[index];
    const prefix = String(row.scanNumber).padStart(4, "0");
    const imagePath = path.join(evidenceRoot, row.catalogId, `${prefix}-target-entry.png`);
    let stdout = "";
    let error = null;
    try {
      ({ stdout } = await run(binary, [imagePath], { maxBuffer: 16 * 1024 * 1024 }));
    } catch (caught) {
      stdout = caught?.stdout ?? "";
      error = caught?.message ?? String(caught);
    }
    const lines = stdout.split(/\r?\n/).filter((line) => line && !line.startsWith("@@FILE\t"));
    const visionError = lines.find((line) => line.startsWith("@@ERROR\t"));
    readings[index] = {
      catalogId: row.catalogId,
      scanNumber: row.scanNumber,
      absolutePositions: manifest.batches.flatMap((batch) => batch.results)
        .filter((item) => item.catalogId === row.catalogId && item.scanNumber === row.scanNumber)
        .map((item) => item.absolutePosition),
      targetPath: path.relative(root, imagePath).split(path.sep).join("/"),
      text: lines.filter((line) => !line.startsWith("@@ERROR\t")).join("\n").trim(),
      error: error ?? (visionError ? visionError.slice("@@ERROR\t".length) : null),
    };
    completed++;
    if (completed % 25 === 0 || completed === rows.length) console.log(`${completed}/${rows.length}`);
  }
};

await Promise.all(Array.from({ length: concurrency }, worker));
const output = {
  schemaVersion: 1,
  searchRunId: manifest.searchRunId,
  engine: binary.includes("ampilogov")
    ? "Apple Vision ru-RU accurate, language correction enabled, surname-variant custom words"
    : "Apple Vision ru-RU accurate, language correction disabled",
  role: "independent local OCR aid; final reading must be checked against the saved scan",
  generatedAt: new Date().toISOString().slice(0, 10),
  readings,
};
await writeFile(path.resolve(root, outputArgument), `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ rows: readings.length, errors: readings.filter((item) => item.error).length, output: outputArgument }));
