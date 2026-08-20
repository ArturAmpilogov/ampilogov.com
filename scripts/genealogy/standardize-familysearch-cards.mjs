import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const peopleDir = path.join(root, "data/genealogy/people");

const surnamePattern = /(?:Ампилогов|Анпилогов|Анпилов)(?:а|ъ)?/gu;
const surnameBase = (value) => value?.match(surnamePattern)?.[0]?.replace(/[аъ]$/u, "") ?? null;
const genderedSurname = (base, sex) => base && sex === "female" ? `${base}а` : base;
const rewriteSurname = (value, base) => typeof value === "string" && base
  ? value.replace(surnamePattern, (surname) => genderedSurname(base, surname.endsWith("а") ? "female" : "male"))
  : value;

const unique = (values) => [...new Set(values.filter(Boolean))];

const people = new Map();
for (const file of (await readdir(peopleDir)).filter((name) => name.endsWith(".json"))) {
  const person = JSON.parse(await readFile(path.join(peopleDir, file), "utf8"));
  people.set(person.personId, person);
}

const explicitlyResolvedSurname = new Map([
  ["FS-3Q9M-CS9F-G4DS-F", "Ампилогов"],
]);

const sourceSurname = (mention) => surnameBase([
  mention.nameAsTranscribed,
  mention.nameAsWritten,
  mention.nameAsIndexed,
  mention.nameAsSupplied,
  ...(mention.alternateNames ?? []),
].find((value) => surnameBase(value)));

const profileSurname = (mention) => mention.personId
  ? surnameBase(people.get(mention.personId)?.displayName)
  : null;

const familyRoles = new Set([
  "child", "child-index-only", "twin", "father", "father-index-only",
  "mother", "mother-index-only", "deceased", "deceased-child", "groom", "bride",
]);

const primaryRoles = new Set([
  "child", "child-index-only", "deceased", "deceased-child", "groom", "bride",
]);

const godparentSplits = {
  "FS-3Q9M-CS92-X818": [
    ["godfather", "Сергий Харитонов [фамилия неуверенно]", "Сергей Харитонович [фамилия неуверенно]", "male"],
    ["godmother", "Ольга [отчество и фамилия неуверенно]", "Ольга [отчество и фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS96-GQCP-1": [
    ["godfather", "Фаддей Григориев [фамилия неуверенно]", "Фаддей Григорьевич [фамилия неуверенно]", "male"],
    ["godmother", "Феодора [отчество и фамилия неуверенно]", "Феодора [отчество и фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS96-GQZW-N": [
    ["godfather", "Иоанн Матвеев [фамилия неуверенно]", "Иван Матвеевич [фамилия неуверенно]", "male"],
    ["godmother", "[восприемница неуверенно]", "[Имя восприемницы не прочитано]", "female"],
  ],
  "FS-3Q9M-CS9B-7SSZ-W": [
    ["godfather", "Фёдор Онифриев [фамилия неуверенно]", "Фёдор Онифриевич [фамилия неуверенно]", "male"],
    ["godmother", "девица [имя неуверенно] Павлова", "[Имя неуверенно] Павлова", "female"],
  ],
  "FS-3Q9M-CS9L-MNMY": [
    ["godfather", "Макарий Петров Волков", "Макарий Петрович Волков", "male"],
    ["godmother", "Пелагия Гуриева [неуверенно]", "Пелагея Гурьевна [фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS9N-J3NL-F": [
    ["godfather", "Антоний Степанович [фамилия неуверенно]", "Антон Степанович [фамилия неуверенно]", "male"],
    ["godmother", "Домникия Филипповна [неуверенно]", "Домникия Филипповна [фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS9N-J3X8-T": [
    ["godfather", "Спиридон Шевченко", "Спиридон Шевченко", "male"],
    ["godmother", "Аксинья Дмитриева [частично неуверенно]", "Аксинья Дмитриевна [фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS9T-GPKP": [
    ["godfather", "Антон Степанов [фамилия неуверенно]", "Антон Степанович [фамилия неуверенно]", "male"],
    ["godmother", "Мария [отчество и фамилия неуверенно]", "Мария [отчество и фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS9X-57H8-J": [
    ["godfather", "Гавриил Стефанов [фамилия неуверенно]", "Гавриил Степанович [фамилия неуверенно]", "male"],
    ["godmother", "Мария Иванова [неуверенно]", "Мария Ивановна [фамилия неуверенно]", "female"],
  ],
  "FS-3Q9M-CS9Y-293C-M": [
    ["godfather", "Иван Игнатьев Новоселецкий", "Иван Игнатьевич Новоселецкий", "male"],
    ["godmother", "[имя неуверенно] Иванова", "[Имя неуверенно] Иванова", "female"],
  ],
  "FS-3QS7-L99H-49C6-1": [
    ["godfather", "Никита Федоров [фамилия неуверенно]", "Никита Фёдорович [фамилия неуверенно]", "male"],
    ["godmother", "Евгения [отчество и фамилия неуверенно]", "Евгения [отчество и фамилия неуверенно]", "female"],
  ],
  "FS-3QS7-L99H-MJBQ": [
    ["godfather", "Пётр Васильев [фамилия неуверенно]", "Пётр Васильевич [фамилия неуверенно]", "male"],
    ["godmother", "Анна Терентьева [фамилия неуверенно]", "Анна Терентьевна [фамилия неуверенно]", "female"],
  ],
};

const modernFieldNames = new Set([
  "child", "twin", "father", "mother", "parent", "parents", "deceased",
  "groom", "bride", "godfather", "godmother", "godparents",
]);

const modernizeFieldValue = (value, familySurname) => {
  if (Array.isArray(value)) return value.map((item) => modernizeFieldValue(item, familySurname));
  return rewriteSurname(value, familySurname);
};

let changedFiles = 0;
let splitPairs = 0;

for (const file of (await readdir(sourcesDir)).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(sourcesDir, file);
  const source = JSON.parse(await readFile(filePath, "utf8"));
  const before = JSON.stringify(source);

  source.mentions = (source.mentions ?? []).flatMap((mention) => {
    if (mention.role !== "godparents" || !godparentSplits[source.sourceId]) return [mention];
    splitPairs += 1;
    return godparentSplits[source.sourceId].map(([role, transcribed, modern, sex], index) => ({
      mentionId: `${source.sourceId}-M${Number(mention.mentionId.match(/-M(\d+)$/)?.[1] ?? 4) + index}`,
      role,
      nameAsTranscribed: transcribed,
      modernName: modern,
      displayName: modern,
      sex,
      personId: null,
      alternateNames: unique([transcribed]),
    }));
  });

  const primaryMention = source.mentions.find((mention) => primaryRoles.has(mention.role));
  const fatherMention = source.mentions.find((mention) => ["father", "father-index-only"].includes(mention.role));
  const familySurname = explicitlyResolvedSurname.get(source.sourceId)
    ?? profileSurname(primaryMention ?? {})
    ?? sourceSurname(primaryMention ?? {})
    ?? profileSurname(fatherMention ?? {})
    ?? sourceSurname(fatherMention ?? {});

  source.mentions = source.mentions.map((mention) => {
    const resolvedSurname = profileSurname(mention)
      ?? (explicitlyResolvedSurname.has(source.sourceId) && familyRoles.has(mention.role)
        ? explicitlyResolvedSurname.get(source.sourceId)
        : sourceSurname(mention))
      ?? (familyRoles.has(mention.role) ? familySurname : null);
    const displayName = rewriteSurname(mention.displayName, resolvedSurname);
    const modernName = rewriteSurname(mention.modernName ?? displayName, resolvedSurname);
    const looksLikePersonName = displayName
      && !displayName.startsWith("[")
      && !/перечислен|чтение|восприемники:/iu.test(displayName);
    return {
      ...mention,
      displayName,
      ...(looksLikePersonName ? { modernName } : {}),
      ...(mention.relationshipNote ? { relationshipNote: rewriteSurname(mention.relationshipNote, familySurname) } : {}),
    };
  });

  if (source.event?.place && !(source.event.place.asWritten || source.event.place.asTranscribed)) {
    source.event.place.asTranscribed = source.event.place.asIndexed ?? source.event.place.normalized;
  }

  if (source.transcription?.modernInterpretation) {
    source.transcription.modernInterpretation = rewriteSurname(source.transcription.modernInterpretation, familySurname);
  }
  if (source.transcription?.fields) {
    for (const [key, value] of Object.entries(source.transcription.fields)) {
      if (modernFieldNames.has(key)) source.transcription.fields[key] = modernizeFieldValue(value, familySurname);
    }
    const split = godparentSplits[source.sourceId];
    if (split) source.transcription.fields.godparents = split.map(([, , modern]) => modern);
  }
  if (source.summary?.text) source.summary.text = rewriteSurname(source.summary.text, familySurname);
  if (source.sourceRelations) {
    source.sourceRelations = source.sourceRelations.map((relation) => ({
      ...relation,
      ...(relation.note ? { note: rewriteSurname(relation.note, familySurname) } : {}),
    }));
  }
  if (source.review?.unresolved) {
    source.review.unresolved = source.review.unresolved.map((value) => rewriteSurname(value, familySurname));
  }

  if (JSON.stringify(source) !== before) {
    await writeFile(filePath, `${JSON.stringify(source, null, 2)}\n`);
    changedFiles += 1;
  }
}

console.log(`Standardized ${changedFiles} FamilySearch cards; split ${splitPairs} godparent pairs.`);
