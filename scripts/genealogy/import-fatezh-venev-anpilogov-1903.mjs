import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const personId = "P6022";
const sourceId = "PUB-VGD-FATEZH-VENEV-KHOKHLY-ANPILOGOV-1903";
const destinationId = "khokhly-venev-1903";

writeJson(path.join(peopleDir, "P6022-anpilogov-khokhly-venev-1903.json"), {
  schemaVersion: 1,
  personId,
  displayName: "Неустановленный домохозяин Анпилогов из деревни Хохлы",
  sex: "unknown",
  surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилогов"] },
  sourceIds: [sourceId],
  status: "documented-surname-in-published-resettlement-account",
  places: [
    { relation: "migration-origin", placeId: "fatezh-uezd" },
    { relation: "migration-destination", placeId: destinationId },
  ],
  notes: [
    "В опубликованном сообщении венёвского краеведа фамилия Анпилогов названа среди переселенцев, образовавших в 1903 году новую деревню Хохлы в Венёвском уезде.",
    "Сообщение говорит о 17 дворах из Фатежского уезда, но не указывает имя главы семьи и архивный шифр; профиль представляет только документированное присутствие фамилии в этой группе.",
    "Переселение относится к 1903 году и предшествует Столыпинской аграрной реформе 1906 года; точное административное основание и условия земельного устройства устанавливаются по тульским архивным делам.",
  ],
});

writeJson(path.join(sourcesDir, `${sourceId}.json`), {
  schemaVersion: 1,
  sourceId,
  provider: "ВГД — сообщение венёвского краеведа maxell",
  recordType: "published-local-resettlement-account",
  collection: {
    title: "17 дворов из Фатежского уезда — новая деревня Хохлы Венёвского уезда, 1903",
    archiveCitation: "Сообщение участника maxell из Венёва от 3 мая 2006 года; приведены год, число дворов, уезды и шесть фамилий переселенцев.",
  },
  links: {
    publishedReport: "https://forum.vgd.ru/post/2167/3133/p147841.htm",
    quotedDiscussion: "https://lingvoforum.net/index.php?topic=14003.25",
    venevArchiveGuide: "https://www.veneva.ru/biblio.html",
    administrativeContext: "https://www.cheloveknauka.com/krestyanskaya-pereselencheskaya-politika-v-rossii-na-rubezhe-xix-xx-vv",
  },
  event: {
    type: "group-resettlement-and-new-settlement-foundation",
    date: { display: "1903" },
    place: { placeId: destinationId, normalized: "деревня Хохлы, Венёвский уезд, Тульская губерния" },
  },
  transcription: {
    status: "published-account-transcribed",
    literal: "В 1903 году в наш Веневский уезд Тульской губернии переселили 17 дворов из Фатежского уезда Курской губернии. Из них образовали новую деревню, которую так и назвали — «Хохлы». Фамилии у переселенцев были: Быканов, Дурнев, Мотасов, Анпилогов, Калугин, Кравченков.",
    modernInterpretation: "Опубликованное свидетельство фиксирует один двор Анпилоговых или несколько дворов этой фамилии в составе группы из 17 фатежских хозяйств, переселённых в Венёвский уезд в 1903 году для образования нового поселения.",
  },
  historicalContext: {
    period: "дореформенное переселение 1903 года",
    text: "Переселение произошло до начала Столыпинской аграрной реформы. До 1904 года высшей губернской инстанцией, разрешавшей или запрещавшей легальное переселение крестьян в Тульской губернии, было Тульское губернское присутствие; его фонд является главным направлением поиска разрешения и посемейного списка этой группы.",
  },
  migrationObservations: [
    {
      personId,
      personName: "Неустановленный домохозяин Анпилогов из деревни Хохлы",
      from: { placeId: "fatezh-uezd" },
      to: { placeId: destinationId },
      basis: "Сообщение венёвского краеведа: фамилия Анпилогов среди 17 дворов, переселённых из Фатежского уезда в 1903 году и образовавших деревню Хохлы.",
      confidence: "low-medium",
    },
  ],
  isRecord: true,
  cardKind: "surname-level-resettlement-lead",
  primaryPersonId: personId,
  mentions: [
    {
      mentionId: `${sourceId}-M1`,
      role: "resettled-householder-surname",
      personId,
      nameAsTranscribed: "Анпилогов",
      displayName: "Неустановленный домохозяин Анпилогов из деревни Хохлы",
      modernName: "Анпилогов",
    },
  ],
  review: {
    status: "published-account-exact-archive-record-needed",
    unresolved: [
      "Установить имя главы семьи и полный состав двора.",
      "Найти подворный список переселенцев Венёвского уезда или дело Тульского губернского присутствия за 1903 год.",
      "Проверить в ГАТО подворный список переселенцев Венёвского района за 1928 год: ф. Р-155, оп. 1, д. 5902; он может назвать позднейшие дворы и точное официальное название поселения.",
      "Локализовать деревню Хохлы и определить её приход для поиска метрических записей после переселения.",
    ],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const destination = {
  placeId: destinationId,
  name: "Хохлы",
  label: "деревня Хохлы, Венёвский уезд, Тульская губерния",
  kind: "historical-settlement",
  aliases: ["Хохлы", "новая деревня Хохлы"],
  geo: {
    latitude: 54.3543,
    longitude: 38.2644,
    precision: "district",
    confidence: "low",
    source: "районная точка в Венёве",
    sourceUrl: "https://www.openstreetmap.org/relation/1746392",
    note: "Точная локализация новой деревни в опубликованном сообщении не приведена; точка обозначает Венёвский уезд через его административный центр.",
  },
};
const destinationIndex = places.places.findIndex(({ placeId }) => placeId === destinationId);
if (destinationIndex >= 0) places.places[destinationIndex] = { ...places.places[destinationIndex], ...destination };
else places.places.push(destination);
writeJson(placesPath, places);

console.log("Импортирована переселенческая группа 1903 года: Фатежский уезд — деревня Хохлы Венёвского уезда.");
