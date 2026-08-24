import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const GASK_1829 = "GASK-F459-O2-D894-ANPILOGOV-TIKHORETSKOE-1829";
const TIKHORETSK_LISTS = "PUB-GAKK-RGVIA-TIKHORETSKAYA-FAMILY-LISTS-1854-1868";
const currentWorkbook = "https://disk.yandex.ru/i/Q7bEbni32JbCEA";
const registerDiscussion = "https://forum.vgd.ru/8716/162807/10.htm?a=stdforum_view&o=";
const officialGaskCatalog = "https://fonds.stavarhiv.ru/index.php?act=opis&fund=459&opis=10000063885&page=30";
const familyDiscussion = "https://kubangenealogy.ucoz.ru/forum/12-854-2";
const familyCorrection = "https://kubangenealogy.ucoz.ru/forum/12-854-3";

const findPersonFile = (id) => {
  const file = fs.readdirSync(peopleDir).find((name) => name.startsWith(`${id}-`));
  if (!file) throw new Error(`Missing person ${id}`);
  return path.join(peopleDir, file);
};

const addSource = (personId, sourceId, note) => {
  const file = findPersonFile(personId);
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds || []), sourceId])];
  if (note) value.notes = [...new Set([...(value.notes || []), note])];
  writeJson(file, value);
};

const addFamilySource = (familyId, sourceId, note) => {
  const fileName = fs.readdirSync(familiesDir).find((name) => name.startsWith(`${familyId}-`));
  if (!fileName) throw new Error(`Missing family ${familyId}`);
  const file = path.join(familiesDir, fileName);
  const value = JSON.parse(fs.readFileSync(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds || []), sourceId])];
  if (note) value.notes = [...new Set([...(value.notes || []), note])];
  writeJson(file, value);
};

writeJson(path.join(sourcesDir, `${GASK_1829}.json`), {
  schemaVersion: 1,
  sourceId: GASK_1829,
  provider: "Государственный архив Ставропольского края / опубликованная постраничная расшифровка",
  recordType: "resettlement-order-and-named-register",
  collection: {
    title: "Об оставлении однодворцев Павловского уезда на реке Тихонькой, 1828–1829",
    archiveCitation: "ГАСК, ф. 459, оп. 2, д. 894, 93 л.; именной регистр — лл. 40–48 об.; предложение Кавказской казённой палате от 31 августа / 3 сентября 1829 года № 2511 — л. 51; семьи Анпилоговых/Анпиловых — лл. 46 и 48.",
  },
  links: { officialCatalog: officialGaskCatalog, registerTranscription: registerDiscussion },
  event: {
    type: "resettlement-order-and-register",
    date: { display: "31 августа — 3 сентября 1829 года" },
    place: { placeId: "tikhoretskaya-fastovetskaya", normalized: "земли при речке Тихонькой, селение Тихорецкое, Ставропольский уезд, Кавказская область" },
  },
  transcription: {
    status: "published-folio-by-folio-transcription",
    literal: "Л. 40: Именной Регистр однодворцев, переселяющихся из Воронежской губернии Павловского уезда сёл Гороховки, Березовки и прочих, в числе 338 душ, в Кавказскую область Ставропольского уезда на земли при речке Тихонькой. Л. 46, село Буйлово: 101. Феодосий Устинов Анпилогов — 60 лет (умер 1824); его сын Леон — 19. 102. Пётр Леонов Анпилогов — 58 лет (умер 1821); его сын Тимофей — 21. Л. 48, село Верхний Мамон: 136. Никита Абрамов Анпилов — 57 лет (умер 1819); его сыновья Емельян — 32, у Емельяна дети Сергей — 15 и Данила — 12 (оба умерли в 1829), Иван — 28, Никита — 7. Л. 51: предписание допустить переселенцев к поселению и оказать при водворении законное пособие.",
    modernInterpretation: "Приказ и именной регистр документируют три семьи Анпилоговых/Анпиловых из Буйлова и Верхнего Мамона. После смерти прежних глав в партии названы Леонтий Феодосиевич, Тимофей Петрович, Емельян, Иван и Никита Никитичи с детьми Емельяна; местом водворения назначены земли при речке Тихонькой, где возникло селение Тихорецкое.",
  },
  indexData: {
    officialCatalogTitle: "По предложению начальника области об оставлении Воронежской губернии Павловского уезда села Гороховки однодворцев 334 душ на реке Тихонькой.",
    officialCatalogDates: "1828–1828",
    folioCount: 93,
    digitalCopies: "Электронные копии документов отсутствуют",
    countDiscrepancy: "Официальный заголовок дела называет 334 души; заголовок именного регистра в опубликованной постраничной расшифровке — 338 душ.",
  },
  migrationObservations: [
    { personId: "P0566", personName: "Леонтий Феодосиевич Анпилогов", from: { placeId: "russkaya-buylovka" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Именной регистр, л. 46, и распоряжение о водворении, л. 51.", confidence: "high" },
    { personId: "P5922", personName: "Тимофей Петрович Анпилогов", from: { placeId: "russkaya-buylovka" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Именной регистр, л. 46, и распоряжение о водворении, л. 51.", confidence: "high" },
    { personId: "P0490", personName: "Емельян Никитич Анпилогов", from: { placeId: "verkhniy-mamon" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Именной регистр, л. 48, и распоряжение о водворении, л. 51.", confidence: "high" },
    { personId: "P0561", personName: "Иван Никитич Анпилогов", from: { placeId: "verkhniy-mamon" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Именной регистр, л. 48, и распоряжение о водворении, л. 51.", confidence: "high" },
    { personId: "P0562", personName: "Никита Никитич Анпилогов", from: { placeId: "verkhniy-mamon" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Именной регистр, л. 48, и распоряжение о водворении, л. 51.", confidence: "high" },
  ],
  isRecord: true,
  cardKind: "named-resettler-register-with-order",
  primaryPersonId: "P0566",
  mentions: [
    { mentionId: `${GASK_1829}-M1`, role: "deceased-former-household-head", personId: "P0565", displayName: "Феодосий Устинов Анпилогов", modernName: "Феодосий Устинович Анпилогов" },
    { mentionId: `${GASK_1829}-M2`, role: "resettler-son", personId: "P0566", displayName: "Леон", modernName: "Леонтий Феодосиевич Анпилогов" },
    { mentionId: `${GASK_1829}-M3`, role: "deceased-former-household-head", personId: "P5921", displayName: "Пётр Леонов Анпилогов", modernName: "Пётр Леонович Анпилогов" },
    { mentionId: `${GASK_1829}-M4`, role: "resettler-son", personId: "P5922", displayName: "Тимофей", modernName: "Тимофей Петрович Анпилогов" },
    { mentionId: `${GASK_1829}-M5`, role: "deceased-former-household-head", personId: "P0560", displayName: "Никита Абрамов Анпилов", modernName: "Никита Абрамович Анпилогов" },
    { mentionId: `${GASK_1829}-M6`, role: "resettler-son", personId: "P0490", displayName: "Емельян", modernName: "Емельян Никитич Анпилогов" },
    { mentionId: `${GASK_1829}-M7`, role: "resettler-grandson", personId: "P0563", displayName: "Сергей", modernName: "Сергей Емельянович Анпилогов" },
    { mentionId: `${GASK_1829}-M8`, role: "resettler-grandson", personId: "P0564", displayName: "Данила", modernName: "Данила Емельянович Анпилогов" },
    { mentionId: `${GASK_1829}-M9`, role: "resettler-son", personId: "P0561", displayName: "Иван", modernName: "Иван Никитич Анпилогов" },
    { mentionId: `${GASK_1829}-M10`, role: "resettler-son", personId: "P0562", displayName: "Никита", modernName: "Никита Никитич Анпилогов" },
  ],
  review: {
    status: "exact-case-folios-and-full-transcription-known-scan-needed",
    unresolved: ["Получить цифровые копии ГАСК, ф. 459, оп. 2, д. 894, лл. 40, 46, 48 и 51 и сверить буквальное чтение возрастов и помет о смерти.", "Установить причину расхождения 334/338 душ между официальным заголовком дела и именным регистром."],
  },
});

addSource("P0565", GASK_1829, "Повторно назван на л. 46 регистра ГАСК, ф. 459, оп. 2, д. 894: 60 лет по VII ревизии, с пометой о смерти в 1824 году.");
addSource("P0566", GASK_1829, "Именной регистр 1829 года называет его Леоном, 19 лет по VII ревизии, в буйловской семье переселенцев на речку Тихонькую.");
addSource("P0560", GASK_1829, "Повторно назван на л. 48 регистра ГАСК, ф. 459, оп. 2, д. 894: 57 лет по VII ревизии, с пометой о смерти в 1819 году.");
addSource("P0490", GASK_1829, "Именной регистр 1829 года называет его 32-летним сыном Никиты Абрамовича в верхнемамонской семье переселенцев на речку Тихонькую.");
addSource("P0561", GASK_1829, "Именной регистр 1829 года называет его 28-летним сыном Никиты Абрамовича в верхнемамонской семье переселенцев.");
addSource("P0562", GASK_1829, "Именной регистр 1829 года называет его семилетним сыном Никиты Абрамовича в верхнемамонской семье переселенцев.");
addSource("P0563", GASK_1829, "Именной регистр 1829 года называет его 15-летним сыном Емельяна Никитича и отмечает смерть в 1829 году.");
addSource("P0564", GASK_1829, "Именной регистр 1829 года называет его 12-летним сыном Емельяна Никитича и отмечает смерть в 1829 году.");
addFamilySource("F0111", GASK_1829, "Полный состав семьи Никиты Абрамовича повторно приведён на л. 48 регистра переселенцев ГАСК, ф. 459, оп. 2, д. 894.");
addFamilySource("F0112", GASK_1829, "Сыновья Емельяна Никитича Сергей и Данила названы на л. 48 регистра переселенцев; оба отмечены умершими в 1829 году.");

const people = [
  { id: "P5921", slug: "petr-leonovich-anpilogov-buylovka", name: "Пётр Леонович Анпилогов", forms: ["Пётр Леонов Анпилогов"], sources: [GASK_1829], familyIds: ["F4707"], birth: { display: "около 1758 года (58 лет по VII ревизии)", estimatedYear: 1758, confidence: "low" }, notes: ["Прежний глава второго анпилоговского двора села Буйлова; регистр отмечает его смерть в 1821 году и называет сына Тимофея."], places: [{ relation: "residence", placeId: "russkaya-buylovka" }] },
  { id: "P5922", slug: "timofey-petrovich-anpilogov-tikhoretsk-1829", name: "Тимофей Петрович Анпилогов", forms: ["Тимофей"], sources: [GASK_1829], familyIds: ["F4707"], parents: ["P5921"], birth: { display: "около 1795 года (21 год по VII ревизии)", estimatedYear: 1795, confidence: "low" }, notes: ["Сын Петра Леоновича; поимённо включён в буйловский двор переселенцев, водворявшихся в 1829 году на речке Тихонькой."], places: [{ relation: "migration-origin", placeId: "russkaya-buylovka" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }] },
  { id: "P5923", slug: "aleksey-leontievich-ampilogov-tikhoretskaya", name: "Алексей Леонтьевич Ампилогов", forms: ["Ампилогов Алексей Леонтьев", "Алексей Леонов Ампилогов"], sources: [TIKHORETSK_LISTS], familyIds: ["F4708"], parents: ["P0566"], birth: { display: "около 1820 года (48 лет в 1868)", estimatedYear: 1820, confidence: "medium" }, notes: ["Назван в исповедной росписи Тихорецкой за 1863 год и первым в семейной группе посемейного списка 1868 года.", "Связь с Леонтием Феодосиевичем P0566 основана на редком отчестве, одном селении и последовательности буйловского переселенческого двора 1829 года."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1863–1868" }] },
  { id: "P5924", slug: "petr-leontievich-ampilogov-tikhoretskaya", name: "Пётр Леонтьевич Ампилогов", forms: ["Ампилогов Пётр Леонтьев", "Пётр Леонов Ампилогов"], sources: [TIKHORETSK_LISTS], familyIds: ["F4708"], parents: ["P0566"], birth: { display: "около 1815 года (53 года в 1868)", estimatedYear: 1815, confidence: "medium" }, notes: ["Назван в исповедной росписи Тихорецкой за 1863 год; в посемейном списке 1868 года — брат Алексея Леонтьевича.", "Связь с Леонтием Феодосиевичем P0566 основана на отчестве, селении и хронологии переселенческого двора."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1863–1868" }] },
  { id: "P5925", slug: "david-leontievich-ampilogov-tikhoretskaya", name: "Давид Леонтьевич Ампилогов", forms: ["Давид Леонов"], sources: [TIKHORETSK_LISTS], familyIds: ["F4708", "F4709"], parents: ["P0566"], birth: { display: "около 1820 года (по семейной расшифровке списка)", estimatedYear: 1820, confidence: "low" }, notes: ["В уточнении к архивной выписке назван братом Алексея и Петра Леонтьевичей и отцом пяти мужчин, перечисленных в посемейном списке 1868 года."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5926", slug: "petr-davidovich-ampilogov-tikhoretskaya", name: "Пётр Давидович Ампилогов", forms: ["Пётр"], sources: [TIKHORETSK_LISTS], familyIds: ["F4709"], parents: ["P5925"], birth: { display: "около 1835 года (33 года в 1868)", estimatedYear: 1835, confidence: "medium" }, notes: ["Посемейный список 1868 года отмечает его нахождение «в И. полку»; буквальное сокращение воинской части требует просмотра листа."], places: [{ relation: "residence-or-registration", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5927", slug: "stefan-davidovich-ampilogov-tikhoretskaya", name: "Стефан Давидович Ампилогов", forms: ["Стефан"], sources: [TIKHORETSK_LISTS], familyIds: ["F4709"], parents: ["P5925"], birth: { display: "около 1836 года (32 года в 1868)", estimatedYear: 1836, confidence: "medium" }, notes: ["В посемейном списке 1868 года отмечен как недееспособный."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5928", slug: "dmitry-davidovich-ampilogov-tikhoretskaya", name: "Дмитрий Давидович Ампилогов", forms: ["Дмитрий"], sources: [TIKHORETSK_LISTS], familyIds: ["F4709"], parents: ["P5925"], birth: { display: "около 1839 года (29 лет в 1868)", estimatedYear: 1839, confidence: "medium" }, notes: ["Посемейный список 1868 года содержит служебную помету «пеший п. в Закавказье»; точную часть предстоит раскрыть по оригиналу."], places: [{ relation: "household-registration", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5929", slug: "demyan-davidovich-ampilogov-tikhoretskaya", name: "Демьян Давидович Ампилогов", forms: ["Демьян"], sources: [TIKHORETSK_LISTS], familyIds: ["F4709"], parents: ["P5925"], birth: { display: "около 1849 года (19 лет в 1868)", estimatedYear: 1849, confidence: "medium" }, notes: ["Назван в семейной группе посемейного списка Тихорецкой за 1868 год."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5930", slug: "aleksandr-davidovich-ampilogov-tikhoretskaya", name: "Александр Давидович Ампилогов", forms: ["Александр"], sources: [TIKHORETSK_LISTS], familyIds: ["F4709"], parents: ["P5925"], birth: { display: "около 1857 года (11 лет в 1868)", estimatedYear: 1857, confidence: "medium" }, notes: ["Назван в семейной группе посемейного списка Тихорецкой за 1868 год."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1868" }] },
  { id: "P5931", slug: "arseniy-timofeyevich-ampilogov-tikhoretskaya-1863", name: "Арсений Тимофеевич Ампилогов", forms: ["Ампилогов Арсений Тимофеев"], sources: [TIKHORETSK_LISTS], notes: ["Поимённо отмечен в исповедной росписи станицы Тихорецкой за 1863 год."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1863" }] },
  { id: "P5932", slug: "stefan-karpovich-ampilogov-tikhoretskaya-1863", name: "Стефан Карпович Ампилогов", forms: ["Ампилогов Стефан Карпов"], sources: [TIKHORETSK_LISTS], notes: ["Поимённо отмечен в исповедной росписи станицы Тихорецкой за 1863 год."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1863" }] },
  { id: "P5933", slug: "filipp-timofeyevich-ampilogov-tikhoretskaya-1863", name: "Филипп Тимофеевич Ампилогов", forms: ["Ампилогов Филипп Тимофеев"], sources: [TIKHORETSK_LISTS], notes: ["Поимённо отмечен в исповедной росписи станицы Тихорецкой за 1863 год."], places: [{ relation: "residence", placeId: "tikhoretskaya-fastovetskaya", date: "1863" }] },
];

for (const person of people) {
  writeJson(path.join(peopleDir, `${person.id}-${person.slug}.json`), {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: "male",
    surname: { normalized: "Ампилогов", formsAsWritten: person.forms },
    sourceIds: person.sources,
    ...(person.familyIds ? { familyIds: person.familyIds } : {}),
    ...(person.parents ? { parents: person.parents } : {}),
    ...(person.birth ? { birth: person.birth } : {}),
    status: "documented-from-published-archival-transcription",
    notes: person.notes,
    places: person.places,
  });
}

writeJson(path.join(familiesDir, "F4707-petr-leonovich-anpilogov-son-timofey.json"), {
  schemaVersion: 1,
  familyId: "F4707",
  label: "Пётр Леонович Анпилогов и сын Тимофей",
  spouses: ["P5921"],
  children: ["P5922"],
  sourceIds: [GASK_1829],
  status: "documented-from-published-archival-transcription",
  notes: ["Жена Петра в регистре 1829 года не названа; Пётр отмечен умершим в 1821 году."],
});

writeJson(path.join(familiesDir, "F4708-leontiy-fedoseevich-anpilogov-sons.json"), {
  schemaVersion: 1,
  familyId: "F4708",
  label: "Леонтий Феодосиевич Анпилогов и сыновья",
  spouses: ["P0566"],
  children: ["P5923", "P5924", "P5925"],
  sourceIds: [GASK_1829, TIKHORETSK_LISTS],
  status: "documented-household-continuity-with-probable-parent-links",
  notes: ["Мать сыновей не названа. Связь поколений основана на последовательности редкого буйловского переселенческого двора, отчестве Леонтьевич и проживании в Тихорецкой."],
});

writeJson(path.join(familiesDir, "F4709-david-leontievich-ampilogov-sons-1868.json"), {
  schemaVersion: 1,
  familyId: "F4709",
  label: "Давид Леонтьевич Ампилогов и сыновья, 1868",
  spouses: ["P5925"],
  children: ["P5926", "P5927", "P5928", "P5929", "P5930"],
  sourceIds: [TIKHORETSK_LISTS],
  status: "documented-from-published-archival-transcription-with-correction",
  notes: ["Первая форумная выписка ошибочно отнесла пятерых молодых мужчин к Петру Леонтьевичу; автор после повторной проверки списка уточнил, что это сыновья Давида Леонтьевича. Жена Давида не названа."],
});

addSource("P0566", TIKHORETSK_LISTS, "Позднейшие списки 1863–1868 годов документируют в Тихорецкой Алексея, Петра и Давида Леонтьевичей; они сохранены как вероятные сыновья Леонтия из переселенческого регистра 1829 года.");
const leontiyFile = findPersonFile("P0566");
const leontiy = JSON.parse(fs.readFileSync(leontiyFile, "utf8"));
leontiy.familyIds = [...new Set([...(leontiy.familyIds || []), "F4708"])];
writeJson(leontiyFile, leontiy);

const seriesFile = path.join(sourcesDir, `${TIKHORETSK_LISTS}.json`);
const series = JSON.parse(fs.readFileSync(seriesFile, "utf8"));
series.provider = "ГАКК, РГВИА и открытая сводная база / архивные описи и опубликованные расшифровки";
series.links = { ...series.links, currentSurnameDatabaseWorkbook: currentWorkbook, familyList1868: familyDiscussion, familyListCorrection: familyCorrection };
series.transcription.status = "named-1863-entries-and-1868-family-extract-published";
series.transcription.literal = "Исповедная роспись Тихорецкой, 1863: Ампилогов Алексей Леонтьев; Арсений Тимофеев; Пётр Леонтьев; Стефан Карпов; Филипп Тимофеев. Посемейный список 1868: Алексей Леонов Ампилогов, 48 лет; его брат Пётр, 53 года; в семье Давида Леонова — Пётр, 33, Стефан, 32, Дмитрий, 29, Демьян, 19, Александр, 11. Служебные пометы: Пётр «в И. полку», Дмитрий «пеший п. в Закавказье», Стефан недееспособный.";
series.transcription.modernInterpretation = "Поимённая роспись 1863 года и семейная выписка 1868 года раскрывают тихорецкую ветвь Ампилоговых через поколение после переселенческого регистра 1829 года. Алексей и Пётр Леонтьевичи названы братьями; уточнение к выписке относит пятерых молодых мужчин к семье их брата Давида Леонтьевича.";
series.primaryPersonId = "P5923";
series.cardKind = "named-confession-and-family-list-series";
series.mentions = [
  ["P5923", "household-member-1863-1868", "Алексей Леонтьевич Ампилогов"],
  ["P5924", "brother-1863-1868", "Пётр Леонтьевич Ампилогов"],
  ["P5925", "brother-and-household-head-1868", "Давид Леонтьевич Ампилогов"],
  ["P5926", "son-in-household-1868", "Пётр Давидович Ампилогов"],
  ["P5927", "son-in-household-1868", "Стефан Давидович Ампилогов"],
  ["P5928", "son-in-household-1868", "Дмитрий Давидович Ампилогов"],
  ["P5929", "son-in-household-1868", "Демьян Давидович Ампилогов"],
  ["P5930", "son-in-household-1868", "Александр Давидович Ампилогов"],
  ["P5931", "confession-list-member-1863", "Арсений Тимофеевич Ампилогов"],
  ["P5932", "confession-list-member-1863", "Стефан Карпович Ампилогов"],
  ["P5933", "confession-list-member-1863", "Филипп Тимофеевич Ампилогов"],
].map(([personId, role, displayName], index) => ({ mentionId: `${TIKHORETSK_LISTS}-M${index + 1}`, role, personId, displayName, modernName: displayName }));
series.review = {
  status: "named-transcriptions-exact-series-known-original-folios-needed",
  unresolved: [
    "Установить, из какого именно экземпляра росписи 1863 года извлечены имена: РГВИА, ф. 14877, оп. 1, д. 4255 или ГАКК, ф. 353, оп. 1, д. 1284.",
    "Получить лист семьи из ГАКК, ф. 353, оп. 1, д. 2249 за 1868 год и буквально раскрыть служебные сокращения Петра и Дмитрия.",
  ],
};
writeJson(seriesFile, series);

const workbookFile = path.join(sourcesDir, "PUB-RGVIA-CAUCASUS-DATABASE-XLSX-20221031.json");
const workbookSource = JSON.parse(fs.readFileSync(workbookFile, "utf8"));
workbookSource.links = { ...workbookSource.links, currentConsolidatedWorkbook20260331: currentWorkbook };
workbookSource.review = workbookSource.review || {};
workbookSource.review.currentWorkbookCheck = "Файл «ВГД Сводная БАЗА фамилиий 20260331.xlsx» скачан и проверен 24 августа 2026 года; строки миграций Герасима, Ивана, Алексея, Парфена и Трофима сохранены, а новые тихорецкие строки 1863 года вынесены в отдельную источниковую карточку серии.";
writeJson(workbookFile, workbookSource);

console.log("Сохранены приказ и регистр ГАСК 1829 года, 13 профилей и три семейные связи Тихорецкой.");
