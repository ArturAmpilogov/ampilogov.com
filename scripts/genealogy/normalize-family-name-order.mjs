import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const apply = process.argv.includes("--apply");

const directories = [
  path.join(root, "data/genealogy/people"),
  path.join(root, "data/genealogy/sources/familysearch"),
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

const surnamePattern = new RegExp(`(^|\\s)(${escapedForms.join("|")})(ъ?)(?=\\s|$|[),.;:?])`, "u");
const scalarNameFieldPattern = /("(?:modernName|displayName|canonicalName)"\s*:\s*)"((?:\\.|[^"\\])*)"/gu;
const variantArrayPattern = /("(?:alternateNames|nameVariants)"\s*:\s*\[)((?:(?:"(?:\\.|[^"\\])*")|[^\]])*)(\])/gu;
const jsonStringPattern = /"((?:\\.|[^"\\])*)"/gu;

function decodeJsonString(value) {
  return JSON.parse(`"${value}"`);
}

function encodeJsonString(value) {
  return JSON.stringify(value).slice(1, -1);
}

function normalizeOrder(value, { preserveHistorical = false } = {}) {
  if (preserveHistorical && /[ѣіѳъ]/iu.test(value)) return value;

  const match = surnamePattern.exec(value);
  surnamePattern.lastIndex = 0;
  if (!match) return value;

  const surnameStart = match.index + match[1].length;
  if (surnameStart === 0) return value;

  const surname = `${match[2]}${match[3]}`;
  const before = value.slice(0, surnameStart).trim();
  const after = value.slice(surnameStart + surname.length).trim();
  return [surname, before, after].filter(Boolean).join(" ").replace(/\s+/gu, " ");
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

  output = output.replace(variantArrayPattern, (whole, prefix, body, suffix) => {
    const normalizedBody = body.replace(jsonStringPattern, (stringWhole, encodedValue) => {
      const value = decodeJsonString(encodedValue);
      const normalized = normalizeOrder(value, { preserveHistorical: true });
      if (normalized === value) return stringWhole;
      changedValues += 1;
      return `"${encodeJsonString(normalized)}"`;
    });
    return `${prefix}${normalizedBody}${suffix}`;
  });

  return { output, changedValues };
}

const changedFiles = [];
let changedValues = 0;

for (const directory of directories) {
  for (const filename of fs.readdirSync(directory).filter((value) => value.endsWith(".json"))) {
    const filenameAbsolute = path.join(directory, filename);
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
