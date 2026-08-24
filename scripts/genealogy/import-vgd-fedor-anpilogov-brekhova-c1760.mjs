import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const personId = "P6023";
const sourceId = "PUB-VGD-FEDOR-ANPILOGOV-BREKHOVA-C1760";
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

writeJson(path.join(root, "data/genealogy/people/P6023-fedor-anpilogov-brekhova-c1760.json"), {
  schemaVersion: 1,
  personId,
  displayName: "Фёдор Анпилогов из деревни Брехова",
  sex: "male",
  surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилогов"] },
  birth: { date: { display: "около 1760 года", approximate: true } },
  sourceIds: [sourceId],
  status: "published-genealogical-lead",
  places: [{ relation: "residence", placeId: "brekhova-fatezh" }],
  notes: [
    "В генеалогическом сообщении назван Фёдор Анпилогов, примерно 1760 года рождения, из деревни Брехова Фатежского уезда.",
    "Архивный шифр и первичная запись в сообщении не приведены; карточка сохраняет точный именной ориентир для ревизий и метрических книг Бреховой.",
  ],
});

writeJson(path.join(root, `data/genealogy/sources/publications/${sourceId}.json`), {
  schemaVersion: 1,
  sourceId,
  provider: "ВГД — генеалогическое сообщение участника NIK",
  recordType: "published-genealogical-note",
  collection: {
    title: "Фёдор Анпилогов из деревни Брехова, около 1760 года рождения",
    archiveCitation: "Сообщение участника NIK от 5 мая 2006 года; первичный архивный шифр не приведён.",
  },
  links: { publishedDiscussion: "https://forum.vgd.ru/post/2167/3133/p148456.htm" },
  event: {
    type: "residence-and-approximate-birth-lead",
    date: { display: "около 1760 года", approximate: true },
    place: { placeId: "brekhova-fatezh", normalized: "деревня Брехова, Фатежский уезд" },
  },
  transcription: {
    status: "published-note-transcribed",
    literal: "Анпилогов Федор, примерно 1760 г.р, дер. Брехова.",
    modernInterpretation: "Фёдор Анпилогов жил в деревне Брехова Фатежского уезда и родился приблизительно в 1760 году.",
  },
  isRecord: true,
  cardKind: "named-surname-lead",
  primaryPersonId: personId,
  mentions: [{
    mentionId: `${sourceId}-M1`,
    role: "named-resident",
    personId,
    nameAsTranscribed: "Анпилогов Федор",
    displayName: "Фёдор Анпилогов из деревни Брехова",
    modernName: "Фёдор Анпилогов",
  }],
  review: {
    status: "published-note-exact-record-needed",
    unresolved: [
      "Найти Фёдора и его двор в ревизских сказках деревни Брехова второй половины XVIII века.",
      "Установить отчество, семью и архивный шифр первичной записи.",
    ],
  },
});

console.log("Импортирован именной ориентир: Фёдор Анпилогов из Бреховой, около 1760 года.");
