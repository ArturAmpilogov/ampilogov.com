// Uploads the archive scans to the private Vercel Blob store.
//
//   pnpm genealogy:evidence:upload                # upload new/changed files
//   pnpm genealogy:evidence:upload -- --dry-run   # only list what would change
//   pnpm genealogy:evidence:upload -- --verify    # exit 1 if the store is behind
//   pnpm genealogy:evidence:upload -- --refresh   # re-read the store, ignore the cached manifest
//   pnpm genealogy:evidence:upload -- --prefix=data/genealogy/evidence-private/yandex/
//   pnpm genealogy:evidence:upload -- --concurrency=4
//
// Blob pathnames are the repo-relative paths (`public/archive/evidence/...`,
// `data/genealogy/evidence-private/...`), the same strings the source records
// keep in `evidence.path`. A file is re-uploaded when it is missing from the
// store or its size differs. Needs BLOB_READ_WRITE_TOKEN (from the store's
// settings) in .env.local; `--env-file-if-exists` in the npm script loads it.
//
// This command only ever writes to the store. It reads blob *metadata*
// (pathname + size) to decide what is missing, never blob contents — restoring
// files to disk is download-evidence-files.mjs.
//
// Startup cost: the store holds ~38k blobs and `list` pages 1000 at a time
// (~1.2s per page), so a naive full walk costs ~50s before the first upload.
// Two things avoid that:
//   * the manifest cache (`.cache/evidence-blob-manifest.json`) remembers what
//     the store held after the previous run, so repeat runs list nothing;
//   * when the store must really be read, folders are discovered in `folded`
//     mode and the pathname space is split into shards listed in parallel.
// Use --refresh (or --verify, which always re-reads) if the store was changed
// from elsewhere, e.g. blobs deleted in the Vercel dashboard.
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

const root = process.cwd();
const EVIDENCE_ROOTS = ["public/archive/evidence", "data/genealogy/evidence-private"];
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);
const MULTIPART_THRESHOLD = 20 * 1024 * 1024;
const MAX_ATTEMPTS = 4;
const MANIFEST_PATH = path.join(root, ".cache", "evidence-blob-manifest.json");
const MANIFEST_VERSION = 1;
// One list request costs ~1.2s regardless of size, so favour few wide shards.
const LIST_CONCURRENCY = 16;
const SHARD_TARGET_FOLDERS = 250;
const MAX_FOLD_DEPTH = 3;

// Mirrored in src/lib/evidence-store.ts (keep both in sync).
const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".djvu": "image/vnd.djvu",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".md": "text/markdown; charset=utf-8",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const verifyOnly = args.includes("--verify");
const optionValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const concurrency = Math.max(1, Number(optionValue("--concurrency") ?? 6));
const prefixFilter = optionValue("--prefix") ?? "";
// --verify audits the store itself, so it must never trust the cached manifest.
const useManifestCache = !args.includes("--refresh") && !verifyOnly;

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
  console.error("Missing BLOB_READ_WRITE_TOKEN (or BLOB_STORE_ID with a Vercel OIDC token). Add it to .env.local.");
  process.exit(2);
}

// `vercel_blob_rw_<storeId>_<secret>` — the manifest is only valid for one store.
const storeId = process.env.BLOB_STORE_ID ?? process.env.BLOB_READ_WRITE_TOKEN.split("_").at(3) ?? "unknown";

function contentType(pathname) {
  return CONTENT_TYPES[path.posix.extname(pathname).toLowerCase()] ?? "application/octet-stream";
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function localFiles(directory) {
  let entries;
  try {
    entries = await readdir(path.join(root, directory), { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(async (entry) => {
      const pathname = `${directory}/${entry.name}`;
      if (entry.isDirectory()) return localFiles(pathname);
      // Capture jobs write large rasters through temporary `.part` files.
      // They are incomplete by definition and may disappear while this scan is
      // running, so they must never be treated as evidence or uploaded.
      if (!entry.isFile() || IGNORED_FILES.has(entry.name) || entry.name.endsWith(".part")) return [];
      const { size } = await stat(path.join(root, pathname));
      return [{ pathname, size }];
    }));
  return nested.flat();
}

// `list` walks one prefix by an opaque cursor, so a single prefix can only be
// read serially. Everything below turns that into many disjoint prefixes read
// at once; this semaphore is what keeps the fan-out from stampeding the API.
let activeRequests = 0;
const waitingRequests = [];

async function withListSlot(request) {
  // A finished request hands its slot straight to the next waiter rather than
  // releasing and re-counting, so the limit cannot be overshot by a wake-up race.
  if (activeRequests >= LIST_CONCURRENCY) await new Promise((resolve) => waitingRequests.push(resolve));
  else activeRequests += 1;
  try {
    return await request();
  } finally {
    const next = waitingRequests.shift();
    if (next) next();
    else activeRequests -= 1;
  }
}

async function listPages(prefix, mode) {
  const sizes = new Map();
  const folders = [];
  let cursor;
  do {
    const page = await withListSlot(() => list({ prefix, cursor, limit: 1000, ...(mode ? { mode } : {}) }));
    for (const blob of page.blobs) sizes.set(blob.pathname, blob.size);
    if (page.folders) folders.push(...page.folders);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return { sizes, folders };
}

// Splits sibling folders into disjoint string shards by their leading
// characters, so a folder with thousands of children becomes a handful of
// prefixes instead of thousands of one-page requests.
function shardPrefixes(prefix, folders) {
  for (const depth of [1, 2, 3]) {
    const counts = new Map();
    for (const folder of folders) {
      const key = folder.slice(prefix.length, prefix.length + depth);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const balanced = [...counts.values()].every((count) => count <= SHARD_TARGET_FOLDERS);
    if (balanced || depth === 3) return [...counts.keys()].map((key) => `${prefix}${key}`);
  }
  return folders;
}

// Folded pages hand back each level's own files along with its folder names, so
// descending until there are enough sibling folders to saturate the workers
// collects data rather than wasting requests.
async function discoverShards(prefix, depth = 0) {
  const { sizes, folders } = await listPages(prefix, "folded");
  if (!folders.length) return { sizes, shards: [] };
  if (folders.length >= LIST_CONCURRENCY || depth >= MAX_FOLD_DEPTH) {
    return { sizes, shards: shardPrefixes(prefix, folders) };
  }
  const children = await Promise.all(folders.map((folder) => discoverShards(folder, depth + 1)));
  const shards = [];
  for (const child of children) {
    for (const [pathname, size] of child.sizes) sizes.set(pathname, size);
    shards.push(...child.shards);
  }
  return { sizes, shards };
}

async function remoteFiles(prefix) {
  // `folded` mode needs a trailing slash; without one there is nothing to fold.
  if (!prefix.endsWith("/")) return (await listPages(prefix)).sizes;
  const { sizes, shards } = await discoverShards(prefix);
  const listed = await Promise.all(shards.map(async (shard) => (await listPages(shard)).sizes));
  for (const shard of listed) {
    for (const [pathname, size] of shard) sizes.set(pathname, size);
  }
  return sizes;
}

async function readManifest() {
  try {
    const parsed = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
    if (parsed.version !== MANIFEST_VERSION || parsed.storeId !== storeId) return undefined;
    return new Map(Object.entries(parsed.sizes));
  } catch {
    return undefined;
  }
}

async function writeManifest(sizes) {
  const entries = [...sizes].sort(([left], [right]) => left.localeCompare(right));
  const body = { version: MANIFEST_VERSION, storeId, updatedAt: new Date().toISOString(), sizes: Object.fromEntries(entries) };
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(body)}\n`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function upload(file) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const body = await readFile(path.join(root, file.pathname));
      await put(file.pathname, body, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: contentType(file.pathname),
        multipart: file.size > MULTIPART_THRESHOLD,
      });
      return;
    } catch (error) {
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
  const uploaded = [];
  let done = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        await worker(item);
        uploaded.push(item);
      } catch (error) {
        failures.push({ item, error });
        console.error(`  failed: ${item.pathname} (${error.message})`);
      }
      done += 1;
      if (done % 250 === 0 || done === items.length) console.log(`  ${done}/${items.length}`);
    }
  }));
  return { failures, uploaded };
}

// Only files recorded as successfully in the store are remembered, so a failed
// or interrupted run never makes the next one skip an upload.
async function persistManifest(uploaded = []) {
  const base = (await readManifest()) ?? new Map();
  if (listedStore) {
    for (const pathname of [...base.keys()]) if (pathname.startsWith(prefixFilter)) base.delete(pathname);
  }
  for (const [pathname, size] of remote) base.set(pathname, size);
  for (const file of uploaded) base.set(file.pathname, file.size);
  await writeManifest(base);
}

const startedScan = Date.now();
const local = (await Promise.all(EVIDENCE_ROOTS.map(localFiles))).flat()
  .filter((file) => file.pathname.startsWith(prefixFilter));

const cached = useManifestCache ? await readManifest() : undefined;
const listedStore = !cached;
let remote;
if (cached) {
  remote = prefixFilter
    ? new Map([...cached].filter(([pathname]) => pathname.startsWith(prefixFilter)))
    : cached;
} else {
  remote = new Map();
  const prefixes = EVIDENCE_ROOTS.flatMap((evidenceRoot) => {
    const rootPrefix = `${evidenceRoot}/`;
    if (prefixFilter && !prefixFilter.startsWith(rootPrefix) && !rootPrefix.startsWith(prefixFilter)) return [];
    return [prefixFilter.length > rootPrefix.length ? prefixFilter : rootPrefix];
  });
  // The roots share the request semaphore, so reading them together just keeps
  // the workers busy while one root runs out of shards.
  for (const sizes of await Promise.all(prefixes.map((prefix) => remoteFiles(prefix)))) {
    for (const [pathname, size] of sizes) remote.set(pathname, size);
  }
}
const scanSeconds = ((Date.now() - startedScan) / 1000).toFixed(1);

const localPathnames = new Set(local.map((file) => file.pathname));
const pending = local.filter((file) => remote.get(file.pathname) !== file.size);
const changed = pending.filter((file) => remote.has(file.pathname));
const orphans = [...remote.keys()].filter((pathname) => !localPathnames.has(pathname));
const pendingBytes = pending.reduce((total, file) => total + file.size, 0);

const source = listedStore ? `read from the store in ${scanSeconds}s` : "from the cached manifest, pass --refresh to re-read the store";
console.log(`Local files: ${local.length} (${formatBytes(local.reduce((total, file) => total + file.size, 0))}); in store: ${remote.size} (${source}).`);
console.log(`To upload: ${pending.length} (${formatBytes(pendingBytes)}), of which changed: ${changed.length}; in store but not local: ${orphans.length}.`);
if (orphans.length) {
  console.log("Store-only files are left in place (delete them from the Vercel dashboard if they are stale):");
  for (const pathname of orphans.slice(0, 20)) console.log(`  ${pathname}`);
  if (orphans.length > 20) console.log(`  … and ${orphans.length - 20} more`);
}
if (listedStore) await persistManifest();

if (verifyOnly) {
  for (const file of pending.slice(0, 50)) console.log(`  missing/changed: ${file.pathname}`);
  process.exit(pending.length ? 1 : 0);
}
if (dryRun) {
  for (const file of pending) console.log(`  would upload: ${file.pathname} (${formatBytes(file.size)})`);
  process.exit(0);
}
if (!pending.length) {
  console.log("Store is up to date.");
  process.exit(0);
}

console.log(`Uploading with concurrency ${concurrency}…`);
const startedAt = Date.now();
const { failures, uploaded } = await runPool(pending, upload);
const seconds = ((Date.now() - startedAt) / 1000).toFixed(0);
await persistManifest(uploaded);
console.log(`Uploaded ${uploaded.length}/${pending.length} files in ${seconds}s.`);
if (failures.length) {
  console.error(`${failures.length} upload(s) failed; rerun the command to retry them.`);
  process.exit(1);
}
