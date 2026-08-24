import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");

const personId = "P6024";
const source1886 = "YA-OGAOO-389-1-531-24-GAVRIIL";
const source1889 = "YA-OGAOO-389-1-617-6-GAVRIIL";
const contextSource = "PUB-VISHNEVSKY-NIZHNEUVELSK-GAMALEYEVKA-1840";
const sorochinskLead = "PUB-SVRT-SOROCHINSKOE-AMPILOGOV-1866-1907";
const zobovoBankSource = "RGIA-F592-O22-D271-ZOBOVO-ANPILOGOV-1897";

writeJson(path.join(peopleDir, "P6024-gavriil-trifonovich-ampilogov-gamaleyevka.json"), {
  schemaVersion: 1,
  personId,
  displayName: "Гавриил Трифонович Ампилогов",
  sex: "male",
  surname: {
    normalized: "Ампилогов",
    formsAsWritten: ["Гавріилъ Трифоновъ Ампилоговъ"],
  },
  sourceIds: [source1886, source1889, contextSource],
  status: "documented-from-two-primary-scans",
  places: [{ relation: "residence", placeId: "gamaleyevka-buzuluk" }],
  notes: [
    "Запасный солдат села Гамалеевки; выступал восприемником 20 июля 1886 года и 12 февраля 1889 года.",
    "Гамалеевка входила в Графскую волость, куда после Положения об Оренбургском казачьем войске переселяли государственных крестьян Троицкого уезда, выбравших переселение вместо вступления в казачье сословие. Ревизии 1850 и 1858 годов — следующий источник для восстановления двора Ампилоговых.",
    "Совпадение отчества со Стефаном Трифоновичем Анпилоговым из той же Гамалеевки сохраняется как ориентир; семейная связь устанавливается по ревизиям и метрическим актам.",
  ],
});

writeJson(path.join(sourcesDir, `${source1886}.json`), {
  schemaVersion: 1,
  sourceId: source1886,
  provider: "ОГА Оренбургской области — цифровой скан и расшифровка Яндекс Архива",
  recordType: "primary-scan-transcription",
  collection: {
    title: "Метрическая книга сёл Гамалеевка, Кирсановка и Матвеевка за 1886 год",
    archiveCitation: "ОГАОО, ф. 389, оп. 1, д. 531, скан 24, рождение № 57",
  },
  links: { scan: "https://yandex.ru/archive/catalog/4918f20a-7796-41d7-900a-2bac9a7289fe/24" },
  primaryPersonId: personId,
  event: {
    type: "godparent-at-baptism",
    date: { display: "20 июля 1886 года; рождение 19 июля" },
    place: { placeId: "gamaleyevka-buzuluk", normalized: "село Гамалеевка, Бузулукский уезд" },
  },
  mentions: [{
    mentionId: `${source1886}-M1`,
    role: "godfather",
    personId,
    nameAsTranscribed: "запасный солдатъ Гавріилъ Трифоновъ Ампилоговъ",
    displayName: "Гавриил Трифонович Ампилогов",
  }],
  transcription: {
    status: "complete-for-surname-person",
    literal: "Того же села запасный солдатъ Гавріилъ Трифоновъ Ампилоговъ.",
    modernInterpretation: "20 июля 1886 года запасный солдат Гавриил Трифонович Ампилогов из Гамалеевки был восприемником Феофила Турова.",
    layoutNote: "Формула «того же села» относится к месту родителей в той же строке — селу Гамалеевке. Упоминание Сорочинского ниже на листе относится к другой записи.",
  },
  isRecord: true,
  cardKind: "named-primary-record",
  review: { status: "primary-scan-verified", unresolved: [] },
});

writeJson(path.join(sourcesDir, `${source1889}.json`), {
  schemaVersion: 1,
  sourceId: source1889,
  provider: "ОГА Оренбургской области — цифровой скан и расшифровка Яндекс Архива",
  recordType: "primary-scan-transcription",
  collection: {
    title: "Метрическая книга сёл Гамалеевка, Кирсановка и Матвеевка за 1889 год",
    archiveCitation: "ОГАОО, ф. 389, оп. 1, д. 617, скан 6, рождение № 7",
  },
  links: { scan: "https://yandex.ru/archive/catalog/deef0ec4-341a-4d2e-ae76-b13dacb13aa1/6" },
  primaryPersonId: personId,
  event: {
    type: "godparent-at-baptism",
    date: { display: "12 февраля 1889 года; рождение 11 февраля" },
    place: { placeId: "gamaleyevka-buzuluk", normalized: "село Гамалеевка, Бузулукский уезд" },
  },
  mentions: [{
    mentionId: `${source1889}-M1`,
    role: "godfather",
    personId,
    nameAsTranscribed: "запасный солдатъ Гавріилъ Трифоновъ Ампилоговъ",
    displayName: "Гавриил Трифонович Ампилогов",
  }],
  transcription: {
    status: "complete-for-surname-person",
    literal: "Того же села запасный солдатъ Гавріилъ Трифоновъ Ампилоговъ.",
    modernInterpretation: "12 февраля 1889 года запасный солдат Гавриил Трифонович Ампилогов из Гамалеевки был восприемником Евдокии Дудиновой.",
    layoutNote: "Формула «того же села» относится к Гамалеевке в строке родителей; Сорочинское названо в следующей записи и к Гавриилу не относится.",
  },
  isRecord: true,
  cardKind: "named-primary-record",
  review: { status: "primary-scan-verified", unresolved: [] },
});

writeJson(path.join(sourcesDir, `${contextSource}.json`), {
  schemaVersion: 1,
  sourceId: contextSource,
  provider: "В. В. Вишневский / Челябинский государственный краеведческий музей",
  recordType: "scholarly-migration-context-with-archive-citations",
  collection: {
    title: "Изменения в составе населения Нижнеувельской слободы в связи с принятием Положения об Оренбургском казачьем войске",
    archiveCitation: "Гороховские чтения, материалы VII региональной музейной конференции, 2016, с. 243–249; первичные основания: ЦГАСО, ф. 150, оп. 1, д. 77 (1850) и д. 165 (1858).",
  },
  links: {
    publicationPdf: "https://chelmuseum.ru/wp-content/uploads/2024/07/Gorohovskie-chteniya-materialy-sedmoj-regionalnoj-muzejnoj-konferentsii.pdf",
    parallelPublishedDiscussion: "https://forum.vgd.ru/post/1860/3218/p2343674.htm",
  },
  event: {
    type: "state-peasant-resettlement-under-cossack-host-reform",
    date: { display: "1840-е годы; подтверждено ревизиями 1850 и 1858 годов" },
    place: { placeId: "gamaleyevka-buzuluk", normalized: "Гамалеевка, Графская волость, Бузулукский уезд" },
  },
  transcription: {
    status: "scholarly-summary-checked-against-pdf",
    modernInterpretation: "Положение об Оренбургском казачьем войске от 12 декабря 1840 года включало казённые волости Троицкого уезда в войсковую территорию. Государственные крестьяне могли вступить в казачье сословие или в течение двух лет переселиться с льготами и пособиями. Большинство жителей Нижнеувельской слободы, выбравших переселение, было приписано к сельским обществам Графской волости Бузулукского уезда. В Гамалеевке переселенцы из Нижнеувельской составили большинство населения; это подтверждено ревизиями 1850 и 1858 годов.",
  },
  migrationObservations: [{
    from: { placeId: "nizhneuvelskaya-sloboda", asWritten: "Нижнеувельская слобода, Троицкий уезд, Оренбургская губерния" },
    to: { placeId: "gamaleyevka-buzuluk", asWritten: "деревня Гамалеевка, Графская волость, Бузулукский уезд" },
    basis: "Научная статья сопоставляет ревизии 1834, 1850 и 1858 годов и прямо указывает, что в Гамалеевке выходцы из Нижнеувельской слободы составили большинство населения.",
    confidence: "high-for-locality-level-resettlement",
  }],
  legalContext: {
    act: "Высочайше утверждённое положение об Оренбургском казачьем войске",
    date: "12 декабря 1840 года",
    citation: "Полное собрание законов Российской империи, собрание второе, т. XV, отд. 1, № 14041, с. 797–801",
    mechanism: "Выбор между вступлением государственных крестьян в казачье сословие и переселением в течение двух лет с правительственными льготами и пособиями.",
  },
  isRecord: true,
  cardKind: "migration-context-and-route",
  review: {
    status: "scholarly-source-and-archive-citations-verified",
    unresolved: [
      "Просмотреть ЦГАСО, ф. 150, оп. 1, д. 77 и д. 165 по Гамалеевке и выписать дворы Ампилоговых с прежним местом приписки.",
    ],
  },
});

writeJson(path.join(sourcesDir, `${sorochinskLead}.json`), {
  schemaVersion: 1,
  sourceId: sorochinskLead,
  provider: "Форум Союза Возрождения Родословных Традиций — сплошная выписка фамилий",
  recordType: "surname-presence-in-parish-books",
  collection: {
    title: "Фамилии в метрических книгах села Сорочинского за 1866–1907 годы",
    archiveCitation: "ОГАОО, ф. 389, оп. 1; метрические книги села Сорочинского за 1866–1907 годы.",
  },
  links: { publishedSurnameList: "https://forum.svrt.ru/topic/4956-село-сорочинское-бузулукского-уезда/" },
  event: {
    type: "surname-presence-in-parish-books",
    date: { display: "1866–1907 годы" },
    place: { normalized: "село Сорочинское, Бузулукский уезд, Самарская губерния" },
  },
  transcription: {
    status: "published-surname-list",
    literal: "Ампилогов",
    modernInterpretation: "В сплошной фамильной выписке из метрических книг Сорочинского за 1866–1907 годы отмечена фамилия Ампилогов. Поимённые акты подлежат выделению из дел фонда 389, описи 1.",
  },
  isRecord: true,
  cardKind: "surname-level-archival-lead",
  review: {
    status: "archive-series-and-surname-presence-documented",
    unresolved: ["Найти поимённые рождения, браки и смерти Ампилоговых в делах Сорочинского ОГАОО, ф. 389, оп. 1."],
  },
});

writeJson(path.join(peopleDir, "P6025-anpilogov-zobovskaya-volost-bank-1897.json"), {
  schemaVersion: 1,
  personId: "P6025",
  displayName: "Неустановленный Анпилогов из дела по Зобовской волости, 1897",
  sex: "unknown",
  surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилогов"] },
  sourceIds: [zobovoBankSource],
  status: "documented-in-archival-inventory-name-list",
  places: [{ relation: "land-case-association", placeId: "zobovo-orenburg" }],
  notes: [
    "Фамилия Анпилогов присутствует в именном списке дела Крестьянского поземельного банка по земле Марии Степановны Ванюшиной в Зобовской волости.",
    "Само дело РГИА, ф. 592, оп. 22, д. 271 должно дать имя, роль человека и сведения о земле; опубликованная таблица сохраняет только фамилию.",
  ],
});

writeJson(path.join(sourcesDir, `${zobovoBankSource}.json`), {
  schemaVersion: 1,
  sourceId: zobovoBankSource,
  provider: "Великія описи — волонтёрская расшифровка описи РГИА",
  recordType: "archival-inventory-name-list",
  collection: {
    title: "Крестьянский поземельный банк: земля Марии Степановны Ванюшиной в Зобовской волости",
    archiveCitation: "РГИА, ф. 592, оп. 22, д. 271; 27 ноября 1897 года.",
  },
  links: { inventoryTranscription: "https://inv.velikie.org/doc/did510/" },
  primaryPersonId: "P6025",
  event: {
    type: "peasant-land-bank-case-association",
    date: { display: "27 ноября 1897 года" },
    place: { placeId: "zobovo-orenburg", normalized: "Зобовская волость, Оренбургский уезд" },
  },
  mentions: [{
    mentionId: `${zobovoBankSource}-M1`,
    role: "named-person-role-to-be-read-in-file",
    personId: "P6025",
    nameAsTranscribed: "Анпилогов",
    displayName: "Неустановленный Анпилогов из дела по Зобовской волости",
  }],
  transcription: {
    status: "inventory-row-transcribed",
    literal: "22 | 271 | 27.11.1897 | Крестьянский поземельный банк | жена оренбургского купца Мария Степановна Ванюшина | Зобовская волость | Нет | | Полянский, Томин, Ермачков, Меньших, Ширкин, Селиванов, Анпилогов, Сергеев.",
    modernInterpretation: "В деле 271 по земельной операции Крестьянского поземельного банка в Зобовской волости присутствует человек с фамилией Анпилогов. Опись не раскрывает его имя и процессуальную роль.",
  },
  isRecord: true,
  cardKind: "surname-level-exact-archive-case",
  review: {
    status: "exact-case-and-surname-verified",
    unresolved: ["Получить сканы РГИА, ф. 592, оп. 22, д. 271 и выписать полное имя, роль и земельные сведения Анпилогова."],
  },
});

const placesFile = path.join(root, "data/genealogy/places/index.json");
const placesData = JSON.parse(fs.readFileSync(placesFile, "utf8"));
const addPlace = (place) => {
  if (!placesData.places.some((item) => item.placeId === place.placeId)) placesData.places.push(place);
};

addPlace({
  placeId: "gamaleyevka-buzuluk",
  name: "Гамалеевка",
  label: "Гамалеевка, Бузулукский уезд",
  kind: "historical-settlement",
  aliases: ["Гамалеевка", "Гамалѣевка", "деревня Гамалеевка", "село Гамалеевка"],
  geo: {
    latitude: 52.2702,
    longitude: 53.4511,
    precision: "settlement",
    confidence: "high",
    source: "современное село Гамалеевка; историческая идентификация подтверждена справочником населённых мест и метрическими книгами",
    sourceUrl: "https://geotree.ru/oktmo?title=село+Гамалеевка+(Оренбургская+область,+Сорочинский+городской+округ,+53727000166)",
    note: "В XIX веке — Графская волость Бузулукского уезда; одна из деревень массового расселения выходцев из Нижнеувельской слободы после реформы Оренбургского казачьего войска.",
  },
});

addPlace({
  placeId: "nizhneuvelskaya-sloboda",
  name: "Нижнеувельская слобода",
  label: "Нижнеувельская слобода, Троицкий уезд",
  kind: "historical-settlement",
  aliases: ["Нижнеувельская слобода", "Нижнеувельская станица", "Южноуральск"],
  geo: {
    latitude: 54.4439,
    longitude: 61.2564,
    precision: "historical-site",
    confidence: "high",
    source: "современный Южноуральск — преемник Нижнеувельской слободы",
    sourceUrl: "https://znanierussia.ru/articles/Южноуральск",
  },
});
writeJson(placesFile, placesData);

const stefanFile = path.join(peopleDir, "P4302-stefan-trifonovich-anpilogov-gamaleyevka.json");
const stefan = JSON.parse(fs.readFileSync(stefanFile, "utf8"));
stefan.places ??= [];
if (!stefan.places.some((place) => place.placeId === "gamaleyevka-buzuluk")) {
  stefan.places.push({ relation: "residence", placeId: "gamaleyevka-buzuluk" });
}
stefan.sourceIds ??= [];
if (!stefan.sourceIds.includes(contextSource)) stefan.sourceIds.push(contextSource);
const contextNote = "Гамалеевка была одним из центров расселения государственных крестьян Нижнеувельской слободы после Положения об Оренбургском казачьем войске 1840 года; ревизии 1850 и 1858 годов дают следующий путь к раннему двору семьи.";
if (!stefan.notes.includes(contextNote)) stefan.notes.push(contextNote);
writeJson(stefanFile, stefan);

console.log("Импортированы Гавриил Трифонович Ампилогов, два скана и контекст переселения в Гамалеевку.");
