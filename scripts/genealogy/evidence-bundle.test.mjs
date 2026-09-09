import test from "node:test";
import assert from "node:assert/strict";
import { preserveUnchangedBundle } from "./evidence-bundle.mjs";
import { mkdtemp, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const previous = {
  path: "full.png", sha256: "full-hash", capturedAt: "2026-09-01",
  quality: { documentOnlyVisuallyConfirmed: true },
  fragments: [
    { path: "header.png", sha256: "header-hash", description: "Previous page, month heading" },
    { path: "row.png", sha256: "row-hash", description: "Target family" },
  ],
};
const fresh = () => ({ ...structuredClone(previous), capturedAt: "2026-09-05",
  quality: { documentOnlyVisuallyConfirmed: false } });

test("unchanged images retain all reviewed metadata, regardless of order", () => {
  const next = fresh();
  next.fragments.reverse();
  next.fragments[0].description = "Generic description";
  assert.strictEqual(preserveUnchangedBundle(previous, next), previous);
});
test("changed, added, removed or moved files invalidate old confirmation", () => {
  for (const mutate of [
    (b) => { b.sha256 = "changed"; },
    (b) => { b.fragments[0].sha256 = "changed"; },
    (b) => { b.fragments.push({ path: "new.png", sha256: "new" }); },
    (b) => { b.fragments.pop(); },
    (b) => { b.fragments[0].path = "moved.png"; },
  ]) {
    const next = fresh(); mutate(next);
    assert.strictEqual(preserveUnchangedBundle(previous, next), next);
  }
});
test("new bundles and missing hashes cannot inherit verification", () => {
  const next = fresh();
  assert.strictEqual(preserveUnchangedBundle(undefined, next), next);
  const invalid = structuredClone(previous); delete invalid.fragments[0].sha256;
  assert.strictEqual(preserveUnchangedBundle(invalid, next), next);
});

test("attaching a primary scan preserves reviewed and uncited secondary copies", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "evidence-preservation-test-"));
  const catalogId = "00000000-0000-0000-0000-000000000001";
  const evidenceDir = `data/genealogy/evidence-private/yandex/${catalogId}`;
  await mkdir(path.join(root, evidenceDir), { recursive: true });
  await mkdir(path.join(root, "data/genealogy/sources"), { recursive: true });
  const hashes = {};
  for (const scan of [1, 2]) for (const kind of ["full-view", "header", "target-entry"]) {
    const name = `${String(scan).padStart(4, "0")}-${kind}.png`;
    // Attachment hashes bytes only; these fixtures deliberately are not image-quality tests.
    await writeFile(path.join(root, evidenceDir, name), name);
    hashes[name] = createHash("sha256").update(name).digest("hex");
  }
  const file = (kind) => `${evidenceDir}/0002-${kind}.png`;
  const reviewed = {
    catalogId, scanNumber: 2, path: file("full-view"),
    sha256: hashes["0002-full-view.png"], capturedAt: "2026-09-01",
    quality: { documentOnlyVisuallyConfirmed: true },
    fragments: ["header", "target-entry"].map((kind) => ({
      kind, path: file(kind), sha256: hashes[`0002-${kind}.png`], description: "Specific context",
    })),
  };
  const uncited = { catalogId, scanNumber: 3, note: "Keep supporting material" };
  const sourcePath = path.join(root, "data/genealogy/sources/test.json");
  await writeFile(sourcePath, JSON.stringify({ sourceId: "TEST",
    collection: { catalogId, scanNumber: 1, citations: [{ catalogId, scanNumber: 2 }] },
    evidence: { parallelCopies: [reviewed, uncited] },
  }));
  execFileSync(process.execPath, [fileURLToPath(new URL("./attach-local-evidence.mjs", import.meta.url)),
    "--catalog", catalogId, "--scans", "1"], { cwd: root });
  const result = JSON.parse(await readFile(sourcePath, "utf8"));
  assert.deepEqual(result.evidence.parallelCopies, [reviewed, uncited]);
  assert.equal(result.evidence.quality.documentOnlyVisuallyConfirmed, false);
  await writeFile(path.join(root, file("header")), "changed header");
  execFileSync(process.execPath, [fileURLToPath(new URL("./attach-local-evidence.mjs", import.meta.url)),
    "--catalog", catalogId, "--scans", "1"], { cwd: root });
  const changed = JSON.parse(await readFile(sourcePath, "utf8"));
  assert.equal(changed.evidence.parallelCopies[0].quality.documentOnlyVisuallyConfirmed, false);
  assert.deepEqual(changed.evidence.parallelCopies[1], uncited);
});
