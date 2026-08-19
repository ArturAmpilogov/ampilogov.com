import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const GENEALOGY_ROOT = path.join(process.cwd(), "data/genealogy");

type PersonRecord = {
  personId: string;
  displayName: string;
  patronymic?: string;
  sex?: "male" | "female";
  nameVariants?: string[];
  birth?: { date?: string; placeId?: string };
  occupation?: string[];
  parents?: string[];
  familyIds?: string[];
  sourceIds?: string[];
  status?: string;
  notes?: string[];
  surname?: { normalized?: string; formsAsWritten?: string[] };
};

type FamilyRecord = {
  familyId: string;
  spouses?: string[];
  children?: string[];
  marriage?: {
    date?: string;
    placeId?: string;
    sourceId?: string;
    sourceIds?: string[];
  };
  places?: string[];
  status?: string;
  notes?: string[];
};

type SourceRecord = {
  sourceId: string;
  provider?: string;
  collection?: {
    title?: string;
    archiveCitation?: string;
    imageGroupNumber?: string;
    itemNumber?: number;
    imageNumber?: number;
  };
  repository?: {
    name?: string;
    location?: string;
    url?: string;
    attributionAsShown?: string;
  };
  links?: { imageArk?: string; recordArk?: string; indexedRecordArk?: string };
  event?: {
    type?: string;
    date?: { display?: string; iso?: string };
    place?: { normalized?: string; asIndexed?: string; placeId?: string };
  };
  transcription?: {
    status?: string;
    literal?: string;
    modernInterpretation?: string;
    suppliedText?: string;
  };
  summary?: { status?: string; text?: string };
  mentions?: Array<{
    personId?: string;
    role?: string;
    displayName?: string;
    patronymic?: string;
    patronymicEvidence?: {
      basis?: string;
      sourceMentionId?: string;
      confidence?: "high" | "medium" | "low";
    };
    alternateNames?: string[];
    nameAsWritten?: string;
    nameAsIndexed?: string;
    nameAsTranscribed?: string;
    modernName?: string;
    socialStatus?: {
      asWritten?: string;
      normalized?: string;
    };
    occupation?: {
      asWritten?: string;
      normalized?: string;
    };
    eventAssociation?: "child" | "groom" | "bride" | "couple" | "unknown";
    relationshipNote?: string;
    uncertainties?: string[];
    places?: Array<{
      relation?: "origin" | "residence" | "registration" | "estate-affiliation";
      asWritten?: string;
      normalized?: string;
      placeId?: string;
      confidence?: "high" | "medium" | "low";
    }>;
  }>;
  migrationObservations?: Array<{
    personId?: string;
    from?: { asWritten?: string; normalized?: string; placeId?: string };
    to?: { asWritten?: string; normalized?: string; placeId?: string };
    basis?: string;
    confidence?: "high" | "medium" | "low";
  }>;
  evidence?: {
    path?: string;
    publicDisplay?: boolean;
    rightsNote?: string;
    fragments?: Array<{ part?: string; path?: string }>;
  };
  review?: { status?: string; unresolved?: string[] };
};

export type ArchiveRecordPerson = {
  personId: string | null;
  role: string;
  name: string;
  patronymic: string | null;
  alternateNames: string[];
  places: Array<{ relation: string; label: string; confidence: string }>;
  details: string[];
};

export type MigrationObservation = {
  personId: string | null;
  from: string;
  to: string;
  basis: string;
  confidence: string;
};

export type ArchiveRecord = {
  sourceId: string;
  provider: string;
  eventType: string;
  eventLabel: string;
  date: string;
  year: string;
  place: string;
  collection: string;
  repository: string;
  repositoryLocation: string;
  repositoryUrl: string | null;
  imageReference: string;
  originalUrl: string | null;
  originalLabel: string;
  indexedUrl: string | null;
  indexedLabel: string;
  evidenceUrl: string | null;
  mayDisplayEvidence: boolean;
  rightsNote: string;
  people: ArchiveRecordPerson[];
  migrations: MigrationObservation[];
  literal: string;
  modernInterpretation: string;
  summary: string;
  status: string;
  isComplete: boolean;
  unresolved: string[];
  searchText: string;
};

export type DirectorySource = {
  sourceId: string;
  eventType: string;
  eventLabel: string;
  date: string;
  place: string;
  role: string;
  nameAsWritten: string;
  transcription: string;
  summary: string;
  hasLiteralTranscription: boolean;
  hasCompleteTranscription: boolean;
  modernInterpretation: string;
  status: string;
  unresolved: string[];
  externalUrl: string | null;
  externalLabel: string;
  evidenceUrl: string | null;
  imageReference: string;
};

export type DirectoryRelation = {
  personId: string;
  name: string;
  relation: "parent" | "spouse" | "child";
};

export type DirectoryPerson = {
  personId: string;
  displayName: string;
  sex: string;
  variants: string[];
  normalizedSurname: string;
  birthDate: string;
  birthYear: string;
  places: string[];
  occupations: string[];
  status: string;
  needsReview: boolean;
  notes: string[];
  relations: DirectoryRelation[];
  sources: DirectorySource[];
  searchText: string;
};

const placeLabels: Record<string, string> = {
  tymoshivka: "Тимошевка",
  matveevka: "Матвеевка",
  samara: "Самара",
  simferopol: "Симферополь",
  kyiv: "Киев",
};

const eventLabels: Record<string, string> = {
  birth: "Рождение",
  "birth-and-baptism": "Рождение и крещение",
  baptism: "Крещение",
  marriage: "Брак",
  death: "Смерть",
  "service-review": "Смотр служилых людей",
};

const roleLabels: Record<string, string> = {
  child: "ребёнок",
  father: "отец",
  mother: "мать",
  parent: "родитель",
  groom: "жених",
  bride: "невеста",
  spouse: "супруг(а)",
  godparent: "восприемник",
  godfather: "восприемник",
  godmother: "восприемница",
  witness: "свидетель",
  surety: "поручитель",
  declarant: "заявитель",
  clergy: "священнослужитель",
  serviceman: "служилый человек",
  uncertain: "роль уточняется",
};

const placeRelationLabels: Record<string, string> = {
  origin: "происхождение",
  residence: "местожительство",
  registration: "приписка",
  "estate-affiliation": "сословная принадлежность",
};

function sourcePosition(source: SourceRecord) {
  return [
    source.collection?.archiveCitation,
    source.collection?.imageGroupNumber,
    source.collection?.itemNumber ? `Item ${source.collection.itemNumber}` : null,
    source.collection?.imageNumber ? `кадр ${source.collection.imageNumber}` : null,
  ].filter(Boolean).join(" · ");
}

function sourceDate(source: SourceRecord) {
  return source.event?.date?.display ?? formatDate(source.event?.date?.iso);
}

function sourcePlace(source: SourceRecord) {
  return source.event?.place?.normalized ??
    placeLabels[source.event?.place?.placeId ?? ""] ??
    source.event?.place?.asIndexed ??
    "Место проверяется";
}

function sourcePeople(source: SourceRecord): ArchiveRecordPerson[] {
  return (source.mentions ?? []).map((mention) => ({
    personId: mention.personId ?? null,
    role: roleLabels[mention.role ?? ""] ?? mention.role ?? "упоминание",
    name: mention.displayName ?? mention.modernName ?? mention.nameAsIndexed ?? mention.nameAsTranscribed ?? mention.nameAsWritten ?? "Имя уточняется",
    patronymic: mention.patronymic ?? null,
    alternateNames: mention.alternateNames ?? [],
    places: (mention.places ?? []).map((place) => ({
      relation: placeRelationLabels[place.relation ?? ""] ?? place.relation ?? "происхождение",
      label: place.normalized ?? place.asWritten ?? placeLabels[place.placeId ?? ""] ?? "Место уточняется",
      confidence: place.confidence ?? "medium",
    })),
    details: [
      mention.socialStatus?.normalized ?? mention.socialStatus?.asWritten,
      mention.occupation?.normalized ?? mention.occupation?.asWritten,
      mention.eventAssociation === "groom" ? "со стороны жениха" : null,
      mention.eventAssociation === "bride" ? "со стороны невесты" : null,
      mention.relationshipNote,
      ...(mention.uncertainties ?? []).map((uncertainty) => `уточнить: ${uncertainty}`),
    ].filter((value): value is string => Boolean(value)),
  }));
}

function toArchiveRecord(source: SourceRecord): ArchiveRecord {
  const eventType = source.event?.type ?? "unknown";
  const date = sourceDate(source);
  const place = sourcePlace(source);
  const people = sourcePeople(source);
  const literal = source.transcription?.literal ?? "";
  const modernInterpretation = source.transcription?.modernInterpretation ?? "";
  const summary = source.summary?.text ?? source.transcription?.suppliedText ?? "";
  const status = source.transcription?.status ?? source.review?.status ?? "working";
  const isComplete = ["complete", "verified"].includes(status);
  const migrations: MigrationObservation[] = (source.migrationObservations ?? []).map((observation) => ({
    personId: observation.personId ?? null,
    from: observation.from?.normalized ?? observation.from?.asWritten ?? placeLabels[observation.from?.placeId ?? ""] ?? "Не установлено",
    to: observation.to?.normalized ?? observation.to?.asWritten ?? placeLabels[observation.to?.placeId ?? ""] ?? place,
    basis: observation.basis ?? "Происхождение человека отличается от места события",
    confidence: observation.confidence ?? "medium",
  }));
  const isFamilySearch = (source.provider ?? "FamilySearch") === "FamilySearch";

  return {
    sourceId: source.sourceId,
    provider: source.provider ?? "FamilySearch",
    eventType,
    eventLabel: eventLabels[eventType] ?? "Запись",
    date,
    year: source.event?.date?.iso?.match(/^\d{4}/)?.[0] ?? date.match(/\b\d{4}\b/)?.[0] ?? "",
    place,
    collection: source.collection?.title ?? "Коллекция FamilySearch",
    repository: source.repository?.name ?? "Архив-хранитель уточняется",
    repositoryLocation: source.repository?.location ?? "Место хранения уточняется",
    repositoryUrl: source.repository?.url ?? null,
    imageReference: sourcePosition(source),
    originalUrl: source.links?.imageArk ?? null,
    originalLabel: isFamilySearch ? "Открыть скан в FamilySearch" : "Открыть цифровую копию",
    indexedUrl: source.links?.indexedRecordArk ?? source.links?.recordArk ?? null,
    indexedLabel: isFamilySearch ? "Индекс FamilySearch" : "Опубликованный текст",
    evidenceUrl: evidenceUrl(source),
    mayDisplayEvidence: source.evidence?.publicDisplay === true,
    rightsNote: source.evidence?.rightsNote ?? "Права на изображение не проверены; публичная копия не показывается.",
    people,
    migrations,
    literal,
    modernInterpretation,
    summary,
    status,
    isComplete,
    unresolved: source.review?.unresolved ?? [],
    searchText: [
      source.sourceId,
      eventLabels[eventType],
      date,
      place,
      source.collection?.title,
      source.repository?.name,
      source.repository?.location,
      sourcePosition(source),
      ...people.flatMap((person) => [person.name, person.patronymic, person.role]),
      ...people.flatMap((person) => person.alternateNames),
      ...people.flatMap((person) => person.details),
      ...people.flatMap((person) => person.places.map((entry) => entry.label)),
      ...migrations.flatMap((migration) => [migration.from, migration.to, migration.basis]),
      literal,
      modernInterpretation,
      summary,
    ].filter(Boolean).join(" ").toLocaleLowerCase("ru"),
  };
}

export function getRecordsDirectory() {
  const records = readJsonTree<SourceRecord>(
    path.join(GENEALOGY_ROOT, "sources"),
  ).map(toArchiveRecord).sort((left, right) =>
    (left.year || "9999").localeCompare(right.year || "9999") || left.date.localeCompare(right.date, "ru")
  );

  return {
    records,
    stats: {
      records: records.length,
      complete: records.filter((record) => record.isComplete).length,
      withImages: records.filter((record) => Boolean(record.evidenceUrl)).length,
    },
  };
}

export function getArchiveRecord(sourceId: string) {
  return getRecordsDirectory().records.find((record) => record.sourceId === sourceId) ?? null;
}

function readJsonDirectory<T>(directory: string): T[] {
  return readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => JSON.parse(readFileSync(path.join(directory, file), "utf8")) as T);
}

function readJsonTree<T>(directory: string): T[] {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return readJsonTree<T>(entryPath);
      if (!entry.name.endsWith(".json")) return [];
      return [JSON.parse(readFileSync(entryPath, "utf8")) as T];
    });
}

function evidenceUrl(source?: SourceRecord) {
  const evidencePath = source?.evidence?.path;
  if (!evidencePath?.startsWith("docs/")) return null;
  return `/archive/${evidencePath.slice("docs/".length)}`;
}

function formatDate(value?: string) {
  if (!value) return "Дата не установлена";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function getPeopleDirectory() {
  const people = readJsonDirectory<PersonRecord>(path.join(GENEALOGY_ROOT, "people"));
  const families = readJsonDirectory<FamilyRecord>(path.join(GENEALOGY_ROOT, "families"));
  const sources = readJsonTree<SourceRecord>(path.join(GENEALOGY_ROOT, "sources"));
  const peopleById = new Map(people.map((person) => [person.personId, person]));
  const sourcesById = new Map(sources.map((source) => [source.sourceId, source]));

  const directory: DirectoryPerson[] = people.map((person) => {
    const personSources = (person.sourceIds ?? [])
      .map((sourceId) => sourcesById.get(sourceId))
      .filter((source): source is SourceRecord => Boolean(source))
      .map((source): DirectorySource => {
        const mention = source.mentions?.find((entry) => entry.personId === person.personId);
        const type = source.event?.type ?? "unknown";
        const position = sourcePosition(source);

        const literalTranscription = source.transcription?.literal ?? "";
        const summary = source.summary?.text ?? source.transcription?.suppliedText ?? "";
        const hasCompleteTranscription = ["complete", "verified"].includes(
          source.transcription?.status ?? "",
        );

        return {
          sourceId: source.sourceId,
          eventType: type,
          eventLabel: eventLabels[type] ?? "Запись",
          date: sourceDate(source),
          place: sourcePlace(source),
          role: roleLabels[mention?.role ?? ""] ?? mention?.role ?? "упоминание",
          nameAsWritten: mention?.nameAsTranscribed ?? mention?.nameAsWritten ?? mention?.nameAsIndexed ?? person.displayName,
          transcription: literalTranscription,
          summary,
          hasLiteralTranscription: Boolean(literalTranscription),
          hasCompleteTranscription,
          modernInterpretation: source.transcription?.modernInterpretation ?? "",
          status: source.transcription?.status ?? source.review?.status ?? "working",
          unresolved: source.review?.unresolved ?? [],
          externalUrl: source.links?.imageArk ?? source.links?.indexedRecordArk ?? source.links?.recordArk ?? null,
          externalLabel: (source.provider ?? "FamilySearch") === "FamilySearch" ? "FamilySearch" : "Опубликованный текст",
          evidenceUrl: evidenceUrl(source),
          imageReference: position,
        };
      })
      .sort((left, right) => left.date.localeCompare(right.date, "ru"));

    const relationMap = new Map<string, DirectoryRelation>();
    for (const parentId of person.parents ?? []) {
      const parent = peopleById.get(parentId);
      if (parent) relationMap.set(`parent:${parentId}`, { personId: parentId, name: parent.displayName, relation: "parent" });
    }
    for (const familyId of person.familyIds ?? []) {
      const family = families.find((entry) => entry.familyId === familyId);
      if (!family) continue;
      const isSpouse = family.spouses?.includes(person.personId);
      if (isSpouse) {
        for (const spouseId of family.spouses ?? []) {
          if (spouseId === person.personId) continue;
          const spouse = peopleById.get(spouseId);
          if (spouse) relationMap.set(`spouse:${spouseId}`, { personId: spouseId, name: spouse.displayName, relation: "spouse" });
        }
        for (const childId of family.children ?? []) {
          const child = peopleById.get(childId);
          if (child) relationMap.set(`child:${childId}`, { personId: childId, name: child.displayName, relation: "child" });
        }
      }
    }

    const sourcePlaces = personSources.map((source) => source.place);
    const places = [...new Set([
      person.birth?.placeId ? placeLabels[person.birth.placeId] ?? person.birth.placeId : "",
      ...sourcePlaces,
    ].filter(Boolean))];
    const variants = [...new Set([...(person.nameVariants ?? []), ...(person.surname?.formsAsWritten ?? [])])];
    const needsReview = /review|unverified|working|partial/i.test(person.status ?? "") ||
      personSources.some((source) => !["verified", "complete"].includes(source.status));
    const birthYear = person.birth?.date?.match(/^\d{4}/)?.[0] ?? "";
    const searchText = [
      person.personId,
      person.displayName,
      person.surname?.normalized,
      ...variants,
      ...places,
      ...personSources.flatMap((source) => [source.nameAsWritten, source.transcription]),
    ].filter(Boolean).join(" ").toLocaleLowerCase("ru");

    return {
      personId: person.personId,
      displayName: person.displayName,
      sex: person.sex ?? "unknown",
      variants,
      normalizedSurname: person.surname?.normalized ?? "",
      birthDate: person.birth?.date ? formatDate(person.birth.date) : "",
      birthYear,
      places,
      occupations: person.occupation ?? [],
      status: person.status ?? "working",
      needsReview,
      notes: person.notes ?? [],
      relations: [...relationMap.values()],
      sources: personSources,
      searchText,
    };
  });

  return {
    people: directory.sort((left, right) => left.displayName.localeCompare(right.displayName, "ru")),
    stats: {
      people: people.length,
      families: families.length,
      sources: sources.length,
      transcribedSources: sources.filter((source) =>
        ["complete", "verified"].includes(source.transcription?.status ?? ""),
      ).length,
      places: new Set(directory.flatMap((person) => person.places)).size,
    },
  };
}
