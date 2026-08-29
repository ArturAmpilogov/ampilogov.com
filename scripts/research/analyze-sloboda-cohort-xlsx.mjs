#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";

const workbookPath = path.resolve(process.argv[2] || "/private/tmp/sloboda-ukraine-v13.xlsx");

function readZipEntry(entry) {
  return execFileSync("unzip", ["-p", workbookPath, entry], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
}

function decodeXml(value = "") {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

const sharedStrings = [...readZipEntry("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
  ([, item]) => decodeXml([...item.matchAll(/<t(?: [^>]*)?>([\s\S]*?)<\/t>/g)].map((match) => match[1]).join("")),
);

function columnIndex(reference) {
  const letters = reference.match(/^[A-Z]+/)?.[0] || "";
  return [...letters].reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0);
}

function parseRows(sheetXml) {
  const rows = [];
  for (const rowMatch of sheetXml.matchAll(/<row(?: [^>]*)?>([\s\S]*?)<\/row>/g)) {
    const [, rowXml] = rowMatch;
    const row = {};
    for (const cellMatch of rowXml.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g)) {
      const [, reference, attributes, cellXml] = cellMatch;
      const raw = cellXml.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (raw === undefined) continue;
      row[columnIndex(reference)] = /\bt="s"/.test(attributes) ? sharedStrings[Number(raw)] : decodeXml(raw);
    }
    if (Object.keys(row).length) rows.push(row);
  }
  return rows;
}

const groups = [
  {
    id: "anpilogov",
    label: "Анпилогов/Анпилов",
    weight: 8,
    pattern: /^(?:анп[ие]л(?:ог)?ов|ампил(?:ог)?ов|анфил(?:ог)?ов|онпил(?:ог)?ов|антилогов|амнилогов)$/i,
  },
  { id: "khreptov", label: "Хрептов", weight: 6, pattern: /^хр[еиѣ]б?п?т/i },
  { id: "gostishchev", label: "Гостищев", weight: 5, pattern: /^гост(?:ищ|ещ)/i },
  { id: "ozerov", label: "Озеров", weight: 3, pattern: /^оз[еѣ]р/i },
  { id: "selyukov", label: "Селюков", weight: 3, pattern: /^сел[юу]к/i },
  { id: "zaytsev", label: "Зайцев", weight: 1, pattern: /^зайц/i },
  { id: "lazarev", label: "Лазарев", weight: 1, pattern: /^лазар/i },
  { id: "martynov", label: "Мартинов", weight: 1, pattern: /^март[иы]н/i },
];

const allRows = [
  ...parseRows(readZipEntry("xl/worksheets/sheet2.xml")).map((row, index) => ({ ...row, _sheet: 2, _row: index + 1 })),
  ...parseRows(readZipEntry("xl/worksheets/sheet3.xml")).map((row, index) => ({ ...row, _sheet: 3, _row: index + 1 })),
];

const matches = [];
for (const row of allRows) {
  const surname = String(row[2] || "").trim();
  const group = groups.find((candidate) => candidate.pattern.test(surname));
  if (!group) continue;
  matches.push({
    group: group.id,
    label: group.label,
    weight: group.weight,
    surname,
    category: row[3] || "",
    owner: row[4] || "",
    district: row[5] || "",
    sotnia: row[6] || "",
    localityType: row[7] || "",
    locality: row[8] || "",
    year: row[9] || "",
    documentType: row[10] || "",
    archive: row[11] || "",
    fond: row[12] || "",
    opis: row[13] || "",
    caseNumber: row[14] || "",
    households: row[15] || "",
    sheet: row._sheet,
    row: row._row,
  });
}

const targetRowNeighborhoods = matches
  .filter((match) => match.group === "anpilogov")
  .map((match) => ({
    target: match,
    rows: allRows.filter((row) => row._sheet === match.sheet && Math.abs(row._row - match.row) <= 3),
  }));

function clean(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function rankClusters(keyForMatch) {
  const clusters = new Map();
  for (const match of matches) {
    const key = keyForMatch(match).map(clean).join(" | ");
    if (!key.replaceAll("|", "").trim()) continue;
    const cluster = clusters.get(key) || { key, groups: new Map(), rows: [] };
    cluster.groups.set(match.group, match.weight);
    cluster.rows.push(match);
    clusters.set(key, cluster);
  }
  return [...clusters.values()]
    .map((cluster) => ({
      ...cluster,
      score: [...cluster.groups.values()].reduce((sum, weight) => sum + weight, 0),
      rareCount: [...cluster.groups.keys()].filter((id) => ["anpilogov", "khreptov", "gostishchev", "selyukov"].includes(id)).length,
    }))
    .filter((cluster) => cluster.groups.size >= 2)
    .sort((a, b) => b.rareCount - a.rareCount || b.score - a.score || b.groups.size - a.groups.size || a.key.localeCompare(b.key, "ru"));
}

function summarizeClusters(clusters) {
  return clusters.slice(0, 100).map((cluster) => ({
    place: cluster.key,
    score: cluster.score,
    groups: [...cluster.groups.keys()],
    rows: cluster.rows,
  }));
}

const localityClusters = rankClusters((match) => [
  match.owner,
  match.district,
  match.sotnia,
  match.localityType,
  match.locality,
]);
const administrativeClusters = rankClusters((match) => [match.owner, match.district, match.sotnia]);
const sourceClusters = rankClusters((match) => [
  match.archive,
  match.fond,
  match.opis,
  match.caseNumber,
]);

console.log(JSON.stringify({
  workbook: workbookPath,
  totalRows: allRows.length,
  sampleRows: allRows.slice(0, 4),
  case250Rows: allRows.filter((row) => String(row[14] || "") === "250"),
  targetMatches: matches.length,
  exactTargetRows: matches,
  targetRowNeighborhoods,
  rankedLocalityClusters: summarizeClusters(localityClusters),
  rankedAdministrativeClusters: summarizeClusters(administrativeClusters),
  rankedSourceClusters: summarizeClusters(sourceClusters),
}, null, 2));
