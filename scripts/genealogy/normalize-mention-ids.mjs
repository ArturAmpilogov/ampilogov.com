import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");

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

function replaceInternalReferences(value, replacements) {
  if (Array.isArray(value)) {
    for (const item of value) replaceInternalReferences(item, replacements);
    return;
  }
  if (!value || typeof value !== "object") return;

  for (const [key, item] of Object.entries(value)) {
    if (key === "sourceMentionId" && typeof item === "string" && replacements.has(item)) {
      value[key] = replacements.get(item);
    } else {
      replaceInternalReferences(item, replacements);
    }
  }
}

let changedFiles = 0;
let assignedIds = 0;
let replacedLegacyIds = 0;

for (const file of await jsonFiles(sourcesRoot)) {
  const source = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(source.mentions) || source.mentions.length === 0) continue;

  const before = JSON.stringify(source);
  const replacements = new Map();

  source.mentions.forEach((mention, index) => {
    const canonicalId = `${source.sourceId}-M${index + 1}`;
    const currentId = mention.mentionId;
    if (!currentId) {
      mention.mentionId = canonicalId;
      assignedIds += 1;
    } else if (!currentId.startsWith(`${source.sourceId}-M`)) {
      replacements.set(currentId, canonicalId);
      mention.mentionId = canonicalId;
      replacedLegacyIds += 1;
    }
  });

  replaceInternalReferences(source, replacements);

  const ids = source.mentions.map((mention) => mention.mentionId);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`${source.sourceId}: mentionId остаются неуникальными`);
  }

  if (JSON.stringify(source) !== before) {
    await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, assignedIds, replacedLegacyIds }, null, 2));
