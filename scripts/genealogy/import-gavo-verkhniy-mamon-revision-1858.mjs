import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const SOURCE = "GAVO-I18-O1-D629-VERKHNIY-MAMON-REVISION-1858";
const placeId = "verkhniy-mamon";

const people = [
  { id: "P0630", slug: "anisim-filippovich-anpilov", name: "Анисим Филиппович Анпилов", written: "Анисим Филипов Анпилов", surname: "Анпилов", age: 44, row: 157, note: "В его дворе отдельно назван 17-летний воспитанник Андрей Иванов Стреляев; биологическое родство не утверждается." },
  { id: "P0631", slug: "andrey-ivanovich-anpilogov-verkhniy-mamon", name: "Андрей Иванович Анпилогов", written: "Андрей Иванов Анпилогов", surname: "Анпилогов", age: 49, row: 186, leaf: "234" },
  { id: "P0632", slug: "efim-ageevich-anpilogov", name: "Ефим Агеевич Анпилогов", written: "Ефим Агеев Анпилогов", surname: "Анпилогов", age: 46, row: 273, leaf: "338" },
  { id: "P0633", slug: "ilya-davydovich-anpilogov", name: "Илья Давыдович Анпилогов", written: "Илья Давыдов Анпилогов", surname: "Анпилогов", row: 274, died: "1857" },
  { id: "P0634", slug: "petr-petrovich-anpilogov", name: "Пётр Петрович Анпилогов", written: "Петр Петров Анпилогов", surname: "Анпилогов", age: 41, row: 275, leaf: "341" },
  { id: "P0635", slug: "vasily-fedorovich-anplogov", name: "Василий Фёдорович Анплогов", written: "Василий Федоров Анплогов", surname: "Анплогов", age: 59, row: 276 },
  { id: "P0636", slug: "yakov-gavrilovich-anpilogov", name: "Яков Гаврилович Анпилогов", written: "Яков Гаврилов Анпилогов", surname: "Анпилогов", age: 59, row: 367 },
  { id: "P0637", slug: "dmitry-fedorovich-anpilogov", name: "Дмитрий Фёдорович Анпилогов", written: "Дмитрий Федоров Анпилогов", surname: "Анпилогов", age: 54, row: 390, leaf: "489" },
  { id: "P0638", slug: "petr-timofeevich-anpilogov", name: "Пётр Тимофеевич Анпилогов", written: "Петр Тимофеев Анпилогов", surname: "Анпилогов", age: 32, ageYear: 1850, row: 391, note: "В ревизской выписке возраст 32 года отнесён к 1850 году; отмечено, что с 1847 года он находился «в безвестной отлучке»; направление его выбытия не названо." },
  { id: "P0639", slug: "yakov-petrovich-anpilogov", name: "Яков Петрович Анпилогов", written: "Яков Петров Анпилогов", surname: "Анпилогов", age: 41, row: 441, leaf: "545" },
  { id: "P0640", slug: "ivan-petrovich-anpilogov", name: "Иван Петрович Анпилогов", written: "Иван Петров Анпилогов", surname: "Анпилогов", age: 41, row: 442 },
  { id: "P0641", slug: "aleksey-arsenovich-anpilogov", name: "Алексей Арсенович Анпилогов", written: "Алексей Арсенов Анпилогов", surname: "Анпилогов", age: 64, row: 448 },
  { id: "P0642", slug: "andrey-ivanovich-strelyaev", name: "Андрей Иванович Стреляев", written: "Андрей Иванов Стреляев", surname: "Стреляев", age: 17, row: 157, note: "Назван воспитанником во дворе 44-летнего Анисима Филипповича Анпилова. Это социальная, а не автоматически биологическая связь." },
];

for (const person of people) {
  const baseYear = person.ageYear ?? 1858;
  const estimatedBirthYear = person.age ? baseYear - person.age : undefined;
  writeJson(path.join(peopleDir, `${person.id}-${person.slug}.json`), {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: "male",
    surname: { normalized: person.surname, formsAsWritten: [person.surname] },
    sourceIds: [SOURCE],
    status: "documented-from-published-revision-transcription",
    ...(estimatedBirthYear ? { birth: { display: `около ${estimatedBirthYear}`, estimatedYear: estimatedBirthYear, confidence: "low" } } : {}),
    ...(person.died ? { death: { display: person.died, year: Number(person.died), confidence: "high-for-year" } } : {}),
    notes: [
      `В поимённой выписке ревизской сказки Верхнего Мамона 1858 года записан как «${person.written}»${person.age ? `, ${person.age} лет${person.ageYear ? ` по состоянию на ${person.ageYear} год` : ""}` : ""}${person.died ? `; умер в ${person.died} году` : ""}${person.leaf ? `; ориентир листа ${person.leaf}` : ""}.`,
      ...(person.note ? [person.note] : []),
      "Отдельное тождество с другими тёзками не установлено без полного состава двора и предыдущей ревизии.",
    ],
    places: [{ relation: "residence", placeId, normalized: "село Верхний Мамон, Верхнемамонская волость, Павловский уезд" }],
  });
}

const literalRows = people.filter(({ id }) => id !== "P0642").map((person) => {
  const details = [person.age ? `${person.age} лет${person.ageYear ? ` (${person.ageYear})` : ""}` : null, person.died ? `умер ${person.died}` : null, person.note?.includes("безвестной") ? "с 1847 г. в безвестной отлучке" : null, person.leaf ? `л. ${person.leaf}` : null].filter(Boolean);
  return `${person.row} ${person.written} — ${details.join("; ")}`;
});

writeJson(path.join(sourcesDir, `${SOURCE}.json`), {
  schemaVersion: 1,
  sourceId: SOURCE,
  provider: "Государственный архив Воронежской области / опубликованная постраничная выписка",
  recordType: "revision-list",
  collection: {
    title: "Ревизская сказка государственных крестьян села Верхний Мамон, 1858",
    archiveCitation: "ГАВО, ф. И-18, оп. 1, д. 629. Ревизские сказки о государственных крестьян Верхнемамонской волости Павловского уезда, 1858; село Верхний Мамон; дело содержит 518 дворов, 2789 душ мужского и 3124 женского пола.",
  },
  links: {
    publishedTranscription: "https://forum.vgd.ru/post/588/60058/p3435500.htm",
    archiveSystemDiscussion: "https://forum.vgd.ru/post/588/70400/p2005372.htm",
  },
  event: { type: "revision-enumeration", date: { display: "1858", year: 1858 }, place: { placeId, normalized: "село Верхний Мамон, Павловский уезд, Воронежская губерния" } },
  transcription: {
    status: "published-page-by-page-extract",
    literal: [...literalRows, "157: воспитанник Андрей Иванов Стреляев — 17 лет"].join("\n"),
    modernInterpretation: "В селе оставалось не менее двенадцати дворов глав с вариантами фамилии Анпилов/Анпилогов/Анплогов. Ревизия документирует крупный семейный кластер Верхнего Мамона; ранее из этого же селения зафиксировано выбытие семьи Емельяна Никитича в Тихорецкое. Точные родственные связи между дворами устанавливаются отдельно.",
  },
  isRecord: true,
  cardKind: "named-revision-households",
  mentions: people.map((person, index) => ({ mentionId: `${SOURCE}-M${String(index + 1).padStart(2, "0")}`, role: person.id === "P0642" ? "foster-child-in-household" : "household-head", personId: person.id, nameAsTranscribed: person.written, displayName: person.name, modernName: person.name, ...(person.age ? { age: String(person.age) } : {}) })),
  review: {
    status: "exact-case-and-leaf-range-known-original-images-needed",
    unresolved: [
      "Открыть сканы дела в АИС ГАВО и снять полные составы каждого двора, включая жён, дочерей, сыновей и переходы между ревизиями.",
      "Уточнить листы дворов 157, 274, 276, 367, 391, 442 и 448 по соседним листовым ориентирам.",
      "Найти итог безвестной отлучки Петра Тимофеевича с 1847 года.",
    ],
  },
});

console.log(`Импортированы ${people.length} профилей из дела ГАВО И-18/1/629, включая 12 дворов Анпилоговых и одного воспитанника.`);
