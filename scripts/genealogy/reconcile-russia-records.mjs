#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources/familysearch");
const peopleRoot = path.join(root, "data/genealogy/people");
const familiesRoot = path.join(root, "data/genealogy/families");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (previous === next) return false;
  fs.writeFileSync(file, next);
  return true;
};
const unique = (values = []) => [...new Set(values.filter(Boolean))];
const normalize = (value = "") => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru")
  .replace(/ё/g, "е").replace(/[ъь]/g, "").replace(/[^а-яa-z0-9]+/g, " ").trim();
const familyName = (value = "") => /(?:анпил|ампил|эмпил|анфил|онфил|алпил|ампыл|анпел|ампел)/iu.test(value);
const relevantRoles = new Set([
  "child", "baptized-child", "twin", "deceased", "deceased-child", "deceased-daughter", "deceased-son",
  "father", "mother", "groom", "bride", "groom-father", "bride-father",
]);
const childRoles = new Set(["child", "baptized-child", "twin", "deceased-child", "deceased-daughter", "deceased-son"]);
const parentRoles = new Set(["father", "mother"]);
const adultAnchorRoles = new Set(["father", "groom", "groom-father", "bride", "bride-father"]);

const sourceEntries = fs.readdirSync(sourcesRoot)
  .filter((name) => name.endsWith(".json"))
  .map((name) => ({ file: path.join(sourcesRoot, name), value: readJson(path.join(sourcesRoot, name)) }));
const batch = sourceEntries.filter(({ value }) =>
  (value.evidence?.path ?? "").includes("/familysearch/russia/") &&
  (value.mentions ?? []).some((mention) => relevantRoles.has(mention.role)) &&
  !["negative-finding", "finding-aid"].includes(value.event?.type));

const peopleEntries = fs.readdirSync(peopleRoot).filter((name) => name.endsWith(".json"))
  .map((name) => ({ file: path.join(peopleRoot, name), value: readJson(path.join(peopleRoot, name)) }));
const people = new Map(peopleEntries.map((entry) => [entry.value.personId, entry]));
const familiesEntries = fs.readdirSync(familiesRoot).filter((name) => name.endsWith(".json"))
  .map((name) => ({ file: path.join(familiesRoot, name), value: readJson(path.join(familiesRoot, name)) }));
const families = new Map(familiesEntries.map((entry) => [entry.value.familyId, entry]));

let nextPerson = Math.max(...[...people.keys()].map((id) => Number(id.slice(1)))) + 1;
let nextFamily = Math.max(...[...families.keys()].map((id) => Number(id.slice(1)))) + 1;
const personId = () => `P${String(nextPerson++).padStart(4, "0")}`;
const familyId = () => `F${String(nextFamily++).padStart(4, "0")}`;
const dirtySources = new Set();
const dirtyPeople = new Set();
const dirtyFamilies = new Set();

const transliterate = (value) => normalize(value).split("").map((letter) => ({
  а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ж:"zh",з:"z",и:"i",й:"y",к:"k",л:"l",м:"m",
  н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"ts",ч:"ch",ш:"sh",
  щ:"sch",ы:"y",э:"e",ю:"yu",я:"ya"," ":"-",
})[letter] ?? letter).join("").replace(/-+/g, "-").replace(/^-|-$/g, "");

const sourceDate = (source) => source.event?.date?.birthIso ?? source.event?.date?.deathIso ??
  source.event?.date?.marriageIso ?? source.event?.date?.iso ?? null;
const sourcePlace = (source) => source.event?.place?.placeId ?? null;
const eventFact = (source, role) => {
  const date = sourceDate(source);
  const placeId = sourcePlace(source);
  if (["child", "baptized-child", "twin"].includes(role)) return date ? { birth: { date, ...(placeId ? { placeId } : {}) } } : {};
  if (role.startsWith("deceased")) return date ? { death: { date, ...(placeId ? { placeId } : {}) } } : {};
  return {};
};
const canonicalSurname = (name) => {
  const written = name.trim().split(/\s+/).at(-1)?.replace(/[\[\],.]/g, "");
  if (!written || !familyName(written)) return undefined;
  return {
    normalized: /пилов/iu.test(written) && !/лог/iu.test(written) ? "Ампилов" : "Ампилогов",
    formsAsWritten: [written],
  };
};

// These pairs are supported by compatible names, parents, dates and places.
const samePersonGroups = new Map([
  ["FS-3QS7-8994-V94Y-4-M1", "darya-stepanovna-1909"],
  ["FS-3QSQ-G994-V9ZC-Q-M1", "darya-stepanovna-1909"],
  ["FS-3QSQ-G994-V9HM-W-M1", "ivan-stepanovich-1907"],
  ["FS-3QSQ-G994-V94L-S-IOA-M1", "ivan-stepanovich-1907"],
  ["FS-3QS7-8994-V9JJ-G-M1", "maria-nikitichna-1895"],
  ["FS-3QS7-L994-V9NF-F-M1", "maria-nikitichna-1895"],
  ["FS-3QS7-8994-K93Q-W-M1", "makariy-ivanovich"],
  ["FS-3QS7-L994-K99J-X-M1", "makariy-ivanovich"],
  ["FS-3QS7-8994-V9ZQ-B-M2", "aleksey-alekseevich"],
  ["FS-3QS7-L994-V9HZ-7-M1", "aleksey-alekseevich"],
]);

const occurrences = [];
for (const entry of batch) {
  for (const mention of entry.value.mentions ?? []) {
    if (relevantRoles.has(mention.role)) occurrences.push({ entry, source: entry.value, mention });
  }
}

const existingByAdultName = new Map();
for (const { mention } of occurrences) {
  if (mention.personId && adultAnchorRoles.has(mention.role) && familyName(mention.displayName)) {
    existingByAdultName.set(normalize(mention.displayName), mention.personId);
  }
}

const fatherForSource = new Map(batch.map(({ value }) => [
  value.sourceId,
  value.mentions?.find((mention) => mention.role === "father")?.displayName ?? null,
]));

const entityKey = ({ source, mention }) => {
  if (mention.personId) return `id:${mention.personId}`;
  const explicit = samePersonGroups.get(mention.mentionId);
  if (explicit) return `explicit:${explicit}`;
  const name = normalize(mention.displayName ?? mention.modernName);
  if (adultAnchorRoles.has(mention.role) && familyName(mention.displayName)) return `adult:${name}`;
  if (mention.role === "mother") return `mother:${normalize(fatherForSource.get(source.sourceId))}:${name.split(" ").slice(0, 2).join(" ")}`;
  return `mention:${mention.mentionId}`;
};

const entities = new Map();
for (const occurrence of occurrences) {
  const key = entityKey(occurrence);
  const list = entities.get(key) ?? [];
  list.push(occurrence);
  entities.set(key, list);
}

function mergeProfile(current, incoming) {
  const result = { ...current, ...incoming };
  for (const key of ["nameVariants", "parents", "familyIds", "sourceIds", "notes"]) {
    const values = unique([...(current[key] ?? []), ...(incoming[key] ?? [])]);
    if (values.length) result[key] = values;
    else delete result[key];
  }
  if (current.birth && incoming.birth) result.birth = { ...incoming.birth, ...current.birth };
  if (current.death && incoming.death) result.death = { ...incoming.death, ...current.death };
  if (current.surname && incoming.surname) result.surname = {
    ...current.surname,
    formsAsWritten: unique([...(current.surname.formsAsWritten ?? []), ...(incoming.surname.formsAsWritten ?? [])]),
  };
  return result;
}

const entityIds = new Map();
for (const [key, group] of [...entities].sort(([left], [right]) => left.localeCompare(right))) {
  const ids = unique(group.map(({ mention }) => mention.personId));
  if (ids.length > 1) throw new Error(`Несовместимые personId для ${key}: ${ids.join(", ")}`);
  const first = group[0];
  const id = ids[0] ?? existingByAdultName.get(normalize(first.mention.displayName)) ?? personId();
  entityIds.set(key, id);
  const displayName = first.mention.displayName ?? first.mention.modernName;
  const variants = unique(group.flatMap(({ mention }) => [
    ...(mention.alternateNames ?? []), mention.nameAsIndexed, mention.nameAsTranscribed,
  ]).filter((name) => name && name !== displayName));
  const facts = group.reduce((result, item) => ({ ...result, ...eventFact(item.source, item.mention.role) }), {});
  const incoming = {
    schemaVersion: 1,
    personId: id,
    displayName,
    sex: first.mention.sex ?? "unknown",
    ...(variants.length ? { nameVariants: variants } : {}),
    ...facts,
    sourceIds: unique(group.map(({ source }) => source.sourceId)),
    status: "documented-from-primary-scan",
    ...(canonicalSurname(displayName) ? { surname: canonicalSurname(displayName) } : {}),
  };
  const current = people.get(id);
  const value = current ? mergeProfile(current.value, incoming) : incoming;
  const file = current?.file ?? path.join(peopleRoot, `${id}-${transliterate(displayName)}.json`);
  people.set(id, { file, value });
  dirtyPeople.add(id);
  for (const { source, mention } of group) {
    if (mention.personId !== id) {
      mention.personId = id;
      dirtySources.add(source.sourceId);
    }
  }
}

const idForMention = (source, mention) => mention.personId ?? entityIds.get(entityKey({ source, mention }));
const familyGroups = new Map();
const addFamilyEvent = (key, event) => {
  const current = familyGroups.get(key) ?? { spouses: [], children: [], places: [], sourceIds: [], confidence: "documented-family" };
  current.spouses = unique([...current.spouses, ...(event.spouses ?? [])]);
  current.children = unique([...current.children, ...(event.children ?? [])]);
  current.places = unique([...current.places, event.placeId]);
  current.sourceIds = unique([...current.sourceIds, event.sourceId]);
  if (event.probable) current.confidence = "documented-probable-family";
  familyGroups.set(key, current);
};

for (const { value: source } of batch) {
  const role = (name) => source.mentions?.find((mention) => mention.role === name);
  const target = source.mentions?.find((mention) => childRoles.has(mention.role));
  const father = role("father");
  const mother = role("mother");
  const groom = role("groom");
  const bride = role("bride");
  if (groom && bride) {
    const spouses = [idForMention(source, groom), idForMention(source, bride)];
    addFamilyEvent(`couple:${spouses.join(":")}`, { spouses, sourceId: source.sourceId, placeId: sourcePlace(source) });
  } else if (target && father) {
    const fatherId = idForMention(source, father);
    const motherId = mother ? idForMention(source, mother) : null;
    const childId = idForMention(source, target);
    addFamilyEvent(`parents:${fatherId}:${motherId ?? "unknown"}`, {
      spouses: unique([fatherId, motherId]), children: [childId], sourceId: source.sourceId,
      placeId: sourcePlace(source), probable: !motherId,
    });
    const child = people.get(childId).value;
    child.parents = unique([...(child.parents ?? []), fatherId, motherId]);
    dirtyPeople.add(childId);
  }
}

// Merge a father-only group into a single fully named parental group when the
// batch provides exactly one spouse for that father.
for (const [key, group] of [...familyGroups]) {
  const match = key.match(/^parents:(P\d+):unknown$/);
  if (!match) continue;
  const candidates = [...familyGroups].filter(([otherKey]) => otherKey.startsWith(`parents:${match[1]}:P`));
  if (candidates.length !== 1) continue;
  const [targetKey, target] = candidates[0];
  target.children = unique([...target.children, ...group.children]);
  target.places = unique([...target.places, ...group.places]);
  target.sourceIds = unique([...target.sourceIds, ...group.sourceIds]);
  target.confidence = "documented-probable-family";
  familyGroups.delete(key);
  for (const childId of group.children) {
    const child = people.get(childId).value;
    child.parents = unique([...(child.parents ?? []), ...target.spouses]);
    dirtyPeople.add(childId);
  }
  familyGroups.set(targetKey, target);
}

function existingFamilyFor(group) {
  return [...families.values()].find(({ value }) => {
    const members = new Set([...(value.spouses ?? []), ...(value.children ?? [])]);
    return group.spouses.every((id) => members.has(id)) || group.sourceIds.some((id) => value.sourceIds?.includes(id));
  });
}

for (const [, group] of familyGroups) {
  const current = existingFamilyFor(group);
  const id = current?.value.familyId ?? familyId();
  const value = {
    schemaVersion: 1,
    familyId: id,
    spouses: unique([...(current?.value.spouses ?? []), ...group.spouses]),
    children: unique([...(current?.value.children ?? []), ...group.children]),
    places: unique([...(current?.value.places ?? []), ...group.places]),
    sourceIds: unique([...(current?.value.sourceIds ?? []), ...group.sourceIds]),
    status: current?.value.status === "documented-probable-family" ? current.value.status : group.confidence,
    ...((current?.value.notes?.length || group.confidence === "documented-probable-family") ? {
      notes: unique([...(current?.value.notes ?? []), ...(group.confidence === "documented-probable-family"
        ? ["Часть детских записей называет только отца; объединение опирается на его полное имя, место и совместимую хронологию."] : [])]),
    } : {}),
  };
  const file = current?.file ?? path.join(familiesRoot, `${id}-${transliterate(people.get(group.spouses[0])?.value.displayName ?? "family")}.json`);
  families.set(id, { file, value });
  dirtyFamilies.add(id);
  for (const memberId of [...value.spouses, ...value.children]) {
    const person = people.get(memberId)?.value;
    if (!person) continue;
    person.familyIds = unique([...(person.familyIds ?? []), id]);
    dirtyPeople.add(memberId);
  }
  const canonicalSourceId = value.sourceIds[0];
  for (const sourceId of group.sourceIds.filter((candidate) => candidate !== canonicalSourceId)) {
    const source = batch.find(({ value: candidate }) => candidate.sourceId === sourceId)?.value;
    if (!source) continue;
    const relation = {
      type: "same-family",
      sourceId: canonicalSourceId,
      confidence: group.confidence === "documented-family" ? "high" : "medium",
      note: group.confidence === "documented-family"
        ? "Связь установлена по названной родительской или супружеской паре."
        : "Вероятная семейная связь по полному имени отца, месту и совместимой хронологии; мать названа не во всех записях.",
    };
    source.sourceRelations = source.sourceRelations ?? [];
    if (!source.sourceRelations.some((item) => item.type === relation.type && item.sourceId === relation.sourceId)) {
      source.sourceRelations.push(relation);
      dirtySources.add(sourceId);
    }
  }
}

for (const { value: source } of batch) {
  const primary = source.mentions?.find((mention) => childRoles.has(mention.role)) ??
    source.mentions?.find((mention) => mention.role === "groom" && familyName(mention.displayName)) ??
    source.mentions?.find((mention) => mention.role === "bride" && familyName(mention.displayName)) ??
    source.mentions?.find((mention) => mention.role === "deceased" && familyName(mention.displayName));
  if (primary?.personId && source.primaryPersonId !== primary.personId) {
    source.primaryPersonId = primary.personId;
    dirtySources.add(source.sourceId);
  }
  for (const mention of source.mentions ?? []) {
    if (!mention.personId || !["groom", "bride", "father", "deceased"].includes(mention.role)) continue;
    const from = (mention.places ?? []).find((place) =>
      place.placeId && place.placeId !== sourcePlace(source) && /origin|estate-affiliation/u.test(place.relation ?? place.type ?? ""));
    if (!from || !sourcePlace(source)) continue;
    const observation = {
      personId: mention.personId,
      personName: mention.displayName,
      from: { placeId: from.placeId, ...(from.asWritten ? { asWritten: from.asWritten } : {}), normalized: from.normalized },
      to: { placeId: sourcePlace(source), normalized: source.event.place.normalized },
      basis: "Источник прямо называет происхождение или сословно-территориальную приписку человека и фиксирует его в другом месте. Это доказывает географическую связь, но не точную дату постоянного переселения.",
      confidence: from.confidence === "high" ? "high" : "medium",
    };
    source.migrationObservations = source.migrationObservations ?? [];
    const existing = source.migrationObservations.find((item) =>
      normalize(item.personName) === normalize(observation.personName) &&
      item.from?.placeId === observation.from.placeId && item.to?.placeId === observation.to.placeId);
    if (existing) {
      if (!existing.personId) {
        existing.personId = observation.personId;
        dirtySources.add(source.sourceId);
      }
    } else {
      source.migrationObservations.push(observation);
      dirtySources.add(source.sourceId);
    }
  }
  if (source.migrationObservations?.length) {
    const deduplicated = new Map();
    for (const item of source.migrationObservations) {
      const key = `${normalize(item.personName)}|${item.from?.placeId}|${item.to?.placeId}`;
      const current = deduplicated.get(key);
      if (!current) deduplicated.set(key, item);
      else if (!current.personId && item.personId) current.personId = item.personId;
    }
    if (deduplicated.size !== source.migrationObservations.length) {
      source.migrationObservations = [...deduplicated.values()];
      dirtySources.add(source.sourceId);
    }
  }
}

// A village within the same Cherny district and the district town are local
// geography, not evidence of an interregional migration route.
const localChern = batch.find(({ value }) => value.sourceId === "FS-3QS7-8966-LQPD")?.value;
if (localChern?.migrationObservations) {
  const filtered = localChern.migrationObservations.filter((item) =>
    !(item.from?.placeId === "chern-uezd" && item.to?.placeId === "chern-tula"));
  if (filtered.length !== localChern.migrationObservations.length) {
    localChern.migrationObservations = filtered;
    dirtySources.add(localChern.sourceId);
  }
}

const simbirskSource = batch.find(({ value }) => value.sourceId === "FS-3QS7-L994-J9NC-J")?.value;
if (simbirskSource?.event?.place?.placeId === "samara" && /Симбирск/u.test(simbirskSource.event.place.normalized ?? "")) {
  simbirskSource.event.place.placeId = "simbirsk";
  dirtySources.add(simbirskSource.sourceId);
}

let writes = 0;
for (const sourceId of dirtySources) {
  const entry = batch.find(({ value }) => value.sourceId === sourceId);
  if (entry && writeJson(entry.file, entry.value)) writes += 1;
}
for (const personId of dirtyPeople) {
  const entry = people.get(personId);
  if (entry && writeJson(entry.file, entry.value)) writes += 1;
}
for (const familyId of dirtyFamilies) {
  const entry = families.get(familyId);
  if (entry && writeJson(entry.file, entry.value)) writes += 1;
}

console.log(JSON.stringify({
  reviewedRussianSources: batch.length,
  linkedSources: batch.filter(({ value }) => value.primaryPersonId).length,
  people: people.size,
  families: families.size,
  migrations: batch.reduce((total, { value }) => total + (value.migrationObservations?.length ?? 0), 0),
  writes,
}, null, 2));
