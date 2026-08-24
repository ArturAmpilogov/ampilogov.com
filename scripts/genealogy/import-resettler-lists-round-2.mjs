import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");

const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const slug = (value) => value.toLowerCase().replace(/ё/g, "е").replace(/[^а-яa-z0-9]+/g, "-").replace(/^-|-$/g, "");

const people = [
  ["P0525", "Семён Павлович Антилогов", "Антилогов", "PUB-GAVO-I18-1-473-GNILUSHA-1850", "Домохозяин № 2 в ревизской сказке государственных крестьян села Гнилуши 1850 года; в выписке записан как «Семен Павлов Антилогов», л. 5."],
  ["P0526", "Игнат Евсеевич Анпилогов", "Анпилогов", "PUB-GAVO-I18-1-473-GNILUSHA-1850", "Домохозяин № 287 в ревизской сказке государственных крестьян села Гнилуши 1850 года; в выписке записан как «Игнат Евсеев Анпилогов»."],
  ["P0527", "Спиридон Иванович Анпилогов", "Анпилогов", "PUB-GAVO-I18-1-473-GNILUSHA-1850", "Домохозяин № 327 в ревизской сказке государственных крестьян села Гнилуши 1850 года; в выписке записан как «Спиридон Иванов Анпилогов»."],
  ["P0528", "Иуда Ермолаевич Анпилогов", "Анпилогов", "PUB-GAVO-I18-1-473-GNILUSHA-1850", "Домохозяин № 395 в ревизской сказке государственных крестьян села Гнилуши 1850 года; в выписке записан как «Иуда Ермолаев Анпилогов»."],
  ["P0529", "Иван Антилогов", "Антилогов", "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA", "Старший домохозяин № 9 деревни Новая Васильевка по поселенному списку Всесоюзной переписи 1926 года."],
  ["P0530", "Пётр Антилогов", "Антилогов", "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA", "Старший домохозяин № 13 деревни Новая Васильевка по поселенному списку Всесоюзной переписи 1926 года."],
  ["P0531", "Влад Анпилогов", "Анпилогов", "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA", "Старший домохозяин № 50 деревни Новая Васильевка по поселенному списку Всесоюзной переписи 1926 года; имя передано в опубликованной выписке как «Влад»."],
  ["P0532", "Тимофей Анпилогов", "Анпилогов", "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA", "Старший домохозяин № 61 деревни Новая Васильевка по поселенному списку Всесоюзной переписи 1926 года."],
];

for (const [personId, displayName, surname, sourceId, note] of people) {
  writeJson(path.join(peopleDir, `${personId}-${slug(displayName)}.json`), {
    schemaVersion: 1,
    personId,
    displayName,
    sex: "male",
    surname: { normalized: surname, formsAsWritten: [surname, surname.replace(/в$/, "въ")] },
    sourceIds: [sourceId],
    status: "documented-from-published-archival-transcription",
    notes: [note, "Не объединён с другими однофамильцами: для связи требуется состав двора или иной независимый документ."],
  });
}

const gnilushaPeople = people.slice(0, 4);
writeJson(path.join(sourcesDir, "PUB-GAVO-I18-1-473-GNILUSHA-1850.json"), {
  schemaVersion: 1,
  sourceId: "PUB-GAVO-I18-1-473-GNILUSHA-1850",
  provider: "ГАВО / опубликованная архивная выписка ВГД",
  recordType: "revision-list-transcription",
  collection: {
    title: "9-я ревизская сказка государственных крестьян села Гнилуши Павловского уезда, 1850",
    archiveCitation: "ГАВО, ф. И-18, оп. 1, д. 473; село Гнилуши, лл. 6–388; 459 дворов",
  },
  links: {
    transcription: "https://forum.vgd.ru/post/2858/127402/p4341582.htm",
    familySearchFilm: "https://www.familysearch.org/search/catalog/results?count=20&query=%2Bfilm_number%3A007430931",
  },
  event: { type: "revision", date: { display: "1850" }, place: { placeId: "gnilusha-pavlovsk", normalized: "село Гнилуши, Павловский уезд, Воронежская губерния" } },
  transcription: {
    status: "partial-name-index-verified-against-film-location",
    literal: "№ 2 Семен Павлов Антилогов, л. 5; № 287 Игнат Евсеев Анпилогов; № 327 Спиридон Иванов Анпилогов; № 395 Иуда Ермолаев Анпилогов.",
    modernInterpretation: "Четыре самостоятельных двора фамильной группы в крупном государственном селе. Соседние дворы содержат многочисленные отметки о перечислении в Астраханскую губернию в 1837–1849 годах, но у этих четырёх строк отметки о переселении в опубликованной выписке нет.",
  },
  isRecord: true,
  cardKind: "household-index",
  primaryPersonId: "P0525",
  mentions: gnilushaPeople.map(([personId, displayName], i) => ({ mentionId: `PUB-GAVO-I18-1-473-GNILUSHA-1850-M${i + 1}`, role: "head-of-household", personId, displayName, modernName: displayName })),
  review: {
    status: "partial-transcription",
    unresolved: [
      "Снять полные развороты четырёх дворов из 9-й и 10-й ревизий и добавить жён, детей, братьев, возраст и отметки о выбытии.",
      "Проверить, является ли форма «Антилогов» писарским вариантом Анпилогова или отдельной фамилией.",
    ],
  },
});

writeJson(path.join(sourcesDir, "PUB-GAVO-I24-1-339-RECRUIT-CHANGES-1848.json"), {
  schemaVersion: 1,
  sourceId: "PUB-GAVO-I24-1-339-RECRUIT-CHANGES-1848",
  provider: "ГАВО / опубликованная архивная выписка ВГД",
  recordType: "recruitment-household-change-list",
  collection: { title: "Протоколы хозяйственного отделения за сентябрь 1848 года", archiveCitation: "ГАВО, ф. И-24, оп. 1, д. 339" },
  links: { transcription: "https://forum.vgd.ru/post/2858/127402/p5732244.htm" },
  event: { type: "recruitment-list", date: { display: "сентябрь 1848" }, place: { placeId: "pavlovsk-uezd-voronezh", normalized: "Павловский уезд, Воронежская губерния" } },
  transcription: {
    status: "surname-only-extract",
    literal: "Журавское общество — ... Анпилогов ...; Буйловское общество — ... Анпилогов ...",
    modernInterpretation: "Дело содержит поимённые изменения по рекрутским семействам: умершие, выбывшие, число работников и очередность. В опубликованной выписке сохранены только фамилии, поэтому лица пока не создавались.",
  },
  isRecord: true,
  cardKind: "archive-lead",
  mentions: [
    { mentionId: "PUB-GAVO-I24-1-339-RECRUIT-CHANGES-1848-M1", role: "unresolved-household", personId: null, displayName: "неустановленный Анпилогов — Журавское общество", modernName: "неустановленный Анпилогов" },
    { mentionId: "PUB-GAVO-I24-1-339-RECRUIT-CHANGES-1848-M2", role: "unresolved-household", personId: null, displayName: "неустановленный Анпилогов — Буйловское общество", modernName: "неустановленный Анпилогов" },
  ],
  review: { status: "high-priority-original-needed", unresolved: ["Запросить или просмотреть листы дела с фамилией: они обещают состав семей и точные изменения между ревизиями."] },
});

const bashkiriaPeople = people.slice(4);
writeJson(path.join(sourcesDir, "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA.json"), {
  schemaVersion: 1,
  sourceId: "PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA",
  provider: "Всесоюзная перепись 1926 года / опубликованная поселённая выписка",
  recordType: "settlement-householder-list",
  collection: { title: "Список старшим домохозяевам деревни Васильевка Новая Ново-Николаевского сельсовета", archiveCitation: "Перепись 1926 года, Ашкадарская волость; листы поселённых списков 2220–2222" },
  links: { transcription: "https://forum.vgd.ru/post/10079/189568/p5616577.htm", localityIndex: "https://ufagen.ru/node/8071" },
  event: { type: "census", date: { display: "1926" }, place: { placeId: "novaya-vasilevka-bashkiria", normalized: "деревня Новая Васильевка, Ашкадарская волость, Башкирская АССР" } },
  transcription: { status: "published-householder-index", literal: "№ 9 Антилогов Иван; № 13 Антилогов Петр; № 50 Анпилогов Влад; № 61 Анпилогов Тимофей.", modernInterpretation: "В одном переселенческом селении присутствуют сразу две письменные формы фамилии. Само селение основано переселенцами в 1890 году; происхождение именно этих четырёх дворов пока не установлено." },
  isRecord: true,
  cardKind: "settler-community-list",
  primaryPersonId: "P0529",
  mentions: bashkiriaPeople.map(([personId, displayName], i) => ({ mentionId: `PUB-BASHKIRIA-CENSUS-1926-NOVAYA-VASILIEVKA-M${i + 1}`, role: "head-of-household", personId, displayName, modernName: displayName })),
  review: { status: "collateral-migration-branch", unresolved: ["Получить полные переписные листы 2220–2222: состав семей, возраст и место рождения могут вывести на исходную губернию."] },
});

writeJson(path.join(sourcesDir, "PUB-PRYVILNE-RESETTLEMENT-WAVES-1876-1914.json"), {
  schemaVersion: 1,
  sourceId: "PUB-PRYVILNE-RESETTLEMENT-WAVES-1876-1914",
  provider: "История села Привольного с архивными и земскими ссылками",
  recordType: "local-history-with-source-citations",
  collection: {
    title: "Історія Привільненської сільської ради",
    archiveCitation: "В основе миграционной цифры: Сборник Херсонского земства, 1887, № 4, с. 104–105",
  },
  links: {
    localHistory: "https://bashtanschina.narod.ru/silradi/privilne/history.htm",
    zemstvoScanRecord: "https://elib.rgo.ru/handle/123456789/222247",
  },
  event: { type: "mass-resettlement", date: { display: "1876–1914" }, place: { placeId: "pryvilne-kherson", normalized: "Привольное, Херсонский уезд" } },
  transcription: {
    status: "conflicting-secondary-transcriptions-source-identified",
    literal: "Вариант 1: за 1876–1884 годы на Северный Кавказ и в Ставропольский край переселилось 76 семей (1876 — 38; 1883 — 8; последняя испорченная в веб-тексте дата — 30 семей). Вариант 2: только за 1883–1884 годы — 38 семей. В 1914 году из Привольнянской волости в Тургайский край переселилось 195 человек.",
    modernInterpretation: "Привольное было не только принимающим селом однодворцев, но позднее стало крупным пунктом исходящей миграции. Число и разбивка семей требуют сверки со сканом земского сборника.",
  },
  migrationObservations: [
    { from: { placeId: "pryvilne-kherson" }, to: { placeId: "north-caucasus-region" }, basis: "Локальная история со ссылкой на Сборник Херсонского земства, 1887, № 4, с. 104–105; количественные версии расходятся.", confidence: "medium" },
    { from: { placeId: "pryvilne-kherson" }, to: { placeId: "stavropol-governorate" }, basis: "Локальная история со ссылкой на Сборник Херсонского земства, 1887, № 4, с. 104–105; количественные версии расходятся.", confidence: "medium" },
    { from: { placeId: "pryvilne-kherson" }, to: { placeId: "turgai-region" }, basis: "Сообщение о 195 переселенцах Привольнянской волости в 1914 году; поимённый список ещё не найден.", confidence: "medium" },
  ],
  isRecord: true,
  cardKind: "mass-migration-lead",
  mentions: [],
  review: {
    status: "source-conflict-preserved",
    unresolved: [
      "Проверить страницы 104–105 скана № 4 за 1887 год и восстановить точные годы и количество семей.",
      "Искать приложения и волостные ведомости с поимёнными списками 76 семей и 195 человек.",
    ],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const upsertPlace = (place) => {
  const index = places.places.findIndex(({ placeId }) => placeId === place.placeId);
  if (index >= 0) places.places[index] = { ...places.places[index], ...place };
  else places.places.push(place);
};

upsertPlace({ placeId: "gnilusha-pavlovsk", name: "Гнилуши", label: "Гнилуши, Павловский уезд, Воронежская губерния", kind: "historical-village", aliases: ["Гнилуши", "Гнилуша", "Верхняя Гнилуша", "Лозовое"], geo: { latitude: 50.2720254, longitude: 40.3506035, precision: "historical-site", confidence: "medium", source: "Историческая топонимика Воронежского края / современное Лозовое", sourceUrl: "https://regionum.ru/voronezhskaya-oblast/verhnemamonskiy-rayon/lozovoe/", note: "Рабочее отождествление с современной Верхней Гнилушей — селом Лозовое. Проверить, что ревизия Гнилушенской волости относится именно к этому селению, а не к Нижней Гнилуше." } });
upsertPlace({ placeId: "pavlovsk-uezd-voronezh", name: "Павловский уезд", label: "Павловский уезд, Воронежская губерния", kind: "district", aliases: ["Павловский уезд"], geo: { latitude: 50.45778, longitude: 40.10806, precision: "district", confidence: "medium", source: "рабочая точка в уездном городе Павловске", sourceUrl: "https://www.openstreetmap.org/search?query=Pavlovsk%2C%20Voronezh" } });
upsertPlace({ placeId: "novaya-vasilevka-bashkiria", name: "Новая Васильевка", label: "Новая Васильевка, Стерлитамакский уезд", kind: "village", aliases: ["Васильевка Новая", "Новая Васильевка"], geo: { latitude: 53.47147, longitude: 55.83539, precision: "settlement", confidence: "high", source: "OpenStreetMap", sourceUrl: "https://www.openstreetmap.org/node/1141751442" } });
upsertPlace({ placeId: "north-caucasus-region", name: "Северный Кавказ", label: "Северный Кавказ", kind: "region", aliases: ["Северный Кавказ", "Північний Кавказ"], geo: { latitude: 43.5, longitude: 44.5, precision: "region", confidence: "low", source: "рабочая региональная точка", sourceUrl: "https://www.openstreetmap.org/#map=6/43.5/44.5" } });
upsertPlace({ placeId: "stavropol-governorate", name: "Ставропольская губерния", label: "Ставропольская губерния", kind: "region", aliases: ["Ставропольская губерния", "Ставропольский край"], geo: { latitude: 45.04484, longitude: 41.96902, precision: "region", confidence: "medium", source: "рабочая точка в Ставрополе", sourceUrl: "https://www.openstreetmap.org/relation/108774" } });
upsertPlace({ placeId: "turgai-region", name: "Тургайская область", label: "Тургайская область Российской империи", kind: "region", aliases: ["Тургайский край", "Тургайская область"], geo: { latitude: 50.25, longitude: 65.2, precision: "region", confidence: "low", source: "рабочая историко-региональная точка", sourceUrl: "https://www.openstreetmap.org/#map=5/50.25/65.2" } });
writeJson(placesPath, places);

console.log(`Импортировано: ${people.length} карточек, 4 источника, 6 мест.`);
