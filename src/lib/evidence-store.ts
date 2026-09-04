import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { get } from "@vercel/blob";

/**
 * Archive scans (~4.9 GB, ~18k files) live in a private Vercel Blob store, not
 * in git: cloning and copying them made Vercel's build container run out of
 * disk. Blob pathnames are the repo-relative paths, so the `evidence.path`
 * values in source records double as blob keys and needed no rewriting.
 *
 * The same folders stay on disk locally (git-ignored) for the research scripts,
 * and are read directly when present so `next dev` works without a token.
 * Upload new or changed files with `pnpm genealogy:evidence:upload`.
 */
export const EVIDENCE_ROOTS = [
  "public/archive/evidence",
  "data/genealogy/evidence-private",
] as const;

// Mirrored in scripts/genealogy/upload-evidence-files.mjs (keep both in sync).
const CONTENT_TYPES: Record<string, string> = {
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

export function evidenceContentType(filePath: string) {
  return CONTENT_TYPES[path.posix.extname(filePath).toLocaleLowerCase("en-US")] ?? "application/octet-stream";
}

/**
 * Normalises a repo-relative evidence path and returns it only when it sits
 * inside one of the evidence roots. `normalize` collapses interior ".."
 * segments and leaves any escaping ones at the front, so a prefix check is
 * enough to keep reads inside a root.
 */
export function resolveEvidencePathname(relativePath?: string | null) {
  if (!relativePath || relativePath.startsWith("/") || relativePath.includes("\\")) return null;
  const normalized = path.posix.normalize(relativePath);
  const isAllowed = EVIDENCE_ROOTS.some((root) => normalized.length > root.length + 1 && normalized.startsWith(`${root}/`));
  return isAllowed ? normalized : null;
}

export type EvidenceAsset = {
  stream: ReadableStream<Uint8Array>;
  contentType: string;
  fileName: string;
  size: number | null;
};

export async function readEvidenceAsset(relativePath?: string | null): Promise<EvidenceAsset | null> {
  const pathname = resolveEvidencePathname(relativePath);
  if (!pathname) return null;
  const fileName = path.posix.basename(pathname);
  const contentType = evidenceContentType(pathname);

  // `turbopackIgnore` keeps the tracer from following this dynamic path: the
  // roots hold ~4.9 GB of scans that must stay out of the deployed bundle.
  const localPath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), pathname);
  if (existsSync(localPath)) {
    return {
      stream: Readable.toWeb(createReadStream(localPath)) as unknown as ReadableStream<Uint8Array>,
      contentType,
      fileName,
      size: statSync(localPath).size,
    };
  }

  try {
    // `get()` returns null for a blob that is not in the store, which is the
    // expected result for a scan that has not been uploaded yet.
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    return { stream: result.stream, contentType, fileName, size: result.blob.size };
  } catch (error) {
    console.error(`[evidence-store] failed to read ${pathname}`, error);
    return null;
  }
}

function contentDisposition(fileName: string) {
  const ascii = fileName.replaceAll(/[^\x20-\x7e]/g, "_").replaceAll('"', "");
  return `inline; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

/** 404 with the private headers, so a miss looks the same as a denied request. */
export function hiddenEvidenceResponse() {
  return new Response(null, { status: 404, headers: PRIVATE_HEADERS });
}

export function evidenceResponse(asset: EvidenceAsset) {
  const headers = new Headers(PRIVATE_HEADERS);
  headers.set("Content-Disposition", contentDisposition(asset.fileName));
  headers.set("Content-Type", asset.contentType);
  if (asset.size !== null) headers.set("Content-Length", String(asset.size));
  return new Response(asset.stream, { headers });
}
