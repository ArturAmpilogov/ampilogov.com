import type { NextRequest } from "next/server";
import { hasBackupAccess } from "@/lib/backup-access";
import { evidenceResponse, hiddenEvidenceResponse } from "@/lib/evidence-store";
import { readArchiveBackupAsset } from "@/lib/genealogy";

type BackupAssetRouteProps = {
  params: Promise<{ sourceId: string; assetIndex: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: BackupAssetRouteProps) {
  if (!hasBackupAccess(request)) return hiddenEvidenceResponse();

  const { sourceId, assetIndex } = await params;
  const index = Number(assetIndex);
  if (!Number.isSafeInteger(index) || index < 0) return hiddenEvidenceResponse();

  const asset = await readArchiveBackupAsset(decodeURIComponent(sourceId), index);
  if (!asset) return hiddenEvidenceResponse();

  return evidenceResponse(asset);
}
