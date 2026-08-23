import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const KHERSON_1811 = "RGIA-F1285-O1-D131-CHEREMOSHNAYA-ANPILOGOV-1811";
const ORENBURG_1833 = "RGIA-F379-O1-D1464-CHEREMOSHNAYA-ANPILOGOV-1833";
const FS_1836 = "FS-3QS7-8937-D3JH";

const people = [
  ["P0593", "yakov-laktionovich-anpilogov", "Яков Лактионович Анпилогов", "male", [KHERSON_1811], ["F0118"], [], ["В документе его возраст 14 лет отнесён к 5-й ревизии; к составлению списка 1811 года он уже назван с женой и пятью детьми.", "Хозяйство имело избу, лес и ветхий амбар; двор с плетнём и воротами оценён в 8 рублей, скот — корова с телёнком и три лошади стоимостью 100 рублей."]],
  ["P0594", "anna-wife-yakov-anpilogov", "Анна, жена Якова Лактионовича Анпилогова", "female", [KHERSON_1811], ["F0118"], [], ["28 лет в переселенческом списке 1811 года; девичья фамилия и отчество не указаны."]],
  ["P0595", "varvara-yakovlevna-anpilogova-1811", "Варвара Яковлевна Анпилогова", "female", [KHERSON_1811], ["F0118"], ["P0593", "P0594"], ["10 лет по новому учёту в семейном списке 1811 года."]],
  ["P0596", "natalya-yakovlevna-anpilogova-1811", "Наталья Яковлевна Анпилогова", "female", [KHERSON_1811], ["F0118"], ["P0593", "P0594"], ["8 лет по новому учёту в семейном списке 1811 года."]],
  ["P0597", "maksim-yakovlevich-anpilogov-1811", "Максим Яковлевич Анпилогов", "male", [KHERSON_1811], ["F0118"], ["P0593", "P0594"], ["6 лет по новому учёту в семейном списке 1811 года."]],
  ["P0598", "avksentiy-yakovlevich-anpilogov", "Авксентий Яковлевич Анпилогов", "male", [KHERSON_1811, FS_1836], ["F0118", "F0121"], ["P0593", "P0594"], ["5 лет по новому учёту в семейном списке переселенцев 1811 года.", "С высокой вероятностью отождествлён с андреевским поселянином Авксентием Яковлевичем Ампилоговым, у которого в 1836 году родилась дочь Татьяна: совпадают редкое имя, отчество, фамилия, подходящий возраст и Херсонская губерния. Прямого указания, что участок № 130 стал Андреевкой, пока не найдено."]],
  ["P0599", "agafya-yakovlevna-anpilogova-1811", "Агафья Яковлевна Анпилогова", "female", [KHERSON_1811], ["F0118"], ["P0593", "P0594"], ["3 года по новому учёту в семейном списке 1811 года."]],
  ["P0600", "stefan-anikeevich-anpilogov", "Стефан Аникеевич Анпилогов", "male", [KHERSON_1811], ["F0119"], [], ["36 лет по 5-й ревизии; в списке 1811 года назван с женой, детьми, невесткой и внуком.", "Хозяйство имело избу, лес, ветхую клеть стоимостью 10 рублей, огороженный двор, корову и три лошади стоимостью 75 рублей."]],
  ["P0601", "lukerya-vasilievna-wife-stefan-anpilogov", "Лукерья Васильевна, жена Стефана Анпилогова", "female", [KHERSON_1811], ["F0119"], [], ["30 лет по 5-й ревизии; девичья фамилия не названа."]],
  ["P0602", "andrey-stefanovich-anpilogov", "Андрей Стефанович Анпилогов", "male", [KHERSON_1811], ["F0119", "F0120"], ["P0600", "P0601"], ["7 лет по 5-й ревизии; к списку 1811 года уже назван с женой Евдокией Ивановной и сыном Яковом."]],
  ["P0603", "varvara-stefanovna-anpilogova-1811", "Варвара Стефановна Анпилогова", "female", [KHERSON_1811], ["F0119"], ["P0600", "P0601"], ["12 лет по новому учёту в списке 1811 года."]],
  ["P0604", "evdokia-ivanovna-wife-andrey-anpilogov", "Евдокия Ивановна, жена Андрея Анпилогова", "female", [KHERSON_1811], ["F0120"], [], ["20 лет в списке 1811 года; девичья фамилия не указана."]],
  ["P0605", "yakov-andreevich-anpilogov-1811", "Яков Андреевич Анпилогов", "male", [KHERSON_1811], ["F0120"], ["P0602", "P0604"], ["3 года по новому учёту; внук Стефана Аникеевича в списке 1811 года."]],
  ["P0606", "irina-semyonovna-wife-avksentiy-anpilogov", "Ирина Семёновна Ампилогова", "female", [FS_1836], ["F0121"], [], ["Законная жена андреевского поселянина Авксентия Яковлевича Ампилогова в метрической записи 1836 года; девичья фамилия не установлена."]],
  ["P0607", "tatyana-avksentievna-ampilogova-1836", "Татьяна Авксентьевна Ампилогова", "female", [FS_1836], ["F0121"], ["P0598", "P0606"], ["Родилась 11 января 1836 года в Андреевке близ Ново-Курского; запись подтверждена сохранённым сканом метрической книги."]],
  ["P0608", "azar-anpilogov-cheremoshnaya-1833", "Азар Анпилогов", "male", [ORENBURG_1833], [], [], ["Назван среди однодворцев деревни Черемошной, подавших в 1833 году прошение в связи с водворением в Оренбургском уезде. Состав семьи в опубликованном фрагменте не раскрыт."]],
  ["P0609", "prokhor-anpilogov-cheremoshnaya-1833", "Прохор Анпилогов", "male", [ORENBURG_1833], [], [], ["Назван вместе с Азаром среди однодворцев деревни Черемошной, подавших в 1833 году прошение в связи с водворением в Оренбургском уезде. Не объединяется с одноимённым Прохором из Никольского 1832 года из-за другого исходного селения."]],
];

for (const [id, slug, displayName, sex, sourceIds, familyIds, parents, notes] of people) {
  const isFemale = sex === "female";
  const isSpouseOnly = displayName.includes("жена") || displayName.startsWith("Анна,");
  const places = sourceIds.includes(KHERSON_1811)
    ? [{ relation: "migration-origin", placeId: "kromy-uezd", normalized: "деревня Черемошная, Кромской уезд, Орловская губерния" }, { relation: "migration-destination", placeId: "kherson-governorate", normalized: "участок № 130, Херсонская губерния" }]
    : sourceIds.includes(ORENBURG_1833)
      ? [{ relation: "migration-origin", placeId: "kromy-uezd", normalized: "деревня Черемошная, Кромской уезд, Орловская губерния" }, { relation: "migration-destination", placeId: "orenburg-governorate", normalized: "Оренбургский уезд, Оренбургская губерния" }]
      : [{ relation: "residence", placeId: "andriivka-karpivka-kryvyi-rih" }];
  if (id === "P0598") places.push({ relation: "later-documented-residence", placeId: "andriivka-karpivka-kryvyi-rih" });
  writeJson(path.join(peopleDir, `${id}-${slug}.json`), {
    schemaVersion: 1,
    personId: id,
    displayName,
    sex,
    surname: { normalized: isFemale ? "Анпилогова" : "Анпилогов", formsAsWritten: isSpouseOnly ? ["фамилия в источнике не приведена"] : [isFemale ? "Анпилогова" : "Анпилогов", ...(id === "P0598" || id === "P0606" || id === "P0607" ? [isFemale ? "Ампилогова" : "Ампилогов"] : [])] },
    sourceIds,
    ...(familyIds.length ? { familyIds } : {}),
    ...(parents.length ? { parents } : {}),
    status: "documented-from-published-archival-transcription",
    notes,
    places,
  });
}

const familyRows = [
  ["F0118", "yakov-laktionovich-anpilogov-family", "Семья Якова Лактионовича Анпилогова", ["P0593", "P0594"], ["P0595", "P0596", "P0597", "P0598", "P0599"], [KHERSON_1811]],
  ["F0119", "stefan-anikeevich-anpilogov-family", "Семья Стефана Аникеевича Анпилогова", ["P0600", "P0601"], ["P0602", "P0603"], [KHERSON_1811]],
  ["F0120", "andrey-stefanovich-anpilogov-family", "Семья Андрея Стефановича Анпилогова", ["P0602", "P0604"], ["P0605"], [KHERSON_1811]],
  ["F0121", "avksentiy-yakovlevich-ampilogov-family", "Семья Авксентия Яковлевича Ампилогова", ["P0598", "P0606"], ["P0607"], [FS_1836]],
];
for (const [id, slug, label, spouses, children, sourceIds] of familyRows) {
  writeJson(path.join(familiesDir, `${id}-${slug}.json`), { schemaVersion: 1, familyId: id, label, spouses, children, sourceIds, status: "documented-from-published-archival-transcription", notes: id === "F0121" ? ["Связь Авксентия 1811 года с андреевским поселянином 1836 года высоковероятна, но требует прямого документа о прибытии на участок № 130."] : [] });
}

const khersonPeople = people.filter((p) => p[4].includes(KHERSON_1811));
writeJson(path.join(sourcesDir, `${KHERSON_1811}.json`), {
  schemaVersion: 1,
  sourceId: KHERSON_1811,
  provider: "РГИА / опубликованная полная расшифровка семейного и имущественного списка",
  recordType: "resettlement-family-and-property-list",
  collection: { title: "Семьи Анпилоговых из Черемошной, желавшие переселиться на участок № 130 Херсонской губернии, 1811", archiveCitation: "РГИА, ф. 1285, оп. 1, д. 131, 9 л.: по представлению Орловского гражданского губернатора о желании 70 душ казённых крестьян Кромской округи переселиться в Херсонскую губернию." },
  links: { fullPublishedTranscription: "https://forum.vgd.ru/3255/101791/" },
  event: { type: "resettlement-request", date: { display: "1811" }, place: { placeId: "kromy-uezd", normalized: "деревня Черемошная, Кромской уезд, Орловская губерния" } },
  transcription: { status: "published-full-family-and-property-transcription", literal: "Из Черемошной в списке однодворцев на участок № 130 названы дворы Якова Лактионова Анпилогова и Стефана Аникеева Анпилогова с жёнами, детьми, невесткой, внуком и перечнями имущества.", modernInterpretation: "Две расширенные семьи Анпилоговых входили в официальное прошение 1811 года о переселении из Орловской губернии в Херсонскую. Список позволяет восстановить четыре поколения и имущественное положение дворов; состоялось ли переселение всей группы, ещё проверяется." },
  migrationObservations: khersonPeople.map(([id, , name]) => ({ personId: id, personName: name, from: { placeId: "kromy-uezd" }, to: { placeId: "kherson-governorate" }, basis: "Именной семейно-имущественный список при прошении о переселении на участок № 130; факт прибытия для каждого лица отдельно не указан.", confidence: id === "P0598" ? "high" : "medium" })),
  isRecord: true,
  cardKind: "named-resettler-family-list",
  primaryPersonId: "P0593",
  mentions: khersonPeople.map(([id, , name], index) => ({ mentionId: `${KHERSON_1811}-M${index + 1}`, role: "prospective-resettler-family-member", personId: id, displayName: name, modernName: name })),
  review: { status: "exact-case-and-full-transcription-original-scan-needed", unresolved: ["Получить девять листов РГИА и сверить каждую строку списка.", "Установить современное или историческое название участка № 130.", "Найти ведомость о фактическом прибытии группы в Херсонскую губернию."] },
});

writeJson(path.join(sourcesDir, `${ORENBURG_1833}.json`), {
  schemaVersion: 1,
  sourceId: ORENBURG_1833,
  provider: "РГИА / опубликованная архивная выписка",
  recordType: "embedded-resettlement-petition-reference",
  collection: { title: "Азар и Прохор Анпилоговы из Черемошной в переписке о водворении в Оренбургском уезде, 1833", archiveCitation: "РГИА, ф. 379, оп. 1, д. 1464, лл. 1–7, 23; дело 1835–1838 годов содержит сообщение Оренбургской казённой палаты от 7 июня 1833 года № 3288." },
  links: { publishedTranscription: "https://forum.vgd.ru/post/2172/78997/p4976159.htm" },
  event: { type: "resettlement-request", date: { display: "1833" }, place: { placeId: "kromy-uezd", normalized: "деревня Черемошная, Кромской уезд, Орловская губерния" } },
  transcription: { status: "published-archival-extract", literal: "Однодворцы деревни Черемошной Азар и Прохор Анпилоговы названы среди 24 душ, подавших прошение в контексте разбора и водворения переселенцев по Оренбургскому уезду.", modernInterpretation: "Источник доказывает официальное прошение Азара и Прохора и оренбургское направление, но опубликованный фрагмент не показывает итогового решения и семейных составов этих двух дворов." },
  migrationObservations: ["P0608", "P0609"].map((personId) => ({ personId, personName: personId === "P0608" ? "Азар Анпилогов" : "Прохор Анпилогов", from: { placeId: "kromy-uezd" }, to: { placeId: "orenburg-governorate" }, basis: "Упоминание в сообщении Оренбургской казённой палаты о прошении однодворцев; итоговое водворение не подтверждено.", confidence: "medium" })),
  isRecord: true,
  cardKind: "named-resettlement-petition",
  primaryPersonId: "P0608",
  mentions: [
    { mentionId: `${ORENBURG_1833}-M1`, role: "petitioner", personId: "P0608", displayName: "Азар Анпилогов", modernName: "Азар Анпилогов" },
    { mentionId: `${ORENBURG_1833}-M2`, role: "petitioner", personId: "P0609", displayName: "Прохор Анпилогов", modernName: "Прохор Анпилогов" },
  ],
  review: { status: "exact-case-known-original-scan-needed", unresolved: ["Получить листы 1–7 и 23 РГИА.", "Выяснить итог прошения и снять мужской семейный список Азара и Прохора."] },
});

const fsPath = path.join(sourcesDir.replace("/publications", "/familysearch"), "3QS7-8937-D3JH.json");
const fsSource = JSON.parse(fs.readFileSync(fsPath, "utf8"));
const fsLinks = [["P0607", "F0121"], ["P0598", "F0121"], ["P0606", "F0121"]];
fsSource.mentions = fsSource.mentions.map((mention, index) => ({ ...mention, personId: fsLinks[index][0], familyId: fsLinks[index][1] }));
fsSource.primaryPersonId = "P0607";
fsSource.familyId = "F0121";
fsSource.review = { ...(fsSource.review || {}), identityResolution: "Татьяна и Ирина получили новые профили; отец с высокой вероятностью сопоставлен с пятилетним Авксентием Яковлевичем из переселенческого списка РГИА 1811 года по редкому полному имени, возрасту и Херсонской губернии." };
writeJson(fsPath, fsSource);

console.log("Импортированы 17 профилей, 4 семьи и две орловские переселенческие волны 1811/1833; скан 1836 года связан с вероятным переселенцем Авксентием.");
