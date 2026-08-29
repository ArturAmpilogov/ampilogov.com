import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "data/genealogy/sources");
const args = new Map();
const cli = process.argv.slice(2).filter((argument) => argument !== "--");
for (let index = 0; index < cli.length; index += 2) args.set(cli[index], cli[index + 1]);

const catalogId = args.get("--catalog");
const scans = new Set((args.get("--scans") ?? "").split(",").filter(Boolean).map(Number));
const confirmedAt = args.get("--confirmed-at") ?? new Date().toISOString().slice(0, 10);

if (!catalogId || !scans.size || [...scans].some((scan) => !Number.isInteger(scan))) {
  console.error("Использование: node scripts/genealogy/confirm-yandex-evidence.mjs --catalog ID --scans 12,34 --confirmed-at YYYY-MM-DD");
  process.exit(1);
}

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? jsonFiles(entryPath) : entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const sourcePair = (source) => {
  const serialized = JSON.stringify({
    collection: {
      catalogId: source?.collection?.catalogId,
      scanNumber: source?.collection?.scanNumber,
    },
    links: source?.links,
    sourceUrl: source?.evidence?.sourceUrl,
  });
  const match = serialized.match(/https?:\/\/(?:www\.)?yandex\.ru\/archive\/catalog\/([0-9a-f-]{36})\/(\d+)/i);
  const foundCatalogId = source?.collection?.catalogId ?? match?.[1];
  const scanNumber = Number(source?.collection?.scanNumber ?? match?.[2]);
  return foundCatalogId && Number.isInteger(scanNumber) ? { catalogId: foundCatalogId, scanNumber } : null;
};

const requiredFilesExist = async (evidence) => {
  const paths = [
    evidence?.path ?? evidence?.localBackup,
    evidence?.fragments?.find((fragment) => fragment.kind === "header")?.path,
    ...(evidence?.fragments?.filter((fragment) => /^target-entry/.test(fragment.kind ?? "")) ?? [])
      .map((fragment) => fragment.path),
  ];
  if (paths.length < 3 || paths.some((item) => typeof item !== "string")) return false;
  return (await Promise.all(paths.map(async (item) => {
    try {
      await access(path.resolve(root, item));
      return true;
    } catch {
      return false;
    }
  }))).every(Boolean);
};

const confirmation = {
  documentOnlyVisuallyConfirmed: true,
  headerVisuallyConfirmed: true,
  targetRowsVisuallyConfirmed: true,
  confirmedAt,
  method: "manual-comparison-with-source-transcription-and-document-context",
};

const files = await jsonFiles(sourceRoot);
const confirmed = new Map([...scans].map((scan) => [scan, new Set()]));

for (const file of files) {
  const source = JSON.parse(await readFile(file, "utf8"));
  let changed = false;
  const pair = sourcePair(source);
  if (pair?.catalogId === catalogId && scans.has(pair.scanNumber)) {
    if (!(await requiredFilesExist(source.evidence))) {
      throw new Error(`${source.sourceId}: отсутствует полный лист, заголовок или целевой фрагмент`);
    }
    source.evidence.quality = confirmation;
    confirmed.get(pair.scanNumber).add(source.sourceId);
    changed = true;
  }

  for (const copy of source.evidence?.parallelCopies ?? []) {
    const scanNumber = Number(copy.scanNumber);
    if (copy.catalogId !== catalogId || !scans.has(scanNumber)) continue;
    if (!(await requiredFilesExist(copy))) {
      throw new Error(`${source.sourceId}: неполный параллельный комплект ${catalogId}/${scanNumber}`);
    }
    copy.quality = confirmation;
    confirmed.get(scanNumber).add(source.sourceId);
    changed = true;
  }

  if (changed) await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
}

for (const [scan, sourceIds] of confirmed) {
  if (!sourceIds.size) throw new Error(`Record для ${catalogId}/${scan} не найден`);
  console.log(`${catalogId}/${scan}: визуально подтверждено; Records: ${[...sourceIds].sort().join(", ")}`);
}
