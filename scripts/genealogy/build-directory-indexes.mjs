import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import ts from "typescript";

const root = process.cwd();
const genealogyFile = path.join(root, "src/lib/genealogy.ts");
const indexesDir = path.join(root, "data/genealogy/indexes");
const sourcesDir = path.join(root, "data/genealogy/sources");
const peopleDir = path.join(root, "data/genealogy/people");

function loadGenealogyModule() {
  const source = fs.readFileSync(genealogyFile, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      resolveJsonModule: true,
    },
  }).outputText;
  const loaded = new Module(genealogyFile);
  loaded.filename = genealogyFile;
  loaded.paths = Module._nodeModulePaths(path.dirname(genealogyFile));
  loaded._compile(output, genealogyFile);
  return loaded.exports;
}

function jsonFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(fullPath);
    return entry.name.endsWith(".json") ? [fullPath] : [];
  });
}

function normalize(value) {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

function years(values) {
  return [...new Set(values.flatMap((value) =>
    (String(value).match(/\b(?:1[0-9]{3}|20[0-9]{2})\b/g) ?? []).map(Number)
  ))].sort((left, right) => left - right);
}

function publicRecordYear(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  const normalized = parsed >= 7000 && parsed <= 7500 ? parsed - 5508 : parsed;
  return normalized >= 1400 && normalized <= 1950 ? normalized : null;
}

function atomicJson(file, value) {
  const temporary = `${file}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`);
  fs.renameSync(temporary, file);
}

const genealogy = loadGenealogyModule();
const recordsDirectory = genealogy.getRecordsDirectory();
const peopleDirectory = genealogy.getPeopleDirectory();
const generatedAt = new Date().toISOString();

const records = recordsDirectory.records.map((record) => {
  return {
    sourceId: record.sourceId,
    eventType: record.eventType,
    eventLabel: record.eventLabel,
    date: record.date,
    year: publicRecordYear(record.year),
    place: record.place,
    primaryPerson: record.primaryPerson ? {
      name: record.primaryPerson.name,
      alternateNames: record.primaryPerson.alternateNames,
    } : null,
    directoryFacts: record.directoryFacts,
    reviewState: record.reviewState,
    reviewLabel: record.reviewLabel,
    reviewDescription: record.reviewDescription,
    searchText: normalize(record.searchText),
  };
});
const recordYears = records.flatMap((record) => record.year === null ? [] : [record.year]);

const peopleById = new Map(peopleDirectory.people.map((person) => [person.personId, person]));
const people = peopleDirectory.people.map((person) => {
  const sourceYears = years(person.sources.map((source) => source.date));
  const allYears = years([
    person.birthDate,
    person.birthYear,
    person.life.birth,
    person.life.death,
    ...person.sources.map((source) => source.date),
  ]);
  return {
    personId: person.personId,
    displayName: person.displayName,
    sex: person.sex,
    variants: person.variants,
    normalizedSurname: person.normalizedSurname,
    birthDate: person.birthDate,
    birthYear: person.birthYear,
    life: person.life,
    places: person.places,
    needsReview: person.needsReview,
    relations: person.relations.map((relation) => ({
      ...relation,
      sex: peopleById.get(relation.personId)?.sex ?? "",
    })),
    sourceCount: person.sources.length,
    sourceYears,
    minYear: allYears[0] ?? null,
    maxYear: allYears.at(-1) ?? null,
    searchText: normalize(person.searchText),
  };
});
const peopleYears = people.flatMap((person) => person.minYear === null || person.maxYear === null
  ? []
  : [person.minYear, person.maxYear]);

const sourcePaths = {};
for (const file of jsonFiles(sourcesDir)) {
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const relativePath = path.relative(root, file);
  const ids = [
    source.sourceId,
    ...(source.mergedSourceIds ?? []),
    ...(source.sourceCopies ?? []).map((copy) => copy.sourceId),
  ].filter(Boolean);
  for (const sourceId of ids) sourcePaths[sourceId] ??= relativePath;
}
const personPaths = {};
for (const file of jsonFiles(peopleDir)) {
  const person = JSON.parse(fs.readFileSync(file, "utf8"));
  if (person.personId) personPaths[person.personId] = path.relative(root, file);
}

fs.mkdirSync(indexesDir, { recursive: true });
atomicJson(path.join(indexesDir, "records-directory.json"), {
  schemaVersion: 1,
  generatedAt,
  stats: {
    ...recordsDirectory.stats,
    minYear: Math.min(...recordYears),
    maxYear: Math.max(...recordYears),
  },
  records,
});
atomicJson(path.join(indexesDir, "people-directory.json"), {
  schemaVersion: 1,
  generatedAt,
  stats: {
    ...peopleDirectory.stats,
    minYear: Math.min(...peopleYears),
    maxYear: Math.max(...peopleYears),
  },
  people,
});
atomicJson(path.join(indexesDir, "record-source-paths.json"), {
  schemaVersion: 1,
  generatedAt,
  paths: sourcePaths,
  personPaths,
});

console.log(`Records index: ${records.length}; people index: ${people.length}; source paths: ${Object.keys(sourcePaths).length}; person paths: ${Object.keys(personPaths).length}.`);
