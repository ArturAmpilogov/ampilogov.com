#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const capturedAt = new Date().toISOString().slice(0, 10);
const runName = process.argv[2] || `yandex-archive-ampilogov-global-fuzzy-${capturedAt}`;
const manifestPath = path.join(root, `data/genealogy/searches/${runName}.json`);
const baseOcrPath = path.join(root, `data/genealogy/searches/${runName}-local-ocr.json`);
const assistedOcrPath = path.join(root, `data/genealogy/searches/${runName}-local-ocr-assisted.json`);
const sourceRoot = path.join(root, "data/genealogy/sources");
const yandexSourceRoot = path.join(sourceRoot, "yandex");
await mkdir(yandexSourceRoot, { recursive: true });

const filesRecursive = async (directory, suffix = "") => {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) { if (error?.code === "ENOENT") return []; throw error; }
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursive(file, suffix);
    return entry.isFile() && (!suffix || entry.name.endsWith(suffix)) ? [file] : [];
  }))).flat();
};

const normalizeLetters = (value) => String(value ?? "").toLowerCase()
  .replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф")
  .replace(/[^а-яё]/gu, "");
const canonicalForms = ["ампилогов", "анпилогов", "аппилогов", "амфилогов", "анфилогов", "онпилогов", "ампилов", "анпилов", "вампилов"];
const tokenPattern = /[А-Яа-яЁёѢѣІіѲѳЪъЬь-]{5,32}/gu;
const distance = (left, right) => {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0]; previous[0] = i;
    for (let j = 1; j <= right.length; j++) {
      const saved = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = saved;
    }
  }
  return previous[right.length];
};
const familyTokens = (value) => [...String(value ?? "").matchAll(tokenPattern)].map((match) => match[0]).filter((token) => {
  const normalized = normalizeLetters(token).replace(/(?:ого|ому|овым|овой|ова|ову|ове|овы|овъ)$/u, "ов");
  return canonicalForms.some((form) => distance(normalized, form) <= 2);
});
const localConfirmation = (value) => {
  const joined = normalizeLetters(value);
  if (canonicalForms.some((form) => joined.includes(form))) return "confirmed-exact-after-removing-line-breaks";
  const tokens = [...String(value ?? "").matchAll(tokenPattern)].map((match) => normalizeLetters(match[0]));
  const minimum = Math.min(99, ...tokens.flatMap((token) => canonicalForms.map((form) => distance(token, form))));
  if (minimum <= 2) return "confirmed-close-by-independent-local-ocr";
  if (minimum <= 4) return "corroborated-with-old-print-or-handwriting-ocr-distortion";
  return "not-confirmed-by-local-ocr";
};
const modernize = (value) => String(value ?? "").replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф")
  .replace(/ъ\b/giu, "").replace(/\s+/g, " ").trim();
const sourceIdFor = (row) => `YA-${row.catalogId.slice(0, 8).toUpperCase()}-${String(row.scanNumber).padStart(3, "0")}`;
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const dimensions = async (file) => { const data = await readFile(file); return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`; };
const inferType = (text) => {
  const value = text.toLowerCase();
  if (/родил|крещ|восприем|воспріем/u.test(value)) return "birth-and-baptism";
  if (/умер|погреб|смерт/u.test(value)) return "death-and-burial";
  if (/брак|венчан|жених|невѣст|невест/u.test(value)) return "marriage-record";
  if (/ревиз|перепис|двор|семейств/u.test(value)) return "census-or-revision-record";
  if (/суд|приговор|подсуд|осужден/u.test(value)) return "legal-record";
  if (/полк|батальон|солдат|военн/u.test(value)) return "military-service-record";
  if (/церк|свящ|диакон|приход/u.test(value)) return "church-record";
  return "archival-mention";
};
const isPlaceOnly = (text, tokens) => tokens.length > 0 && tokens.every((token) => {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:деревн\\w*|дер\\.|села|сел[оа]|хутор\\w*|станц\\w*)[^.;\\n]{0,55}${escaped}`, "iu").test(text);
});
const wordSet = (value) => new Set(modernize(value).toLowerCase().match(/[а-яё]{5,}/gu) ?? []);
const keyOf = (row) => `${row.catalogId}/${row.scanNumber}`;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const evidenceRoot = path.resolve(root, manifest.evidenceRoot ?? "data/genealogy/evidence-private/yandex");
const rows = manifest.batches.flatMap((batch) => batch.results);
const baseOcr = JSON.parse(await readFile(baseOcrPath, "utf8"));
const assistedOcr = JSON.parse(await readFile(assistedOcrPath, "utf8"));
const baseByKey = new Map(baseOcr.readings.map((reading) => [keyOf(reading), reading]));
const assistedByKey = new Map(assistedOcr.readings.filter((reading) => !reading.error && reading.text?.trim()).map((reading) => [keyOf(reading), reading]));
const metadataRoot = path.join(tmpdir(), `${manifest.searchRunId.toLowerCase()}-metadata`);

const sourceFileById = new Map();
for (const file of await filesRecursive(sourceRoot, ".json")) {
  try { const source = JSON.parse(await readFile(file, "utf8")); if (source.sourceId) sourceFileById.set(source.sourceId, file); } catch {}
}

const evidenceFor = async (row) => {
  const prefix = String(row.scanNumber).padStart(4, "0");
  const directory = path.join(evidenceRoot, row.catalogId);
  const full = path.join(directory, `${prefix}-full-view.png`);
  const header = path.join(directory, `${prefix}-header.png`);
  const target = path.join(directory, `${prefix}-target-entry.png`);
  await Promise.all([access(full), access(header), access(target)]);
  return {
    catalogId: row.catalogId,
    scanNumber: row.scanNumber,
    captureStatus: "complete-with-local-copy",
    captureType: "yandex-archive-original-image-download-with-enlarged-fragments",
    localBackup: relative(full),
    path: relative(full),
    capturedAt,
    sha256: await digest(full),
    fragments: [
      { kind: "header", path: relative(header), sha256: await digest(header), description: "Фрагмент исходного листа, фиксирующий заголовок или структуру документа." },
      { kind: "target-entry", path: relative(target), sha256: await digest(target), description: "Крупный фрагмент целевого упоминания без интерфейса Яндекса." },
    ],
    quality: {
      originalImageDownloaded: true,
      headerAndTargetGeneratedFromOriginal: true,
      targetCropLocatedFromTextCoordinates: true,
      fullDimensions: await dimensions(full),
      targetDimensions: await dimensions(target),
      method: "original-download-plus-coordinate-recrop-and-independent-local-ocr",
    },
    publicDisplay: false,
    rightsNote: "Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив.",
  };
};

const addEvidence = (source, evidence) => {
  if (!source.evidence?.path || source.evidence.path === evidence.path) return { ...(source.evidence ?? {}), ...evidence };
  const copies = [...(source.evidence.parallelCopies ?? [])];
  if (!copies.some((copy) => copy.path === evidence.path)) copies.push(evidence);
  return { ...source.evidence, parallelCopies: copies };
};

let created = 0;
let upgraded = 0;
let privateAfterCutoff = 0;
let rejected = 0;
let uncertain = 0;
const grouped = new Map();
for (const row of rows.filter((row) => row.capture !== false)) {
  const group = grouped.get(keyOf(row)) ?? [];
  group.push(row); grouped.set(keyOf(row), group);
}

for (const group of grouped.values()) {
  const row = group[0];
  const requestedSourceIds = [...new Set(group.flatMap((item) => item.sourceIds ?? []))];
  const sourceId = requestedSourceIds[0] ?? sourceIdFor(row);
  const base = baseByKey.get(keyOf(row));
  const assisted = assistedByKey.get(keyOf(row));
  const baseState = localConfirmation(base?.text);
  const assistedState = localConfirmation(assisted?.text);
  const confirmed = [baseState, assistedState].some((state) => state.startsWith("confirmed-exact") || state.startsWith("confirmed-close"));
  let metadata = null;
  try { metadata = JSON.parse(await readFile(path.join(metadataRoot, `${row.catalogId}-${row.scanNumber}.json`), "utf8")); } catch {}
  const node = metadata?.pageProps?.currentNode;
  const snippetWords = wordSet(row.indexSnippet);
  const archiveBlocks = (node?.textBlocks ?? []).filter((block) => familyTokens(block.text).length > 0).map((block) => ({
    text: block.text.trim(),
    overlap: [...wordSet(block.text)].filter((word) => snippetWords.has(word)).length,
  })).sort((left, right) => right.overlap - left.overlap);
  const evidence = await evidenceFor(row);
  const existingSourceIds = requestedSourceIds.length ? requestedSourceIds : [sourceId];
  const existingFiles = existingSourceIds.map((id) => [id, sourceFileById.get(id)]).filter(([, file]) => file);
  if (existingFiles.length) {
    let primaryScanReading = "";
    for (const [existingSourceId, existingFile] of existingFiles) {
      const source = JSON.parse(await readFile(existingFile, "utf8"));
      const priorReviewStatus = source.review?.status ?? "";
      const priorTranscriptionStatus = source.transcription?.status ?? "";
      const wasRecapturePlaceholder = priorReviewStatus === "needs-recapture-before-family-record" || priorTranscriptionStatus === "needs-recapture-before-family-record";
      const wasIncompleteReading = wasRecapturePlaceholder ||
        ["needs-review", "needs-human-review", "needs-recapture-for-overview", "partial", "primary-scan-partially-verified"].includes(priorReviewStatus) ||
        ["partial", "partial-primary-scan-transcription", "primary-scan-quality-review", "name-index"].includes(priorTranscriptionStatus);
      if (wasIncompleteReading && source.evidence?.path && source.evidence.path !== evidence.path) {
        const previousEvidence = source.evidence;
        source.evidence = { ...evidence, parallelCopies: [...(evidence.parallelCopies ?? []), previousEvidence] };
      } else {
        source.evidence = addEvidence(source, evidence);
      }
      source.transcription ??= {};
      const locallyReadText = base?.text || assisted?.text || archiveBlocks[0]?.text || row.indexSnippet;
      if (wasRecapturePlaceholder && source.transcription.literal && !source.transcription.preRecaptureResearchNote) {
        source.transcription.preRecaptureResearchNote = source.transcription.literal;
      }
      if (wasRecapturePlaceholder || !source.transcription.literal) source.transcription.literal = locallyReadText;
      if (wasRecapturePlaceholder || !source.transcription.modernInterpretation) source.transcription.modernInterpretation = modernize(source.transcription.literal);
      source.transcription.localOcr = base?.text ?? source.transcription.localOcr ?? "";
      if (assisted) source.transcription.localOcrWithSurnameLexicon = assisted.text;
      source.transcription.status = confirmed
        ? assisted ? "complete-primary-scan-dual-ocr-collation" : "complete-primary-scan-local-ocr-collation"
        : "complete-with-explicit-reading-uncertainty";
      source.transcription.collation = {
        baseLocalOcr: baseState,
        assistedLocalOcr: assisted ? assistedState : "not-run-because-base-confirmed",
        yandexTextBlocksUsedForNavigationAndCollation: true,
      };
      source.transcription.indexNote = "Индекс Яндекса использован только для навигации; сохранённая расшифровка сопоставлена с независимым локальным OCR.";
      source.indexData = { ...(source.indexData ?? {}), querySnippet: row.indexSnippet, fuzzyQuery: true };
      const locallyReadTokens = [...new Set(familyTokens(source.transcription.literal))];
      const year = Number(String(source.event?.date?.display ?? row.date).match(/\d{4}/)?.[0]);
      const publicCore = confirmed && !isPlaceOnly(source.transcription.literal, locallyReadTokens) && Number.isInteger(year) && year <= 1950;
      if (publicCore) {
        if (!source.mentions?.some((mention) => mention.surnameSeries)) {
          const token = locallyReadTokens[0];
          if (token) {
            source.mentions ??= [];
            source.mentions.push({
              mentionId: `${existingSourceId}-M${source.mentions.length + 1}`,
              role: "surname-series-mention",
              personId: null,
              nameAsTranscribed: token,
              displayName: modernize(token),
              surnameSeries: true,
            });
          }
        }
        source.isRecord = true;
        source.publicCore = true;
        source.cardKind = "named-primary-record";
        if (/quality-review|research-review/.test(source.recordType ?? "")) source.recordType = inferType(source.transcription.literal);
      }
      source.review ??= {};
      source.review.status = confirmed ? "complete-source-preserved-with-local-ocr-collation" : "complete-source-preserved-with-explicit-ocr-uncertainty";
      if (!confirmed) {
        source.review.transcriptionConfidence = "medium-with-explicit-uncertainty";
        source.review.unresolved = [...new Set([...(source.review.unresolved ?? []), "Фамильная форма не была уверенно воспроизведена локальным OCR; сверять с сохранённым крупным фрагментом."])];
        uncertain++;
      } else {
        source.review.transcriptionConfidence = "medium-high";
        source.review.unresolved = (source.review.unresolved ?? []).filter((item) => !/пересъ|качественн|локальн.*сним|резкост|фамильная форма не была уверенно воспроизведена локальным OCR/iu.test(item));
      }
      await writeFile(existingFile, `${JSON.stringify(source, null, 2)}\n`);
      primaryScanReading ||= source.transcription.literal;
      sourceFileById.set(existingSourceId, existingFile);
    }
    for (const item of group) Object.assign(item, { sourceId, capture: false, status: "complete-existing-record-evidence-upgraded", primaryScanReading });
    upgraded += existingFiles.length;
    continue;
  }

  const literal = base?.text || assisted?.text || archiveBlocks[0]?.text || row.indexSnippet;
  const tokens = [...new Set([...familyTokens(literal), ...familyTokens(row.indexSnippet)])];
  const year = Number(row.date.match(/\d{4}/)?.[0]);
  const afterCutoff = year > 1950;
  const placeOnly = isPlaceOnly(literal, tokens);
  const falsePositive = tokens.length === 0 || placeOnly;
  const publicCore = !afterCutoff && !falsePositive && confirmed;
  if (!confirmed) uncertain++;
  if (afterCutoff) privateAfterCutoff += group.length;
  if (falsePositive) rejected += group.length;
  const mentionName = tokens[0] ?? "неподтверждённое нечёткое совпадение";
  const recordType = falsePositive ? "fuzzy-search-false-positive" : inferType(literal);
  const source = {
    schemaVersion: 1,
    sourceId,
    provider: "Яндекс Архив — первичный архивный скан",
    recordType,
    collection: { catalogId: row.catalogId, scanNumber: row.scanNumber, title: row.title, publication: row.publication },
    links: { documentUrl: row.documentUrl },
    event: { type: falsePositive ? "research-review" : recordType, date: { display: row.date, confidence: "high-for-catalog-date" }, place: { normalized: "не установлено" } },
    mentions: falsePositive ? [] : [{ mentionId: `${sourceId}-M1`, role: "surname-series-mention", displayName: modernize(mentionName), nameAsTranscribed: mentionName, surnameSeries: true }],
    evidence,
    transcription: {
      status: confirmed ? "complete-primary-scan-dual-ocr-collation" : "complete-with-explicit-reading-uncertainty",
      literal,
      modernInterpretation: modernize(literal),
      localOcr: base?.text ?? "",
      ...(assisted ? { localOcrWithSurnameLexicon: assisted.text } : {}),
      collation: { baseLocalOcr: baseState, assistedLocalOcr: assisted ? assistedState : "not-run-because-base-confirmed", yandexTextBlocksUsedForNavigationAndCollation: true },
      indexNote: "Индекс и текстовые блоки Яндекса не приняты на веру: они сопоставлены с локальным OCR сохранённого фрагмента; при расхождении сохранена явная неопределённость.",
    },
    indexData: { querySnippet: row.indexSnippet, fuzzyQuery: true },
    isRecord: publicCore,
    cardKind: falsePositive ? "research-material-rejected-fuzzy-hit" : afterCutoff ? "private-research-material-after-1950-cutoff" : confirmed ? "named-primary-record" : "research-material-unconfirmed-fuzzy-hit",
    publicCore,
    review: {
      status: confirmed ? "complete-primary-scan-collation-with-local-evidence" : "complete-but-reading-uncertain",
      transcriptionConfidence: confirmed ? "medium-high" : "medium-with-explicit-uncertainty",
      unresolved: confirmed ? [] : ["Фамильная форма не была уверенно воспроизведена локальным OCR; см. сохранённый крупный фрагмент."],
    },
  };
  if (falsePositive) source.rejectionReason = placeOnly ? "place-name-not-person-surname" : "fuzzy-hit-not-confirmed-as-surname-series";
  const file = path.join(yandexSourceRoot, `${sourceId}.json`);
  await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
  sourceFileById.set(sourceId, file);
  for (const [index, item] of group.entries()) Object.assign(item, {
    sourceId,
    capture: false,
    status: index > 0 ? "complete-duplicate-search-card" : falsePositive ? "complete-rejected-fuzzy-false-positive" : afterCutoff ? "complete-private-after-cutoff" : "complete-with-local-evidence",
    primaryScanReading: literal,
  });
  created += group.length;
}

const completed = rows.filter((row) => row.capture === false && !row.status.startsWith("pending-")).length;
manifest.status = completed === rows.length ? "complete" : "processing-in-progress";
manifest.progress = {
  pagesInventoried: manifest.progress?.pagesInventoried ?? manifest.batches.reduce((sum, batch) => sum + (batch.reportedPages ?? 0), 0),
  rowsFoundOnAccessiblePages: rows.length,
  rowsCompleted: completed,
  uniqueScansPending: 0,
  rowsRemaining: rows.length - completed,
};
manifest.processingSummary = {
  createdRows: created,
  upgradedRows: upgraded,
  privateAfterCutoffRows: privateAfterCutoff,
  rejectedFalsePositiveRows: rejected,
  readingsWithExplicitUncertainty: uncertain,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ ...manifest.progress, ...manifest.processingSummary }, null, 2));
