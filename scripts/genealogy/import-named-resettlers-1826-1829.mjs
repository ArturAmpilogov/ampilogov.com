import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const TIKHORETSK_SOURCE = "RGIA-F379-O1-D731-ANPILOGOV-TIKHORETSKOE-1826";
const OREL_1829_SOURCE = "NARB-ZOBOV-SARMANAEVA-ANPILOGOV-1829";
const KURSK_1828_SOURCE = "NARB-ZOBOV-SARMANAEVA-ANPILOGOV-1828";
const KARMALKA_SCAN_SOURCE = "BASHARCHIVE-KARMALKA-ANPILOGOV-1834";

const people = [
  {
    id: "P0560", slug: "nikita-abramovich-anpilogov", name: "Никита Абрамович Анпилогов",
    forms: ["Анпилогов", "Анпилов"], sources: [TIKHORETSK_SOURCE], families: ["F0111"],
    notes: [
      "В выписке 1826 года назван прежним главой семьи из села Верхний Мамон; умер до переселения, поэтому лично в Кавказскую область не ехал.",
      "Две опубликованные расшифровки расходятся в годе смерти: 1818 и 1819. Расхождение сохранено до проверки оригинала РГИА.",
      "Полная семейная выписка называет возраст 57 лет и сыновей Емельяна, Ивана и Никиту.",
    ],
    places: [{ relation: "residence", placeId: "verkhniy-mamon", normalized: "село Верхний Мамон, Павловский уезд" }],
  },
  {
    id: "P0561", slug: "ivan-nikitich-anpilogov", name: "Иван Никитич Анпилогов",
    forms: ["Анпилов"], sources: [TIKHORETSK_SOURCE], families: ["F0111"], parents: ["P0560"],
    notes: ["Сын Никиты Абрамовича; 28 лет в полной выписке семьи переселенцев 1826 года."],
    places: [{ relation: "migration-origin", placeId: "verkhniy-mamon" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }],
  },
  {
    id: "P0562", slug: "nikita-nikitich-anpilogov", name: "Никита Никитич Анпилогов",
    forms: ["Анпилов"], sources: [TIKHORETSK_SOURCE], families: ["F0111"], parents: ["P0560"],
    notes: ["Младший сын Никиты Абрамовича; 7 лет в полной выписке семьи переселенцев 1826 года."],
    places: [{ relation: "migration-origin", placeId: "verkhniy-mamon" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }],
  },
  {
    id: "P0563", slug: "sergey-emelyanovich-anpilogov", name: "Сергей Емельянович Анпилогов",
    forms: ["Анпилов"], sources: [TIKHORETSK_SOURCE], families: ["F0112"], parents: ["P0490"],
    notes: ["Сын Емельяна Никитича; 15 лет в семейной выписке, умер в 1829 году."],
    places: [{ relation: "migration-origin", placeId: "verkhniy-mamon" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }],
  },
  {
    id: "P0564", slug: "danila-emelyanovich-anpilogov", name: "Данила Емельянович Анпилогов",
    forms: ["Анпилов"], sources: [TIKHORETSK_SOURCE], families: ["F0112"], parents: ["P0490"],
    notes: ["Сын Емельяна Никитича; 12 лет в семейной выписке, умер в 1829 году."],
    places: [{ relation: "migration-origin", placeId: "verkhniy-mamon" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }],
  },
  {
    id: "P0565", slug: "fedosey-ustinovich-anpilogov", name: "Феодосий Устинович Анпилогов",
    forms: ["Федосей Устинов сын Анпилогов", "Феодосий Устинов Анпилогов"], sources: [TIKHORETSK_SOURCE], families: ["F0113"],
    notes: [
      "Прежний глава буйловской семьи; лично не переселялся, поскольку умер до отправления семьи.",
      "Опубликованные выписки расходятся в годе смерти: 1823 и 1824; в полной выписке указан возраст 60 лет.",
    ],
    places: [{ relation: "residence", placeId: "russkaya-buylovka", normalized: "село Буйлово, Павловский уезд" }],
  },
  {
    id: "P0566", slug: "leontiy-fedoseevich-anpilogov", name: "Леонтий Феодосиевич Анпилогов",
    forms: ["Леонтий", "Леон"], sources: [TIKHORETSK_SOURCE], families: ["F0113"], parents: ["P0565"],
    notes: ["Сын Феодосия Устиновича; 19 лет в полной выписке семьи, переселявшейся в Кавказскую область."],
    places: [{ relation: "migration-origin", placeId: "russkaya-buylovka" }, { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya" }],
  },
  {
    id: "P0567", slug: "fedosey-ivanovich-anpilogov", name: "Федосей Иванович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0114"],
    notes: ["Прежний глава орловской семьи; умер в 1828 году, до прибытия семьи в Зобовскую волость в 1829 году."],
    places: [{ relation: "residence", placeId: "kromy-uezd" }],
  },
  {
    id: "P0568", slug: "elizar-fedoseevich-anpilogov", name: "Елизар Федосеевич Анпилогов",
    forms: ["Елизар Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0114"], parents: ["P0567"],
    notes: ["47 лет в регистре; вместе с Николаем Долговым назван сопровождавшим/представителем орловских однодворцев волны 1829 года."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0569", slug: "petr-fedoseevich-anpilogov", name: "Пётр Федосеевич Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0114"], parents: ["P0567"],
    notes: ["40 лет в регистре орловских однодворцев, прибывших в 1829 году."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0570", slug: "nikita-fedoseevich-anpilogov", name: "Никита Федосеевич Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0114"], parents: ["P0567"],
    notes: ["37 лет в регистре орловских однодворцев, прибывших в 1829 году."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0571", slug: "polikarp-fedorovich-anpilogov", name: "Поликарп Фёдорович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0115"],
    notes: ["50 лет в регистре орловских однодворцев, прибывших в 1829 году; назван с сыном Артемием."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0572", slug: "artemy-polikarpovich-anpilogov", name: "Артемий Поликарпович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0115"], parents: ["P0571"],
    notes: ["25 лет в регистре; сын Поликарпа Фёдоровича."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0573", slug: "ivan-danilovich-anpilogov", name: "Иван Данилович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE],
    notes: ["35 лет в регистре орловских однодворцев; назван старшим братом Василия Даниловича."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0574", slug: "vasiliy-danilovich-anpilogov", name: "Василий Данилович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE],
    notes: ["20 лет в регистре орловских однодворцев; брат Ивана Даниловича."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0575", slug: "sidor-dmitrievich-anpilogov", name: "Сидор Дмитриевич Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0116"],
    notes: ["42 года в регистре орловских однодворцев; назван с сыновьями Иваном и Николаем."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0576", slug: "ivan-sidorovich-anpilogov", name: "Иван Сидорович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0116"], parents: ["P0575"],
    notes: ["19 лет в регистре; сын Сидора Дмитриевича."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0577", slug: "nikolay-sidorovich-anpilogov", name: "Николай Сидорович Анпилогов",
    forms: ["Анпилогов"], sources: [OREL_1829_SOURCE], families: ["F0116"], parents: ["P0575"],
    notes: ["14 лет в регистре; сын Сидора Дмитриевича."],
    places: [{ relation: "migration-origin", placeId: "kromy-uezd" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0578", slug: "ivan-sergeevich-anpilogov", name: "Иван Сергеевич Анпилогов",
    forms: ["Анпилогов"], sources: [KURSK_1828_SOURCE], families: ["F0117"],
    notes: ["70 лет в регистре курских переселенцев волны 1828 года; назван с тремя сыновьями."],
    places: [{ relation: "migration-origin", placeId: "kursk-governorate" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0579", slug: "larion-ivanovich-anpilogov", name: "Ларион Иванович Анпилогов",
    forms: ["Ларион Анпилогов"], sources: [KURSK_1828_SOURCE], families: ["F0117"], parents: ["P0578"],
    notes: ["36 лет в регистре; назван поверенным, с которым прибыли курские переселенцы 1828 года."],
    places: [{ relation: "migration-origin", placeId: "kursk-governorate" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0580", slug: "nikifor-ivanovich-anpilogov-zobov", name: "Никифор Иванович Анпилогов",
    forms: ["Анпилогов"], sources: [KURSK_1828_SOURCE], families: ["F0117"], parents: ["P0578"],
    notes: ["33 года в регистре курских переселенцев волны 1828 года; сын Ивана Сергеевича."],
    places: [{ relation: "migration-origin", placeId: "kursk-governorate" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
  {
    id: "P0581", slug: "boris-ivanovich-anpilogov-zobov", name: "Борис Иванович Анпилогов",
    forms: ["Анпилогов"], sources: [KURSK_1828_SOURCE], families: ["F0117"], parents: ["P0578"],
    notes: ["30 лет в регистре курских переселенцев волны 1828 года; сын Ивана Сергеевича."],
    places: [{ relation: "migration-origin", placeId: "kursk-governorate" }, { relation: "migration-destination", placeId: "karmalka-sarmanayeva" }],
  },
];

for (const person of people) {
  writeJson(path.join(peopleDir, `${person.id}-${person.slug}.json`), {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: "male",
    surname: { normalized: "Анпилогов", formsAsWritten: person.forms },
    sourceIds: person.sources,
    ...(person.families ? { familyIds: person.families } : {}),
    ...(person.parents ? { parents: person.parents } : {}),
    status: "documented-from-published-archival-transcription",
    notes: person.notes,
    places: person.places,
  });
}

const emelyanPath = fs.readdirSync(peopleDir).find((name) => name.startsWith("P0490-"));
const emelyan = JSON.parse(fs.readFileSync(path.join(peopleDir, emelyanPath), "utf8"));
emelyan.sourceIds = [...new Set([...(emelyan.sourceIds || []), TIKHORETSK_SOURCE])];
emelyan.familyIds = [...new Set([...(emelyan.familyIds || []), "F0111", "F0112"])];
emelyan.parents = [...new Set([...(emelyan.parents || []), "P0560"])];
emelyan.places = [
  { relation: "migration-origin", placeId: "verkhniy-mamon", normalized: "село Верхний Мамон, Павловский уезд" },
  { relation: "migration-destination", placeId: "tikhoretskaya-fastovetskaya", normalized: "селение Тихорецкое, Кавказская область" },
];
emelyan.notes = [
  ...(emelyan.notes || []),
  "Отождествлён с Емельяном, 32-летним сыном Никиты Абрамовича Анпилова из переселенческой выписки 1826 года: редкое полное имя, отчество и последующее проживание в Тихорецком совпадают.",
  "В семейной выписке названы его сыновья Сергей, 15 лет, и Данила, 12 лет; оба умерли в 1829 году.",
];
writeJson(path.join(peopleDir, emelyanPath), emelyan);

const families = [
  { id: "F0111", slug: "nikita-abramovich-anpilogov-children", label: "Никита Абрамович Анпилогов и дети", spouses: ["P0560"], children: ["P0490", "P0561", "P0562"], sources: [TIKHORETSK_SOURCE], notes: ["Мать детей в опубликованной выписке не названа."] },
  { id: "F0112", slug: "emelyan-nikitich-anpilogov-children", label: "Емельян Никитич Анпилогов и дети", spouses: ["P0490"], children: ["P0563", "P0564"], sources: [TIKHORETSK_SOURCE], notes: ["Мать детей в опубликованной выписке не названа; оба сына отмечены умершими в 1829 году."] },
  { id: "F0113", slug: "fedosey-ustinovich-anpilogov-children", label: "Феодосий Устинович Анпилогов и сын Леонтий", spouses: ["P0565"], children: ["P0566"], sources: [TIKHORETSK_SOURCE], notes: ["Жена Феодосия в выписке не названа."] },
  { id: "F0114", slug: "fedosey-ivanovich-anpilogov-children", label: "Федосей Иванович Анпилогов и сыновья", spouses: ["P0567"], children: ["P0568", "P0569", "P0570"], sources: [OREL_1829_SOURCE], notes: ["Федосей умер в 1828 году; его сыновья перечислены в регистре волны 1829 года."] },
  { id: "F0115", slug: "polikarp-fedorovich-anpilogov-children", label: "Поликарп Фёдорович Анпилогов и сын Артемий", spouses: ["P0571"], children: ["P0572"], sources: [OREL_1829_SOURCE], notes: ["Жена Поликарпа в опубликованном регистре не названа."] },
  { id: "F0116", slug: "sidor-dmitrievich-anpilogov-children", label: "Сидор Дмитриевич Анпилогов и сыновья", spouses: ["P0575"], children: ["P0576", "P0577"], sources: [OREL_1829_SOURCE], notes: ["Жена Сидора в опубликованном регистре не названа."] },
  { id: "F0117", slug: "ivan-sergeevich-anpilogov-children", label: "Иван Сергеевич Анпилогов и сыновья", spouses: ["P0578"], children: ["P0579", "P0580", "P0581"], sources: [KURSK_1828_SOURCE], notes: ["Жена Ивана в опубликованном регистре не названа."] },
];
for (const family of families) {
  writeJson(path.join(familiesDir, `${family.id}-${family.slug}.json`), {
    schemaVersion: 1, familyId: family.id, label: family.label,
    spouses: family.spouses, children: family.children, sourceIds: family.sources,
    status: "documented-from-published-archival-transcription", notes: family.notes,
  });
}

writeJson(path.join(sourcesDir, `${TIKHORETSK_SOURCE}.json`), {
  schemaVersion: 1,
  sourceId: TIKHORETSK_SOURCE,
  provider: "РГИА / опубликованная полная выписка из архивного дела",
  recordType: "resettlement-petition-and-revision-extract",
  collection: {
    title: "Именные семьи Анпилоговых, переселявшиеся в Кавказскую область, 1826",
    archiveCitation: "РГИА, ф. 379, оп. 1, д. 731, лл. 2, 23–28, 37–38, 47–57, 65–67; дело начато 12 мая 1826 года, окончено 31 марта 1834 года.",
  },
  links: {
    caseTranscription: "https://forum.vgd.ru/post/539/75510/p2282678.htm",
    fullFamilyTranscription: "https://forum.vgd.ru/post/2858/127402/p5732244.htm",
  },
  event: { type: "resettlement", date: { display: "1826" }, place: { placeId: "tikhoretskaya-fastovetskaya", normalized: "селение Тихорецкое на речке Тихой, Кавказская область" } },
  transcription: {
    status: "published-archival-extract-with-family-composition",
    literal: "Села Верхнего Мамона: Никита Абрамов сын Анпилогов, умер, его сын Емельян. Села Буйлова: Федосей Устинов сын Анпилогов, умер, его сын Леонтий. М.п. указанные переселенцы поселились на речке Тихой, селение Тихорецкое.",
    modernInterpretation: "Дело разрешает переселение однодворцев Павловского уезда в Кавказскую область. Полная выписка раскрывает семьи Никиты Абрамовича и Феодосия Устиновича; итоговая помета связывает группу с селением Тихорецким.",
  },
  migrationObservations: [
    { personId: "P0490", personName: "Емельян Никитич Анпилогов", from: { placeId: "verkhniy-mamon" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Сын умершего главы семьи в именной выписке переселенцев; итоговая помета называет Тихорецкое.", confidence: "high" },
    { personId: "P0566", personName: "Леонтий Феодосиевич Анпилогов", from: { placeId: "russkaya-buylovka" }, to: { placeId: "tikhoretskaya-fastovetskaya" }, basis: "Сын умершего главы семьи в именной выписке переселенцев; итоговая помета называет Тихорецкое.", confidence: "high" },
  ],
  isRecord: true,
  cardKind: "named-resettler-family-list",
  primaryPersonId: "P0490",
  mentions: [
    ["P0560", "former-household-head", "Никита Абрамов сын Анпилогов"], ["P0490", "resettler-son", "Емельян Никитин Анпилогов"],
    ["P0561", "resettler-son", "Иван Никитин Анпилов"], ["P0562", "resettler-son", "Никита Никитин Анпилов"],
    ["P0563", "resettler-grandson", "Сергей Емельянов Анпилов"], ["P0564", "resettler-grandson", "Данила Емельянов Анпилов"],
    ["P0565", "former-household-head", "Федосей Устинов сын Анпилогов"], ["P0566", "resettler-son", "Леонтий Федосеев Анпилогов"],
  ].map(([personId, role, displayName], index) => ({ mentionId: `${TIKHORETSK_SOURCE}-M${index + 1}`, role, personId, displayName, modernName: people.find((p) => p.id === personId)?.name || "Емельян Никитич Анпилогов" })),
  review: { status: "exact-case-and-folios-known-original-scan-needed", unresolved: ["Получить цифровые копии листов РГИА и сверить годы смерти 1818/1819 и 1823/1824.", "Снять полный состав женской половины семей, если он присутствует в деле."] },
});

writeJson(path.join(sourcesDir, `${OREL_1829_SOURCE}.json`), {
  schemaVersion: 1,
  sourceId: OREL_1829_SOURCE,
  provider: "Национальный архив Республики Башкортостан / опубликованная расшифровка регистра",
  recordType: "resettler-register",
  collection: {
    title: "Орловские однодворцы Анпилоговы на даче деревни Сарманаевой, волна 1829 года",
    archiveCitation: "Архивный регистр переселенцев Зобовской волости; шифр дела в открытой публикации не указан.",
  },
  links: {
    registerTranscription: "https://forum.vgd.ru/post/1860/32239/p3545711.htm",
    earlierRegisterDiscussion: "https://forum.vgd.ru/post/15/32239/p1303701.htm",
    relatedOriginalScan1834: "https://basharchive.ru/census/reviz/42298/#photo-19",
  },
  event: { type: "resettlement", date: { display: "1829" }, place: { placeId: "karmalka-sarmanayeva", normalized: "Зобовская волость, дача деревни Сарманаевой / Кармалка, Оренбургский уезд" } },
  transcription: {
    status: "published-register-transcription",
    literal: "Регистр о переселенцах, проживающих в Зобовской волости на даче деревни Сарманаевой, прибывших в 1829 году из Орловской губернии разных сёл и деревень, однодворцы. № 2 Федосей Иванов Анпилогов — помер в 1828 г.; сыновья Елизар 47, Пётр 40, Никита 37. № 3 Поликарп Фёдоров Анпилогов 50; сын Артемий 25. № 4 Иван Данилов Анпилогов 35; брат Василий 20. № 25 Сидор Дмитриев Анпилогов 42; сыновья Иван 19 и Николай 14.",
    modernInterpretation: "Четыре анпилоговских двора входят в волну орловских однодворцев 1829 года. Более ранняя публикация уточняет Кромской уезд, Колчевскую волость и называет Елизара Анпилогова одним из сопровождавших группы.",
  },
  migrationObservations: ["P0568", "P0569", "P0570", "P0571", "P0572", "P0573", "P0574", "P0575", "P0576", "P0577"].map((personId) => ({ personId, personName: people.find((p) => p.id === personId).name, from: { placeId: "kromy-uezd" }, to: { placeId: "karmalka-sarmanayeva" }, basis: "Именной регистр орловских однодворцев, прибывших в 1829 году.", confidence: "high" })),
  isRecord: true,
  cardKind: "named-resettler-register",
  primaryPersonId: "P0568",
  mentions: ["P0567", "P0568", "P0569", "P0570", "P0571", "P0572", "P0573", "P0574", "P0575", "P0576", "P0577"].map((personId, index) => ({ mentionId: `${OREL_1829_SOURCE}-M${index + 1}`, role: personId === "P0567" ? "deceased-former-head" : personId === "P0568" ? "resettler-and-group-representative" : "resettler", personId, displayName: people.find((p) => p.id === personId).name, modernName: people.find((p) => p.id === personId).name })),
  review: { status: "register-transcribed-original-and-case-number-needed", unresolved: ["Получить оригинал регистра и построчно снять прежнее место каждого из четырёх дворов.", "Проверить буквальную должность Елизара Анпилогова в заголовке регистра."] },
});

writeJson(path.join(sourcesDir, `${KURSK_1828_SOURCE}.json`), {
  schemaVersion: 1,
  sourceId: KURSK_1828_SOURCE,
  provider: "Национальный архив Республики Башкортостан / опубликованная расшифровка регистра",
  recordType: "resettler-register",
  collection: {
    title: "Курские Анпилоговы на даче деревни Сарманаевой, волна 1828 года",
    archiveCitation: "Архивный регистр переселенцев Зобовской волости; шифр дела в открытой публикации не указан.",
  },
  links: {
    registerTranscription: "https://forum.vgd.ru/post/1860/32239/p3545721.htm",
    earlierRegisterDiscussion: "https://forum.vgd.ru/post/15/32239/p1303701.htm",
  },
  event: { type: "resettlement", date: { display: "1828" }, place: { placeId: "karmalka-sarmanayeva", normalized: "Зобовская волость, дача деревни Сарманаевой / Кармалка, Оренбургский уезд" } },
  transcription: {
    status: "published-register-transcription",
    literal: "Регистр о переселенцах из Курской губернии, проживающих Оренбургского уезда в Зобовской волости, поселившихся на даче деревни Сарманаевой в 1828 году, прибывших с поверенным Ларионом Анпилоговым. № 14 Иван Сергеев Анпилогов 70; сыновья Ларион 36, Никифор 33, Борис 30.",
    modernInterpretation: "Первая из двух соседних волн привела курскую семью Ивана Сергеевича в Зобовскую волость; его сын Ларион выступал поверенным группы.",
  },
  migrationObservations: ["P0578", "P0579", "P0580", "P0581"].map((personId) => ({ personId, personName: people.find((p) => p.id === personId).name, from: { placeId: "kursk-governorate" }, to: { placeId: "karmalka-sarmanayeva" }, basis: "Именной регистр курских переселенцев 1828 года.", confidence: "high" })),
  isRecord: true,
  cardKind: "named-resettler-register",
  primaryPersonId: "P0579",
  mentions: ["P0578", "P0579", "P0580", "P0581"].map((personId, index) => ({ mentionId: `${KURSK_1828_SOURCE}-M${index + 1}`, role: personId === "P0579" ? "resettler-and-authorized-representative" : "resettler", personId, displayName: people.find((p) => p.id === personId).name, modernName: people.find((p) => p.id === personId).name })),
  review: { status: "register-transcribed-original-and-case-number-needed", unresolved: ["Получить оригинал регистра и снять точное прежнее селение семьи Ивана Сергеевича."] },
});

writeJson(path.join(sourcesDir, `${KARMALKA_SCAN_SOURCE}.json`), {
  schemaVersion: 1,
  sourceId: KARMALKA_SCAN_SOURCE,
  provider: "Башархив / цифровая копия ревизской сказки",
  recordType: "revision-list-scan-lead",
  collection: { title: "Анпилоговы среди орловских переселенцев деревни Кармалки, 1834", archiveCitation: "Ревизская сказка деревни Кармалки Оренбургской округи, 1834; карточка Basharchive 42298, ориентир photo-19." },
  links: { originalScan: "https://basharchive.ru/census/reviz/42298/#photo-19", discoveryTranscription: "https://forum.vgd.ru/1141/hralich60/" },
  event: { type: "revision", date: { display: "1834" }, place: { placeId: "karmalka-sarmanayeva", normalized: "деревня Кармалка, Оренбургская округа" } },
  transcription: { status: "public-scan-located-not-yet-read", literal: "В ревизских сказках д. Кармалка Оренбургской округи за 1834 имеются сведения о переселенцах из Орловской губернии, в т.ч. Анпилоговых.", modernInterpretation: "Открытая ссылка ведёт на цифровые изображения ревизии 1834 года. Сервер архива не ответил во время проверки, поэтому персональные строки пока не переписаны и не приписаны конкретным людям." },
  isRecord: true,
  cardKind: "original-scan-lead",
  mentions: [{ mentionId: `${KARMALKA_SCAN_SOURCE}-M1`, role: "unresolved-resettler-households", personId: null, displayName: "Анпилоговы — переселенцы из Орловской губернии", modernName: "неустановленные семьи Анпилоговых" }],
  review: { status: "public-original-located-server-unavailable", unresolved: ["Открыть photo-19 и соседние кадры после восстановления доступности Basharchive.", "Сверить семьи ревизии 1834 года с регистром волны 1829 года."] },
});

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const newPlaces = [
  { placeId: "verkhniy-mamon", name: "Верхний Мамон", label: "село Верхний Мамон, Павловский уезд", kind: "historical-village", aliases: ["Верхний Мамон"], geo: { latitude: 50.16777778, longitude: 40.39666667, precision: "settlement", confidence: "high", source: "Wikidata / современное село Верхний Мамон", sourceUrl: "https://www.wikidata.org/wiki/Q4108700" } },
  { placeId: "russkaya-buylovka", name: "Буйлово", label: "село Буйлово (ныне Русская Буйловка), Павловский уезд", kind: "historical-village", aliases: ["Буйлово", "Буйловка", "Русская Буйловка"], geo: { latitude: 50.3681, longitude: 40.0733, precision: "settlement", confidence: "high", source: "современное село Русская Буйловка", sourceUrl: "https://www.komandirovka.ru/cities/russkaya_bujjlovka_vor._obl./" } },
  { placeId: "karmalka-sarmanayeva", name: "Кармалка", label: "Кармалка / дача деревни Сарманаевой, Зобовская волость", kind: "historical-settlement", aliases: ["Кармалка", "Кармалки", "дача деревни Сарманаевой", "Сарманаева"], geo: { latitude: 52.966336, longitude: 54.693522, precision: "historical-area", confidence: "medium", source: "современное село Кармалка, Шарлыкский район", sourceUrl: "https://ruskarty.ru/karmalka-sharlykskiy-rayon-orenburgskaya-oblast", note: "Рабочее отождествление по Зобовской волости и позднейшим кармалинским метрическим записям; точные границы дачи Сарманаевой требуют исторической карты." } },
];
for (const place of newPlaces) {
  const index = places.places.findIndex(({ placeId }) => placeId === place.placeId);
  if (index >= 0) places.places[index] = { ...places.places[index], ...place };
  else places.places.push(place);
}
writeJson(placesPath, places);

console.log("Импортированы 22 новых профиля, 7 семей, три именных переселенческих регистра и карточка публичного скана Кармалки.");
