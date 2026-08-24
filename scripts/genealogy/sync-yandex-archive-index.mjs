import { readdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const searchPath = path.join(
  root,
  "data/genealogy/searches/yandex-archive-anpilogov.json",
);
const sourcesRoot = path.join(root, "data/genealogy/sources");
const evidenceRoot = path.join(root, "public/archive/evidence/yandex");

function canonicalYandexUrl(value) {
  if (typeof value !== "string" || !value.includes("yandex.ru/archive/catalog/")) {
    return null;
  }

  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

async function jsonFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return jsonFiles(entryPath);
      return entry.isFile() && entry.name.endsWith(".json") ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

async function filesRecursive(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return filesRecursive(entryPath);
      return entry.isFile() ? [entryPath] : [];
    }),
  );
  return nested.flat();
}

function evidencePrefix(result) {
  const archive = /Астрахан/i.test(result.text)
    ? "GAAO"
    : /Оренбург/i.test(result.text)
      ? "OGAOO"
      : /ЦГА Москвы/i.test(result.text)
        ? "CGAM"
        : "OGAOO";
  const citation = result.text?.match(
    /фонд №(\d+), опись №(\d+), дело №(\d+), скан №(\d+)/i,
  );
  if (!citation) return `YA-${archive}-ORD-${result.ordinal}-`;
  if (!archive) return null;

  return `YA-${archive}-${citation.slice(1).join("-")}-`;
}

function collectYandexUrls(value, urls = new Set()) {
  if (typeof value === "string") {
    const canonical = canonicalYandexUrl(value);
    if (canonical) urls.add(canonical);
    return urls;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectYandexUrls(item, urls);
    return urls;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectYandexUrls(item, urls);
  }
  return urls;
}

const sourcesByUrl = new Map();
for (const file of await jsonFiles(sourcesRoot)) {
  let source;
  try {
    source = JSON.parse(await readFile(file, "utf8"));
  } catch {
    continue;
  }
  if (!source.sourceId) continue;

  const evidencePaths = [source.evidence?.path]
    .concat(source.evidence?.fragments?.map((fragment) => fragment.path) ?? [])
    .filter(Boolean);
  const summary = {
    sourceId: source.sourceId,
    file: path.relative(root, file),
    evidencePaths,
    reviewStatus: source.review?.status ?? null,
  };

  for (const url of collectYandexUrls(source)) {
    const current = sourcesByUrl.get(url) ?? [];
    current.push(summary);
    sourcesByUrl.set(url, current);
  }
}

const index = JSON.parse(await readFile(searchPath, "utf8"));
const localEvidence = await filesRecursive(evidenceRoot);
for (const result of index.results) {
  const linked = sourcesByUrl.get(result.canonicalUrl) ?? [];
  const prefix = evidencePrefix(result);
  const copiedEvidence = prefix
    ? localEvidence
        .filter((file) => path.basename(file).startsWith(prefix))
        .map((file) => path.relative(root, file))
    : [];
  if (!linked.length && !copiedEvidence.length) continue;

  // Rebuild generated links from the current tree instead of accumulating
  // paths from earlier runs. This matters when a source is merged or renamed
  // while another research task is updating the shared index.
  result.sourceIds = [
    ...new Set(linked.map((source) => source.sourceId)),
  ].sort();
  result.sourceFiles = [
    ...new Set(linked.map((source) => source.file)),
  ].sort();
  result.evidencePaths = [
    ...new Set([
      ...copiedEvidence,
      ...linked.flatMap((source) => source.evidencePaths),
    ]),
  ].sort();

  if (
    !linked.length &&
    ["pending", "already-present-with-local-copy"].includes(result.reviewStatus)
  ) {
    if (result.evidencePaths.length) {
      result.reviewStatus = "evidence-captured-review-pending";
    }
  } else if (
    linked.length &&
    (
    result.reviewStatus === "pending" ||
    result.reviewStatus === "evidence-captured-review-pending" ||
    result.reviewStatus === "already-present-with-local-copy" ||
    result.reviewStatus === "already-present-evidence-missing"
    )
  ) {
    const sourceReviewComplete = linked.some((source) =>
      source.reviewStatus?.startsWith("complete"),
    );
    result.reviewStatus = !result.evidencePaths.length
      ? "already-present-evidence-missing"
      : sourceReviewComplete
        ? "complete-with-local-copy"
        : "already-present-with-local-copy";
  }

  if (
    result.reviewStatus === "capture-retry-required" &&
    result.evidencePaths.length
  ) {
    result.reviewStatus = "evidence-captured-review-pending";
  }
}

index.stats = {
  completePositions: index.results.filter((result) =>
    result.reviewStatus.startsWith("complete"),
  ).length,
  linkedExistingPositions: index.results.filter((result) =>
    result.reviewStatus.startsWith("already-present"),
  ).length,
  pendingPositions: index.results.filter((result) =>
    [
      "pending",
      "capture-retry-required",
      "evidence-captured-review-pending",
    ].includes(result.reviewStatus),
  ).length,
  evidenceCapturedReviewPendingPositions: index.results.filter(
    (result) => result.reviewStatus === "evidence-captured-review-pending",
  ).length,
  captureRetryRequiredPositions: index.results.filter(
    (result) => result.reviewStatus === "capture-retry-required",
  ).length,
  evidenceMissingPositions: index.results.filter(
    (result) => result.reviewStatus === "already-present-evidence-missing",
  ).length,
};
index.status =
  index.stats.completePositions === index.reportedResultCount &&
  index.stats.pendingPositions === 0 &&
  index.stats.evidenceMissingPositions === 0
    ? "review-complete"
    : "inventory-complete-review-in-progress";
index.lastSyncedAt = new Date().toISOString().slice(0, 10);

const temporaryPath = `${searchPath}.tmp-${process.pid}`;
await writeFile(temporaryPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
await rename(temporaryPath, searchPath);

console.log(JSON.stringify(index.stats));
