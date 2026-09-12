#!/usr/bin/env node

import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = process.cwd();
const args = new Map();
for (let index = 2; index < process.argv.length; index += 2) args.set(process.argv[index], process.argv[index + 1]);
const manifestArgument = args.get("--manifest");
if (!manifestArgument) throw new Error("Нужен --manifest path/to/search.json");

const manifest = JSON.parse(await readFile(path.resolve(root, manifestArgument), "utf8"));
const only = new Set(String(args.get("--only") ?? "").split(",").filter(Boolean));
let allRows = [...new Map(
  manifest.batches.flatMap((batch) => batch.results)
    .filter((row) => row.capture !== false || only.has(`${row.catalogId}/${row.scanNumber}`))
    .map((row) => [`${row.catalogId}/${row.scanNumber}`, row]),
).values()];
if (only.size) allRows = allRows.filter((row) => only.has(`${row.catalogId}/${row.scanNumber}`));
const from = Math.max(1, Number(args.get("--from") ?? 1));
const limit = Math.max(1, Number(args.get("--limit") ?? allRows.length));
const rows = allRows.slice(from - 1, from - 1 + limit);
const metadataRoot = path.join(tmpdir(), `${manifest.searchRunId.toLowerCase()}-metadata`);
const targetPattern = /(?:^|[^А-Яа-яЁёѢѣІі])(?:Амп|Анп|Апп|Амф|Анф|Онп|Вамп|Акп|Алп|Амт)/iu;
const words = (value) => new Set(String(value ?? "").toLowerCase().replaceAll("ѣ", "е").replaceAll("і", "и").match(/[а-яё]{5,}/gu) ?? []);

const pngSize = async (file) => {
  const data = await readFile(file);
  if (data.toString("ascii", 1, 4) !== "PNG") throw new Error(`Не PNG: ${file}`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};

const bbox = (points) => {
  if (!Array.isArray(points) || !points.length) return null;
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return { left: Math.min(...xs), top: Math.min(...ys), right: Math.max(...xs), bottom: Math.max(...ys) };
};

for (const [index, row] of rows.entries()) {
  const prefix = String(row.scanNumber).padStart(4, "0");
  const evidenceDir = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
  const full = path.join(evidenceDir, `${prefix}-full-view.png`);
  const target = path.join(evidenceDir, `${prefix}-target-entry.png`);
  const metadataPath = path.join(metadataRoot, `${row.catalogId}-${row.scanNumber}.json`);
  let pageProps;
  let actual;
  try {
    [{ pageProps }, actual] = await Promise.all([
      readFile(metadataPath, "utf8").then(JSON.parse),
      pngSize(full),
    ]);
  } catch (error) {
    if (args.get("--skip-missing") === "true" && error?.code === "ENOENT") {
      console.log(`${index + 1}/${rows.length} ${row.catalogId}/${row.scanNumber} skipped-missing`);
      continue;
    }
    throw error;
  }
  const node = pageProps.currentNode;
  const expected = node.originalImageSize;
  const scaleX = actual.width / expected.width;
  const scaleY = actual.height / expected.height;
  const snippetWords = words(row.indexSnippet);
  const candidates = (node.textBlocks ?? []).flatMap((block, blockIndex) => {
    if (!targetPattern.test(block.text ?? "")) return [];
    const box = bbox(node.joinedTextBlocks?.[blockIndex]?.points);
    if (!box) return [];
    const overlap = [...words(block.text)].filter((word) => snippetWords.has(word)).length;
    return [{ box, overlap }];
  }).sort((left, right) => right.overlap - left.overlap);
  const matches = candidates.length ? [candidates[0].box] : [];
  const sourceBox = matches.length ? {
    left: Math.min(...matches.map((box) => box.left)) - 140,
    top: Math.min(...matches.map((box) => box.top)) - 260,
    right: Math.max(...matches.map((box) => box.right)) + 140,
    bottom: Math.max(...matches.map((box) => box.bottom)) + 260,
  } : { left: expected.width * 0.08, top: expected.height * 0.12, right: expected.width * 0.92, bottom: expected.height * 0.88 };
  const box = {
    left: Math.max(0, Math.floor(sourceBox.left * scaleX)),
    top: Math.max(0, Math.floor((expected.height - sourceBox.bottom) * scaleY)),
    right: Math.min(actual.width, Math.ceil(sourceBox.right * scaleX)),
    bottom: Math.min(actual.height, Math.ceil((expected.height - sourceBox.top) * scaleY)),
  };
  const width = Math.max(1, box.right - box.left);
  const height = Math.max(1, box.bottom - box.top);
  await mkdir(evidenceDir, { recursive: true });
  await run("sips", ["-c", String(height), String(width), "--cropOffset", String(box.top), String(box.left), full, "--out", target]);
  if (width < 1200) await run("sips", ["--resampleWidth", "1200", target, "--out", target]);
  console.log(`${index + 1}/${rows.length} ${row.catalogId}/${row.scanNumber} matches=${matches.length}`);
}

console.log(JSON.stringify({ recropped: rows.length, metadataRoot }));
