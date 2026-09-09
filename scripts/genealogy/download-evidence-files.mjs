// Downloads the archive scans from the private Vercel Blob store to disk.
// Use it to restore the git-ignored evidence folders on another computer.
//
//   pnpm genealogy:evidence:download                # fetch missing/changed files
//   pnpm genealogy:evidence:download -- --dry-run   # only list what would be fetched
//   pnpm genealogy:evidence:download -- --verify    # exit 1 if local disk is behind
//   pnpm genealogy:evidence:download -- --missing-only  # never overwrite a local file
//   pnpm genealogy:evidence:download -- --prefix=data/genealogy/evidence-private/yandex/
//   pnpm genealogy:evidence:download -- --concurrency=4
//
// Mirror of upload-evidence-files.mjs: blob pathnames are repo-relative paths,
// so every blob is written to the same path under the repo root. A file is
// downloaded when it is missing locally or its size differs from the store.
// Needs BLOB_READ_WRITE_TOKEN in .env.local (see the upload script).
import { createWriteStream } from "node:fs";
import { mkdir, readdir, rename, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { get, list } from "@vercel/blob";

const root = process.cwd();
const EVIDENCE_ROOTS = ["public/archive/evidence", "data/genealogy/evidence-private"];
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);
const MAX_ATTEMPTS = 4;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verifyOnly = args.includes("--verify");
const missingOnly = args.includes("--missing-only");
const optionValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const concurrency = Math.max(1, Number(optionValue("--concurrency") ?? 6));
const prefixFilter = optionValue("--prefix") ?? "";

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
  console.error("Missing BLOB_READ_WRITE_TOKEN (or BLOB_STORE_ID with a Vercel OIDC token). Add it to .env.local.");
  process.exit(2);
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

// Blob pathnames are trusted repo-relative keys, but the store is shared state:
// refuse anything that would resolve outside the evidence roots.
function localPathFor(pathname) {
  const normalized = path.posix.normalize(pathname);
  const inRoot = EVIDENCE_ROOTS.some((evidenceRoot) => normalized.startsWith(`${evidenceRoot}/`));
  if (!inRoot || normalized.includes("\\")) throw new Error(`refusing blob pathname outside evidence roots: ${pathname}`);
  return path.join(root, normalized);
}

async function localFiles(directory) {
  let entries;
  try {
    entries = await readdir(path.join(root, directory), { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const nested = await Promise.all(entries.map(async (entry) => {
    const pathname = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return localFiles(pathname);
    if (!entry.isFile() || IGNORED_FILES.has(entry.name)) return [];
    const { size } = await stat(path.join(root, pathname));
    return [{ pathname, size }];
  }));
  return nested.flat();
}

async function remoteFiles(prefix) {
  const files = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) files.push({ pathname: blob.pathname, size: blob.size });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return files;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function download(file) {
  const target = localPathFor(file.pathname);
  const partial = `${target}.part`;
  await mkdir(path.dirname(target), { recursive: true });
  for (let attempt = 1; ; attempt += 1) {
    try {
      const result = await get(file.pathname, { access: "private" });
      if (!result || result.statusCode !== 200) throw new Error(`blob not readable (status ${result?.statusCode ?? "missing"})`);
      await pipeline(Readable.fromWeb(result.stream), createWriteStream(partial));
      const { size } = await stat(partial);
      if (size !== file.size) throw new Error(`size mismatch: got ${size}, expected ${file.size}`);
      await rename(partial, target);
      return;
    } catch (error) {
      await rm(partial, { force: true });
      if (attempt >= MAX_ATTEMPTS) throw error;
      const delay = 1_000 * 2 ** attempt;
      console.warn(`  retry ${attempt}/${MAX_ATTEMPTS - 1} in ${delay / 1000}s: ${file.pathname} (${error.message})`);
      await sleep(delay);
    }
  }
}

async function runPool(items, worker) {
  const queue = [...items];
  const failures = [];
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        await worker(item);
      } catch (error) {
        failures.push({ item, error });
        console.error(`  failed: ${item.pathname} (${error.message})`);
      }
      done += 1;
      if (done % 250 === 0 || done === items.length) console.log(`  ${done}/${items.length}`);
    }
  }));
  return failures;
}

const remote = [];
for (const evidenceRoot of EVIDENCE_ROOTS) {
  const rootPrefix = `${evidenceRoot}/`;
  if (prefixFilter && !prefixFilter.startsWith(rootPrefix) && !rootPrefix.startsWith(prefixFilter)) continue;
  const prefix = prefixFilter.length > rootPrefix.length ? prefixFilter : rootPrefix;
  remote.push(...await remoteFiles(prefix));
}
remote.sort((left, right) => left.pathname.localeCompare(right.pathname));

const local = new Map();
for (const file of (await Promise.all(EVIDENCE_ROOTS.map(localFiles))).flat()) {
  if (file.pathname.startsWith(prefixFilter)) local.set(file.pathname, file.size);
}

const remotePathnames = new Set(remote.map((file) => file.pathname));
const outdated = remote.filter((file) => local.get(file.pathname) !== file.size);
const changed = outdated.filter((file) => local.has(file.pathname));
// With --missing-only a local file that differs from the store is kept as is.
const pending = missingOnly ? outdated.filter((file) => !local.has(file.pathname)) : outdated;
const localOnly = [...local.keys()].filter((pathname) => !remotePathnames.has(pathname));
const pendingBytes = pending.reduce((total, file) => total + file.size, 0);

console.log(`In store: ${remote.length} (${formatBytes(remote.reduce((total, file) => total + file.size, 0))}); local files: ${local.size}.`);
console.log(`To download: ${pending.length} (${formatBytes(pendingBytes)}), of which changed: ${missingOnly ? 0 : changed.length}; local but not in store: ${localOnly.length}.`);
if (missingOnly && changed.length) console.log(`Kept ${changed.length} local file(s) whose size differs from the store (--missing-only).`);
if (localOnly.length) {
  console.log("Local-only files are left in place (run `pnpm genealogy:evidence:upload` to push them):");
  for (const pathname of localOnly.slice(0, 20)) console.log(`  ${pathname}`);
  if (localOnly.length > 20) console.log(`  … and ${localOnly.length - 20} more`);
}

if (verifyOnly) {
  for (const file of pending.slice(0, 50)) console.log(`  missing/changed: ${file.pathname}`);
  process.exitCode = pending.length ? 1 : 0;
} else if (dryRun) {
  for (const file of pending) console.log(`  would download: ${file.pathname} (${formatBytes(file.size)})`);
} else if (!pending.length) {
  console.log("Local copy is up to date.");
} else {
  console.log(`Downloading with concurrency ${concurrency}…`);
  const startedAt = Date.now();
  const failures = await runPool(pending, download);
  const seconds = ((Date.now() - startedAt) / 1000).toFixed(0);
  console.log(`Downloaded ${pending.length - failures.length}/${pending.length} files in ${seconds}s.`);
  if (failures.length) {
    console.error(`${failures.length} download(s) failed; rerun the command to retry them.`);
    process.exitCode = 1;
  }
}
