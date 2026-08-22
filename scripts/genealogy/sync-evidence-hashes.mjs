import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");
const extraFiles = [
  path.join(root, "data/genealogy/indexes/familysearch-russia-discovery-queue.json"),
];

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return jsonFiles(entryPath);
      return entry.name.endsWith(".json") ? [entryPath] : [];
    }));
  return nested.flat();
}

const digestCache = new Map();
async function sha256(relativePath) {
  if (!digestCache.has(relativePath)) {
    const bytes = await readFile(path.join(root, relativePath));
    digestCache.set(relativePath, createHash("sha256").update(bytes).digest("hex"));
  }
  return digestCache.get(relativePath);
}

let references = 0;
let added = 0;
let corrected = 0;

async function sync(value) {
  if (Array.isArray(value)) {
    for (const item of value) await sync(item);
    return;
  }
  if (!value || typeof value !== "object") return;

  if (typeof value.path === "string" && value.path.startsWith("public/archive/evidence/")) {
    references += 1;
    const actual = await sha256(value.path);
    if (!value.sha256) {
      value.sha256 = actual;
      added += 1;
    } else if (value.sha256 !== actual) {
      value.sha256 = actual;
      corrected += 1;
    }
  }

  for (const item of Object.values(value)) await sync(item);
}

let changedFiles = 0;
for (const file of [...await jsonFiles(sourcesRoot), ...extraFiles]) {
  const data = JSON.parse(await readFile(file, "utf8"));
  const before = JSON.stringify(data);
  await sync(data);
  if (JSON.stringify(data) !== before) {
    await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, references, uniqueFiles: digestCache.size, added, corrected }, null, 2));
