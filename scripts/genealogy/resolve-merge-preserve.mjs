import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const root = process.cwd();
const conflicted = execFileSync("git", ["diff", "--name-only", "--diff-filter=U"], {
  cwd: root,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);

const readStage = (stage, file) => execFileSync("git", ["show", `:${stage}:${file}`], {
  cwd: root,
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
});

const objectKey = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  for (const key of [
    "mentionId",
    "placeId",
    "searchRunId",
    "sourceId",
    "personId",
    "familyId",
    "recordId",
    "canonicalUrl",
    "path",
  ]) {
    if (typeof value[key] === "string" && value[key]) return `${key}:${value[key]}`;
  }
  return null;
};

function mergeArrays(ours, theirs, path) {
  if (ours.every((value) => value === null || typeof value !== "object") &&
      theirs.every((value) => value === null || typeof value !== "object")) {
    return [...new Set([...ours, ...theirs].map((value) => JSON.stringify(value)))]
      .map((value) => JSON.parse(value));
  }

  const result = ours.map((value) => structuredClone(value));
  const positions = new Map();
  result.forEach((value, index) => {
    const key = objectKey(value) ?? `json:${JSON.stringify(value)}`;
    positions.set(key, index);
  });

  for (const value of theirs) {
    const key = objectKey(value) ?? `json:${JSON.stringify(value)}`;
    const position = positions.get(key);
    if (position === undefined) {
      positions.set(key, result.length);
      result.push(structuredClone(value));
    } else {
      result[position] = mergeValues(result[position], value, `${path}[${key}]`);
    }
  }
  return result;
}

function mergeValues(ours, theirs, path = "") {
  if (ours === undefined) return structuredClone(theirs);
  if (theirs === undefined) return structuredClone(ours);
  if (JSON.stringify(ours) === JSON.stringify(theirs)) return structuredClone(ours);

  if (Array.isArray(ours) && Array.isArray(theirs)) return mergeArrays(ours, theirs, path);
  if (ours && theirs && typeof ours === "object" && typeof theirs === "object" &&
      !Array.isArray(ours) && !Array.isArray(theirs)) {
    const result = {};
    for (const key of new Set([...Object.keys(ours), ...Object.keys(theirs)])) {
      result[key] = mergeValues(ours[key], theirs[key], path ? `${path}.${key}` : key);
    }
    return result;
  }

  // Local values are generally the later, scan-verified enrichment. Missing
  // fields and array members from origin/main are still retained above.
  return structuredClone(ours);
}

function mergeWorklog(file) {
  const ours = readStage(2, file).split("\n");
  const theirs = readStage(3, file).split("\n");
  let common = 0;
  while (common < ours.length && common < theirs.length && ours[common] === theirs[common]) common += 1;

  const merged = [
    ...ours.slice(0, common),
    ...ours.slice(common).filter((line, index, lines) => index < lines.length - 1 || line),
    "",
    ...theirs.slice(common).filter((line, index, lines) => index < lines.length - 1 || line),
  ];
  writeFileSync(file, `${merged.join("\n").replace(/\n+$/u, "")}\n`);
}

for (const file of conflicted) {
  if (file === "WORKLOG.md") {
    mergeWorklog(file);
    continue;
  }
  if (!file.endsWith(".json")) throw new Error(`Unsupported conflicted file: ${file}`);
  if (file.endsWith("familysearch-reviewed.json")) continue;

  const ours = JSON.parse(readStage(2, file));
  const theirs = JSON.parse(readStage(3, file));
  const merged = mergeValues(ours, theirs);
  writeFileSync(file, `${JSON.stringify(merged, null, 2)}\n`);
}
