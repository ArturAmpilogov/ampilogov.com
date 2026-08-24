import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const fsSourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const S1828 = "FS-3Q9M-CSS9-9951-B";
const S1845 = "FS-3Q9M-CS9Y-XQPL-D";
const S1849 = "FS-3Q9M-CSSQ-3WGP-9";
const S1852 = "FS-3Q9M-CSSQ-37HK-W";
const S1857_ELISEY = "FS-3Q9M-CS9M-QSDC-D";
const S1857_STEFAN = "FS-3Q9M-CS9M-QSD9-V";

const people = [
  { id: "P0612", slug: "agafya-timofeevna-anpilogova-timoshovka", name: "Агафия Тимофеевна Анпилогова", sex: "female", sources: [S1828], families: ["F0122", "F0123"], parents: ["P0614"], notes: ["Невеста в тимошовской метрической записи 1828 года; отчество и индекс прямо называют её отца Тимофея Анпилогова."] },
  { id: "P0613", slug: "filipp-kovshin-timoshovka-1828", name: "Филипп Ковшин", sex: "male", sources: [S1828], families: ["F0123"], normalizedSurname: "Ковшин", written: ["Ковшин", "Ковшинъ"], notes: ["Жених Агафии Тимофеевны Анпилоговой в Тимошовке 27 января 1828 года."] },
  { id: "P0614", slug: "timofey-anpilogov-timoshovka-1828", name: "Тимофей Анпилогов", sex: "male", sources: [S1828], families: ["F0122"], notes: ["Отец Агафии Тимофеевны, прямо названный индексом и подтверждённый её отчеством в оригинальной брачной записи 1828 года.", "Не объединяется с тёзкой из башкирской переписи 1926 года P0532."] },
  { id: "P0615", slug: "elisey-pavlovich-anpilogov-timoshovka", name: "Елисей Павлович Анпилогов", sex: "male", sources: [S1845, S1857_ELISEY], families: ["F0124"], notes: ["Тимошовский государственный крестьянин; с той же женой назван отцом Андрея в 1845 году и Фёдора в 1857 году.", "Павлович и местность делают его кандидатом в родственники Феодора Павловича P0177 и других детей Павла, но прямой семейной связи пока нет."] },
  { id: "P0616", slug: "paraskeva-grigoryevna-wife-elisey-anpilogov", name: "Параскева Григорьевна Анпилогова", sex: "female", sources: [S1845, S1857_ELISEY, "FS-3Q9M-CSSQ-3WR3-Y", "FS-3Q9M-CSSM-177C-C"], families: ["F0124"], notes: ["Законная жена Елисея Павловича в четырёх независимых оригинальных метрических записях 1845–1857 годов."] },
  { id: "P0617", slug: "andrey-eliseevich-anpilogov-1845", name: "Андрей Елисеевич Анпилогов", sex: "male", sources: [S1845], families: ["F0124"], parents: ["P0615", "P0616"], birth: { date: "1845-10-18", placeId: "tymoshivka" }, notes: ["Родился 18 октября и крещён 20 октября 1845 года в Тимошовке.", "Не объединяется с Андреями 1849 и 1852 годов: это дети других отцов."] },
  { id: "P0618", slug: "maria-pavlovna-anpilogova-timoshovka-1845", name: "Мария Павловна Анпилогова", sex: "female", sources: [S1845], families: [], notes: ["Восприемница Андрея Елисеевича в Тимошовке в 1845 году.", "Общее отчество с Елисеем Павловичем и местность допускают родство, но его характер документом не указан."] },
  { id: "P0619", slug: "fedor-eliseevich-anpilogov-1857", name: "Фёдор Елисеевич Анпилогов", sex: "male", sources: [S1857_ELISEY], families: ["F0124"], parents: ["P0615", "P0616"], birth: { date: "1857-05-15", placeId: "tymoshivka" }, notes: ["Родился 15 мая и крещён 16 мая 1857 года в приходе Тимошовки."] },
  { id: "P0620", slug: "stefan-ivanovich-anpilogov-timoshovka", name: "Стефан Иванович Анпилогов", sex: "male", sources: [S1849, S1857_STEFAN], families: ["F0125"], written: ["Еппалогов", "Анпелогов"], notes: ["Тимошовский государственный крестьянин. Неуверенное чтение фамилии в 1849 году подтверждается независимой записью 1857 года с теми же супругами."] },
  { id: "P0621", slug: "maria-efimovna-wife-stefan-anpilogov", name: "Мария Ефимовна Анпилогова", sex: "female", sources: [S1849, S1857_STEFAN], families: ["F0125"], notes: ["Жена Стефана Ивановича; названа Марией Евфимовной/Ефимовной в записях о двух детях."] },
  { id: "P0622", slug: "andrey-stefanovich-anpilogov-1849", name: "Андрей Стефанович Анпилогов", sex: "male", sources: [S1849], families: ["F0125"], parents: ["P0620", "P0621"], birth: { date: "1849-07-03", placeId: "tymoshivka" }, notes: ["Родился 3 июля и крещён 4 июля 1849 года в Тимошовке; фамильное чтение укреплено записью его сестры 1857 года."] },
  { id: "P0623", slug: "irina-stefanovna-anpelogova-1857", name: "Ирина Стефановна Анпелогова", sex: "female", sources: [S1857_STEFAN], families: ["F0125"], parents: ["P0620", "P0621"], birth: { date: "1857-05-08", placeId: "tymoshivka" }, written: ["Анпелогова"], notes: ["Родилась 8 мая и крещена 9 мая 1857 года в Тимошовке."] },
  { id: "P0624", slug: "alexey-pavlovich-anpilogov-timoshovka", name: "Алексей Павлович Анпилогов", sex: "male", sources: [S1852], families: ["F0126"], notes: ["Тимошовский крестьянин, отец Андрея в записи 1852 года. Оригинальное написание фамилии требует повторной палеографической проверки, но индекс FamilySearch даёт вариант Акнилогов/Анпилогов.", "Возможное родство с другими Павловичами Тимошовки не утверждается."] },
  { id: "P0625", slug: "paraskeva-georgievna-wife-alexey-anpilogov", name: "Параскева Георгиевна Анпилогова", sex: "female", sources: [S1852], families: ["F0126"], notes: ["Жена Алексея Павловича в записи о рождении Андрея 1852 года."] },
  { id: "P0626", slug: "andrey-alexeevich-anpilogov-1852", name: "Андрей Алексеевич Анпилогов", sex: "male", sources: [S1852], families: ["F0126"], parents: ["P0624", "P0625"], birth: { date: "1852-07-04", placeId: "tymoshivka" }, notes: ["Родился 4 июля и крещён 6 июля 1852 года в Тимошовке; фамилия в рукописи читается не полностью уверенно и поддерживается индексом FamilySearch."] },
];

for (const p of people) {
  const surname = p.normalizedSurname || (p.name.includes("Ковшин") ? "Ковшин" : "Анпилогов");
  const defaultWritten = surname === "Ковшин" ? ["Ковшин", "Ковшинъ"] : ["Анпилогов", "Ампилогов", "Анпелогов"];
  writeJson(path.join(peopleDir, `${p.id}-${p.slug}.json`), {
    schemaVersion: 1,
    personId: p.id,
    displayName: p.name,
    sex: p.sex,
    ...(p.birth ? { birth: p.birth } : {}),
    ...(p.parents ? { parents: p.parents } : {}),
    familyIds: p.families,
    sourceIds: p.sources,
    status: "documented-from-primary-scan",
    notes: p.notes,
    surname: { normalized: surname, formsAsWritten: p.written || defaultWritten },
    places: [{ relation: "resident", placeId: "tymoshivka" }],
  });
}

const families = [
  { id: "F0122", slug: "timofey-anpilogov-daughter-agafya", label: "Тимофей Анпилогов и дочь Агафия", spouses: ["P0614"], children: ["P0612"], sources: [S1828], notes: ["Отец установлен по отчеству невесты и отдельной индексной записи; мать не названа."] },
  { id: "F0123", slug: "filipp-kovshin-and-agafya-anpilogova", label: "Филипп Ковшин и Агафия Тимофеевна Анпилогова", spouses: ["P0613", "P0612"], children: [], sources: [S1828], notes: ["Брак заключён 27 января 1828 года в Тимошовке."] },
  { id: "F0124", slug: "elisey-pavlovich-anpilogov-family", label: "Семья Елисея Павловича Анпилогова", spouses: ["P0615", "P0616"], children: ["P0617", "P0619"], sources: [S1845, S1857_ELISEY], notes: ["Семья подтверждена двумя независимыми метрическими записями с интервалом двенадцать лет."] },
  { id: "F0125", slug: "stefan-ivanovich-anpilogov-family", label: "Семья Стефана Ивановича Анпилогова", spouses: ["P0620", "P0621"], children: ["P0622", "P0623"], sources: [S1849, S1857_STEFAN], notes: ["Семья подтверждена двумя записями; вариант фамилии 1849 года установлен по повтору супругов в более ясной записи 1857 года."] },
  { id: "F0126", slug: "alexey-pavlovich-anpilogov-family", label: "Семья Алексея Павловича Анпилогова", spouses: ["P0624", "P0625"], children: ["P0626"], sources: [S1852], notes: ["Фамилия отца поддержана индексом; буквальное чтение рукописи требует повторной проверки."] },
];
for (const f of families) writeJson(path.join(familiesDir, `${f.id}-${f.slug}.json`), { schemaVersion: 1, familyId: f.id, label: f.label, spouses: f.spouses, children: f.children, sourceIds: f.sources, status: "documented-from-primary-scan", notes: f.notes });

const sourceLinks = {
  "3Q9M-CSS9-9951-B": { primary: "P0612", persons: { bride: "P0612", groom: "P0613", "bride-father": "P0614" }, familyIds: ["F0122", "F0123"] },
  "3Q9M-CS9Y-XQPL-D": { primary: "P0617", persons: { child: "P0617", father: "P0615", mother: "P0616", godmother: "P0618" }, familyIds: ["F0124"] },
  "3Q9M-CS9M-QSDC-D": { primary: "P0619", persons: { child: "P0619", father: "P0615", mother: "P0616" }, familyIds: ["F0124"] },
  "3Q9M-CSSQ-3WGP-9": { primary: "P0622", persons: { child: "P0622", father: "P0620", mother: "P0621" }, familyIds: ["F0125"] },
  "3Q9M-CS9M-QSD9-V": { primary: "P0623", persons: { child: "P0623", father: "P0620", mother: "P0621" }, familyIds: ["F0125"] },
  "3Q9M-CSSQ-37HK-W": { primary: "P0626", persons: { child: "P0626", father: "P0624", mother: "P0625" }, familyIds: ["F0126"] },
};

for (const [fileStem, link] of Object.entries(sourceLinks)) {
  const file = path.join(fsSourcesDir, `${fileStem}.json`);
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  source.primaryPersonId = link.primary;
  source.familyIds = [...new Set([...(source.familyIds || []), ...link.familyIds])];
  const usedRoles = {};
  source.mentions = (source.mentions || []).map((mention) => {
    const role = mention.role;
    const personId = link.persons[role];
    if (!personId || usedRoles[role]) return mention;
    usedRoles[role] = true;
    return { ...mention, personId };
  });
  if (source.review) source.review.identityResolution = "linked-to-person-and-family-profiles";
  writeJson(file, source);
}

console.log("Связаны 15 ранних жителей Тимошовки, пять семей и шесть оригинальных метрических сканов 1828–1857 годов.");

// Второй проход: аудит уникальных имён выявил ещё три надёжных скана этой же семьи.
const S1818_ELISEY = "FS-3Q9M-CSSM-YQ8F-2";
const S1849_ANASTASIA = "FS-3Q9M-CSSQ-3WR3-Y";
const S1854_VERA = "FS-3Q9M-CSSM-177C-C";

const extraPeople = [
  {
    id: "P0627",
    slug: "anastasia-eliseevna-anpilogova-1849",
    name: "Анастасия Елисеевна Анпилогова",
    birth: { date: "1849-10-28", placeId: "melitopol" },
    source: S1849_ANASTASIA,
    note: "Родилась 28 октября и крещена 30 октября 1849 года в Мелитополе.",
  },
  {
    id: "P0628",
    slug: "vera-eliseevna-anpilogova-1854",
    name: "Вера Елисеевна Анпилогова",
    birth: { date: "1854-09-17", placeId: "melitopol" },
    source: S1854_VERA,
    note: "Родилась 17 сентября 1854 года; крещение, вероятно, состоялось 19 сентября.",
  },
];
for (const p of extraPeople) writeJson(path.join(peopleDir, `${p.id}-${p.slug}.json`), {
  schemaVersion: 1,
  personId: p.id,
  displayName: p.name,
  sex: "female",
  birth: p.birth,
  parents: ["P0615", "P0616"],
  familyIds: ["F0124"],
  sourceIds: [p.source],
  status: "documented-from-primary-scan",
  notes: [p.note],
  surname: { normalized: "Анпилогов", formsAsWritten: ["Анпилогова"] },
  places: [{ relation: "resident", placeId: "melitopol" }],
});

const findPersonFile = (personId) => path.join(peopleDir, fs.readdirSync(peopleDir).find((name) => name.startsWith(`${personId}-`)));
const eliseyFile = findPersonFile("P0615");
const elisey = JSON.parse(fs.readFileSync(eliseyFile, "utf8"));
elisey.parents = ["P0175"];
elisey.familyIds = [...new Set([...(elisey.familyIds || []), "F0127"] )];
elisey.sourceIds = [...new Set([...(elisey.sourceIds || []), S1818_ELISEY, S1849_ANASTASIA, S1854_VERA])];
elisey.notes = [
  ...(elisey.notes || []).filter((note) => !note.includes("кандидатом в родственники Феодора")),
  "Оригинальная запись рождения 1818 года прямо называет его отцом Павла Анпилогова; сопоставление Павла с P0175 вероятно по имени, месту и хронологии, поскольку отчество отца в записи ребёнка не приведено.",
];
writeJson(eliseyFile, elisey);

const pavelFile = findPersonFile("P0175");
const pavel = JSON.parse(fs.readFileSync(pavelFile, "utf8"));
pavel.familyIds = [...new Set([...(pavel.familyIds || []), "F0127"] )];
pavel.sourceIds = [...new Set([...(pavel.sourceIds || []), S1818_ELISEY])];
pavel.notes = [...new Set([...(pavel.notes || []), "Запись 14 июня 1818 года прямо называет Павла Анпилогова отцом Елисея; отождествление с Павлом Ильичом P0175 вероятно по месту, имени и возрасту."])];
writeJson(pavelFile, pavel);

writeJson(path.join(familiesDir, "F0127-pavel-anpilogov-son-elisey.json"), {
  schemaVersion: 1,
  familyId: "F0127",
  label: "Павел Анпилогов и сын Елисей",
  spouses: ["P0175"],
  children: ["P0615"],
  sourceIds: [S1818_ELISEY],
  status: "documented-father-probable-profile-identity",
  notes: ["Оригинал прямо фиксирует отца Павла и сына Елисея; мать не названа. Павел сопоставлен с P0175 вероятно, поэтому Елисей не добавлен в супружескую семью F0019, где это ошибочно утвердило бы Агафию его матерью."],
});

const eliseyFamilyFile = path.join(familiesDir, "F0124-elisey-pavlovich-anpilogov-family.json");
const eliseyFamily = JSON.parse(fs.readFileSync(eliseyFamilyFile, "utf8"));
eliseyFamily.children = [...new Set([...(eliseyFamily.children || []), "P0627", "P0628"] )];
eliseyFamily.sourceIds = [...new Set([...(eliseyFamily.sourceIds || []), S1849_ANASTASIA, S1854_VERA])];
eliseyFamily.notes = ["Семья подтверждена четырьмя независимыми метрическими записями 1845–1857 годов."];
writeJson(eliseyFamilyFile, eliseyFamily);

const extraSourceLinks = {
  "3Q9M-CSSM-YQ8F-2": { primary: "P0615", persons: { child: "P0615", father: "P0175" }, familyIds: ["F0127"] },
  "3Q9M-CSSQ-3WR3-Y": { primary: "P0627", persons: { child: "P0627", father: "P0615", mother: "P0616" }, familyIds: ["F0124"] },
  "3Q9M-CSSM-177C-C": { primary: "P0628", persons: { child: "P0628", father: "P0615", mother: "P0616" }, familyIds: ["F0124"] },
};
for (const [fileStem, link] of Object.entries(extraSourceLinks)) {
  const file = path.join(fsSourcesDir, `${fileStem}.json`);
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  source.primaryPersonId = link.primary;
  source.familyIds = [...new Set([...(source.familyIds || []), ...link.familyIds])];
  const usedRoles = {};
  source.mentions = (source.mentions || []).map((mention) => {
    const personId = link.persons[mention.role];
    if (!personId || usedRoles[mention.role]) return mention;
    usedRoles[mention.role] = true;
    return { ...mention, personId };
  });
  if (source.review) source.review.identityResolution = "linked-to-person-and-family-profiles";
  writeJson(file, source);
}

console.log("Добавлены рождение Елисея 1818 года, две дочери и отдельная осторожная связь Павел → Елисей.");
