import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import Module from "node:module";
import ts from "typescript";

const root = process.cwd();
const genealogyFile = path.join(root, "src/lib/genealogy.ts");
const indexesDir = path.join(root, "data/genealogy/indexes");
const sourcesDir = path.join(root, "data/genealogy/sources");
const peopleDir = path.join(root, "data/genealogy/people");
const generatedDir = path.join(root, "public/generated");
const recordAppendicesDir = path.join(generatedDir, "record-appendices");
const mapGeneratedDir = path.join(generatedDir, "map");
const mapPlacesDir = path.join(mapGeneratedDir, "places");
const sourceRegistryDir = path.join(generatedDir, "source-registry");
const sourceRegistryFile = path.join(root, "docs/research/sources.md");
const INLINE_RECORD_ANALYSIS_LIMIT = 12;

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

function contentHash(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function safeAssetKey(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function compactText(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSourceRegistry(content) {
  const lines = content.split(/\r?\n/);
  const intro = [];
  const groups = [];
  let group = null;
  let entry = null;
  let seenFirstGroup = false;

  const finishEntry = () => {
    if (!entry || !group) return;
    const content = entry.lines.join("\n").trim();
    const type = compactText(content.match(/^- Тип:\s*(.+)$/m)?.[1] ?? "");
    const status = compactText(content.match(/^- Статус:\s*(.+)$/m)?.[1] ?? "");
    group.entries.push({
      sourceId: entry.sourceId,
      id: entry.sourceId.toLowerCase(),
      title: entry.title,
      type,
      status,
      content,
    });
    entry = null;
  };

  for (const line of lines) {
    const groupMatch = line.match(/^##\s+(.+)$/);
    const entryMatch = line.match(/^###\s+(S-[A-Z0-9-]+)\s+—\s+(.+)$/);
    if (groupMatch) {
      finishEntry();
      seenFirstGroup = true;
      group = { title: compactText(groupMatch[1]), entries: [] };
      groups.push(group);
      continue;
    }
    if (entryMatch) {
      finishEntry();
      entry = { sourceId: entryMatch[1], title: compactText(entryMatch[2]), lines: [] };
      continue;
    }
    if (entry) entry.lines.push(line);
    else if (!seenFirstGroup && !line.startsWith("# ")) intro.push(line);
  }
  finishEntry();

  return { intro: intro.join("\n").trim(), groups };
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

fs.rmSync(generatedDir, { recursive: true, force: true });
for (const directory of [recordAppendicesDir, mapPlacesDir, sourceRegistryDir]) {
  fs.mkdirSync(directory, { recursive: true });
}
fs.mkdirSync(indexesDir, { recursive: true });

const recordAppendices = {};
const records = recordsDirectory.records.map((record) => {
  const analysisCount = record.people.reduce((total, person) => total + person.nameAnalysis.length, 0);
  if (analysisCount > INLINE_RECORD_ANALYSIS_LIMIT) {
    const appendix = {
      sourceId: record.sourceId,
      people: record.people.map((person) => ({
        personId: person.personId,
        name: person.name,
        role: person.role,
        eventRole: person.eventRole,
        alternateNames: person.alternateNames,
        details: person.details,
        nameAnalysis: person.nameAnalysis,
        places: person.places,
      })),
    };
    const serialized = JSON.stringify(appendix);
    const version = contentHash(serialized);
    const assetName = `${safeAssetKey(record.sourceId)}.${version}.json`;
    atomicJson(path.join(recordAppendicesDir, assetName), appendix);
    recordAppendices[record.sourceId] = {
      path: `/generated/record-appendices/${assetName}`,
      count: analysisCount,
      version,
    };
  }

  const compactSearchText = [
    record.sourceId,
    record.primaryPerson?.name,
    ...(record.primaryPerson?.alternateNames ?? []),
    ...record.people.flatMap((person) => [
      person.name,
      person.patronymic,
      ...person.alternateNames,
    ]),
  ].filter(Boolean).join(" ");

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
    isComplete: record.isComplete,
    searchText: normalize(compactSearchText),
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
    searchText: normalize([
      person.personId,
      person.displayName,
      person.normalizedSurname,
      ...person.variants,
    ].filter(Boolean).join(" ")),
  };
});
const peopleYears = people.flatMap((person) => person.minYear === null || person.maxYear === null
  ? []
  : [person.minYear, person.maxYear]);

const sourcePaths = {};
for (const file of jsonFiles(sourcesDir)) {
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const relativePath = path.relative(path.join(root, "data/genealogy"), file);
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
  if (person.personId) personPaths[person.personId] = path.relative(path.join(root, "data/genealogy"), file);
}

const mapDirectory = genealogy.getFamilyMapClientDirectory();
const mapVersion = genealogy.getFamilyMapDataVersion();
const mapDirectoryName = `directory.${mapVersion}.json`;
atomicJson(path.join(mapGeneratedDir, mapDirectoryName), mapDirectory);
for (const place of mapDirectory.places) {
  const details = genealogy.getFamilyMapPlaceDetails(place.placeId);
  if (!details) continue;
  atomicJson(
    path.join(mapPlacesDir, `${safeAssetKey(place.placeId)}.${mapVersion}.json`),
    details,
  );
}
atomicJson(path.join(indexesDir, "map-directory.json"), {
  schemaVersion: 1,
  generatedAt,
  version: mapVersion,
  directoryPath: `/generated/map/${mapDirectoryName}`,
  range: mapDirectory.range,
  stats: mapDirectory.stats,
});

const sourceRegistryContent = fs.readFileSync(sourceRegistryFile, "utf8");
const sourceRegistry = parseSourceRegistry(sourceRegistryContent);
const sourceRegistryVersion = contentHash(sourceRegistryContent);
const sourceRegistryGroups = sourceRegistry.groups.map((group) => ({
  title: group.title,
  entries: group.entries.map((entry) => {
    const assetName = `${safeAssetKey(entry.sourceId.toLowerCase())}.${sourceRegistryVersion}.json`;
    atomicJson(path.join(sourceRegistryDir, assetName), {
      sourceId: entry.sourceId,
      title: entry.title,
      content: entry.content,
    });
    return {
      sourceId: entry.sourceId,
      id: entry.id,
      title: entry.title,
      type: entry.type,
      status: entry.status,
      path: `/generated/source-registry/${assetName}`,
    };
  }),
}));
atomicJson(path.join(indexesDir, "source-registry.json"), {
  schemaVersion: 1,
  generatedAt,
  version: sourceRegistryVersion,
  intro: sourceRegistry.intro,
  groups: sourceRegistryGroups,
});

atomicJson(path.join(indexesDir, "records-directory.json"), {
  schemaVersion: 1,
  generatedAt,
  stats: {
    ...recordsDirectory.stats,
    minYear: Math.min(...recordYears),
    maxYear: Math.max(...recordYears),
  },
  records,
  appendices: recordAppendices,
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

console.log(`Records index: ${records.length}; people index: ${people.length}; source paths: ${Object.keys(sourcePaths).length}; person paths: ${Object.keys(personPaths).length}; map places: ${mapDirectory.places.length}; source registry: ${sourceRegistryGroups.reduce((total, group) => total + group.entries.length, 0)}.`);
