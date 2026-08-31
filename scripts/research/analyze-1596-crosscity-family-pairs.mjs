import fs from "node:fs";

const inputPath = process.argv[2];
if (!inputPath) {
  throw new Error("Usage: node scripts/research/analyze-1596-crosscity-family-pairs.mjs <text-file>");
}

const text = fs
  .readFileSync(inputPath, "utf8")
  .replace(/\r/g, "")
  .replace(/\bФ\s+едор\b/gu, "Федор")
  .replace(/\bФ\s+илин\b/gu, "Филин");

const headingPattern = /^\s*(\d+)\.\s+([^\n]+?)\s*$/gm;
const headings = [...text.matchAll(headingPattern)];

function normalize(value) {
  return value
    .toLocaleLowerCase("ru")
    .replace(/ё/gu, "е")
    .replace(/[ъь]$/u, "")
    .replace(/[^а-я-]/gu, "");
}

function singularFamily(value) {
  return normalize(value).replace(/(овы|евы|ины)$/u, (ending) => ending.slice(0, -1));
}

function singularPatronymic(value) {
  return normalize(value).replace(/(овы|евы|ины)$/u, (ending) => ending.slice(0, -1));
}

function levenshtein(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function parsePeople(body, city) {
  const people = [];
  const singlePattern = /(?:^|\n)([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)\s+сын\s+([А-ЯЁ][А-Яа-яЁё-]+)/gu;
  const siblingsPattern = /(?:^|\n)([А-ЯЁ][а-яё]+(?:\s+да\s+[А-ЯЁ][а-яё]+)+)\s+([А-ЯЁ][а-яё]+)\s+дети\s+([А-ЯЁ][А-Яа-яЁё-]+)/gu;

  for (const match of body.matchAll(singlePattern)) {
    people.push({
      city,
      display: `${match[1]} ${match[2]} сын ${match[3]}`,
      given: normalize(match[1]),
      father: singularPatronymic(match[2]),
      family: singularFamily(match[3]),
      kind: "single",
    });
  }

  for (const match of body.matchAll(siblingsPattern)) {
    for (const given of match[1].split(/\s+да\s+/u)) {
      people.push({
        city,
        display: `${given} ${match[2]} сын ${singularFamily(match[3])}`,
        given: normalize(given),
        father: singularPatronymic(match[2]),
        family: singularFamily(match[3]),
        kind: "expanded-sibling",
      });
    }
  }

  return people;
}

const sections = headings.map((heading, index) => {
  const start = heading.index + heading[0].length;
  const end = headings[index + 1]?.index ?? text.length;
  const body = text.slice(start, end).split(/\n\s*А у верстанья/u)[0];
  const city = heading[2].replace(/\s*\.\s*$/u, "").trim();
  return { city, people: parsePeople(body, city) };
});

const orel = sections.find((section) => normalize(section.city) === "орел");
if (!orel) throw new Error("Orel section not found");

const otherPeople = sections.filter((section) => section !== orel).flatMap((section) => section.people);
const familyCityFrequency = new Map();
for (const section of sections) {
  for (const family of new Set(section.people.map((person) => person.family))) {
    familyCityFrequency.set(family, (familyCityFrequency.get(family) ?? 0) + 1);
  }
}

const matches = [];
for (const person of orel.people) {
  for (const candidate of otherPeople) {
    const familyDistance = levenshtein(person.family, candidate.family);
    const fatherDistance = levenshtein(person.father, candidate.father);
    const familyCompatible = familyDistance === 0
      || (familyDistance === 1 && Math.min(person.family.length, candidate.family.length) >= 6);
    const fatherCompatible = fatherDistance === 0
      || (fatherDistance === 1 && Math.min(person.father.length, candidate.father.length) >= 5);
    if (!familyCompatible || !fatherCompatible || familyDistance + fatherDistance > 1) continue;

    matches.push({
      orel: person.display,
      city: candidate.city,
      candidate: candidate.display,
      sameGivenName: person.given === candidate.given,
      fatherDistance,
      familyDistance,
      familyCityFrequency: familyCityFrequency.get(person.family) ?? null,
      candidateFamilyCityFrequency: familyCityFrequency.get(candidate.family) ?? null,
    });
  }
}

const givenFatherFrequency = new Map();
for (const section of sections) {
  for (const person of section.people) {
    const key = `${person.given}|${person.father}`;
    givenFatherFrequency.set(key, (givenFatherFrequency.get(key) ?? 0) + 1);
  }
}

const changedFamilyIdentityCandidates = [];
for (const person of orel.people) {
  for (const candidate of otherPeople) {
    if (person.given !== candidate.given || person.father !== candidate.father) continue;
    if (person.family === candidate.family) continue;
    const key = `${person.given}|${person.father}`;
    changedFamilyIdentityCandidates.push({
      orel: person.display,
      city: candidate.city,
      candidate: candidate.display,
      givenFatherFrequency: givenFatherFrequency.get(key) ?? null,
    });
  }
}

changedFamilyIdentityCandidates.sort((left, right) =>
  (left.givenFatherFrequency ?? 999) - (right.givenFatherFrequency ?? 999)
  || left.city.localeCompare(right.city, "ru"),
);

matches.sort((left, right) =>
  (left.familyDistance + left.fatherDistance) - (right.familyDistance + right.fatherDistance)
  || left.familyDistance - right.familyDistance
  || Number(left.sameGivenName) - Number(right.sameGivenName)
  || (left.familyCityFrequency ?? 999) - (right.familyCityFrequency ?? 999)
  || left.city.localeCompare(right.city, "ru"),
);

console.log(JSON.stringify({
  method: "exact or one-letter normalized patronymic/family match, with at most one edit across the pair; novik entries only",
  sections: sections.length,
  parsedPeople: sections.reduce((sum, section) => sum + section.people.length, 0),
  parsedOrelPeople: orel.people.length,
  matches,
  changedFamilyIdentityCandidateCount: changedFamilyIdentityCandidates.length,
  rareChangedFamilyIdentityCandidates: changedFamilyIdentityCandidates.filter(
    (candidate) => candidate.givenFatherFrequency <= 2,
  ),
}, null, 2));
