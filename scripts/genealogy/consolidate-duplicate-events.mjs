import { readFile, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const genealogyRoot = path.join(root, "data/genealogy");
const sourcesRoot = path.join(genealogyRoot, "sources");

// These groups have been confirmed from the originals or explicitly linked by
// FamilySearch. Similar-looking records without that evidence are intentionally
// absent: matching a date and a name is not enough to collapse two events.
const groups = [
  ["FS-33SQ-GGXR-G9T", "FS-33SQ-GTWB-94WH"],
  ["FS-3Q9M-CS9N-9FBF", "FS-3Q9M-CS9F-P3L2-5"],
  ["FS-3Q9M-CS9F-R1X8", "FS-3Q9M-CS9N-9VKK"],
  ["FS-3Q9M-CSSM-1QC7-1", "FS-3Q9M-CSSS-B99J-9"],
  ["FS-3QS7-8937-8PX3", "FS-3QHK-9Q97-2SNL"],
  ["FS-3QHK-MQ97-2SV2", "FS-3QSQ-G937-896C-V"],
  ["FS-3QSQ-G937-8TYP", "FS-3QHK-MQ97-2SX4"],
  ["FS-3QS7-L937-85MN", "FS-3QHK-MQ97-2SXH"],
  ["FS-3QHV-GQ97-29KV", "FS-3QS7-L937-8D7-STE"],
  ["FS-3QS7-899H-MVP1", "FS-3QSQ-G99H-4987-2"],
  ["FS-3QS7-L99H-49ZC-7", "FS-3QS7-899H-MXG1"],
  ["FS-3QS7-L99H-MNK1", "FS-3QS7-L99H-S8HJ"],
  ["FS-9396-GPCQ-V", "FS-9396-GGXW-N"],
  ["FS-3Q9M-CSK4-PWPQ-R-PAV", "FS-3QHV-GQ97-29VS"],
  ["FS-3Q9M-CSSW-WHYS", "FS-3Q9M-CSSX-CH1D"],
  ["FS-3QSQ-G99H-MV3D", "FS-3QS7-L99H-SCVF"],
];

const aliasToCanonical = new Map(
  groups.flatMap(([canonical, ...aliases]) => aliases.map((alias) => [alias, canonical])),
);

async function jsonFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return jsonFiles(entryPath);
      return entry.name.endsWith(".json") ? [entryPath] : [];
    }));
  return nested.flat();
}

function unique(values) {
  const seen = new Set();
  return values.filter((value) => {
    const key = JSON.stringify(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isEmpty(value) {
  return value === null || value === undefined || value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0);
}

function mergePreferred(primary, secondary) {
  if (isEmpty(primary)) return structuredClone(secondary);
  if (isEmpty(secondary)) return structuredClone(primary);
  if (Array.isArray(primary) && Array.isArray(secondary)) {
    return unique([...primary, ...secondary].map((value) => structuredClone(value)));
  }
  if (typeof primary === "object" && typeof secondary === "object" && !Array.isArray(primary) && !Array.isArray(secondary)) {
    const result = structuredClone(primary);
    for (const [key, value] of Object.entries(secondary)) {
      result[key] = key in result ? mergePreferred(result[key], value) : structuredClone(value);
    }
    return result;
  }
  return structuredClone(primary);
}

function sourceScore(source) {
  const transcription = source.transcription?.status ?? "";
  const review = source.review?.status ?? "";
  const quality = source.evidence?.quality?.status ?? "";
  const type = source.event?.type ?? "";
  return (
    (["complete", "verified", "complete-as-published"].includes(transcription) ? 600 : 0) +
    (transcription === "complete-with-uncertainties" ? 500 : 0) +
    (review === "complete" ? 400 : 0) +
    (quality.startsWith("approved") ? 250 : 0) +
    (source.evidence?.quality?.sharpTilesConfirmed ? 100 : 0) +
    Math.min((source.transcription?.literal ?? "").length, 500) +
    (type.includes("duplicate") ? -1000 : 0)
  );
}

function mentionScore(mention) {
  const name = mention.displayName ?? mention.modernName ?? mention.nameAsTranscribed ?? mention.nameAsIndexed ?? mention.nameAsWritten ?? "";
  return (mention.personId ? 1000 : 0) + name.split(/\s+/).length * 100 + name.length +
    (mention.nameNote ? 50 : 0) + (mention.maritalStatusAsWritten ? 20 : 0);
}

function mergeMentions(sources) {
  const grouped = new Map();
  for (const source of sources) {
    const occurrenceByRole = new Map();
    for (const mention of source.mentions ?? []) {
      const role = mention.role ?? "mention";
      const occurrence = occurrenceByRole.get(role) ?? 0;
      occurrenceByRole.set(role, occurrence + 1);
      const key = mention.personId ? `person:${mention.personId}:${role}` : `${role}:${occurrence}`;
      const candidates = grouped.get(key) ?? [];
      candidates.push(mention);
      grouped.set(key, candidates);
    }
  }

  return [...grouped.values()].map((candidates) => {
    const ordered = [...candidates].sort((left, right) => mentionScore(right) - mentionScore(left));
    return ordered.slice(1).reduce((result, candidate) => mergePreferred(result, candidate), ordered[0]);
  });
}

function referencedSourceId(relation) {
  return relation.targetSourceId ?? relation.sourceId ?? relation.duplicateOf ?? null;
}

function mergeRelations(sources, groupIds) {
  return unique(sources.flatMap((source) => source.sourceRelations ?? [])
    .filter((relation) => !groupIds.has(referencedSourceId(relation)))
    .map((relation) => replaceSourceReferences(relation)));
}

function sourceCopy(source) {
  const copy = structuredClone(source);
  delete copy.sourceCopies;
  delete copy.mergedSourceIds;
  return copy;
}

function combineEvidence(sources, base) {
  const fragments = [];
  for (const source of sources) {
    const copyLabel = source.collection?.title ?? source.sourceId;
    const candidates = [
      ...(source.evidence?.fragments ?? []),
      ...(source.evidence?.path && !(source.evidence?.fragments ?? []).some((fragment) => fragment.path === source.evidence.path)
        ? [{ part: "основной фрагмент", path: source.evidence.path, sha256: source.evidence.sha256 }]
        : []),
    ];
    for (const fragment of candidates) {
      fragments.push({
        ...structuredClone(fragment),
        part: `${copyLabel} · ${fragment.part ?? "фрагмент"}`,
        sourceId: source.sourceId,
      });
    }
  }

  const rightsNotes = unique(sources.map((source) => source.evidence?.rightsNote).filter(Boolean));
  return {
    ...structuredClone(base.evidence ?? {}),
    publicDisplay: sources.length > 0 && sources.every((source) => source.evidence?.publicDisplay === true),
    rightsNote: rightsNotes.join(" "),
    fragments: unique(fragments),
  };
}

function informativeField(primary, secondary) {
  if (isEmpty(primary)) return structuredClone(secondary);
  if (isEmpty(secondary)) return structuredClone(primary);
  if (typeof primary !== "string" || typeof secondary !== "string") return mergePreferred(primary, secondary);
  const uncertain = /(?:неразборчив|не установ|неизвест|закрыт|мозаич|уточня)/i;
  if (uncertain.test(primary) && !uncertain.test(secondary)) return secondary;
  if (!uncertain.test(primary) && uncertain.test(secondary)) return primary;
  return secondary.length > primary.length ? secondary : primary;
}

function mergeTranscription(sources, base) {
  const fields = {};
  for (const source of [...sources].sort((left, right) => sourceScore(left) - sourceScore(right))) {
    for (const [key, value] of Object.entries(source.transcription?.fields ?? {})) {
      fields[key] = key in fields ? informativeField(fields[key], value) : structuredClone(value);
    }
  }
  return { ...structuredClone(base.transcription ?? {}), fields };
}

function replaceSourceReferences(value, key = "") {
  if (key === "sourceCopies" || key === "mergedSourceIds") return value;
  if (typeof value === "string") return aliasToCanonical.get(value) ?? value;
  if (Array.isArray(value)) {
    const replaced = value.map((entry) => replaceSourceReferences(entry));
    return replaced.every((entry) => typeof entry === "string") ? [...new Set(replaced)] : replaced;
  }
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
    entryKey,
    replaceSourceReferences(entryValue, entryKey),
  ]));
}

function consolidate(group, sourcesById) {
  const [canonicalSourceId] = group;
  const existingCanonical = sourcesById.get(canonicalSourceId)?.data;
  const sources = group.map((sourceId) => {
    const storedCopy = existingCanonical?.sourceCopies?.find((copy) => copy.sourceId === sourceId);
    if (storedCopy) return storedCopy;
    const direct = sourcesById.get(sourceId)?.data;
    if (direct) return direct;
    return null;
  }).filter(Boolean);
  if (!sources.length) throw new Error(`Не найдены экземпляры группы ${group.join(", ")}`);

  const base = [...sources].sort((left, right) => sourceScore(right) - sourceScore(left))[0];
  const groupIds = new Set(group);
  const merged = sources.reduce((result, source) => mergePreferred(result, source), structuredClone(base));
  merged.sourceId = canonicalSourceId;
  merged.mergedSourceIds = group;
  merged.sourceCopies = sources.map(sourceCopy);
  merged.event = structuredClone(base.event);
  merged.collection = structuredClone(base.collection);
  merged.repository = structuredClone(base.repository);
  merged.links = structuredClone(base.links);
  merged.indexData = sources.reduce((result, source) => mergePreferred(result, source.indexData ?? {}), structuredClone(base.indexData ?? {}));
  merged.mentions = mergeMentions(sources);
  merged.transcription = mergeTranscription(sources, base);
  merged.review = structuredClone(base.review);
  merged.summary = structuredClone(base.summary);
  merged.evidence = combineEvidence(sources, base);
  merged.sourceRelations = mergeRelations(sources, groupIds);
  merged.migrationObservations = unique(sources.flatMap((source) => source.migrationObservations ?? []));

  if (canonicalSourceId === "FS-3Q9M-CSK4-PWPQ-R-PAV") {
    const groom = merged.mentions.find((mention) => mention.role === "groom");
    const bride = merged.mentions.find((mention) => mention.role === "bride");
    if (groom) groom.personId = "P0117";
    if (bride) bride.personId = "P0200";
    merged.primaryPersonId = "P0117";
    merged.transcription.status = "complete-with-uncertainties";
    merged.transcription.modernInterpretation = "2 ноября 1823 года крестьянин Павел Семёнович Ампилогов, холостой, вступил в брак с девицей Анной Петровной, впоследствии Ампилоговой. В записи под № 7 перечислены поручители; часть их имён и имя священнослужителя читаются не полностью.";
    merged.transcription.fields = {
      ...merged.transcription.fields,
      recordNumber: "7",
      marriageDate: "2 ноября 1823",
      groom: "Павел Семёнович Ампилогов",
      groomStatus: "холост",
      bride: "Анна Петровна Ампилогова",
      brideStatus: "девица",
      witnesses: "перечень присутствует; отдельные имена требуют палеографической проверки",
      officiant: "частично неразборчив",
    };
    merged.review = {
      status: "complete",
      identityResolution: "single-marriage-event-with-two-archival-copies-and-later-children-crosscheck",
      transcriptionConfidence: "high-for-couple-date-status-and-record-number; medium-for-secondary-names",
      unresolved: [
        "Отдельные имена поручителей и священнослужителя требуют палеографической проверки; идентификации супругов это не мешает.",
      ],
      indexCorrections: [
        "Две параллельные индексации и два архивных экземпляра объединены в одно событие.",
        "Отчества супругов подтверждены записями о детях в Привольном.",
        "Место события нормализовано по читаемому экземпляру как Привольное; подпись второй копии «Ульяновка близ Овсянниковки» сохранена в метаданных экземпляра.",
      ],
    };
    merged.summary = {
      status: "verified-summary",
      text: "2 ноября 1823 года Павел Семёнович Ампилогов и Анна Петровна вступили в брак в Привольном. Событие подтверждают два архивных экземпляра и позднейшие записи об их детях.",
    };
  }

  return replaceSourceReferences(merged);
}

const sourceFiles = await jsonFiles(sourcesRoot);
const sourcesById = new Map();
for (const file of sourceFiles) {
  const data = JSON.parse(await readFile(file, "utf8"));
  sourcesById.set(data.sourceId, { file, data });
}

const removed = [];
for (const group of groups) {
  const [canonicalSourceId, ...aliases] = group;
  const canonicalEntry = sourcesById.get(canonicalSourceId);
  if (!canonicalEntry) throw new Error(`Не найден канонический источник ${canonicalSourceId}`);
  const merged = consolidate(group, sourcesById);
  await writeFile(canonicalEntry.file, `${JSON.stringify(merged, null, 2)}\n`);
  sourcesById.set(canonicalSourceId, { file: canonicalEntry.file, data: merged });

  for (const alias of aliases) {
    const aliasEntry = sourcesById.get(alias);
    if (!aliasEntry || aliasEntry.file === canonicalEntry.file) continue;
    await unlink(aliasEntry.file);
    removed.push(path.relative(root, aliasEntry.file));
    sourcesById.delete(alias);
  }
}

let rewritten = 0;
for (const file of await jsonFiles(genealogyRoot)) {
  if (file.endsWith("familysearch-reviewed.json") || file.endsWith("evidence-quality.json")) continue;
  const data = JSON.parse(await readFile(file, "utf8"));
  const next = replaceSourceReferences(data);
  if (JSON.stringify(next) === JSON.stringify(data)) continue;
  await writeFile(file, `${JSON.stringify(next, null, 2)}\n`);
  rewritten += 1;
}

console.log(JSON.stringify({
  consolidatedGroups: groups.length,
  removedSourceCards: removed.length,
  rewrittenReferenceFiles: rewritten,
  removed,
}, null, 2));
