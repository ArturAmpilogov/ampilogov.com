#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesRoot = path.join(root, "data/genealogy/sources");
const peopleRoot = path.join(root, "data/genealogy/people");
const familiesRoot = path.join(root, "data/genealogy/families");

function jsonFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? jsonFiles(target) : entry.name.endsWith(".json") ? [target] : [];
  });
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  const next = `${JSON.stringify(value, null, 2)}\n`;
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  if (previous === next) return false;
  fs.writeFileSync(file, next);
  return true;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

const sourceEntries = jsonFiles(sourcesRoot)
  .map((file) => ({ file, value: readJson(file) }))
  .filter(({ value }) => value.sourceId);
const sources = new Map(sourceEntries.map((entry) => [entry.value.sourceId, entry]));

const personEntries = jsonFiles(peopleRoot).map((file) => ({ file, value: readJson(file) }));
const people = new Map(personEntries.map((entry) => [entry.value.personId, entry]));

const familyEntries = jsonFiles(familiesRoot).map((file) => ({ file, value: readJson(file) }));
const familiesById = new Map(familyEntries.map((entry) => [entry.value.familyId, entry]));

const dirtySources = new Set();
const dirtyPeople = new Set();
let writes = 0;

function source(sourceId) {
  const entry = sources.get(sourceId);
  if (!entry) throw new Error(`Не найден источник ${sourceId}`);
  return entry.value;
}

function mention(sourceId, mentionId) {
  const item = source(sourceId).mentions?.find((candidate) => candidate.mentionId === mentionId);
  if (!item) throw new Error(`Не найдено упоминание ${mentionId} в ${sourceId}`);
  return item;
}

function canonicalSurname(displayName) {
  const word = displayName.trim().split(/\s+/).at(-1)?.replace(/[\[\],.]/g, "");
  if (!word || !/(?:логов|логова|пилов|пилова)$/iu.test(word)) return undefined;
  if (/пилов/iu.test(word) && !/лог/iu.test(word)) return { normalized: "Ампилов", formsAsWritten: [word] };
  return { normalized: "Ампилогов", formsAsWritten: [word] };
}

function dateForRole(sourceValue, role) {
  const event = sourceValue.event ?? {};
  const date = event.date ?? {};
  if (role === "child" && /birth|baptism/u.test(event.type ?? "")) {
    const exact = date.birthIso ?? date.iso;
    return exact ? { birth: { date: exact, ...(event.place?.placeId ? { placeId: event.place.placeId } : {}) } } : {};
  }
  if (/deceased/u.test(role) && /death/u.test(event.type ?? "")) {
    const exact = date.deathIso ?? date.iso;
    return exact ? { death: { date: exact, ...(event.place?.placeId ? { placeId: event.place.placeId } : {}) } } : {};
  }
  return {};
}

function personFromSpec(spec) {
  const sourceValue = source(spec.sourceId);
  const item = mention(spec.sourceId, spec.mentionId);
  const displayName = spec.displayName ?? item.displayName ?? item.modernName;
  const variants = unique([...(item.alternateNames ?? []), item.nameAsIndexed].filter((name) => name && name !== displayName));
  const record = {
    schemaVersion: 1,
    personId: spec.personId,
    displayName,
    sex: spec.sex ?? item.sex ?? "unknown",
    ...(variants.length ? { nameVariants: variants } : {}),
    ...dateForRole(sourceValue, item.role ?? ""),
    ...(item.birthYearEstimated
      ? {
          birthEstimate: {
            year: String(item.birthYearEstimated),
            basis: `${sourceValue.event?.date?.display ?? "Источник"}: указан возраст ${item.age ?? ""}`.trim(),
          },
        }
      : {}),
    ...(spec.parents?.length ? { parents: spec.parents } : {}),
    ...(spec.familyIds?.length ? { familyIds: spec.familyIds } : {}),
    sourceIds: [spec.sourceId],
    status: spec.status ?? "documented-from-primary-scan",
    ...(spec.notes?.length ? { notes: spec.notes } : {}),
    ...(canonicalSurname(displayName) ? { surname: canonicalSurname(displayName) } : {}),
    ...(spec.overrides ?? {}),
  };
  return record;
}

function mergePerson(current, incoming) {
  const result = { ...current, ...incoming };
  for (const key of ["nameVariants", "parents", "familyIds", "sourceIds", "notes"]) {
    const values = unique([...(current[key] ?? []), ...(incoming[key] ?? [])]);
    if (values.length) result[key] = values;
    else delete result[key];
  }
  if (current.birth && incoming.birth) result.birth = { ...current.birth, ...incoming.birth };
  if (current.death && incoming.death) result.death = { ...current.death, ...incoming.death };
  if (current.surname && incoming.surname) {
    result.surname = {
      ...current.surname,
      ...incoming.surname,
      formsAsWritten: unique([...(current.surname.formsAsWritten ?? []), ...(incoming.surname.formsAsWritten ?? [])]),
    };
  }
  return result;
}

function ensurePerson(spec) {
  const incoming = personFromSpec(spec);
  const current = people.get(spec.personId);
  const file = current?.file ?? path.join(peopleRoot, `${spec.personId}-${spec.slug}.json`);
  const value = current ? mergePerson(current.value, incoming) : incoming;
  people.set(spec.personId, { file, value });
  dirtyPeople.add(spec.personId);
}

function link(sourceId, mentionId, personId, { primary = false } = {}) {
  const sourceValue = source(sourceId);
  const item = mention(sourceId, mentionId);
  if (item.personId !== personId) {
    item.personId = personId;
    dirtySources.add(sourceId);
  }
  if (primary && sourceValue.primaryPersonId !== personId) {
    sourceValue.primaryPersonId = personId;
    dirtySources.add(sourceId);
  }
  const personEntry = people.get(personId);
  if (!personEntry) throw new Error(`Ссылка ${sourceId}/${mentionId} ведёт на отсутствующего ${personId}`);
  personEntry.value.sourceIds = unique([...(personEntry.value.sourceIds ?? []), sourceId]);
  dirtyPeople.add(personId);
}

function linkRoles(sourceId, assignments) {
  const sourceValue = source(sourceId);
  const seen = new Set();
  for (const assignment of assignments) {
    const candidates = sourceValue.mentions?.filter((item) => item.role === assignment.role && !seen.has(item.mentionId)) ?? [];
    const item = assignment.mentionId
      ? sourceValue.mentions?.find((candidate) => candidate.mentionId === assignment.mentionId)
      : candidates[assignment.index ?? 0];
    if (!item) throw new Error(`В ${sourceId} нет роли ${assignment.role}`);
    seen.add(item.mentionId);
    link(sourceId, item.mentionId, assignment.personId, { primary: assignment.primary });
  }
}

const personSpecs = [
  { personId: "P0209", slug: "tatiana-anpilova", sourceId: "FS-33S7-8BFW-D64", mentionId: "FS-33S7-8BFW-D64-M1", notes: ["Исповедная роспись 1784 года называет её 32-летней невесткой в осташковском домохозяйстве; муж из фрагмента пока не установлен."] },
  { personId: "P0210", slug: "elisey-ampilov", sourceId: "FS-33S7-9TW3-FG2", mentionId: "FS-33S7-9TW3-FG2-M1", familyIds: ["F0025"] },
  { personId: "P0211", slug: "irina-yakovlevna", sourceId: "FS-33S7-9TW3-FG2", mentionId: "FS-33S7-9TW3-FG2-M2", familyIds: ["F0025"], notes: ["Фамилия в брачной записи 1768 года не указана."] },
  { personId: "P0212", slug: "feoktist-grigorievich-anfilogov", sourceId: "FS-33S7-9TWK-987F", mentionId: "FS-33S7-9TWK-987F-M1", parents: ["P0213"], familyIds: ["F0026"] },
  { personId: "P0213", slug: "grigoriy-anfilogov-kashin", sourceId: "FS-33S7-9TWK-987F", mentionId: "FS-33S7-9TWK-987F-M2", familyIds: ["F0026"] },
  { personId: "P0214", slug: "severian-seliverstovich-ampilogov", sourceId: "FS-3Q9M-CSK4-PWPH-T", mentionId: "FS-3Q9M-CSK4-PWPH-T-M1", parents: ["P0138", "P0215"], familyIds: ["F0027"] },
  { personId: "P0215", slug: "glikeriya-ampilogova", sourceId: "FS-3Q9M-CSK4-PWPH-T", mentionId: "FS-3Q9M-CSK4-PWPH-T-M3", familyIds: ["F0027"] },
  { personId: "P0216", slug: "evfimia-ivanovna-ampilogova", sourceId: "FS-3Q9M-CS92-C9JF-Y", mentionId: "FS-3Q9M-CS92-C9JF-Y-M1", parents: ["P0217"], familyIds: ["F0028"] },
  { personId: "P0217", slug: "ivan-yulianovich-ampilogov", sourceId: "FS-3Q9M-CS92-C9JF-Y", mentionId: "FS-3Q9M-CS92-C9JF-Y-M2", familyIds: ["F0028"] },
  { personId: "P0218", slug: "ekaterina-gavrilovna-anpilogova", sourceId: "FS-3Q9M-CS92-C9V3-6", mentionId: "FS-3Q9M-CS92-C9V3-6-M1", parents: ["P0219", "P0220"], familyIds: ["F0029"] },
  { personId: "P0219", slug: "gavriil-grigorievich-anpilogov", sourceId: "FS-3Q9M-CS92-C9V3-6", mentionId: "FS-3Q9M-CS92-C9V3-6-M2", familyIds: ["F0029"] },
  { personId: "P0220", slug: "varvara-damianovna-anpilogova", sourceId: "FS-3Q9M-CS92-C9V3-6", mentionId: "FS-3Q9M-CS92-C9V3-6-M3", familyIds: ["F0029"] },
  { personId: "P0221", slug: "grigoriy-gavrilovich-anpilogov", sourceId: "FS-3Q9M-CS96-GQZ3-T", mentionId: "FS-3Q9M-CS96-GQZ3-T-M1", parents: ["P0219"], familyIds: ["F0029"], notes: ["Связь с семьёй Екатерины основана на полном имени отца, месте и совместимой хронологии; мать в записи смерти не названа."] },
  { personId: "P0222", slug: "sofia-isidorovna-anpilogova", sourceId: "FS-3Q9M-CS92-X818", mentionId: "FS-3Q9M-CS92-X818-M1", parents: ["P0121", "P0122"], familyIds: ["F0030"] },
  { personId: "P0223", slug: "evdokia-isidorovna-anpilogova", sourceId: "FS-3Q9M-CS96-GQCP-1", mentionId: "FS-3Q9M-CS96-GQCP-1-M1", parents: ["P0121", "P0122"], familyIds: ["F0030"] },
  { personId: "P0224", slug: "natalia-ivanovna-anpilogova-1912", sourceId: "FS-3Q9M-CS96-GQZW-N", mentionId: "FS-3Q9M-CS96-GQZW-N-M1", parents: ["P0225", "P0226"], familyIds: ["F0031"] },
  { personId: "P0225", slug: "ivan-gavrilovich-anpilogov-1912", sourceId: "FS-3Q9M-CS96-GQZW-N", mentionId: "FS-3Q9M-CS96-GQZW-N-M2", familyIds: ["F0031"] },
  { personId: "P0226", slug: "paraskeva-faddeevna-anpilogova-1912", sourceId: "FS-3Q9M-CS96-GQZW-N", mentionId: "FS-3Q9M-CS96-GQZW-N-M3", familyIds: ["F0031"], notes: ["Не объединена с одноимённой супругой Исидора Гавриловича: муж в этой записи другой."] },
  { personId: "P0227", slug: "anna-gavrilovna-anpilogova", sourceId: "FS-3Q9M-CS9B-7SSZ-W", mentionId: "FS-3Q9M-CS9B-7SSZ-W-M1", parents: ["P0119", "P0120"], familyIds: ["F0032"] },
  { personId: "P0228", slug: "pavel-gavrilovich-anpilogov", sourceId: "FS-3Q9M-CS9T-99FM", mentionId: "FS-3Q9M-CS9T-99FM-M1", parents: ["P0119"], familyIds: ["F0032"] },
  { personId: "P0229", slug: "evgenia-gavrilovna-anpilogova", sourceId: "FS-3Q9M-CS9T-M3M4-9", mentionId: "FS-3Q9M-CS9T-M3M4-9-M1", parents: ["P0119", "P0120"], familyIds: ["F0032"] },
  { personId: "P0230", slug: "georgiy-gavrilovich-anpilogov-kyiv", sourceId: "FS-3Q9M-CS9T-P739-B", mentionId: "FS-3Q9M-CS9T-P739-B-M1", parents: ["P0119", "P0120"], familyIds: ["F0032"], notes: ["Не объединён с Георгием Гавриловичем P0116: тот родился в 1910 году в Бахмутском уезде, этот — в 1911 году в Киеве."] },
  { personId: "P0231", slug: "antonina-dmitrievna-anpilogova", sourceId: "FS-3Q9M-CS9B-99F9-W", mentionId: "FS-3Q9M-CS9B-99F9-W-M1", parents: ["P0232", "P0233"], familyIds: ["F0033"] },
  { personId: "P0232", slug: "dmitriy-ivanovich-anpilogov", sourceId: "FS-3Q9M-CS9B-99F9-W", mentionId: "FS-3Q9M-CS9B-99F9-W-M2", familyIds: ["F0033"] },
  { personId: "P0233", slug: "maria-andreevna-anpilogova", sourceId: "FS-3Q9M-CS9B-99F9-W", mentionId: "FS-3Q9M-CS9B-99F9-W-M3", familyIds: ["F0033"], notes: ["Взрослая мать Антонины; не смешивать с одноимённым ребёнком P0239, умершим в 1900 году."] },
  { personId: "P0234", slug: "valentina-alekseevna-anpilogova", sourceId: "FS-3Q9M-CS9B-99JB-6", mentionId: "FS-3Q9M-CS9B-99JB-6-M1", parents: ["P0235", "P0236"], familyIds: ["F0034"] },
  { personId: "P0235", slug: "aleksey-avraamovich-anpilogov", sourceId: "FS-3Q9M-CSSV-K9K7-G", mentionId: "FS-3Q9M-CSSV-K9K7-G-M2", familyIds: ["F0034"], notes: ["Запись 1906 года называет его выходцем из Кромского уезда; в 1915 году он уже записан мелитопольским мещанином."] },
  { personId: "P0236", slug: "akilina-vasilievna-anpilogova", sourceId: "FS-3Q9M-CSSV-K9K7-G", mentionId: "FS-3Q9M-CSSV-K9K7-G-M3", familyIds: ["F0034"] },
  { personId: "P0237", slug: "lyubov-alekseevna-anpilogova", sourceId: "FS-3Q9M-CSSV-K9K7-G", mentionId: "FS-3Q9M-CSSV-K9K7-G-M1", parents: ["P0235", "P0236"], familyIds: ["F0034"] },
  { personId: "P0238", slug: "pankrat-ivanovich-anpilogov", sourceId: "FS-3Q9M-CS9B-99JB-6", mentionId: "FS-3Q9M-CS9B-99JB-6-M4", displayName: "Панкрат Иванович Анпилогов", sex: "male", notes: ["Восприемник в Мелитополе; запись называет его крестьянином села Основа Кромского уезда. Это доказывает поездку или присутствие, но не постоянное переселение."] },
  { personId: "P0239", slug: "maria-andreevna-ampilogova-child", sourceId: "FS-3Q9M-CS9B-99JZ-M", mentionId: "FS-3Q9M-CS9B-99JZ-M-M1", parents: ["P0240"], familyIds: ["F0035"], notes: ["Ребёнок; не смешивать со взрослой Марией Андреевной P0233."] },
  { personId: "P0240", slug: "andrey-emelyanovich-ampilogov", sourceId: "FS-3Q9M-CS9B-99JZ-M", mentionId: "FS-3Q9M-CS9B-99JZ-M-M2", familyIds: ["F0035"] },
  { personId: "P0241", slug: "hariton-filippovich-anpilogov", sourceId: "RGADA-350-2-2436-L367", mentionId: "RGADA-350-2-2436-L367-M1" },
  { personId: "P0242", slug: "potap-grigorievich-anpilogov", sourceId: "RGADA-350-2-2436-L368", mentionId: "RGADA-350-2-2436-L368-M1" },
  { personId: "P0243", slug: "gordey-kuzmich-anpilogov", sourceId: "RGADA-350-2-2436-L369", mentionId: "RGADA-350-2-2436-L369-M1" },
  { personId: "P0244", slug: "nikita-timofeevich-anpilogov", sourceId: "RGADA-350-2-2436-L370", mentionId: "RGADA-350-2-2436-L370-M1" },
  { personId: "P0245", slug: "fedor-merkulovich-antilogov", sourceId: "RGADA-350-2-2436-L371", mentionId: "RGADA-350-2-2436-L371-M1" },
  { personId: "P0246", slug: "afanasiy-yakovlevich-ampilogov", sourceId: "FS-3Q9M-CSS9-HS7H-C", mentionId: "FS-3Q9M-CSS9-HS7H-C-M1", notes: ["Государственный крестьянин из деревни Долгомилевки Орловского уезда; умер в Киеве в 1869 году."] },
  { personId: "P0247", slug: "egor-kosmich-anpilogov", sourceId: "FS-3Q9M-CS9T-TS88-Q", mentionId: "FS-3Q9M-CS9T-TS88-Q-M2", familyIds: ["F0036"] },
  { personId: "P0248", slug: "hristina-konstantinovna-anpilogova", sourceId: "FS-3Q9M-CS9T-TS88-Q", mentionId: "FS-3Q9M-CS9T-TS88-Q-M3", familyIds: ["F0036"] },
  { personId: "P0249", slug: "boris-egorovich-anpilogov", sourceId: "FS-3Q9M-CS9T-TS88-Q", mentionId: "FS-3Q9M-CS9T-TS88-Q-M1", parents: ["P0247", "P0248"], familyIds: ["F0036"] },
  { personId: "P0250", slug: "ksenia-kasianovna-anpilogova", sourceId: "FS-3Q9M-CS9N-J3NL-F", mentionId: "FS-3Q9M-CS9N-J3NL-F-M3", familyIds: ["F0037"] },
  { personId: "P0251", slug: "ivan-gavrilovich-anpilogov-1887", sourceId: "FS-3Q9M-CS9N-J3NL-F", mentionId: "FS-3Q9M-CS9N-J3NL-F-M1", parents: ["P0140", "P0250"], familyIds: ["F0037"] },
  { personId: "P0252", slug: "artemiy-gavrilovich-anpilogov", sourceId: "FS-3QS7-L93Q-J4R", mentionId: "FS-3QS7-L93Q-J4R-M1", parents: ["P0140", "P0250"], familyIds: ["F0037"] },
  { personId: "P0253", slug: "egor-vladimirovich-anpilogov", sourceId: "FS-3QS7-89J5-T4BJ", mentionId: "FS-3QS7-89J5-T4BJ-M2", familyIds: ["F0038"] },
  { personId: "P0254", slug: "vera-alekseevna-anpilogova", sourceId: "FS-3QS7-89J5-T4BJ", mentionId: "FS-3QS7-89J5-T4BJ-M3", familyIds: ["F0038"] },
  { personId: "P0255", slug: "grigoriy-egorovich-anpilogov", sourceId: "FS-3QS7-89J5-T4BJ", mentionId: "FS-3QS7-89J5-T4BJ-M1", parents: ["P0253", "P0254"], familyIds: ["F0038"] },
  { personId: "P0256", slug: "pavel-ivanovich-anpilogov", sourceId: "FS-3QS7-L9JR-BDGY", mentionId: "FS-3QS7-L9JR-BDGY-M2", familyIds: ["F0039"] },
  { personId: "P0257", slug: "maria-maksimovna-anpilogova", sourceId: "FS-3QS7-L9JR-BDGY", mentionId: "FS-3QS7-L9JR-BDGY-M3", familyIds: ["F0039"] },
  { personId: "P0258", slug: "ekaterina-pavlovna-anpilogova", sourceId: "FS-3QS7-L9JR-BDGY", mentionId: "FS-3QS7-L9JR-BDGY-M1", parents: ["P0256", "P0257"], familyIds: ["F0039"] },
  { personId: "P0259", slug: "grigoriy-mikhailovich-anpilogov", sourceId: "FS-9392-MLW4-6", mentionId: "FS-9392-MLW4-6-M1", familyIds: ["F0040"] },
  { personId: "P0260", slug: "anna-timofeevna-yurina", sourceId: "FS-9392-MLW4-6", mentionId: "FS-9392-MLW4-6-M2", familyIds: ["F0040"] },
  { personId: "P0261", slug: "boris-tikhonovich-anpilogov", sourceId: "FS-3Q9M-CS9T-9SQL-S", mentionId: "FS-3Q9M-CS9T-9SQL-S-M1", parents: ["P0104", "P0105"], familyIds: ["F0041"] },
  { personId: "P0262", slug: "evgeniy-tikhonovich-anpilogov", sourceId: "FS-3Q9M-CS9T-GPKP", mentionId: "FS-3Q9M-CS9T-GPKP-M1", parents: ["P0104", "P0105"], familyIds: ["F0041"] },
  { personId: "P0263", slug: "feodosia-timofeevna-anpilogova", sourceId: "FS-3QS7-899H-MV8Y", mentionId: "FS-3QS7-899H-MV8Y-M1", parents: ["P0095", "P0096"], familyIds: ["F0042"] },
  { personId: "P0264", slug: "ivan-timofeevich-anpilogov", sourceId: "FS-3QSQ-G99H-MFFS", mentionId: "FS-3QSQ-G99H-MFFS-M1", parents: ["P0095", "P0096"], familyIds: ["F0042"] },
  { personId: "P0265", slug: "elizaveta-timofeevna-anpilogova", sourceId: "FS-3QS7-899H-MN5G", mentionId: "FS-3QS7-899H-MN5G-M1", parents: ["P0095", "P0096"], familyIds: ["F0042"] },
  { personId: "P0266", slug: "irina-ivanovna-ampilogova", sourceId: "FS-3Q9M-CS9L-H925-2", mentionId: "FS-3Q9M-CS9L-H925-2-M1", parents: ["P0217"], familyIds: ["F0043"] },
  { personId: "P0267", slug: "evdokia-diomidovna-anpilogova", sourceId: "FS-3Q9M-CS9J-39PT-F", mentionId: "FS-3Q9M-CS9J-39PT-F-M1", parents: ["P0113", "P0268"], familyIds: ["F0044"] },
  { personId: "P0268", slug: "anna-semenovna-anpilogova", sourceId: "FS-3Q9M-CS9J-39PT-F", mentionId: "FS-3Q9M-CS9J-39PT-F-M3", familyIds: ["F0044"] },
  { personId: "P0269", slug: "dmitriy-ivanovich-anpilogov-child", sourceId: "FS-3Q9M-CS9X-57H8-J", mentionId: "FS-3Q9M-CS9X-57H8-J-M1", parents: ["P0123", "P0124"], familyIds: ["F0045"], notes: ["Не смешивать с Дмитрием Ивановичем P0232: тот уже взрослый отец в 1916 году."] },
  { personId: "P0270", slug: "aleksey-ivanovich-ampilogov-1849", sourceId: "FS-3Q9M-CSSQ-3W5R-T", mentionId: "FS-3Q9M-CSSQ-3W5R-T-M1", parents: ["P0181", "P0271"], familyIds: ["F0046"] },
  { personId: "P0271", slug: "agrippina-ivanovna-ampilogova", sourceId: "FS-3Q9M-CSSQ-3W5R-T", mentionId: "FS-3Q9M-CSSQ-3W5R-T-M3", familyIds: ["F0046"] },
  { personId: "P0272", slug: "anna-mitrofanovna-gulyaeva", sourceId: "FS-3QHJ-JQMP-5D5", mentionId: "FS-3QHJ-JQMP-5D5-M2", familyIds: ["F0047"] },
  { personId: "P0273", slug: "darya-samoilovna-ampilogova", sourceId: "FS-3QHK-SQ97-RSHH", mentionId: "FS-3QHK-SQ97-RSHH-M2", familyIds: ["F0048"] },
  { personId: "P0274", slug: "domnikia-gavrilovna-ampilogova", sourceId: "FS-3QS7-8937-Z9ZZ-N-STE", mentionId: "FS-3QS7-8937-Z9ZZ-N-STE-M3", familyIds: ["F0049"] },
  { personId: "P0275", slug: "nadezhda-feodosievna-ampilogova", sourceId: "FS-3QS7-L937-8X37", mentionId: "FS-3QS7-L937-8X37-M1", parents: ["P0134", "P0274"], familyIds: ["F0049"] },
  { personId: "P0276", slug: "agafia-feodosievna-ampilogova", sourceId: "FS-3QS7-L937-DC6H", mentionId: "FS-3QS7-L937-DC6H-M1", parents: ["P0134", "P0274"], familyIds: ["F0049"] },
  { personId: "P0277", slug: "maria-ivanovna-ampilogova-privolnoe", sourceId: "FS-3QS7-L937-8531", mentionId: "FS-3QS7-L937-8531-M3", familyIds: ["F0050"] },
  { personId: "P0278", slug: "yulian-semenovich-ampilogov", sourceId: "FS-3QS7-L937-8531", mentionId: "FS-3QS7-L937-8531-M1", parents: ["P0129", "P0277"], familyIds: ["F0050"] },
  { personId: "P0279", slug: "praskovya-mikhailovna-ampilogova", sourceId: "FS-3QSQ-G937-8NDW", mentionId: "FS-3QSQ-G937-8NDW-M3", familyIds: ["F0051"] },
  { personId: "P0217", slug: "ivan-yulianovich-ampilogov", sourceId: "FS-3Q9M-CS9L-H925-2", mentionId: "FS-3Q9M-CS9L-H925-2-M2", familyIds: ["F0028", "F0043"], notes: ["Редкое полное имя связывает возсиятскую запись 1891 года с киевской записью 1895 года; связь вероятная, а не прямая формула переселения."] },
  { personId: "P0113", slug: "diomidi-dmitrievich-anpilogov", sourceId: "FS-3Q9M-CS9J-39PT-F", mentionId: "FS-3Q9M-CS9J-39PT-F-M2", familyIds: ["F0044"] },
  { personId: "P0123", slug: "ivan-nikanorovich-anpilogov", sourceId: "FS-3Q9M-CS9X-57H8-J", mentionId: "FS-3Q9M-CS9X-57H8-J-M2", familyIds: ["F0045"] },
  { personId: "P0124", slug: "maria-ivanovna-anpilogova-nikolaev", sourceId: "FS-3Q9M-CS9X-57H8-J", mentionId: "FS-3Q9M-CS9X-57H8-J-M3", familyIds: ["F0045"] },
  { personId: "P0177", slug: "feodor-pavlovich-ampilogov", sourceId: "FS-3Q9M-CS9Y-XQP2-H", mentionId: "FS-3Q9M-CS9Y-XQP2-H-M1", familyIds: ["F0020"] },
  { personId: "P0178", slug: "anna-damianovna", sourceId: "FS-3Q9M-CS9Y-XQP2-H", mentionId: "FS-3Q9M-CS9Y-XQP2-H-M2", familyIds: ["F0020"] },
  { personId: "P0181", slug: "ivan-pavlovich-ampilogov", sourceId: "FS-3Q9M-CSSQ-3W5R-T", mentionId: "FS-3Q9M-CSSQ-3W5R-T-M2", familyIds: ["F0019", "F0046"] },
  { personId: "P0141", slug: "nikifor-ivanovich-ampilogov", sourceId: "FS-3QHJ-JQMP-5D5", mentionId: "FS-3QHJ-JQMP-5D5-M1", familyIds: ["F0047"] },
  { personId: "P0118", slug: "timofey-zakharovich-ampilogov", sourceId: "FS-3QHK-SQ97-RSHH", mentionId: "FS-3QHK-SQ97-RSHH-M1", familyIds: ["F0048"] },
  { personId: "P0134", slug: "feodosiy-mikhailovich-ampilogov", sourceId: "FS-3QS7-8937-Z9ZZ-N-STE", mentionId: "FS-3QS7-8937-Z9ZZ-N-STE-M2", familyIds: ["F0049"], notes: ["Рождение Стефаниды в 1829 году называет отца полностью и доказывает, что безотчественный «Феодосий» из её смерти 1830 года — тот же человек; профиль P0136 объединён с этим."] },
  { personId: "P0137", slug: "stefanida-feodosievna-ampilogova", sourceId: "FS-3QS7-8937-Z9ZZ-N-STE", mentionId: "FS-3QS7-8937-Z9ZZ-N-STE-M1", parents: ["P0134", "P0274"], familyIds: ["F0049"] },
  { personId: "P0135", slug: "merkuriy-feodosievich-ampilogov", sourceId: "FS-3QS7-L937-8P1F", mentionId: "FS-3QS7-L937-8P1F-M1", parents: ["P0134", "P0274"], familyIds: ["F0049"] },
  { personId: "P0129", slug: "semen-antipovich-ampilogov", sourceId: "FS-3QS7-L937-8531", mentionId: "FS-3QS7-L937-8531-M2", familyIds: ["F0050"] },
  { personId: "P0130", slug: "evdokia-semenovna-ampilogova", sourceId: "FS-3QS7-L937-Z9ZL-4", mentionId: "FS-3QS7-L937-Z9ZL-4-M1", parents: ["P0129", "P0277"], familyIds: ["F0050"] },
  { personId: "P0131", slug: "yulianiya-semenovna-ampilogova", sourceId: "FS-3QS7-L937-85MN", mentionId: "FS-3QS7-L937-85MN-M1", parents: ["P0129", "P0277"], familyIds: ["F0050"] },
  { personId: "P0132", slug: "ivan-mikhailovich-ampilogov", sourceId: "FS-3QSQ-G937-8NDW", mentionId: "FS-3QSQ-G937-8NDW-M2", familyIds: ["F0051"] },
  { personId: "P0133", slug: "fedor-ivanovich-ampilogov", sourceId: "FS-3QSQ-G937-8NDW", mentionId: "FS-3QSQ-G937-8NDW-M1", parents: ["P0132", "P0279"], familyIds: ["F0051"] },
  { personId: "P0280", slug: "safroniy-seliverstovich-ampilogov", sourceId: "FS-3Q9M-CSK4-PWZR-4", mentionId: "FS-3Q9M-CSK4-PWZR-4-M1", parents: ["P0138", "P0215"], familyIds: ["F0027"] },
  { personId: "P0281", slug: "akulina-semenovna-ampilogova", sourceId: "FS-3QS7-L937-8XVX", mentionId: "FS-3QS7-L937-8XVX-M1", parents: ["P0129", "P0277"], familyIds: ["F0050"] },
];

for (const spec of personSpecs) ensurePerson(spec);

const sourceLinks = [
  ["FS-33S7-8BFW-D64", [{ role: "daughter-in-law", personId: "P0209", primary: true }]],
  ["FS-33S7-9TW3-FG2", [{ role: "groom", personId: "P0210", primary: true }, { role: "bride", personId: "P0211" }]],
  ["FS-33S7-9TWK-987F", [{ role: "child", personId: "P0212", primary: true }, { role: "father", personId: "P0213" }]],
  ["FS-3Q9M-CSK4-PWPH-T", [{ role: "child", personId: "P0214", primary: true }, { role: "father", personId: "P0138" }, { role: "mother", personId: "P0215" }]],
  ["FS-3QHK-MQ97-29VW", [{ role: "deceased", personId: "P0214", primary: true }, { role: "father", personId: "P0138" }]],
  ["FS-3Q9M-CS92-C9JF-Y", [{ role: "deceased", personId: "P0216", primary: true }, { role: "father", personId: "P0217" }]],
  ["FS-3Q9M-CS92-C9V3-6", [{ role: "child", personId: "P0218", primary: true }, { role: "father", personId: "P0219" }, { role: "mother", personId: "P0220" }]],
  ["FS-3Q9M-CS96-GQZ3-T", [{ role: "deceased-child", personId: "P0221", primary: true }, { role: "father", personId: "P0219" }]],
  ["FS-3Q9M-CS92-X818", [{ role: "child", personId: "P0222", primary: true }, { role: "father", personId: "P0121" }, { role: "mother", personId: "P0122" }]],
  ["FS-3Q9M-CS96-GQCP-1", [{ role: "child", personId: "P0223", primary: true }, { role: "father", personId: "P0121" }, { role: "mother", personId: "P0122" }]],
  ["FS-3Q9M-CS96-GQZW-N", [{ role: "child", personId: "P0224", primary: true }, { role: "father", personId: "P0225" }, { role: "mother", personId: "P0226" }]],
  ["FS-3Q9M-CS9B-7SSZ-W", [{ role: "child", personId: "P0227", primary: true }, { role: "father", personId: "P0119" }, { role: "mother", personId: "P0120" }]],
  ["FS-3Q9M-CS9T-99FM", [{ role: "deceased", personId: "P0228", primary: true }, { role: "father", personId: "P0119" }]],
  ["FS-3Q9M-CS9T-M3M4-9", [{ role: "child", personId: "P0229", primary: true }, { role: "father", personId: "P0119" }, { role: "mother", personId: "P0120" }]],
  ["FS-3Q9M-CS9T-P739-B", [{ role: "child", personId: "P0230", primary: true }, { role: "father", personId: "P0119" }, { role: "mother", personId: "P0120" }]],
  ["FS-3Q9M-CS9B-99F9-W", [{ role: "child", personId: "P0231", primary: true }, { role: "father", personId: "P0232" }, { role: "mother", personId: "P0233" }]],
  ["FS-3Q9M-CSSV-K9K7-G", [{ role: "child", personId: "P0237", primary: true }, { role: "father", personId: "P0235" }, { role: "mother", personId: "P0236" }]],
  ["FS-3Q9M-CS9B-99JB-6", [{ role: "child", personId: "P0234", primary: true }, { role: "father", personId: "P0235" }, { role: "mother", personId: "P0236" }]],
  ["FS-3Q9M-CS9B-99JZ-M", [{ role: "deceased", personId: "P0239", primary: true }, { role: "father", personId: "P0240" }]],
  ["RGADA-350-2-2436-L367", [{ role: "named-householder", personId: "P0241", primary: true }]],
  ["RGADA-350-2-2436-L368", [{ role: "named-householder", personId: "P0242", primary: true }]],
  ["RGADA-350-2-2436-L369", [{ role: "named-householder", personId: "P0243", primary: true }]],
  ["RGADA-350-2-2436-L370", [{ role: "named-householder", personId: "P0244", primary: true }]],
  ["RGADA-350-2-2436-L371", [{ role: "named-householder", personId: "P0245", primary: true }]],
  ["FS-3Q9M-CSS9-HS7H-C", [{ role: "deceased", personId: "P0246", primary: true }]],
  ["FS-3Q9M-CS9T-TS88-Q", [{ role: "child", personId: "P0249", primary: true }, { role: "father", personId: "P0247" }, { role: "mother", personId: "P0248" }]],
  ["FS-3Q9M-CS9N-J3NL-F", [{ role: "child", personId: "P0251", primary: true }, { role: "father", personId: "P0140" }, { role: "mother", personId: "P0250" }]],
  ["FS-3QS7-L93Q-N3L7", [{ role: "groom", personId: "P0140", primary: true }, { role: "bride", personId: "P0250" }]],
  ["FS-3QS7-L93Q-J4R", [{ role: "child", personId: "P0252", primary: true }, { role: "father", personId: "P0140" }, { role: "mother", personId: "P0250" }]],
  ["FS-3Q9M-CS9N-K7HP", [{ role: "deceased-son", personId: "P0252", primary: true }, { role: "father", personId: "P0140" }]],
  ["FS-3QS7-89J5-T4BJ", [{ role: "child", personId: "P0255", primary: true }, { role: "father", personId: "P0253" }, { role: "mother", personId: "P0254" }]],
  ["FS-3QS7-L9JR-BDGY", [{ role: "child", personId: "P0258", primary: true }, { role: "father", personId: "P0256" }, { role: "mother", personId: "P0257" }]],
  ["FS-9392-MLW4-6", [{ role: "groom", personId: "P0259", primary: true }, { role: "bride", personId: "P0260" }]],
  ["FS-3Q9M-CS9T-9SQL-S", [{ role: "child", personId: "P0261", primary: true }, { role: "father", personId: "P0104" }, { role: "mother", personId: "P0105" }]],
  ["FS-3Q9M-CS9T-GPKP", [{ role: "child", personId: "P0262", primary: true }, { role: "father", personId: "P0104" }, { role: "mother", personId: "P0105" }]],
  ["FS-3QS7-899H-MV8Y", [{ role: "child", personId: "P0263", primary: true }, { role: "father", personId: "P0095" }, { role: "mother", personId: "P0096" }]],
  ["FS-3QSQ-G99H-MFFS", [{ role: "child", personId: "P0264", primary: true }, { role: "father", personId: "P0095" }, { role: "mother", personId: "P0096" }]],
  ["FS-3QS7-899H-MN5G", [{ role: "child", personId: "P0265", primary: true }, { role: "father", personId: "P0095" }, { role: "mother", personId: "P0096" }]],
  ["FS-3Q9M-CS9L-H925-2", [{ role: "deceased", personId: "P0266", primary: true }, { role: "father", personId: "P0217" }]],
  ["FS-3Q9M-CS9J-39PT-F", [{ role: "child", personId: "P0267", primary: true }, { role: "father", personId: "P0113" }, { role: "mother", personId: "P0268" }]],
  ["FS-3Q9M-CS9X-57H8-J", [{ role: "child", personId: "P0269", primary: true }, { role: "father", personId: "P0123" }, { role: "mother", personId: "P0124" }]],
  ["FS-3Q9M-CS9Y-XQP2-H", [{ role: "groom", personId: "P0177", primary: true }, { role: "bride", personId: "P0178" }]],
  ["FS-3Q9M-CSSQ-3W5R-T", [{ role: "child", personId: "P0270", primary: true }, { role: "father", personId: "P0181" }, { role: "mother", personId: "P0271" }]],
  ["FS-3QHJ-JQMP-5D5", [{ role: "groom", personId: "P0141", primary: true }, { role: "bride", personId: "P0272" }]],
  ["FS-3QHK-SQ97-RSHH", [{ role: "groom", personId: "P0118", primary: true }, { role: "bride", personId: "P0273" }]],
  ["FS-3QS7-8937-Z9ZZ-N-STE", [{ role: "child", personId: "P0137", primary: true }, { role: "father", personId: "P0134" }, { role: "mother", personId: "P0274" }]],
  ["FS-3QHV-GQ97-29KV", [{ role: "deceased-daughter", personId: "P0137", primary: true }, { role: "father", personId: "P0134" }]],
  ["FS-3QS7-L937-8P1F", [{ role: "child", personId: "P0135", primary: true }, { role: "father", personId: "P0134" }, { role: "mother", personId: "P0274" }]],
  ["FS-3QS7-L937-8X37", [{ role: "child", personId: "P0275", primary: true }, { role: "father", personId: "P0134" }, { role: "mother", personId: "P0274" }]],
  ["FS-3QS7-L937-DC6H", [{ role: "child", personId: "P0276", primary: true }, { role: "father", personId: "P0134" }, { role: "mother", personId: "P0274" }]],
  ["FS-3QS7-L937-Z9ZL-4", [{ role: "child", personId: "P0130", primary: true }, { role: "father", personId: "P0129" }, { role: "mother", personId: "P0277" }]],
  ["FS-3QS7-L937-8531", [{ role: "child", personId: "P0278", primary: true }, { role: "father", personId: "P0129" }, { role: "mother", personId: "P0277" }]],
  ["FS-3QSQ-G937-8NDW", [{ role: "child", personId: "P0133", primary: true }, { role: "father", personId: "P0132" }, { role: "mother", personId: "P0279" }]],
  ["FS-3Q9M-CSK4-PWZR-4", [{ role: "child", personId: "P0280", primary: true }, { role: "father", personId: "P0138" }, { role: "mother", personId: "P0215" }]],
  ["FS-3QS7-L937-8XVX", [{ role: "child", personId: "P0281", primary: true }, { role: "father", personId: "P0129" }, { role: "mother", personId: "P0277" }]],
];

for (const [sourceId, assignments] of sourceLinks) linkRoles(sourceId, assignments);

// Рождение Стефаниды раскрывает полное имя отца и позволяет снять старый
// временный дубль P0136. Заменяем идентификатор также во вложенных копиях
// источника, а не только в верхнем mentions[].
{
  const replaceId = (value) => {
    if (Array.isArray(value)) return value.map(replaceId);
    if (value && typeof value === "object") {
      for (const [key, entry] of Object.entries(value)) value[key] = replaceId(entry);
      return value;
    }
    return value === "P0136" ? "P0134" : value;
  };
  replaceId(source("FS-3QHV-GQ97-29KV"));
  dirtySources.add("FS-3QHV-GQ97-29KV");
  const stefanida = people.get("P0137");
  stefanida.value.parents = unique((stefanida.value.parents ?? []).map((personId) => personId === "P0136" ? "P0134" : personId));
  dirtyPeople.add("P0137");
}

// Одна индексная строка содержала двух восприемников. Разделяем её, чтобы
// Панкрат не превращался в профиль «Панкрат и Евфросиния».
{
  const sourceId = "FS-3Q9M-CS9B-99JB-6";
  const sourceValue = source(sourceId);
  const combined = mention(sourceId, `${sourceId}-M4`);
  combined.role = "godfather";
  combined.personId = "P0238";
  combined.sex = "male";
  combined.displayName = "Панкрат Иванович Анпилогов";
  combined.modernName = "Панкрат Иванович Анпилогов";
  combined.nameAsTranscribed = "Орловской губерніи, Кромскаго уѣзда, [волость неуверенно], села Основа крестьянинъ Панкратъ Ивановичъ Анпилоговъ";
  combined.alternateNames = ["Панкратъ Ивановичъ Анпилоговъ"];
  combined.places = [{ type: "origin", placeId: "kromy-uezd", asWritten: "Орловской губерніи, Кромскаго уѣзда, [волость неуверенно], села Основа", normalized: "село Основа, Кромской уезд, Орловская губерния", confidence: "medium" }];
  if (!sourceValue.mentions.some((item) => item.mentionId === `${sourceId}-M6`)) {
    sourceValue.mentions.splice(4, 0, {
      mentionId: `${sourceId}-M6`,
      role: "godmother",
      personId: null,
      sex: "female",
      nameAsTranscribed: "Мелитополя Евфросинія [фамилія неуверенно]",
      modernName: "Евфросиния [фамилия неуверенно]",
      displayName: "Евфросиния [фамилия неуверенно]",
      alternateNames: [],
    });
  }
  dirtySources.add(sourceId);
  const personEntry = people.get("P0238");
  personEntry.value.sourceIds = unique([...(personEntry.value.sourceIds ?? []), sourceId]);
  dirtyPeople.add("P0238");
}

function setMigrationPerson(sourceId, personId) {
  const sourceValue = source(sourceId);
  for (const observation of sourceValue.migrationObservations ?? []) {
    if (observation.personId !== personId) {
      observation.personId = personId;
      dirtySources.add(sourceId);
    }
  }
}

setMigrationPerson("FS-3Q9M-CS9N-9FBF", "P0127");
setMigrationPerson("FS-3Q9M-CS9N-J3NL-F", "P0140");
setMigrationPerson("FS-3Q9M-CS9T-TS88-Q", "P0247");
setMigrationPerson("FS-3Q9M-CSS9-HS7H-C", "P0246");
setMigrationPerson("FS-3QS7-89J5-T4BJ", "P0253");
setMigrationPerson("FS-3QS7-L9JR-BDGY", "P0256");
setMigrationPerson("FS-9392-MLW4-6", "P0259");
setMigrationPerson("FS-3QS7-89JT-6H5R", "P0115");

{
  const sourceId = "FS-3Q9M-CSSV-K9K7-G";
  const sourceValue = source(sourceId);
  const observation = {
    personId: "P0235",
    personName: "Алексей Авраамович Анпилогов",
    from: { placeId: "kromy-uezd", asWritten: "Орловской губернии, Кромского уезда, Муравской волости", normalized: "Кромской уезд, Орловская губерния" },
    to: { placeId: "novohryhorivka-haichur", normalized: "Новогригорьевка, Александровский уезд" },
    basis: "Запись прямо называет происхождение отца из Кромского уезда и фиксирует рождение его дочери в Новогригорьевке; к 1915 году он записан мелитопольским мещанином.",
    confidence: "high",
  };
  sourceValue.migrationObservations = [observation];
  dirtySources.add(sourceId);
}

{
  const sourceId = "FS-3Q9M-CS9B-99JB-6";
  const sourceValue = source(sourceId);
  sourceValue.migrationObservations = [{
    personId: "P0238",
    personName: "Панкрат Иванович Анпилогов",
    from: { placeId: "kromy-uezd", asWritten: "село Основа, Кромской уезд", normalized: "Кромской уезд, Орловская губерния" },
    to: { placeId: "melitopol", normalized: "Мелитополь, Таврическая губерния" },
    basis: "Восприемник прямо назван крестьянином села Основа Кромского уезда и присутствует на крещении в Мелитополе. Это доказывает поездку или пребывание, но не постоянное переселение.",
    confidence: "medium",
  }];
  dirtySources.add(sourceId);
}

const familySpecs = [
  { familyId: "F0025", slug: "elisey-irina-family", spouses: ["P0210", "P0211"], children: [], places: ["kashin-tver"], sourceIds: ["FS-33S7-9TW3-FG2"], status: "documented-family" },
  { familyId: "F0026", slug: "grigoriy-feoktist-family", spouses: ["P0213"], children: ["P0212"], places: ["kashin-tver"], sourceIds: ["FS-33S7-9TWK-987F"], status: "documented-family" },
  { familyId: "F0027", slug: "seliverst-glikeriya-family", spouses: ["P0138", "P0215"], children: ["P0280", "P0214"], places: ["shestirnia-dnipropetrovsk", "pryvilne-kherson"], sourceIds: ["FS-3Q9M-CSK4-PWZR-4", "FS-3Q9M-CSK4-PWPH-T", "FS-3QHK-MQ97-29VW"], status: "documented-family" },
  { familyId: "F0028", slug: "ivan-evfimia-family", spouses: ["P0217"], children: ["P0216"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS92-C9JF-Y"], status: "documented-family" },
  { familyId: "F0029", slug: "gavriil-varvara-family", spouses: ["P0219", "P0220"], children: ["P0218", "P0221"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS92-C9V3-6", "FS-3Q9M-CS96-GQZ3-T"], status: "documented-probable-family", notes: ["Григорий связан с этой парой вероятно: совпадают полное имя отца, место и хронология; мать в записи его смерти не названа."] },
  { familyId: "F0030", slug: "isidor-paraskeva-family", spouses: ["P0121", "P0122"], children: ["P0222", "P0223"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS92-X818", "FS-3Q9M-CS96-GQCP-1"], status: "documented-family" },
  { familyId: "F0031", slug: "ivan-paraskeva-family", spouses: ["P0225", "P0226"], children: ["P0224"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS96-GQZW-N"], status: "documented-family" },
  { familyId: "F0032", slug: "gavriil-anna-family", spouses: ["P0119", "P0120"], children: ["P0227", "P0228", "P0229", "P0230"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS9B-7SSZ-W", "FS-3Q9M-CS9T-99FM", "FS-3Q9M-CS9T-M3M4-9", "FS-3Q9M-CS9T-P739-B"], status: "documented-family" },
  { familyId: "F0033", slug: "dmitriy-maria-family", spouses: ["P0232", "P0233"], children: ["P0231"], places: ["melitopol"], sourceIds: ["FS-3Q9M-CS9B-99F9-W"], status: "documented-family" },
  { familyId: "F0034", slug: "aleksey-akilina-family", spouses: ["P0235", "P0236"], children: ["P0237", "P0234"], places: ["novohryhorivka-haichur", "melitopol"], sourceIds: ["FS-3Q9M-CSSV-K9K7-G", "FS-3Q9M-CS9B-99JB-6"], status: "documented-family" },
  { familyId: "F0035", slug: "andrey-maria-child-family", spouses: ["P0240"], children: ["P0239"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS9B-99JZ-M"], status: "documented-family" },
  { familyId: "F0036", slug: "egor-hristina-family", spouses: ["P0247", "P0248"], children: ["P0249"], places: ["kromy-uezd", "kyiv"], sourceIds: ["FS-3Q9M-CS9T-TS88-Q"], status: "documented-family" },
  { familyId: "F0037", slug: "gavriil-ksenia-family", spouses: ["P0140", "P0250"], children: ["P0252", "P0251"], places: ["medyn-uezd", "hurivka-mykolaiv", "pryvilne-kherson"], sourceIds: ["FS-3QS7-L93Q-N3L7", "FS-3QS7-L93Q-J4R", "FS-3Q9M-CS9N-K7HP", "FS-3Q9M-CS9N-J3NL-F"], status: "documented-family" },
  { familyId: "F0038", slug: "egor-vera-family", spouses: ["P0253", "P0254"], children: ["P0255"], places: ["fatezh-uezd", "don-host-oblast"], sourceIds: ["FS-3QS7-89J5-T4BJ"], status: "documented-family" },
  { familyId: "F0039", slug: "pavel-maria-family", spouses: ["P0256", "P0257"], children: ["P0258"], places: ["radovka-rylsk", "bakhmut-uezd"], sourceIds: ["FS-3QS7-L9JR-BDGY"], status: "documented-family" },
  { familyId: "F0040", slug: "grigoriy-anna-yurina-family", spouses: ["P0259", "P0260"], children: [], places: ["bugulma-uezd", "samara"], sourceIds: ["FS-9392-MLW4-6"], status: "documented-family" },
  { familyId: "F0041", slug: "tikhon-paraskeva-family", spouses: ["P0104", "P0105"], children: ["P0106", "P0261", "P0262"], places: ["kyiv"], sourceIds: ["FS-3Q9M-CS9T-X95M-5", "FS-3Q9M-CS9R-B3H7-W", "FS-3Q9M-CS9T-9SQL-S", "FS-3Q9M-CS9T-GPKP"], status: "documented-family" },
  { familyId: "F0042", slug: "timofey-evdokia-family", spouses: ["P0095", "P0096"], children: ["P0097", "P0098", "P0099", "P0263", "P0264", "P0265"], places: ["chuvichi-samara"], sourceIds: ["FS-3QS7-L99H-MNK1", "FS-3QSQ-G99H-MV3D", "FS-3QS7-L99H-49ZC-7", "FS-3QS7-L99H-MNSF", "FS-3QS7-899H-MV8Y", "FS-3QSQ-G99H-MFFS", "FS-3QS7-899H-MN5G"], status: "documented-probable-family", notes: ["Никифор связан с этой семьёй по отцу Тимофею Дмитриевичу, месту и хронологии; мать в его записи смерти не названа."] },
  { familyId: "F0043", slug: "ivan-yulianovich-children", spouses: ["P0217"], children: ["P0216", "P0266"], places: ["vozsiyatske", "kyiv"], sourceIds: ["FS-3Q9M-CS9L-H925-2", "FS-3Q9M-CS92-C9JF-Y"], status: "documented-probable-family", notes: ["Две записи объединены по редкому полному имени отца и совместимой хронологии; прямой формулы переселения между Возсияцким и Киевом нет."] },
  { familyId: "F0044", slug: "diomid-anna-family", spouses: ["P0113", "P0268"], children: ["P0267"], places: ["pryvilne-kherson"], sourceIds: ["FS-3Q9M-CS9J-39PT-F"], status: "documented-family" },
  { familyId: "F0045", slug: "ivan-maria-nikolaev-family", spouses: ["P0123", "P0124"], children: ["P0269"], places: ["nikolaev"], sourceIds: ["FS-3Q9M-CS9X-57H8-J"], status: "documented-family" },
  { familyId: "F0046", slug: "ivan-agrippina-family", spouses: ["P0181", "P0271"], children: ["P0270"], places: ["tymoshivka"], sourceIds: ["FS-3Q9M-CSSQ-3W5R-T"], status: "documented-family" },
  { familyId: "F0047", slug: "nikifor-anna-gulyaeva-family", spouses: ["P0141", "P0272"], children: [], places: ["kaspero-mykolaivka-mykolaiv", "pryvilne-kherson"], sourceIds: ["FS-3QHJ-JQMP-5D5"], status: "documented-family" },
  { familyId: "F0048", slug: "timofey-darya-family", spouses: ["P0118", "P0273"], children: [], places: ["pryvilne-kherson"], sourceIds: ["FS-3QHK-SQ97-RSHH"], status: "documented-family" },
  { familyId: "F0049", slug: "feodosiy-domnikia-family", spouses: ["P0134", "P0274"], children: ["P0137", "P0135", "P0275", "P0276"], places: ["pryvilne-kherson", "kherson-governorate"], sourceIds: ["FS-3QS7-8937-Z9ZZ-N-STE", "FS-3QHV-GQ97-29KV", "FS-3QS7-L937-8P1F", "FS-3QS7-L937-8X37", "FS-3QS7-L937-DC6H"], status: "documented-family" },
  { familyId: "F0050", slug: "semen-maria-family", spouses: ["P0129", "P0277"], children: ["P0130", "P0281", "P0131", "P0278"], places: ["pryvilne-kherson"], sourceIds: ["FS-3QS7-L937-Z9ZL-4", "FS-3QS7-L937-8XVX", "FS-3QS7-L937-8531", "FS-3QSQ-G937-8TYP", "FS-3QS7-L937-85MN"], status: "documented-probable-family", notes: ["Евдокия связана с парой по имени отца, имени матери, месту и хронологии; полное отчество отца раскрывает более поздняя запись о Юлиане."] },
  { familyId: "F0051", slug: "ivan-praskovya-family", spouses: ["P0132", "P0279"], children: ["P0133"], places: ["pryvilne-kherson"], sourceIds: ["FS-3QSQ-G937-8NDW", "FS-3QS7-8937-8PX3"], status: "documented-family" },
];

for (const spec of familySpecs) {
  const current = familiesById.get(spec.familyId);
  const value = current
    ? {
        ...current.value,
        ...spec,
        spouses: unique([...(current.value.spouses ?? []), ...spec.spouses]),
        children: unique([...(current.value.children ?? []), ...spec.children]),
        places: unique([...(current.value.places ?? []), ...spec.places]),
        sourceIds: unique([...(current.value.sourceIds ?? []), ...spec.sourceIds]),
        notes: unique([...(current.value.notes ?? []), ...(spec.notes ?? [])]),
      }
    : { schemaVersion: 1, ...spec };
  const file = current?.file ?? path.join(familiesRoot, `${spec.familyId}-${spec.slug}.json`);
  delete value.slug;
  if (!value.notes?.length) delete value.notes;
  if (writeJson(file, value)) writes += 1;
  familiesById.set(spec.familyId, { file, value });
  for (const personId of unique([...spec.spouses, ...spec.children])) {
    const personEntry = people.get(personId);
    if (!personEntry) throw new Error(`Семья ${spec.familyId} ссылается на отсутствующего ${personId}`);
    personEntry.value.familyIds = unique([...(personEntry.value.familyIds ?? []), spec.familyId]);
    dirtyPeople.add(personId);
  }
}

for (const personId of dirtyPeople) {
  const entry = people.get(personId);
  if (writeJson(entry.file, entry.value)) writes += 1;
}
for (const sourceId of dirtySources) {
  const entry = sources.get(sourceId);
  if (writeJson(entry.file, entry.value)) writes += 1;
}

console.log(`Сверка новых записей завершена: изменено файлов ${writes}; профилей ${people.size}; семей ${familiesById.size}.`);
