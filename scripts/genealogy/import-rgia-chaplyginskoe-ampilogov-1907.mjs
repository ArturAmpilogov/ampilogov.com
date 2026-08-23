import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const personId = "P5950";
const sourceId = "RGIA-F592-O15-D1829-CHAPLYGINSKOE-AMPILOGOV-1907";
const placeId = "kubanskoe-novokubansk";

writeJson(path.join(peopleDir, `${personId}-unknown-ampilogov-chaplyginskoe-1907.json`), {
  schemaVersion: 1,
  personId,
  displayName: "Неизвестный Ампилогов — участник Чаплыгинского товарищества",
  sex: "unknown",
  surname: {
    normalized: "Ампилогов",
    formsAsWritten: ["Ампилогов"],
  },
  sourceIds: [sourceId],
  status: "documented-from-archival-inventory-transcription",
  places: [
    {
      relation: "land-purchase-participation",
      placeId,
      normalized: "юрта селения Кубанского, Лабинский отдел, Кубанская область",
    },
  ],
  notes: [
    "Фамилия Ампилогов включена в список заёмщиков Чаплыгинского товарищества 37 домохозяев, приобретавшего землю в юрте селения Кубанского в 1907 году.",
    "Открытая архивная опись перечисляет для всего товарищества выходцев из Гнилуши, Нижнего Мамона, Верхнего Мамона, Икорца и Ставрополя. Посемейный список заёмщиков в деле должен раскрыть имя Ампилогова и его собственное исходное селение.",
  ],
});

writeJson(path.join(sourcesDir, `${sourceId}.json`), {
  schemaVersion: 1,
  sourceId,
  provider: "РГИА / волонтёрская расшифровка архивной описи «Великие описи»",
  recordType: "land-purchase-borrowers-list",
  collection: {
    title: "Чаплыгинское товарищество 37 домохозяев — покупка земли в юрте селения Кубанского, 1907",
    archiveCitation: "РГИА, ф. 592, оп. 15, д. 1829; дело начато 5 февраля 1907 года.",
  },
  repository: {
    name: "Российский государственный исторический архив",
    location: "Санкт-Петербург",
    url: "https://fgurgia.ru/search.do",
  },
  links: {
    publishedInventoryTranscription: "https://inv.velikie.org/doc/did529/",
    officialArchiveSearch: "https://fgurgia.ru/search.do",
  },
  primaryPersonId: personId,
  event: {
    type: "collective-land-purchase",
    date: { display: "5 февраля 1907 года" },
    place: {
      placeId,
      normalized: "юрта селения Кубанского, Лабинский отдел, Кубанская область",
    },
  },
  mentions: [
    {
      mentionId: `${sourceId}-M1`,
      role: "borrower-householder",
      personId,
      nameAsTranscribed: "Ампилогов",
      displayName: "Неизвестный Ампилогов — участник Чаплыгинского товарищества",
    },
  ],
  transcription: {
    status: "published-archival-inventory-transcription",
    literal: "Оп. 15, д. 1829. 05.02.1907. Чаплыгинское 37-ми домохозяев товарищество. Земля в юрте селения Кубанского. Списки заёмщиков: да. В списке фамилий — Ампилогов.",
    modernInterpretation: "Один из 37 домохозяев Чаплыгинского товарищества носил фамилию Ампилогов и участвовал в оформлении через Крестьянский поземельный банк земли в юрте селения Кубанского.",
  },
  indexData: {
    seller: "екатеринодарский купец Фома Акимович Николенко",
    borrowerOriginsForWholeAssociation: [
      "село Гнилуша, Павловский уезд, Воронежская губерния",
      "село Нижний Мамон, Павловский уезд, Воронежская губерния",
      "село Верхний Мамон, Павловский уезд, Воронежская губерния",
      "село Икорец, Бобровский уезд, Воронежская губерния",
      "город Ставрополь",
    ],
  },
  review: {
    status: "exact-case-known-original-scan-needed",
    unresolved: [
      "Получить посемейный список заёмщиков из РГИА, ф. 592, оп. 15, д. 1829 и установить имя Ампилогова.",
      "Сопоставить конкретного Ампилогова с одним из исходных селений товарищества.",
      "Найти план приобретённого участка внутри юрта селения Кубанского.",
    ],
  },
  summary: {
    status: "verified-summary",
    text: "5 февраля 1907 года домохозяин с фамилией Ампилогов состоял в Чаплыгинском товариществе 37 заёмщиков, оформлявшем покупку земли в юрте селения Кубанского.",
  },
  isRecord: true,
  cardKind: "named-collective-land-purchase",
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const place = {
  placeId,
  name: "Кубанское (Новокубанск)",
  label: "селение Кубанское, Лабинский отдел (ныне Новокубанск)",
  kind: "historical-settlement",
  aliases: ["Кубанское", "селение Кубанское", "Новокубанское", "Новокубанск"],
  geo: {
    latitude: 45.1,
    longitude: 41.05,
    precision: "settlement",
    confidence: "high",
    source: "современный Новокубанск; официальный генеральный план указывает координаты города 45°06′ с. ш.; историческая идентификация Кубанского с Новокубанском подтверждается справочником населённых мест",
    sourceUrl: "https://www.ngpnr.ru/",
    note: "Точка обозначает историческое селение, а не границы участка Чаплыгинского товарищества.",
  },
};
const placeIndex = places.places.findIndex((item) => item.placeId === placeId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...place };
else places.places.push(place);
writeJson(placesPath, places);

console.log("Добавлена запись РГИА 592-15-1829 о домохозяине Ампилогове в Чаплыгинском товариществе и точка исторического Кубанского.");
