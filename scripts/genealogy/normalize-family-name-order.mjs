import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");

const directories = [
  path.join(root, "data/genealogy/people"),
  path.join(root, "data/genealogy/sources"),
];

const surnameForms = [
  "Ампилогов", "Ампилогова", "Анпилогов", "Анпилогова",
  "Ампилов", "Ампилова", "Анпилов", "Анпилова",
  "Эмпилогов", "Эмпилогова", "Емпилогов", "Емпилогова",
  "Амилогов", "Амилогова", "Анфилогов", "Анфилогова",
  "Амфилогов", "Амфилогова", "Онфилогов", "Онфилогова",
  "Онпилогов", "Онпилогова", "Амнилогов", "Амнилогова",
  "Алепилогов", "Алепилогова", "Алпилогов", "Алпилогова",
];

const escapedForms = surnameForms
  .sort((a, b) => b.length - a.length)
  .map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

const surnamePattern = new RegExp(`^(${escapedForms.join("|")})(ъ?)(?=\\s|$|[),.;:?])`, "u");
const scalarNameFieldPattern = /("(?:modernName|displayName|canonicalName)"\s*:\s*)"((?:\\.|[^"\\])*)"/gu;

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`);
}

function encodeJsonString(value) {
  return JSON.stringify(value).slice(1, -1);
}

function normalizeOrder(value) {
  const match = surnamePattern.exec(value);
  surnamePattern.lastIndex = 0;
  if (!match) return value;

  const surname = `${match[1]}${match[2]}`.replace(/ъ$/iu, "");
  const remainder = value.slice(match[0].length).trim();
  if (!remainder) return value;
  return `${remainder} ${surname}`.replace(/\s+/gu, " ");
}

function transformText(text) {
  let changedValues = 0;

  let output = text.replace(scalarNameFieldPattern, (whole, prefix, encodedValue) => {
    const value = decodeJsonString(encodedValue);
    const normalized = normalizeOrder(value);
    if (normalized === value) return whole;
    changedValues += 1;
    return `${prefix}"${encodeJsonString(normalized)}"`;
  });

  return { output, changedValues };
}

const changedFiles = [];
let changedValues = 0;

function jsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  });
}

for (const directory of directories) {
  for (const filenameAbsolute of jsonFiles(directory)) {
    const original = fs.readFileSync(filenameAbsolute, "utf8");
    const transformed = transformText(original);
    if (transformed.output === original) continue;

    JSON.parse(transformed.output);
    changedFiles.push(path.relative(root, filenameAbsolute));
    changedValues += transformed.changedValues;
    if (apply) fs.writeFileSync(filenameAbsolute, transformed.output);
  }
}

console.log(`${apply ? "Updated" : "Would update"} ${changedValues} name values in ${changedFiles.length} files.`);
for (const filename of changedFiles) console.log(filename);
