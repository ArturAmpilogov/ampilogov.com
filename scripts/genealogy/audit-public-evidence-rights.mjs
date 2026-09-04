import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), "data/genealogy/sources");
const clearStatuses = new Set(["public-domain", "open-license", "permission"]);

function jsonFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  });
}

function sourceUrl(source) {
  const links = source.links ?? {};
  const keys = [
    "imageArk", "documentUrl", "originalScan", "archiveImageViewer", "officialCard",
    "officialNameIndexScan", "officialCatalog", "recordArk", "publishedDocument",
    "publicationPdf", "publishedScan", "fullScan", "scan",
  ];
  for (const key of keys) {
    if (typeof links[key] === "string" && /^https?:\/\//.test(links[key])) return links[key];
  }
  return source.evidence?.sourceUrl ?? source.collection?.sourceUrl ??
    source.collection?.sourceUrls?.find((value) => /^https?:\/\//.test(value)) ??
    source.collection?.digitalProjectUrl ?? source.collection?.digitalCopyUrl ?? Object.values(links).find(
    (value) => typeof value === "string" && /^https?:\/\//.test(value),
  ) ?? source.repository?.url ?? null;
}

const rows = jsonFiles(root).map((file) => ({
  file: path.relative(process.cwd(), file),
  source: JSON.parse(readFileSync(file, "utf8")),
}));

const publicRows = rows.filter(({ source }) => source.evidence?.publicDisplay === true);
const errors = [];
const warnings = [];
let cleared = 0;

for (const { file, source } of publicRows) {
  const evidence = source.evidence;
  const provider = source.provider ?? "";
  const note = evidence.rightsNote?.trim() ?? "";
  const status = evidence.licenseStatus ?? "unknown";
  const hasExplicitBasis = clearStatuses.has(status) && /^https?:\/\//i.test(evidence.licenseUrl?.trim() ?? "");

  if (!sourceUrl(source)) errors.push(`${file}: нет ссылки на исходный источник`);
  if (!evidence.path?.startsWith("public/") && !evidence.fragments?.some((item) => item.path?.startsWith("public/"))) {
    errors.push(`${file}: публичный показ включён, но публичного файла нет`);
  }
  if (!note) errors.push(`${file}: отсутствует rightsNote`);
  if (clearStatuses.has(status) && !/^https?:\/\//i.test(evidence.licenseUrl?.trim() ?? "")) {
    warnings.push(`${file}: лицензия или разрешение заявлены без проверяемой ссылки`);
  }
  if (/familysearch/i.test(provider)) errors.push(`${file}: снимок FamilySearch нельзя публиковать без письменного разрешения хранителя`);
  if (/яндекс|yandex/i.test(provider)) errors.push(`${file}: условия Яндекс Архива запрещают внешнее воспроизведение материалов сервиса`);
  if (!hasExplicitBasis) {
    warnings.push(`${file}: открытый доступ к оригиналу не подтверждает право повторной публикации`);
  } else {
    cleared += 1;
  }
}

console.log(`Проверено ${rows.length} источников.`);
console.log(`Публичный показ запрошен у ${publicRows.length}; явно подтверждённое основание — у ${cleared}.`);
console.log(`Ошибки: ${errors.length}. Требуют проверки прав: ${warnings.length}.`);
for (const message of errors) console.log(`ERROR ${message}`);
for (const message of warnings) console.log(`WARN  ${message}`);

if (errors.length) process.exitCode = 1;
