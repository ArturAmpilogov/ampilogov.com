// Removes local raster evidence only when every referencing source is fully
// reviewed and the exact-size object is present in the latest Vercel Blob
// manifest. Dry-run is the default; pass --delete to perform the cleanup.
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, readFile, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const deleteFiles = process.argv.includes("--delete");
const sourceRoot = path.join(root, "data/genealogy/sources");
const leadRoot = path.join(root, "data/genealogy/leads");
const manifestPath = path.join(root, ".cache/evidence-blob-manifest.json");
const evidenceRoots = ["data/genealogy/evidence-private/", "public/archive/evidence/"];
const rasterExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".tif", ".tiff", ".webp"]);
const unsafeStatus = /uncertain|unresolved|partial|pending|gap|obstruction|limited|archive-lead|index-only|name-index|source-preserved|not-confirmed|not_confirmed/i;
const completeStatus = /complete|verified|approved|reviewed|manually/i;

function sourceIsComplete(source) {
  const transcription = source.transcription ?? {};
  const review = source.review ?? {};
  const transcriptionStatus = String(transcription.status ?? "");
  const reviewStatus = String(review.status ?? "");
  const captureStatus = String(source.evidence?.captureStatus ?? "");
  const confidence = String(review.transcriptionConfidence ?? "");
  const literal = typeof transcription.literal === "string" ? transcription.literal.trim() : "";
  if (!literal || !completeStatus.test(transcriptionStatus) || unsafeStatus.test(transcriptionStatus)) return false;
  if (reviewStatus && (!completeStatus.test(reviewStatus) || unsafeStatus.test(reviewStatus))) return false;
  if (captureStatus && /pending|incomplete|failed|missing/i.test(captureStatus)) return false;
  if (/\blow\b/i.test(confidence)) return false;
  if (Array.isArray(review.unresolved) && review.unresolved.length) return false;
  return true;
}

function collectEvidence(value, references, sourceFile, eligible) {
  if (!value || typeof value !== "object") return;
  if (!Array.isArray(value) && typeof value.path === "string") {
    const pathname = path.posix.normalize(value.path);
    if (evidenceRoots.some((prefix) => pathname.startsWith(prefix))) {
      const item = references.get(pathname) ?? [];
      item.push({ sourceFile, eligible, sha256: typeof value.sha256 === "string" ? value.sha256 : null });
      references.set(pathname, item);
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) collectEvidence(item, references, sourceFile, eligible);
  } else {
    for (const child of Object.values(value)) collectEvidence(child, references, sourceFile, eligible);
  }
}

async function sha256(filename) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest("hex");
}

function formatBytes(bytes) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

async function jsonFiles(directory) {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const nested = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(filename);
    return entry.isFile() && entry.name.endsWith(".json") ? [filename] : [];
  }));
  return nested.flat();
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const manifestAge = Date.now() - Date.parse(manifest.updatedAt);
if (!Number.isFinite(manifestAge) || manifestAge > 24 * 60 * 60 * 1000) {
  throw new Error("Vercel Blob manifest is older than 24 hours; run the upload verifier first.");
}

const references = new Map();
const sourceFiles = [...await jsonFiles(sourceRoot), ...await jsonFiles(leadRoot)].sort();
let completeSources = 0;
for (const filename of sourceFiles) {
  const sourceFile = path.relative(root, filename);
  const source = JSON.parse(await readFile(filename, "utf8"));
  const eligible = sourceIsComplete(source);
  if (eligible) completeSources += 1;
  collectEvidence(source.evidence, references, sourceFile, eligible);
}

const candidates = [];
const skipped = { incompleteReference: 0, missingHash: 0, conflictingHashes: 0, hashMismatch: 0, missingRemote: 0, missingLocal: 0 };
for (const [pathname, refs] of [...references].sort(([left], [right]) => left.localeCompare(right))) {
  if (!rasterExtensions.has(path.posix.extname(pathname).toLowerCase())) continue;
  if (refs.some((ref) => !ref.eligible)) { skipped.incompleteReference += 1; continue; }
  const hashes = new Set(refs.map((ref) => ref.sha256).filter(Boolean));
  if (!hashes.size) { skipped.missingHash += 1; continue; }
  if (hashes.size !== 1) { skipped.conflictingHashes += 1; continue; }
  const filename = path.join(root, pathname);
  let details;
  try { details = await stat(filename); } catch (error) {
    if (error.code === "ENOENT") { skipped.missingLocal += 1; continue; }
    throw error;
  }
  if (!details.isFile()) continue;
  if (manifest.sizes?.[pathname] !== details.size) { skipped.missingRemote += 1; continue; }
  if (await sha256(filename) !== [...hashes][0]) { skipped.hashMismatch += 1; continue; }
  candidates.push({ pathname, size: details.size });
}

const totalBytes = candidates.reduce((sum, item) => sum + item.size, 0);
console.log(`Fully reviewed sources: ${completeSources}/${sourceFiles.length}.`);
console.log(`${deleteFiles ? "Deleting" : "Would delete"}: ${candidates.length} raster files (${formatBytes(totalBytes)}).`);
console.log(`Protected/skipped: ${JSON.stringify(skipped)}.`);
if (deleteFiles) {
  for (const item of candidates) await rm(path.join(root, item.pathname));
  console.log(`Deleted ${candidates.length} files; recoverable from Vercel Blob by their unchanged repository paths.`);
}
