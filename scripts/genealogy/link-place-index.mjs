import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");
const indexPath = path.join(root, "data/genealogy/places/index.json");
const index = JSON.parse(readFileSync(indexPath, "utf8"));

const aliases = new Map();
for (const place of index.places) {
  for (const value of [place.placeId, ...(place.aliases ?? []), ...(place.legacyIds ?? [])]) {
    const existing = aliases.get(value);
    if (existing && existing !== place.placeId) {
      throw new Error(`Место «${value}» связано одновременно с ${existing} и ${place.placeId}`);
    }
    aliases.set(value, place.placeId);
  }
}

function jsonFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return jsonFiles(entryPath);
      return entry.name.endsWith(".json") ? [entryPath] : [];
    });
}

function closingBrace(text, openingBrace) {
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = openingBrace; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  throw new Error("Не найдена закрывающая фигурная скобка");
}

function objectForKey(text, key, start = 0, end = text.length) {
  const expression = new RegExp(`"${key}"\\s*:\\s*\\{`, "g");
  expression.lastIndex = start;
  const match = expression.exec(text);
  if (!match || match.index >= end) return null;
  const open = text.indexOf("{", match.index);
  const close = closingBrace(text, open);
  return close <= end ? { open, close } : null;
}

function setPlaceId(text, range, placeId) {
  const objectText = text.slice(range.open, range.close + 1);
  const property = /"placeId"\s*:\s*(?:"[^"]*"|null)/;
  if (property.test(objectText)) {
    const updated = objectText.replace(property, `"placeId": "${placeId}"`);
    return text.slice(0, range.open) + updated + text.slice(range.close + 1);
  }

  const content = text.slice(range.open + 1, range.close);
  if (content.includes("\n")) {
    const indent = content.match(/\n([ \t]+)"/)?.[1] ?? "      ";
    return text.slice(0, range.open + 1) +
      `\n${indent}"placeId": "${placeId}",` +
      text.slice(range.open + 1);
  }

  const separator = content.trim() ? " " : "";
  return text.slice(0, range.open + 1) +
    `${separator}"placeId": "${placeId}",` +
    text.slice(range.open + 1);
}

let changed = 0;
let linked = 0;
let withoutPlace = 0;

for (const file of jsonFiles(sourcesRoot)) {
  const original = readFileSync(file, "utf8");
  const source = JSON.parse(original);
  const place = source.event?.place;
  if (!place) {
    withoutPlace += 1;
    continue;
  }

  const lookup = place.placeId ?? place.normalized ?? place.asIndexed ?? place.asTranscribed ?? place.asWritten;
  const placeId = aliases.get(lookup);
  if (!placeId) {
    throw new Error(`${source.sourceId}: место «${lookup ?? "без названия"}» отсутствует в places/index.json`);
  }

  const eventRange = objectForKey(original, "event");
  const placeRange = eventRange ? objectForKey(original, "place", eventRange.open, eventRange.close) : null;
  if (!placeRange) throw new Error(`${source.sourceId}: не найден объект event.place`);

  const updated = setPlaceId(original, placeRange, placeId);
  const parsed = JSON.parse(updated);
  if (parsed.event.place.placeId !== placeId) {
    throw new Error(`${source.sourceId}: placeId не записан`);
  }

  linked += 1;
  if (updated !== original) {
    writeFileSync(file, updated);
    changed += 1;
  }
}

console.log(JSON.stringify({ linked, changed, withoutPlace }, null, 2));
