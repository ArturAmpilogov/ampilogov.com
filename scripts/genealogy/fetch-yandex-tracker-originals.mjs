#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);

const trackerPath = args.get("--tracker");
const statusSet = new Set((args.get("--statuses") ?? "pending-new-source").split(",").filter(Boolean));
const concurrency = Math.max(1, Math.min(8, Number(args.get("--concurrency") ?? 3)));
if (!trackerPath) {
  console.error("Использование: node scripts/genealogy/fetch-yandex-tracker-originals.mjs --tracker FILE [--statuses status,...] [--concurrency N]");
  process.exit(1);
}

const root = process.cwd();
const tracker = JSON.parse(await readFile(path.resolve(root, trackerPath), "utf8"));
const rows = [...new Map((tracker.results ?? [])
  .filter((row) => statusSet.has(row.status))
  .map((row) => [`${row.catalogId}/${row.scanNumber}`, row])).values()];

let cursor = 0;
let downloaded = 0;
let skipped = 0;
const failures = [];

async function worker() {
  while (cursor < rows.length) {
    const row = rows[cursor++];
    const directory = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
    const output = path.join(directory, `${String(row.scanNumber).padStart(4, "0")}-original.jpg`);
    await mkdir(directory, { recursive: true });
    try {
      await access(output);
      skipped++;
      continue;
    } catch {}
    try {
      await run(process.execPath, [
        path.join(root, "scripts/genealogy/fetch-yandex-original.mjs"),
        "--catalog", row.catalogId,
        "--scan", String(row.scanNumber),
        "--out", output,
      ], { maxBuffer: 1024 * 1024 });
      downloaded++;
      console.log(`downloaded\t${row.catalogId}/${row.scanNumber}\t${path.relative(root, output)}`);
    } catch (error) {
      failures.push({ catalogId: row.catalogId, scanNumber: row.scanNumber, message: error.stderr?.trim() || error.message });
      console.error(`failed\t${row.catalogId}/${row.scanNumber}`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(JSON.stringify({ requested: rows.length, downloaded, skipped, failed: failures.length }));
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
}
