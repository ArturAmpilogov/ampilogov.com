import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const genealogyRoot = path.join(root, "data/genealogy");
const summaryOnly = process.argv.includes("--summary");

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const loadDirectory = async (relativeDirectory, idKey) => {
  const directory = path.join(genealogyRoot, relativeDirectory);
  const records = [];
  for (const file of await jsonFiles(directory)) {
    const record = JSON.parse(await readFile(file, "utf8"));
    if (record[idKey]) records.push({ record, file: path.relative(root, file) });
  }
  return records;
};

const peopleEntries = await loadDirectory("people", "personId");
const familyEntries = await loadDirectory("families", "familyId");
const sourceEntries = await loadDirectory("sources", "sourceId");
const placesFile = JSON.parse(await readFile(path.join(genealogyRoot, "places/index.json"), "utf8"));

const people = new Map(peopleEntries.map((entry) => [entry.record.personId, entry]));
const families = new Map(familyEntries.map((entry) => [entry.record.familyId, entry]));
const sources = new Map(sourceEntries.map((entry) => [entry.record.sourceId, entry]));
const errors = [];
const warnings = [];
const candidates = [];

const add = (target, code, file, message) => target.push({ code, file, message });
const reportDuplicateEntityIds = (entries, idKey, code) => {
  const owners = new Map();
  for (const { record, file } of entries) {
    const id = record[idKey];
    if (!id) continue;
    const files = owners.get(id) ?? [];
    files.push(file);
    owners.set(id, files);
  }
  for (const [id, files] of owners) {
    if (files.length > 1) add(errors, code, files[0], `${id}: ${files.join(", ")}`);
  }
};

reportDuplicateEntityIds(peopleEntries, "personId", "duplicate-person-id");
reportDuplicateEntityIds(familyEntries, "familyId", "duplicate-family-id");
reportDuplicateEntityIds(sourceEntries, "sourceId", "duplicate-source-id");

const places = new Set();
const canonicalPlaceIds = new Set();
const placeFile = "data/genealogy/places/index.json";

for (const place of placesFile.places ?? []) {
  if (!place.placeId || typeof place.placeId !== "string") {
    add(errors, "missing-place-id", placeFile, place.name ?? "место без названия");
    continue;
  }
  if (canonicalPlaceIds.has(place.placeId)) {
    add(errors, "duplicate-place-id", placeFile, place.placeId);
  }
  canonicalPlaceIds.add(place.placeId);

  for (const placeId of [place.placeId, ...(place.legacyIds ?? [])]) {
    if (places.has(placeId)) add(errors, "duplicate-place-alias", placeFile, placeId);
    places.add(placeId);
  }

  const latitude = place.geo?.latitude;
  const longitude = place.geo?.longitude;
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    add(errors, "invalid-latitude", placeFile, `${place.placeId}: ${String(latitude)}`);
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    add(errors, "invalid-longitude", placeFile, `${place.placeId}: ${String(longitude)}`);
  }
  try {
    const sourceUrl = new URL(place.geo?.sourceUrl);
    if (!["http:", "https:"].includes(sourceUrl.protocol)) throw new Error("unsupported protocol");
  } catch {
    add(errors, "invalid-geo-source-url", placeFile, `${place.placeId}: ${String(place.geo?.sourceUrl)}`);
  }
}

const referencedPlaceIds = (value, result = []) => {
  if (Array.isArray(value)) value.forEach((entry) => referencedPlaceIds(entry, result));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (key === "placeId" && typeof entry === "string") result.push(entry);
      else referencedPlaceIds(entry, result);
    }
  }
  return result;
};

const profileNames = new Map();
for (const { record: person } of peopleEntries) {
  for (const name of [person.displayName, ...(person.nameVariants ?? [])]) {
    if (typeof name !== "string") continue;
    const key = name.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/\s+/g, " ").trim();
    const ids = profileNames.get(key) ?? new Set();
    ids.add(person.personId);
    profileNames.set(key, ids);
  }
}

for (const { record: person, file } of peopleEntries) {
  const surname = person.surname?.normalized;
  if (surname && person.displayName?.toLocaleLowerCase("ru-RU").startsWith(`${surname.toLocaleLowerCase("ru-RU")} `)) {
    add(errors, "surname-first", file, `${person.personId}: ${person.displayName}`);
  }
  for (const sourceId of person.sourceIds ?? []) {
    if (!sources.has(sourceId)) add(errors, "unknown-source", file, `${person.personId} -> ${sourceId}`);
  }
  for (const familyId of person.familyIds ?? []) {
    const family = families.get(familyId)?.record;
    if (!family) add(errors, "unknown-family", file, `${person.personId} -> ${familyId}`);
    else if (![...(family.spouses ?? []), ...(family.children ?? [])].includes(person.personId)) {
      add(errors, "family-backlink", file, `${person.personId} отсутствует в ${familyId}`);
    }
  }
  for (const relation of person.relations ?? []) {
    if (!relation.personId || !people.has(relation.personId)) {
      add(errors, "unknown-related-person", file, `${person.personId} -> ${String(relation.personId)}`);
    } else if (relation.personId === person.personId) {
      add(errors, "self-relation", file, `${person.personId}: ${relation.type ?? "relation"}`);
    }
    for (const sourceId of relation.sourceIds ?? []) {
      if (!sources.has(sourceId)) add(errors, "unknown-relation-source", file, `${person.personId} -> ${sourceId}`);
    }
  }
  for (const placeId of referencedPlaceIds(person)) {
    if (!places.has(placeId)) add(errors, "unknown-place", file, `${person.personId} -> ${placeId}`);
  }
}

for (const { record: family, file } of familyEntries) {
  for (const personId of [...(family.spouses ?? []), ...(family.children ?? [])]) {
    const person = people.get(personId)?.record;
    if (!person) add(errors, "unknown-person", file, `${family.familyId} -> ${personId}`);
    else if (!(person.familyIds ?? []).includes(family.familyId)) {
      add(warnings, "missing-family-backlink", file, `${personId} не содержит ${family.familyId}`);
    }
  }
  for (const sourceId of [family.marriage?.sourceId, ...(family.marriage?.sourceIds ?? []), ...(family.sourceIds ?? [])].filter(Boolean)) {
    if (!sources.has(sourceId)) add(errors, "unknown-source", file, `${family.familyId} -> ${sourceId}`);
  }
  for (const placeId of referencedPlaceIds(family)) {
    if (!places.has(placeId)) add(errors, "unknown-place", file, `${family.familyId} -> ${placeId}`);
  }
}

for (const { record: source, file } of sourceEntries) {
  if (source.primaryPersonId && !people.has(source.primaryPersonId)) {
    add(errors, "unknown-primary-person", file, `${source.sourceId} -> ${source.primaryPersonId}`);
  }
  for (const mention of source.mentions ?? []) {
    if (mention.personId && !people.has(mention.personId)) {
      add(errors, "unknown-person", file, `${source.sourceId}/${mention.mentionId ?? "без mentionId"} -> ${mention.personId}`);
    }
    if (mention.personId && people.has(mention.personId) && !(people.get(mention.personId).record.sourceIds ?? []).includes(source.sourceId)) {
      const personSourceIds = people.get(mention.personId).record.sourceIds ?? [];
      const sameDocumentIsLinked = (source.relatedRecords ?? []).some((relatedSourceId) => {
        const related = sources.get(relatedSourceId)?.record;
        return personSourceIds.includes(relatedSourceId)
          && source.evidence?.sha256
          && related?.evidence?.sha256 === source.evidence.sha256;
      });
      if (!sameDocumentIsLinked) add(warnings, "missing-source-backlink", file, `${mention.personId} не содержит ${source.sourceId}`);
    }
    if (!mention.personId && typeof mention.displayName === "string") {
      const key = mention.displayName.toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/\s+/g, " ").trim();
      const ids = [...(profileNames.get(key) ?? [])];
      if (ids.length === 1) candidates.push({
        file,
        sourceId: source.sourceId,
        mentionId: mention.mentionId,
        displayName: mention.displayName,
        personId: ids[0],
        eventDate: source.event?.date?.display ?? source.event?.date?.iso ?? "?",
        eventPlace: source.event?.place?.normalized ?? source.event?.place?.asIndexed ?? "?",
      });
    }
  }
  if (source.primaryPersonId && !(source.mentions ?? []).some((mention) => mention.personId === source.primaryPersonId)) {
    add(warnings, "primary-person-not-mentioned", file, `${source.primaryPersonId} не связан ни с одним mentions[]`);
  }
  for (const placeId of referencedPlaceIds(source)) {
    if (!places.has(placeId)) add(errors, "unknown-place", file, `${source.sourceId} -> ${placeId}`);
  }
}

const printGroup = (title, values) => {
  console.log(`\n${title}: ${values.length}`);
  for (const value of values) console.log(`- [${value.code}] ${value.file}: ${value.message}`);
};

console.log(`Проверено: ${people.size} людей, ${families.size} семей, ${sources.size} источников, ${places.size} мест.`);
printGroup("Ошибки", errors);
printGroup("Предупреждения", warnings);
console.log(`\nСовпадения по уникальному полному имени, требующие доказательств: ${candidates.length}`);
for (const candidate of summaryOnly ? [] : candidates) {
  const profile = people.get(candidate.personId)?.record;
  const profileDates = profile?.birth?.date ?? profile?.dates?.birth?.display ?? profile?.birthEstimate?.year ?? "?";
  console.log(`- ${candidate.sourceId}/${candidate.mentionId ?? "без mentionId"}: ${candidate.displayName} -> ${candidate.personId}; событие ${candidate.eventDate}, ${candidate.eventPlace}; профиль ${profileDates}`);
}

if (errors.length) process.exitCode = 1;
