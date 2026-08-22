import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");
const apply = process.argv.includes("--apply");

const literalOrTechnicalKeys = new Set([
  "literal",
  "sourceText",
  "nameAsTranscribed",
  "nameAsWritten",
  "asTranscribed",
  "dateOriginal",
  "date_original",
  "iso",
  "capturedAt",
  "sha256",
  "path",
  "sourceUrl",
  "recordArk",
  "imageArk",
  "indexedRecordArk",
]);

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const expandShortYear = (startText, separator, endText) => {
  const start = Number(startText);
  const modulus = 10 ** endText.length;
  let end = Math.floor(start / modulus) * modulus + Number(endText);
  if (end < start) end += modulus;
  return `${startText}${separator}${end}`;
};

const normalizeCalendarOrder = (value) => {
  let normalized = value;
  // A year from the Byzantine calendar belongs after the modern date.
  normalized = normalized.replace(
    /\b(7\d{3}(?:[—–-]7\d{3})?)\s*\/\s*(1\d{3}(?:[\/—–-]1\d{3})?)\b/gu,
    (_, oldStyle, modern) => `${modern} (${oldStyle})`,
  );

  // Put the Russian year label before the parenthetical historical year.
  normalized = normalized.replace(
    /\b(1\d{3}(?:[\/—–-]1\d{3})?)\s+\((7\d{3}(?:[—–-]7\d{3})?)\)\s+(год(?:а|ы)?|гг\.)(?=\s|$|[,.;)])/gu,
    (_, modern, oldStyle, label) => `${modern} ${label} (${oldStyle})`,
  );
  // Legacy cards sometimes put the old year first and the modern date in brackets.
  normalized = normalized.replace(
    /\b(7\d{3}(?:[—–-]7\d{3})?)\s+(год(?:а|ы)?|гг\.)(?=\s)\s+\((1\d{3}(?:[\/—–-]1\d{3})?)\)/gu,
    (_, oldStyle, label, modern) => `${modern} ${label} (${oldStyle})`,
  );

  return normalized;
};

export const normalizeDateDisplay = (value) => normalizeCalendarOrder(value.replace(
  /\b([1-7]\d{3})([\/—–-])(\d{2,3})\b/gu,
  (_, start, separator, end) => expandShortYear(start, separator, end),
));

const normalizeNarrativeDates = (value) => {
  let normalized = value.replace(
    /\b([1-7]\d{3})(\/)(\d{2,3})\b/gu,
    (_, start, separator, end) => expandShortYear(start, separator, end),
  );
  normalized = normalized.replace(
    /\b([1-7]\d{3})([—–-])(\d{2,3})(?=\s+(?:г(?:\.|од)))/gu,
    (_, start, separator, end) => expandShortYear(start, separator, end),
  );
  return normalizeCalendarOrder(normalized);
};

const normalizeUserFacingDates = (value, key = "") => {
  if (typeof value === "string") {
    if (
      literalOrTechnicalKeys.has(key) ||
      /(?:url|ark|path|sha)$/iu.test(key) ||
      /^\d{4}-\d{2}-\d{2}(?:T.*)?$/u.test(value)
    ) return value;
    return key === "display" || key === "title"
      ? normalizeDateDisplay(value)
      : normalizeNarrativeDates(value);
  }
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeUserFacingDates(entry, key));
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
    entryKey,
    normalizeUserFacingDates(entryValue, entryKey),
  ]));
};

const changed = [];
for (const filePath of await jsonFiles(sourcesRoot)) {
  const original = await readFile(filePath, "utf8");
  const parsed = JSON.parse(original);
  const normalized = normalizeUserFacingDates(parsed);
  if (JSON.stringify(normalized) === JSON.stringify(parsed)) continue;
  changed.push(path.relative(root, filePath));
  if (apply) await writeFile(filePath, `${JSON.stringify(normalized, null, 2)}\n`);
}

console.log(`${apply ? "Обновлено" : "Будет обновлено"}: ${changed.length} карточек.`);
for (const file of changed) console.log(`- ${file}`);
