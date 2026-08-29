import { NextResponse } from "next/server";
import { readArchiveBackupAsset } from "@/lib/genealogy";

type BackupAssetRouteProps = {
  params: Promise<{ sourceId: string; assetIndex: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: BackupAssetRouteProps) {
  const { sourceId, assetIndex } = await params;
  const index = Number(assetIndex);
  if (!Number.isSafeInteger(index) || index < 0) {
    return new NextResponse(null, { status: 404 });
  }

  const asset = readArchiveBackupAsset(decodeURIComponent(sourceId), index);
  if (!asset) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(asset.bytes), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${asset.fileName.replaceAll('"', "")}"`,
      "Content-Type": asset.contentType,
      "Cross-Origin-Resource-Policy": "same-origin",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}
