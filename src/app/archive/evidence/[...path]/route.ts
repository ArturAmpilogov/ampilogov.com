import type { NextRequest } from "next/server";
import { hasBackupAccess } from "@/lib/backup-access";
import { evidenceResponse, hiddenEvidenceResponse, readEvidenceAsset } from "@/lib/evidence-store";

type ArchiveEvidenceRouteProps = {
  params: Promise<{ path: string[] }>;
};

export const dynamic = "force-dynamic";

/**
 * Serves `public/archive/evidence/**` from the private Blob store. The files
 * used to be static assets under `public/`; the URLs are unchanged so the
 * record pages, essays and notes that reference them keep working.
 */
export async function GET(request: NextRequest, { params }: ArchiveEvidenceRouteProps) {
  if (!hasBackupAccess(request)) return hiddenEvidenceResponse();

  const { path: segments } = await params;
  const relativePath = segments.map((segment) => decodeURIComponent(segment)).join("/");
  const asset = await readEvidenceAsset(`public/archive/evidence/${relativePath}`);
  if (!asset) return hiddenEvidenceResponse();

  return evidenceResponse(asset);
}
