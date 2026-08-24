import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");

const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const founderSourceId = "PUB-HERMOGEN-TAVRIDA-1887-TIMOSHEVKA";
const synthesisSourceId = "PUB-IMSU-ZAPORIZHZHIA-TIMOSHIVKA-1970-1981";
const kiziyarSourceId = "PUB-TAURIDA-TREASURY-EXPEDITION-3943-KIZIYAR-1814";
const novoaleksandrovkaPopulationSourceId = "PUB-NOVOALEKSANDROVKA-POPULATION-1815-1816";

writeJson(path.join(peopleDir, "P0533-timofey-timoshenko.json"), {
  schemaVersion: 1,
  personId: "P0533",
  displayName: "Тимофей Тимошенко",
  sex: "male",
  surname: { normalized: "Тимошенко", formsAsWritten: ["Тимошенко"] },
  sourceIds: [founderSourceId, synthesisSourceId],
  status: "documented-from-published-historical-source",
  notes: [
    "Казак, названный первым поселенцем и эпонимом Тимошевки в справочнике Таврической епархии 1887 года.",
    "Исторический синтез 1970/1981 годов называет его крестьянином-однодворцем, выходцем из военных поселений Днепровской линии, основавшим хутор в урочище Матогай в 1809 году.",
    "Даты жизни и родственные связи пока не установлены; с однофамильцами не объединён.",
  ],
});

writeJson(path.join(peopleDir, "P0534-timofey-ilich-antilogov.json"), {
  schemaVersion: 1,
  personId: "P0534",
  displayName: "Тимофей Ильич Антилогов",
  sex: "male",
  surname: { normalized: "Антилогов", formsAsWritten: ["Антилоговъ", "Антилогов"] },
  birth: { date: "circa 1789", placeId: null },
  death: { date: "1844-08-15", placeId: "tymoshivka" },
  sourceIds: ["FS-3Q9M-CS9Y-FY78", founderSourceId, synthesisSourceId],
  status: "documented-from-primary-scan",
  notes: [
    "В метрической записи Тимошевки назван 55-летним; приблизительный год рождения 1788–1789 рассчитан по возрасту и не является отдельной записью о рождении.",
    "По возрасту мог принадлежать к взрослому поколению переселенцев 1810 года, однако ни Курская, ни Полтавская, ни Черниговская губерния как его личное место происхождения пока не доказана.",
    "Не объединён с другими Тимофеями Анпилоговыми/Ампилоговыми без независимой родственной записи.",
  ],
});

const earlyDeathSourcePath = path.join(root, "data/genealogy/sources/familysearch/3Q9M-CS9Y-FY78.json");
if (fs.existsSync(earlyDeathSourcePath)) {
  const earlyDeathSource = JSON.parse(fs.readFileSync(earlyDeathSourcePath, "utf8"));
  earlyDeathSource.primaryPersonId = "P0534";
  earlyDeathSource.mentions = (earlyDeathSource.mentions || []).map((mention) =>
    mention.mentionId === "FS-3Q9M-CS9Y-FY78-M1" ? { ...mention, personId: "P0534" } : mention
  );
  earlyDeathSource.review = {
    ...(earlyDeathSource.review || {}),
    migrationContext: "Возраст делает его кандидатом на взрослое поколение первых переселенцев 1810 года, но личное место выхода запись не сообщает.",
  };
  writeJson(earlyDeathSourcePath, earlyDeathSource);
}

writeJson(path.join(sourcesDir, `${founderSourceId}.json`), {
  schemaVersion: 1,
  sourceId: founderSourceId,
  provider: "Российская государственная библиотека / Азбука веры",
  recordType: "historical-parish-reference-scan",
  collection: {
    title: "Гермоген (Добронравин). Таврическая епархия",
    archiveCitation: "Псков: Типография губернского правления, 1887. С. 268; цифровая копия РГБ 01003547586, кадр 276 из 533.",
  },
  links: {
    scan: "https://viewer.rsl.ru/ru/rsl01003547586?page=276&rotate=0&theme=white",
    transcription: "https://azbyka.ru/otechnik/Germogen_Dobronravin/tavricheskaja-eparhija/3_22",
    catalog: "https://search.rsl.ru/ru/record/01003547586",
  },
  event: {
    type: "settlement-foundation",
    date: { display: "1810" },
    place: { placeId: "tymoshivka", normalized: "Тимошевка, Мелитопольский уезд, Таврическая губерния" },
  },
  transcription: {
    status: "verified-against-page-scan",
    literal: "На этой местности в 1810 г. поселились выходцы из черниговской, полтавской и курской губерний, называвшие себя однодворцами, но впоследствии переименованные в государственные крестьяне, и назвали поселок именем первого поселенца козака Тимофея Тимошенко.",
    modernInterpretation: "Печатный источник XIX века подтверждает смешанное происхождение первой общины Тимошевки из Курской, Полтавской и Черниговской губерний, её самоназвание как однодворцев и имя первого поселенца.",
  },
  migrationObservations: [
    { from: { placeId: "kursk-governorate" }, to: { placeId: "tymoshivka" }, basis: "Скан издания 1887 года, с. 268: выходцы Курской губернии поселились в 1810 году.", confidence: "high" },
    { from: { placeId: "poltava-governorate" }, to: { placeId: "tymoshivka" }, basis: "Скан издания 1887 года, с. 268: выходцы Полтавской губернии поселились в 1810 году.", confidence: "high" },
    { from: { placeId: "chernigov-governorate" }, to: { placeId: "tymoshivka" }, basis: "Скан издания 1887 года, с. 268: выходцы Черниговской губернии поселились в 1810 году.", confidence: "high" },
  ],
  isRecord: true,
  cardKind: "settlement-wave",
  primaryPersonId: "P0533",
  mentions: [{ mentionId: `${founderSourceId}-M1`, role: "first-settler", personId: "P0533", displayName: "Тимофей Тимошенко", modernName: "Тимофей Тимошенко" }],
  review: {
    status: "primary-scan-verified",
    unresolved: [
      "Найти ведомость или указ 1809–1810 годов с поимённым составом первых партий.",
      "Проверить, существовали ли отдельные по времени курская и украинская партии: источник 1887 года объединяет их в 1810 году.",
    ],
  },
});

writeJson(path.join(sourcesDir, `${synthesisSourceId}.json`), {
  schemaVersion: 1,
  sourceId: synthesisSourceId,
  provider: "Институт истории АН УССР / История городов и сёл Украинской ССР",
  recordType: "published-historical-synthesis-with-archive-citations",
  collection: {
    title: "История городов и сёл Украинской ССР. Запорожская область: Тимошовка",
    archiveCitation: "Украинское издание 1970 года, с. 486, скан Института истории Украины; русское издание 1981 года, электронная расшифровка. Украинское издание ссылается на Крымский областной архив, ф. 26, оп. 1, д. 1063, л. 27.",
  },
  links: {
    scanRecord: "https://resource.history.org.ua/item/0009230",
    scanPdf: "https://history.org.ua/LiberUA/IMSU_ZapObl_1970/IMSU_ZapObl_1970.pdf",
    russianTranscription: "https://ukrssr.com/zapor/mihajlovskij/timoshovka-mihajlovskij-rajon-zaporozhskaya-oblast",
  },
  event: {
    type: "settlement-waves",
    date: { display: "1809–1814" },
    place: { placeId: "tymoshivka", normalized: "Тимошовка, Мелитопольский уезд, Таврическая губерния" },
  },
  transcription: {
    status: "scan-and-edition-variant-compared",
    literal: "Русское издание: в 1810 году поселились государственные крестьяне из Обоянского, Белгородского, Корочанского, Суджанского и Тимского уездов Курской губернии; затем государство поселило крестьян из Полтавской, Черниговской и Харьковской губерний. Украинское издание 1970 года: одновременно прибыли крестьяне из Курской, позднее — из Полтавской, Черниговской и Харьковской губерний.",
    modernInterpretation: "Издание фиксирует как минимум две описанные группы переселенцев и раскрывает пять курских уездов. Однако формулировка о последовательности волн различается между редакциями, поэтому точные годы второй партии не проставлены.",
  },
  migrationObservations: [
    { from: { placeId: "oboyan-uezd-kursk" }, to: { placeId: "tymoshivka" }, basis: "Русское издание 1981 года: государственные крестьяне Обоянского уезда, 1810.", confidence: "medium" },
    { from: { placeId: "belgorod-uezd-kursk" }, to: { placeId: "tymoshivka" }, basis: "Русское издание 1981 года: государственные крестьяне Белгородского уезда, 1810.", confidence: "medium" },
    { from: { placeId: "korocha-uezd" }, to: { placeId: "tymoshivka" }, basis: "Русское издание 1981 года: государственные крестьяне Корочанского уезда, 1810.", confidence: "medium" },
    { from: { placeId: "sudzha-uezd-kursk" }, to: { placeId: "tymoshivka" }, basis: "Русское издание 1981 года: государственные крестьяне Суджанского уезда, 1810.", confidence: "medium" },
    { from: { placeId: "tim-uezd-kursk" }, to: { placeId: "tymoshivka" }, basis: "Русское издание 1981 года: государственные крестьяне Тимского уезда, 1810.", confidence: "medium" },
    { from: { placeId: "kharkov-governorate" }, to: { placeId: "tymoshivka" }, basis: "Обе редакции называют последующее поселение крестьян Харьковской губернии; точный год не указан.", confidence: "medium" },
  ],
  isRecord: true,
  cardKind: "settlement-wave",
  primaryPersonId: "P0533",
  mentions: [{ mentionId: `${synthesisSourceId}-M1`, role: "founder", personId: "P0533", displayName: "Тимофей Тимошенко", modernName: "Тимофей Тимошенко" }],
  review: {
    status: "edition-conflict-preserved",
    unresolved: [
      "Раскрыть источник русской редакции для списка пяти уездов и найти поимённые ведомости.",
      "Заказать Крымский архив: ф. 26, оп. 1, д. 1063, л. 27; проверить, относится ли лист к численности и земле 1814 года или также к происхождению переселенцев.",
    ],
  },
});

writeJson(path.join(sourcesDir, `${kiziyarSourceId}.json`), {
  schemaVersion: 1,
  sourceId: kiziyarSourceId,
  provider: "Таврическая казённая экспедиция / публикация Н. В. Крылова",
  recordType: "quoted-government-resettlement-order",
  collection: {
    title: "Указы губернскому землемеру Мухину о переселении тимошевских жителей в урочище Кизияр",
    archiveCitation: "Указ, полученный 26 июня 1813 года; указ Казённой экспедиции от 13 апреля 1814 года; указ Таврической казённой экспедиции № 3943 от 10 августа 1814 года; входящая запись № 127 от 11 августа; исходящая запись № 186 от 25 августа; входящая запись № 162 от 27 октября; план землемера А. Разумова, ноябрь 1814 года. Современные архивные шифры в доступной публикации не приведены.",
  },
  links: {
    publication: "https://vmelitopole.com/istoriya/osnovanie-melitopolya-1783-1814/vozniknovenie-melitopolya-i-prigorodov",
    secondaryBookScan: "https://e-univers.ru/upload/iblock/c65/m4e013h2iyz1r0lhc0dv1xnf9w6zr5dr.pdf",
  },
  event: {
    type: "government-authorized-resettlement",
    date: { display: "26 июня 1813 — ноябрь 1814" },
    place: { placeId: "kiziyar-melitopol", normalized: "Кизияр, Мелитопольский уезд, Таврическая губерния" },
  },
  transcription: {
    status: "document-quoted-in-published-local-history",
    literal: "26 июня 1813 года землемер Мухин получил указ о просьбе 334 душ мужского пола из Тимошевки переселиться из-за недостатка воды в урочище Кизильяр. 13 апреля 1814 года Казённая экспедиция предоставила им участок № 39 (9 000 десятин удобной и 586 неудобной земли), велела показать его в натуре, разбить места под церковь и дома и разрешила селиться после мая. Указ № 3943 от 10 августа фиксирует прибытие первых 95 душ и начало строительства. Записи № 127, № 186 и № 162 прослеживают передачу приказа землемерам и отвод участков; в ноябре Разумов составил план нового селения Новоалександровки.",
    modernInterpretation: "Это подтверждённая документами исходящая переселенческая волна Тимошевка → Кизияр/Новоалександровка: массовое прошение 334 мужчин, официальное выделение земли, первая партия из 95 душ и межевой план нового селения.",
  },
  migrationObservations: [
    { from: { placeId: "tymoshivka" }, to: { placeId: "kiziyar-melitopol" }, basis: "Указы 1813–1814 годов: прошение 334 мужских душ, прибытие первых 95 и начало строительства.", confidence: "high" },
  ],
  isRecord: true,
  cardKind: "government-resettlement-order",
  mentions: [],
  review: {
    status: "quoted-order-archive-original-needed",
    unresolved: [
      "Установить современные архивные шифры журналов землемера Мухина, указов 1813–1814 годов и плана Разумова; снять сканы каждого документа.",
      "Найти приложение или посемейную ведомость с именами 334 просителей и первых 95 переселенцев.",
    ],
  },
});

writeJson(path.join(sourcesDir, `${novoaleksandrovkaPopulationSourceId}.json`), {
  schemaVersion: 1,
  sourceId: novoaleksandrovkaPopulationSourceId,
  provider: "Публикация Н. В. Крылова по документам Таврической губернии",
  recordType: "published-revision-and-settlement-population-summary",
  collection: {
    title: "Население Новоалександровки в 1815–1816 годах",
    archiveCitation: "Прошение новоалександровцев 1815 года о строительстве церкви; ведомости VII ревизии, составленные в 1816 году; номера дел первичных ведомостей в открытой публикации не приведены.",
  },
  links: {
    publication: "https://vmelitopole.com/istoriya/melitopol-v-sostave-rossijskoj-imperii-1814-1917/naselenie",
  },
  event: {
    type: "revision-and-settlement-population",
    date: { display: "1815 — 7 декабря 1816" },
    place: { placeId: "kiziyar-melitopol", normalized: "Новоалександровка (Кизияр), Мелитопольский уезд, Таврическая губерния" },
  },
  transcription: {
    status: "figures-quoted-in-published-local-history",
    literal: "В прошении 1815 года указаны 572 наличные души мужского пола в Новоалександровке и 20 в деревне Мордвиновой, 609 душ женского пола в обоих местах и ещё 189 мужчин, назначенных к переселению. В феврале 1816 года ведомость показывала 716 мужчин; к 7 декабря 1816 года VII ревизия — 736 мужчин. Экономические примечания дают близкие, но расходящиеся итоги: 742/721 и 740/754 мужчин/женщин.",
    modernInterpretation: "Публикация указывает на существование поимённых или как минимум подворных материалов VII ревизии для ранней Новоалександровки. Расхождение итогов сохранено и не сглажено.",
  },
  isRecord: true,
  cardKind: "revision-population-lead",
  mentions: [],
  review: {
    status: "published-summary-primary-lists-needed",
    unresolved: [
      "Найти первичную ведомость VII ревизии Новоалександровки 1815–1816 годов и выписать все семьи.",
      "Проверить, входят ли в неё 95 первых тимошевских переселенцев и есть ли среди них Анпилоговы/Ампилоговы.",
      "Установить архивные шифры прошения 1815 года, февральской ведомости и ведомости на 7 декабря 1816 года.",
    ],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const upsertPlace = (place) => {
  const index = places.places.findIndex(({ placeId }) => placeId === place.placeId);
  if (index >= 0) places.places[index] = { ...places.places[index], ...place };
  else places.places.push(place);
};

upsertPlace({ placeId: "kursk-governorate", name: "Курская губерния", label: "Курская губерния", kind: "region", aliases: ["Курская губерния"], geo: { latitude: 51.73036, longitude: 36.19265, precision: "region", confidence: "medium", source: "рабочая точка в губернском городе Курске", sourceUrl: "https://www.openstreetmap.org/relation/72223" } });
upsertPlace({ placeId: "poltava-governorate", name: "Полтавская губерния", label: "Полтавская губерния", kind: "region", aliases: ["Полтавская губерния"], geo: { latitude: 49.58827, longitude: 34.55142, precision: "region", confidence: "medium", source: "рабочая точка в губернском городе Полтаве", sourceUrl: "https://www.openstreetmap.org/relation/91229" } });
upsertPlace({ placeId: "chernigov-governorate", name: "Черниговская губерния", label: "Черниговская губерния", kind: "region", aliases: ["Черниговская губерния"], geo: { latitude: 51.4982, longitude: 31.28935, precision: "region", confidence: "medium", source: "рабочая точка в губернском городе Чернигове", sourceUrl: "https://www.openstreetmap.org/relation/2551637" } });
upsertPlace({ placeId: "kharkov-governorate", name: "Харьковская губерния", label: "Харьковская губерния", kind: "region", aliases: ["Харьковская губерния"], geo: { latitude: 49.99232, longitude: 36.23101, precision: "region", confidence: "medium", source: "рабочая точка в губернском городе Харькове", sourceUrl: "https://www.openstreetmap.org/relation/968629" } });
upsertPlace({ placeId: "oboyan-uezd-kursk", name: "Обоянский уезд", label: "Обоянский уезд, Курская губерния", kind: "district", aliases: ["Обоянский уезд"], geo: { latitude: 51.20981, longitude: 36.27666, precision: "district", confidence: "medium", source: "рабочая точка в уездном городе Обояни", sourceUrl: "https://www.openstreetmap.org/relation/1670117" } });
upsertPlace({ placeId: "belgorod-uezd-kursk", name: "Белгородский уезд", label: "Белгородский уезд, Курская губерния", kind: "district", aliases: ["Белгородский уезд"], geo: { latitude: 50.59541, longitude: 36.58725, precision: "district", confidence: "medium", source: "рабочая точка в уездном городе Белгороде", sourceUrl: "https://www.openstreetmap.org/relation/1125159" } });
upsertPlace({ placeId: "sudzha-uezd-kursk", name: "Суджанский уезд", label: "Суджанский уезд, Курская губерния", kind: "district", aliases: ["Суджанский уезд"], geo: { latitude: 51.1976, longitude: 35.2726, precision: "district", confidence: "medium", source: "рабочая точка в уездном городе Судже", sourceUrl: "https://www.openstreetmap.org/search?query=Sudzha" } });
upsertPlace({ placeId: "tim-uezd-kursk", name: "Тимский уезд", label: "Тимский уезд, Курская губерния", kind: "district", aliases: ["Тимский уезд"], geo: { latitude: 51.622, longitude: 37.124, precision: "district", confidence: "medium", source: "рабочая точка в уездном городе Тиме", sourceUrl: "https://www.openstreetmap.org/search?query=Tim%2C%20Kursk" } });
upsertPlace({ placeId: "kiziyar-melitopol", name: "Кизияр", label: "Кизияр (Новоалександровка), Мелитопольский уезд", kind: "historical-settlement", aliases: ["Кизияр", "Кизильяр", "Кизиляр", "Новоалександровка"], geo: { latitude: 46.865, longitude: 35.36, precision: "historical-site", confidence: "medium", source: "исторический пригород Мелитополя; рабочая точка", sourceUrl: "https://www.openstreetmap.org/search?query=Kiziyar%2C%20Melitopol" } });

writeJson(placesPath, places);
console.log("Импортировано: 2 карточки, 4 источника, 9 направлений/мест.");
