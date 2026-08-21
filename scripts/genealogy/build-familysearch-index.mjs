import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const outputDir = path.join(root, "data/genealogy/indexes");
const outputPath = path.join(outputDir, "familysearch-reviewed.json");
const evidenceQualityPath = path.join(root, "data/genealogy/evidence-quality.json");

const evidenceQuality = JSON.parse(await readFile(evidenceQualityPath, "utf8"));

const files = (await readdir(sourcesDir))
  .filter((name) => name.endsWith(".json"))
  .sort();

const sources = await Promise.all(
  files.map(async (file) => ({
    file,
    data: JSON.parse(await readFile(path.join(sourcesDir, file), "utf8")),
  })),
);

const canonicalArk = (value) => {
  if (!value) return null;
  const match = value.match(/https:\/\/www\.familysearch\.org\/ark:\/61903\/(?:3:1|1:1)\/[^?]+/);
  return match?.[0] ?? value.split("?")[0];
};

const normalize = (value) =>
  value
    .normalize("NFKC")
    .toLocaleLowerCase("ru")
    .replace(/[ъь]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^а-яa-z0-9]+/g, " ")
    .trim();

const reviewedSources = {};
const arkToSourceId = {};
const imagePositionToSourceId = {};
const eventFingerprints = {};
const observedSurnameForms = new Set();
const evidenceIsApproved = (status) => status?.startsWith("approved");

for (const { file, data } of sources) {
  const copies = data.sourceCopies?.length ? data.sourceCopies : [data];
  const imageArk = canonicalArk(data.links?.imageArk);
  const recordArk = canonicalArk(data.links?.indexedRecordArk ?? data.links?.recordArk);
  const eventDate = data.event?.date?.iso ??
    data.event?.date?.birthIso ??
    data.event?.date?.baptismIso ??
    data.event?.date?.deathIso ??
    data.event?.date?.burialIso ??
    data.event?.date?.marriageIso ??
    null;
  const fingerprint = [
    data.event?.type ?? "unknown",
    eventDate ?? "unknown",
    data.event?.place?.placeId ?? "unknown",
    ...(data.mentions ?? []).map((mention) => normalize(
      mention.displayName ?? mention.modernName ?? mention.nameAsIndexed ?? mention.nameAsTranscribed ?? mention.nameAsWritten ?? "",
    )),
  ].join("|");

  reviewedSources[data.sourceId] = {
    file: `data/genealogy/sources/familysearch/${file}`,
    imageArk,
    recordArk,
    imageGroupNumber: data.collection?.imageGroupNumber ?? null,
    itemNumber: data.collection?.itemNumber ?? null,
    imageNumber: data.collection?.imageNumber ?? null,
    eventType: data.event?.type ?? null,
    eventDate,
    placeId: data.event?.place?.placeId ?? null,
    transcriptionStatus: data.transcription?.status ?? "missing",
    reviewStatus: data.review?.status ?? "missing",
    evidencePath: data.evidence?.path ?? null,
    evidenceQualityStatus: evidenceQuality.records?.[data.sourceId]?.status ?? "recapture-required",
    mergedSourceIds: data.mergedSourceIds ?? [data.sourceId],
    sourceCopies: copies.map((copy) => copy.sourceId),
  };

  for (const copy of copies) {
    const copyImageArk = canonicalArk(copy.links?.imageArk);
    const copyRecordArk = canonicalArk(copy.links?.indexedRecordArk ?? copy.links?.recordArk);
    const copyPosition = [
      copy.collection?.imageGroupNumber,
      copy.collection?.itemNumber ?? "-",
      copy.collection?.imageNumber ?? "-",
    ].join(":");
    if (copyImageArk) arkToSourceId[copyImageArk] = data.sourceId;
    if (copyRecordArk) arkToSourceId[copyRecordArk] = data.sourceId;
    if (copy.collection?.imageGroupNumber) imagePositionToSourceId[copyPosition] = data.sourceId;
  }
  (eventFingerprints[fingerprint] ??= []).push(data.sourceId);

  for (const mention of data.mentions ?? []) {
    const observedNames = [
      mention.displayName,
      mention.patronymic,
      ...(mention.alternateNames ?? []),
      mention.nameAsTranscribed,
      mention.nameAsWritten,
      mention.nameAsIndexed,
      mention.modernName,
    ].filter(Boolean);
    for (const observedName of observedNames) {
      for (const token of observedName.split(/\s+/)) {
        if (/^(?:а|я|е|э|о)?м?н?п?и?л(?:о|а)?г?о?в(?:а|ъ)?$/iu.test(token)) {
          observedSurnameForms.add(token.replace(/[.,;:!?()[\]{}]/g, ""));
        }
      }
    }
  }
}

const payload = {
  schemaVersion: 1,
  provider: "FamilySearch",
  purpose: "Не открывать и не расшифровывать повторно уже обработанные ARK и позиции изображений.",
  stats: {
    reviewedSources: sources.length,
    preservedSourceCopies: sources.reduce((total, source) => total + (source.data.sourceCopies?.length ?? 1), 0),
    uniqueArks: Object.keys(arkToSourceId).length,
    uniqueImagePositions: Object.keys(imagePositionToSourceId).length,
    approvedEvidence: Object.values(reviewedSources)
      .filter((source) => evidenceIsApproved(source.evidenceQualityStatus)).length,
    evidenceRecaptureRequired: Object.values(reviewedSources)
      .filter((source) => !evidenceIsApproved(source.evidenceQualityStatus)).length,
  },
  reviewedSources,
  arkToSourceId,
  imagePositionToSourceId,
  eventFingerprints,
  observedSurnameForms: [...observedSurnameForms].sort((a, b) => a.localeCompare(b, "ru")),
  queues: {
    needsFullTranscription: Object.entries(reviewedSources)
      .filter(([, source]) => !["verified", "complete"].includes(source.transcriptionStatus))
      .map(([sourceId]) => sourceId),
    missingEvidence: Object.entries(reviewedSources)
      .filter(([, source]) => !source.evidencePath)
      .map(([sourceId]) => sourceId),
    needsEvidenceRecapture: Object.entries(reviewedSources)
      .filter(([, source]) => !evidenceIsApproved(source.evidenceQualityStatus))
      .map(([sourceId]) => sourceId),
  },
};

const stableJson = `${JSON.stringify(payload, null, 2)}\n`;
payload.contentSha256 = createHash("sha256").update(stableJson).digest("hex");

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Indexed ${sources.length} FamilySearch sources -> ${path.relative(root, outputPath)}`);
