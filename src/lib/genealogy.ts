import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import placesIndexData from "../../data/genealogy/places/index.json";

const GENEALOGY_ROOT = path.join(process.cwd(), "data/genealogy");

type PersonRecord = {
  personId: string;
  displayName: string;
  patronymic?: string;
  sex?: "male" | "female";
  nameVariants?: string[];
  birth?: { date?: unknown; placeId?: string };
  birthEstimate?: { year?: number; from?: string; to?: string; basis?: string };
  dates?: {
    birth?: { display?: string; iso?: string; basis?: string };
  };
  occupation?: string[] | string | {
    asWritten?: string;
    normalized?: string;
    placeId?: string;
  };
  parents?: string[] | {
    fatherId?: string | null;
    motherId?: string | null;
    familyId?: string | null;
  };
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
  eventRole?: string;
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
  status?: string;
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
  nameAnalysis?: Array<{
    label: string;
    text: string;
  }>;
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
    scanNumber?: number | string;
    page?: number | string;
    pageNumber?: number | string;
    locality?: string;
    volume?: number | string;
    subgroup?: number | string;
    archivalReferenceNumber?: string;
    archiveRef?: string;
    archivalReference?: string;
    archiveReference?: string;
    fond?: number | string;
    inventory?: number | string;
    file?: number | string;
    custodian?: string;
  };
  repository?: {
    name?: string;
    location?: string;
    url?: string;
    attributionAsShown?: string;
  };
  links?: {
    imageArk?: string;
    recordArk?: string;
    indexedRecordArk?: string;
    [key: string]: unknown;
  };
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
      yearFrom?: number;
      yearTo?: number;
    };
    place?: {
      normalized?: string;
      asIndexed?: string;
      asWritten?: string;
      asTranscribed?: string;
      modernName?: string;
      modernCountry?: string;
      modernRegion?: string;
      historicalRegion?: string;
      placeId?: string;
      placeNote?: string;
      note?: string;
      basis?: string;
      certainty?: string;
      confidence?: string;
      precision?: string;
    };
  };
  transcription?: {
    status?: string;
    literal?: string;
    modernInterpretation?: string;
    suppliedText?: string;
    layoutNote?: string;
    notes?: unknown;
    note?: unknown;
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
  mobility?: {
    status?: string;
    origin?: string;
    destination?: string;
    dateByWhichMoved?: string;
    historicalRegion?: string;
    indexedPlace?: string;
    eventPlace?: string;
    placeId?: string;
    notes?: string[];
  };
  historicalContext?: Record<string, unknown>;
  context?: Record<string, unknown>;
  serviceContext?: Record<string, unknown>;
  identity?: Record<string, unknown>;
  legalContext?: Record<string, unknown>;
  policyContext?: Record<string, unknown>;
  methodology?: Record<string, unknown>;
  chronology?: unknown;
  events?: unknown;
  researchNotes?: string[] | Record<string, unknown>;
  notes?: string[];
  evidence?: {
    path?: string;
    publicDisplay?: boolean;
    rightsNote?: string;
    fragments?: Array<{ part?: string; path?: string }>;
  };
  review?: {
    status?: string;
    unresolved?: string[];
    transcriptionConfidence?: unknown;
    identityResolution?: unknown;
    indexCorrections?: unknown;
    findings?: unknown;
    corrections?: unknown;
    verification?: unknown;
  };
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

export type ArchiveRecordLink = {
  label: string;
  url: string;
};

export type ArchiveRecordPerson = {
  personId: string | null;
  role: string;
  eventRole: string | null;
  name: string;
  patronymic: string | null;
  alternateNames: string[];
  places: Array<{ relation: string; label: string; confidence: string }>;
  details: string[];
  nameAnalysis: Array<{ label: string; text: string }>;
};

export type MigrationObservation = {
  personId: string | null;
  from: string;
  to: string;
  basis: string;
  confidence: string;
};

export type ArchiveRecordFact = {
  label: string;
  value: string;
};

export type ArchiveRecordContext = {
  heading: string;
  items: ArchiveRecordFact[];
};

export type ArchivePlaceTag = {
  relation: string;
  label: string;
  placeId: string | null;
  confidence: string | null;
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
  additionalLinks: ArchiveRecordLink[];
  evidenceUrl: string | null;
  evidenceFragments: Array<{ label: string; url: string }>;
  sourceCopies: ArchiveSourceCopy[];
  mayDisplayEvidence: boolean;
  rightsNote: string;
  primaryPerson: ArchiveRecordPerson | null;
  people: ArchiveRecordPerson[];
  directoryFacts: Array<{ label: string; value: string }>;
  fieldFacts: ArchiveRecordFact[];
  contextSections: ArchiveRecordContext[];
  placeTags: ArchivePlaceTag[];
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

function statusDescribesCompletedReading(status?: string) {
  return /(?:complete|verified|checked|transcri(?:bed|ption)|full-page|primary-scan|published-(?:register|archival|full|householder)|official-database-card|official-case-metadata|compiled-index|indexed-fields)/i
    .test(status ?? "");
}

function statusDescribesUncertainty(status?: string) {
  return /(?:uncertain|unresolved|partial|gap|obstruction|mismatch|discrepanc|original-needed|scan-needed|human-review)/i
    .test(status ?? "");
}

function sourceReviewState(source: SourceRecord): Pick<ArchiveRecord, "reviewState" | "reviewLabel" | "reviewDescription"> {
  const transcriptionStatus = source.transcription?.status ?? "working";
  const reviewStatus = source.review?.status ?? "working";
  const hasLocalEvidence = Boolean(source.evidence?.path || source.evidence?.fragments?.length);
  const hasLiteral = Boolean(source.transcription?.literal?.trim());

  if (reviewStatus === "needs-correct-image" || transcriptionStatus === "complete-index-image-mismatch") {
    return {
      reviewState: "source-needed",
      reviewLabel: "нужен правильный кадр",
      reviewDescription: "ИИ проверил запись, но приложенное изображение не соответствует указанному событию.",
    };
  }

  if (!hasLiteral && transcriptionStatus === "published-excerpt") {
    return {
      reviewState: "source-needed",
      reviewLabel: "нужен оригинал",
      reviewDescription: "Доступен только опубликованный фрагмент; для полного чтения нужна фотокопия оригинала.",
    };
  }

  if (!hasLiteral && /index-only/.test(transcriptionStatus) && source.transcription?.modernInterpretation?.trim()) {
    return {
      reviewState: "human-review",
      reviewLabel: "индекс собран · оригиналы проверяются",
      reviewDescription: "Сводные данные индекса сохранены и объяснены; отдельные оригинальные акты проверяются в самостоятельных карточках.",
    };
  }

  if (!hasLiteral && !hasLocalEvidence && (transcriptionStatus === "name-index" || transcriptionStatus === "partial")) {
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

  if (hasLiteral && ["name-index", "index-only"].includes(transcriptionStatus)) {
    return {
      reviewState: "human-review",
      reviewLabel: "индекс расшифрован · нужен лист",
      reviewDescription: "Текст доступного именного указателя расшифрован; для полного содержания события нужен основной архивный лист.",
    };
  }

  const completedReading = statusDescribesCompletedReading(transcriptionStatus) ||
    statusDescribesCompletedReading(reviewStatus);
  if (hasLiteral && completedReading &&
    (statusDescribesUncertainty(transcriptionStatus) || statusDescribesUncertainty(reviewStatus))) {
    return {
      reviewState: "human-review",
      reviewLabel: "расшифровано · есть оговорки",
      reviewDescription: "Основной текст расшифрован и показан полностью; отмеченные в данных неясные места требуют дополнительной проверки.",
    };
  }

  const isComplete = hasLiteral && completedReading;

  if (isComplete) {
    return {
      reviewState: "complete",
      reviewLabel: "расшифровано",
      reviewDescription: "Генеалогически значимая часть записи расшифрована.",
    };
  }


  if (hasLiteral) {
    return {
      reviewState: "human-review",
      reviewLabel: "текст есть · статус уточняется",
      reviewDescription: "Буквальная расшифровка сохранена и показана; технический статус источника ещё не приведён к общей шкале.",
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

export type PlacePrecision =
  | "settlement"
  | "city"
  | "historical-site"
  | "historical-settlement"
  | "historical-settlement-match"
  | "historical-map"
  | "historical-area"
  | "volost"
  | "volost-center"
  | "district"
  | "region"
  | "approximate";

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
  people: Array<{
    personId: string | null;
    name: string;
    role: string;
    variants: string[];
    details: string[];
    nameInsights: Array<{
      label: string;
      text: string;
    }>;
  }>;
  meaning: string;
  nameInsights: Array<{
    label: string;
    text: string;
  }>;
  familyIds: string[];
  generation: number;
};

export type FamilyMapPlace = GenealogyPlace & {
  precisionLabel: string;
  approximate: boolean;
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
// Keep the place index in Turbopack's dependency graph. Reading it only through
// `readFileSync` left the dev server with a stale in-memory copy after a place
// was added, while source records were hot-reloaded immediately.
const placesIndex = placesIndexData as PlacesIndex;

const placesById = new Map<string, GenealogyPlace>(placesIndex.places.flatMap((place) => (
  [place.placeId, ...(place.legacyIds ?? [])].map((placeId) => [placeId, place] as const)
)));
const placeLabels: Record<string, string> = Object.fromEntries(
  [...placesById].map(([placeId, place]) => [placeId, place.label]),
);

const familyMapPrecisionLabels: Record<PlacePrecision, string> = {
  settlement: "точное поселение",
  city: "точный город",
  "historical-site": "историческое место",
  "historical-settlement": "историческое поселение",
  "historical-settlement-match": "вероятное историческое поселение",
  "historical-map": "по исторической карте",
  "historical-area": "историческая местность",
  volost: "примерно по волости",
  "volost-center": "через волостной центр",
  district: "примерно по уезду",
  region: "примерно по региону",
  approximate: "приблизительно",
};

const exactPlacePrecisions = new Set<string>([
  "settlement",
  "city",
  "historical-site",
  "historical-settlement",
]);

function familyMapPrecisionLabel(precision: string) {
  return familyMapPrecisionLabels[precision as PlacePrecision] ?? "точность требует уточнения";
}

function isApproximatePlacePrecision(precision: string) {
  return !exactPlacePrecisions.has(precision);
}

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
  "resettlement-request": "Заявление о переселении",
  "resettlement-aid": "Помощь переселенцу",
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
  husband: "муж",
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
  "leading-husband-candidate": "ведущий кандидат на мужа",
  eponym: "человек, давший название",
  candidate: "исследовательский кандидат",
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
  "mother-in-birth-indexes": "мать в индексах рождений",
  deacon: "диакон",
  "master-of-buyer": "владелец покупателя",
  "buyer-and-registrant": "покупатель и заявитель",
  buyer: "покупатель",
  "master-of-seller": "владелец продавца",
  "minor-landholder": "недоросль с поместьем",
  householder: "хозяин двора",
  "household-head": "глава семьи",
  "head-of-family": "глава семьи",
  "household-member": "член семьи",
  "daughter-in-law": "невестка",
  "son-in-household": "сын в составе двора",
  "participant-in-land-record": "участник отказной записи",
  "named-person": "названное лицо",
  settler: "поселенец",
  resettler: "переселенец",
  "named-resettler": "переселенец, названный в списке",
  migrant: "переселенец",
  "departed-resettler": "переселенец, отмеченный как выбывший",
  "recorded-as-departed-resettler": "переселенец, отмеченный как выбывший",
  "reported-resettler": "переселенец, названный в сообщении",
  "indexed-resettler": "переселенец из именного указателя",
  "indexed-resettler-in-case": "переселенец, связанный указателем с архивным делом",
  "indexed-resettler-from-anpilogova-village": "переселенец из деревни Анпилоговой",
  "prospective-resettler": "проситель о переселении",
  "prospective-resettler-family-member": "член семьи просителя о переселении",
  "migrant-household-head": "глава переселившегося двора",
  "migrated-one-dweller-household-head": "глава переселившегося однодворческого двора",
  "migrant-requiring-relief": "нуждающийся переселенец",
  "resettler-family-head": "глава семьи переселенцев",
  "resettler-household-head": "глава двора переселенцев",
  "resettler-son": "сын переселенца",
  "resettler-grandson": "внук переселенца",
  "revision-household-head-and-resettler": "глава ревизской семьи и переселенец",
  "resettler-and-authorized-representative": "переселенец и доверенный представитель",
  "resettler-and-group-representative": "переселенец и представитель группы",
  "resettled-householder-surname": "фамилия переселившегося хозяина двора",
  "unresolved-resettler-households": "семьи переселенцев, имена которых уточняются",
  "regimental-cossack": "полковой казак",
  "head-of-household": "глава семьи",
  uncertain: "роль уточняется",
};

const placeRelationLabels: Record<string, string> = {
  origin: "происхождение",
  "administrative-origin": "место происхождения по административной записи",
  "listed-origin": "происхождение по списку",
  "reported-origin": "указанное происхождение",
  "origin-as-written": "происхождение как записано",
  "origin-before-migration": "место до переселения",
  "migration-origin-region": "регион исхода",
  "origin-region": "регион происхождения",
  "migration-origin": "откуда переселился",
  "migration-destination": "куда переселился",
  "documented-destination": "подтверждённое место прибытия",
  "documented-resettlement-destination": "подтверждённое место переселения",
  "prospective-migration-destination": "предполагаемое место переселения",
  "prospective-migration-region": "предполагаемый регион переселения",
  resettlement: "переселение",
  "resettlement-registration": "приписка после переселения",
  "resettlement-enrollment-destination": "место причисления после переселения",
  residence: "местожительство",
  resident: "житель",
  "documented-residence": "подтверждённое местожительство",
  "reported-residence": "указанное местожительство",
  "temporary-residence": "временное местожительство",
  "family-residence": "местожительство семьи",
  "household-head-residence": "местожительство главы двора",
  "residence-before-marriage": "местожительство до брака",
  "resident-and-marriage": "жительство и место брака",
  "residence-and-marriage": "жительство и место брака",
  "marriage-and-settlement": "брак и поселение",
  "marriage-and-family-settlement": "брак и место семейного поселения",
  "later-documented-residence": "позднее подтверждённое местожительство",
  "documented-presence": "подтверждённое присутствие",
  "documented-presence-after-migration": "подтверждённое место после переселения",
  "documented-presence-after-resettlement": "подтверждённое место после переселения",
  birth: "место рождения",
  "birth-and-baptism": "место рождения и крещения",
  "birth-or-baptism": "место рождения или крещения",
  marriage: "место брака",
  "marriage-event": "место брака",
  death: "место смерти",
  "death-and-burial": "место смерти и погребения",
  "death-and-burial-event": "место смерти и погребения",
  "death-or-burial": "место смерти или погребения",
  "probable-death-match": "вероятное место смерти",
  household: "место двора",
  "household-registration": "место регистрации двора",
  "family-affiliation": "место семьи",
  "documented-association": "документально подтверждённая связь",
  "documented-at": "место документальной записи",
  "documented-event": "место события",
  documented: "документально подтверждённое место",
  registration: "приписка",
  "administrative-enrollment": "административная приписка",
  "social-registration": "сословная приписка",
  "estate-affiliation": "сословная принадлежность",
};

function sourcePosition(source: SourceRecord) {
  const collection = source.collection;
  const archivalReference = collection?.archivalReferenceNumber ?? collection?.archiveRef ??
    collection?.archivalReference ?? collection?.archiveReference;
  const fondOpisDelo = [
    collection?.fond !== undefined ? `ф. ${collection.fond}` : null,
    collection?.inventory !== undefined ? `оп. ${collection.inventory}` : null,
    collection?.file !== undefined ? `д. ${collection.file}` : null,
  ].filter(Boolean).join(", ");
  return [
    collection?.archiveCitation,
    archivalReference,
    fondOpisDelo,
    collection?.volume !== undefined ? `том ${collection.volume}` : null,
    collection?.imageGroupNumber ? `DGS ${collection.imageGroupNumber}` : null,
    collection?.subgroup !== undefined ? `подгруппа ${collection.subgroup}` : null,
    collection?.itemNumber ? `Item ${collection.itemNumber}` : null,
    collection?.imageNumber ? `кадр ${collection.imageNumber}` : null,
    collection?.scanNumber ? `снимок ${collection.scanNumber}` : null,
    collection?.pageNumber ?? collection?.page ? `страница ${collection.pageNumber ?? collection.page}` : null,
  ].filter(Boolean).join(" · ");
}

function sourceDate(source: SourceRecord) {
  return source.event?.date?.display ?? formatDate(source.event?.date?.iso);
}

function sourcePlace(source: SourceRecord) {
  return source.event?.place?.normalized ??
    placeLabels[source.event?.place?.placeId ?? ""] ??
    source.event?.place?.asWritten ??
    source.event?.place?.asTranscribed ??
    source.event?.place?.historicalRegion ??
    source.event?.place?.modernName ??
    source.event?.place?.asIndexed ??
    source.collection?.locality ??
    "Место проверяется";
}

const recordDataLabels: Record<string, string> = {
  age: "Возраст",
  birthDate: "Дата рождения",
  baptismDate: "Дата крещения",
  deathDate: "Дата смерти",
  burialDate: "Дата погребения",
  marriageDate: "Дата брака",
  eventDate: "Дата события",
  causeOfDeath: "Причина смерти",
  cause: "Причина смерти",
  burialPlace: "Место погребения",
  recordNumber: "Номер записи",
  sequenceNumber: "Порядковый номер",
  child: "Ребёнок",
  deceased: "Умерший",
  father: "Отец",
  mother: "Мать",
  parents: "Родители",
  parent: "Родитель",
  groom: "Жених",
  bride: "Невеста",
  spouse: "Супруг или супруга",
  husband: "Муж",
  godparents: "Восприемники",
  godfather: "Восприемник",
  godmother: "Восприемница",
  clergy: "Причт",
  officiant: "Совершил обряд",
  witnesses: "Свидетели",
  sureties: "Поручители",
  socialStatus: "Сословие и состояние",
  fatherStatus: "Состояние отца",
  parentsStatus: "Состояние родителей",
  residence: "Местожительство",
  origin: "Происхождение",
  fatherOrigin: "Происхождение отца",
  familyOrigin: "Происхождение семьи",
  parentsResidence: "Местожительство родителей",
  parentsReligion: "Вероисповедание родителей",
  religion: "Вероисповедание",
  estimatedBirthYear: "Примерный год рождения",
  birthYearApprox: "Примерный год рождения",
  birthYearEstimated: "Примерный год рождения",
  groomAge: "Возраст жениха",
  brideAge: "Возраст невесты",
  groomBirthYearApprox: "Примерный год рождения жениха",
  brideBirthYearApprox: "Примерный год рождения невесты",
  layoutNote: "Как устроена запись",
  archiveLead: "Куда искать дальше",
  text: "Исторический смысл",
  significance: "Значение находки",
  historicalSetting: "Историческая обстановка",
  responsibleOfficial: "Кто проводил смотр",
  reviewType: "Вид смотра",
  assemblyOrDestination: "Куда собиралось войско",
  serviceCategory: "Категория службы",
  documentFunction: "Зачем составлялся документ",
  whatThisDocumentIs: "Что это за документ",
  whoWroteIt: "Кто составил документ",
  whyItWasWritten: "Зачем он был составлен",
  whatItDoesNotSay: "Чего документ не доказывает",
  surnameSpelling: "Как записана фамилия",
  status: "Статус вывода",
  notes: "Примечания",
  transcriptionConfidence: "Уверенность в чтении",
  identityResolution: "Отождествление человека",
  indexCorrections: "Исправления индекса",
  findings: "Результаты проверки",
  corrections: "Исправления",
  verification: "Как проверено",
  dateByWhichMoved: "Перемещение произошло не позднее",
  indexedPlace: "Место в индексе",
  eventPlace: "Фактическое место события",
  historicalRegion: "Исторический регион",
  displayName: "Имя",
  role: "Роль",
  basis: "Основание",
  caution: "Оговорка",
  contextSources: "Источники контекста",
};

function humanDataLabel(key: string) {
  if (recordDataLabels[key]) return recordDataLabels[key];
  const spaced = key
    .replace(/([a-zа-я])([A-ZА-Я])/g, "$1 $2")
    .replaceAll("_", " ")
    .replaceAll("-", " ");
  return spaced.charAt(0).toLocaleUpperCase("ru") + spaced.slice(1);
}

function recordDataValue(value: unknown, depth = 0): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "да" : "нет";
  if (Array.isArray(value)) {
    return value.map((item) => recordDataValue(item, depth + 1)).filter(Boolean).join(" · ");
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    for (const key of ["display", "asWritten", "normalized", "text", "value", "name", "label"]) {
      const direct = recordDataValue(object[key], depth + 1);
      if (direct) return direct;
    }
    if (depth >= 2) return "";
    return Object.entries(object)
      .map(([key, item]) => {
        const text = recordDataValue(item, depth + 1);
        return text ? `${humanDataLabel(key)}: ${text}` : "";
      })
      .filter(Boolean)
      .join("; ");
  }
  return "";
}

function sourceFieldFacts(source: SourceRecord): ArchiveRecordFact[] {
  return Object.entries(source.transcription?.fields ?? {})
    .map(([key, value]) => ({ label: humanDataLabel(key), value: recordDataValue(value) }))
    .filter((fact) => Boolean(fact.value));
}

function contextItems(value: unknown): ArchiveRecordFact[] {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      label: value.length > 1 ? `Примечание ${index + 1}` : "Примечание",
      value: recordDataValue(item),
    })).filter((item) => Boolean(item.value));
  }
  if (!value || typeof value !== "object") {
    const text = recordDataValue(value);
    return text ? [{ label: "Примечание", value: text }] : [];
  }
  const entries = Object.entries(value as Record<string, unknown>);
  const visibleEntries = entries.length > 1 ? entries.filter(([key]) => key !== "status") : entries;
  return visibleEntries
    .flatMap(([key, item]) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const nested = Object.entries(item as Record<string, unknown>)
          .map(([nestedKey, nestedValue]) => ({
            label: `${humanDataLabel(key)} — ${humanDataLabel(nestedKey)}`,
            value: recordDataValue(nestedValue),
          }))
          .filter((nestedItem) => Boolean(nestedItem.value));
        if (nested.length) return nested;
      }
      return [{ label: humanDataLabel(key), value: recordDataValue(item) }];
    })
    .filter((item) => Boolean(item.value));
}

function sourceContextSections(source: SourceRecord): ArchiveRecordContext[] {
  const sections: Array<[string, unknown]> = [
    ["Исторический контекст", source.historicalContext],
    ["Контекст документа", source.context],
    ["Служба и смотр войск", source.serviceContext],
    ["Установление личности", source.identity],
    ["Правовой контекст", source.legalContext],
    ["Государственная политика", source.policyContext],
    ["Методика проверки", source.methodology],
    ["Хронология", source.chronology],
    ["События сводной карточки", source.events],
    ["Перемещение и география", source.mobility],
    ["Исследовательские примечания", source.researchNotes],
    ["Примечания к чтению", source.notes],
    ["Устройство листа", source.transcription?.layoutNote],
    ["Примечания расшифровки", source.transcription?.notes ?? source.transcription?.note],
    ["Проверка и уверенность", {
      transcriptionConfidence: source.review?.transcriptionConfidence,
      identityResolution: source.review?.identityResolution,
      indexCorrections: source.review?.indexCorrections,
      findings: source.review?.findings,
      corrections: source.review?.corrections,
      verification: source.review?.verification,
    }],
  ];
  const place = source.event?.place;
  const placeItems = [
    place?.placeNote ? { label: "Примечание к месту", value: place.placeNote } : null,
    place?.note ? { label: "Оговорка о месте", value: place.note } : null,
    place?.basis ? { label: "Основание локализации", value: place.basis } : null,
    place?.precision ? { label: "Точность локализации", value: place.precision } : null,
  ].filter((item): item is ArchiveRecordFact => Boolean(item));

  return [
    ...sections.map(([heading, value]) => ({ heading, items: contextItems(value) })),
    { heading: "Локализация события", items: placeItems },
  ].filter((section) => section.items.length);
}

function sourcePlaceTags(source: SourceRecord, people: ArchiveRecordPerson[]): ArchivePlaceTag[] {
  const eventPlace = source.event?.place;
  const tags: ArchivePlaceTag[] = [{
    relation: "место события",
    label: sourcePlace(source),
    placeId: eventPlace?.placeId ?? null,
    confidence: eventPlace?.confidence ?? eventPlace?.certainty ?? null,
  }];
  if (eventPlace?.historicalRegion) tags.push({
    relation: "историческая локализация",
    label: eventPlace.historicalRegion,
    placeId: eventPlace.placeId ?? null,
    confidence: eventPlace.confidence ?? eventPlace.certainty ?? null,
  });
  if (eventPlace?.modernName) tags.push({
    relation: "современное соответствие",
    label: [eventPlace.modernName, eventPlace.modernRegion, eventPlace.modernCountry]
      .filter((value): value is string => Boolean(value))
      .filter((value, index, values) => !values.slice(0, index).some((earlier) => earlier.includes(value)))
      .join(", "),
    placeId: eventPlace.placeId ?? null,
    confidence: eventPlace.confidence ?? eventPlace.certainty ?? null,
  });
  if (source.collection?.locality) tags.push({
    relation: "место в метаданных книги",
    label: source.collection.locality,
    placeId: eventPlace?.placeId ?? null,
    confidence: null,
  });
  for (const person of people) {
    for (const place of person.places) {
      tags.push({ relation: place.relation, label: place.label, placeId: null, confidence: place.confidence });
    }
  }
  if (source.mobility?.origin) tags.push({ relation: "откуда", label: source.mobility.origin, placeId: null, confidence: null });
  if (source.mobility?.destination) tags.push({ relation: "куда", label: source.mobility.destination, placeId: source.mobility.placeId ?? null, confidence: null });
  if (source.mobility?.historicalRegion) tags.push({ relation: "исторический регион", label: source.mobility.historicalRegion, placeId: null, confidence: null });
  const geographicFields: Array<[string, string]> = [
    ["origin", "происхождение"],
    ["fatherOrigin", "происхождение отца"],
    ["familyOrigin", "происхождение семьи"],
    ["residence", "местожительство"],
    ["parentsResidence", "местожительство родителей"],
    ["burialPlace", "место погребения"],
    ["parish", "приход"],
    ["exactParish", "точный приход"],
  ];
  for (const [key, relation] of geographicFields) {
    const label = recordDataValue(source.transcription?.fields?.[key]);
    if (label) tags.push({ relation, label, placeId: null, confidence: null });
  }

  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (!tag.label || tag.label === "Место проверяется") return false;
    const key = `${tag.relation}:${tag.label}`.toLocaleLowerCase("ru");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function migrationPlaceLabel(place?: { asWritten?: string; normalized?: string; placeId?: string }) {
  return place?.normalized ?? place?.asWritten ?? placeLabels[place?.placeId ?? ""] ?? "";
}

function sourceMigrations(source: SourceRecord): MigrationObservation[] {
  const migrations: MigrationObservation[] = (source.migrationObservations ?? []).map((observation) => ({
    personId: observation.personId ?? null,
    from: migrationPlaceLabel(observation.from) || "Не установлено",
    to: migrationPlaceLabel(observation.to) || sourcePlace(source),
    basis: observation.basis ?? "Происхождение человека отличается от места события",
    confidence: observation.confidence ?? "medium",
  }));

  const mobility = source.mobility;
  if (mobility?.origin || mobility?.destination) {
    migrations.push({
      personId: source.primaryPersonId ?? null,
      from: mobility.origin ?? "Не установлено",
      to: mobility.destination ?? sourcePlace(source),
      basis: mobility.notes?.join(" ") || "Маршрут прямо сохранён в исследовательском блоке источника.",
      confidence: /direct|documented/i.test(mobility.status ?? "") ? "high" : "medium",
    });
  }

  for (const mention of source.mentions ?? []) {
    const origin = mention.places?.find((place) => /origin|откуда/i.test(place.relation ?? place.type ?? ""));
    const destination = mention.places?.find((place) => /destination|resettlement|куда/i.test(place.relation ?? place.type ?? ""));
    if (!origin && !destination) continue;
    migrations.push({
      personId: mention.personId ?? null,
      from: migrationPlaceLabel(origin) || "Не установлено",
      to: migrationPlaceLabel(destination) || sourcePlace(source),
      basis: `${sourceMentionName(mention)}: географическая связь структурирована непосредственно в записи.`,
      confidence: origin?.confidence ?? destination?.confidence ?? "medium",
    });
  }

  const seen = new Set<string>();
  return migrations.filter((migration) => {
    const key = `${migration.personId}:${migration.from}:${migration.to}`.toLocaleLowerCase("ru");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sourceAdditionalLinks(source: SourceRecord): ArchiveRecordLink[] {
  const primaryKeys = new Set(["imageArk", "recordArk", "indexedRecordArk"]);
  const seen = new Set<string>();
  const personNames: Record<string, string> = {
    filipp: "Филипп",
    leonty: "Леонтий",
    ioann: "Иоанн",
    pelagia: "Пелагия",
    grigory: "Григорий",
  };
  const linkLabel = (key: string) => {
    const match = key.match(/^(filipp|leonty|ioann|pelagia|grigory)(Birth|Death)(Record|Image)$/);
    if (!match) return humanDataLabel(key);
    return `${personNames[match[1]]}: ${match[2] === "Birth" ? "рождение" : "смерть"} · ${match[3] === "Record" ? "индекс" : "скан"}`;
  };
  return Object.entries(source.links ?? {})
    .filter(([key, value]) => !primaryKeys.has(key) && typeof value === "string" && /^https?:\/\//.test(value))
    .map(([key, value]) => ({ label: linkLabel(key), url: value as string }))
    .filter((link) => {
      if (seen.has(link.url)) return false;
      seen.add(link.url);
      return true;
    });
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

function sourcePeople(
  source: SourceRecord,
  peopleById?: Map<string, PersonRecord>,
): ArchiveRecordPerson[] {
  const mentions = source.mentions ?? [];

  if (!mentions.length && source.primaryPersonId) {
    const person = peopleById?.get(source.primaryPersonId);
    if (person) {
      const places = (person.places ?? []).map((place) => {
        const entry = typeof place === "string" ? { placeId: place } : place;
        return {
          relation: placeRelationLabels[entry.relation ?? ""] ?? entry.relation ?? "связь с местом",
          label: entry.normalized ?? entry.asWritten ?? placeLabels[entry.placeId ?? ""] ?? "Место уточняется",
          confidence: "medium",
        };
      });

      return [{
        personId: personHasAmpilogovSurname(person) ? person.personId : null,
        role: "основной человек источника",
        eventRole: null,
        name: person.displayName,
        patronymic: person.patronymic ?? null,
        alternateNames: [...new Set([
          ...(person.nameVariants ?? []),
          ...(person.surname?.formsAsWritten ?? []),
        ])].filter((name) => name !== person.displayName),
        places,
        details: [person.status, ...personOccupations(person.occupation)]
          .filter((value): value is string => Boolean(value)),
        nameAnalysis: [
          {
            label: "Почему это имя показано",
            text: `Источник связан с профилем «${person.displayName}», но отдельная поимённая строка в его структурированной расшифровке пока не заведена. Имя взято из связанного профиля, а не выдумано из общего текста.`,
          },
          {
            label: "Что означает связь",
            text: "Карточка относится к поиску или контексту этого человека. Сама техническая связь с профилем не заменяет буквальное упоминание в первичном документе.",
          },
        ],
      }];
    }
  }

  return mentions.map((mention) => {
    const profile = mention.personId ? peopleById?.get(mention.personId) : undefined;
    const name = sourceMentionName(mention);
    const role = sourceRoleLabel(mention.role);
    const migration = source.migrationObservations?.find((observation) =>
      Boolean(mention.personId) && observation.personId === mention.personId
    ) ?? (
      mentions.length === 1 && source.migrationObservations?.length === 1
        ? source.migrationObservations[0]
        : undefined
    );
    const migrationFrom = migration?.from?.normalized ?? migration?.from?.asWritten ??
      placeLabels[migration?.from?.placeId ?? ""];
    const migrationTo = migration?.to?.normalized ?? migration?.to?.asWritten ??
      placeLabels[migration?.to?.placeId ?? ""];
    const migrationPlaces: ArchiveRecordPerson["places"] = migration
      ? [
          ...(migrationFrom ? [{ relation: "откуда переселился", label: migrationFrom, confidence: migration.confidence ?? "medium" }] : []),
          ...(migrationTo ? [{ relation: "куда переселился", label: migrationTo, confidence: migration.confidence ?? "medium" }] : []),
        ]
      : [];
    const mentionPlaces = (mention.places ?? []).map((place) => ({
      relation: placeRelationLabels[place.relation ?? place.type ?? ""] ?? place.relation ?? place.type ?? "происхождение",
      label: place.normalized ?? place.asWritten ?? placeLabels[place.placeId ?? ""] ?? "Место уточняется",
      confidence: place.confidence ?? "medium",
    }));
    const profilePlaces: ArchiveRecordPerson["places"] = (profile?.places ?? []).map((place) => {
      const entry = typeof place === "string" ? { placeId: place } : place;
      return {
        relation: placeRelationLabels[entry.relation ?? ""] ?? entry.relation ?? "связь с местом",
        label: entry.normalized ?? entry.asWritten ?? placeLabels[entry.placeId ?? ""] ?? "Место уточняется",
        confidence: "medium",
      };
    });
    const alternateNames = [
      ...(mention.alternateNames ?? []),
      mention.nameAsTranscribed,
      mention.nameAsWritten,
      mention.nameAsIndexed,
      mention.modernName,
      mention.displayName,
      profile?.displayName,
      ...(profile?.nameVariants ?? []),
      ...(profile?.surname?.formsAsWritten ?? []),
    ];
    const literalName = mention.nameAsTranscribed ?? mention.nameAsWritten ?? mention.nameAsIndexed;
    const normalizedName = mention.modernName ?? profile?.displayName ?? name;
    const eventRole = mention.eventRole?.trim() || role;
    const combinedPlaces = [...mentionPlaces, ...migrationPlaces, ...profilePlaces];
    const seenPlaces = new Set<string>();
    const places = combinedPlaces.filter((place) => {
      const key = `${place.relation}:${place.label}`.toLocaleLowerCase("ru");
      if (seenPlaces.has(key)) return false;
      seenPlaces.add(key);
      return true;
    });
    const profileContext = [
      ...personOccupations(profile?.occupation),
      ...(profile?.notes ?? []),
    ].filter((item) => item.trim());

    return {
      personId: profile && personHasAmpilogovSurname(profile) ? mention.personId ?? null : null,
      role: sourceRoleLabel(mention.role),
      eventRole: mention.eventRole?.trim() || null,
      name,
      patronymic: mention.patronymic ?? null,
      alternateNames: [...new Set(alternateNames)]
        .filter((alternateName): alternateName is string => Boolean(alternateName?.trim()))
        .filter((alternateName) => alternateName !== name),
      places,
      details: [
        mention.status,
        mention.socialStatus?.normalized ?? mention.socialStatus?.asWritten,
        mention.occupation?.normalized ?? mention.occupation?.asWritten,
        mention.eventAssociation === "groom" ? "со стороны жениха" : null,
        mention.eventAssociation === "bride" ? "со стороны невесты" : null,
        mention.relationshipNote,
        ...(mention.uncertainties ?? []).map((uncertainty) => `уточнить: ${uncertainty}`),
      ].filter((value): value is string => Boolean(value)),
      nameAnalysis: mention.nameAnalysis?.length
        ? mention.nameAnalysis
        : [
            {
              label: literalName && literalName !== normalizedName ? "Имя в документе" : "Как назван человек",
              text: literalName && literalName !== normalizedName
                ? `В источнике читается «${literalName}». Для поиска и связи с другими документами используется форма «${normalizedName}».`
                : `Источник называет человека «${name}». В этой карточке имя не дополнено неподтверждёнными частями.`,
            },
            {
              label: "Роль в записи",
              text: `${name} — ${eventRole}.${mention.relationshipNote ? ` ${mention.relationshipNote}` : ""}`,
            },
            {
              label: migration ? "Смысл для истории переселения" : "Что устанавливает документ",
              text: migration
                ? `Запись связывает ${name} с маршрутом ${migrationFrom ?? "из места, названного в источнике"} → ${migrationTo ?? sourcePlace(source)}.${migration.basis ? ` ${migration.basis}` : ""}`
                : `Документ фиксирует событие «${sourceEventLabel(source)}»: ${sourceDate(source)}, ${sourcePlace(source)}. Имя показано здесь потому, что человек непосредственно участвует в этой записи как ${eventRole}.`,
            },
            ...profileContext.map((text, index) => ({
              label: "Связь с профилем",
              text,
              index,
            })).map(({ label, text }) => ({ label, text })),
          ],
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

const ampilogovSurnameVariantPattern = /(?:ампилог|ампилов|импилов|амфилог|амфилов|анпилог|анпилов|анфилог|анфилоф|онфилог|онфилоф|онпилог|антилог|анпалов|ампелог|анпелог|анпилос|анпиног|анплог|апилог|аппилог|аминлог|аменлог|анлог|анклог|анлилог|анинлог|арепилог|алеплог|анчислог)/i;
const PUBLIC_RESEARCH_END_YEAR = 1950;

function isAmpilogovVariantName(value?: string | null) {
  return Boolean(value && ampilogovSurnameVariantPattern.test(value));
}

function finalNameToken(value?: string | null) {
  return value?.normalize("NFKC").trim().split(/\s+/).at(-1)?.replace(/[^a-zа-яё-]/gi, "") ?? "";
}

function personHasAmpilogovSurname(person?: PersonRecord) {
  if (!person) return false;
  if (person.surname?.normalized?.trim()) {
    return isAmpilogovVariantName(person.surname.normalized);
  }
  return isAmpilogovVariantName(finalNameToken(person.displayName));
}

function mentionHasAmpilogovSurname(mention: SourceMention, peopleById?: Map<string, PersonRecord>) {
  if (mention.personId && personHasAmpilogovSurname(peopleById?.get(mention.personId))) return true;
  return [
    mention.displayName,
    mention.modernName,
    mention.nameAsIndexed,
    mention.nameAsTranscribed,
    mention.nameAsWritten,
    ...(mention.alternateNames ?? []),
  ].map(finalNameToken).some(isAmpilogovVariantName);
}

function sourceIsWithinPublicResearchPeriod(source: SourceRecord) {
  const year = sourceYear(source);
  return !year || year <= PUBLIC_RESEARCH_END_YEAR;
}

function personIsWithinPublicResearchPeriod(person: PersonRecord, linkedSources: SourceRecord[]) {
  const profileYears = [
    recordDataValue(person.birth?.date),
    recordDataValue(person.birthEstimate?.year),
    recordDataValue(person.birthEstimate?.from),
    recordDataValue(person.birthEstimate?.to),
    recordDataValue(person.dates?.birth?.display),
    recordDataValue(person.dates?.birth?.iso),
  ].flatMap((value) => value.match(/\b(?:14|15|16|17|18|19|20)\d{2}\b/g) ?? []).map(Number);
  const sourceYears = linkedSources.map(sourceYear).filter((year) => year > 0);
  const knownYears = [...profileYears, ...sourceYears];
  return !knownYears.length || Math.min(...knownYears) <= PUBLIC_RESEARCH_END_YEAR;
}

function archivePersonHasAmpilogovSurname(person: ArchiveRecordPerson) {
  return [person.name, ...person.alternateNames].map(finalNameToken).some(isAmpilogovVariantName);
}

function sourcePrimaryPerson(source: SourceRecord, people: ArchiveRecordPerson[]) {
  const linkedPrimary = source.primaryPersonId
    ? people.find((person) => person.personId === source.primaryPersonId)
    : undefined;
  if (linkedPrimary && archivePersonHasAmpilogovSurname(linkedPrimary)) return linkedPrimary;
  return people.find(archivePersonHasAmpilogovSurname) ?? people[0] ?? null;
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

function sourceDirectoryFacts(source: SourceRecord, peopleById?: Map<string, PersonRecord>) {
  const eventType = source.event?.type ?? "";
  const mentions = source.mentions ?? [];

  if (birthEventTypes.has(eventType) || /birth|baptism/.test(eventType)) {
    const father = mentions.find((mention) => ["father", "father-index-only"].includes(mention.role ?? ""));
    const mother = mentions.find((mention) => ["mother", "mother-index-only"].includes(mention.role ?? ""));
    const parents = mentions.filter((mention) => mention.role === "parent");

    return [
      father ? { label: "Отец", value: sourceMentionName(father) } : null,
      mother ? { label: "Мать", value: sourceMentionName(mother) } : null,
      ...parents.map((parent) => ({ label: "Родитель", value: sourceMentionName(parent) })),
    ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  }

  if (marriageEventTypes.has(eventType) || eventType.includes("marriage")) {
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

  if (deathEventTypes.has(eventType) || eventType.includes("death")) {
    const deceased = mentions.find((mention) => ["deceased", "deceased-child", "deceased-son", "deceased-daughter", "deceased-widow"].includes(mention.role ?? "")) ?? mentions[0] ?? null;
    const deceasedProfile = deceased?.personId ? peopleById?.get(deceased.personId) : undefined;
    const profileBirthRaw = deceasedProfile?.birth?.date;
    const profileBirthIso = (typeof profileBirthRaw === "string"
      ? profileBirthRaw
      : profileBirthRaw && typeof profileBirthRaw === "object"
        ? recordDataValue((profileBirthRaw as Record<string, unknown>).iso)
        : "") || deceasedProfile?.dates?.birth?.iso;
    const profileBirth = typeof profileBirthIso === "string" && profileBirthIso.match(/^\d{4}-\d{2}-\d{2}$/)
      ? formatDate(profileBirthIso)
      : "";
    const age = sourceAgeForPerson(source, "death", deceased);
    const deathDate = lifeDateFromIso(source.event?.date?.deathIso ?? source.event?.date?.iso) ??
      lifeDateFromDisplay(source.event?.date?.display);
    const birth = age && deathDate ? birthFromDatedAge(deathDate, age) : null;
    const statedBirth = recordDataValue(source.transcription?.fields?.estimatedBirthYear) ||
      recordDataValue(source.transcription?.fields?.birthYearApprox) ||
      recordDataValue(source.transcription?.fields?.birthYearEstimated);
    const cause = recordDataValue(source.transcription?.fields?.causeOfDeath) ||
      recordDataValue(source.transcription?.fields?.cause);
    const burial = recordDataValue(source.transcription?.fields?.burialDate) ||
      formatDate(source.event?.date?.burialIso);

    return [
      age ? { label: "Возраст", value: age } : null,
      profileBirth ? { label: "Рождение по связанному профилю", value: profileBirth } : null,
      statedBirth ? { label: "Рождение по данным записи", value: statedBirth } : null,
      !profileBirth && !statedBirth && birth ? { label: "Рождение (расчёт)", value: birth.display } : null,
      cause ? { label: "Причина смерти", value: cause } : null,
      burial ? { label: "Погребение", value: burial } : null,
    ].filter((fact): fact is { label: string; value: string } => Boolean(fact));
  }

  return [];
}

function sourceHasAmpilogovVariant(
  source: SourceRecord,
  peopleById?: Map<string, PersonRecord>,
) {
  const hasFamilySurnameMention = (source.mentions ?? []).some((mention) =>
    [
      mention.displayName,
      mention.modernName,
      mention.nameAsIndexed,
      mention.nameAsTranscribed,
      mention.nameAsWritten,
      ...(mention.alternateNames ?? []),
      mention.personId ? peopleById?.get(mention.personId)?.displayName : undefined,
      mention.personId ? peopleById?.get(mention.personId)?.surname?.normalized : undefined,
      ...(mention.personId ? peopleById?.get(mention.personId)?.nameVariants ?? [] : []),
      ...(mention.personId ? peopleById?.get(mention.personId)?.surname?.formsAsWritten ?? [] : []),
    ].some(isAmpilogovVariantName)
  );

  return hasFamilySurnameMention;
}

function isGenealogyRecordSource(
  source: SourceRecord,
  peopleById?: Map<string, PersonRecord>,
) {

  return !source.recordType?.startsWith("finding-aid") &&
    source.event?.type !== "negative-finding" &&
    sourceHasAmpilogovVariant(source, peopleById);
}

function toArchiveRecord(
  source: SourceRecord,
  peopleById?: Map<string, PersonRecord>,
): ArchiveRecord {
  const eventType = source.event?.type ?? "unknown";
  const eventLabel = sourceEventLabel(source);
  const date = sourceDate(source);
  const place = sourcePlace(source);
  const people = sourcePeople(source, peopleById);
  const literal = source.transcription?.literal ?? "";
  const summary = source.summary?.text ?? source.transcription?.suppliedText ?? "";
  const primaryPerson = sourcePrimaryPerson(source, people);
  const modernInterpretation = source.transcription?.modernInterpretation?.trim() ||
    summary.trim() ||
    `Запись «${eventLabel.toLocaleLowerCase("ru")}» относится к ${primaryPerson?.name ?? "представителю семьи"}: ${date}, ${place}.`;
  const status = source.transcription?.status ?? source.review?.status ?? "working";
  const review = sourceReviewState(source);
  const isComplete = Boolean(literal.trim()) && (
    review.reviewState === "complete" ||
    statusDescribesCompletedReading(source.transcription?.status) ||
    statusDescribesCompletedReading(source.review?.status)
  );
  const migrations = sourceMigrations(source);
  const fieldFacts = sourceFieldFacts(source);
  const contextSections = sourceContextSections(source);
  const placeTags = sourcePlaceTags(source, people);
  const additionalLinks = sourceAdditionalLinks(source);
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
    additionalLinks,
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
    primaryPerson,
    people,
    directoryFacts: sourceDirectoryFacts(source, peopleById),
    fieldFacts,
    contextSections,
    placeTags,
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
      ...fieldFacts.flatMap((fact) => [fact.label, fact.value]),
      ...contextSections.flatMap((section) => [section.heading, ...section.items.flatMap((item) => [item.label, item.value])]),
      ...placeTags.flatMap((tag) => [tag.relation, tag.label]),
      ...additionalLinks.flatMap((link) => [link.label, link.url]),
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
  const peopleById = new Map(
    readJsonDirectory<PersonRecord>(path.join(GENEALOGY_ROOT, "people"))
      .map((person) => [person.personId, person]),
  );
  const records = readJsonTree<SourceRecord>(
    path.join(GENEALOGY_ROOT, "sources"),
  ).filter((source) =>
    sourceIsWithinPublicResearchPeriod(source) && isGenealogyRecordSource(source, peopleById)
  ).map((source) => toArchiveRecord(source, peopleById)).sort((left, right) =>
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
  if (!evidencePath?.startsWith("public/")) return null;
  return `/${evidencePath.slice("public/".length)}`;
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

function lifeDateFromIso(value?: unknown): LifeDateCandidate | null {
  if (typeof value !== "string" || !value) return null;
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

function personParentIds(value: PersonRecord["parents"]): string[] {
  if (Array.isArray(value)) return value.filter((id): id is string => typeof id === "string" && Boolean(id));
  if (!value || typeof value !== "object") return [];
  return [value.fatherId, value.motherId].filter((id): id is string => typeof id === "string" && Boolean(id));
}

function personOccupations(value: PersonRecord["occupation"]): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string" && Boolean(item));
  if (typeof value === "string") return value ? [value] : [];
  if (!value || typeof value !== "object") return [];
  const label = value.normalized ?? value.asWritten;
  return label ? [label] : [];
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
    const years = Number(record.years ?? record.year ?? 0);
    const months = Number(record.months ?? record.month ?? 0);
    const weeks = Number(record.weeks ?? record.week ?? 0);
    const days = Number(record.days ?? record.day ?? 0);
    const parts = [
      Number.isFinite(years) && years > 0 ? yearCount(years) : "",
      Number.isFinite(months) && months > 0 ? `${months} ${months === 1 ? "месяц" : months < 5 ? "месяца" : "месяцев"}` : "",
      Number.isFinite(weeks) && weeks > 0 ? `${weeks} ${weeks === 1 ? "неделя" : weeks < 5 ? "недели" : "недель"}` : "",
      Number.isFinite(days) && days > 0 ? `${days} ${days === 1 ? "день" : days < 5 ? "дня" : "дней"}` : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
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
  const mixedYear = normalized.match(/(\d+)\s+(\d+)\s*\/\s*(\d+)(?:\s*(?:лет|год))?/);
  const halfYear = !mixedYear && normalized.match(/(?:^|\s)(\d+)\s*\/\s*(\d+)\s*(?:лет|год)/);
  const wholeYear = !mixedYear && !halfYear ? normalized.match(/(\d+)\s*(?:лет|год)/) : null;
  if (mixedYear) totalMonths += Number(mixedYear[1]) * 12 + Math.round((Number(mixedYear[2]) / Number(mixedYear[3])) * 12);
  else if (wholeYear) totalMonths += Number(wholeYear[1]) * 12;
  else if (halfYear) totalMonths += Math.round((Number(halfYear[1]) / Number(halfYear[2])) * 12);
  const month = normalized.match(/(\d+)\s*месяц/);
  if (month) totalMonths += Number(month[1]);
  const week = normalized.match(/(\d+)\s*недел/);
  const day = normalized.match(/(\d+)\s*д(?:ень|ня|ней)/);
  const totalDays = Number(week?.[1] ?? 0) * 7 + Number(day?.[1] ?? 0);
  if (totalMonths || totalDays) return {
    months: totalMonths,
    days: totalDays,
    hasSubYearPrecision: Boolean(mixedYear || halfYear || month || week || day),
  };
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
  const normalizedAge = age.toLocaleLowerCase("ru").trim();
  if (/^0\s*д(?:ень|ня|ней)/.test(normalizedAge)) {
    return {
      display: `ок. ${eventDate.display}`,
      from: eventDate.from,
      to: eventDate.to,
      exactDay: eventDate.exactDay,
      estimated: true,
    };
  }
  if (/младше\s+года|младенец|^0\s*(?:лет|год)/.test(normalizedAge)) {
    const firstYear = eventDate.from.getUTCFullYear() - 1;
    const lastYear = eventDate.to.getUTCFullYear();
    return {
      display: `[${firstYear}–${lastYear}]`,
      from: addUtcDays(addUtcYears(eventDate.from, -1), 1),
      to: eventDate.to,
      exactDay: false,
      estimated: true,
    };
  }
  const parsed = parsedAgeInMonths(age);
  if (!parsed) return null;
  if (parsed.months >= 12 && !parsed.hasSubYearPrecision) {
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

  const approximateByMonths = parsed.months
    ? addUtcMonths(eventDate.from, -parsed.months)
    : eventDate.from;
  const approximate = parsed.days ? addUtcDays(approximateByMonths, -parsed.days) : approximateByMonths;
  const display = parsed.months && !parsed.days
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
  const allSources = readJsonTree<SourceRecord>(path.join(GENEALOGY_ROOT, "sources"));
  const peopleById = new Map(people.map((person) => [person.personId, person]));
  const allSourcesById = new Map(allSources.map((source) => [source.sourceId, source]));
  const publicPeople = people.filter((person) => {
    const linkedSources = (person.sourceIds ?? [])
      .map((sourceId) => allSourcesById.get(sourceId))
      .filter((source): source is SourceRecord => Boolean(source));
    return personHasAmpilogovSurname(person) && personIsWithinPublicResearchPeriod(person, linkedSources);
  });
  const publicPersonIds = new Set(publicPeople.map((person) => person.personId));
  const sources = allSources.filter((source) =>
    sourceIsWithinPublicResearchPeriod(source) && isGenealogyRecordSource(source, peopleById)
  );
  const sourcesById = new Map(sources.map((source) => [source.sourceId, source]));

  const directory: DirectoryPerson[] = publicPeople.map((person) => {
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
    for (const parentId of personParentIds(person.parents)) {
      const parent = peopleById.get(parentId);
      if (parent && publicPersonIds.has(parentId)) relationMap.set(`parent:${parentId}`, { personId: parentId, name: parent.displayName, relation: "parent" });
    }
    for (const familyId of person.familyIds ?? []) {
      const family = families.find((entry) => entry.familyId === familyId);
      if (!family) continue;
      const isSpouse = family.spouses?.includes(person.personId);
      if (isSpouse) {
        for (const spouseId of family.spouses ?? []) {
          if (spouseId === person.personId) continue;
          const spouse = peopleById.get(spouseId);
          if (spouse && publicPersonIds.has(spouseId)) relationMap.set(`spouse:${spouseId}`, { personId: spouseId, name: spouse.displayName, relation: "spouse" });
        }
        for (const childId of family.children ?? []) {
          const child = peopleById.get(childId);
          if (child && publicPersonIds.has(childId)) relationMap.set(`child:${childId}`, { personId: childId, name: child.displayName, relation: "child" });
        }
      }
    }

    for (const relation of person.relations ?? []) {
      const relationType = explicitPersonRelationTypes[relation.type ?? ""];
      const relatedPerson = relation.personId ? peopleById.get(relation.personId) : undefined;
      if (!relationType || !relatedPerson || !publicPersonIds.has(relatedPerson.personId)) continue;
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
      occupations: personOccupations(person.occupation),
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
      people: directory.length,
      families: families.filter((family) =>
        [...(family.spouses ?? []), ...(family.children ?? [])].some((personId) => publicPersonIds.has(personId))
      ).length,
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
  if (Number.isFinite(date?.yearFrom)) return date!.yearFrom!;
  const value = date?.iso ?? date?.birthIso ?? date?.baptismIso ?? date?.display ?? "";
  return Number(value.match(/\b(?:14|15|16|17|18|19|20)\d{2}\b/)?.[0] ?? 0);
}

export function getFamilyMapDirectory() {
  const allPeople = readJsonDirectory<PersonRecord>(path.join(GENEALOGY_ROOT, "people"));
  const families = readJsonDirectory<FamilyRecord>(path.join(GENEALOGY_ROOT, "families"));
  const allSources = readJsonTree<SourceRecord>(path.join(GENEALOGY_ROOT, "sources"));
  const allPeopleById = new Map(allPeople.map((person) => [person.personId, person]));
  const allSourcesById = new Map(allSources.map((source) => [source.sourceId, source]));
  const people = allPeople.filter((person) => {
    const linkedSources = (person.sourceIds ?? [])
      .map((sourceId) => allSourcesById.get(sourceId))
      .filter((source): source is SourceRecord => Boolean(source));
    return personHasAmpilogovSurname(person) && personIsWithinPublicResearchPeriod(person, linkedSources);
  });
  const peopleById = new Map(people.map((person) => [person.personId, person]));
  const sources = allSources.filter((source) =>
    sourceIsWithinPublicResearchPeriod(source) && isGenealogyRecordSource(source, allPeopleById)
  );
  const familyIdsByPerson = new Map<string, Set<string>>();
  const parentIdsByPerson = new Map<string, Set<string>>();

  const addPersonFamily = (personId: string, familyId: string) => {
    const ids = familyIdsByPerson.get(personId) ?? new Set<string>();
    ids.add(familyId);
    familyIdsByPerson.set(personId, ids);
  };

  for (const person of people) {
    for (const familyId of person.familyIds ?? []) addPersonFamily(person.personId, familyId);
    const parentIds = personParentIds(person.parents);
    if (parentIds.length) parentIdsByPerson.set(person.personId, new Set(parentIds));
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

    const sourceMentions = (source.mentions ?? []).filter((mention) => {
      return mentionHasAmpilogovSurname(mention, allPeopleById);
    });
    if (!sourceMentions.length) continue;
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
    const archivePeople = sourcePeople(source, allPeopleById);
    const primaryArchivePerson = (
      primaryMention?.personId
        ? archivePeople.find((person) => person.personId === primaryMention.personId)
        : undefined
    ) ?? archivePeople[0];
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
      people: sourceMentions.flatMap((mention) => {
        const name = sourceMentionName(mention);
        if (!name) return [];
        const linkedPerson = mention.personId ? allPeopleById.get(mention.personId) : undefined;
        const archivePerson = mention.personId
          ? archivePeople.find((person) => person.personId === mention.personId)
          : archivePeople.find((person) => person.name === name);
        const details = [
          mention.relationshipNote,
          mention.socialStatus?.normalized,
          linkedPerson?.notes,
        ].filter((detail): detail is string => Boolean(detail));
        return [{
          personId: mention.personId ?? null,
          name,
          role: mention.eventRole ?? sourceRoleLabel(mention.role),
          variants: [...new Set([
            ...(mention.alternateNames ?? []),
            mention.nameAsTranscribed,
            mention.nameAsWritten,
            mention.nameAsIndexed,
          ].filter((variant): variant is string => Boolean(variant) && variant !== name))],
          details,
          nameInsights: mention.nameAnalysis?.length
            ? mention.nameAnalysis
            : archivePerson?.nameAnalysis ?? [],
        }];
      }),
      meaning: source.transcription?.modernInterpretation?.trim() ||
        source.summary?.text?.trim() ||
        `Запись «${sourceEventLabel(source).toLocaleLowerCase("ru")}» связывает ${primaryArchivePerson?.name ?? "представителя семьи Ампилоговых"} с местом «${placeLabels[placeId] ?? placeId}» (${sourceDate(source)}).`,
      nameInsights: primaryMention?.nameAnalysis?.length
        ? primaryMention.nameAnalysis
        : primaryArchivePerson?.nameAnalysis ?? [],
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
      const routePerson = route.personId ? peopleById.get(route.personId) : undefined;
      const routeNames = [
        route.personName,
        routePerson?.displayName,
        routePerson?.surname?.normalized,
        ...(routePerson?.nameVariants ?? []),
        ...(routePerson?.surname?.formsAsWritten ?? []),
      ];
      if ((route.personId || route.personName) && !routeNames.map(finalNameToken).some(isAmpilogovVariantName)) continue;

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
      precisionLabel: familyMapPrecisionLabel(place.geo.precision),
      approximate: isApproximatePlacePrecision(place.geo.precision),
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
      approximatePlaces: mapPlaces.filter((place) => place.approximate).length,
      records: new Set(mapPlaces.flatMap((place) => place.events.map((event) => event.sourceId))).size,
      migrations: migrationMap.size,
    },
  };
}
