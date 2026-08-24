import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const unique = (items) => [...new Set(items.filter(Boolean))];
const mergeObjects = (current, additions) => {
  const seen = new Set(current.map((item) => JSON.stringify(item)));
  return [...current, ...additions.filter((item) => !seen.has(JSON.stringify(item)))];
};

const findJsonById = (dir, field, id) => {
  for (const name of fs.readdirSync(dir).filter((item) => item.endsWith(".json"))) {
    const filePath = path.join(dir, name);
    const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (value[field] === id) return { filePath, value };
  }
  return null;
};

const upsertPerson = (row) => {
  const existing = findJsonById(peopleDir, "personId", row.personId);
  if (existing) {
    const value = existing.value;
    value.sourceIds = unique([...(value.sourceIds ?? []), ...row.sourceIds]);
    value.familyIds = unique([...(value.familyIds ?? []), ...(row.familyIds ?? [])]);
    value.parents = unique([...(value.parents ?? []), ...(row.parents ?? [])]);
    value.notes = unique([...(value.notes ?? []), ...row.notes]);
    value.places = mergeObjects(value.places ?? [], row.places ?? []);
    if (!value.familyIds.length) delete value.familyIds;
    if (!value.parents.length) delete value.parents;
    if (!value.places.length) delete value.places;
    writeJson(existing.filePath, value);
    return;
  }

  const filePath = path.join(peopleDir, `${row.personId}-${row.slug}.json`);
  writeJson(filePath, {
    schemaVersion: 1,
    personId: row.personId,
    displayName: row.displayName,
    sex: row.sex,
    surname: {
      normalized: row.sex === "female" ? "Анпилогова" : "Анпилогов",
      formsAsWritten: row.formsAsWritten,
    },
    sourceIds: row.sourceIds,
    ...(row.familyIds?.length ? { familyIds: row.familyIds } : {}),
    ...(row.parents?.length ? { parents: row.parents } : {}),
    status: "documented-from-primary-scan",
    notes: row.notes,
    ...(row.places?.length ? { places: row.places } : {}),
  });
};

const upsertFamily = (family) => {
  const existing = findJsonById(familiesDir, "familyId", family.familyId);
  if (existing) {
    const value = existing.value;
    value.spouses = unique([...(value.spouses ?? []), ...family.spouses]);
    value.children = unique([...(value.children ?? []), ...family.children]);
    value.sourceIds = unique([...(value.sourceIds ?? []), ...family.sourceIds]);
    value.notes = unique([...(value.notes ?? []), ...family.notes]);
    writeJson(existing.filePath, value);
    return;
  }
  writeJson(path.join(familiesDir, `${family.familyId}-${family.slug}.json`), {
    schemaVersion: 1,
    familyId: family.familyId,
    label: family.label,
    spouses: family.spouses,
    children: family.children,
    sourceIds: family.sourceIds,
    status: "documented-from-primary-scan",
    notes: family.notes,
  });
};

const mention = (sourceId, suffix, role, personId, nameAsTranscribed, displayName, sex) => ({
  mentionId: `${sourceId}-${suffix}`,
  role,
  personId,
  ...(sex ? { sex } : {}),
  nameAsTranscribed,
  displayName,
  modernName: displayName,
});

const sourceRows = [
  {
    sourceId: "YA-GAAO-687-2-1365-38-IVAN-ANPILOV-1835",
    title: "Ревизская сказка села Сасыкольского Енотаевского уезда за 1835 год",
    citation: "ГААО, ф. 687, оп. 2, д. 1365, сканы 37–38",
    url: "https://yandex.ru/archive/catalog/9c09ee3a-7e62-445a-8296-339e69c4e161/38",
    date: "30 апреля 1835 года",
    place: { asWritten: "села Сасыкольскаго", normalized: "село Сасыколи, Енотаевский уезд", placeId: "sasykoli-enotaevsky" },
    primaryPersonId: "P2004",
    mentions: [
      ["M1", "household-head", "P2004", "Иванъ Никифоровъ Анпиловъ", "Иван Никифорович Анпилогов", "male"],
      ["M2", "son", "P2005", "первый сынъ Михаилъ", "Михаил Иванович Анпилогов", "male"],
      ["M3", "son", "P2006", "второй сынъ Илья", "Илья Иванович Анпилогов", "male"],
      ["M4", "grandson", "P6040", "Ильи Иванова сынъ Трофимъ", "Трофим Ильич Анпилогов", "male"],
      ["M5", "son", "P2007", "третій сынъ Тимоѳей", "Тимофей Иванович Анпилогов", "male"],
      ["M6", "grandson", "P6041", "Тимоѳея Иванова сынъ Егоръ", "Егор Тимофеевич Анпилогов", "male"],
    ],
    literal: "Иванъ Никифоровъ Анпиловъ. Ивана Никифорова первый сынъ Михаилъ; второй сынъ Илья; Ильи Иванова сынъ Трофимъ; третій сынъ Тимоѳей; Тимоѳея Иванова сынъ Егоръ.",
    interpretation: "Ревизия 1835 года фиксирует в Сасыколях Ивана Никифоровича Анпилова, ранее причисленного из села Бабки, трёх его сыновей и двух внуков: Трофима Ильича и Егора Тимофеевича.",
    migrations: [{
      personId: "P2004",
      from: { placeId: "babka-pavlovsk-voronezh" },
      to: { placeId: "sasykoli-enotaevsky" },
      date: { display: "причисление в 1828 году; семья записана в Сасыколях в 1835 году" },
      basis: "Скан 476 дела ГААО ф. 454, оп. 1, д. 125 называет исходное село Бабки и причисление в 1828 году; эта ревизия повторяет Ивана Никифоровича и всех трёх сыновей уже в Сасыколях.",
      confidence: "high",
    }],
  },
  {
    sourceId: "YA-GAAO-687-2-1361-63-IVAN-ANPILOV-1835",
    title: "Ревизская сказка государственных крестьян Енотаевского уезда за 1835 год",
    citation: "ГААО, ф. 687, оп. 2, д. 1361, скан 63",
    url: "https://yandex.ru/archive/catalog/ee853196-2df6-499c-af6c-f2ef07c316cb/63",
    date: "1835 год",
    place: { normalized: "Енотаевский уезд, Астраханская губерния", placeId: "enotaevsky-uezd" },
    primaryPersonId: "P2004",
    mentions: [
      ["M1", "household-head", "P2004", "Иванъ Никифоровъ Анпиловъ", "Иван Никифорович Анпилогов", "male"],
      ["M2", "son", "P2005", "Ивана Никифорова первой сынъ Михайла", "Михаил Иванович Анпилогов", "male"],
      ["M3", "daughter-in-law", "P6042", "Михайлы Иванова жена Анна", "Анна Анпилогова", "female"],
      ["M4", "granddaughter", "P6043", "его же дочь Елизавета", "Елизавета Михайловна Анпилогова", "female"],
      ["M5", "granddaughter", "P6044", "его же дочь Дарья", "Дарья Михайловна Анпилогова", "female"],
      ["M6", "son", "P2006", "Ивана Никифорова второй сынъ Илья", "Илья Иванович Анпилогов", "male"],
    ],
    literal: "Иванъ Никифоровъ Анпиловъ; первый сынъ Михайла; Михайлы Иванова жена Анна, его же дочери Елизавета, Дарья; Ивана Никифорова второй сынъ Илья.",
    interpretation: "Параллельная ревизская запись 1835 года дополняет переселенческую семью Ивана Никифоровича: у Михаила Ивановича названы жена Анна и дочери Елизавета и Дарья.",
  },
  {
    sourceId: "YA-GAAO-687-1A-41-74-MIKHAIL-ANPILOV-1850",
    title: "Ревизская сказка селения Сасыкольского Енотаевского уезда за 1850 год",
    citation: "ГААО, ф. 687, оп. 1а, д. 41, св. 49, сканы 73–74",
    url: "https://yandex.ru/archive/catalog/8d9c5385-3348-4f98-bb82-f9e3b4c5afcf/74",
    date: "24 сентября 1850 года",
    place: { asWritten: "Селенія Сасыкольскаго", normalized: "село Сасыколи, Енотаевский уезд", placeId: "sasykoli-enotaevsky" },
    primaryPersonId: "P2005",
    mentions: [
      ["M1", "household-head", "P2005", "Михаила Ивановъ Анпиловъ", "Михаил Иванович Анпилогов", "male"],
      ["M2", "nephew", "P6040", "Михаилы Иванова племянникъ Трофимъ", "Трофим Ильич Анпилогов", "male"],
    ],
    literal: "Михаила Ивановъ Анпиловъ; Михаилы Иванова племянникъ Трофимъ.",
    interpretation: "В 1850 году Михаил Иванович Анпилов и его племянник Трофим продолжали жить в Сасыколях; это прослеживает семью переселенца Ивана Никифоровича спустя двадцать два года после причисления.",
  },
  {
    sourceId: "YA-GAAO-687-1A-53-772-MIKHAIL-ANPILOV-1850",
    title: "Ревизская сказка селения Бахтемирского Астраханского уезда за 1850 год",
    citation: "ГААО, ф. 687, оп. 1а, д. 53, св. 56, сканы 771–772",
    url: "https://yandex.ru/archive/catalog/2ea49ef8-c07d-406c-97c0-99c4686cc0e5/772",
    date: "27 сентября 1850 года",
    place: { asWritten: "Селенія Бахтемирскаго", normalized: "село Бахтемир, Астраханский уезд", placeId: "bakhtemir-astrakhan" },
    primaryPersonId: "P2050",
    mentions: [
      ["M1", "household-head", "P2050", "Михайла Ивановъ Анпиловъ", "Михаил Иванович Анпилогов", "male"],
      ["M2", "son", "P6045", "Михайлы Иванова сынъ Липатъ", "Липат Михайлович Анпилогов", "male"],
      ["M3", "brother", "P2051", "Михайлы Иванова братъ Тимофѣй", "Тимофей Иванович Анпилогов", "male"],
      ["M4", "nephew", "P6055", "Тимофѣя сынъ Егоръ", "Егор Тимофеевич Анпилогов", "male"],
      ["M5", "nephew", "P2054", "Тимофѣя сынъ Василій", "Василий Тимофеевич Анпилогов", "male"],
      ["M6", "nephew", "P6046", "Тимофѣя сынъ Никита", "Никита Тимофеевич Анпилогов", "male"],
      ["M7", "nephew", "P6047", "Тимофѣя сынъ Михаилъ", "Михаил Тимофеевич Анпилогов", "male"],
      ["M8", "nephew", "P2052", "Михаилы Иванова племянникъ Трофимъ", "Трофим Анпилогов", "male"],
      ["M9", "wife", "P6048", "Михаилы Иванова жена Анна Данилова", "Анна Даниловна Анпилогова", "female"],
      ["M10", "daughter", "P6049", "его же дочь Екатерина", "Екатерина Михайловна Анпилогова", "female"],
      ["M11", "daughter", "P6050", "его же дочь Наталья", "Наталья Михайловна Анпилогова", "female"],
      ["M12", "daughter", "P6051", "его же дочь Василиса", "Василиса Михайловна Анпилогова", "female"],
      ["M13", "daughter", "P6052", "его же дочь Фекла", "Фёкла Михайловна Анпилогова", "female"],
      ["M14", "sister-in-law", "P6053", "Тимофѣя Иванова жена Наталья Гаврилова", "Наталья Гавриловна Анпилогова", "female"],
      ["M15", "niece", "P6054", "его же дочь Авдотья", "Авдотья Тимофеевна Анпилогова", "female"],
    ],
    literal: "Михайла Ивановъ Анпиловъ; сынъ Липатъ; братъ Тимофѣй; Тимофѣя сыновья Егоръ, Василій, Никита, Михаилъ; племянникъ Трофимъ. Михаилы Иванова жена Анна Данилова, дочери Екатерина, Наталья, Василиса, Фекла. Тимофѣя Иванова жена Наталья Гаврилова, дочь Авдотья.",
    interpretation: "Ревизия 1850 года показывает, как переселённая в Бахтемир семья разрослась: названы Михаил Иванович с женой, сыном и четырьмя дочерьми, его брат Тимофей с женой, четырьмя сыновьями и дочерью, а также племянник Трофим.",
  },
];

for (const row of sourceRows) {
  const filePath = path.join(sourcesDir, `${row.sourceId}.json`);
  if (fs.existsSync(filePath)) throw new Error(`Источник уже существует: ${row.sourceId}`);
  writeJson(filePath, {
    schemaVersion: 1,
    sourceId: row.sourceId,
    provider: "ГА Астраханской области — цифровой скан и машинная расшифровка Яндекс Архива",
    recordType: "primary-scan-transcription",
    collection: { title: row.title, archiveCitation: row.citation },
    repository: { name: "Государственный архив Астраханской области", location: "Астрахань", url: row.url },
    links: { scan: row.url },
    primaryPersonId: row.primaryPersonId,
    event: { type: "revision-household", date: { display: row.date }, place: row.place },
    mentions: row.mentions.map((item) => mention(row.sourceId, ...item)),
    ...(row.migrations ? { migrationObservations: row.migrations } : {}),
    transcription: {
      status: "checked-against-visible-scan-and-full-page-transcription",
      literal: row.literal,
      modernInterpretation: row.interpretation,
    },
    indexData: {
      provider: "Яндекс Архив",
      warning: "Имена и родство сверены по видимой расшифровке листа; возрастные графы не перенесены, если их привязка к строкам не была однозначной.",
    },
    evidence: {
      captureType: "remote-archive-viewer",
      publicDisplay: false,
      rightsNote: "Карточка ведёт прямо на цифровой скан Яндекс Архива; локальная публикация изображения не разрешена.",
    },
    review: { status: "complete", unresolved: [] },
    summary: { status: "verified-summary", text: row.interpretation },
    isRecord: true,
  });
}

const SASYKOL_1835 = "YA-GAAO-687-2-1365-38-IVAN-ANPILOV-1835";
const SASYKOL_COPY = "YA-GAAO-687-2-1361-63-IVAN-ANPILOV-1835";
const SASYKOL_1850 = "YA-GAAO-687-1A-41-74-MIKHAIL-ANPILOV-1850";
const BAKHTEMIR_1850 = "YA-GAAO-687-1A-53-772-MIKHAIL-ANPILOV-1850";

const people = [
  { personId: "P2004", sourceIds: [SASYKOL_1835, SASYKOL_COPY], familyIds: [], parents: [], notes: ["Ревизия 1835 года прослеживает его после причисления из Бабки уже в селе Сасыколи вместе с тремя сыновьями и внуками."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835" }] },
  { personId: "P2005", sourceIds: [SASYKOL_1835, SASYKOL_COPY, SASYKOL_1850], familyIds: ["F6100"], parents: [], notes: ["В ревизиях 1835 и 1850 годов записан в Сасыколях; жена Анна, дочери Елизавета и Дарья."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835–1850" }] },
  { personId: "P2006", sourceIds: [SASYKOL_1835, SASYKOL_COPY], familyIds: ["F6101"], parents: [], notes: ["В ревизии 1835 года назван отец его сына Трофима."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835" }] },
  { personId: "P2007", sourceIds: [SASYKOL_1835], familyIds: ["F6102"], parents: [], notes: ["В ревизии 1835 года назван отец его сына Егора."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835" }] },
  { personId: "P6040", slug: "trofim-ilyich-anpilogov-sasykoli", displayName: "Трофим Ильич Анпилогов", sex: "male", formsAsWritten: ["Ильи Иванова сынъ Трофимъ", "племянникъ Трофимъ"], sourceIds: [SASYKOL_1835, SASYKOL_1850], familyIds: ["F6101"], parents: ["P2006"], notes: ["Сын Ильи Ивановича и внук переселенца Ивана Никифоровича; записан в Сасыколях в 1835 и 1850 годах."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835–1850" }] },
  { personId: "P6041", slug: "egor-timofeyevich-anpilogov-sasykoli", displayName: "Егор Тимофеевич Анпилогов", sex: "male", formsAsWritten: ["Тимоѳея Иванова сынъ Егоръ"], sourceIds: [SASYKOL_1835], familyIds: ["F6102"], parents: ["P2007"], notes: ["Сын Тимофея Ивановича и внук переселенца Ивана Никифоровича; записан в Сасыколях в 1835 году."], places: [{ relation: "residence", placeId: "sasykoli-enotaevsky", date: "1835" }] },
  { personId: "P6042", slug: "anna-anpilogova-sasykoli", displayName: "Анна Анпилогова", sex: "female", formsAsWritten: ["Михайлы Иванова жена Анна"], sourceIds: [SASYKOL_COPY], familyIds: ["F6100"], parents: [], notes: ["Жена Михаила Ивановича Анпилогова в ревизии 1835 года; отчество не указано."], places: [{ relation: "residence", placeId: "enotaevsky-uezd", date: "1835" }] },
  { personId: "P6043", slug: "elizaveta-mikhailovna-anpilogova-sasykoli", displayName: "Елизавета Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Елизавета"], sourceIds: [SASYKOL_COPY], familyIds: ["F6100"], parents: ["P2005", "P6042"], notes: ["Дочь Михаила Ивановича и Анны Анпилоговых, названная в ревизии 1835 года."], places: [{ relation: "residence", placeId: "enotaevsky-uezd", date: "1835" }] },
  { personId: "P6044", slug: "daria-mikhailovna-anpilogova-sasykoli", displayName: "Дарья Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Дарья"], sourceIds: [SASYKOL_COPY], familyIds: ["F6100"], parents: ["P2005", "P6042"], notes: ["Дочь Михаила Ивановича и Анны Анпилоговых, названная в ревизии 1835 года."], places: [{ relation: "residence", placeId: "enotaevsky-uezd", date: "1835" }] },
  { personId: "P2050", sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: [], notes: ["Ревизия Бахтемира 1850 года называет его Ивановичем и перечисляет жену Анну Даниловну, сына Липата и четырёх дочерей."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1843–1850" }] },
  { personId: "P2051", sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: [], notes: ["Ревизия Бахтемира 1850 года называет его Ивановичем; жена Наталья Гавриловна, сыновья Егор, Василий, Никита и Михаил, дочь Авдотья."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1843–1850" }] },
  { personId: "P2052", sourceIds: [BAKHTEMIR_1850], familyIds: [], parents: [], notes: ["Повторно назван племянником Михаила Ивановича в Бахтемирской ревизии 1850 года; отец по-прежнему не указан."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1843–1850" }] },
  { personId: "P2054", sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: [], notes: ["Повторно записан сыном Тимофея в Бахтемирской ревизии 1850 года."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6045", slug: "lipat-mikhailovich-anpilogov-bakhtemir", displayName: "Липат Михайлович Анпилогов", sex: "male", formsAsWritten: ["Михайлы Иванова сынъ Липатъ"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: ["P2050", "P6048"], notes: ["Сын Михаила Ивановича и Анны Даниловны; записан в Бахтемире в ревизии 1850 года."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6046", slug: "nikita-timofeyevich-anpilogov-bakhtemir", displayName: "Никита Тимофеевич Анпилогов", sex: "male", formsAsWritten: ["Тимофѣя сынъ Никита"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: ["P2051", "P6053"], notes: ["Сын Тимофея Ивановича и Натальи Гавриловны; записан в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6047", slug: "mikhail-timofeyevich-anpilogov-bakhtemir", displayName: "Михаил Тимофеевич Анпилогов", sex: "male", formsAsWritten: ["Тимофѣя сынъ Михаилъ"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: ["P2051", "P6053"], notes: ["Сын Тимофея Ивановича и Натальи Гавриловны; записан в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6048", slug: "anna-danilovna-anpilogova-bakhtemir", displayName: "Анна Даниловна Анпилогова", sex: "female", formsAsWritten: ["Михаилы Иванова жена Анна Данилова"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: [], notes: ["Жена Михаила Ивановича Анпилогова; записана в Бахтемире с сыном и четырьмя дочерьми в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6049", slug: "ekaterina-mikhailovna-anpilogova-bakhtemir", displayName: "Екатерина Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Екатерина"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: ["P2050", "P6048"], notes: ["Дочь Михаила Ивановича и Анны Даниловны, записанная в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6050", slug: "natalya-mikhailovna-anpilogova-bakhtemir", displayName: "Наталья Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Наталья"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: ["P2050", "P6048"], notes: ["Дочь Михаила Ивановича и Анны Даниловны, записанная в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6051", slug: "vasilisa-mikhailovna-anpilogova-bakhtemir", displayName: "Василиса Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Василиса"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: ["P2050", "P6048"], notes: ["Дочь Михаила Ивановича и Анны Даниловны, записанная в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6052", slug: "fekla-mikhailovna-anpilogova-bakhtemir", displayName: "Фёкла Михайловна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Фекла"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6103"], parents: ["P2050", "P6048"], notes: ["Дочь Михаила Ивановича и Анны Даниловны, записанная в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6053", slug: "natalya-gavrilovna-anpilogova-bakhtemir", displayName: "Наталья Гавриловна Анпилогова", sex: "female", formsAsWritten: ["Тимофѣя Иванова жена Наталья Гаврилова"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: [], notes: ["Жена Тимофея Ивановича Анпилогова; записана в Бахтемире с четырьмя сыновьями и дочерью в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6054", slug: "avdotya-timofeevna-anpilogova-bakhtemir", displayName: "Авдотья Тимофеевна Анпилогова", sex: "female", formsAsWritten: ["его же дочь Авдотья"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: ["P2051", "P6053"], notes: ["Дочь Тимофея Ивановича и Натальи Гавриловны, записанная в Бахтемире в 1850 году."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
  { personId: "P6055", slug: "egor-timofeyevich-anpilogov-bakhtemir-1850", displayName: "Егор Тимофеевич Анпилогов", sex: "male", formsAsWritten: ["Тимофѣя сынъ Егоръ"], sourceIds: [BAKHTEMIR_1850], familyIds: ["F6104"], parents: ["P2051", "P6053"], notes: ["Сын Тимофея Ивановича и Натальи Гавриловны, записанный в Бахтемире в 1850 году.", "Оставлен отдельным от Егора P2053, умершего в 1835 году; возможен второй ребёнок с повторно данным именем."], places: [{ relation: "residence", placeId: "bakhtemir-astrakhan", date: "1850" }] },
];

for (const row of people) upsertPerson(row);

const families = [
  { familyId: "F6100", slug: "mikhail-ivanovich-anna-anpilogovy-sasykoli", label: "Михаил Иванович и Анна Анпилоговы", spouses: ["P2005", "P6042"], children: ["P6043", "P6044"], sourceIds: [SASYKOL_COPY], notes: ["Семья переселенческой линии из Бабки; жена и две дочери названы в ревизии 1835 года."] },
  { familyId: "F6101", slug: "ilya-ivanovich-anpilogov-son-trofim", label: "Илья Иванович Анпилогов и сын Трофим", spouses: ["P2006"], children: ["P6040"], sourceIds: [SASYKOL_1835, SASYKOL_1850], notes: ["Мать Трофима в доступных строках не названа."] },
  { familyId: "F6102", slug: "timofey-ivanovich-anpilogov-son-egor", label: "Тимофей Иванович Анпилогов и сын Егор", spouses: ["P2007"], children: ["P6041"], sourceIds: [SASYKOL_1835], notes: ["Мать Егора в доступной строке не названа."] },
  { familyId: "F6103", slug: "mikhail-ivanovich-anna-danilovna-anpilogovy-bakhtemir", label: "Михаил Иванович и Анна Даниловна Анпилоговы", spouses: ["P2050", "P6048"], children: ["P6045", "P6049", "P6050", "P6051", "P6052"], sourceIds: [BAKHTEMIR_1850], notes: ["Переселённая в Бахтемир семья; полный состав супругов и детей дан ревизией 1850 года."] },
  { familyId: "F6104", slug: "timofey-ivanovich-natalya-gavrilovna-anpilogovy-bakhtemir", label: "Тимофей Иванович и Наталья Гавриловна Анпилоговы", spouses: ["P2051", "P6053"], children: ["P6055", "P2054", "P6046", "P6047", "P6054"], sourceIds: [BAKHTEMIR_1850], notes: ["Переселённая в Бахтемир семья; ревизия 1850 года называет четырёх сыновей и дочь. Егор 1850 года оставлен отдельным от одноимённого сына, умершего в 1835 году."] },
];

for (const family of families) upsertFamily(family);

const placesFile = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const newPlaces = [
  {
    placeId: "sasykoli-enotaevsky",
    name: "Сасыколи",
    label: "село Сасыколи, Енотаевский уезд, Астраханская губерния",
    kind: "historical-village",
    aliases: ["Сасыколи", "село Сасыкольское", "селение Сасыкольское", "Сасыкольское"],
    geo: {
      latitude: 47.54991,
      longitude: 46.99706,
      precision: "settlement",
      confidence: "high",
      source: "современное село Сасыколи; OpenStreetMap node 1776806253",
      sourceUrl: "https://www.openstreetmap.org/node/1776806253",
      note: "Современное село соответствует Сасыкольскому Енотаевского уезда в ревизиях 1835 и 1850 годов.",
    },
  },
  {
    placeId: "bakhtemir-astrakhan",
    name: "Бахтемир",
    label: "село Бахтемир, Астраханский уезд, Астраханская губерния",
    kind: "historical-village",
    aliases: ["Бахтемир", "селение Бахтемирское", "село Бахтемир"],
    geo: {
      latitude: 46.1576,
      longitude: 47.8157,
      precision: "settlement",
      confidence: "high",
      source: "современное село Бахтемир, географический центр ОКТМО 12620404101",
      sourceUrl: "https://geotree.ru/oktmo?title=%D1%81%D0%B5%D0%BB%D0%BE+%D0%91%D0%B0%D1%85%D1%82%D0%B5%D0%BC%D0%B8%D1%80+%28%D0%90%D1%81%D1%82%D1%80%D0%B0%D1%85%D0%B0%D0%BD%D1%81%D0%BA%D0%B0%D1%8F+%D0%BE%D0%B1%D0%BB%D0%B0%D1%81%D1%82%D1%8C%2C+%D0%98%D0%BA%D1%80%D1%8F%D0%BD%D0%B8%D0%BD%D1%81%D0%BA%D0%B8%D0%B9+%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%29",
      note: "Современное село соответствует Бахтемирскому Астраханского уезда в списках 1843 года и ревизии 1850 года.",
    },
  },
  {
    placeId: "enotaevsky-uezd",
    name: "Енотаевский уезд",
    label: "Енотаевский уезд, Астраханская губерния",
    kind: "district",
    aliases: ["Енотаевский уезд", "из Енотаевского уезда"],
    geo: {
      latitude: 47.24559,
      longitude: 47.02814,
      precision: "district",
      confidence: "low",
      source: "рабочая точка в уездном городе Енотаевске",
      sourceUrl: "https://www.openstreetmap.org/node/337656918",
      note: "Источник 1843 года называет только уезд происхождения; точка не означает конкретное исходное селение.",
    },
  },
];
for (const place of newPlaces) {
  if (!placesFile.places.some((item) => item.placeId === place.placeId)) placesFile.places.push(place);
}
writeJson(placesPath, placesFile);

for (const sourceId of [
  "YA-GAAO-454-1-339-242-MIKHAIL",
  "YA-GAAO-454-1-339-242-TIMOFEY",
  "YA-GAAO-454-1-339-242-TROFIM",
  "YA-GAAO-454-1-339-242-EGOR",
  "YA-GAAO-454-1-339-242-VASILIY",
]) {
  const found = findJsonById(sourcesDir, "sourceId", sourceId);
  if (!found) throw new Error(`Не найден существующий источник: ${sourceId}`);
  found.value.event.place.placeId = "bakhtemir-astrakhan";
  if (sourceId === "YA-GAAO-454-1-339-242-MIKHAIL") {
    found.value.migrationObservations = [{
      personId: "P2050",
      from: { placeId: "enotaevsky-uezd" },
      to: { placeId: "bakhtemir-astrakhan" },
      date: { display: "1837 год" },
      basis: "Именной список 1843 года прямо сообщает: из Енотаевского уезда причислены в 1837 году и в селении Бахтемирском осели.",
      confidence: "high",
    }];
  }
  writeJson(found.filePath, found.value);
}

console.log("Добавлены 4 ревизских скана, 15 новых профилей, 5 семей и 3 картографические точки.");
