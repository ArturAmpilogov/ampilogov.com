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
  birthEstimate?: { year?: number; from?: string; to?: string; basis?: string };
  dates?: {
    birth?: { display?: string; iso?: string; basis?: string };
  };
  occupation?: string[];
  parents?: string[];
  familyIds?: string[];
  sourceIds?: string[];
  status?: string;
  notes?: string[];
  surname?: { normalized?: string; formsAsWritten?: string[] };
  places?: Array<string | {
    relation?: string;
    placeId?: string;
    normalized?: string;
    asWritten?: string;
  }>;
  relations?: Array<{
    type?: string;
    personId?: string;
  }>;
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

type SourceMention = {
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
  age?: unknown;
  relationshipNote?: string;
  uncertainties?: string[];
  places?: Array<{
    type?: "origin" | "residence" | "registration" | "estate-affiliation";
    relation?: "origin" | "residence" | "registration" | "estate-affiliation";
    asWritten?: string;
    normalized?: string;
    placeId?: string;
    confidence?: "high" | "medium" | "low";
  }>;
};

type SourceRecord = {
  sourceId: string;
  provider?: string;
  recordType?: string;
  primaryPersonId?: string;
  collection?: {
    title?: string;
    archiveCitation?: string;
    imageGroupNumber?: string;
    itemNumber?: number;
    imageNumber?: number;
    custodian?: string;
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
    typeAsRussian?: string;
    date?: {
      display?: string;
      iso?: string;
      birthIso?: string;
      baptismIso?: string;
      deathIso?: string;
      burialIso?: string;
      marriageIso?: string;
    };
    place?: { normalized?: string; asIndexed?: string; placeId?: string };
  };
  transcription?: {
    status?: string;
    literal?: string;
    modernInterpretation?: string;
    suppliedText?: string;
    fields?: Record<string, unknown>;
  };
  indexData?: {
    age?: unknown;
    indexedAge?: unknown;
    groomAge?: unknown;
    brideAge?: unknown;
    [key: string]: unknown;
  };
  summary?: { status?: string; text?: string };
  mentions?: SourceMention[];
  migrationObservations?: Array<{
    personId?: string;
    personName?: string;
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
  mergedSourceIds?: string[];
  sourceCopies?: SourceRecord[];
};

export type ArchiveSourceCopy = {
  sourceId: string;
  provider: string;
  collection: string;
  repository: string;
  repositoryLocation: string;
  imageReference: string;
  originalUrl: string | null;
  indexedUrl: string | null;
  place: string;
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
  evidenceFragments: Array<{ label: string; url: string }>;
  sourceCopies: ArchiveSourceCopy[];
  mayDisplayEvidence: boolean;
  rightsNote: string;
  primaryPerson: ArchiveRecordPerson | null;
  people: ArchiveRecordPerson[];
  directoryFacts: Array<{ label: string; value: string }>;
  migrations: MigrationObservation[];
  literal: string;
  modernInterpretation: string;
  summary: string;
  status: string;
  reviewState: "complete" | "human-review" | "source-needed";
  reviewLabel: string;
  reviewDescription: string;
  isComplete: boolean;
  unresolved: string[];
  searchText: string;
};

function sourceReviewState(source: SourceRecord): Pick<ArchiveRecord, "reviewState" | "reviewLabel" | "reviewDescription"> {
  const transcriptionStatus = source.transcription?.status ?? "working";
  const reviewStatus = source.review?.status ?? "working";
  const hasLocalEvidence = Boolean(source.evidence?.path || source.evidence?.fragments?.length);

  if (reviewStatus === "needs-correct-image" || transcriptionStatus === "complete-index-image-mismatch") {
    return {
      reviewState: "source-needed",
      reviewLabel: "нужен правильный кадр",
      reviewDescription: "ИИ проверил запись, но приложенное изображение не соответствует указанному событию.",
    };
  }

  if (transcriptionStatus === "published-excerpt") {
    return {
      reviewState: "source-needed",
      reviewLabel: "нужен оригинал",
      reviewDescription: "Доступен только опубликованный фрагмент; для полного чтения нужна фотокопия оригинала.",
    };
  }

  if (!hasLocalEvidence && (transcriptionStatus === "name-index" || transcriptionStatus === "partial")) {
    return {
      reviewState: "source-needed",
      reviewLabel: "нужен лист",
      reviewDescription: "ИИ проверил доступные публикации, но в них есть только указатель или выдержка. Для полной расшифровки нужен снимок архивного листа.",
    };
  }

  const needsHumanReview = reviewStatus === "needs-review" ||
    reviewStatus === "needs-human-review" ||
    (hasLocalEvidence && transcriptionStatus === "name-index") ||
    (hasLocalEvidence && transcriptionStatus === "partial") ||
    (transcriptionStatus === "complete-with-uncertainties" && reviewStatus !== "complete");

  if (needsHumanReview) {
    return {
      reviewState: "human-review",
      reviewLabel: "ИИ проверил · нужен человек",
      reviewDescription: "ИИ повторно проверил доступные материалы, но отдельные фрагменты требуют человеческого чтения.",
    };
  }

  const isComplete = ["complete", "verified", "complete-as-published"].includes(transcriptionStatus) ||
    (transcriptionStatus === "complete-with-uncertainties" && reviewStatus === "complete");

  if (isComplete) {
    return {
      reviewState: "complete",
      reviewLabel: "расшифровано",
      reviewDescription: "Генеалогически значимая часть записи расшифрована.",
    };
  }

  return {
    reviewState: "source-needed",
    reviewLabel: "нужен оригинал",
    reviewDescription: "Для завершения расшифровки нужен доступ к исходному изображению.",
  };
}

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
  relation: "parent" | "spouse" | "child" | "sibling" | "foster-parent" | "foster-child";
};

export type DirectoryPerson = {
  personId: string;
  displayName: string;
  sex: string;
  variants: string[];
  normalizedSurname: string;
  birthDate: string;
  birthYear: string;
  life: {
    birth: string;
    death: string;
    age: string;
  };
  places: string[];
  occupations: string[];
  status: string;
  needsReview: boolean;
  notes: string[];
  relations: DirectoryRelation[];
  sources: DirectorySource[];
  searchText: string;
};

export type PlacePrecision = "settlement" | "historical-site" | "district" | "region" | "approximate";

export type GenealogyPlace = {
  placeId: string;
  name: string;
  label: string;
  kind: string;
  aliases: string[];
  legacyIds?: string[];
  geo: {
    latitude: number;
    longitude: number;
    precision: PlacePrecision;
    confidence: "high" | "medium" | "low";
    source: string;
    sourceUrl: string;
    note?: string;
  };
};

type PlacesIndex = {
  schemaVersion: number;
  places: GenealogyPlace[];
};

export type FamilyMapEvent = {
  sourceId: string;
  year: number;
  date: string;
  eventLabel: string;
  personIds: string[];
  personNames: string[];
  familyIds: string[];
  generation: number;
};

export type FamilyMapPlace = GenealogyPlace & {
  precisionLabel: string;
  events: FamilyMapEvent[];
};

export type FamilyMapMigration = {
  migrationId: string;
  fromPlaceId: string;
  toPlaceId: string;
  year: number;
  personIds: string[];
  personNames: string[];
  basis: string;
  confidence: "high" | "medium" | "low";
  sourceIds: string[];
};

// The place index is the canonical coordinate source for records, origins, and map routes.
const placesIndex = JSON.parse(
  readFileSync(path.join(GENEALOGY_ROOT, "places/index.json"), "utf8"),
) as PlacesIndex;

const placesById = new Map<string, GenealogyPlace>(placesIndex.places.flatMap((place) => (
  [place.placeId, ...(place.legacyIds ?? [])].map((placeId) => [placeId, place] as const)
)));
const placeLabels: Record<string, string> = Object.fromEntries(
  [...placesById].map(([placeId, place]) => [placeId, place.label]),
);

const familyMapPrecisionLabels: Record<PlacePrecision, string> = {
  settlement: "точное поселение",
  "historical-site": "историческое место",
  district: "примерно по уезду",
  region: "примерно по региону",
  approximate: "приблизительно",
};

const eventLabels: Record<string, string> = {
  birth: "Рождение",
  "birth-and-baptism": "Рождение и крещение",
  "birth-baptism": "Рождение и крещение",
  "birth-index-image-mismatch": "Индекс записи о рождении",
  "birth-index-duplicate": "Дубликат индекса рождения",
  baptism: "Крещение",
  "civil-birth": "Гражданская запись о рождении",
  "civil-marriage": "Гражданская запись о браке",
  marriage: "Брак",
  "marriage-duplicate-image": "Дубликат записи о браке",
  death: "Смерть",
  "death-and-burial": "Смерть и погребение",
  "service-review": "Смотр служилых людей",
  "military-review-list": "Смотренный список",
  "service-list": "Список служилых людей",
  "land-survey": "Писцовая запись",
  "land-assessment-list": "Дозорная запись",
  "land-refusal-record": "Отказная запись",
  "estate-listing": "Поместная запись",
  "service-enrollment": "Запись на службу",
  "service-oath": "Крестоприводная запись",
  "oath-of-allegiance": "Крестоприводная запись",
  "military-roster": "Полковой список",
  "horse-sale-registration": "Регистрация продажи лошади",
  "census-household": "Переписная запись",
  "confession-list": "Исповедная ведомость",
  "yard-and-garden-allocation": "Отвод двора и огорода",
  "resettlement-and-land-allocation": "Переселение и земельный отвод",
  "permanent-settlement-list": "Список переселенцев",
  "negative-finding": "Опровергнутая привязка",
  "witness-testimony": "Показание",
  interrogation: "Допрос",
  confrontation: "Очная ставка",
  "court-sentence": "Приговор",
};

const roleLabels: Record<string, string> = {
  child: "ребёнок",
  "baptized-child": "крещёный ребёнок",
  father: "отец",
  mother: "мать",
  parent: "родитель",
  groom: "жених",
  bride: "невеста",
  "bride-father": "отец невесты",
  spouse: "супруг(а)",
  godparent: "восприемник",
  godfather: "восприемник",
  godmother: "восприемница",
  witness: "свидетель",
  surety: "поручитель",
  declarant: "заявитель",
  official: "должностное лицо",
  clerk: "писец",
  commander: "командир",
  clergy: "священнослужитель",
  psalmist: "псаломщик",
  serviceman: "служилый человек",
  "listed-service-person": "служилый человек в списке",
  "oath-taker": "принёсший присягу",
  "new-serviceman": "новик, принятый на службу",
  landholder: "владелец поместья",
  "previous-holder": "прежний владелец поместья",
  eponym: "человек, давший название",
  grandson: "внук",
  grandfather: "дед",
  son: "сын",
  "foster-son": "приёмыш",
  "scribe-proxy": "рукоприкладчик",
  deponent: "дающий показание",
  accused: "обвиняемый",
  "co-accused": "соучастник по делу",
  sentenced: "осуждённый",
  deceased: "умерший",
  "deceased-child": "умерший ребёнок",
  "deceased-son": "умерший сын",
  "deceased-daughter": "умершая дочь",
  "deceased-widow": "умершая вдова",
  "clergy-assistant": "помощник причта",
  "named-serviceman": "служилый человек",
  godparents: "восприемники",
  priest: "священник",
  "groom-surety": "поручитель жениха",
  "bride-surety": "поручитель невесты",
  "father-of-bride": "отец невесты",
  twin: "близнец",
  seller: "продавец",
  "related-to-godparent": "родственник восприемника",
  "other-person-indexed; probable witness or relative": "лицо из индекса; вероятно свидетель или родственник",
  "child-index-only": "ребёнок — только индекс",
  "father-index-only": "отец — только индекс",
  "mother-index-only": "мать — только индекс",
  deacon: "диакон",
  "master-of-buyer": "владелец покупателя",
  "buyer-and-registrant": "покупатель и заявитель",
  buyer: "покупатель",
  "master-of-seller": "владелец продавца",
  "minor-landholder": "недоросль с поместьем",
  householder: "хозяин двора",
  "household-head": "глава семьи",
  "household-member": "член семьи",
  "daughter-in-law": "невестка",
  "son-in-household": "сын в составе двора",
  "participant-in-land-record": "участник отказной записи",
  "named-person": "названное лицо",
  settler: "поселенец",
  "regimental-cossack": "полковой казак",
  "head-of-household": "глава семьи",
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

function sourceMentionName(mention: SourceMention) {
  return mention.displayName ??
    mention.modernName ??
    mention.nameAsIndexed ??
    mention.nameAsTranscribed ??
    mention.nameAsWritten ??
    "Имя уточняется";
}

function documentedFamilyMemberKey(mention?: SourceMention) {
  if (!mention) return "";
  return sourceMentionName(mention)
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replaceAll("ё", "е")
    .replace(/\[(?:имя|фамилия|отчество)?\s*(?:неразборчиво|неизвестно|не установлено)\]/g, " ")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

/**
 * Groups otherwise unlinked records only when the document itself names a
 * parent unit or a married couple. This is a map-only key: it does not create a
 * personId and therefore cannot turn a name similarity into a claimed identity.
 */
function documentedSourceFamilyId(mentions: SourceMention[], placeId: string) {
  const father = mentions.find((mention) => ["father", "father-index-only"].includes(mention.role ?? ""));
  const mother = mentions.find((mention) => ["mother", "mother-index-only"].includes(mention.role ?? ""));
  const fatherKey = documentedFamilyMemberKey(father);
  const motherKey = documentedFamilyMemberKey(mother);

  if (fatherKey && motherKey) return `documented-parents:${fatherKey}:${motherKey}`;
  if (fatherKey) return `documented-father:${placeId}:${fatherKey}`;

  const groomKey = documentedFamilyMemberKey(mentions.find((mention) => mention.role === "groom"));
  const brideKey = documentedFamilyMemberKey(mentions.find((mention) => mention.role === "bride"));
  if (groomKey && brideKey) return `documented-couple:${groomKey}:${brideKey}`;

  return null;
}

function sourcePeople(source: SourceRecord): ArchiveRecordPerson[] {
  return (source.mentions ?? []).map((mention) => {
    const name = sourceMentionName(mention);

    return {
      personId: mention.personId ?? null,
      role: sourceRoleLabel(mention.role),
      name,
      patronymic: mention.patronymic ?? null,
      alternateNames: [...new Set(mention.alternateNames ?? [])].filter((alternateName) => alternateName !== name),
      places: (mention.places ?? []).map((place) => ({
        relation: placeRelationLabels[place.relation ?? place.type ?? ""] ?? place.relation ?? place.type ?? "происхождение",
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
    };
  });
}

function sourceEventLabel(source: SourceRecord) {
  const eventType = source.event?.type;
  return (eventType ? eventLabels[eventType] : undefined) ??
    source.event?.typeAsRussian ??
    "Архивная запись";
}

function sourceRoleLabel(role?: string) {
  if (!role) return "упоминание";
  return roleLabels[role] ?? role.replaceAll("-", " ");
}

function sourcePrimaryPerson(source: SourceRecord, people: ArchiveRecordPerson[]) {
  if (!source.primaryPersonId) return people[0] ?? null;
  return people.find((person) => person.personId === source.primaryPersonId) ?? people[0] ?? null;
}

const birthEventTypes = new Set([
  "birth",
  "birth-and-baptism",
  "birth-baptism",
  "birth-index-image-mismatch",
  "birth-index-duplicate",
  "baptism",
  "civil-birth",
]);

const marriageEventTypes = new Set([
  "marriage",
  "civil-marriage",
  "marriage-duplicate-image",
]);

const deathEventTypes = new Set(["death", "death-and-burial"]);

function approximateBirthFromAge(source: SourceRecord, age: string) {
  const isoDate = source.event?.date?.iso;
  if (!isoDate?.match(/^\d{4}-\d{2}-\d{2}$/)) return "";

  const deathDate = new Date(`${isoDate}T00:00:00Z`);
  const halfYear = /(?:1\s*\/\s*2|½)\s*года/i.test(age);
  const ageMatch = age.match(/(\d+)\s*(лет|год(?:а)?|месяц(?:а|ев)?|недел(?:я|и|ь)|д(?:ень|ня|ней))/i);
  const amount = halfYear ? 6 : Number(ageMatch?.[1]);
  const unit = halfYear ? "месяцев" : ageMatch?.[2]?.toLocaleLowerCase("ru");

  if (!Number.isFinite(amount) || !unit) return "";

  if (/^(?:лет|год)/.test(unit)) {
    const laterYear = deathDate.getUTCFullYear() - amount;
    return `≈ ${laterYear - 1}–${laterYear}`;
  }

  if (unit.startsWith("месяц")) {
    deathDate.setUTCMonth(deathDate.getUTCMonth() - amount);
    return `≈ ${new Intl.DateTimeFormat("ru-RU", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(deathDate).replace(/\s*г\.$/, "")}`;
  }

  deathDate.setUTCDate(deathDate.getUTCDate() - amount * (unit.startsWith("недел") ? 7 : 1));
  return `≈ ${new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(deathDate).replace(/\s*г\.$/, "")}`;
}

function sourceDirectoryFacts(source: SourceRecord) {
  const eventType = source.event?.type ?? "";
  const mentions = source.mentions ?? [];

  if (birthEventTypes.has(eventType)) {
    const father = mentions.find((mention) => ["father", "father-index-only"].includes(mention.role ?? ""));
    const mother = mentions.find((mention) => ["mother", "mother-index-only"].includes(mention.role ?? ""));
    const parents = mentions.filter((mention) => mention.role === "parent");

    return [
      father ? { label: "Отец", value: sourceMentionName(father) } : null,
      mother ? { label: "Мать", value: sourceMentionName(mother) } : null,
      ...parents.map((parent) => ({ label: "Родитель", value: sourceMentionName(parent) })),
    ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  }

  if (marriageEventTypes.has(eventType)) {
    const primaryMention = source.primaryPersonId
      ? mentions.find((mention) => mention.personId === source.primaryPersonId)
      : mentions[0];
    const partner = mentions.find((mention) =>
      mention !== primaryMention && ["groom", "bride", "spouse"].includes(mention.role ?? "")
    );

    if (!partner) return [];
    return [{
      label: partner.role === "bride" ? "Супруга" : partner.role === "groom" ? "Супруг" : "В браке с",
      value: sourceMentionName(partner),
    }];
  }

  if (deathEventTypes.has(eventType)) {
    const fieldAge = source.transcription?.fields?.age;
    const age = ageValueText(fieldAge) || ageValueText(source.indexData?.age);
    const approximateBirth = age ? approximateBirthFromAge(source, age) : "";

    return [
      age ? { label: "Возраст", value: age } : null,
      approximateBirth ? { label: "Рождение", value: approximateBirth } : null,
    ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  }

  return [];
}

function isGenealogyRecordSource(source: SourceRecord) {
  const hasNamedPerson = (source.mentions ?? []).some((mention) =>
    Boolean(
      mention.displayName ??
      mention.modernName ??
      mention.nameAsIndexed ??
      mention.nameAsTranscribed ??
      mention.nameAsWritten,
    )
  );

  return !source.recordType?.startsWith("finding-aid") &&
    source.event?.type !== "negative-finding" &&
    hasNamedPerson;
}

function toArchiveRecord(source: SourceRecord): ArchiveRecord {
  const eventType = source.event?.type ?? "unknown";
  const eventLabel = sourceEventLabel(source);
  const date = sourceDate(source);
  const place = sourcePlace(source);
  const people = sourcePeople(source);
  const literal = source.transcription?.literal ?? "";
  const modernInterpretation = source.transcription?.modernInterpretation ?? "";
  const summary = source.summary?.text ?? source.transcription?.suppliedText ?? "";
  const status = source.transcription?.status ?? source.review?.status ?? "working";
  const review = sourceReviewState(source);
  const isComplete = review.reviewState === "complete";
  const migrations: MigrationObservation[] = (source.migrationObservations ?? []).map((observation) => ({
    personId: observation.personId ?? null,
    from: observation.from?.normalized ?? observation.from?.asWritten ?? placeLabels[observation.from?.placeId ?? ""] ?? "Не установлено",
    to: observation.to?.normalized ?? observation.to?.asWritten ?? placeLabels[observation.to?.placeId ?? ""] ?? place,
    basis: observation.basis ?? "Происхождение человека отличается от места события",
    confidence: observation.confidence ?? "medium",
  }));
  const isFamilySearch = (source.provider ?? "FamilySearch") === "FamilySearch";
  const sourceCopies = (source.sourceCopies?.length ? source.sourceCopies : [source]).map((copy) => ({
    sourceId: copy.sourceId,
    provider: copy.provider ?? "FamilySearch",
    collection: copy.collection?.title ?? "Коллекция FamilySearch",
    repository: copy.repository?.name ?? copy.collection?.custodian ?? "Архив-хранитель уточняется",
    repositoryLocation: copy.repository?.location ?? "Место хранения уточняется",
    imageReference: sourcePosition(copy),
    originalUrl: copy.links?.imageArk ?? null,
    indexedUrl: copy.links?.indexedRecordArk ?? copy.links?.recordArk ?? null,
    place: sourcePlace(copy),
  }));

  return {
    sourceId: source.sourceId,
    provider: source.provider ?? "FamilySearch",
    eventType,
    eventLabel,
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
    evidenceFragments: (source.evidence?.fragments ?? [])
      .filter((fragment): fragment is { part?: string; path: string } => Boolean(fragment.path))
      .flatMap((fragment) => {
        const url = evidencePathUrl(fragment.path);
        return url ? [{
          label: fragment.part ?? "Точный фрагмент записи",
          url,
        }] : [];
      }),
    sourceCopies,
    mayDisplayEvidence: source.evidence?.publicDisplay === true,
    rightsNote: source.evidence?.rightsNote ?? "Права на изображение не проверены; публичная копия не показывается.",
    primaryPerson: sourcePrimaryPerson(source, people),
    people,
    directoryFacts: sourceDirectoryFacts(source),
    migrations,
    literal,
    modernInterpretation,
    summary,
    status,
    ...review,
    isComplete,
    unresolved: source.review?.unresolved ?? [],
    searchText: [
      source.sourceId,
      ...(source.mergedSourceIds ?? []),
      eventLabel,
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
      ...sourceCopies.flatMap((copy) => [
        copy.sourceId,
        copy.collection,
        copy.repository,
        copy.repositoryLocation,
        copy.imageReference,
        copy.place,
      ]),
    ].filter(Boolean).join(" ").toLocaleLowerCase("ru"),
  };
}

export function getRecordsDirectory() {
  const records = readJsonTree<SourceRecord>(
    path.join(GENEALOGY_ROOT, "sources"),
  ).filter(isGenealogyRecordSource).map(toArchiveRecord).sort((left, right) =>
    (left.year || "9999").localeCompare(right.year || "9999") || left.date.localeCompare(right.date, "ru")
  );

  return {
    records,
    stats: {
      records: records.length,
      complete: records.filter((record) => record.isComplete).length,
      withImages: records.filter((record) => Boolean(record.evidenceUrl || record.evidenceFragments.length)).length,
    },
  };
}

export function getArchiveRecord(sourceId: string) {
  return getRecordsDirectory().records.find((record) =>
    record.sourceId === sourceId || record.sourceCopies.some((copy) => copy.sourceId === sourceId)
  ) ?? null;
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

function evidenceUrl(source?: SourceRecord): string | null {
  return evidencePathUrl(source?.evidence?.path);
}

function evidencePathUrl(evidencePath?: string): string | null {
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

type LifeDateCandidate = {
  display: string;
  from: Date;
  to: Date;
  exactDay: boolean;
  estimated: boolean;
};

type LifeEventKind = "birth" | "death" | "marriage";

const russianMonths = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const russianMonthsNominative = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

const russianMonthNumbers = new Map([
  ["январь", 0], ["января", 0], ["февраль", 1], ["февраля", 1],
  ["март", 2], ["марта", 2], ["апрель", 3], ["апреля", 3],
  ["май", 4], ["мая", 4], ["июнь", 5], ["июня", 5],
  ["июль", 6], ["июля", 6], ["август", 7], ["августа", 7],
  ["сентябрь", 8], ["сентября", 8], ["октябрь", 9], ["октября", 9],
  ["ноябрь", 10], ["ноября", 10], ["декабрь", 11], ["декабря", 11],
]);

function validUtcDate(year: number, month: number, day: number) {
  const value = new Date(Date.UTC(year, month, day));
  return value.getUTCFullYear() === year && value.getUTCMonth() === month && value.getUTCDate() === day
    ? value
    : null;
}

function lifeDateFromIso(value?: string): LifeDateCandidate | null {
  if (!value) return null;
  const dayMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dayMatch) {
    const date = validUtcDate(Number(dayMatch[1]), Number(dayMatch[2]) - 1, Number(dayMatch[3]));
    if (!date) return null;
    return {
      display: new Intl.DateTimeFormat("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date).replace(/\s*г\.$/, ""),
      from: date,
      to: date,
      exactDay: true,
      estimated: false,
    };
  }

  const monthMatch = value.match(/^(\d{4})-(\d{2})$/);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]) - 1;
    const from = validUtcDate(year, month, 1);
    const to = new Date(Date.UTC(year, month + 1, 0));
    if (!from || !to) return null;
    return {
      display: `${russianMonthsNominative[month]} ${year}`,
      from,
      to,
      exactDay: false,
      estimated: false,
    };
  }

  const yearMatch = value.match(/^(\d{4})$/);
  if (!yearMatch) return null;
  const year = Number(yearMatch[1]);
  return {
    display: String(year),
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year, 11, 31)),
    exactDay: false,
    estimated: false,
  };
}

function normalizedLifeDisplay(value: string) {
  return value
    .trim()
    .split(";")[0]
    .trim()
    .replace(/^около\s+/i, "ок. ")
    .replace(/\s+(?:года|год|г\.)$/i, "")
    .replace(/\s+/g, " ");
}

function lifeDateFromDisplay(value?: string): LifeDateCandidate | null {
  if (!value) return null;
  const display = normalizedLifeDisplay(value);
  const years = [...display.matchAll(/\b(\d{4})\b/g)].map((match) => Number(match[1]));
  if (!years.length) return null;
  const estimated = /(?:ок\.|пример|≈|ориентир)/i.test(display);

  const dayMatch = display.match(/\b(\d{1,2})\s+([а-яё]+)\s+(\d{4})\b/i);
  if (dayMatch && !estimated) {
    const month = russianMonthNumbers.get(dayMatch[2].toLocaleLowerCase("ru"));
    const date = month === undefined ? null : validUtcDate(Number(dayMatch[3]), month, Number(dayMatch[1]));
    if (date) return { display, from: date, to: date, exactDay: true, estimated: false };
  }

  const monthMatch = display.match(/\b([а-яё]+)\s+(\d{4})\b/i);
  if (monthMatch && !estimated) {
    const month = russianMonthNumbers.get(monthMatch[1].toLocaleLowerCase("ru"));
    const year = Number(monthMatch[2]);
    if (month !== undefined) {
      return {
        display,
        from: new Date(Date.UTC(year, month, 1)),
        to: new Date(Date.UTC(year, month + 1, 0)),
        exactDay: false,
        estimated: false,
      };
    }
  }

  const firstYear = Math.min(...years);
  const lastYear = Math.max(...years);
  return {
    display,
    from: new Date(Date.UTC(firstYear, 0, 1)),
    to: new Date(Date.UTC(lastYear, 11, 31)),
    exactDay: false,
    estimated,
  };
}

function lifeDateFromRange(fromValue?: string, toValue?: string): LifeDateCandidate | null {
  const from = lifeDateFromIso(fromValue);
  const to = lifeDateFromIso(toValue);
  if (!from && !to) return null;
  const lower = from?.from ?? to!.from;
  const upper = to?.to ?? from!.to;
  const firstYear = lower.getUTCFullYear();
  const lastYear = upper.getUTCFullYear();
  return {
    display: firstYear === lastYear ? `[${firstYear}]` : `[${firstYear}–${lastYear}]`,
    from: lower,
    to: upper,
    exactDay: false,
    estimated: true,
  };
}

function estimatedYearLifeDate(year?: number): LifeDateCandidate | null {
  if (!year) return null;
  return {
    display: `ок. ${year}`,
    from: new Date(Date.UTC(year, 0, 1)),
    to: new Date(Date.UTC(year, 11, 31)),
    exactDay: false,
    estimated: true,
  };
}

function mostCommonLifeDate(candidates: LifeDateCandidate[]) {
  const grouped = new Map<string, { candidate: LifeDateCandidate; count: number }>();
  for (const candidate of candidates) {
    const key = `${candidate.from.toISOString()}|${candidate.to.toISOString()}`;
    const current = grouped.get(key);
    grouped.set(key, { candidate, count: (current?.count ?? 0) + 1 });
  }
  return [...grouped.values()]
    .sort((left, right) => right.count - left.count || left.candidate.from.getTime() - right.candidate.from.getTime())[0]
    ?.candidate ?? null;
}

function eventLifeDate(source: SourceRecord, kind: LifeEventKind) {
  const date = source.event?.date;
  const iso = kind === "birth"
    ? date?.birthIso ?? date?.iso
    : kind === "death"
      ? date?.deathIso ?? date?.iso
      : date?.marriageIso ?? date?.iso;
  return lifeDateFromIso(iso) ?? lifeDateFromDisplay(date?.display);
}

const lifeEventRoles: Record<LifeEventKind, (role: string) => boolean> = {
  birth: (role) => ["child", "baptized-child", "newborn", "subject"].includes(role),
  death: (role) => role.startsWith("deceased"),
  marriage: (role) => ["groom", "bride", "spouse", "couple"].includes(role),
};

function normalizedNameKey(value?: string) {
  return (value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/ё/g, "е")
    .replace(/ъ\b/g, "")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();
}

function lifeEventMention(person: PersonRecord, source: SourceRecord, kind: LifeEventKind) {
  const relevant = (source.mentions ?? []).filter((mention) => lifeEventRoles[kind](mention.role ?? ""));
  const linked = relevant.find((mention) => mention.personId === person.personId);
  if (linked) return { matches: true, mention: linked };
  if (source.primaryPersonId === person.personId) {
    return {
      matches: true,
      mention: (source.mentions ?? []).find((mention) => mention.personId === person.personId) ?? null,
    };
  }

  const names = new Set([person.displayName, ...(person.nameVariants ?? [])].map(normalizedNameKey).filter(Boolean));
  const named = relevant.find((mention) =>
    !mention.personId && names.has(normalizedNameKey(sourceMentionName(mention)))
  );
  return { matches: Boolean(named), mention: named ?? null };
}

function yearCount(value: number) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 14) return `${value} лет`;
  if (mod10 === 1) return `${value} год`;
  if (mod10 >= 2 && mod10 <= 4) return `${value} года`;
  return `${value} лет`;
}

function ageValueText(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value === 0 ? "младше года" : yearCount(value);
  }
  if (typeof value === "string") {
    const clean = value
      .replace(/\s*\[[^\]]+\]/g, "")
      .split(";")[0]
      .trim();
    if (!clean) return "";
    if (/^\d+$/.test(clean)) {
      const amount = Number(clean);
      return amount === 0 ? "младше года" : yearCount(amount);
    }
    const englishYears = clean.match(/^(\d+)\s*years?$/i);
    if (englishYears) return yearCount(Number(englishYears[1]));
    const englishDays = clean.match(/^(\d+)\s*days?$/i);
    if (englishDays) {
      const amount = Number(englishDays[1]);
      if (!amount) return "";
      return `${amount} ${amount === 1 ? "день" : amount < 5 ? "дня" : "дней"}`;
    }
    if (/^(?:1\s*\/\s*2|½)\s*года?$/i.test(clean)) return "6 месяцев";
    return /\d/.test(clean) || /^младше года$/i.test(clean) ? clean : "";
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["display", "asWritten", "value", "text"]) {
      const result = ageValueText(record[key]);
      if (result) return result;
    }
  }
  return "";
}

function ageFromNarrative(value: unknown) {
  if (typeof value !== "string") return "";
  return value.match(/(?:около\s+)?(?:\d+\s+)?(?:\d+\s*\/\s*\d+|½|\d+)\s*(?:лет|год(?:а)?|месяц(?:а|ев)?|недел(?:я|и|ь)|д(?:ень|ня|ней))(?:\s+\d+\s*(?:месяц(?:а|ев)?|недел(?:я|и|ь)|д(?:ень|ня|ней)))?/i)?.[0] ?? "";
}

function sourceAgeForPerson(source: SourceRecord, kind: "death" | "marriage", mention: SourceMention | null) {
  const fields = source.transcription?.fields ?? {};
  if (kind === "death") {
    return ageValueText(fields.age) || ageValueText(mention?.age) ||
      ageValueText(source.indexData?.age) || ageValueText(source.indexData?.indexedAge);
  }

  const role = mention?.role === "bride" ? "bride" : mention?.role === "groom" ? "groom" : "";
  if (!role) return ageValueText(mention?.age);
  return ageValueText(mention?.age) || ageValueText(source.indexData?.[`${role}Age`]) ||
    ageValueText(fields[`${role}Age`]) || ageValueText(ageFromNarrative(fields[role]));
}

function parsedAgeInMonths(age: string) {
  const normalized = age
    .replace(/(\d)½/g, "$1 1/2")
    .replace(/½/g, "1/2")
    .toLocaleLowerCase("ru");
  let totalMonths = 0;
  const mixedYear = normalized.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)\s*(?:лет|год)/);
  const halfYear = !mixedYear && normalized.match(/(?:^|\s)(\d+)\s*\/\s*(\d+)\s*(?:лет|год)/);
  const wholeYear = !mixedYear && !halfYear ? normalized.match(/(\d+)\s*(?:лет|год)/) : null;
  if (mixedYear) totalMonths += Number(mixedYear[1]) * 12 + Math.round((Number(mixedYear[2]) / Number(mixedYear[3])) * 12);
  else if (wholeYear) totalMonths += Number(wholeYear[1]) * 12;
  else if (halfYear) totalMonths += Math.round((Number(halfYear[1]) / Number(halfYear[2])) * 12);
  const month = normalized.match(/(\d+)\s*месяц/);
  if (month) totalMonths += Number(month[1]);
  if (totalMonths) return { months: totalMonths, days: 0 };
  const week = normalized.match(/(\d+)\s*недел/);
  if (week) return { months: 0, days: Number(week[1]) * 7 };
  const day = normalized.match(/(\d+)\s*д(?:ень|ня|ней)/);
  if (day) return { months: 0, days: Number(day[1]) };
  return null;
}

function addUtcDays(date: Date, amount: number) {
  const value = new Date(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return value;
}

function addUtcMonths(date: Date, amount: number) {
  const value = new Date(date);
  value.setUTCMonth(value.getUTCMonth() + amount);
  return value;
}

function addUtcYears(date: Date, amount: number) {
  const value = new Date(date);
  value.setUTCFullYear(value.getUTCFullYear() + amount);
  return value;
}

function birthFromDatedAge(eventDate: LifeDateCandidate, age: string): LifeDateCandidate | null {
  const parsed = parsedAgeInMonths(age);
  if (!parsed) return null;
  if (parsed.months >= 12) {
    const completedYears = Math.floor(parsed.months / 12);
    const lower = addUtcDays(addUtcYears(eventDate.from, -(completedYears + 1)), 1);
    const upper = addUtcYears(eventDate.to, -completedYears);
    const firstYear = lower.getUTCFullYear();
    const lastYear = upper.getUTCFullYear();
    return {
      display: firstYear === lastYear ? `[${firstYear}]` : `[${firstYear}–${lastYear}]`,
      from: lower,
      to: upper,
      exactDay: false,
      estimated: true,
    };
  }

  const approximate = parsed.months
    ? addUtcMonths(eventDate.from, -parsed.months)
    : addUtcDays(eventDate.from, -parsed.days);
  const display = parsed.months
    ? `ок. ${russianMonths[approximate.getUTCMonth()]} ${approximate.getUTCFullYear()}`
    : `ок. ${approximate.getUTCDate()} ${russianMonths[approximate.getUTCMonth()]} ${approximate.getUTCFullYear()}`;
  return {
    display,
    from: parsed.months ? addUtcMonths(approximate, -1) : addUtcDays(approximate, -1),
    to: parsed.months ? addUtcMonths(approximate, 1) : addUtcDays(approximate, 1),
    exactDay: false,
    estimated: true,
  };
}

function completedYearsBetween(birth: Date, death: Date) {
  let years = death.getUTCFullYear() - birth.getUTCFullYear();
  if (death.getUTCMonth() < birth.getUTCMonth() ||
    (death.getUTCMonth() === birth.getUTCMonth() && death.getUTCDate() < birth.getUTCDate())) years -= 1;
  return years;
}

function calculatedAge(birth: LifeDateCandidate, death: LifeDateCandidate) {
  if (birth.exactDay && death.exactDay) {
    const years = completedYearsBetween(birth.from, death.from);
    if (years > 0) return yearCount(years);
    let months = (death.from.getUTCFullYear() - birth.from.getUTCFullYear()) * 12 +
      death.from.getUTCMonth() - birth.from.getUTCMonth();
    if (death.from.getUTCDate() < birth.from.getUTCDate()) months -= 1;
    if (months > 0) return `${months} ${months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев"}`;
    const days = Math.max(0, Math.floor((death.from.getTime() - birth.from.getTime()) / 86_400_000));
    return `${days} ${days % 10 === 1 && days % 100 !== 11 ? "день" : days % 10 >= 2 && days % 10 <= 4 && !(days % 100 >= 12 && days % 100 <= 14) ? "дня" : "дней"}`;
  }

  const youngest = completedYearsBetween(birth.to, death.from);
  const oldest = completedYearsBetween(birth.from, death.to);
  if (oldest < 0) return "";
  const safeYoungest = Math.max(0, youngest);
  return safeYoungest === oldest
    ? `примерно ${yearCount(oldest)}`
    : safeYoungest === 0 && oldest === 1
      ? "около 1 года"
    : `примерно ${safeYoungest}–${oldest} лет`;
}

function closestLifeDate(candidates: LifeDateCandidate[], reference: LifeDateCandidate | null) {
  if (!candidates.length) return null;
  if (!reference) return mostCommonLifeDate(candidates);
  const referenceTime = (reference.from.getTime() + reference.to.getTime()) / 2;
  return [...candidates].sort((left, right) => {
    const leftDistance = referenceTime < left.from.getTime()
      ? left.from.getTime() - referenceTime
      : referenceTime > left.to.getTime() ? referenceTime - left.to.getTime() : 0;
    const rightDistance = referenceTime < right.from.getTime()
      ? right.from.getTime() - referenceTime
      : referenceTime > right.to.getTime() ? referenceTime - right.to.getTime() : 0;
    return leftDistance - rightDistance;
  })[0];
}

function statedAgeDisplay(age: string, birth: LifeDateCandidate | null, death: LifeDateCandidate | null) {
  if (!birth || !death) return age;
  const parsed = parsedAgeInMonths(age);
  if (!parsed || parsed.months < 12) return age;
  const statedYears = Math.floor(parsed.months / 12);
  const youngest = Math.max(0, completedYearsBetween(birth.to, death.from));
  const oldest = completedYearsBetween(birth.from, death.to);
  return statedYears < youngest - 1 || statedYears > oldest + 1 ? `${age} (по записи)` : age;
}

function personLife(person: PersonRecord, sources: SourceRecord[]) {
  const birthEvents = sources.flatMap((source) => {
    if (!birthEventTypes.has(source.event?.type ?? "")) return [];
    const association = lifeEventMention(person, source, "birth");
    if (!association.matches) return [];
    const date = eventLifeDate(source, "birth");
    return date ? [date] : [];
  });

  const deathEvents = sources.flatMap((source) => {
    if (!deathEventTypes.has(source.event?.type ?? "")) return [];
    const association = lifeEventMention(person, source, "death");
    if (!association.matches) return [];
    const date = eventLifeDate(source, "death");
    const age = sourceAgeForPerson(source, "death", association.mention);
    return [{ date, age }];
  });

  const marriageBirthEstimates = sources.flatMap((source) => {
    if (!marriageEventTypes.has(source.event?.type ?? "")) return [];
    const association = lifeEventMention(person, source, "marriage");
    if (!association.matches) return [];
    const date = eventLifeDate(source, "marriage");
    const age = sourceAgeForPerson(source, "marriage", association.mention);
    const estimate = date && age ? birthFromDatedAge(date, age) : null;
    return estimate ? [estimate] : [];
  });

  const deathDates = deathEvents.flatMap((event) => event.date ? [event.date] : []);
  const inferredFromDeath = deathEvents.flatMap((event) => {
    const estimate = event.date && event.age ? birthFromDatedAge(event.date, event.age) : null;
    return estimate ? [estimate] : [];
  });
  const profileBirth = lifeDateFromIso(person.birth?.date) ?? lifeDateFromIso(person.dates?.birth?.iso);
  const inferredBirth = closestLifeDate(
    [...inferredFromDeath, ...marriageBirthEstimates],
    profileBirth && !profileBirth.exactDay ? profileBirth : null,
  );
  const birth = (profileBirth?.exactDay ? profileBirth : null) ??
    mostCommonLifeDate(birthEvents) ??
    lifeDateFromRange(person.birthEstimate?.from, person.birthEstimate?.to) ??
    lifeDateFromDisplay(person.dates?.birth?.display) ??
    estimatedYearLifeDate(person.birthEstimate?.year) ??
    inferredBirth ??
    profileBirth;
  const death = mostCommonLifeDate(deathDates);
  const statedDeathAges = deathEvents.map((event) => event.age).filter(Boolean);
  const calculated = birth && death ? calculatedAge(birth, death) : "";
  const statedAge = statedDeathAges[0] ? statedAgeDisplay(statedDeathAges[0], birth, death) : "";
  const age = birth?.exactDay && death?.exactDay ? calculated : statedAge || calculated;

  return {
    birth: birth?.display ?? "?",
    death: death?.display ?? "?",
    age,
    birthYear: birth ? String(birth.from.getUTCFullYear()) : "",
  };
}

function personPlaceLabel(place: NonNullable<PersonRecord["places"]>[number]) {
  if (typeof place === "string") return placeLabels[place] ?? place;
  return place.placeId ? placeLabels[place.placeId] ?? place.normalized ?? place.asWritten ?? place.placeId :
    place.normalized ?? place.asWritten ?? "";
}

const explicitPersonRelationTypes: Record<string, DirectoryRelation["relation"]> = {
  "father-of": "child",
  "mother-of": "child",
  "son-of": "parent",
  "daughter-of": "parent",
  "brother-of": "sibling",
  "sister-of": "sibling",
  "spouse-of": "spouse",
  "foster-father-of": "foster-child",
  "foster-mother-of": "foster-child",
  "foster-son-of": "foster-parent",
  "foster-daughter-of": "foster-parent",
};

export function getPeopleDirectory() {
  const people = readJsonDirectory<PersonRecord>(path.join(GENEALOGY_ROOT, "people"));
  const families = readJsonDirectory<FamilyRecord>(path.join(GENEALOGY_ROOT, "families"));
  const sources = readJsonTree<SourceRecord>(path.join(GENEALOGY_ROOT, "sources"));
  const peopleById = new Map(people.map((person) => [person.personId, person]));
  const sourcesById = new Map(sources.map((source) => [source.sourceId, source]));

  const directory: DirectoryPerson[] = people.map((person) => {
    const linkedSources = (person.sourceIds ?? [])
      .map((sourceId) => sourcesById.get(sourceId))
      .filter((source): source is SourceRecord => Boolean(source));
    const personSources = linkedSources
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
          eventLabel: sourceEventLabel(source),
          date: sourceDate(source),
          place: sourcePlace(source),
          role: sourceRoleLabel(mention?.role),
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

    for (const relation of person.relations ?? []) {
      const relationType = explicitPersonRelationTypes[relation.type ?? ""];
      const relatedPerson = relation.personId ? peopleById.get(relation.personId) : undefined;
      if (!relationType || !relatedPerson) continue;
      relationMap.set(`${relationType}:${relatedPerson.personId}`, {
        personId: relatedPerson.personId,
        name: relatedPerson.displayName,
        relation: relationType,
      });
    }

    const sourcePlaces = personSources.map((source) => source.place);
    const places = [...new Set([
      person.birth?.placeId ? placeLabels[person.birth.placeId] ?? person.birth.placeId : "",
      ...(person.places ?? []).map(personPlaceLabel),
      ...sourcePlaces,
    ].filter(Boolean))];
    const variants = [...new Set([...(person.nameVariants ?? []), ...(person.surname?.formsAsWritten ?? [])])];
    const needsReview = /review|unverified|working|partial/i.test(person.status ?? "") ||
      personSources.some((source) => !["verified", "complete"].includes(source.status));
    const life = personLife(person, linkedSources);
    const birthDate = life.birth === "?" ? "" : life.birth;
    const birthYear = life.birthYear;
    const searchText = [
      person.personId,
      person.displayName,
      person.surname?.normalized,
      ...variants,
      ...places,
      life.birth,
      life.death,
      ...personSources.flatMap((source) => [source.nameAsWritten, source.transcription]),
    ].filter(Boolean).join(" ").toLocaleLowerCase("ru");

    return {
      personId: person.personId,
      displayName: person.displayName,
      sex: person.sex ?? "unknown",
      variants,
      normalizedSurname: person.surname?.normalized ?? "",
      birthDate,
      birthYear,
      life: {
        birth: life.birth,
        death: life.death,
        age: life.age,
      },
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

function sourceYear(source: SourceRecord) {
  const date = source.event?.date;
  const value = date?.iso ?? date?.birthIso ?? date?.baptismIso ?? date?.display ?? "";
  return Number(value.match(/\b(?:15|16|17|18|19|20)\d{2}\b/)?.[0] ?? 0);
}

export function getFamilyMapDirectory() {
  const people = readJsonDirectory<PersonRecord>(path.join(GENEALOGY_ROOT, "people"));
  const families = readJsonDirectory<FamilyRecord>(path.join(GENEALOGY_ROOT, "families"));
  const sources = readJsonTree<SourceRecord>(path.join(GENEALOGY_ROOT, "sources"))
    .filter(isGenealogyRecordSource);
  const peopleById = new Map(people.map((person) => [person.personId, person]));
  const familyIdsByPerson = new Map<string, Set<string>>();
  const parentIdsByPerson = new Map<string, Set<string>>();

  const addPersonFamily = (personId: string, familyId: string) => {
    const ids = familyIdsByPerson.get(personId) ?? new Set<string>();
    ids.add(familyId);
    familyIdsByPerson.set(personId, ids);
  };

  for (const person of people) {
    for (const familyId of person.familyIds ?? []) addPersonFamily(person.personId, familyId);
    if (person.parents?.length) parentIdsByPerson.set(person.personId, new Set(person.parents));
  }
  for (const family of families) {
    for (const personId of [...(family.spouses ?? []), ...(family.children ?? [])]) {
      addPersonFamily(personId, family.familyId);
    }
    for (const childId of family.children ?? []) {
      const parentIds = parentIdsByPerson.get(childId) ?? new Set<string>();
      for (const parentId of family.spouses ?? []) parentIds.add(parentId);
      parentIdsByPerson.set(childId, parentIds);
    }
  }

  const generationCache = new Map<string, number>();
  const generationOf = (personId: string, visiting = new Set<string>()): number => {
    const cached = generationCache.get(personId);
    if (cached) return cached;
    if (visiting.has(personId)) return 1;
    const person = peopleById.get(personId);
    const parentIds = [...(parentIdsByPerson.get(personId) ?? [])];
    if (!person || !parentIds.length) return 1;
    const nextVisiting = new Set(visiting).add(personId);
    const generation = 1 + Math.max(...parentIds.map((parentId) => generationOf(parentId, nextVisiting)));
    generationCache.set(personId, generation);
    return generation;
  };

  const eventsByPlace = new Map<string, FamilyMapEvent[]>();
  const observationsByPerson = new Map<string, Array<{ placeId: string; year: number; sourceId: string }>>();
  const documentedMigrations: FamilyMapMigration[] = [];
  const years: number[] = [];

  for (const source of sources) {
    const referencedPlaceId = source.event?.place?.placeId;
    const year = sourceYear(source);
    if (!referencedPlaceId || !year) continue;
    const indexedPlace = placesById.get(referencedPlaceId);
    if (!indexedPlace) {
      throw new Error(`Источник ${source.sourceId} ссылается на неизвестное место ${referencedPlaceId}`);
    }
    const placeId = indexedPlace.placeId;

    const sourceMentions = source.mentions ?? [];
    const primaryMention = (
      source.primaryPersonId
        ? sourceMentions.find((mention) => mention.personId === source.primaryPersonId)
        : undefined
    ) ?? sourceMentions[0];
    const personIds = primaryMention?.personId ? [primaryMention.personId] : [];
    const generationPersonIds = [...new Set(sourceMentions.flatMap((mention) => (
      mention.personId ? [mention.personId] : []
    )))];
    const personNames = primaryMention ? [sourceMentionName(primaryMention)] : [];
    const familyIds = [...new Set(personIds.flatMap((personId) => {
      const ids = [...(familyIdsByPerson.get(personId) ?? [])];
      return ids.length ? ids : [`person:${personId}`];
    }))];
    if (!familyIds.length) {
      familyIds.push(documentedSourceFamilyId(sourceMentions, placeId) ?? `source:${source.sourceId}`);
    }

    const event: FamilyMapEvent = {
      sourceId: source.sourceId,
      year,
      date: sourceDate(source),
      eventLabel: sourceEventLabel(source),
      personIds,
      personNames,
      familyIds,
      generation: Math.max(1, ...generationPersonIds.map((personId) => generationOf(personId))),
    };

    const placeEvents = eventsByPlace.get(placeId) ?? [];
    placeEvents.push(event);
    eventsByPlace.set(placeId, placeEvents);
    years.push(year);

    const documentedRoutes: Array<{
      personId?: string;
      personName?: string;
      from: { asWritten?: string; normalized?: string; placeId?: string };
      to: { asWritten?: string; normalized?: string; placeId?: string };
      basis: string;
      confidence: "high" | "medium" | "low";
    }> = source.migrationObservations?.length
      ? source.migrationObservations.map((observation) => ({
        personId: observation.personId,
        personName: observation.personName,
        from: observation.from ?? {},
        to: observation.to ?? {},
        basis: observation.basis ?? "Источник прямо связывает происхождение человека с местом события.",
        confidence: observation.confidence ?? "medium",
      }))
      : (primaryMention?.places ?? [])
        .filter((place) => (place.relation ?? place.type) === "origin" && place.placeId)
        .map((origin) => ({
          personId: primaryMention?.personId,
          personName: primaryMention ? sourceMentionName(primaryMention) : undefined,
          from: origin,
          to: {
            placeId,
            normalized: source.event?.place?.normalized,
          },
          basis: "В документе прямо указано происхождение человека, отличающееся от места события.",
          confidence: origin.confidence ?? "medium",
        }));

    for (const route of documentedRoutes) {
      const referencedFromPlaceId = route.from.placeId;
      const referencedToPlaceId = route.to.placeId ?? placeId;
      if (!referencedFromPlaceId || !referencedToPlaceId) continue;
      const fromPlaceId = placesById.get(referencedFromPlaceId)?.placeId;
      const toPlaceId = placesById.get(referencedToPlaceId)?.placeId;
      if (!fromPlaceId || !toPlaceId) {
        throw new Error(`Источник ${source.sourceId} задаёт перемещение через неизвестное место`);
      }
      if (fromPlaceId === toPlaceId) continue;

      const routePersonIds = route.personId ? [route.personId] : personIds;
      const routePersonNames = [
        route.personName,
        route.personId ? peopleById.get(route.personId)?.displayName : undefined,
        personNames[0],
      ].filter((name, index, names): name is string => Boolean(name) && names.indexOf(name) === index).slice(0, 1);
      const originEvent: FamilyMapEvent = {
        ...event,
        eventLabel: "Происхождение, указанное в документе",
        personIds: routePersonIds,
        personNames: routePersonNames,
      };
      const originEvents = eventsByPlace.get(fromPlaceId) ?? [];
      if (!originEvents.some((candidate) => candidate.sourceId === source.sourceId)) {
        originEvents.push(originEvent);
        eventsByPlace.set(fromPlaceId, originEvents);
      }

      documentedMigrations.push({
        migrationId: `documented:${source.sourceId}:${fromPlaceId}:${toPlaceId}`,
        fromPlaceId,
        toPlaceId,
        year,
        personIds: routePersonIds,
        personNames: routePersonNames,
        basis: route.basis,
        confidence: route.confidence,
        sourceIds: [source.sourceId],
      });
    }

    for (const personId of personIds) {
      const observations = observationsByPerson.get(personId) ?? [];
      observations.push({ placeId, year, sourceId: source.sourceId });
      observationsByPerson.set(personId, observations);
    }
  }

  const migrationMap = new Map<string, FamilyMapMigration>(
    documentedMigrations.map((migration) => [migration.migrationId, migration]),
  );
  for (const [personId, observations] of observationsByPerson) {
    const ordered = observations
      .sort((left, right) => left.year - right.year || left.sourceId.localeCompare(right.sourceId))
      .filter((observation, index, entries) => index === 0 || observation.placeId !== entries[index - 1].placeId);

    for (let index = 1; index < ordered.length; index += 1) {
      const from = ordered[index - 1];
      const to = ordered[index];
      if (from.placeId === to.placeId) continue;
      const migrationId = `${from.placeId}:${to.placeId}:${to.year}`;
      const migration = migrationMap.get(migrationId) ?? {
        migrationId,
        fromPlaceId: from.placeId,
        toPlaceId: to.placeId,
        year: to.year,
        personIds: [],
        personNames: [],
        basis: "Последовательные документы одного человека показывают смену места.",
        confidence: "medium",
        sourceIds: [from.sourceId, to.sourceId],
      };
      if (!migration.personIds.includes(personId)) migration.personIds.push(personId);
      const name = peopleById.get(personId)?.displayName;
      if (name && !migration.personNames.includes(name)) migration.personNames.push(name);
      for (const sourceId of [from.sourceId, to.sourceId]) {
        if (!migration.sourceIds.includes(sourceId)) migration.sourceIds.push(sourceId);
      }
      migrationMap.set(migrationId, migration);
    }
  }

  const mapPlaces: FamilyMapPlace[] = placesIndex.places.flatMap((place) => {
    const events = eventsByPlace.get(place.placeId);
    if (!events?.length) return [];
    return [{
      ...place,
      precisionLabel: familyMapPrecisionLabels[place.geo.precision],
      events: events.sort((left, right) => left.year - right.year || left.sourceId.localeCompare(right.sourceId)),
    }];
  });

  return {
    places: mapPlaces,
    migrations: [...migrationMap.values()].sort((left, right) => left.year - right.year),
    range: {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    },
    stats: {
      indexedPlaces: placesIndex.places.length,
      mappedPlaces: mapPlaces.length,
      approximatePlaces: mapPlaces.filter((place) => ["district", "region", "approximate"].includes(place.geo.precision)).length,
      records: new Set(mapPlaces.flatMap((place) => place.events.map((event) => event.sourceId))).size,
      migrations: migrationMap.size,
    },
  };
}
