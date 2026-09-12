#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const options = new Map();
for (let index = 2; index < process.argv.length; index += 2) {
  options.set(process.argv[index], process.argv[index + 1]);
}

const inputPath = options.get("--input");
const outputPath = options.get("--output");
if (!inputPath || !outputPath) {
  throw new Error("Нужны --input /path/inventory.json и --output data/genealogy/searches/name.json");
}

const input = JSON.parse(await readFile(path.resolve(inputPath), "utf8"));
const results = input.results.map((row) => {
  const existing = row.state === "existingComplete";
  const rejected = row.state === "priorRejected";
  return {
    absolutePosition: (row.page - 1) * input.scope.resultsPerPage + row.position,
    page: row.page,
    position: row.position,
    catalogId: row.catalogId,
    scanNumber: row.scanNumber,
    documentUrl: row.documentUrl,
    title: row.title,
    indexSnippet: row.snippet.replaceAll("\u0007", ""),
    status: existing
      ? "existing-complete"
      : rejected
        ? "previously-adjudicated-rejected"
      : row.state === "existingIncomplete"
        ? "pending-existing-record-evidence-upgrade"
        : "pending-primary-scan-review",
    capture: !existing && !rejected,
    sourceIds: row.sources?.length ? row.sources : undefined,
    priorAdjudications: row.prior?.length ? row.prior : undefined,
  };
});

const pending = results.filter((row) => row.capture !== false);
const uniquePending = new Set(pending.map((row) => `${row.catalogId}/${row.scanNumber}`));
const journal = {
  schemaVersion: 1,
  searchRunId: input.searchRunId,
  status: "inventory-complete-processing-in-progress",
  createdAt: input.createdAt,
  queryText: input.query.text,
  rules: {
    sort: input.query.sort,
    deduplicateByCatalogAndScan: true,
    verifyAgainstPrimaryScan: true,
    localEvidenceRequired: true,
    publicYandexLinkOnly: true,
    publicCutoffYear: 1950,
  },
  progress: {
    pagesInventoried: input.scope.reportedPages,
    rowsFound: input.scope.reportedResults,
    rowsCompleted: results.length - pending.length,
    uniqueScansPending: uniquePending.size,
    rowsRemaining: pending.length,
  },
  batches: [
    {
      index: input.query.index,
      searchUrl: input.query.searchUrl,
      reportedPages: input.scope.reportedPages,
      reportedResults: input.scope.reportedResults,
      results,
    },
  ],
};

await writeFile(path.resolve(outputPath), `${JSON.stringify(journal, null, 2)}\n`);
console.log(JSON.stringify(journal.progress));
