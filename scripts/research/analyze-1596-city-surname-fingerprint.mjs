import fs from "node:fs";

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error("Usage: node scripts/research/analyze-1596-city-surname-fingerprint.mjs <text-file>");
}

const text = fs.readFileSync(inputPath, "utf8").replace(/\r/g, "");
const headingPattern = /^\s*(\d+)\.\s+([^\n]+?)\s*$/gm;
const headings = [...text.matchAll(headingPattern)];

function normalizeSurname(value) {
  return value
    .toLocaleLowerCase("ru")
    .replace(/[ъь]$/u, "")
    .replace(/[^а-яё-]/gu, "");
}

const sections = headings.map((heading, index) => {
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? text.length;
  const body = text.slice(start, end).split(/\n\s*А у верстанья/u)[0];
  const surnames = new Set();

  for (const match of body.matchAll(/\s(?:сын|дети)\s+([А-ЯЁ][А-Яа-яЁё-]+)/gu)) {
    const surname = normalizeSurname(match[1]);
    if (surname) surnames.add(surname);
  }

  return {
    number: Number(heading[1]),
    city: heading[2].replace(/\s*\.\s*$/u, "").trim(),
    surnames,
  };
});

const orel = sections.find((section) => normalizeSurname(section.city) === "орел");
if (!orel) throw new Error("Orel section not found");

const documentFrequency = new Map();
for (const section of sections) {
  for (const surname of section.surnames) {
    documentFrequency.set(surname, (documentFrequency.get(surname) ?? 0) + 1);
  }
}

const universe = new Set(sections.flatMap((section) => [...section.surnames]));
const idf = (surname) => Math.log((sections.length + 1) / ((documentFrequency.get(surname) ?? 0) + 1)) + 1;

function logChoose(n, k) {
  if (k < 0 || k > n) return Number.NEGATIVE_INFINITY;
  const smaller = Math.min(k, n - k);
  let value = 0;
  for (let index = 1; index <= smaller; index += 1) {
    value += Math.log(n - smaller + index) - Math.log(index);
  }
  return value;
}

function hypergeometricTail(population, successes, draws, observed) {
  const maximum = Math.min(successes, draws);
  let probability = 0;
  for (let overlap = observed; overlap <= maximum; overlap += 1) {
    probability += Math.exp(
      logChoose(successes, overlap)
      + logChoose(population - successes, draws - overlap)
      - logChoose(population, draws),
    );
  }
  return probability;
}

function rowFor(section) {
  const shared = [...section.surnames].filter((surname) => orel.surnames.has(surname));
  const unionSize = new Set([...section.surnames, ...orel.surnames]).size;
  return {
    city: section.city,
    citySize: section.surnames.size,
    overlap: shared.length,
    jaccard: shared.length / unionSize,
    cityShare: shared.length / section.surnames.size,
    idfScore: shared.reduce((sum, surname) => sum + idf(surname), 0),
    expectedOverlap: (orel.surnames.size * section.surnames.size) / universe.size,
    hypergeometricTail: hypergeometricTail(
      universe.size,
      orel.surnames.size,
      section.surnames.size,
      shared.length,
    ),
    rare3: shared.filter((surname) => documentFrequency.get(surname) <= 3),
    rare5: shared.filter((surname) => documentFrequency.get(surname) <= 5),
    shared,
  };
}

const rows = sections
  .filter((section) => section !== orel && section.surnames.size > 0)
  .map(rowFor)
  .sort((left, right) => right.idfScore - left.idfScore || right.jaccard - left.jaccard);

const top = rows.slice(0, 15).map((row) => ({
  city: row.city,
  citySize: row.citySize,
  overlap: row.overlap,
  jaccard: Number(row.jaccard.toFixed(4)),
  cityShare: Number(row.cityShare.toFixed(4)),
  idfScore: Number(row.idfScore.toFixed(2)),
  expectedOverlap: Number(row.expectedOverlap.toFixed(2)),
  hypergeometricTail: Number(row.hypergeometricTail.toPrecision(4)),
  rare3: row.rare3,
  rare5: row.rare5,
  shared: row.shared,
}));

console.log(JSON.stringify({
  method: "novik entries only; exact normalized final token after сын/дети; witnesses excluded",
  sections: sections.length,
  surnameUniverse: universe.size,
  orelSurnameCount: orel.surnames.size,
  ranking: top,
}, null, 2));
