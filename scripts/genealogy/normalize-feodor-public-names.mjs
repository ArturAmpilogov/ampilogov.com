import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const write = process.argv.includes("--write");

const jsonFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return jsonFiles(entryPath);
    return entry.name.endsWith(".json") ? [entryPath] : [];
  }))).flat();
};

const normalize = (value) => value
  .replace(/Феодорович/g, "Фёдорович")
  .replace(/Феодоровна/g, "Фёдоровна")
  .replace(/Феодор(?=$|[^А-Яа-яЁё])/gu, "Фёдор");

const changed = [];
const peopleDirectory = path.join(root, "data/genealogy/people");
for (const file of await jsonFiles(peopleDirectory)) {
  const person = JSON.parse(await readFile(file, "utf8"));
  const oldDisplayName = person.displayName;
  const newDisplayName = typeof oldDisplayName === "string" ? normalize(oldDisplayName) : oldDisplayName;
  if (newDisplayName === oldDisplayName) continue;
  person.displayName = newDisplayName;
  person.nameVariants = [...new Set([...(person.nameVariants ?? []), oldDisplayName])];
  if (typeof person.patronymic === "string") person.patronymic = normalize(person.patronymic);
  changed.push(path.relative(root, file));
  if (write) await writeFile(file, `${JSON.stringify(person, null, 2)}\n`);
}

const sourcesDirectory = path.join(root, "data/genealogy/sources");
for (const file of await jsonFiles(sourcesDirectory)) {
  const source = JSON.parse(await readFile(file, "utf8"));
  let dirty = false;
  for (const mention of source.mentions ?? []) {
    const oldModernName = mention.modernName;
    const oldDisplayName = mention.displayName;
    if (typeof oldModernName === "string") mention.modernName = normalize(oldModernName);
    if (typeof oldDisplayName === "string") mention.displayName = normalize(oldDisplayName);
    const oldNames = [oldModernName, oldDisplayName].filter((value, index, values) =>
      typeof value === "string" && normalize(value) !== value && values.indexOf(value) === index
    );
    if (oldNames.length) {
      mention.alternateNames = [...new Set([...(mention.alternateNames ?? []), ...oldNames])];
      dirty = true;
    }
  }
  for (const container of [source.summary, source.transcription]) {
    for (const key of ["text", "modernInterpretation"]) {
      const value = container?.[key];
      if (typeof value !== "string") continue;
      // This sentence deliberately records a wrong index reading; it is not a
      // modern public form of the person's name.
      if (/индексное имя.+Феодор.+исправлено/u.test(value)) continue;
      const normalized = normalize(value);
      if (normalized !== value) {
        container[key] = normalized;
        dirty = true;
      }
    }
  }
  if (!dirty) continue;
  changed.push(path.relative(root, file));
  if (write) await writeFile(file, `${JSON.stringify(source, null, 2)}\n`);
}

console.log(`${write ? "Изменено" : "Будет изменено"}: ${changed.length} файлов.`);
for (const file of changed) console.log(file);
