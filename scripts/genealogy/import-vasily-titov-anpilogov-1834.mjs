import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const personId = "P0559";
const sourceId = "GAKO-F184-O2-D678-VASILY-TITOV-ANPILOGOV-1834";

writeJson(path.join(peopleDir, "P0559-vasiliy-titovich-anpilogov.json"), {
  schemaVersion: 1,
  personId,
  displayName: "Василий Титович Анпилогов",
  sex: "male",
  surname: {
    normalized: "Анпилогов",
    formsAsWritten: ["Анпилогов"],
  },
  sourceIds: [sourceId],
  status: "documented-from-revision-list-transcription-with-exact-frame-reference",
  notes: [
    "В ревизской сказке 1834 года записан старым отчественным способом: «Василий Титов Анпилогов».",
    "Однодворец села Большие Щигры Щигровской волости; против его имени отмечено выбытие в Оренбургскую губернию в 1833 году.",
    "Расшифровка указывает точный архивный шифр и номер кадра 09. Сам кадр в открытом сообщении не приложен и ещё должен быть получен из электронного читального зала ГАКО.",
    "Отчество в ревизской сказке записано старой формой «Титов»; имя его отца — Тит. Для восстановления предыдущего поколения нужны промежуточные ревизии.",
  ],
  places: [
    { relation: "residence", placeId: "bolshie-shchigry-vyazovoe", normalized: "село Большие Щигры, Щигровская волость, Щигровский уезд" },
    { relation: "migration-destination", placeId: "orenburg-governorate", normalized: "Оренбургская губерния" },
  ],
});

writeJson(path.join(sourcesDir, `${sourceId}.json`), {
  schemaVersion: 1,
  sourceId,
  provider: "Государственный архив Курской области / опубликованная расшифровка ревизской сказки",
  recordType: "revision-list-resettlement-annotation",
  collection: {
    title: "Василий Титов Анпилогов — выбытие из Больших Щигр в Оренбургскую губернию, 1833",
    archiveCitation: "ГАКО, ф. 184, оп. 2, д. 678, ревизские сказки Щигровской волости по 8-й ревизии 1834 года, кадр 09; дело 788 листов.",
  },
  links: {
    transcription: "https://forum.vgd.ru/post/1863/3216/p5151896.htm",
    officialInventoryDocument: "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f_184_opis2.docx",
    officialFindingAids: "https://archive.rkursk.ru/gako/dorev_opisi",
    placeReference: "https://nashipredki.com/location/bolshie-schigry-vyazovoe-selo-39435",
  },
  event: {
    type: "resettlement-departure",
    date: { display: "1833" },
    place: { placeId: "orenburg-governorate", normalized: "Оренбургская губерния" },
  },
  transcription: {
    status: "published-line-transcription-exact-frame-cited",
    literal: "09 Василий Титов Анпилогов — в Оренбургскую в 1833.",
    modernInterpretation: "Василий Титович Анпилогов, однодворец села Большие Щигры, выбыл в Оренбургскую губернию в 1833 году. Официальная опись независимо подтверждает, что дело № 678 содержит ревизские сказки однодворцев Щигровской волости за 1834 год.",
  },
  migrationObservations: [
    {
      personId,
      personName: "Василий Титович Анпилогов",
      from: { placeId: "bolshie-shchigry-vyazovoe" },
      to: { placeId: "orenburg-governorate" },
      basis: "Персональная отметка о выбытии в ревизской сказке 1834 года: «в Оренбургскую в 1833».",
      confidence: "high",
    },
  ],
  isRecord: true,
  cardKind: "named-resettler-revision-entry",
  primaryPersonId: personId,
  mentions: [
    {
      mentionId: `${sourceId}-M1`,
      role: "departed-resettler",
      personId,
      displayName: "Василий Титов Анпилогов",
      modernName: "Василий Титович Анпилогов",
    },
  ],
  review: {
    status: "exact-frame-known-original-needed",
    unresolved: [
      "Получить кадр 09 дела ГАКО, ф. 184, оп. 2, д. 678 и проверить возраст, состав двора, номер ревизской семьи и буквальную форму отметки о выбытии.",
      "Найти Василия в ревизии 1816 года и проверить происхождение его от Тита Анпилогова щигровской линии.",
      "Установить конкретное поселение Оренбургской губернии, куда он был причислен.",
    ],
  },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const bolshieShchigry = {
  placeId: "bolshie-shchigry-vyazovoe",
  name: "Большие Щигры",
  label: "село Большие Щигры (Вязовое), Щигровский уезд",
  kind: "historical-village",
  aliases: ["Большие Щигры", "Большие Щигры (Вязовое)", "Вязовое"],
  geo: {
    latitude: 51.9005835,
    longitude: 36.963958,
    precision: "settlement",
    confidence: "high",
    source: "реестр географических наименований / современное село Вязовое",
    sourceUrl: "https://kadastr.ru/upload/export_kadastr_files/%D0%9A%D1%83%D1%80%D1%81%D0%BA%D0%B0%D1%8F%20%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C_201.pdf",
    note: "Историческое село Большие Щигры отождествляется со современным селом Вязовое Щигровского района.",
  },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === bolshieShchigry.placeId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...bolshieShchigry };
else places.places.push(bolshieShchigry);
writeJson(placesPath, places);

console.log("Импортирован Василий Титович Анпилогов: профиль P0559, ревизская запись и маршрут 1833 года.");
