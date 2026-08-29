import { createHash } from "node:crypto";
import { access, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceRoot = path.join(root, "data/genealogy/sources");
const outputPath = path.join(root, "data/genealogy/indexes/yandex-evidence-quality.json");
const writeReport = process.argv.includes("--write");
const requiredCaptureType = "remote-viewer-document-only-capture-with-enlarged-fragments";

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const fileExists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

const dimensions = (buffer) => {
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.length >= 24 && buffer.subarray(0, 8).toString("hex") === pngSignature) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return null;
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
  const catalogId = source?.collection?.catalogId ?? match?.[1];
  const scanNumber = Number(source?.collection?.scanNumber ?? match?.[2]);
  return catalogId && Number.isInteger(scanNumber) ? { catalogId, scanNumber } : null;
};

const evidenceForPair = (source, catalogId, scanNumber) => {
  const primary = sourcePair(source);
  if (primary?.catalogId === catalogId && primary.scanNumber === scanNumber) return source.evidence;
  const parallel = source.evidence?.parallelCopies?.find((copy) =>
    copy.catalogId === catalogId && Number(copy.scanNumber) === scanNumber);
  if (parallel) return parallel;
  for (const copy of source.sourceCopies ?? []) {
    const found = evidenceForPair(copy, catalogId, scanNumber);
    if (found) return found;
  }
  return null;
};

const inspectAsset = async (assetPath, expectedHash, minimum) => {
  if (typeof assetPath !== "string") return { path: null, issues: ["path-missing"] };
  const absolutePath = path.resolve(root, assetPath);
  const relation = path.relative(root, absolutePath);
  if (relation.startsWith("..") || path.isAbsolute(relation)) {
    return { path: assetPath, issues: ["path-outside-project"] };
  }
  if (!(await fileExists(absolutePath))) return { path: assetPath, issues: ["file-missing"] };

  const buffer = await readFile(absolutePath);
  const size = dimensions(buffer);
  const actualHash = createHash("sha256").update(buffer).digest("hex");
  const issues = [];
  if (!size) issues.push("dimensions-unreadable");
  if (size && (size.width < minimum.width || size.height < minimum.height)) {
    issues.push(`too-small-${size.width}x${size.height}`);
  }
  if (!expectedHash) issues.push("sha256-missing");
  else if (expectedHash !== actualHash) issues.push("sha256-mismatch");
  return {
    path: assetPath,
    width: size?.width ?? null,
    height: size?.height ?? null,
    sha256: actualHash,
    issues,
  };
};

const files = await jsonFiles(sourceRoot);
const groups = new Map();
for (const file of files) {
  const source = JSON.parse(await readFile(file, "utf8"));
  const serialized = JSON.stringify(source);
  const pairs = new Map();
  for (const match of serialized.matchAll(/https?:\/\/(?:www\.)?yandex\.ru\/archive\/catalog\/([0-9a-f-]{36})\/(\d+)/ig)) {
    pairs.set(`${match[1]}/${match[2]}`, { catalogId: match[1], scanNumber: Number(match[2]) });
  }
  const primary = sourcePair(source);
  if (primary) pairs.set(`${primary.catalogId}/${primary.scanNumber}`, primary);
  for (const { catalogId, scanNumber } of pairs.values()) {
    const key = `${catalogId}/${scanNumber}`;
    const group = groups.get(key) ?? { catalogId, scanNumber, sources: [] };
    group.sources.push({
      file: path.relative(root, file),
      source,
      evidence: evidenceForPair(source, catalogId, scanNumber),
    });
    groups.set(key, group);
  }
}

const pages = [];
for (const group of [...groups.values()].sort((left, right) =>
  left.catalogId.localeCompare(right.catalogId) || left.scanNumber - right.scanNumber)) {
  const issues = new Set();
  const sourceIds = group.sources.map(({ source }) => source.sourceId).filter(Boolean).sort();
  const evidence = group.sources.find((entry) => entry.evidence)?.evidence;
  if (!evidence) issues.add("evidence-missing");
  if (evidence?.captureType !== requiredCaptureType) issues.add("document-only-capture-not-confirmed");
  if (evidence?.quality?.documentOnlyVisuallyConfirmed !== true) {
    issues.add("document-only-visually-unconfirmed");
  }
  if (evidence?.quality?.headerVisuallyConfirmed !== true) {
    issues.add("header-visually-unconfirmed");
  }
  if (evidence?.quality?.targetRowsVisuallyConfirmed !== true) {
    issues.add("target-rows-visually-unconfirmed");
  }

  const header = evidence?.fragments?.find((fragment) => fragment.kind === "header");
  const targets = evidence?.fragments?.filter((fragment) => /^target-entry/.test(fragment.kind ?? "")) ?? [];
  if (!header) issues.add("header-fragment-missing");
  if (!targets.length) issues.add("target-fragment-missing");

  const fullAsset = await inspectAsset(evidence?.path ?? evidence?.localBackup, evidence?.sha256, {
    width: 600,
    height: 600,
  });
  const headerAsset = await inspectAsset(header?.path, header?.sha256, { width: 700, height: 180 });
  const targetAssets = await Promise.all(targets.map((target) =>
    inspectAsset(target.path, target.sha256, { width: 600, height: 150 })));
  for (const asset of [fullAsset, headerAsset, ...targetAssets]) {
    for (const issue of asset.issues) issues.add(issue);
  }

  const canonicalTarget = targetAssets.some((asset) => {
    const name = path.basename(asset.path ?? "");
    const prefix = String(group.scanNumber).padStart(4, "0");
    return name === `${prefix}-target-entry.png` || name.startsWith(`${prefix}-target-entry-document-`);
  });
  if (!canonicalTarget) issues.add("canonical-target-fragment-missing");

  pages.push({
    catalogId: group.catalogId,
    scanNumber: group.scanNumber,
    url: `https://yandex.ru/archive/catalog/${group.catalogId}/${group.scanNumber}`,
    sourceIds,
    status: issues.size ? "needs-reshoot" : "verified-document-only",
    issues: [...issues].sort(),
    assets: { full: fullAsset, header: headerAsset, targets: targetAssets },
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  requiredCaptureType,
  totals: {
    pages: pages.length,
    verifiedDocumentOnly: pages.filter((page) => page.status === "verified-document-only").length,
    needsReshoot: pages.filter((page) => page.status === "needs-reshoot").length,
  },
  pages,
};

if (writeReport) await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ ...report.totals, report: writeReport ? path.relative(root, outputPath) : null }, null, 2));
if (report.totals.needsReshoot) process.exitCode = 1;
