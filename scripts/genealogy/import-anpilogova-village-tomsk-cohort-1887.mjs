import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const inventoryUrl = "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_2/2._1887_g._.doc";
const indexUrl = "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_1/imennoi_t1.pdf";
const originPlaceId = "anpilogova-kursk-uezd";
const destinationPlaceId = "tomsk-governorate";

const peopleByCase = {
  "3345": ["А. Е. Жиров", "Г. И. Иванов", "Ф. С. Иванов", "Е. И. Рагулин", "Н. С. Рагулин", "И. Н. Теленев", "Е. Г. Трепаков", "И. И. Трепаков", "Д. Т. Тюлюнев", "А. А. Тюлюнов", "Е. Я. Федоров", "В. И. Феоктистов", "М. М. Феоктистов", "У. Г. Чистяков", "Ф. В. Чистяков"],
  "3380": ["А. А. Тюленев", "Д. Т. Тюленев", "А. Е. Жиров", "И. И. Трепаков", "Ф. В. Чистяков", "М. М. Феоктистов"],
  "3583": ["Г. С. Рагулин", "М. З. Феоктистов"],
  "3591": ["Г. И. Иванов", "Ф. С. Иванов", "Е. И. Рагулин", "Е. Г. Трепаков", "Д. Т. Тюлюнев", "А. А. Тюлюнов", "Е. Я. Федоров", "В. И. Феоктистов", "М. М. Феоктистов"],
  "3641": ["А. И. Башмаков", "Б. С. Башмаков", "Н. В. Башмаков", "Н. С. Башмаков", "Т. И. Башмаков", "Ф. Я. Башмаков", "А. Е. Жиров", "К. С. Жиров", "А. Ф. Иванов", "М. Ф. Иванов", "П. А. Макеев", "А. П. Рагулин", "И. П. Рагулин", "Н. П. Рагулин", "С. Д. Рагулин", "В. И. Трепаков", "Г. Д. Трепаков", "А. Е. Тюлюнев", "А. И. Тюлюнев", "А. М. Тюлюнев", "А. С. Тюлюнев", "Г. Е. Тюлюнев", "И. М. Тюлюнев", "М. М. Тюлюнев", "Н. К. Тюлюнев", "О. Е. Тюлюнев", "Ф. М. Тюлюнев", "А. Я. Феоктистов", "Ф. П. Феоктистов", "П. С. Чистяков", "Ф. С. Чистяков"],
  "3723": ["Н. И. Башмаков", "Т. И. Башмаков", "А. Ф. Иванов", "М. Ф. Иванов", "А. П. Рагулин", "С. Д. Рагулин", "А. Е. Тюлюнев", "А. М. Тюлюнев", "Г. Е. Тюлюнев", "М. М. Тюлюнев", "С. М. Тюлюнев"],
  "3781": ["Г. И. Иванов", "Ф. С. Иванов", "Е. И. Рагулин", "Е. Г. Трепаков", "Д. Т. Тюлюнев", "А. А. Тюлюнов", "Е. Я. Федоров", "В. И. Феоктистов", "М. М. Феоктистов"],
};

const cases = [
  {
    delo: "3345",
    dates: "10 февраля — 29 августа 1887 года",
    pages: "589 листов",
    title: "Прошения крестьян Курской губернии о переселении в Томскую губернию",
    literal: "Прошения крестьян Курской губ. о переселении их в Томскую губ. Семейные списки и выписки из ревизских сказок на крестьян сл. Борисовка, с. Серетино, с. Стригуны и д. Порубежная Грайворонского у. — лл. 478–589.",
    note: "Именной указатель связывает с делом пятнадцать жителей деревни Анпилоговой, но опись не называет листы их семейных списков; требуется просмотр дела.",
  },
  {
    delo: "3380",
    dates: "26 июня — 21 августа 1887 года",
    pages: "10 листов",
    title: "Шесть семей деревни Анпилоговой Курского уезда в Томскую губернию",
    literal: "Дело по прошениям крестьян д. Анпилогова Курского у. Тюленевых, А. Е. Жирова, И. И. Трепакова, Ф. В. Чистякова и М. М. Феоктистова (6 семей) о переселении в Томскую губ. Семейные списки крестьян и сведения об их имуществе — лл. 2–5.",
    note: "Это приоритетная полноценная семейно-имущественная ведомость: точные листы 2–5 известны.",
  },
  {
    delo: "3583",
    dates: "13 апреля 1887 — 30 сентября 1888 года",
    pages: "26 листов",
    title: "Списки получивших разрешение, включая жителей деревни Анпилоговой",
    literal: "Дело по прошению крестьян д. Хардикова Курского у. о переселении в Томскую губ. Списки крестьян десяти селений Курского у., включая д. Анпилогова, получивших разрешение на переселение — лл. 25–26.",
    note: "Именной указатель относит к делу Г. С. Рагулина и М. З. Феоктистова из Анпилоговой.",
  },
  {
    delo: "3591",
    dates: "29 мая 1887 — 7 ноября 1888 года",
    pages: "66 листов",
    title: "Крестьяне волостей Курского уезда в Томскую губернию",
    literal: "Дело по прошениям крестьян Чаплыгинской, Троицкой, Рыжковской и Дьяконовской волостей Курского у. о переселении в Томскую губ. Списки 243 семей, получивших разрешение — лл. 50, 51, 64–66.",
    note: "Девять жителей Анпилоговой связаны с делом официальным именным указателем.",
  },
  {
    delo: "3641",
    dates: "12 апреля — 21 октября 1887 года",
    pages: "35 листов",
    title: "Прошения крестьян Старковской и других волостей о переселении в Томскую губернию",
    literal: "Прошения крестьян Дьяконовской, Спасской, Старковской и Рождественской волостей Курского у.; Ивницкой и Угонской волостей Льговского у. и Здобниковской волости Фатежского у. о переселении в Томскую губ.",
    note: "Основное дело общины: именной указатель связывает с ним не менее 31 жителя деревни Анпилоговой; точные листы внутри дела ещё надо установить.",
  },
  {
    delo: "3723",
    dates: "27 марта 1887 — 14 марта 1889 года",
    pages: "44 листа",
    title: "Списки семей, получивших разрешение на переселение в Томскую губернию",
    literal: "Списки крестьян Дьяконовской, Колоденской, Спасской, Старковской и Рождественской волостей Курского у. и других уездов, получивших разрешение: 129 семей — лл. 12–14; 80 семей Курского у. — лл. 16–17; дополнительные списки — лл. 26, 28, 30–31, 37–41.",
    note: "Одиннадцать жителей Анпилоговой связаны с делом именным указателем; вероятная рабочая цель — списки на лл. 12–17.",
  },
  {
    delo: "3781",
    dates: "15 января 1887 — 13 августа 1890 года",
    pages: "108 листов",
    title: "Сводный список 630 семей, получивших разрешение на переселение в Томскую губернию",
    literal: "Списки крестьян Белгородского, Грайворонского, Корочанского, Курского, Льговского, Старооскольского, Суджанского, Тимского и Щигровского уездов, получивших разрешение на переселение в Томскую губ. (630 семей) — лл. 38–52, 101 об.",
    note: "Девять жителей Анпилоговой связаны с итоговым сводом официальным именным указателем.",
  },
];

const uniquePeople = [...new Set(Object.values(peopleByCase).flat())];
const mentions = (sourceId, names) => names.map((name, index) => ({
  mentionId: `${sourceId}-M${index + 1}`,
  role: "indexed-resettler-from-anpilogova-village",
  personId: null,
  displayName: name,
  modernName: name,
}));

for (const item of cases) {
  const sourceId = `GAKO-F68-O2-D${item.delo}-ANPILOGOVA-VILLAGE-TOMSK`;
  writeJson(path.join(sourcesDir, `${sourceId}.json`), {
    schemaVersion: 1,
    sourceId,
    provider: "ОКУ «Государственный архив Курской области»",
    recordType: "official-resettlement-case-linked-to-name-index",
    collection: { title: item.title, archiveCitation: `ГАКО, ф. 68, оп. 2, д. ${item.delo}; ${item.dates}; ${item.pages}.` },
    links: { officialInventoryDocument: inventoryUrl, officialNameIndexScan: indexUrl, archiveFindingAids: "https://archive.rkursk.ru/gako/dorev_opisi" },
    event: { type: "resettlement-case", date: { display: item.dates }, place: { placeId: originPlaceId, normalized: "деревня Анпилогова, Курский уезд" } },
    transcription: { status: "verified-from-official-inventory-and-name-index-scan", literal: item.literal, modernInterpretation: item.note },
    migrationObservations: [{ personName: "Переселенческая группа деревни Анпилоговой", from: { placeId: originPlaceId }, to: { placeId: destinationPlaceId }, basis: `${item.literal} Фамилии участников связаны с делом официальным именным указателем.`, confidence: "high" }],
    isRecord: true,
    cardKind: "community-resettlement-archive-case",
    mentions: mentions(sourceId, peopleByCase[item.delo]),
    review: { status: item.delo === "3380" ? "exact-family-list-scan-needed" : "exact-case-list-scan-needed", unresolved: [item.delo === "3380" ? "Получить сканы листов 2–5: шесть семей и их имущество." : `Получить сканы ГАКО, ф. 68, оп. 2, д. ${item.delo} и проверить названные в описи списки.`] },
  });
}

const masterId = "PUB-GAKO-F68-ANPILOGOVA-VILLAGE-TOMSK-INDEX";
writeJson(path.join(sourcesDir, `${masterId}.json`), {
  schemaVersion: 1,
  sourceId: masterId,
  provider: "Государственный архив Курской области — официальный именной указатель переселенцев",
  recordType: "official-community-resettler-index-scan",
  collection: { title: "Жители деревни Анпилоговой Курского уезда, переселявшиеся в Томскую губернию", archiveCitation: "ГАКО, ф. 68, оп. 2, именной указатель переселенцев, тома А–О и П–Я; дела 3345, 3380, 3583, 3591, 3641, 3723, 3781." },
  links: { officialNameIndexScan: indexUrl, officialInventoryDocument: inventoryUrl },
  event: { type: "community-resettlement-index", date: { display: "1887–1890" }, place: { placeId: originPlaceId, normalized: "деревня Анпилогова, Курский уезд" } },
  transcription: { status: "verified-from-official-scan", literal: uniquePeople.join("; "), modernInterpretation: `Указатель называет ${uniquePeople.length} уникальных строк глав семейств/просителей из деревни Анпилоговой и связывает их с семью делами о переселении в Томскую губернию. Повторяющиеся инициалы и варианты Тюленев/Тюлюнев не объединены автоматически.` },
  migrationObservations: [{ personName: "Переселенческая группа деревни Анпилоговой", from: { placeId: originPlaceId }, to: { placeId: destinationPlaceId }, basis: "Официальный именной указатель прямо называет исходную деревню, Томскую губернию и номера дел.", confidence: "high" }],
  isRecord: true,
  cardKind: "community-resettler-finding-aid",
  mentions: mentions(masterId, uniquePeople),
  review: { status: "community-index-complete-case-scans-needed", unresolved: ["Получить д. 3380, лл. 2–5 в первую очередь.", "По вариантам Тюленев/Тюлюнев сверить оригиналы до объединения строк."] },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const place = {
  placeId: originPlaceId,
  name: "Анпилогова",
  label: "деревня Анпилогова, Курский уезд (ныне 1-е и 2-е Анпилогово)",
  kind: "historical-village",
  aliases: ["Анпилогова", "Анпилогово", "1-е Анпилогово", "2-е Анпилогово"],
  geo: { latitude: 51.7849, longitude: 36.0076, precision: "historical-settlement", confidence: "medium", source: "средняя рабочая точка современных деревень 1-е и 2-е Анпилогово на Большой Курице", sourceUrl: "https://nashipredki.com/location/anpilogova-derevnya-40276", note: "Историческая деревня разделена на два современных населённых пункта; точка не обозначает конкретный двор." },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === originPlaceId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...place };
else places.places.push(place);
writeJson(placesPath, places);

console.log(`Импортированы семь дел, сводный указатель ${uniquePeople.length} строк и историческая точка деревни Анпилоговой.`);
