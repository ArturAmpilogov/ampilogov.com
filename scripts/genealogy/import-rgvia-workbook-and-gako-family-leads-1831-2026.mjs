import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const WORKBOOK = "PUB-RGVIA-CAUCASUS-DATABASE-XLSX-20221031";
const GAKO_LEADS = "PUB-GAKO-KURSK-GENEALOGICAL-EXTRACTS-ANPILOV-2026";
const workbookUrl = "https://kubangenealogy.ucoz.ru/_fr/6/___20221031.xlsx";

const peopleFiles = {
  P0535: "P0535-герасим-ампилов.json",
  P0536: "P0536-иван-ампилов.json",
  P0537: "P0537-алексей-ампилогов.json",
  P0538: "P0538-парфен-анпилов.json",
  P0539: "P0539-андрей-анпалов.json",
};

const readPerson = (id) => {
  const file = path.join(peopleDir, peopleFiles[id]);
  return { file, value: JSON.parse(fs.readFileSync(file, "utf8")) };
};

const addUnique = (values, value) => [...new Set([...(values ?? []), value])];

{
  const { file, value } = readPerson("P0535");
  value.displayName = "Герасим Степанович Ампилов";
  value.surname.formsAsWritten = addUnique(value.surname.formsAsWritten, "Анпилов");
  value.sourceIds = addUnique(value.sourceIds, WORKBOOK);
  value.notes = [
    "Полная открытая таблица базы РГВИА называет его дважды: «Ампилов Герасим Степанов — Воронежская губ. — Дмитриевская ст. — 1836» и «Анпилов Герасим Стефанов — … — 1831».",
    "Степанов/Стефанов — две исторические формы одного отчества. Совпадение редкого имени, отчества, исходной губернии и станицы делает тождество весьма вероятным; причина двух дат требует оригинального дела.",
    "Автор базы уточняет, что в таблице показаны главы семей, а в закрытой полной выписке есть все члены семьи и их возрасты.",
  ];
  value.places = [
    { relation: "migration-origin", placeId: "voronezh-governorate" },
    { relation: "migration-destination", placeId: "dmitrievskaya-kuban", normalized: "Дмитриевская ст." },
  ];
  writeJson(file, value);
}

{
  const { file, value } = readPerson("P0539");
  value.displayName = "Андрей Гаврилович Анпалов";
  value.sourceIds = addUnique(value.sourceIds, WORKBOOK);
  value.notes = [
    "Полная открытая таблица базы РГВИА уточняет отчество: «Анпалов Андрей Гаврилов — Ставропольская губ. — Новотроицкая ст. — 1836».",
    "Это глава семьи; состав семьи и возрасты находятся в полной архивной выписке, но не раскрыты в открытом XLSX.",
  ];
  writeJson(file, value);
}

for (const id of ["P0536", "P0537", "P0538"]) {
  const { file, value } = readPerson(id);
  value.sourceIds = addUnique(value.sourceIds, WORKBOOK);
  value.notes = addUnique(value.notes, "Строка сверена с открытым XLSX базы РГВИА; автор базы сообщает, что полные выписки содержат состав семьи и возрасты.");
  writeJson(file, value);
}

writeJson(path.join(peopleDir, "P0629-trofim-anpilov-grigoripolisskaya-1837.json"), {
  schemaVersion: 1,
  personId: "P0629",
  displayName: "Трофим Анпилов",
  sex: "male",
  surname: { normalized: "Анпилов", formsAsWritten: ["Анпилов"] },
  sourceIds: [WORKBOOK],
  status: "documented-from-published-archival-index",
  notes: [
    "Открытая таблица базы переселенцев по документам РГВИА содержит строку: «Анпилов Трофим — Ставропольская губ. — Григориполисская ст. — 1837».",
    "База индексирует главу семьи; отчество, возраст и члены семьи в открытой строке не приведены.",
  ],
  places: [
    { relation: "migration-origin", placeId: "stavropol-governorate" },
    { relation: "migration-destination", placeId: "grigoripolisskaya-stanitsa" },
  ],
});

const workbookRows = [
  [537, "P0535", "Ампилов Герасим Степанов", "Воронежская губ.", "Дмитриевская ст.", "1836", "voronezh-governorate", "dmitrievskaya-kuban"],
  [538, "P0536", "Ампилов Иван", "Воронежская губ.", "Дмитриевская ст.", "1836", "voronezh-governorate", "dmitrievskaya-kuban"],
  [539, "P0537", "Ампилогов Алексей", "Служба на Кавказе", "1-я бригада КЛКВ", "1848", null, "first-brigade-klkv"],
  [742, "P0539", "Анпалов Андрей Гаврилов", "Ставропольская губ.", "Новотроицкая ст.", "1836", "stavropol-governorate", "novotroitskaya-stanitsa"],
  [743, "P0535", "Анпилов Герасим Стефанов", "Воронежская губ.", "Дмитриевская ст.", "1831", "voronezh-governorate", "dmitrievskaya-kuban"],
  [744, "P0538", "Анпилов Парфен", "Тифлисская ст.", "Сунженская линия", "1850", "tiflisskaya-stanitsa", "sunzha-line"],
  [745, "P0629", "Анпилов Трофим", "Ставропольская губ.", "Григориполисская ст.", "1837", "stavropol-governorate", "grigoripolisskaya-stanitsa"],
];

writeJson(path.join(sourcesDir, `${WORKBOOK}.json`), {
  schemaVersion: 1,
  sourceId: WORKBOOK,
  provider: "РГВИА / опубликованная XLSX-база переселенцев",
  recordType: "published-archival-migration-database",
  collection: {
    title: "База пересенцев Кавказской и Кубанской областей, файл ___20221031.xlsx",
    archiveCitation: "База составлена Еленой Герасименко по документам РГВИА; открытый файл содержит глав семей, места выхода/назначения и год; полные выписки включают членов семьи и возрасты, но шифры дел в XLSX не показаны.",
  },
  links: {
    workbook: workbookUrl,
    methodology: "https://kubangenealogy.ucoz.ru/forum/12-604-1",
    duplicatePublishedIndex: "https://forum.vgd.ru/3299/108344/0.htm",
  },
  event: { type: "resettlement-database-series", date: { display: "1831–1850" } },
  transcription: {
    status: "downloaded-workbook-rows-transcribed",
    literal: workbookRows.map(([row, , name, from, to, year]) => `строка ${row}: ${name} | ${from} | ${to} | ${year}`).join("\n"),
    modernInterpretation: "Семь строк открытой таблицы дают шесть персон: Герасим записан дважды с вариантами фамилии/отчества и датами 1831/1836. Впервые получены отчества Герасима и Андрея, а также строка Трофима Анпилова.",
  },
  migrationObservations: workbookRows.map(([row, personId, name, , , year, from, to]) => ({
    personId,
    personName: name,
    ...(from ? { from: { placeId: from } } : {}),
    to: { placeId: to },
    basis: `XLSX, строка ${row}, ${year}`,
    confidence: personId === "P0535" ? "medium-high" : "medium",
  })),
  isRecord: true,
  cardKind: "named-resettler-workbook",
  mentions: workbookRows.map(([row, personId, name]) => ({ mentionId: `${WORKBOOK}-R${row}`, role: "head-of-family", personId, displayName: name, modernName: name })),
  review: {
    status: "workbook-verified-original-cases-needed",
    unresolved: [
      "Получить полные выписки с членами семей и возрастами.",
      "Установить фонды, описи, дела и листы РГВИА; заказать сканы.",
      "Объяснить две даты Герасима Степановича — 1831 и 1836 — по оригиналу.",
    ],
  },
});

const gakoRowsText = `
Анпилов (Аппилов) Иван Иванов|кр|семейное положение|1830-1860
Анпилов Алексей Иванов|кр|состав семьи|1840-1870
Анпилов Василий Васильев|кр|недвижимые владения, Старооскольский|1900-1925
Анпилов Василий Павлов|кр|состав семьи|1840-1870
Анпилов Георгий Порфириев|кр|смерть|1900-1925
Анпилов Евстафий Кондратов|кр|семейное положение|1830-1860
Анпилов Иван Семенов|кр|состав семьи|1840-1870
Анпилов Иван Фетисов|кр|состав семьи|1840-1870
Анпилов Кондрат Данилов|кр|состав семьи|1840-1870
Анпилов Николай Евдокимов|кр|состав семьи|1840-1870
Анпилов Николай Михайлов|кр|имущество, сфера деятельности, место нахождения|1880-1910
Анпиловы Николай и Василий Тимофеевы|кр|недвижимые владения, Старооскольский|1900-1925
Анпилов Парфен Александров|кр|состав семьи|1840-1870
Анпилов Савелий Иванов|кр|состав семьи|1840-1870
Анпилов Свирид Никифоров|кр|состав семьи|1840-1870
Анпилов Семен Логвинов|кр|состав семьи|1840-1870
Анпилов Сергей Андреев|кр|состав семьи|1840-1870
Анпилов Стефан Захаров|кр|недвижимые владения, Старооскольский|1900-1925
Анпилов Тимофей Афанасьев|кр|состав семьи|1840-1870
Анпилов Тимофей Карнеев|кр|состав семьи|1840-1870
Анпилов Тимофей Сергеев|кр|состав семьи|1840-1870
Анпилов Яков Семенов|кр|состав семьи|1840-1870
Анпилова Мария Васильева|кр|брак|1870-1900
Анпилова Соломонида Петрова|кр|недвижимые владения, Старооскольский|1900-1925
Анпилоговы Абрам и Степан Алексеевы|кр|недвижимые владения, Старооскольский|1900-1925
Анпилогов Алексей Васильев|мещ|рождение|1900-1925
Анпилогов Алексей Фомин|губ. секретарь|список лиц, имеющих право быть присяжными заседателями|1880-1910
Анпилогов Андрей Стефанов|чиновник|рождение|1880-1910
Анпилогов Афанасий Стефанов|кр|состав семьи|1840-1870
Анпилогов Василий|кр|взыскание, Фатежский|1870-1900
Анпилогов Василий Владимиров|кр|семейное положение / список присяжных|1850-1910
Анпилогов Василий Михайлов|мещ / не указано|смерть / состав семьи|1840-1910
Анпилогов Василий Родионов|кр|состав семьи|1840-1870
Анпилогов Василий Федоров|кр|состав семьи|1840-1870
Анпилогов Венедикт Афанасьев|кр|состав семьи|1840-1870
Анпилогов Владимир Иванов|кр|состав семьи|1840-1870
Анпилогов Георгий|кр, Фатежский|смерть|1880-1910
Анпилогов Григорий Петров|кр|семейное положение|1850-1880
Анпилогов Григорий Яковлев|кр|смерть|1880-1910
Анпилогов Елисей Савостьянов|кр|состав семьи|1840-1870
Анпилогов Ефим Васильев|кр|недвижимые владения, Старооскольский|1900-1925
Анпилогов Ефим Тарасов|кр|состав семьи|1840-1870
Анпилогов Иван Тарасов|кр|состав семьи|1840-1870
Анпилогов Иван Фирсов|кр|состав семьи|1840-1870
Анпилогов Илья Сапронов|кр|семейное положение|1850-1880
Анпилогов Карп Данилов|кр|состав семьи|1840-1870
Анпилогов Карп Феоктистов|кр|состав семьи|1840-1870
Анпилогов Лаврентий Афанасьев|кр|состав семьи|1840-1870
Анпилогов Максим Евдокимов|кр|состав семьи|1840-1870
Анпилогов Мартын Афанасьев|кр|состав семьи|1840-1870
Анпилогов Михаил Васильев|—|состав семьи|1840-1870
Анпилогов Михаил Миронов|канцелярист|послужной список|1820-1850
Анпилогов Николай Стефанов|кр|состав семьи|1840-1870
Анпилогов Павел Евстратов|кр|состав семьи|1840-1870
Анпилогов Порфирий Ларионов|кр|семейное положение|1850-1880
Анпилогов Пофом Тарасов|кр|состав семьи|1840-1870
Анплогов Прокофий Калинин|кр|состав семьи|1840-1870
Анпилогов Савва Борисов|кр|состав семьи|1840-1870
Анпилогов Селиверст Кирилов|кр|состав семьи|1840-1870
Анпилогов Стефан Никитин|кр|состав семьи|1840-1870
Анпилогов Тимофей Евдокимов|кр|состав семьи|1840-1870
Анпилогов Тит Феоктистов|кр|состав семьи|1840-1870
Анпилогов Федот Дмитриев|кр|состав семьи|1840-1870
Анпилогов Яков Петров|мещанин|состав семьи|1840-1870
Анпилогова Александра Васильева|кр|смерть|1900-1925
Анпилогова Елисавета Алексеева|мещ|брак|1900-1925
Анпилогова Любовь|дочь поручика|послужной список|1840-1870
Анпилогова Олимпиада Васильева|кр|недвижимые владения, Старооскольский|1900-1925
Анпилогова Параскева Иванова|вдова / жена поручика|смерть / послужной список|1880-1910
`.trim();

const gakoRows = gakoRowsText.split("\n").map((line) => line.split("|"));
writeJson(path.join(sourcesDir, `${GAKO_LEADS}.json`), {
  schemaVersion: 1,
  sourceId: GAKO_LEADS,
  provider: "ГАКО / опубликованные выписки из архивных дел",
  recordType: "published-genealogical-extract-index",
  collection: {
    title: "ГАКО Курск: выписки из архивных документов — Анпиловы/Анпилоговы",
    archiveCitation: "Индекс частного исследователя soojes, обновлён 9 августа 2026 года. Автор сообщает, что сведения взяты непосредственно из дел ГАКО; в открытом индексе шифры дел не показаны.",
  },
  links: { publishedIndex: "https://forum.vgd.ru/post/9304/174610/p5455480.htm" },
  event: { type: "genealogical-archive-extract-series", date: { display: "1820–1925" }, place: { normalized: "Курская губерния" } },
  transcription: {
    status: "published-index-transcribed",
    literal: gakoRows.map((row) => row.join(" | ")).join("\n"),
    modernInterpretation: `В открытом индексе сохранены ${gakoRows.length} строк по вариантам Анпилов/Анпилогов. Не менее 35 строк прямо обещают состав семьи; есть также семейное положение, имущество, браки, смерти и послужные списки.`,
  },
  isRecord: true,
  cardKind: "archival-family-extract-lead-index",
  mentions: gakoRows.map(([name, status, subject, period], index) => ({
    mentionId: `${GAKO_LEADS}-M${String(index + 1).padStart(2, "0")}`,
    role: "indexed-person",
    personId: null,
    nameAsTranscribed: name,
    displayName: name,
    modernName: name,
    description: `${status}; ${subject}; ${period}`,
  })),
  review: {
    status: "named-leads-exact-cases-and-scans-needed",
    unresolved: [
      "Получить у составителя полные выписки, шифры дел и листы для всех строк «состав семьи».",
      "После получения места, возрастов и родства сверить с существующими профилями; до этого тёзок не сливать.",
    ],
  },
});

for (const sourceId of [
  "PUB-RGVIA-CAUCASUS-INDEX-AMPILOV-GERASIM-1836",
  "PUB-RGVIA-CAUCASUS-INDEX-AMPILOV-IVAN-1836",
  "PUB-RGVIA-CAUCASUS-INDEX-AMPILOGOV-ALEKSEY-1848",
  "PUB-RGVIA-CAUCASUS-INDEX-ANPILOV-PARFEN-1850",
  "PUB-RGVIA-CAUCASUS-INDEX-ANPALOV-ANDREY-1836",
]) {
  const file = path.join(sourcesDir, `${sourceId}.json`);
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  source.links = { ...source.links, databaseWorkbook: workbookUrl, methodology: "https://kubangenealogy.ucoz.ru/forum/12-604-1" };
  source.relatedSourceIds = addUnique(source.relatedSourceIds, WORKBOOK);
  source.collection.archiveCitation = "База составлена по документам РГВИА. Открытый XLSX сообщает главу семьи, места выхода/назначения и год; полные выписки содержат членов семьи и возрасты; шифр конкретного дела не раскрыт.";
  if (sourceId.includes("GERASIM")) {
    source.primaryPersonId = "P0535";
    source.mentions[0].displayName = "Герасим Степанович Ампилов";
    source.mentions[0].modernName = "Герасим Степанович Ампилов";
  }
  if (sourceId.includes("ANPALOV-ANDREY")) {
    source.mentions[0].displayName = "Андрей Гаврилович Анпалов";
    source.mentions[0].modernName = "Андрей Гаврилович Анпалов";
  }
  writeJson(file, source);
}

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const grigoripolisskaya = {
  placeId: "grigoripolisskaya-stanitsa",
  name: "Григориполисская",
  label: "станица Григориполисская, Кавказское линейное казачье войско",
  kind: "stanitsa",
  aliases: ["Григориполисская", "Григорополисская"],
  geo: {
    latitude: 45.295556,
    longitude: 41.061389,
    precision: "settlement",
    confidence: "high",
    source: "координаты современной станицы; историческая преемственность установлена",
    sourceUrl: "https://ru.wikipedia.org/wiki/Григорополисская",
  },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === grigoripolisskaya.placeId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...grigoripolisskaya };
else places.places.push(grigoripolisskaya);
writeJson(placesPath, places);

console.log(`Сохранены 7 XLSX-строк РГВИА, новый Трофим Анпилов, маршрут в Григориполисскую и ${gakoRows.length} строк новых выписок ГАКО.`);
