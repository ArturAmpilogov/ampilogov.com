import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const PETITION_1826 = "RGIA-F379-O1-D742-TETEREVINO-SEMEN-ANPILOGOV-1826";
const PETITION_1832 = "RGIA-F379-O1-D1198-TETEREVINO-IVAN-ANPILOGOV-1832";
const originPlaceId = "teterevino-korochansky-prokhorovsky";
const destinationPlaceId = "north-caucasus-region";

const people = [
  {
    id: "P0610",
    slug: "semen-anpilogov-teterevino-1826",
    name: "Семён Анпилогов",
    sourceId: PETITION_1826,
    year: 1826,
    note: "Назван седьмым в группе жителей села Тетеревина Корочанского уезда в реестре крестьян, просивших разрешения переселиться на свободные казённые земли Кавказской области.",
  },
  {
    id: "P0611",
    slug: "ivan-anpilogov-teterevino-1832",
    name: "Иван Анпилогов",
    sourceId: PETITION_1832,
    year: 1832,
    note: "Назван четвёртым в группе жителей села Тетеревина Шаховской волости Корочанского уезда в реестре желавших отправить поверенных для осмотра земель Кавказской области.",
  },
];

for (const person of people) {
  writeJson(path.join(peopleDir, `${person.id}-${person.slug}.json`), {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: "male",
    surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилогов"] },
    sourceIds: [person.sourceId],
    status: "documented-from-published-archival-transcription",
    notes: [
      person.note,
      "Источник фиксирует прошение и административную подготовку переселения; фактический отъезд и прибытие этим делом пока не доказаны.",
      "Родство с другими Анпилоговыми Тетеревина и тождество участников двух кампаний без отчеств и семейных составов не устанавливаются.",
    ],
    places: [
      { relation: "migration-origin", placeId: originPlaceId },
      { relation: "migration-destination", placeId: destinationPlaceId },
    ],
  });
}

const migrationObservation = (person) => ({
  personId: person.id,
  personName: person.name,
  from: { placeId: originPlaceId },
  to: { placeId: destinationPlaceId },
  basis: "Именной реестр при прошении о переселении/осмотре земель; фактическое прибытие не подтверждено.",
  confidence: "medium",
});

writeJson(path.join(sourcesDir, `${PETITION_1826}.json`), {
  schemaVersion: 1,
  sourceId: PETITION_1826,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "resettlement-petition-register",
  collection: {
    title: "Семён Анпилогов из Тетеревина в прошении о переселении в Кавказскую область, 1826",
    archiveCitation: "РГИА, ф. 379, оп. 1, д. 742, л. 4; дело начато 20 января 1826 года, окончено 30 января 1826 года; отношение Департамента государственных имуществ от 18 января 1826 года № 386.",
  },
  links: { publishedTranscription: "https://forum.vgd.ru/post/539/44464/p3981626.htm" },
  event: {
    type: "resettlement-request",
    date: { display: "1826" },
    place: { placeId: originPlaceId, normalized: "село Тетеревино, Корочанский уезд, Курская губерния" },
  },
  transcription: {
    status: "published-archival-extract",
    literal: "Корочанский уезд, Клименовская волость, село Тетеревино: 1 Андрей, Архип Семеновы; 2 Афанасий Сазонов; 3 Гаврила Головин; 4 Ермил, Ефрем Сапочевы; 5 Яков Абернихин; 6 Терентий Маслов; 7 Семен Анпилогов.",
    modernInterpretation: "Семён Анпилогов входит в общий реестр 207 душ мужского пола из нескольких уездов Курской губернии, просивших разрешения переселиться на свободные казённые земли Кавказской области.",
  },
  migrationObservations: [migrationObservation(people[0])],
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0610",
  mentions: [{ mentionId: `${PETITION_1826}-M1`, role: "prospective-resettler", personId: "P0610", displayName: "Семён Анпилогов", modernName: "Семён Анпилогов" }],
  review: {
    status: "exact-case-known-original-scan-needed",
    unresolved: ["Получить скан листа 4 РГИА и проверить написание волости и фамилии.", "Найти итоговое решение и место фактического водворения Семёна."],
  },
});

writeJson(path.join(sourcesDir, `${PETITION_1832}.json`), {
  schemaVersion: 1,
  sourceId: PETITION_1832,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "resettlement-inspection-petition-register",
  collection: {
    title: "Иван Анпилогов из Тетеревина в прошении об отправке поверенных в Кавказскую область, 1832",
    archiveCitation: "РГИА, ф. 379, оп. 1, д. 1198, лл. 1–12; дело начато 16 января 1832 года; отношение Департамента государственных имуществ от 30 декабря 1831 года № 13180.",
  },
  links: { publishedTranscription: "https://forum.vgd.ru/post/539/44464/p3981630.htm" },
  event: {
    type: "resettlement-request",
    date: { display: "1832" },
    place: { placeId: originPlaceId, normalized: "село Тетеревино, Шаховская волость, Корочанский уезд, Курская губерния" },
  },
  transcription: {
    status: "published-archival-extract",
    literal: "Корочанский уезд, Шаховская волость, село Тетеревино: 1 Архип, Назар, Григорий Селюковы; 2 Игнат Маслов; 3 Афанасий, Леон Сазановы; 4 Иван Анпилогов; 5 Гаврила Головин; 6 Изот Фатеев.",
    modernInterpretation: "Иван Анпилогов входит в реестр 388 семей (1174 души), просивших из-за недостатка земли разрешить отправку поверенных для осмотра свободных казённых земель Кавказской области.",
  },
  migrationObservations: [migrationObservation(people[1])],
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0611",
  mentions: [{ mentionId: `${PETITION_1832}-M1`, role: "prospective-resettler", personId: "P0611", displayName: "Иван Анпилогов", modernName: "Иван Анпилогов" }],
  review: {
    status: "exact-case-known-original-scan-needed",
    unresolved: ["Получить сканы листов 3–12 РГИА и семейный состав Ивана.", "Проверить итог поездки поверенных и возможное водворение тетеревинской партии.", "Сопоставить кампанию 1832 года с прошением 1826 года без преждевременного объединения лиц."],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const place = {
  placeId: originPlaceId,
  name: "Тетеревино",
  label: "село Тетеревино, Корочанский уезд (ныне Прохоровский район)",
  kind: "historical-village",
  aliases: ["Тетеревино", "Тетеревина", "село Тетеревино Шаховской волости"],
  geo: {
    latitude: 50.871667,
    longitude: 36.616111,
    precision: "settlement",
    confidence: "high",
    source: "современное село Тетеревино; историческая принадлежность к Шаховской волости подтверждается краеведческими справками",
    sourceUrl: "https://ru.wikipedia.org/wiki/Тетеревино",
  },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === originPlaceId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...place };
else places.places.push(place);
writeJson(placesPath, places);

console.log("Импортированы Семён и Иван Анпилоговы из двух тетеревинских прошений 1826/1832 годов, два источника и точка Тетеревина.");
