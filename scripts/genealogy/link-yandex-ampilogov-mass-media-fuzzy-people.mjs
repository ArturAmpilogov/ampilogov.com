#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilogov-mass-media-fuzzy-2026-09-10.json");
const sourceRoot = path.join(root, "data/genealogy/sources");
const peopleRoot = path.join(root, "data/genealogy/people");

const filesRecursive = async (directory) => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(async (entry) => {
  const file = path.join(directory, entry.name);
  return entry.isDirectory() ? filesRecursive(file) : entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
}))).flat();
const normalize = (value) => String(value ?? "").toLowerCase().replaceAll("ё", "е").replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф")
  .replace(/ъ\b/gu, "").replace(/[^а-яa-z0-9]+/gu, " ").trim();
const modern = (value) => String(value).replaceAll("ѣ", "е").replaceAll("і", "и").replaceAll("ѳ", "ф").replace(/ъ\b/gu, "");
const surnamePattern = "(?:Ампилогов(?:а|ой|у|ым|ою)?|Анпилогов(?:а|ой|у|ым|ою)?|Аппилогов(?:а|ой|у|ым|ою)?|Амфилогов(?:а|ой|у|ым|ою)?|Анфилогов(?:а|ой|у|ым|ою)?|Онпилогов(?:а|ой|у|ым|ою)?|Ампилов(?:а|ой|у|ым|ою)?|Анпилов(?:а|ой|у|ым|ою)?)ъ?";
const word = "[А-ЯЁѢІѲ][а-яёѣіѳ]+";
const patronymic = "[А-ЯЁѢІѲ][а-яёѣіѳ]+(?:вич|евич|ич|овна|евна|ична|инична)";
const surnameFirst = new RegExp(`(?<![А-Яа-яЁёѢѣІіѲѳ])(${surnamePattern})[,;:]?\\s+(${word})\\s+(${patronymic})(?![А-Яа-яЁёѢѣІіѲѳ])`, "gu");
const surnameLast = new RegExp(`(?<![А-Яа-яЁёѢѣІіѲѳ])(${word})\\s+(${patronymic})\\s+(${surnamePattern})(?![А-Яа-яЁёѢѣІіѲѳ])`, "gu");
const nominativeSurname = (value, female) => {
  const plain = modern(value).replace(/[ъь]$/u, "").replace(/(?:овой|ою|ой|ым|у)$/u, "");
  const masculine = plain.endsWith("ова") ? plain.slice(0, -1) : plain;
  return female ? `${masculine}а` : masculine;
};
const slug = (value) => normalize(value).replace(/\s+/g, "-");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const currentSourceIds = new Set(manifest.batches.flatMap((batch) => batch.results).map((row) => row.sourceId).filter(Boolean));
const sourceFiles = await filesRecursive(sourceRoot);
const sources = new Map();
for (const file of sourceFiles) {
  try { const value = JSON.parse(await readFile(file, "utf8")); if (currentSourceIds.has(value.sourceId)) sources.set(value.sourceId, { file, value }); } catch {}
}
const peopleFiles = await filesRecursive(peopleRoot);
const peopleByName = new Map();
let nextId = 1;
for (const file of peopleFiles) {
  try {
    const value = JSON.parse(await readFile(file, "utf8"));
    const match = value.personId?.match(/^P(\d+)$/); if (match) nextId = Math.max(nextId, Number(match[1]) + 1);
    if (value.displayName) peopleByName.set(normalize(value.displayName.replace(/\s*\([^)]*\)\s*$/u, "")), { file, value });
  } catch {}
}

let created = 0, linkedExisting = 0, mentionsLinked = 0;
for (const { file, value: source } of sources.values()) {
  if (!source.publicCore || !source.isRecord) continue;
  const literal = source.transcription?.literal ?? "";
  const candidates = [];
  for (const match of literal.matchAll(surnameFirst)) {
    const female = /(?:ова|овой|овою)$/u.test(modern(match[1]));
    if (/(?:ой|ою)$/u.test(modern(match[2])) || /(?:чной|вной)$/u.test(modern(match[3]))) continue;
    candidates.push({ written: match[0], displayName: `${modern(match[2])} ${modern(match[3])} ${nominativeSurname(match[1], female)}`, sex: female ? "female" : "male", surname: nominativeSurname(match[1], female) });
  }
  for (const match of literal.matchAll(surnameLast)) {
    const female = /(?:ова|овой|овою)$/u.test(modern(match[3]));
    candidates.push({ written: match[0], displayName: `${modern(match[1])} ${modern(match[2])} ${nominativeSurname(match[3], female)}`, sex: female ? "female" : "male", surname: nominativeSurname(match[3], female) });
  }
  const unique = [...new Map(candidates.map((candidate) => [normalize(candidate.displayName), candidate])).values()];
  if (!unique.length) continue;
  const mentions = [];
  for (const [index, candidate] of unique.entries()) {
    const key = normalize(candidate.displayName);
    let entry = peopleByName.get(key);
    if (!entry) {
      const personId = `P${String(nextId++).padStart(6, "0")}`;
      const person = {
        schemaVersion: 1,
        personId,
        displayName: candidate.displayName,
        sex: candidate.sex,
        nameVariants: [candidate.displayName],
        surname: { normalized: candidate.surname, formsAsWritten: [candidate.written.match(new RegExp(surnamePattern, "u"))?.[0] ?? candidate.surname] },
        sourceIds: [source.sourceId],
        status: "documented-from-primary-scan",
        places: [],
        notes: [`Полное имя извлечено из газетного первичного скана ${source.event?.date?.display ?? "без даты"}; связь с однофамильцами не предполагается без отдельного доказательства.`],
      };
      const personFile = path.join(peopleRoot, `${personId}-${slug(candidate.displayName)}.json`);
      await writeFile(personFile, `${JSON.stringify(person, null, 2)}\n`);
      entry = { file: personFile, value: person };
      peopleByName.set(key, entry);
      created++;
    } else {
      entry.value.sourceIds = [...new Set([...(entry.value.sourceIds ?? []), source.sourceId])].sort();
      await writeFile(entry.file, `${JSON.stringify(entry.value, null, 2)}\n`);
      linkedExisting++;
    }
    mentions.push({ mentionId: `${source.sourceId}-M${index + 1}`, role: "named-person", personId: entry.value.personId, displayName: entry.value.displayName, nameAsTranscribed: candidate.written, surnameSeries: true });
    mentionsLinked++;
  }
  source.mentions = mentions;
  await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
}

console.log(JSON.stringify({ createdProfiles: created, linkedExistingProfiles: linkedExisting, linkedMentions: mentionsLinked }, null, 2));
