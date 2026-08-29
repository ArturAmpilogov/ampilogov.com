import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const genealogyRoot = path.join(root, "data/genealogy");
const apply = process.argv.includes("--apply");

const familySurname = /(?:ампилог|ампилов|импилов|амфилог|амфилов|анпилог|анпилов|анфилог|анфилов|онфилог|онпилог|антилог|ампелог|анпелог|апилог)/i;
const birthRoles = new Set(["child", "baptized-child", "newborn", "subject"]);
const deathRoles = new Set(["deceased", "deceased-child", "deceased-son", "deceased-daughter", "deceased-widow"]);
const marriageRoles = new Set(["groom", "bride", "spouse"]);
const completedReadingPattern = /(?:complete|verified|checked|transcri(?:bed|ption)|full-page|primary-scan|published-(?:register|archival|full|householder)|official-database-card|official-case-metadata|compiled-index|indexed-fields)/i;

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
}

async function loadDirectory(relativeDirectory, idKey) {
  const records = [];
  for (const file of await jsonFiles(path.join(genealogyRoot, relativeDirectory))) {
    const text = await readFile(file, "utf8");
    const record = JSON.parse(text);
    if (record[idKey]) records.push({ file, record, text });
  }
  return records;
}

function normalizedName(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/ъ\b/g, "")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

function mentionName(mention) {
  return mention.displayName ?? mention.modernName ?? mention.nameAsTranscribed ??
    mention.nameAsWritten ?? mention.nameAsIndexed ?? "";
}

function eventIso(source) {
  const date = source.event?.date ?? {};
  const preferred = source.event?.type?.includes("birth")
    ? date.birthIso ?? date.iso
    : source.event?.type?.includes("death")
      ? date.deathIso ?? date.iso
      : source.event?.type?.includes("marriage")
        ? date.marriageIso ?? date.iso
        : date.iso;
  if (typeof preferred === "string" && /^\d{4}-\d{2}-\d{2}$/.test(preferred)) return preferred;
  return null;
}

function eventYear(source) {
  const date = source.event?.date ?? {};
  if (Number.isFinite(date.yearFrom)) return date.yearFrom;
  const text = [date.iso, date.birthIso, date.deathIso, date.marriageIso, date.display]
    .filter(Boolean).join(" ");
  return Number(text.match(/\b(?:14|15|16|17|18|19)\d{2}\b/)?.[0] ?? 0);
}

function ageYears(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string") {
    const clean = value.replace(/\[[^\]]+\]/g, "").trim();
    if (/^\d+$/.test(clean)) return Number(clean);
    const match = clean.match(/(?:^|\s)(\d+)\s*(?:лет|год(?:а)?|years?)(?:\s|$)/i);
    return match ? Number(match[1]) : null;
  }
  if (value && typeof value === "object") {
    const years = Number(value.years ?? value.year);
    if (Number.isFinite(years) && years >= 0) return years;
    for (const key of ["display", "asWritten", "value", "text"]) {
      const parsed = ageYears(value[key]);
      if (parsed !== null) return parsed;
    }
  }
  return null;
}

function sourceAge(source, mention) {
  const fields = source.transcription?.fields ?? {};
  const role = mention.role ?? "";
  if (role === "groom") return mention.age ?? fields.groomAge ?? source.indexData?.groomAge;
  if (role === "bride") return mention.age ?? fields.brideAge ?? source.indexData?.brideAge;
  return mention.age ?? fields.age ?? source.indexData?.age ?? source.indexData?.indexedAge;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addYears(date, years) {
  const result = new Date(date);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  return result;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function birthEstimate(source, years) {
  const iso = eventIso(source);
  const year = eventYear(source);
  if (!year || years === null) return null;
  if (!iso) {
    return {
      yearFrom: year - years - 1,
      yearTo: year - years,
      display: `${year - years - 1}–${year - years}`,
      from: null,
      to: null,
    };
  }
  const date = new Date(`${iso}T00:00:00Z`);
  const from = addDays(addYears(date, -(years + 1)), 1);
  const to = addYears(date, -years);
  return {
    yearFrom: from.getUTCFullYear(),
    yearTo: to.getUTCFullYear(),
    display: from.getUTCFullYear() === to.getUTCFullYear()
      ? String(from.getUTCFullYear())
      : `${from.getUTCFullYear()}–${to.getUTCFullYear()}`,
    from: isoDate(from),
    to: isoDate(to),
  };
}

function profileBirthYear(person) {
  const values = [
    person.birth?.date,
    person.dates?.birth?.iso,
    person.dates?.birth?.display,
    person.birthEstimate?.year,
    person.birthEstimate?.from,
    person.birthEstimate?.to,
  ];
  for (const value of values) {
    const text = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    const year = Number(text.match(/\b(?:14|15|16|17|18|19)\d{2}\b/)?.[0] ?? 0);
    if (year) return year;
  }
  return 0;
}

function mentionIsChronologicallyCompatible(mention, person, source) {
  const year = eventYear(source);
  const birthYear = profileBirthYear(person);
  if (!year || !birthYear) return true;
  const role = mention.role ?? "";
  if (birthRoles.has(role) && Math.abs(year - birthYear) > 1) return false;
  if (deathRoles.has(role) && birthYear > year) return false;
  if (["father", "mother", "parent", "groom", "bride", "spouse", "godparent", "witness", "surety"].includes(role) && birthYear > year - 12) return false;
  return true;
}

function personPlaceKeys(person, sourcesById) {
  const keys = new Set();
  for (const place of person.places ?? []) {
    const entry = typeof place === "string" ? { placeId: place } : place;
    for (const value of [entry.placeId, entry.normalized, entry.asWritten]) {
      if (value) keys.add(normalizedName(value));
    }
  }
  for (const sourceId of person.sourceIds ?? []) {
    const place = sourcesById.get(sourceId)?.event?.place;
    for (const value of [place?.placeId, place?.normalized, place?.asWritten, place?.asIndexed]) {
      if (value) keys.add(normalizedName(value));
    }
  }
  return keys;
}

function sourcePlaceKeys(source) {
  const place = source.event?.place;
  return new Set([place?.placeId, place?.normalized, place?.asWritten, place?.asIndexed]
    .filter(Boolean).map(normalizedName));
}

function overlaps(left, right) {
  return [...left].some((value) => right.has(value));
}

function namesForPerson(person) {
  return [person.displayName, ...(person.nameVariants ?? [])].filter(Boolean);
}

function personIsInResearchScope(person) {
  return Boolean(person?.researchSubject || familySurname.test([
    person?.displayName,
    person?.surname?.normalized,
    ...(person?.nameVariants ?? []),
    ...(person?.surname?.formsAsWritten ?? []),
  ].filter(Boolean).join(" ")));
}

function relatedThroughFamily(source, mention, personId, familiesByPerson) {
  const linkedIds = new Set((source.mentions ?? []).map((entry) => entry.personId).filter(Boolean));
  if (!linkedIds.size) return false;
  for (const family of familiesByPerson.get(personId) ?? []) {
    const members = [...(family.spouses ?? []), ...(family.children ?? [])];
    if (!members.some((id) => linkedIds.has(id))) continue;
    if (source.event?.type?.includes("marriage") && (family.spouses ?? []).includes(personId)) return true;
    if (source.event?.type?.includes("birth")) {
      if (birthRoles.has(mention.role ?? "") && (family.children ?? []).includes(personId)) return true;
      if (["father", "mother", "parent"].includes(mention.role ?? "") && (family.spouses ?? []).includes(personId)) return true;
    }
  }
  return false;
}

function peopleShareFamily(leftId, rightId, familiesByPerson) {
  return (familiesByPerson.get(leftId) ?? []).some((family) =>
    [...(family.spouses ?? []), ...(family.children ?? [])].includes(rightId)
  );
}

function sourceHasCompletedReading(source) {
  return Boolean(source.transcription?.literal?.trim()) && (
    completedReadingPattern.test(source.transcription?.status ?? "") ||
    completedReadingPattern.test(source.review?.status ?? "")
  );
}

function addDocumentedRelation(person, type, relatedPersonId, sourceId, basis) {
  person.relations ??= [];
  const existing = person.relations.find((relation) =>
    relation.type === type && relation.personId === relatedPersonId
  );
  if (existing) {
    const sourceIds = new Set([...(existing.sourceIds ?? []), sourceId]);
    if (sourceIds.size === (existing.sourceIds ?? []).length) return false;
    existing.sourceIds = [...sourceIds];
    existing.basis ??= basis;
    existing.confidence ??= "high";
    return true;
  }
  person.relations.push({
    type,
    personId: relatedPersonId,
    sourceIds: [sourceId],
    basis,
    confidence: "high",
  });
  return true;
}

function sameBirthDate(source, mention, person) {
  if (!source.event?.type?.includes("birth") || !birthRoles.has(mention.role ?? "")) return false;
  const sourceDate = source.event?.date?.birthIso ?? source.event?.date?.iso;
  const profileDate = typeof person.birth?.date === "string"
    ? person.birth.date
    : person.birth?.date?.iso ?? person.dates?.birth?.iso;
  return Boolean(sourceDate && profileDate && sourceDate === profileDate);
}

function sameDocumentAlreadyLinked(source, person, sourcesById) {
  if ((person.sourceIds ?? []).includes(source.sourceId)) return true;
  if (!source.evidence?.sha256) return false;
  return (person.sourceIds ?? []).some((sourceId) =>
    sourcesById.get(sourceId)?.evidence?.sha256 === source.evidence.sha256
  );
}

function writePretty(entry) {
  return writeFile(entry.file, `${JSON.stringify(entry.record, null, 2)}\n`);
}

const [peopleEntries, familyEntries, sourceEntries] = await Promise.all([
  loadDirectory("people", "personId"),
  loadDirectory("families", "familyId"),
  loadDirectory("sources", "sourceId"),
]);

const peopleById = new Map(peopleEntries.map((entry) => [entry.record.personId, entry.record]));
const personEntriesById = new Map(peopleEntries.map((entry) => [entry.record.personId, entry]));
const sourcesById = new Map(sourceEntries.map((entry) => [entry.record.sourceId, entry.record]));
const familiesByPerson = new Map();
for (const { record: family } of familyEntries) {
  for (const personId of [...(family.spouses ?? []), ...(family.children ?? [])]) {
    const list = familiesByPerson.get(personId) ?? [];
    list.push(family);
    familiesByPerson.set(personId, list);
  }
}

const nameIndex = new Map();
for (const { record: person } of peopleEntries) {
  for (const name of namesForPerson(person)) {
    const key = normalizedName(name);
    if (!key) continue;
    const ids = nameIndex.get(key) ?? new Set();
    ids.add(person.personId);
    nameIndex.set(key, ids);
  }
}

const changedSources = new Set();
const changedPeople = new Set();
const stats = {
  sourceBirthEstimates: 0,
  personBirthEstimates: 0,
  safeMentionLinks: 0,
  possibleRelations: 0,
  rejectedNameMatches: 0,
  documentedParentRelations: 0,
  documentedSpouseRelations: 0,
};
const safeLinkDetails = [];
const possibleRelationDetails = [];

for (const sourceEntry of sourceEntries) {
  const source = sourceEntry.record;
  const fields = source.transcription?.fields ?? null;

  for (const mention of source.mentions ?? []) {
    const role = mention.role ?? "";
    const years = ageYears(sourceAge(source, mention));
    const estimate = years === null ? null : birthEstimate(source, years);
    const isDeath = source.event?.type?.includes("death") && deathRoles.has(role);
    const isMarriage = source.event?.type?.includes("marriage") && marriageRoles.has(role);

    if (fields && estimate && (isDeath || isMarriage)) {
      const key = isMarriage
        ? role === "groom" ? "groomBirthYearEstimated" : role === "bride" ? "brideBirthYearEstimated" : null
        : "birthYearEstimated";
      if (key && fields[key] == null && fields.estimatedBirthYear == null && fields.birthYearApprox == null) {
        fields[key] = estimate.display;
        stats.sourceBirthEstimates += 1;
        changedSources.add(sourceEntry);
      }
    }

    if (!mention.personId) {
      const key = normalizedName(mentionName(mention));
      const ids = [...(nameIndex.get(key) ?? [])];
      if (ids.length === 1) {
        const personId = ids[0];
        const person = peopleById.get(personId);
        const compatible = mentionIsChronologicallyCompatible(mention, person, source);
        if (!compatible) {
          stats.rejectedNameMatches += 1;
        } else {
          const safe = personIsInResearchScope(person) && (sameBirthDate(source, mention, person) ||
            sameDocumentAlreadyLinked(source, person, sourcesById) ||
            relatedThroughFamily(source, mention, personId, familiesByPerson));
          if (safe) {
            mention.personId = personId;
            if (!(person.sourceIds ?? []).includes(source.sourceId)) {
              person.sourceIds = [...(person.sourceIds ?? []), source.sourceId];
              changedPeople.add(personEntriesById.get(personId));
            }
            if (!source.primaryPersonId && (birthRoles.has(role) || deathRoles.has(role) || marriageRoles.has(role))) {
              source.primaryPersonId = personId;
            }
            stats.safeMentionLinks += 1;
            safeLinkDetails.push(`${source.sourceId}/${mention.mentionId ?? "без mentionId"}: ${mentionName(mention)} → ${personId}`);
            changedSources.add(sourceEntry);
          } else {
            const profilePlaces = personPlaceKeys(person, sourcesById);
            const placeMatch = overlaps(profilePlaces, sourcePlaceKeys(source));
            const fullName = key.split(" ").length >= 3;
            if (placeMatch && fullName && familySurname.test(mentionName(mention))) {
              source.review ??= {};
              source.review.possibleRelations ??= [];
              const alreadyPresent = source.review.possibleRelations.some((candidate) =>
                candidate.mentionId === mention.mentionId && candidate.personId === personId
              );
              if (!alreadyPresent) {
                source.review.possibleRelations.push({
                  mentionId: mention.mentionId ?? null,
                  personId,
                  displayName: mentionName(mention),
                  confidence: "medium",
                  basis: "Совпадают полное имя и документированное место; хронология не противоречит связи.",
                  caution: "Связь не установлена автоматически: требуется независимое совпадение родственников, возраста или другого первичного акта.",
                });
                stats.possibleRelations += 1;
                possibleRelationDetails.push(`${source.sourceId}/${mention.mentionId ?? "без mentionId"}: ${mentionName(mention)} ⇢ ${personId}`);
                changedSources.add(sourceEntry);
              }
            }
          }
        }
      }
    }

    if (mention.personId && estimate && (isDeath || isMarriage)) {
      const person = peopleById.get(mention.personId);
      if (personIsInResearchScope(person) && !person.birth?.date &&
        !person.dates?.birth?.iso && !person.dates?.birth?.display && !person.birthEstimate) {
        person.birthEstimate = estimate.from && estimate.to
          ? {
              from: estimate.from,
              to: estimate.to,
              basis: `${years} лет в записи «${source.event?.typeAsRussian ?? source.event?.type ?? "событие"}» от ${source.event?.date?.display ?? eventIso(source) ?? eventYear(source)}`,
            }
          : {
              year: estimate.yearTo,
              basis: `${years} лет в датированной записи ${eventYear(source)} года; расчётный год округлён`,
            };
        stats.personBirthEstimates += 1;
        changedPeople.add(personEntriesById.get(mention.personId));
      }
    }
  }

  if (sourceHasCompletedReading(source)) {
    const mentions = source.mentions ?? [];
    if (source.event?.type?.includes("birth")) {
      const childMention = mentions.find((mention) =>
        mention.personId && birthRoles.has(mention.role ?? "")
      );
      const child = childMention?.personId ? peopleById.get(childMention.personId) : null;
      if (child && personIsInResearchScope(child)) {
        for (const parentMention of mentions.filter((mention) =>
          mention.personId && ["father", "mother", "parent"].includes(mention.role ?? "")
        )) {
          const parent = peopleById.get(parentMention.personId);
          if (!parent || !personIsInResearchScope(parent) || parent.personId === child.personId ||
            peopleShareFamily(child.personId, parent.personId, familiesByPerson)) continue;
          const childRelationType = child.sex === "female" ? "daughter-of" : child.sex === "male" ? "son-of" : "child-of";
          const parentRelationType = parentMention.role === "mother" ? "mother-of" : parentMention.role === "father" ? "father-of" : "parent-of";
          const basis = `Прямая родственная формула в записи ${source.sourceId}`;
          const childChanged = addDocumentedRelation(child, childRelationType, parent.personId, source.sourceId, basis);
          const parentChanged = addDocumentedRelation(parent, parentRelationType, child.personId, source.sourceId, basis);
          if (childChanged) changedPeople.add(personEntriesById.get(child.personId));
          if (parentChanged) changedPeople.add(personEntriesById.get(parent.personId));
          if (childChanged || parentChanged) stats.documentedParentRelations += 1;
        }
      }
    }

    if (source.event?.type?.includes("marriage")) {
      const spouses = mentions.filter((mention) =>
        mention.personId && marriageRoles.has(mention.role ?? "") && personIsInResearchScope(peopleById.get(mention.personId))
      );
      if (spouses.length >= 2) {
        const [leftMention, rightMention] = spouses;
        const left = peopleById.get(leftMention.personId);
        const right = peopleById.get(rightMention.personId);
        if (left && right && left.personId !== right.personId &&
          !peopleShareFamily(left.personId, right.personId, familiesByPerson)) {
          const basis = `Супруги прямо названы в записи ${source.sourceId}`;
          const leftChanged = addDocumentedRelation(left, "spouse-of", right.personId, source.sourceId, basis);
          const rightChanged = addDocumentedRelation(right, "spouse-of", left.personId, source.sourceId, basis);
          if (leftChanged) changedPeople.add(personEntriesById.get(left.personId));
          if (rightChanged) changedPeople.add(personEntriesById.get(right.personId));
          if (leftChanged || rightChanged) stats.documentedSpouseRelations += 1;
        }
      }
    }
  }
}

if (apply) {
  await Promise.all([
    ...[...changedSources].filter(Boolean).map(writePretty),
    ...[...changedPeople].filter(Boolean).map(writePretty),
  ]);
}

console.log(JSON.stringify({
  mode: apply ? "apply" : "dry-run",
  changedSourceFiles: changedSources.size,
  changedPeopleFiles: changedPeople.size,
  ...stats,
  safeLinkDetails,
  possibleRelationDetails,
}, null, 2));
