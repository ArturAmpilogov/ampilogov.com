import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const entityKinds = [
  { directory: "data/genealogy/people", key: "personId", prefix: "P", start: 90000 },
  { directory: "data/genealogy/families", key: "familyId", prefix: "F", start: 90000 },
];

const gitObjectExists = (ref, file) => {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}:${file}`], { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

const gitText = (ref, file) => {
  try {
    return execFileSync("git", ["show", `${ref}:${file}`], {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return null;
  }
};

const jsonFiles = (directory) => {
  const result = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith(".json")) result.push(file);
    }
  };
  walk(directory);
  return result;
};

const relative = (file) => path.relative(root, file);
const remaps = new Map();
const fileRenames = [];

for (const kind of entityKinds) {
  const files = jsonFiles(path.join(root, kind.directory));
  const byId = new Map();
  const used = new Set();
  for (const file of files) {
    const data = JSON.parse(readFileSync(file, "utf8"));
    const id = data[kind.key];
    if (!id) continue;
    used.add(id);
    const entries = byId.get(id) ?? [];
    entries.push(file);
    byId.set(id, entries);
  }

  let next = kind.start;
  for (const [oldId, duplicates] of byId) {
    if (duplicates.length < 2) continue;
    const incoming = duplicates.filter((file) => gitObjectExists("origin/main", relative(file)));
    if (incoming.length !== 1) {
      throw new Error(`${oldId}: expected one origin/main owner, found ${incoming.length}`);
    }

    for (const file of duplicates) {
      if (file === incoming[0]) continue;
      let newId;
      do newId = `${kind.prefix}${next++}`;
      while (used.has(newId));
      used.add(newId);
      remaps.set(oldId, [...(remaps.get(oldId) ?? []), {
        newId,
        localEntityFile: relative(file),
        incomingEntityFile: relative(incoming[0]),
      }]);
      const newName = path.basename(file).replace(new RegExp(`^${oldId}(?=-)`), newId);
      fileRenames.push({ oldFile: file, newFile: path.join(path.dirname(file), newName), oldId, newId });
    }
  }
}

const allGenealogyJson = jsonFiles(path.join(root, "data/genealogy"));
for (const file of allGenealogyJson) {
  let data = JSON.parse(readFileSync(file, "utf8"));
  const fileRelative = relative(file);
  const originText = gitText("origin/main", fileRelative);
  const ownRemap = fileRenames.find((entry) => entry.oldFile === file);

  const applicable = new Map();
  for (const [oldId, candidates] of remaps) {
    const owned = candidates.find((candidate) => candidate.localEntityFile === fileRelative);
    if (owned) {
      applicable.set(oldId, owned.newId);
      continue;
    }
    if (originText === null || !originText.includes(`\"${oldId}\"`)) {
      if (candidates.length !== 1) {
        throw new Error(`${fileRelative}: ${oldId} has ${candidates.length} local owners; reference is ambiguous`);
      }
      applicable.set(oldId, candidates[0].newId);
    }
  }

  const replace = (value) => {
    if (typeof value === "string") return applicable.get(value) ?? value;
    if (Array.isArray(value)) return value.map(replace);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replace(child)]));
    }
    return value;
  };

  data = replace(data);
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

for (const { oldFile, newFile } of fileRenames) {
  if (oldFile === newFile) continue;
  if (existsSync(newFile)) throw new Error(`Refusing to overwrite ${relative(newFile)}`);
  renameSync(oldFile, newFile);
}

const report = fileRenames.map(({ oldFile, newFile, oldId, newId }) => ({
  oldId,
  newId,
  oldFile: relative(oldFile),
  newFile: relative(newFile),
}));
writeFileSync(
  path.join(root, "data/genealogy/merge-id-remap-2026-08-24.json"),
  `${JSON.stringify({ schemaVersion: 1, generatedAt: "2026-08-24", remaps: report }, null, 2)}\n`,
);
console.log(`Re-keyed ${report.filter((entry) => entry.oldId.startsWith("P")).length} people and ${report.filter((entry) => entry.oldId.startsWith("F")).length} families.`);
