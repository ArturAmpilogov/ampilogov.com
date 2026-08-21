import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const qualityPath = path.join(root, "data/genealogy/evidence-quality.json");
const quality = JSON.parse(await readFile(qualityPath, "utf8"));

let added = 0;
let updated = 0;

for (const file of (await readdir(sourcesDir)).filter((name) => name.endsWith(".json")).sort()) {
  const source = JSON.parse(await readFile(path.join(sourcesDir, file), "utf8"));
  const embeddedStatus = source.evidence?.quality?.status;
  if (!embeddedStatus?.startsWith("approved")) continue;

  const current = quality.records[source.sourceId];
  const next = {
    ...current,
    status: embeddedStatus,
    approvedAt: current?.approvedAt ?? source.evidence?.capturedAt ?? quality.updatedAt,
    fragments: source.evidence?.fragments?.length ?? current?.fragments ?? 0,
    transcriptionStatus: source.transcription?.status ?? current?.transcriptionStatus ?? "missing",
    approvalBasis: current?.approvalBasis ?? "source-card-evidence-quality",
  };

  if (!current) added += 1;
  else if (JSON.stringify(current) !== JSON.stringify(next)) updated += 1;
  quality.records[source.sourceId] = next;
}

quality.records = Object.fromEntries(Object.entries(quality.records)
  .sort(([left], [right]) => left.localeCompare(right)));

await writeFile(qualityPath, `${JSON.stringify(quality, null, 2)}\n`);
console.log(JSON.stringify({ records: Object.keys(quality.records).length, added, updated }, null, 2));
