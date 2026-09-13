import { readFile, writeFile, readdir } from 'node:fs/promises';

const base = 'data/genealogy/searches/';
const file = `${base}yandex-archive-anfilogov-2026-09-13.json`;
const tracker = JSON.parse(await readFile(file, 'utf8'));
const batches = (await readdir(base)).filter(f => /^yandex-archive-anfilogov-2026-09-13-batch.*\.json$/.test(f));
async function sourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? sourceFiles(`${dir}/${e.name}`) : [`${dir}/${e.name}`]))).flat();
}
const availableSources = new Set((await Promise.all((await sourceFiles('data/genealogy/sources')).filter(f=>f.endsWith('.json')).map(async f=>JSON.parse(await readFile(f,'utf8')).sourceId))).filter(Boolean));
const byUrl = new Map();
for (const batch of batches) {
  const d = JSON.parse(await readFile(base + batch, 'utf8'));
  for (const r of d.results ?? d.items ?? d.cards ?? []) {
    const url = r.canonicalUrl ?? r.url;
    if (!url) throw Error(`Missing URL in ${batch}`);
    const sourceIds = r.sourceIds ?? (r.sourceId ? [r.sourceId] : []);
    for (const id of sourceIds) if (!availableSources.has(id)) throw Error(`Missing source ${id} in ${batch}`);
    byUrl.set(url, { status: r.status, sourceIds, batchFile: base + batch, findings: r.findings ?? r.reviewNotes ?? null, unresolved: r.unresolved ?? [], verifiedAt: d.reviewedAt ?? d.processedAt ?? null });
  }
}
const assignments = [
  ['anfilogov_early', [1,2,3,4,5,16,18,19,22,23,25,26,27,41,...Array.from({length:40},(_,i)=>61+i)]],
  ['anfilogov_names', [6,7,8,9,10,20,24,32,33,34,35,36,37,38,39,40,42,44,46,48,49,50,...Array.from({length:40},(_,i)=>101+i)]],
  ['anfilogov_page2', [11,12,13,14,15,17,21,47,51,52,53,54,56,57,58,60,...Array.from({length:40},(_,i)=>141+i)]],
  ['root', [28,29,30,31,43,45,55,59,...Array.from({length:44},(_,i)=>181+i)]],
];
const seen = new Map();
for (const r of tracker.results) {
  r.assignedAgent = assignments.find(([, ns]) => ns.includes(r.ordinal))?.[0] ?? null;
  if (!r.assignedAgent) throw Error(`Unassigned ${r.ordinal}`);
  if (seen.has(r.canonicalUrl)) r.duplicateOfOrdinal = seen.get(r.canonicalUrl);
  else seen.set(r.canonicalUrl, r.ordinal);
  const review = byUrl.get(r.canonicalUrl);
  if (review) { r.primaryReview = review; r.status = 'reviewed'; }
}
tracker.progress = { capturedRows: tracker.results.length, uniqueScans: seen.size, reviewedRows: tracker.results.filter(r=>r.primaryReview).length, uniqueScansReviewed: new Set(tracker.results.filter(r=>r.primaryReview).map(r=>r.canonicalUrl)).size, rowsRemaining: tracker.results.filter(r=>!r.primaryReview).length, duplicatePositions: tracker.results.length-seen.size };
tracker.status = tracker.progress.rowsRemaining ? 'in-progress' : tracker.finalAudit?.passed ? 'complete-with-documented-uncertainties' : 'primary-review-complete-pending-final-audit';
await writeFile(file, JSON.stringify(tracker, null, 2)+'\n');
console.log(JSON.stringify(tracker.progress));
