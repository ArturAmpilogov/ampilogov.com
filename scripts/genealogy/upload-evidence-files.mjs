// Uploads the archive scans to the private Vercel Blob store.
//
//   pnpm genealogy:evidence:upload                # upload new/changed files
//   pnpm genealogy:evidence:upload -- --dry-run   # only list what would change
//   pnpm genealogy:evidence:upload -- --verify    # exit 1 if the store is behind
//   pnpm genealogy:evidence:upload -- --prefix=data/genealogy/evidence-private/yandex/
//   pnpm genealogy:evidence:upload -- --concurrency=4
//
// Blob pathnames are the repo-relative paths (`public/archive/evidence/...`,
// `data/genealogy/evidence-private/...`), the same strings the source records
// keep in `evidence.path`. A file is re-uploaded when it is missing from the
// store or its size differs. Needs BLOB_READ_WRITE_TOKEN (from the store's
// settings) in .env.local; `--env-file-if-exists` in the npm script loads it.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";

const root = process.cwd();
const EVIDENCE_ROOTS = ["public/archive/evidence", "data/genealogy/evidence-private"];
const IGNORED_FILES = new Set([".DS_Store", "Thumbs.db"]);
const MULTIPART_THRESHOLD = 20 * 1024 * 1024;
const MAX_ATTEMPTS = 4;

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

if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
  console.error("Missing BLOB_READ_WRITE_TOKEN (or BLOB_STORE_ID with a Vercel OIDC token). Add it to .env.local.");
  process.exit(2);
}

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
      if (!entry.isFile() || IGNORED_FILES.has(entry.name)) return [];
      const { size } = await stat(path.join(root, pathname));
      return [{ pathname, size }];
    }));
  return nested.flat();
}

async function remoteFiles(prefix) {
  const sizes = new Map();
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const blob of page.blobs) sizes.set(blob.pathname, blob.size);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return sizes;
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

const local = (await Promise.all(EVIDENCE_ROOTS.map(localFiles))).flat()
  .filter((file) => file.pathname.startsWith(prefixFilter));
const remote = new Map();
for (const evidenceRoot of EVIDENCE_ROOTS) {
  const rootPrefix = `${evidenceRoot}/`;
  if (prefixFilter && !prefixFilter.startsWith(rootPrefix) && !rootPrefix.startsWith(prefixFilter)) continue;
  const prefix = prefixFilter.length > rootPrefix.length ? prefixFilter : rootPrefix;
  for (const [pathname, size] of await remoteFiles(prefix)) remote.set(pathname, size);
}

const localPathnames = new Set(local.map((file) => file.pathname));
const pending = local.filter((file) => remote.get(file.pathname) !== file.size);
const changed = pending.filter((file) => remote.has(file.pathname));
const orphans = [...remote.keys()].filter((pathname) => !localPathnames.has(pathname));
const pendingBytes = pending.reduce((total, file) => total + file.size, 0);

console.log(`Local files: ${local.length} (${formatBytes(local.reduce((total, file) => total + file.size, 0))}); in store: ${remote.size}.`);
console.log(`To upload: ${pending.length} (${formatBytes(pendingBytes)}), of which changed: ${changed.length}; in store but not local: ${orphans.length}.`);
if (orphans.length) {
  console.log("Store-only files are left in place (delete them from the Vercel dashboard if they are stale):");
  for (const pathname of orphans.slice(0, 20)) console.log(`  ${pathname}`);
  if (orphans.length > 20) console.log(`  … and ${orphans.length - 20} more`);
}

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
const failures = await runPool(pending, upload);
const seconds = ((Date.now() - startedAt) / 1000).toFixed(0);
console.log(`Uploaded ${pending.length - failures.length}/${pending.length} files in ${seconds}s.`);
if (failures.length) {
  console.error(`${failures.length} upload(s) failed; rerun the command to retry them.`);
  process.exit(1);
}
