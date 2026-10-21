import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import Module from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const root = path.resolve(import.meta.dirname, "../..");
const audit = path.join(root, "scripts/genealogy/audit-data-links.mjs");

// The audit repeats the record page's display rule; load the real one from
// src/lib/genealogy.ts so the two cannot drift apart unnoticed.
const filename = path.join(root, "src/lib/genealogy.ts");
const loaded = new Module(filename);
loaded.filename = filename;
loaded.paths = Module._nodeModulePaths(path.dirname(filename));
loaded._compile(ts.transpileModule(`${fs.readFileSync(filename, "utf8")}
export const rightsTests = { sourceEvidenceRightsStatus };
`, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    esModuleInterop: true, resolveJsonModule: true },
}).outputText, filename);
const { sourceEvidenceRightsStatus } = loaded.exports.rightsTests;

function runAudit(sources) {
  const directory = fs.mkdtempSync(path.join(tmpdir(), "audit-data-links-"));
  try {
    for (const part of ["people", "families", "sources", "places"]) {
      fs.mkdirSync(path.join(directory, "data/genealogy", part), { recursive: true });
    }
    fs.writeFileSync(path.join(directory, "data/genealogy/places/index.json"), JSON.stringify({ places: [] }));
    for (const source of sources) {
      fs.writeFileSync(path.join(directory, "data/genealogy/sources", `${source.sourceId}.json`), JSON.stringify(source));
    }
    const result = spawnSync(process.execPath, [audit, "--summary"], { cwd: directory, encoding: "utf8" });
    return { status: result.status, output: `${result.stdout}${result.stderr}` };
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

const hidden = "public/archive/evidence/publications/fixture/page.jpg";
const cleared = {
  publicDisplay: true,
  licenseStatus: "public-domain",
  licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/",
};
const fixtures = [
  { sourceId: "PUB-CLEARED-PAGE", evidence: { ...cleared, path: hidden } },
  { sourceId: "PUB-CLEARED-FRAGMENT", evidence: { ...cleared, fragments: [{ path: hidden }] } },
  { sourceId: "PUB-OPEN-LICENSE", evidence: { ...cleared, licenseStatus: "open-license", path: hidden } },
  { sourceId: "PUB-PERMISSION", evidence: { ...cleared, licenseStatus: "permission", path: hidden } },
  { sourceId: "PUB-NO-LICENSE-URL", evidence: { ...cleared, licenseUrl: undefined, path: hidden } },
  { sourceId: "PUB-UNKNOWN-LICENSE", evidence: { ...cleared, licenseStatus: "unknown", path: hidden } },
  { sourceId: "FS-NOT-DISPLAYED", evidence: { ...cleared, publicDisplay: false, path: hidden } },
  { sourceId: "PUB-PUBLIC-COPY", evidence: { ...cleared, path: "public/evidence/publications/fixture/page.jpg",
    fragments: [{ path: "public/evidence/publications/fixture/row.jpg" }] } },
];

// What the record page would try to show, by the site's own rule.
const showsHiddenScan = (source) => sourceEvidenceRightsStatus(source) === "display-cleared"
  && [source.evidence.path, ...(source.evidence.fragments ?? []).map((fragment) => fragment.path)]
    .some((evidencePath) => evidencePath?.startsWith("public/archive/"));

test("the audit flags exactly the display-cleared records whose scans sit under /archive/", () => {
  const { status, output } = runAudit(fixtures);
  const flagged = [...output.matchAll(/\[private-scan-on-public-record\] \S+: ([\w-]+): (\S+)/g)]
    .map(([, sourceId, evidencePath]) => `${sourceId} ${evidencePath}`);
  const expected = fixtures.filter(showsHiddenScan).map((source) => `${source.sourceId} ${hidden}`);

  assert.deepEqual(expected, [
    `PUB-CLEARED-PAGE ${hidden}`,
    `PUB-CLEARED-FRAGMENT ${hidden}`,
    `PUB-OPEN-LICENSE ${hidden}`,
    `PUB-PERMISSION ${hidden}`,
  ]);
  assert.deepEqual(flagged.sort(), expected.sort());
  assert.equal(status, 1);
});

test("private scans without a display grant and public copies pass the audit", () => {
  const { status, output } = runAudit(fixtures.filter((source) => !showsHiddenScan(source)));
  assert.equal(status, 0, output);
  assert.doesNotMatch(output, /private-scan-on-public-record/);
});

test("a scan used as both the page and a fragment is reported once", () => {
  const { output } = runAudit([{ sourceId: "PUB-SAME-SCAN", evidence: { ...cleared, path: hidden, fragments: [{ path: hidden }] } }]);
  assert.equal(output.match(/private-scan-on-public-record/g)?.length, 1);
});
