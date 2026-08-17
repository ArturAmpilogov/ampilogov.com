import { readFile } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { DOCS_ROOT, getArchiveFiles } from "@/lib/docs";

type RouteContext = { params: Promise<{ path: string[] }> };

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
};

export function generateStaticParams() {
  return getArchiveFiles().map((file) => ({ path: file.split("/") }));
}

export async function GET(_request: Request, context: RouteContext) {
  const segments = (await context.params).path;
  const absolutePath = path.resolve(DOCS_ROOT, ...segments);
  const rootPrefix = `${path.resolve(DOCS_ROOT)}${path.sep}`;

  if (!absolutePath.startsWith(rootPrefix)) notFound();

  try {
    const file = await readFile(absolutePath);
    return new Response(file, {
      headers: {
        "Content-Type": contentTypes[path.extname(absolutePath).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    notFound();
  }
}
