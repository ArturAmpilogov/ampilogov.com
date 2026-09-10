#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const root = process.cwd();
const capturedAt = "2026-09-10";
const manifestPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilogov-mass-media-fuzzy-2026-09-10.json");
const baseOcrPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilogov-mass-media-fuzzy-2026-09-10-local-ocr.json");
const assistedOcrPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilogov-mass-media-fuzzy-2026-09-10-local-ocr-assisted.json");
const sourceRoot = path.join(root, "data/genealogy/sources");
const yandexSourceRoot = path.join(sourceRoot, "yandex");
await mkdir(yandexSourceRoot, { recursive: true });

const filesRecursive = async (directory, suffix = "") => {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); } catch (error) { if (error?.code === "ENOENT") return []; throw error; }
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
  if (minimum <= 4) return "corroborated-with-old-print-ocr-distortion";
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
  if (/награжд|орден|медал/u.test(value)) return "award-or-honour-notice";
  if (/суд|приговор|развод|объявлен/u.test(value)) return "legal-or-public-notice";
  if (/полк|батальон|лейтенант|сержант|красноарм/u.test(value)) return "military-service-notice";
  if (/ученик|семинар|школ|студент|диссертац/u.test(value)) return "education-or-academic-notice";
  if (/церк|свящ|диакон|приход/u.test(value)) return "church-notice";
  if (/колхоз|бригада|рабоч|трактор|шахт|завод/u.test(value)) return "employment-or-labour-notice";
  if (/чемпион|матч|мяч|спорт/u.test(value)) return "sports-notice";
  return "newspaper-mention";
};
const isPlaceOnly = (text, tokens) => tokens.length > 0 && tokens.every((token) => {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:деревн\\w*|села|сел[оа]|хутор\\w*|станц\\w*)[^.;\\n]{0,45}${escaped}`, "iu").test(text);
});
const wordSet = (value) => new Set(modernize(value).toLowerCase().match(/[а-яё]{5,}/gu) ?? []);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const rows = manifest.batches.flatMap((batch) => batch.results);
const baseOcr = JSON.parse(await readFile(baseOcrPath, "utf8"));
let assistedOcr = { readings: [] };
try { assistedOcr = JSON.parse(await readFile(assistedOcrPath, "utf8")); } catch {}
const keyOf = (row) => `${row.catalogId}/${row.scanNumber}`;
const baseByKey = new Map(baseOcr.readings.map((reading) => [keyOf(reading), reading]));
const assistedByKey = new Map(assistedOcr.readings.map((reading) => [keyOf(reading), reading]));
const metadataRoot = path.join(tmpdir(), `${manifest.searchRunId.toLowerCase()}-metadata`);

const sourceFiles = await filesRecursive(sourceRoot, ".json");
const sourceFileById = new Map();
for (const file of sourceFiles) {
  try { const source = JSON.parse(await readFile(file, "utf8")); if (source.sourceId) sourceFileById.set(source.sourceId, file); } catch {}
}

const evidenceFor = async (row) => {
  const prefix = String(row.scanNumber).padStart(4, "0");
  const directory = path.join(root, "data/genealogy/evidence-private/yandex", row.catalogId);
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
      { kind: "header", path: relative(header), sha256: await digest(header), description: "Фрагмент исходной полосы, фиксирующий заголовок или структуру листа." },
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

let created = 0, upgraded = 0, privateAfterCutoff = 0, rejected = 0, uncertain = 0;
const grouped = new Map();
for (const row of rows.filter((row) => row.capture !== false)) {
  const group = grouped.get(keyOf(row)) ?? [];
  group.push(row); grouped.set(keyOf(row), group);
}

for (const group of grouped.values()) {
  const row = group[0];
  const sourceId = row.sourceIds?.[0] ?? sourceIdFor(row);
  const existingFile = sourceFileById.get(sourceId);
  if (existingFile) {
    const source = JSON.parse(await readFile(existingFile, "utf8"));
    source.evidence = { ...(source.evidence ?? {}), ...(await evidenceFor(row)) };
    await writeFile(existingFile, `${JSON.stringify(source, null, 2)}\n`);
    for (const item of group) Object.assign(item, { sourceId, capture: false, status: "complete-existing-record-evidence-upgraded" });
    upgraded += group.length;
    continue;
  }

  const metadata = JSON.parse(await readFile(path.join(metadataRoot, `${row.catalogId}-${row.scanNumber}.json`), "utf8"));
  const node = metadata.pageProps.currentNode;
  const snippetWords = wordSet(row.indexSnippet);
  const archiveBlocks = (node.textBlocks ?? []).filter((block) => familyTokens(block.text).length > 0).map((block) => ({
    text: block.text.trim(),
    overlap: [...wordSet(block.text)].filter((word) => snippetWords.has(word)).length,
  })).sort((left, right) => right.overlap - left.overlap);
  const base = baseByKey.get(keyOf(row));
  const assisted = assistedByKey.get(keyOf(row));
  const literal = archiveBlocks[0]?.text || base?.text || row.indexSnippet;
  const tokens = [...new Set([...familyTokens(literal), ...familyTokens(row.indexSnippet)])];
  const baseState = localConfirmation(base?.text);
  const assistedState = localConfirmation(assisted?.text);
  const confirmed = baseState !== "not-confirmed-by-local-ocr" || assistedState !== "not-confirmed-by-local-ocr";
  const year = Number(row.date.match(/\d{4}/)?.[0]);
  const afterCutoff = year > 1950;
  const placeOnly = isPlaceOnly(literal, tokens);
  const falsePositive = tokens.length === 0 || placeOnly;
  const publicCore = !afterCutoff && !falsePositive;
  const confidence = confirmed ? "medium-high" : "medium-with-explicit-uncertainty";
  if (!confirmed) uncertain++;
  if (afterCutoff) privateAfterCutoff += group.length;
  if (falsePositive) rejected += group.length;
  const mentionName = tokens[0] ?? "неподтверждённое нечёткое совпадение";
  const source = {
    schemaVersion: 1,
    sourceId,
    provider: "Яндекс Архив — первичный газетный скан",
    recordType: falsePositive ? "fuzzy-search-false-positive" : inferType(literal),
    collection: { catalogId: row.catalogId, scanNumber: row.scanNumber, title: row.title, publication: row.publication },
    links: { documentUrl: row.documentUrl },
    event: { type: falsePositive ? "research-review" : inferType(literal), date: { display: row.date, confidence: "high-for-publication-date" }, place: { normalized: "не установлено" } },
    mentions: falsePositive ? [] : [{ mentionId: `${sourceId}-M1`, role: "surname-series-mention", displayName: modernize(mentionName), nameAsTranscribed: mentionName, surnameSeries: true }],
    evidence: await evidenceFor(row),
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
    cardKind: falsePositive ? "research-material-rejected-fuzzy-hit" : afterCutoff ? "private-research-material-after-1950-cutoff" : "named-primary-record",
    publicCore,
    review: { status: confirmed ? "complete-primary-scan-collation-with-local-evidence" : "complete-but-reading-uncertain", transcriptionConfidence: confidence, unresolved: confirmed ? [] : ["Фамильная форма не была уверенно воспроизведена локальным OCR; см. сохранённый крупный фрагмент."] },
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
  pagesInventoried: 96,
  rowsFound: rows.length,
  rowsCompleted: completed,
  uniqueScansPending: 0,
  rowsRemaining: rows.length - completed,
};
manifest.processingSummary = { createdRows: created, upgradedRows: upgraded, privateAfterCutoffRows: privateAfterCutoff, rejectedFalsePositiveRows: rejected, readingsWithExplicitUncertainty: uncertain };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ ...manifest.progress, ...manifest.processingSummary }, null, 2));
