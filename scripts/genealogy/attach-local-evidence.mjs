import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const args = new Map();
const cli = process.argv.slice(2).filter((argument) => argument !== "--");
for (let index = 0; index < cli.length; index += 2) {
  args.set(cli[index], cli[index + 1]);
}

const catalogId = args.get("--catalog");
const scans = new Set((args.get("--scans") ?? "").split(",").filter(Boolean).map(Number));
const capturedAt = args.get("--captured-at") ?? new Date().toISOString().slice(0, 10);
const captureType = "remote-viewer-canvas-document-bounds-crop-with-enlarged-fragments";

if (!catalogId || !scans.size || [...scans].some((scan) => !Number.isInteger(scan))) {
  console.error("Использование: node scripts/genealogy/attach-local-evidence.mjs --catalog ID --scans 12,34 --captured-at YYYY-MM-DD");
  process.exit(1);
}

const sourceRoot = path.join(root, "data/genealogy/sources");
const evidenceRoot = path.join(root, "data/genealogy/evidence-private/yandex", catalogId);

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? jsonFiles(entryPath) : entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const relative = (file) => path.relative(root, file).split(path.sep).join("/");

const appendCorrectionHistory = (review, note) => {
  if (Array.isArray(review.correctionHistory)) {
    if (!review.correctionHistory.includes(note)) review.correctionHistory.push(note);
  } else if (typeof review.correctionHistory === "string") {
    if (!review.correctionHistory.includes(note)) review.correctionHistory += `\n\n${note}`;
  } else {
    review.correctionHistory = [note];
  }
};

const sourcePairs = (source) => {
  const pairs = [];
  const add = (catalogIdValue, scanNumberValue) => {
    const scanNumber = Number(scanNumberValue);
    if (!catalogIdValue || !Number.isInteger(scanNumber)) return;
    const key = `${catalogIdValue}/${scanNumber}`;
    if (!pairs.some((pair) => pair.key === key)) {
      pairs.push({ key, catalogId: catalogIdValue, scanNumber });
    }
  };

  add(source.collection?.catalogId, source.collection?.scanNumber);
  for (const citation of source.collection?.citations ?? []) {
    add(citation.catalogId, citation.scanNumber);
  }

  const serialized = JSON.stringify({
    links: source.links,
    repositoryUrl: source.repository?.url,
    sourceUrl: source.evidence?.sourceUrl,
  });
  for (const match of serialized.matchAll(/https?:\/\/(?:www\.)?yandex\.ru\/archive\/catalog\/([0-9a-f-]{36})\/(\d+)/gi)) {
    add(match[1], match[2]);
  }

  return pairs;
};

const primarySourcePair = (source) => {
  const directCatalogId = source.collection?.catalogId;
  const directScanNumber = Number(source.collection?.scanNumber);
  if (directCatalogId && Number.isInteger(directScanNumber)) {
    return { catalogId: directCatalogId, scanNumber: directScanNumber };
  }

  const serialized = JSON.stringify({
    links: source.links,
    repositoryUrl: source.repository?.url,
    sourceUrl: source.evidence?.sourceUrl,
  });
  const match = serialized.match(/https?:\/\/(?:www\.)?yandex\.ru\/archive\/catalog\/([0-9a-f-]{36})\/(\d+)/i);
  return match ? { catalogId: match[1], scanNumber: Number(match[2]) } : null;
};

const buildEvidenceBundle = async (bundleCatalogId, scan, descriptionPrefix = "") => {
  const bundleRoot = path.join(root, "data/genealogy/evidence-private/yandex", bundleCatalogId);
  let bundleFiles;
  try {
    bundleFiles = await readdir(bundleRoot);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }

  const prefix = String(scan).padStart(4, "0");
  const fullFile = path.join(bundleRoot, `${prefix}-full-view.png`);
  const headerFile = path.join(bundleRoot, `${prefix}-header.png`);
  const standardizedDocumentTarget = new RegExp(
    `^${prefix}-target-entry-document-(?:left|center|right|upper|lower|upper-left|upper-right|lower-left|lower-right)(?:-\\d+)?\\.png$`,
  );
  const canonicalTargetNames = bundleFiles
    .filter((name) => name === `${prefix}-target-entry.png` || standardizedDocumentTarget.test(name))
    .sort();
  const targetNames = (canonicalTargetNames.length ? canonicalTargetNames : bundleFiles
    .filter((name) => name === `${prefix}-target-entry.png` || name.startsWith(`${prefix}-target-entry-`))
    .sort());
  if (!bundleFiles.includes(`${prefix}-full-view.png`) || !bundleFiles.includes(`${prefix}-header.png`) || !targetNames.length) {
    return null;
  }

  const fragments = [
    {
      kind: "header",
      path: relative(headerFile),
      sha256: await digest(headerFile),
      description: `${descriptionPrefix}Увеличенная область заголовка, года/раздела и названий граф источника.`,
    },
    ...(await Promise.all(targetNames.map(async (name, index) => {
      const file = path.join(bundleRoot, name);
      return {
        kind: targetNames.length === 1 ? "target-entry" : `target-entry-${index + 1}`,
        path: relative(file),
        sha256: await digest(file),
        description: targetNames.length === 1
          ? `${descriptionPrefix}Увеличенная целевая строка с именами, датами, родством, статусом и соседним контекстом.`
          : `${descriptionPrefix}Увеличенная целевая строка ${index + 1} с именами, датами, родством, статусом и соседним контекстом.`,
      };
    }))),
  ];

  return {
    catalogId: bundleCatalogId,
    scanNumber: scan,
    localBackup: relative(fullFile),
    path: relative(fullFile),
    capturedAt,
    sha256: await digest(fullFile),
    fragments,
  };
};

const sourceFiles = await jsonFiles(sourceRoot);
const sources = [];
for (const file of sourceFiles) {
  const value = JSON.parse(await readFile(file, "utf8"));
  for (const pair of sourcePairs(value)) {
    if (pair.catalogId === catalogId && scans.has(pair.scanNumber)) {
      sources.push({ file, value, scanNumber: pair.scanNumber });
    }
  }
}

for (const scan of scans) {
  const matches = sources.filter(({ scanNumber }) => scanNumber === scan);
  if (!matches.length) throw new Error(`Record для скана ${scan} каталога ${catalogId} не найден`);

  const primaryBundle = await buildEvidenceBundle(catalogId, scan);
  if (!primaryBundle) {
    throw new Error(`Для скана ${scan} нужны full-view, header и хотя бы один target-entry`);
  }

  for (const { file, value } of matches) {
    const primaryPair = primarySourcePair(value);
    const isPrimaryPair = primaryPair?.catalogId === catalogId && primaryPair.scanNumber === scan;
    if (!isPrimaryPair && value.evidence) {
      const parallelBundle = await buildEvidenceBundle(
        catalogId,
        scan,
        "Параллельный архивный экземпляр. ",
      );
      const parallelCopies = [...(value.evidence.parallelCopies ?? [])]
        .filter((copy) => copy.catalogId !== catalogId || Number(copy.scanNumber) !== scan);
      parallelCopies.push({
        ...parallelBundle,
        captureType,
        quality: {
          documentOnlyVisuallyConfirmed: false,
          headerVisuallyConfirmed: false,
          targetRowsVisuallyConfirmed: false,
        },
      });
      value.evidence.parallelCopies = parallelCopies;
      value.review ??= {};
      const note = `${capturedAt}: для параллельного экземпляра ${catalogId}/${scan} сохранены чистый полный лист, заголовок и целевые строки; SHA-256 проверены.`;
      appendCorrectionHistory(value.review, note);
      await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
      console.log(`${value.sourceId}: прикреплён параллельный комплект из ${parallelBundle.fragments.length + 1} изображений`);
      continue;
    }

    const parallelCopies = [];
    for (const citation of value.collection?.citations ?? []) {
      const citationScan = Number(citation.scanNumber);
      if (!citation.catalogId || !Number.isInteger(citationScan)) continue;
      if (citation.catalogId === catalogId && citationScan === scan) continue;
      const bundle = await buildEvidenceBundle(
        citation.catalogId,
        citationScan,
        "Параллельный архивный экземпляр. ",
      );
      if (bundle) parallelCopies.push({
        ...bundle,
        captureType,
        quality: {
          documentOnlyVisuallyConfirmed: false,
          headerVisuallyConfirmed: false,
          targetRowsVisuallyConfirmed: false,
        },
      });
    }

    value.evidence = {
      ...value.evidence,
      captureType,
      localBackup: primaryBundle.localBackup,
      path: primaryBundle.path,
      capturedAt: primaryBundle.capturedAt,
      sha256: primaryBundle.sha256,
      fragments: primaryBundle.fragments,
      ...(parallelCopies.length ? { parallelCopies } : {}),
      quality: {
        documentOnlyVisuallyConfirmed: false,
        headerVisuallyConfirmed: false,
        targetRowsVisuallyConfirmed: false,
      },
      publicDisplay: false,
      rightsNote: "Локальные копии полного разворота и увеличенных фрагментов сохранены для исследовательской проверки; публичная ссылка ведёт на архивный сервис.",
    };
    value.review ??= {};
    const note = `${capturedAt}: из слоя документа в полноэкранном просмотрщике сохранён лист, точно обрезанный по границам рукописи без элементов сайта и пустого холста; отдельно сохранены увеличенные заголовок и целевые строки; SHA-256 проверены.`;
    appendCorrectionHistory(value.review, note);
    await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
    const imageCount = primaryBundle.fragments.length + 1
      + parallelCopies.reduce((sum, copy) => sum + copy.fragments.length + 1, 0);
    console.log(`${value.sourceId}: прикреплено ${imageCount} изображений`);
  }
}
