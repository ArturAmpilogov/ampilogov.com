import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const peopleDir = path.join(root, "data/genealogy/people");

const unique = (values) => [...new Set(values.filter(Boolean).map((value) => value.trim()).filter(Boolean))];

const modernizeOrthography = (value) => value
  .replace(/ѣ/giu, (letter) => letter === "Ѣ" ? "Е" : "е")
  .replace(/і/giu, (letter) => letter === "І" ? "И" : "и")
  .replace(/ѳ/giu, (letter) => letter === "Ѳ" ? "Ф" : "ф")
  .replace(/ѵ/giu, (letter) => letter === "Ѵ" ? "И" : "и")
  .replace(/ъ(?=\s|$|[.,;:!?])/giu, "")
  .replace(/\s+/g, " ")
  .trim();

const people = new Map();
for (const file of (await readdir(peopleDir)).filter((name) => name.endsWith(".json"))) {
  const person = JSON.parse(await readFile(path.join(peopleDir, file), "utf8"));
  people.set(person.personId, person);
}

let sourceCount = 0;
let mentionCount = 0;

for (const file of (await readdir(sourcesDir)).filter((name) => name.endsWith(".json")).sort()) {
  const filePath = path.join(sourcesDir, file);
  const source = JSON.parse(await readFile(filePath, "utf8"));
  let changed = false;

  source.mentions = (source.mentions ?? []).map((mention) => {
    const profileName = mention.personId ? people.get(mention.personId)?.displayName : null;
    const suppliedName = mention.nameAsSupplied;
    const indexedName = mention.nameAsIndexed;
    const suppliedIsOnlyFirstName = suppliedName?.trim().split(/\s+/).length === 1;
    const indexedHasSurname = indexedName?.trim().split(/\s+/).length > 1;
    const fallbackName = suppliedIsOnlyFirstName && indexedHasSurname
      ? indexedName
      : suppliedName ?? indexedName ?? mention.nameAsTranscribed ?? mention.nameAsWritten;
    const displayName = mention.displayName
      ?? profileName
      ?? mention.modernName
      ?? (fallbackName ? modernizeOrthography(fallbackName) : "Имя не прочитано");
    const displayNameHasFamilyContext = displayName.trim().split(/\s+/).length > 1;
    const alternateNames = unique([
      ...(mention.alternateNames ?? []),
      mention.nameAsWritten,
      mention.nameAsTranscribed,
      mention.nameAsSupplied,
      mention.nameAsIndexed,
    ]).filter((name) => (
      name !== displayName &&
      (!displayNameHasFamilyContext || name.trim().split(/\s+/).length > 1)
    ));

    if (mention.displayName !== displayName || JSON.stringify(mention.alternateNames ?? []) !== JSON.stringify(alternateNames)) {
      changed = true;
    }

    mentionCount += 1;
    return {
      ...mention,
      displayName,
      alternateNames,
    };
  });

  if (changed) {
    await writeFile(filePath, `${JSON.stringify(source, null, 2)}\n`);
    sourceCount += 1;
  }
}

console.log(`Normalized ${mentionCount} mentions in ${sourceCount} source files.`);
