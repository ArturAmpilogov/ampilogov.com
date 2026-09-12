#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rename, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("Нужен путь к манифесту");
const manifest = JSON.parse(await readFile(path.resolve(root, manifestPath), "utf8"));
const rows = [...new Map(manifest.batches.flatMap((batch) => batch.results).map((row) => [`${row.catalogId}/${row.scanNumber}`, row])).values()];
let converted = 0;

for (const row of rows) {
  const prefix = String(row.scanNumber).padStart(4, "0");
  const directory = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
  for (const suffix of ["full-view", "header", "target-entry"]) {
    const file = path.join(directory, `${prefix}-${suffix}.png`);
    let data;
    try { data = await readFile(file); } catch { continue; }
    if (data.toString("ascii", 1, 4) === "PNG") continue;
    const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "evidence-png-"));
    const output = path.join(temporaryDirectory, "converted.png");
    try {
      await run("sips", ["-s", "format", "png", file, "--out", output]);
      await rename(output, file);
      converted++;
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

console.log(JSON.stringify({ converted }));
