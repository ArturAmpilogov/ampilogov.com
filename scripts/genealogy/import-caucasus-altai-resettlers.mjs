import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");

const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const slug = (value) => value.toLowerCase().replace(/ё/g, "е").replace(/[^а-яa-z0-9]+/g, "-").replace(/^-|-$/g, "");

const caucasus = [
  { personId: "P0535", name: "Герасим Ампилов", surname: "Ампилов", sourceId: "PUB-RGVIA-CAUCASUS-INDEX-AMPILOV-GERASIM-1836", year: "1836", from: "voronezh-governorate", to: "dmitrievskaya-kuban", literal: "Ампилов Герасим — Воронежская губ. — Дмитриевская ст. — 1836." },
  { personId: "P0536", name: "Иван Ампилов", surname: "Ампилов", sourceId: "PUB-RGVIA-CAUCASUS-INDEX-AMPILOV-IVAN-1836", year: "1836", from: "voronezh-governorate", to: "dmitrievskaya-kuban", literal: "Ампилов Иван — Воронежская губ. — Дмитриевская ст. — 1836." },
  { personId: "P0537", name: "Алексей Ампилогов", surname: "Ампилогов", sourceId: "PUB-RGVIA-CAUCASUS-INDEX-AMPILOGOV-ALEKSEY-1848", year: "1848", to: "first-brigade-klkv", literal: "Ампилогов Алексей — Служба на Кавказе — 1-я бригада КЛКВ — 1848." },
  { personId: "P0538", name: "Парфен Анпилов", surname: "Анпилов", sourceId: "PUB-RGVIA-CAUCASUS-INDEX-ANPILOV-PARFEN-1850", year: "1850", from: "tiflisskaya-stanitsa", to: "sunzha-line", literal: "Анпилов Парфен — Тифлисская ст. — Сунженская линия — 1850." },
  { personId: "P0539", name: "Андрей Анпалов", surname: "Анпалов", sourceId: "PUB-RGVIA-CAUCASUS-INDEX-ANPALOV-ANDREY-1836", year: "1836", from: "stavropol-governorate", to: "novotroitskaya-stanitsa", literal: "Анпалов Андрей — Ставропольская губ. — Новотроицкая ст. — 1836." },
];

for (const item of caucasus) {
  writeJson(path.join(peopleDir, `${item.personId}-${slug(item.name)}.json`), {
    schemaVersion: 1,
    personId: item.personId,
    displayName: item.name,
    sex: "male",
    surname: { normalized: item.surname, formsAsWritten: [item.surname] },
    sourceIds: [item.sourceId],
    status: "documented-from-published-archival-index",
    notes: [
      `Поимённая база переселенцев, составленная по документам РГВИА, фиксирует строку за ${item.year} год: «${item.literal}»`,
      "Архивный шифр конкретного дела и полный состав семьи в открытой версии базы не приведены; с однофамильцами не объединён.",
    ],
    places: [{ relation: "residence", placeId: item.to, normalized: item.literal.split(" — ")[2] }],
  });

  const migrationObservations = item.from ? [{
    personId: item.personId,
    personName: item.name,
    from: { placeId: item.from },
    to: { placeId: item.to },
    basis: item.literal,
    confidence: "medium",
  }] : [];

  writeJson(path.join(sourcesDir, `${item.sourceId}.json`), {
    schemaVersion: 1,
    sourceId: item.sourceId,
    provider: "РГВИА / опубликованная база переселенцев Кавказской, Кубанской и Терской областей",
    recordType: "published-archival-migration-index",
    collection: {
      title: "База переселенцев Кавказской, Кубанской и Терской областей",
      archiveCitation: "Составлена по документам РГВИА; открытая таблица сообщает главу семьи, место выхода, место назначения и год документа, но не раскрывает шифр конкретного дела.",
    },
    links: {
      transcription: "https://forum.vgd.ru/3299/108344/0.htm",
      publishedPdf: "https://ru.scribd.com/document/416713666/Переселенцы-на-Кавказ",
      archiveGuide: "https://guides.rusarchives.ru/terms/16/8548/korpus-divizii-i-brigady-kazachih-voysk",
    },
    event: { type: "government-resettlement-or-service-placement", date: { display: item.year }, place: { placeId: item.to, normalized: item.literal.split(" — ")[2] } },
    transcription: {
      status: "published-index-row-verified-in-two-copies",
      literal: item.literal,
      modernInterpretation: "Строка подтверждает персональное направление или служебное размещение. Она не раскрывает возраст, состав семьи и номер дела.",
    },
    migrationObservations,
    isRecord: true,
    cardKind: "named-resettler-index",
    primaryPersonId: item.personId,
    mentions: [{ mentionId: `${item.sourceId}-M1`, role: "head-of-family-or-serviceman", personId: item.personId, displayName: item.name, modernName: item.name }],
    review: {
      status: "archival-index-original-needed",
      unresolved: ["Установить конкретный фонд, опись и дело РГВИА и получить скан именного списка с составом семьи."],
    },
  });
}

const kuzmaSourceId = "PUB-BASHKIRIA-CENSUS-1926-VERKHNYAYA-NIKOLAEVKA";
writeJson(path.join(peopleDir, "P0540-kuzma-loginovich-ampilogov.json"), {
  schemaVersion: 1,
  personId: "P0540",
  displayName: "Кузьма Логинович Ампилогов",
  sex: "male",
  surname: { normalized: "Ампилогов", formsAsWritten: ["Ампилогов"] },
  sourceIds: [kuzmaSourceId],
  status: "documented-from-published-archival-transcription",
  notes: [
    "Старший домохозяин № 64 села Верхняя Николаевка Николаевского сельсовета по переписи 1926 года.",
    "Николаевка описана справочником 1914 года как русское переселенческое общество собственников; это характеризует селение, но не доказывает, что лично Кузьма был первопоселенцем.",
  ],
  places: [{ relation: "residence", placeId: "verkhnyaya-nikolaevka-bashkiria", normalized: "Верхняя Николаевка, Стерлитамакский уезд" }],
});
writeJson(path.join(sourcesDir, `${kuzmaSourceId}.json`), {
  schemaVersion: 1,
  sourceId: kuzmaSourceId,
  provider: "Всесоюзная перепись 1926 года / опубликованная поселённая выписка",
  recordType: "settlement-householder-list",
  collection: {
    title: "Список старшим домохозяевам села Верхняя Николаевка Николаевского сельсовета",
    archiveCitation: "Перепись 1926 года; поселённый список Верхней Николаевки. Статус переселенческого общества — справочник подворной переписи Стерлитамакского уезда 1914 года.",
  },
  links: { transcription: "https://forum.vgd.ru/post/10079/189568/p5618056.htm" },
  event: { type: "census", date: { display: "1926" }, place: { placeId: "verkhnyaya-nikolaevka-bashkiria", normalized: "село Верхняя Николаевка, Башкирская АССР" } },
  transcription: {
    status: "published-householder-transcription",
    literal: "№ 0064) Ампилогов Кузьма логинов.",
    modernInterpretation: "Кузьма Логинович — отдельный глава двора в русском переселенческом селении; личный год и место выхода не указаны.",
  },
  isRecord: true,
  cardKind: "settler-community-list",
  primaryPersonId: "P0540",
  mentions: [{ mentionId: `${kuzmaSourceId}-M1`, role: "head-of-household", personId: "P0540", displayName: "Кузьма Логинович Ампилогов", modernName: "Кузьма Логинович Ампилогов" }],
  review: { status: "original-census-sheet-needed", unresolved: ["Получить полный переписной лист: возраст, место рождения и состав семьи."] },
});

const altai = [
  { personId: "P0541", id: "674963975", name: "Егор Фёдорович Ампилогов", asWritten: "Ампилогов Егор Федорович", surname: "Ампилогов", placeId: "zhulanka-altai", place: "Жуланское", volost: "Кочковская волость", uezd: "Барнаульский уезд", settled: "1876" },
  { personId: "P0542", id: "674964035", name: "Иван Фёдорович Ампилогов", asWritten: "Ампилогов Иван Федорович", surname: "Ампилогов", placeId: "zhulanka-altai", place: "Жуланское", volost: "Кочковская волость", uezd: "Барнаульский уезд", settled: "1876" },
  { personId: "P0543", id: "674964395", name: "Елисей Фёдорович Ампилов", asWritten: "Ампилов Елисей Федорович", surname: "Ампилов", placeId: "zhulanka-altai", place: "Жуланское", volost: "Кочковская волость", uezd: "Барнаульский уезд", settled: "старожил" },
  { personId: "P0544", id: "674965715", name: "Кирилл Викторович Ампилов", asWritten: "Ампилов Кирилл Викторович", surname: "Ампилов", placeId: "zhulanka-altai", place: "Жуланское", volost: "Кочковская волость", uezd: "Барнаульский уезд", settled: null },
  { personId: "P0545", id: "674964155", name: "Илья Иванович Амфилов", asWritten: "Амфилов Илья Иванович", surname: "Амфилов", placeId: "zhulanka-altai", place: "Жуланское", volost: "Кочковская волость", uezd: "Барнаульский уезд", settled: "1897" },
  { personId: "P0546", id: "671946615", name: "Савастьян Димитриевич Ампилов", asWritten: "Ампилов Савастьян Димитриевич", surname: "Ампилов", placeId: "pankrushikha-altai", place: "Панкрушиха", volost: "Александровская волость", uezd: "Барнаульский уезд", settled: "1905" },
  { personId: "P0547", id: "671946795", name: "Сергей Димитриевич Ампилов", asWritten: "Ампилов Сергей Димитриевич", surname: "Ампилов", placeId: "pankrushikha-altai", place: "Панкрушиха", volost: "Александровская волость", uezd: "Барнаульский уезд", settled: "1905" },
  { personId: "P0548", id: "673517875", name: "Алексей Андреевич Анпилов", asWritten: "Анпилов Алексей Андреевич", surname: "Анпилов", placeId: "shaidurovo-novosibirsk", place: "Шайдурова", volost: "Верх-Чингисская волость", uezd: "Барнаульский уезд", settled: "1908" },
  { personId: "P0549", id: "673377395", name: "Андрей Климентьевич Анпилов", asWritten: "Анпилов Андрей Климентьевич", surname: "Анпилов", placeId: "voronezhskoe-upper-paiva", place: "Воронежское", volost: "Верх-Пайвинская волость", uezd: "Барнаульский уезд", settled: "1911" },
  { personId: "P0550", id: "683461575", name: "Григорий Фомич Анпилов", asWritten: "Анпилов Григорий Фомич", surname: "Анпилов", placeId: "moralikha-altai", place: "Моралиха", volost: "Огневская волость", uezd: "Бийский уезд", settled: "1898" },
  { personId: "P0551", id: "675584115", name: "Ефим Давыдович Анпилов", asWritten: "Анпилов Ефим Давыдович", surname: "Анпилов", placeId: "baevo-altai", place: "Баево", volost: "Нижне-Кулундинская волость", uezd: "Барнаульский уезд", settled: "1910" },
  { personId: "P0552", id: "676680895", name: "Иван Евдокимович Анпилов", asWritten: "Анпилов Иван Евдокимович", surname: "Анпилов", placeId: "petropavlovskoe-altai", place: "Петропавловское", volost: "Петропавловская волость", uezd: "Барнаульский уезд", settled: "1893" },
  { personId: "P0553", id: "676644635", name: "Иван Иванович Анпилов", asWritten: "Анпилов Иван Иванович", surname: "Анпилов", placeId: "mokhnaty-log-novosibirsk", place: "Мохнатый Лог", volost: "Петропавловская волость", uezd: "Барнаульский уезд", settled: "1901" },
  { personId: "P0554", id: "673517755", name: "Никифор Андреянович Анпилов", asWritten: "Анпилов Никифор Андреянович", surname: "Анпилов", placeId: "shaidurovo-novosibirsk", place: "Шайдурова", volost: "Верх-Чингисская волость", uezd: "Барнаульский уезд", settled: "1908" },
  { personId: "P0555", id: "676680955", name: "Савелий Иванович Анпилов", asWritten: "Анпилов Савелий Иванович", surname: "Анпилов", placeId: "petropavlovskoe-altai", place: "Петропавловское", volost: "Петропавловская волость", uezd: "Барнаульский уезд", settled: "1892" },
  { personId: "P0556", id: "681108075", name: "Фёдор Владимирович Анпилов", asWritten: "Анпилов Федор Владимирович", surname: "Анпилов", placeId: "cheremshanka-tyumentsevo", place: "Черемшанка", volost: "Тюменцевская волость", uezd: "Каменский уезд", settled: "1906" },
  { personId: "P0557", id: "672302175", name: "Филипп Евдокимович Анпилов", asWritten: "Анпилов Филипп Евдокимович", surname: "Анпилов", placeId: "funtiki-altai", place: "Фунтики", volost: "Барнаульская волость", uezd: "Барнаульский уезд", settled: "1899" },
  { personId: "P0558", id: "687020655", name: "Иван Матвеевич Анпилогов", asWritten: "Анпилогов Иван Матвеевич", surname: "Анпилогов", placeId: "kurya-altai", place: "Курья", volost: "Змеиногорская волость", uezd: "Змеиногорский уезд", settled: "1908" },
];

for (const item of altai) {
  const sourceId = `GAAK-CENSUS-1917-${item.id}`;
  const settlementText = item.settled ? `Дата поселения в базе: ${item.settled}.` : "Поле даты поселения в открытой карточке отсутствует.";
  writeJson(path.join(peopleDir, `${item.personId}-${slug(item.name)}.json`), {
    schemaVersion: 1,
    personId: item.personId,
    displayName: item.name,
    sex: "male",
    surname: { normalized: item.surname, formsAsWritten: [item.surname] },
    sourceIds: [sourceId],
    status: "documented-from-official-archive-database",
    notes: [
      `Глава хозяйства в анкете Всероссийской сельскохозяйственной переписи 1917 года: ${item.place}, ${item.volost}, ${item.uezd}, Томская губерния. ${settlementText}`,
      "Полная анкета фонда № 233 должна содержать возраст, семью, сословие и исходную губернию; открытая карточка показывает только место и дату поселения.",
    ],
    places: [{ relation: "residence", placeId: item.placeId, normalized: `${item.place}, ${item.volost}, ${item.uezd}` }],
  });

  const eventYear = /^\d{4}$/.test(item.settled ?? "") ? item.settled : "1917";
  writeJson(path.join(sourcesDir, `${sourceId}.json`), {
    schemaVersion: 1,
    sourceId,
    provider: "КГБУ «Государственный архив Алтайского края»",
    recordType: "1917-agricultural-census-household-card",
    collection: {
      title: `Анкета переписи 1917 года: ${item.asWritten}`,
      archiveCitation: "ГААК, фонд № 233 «Алтайская губернская земская управа»; анкеты Всероссийской сельскохозяйственной, земельной и городской переписей 1917 года.",
    },
    links: {
      officialCard: `https://altarchives.ru/census1917/${item.id}`,
      database: "https://altarchives.ru/census1917",
      fundDescription: "https://altarchives.ru/news/new/694026790",
    },
    event: { type: /^\d{4}$/.test(item.settled ?? "") ? "settlement" : "census", date: { display: eventYear }, place: { placeId: item.placeId, normalized: `${item.place}, ${item.volost}, ${item.uezd}` } },
    transcription: {
      status: "official-database-card-verified",
      literal: `ФИО: ${item.asWritten}. Населённый пункт: ${item.place}. Губерния: Томская губерния. Уезд: ${item.uezd}. Волость: ${item.volost}.${item.settled ? ` Дата поселения: ${item.settled}.` : ""}`,
      modernInterpretation: /^\d{4}$/.test(item.settled ?? "") ? `Официальная карточка прямо фиксирует персональный год поселения — ${item.settled}. Исходная губерния скрыта в полной анкете.` : "Карточка подтверждает двор в 1917 году, но открытая часть не даёт персонального года переселения.",
    },
    isRecord: true,
    cardKind: /^\d{4}$/.test(item.settled ?? "") ? "named-settler-card" : "census-household-card",
    primaryPersonId: item.personId,
    mentions: [{ mentionId: `${sourceId}-M1`, role: "head-of-household", personId: item.personId, displayName: item.name, modernName: item.name }],
    review: {
      status: "official-index-full-questionnaire-needed",
      unresolved: ["Получить копию полной анкеты фонда № 233: она должна назвать исходную губернию, возраст и членов семьи."],
    },
  });
}

const tikhoretskSourceId = "PUB-GASK-TIKHORETSKOE-AMPILOGOV-HOUSEHOLDS-1835-1848";
writeJson(path.join(sourcesDir, `${tikhoretskSourceId}.json`), {
  schemaVersion: 1,
  sourceId: tikhoretskSourceId,
  provider: "ГАСК / опубликованные фамильные указатели к делам",
  recordType: "archival-household-surname-index",
  collection: {
    title: "Ампилоговы и Анпилоговы селения Тихорецкого, 1835–1848",
    archiveCitation: "ГАСК: ф. 459, оп. 2, д. 599 (ревизская сказка 1835); ф. 135, оп. 3, д. 1033 (исповедная роспись 1845); ф. 135, оп. 4, д. 925 (метрическая книга 1846); ф. 135, оп. 6, д. 806 (исповедная роспись 1848).",
  },
  links: { transcription: "https://forum.vgd.ru/post/8716/162807/p5150938.htm" },
  event: { type: "revision", date: { display: "1835" }, place: { placeId: "tikhoretskaya-fastovetskaya", normalized: "селение Тихорецкое, Ставропольский округ, Кавказская область" } },
  transcription: {
    status: "four-archive-citations-surname-indexed",
    literal: "1835, ревизская сказка — Ампилогов; 1845, исповедная роспись — Ампилогов?/Анпилогов; 1846, метрическая книга — Ампилогов; 1848, исповедная роспись — Анпилогов.",
    modernInterpretation: "Фамильная группа устойчиво присутствует в Тихорецком до и после преобразования селения в станицу. Индекс не раскрывает имён и составов дворов.",
  },
  migrationObservations: [{
    from: { placeId: "voronezh-governorate" },
    to: { placeId: "tikhoretskaya-fastovetskaya" },
    basis: "Селение основано в 1829 году однодворцами Воронежской губернии; фамилия Ампилогов присутствует в ревизии 1835 года. Это маршрут общины, но личное происхождение фамильного двора ещё не доказано.",
    confidence: "low",
  }],
  isRecord: true,
  cardKind: "archive-cluster-lead",
  mentions: [
    { mentionId: `${tikhoretskSourceId}-M1`, role: "unresolved-household", personId: null, displayName: "семья Ампилоговых — ревизия 1835", modernName: "неустановленная семья Ампилоговых" },
    { mentionId: `${tikhoretskSourceId}-M2`, role: "unresolved-household", personId: null, displayName: "семья Анпилоговых — исповедные росписи 1845/1848", modernName: "неустановленная семья Анпилоговых" },
  ],
  review: { status: "high-priority-originals-needed", unresolved: ["Снять страницы четырёх дел и создать поимённые карточки всех членов дворов."] },
});

const tikhoretskContinuationSourceId = "PUB-GAKK-RGVIA-TIKHORETSKAYA-FAMILY-LISTS-1854-1868";
writeJson(path.join(sourcesDir, `${tikhoretskContinuationSourceId}.json`), {
  schemaVersion: 1,
  sourceId: tikhoretskContinuationSourceId,
  provider: "ГАКК и РГВИА / опубликованный архивный путеводитель по станице Тихорецкой",
  recordType: "archival-family-list-series-lead",
  collection: {
    title: "Исповедные росписи и посемейные списки станицы Тихорецкой, 1854–1868",
    archiveCitation: "РГВИА: ф. 14877, оп. 1, д. 2049 (1854), д. 3504 (1860), д. 4006 (1862), д. 4255 (1863). ГАКК: ф. 353, оп. 1, д. 1035 (посемейный список 1862), д. 1284 (1863), д. 1961а (1867), д. 2249 (1868); ф. 574, оп. 1, д. 3756 (списки родившихся и умерших 1868–1870).",
  },
  links: { archivalGuide: "https://forum.vgd.ru/post/8716/162807/p5698823.htm" },
  event: { type: "family-list-series", date: { display: "1854–1868" }, place: { placeId: "tikhoretskaya-fastovetskaya", normalized: "станица Тихорецкая, 1-я бригада Кавказского линейного казачьего войска" } },
  transcription: {
    status: "exact-archive-citations-published",
    literal: "Тихорецкая: исповедные росписи 1854, 1860, 1862, 1863; посемейные списки 1862, 1863, 1867, 1868; списки родившихся и умерших 1868–1870.",
    modernInterpretation: "Эта серия способна связать безымянные фамильные дворы Ампилоговых/Анпилоговых 1835–1848 годов с позднейшими поколениями и с Алексеем Ампилоговым 1-й бригады 1848 года. Само тождество пока не доказано.",
  },
  isRecord: true,
  cardKind: "archive-series-lead",
  mentions: [{ mentionId: `${tikhoretskContinuationSourceId}-M1`, role: "unresolved-family-series", personId: null, displayName: "семьи Ампилоговых/Анпилоговых станицы Тихорецкой", modernName: "неустановленные семьи Ампилоговых/Анпилоговых" }],
  review: {
    status: "high-priority-originals-needed",
    unresolved: ["Заказать восемь последовательно датированных дел и построить посемейную реконструкцию 1835–1868 годов."],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const upsertPlace = (place) => {
  const index = places.places.findIndex(({ placeId }) => placeId === place.placeId);
  if (index >= 0) places.places[index] = { ...places.places[index], ...place };
  else places.places.push(place);
};
const osm = (placeId, name, label, kind, latitude, longitude, precision = "settlement", confidence = "high", sourceUrl = null, note = undefined) => upsertPlace({
  placeId, name, label, kind, aliases: [name], geo: { latitude, longitude, precision, confidence, source: "OpenStreetMap / Nominatim", sourceUrl: sourceUrl ?? `https://www.openstreetmap.org/search?query=${encodeURIComponent(name)}`, ...(note ? { note } : {}) },
});

osm("voronezh-governorate", "Воронежская губерния", "Воронежская губерния", "region", 51.6606, 39.2006, "region", "medium", "https://www.openstreetmap.org/relation/72180");
osm("dmitrievskaya-kuban", "Дмитриевская", "станица Дмитриевская, Кавказское линейное казачье войско", "stanitsa", 45.65, 40.75, "settlement", "high", "https://www.openstreetmap.org/search?query=Dmitrievskaya%2C%20Krasnodar");
osm("tiflisskaya-stanitsa", "Тифлисская", "станица Тифлисская (ныне Тбилисская)", "stanitsa", 45.3635681, 40.1898342, "settlement", "high", "https://www.openstreetmap.org/way/52704793");
osm("sunzha-line", "Сунженская линия", "Сунженская казачья линия", "historical-region", 43.31, 45.05, "region", "low", "https://www.openstreetmap.org/#map=8/43.31/45.05", "Региональная точка: открытый индекс не называет конкретную станицу назначения Парфена Анпилова.");
osm("first-brigade-klkv", "1-я бригада КЛКВ", "1-я бригада Кавказского линейного казачьего войска", "military-region", 45.917324, 40.154659, "region", "low", "https://www.openstreetmap.org/way/139662117", "Рабочая точка в Тихорецкой, одной из станиц 1-й бригады; конкретная станица Алексея Ампилогова не установлена.");
osm("novotroitskaya-stanitsa", "Новотроицкая", "станица Новотроицкая, Ставропольская губерния", "stanitsa", 45.3, 41.52, "approximate", "low", null, "Рабочая историческая точка; современное тождество требует проверки.");
osm("verkhnyaya-nikolaevka-bashkiria", "Верхняя Николаевка", "Верхняя Николаевка, Стерлитамакский уезд", "historical-village", 53.528329, 55.566985, "historical-site", "medium", "https://yandex.ru/maps/?ll=55.566985%2C53.528329&z=17");
osm("zhulanka-altai", "Жуланское", "Жуланское (ныне Жуланка), Кочковская волость", "village", 54.366016, 80.604317, "settlement", "high", "https://www.openstreetmap.org/way/93681910");
osm("pankrushikha-altai", "Панкрушиха", "Панкрушиха, Александровская волость", "village", 53.83286, 80.3443, "settlement", "high", "https://www.openstreetmap.org/way/44643322");
osm("shaidurovo-novosibirsk", "Шайдурова", "Шайдурова, Верх-Чингисская волость", "village", 54.0120887, 81.7888698, "settlement", "medium", "https://www.openstreetmap.org/way/111773148");
osm("voronezhskoe-upper-paiva", "Воронежское", "Воронежское, Верх-Пайвинская волость", "historical-village", 53.25, 80.75, "district", "low", "https://www.openstreetmap.org/#map=9/53.25/80.75", "Исчезнувшее или переименованное селение; точка поставлена в пределах исторической волости, ныне Баевский район.");
osm("moralikha-altai", "Моралиха", "Моралиха, Огневская волость", "historical-village", 52.35, 83.65, "district", "low", "https://www.openstreetmap.org/#map=9/52.35/83.65", "Рабочая точка в историческом районе; точное место селения требует сверки с картой Бийского уезда.");
osm("baevo-altai", "Баево", "Баево, Нижне-Кулундинская волость", "village", 53.2685571, 80.77923, "settlement", "high", "https://www.openstreetmap.org/way/44902609");
osm("petropavlovskoe-altai", "Петропавловское", "Петропавловское, Барнаульский уезд", "village", 52.069763, 84.108116, "settlement", "medium", "https://www.openstreetmap.org/way/44682841");
osm("mokhnaty-log-novosibirsk", "Мохнатый Лог", "Мохнатый Лог, Петропавловская волость", "village", 54.023464, 79.587837, "settlement", "high", "https://www.openstreetmap.org/way/67985734");
osm("cheremshanka-tyumentsevo", "Черемшанка", "Черемшанка, Тюменцевская волость", "village", 53.2583398, 81.2519146, "settlement", "high", "https://www.openstreetmap.org/way/909300433");
osm("funtiki-altai", "Фунтики", "Фунтики, Барнаульская волость", "village", 52.7835282, 83.0291338, "settlement", "high", "https://www.openstreetmap.org/way/361445015");
osm("kurya-altai", "Курья", "Курья, Змеиногорский уезд", "village", 51.6003176, 82.2887726, "settlement", "high", "https://www.openstreetmap.org/way/120162084");
osm("tikhoretskaya-fastovetskaya", "Тихорецкое", "селение Тихорецкое (ныне станица Фастовецкая)", "historical-settlement", 45.917324, 40.154659, "historical-site", "high", "https://www.openstreetmap.org/way/139662117");

writeJson(placesPath, places);
console.log(`Импортировано: ${caucasus.length + altai.length + 1} профиля, ${caucasus.length + altai.length + 3} источников, 19 мест.`);
