import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const CAUCASUS_1827 = "RGIA-F379-O1-D856-NIKOLSKOE-ANPILOGOV-1827";
const ORENBURG_1832 = "RGIA-F379-O1-D1206-NIKOLSKOE-ANPILOGOV-1832";
const SHCHIGRY_1832 = "RGIA-F379-O1-D1209-BOLSHIE-SHCHIGRY-ANPILOGOV-1832";

const groups = [
  ...[
    ["P0582", "tikhon-anpilogov-nikolskoe-1827", "Тихон Анпилогов"],
    ["P0583", "grigoriy-anpilogov-nikolskoe-1827", "Григорий Анпилогов"],
    ["P0584", "alexey-anpilogov-nikolskoe-1827", "Алексей Анпилогов"],
    ["P0585", "sidor-anpilogov-nikolskoe-1827", "Сидор Анпилогов"],
  ].map(([id, slug, name]) => ({ id, slug, name, source: CAUCASUS_1827, year: 1827, destination: "north-caucasus-region", destinationLabel: "Кавказская область" })),
  ...[
    ["P0586", "prokhor-anpilogov-nikolskoe-1832", "Прохор Анпилогов"],
    ["P0587", "tikhon-anpilogov-nikolskoe-1832", "Тихон Анпилогов"],
    ["P0588", "andrey-anpilogov-nikolskoe-1832", "Андрей Анпилогов"],
    ["P0589", "ivan-1-anpilogov-nikolskoe-1832", "Иван Анпилогов (1-й в реестре 1832 года)"],
    ["P0590", "leon-anpilogov-nikolskoe-1832", "Леон Анпилогов"],
    ["P0591", "ivan-2-anpilogov-nikolskoe-1832", "Иван Анпилогов (2-й в реестре 1832 года)"],
  ].map(([id, slug, name]) => ({ id, slug, name, source: ORENBURG_1832, year: 1832, destination: "orenburg-governorate", destinationLabel: "Оренбургская губерния" })),
];

for (const person of groups) {
  const possibleMatch = person.id === "P0587"
    ? "Возможно, тот же Тихон Анпилогов, который входил в кавказское прошение 1827 года (P0582), но без отчества и состава семьи тождество не утверждается."
    : null;
  writeJson(path.join(peopleDir, `${person.id}-${person.slug}.json`), {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: "male",
    surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилоговы"] },
    sourceIds: [person.source],
    status: "documented-from-published-archival-transcription",
    notes: [
      `Назван в именном реестре казённых поселян села Никольского под Княжьими, просивших в ${person.year} году о переселении в ${person.destinationLabel}.`,
      "Документ фиксирует прошение и подготовительный административный этап; фактическое прибытие в место назначения этим источником не доказано.",
      ...(possibleMatch ? [possibleMatch] : []),
    ],
    places: [
      { relation: "migration-origin", placeId: "nikolskoe-pod-knyazhimi-pervomayskoe" },
      { relation: "migration-destination", placeId: person.destination },
    ],
  });
}

writeJson(path.join(peopleDir, "P0592-grigoriy-anpilogov-bolshie-shchigry-1832.json"), {
  schemaVersion: 1,
  personId: "P0592",
  displayName: "Григорий Анпилогов",
  sex: "male",
  surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилоговы"] },
  sourceIds: [SHCHIGRY_1832],
  status: "documented-from-published-archival-transcription",
  notes: [
    "В реестре 1832 года назван рядом с Василием Анпилоговым среди жителей Больших Щигров, просивших о переселении в Оренбургскую губернию; характер родства не указан.",
    "Фактическое переселение Григория этим документом не подтверждено.",
  ],
  places: [
    { relation: "migration-origin", placeId: "bolshie-shchigry-vyazovoe" },
    { relation: "migration-destination", placeId: "orenburg-governorate" },
  ],
});

const vasilyFile = fs.readdirSync(peopleDir).find((name) => name.startsWith("P0559-"));
const vasily = JSON.parse(fs.readFileSync(path.join(peopleDir, vasilyFile), "utf8"));
vasily.sourceIds = [...new Set([...(vasily.sourceIds || []), SHCHIGRY_1832])];
vasily.notes = [...(vasily.notes || []), "С высокой вероятностью это тот же Василий Анпилогов, который в реестре РГИА 1832 года вместе с Григорием просил разрешения переселиться из Больших Щигров в Оренбургскую губернию: совпадают редкая фамилия, исходное село, направление и последовательность дат; отчество в реестре 1832 года не приведено."];
writeJson(path.join(peopleDir, vasilyFile), vasily);

const makeMentions = (sourceId, people) => people.map((person, index) => ({
  mentionId: `${sourceId}-M${index + 1}`,
  role: "prospective-resettler",
  personId: person.id,
  displayName: person.name,
  modernName: person.name,
}));

writeJson(path.join(sourcesDir, `${CAUCASUS_1827}.json`), {
  schemaVersion: 1,
  sourceId: CAUCASUS_1827,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "resettlement-petition-register",
  collection: { title: "Анпилоговы из Никольского под Княжьими в прошении о переселении на Кавказ, 1827", archiveCitation: "РГИА, ф. 379, оп. 1, д. 856, лл. 1–8; дело начато 1 февраля 1827 года, окончено 29 мая 1828 года." },
  links: { publishedTranscription: "https://forum.vgd.ru/post/2167/78335/p2556300.htm" },
  event: { type: "resettlement-request", date: { display: "1827" }, place: { placeId: "nikolskoe-pod-knyazhimi-pervomayskoe", normalized: "село Никольское под Княжьими, Фатежский уезд" } },
  transcription: { status: "published-archival-extract", literal: "Фатежский уезд, Поныровская волость, село Никольское под Княжьими: № 3 Тихон, Григорий, Алексей, Сидор Анпилоговы.", modernInterpretation: "Четыре Анпилогова входят в сводный список 213 семей (554 души мужского пола), просивших из-за малоземелья переселить их на свободные казённые земли Кавказской области." },
  migrationObservations: groups.filter((p) => p.source === CAUCASUS_1827).map((p) => ({ personId: p.id, personName: p.name, from: { placeId: "nikolskoe-pod-knyazhimi-pervomayskoe" }, to: { placeId: "north-caucasus-region" }, basis: "Именной список при прошении о переселении; прибытие не подтверждено.", confidence: "medium" })),
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0582",
  mentions: makeMentions(CAUCASUS_1827, groups.filter((p) => p.source === CAUCASUS_1827)),
  review: { status: "exact-case-known-original-scan-needed", unresolved: ["Получить сканы листов 3–8 РГИА и семейные составы.", "Установить, состоялось ли переселение каждого просителя."] },
});

writeJson(path.join(sourcesDir, `${ORENBURG_1832}.json`), {
  schemaVersion: 1,
  sourceId: ORENBURG_1832,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "resettlement-inspection-petition-register",
  collection: { title: "Анпилоговы из Никольского под Княжьими в прошении об осмотре земель Оренбургской губернии, 1832", archiveCitation: "РГИА, ф. 379, оп. 1, д. 1206, лл. 1–9; дело начато 21 мая 1832 года." },
  links: { publishedTranscription: "https://forum.vgd.ru/post/1860/32239/p2091148.htm" },
  event: { type: "resettlement-request", date: { display: "1832" }, place: { placeId: "nikolskoe-pod-knyazhimi-pervomayskoe", normalized: "село Никольское под Княжьими, Фатежский уезд" } },
  transcription: { status: "published-archival-extract", literal: "Фатежский уезд, Поныровская волость, село Никольское под Княжьими: № 2 Прохор, Тихон, Андрей, Иван, Леон, Иван Анпилоговы.", modernInterpretation: "Шесть Анпилоговых входят в список казённых поселян, желавших отправить поверенных для осмотра свободных участков в Оренбургской губернии; весь свод охватывал 633 души мужского пола." },
  migrationObservations: groups.filter((p) => p.source === ORENBURG_1832).map((p) => ({ personId: p.id, personName: p.name, from: { placeId: "nikolskoe-pod-knyazhimi-pervomayskoe" }, to: { placeId: "orenburg-governorate" }, basis: "Именной список при прошении об осмотре земель; отъезд и прибытие не подтверждены.", confidence: "medium" })),
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0586",
  mentions: makeMentions(ORENBURG_1832, groups.filter((p) => p.source === ORENBURG_1832)),
  review: { status: "exact-case-known-original-scan-needed", unresolved: ["Получить сканы листов 3–9 РГИА и семейные составы.", "Различить двух Иванов и проверить Тихона против списка 1827 года."] },
});

writeJson(path.join(sourcesDir, `${SHCHIGRY_1832}.json`), {
  schemaVersion: 1,
  sourceId: SHCHIGRY_1832,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "resettlement-petition-register",
  collection: { title: "Василий и Григорий Анпилоговы из Больших Щигров в прошении о переселении в Оренбургскую губернию, 1832", archiveCitation: "РГИА, ф. 379, оп. 1, д. 1209, лл. 1–8 об.; дело начато 5 июля 1832 года." },
  links: { publishedTranscription: "https://forum.vgd.ru/post/1860/32239/p2091148.htm" },
  event: { type: "resettlement-request", date: { display: "1832" }, place: { placeId: "bolshie-shchigry-vyazovoe", normalized: "село Большие Щигры, Щигровский уезд" } },
  transcription: { status: "published-archival-extract", literal: "Щигровский уезд, Щигровская волость, село Большие Щигры: № 3 Василий и Григорий Анпилоговы.", modernInterpretation: "Василий и Григорий названы в списке казённых поселян, просивших из-за малоземелья переселить их в Оренбургскую губернию. Разрешительные отношения отправлены 6 июля 1832 года." },
  migrationObservations: [
    { personId: "P0559", personName: "Василий Титович Анпилогов", from: { placeId: "bolshie-shchigry-vyazovoe" }, to: { placeId: "orenburg-governorate" }, basis: "Высоковероятное сопоставление с Василием Титовичем, отмеченным в ревизии как выбывший в Оренбург в 1833 году.", confidence: "high" },
    { personId: "P0592", personName: "Григорий Анпилогов", from: { placeId: "bolshie-shchigry-vyazovoe" }, to: { placeId: "orenburg-governorate" }, basis: "Именной список при прошении; фактический отъезд не подтверждён.", confidence: "medium" },
  ],
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0559",
  mentions: makeMentions(SHCHIGRY_1832, [{ id: "P0559", name: "Василий Анпилогов" }, { id: "P0592", name: "Григорий Анпилогов" }]),
  review: { status: "exact-case-known-original-scan-needed", unresolved: ["Получить сканы листов 3–8 об. РГИА и составы семей.", "Проверить отчество Василия в оригинальном семейном списке и выяснить судьбу Григория."] },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const place = {
  placeId: "nikolskoe-pod-knyazhimi-pervomayskoe",
  name: "Никольское под Княжьими",
  label: "село Никольское под Княжьими (ныне Первомайское), Фатежский уезд",
  kind: "historical-village",
  aliases: ["Никольское под Княжьими", "Никольское под Князьками", "Первомайское"],
  geo: { latitude: 52.292945, longitude: 36.419378, precision: "settlement", confidence: "high", source: "современное село Первомайское; историческое название до 1963 года", sourceUrl: "https://www.komandirovka.ru/cities/pervomajjskoe_kurs._obl./" },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === place.placeId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...place };
else places.places.push(place);
writeJson(placesPath, places);

console.log("Импортированы 11 новых профилей, три именных списка-прошения и точка Никольского под Княжьими; Василий 1832 года объединён с P0559.");
