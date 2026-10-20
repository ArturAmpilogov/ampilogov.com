// Creates people profiles for surname-line people who are named in public
// Records but still have no `personId`, and links Record ↔ profile both ways.
//
// Identity policy (docs/research/genealogy-data-entry-rules.md, §2 and §4.1):
// - one mention becomes one profile; similar names in different Records are not
//   merged, only linked as "possibly the same person" research leads;
// - the single exception is a married couple: the same full name of the husband
//   and the same name of the wife in the same parish identify one family, so
//   the parents' repeated appearances share one profile (an existing one when
//   it already carries that couple);
// - mentions without a personal name, with a doubtfully read surname, or used
//   only for comparison stay without a profile (see `mentionProfileGap`).
//
// Usage: node scripts/genealogy/backfill-mention-profiles.mjs [--apply]
import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";

const root = process.cwd();
const apply = process.argv.includes("--apply");
const today = "2026-10-19";
const ts = createRequire(path.join(root, "package.json"))("typescript");
const genealogyRoot = path.join(root, "data/genealogy");
const peopleDir = path.join(genealogyRoot, "people");
const reportFile = path.join(genealogyRoot, "searches", `mention-profile-backfill-${today}.json`);
const firstNewId = 110001;

// Records handled by hand in the same change (Kozlov Anfilov family).
const manualSourceIds = new Set([
  "PUB-DOMPREDKOV-1687-KOZLOV-BORIS-ANFILOV",
  "PUB-DOMPREDKOV-1700-KOZLOV-RODION-ANFILOV",
  "PUB-DOMPREDKOV-1703-KOZLOV-SILA-ANFILOV",
]);

function loadGenealogyModule() {
  const file = path.join(root, "src/lib/genealogy.ts");
  const output = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, resolveJsonModule: true },
  }).outputText;
  const loaded = new Module(file);
  loaded.filename = file;
  loaded.paths = Module._nodeModulePaths(path.dirname(file));
  loaded._compile(output, file);
  return loaded.exports;
}

// ---------------------------------------------------------------------------
// Format-preserving JSON edits: locate value spans and insert text, so a
// one-field change does not reformat a hand-written file.

function parseSpans(text) {
  let i = 0;
  const skip = () => { while (i < text.length && /\s/.test(text[i])) i += 1; };
  const string = () => {
    const start = i;
    i += 1;
    while (text[i] !== "\"") i += text[i] === "\\" ? 2 : 1;
    i += 1;
    return { type: "string", start, end: i, value: JSON.parse(text.slice(start, i)) };
  };
  const value = () => {
    skip();
    const start = i;
    if (text[i] === "{") {
      i += 1;
      const entries = [];
      skip();
      if (text[i] === "}") { i += 1; return { type: "object", start, end: i, entries }; }
      for (;;) {
        skip();
        const key = string();
        skip();
        i += 1;
        entries.push({ key: key.value, keyStart: key.start, node: value() });
        skip();
        if (text[i] === ",") { i += 1; continue; }
        i += 1;
        return { type: "object", start, end: i, entries };
      }
    }
    if (text[i] === "[") {
      i += 1;
      const items = [];
      skip();
      if (text[i] === "]") { i += 1; return { type: "array", start, end: i, items }; }
      for (;;) {
        items.push(value());
        skip();
        if (text[i] === ",") { i += 1; continue; }
        i += 1;
        return { type: "array", start, end: i, items };
      }
    }
    if (text[i] === "\"") return string();
    const literal = /^(?:-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i, i + 64));
    i += literal[0].length;
    return { type: "literal", start, end: i };
  };
  return value();
}

const entryOf = (node, key) => node.entries.find((entry) => entry.key === key);

function indentAfter(text, position) {
  const match = /^[ \t]*\n([ \t]*)/.exec(text.slice(position));
  return match ? match[1] : null;
}

function formatValue(value, indent) {
  if (indent === null) return JSON.stringify(value).replace(/":/g, "\": ").replace(/,"/g, ", \"");
  return JSON.stringify(value, null, 2).split("\n").map((line, index) => index ? `${indent}${line}` : line).join("\n");
}

function setProperty(text, objectNode, key, value, afterKey) {
  const existing = entryOf(objectNode, key);
  if (existing) {
    return { text: text.slice(0, existing.node.start) + JSON.stringify(value) + text.slice(existing.node.end), offset: existing.node.start };
  }
  const anchor = afterKey ? entryOf(objectNode, afterKey) : null;
  const indent = objectNode.entries.length ? indentAfter(text, objectNode.start + 1) : null;
  const separator = text.slice(objectNode.entries[0]?.keyStart ?? objectNode.start, (objectNode.entries[0]?.node.start ?? objectNode.start)).includes("\": ") ? "\": " : "\":";
  const property = `"${key}${separator}${formatValue(value, indent)}`;
  if (anchor) {
    const insert = indent === null ? `, ${property}` : `,\n${indent}${property}`;
    return { text: text.slice(0, anchor.node.end) + insert + text.slice(anchor.node.end), offset: anchor.node.end };
  }
  if (!objectNode.entries.length) {
    return { text: `${text.slice(0, objectNode.start + 1)}${property}${text.slice(objectNode.end - 1)}`, offset: objectNode.start };
  }
  const position = objectNode.start + 1;
  const insert = indent === null
    ? `${text[position] === " " ? " " : ""}${property},`
    : `\n${indent}${property},`;
  return { text: text.slice(0, position) + insert + text.slice(position), offset: position };
}

function appendToArray(text, arrayNode, value) {
  if (!arrayNode.items.length) {
    return text.slice(0, arrayNode.start) + JSON.stringify([value]).replace(/":/g, "\": ").replace(/,"/g, ", \"") + text.slice(arrayNode.end);
  }
  const last = arrayNode.items.at(-1);
  const indent = indentAfter(text, arrayNode.start + 1);
  const insert = indent === null ? `, ${formatValue(value, null)}` : `,\n${indent}${formatValue(value, indent)}`;
  return text.slice(0, last.end) + insert + text.slice(last.end);
}

// ---------------------------------------------------------------------------
// Names.

const surnamePattern = /(?:ампилог|ампилов|импилов|амфилог|амфилов|анпилог|анпилов|анфилог|анфилоф|анфилат|анфилов|онфилог|онфилоф|онпилог|антилог|анпалов|ампелог|ампелов|анпелог|анпилос|анпиног|анплог|апилог|аппилог|аппелог|аминлог|аменлог|анлог|анклог|анлилог|анинлог|арепилог|алеплог|анчислог)/i;
const isSurname = (token) => surnamePattern.test(token.replace(/ѳ/gi, "ф"));

function modernOrthography(value) {
  return value
    .replace(/ѣ/g, "е").replace(/Ѣ/g, "Е")
    .replace(/[іїі]/g, "и").replace(/[ІЇ]/g, "И")
    .replace(/ѳ/g, "ф").replace(/Ѳ/g, "Ф")
    .replace(/ѵ/g, "и").replace(/Ѵ/g, "И")
    .replace(/[ъЪ](?=$|[\s,.;:)\]-])/g, "");
}

const fatherNominative = (genitive) => {
  if (genitive === "Ильи") return { name: "Илья", male: "Ильич", female: "Ильинична" };
  if (genitive === "Фомы") return { name: "Фома", male: "Фомич", female: "Фоминична" };
  if (genitive === "Луки") return { name: "Лука", male: "Лукич", female: "Лукинична" };
  if (genitive === "Никиты") return { name: "Никита", male: "Никитич", female: "Никитична" };
  if (genitive === "Кузьмы") return { name: "Кузьма", male: "Кузьмич", female: "Кузьминична" };
  if (/ия$/.test(genitive)) { const stem = genitive.slice(0, -2); return { name: `${stem}ий`, male: `${stem}ьевич`, female: `${stem}ьевна` }; }
  if (/ея$/.test(genitive)) { const stem = genitive.slice(0, -2); return { name: `${stem}ей`, male: `${stem}еевич`, female: `${stem}еевна` }; }
  if (/[бвгдзклмнпрстфхжшщч]а$/.test(genitive)) { const stem = genitive.slice(0, -1); return { name: stem, male: `${stem}ович`, female: `${stem}овна` }; }
  return null;
};

const possessivePatronymic = (form, female) => {
  if (/ов$|ова$/.test(form)) return form.replace(/ова?$/, female ? "овна" : "ович");
  if (/ев$|ева$/.test(form)) return form.replace(/ева?$/, female ? "евна" : "евич");
  return null;
};

const surnameForSex = (surname, female) => {
  if (female) return /(?:ов|ев|ин)$/.test(surname) ? `${surname}а` : surname;
  return surname.replace(/(ов|ев|ин)а$/, "$1").replace(/(ов|ев|ин)ой$/, "$1");
};

// Old-style patronymic "Николаев/Николаева" → "Николаевич/Николаевна".
const modernPatronymic = (form, female) => {
  if (!/^[А-ЯЁ][а-яё]+(?:ов|ев|ова|ева)$/.test(form)) return form;
  const stem = form.replace(/а$/, "").replace(/(?<!тр)иев$/, "ьев");
  return female ? `${stem}на`.replace(/(ов|ев)на$/, "$1на") : `${stem}ич`;
};

// Public names use the project's canonical "Фёдор" (scripts/genealogy/normalize-feodor-public-names.mjs).
const canonicalFeodor = (value) => value
  .replace(/Феодорович/g, "Фёдорович")
  .replace(/Феодоровна/g, "Фёдоровна")
  .replace(/Феодор(?=$|[^А-Яа-яЁё])/gu, "Фёдор");

function profileDisplayName(raw, female, personalNameSegment) {
  return canonicalFeodor(rawProfileDisplayName(raw, female, personalNameSegment));
}

function rawProfileDisplayName(raw, female, personalNameSegment) {
  let value = modernOrthography(raw.normalize("NFKC")).replace(/\s+/g, " ").trim();
  // Leading status words ("девица", "крестьянин", "крна") are not part of the name.
  while (/^[а-яё]/.test(value) && /\s[А-ЯЁ]/.test(value)) value = value.replace(/^\S+\s+/, "");
  // "Евдоким Семёнович — сын Анны Анпилоговой": the surname comes from the parent.
  let match = value.match(/^(.+?)\s+—\s+(сын|дочь)\s+\S+\s+(\S+)$/);
  if (match && isSurname(match[3])) return `${match[1]} ${surnameForSex(match[3], match[2] === "дочь")}`;
  // Trailing editorial remarks: "(отчество «Федор…»)", "— форма публикации".
  value = value.replace(/\s+\((?=[а-яё«])[^)]*\)$/, "").replace(/\s+—\s+[а-яё].*$/, "");
  // "Ивана Ампилова жена Марфа Иванова" (rule 1.1: the husband's name is not a patronymic).
  match = value.match(/^(?:\S+\s+)*?(\S+)\s+жена(?:\s+его)?\s+(\S+)(?:\s+(\S+))?$/);
  if (match && isSurname(match[1])) {
    return [match[2], match[3] ? modernPatronymic(match[3], true) : null, surnameForSex(match[1], true)].filter(Boolean).join(" ");
  }
  // "Анна Ивановна, жена Петра Гавриловича Анпилогова" → "Анна Ивановна Анпилогова".
  match = value.match(/^([^,]+?),?\s+жена\s+(?:\S+\s+)*?(\S+)$/);
  if (match && isSurname(match[2])) {
    const ownTokens = match[1].split(" ");
    const ownSurname = ownTokens.length > 1 && /(?:ова|ева|ина|ая)$/.test(ownTokens.at(-1)) && !/(?:вна|чна)$/.test(ownTokens.at(-1));
    return ownSurname ? match[1] : `${match[1]} ${surnameForSex(match[2], true)}`;
  }
  // "Ефрем Филимонов сын Анфилов", "Пелагея Ефимова дочь Анпилогова".
  match = value.match(/^(\S+)\s+(\S+)\s+(сын|дочь)\s+(\S+)$/);
  if (match && isSurname(match[4])) {
    const patronymic = possessivePatronymic(match[2], match[3] === "дочь");
    if (patronymic) return `${match[1]} ${patronymic} ${surnameForSex(match[4], match[3] === "дочь")}`;
  }
  // "Мария, дочь Семена Антилогова".
  match = value.match(/^([^,]+?),\s+(сын|дочь)\s+(\S+)\s+(\S+)$/);
  if (match && isSurname(match[4])) {
    const father = fatherNominative(match[3]);
    if (father) {
      const isFemale = match[2] === "дочь";
      return `${match[1]} ${isFemale ? father.female : father.male} ${surnameForSex(match[4], isFemale)}`;
    }
  }
  // "Андрей Ампилогов, крестьянин" and index order "Анпилогов, Иван Иванов".
  value = personalNameSegment(value);
  const tokens = value.split(" ");
  if (tokens.length > 1 && isSurname(tokens[0]) && !tokens.slice(1).some(isSurname)) {
    value = `${tokens.slice(1).join(" ")} ${tokens[0]}`;
  }
  const parts = value.split(" ");
  if (parts.length === 3 && isSurname(parts[2])) {
    const isFemale = /(?:ова|ева|ина|ая)$/.test(parts[2]) || female;
    parts[1] = modernPatronymic(parts[1], isFemale);
    value = parts.join(" ");
  }
  return value.replace(/\s+/g, " ").trim();
}

const nameKey = (value) => modernOrthography(value ?? "").toLocaleLowerCase("ru").replace(/ё/g, "е")
  .replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/[^а-яa-z ]/g, " ").replace(/\s+/g, " ").trim();

const maleNamesInA = new Set(["илья", "никита", "фома", "кузьма", "лука", "савва", "сила", "фока", "мина", "иона", "foma", "аникита", "лукьяна", "данила", "гаврила", "михайла", "ерема", "ермола", "прокопа", "сава", "кирила", "павла"]);

function inferSex(mention, displayName) {
  if (mention.sex === "male" || mention.sex === "female") return mention.sex;
  const tokens = displayName.split(" ").filter((token) => !/[[\]()?]/.test(token));
  const patronymic = tokens.find((token) => /(?:вна|чна|ична)$/i.test(token)) ? "female"
    : tokens.find((token) => /(?:вич|ьич|ич)$/i.test(token) && tokens.indexOf(token) > 0) ? "male" : null;
  if (patronymic) return patronymic;
  const surname = [...tokens].reverse().find(isSurname);
  if (surname) {
    if (/(?:ова|ева|ина|ая)$/i.test(surname)) return "female";
    if (/(?:ов|ев|ин|ий|оф)$/i.test(surname)) return "male";
  }
  const role = mention.role ?? "";
  if (/father|husband|groom|godfather|(?:^|-)son|brother|grandson|nephew|serviceman|soldier|dragoon|reiter|spearman|corporal/.test(role)) return "male";
  if (/mother|daughter|bride|godmother|wife|widow|sister|niece|bondwoman/.test(role)) return "female";
  const given = (tokens[0] ?? "").toLocaleLowerCase("ru");
  if (/[ая]$/.test(given) && !maleNamesInA.has(given)) return "female";
  return given ? "male" : "unknown";
}

// ---------------------------------------------------------------------------
// Translit for file names.

const translitMap = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const slug = (value) => modernOrthography(value).toLocaleLowerCase("ru")
  .split("").map((char) => translitMap[char] ?? char).join("")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60).replace(/-$/, "");

// ---------------------------------------------------------------------------
// Roles.

const fatherRole = (role) => /^(?:father|father-index-only|father-first-entry|father-second-entry)$/.test(role ?? "");
const motherRole = (role) => /^(?:mother|mother-index-only|mother-first-entry|mother-second-entry)$/.test(role ?? "");
const childRole = (role) => /^(?:child|child-first-entry|child-second-entry|child-twin|twin|twin-child|baptized-child|baptized-twin|baptized-child-twin|deceased-child|deceased-son|deceased-daughter|son|daughter|newborn)$/.test(role ?? "");
const wifeLikeRole = (role) => /^(?:mother|mother-index-only|mother-first-entry|mother-second-entry|wife|spouse|widow|deceased-wife|sons-wife|daughter-in-law|deceased-soldiers-widow|widow-census-entry)$/.test(role ?? "");

// ---------------------------------------------------------------------------

const g = loadGenealogyModule();
const recordPaths = JSON.parse(fs.readFileSync(path.join(genealogyRoot, "indexes/record-source-paths.json"), "utf8")).paths;
const sourceFile = (sourceId) => path.join(genealogyRoot, recordPaths[sourceId]);

const peopleFiles = fs.readdirSync(peopleDir).filter((name) => name.endsWith(".json"));
const people = new Map();
for (const name of peopleFiles) {
  const record = JSON.parse(fs.readFileSync(path.join(peopleDir, name), "utf8"));
  people.set(record.personId, { record, file: path.join(peopleDir, name) });
}
const maxNumericId = Math.max(...[...people.keys()].map((id) => Number(id.replace(/^P/, ""))).filter(Number.isFinite));
let nextId = Math.max(firstNewId, maxNumericId + 1);

const sourceCache = new Map();
const readSource = (sourceId) => {
  if (!sourceCache.has(sourceId)) {
    const file = sourceFile(sourceId);
    sourceCache.set(sourceId, { file, record: JSON.parse(fs.readFileSync(file, "utf8")) });
  }
  return sourceCache.get(sourceId).record;
};

const directory = g.getRecordsDirectory();
const wifeMentionRole = (role) => /^(?:mother|mother-index-only|mother-first-entry|mother-second-entry|wife|spouse|widow|deceased-wife)$/.test(role ?? "");
const husbandMentionRole = (role) => /^(?:father|father-index-only|father-first-entry|father-second-entry|husband|household-head|groom|spouse)$/.test(role ?? "");
const childMentionRole = (role) => /^(?:child|baptized-child|deceased-child|deceased-son|deceased-daughter|son|daughter|baptized-twin|child-twin|twin)$/.test(role ?? "");
const feminineSurname = (surname) => (/(?:ов|ев|ин)$/.test(surname) ? `${surname}а` : surname);
function familySurnameForWife(source, index, name) {
  const mention = source.mentions[index];
  if (!wifeMentionRole(mention.role) || !/^[А-ЯЁ]/.test(name ?? "") || /^Имя\s/.test(name) || g.mentionProfileGap(name, null) === "unnamed") return null;
  const tokens = name.replace(/\[[^\]]*\]|\([^)]*\)/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 2) return null;
  const surnameOf = (role) => source.mentions
    .filter((entry, position) => position !== index && entry.personId && role(entry.role))
    .map((entry) => people.get(entry.personId)?.record)
    .filter((profile) => profile && profile.publicCore !== false && !profile.researchSubject && isSurname(profile.surname?.normalized ?? ""))
    .map((profile) => profile.surname.normalized.replace(/(ов|ев|ин)а$/, "$1"));
  const husbands = [...new Set(surnameOf(husbandMentionRole))];
  const children = [...new Set(surnameOf(childMentionRole))];
  const surnames = husbands.length ? husbands : children;
  return surnames.length === 1 ? feminineSurname(surnames[0]) : null;
}

const candidates = [];
const skipped = [];
for (const item of directory.records) {
  if (manualSourceIds.has(item.sourceId)) continue;
  const archive = g.getArchiveRecord(item.sourceId);
  if (!archive) continue;
  const source = readSource(item.sourceId);
  if ((source.mentions ?? []).length !== archive.people.length) continue;
  archive.people.forEach((person, index) => {
    if (person.personId || person.possiblePersonId || person.isResearchObject) return;
    const mention = source.mentions[index];
    if (person.profileGap === "other-surname") {
      // A wife written by personal name only ("Дарья", "Наталья Акентьевна")
      // in a surname-line family gets a profile under her husband's surname.
      const familySurname = !mention.personId && familySurnameForWife(source, index, person.name);
      if (familySurname) candidates.push({ sourceId: item.sourceId, index, mention, archive, archivePerson: person, year: item.year, familySurname });
      return;
    }
    if (mention.personId) {
      // Linked in the data, but the link is hidden as out of scope: a data
      // question for a human, not a missing profile.
      skipped.push({ sourceId: item.sourceId, mentionId: mention.mentionId ?? null, index, name: person.name, reason: "existing-link-out-of-scope", personId: mention.personId });
      return;
    }
    if (person.profileGap) {
      skipped.push({ sourceId: item.sourceId, mentionId: mention.mentionId ?? null, index, name: person.name, reason: person.profileGap });
      return;
    }
    candidates.push({ sourceId: item.sourceId, index, mention, archive, archivePerson: person, year: item.year });
  });
}

// Literal forms written in the document for a person.
const literalForms = (mention) => [mention.nameAsTranscribed, mention.nameAsWritten].filter(Boolean);
const surnameWrittenForPerson = (mention) => literalForms(mention).some((form) => isSurname(form));

const otherSurname = [];
for (const candidate of [...candidates]) {
  const { mention, archivePerson } = candidate;
  if (candidate.familySurname) {
    let base = archivePerson.name.replace(/\[[^\]]*\]|\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
    const parts = base.split(" ");
    const last = parts.at(-1).toLocaleLowerCase("ru").replace(/ь/g, "");
    if (parts.length === 2 && /(?:ова|ева|ина)$/.test(last) && last.slice(0, 4) === candidate.familySurname.toLocaleLowerCase("ru").slice(0, 4)) base = parts[0];
    candidate.displayName = profileDisplayName(`${base} ${candidate.familySurname}`, true, g.mentionPersonalNameSegment);
    candidate.sex = "female";
    candidate.key = nameKey(candidate.displayName);
    candidate.placeId = readSource(candidate.sourceId).event?.place?.placeId ?? null;
    candidate.surnameByHusband = true;
    continue;
  }
  const forms = [mention.modernName ?? mention.displayName ?? archivePerson.name, archivePerson.name, ...archivePerson.alternateNames];
  const roughSex = inferSex(mention, modernOrthography(forms[0]));
  // Prefer the modern form; fall back to a documented form that carries the
  // family surname when the modern one omits it ("Марія Данилова").
  const names = forms.map((form) => profileDisplayName(form, roughSex === "female", g.mentionPersonalNameSegment));
  const primaryTokens = names[0].split(" ");
  const primaryHasOwnOtherSurname = !isSurname(primaryTokens.at(-1) ?? "") && primaryTokens.length >= 3 &&
    /^[А-ЯЁ][а-яё]+(?:ов|ова|ев|ева|ин|ина|ский|ская)$/.test(primaryTokens.at(-1)) && !/(?:вна|чна|вич|ич)$/.test(primaryTokens.at(-1));
  const displayName = names.find((form) => isSurname(form.split(" ").at(-1) ?? ""));
  // A stepchild or a wife written with her own other surname is not a
  // surname-line person (AGENTS.md, rule 3).
  if (!displayName || primaryHasOwnOtherSurname || /приводн/.test(forms[0])) {
    otherSurname.push(candidate);
    candidates.splice(candidates.indexOf(candidate), 1);
    continue;
  }
  candidate.displayName = displayName;
  candidate.sex = inferSex(mention, candidate.displayName);
  candidate.key = nameKey(candidate.displayName);
  candidate.placeId = readSource(candidate.sourceId).event?.place?.placeId ?? null;
  candidate.surnameByHusband = candidate.sex === "female" && wifeLikeRole(mention.role) &&
    !surnameWrittenForPerson(mention);
}

// Couple identity: husband's full name + wife's name in one parish.
const spouseKey = (sourceId, selfRole) => {
  const source = readSource(sourceId);
  const spouse = (source.mentions ?? []).find((entry) => (fatherRole(selfRole) ? motherRole(entry.role) : fatherRole(entry.role)));
  if (!spouse) return null;
  const name = nameKey(profileDisplayName(spouse.modernName ?? spouse.displayName ?? spouse.nameAsTranscribed ?? "", motherRole(spouse.role), g.mentionPersonalNameSegment));
  const tokens = name.split(" ").filter((token) => !isSurname(token));
  return tokens.length ? tokens.join(" ") : null;
};
const coupleKey = (key, placeId, sourceId, role) => {
  if (!placeId || !(fatherRole(role) || motherRole(role))) return null;
  const ownTokens = key.split(" ");
  if (fatherRole(role) && ownTokens.length < 3) return null;
  const spouse = spouseKey(sourceId, role);
  if (!spouse) return null;
  if (motherRole(role)) {
    const source = readSource(sourceId);
    const husband = source.mentions.find((entry) => fatherRole(entry.role));
    const husbandKey = nameKey(profileDisplayName(husband.modernName ?? husband.displayName ?? "", false, g.mentionPersonalNameSegment));
    if (husbandKey.split(" ").length < 3) return null;
    return `${fatherRole(role) ? "h" : "w"}|${ownTokens.filter((token) => !isSurname(token)).join(" ")}|${husbandKey}|${placeId}`;
  }
  return `h|${key}|${spouse}|${placeId}`;
};

// Existing profiles already carrying a couple.
const existingCouples = new Map();
for (const [sourceId] of Object.entries(recordPaths)) {
  const source = readSource(sourceId);
  for (const entry of source.mentions ?? []) {
    if (!entry.personId || !people.has(entry.personId)) continue;
    if (!(fatherRole(entry.role) || motherRole(entry.role))) continue;
    const profile = people.get(entry.personId).record;
    const key = nameKey(profile.displayName);
    const couple = coupleKey(key, source.event?.place?.placeId ?? null, sourceId, entry.role);
    if (!couple) continue;
    if (!existingCouples.has(couple)) existingCouples.set(couple, new Set());
    existingCouples.get(couple).add(entry.personId);
  }
}

// Existing wives by husband: the same husband's wife with the same personal
// name in another entry is the same woman.
// Church and everyday forms of the same personal name.
const givenForms = [["мария", "марья"], ["елизавета", "елисавета"], ["евдокия", "авдотья", "евдокея"], ["наталья", "наталия"], ["дарья", "дария"],
  ["параскева", "прасковья", "парасковья", "прасковия"], ["матрена", "матрона"], ["агафья", "агафия"], ["пелагея", "пелагия"], ["акилина", "акулина"],
  ["ксения", "аксинья"], ["анастасия", "настасья"], ["федора", "феодора"], ["устинья", "иустина"], ["ефимия", "евфимия"], ["татьяна", "татиана"],
  ["федосья", "феодосия"], ["ефросинья", "евфросиния"], ["ирина", "арина"], ["ульяна", "иулиания"], ["аграфена", "агриппина", "агрипина"], ["анисья", "анисия"]];
const givenCanon = new Map(givenForms.flatMap((group) => group.map((name) => [name, group[0]])));
const givenKey = (displayName) => { const first = nameKey(displayName).split(" ")[0] ?? ""; return givenCanon.get(first) ?? first; };
const patronymicKey = (displayName) => {
  const tokens = nameKey(displayName).split(" ");
  return tokens.length >= 3 && /(?:вна|чна)$/.test(tokens[1]) ? tokens[1] : "";
};
// "Игнатьевна" and "Игнатовна", "Фадеевна" and "Фаддеевна", "Митриевна" and
// "Дмитриевна" are one patronymic; "Михайловна" and "Михеевна" are not.
const patronymicStem = (patronymic) => patronymic.replace(/(?:ьевна|евна|овна|инична|ична)$/, "")
  .replace(/([а-я])\1/g, "$1").replace(/^евф/, "еф").replace(/^косьм/, "кузьм").replace(/^митр/, "дмитр")
  .replace(/^иоан/, "иван").replace(/^иосиф/, "осип").replace(/^феод/, "фед").replace(/^симеон/, "семен").replace(/^стефан/, "степан").replace(/ь/g, "");
const samePatronymic = (left, right) => !left || !right || patronymicStem(left) === patronymicStem(right);
const scopedPersonId = (entry) => (entry?.personId && people.get(entry.personId)?.record.publicCore !== false ? entry.personId : null);
const existingWives = new Map();
for (const [sourceId] of Object.entries(recordPaths)) {
  const mentions = readSource(sourceId).mentions ?? [];
  const husband = scopedPersonId(mentions.find((entry) => fatherRole(entry.role)));
  const wife = mentions.find((entry) => motherRole(entry.role));
  const wifeId = scopedPersonId(wife);
  if (!husband || !wifeId) continue;
  const key = `${husband}|${givenKey(people.get(wifeId).record.displayName)}`;
  if (!existingWives.has(key)) existingWives.set(key, new Set());
  existingWives.get(key).add(wifeId);
}

const clusters = new Map();
const addToCluster = (key, candidate) => {
  if (!clusters.has(key)) clusters.set(key, []);
  clusters.get(key).push(candidate);
};
const wives = [];
for (const candidate of candidates) {
  if (motherRole(candidate.mention.role)) { wives.push(candidate); continue; }
  const couple = coupleKey(candidate.key, candidate.placeId, candidate.sourceId, candidate.mention.role);
  const existing = couple ? existingCouples.get(couple) : null;
  if (existing?.size === 1) {
    candidate.linkExisting = [...existing][0];
    continue;
  }
  addToCluster(couple ?? `single|${candidate.sourceId}|${candidate.index}`, candidate);
}
// Provisional ids for husbands so that wives can be grouped by husband.
const clusterIds = new Map();
for (const [key, members] of clusters) {
  const personId = `P${nextId}`;
  nextId += 1;
  clusterIds.set(key, personId);
  for (const member of members) member.personId = personId;
}
const resolvedHusband = (candidate) => {
  const mentions = readSource(candidate.sourceId).mentions;
  const fatherIndex = mentions.findIndex((entry) => fatherRole(entry.role));
  if (fatherIndex < 0) return null;
  const fatherCandidate = candidates.find((other) => other.sourceId === candidate.sourceId && other.index === fatherIndex);
  return fatherCandidate?.linkExisting ?? fatherCandidate?.personId ?? scopedPersonId(mentions[fatherIndex]);
};
const wifeClusters = new Map();
for (const candidate of wives) {
  const husband = resolvedHusband(candidate);
  if (husband) {
    const existing = [...(existingWives.get(`${husband}|${givenKey(candidate.displayName)}`) ?? [])];
    const matching = existing.filter((id) => samePatronymic(patronymicKey(candidate.displayName), patronymicKey(people.get(id).record.displayName)));
    const exact = matching.length > 1
      ? matching.filter((id) => patronymicKey(people.get(id).record.displayName) && patronymicKey(candidate.displayName))
      : matching;
    if (exact.length === 1) {
      candidate.linkExisting = exact[0];
      continue;
    }
    if (existing.length === 1) candidate.possibleExistingWife = existing[0];
    const key = `w|husband:${husband}|${givenKey(candidate.displayName)}`;
    if (!wifeClusters.has(key)) wifeClusters.set(key, []);
    wifeClusters.get(key).push(candidate);
    continue;
  }
  const couple = coupleKey(candidate.key, candidate.placeId, candidate.sourceId, candidate.mention.role);
  const existing = couple ? existingCouples.get(couple) : null;
  if (existing?.size === 1) {
    candidate.linkExisting = [...existing][0];
    continue;
  }
  if (!wifeClusters.has(couple ?? `single|${candidate.sourceId}|${candidate.index}`)) wifeClusters.set(couple ?? `single|${candidate.sourceId}|${candidate.index}`, []);
  wifeClusters.get(couple ?? `single|${candidate.sourceId}|${candidate.index}`).push(candidate);
}
// Different patronymics are kept apart even for the same husband: it is either
// an index misreading or another wife, which only the originals decide.
const splitWifeGroups = [];
for (const [key, members] of wifeClusters) {
  const patronymics = [...new Set(members.map((member) => patronymicKey(member.displayName)).filter(Boolean).map(patronymicStem))];
  if (patronymics.length <= 1) {
    addToCluster(key, members);
    continue;
  }
  const keys = new Set();
  for (const member of members) {
    const patronymic = patronymicKey(member.displayName);
    const memberKey = patronymic ? `${key}|${patronymicStem(patronymic)}` : `single|${member.sourceId}|${member.index}`;
    keys.add(memberKey);
    addToCluster(memberKey, member);
  }
  splitWifeGroups.push([...keys]);
}
for (const [key, members] of clusters) {
  if (clusterIds.has(key)) continue;
  const flat = members.flat();
  clusters.set(key, flat);
  const personId = `P${nextId}`;
  nextId += 1;
  clusterIds.set(key, personId);
  for (const member of flat) member.personId = personId;
}

// ---------------------------------------------------------------------------
// Build new profiles.

const describeRecord = (candidate) => {
  const { archive } = candidate;
  return `«${archive.eventLabel}», ${archive.date}, ${archive.place}`;
};
const roleText = (candidate) => candidate.archivePerson.eventRole ?? candidate.archivePerson.role;
const indexOnly = (source) => /index/i.test(`${source.transcription?.status ?? ""} ${source.review?.status ?? ""} ${source.recordType ?? ""}`) &&
  !source.transcription?.literal;

const husbandNames = new Map(candidates.map((candidate) => [candidate.personId, candidate.displayName]));
const husbandLabel = (personId) => {
  const name = people.get(personId)?.record.displayName ?? husbandNames.get(personId);
  return name ? `${name}, ${personId}` : personId;
};

const newProfiles = [];
for (const [clusterKey, members] of [...clusters].sort((left, right) => clusterIds.get(left[0]).localeCompare(clusterIds.get(right[0]), "en", { numeric: true }))) {
  members.sort((left, right) => (left.year ?? 0) - (right.year ?? 0) || left.sourceId.localeCompare(right.sourceId));
  const lead = members[0];
  const personId = clusterIds.get(clusterKey);
  const allNames = new Set();
  for (const member of members) {
    member.personId = personId;
    for (const value of [
      member.mention.displayName, member.mention.modernName, member.mention.nameAsTranscribed,
      member.mention.nameAsWritten, member.mention.nameAsIndexed, ...(member.mention.alternateNames ?? []),
    ]) if (value?.trim()) allNames.add(value.trim());
  }
  allNames.delete(lead.displayName);
  const surnameToken = [...lead.displayName.split(" ")].reverse().find((token) => isSurname(token))?.replace(/[[\]()?,]/g, "") ?? "";
  const formsAsWritten = [...new Set(members.flatMap((member) => literalForms(member.mention)).filter(isSurname))];
  const sources = members.map((member) => readSource(member.sourceId));
  const allIndexOnly = sources.every(indexOnly);
  const places = [];
  for (const member of members) {
    for (const place of member.mention.places ?? []) {
      const entry = {
        relation: place.relation ?? place.type ?? "origin",
        ...(place.placeId ? { placeId: place.placeId } : {}),
        ...(place.normalized ? { normalized: place.normalized } : {}),
        ...(place.asWritten ? { asWritten: place.asWritten } : {}),
        ...(place.confidence ? { confidence: place.confidence } : {}),
      };
      if (!places.some((existing) => JSON.stringify(existing) === JSON.stringify(entry))) places.push(entry);
    }
  }
  const patronymic = members.map((member) => member.mention.patronymic).find(Boolean);
  const named = lead.sex === "female" ? "Названа" : "Назван";
  const notes = members.map((member) => `${named} в записи ${member.sourceId} (${describeRecord(member)}): ${roleText(member)}.`);
  if (members.length > 1) {
    notes.push(clusterKey.startsWith("w|husband:")
      ? `Упоминания объединены: во всех записях это жена одного и того же мужа (${husbandLabel(clusterKey.split("|")[1].replace("husband:", ""))}) с тем же личным именем.`
      : `Упоминания объединены как одна семья: в одном приходе (${lead.archive.place}) совпадают полное имя мужа и имя жены.`);
  } else {
    notes.push("Профиль заведён по одной записи; тождество с одноимёнными людьми из других записей не установлено.");
  }
  if (members.some((member) => member.surnameByHusband)) {
    notes.push(`Собственная (девичья) фамилия в документе не названа; форма «${surnameToken}» дана по фамилии мужа.`);
  } else if (members.some((member) => literalForms(member.mention).length && !surnameWrittenForPerson(member.mention))) {
    notes.push("При имени в самой записи фамилия не повторена; она дана по семье, названной в той же записи.");
  }
  if (allIndexOnly) notes.push("Известен только по производному указателю: написание, отчество и контекст нужно сверить по оригиналу.");

  const profile = {
    schemaVersion: 1,
    personId,
    displayName: lead.displayName,
    ...(lead.sex === "unknown" ? {} : { sex: lead.sex }),
    ...(patronymic ? { patronymic } : {}),
    ...(allNames.size ? { nameVariants: [...allNames] } : {}),
    surname: { normalized: surnameToken, ...(formsAsWritten.length ? { formsAsWritten } : {}) },
    sourceIds: [...new Set(members.map((member) => member.sourceId))],
    status: allIndexOnly ? "documented-in-index-only-original-needed" : "documented-from-record-mention-identity-unverified",
    ...(places.length ? { places } : {}),
    notes,
    profileOrigin: {
      method: "backfill-from-record-mentions",
      createdOn: today,
      mentions: members.map((member) => ({ sourceId: member.sourceId, mentionId: member.mention.mentionId ?? null, index: member.index })),
      ...(members.length > 1 ? { identityBasis: `couple:${clusterKey}` } : {}),
    },
  };
  newProfiles.push({ profile, members });
}

// Person id per (sourceId, mention index) after this run, including links.
const assigned = new Map();
for (const candidate of candidates) {
  assigned.set(`${candidate.sourceId}#${candidate.index}`, candidate.linkExisting ?? candidate.personId);
}
const newProfileById = new Map(newProfiles.map((entry) => [entry.profile.personId, entry.profile]));
const personOf = (sourceId, index, mention) => assigned.get(`${sourceId}#${index}`) ?? mention.personId ?? null;
const sexOf = (personId) => (newProfileById.get(personId) ?? people.get(personId)?.record)?.sex;

// In-record family relations.
const relationAdds = new Map();
const addRelation = (personId, relation) => {
  if (!personId || personId === relation.personId) return;
  if (!relationAdds.has(personId)) relationAdds.set(personId, []);
  const list = relationAdds.get(personId);
  const existing = [
    ...list,
    ...((newProfileById.get(personId) ?? people.get(personId)?.record)?.relations ?? []),
  ];
  if (existing.some((entry) => entry.type === relation.type && entry.personId === relation.personId)) return;
  list.push(relation);
};
const touchedSourceIds = new Set(candidates.map((candidate) => candidate.sourceId));
for (const sourceId of touchedSourceIds) {
  const source = readSource(sourceId);
  const mentions = source.mentions ?? [];
  const ids = mentions.map((mention, index) => personOf(sourceId, index, mention));
  const changed = new Set(mentions.map((_, index) => assigned.has(`${sourceId}#${index}`) ? index : -1).filter((index) => index >= 0));
  if (!changed.size) continue;
  const basis = `Прямо названы в записи ${sourceId}.`;
  const link = (fromIndex, type, toIndex) => {
    if (!ids[fromIndex] || !ids[toIndex] || ids[fromIndex] === ids[toIndex]) return;
    if (!changed.has(fromIndex) && !changed.has(toIndex)) return;
    addRelation(ids[fromIndex], { type, personId: ids[toIndex], sourceIds: [sourceId], basis, confidence: "high" });
  };
  const fathers = mentions.map((mention, index) => (fatherRole(mention.role) ? index : -1)).filter((index) => index >= 0);
  const mothers = mentions.map((mention, index) => (motherRole(mention.role) ? index : -1)).filter((index) => index >= 0);
  const children = mentions.map((mention, index) => (childRole(mention.role) ? index : -1)).filter((index) => index >= 0);
  if (fathers.length <= 1 && mothers.length <= 1 && children.length) {
    for (const child of children) {
      const childSex = sexOf(ids[child]);
      const childType = childSex === "female" ? "daughter-of" : childSex === "male" ? "son-of" : "child-of";
      for (const father of fathers) { link(child, childType, father); link(father, "father-of", child); }
      for (const mother of mothers) { link(child, childType, mother); link(mother, "mother-of", child); }
    }
  }
  if (fathers.length === 1 && mothers.length === 1) {
    link(fathers[0], "spouse-of", mothers[0]);
    link(mothers[0], "spouse-of", fathers[0]);
  }
  const grooms = mentions.map((mention, index) => (mention.role === "groom" ? index : -1)).filter((index) => index >= 0);
  const brides = mentions.map((mention, index) => (mention.role === "bride" ? index : -1)).filter((index) => index >= 0);
  if (grooms.length === 1 && brides.length === 1) {
    link(grooms[0], "spouse-of", brides[0]);
    link(brides[0], "spouse-of", grooms[0]);
  }
  for (const [parentRolePattern, childRoleName] of [[/^(?:bride-father|father-of-bride)$/, "bride"], [/^(?:groom-father|father-of-groom)$/, "groom"]]) {
    const parents = mentions.map((mention, index) => (parentRolePattern.test(mention.role ?? "") ? index : -1)).filter((index) => index >= 0);
    const kids = mentions.map((mention, index) => (mention.role === childRoleName ? index : -1)).filter((index) => index >= 0);
    if (parents.length === 1 && kids.length === 1) {
      const childSex = sexOf(ids[kids[0]]);
      link(kids[0], childSex === "female" ? "daughter-of" : "son-of", parents[0]);
      link(parents[0], "father-of", kids[0]);
    }
  }
}
for (const { profile } of newProfiles) {
  const added = relationAdds.get(profile.personId);
  if (added?.length) {
    profile.relations = [...(profile.relations ?? []), ...added];
    relationAdds.delete(profile.personId);
  }
}

// Namesake leads: same full name (with patronymic) and same place, both ways
// among new profiles and towards existing public profiles.
const profilePlaceIds = (profile) => new Set([
  ...(profile.sourceIds ?? []).map((sourceId) => (recordPaths[sourceId] ? readSource(sourceId).event?.place?.placeId : null)),
  ...(profile.places ?? []).map((place) => (typeof place === "string" ? place : place.placeId)),
].filter(Boolean));
const byKey = new Map();
const indexProfile = (profile) => {
  const key = nameKey(profile.displayName);
  if (key.split(" ").length < 3) return;
  if (!byKey.has(key)) byKey.set(key, []);
  byKey.get(key).push(profile);
};
for (const { record } of people.values()) if (record.publicCore !== false) indexProfile(record);
for (const { profile } of newProfiles) indexProfile(profile);
for (const { profile } of newProfiles) {
  const key = nameKey(profile.displayName);
  const places = profilePlaceIds(profile);
  if (!places.size) continue;
  const namesakes = (byKey.get(key) ?? [])
    .filter((other) => other.personId !== profile.personId)
    .filter((other) => [...profilePlaceIds(other)].some((placeId) => places.has(placeId)))
    .slice(0, 6);
  if (!namesakes.length) continue;
  profile.researchLeads = [{
    label: "Возможно тот же человек",
    status: "same-full-name-same-place-unverified",
    summary: `В том же месте есть профили с тем же полным именем (${namesakes.length}). Тождество не проверено: объединять только после сверки возраста, семьи и прихода.`,
    personIds: namesakes.map((other) => other.personId),
  }];
}

for (const { profile, members } of newProfiles) {
  const possible = [...new Set(members.map((member) => member.possibleExistingWife).filter(Boolean))];
  if (!possible.length) continue;
  profile.researchLeads = [...(profile.researchLeads ?? []), {
    label: "Возможно та же женщина",
    status: "same-husband-same-name-different-patronymic-reading",
    summary: "У того же мужа уже есть профиль жены с тем же личным именем, но с другим отчеством. Это может быть другое чтение или другая жена; тождество не проверено.",
    personIds: possible,
  }];
}

for (const keys of splitWifeGroups) {
  const ids = keys.map((key) => clusterIds.get(key));
  for (const personId of ids) {
    const profile = newProfileById.get(personId);
    const others = ids.filter((id) => id !== personId);
    profile.researchLeads = [...(profile.researchLeads ?? []), {
      label: "Возможно та же женщина",
      status: "same-husband-same-name-different-patronymic-reading",
      summary: "Жена того же мужа с тем же личным именем, но отчество в записях прочитано по-разному. Это может быть ошибка индекса или другая жена; тождество не проверено.",
      personIds: others,
    }];
  }
}

// ---------------------------------------------------------------------------
// Report and apply.

const counts = {
  candidates: candidates.length,
  newProfiles: newProfiles.length,
  linkedToExistingCouple: candidates.filter((candidate) => candidate.linkExisting).length,
  mergedCoupleProfiles: newProfiles.filter((entry) => entry.members.length > 1).length,
  surnameByHusband: candidates.filter((candidate) => candidate.surnameByHusband).length,
  withRelations: newProfiles.filter((entry) => entry.profile.relations?.length).length,
  withNamesakeLeads: newProfiles.filter((entry) => entry.profile.researchLeads?.length).length,
  existingProfilesGettingRelations: relationAdds.size,
  otherSurname: otherSurname.length,
  skipped: Object.fromEntries(Object.entries(Object.groupBy(skipped, (entry) => entry.reason)).map(([reason, list]) => [reason, list.length])),
};
console.log(JSON.stringify(counts, null, 2));

// Several new spouses for one person usually means one wife split in two.
const spouseTargets = new Map();
for (const [personId, list] of [...relationAdds, ...newProfiles.map(({ profile }) => [profile.personId, profile.relations ?? []])]) {
  for (const relation of list) {
    if (relation.type !== "spouse-of") continue;
    if (!spouseTargets.has(personId)) spouseTargets.set(personId, new Set());
    spouseTargets.get(personId).add(relation.personId);
  }
}
const multiSpouse = [...spouseTargets].filter(([, targets]) => targets.size > 1);
console.log(`People with several spouse links added: ${multiSpouse.length}`);
if (process.argv.includes("--spouses")) {
  const nameOf = (personId) => (newProfileById.get(personId) ?? people.get(personId)?.record)?.displayName;
  for (const [personId, targets] of multiSpouse) console.log(`${personId} ${nameOf(personId)} → ${[...targets].map((id) => `${id} ${nameOf(id)}`).join("; ")}`);
}

if (process.argv.includes("--names")) {
  for (const candidate of candidates) {
    const raw = candidate.mention.modernName ?? candidate.mention.displayName ?? candidate.archivePerson.name;
    if (raw !== candidate.displayName || /[,—]|\s(?:сын|дочь|жена)\s|\s[а-яё]{3,}\s/.test(candidate.displayName)) {
      console.log(`${candidate.sourceId}#${candidate.index}\t${candidate.sex}\t${raw}\t→\t${candidate.displayName}`);
    }
  }
}

if (!apply) {
  console.log("Dry run. Pass --apply to write profiles and links.");
  process.exit(0);
}

for (const { profile } of newProfiles) {
  const file = path.join(peopleDir, `${profile.personId}-${slug(profile.displayName) || "person"}.json`);
  fs.writeFileSync(file, `${JSON.stringify(profile, null, 2)}\n`);
}

// Existing profiles: add linked sources and reciprocal relations.
const existingSourceAdds = new Map();
for (const candidate of candidates) {
  if (!candidate.linkExisting) continue;
  if (!existingSourceAdds.has(candidate.linkExisting)) existingSourceAdds.set(candidate.linkExisting, new Set());
  existingSourceAdds.get(candidate.linkExisting).add(candidate.sourceId);
}
for (const personId of new Set([...existingSourceAdds.keys(), ...relationAdds.keys()])) {
  const entry = people.get(personId);
  if (!entry) continue;
  let text = fs.readFileSync(entry.file, "utf8");
  for (const sourceId of existingSourceAdds.get(personId) ?? []) {
    const rootNode = parseSpans(text);
    const sourceIds = entryOf(rootNode, "sourceIds");
    if ((sourceIds?.node.items ?? []).some((item) => JSON.parse(text.slice(item.start, item.end)) === sourceId)) continue;
    text = sourceIds ? appendToArray(text, sourceIds.node, sourceId) : setProperty(text, rootNode, "sourceIds", [sourceId], "displayName").text;
  }
  for (const relation of relationAdds.get(personId) ?? []) {
    const rootNode = parseSpans(text);
    const relations = entryOf(rootNode, "relations");
    text = relations ? appendToArray(text, relations.node, relation) : setProperty(text, rootNode, "relations", [relation], "sourceIds").text;
  }
  JSON.parse(text);
  fs.writeFileSync(entry.file, text);
}

// Sources: write personId into each mention.
const bySource = new Map();
for (const candidate of candidates) {
  if (!bySource.has(candidate.sourceId)) bySource.set(candidate.sourceId, []);
  bySource.get(candidate.sourceId).push(candidate);
}
for (const [sourceId, list] of bySource) {
  const file = sourceCache.get(sourceId).file;
  let text = fs.readFileSync(file, "utf8");
  for (const candidate of list.sort((left, right) => right.index - left.index)) {
    const rootNode = parseSpans(text);
    const mentionNode = entryOf(rootNode, "mentions").node.items[candidate.index];
    text = setProperty(text, mentionNode, "personId", candidate.linkExisting ?? candidate.personId, "mentionId").text;
  }
  const parsed = JSON.parse(text);
  for (const candidate of list) {
    if (parsed.mentions[candidate.index].personId !== (candidate.linkExisting ?? candidate.personId)) throw new Error(`${sourceId}: personId not written`);
  }
  fs.writeFileSync(file, text);
}

fs.writeFileSync(reportFile, `${JSON.stringify({
  schemaVersion: 1,
  generatedOn: today,
  purpose: "Профили и двусторонние ссылки для людей фамильного ряда, названных в публичных Records без карточки человека.",
  counts,
  created: newProfiles.map(({ profile, members }) => ({
    personId: profile.personId,
    displayName: profile.displayName,
    sources: members.map((member) => `${member.sourceId}#${member.index}`),
  })),
  linkedToExisting: candidates.filter((candidate) => candidate.linkExisting).map((candidate) => ({
    source: `${candidate.sourceId}#${candidate.index}`,
    personId: candidate.linkExisting,
    basis: "совпадение полного имени мужа и имени жены в том же приходе",
  })),
  leftWithoutProfile: [
    ...skipped,
    ...otherSurname.map((candidate) => ({ sourceId: candidate.sourceId, mentionId: candidate.mention.mentionId ?? null, index: candidate.index, name: candidate.archivePerson.name, reason: "other-surname" })),
  ],
}, null, 2)}\n`);
console.log(`Written ${newProfiles.length} profiles; report: ${path.relative(root, reportFile)}`);
