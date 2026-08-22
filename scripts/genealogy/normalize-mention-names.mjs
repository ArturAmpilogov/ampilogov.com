import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const peopleDir = path.join(root, "data/genealogy/people");

const unique = (values) => [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];

// Modern display fields use the natural Russian order: given name,
// patronymic, surname. Literal/indexed fields remain untouched because their
// word order is part of the source evidence.
const surnameFirstToken = (token) => {
  const normalized = token.replace(/[ъЪ]$/u, "");
  return (
    /(?:пилог|филог|пелог|тилог|нилог)ов(?:а)?$/iu.test(normalized) ||
    /(?:пил|фил)(?:ов|охов)а?$/iu.test(normalized) ||
    /^(?:ampilogov|anpilogov|ampilov|anpilov|amilogov)a?$/iu.test(normalized)
  );
};

const normalizePersonNameOrder = (value) => {
  if (typeof value !== "string") return value;
  const match = value.trim().match(/^(\S+)\s+(.+)$/u);
  if (!match || !surnameFirstToken(match[1])) return value;

  const surname = match[1].replace(/[ъЪ]$/u, "");
  const remainder = match[2].trim();
  const punctuation = remainder.match(/^([^,;]+)(\s*[,;].*)$/u);
  if (punctuation) return `${punctuation[1].trim()} ${surname}${punctuation[2]}`;

  const qualifier = remainder.match(/^(.+?)(\s+\([^)]*\))$/u);
  if (qualifier) return `${qualifier[1].trim()} ${surname}${qualifier[2]}`;

  return `${remainder} ${surname}`;
};

const scalarNameKeys = new Set([
  "displayName", "modernName", "personName", "likelyPerson", "relatedPerson",
  "otherPerson", "subject", "duplicateSubject", "parallelSubject", "indexedChild",
  "child", "twin", "father", "mother", "deceased", "groom", "bride",
  "godfather", "godmother", "brideFather", "wife", "husband",
]);

const arrayNameKeys = new Set(["nameVariants", "alternateNames", "godparents"]);

const normalizeNameFields = (value, key = "") => {
  if (typeof value === "string") {
    return scalarNameKeys.has(key) || arrayNameKeys.has(key)
      ? normalizePersonNameOrder(value)
      : value;
  }
  if (Array.isArray(value)) return value.map((entry) => normalizeNameFields(entry, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
    entryKey,
    normalizeNameFields(entryValue, entryKey),
  ]));
};

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const modernizeOrthography = (value) => value
  .replace(/ѣ/giu, (letter) => letter === "Ѣ" ? "Е" : "е")
  .replace(/і/giu, (letter) => letter === "І" ? "И" : "и")
  .replace(/ѳ/giu, (letter) => letter === "Ѳ" ? "Ф" : "ф")
  .replace(/ѵ/giu, (letter) => letter === "Ѵ" ? "И" : "и")
  .replace(/ъ(?=\s|$|[.,;:!?])/giu, "")
  .replace(/\s+/g, " ")
  .trim();

const people = new Map();
let peopleCount = 0;
for (const file of (await readdir(peopleDir)).filter((name) => name.endsWith(".json"))) {
  const filePath = path.join(peopleDir, file);
  const original = await readFile(filePath, "utf8");
  const parsed = JSON.parse(original);
  const person = normalizeNameFields(parsed);
  if (JSON.stringify(person) !== JSON.stringify(parsed)) {
    await writeFile(filePath, `${JSON.stringify(person, null, 2)}\n`);
    peopleCount += 1;
  }
  people.set(person.personId, person);
}

let otherSourceCount = 0;
for (const filePath of await jsonFiles(sourcesRoot)) {
  if (path.dirname(filePath) === sourcesDir) continue;
  const original = await readFile(filePath, "utf8");
  const parsed = JSON.parse(original);
  const source = normalizeNameFields(parsed);
  if (JSON.stringify(source) !== JSON.stringify(parsed)) {
    await writeFile(filePath, `${JSON.stringify(source, null, 2)}\n`);
    otherSourceCount += 1;
  }
}

let sourceCount = 0;
let mentionCount = 0;

for (const file of (await readdir(sourcesDir)).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(sourcesDir, file);
  const original = await readFile(filePath, "utf8");
  const source = normalizeNameFields(JSON.parse(original));
  let changed = JSON.stringify(source) !== JSON.stringify(JSON.parse(original));

  source.mentions = (source.mentions ?? []).map((mention) => {
    const profileName = mention.personId ? people.get(mention.personId)?.displayName : null;
    const suppliedName = mention.nameAsSupplied;
    const indexedName = mention.nameAsIndexed;
    const suppliedIsOnlyFirstName = suppliedName?.trim().split(/\s+/).length === 1;
    const indexedHasSurname = indexedName?.trim().split(/\s+/).length > 1;
    const fallbackName = suppliedIsOnlyFirstName && indexedHasSurname
      ? indexedName
      : suppliedName ?? indexedName ?? mention.nameAsTranscribed ?? mention.nameAsWritten;
    const displayName = mention.displayName
      ?? profileName
      ?? mention.modernName
      ?? (fallbackName ? modernizeOrthography(fallbackName) : "Имя не прочитано");
    const normalizedDisplayName = normalizePersonNameOrder(displayName);
    const displayNameHasFamilyContext = displayName.trim().split(/\s+/).length > 1;
    const alternateNames = unique([
      ...(mention.alternateNames ?? []),
      mention.nameAsWritten,
      mention.nameAsTranscribed,
      mention.nameAsSupplied,
      mention.nameAsIndexed,
    ]).map(normalizePersonNameOrder).filter((name) => (
      name !== normalizedDisplayName &&
      (!displayNameHasFamilyContext || name.trim().split(/\s+/).length > 1)
    ));

    if (mention.displayName !== normalizedDisplayName || JSON.stringify(mention.alternateNames ?? []) !== JSON.stringify(alternateNames)) {
      changed = true;
    }

    mentionCount += 1;
    return {
      ...mention,
      displayName: normalizedDisplayName,
      alternateNames,
    };
  });

  if (changed) {
    await writeFile(filePath, `${JSON.stringify(source, null, 2)}\n`);
    sourceCount += 1;
  }
}

console.log(
  `Normalized ${mentionCount} mentions; updated ${peopleCount} profiles, ` +
  `${sourceCount} FamilySearch cards, and ${otherSourceCount} other source cards.`,
);
