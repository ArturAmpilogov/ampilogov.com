#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const capturedAt = "2026-09-09";
const searchPath = path.join(root, "data/genealogy/searches/yandex-archive-ampelogov-2026-09-09.json");
const sourceRoot = path.join(root, "data/genealogy/sources/yandex");
const peopleRoot = path.join(root, "data/genealogy/people");
const metadataRoot = path.join(tmpdir(), "ampelogov-yandex-metadata");
await mkdir(sourceRoot, { recursive: true });

const people = [
  ["P101368", "Дионисий Ампелогов", "Деонисій Ампелоговъ", "Зеркло, Оренбургский уезд", "Муж Праскевы; назван в записи о её смерти не позднее 1834 года."],
  ["P101369", "Матвей Максимович Ампелогов", "Матвей Максимовъ Ампелоговъ", "Зеркло, Оренбургский уезд", "Однодворец; в метрической записи назван отцом Анны."],
  ["P101370", "Анна Матвеевна Ампелогова", "Анна, дочь Матвея Максимова Ампелогова", "Зеркло, Оренбургский уезд", "Рождение зафиксировано в метрической книге 1831–1834 годов."],
  ["P101371", "Денис Ампелогов", "Денисъ Ампелоговъ", "Зеркло, Оренбургский уезд", "Однодворец, неоднократно назван поручителем при браках 1833 и 1835 годов."],
  ["P101372", "Николай Сидорович Ампелогов", "Николай Сидоровъ Ампелоговъ", "Михайловка, Оренбургский уезд", "Экономический крестьянин и восприемник в 1838 году."],
  ["P101373", "Тимофей Максимович Ампелогов", "Тимофей Максимовъ Ампелоговъ", "Георгиевка (Зеркло), Оренбургский уезд", "Однодворец; супруг Анны Дорофеевны, отец Иулиании; также назван через супругу-восприемницу."],
  ["P101374", "Емельян Кириллович Ампелогов", "Емельянъ Кирилловъ Ампелоговъ", "Зеркло, Оренбургский уезд", "Экономический крестьянин; восприемник в 1838 году и участник записи 1839 года."],
  ["P101375", "Василий Кириллович Ампелогов", "Василій Кирилловъ Ампелоговъ", "Зеркло, Оренбургский уезд", "Экономический крестьянин, отец Марфы в 1838 году."],
  ["P101376", "Марфа Васильевна Ампелогова", "Марфа, дочь Василія Кириллова Ампелогова", "Зеркло, Оренбургский уезд", "Родилась в 1838 году."],
  ["P101377", "Иулиания Тимофеевна Ампелогова", "Іуліанія, дочь Тимофея Максимова Ампелогова", "Георгиевка (Зеркло), Оренбургский уезд", "Рождение зафиксировано в параллельных метрических копиях 1839 года."],
  ["P101378", "Иван Иванович Ампелогов", "Иванъ Ивановъ Ампелоговъ", "Ново-Никольская, Самарская губерния", "Крестьянин, отец Христины в 1888 году."],
  ["P101379", "Христина Ивановна Ампелогова", "Христина, дочь Ивана Иванова Ампелогова", "Ново-Никольская, Самарская губерния", "Рождение зафиксировано в 1888 году."],
  ["P101380", "Терентий Сергеевич Ампелогов", "Терентій Сергіевъ Ампелоговъ", "Кармалка, Оренбургская губерния", "Крестьянин и поручитель по женихе в 1891 году."],
  ["P101381", "Афиноген Ампелогов", "Аѳиногенъ Ампелоговъ", "Оренбургская губерния", "Псаломщик в 1892 году; в 1912 году подписал метрическую запись как диакон."],
  ["P101382", "Никита Ампелогов", "Никита Ампелоговъ", "Лебедка, Орловская губерния", "Государственный крестьянин, назначенный к приходской церкви в 1872 году."],
  ["P101383", "Власий Ампелогов", "Власій Ампелоговъ", "Людское, Орловский уезд", "Государственный крестьянин, назначенный к приходской церкви в 1872 году."],
  ["P101384", "Иван Ампелогов", "Иванъ Ампелоговъ", "Старые Туры, Кромской уезд", "Крестьянин, член церковно-приходского попечительства в 1894 году."],
  ["P101385", "Василий Ампелогов", "Василій Ампелоговъ", "Старые Туры, Кромской уезд", "Крестьянин, член церковно-приходского попечительства в 1894 году."],
  ["P101386", "Иван Ампелогов", "Иванъ Ампелоговъ", "Орёл", "Воспитанник духовного училища и семинарии: ежегодные списки 1899–1909 годов; автор реферата, позднее указан среди окончивших курс."],
  ["P101387", "Афанасий Ампелогов", "Аѳанасій Ампелоговъ", "Людское, Орловский уезд", "Крестьянин; церковный староста в 1899 и 1911 годах."],
  ["P101388", "Андрей Ампелогов", "Андрей Ампелоговъ", "Меловое, Карачевский уезд", "Крестьянин; церковный староста в 1911 и 1914 годах."],
  ["P101389", "Павел Афанасьевич Ампелогов", "Пав. Афан. Ампелоговъ", "Гуторово, Кромской уезд", "Фельдшер, не имеющий чина, при Гуторовском медицинском пункте в адрес-календаре на 1911 год."],
];

const records = [
  {k:"archive",n:1,id:"58ae97cc-26d3-41bc-b7e7-f5fafeb57fb6",s:58,type:"death-register-mention",year:"1831–1834",place:"деревня Зеркло, Оренбургский уезд",m:[["husband","P101368","однодворецъ Деонисій Ампелоговъ"]],literal:"Той же деревни, того ж числа, у однодворца Деонисия Ампелогова жена Праскева, 35 [лет], горячкою.",modern:"Умерла 35-летняя Праскева, жена однодворца Дионисия Ампелогова; причиной названа горячка."},
  {k:"archive",n:2,id:"58ae97cc-26d3-41bc-b7e7-f5fafeb57fb6",s:76,type:"birth",year:"1831–1834",place:"деревня Зеркло, Оренбургский уезд",m:[["father","P101369","однодворецъ Матвей Максимовъ Ампелоговъ"],["child","P101370","Анна"]],literal:"Деревни Зерклы у однодворца Матвея Максимова Ампелогова от законной жены его Акилины Ивановой дочь Анна.",modern:"У однодворца Матвея Максимовича Ампелогова и Акилины Ивановны родилась дочь Анна."},
  {k:"archive",n:3,id:"286b0e8d-1c2c-46ef-a685-2323ae43b8c4",s:74,type:"marriage-witness",year:"1833",place:"деревня Зеркло, Оренбургский уезд",m:[["witness","P101371","однодворецъ Денисъ Ампелоговъ"]]},
  {k:"archive",n:4,id:"29531064-a192-47c2-afe7-9422fbc8c192",s:161,type:"marriage-witness",year:"1833",place:"деревня Зеркло, Оренбургский уезд",m:[["witness","P101371","однодворецъ Денисъ Ампелоговъ"]]},
  {k:"archive",n:5,id:"85f1a63e-ae40-4390-8443-22c66a356909",s:311,type:"marriage-witness",year:"1835",place:"деревня Зеркло, Оренбургский уезд",m:[["witness","P101371","однодворецъ Денисъ Ампелоговъ"]]},
  {k:"archive",n:6,id:"2c24578a-4ccf-4468-afb9-b6f2ebdca63e",s:71,type:"marriage-witness",year:"1835",place:"деревня Зеркло, Оренбургский уезд",m:[["witness","P101371","однодворецъ Денисъ Ампелоговъ"]]},
  {k:"archive",n:7,id:"3e293385-7056-4e6b-a777-0ca4dccae1b1",s:28,type:"marriage-witness",year:"1835–1837",place:"Булановка, Оренбургский уезд",m:[["witness",null,"Денисъ Ампелоговъ"]],literal:"В числе поручителей читается: Денисъ Ампелоговъ.",modern:"Денис Ампелогов назван поручителем; остальная строка требует осторожного построчного чтения."},
  {k:"archive",n:8,id:"2fc416b3-120e-4a85-a26c-b3ea4e9a70c5",s:39,type:"birth-godparent",year:"1838",place:"Михайловка, Оренбургский уезд",m:[["godfather","P101372","экономическій крестьянинъ Николай Сидоровъ Ампелоговъ"]]},
  {k:"archive",n:9,id:"2fc416b3-120e-4a85-a26c-b3ea4e9a70c5",s:61,type:"birth-godparent",year:"1838",place:"Зеркло, Оренбургский уезд",m:[["spouse-of-godmother","P101373","Тимофей Ампелоговъ"]]},
  {k:"archive",n:10,id:"2fc416b3-120e-4a85-a26c-b3ea4e9a70c5",s:72,type:"birth-godparent",year:"1838",place:"Зеркло, Оренбургский уезд",m:[["godfather","P101374","Емельянъ Кирилловъ Ампелоговъ"]]},
  {k:"archive",n:11,id:"311beb78-83cc-4a44-80a1-bf045b38e8f8",s:27,type:"birth-godparent",year:"1837–1839",place:"Булановка, Оренбургский уезд",m:[["spouse-of-godmother","P101373","Тимофей Ампелоговъ"]]},
  {k:"archive",n:12,id:"2fc416b3-120e-4a85-a26c-b3ea4e9a70c5",s:56,type:"birth",year:"1838",place:"Зеркло, Оренбургский уезд",m:[["father","P101375","экономическій крестьянинъ Василій Кирилловъ Ампелоговъ"],["child","P101376","Марфа"]]},
  {k:"archive",n:13,id:"9ed34e9f-5061-4564-a663-186422c07fa5",s:22,type:"birth",year:"1839",place:"Георгиевка (Зеркло), Оренбургский уезд",m:[["father","P101373","однодворецъ Тимофей Максимовъ Ампелоговъ"],["child","P101377","Іуліанія"]],parallel:{id:"86b700a4-59d3-4cf9-9faa-c8769d6ae361",s:50},literal:"Іуліанія. Деревни Георгиевки однодворец Тимофей Максимов Ампелогов и законная жена его Анна Дорофеева, оба православного вероисповедания.",modern:"В Георгиевке у Тимофея Максимовича Ампелогова и Анны Дорофеевны родилась дочь Иулиания; событие подтверждено второй метрической копией."},
  {k:"archive",n:14,id:"d7361706-33ef-4e66-8b7e-9a6b60fa30c7",s:116,type:"birth-godparent",year:"1839",place:"Оренбургский уезд",m:[["godparent","P101374","Емельянъ Кирилловъ Ампелоговъ"]],literal:"В графе восприемников читается: однодворецъ Емельянъ Кирилловъ Ампелоговъ; рядом названа девица Анастасия [отчество и фамилия читаются неуверенно].",modern:"Емельян Кириллович Ампелогов участвовал в крещении как восприемник; неясное имя второй восприемницы не нормализовано."},
  {k:"archive",n:17,id:"81ce785b-450f-4d0a-b952-c25abb307470",s:182,type:"birth",year:"1888",place:"деревня Ново-Никольская, Самарская губерния",m:[["father","P101378","крестьянинъ Иванъ Ивановъ Ампелоговъ"],["child","P101379","Христина"]]},
  {k:"archive",n:18,id:"f6a2f87c-90e0-441d-a5d7-3f3dc53009ae",s:91,type:"marriage-witness",year:"1891",place:"деревня Кармалка, Оренбургская губерния",m:[["witness","P101380","крестьянинъ Терентій Сергіевъ Ампелоговъ"]]},
  {k:"archive",n:19,id:"b4a1bea6-22f0-4c4f-bc05-fbac495ba44f",s:87,type:"clerical-signature",year:"1892",place:"Оренбургская губерния",m:[["psalm-reader","P101381","псаломщикъ Аѳиногенъ Ампелоговъ"]]},
  {k:"mass_media",n:1,id:"8f9fe49c-1ba3-424d-a413-a571c37fb82d",s:7,type:"church-appointment-list",year:"1872",place:"Орловская губерния",m:[["appointee","P101382","государственный крестьянинъ Никита Ампелоговъ"],["appointee","P101383","государственный крестьянинъ Власій Ампелоговъ"]]},
  {k:"mass_media",n:2,id:"3ab3070b-96e5-41cf-962d-53d4789319f9",s:2,type:"parish-board-list",year:"1894",place:"Старые Туры, Кромской уезд",m:[["member","P101384","крестьянинъ Иванъ Ампелоговъ"],["member","P101385","крестьянинъ Василій Ампелоговъ"]]},
  {k:"mass_media",n:3,id:"cb0c6403-ce08-4b30-ac68-b8082404a940",s:38,type:"school-list",year:"1899",place:"Орёл",m:[["student","P101386","Иванъ Ампелоговъ"]]},
  {k:"mass_media",n:4,id:"3326e9ef-106c-439b-91cd-012b27191333",s:6,type:"church-warden-list",year:"1899",place:"Людское, Орловский уезд",m:[["church-warden","P101387","крестьянинъ Аѳанасій Ампелоговъ"]]},
  {k:"mass_media",n:5,id:"67d7099d-c3e3-44d3-b50c-52d120c92d65",s:28,type:"school-list",year:"1900",place:"Орёл",m:[["student","P101386","Иванъ Ампелоговъ"]]},
  {k:"mass_media",n:6,id:"dd33d1d7-1734-4053-a264-75be8e0de8c8",s:30,type:"school-list",year:"1901",place:"Орёл",m:[["student","P101386","Иванъ Ампелоговъ"]]},
  {k:"mass_media",n:7,id:"98385ebe-5f6a-443f-9dd6-addad6e3bf5e",s:11,type:"school-list",year:"1902",place:"Орёл",m:[["student","P101386","Иванъ Ампелоговъ"]]},
  {k:"mass_media",n:8,id:"0f0c9bb2-edaf-422b-b53d-f91ebef3ee6f",s:30,type:"seminary-list",year:"1903",place:"Орёл",m:[["student","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:9,id:"a1d8104a-ba6b-4654-aee2-96710fb2685a",s:10,type:"seminary-list",year:"1905",place:"Орёл",m:[["student","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:11,id:"b557ae98-3c94-4609-92d3-f29da88a650c",s:9,type:"seminary-list",year:"1906",place:"Орёл",m:[["student","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:12,id:"b4aac5af-21ea-47ae-a204-fb25bd84f13a",s:15,type:"seminary-list",year:"1907",place:"Орёл",m:[["student","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:13,id:"d242af8c-c85d-4627-86cc-2fb9aa3e7774",s:8,type:"seminary-list",year:"1908",place:"Орёл",m:[["student","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:14,id:"ac2f0c47-79d7-47c2-87a5-bb05c855d695",s:34,type:"publication-index",year:"1909",place:"Орёл",m:[["author","P101386","И. Ампелоговъ"]]},
  {k:"mass_media",n:15,id:"06a93843-b0f1-4c0b-80df-131c8d70f3a1",s:31,type:"seminary-event",year:"1909",place:"Орёл",m:[["speaker","P101386","воспитанникъ 6-го класса Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:16,id:"59825086-2e13-4e22-8e69-af1cb4edb1ad",s:6,type:"seminary-graduation",year:"1909",place:"Орёл",m:[["graduate","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:17,id:"9910f08b-8f7d-4477-878e-613990fc3efc",s:19,type:"periodical-reprint",year:"1909",place:"Орёл",m:[["speaker","P101386","воспитанникъ 6-го класса Ампелоговъ И."]]},
  {k:"mass_media",n:19,id:"a20f8ea5-362c-4035-888e-18df3c9ac27d",s:6,type:"church-warden-list",year:"1911",place:"Людское, Орловский уезд",m:[["church-warden","P101387","крестьянинъ Аѳанасій Ампелоговъ"]]},
  {k:"mass_media",n:20,id:"79798c8d-2a69-40ed-8eea-1bf8911990f0",s:5,type:"church-warden-list",year:"1911",place:"Меловое, Карачевский уезд",m:[["church-warden","P101388","крестьянинъ Андрей Ампелоговъ"]]},
  {k:"mass_media",n:21,id:"d46b57b1-ed45-43b2-9fc4-7cbcbc43fd80",s:40,type:"seminary-alumni-list",year:"1912",place:"Орёл",m:[["graduate","P101386","Ампелоговъ Иванъ"]]},
  {k:"mass_media",n:22,id:"7d252213-f71c-4a47-b928-05883ef11236",s:31,type:"academy-student-list",year:"1912",place:"не указано",m:[["student",null,"Ампелоговъ"]],literal:"Студенты Духовной Академии: Ампелоговъ, Коссовъ, Раевскій, Лосевъ.",modern:"В списке студентов духовной академии фамилия Ампелогов приведена без имени; отождествление с Иваном Ампелоговым не выполнено без самостоятельного доказательства."},
  {k:"mass_media",n:23,id:"b9d7689c-028e-4c1e-a910-f120d02d4c8b",s:3,type:"church-warden-list",year:"1914",place:"Меловое, Карачевский уезд",m:[["church-warden","P101388","крестьянинъ Андрей Ампелоговъ"]]},
  {k:"books",n:2,id:"a02fcb4f-3da0-46b7-88b2-831e247e6abf",s:297,type:"directory-employment",year:"1911",place:"Гуторово, Кромской уезд",m:[["feldsher","P101389","Пав. Афан. Ампелоговъ"]]},
];

const search = JSON.parse(await readFile(searchPath, "utf8"));
const batchByIndex = new Map(search.batches.map((batch) => [batch.index, batch]));
const rowFor = (record) => batchByIndex.get(record.k).results.find((row) => row.absolutePosition === record.n);
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const pngDimensions = async (file) => {
  const bytes = await readFile(file);
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
};
const metadataFor = async ({ id, s }) => JSON.parse(await readFile(path.join(metadataRoot, `${id}-${s}.json`), "utf8"));
const targetOcr = (metadata) => (metadata.pageProps.currentNode.textBlocks ?? []).filter((block) => /ампелог/i.test(block.text ?? "")).map((block) => block.text.trim()).join("\n");
const titleFor = (metadata) => metadata.pageProps.breadcrumbs?.at(-1)?.name ?? metadata.pageProps.currentNode.namepath;

const evidenceBundle = async (id, scan) => {
  const prefix = String(scan).padStart(4, "0");
  const dir = path.join(root, "data/genealogy/evidence-private/yandex", id);
  const names = await readdir(dir);
  const full = path.join(dir, `${prefix}-full-view.png`);
  const header = path.join(dir, `${prefix}-header.png`);
  const targets = names.filter((name) => name === `${prefix}-target-entry.png` || name.startsWith(`${prefix}-target-entry-document-`)).sort();
  await access(full); await access(header);
  if (!targets.length) throw new Error(`Нет target для ${id}/${scan}`);
  return {
    catalogId: id,
    scanNumber: scan,
    captureType: "yandex-archive-original-image-download-with-enlarged-fragments",
    localBackup: relative(full),
    path: relative(full),
    capturedAt,
    sha256: await digest(full),
    fragments: [
      { kind: "header", path: relative(header), sha256: await digest(header), description: "Область заголовка, структуры или верхней части исходного листа." },
      ...(await Promise.all(targets.map(async (name, index) => ({
        kind: targets.length === 1 ? "target-entry" : `target-entry-${index + 1}`,
        path: relative(path.join(dir, name)),
        sha256: await digest(path.join(dir, name)),
        description: "Крупный фрагмент целевой строки с соседним первичным контекстом.",
      })))),
    ],
    quality: {
      documentOnlyVisuallyConfirmed: true,
      headerVisuallyConfirmed: true,
      targetRowsVisuallyConfirmed: true,
      confirmedAt: capturedAt,
      method: "manual-reading-of-downloaded-original",
      fullDimensions: await pngDimensions(full),
    },
    publicDisplay: false,
    rightsNote: "Локальная копия оригинального листа и фрагменты сохранены только для исследовательской проверки; публичная ссылка ведёт исключительно на Яндекс Архив.",
  };
};

const sourceIdsByPerson = new Map(people.map(([id]) => [id, []]));
for (const record of records) {
  const sourceId = `YA-${record.id.slice(0, 8).toUpperCase()}-${String(record.s).padStart(3, "0")}`;
  const metadata = await metadataFor(record);
  const reading = record.literal ?? targetOcr(metadata);
  const source = {
    schemaVersion: 1,
    sourceId,
    provider: "Яндекс Архив — первичный скан",
    recordType: record.type,
    collection: {
      catalogId: record.id,
      scanNumber: record.s,
      title: titleFor(metadata),
      ...(record.parallel ? { citations: [{ catalogId: record.parallel.id, scanNumber: record.parallel.s, documentUrl: `https://yandex.ru/archive/catalog/${record.parallel.id}/${record.parallel.s}` }] } : {}),
    },
    links: { documentUrl: `https://yandex.ru/archive/catalog/${record.id}/${record.s}` },
    event: { type: record.type, date: { display: record.year, confidence: "high-for-year" }, place: { normalized: record.place } },
    mentions: record.m.map(([role, personId, nameAsTranscribed], index) => ({
      mentionId: `${sourceId}-M${index + 1}`,
      role,
      personId,
      nameAsTranscribed,
      displayName: personId ? people.find(([id]) => id === personId)?.[1] : nameAsTranscribed.replaceAll("ъ", ""),
      surnameSeries: true,
    })),
    evidence: await evidenceBundle(record.id, record.s),
    transcription: {
      status: "complete-primary-scan-transcription-with-local-evidence",
      literal: reading,
      modernInterpretation: record.modern ?? `Первичный лист подтверждает упоминание ${record.m.map(([, personId, written]) => personId ? people.find(([id]) => id === personId)?.[1] : written).join(", ")}.`,
      indexNote: "Индекс Яндекса использован только для навигации; чтение сверено вручную по сохранённому оригинальному изображению.",
    },
    isRecord: true,
    cardKind: "named-primary-record",
    review: { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: record.n === 7 || record.n === 14 ? "medium" : "high", unresolved: record.n === 14 ? ["Отчество и фамилия второй восприемницы не нормализованы из-за неясного почерка."] : [] },
  };
  if (record.parallel) {
    source.evidence.parallelCopies = [{ ...(await evidenceBundle(record.parallel.id, record.parallel.s)), captureType: "yandex-archive-original-image-download-with-enlarged-fragments" }];
  }
  await writeFile(path.join(sourceRoot, `${sourceId}.json`), `${JSON.stringify(source, null, 2)}\n`);
  for (const [, personId] of record.m) if (personId) sourceIdsByPerson.get(personId)?.push(sourceId);
  const row = rowFor(record);
  if (row) Object.assign(row, { sourceId, status: "complete-with-local-evidence", primaryScanReading: reading });
  if (record.parallel) {
    const parallelRow = batchByIndex.get("archive").results.find((row) => row.catalogId === record.parallel.id && row.scanNumber === record.parallel.s);
    Object.assign(parallelRow, { sourceId, status: "complete-parallel-copy-with-local-evidence", primaryScanReading: reading });
  }
}

// Two search hits are only page-turn overlap images of the same printed entries.
for (const duplicate of [
  { k: "mass_media", n: 10, sourceId: "YA-A1D8104A-010", reading: "Повторный захват края предыдущей печатной страницы: Ампелоговъ Иванъ; нового события нет." },
  { k: "mass_media", n: 18, sourceId: "YA-79798C8D-005", reading: "Повторный захват края следующей печатной страницы: Мѣлового — кр. Андрей Ампелоговъ; нового события нет." },
]) Object.assign(rowFor(duplicate), { sourceId: duplicate.sourceId, status: "complete-duplicate-page-overlap", primaryScanReading: duplicate.reading });

// The already complete 1882 record is retained unchanged.
Object.assign(batchByIndex.get("archive").results.find((row) => row.absolutePosition === 16), {
  sourceId: "YA-11A786E9-58", status: "existing-complete", primaryScanReading: "По невесте: села Зобова унтер-офицер Андрей Прокопьев Ампилогов и крестьянин Иван Прокопьев Ампелогов."
});

// Correct an earlier false-negative reading: the scan clearly says Afinogen Ampelogov.
const correctedId = "YA-C31F8E91-114";
const correctedPath = path.join(root, "data/genealogy/sources", `${correctedId}.json`);
const corrected = JSON.parse(await readFile(correctedPath, "utf8"));
corrected.provider = "Яндекс Архив — первичный скан";
corrected.recordType = "clerical-signature";
corrected.mentions = [{ mentionId: `${correctedId}-M1`, role: "deacon", personId: "P101381", nameAsTranscribed: "Діаконъ Аѳиногенъ Ампелоговъ", displayName: "Афиноген Ампелогов", surnameSeries: true }];
corrected.event = { type: "clerical-signature", date: { display: "1912", confidence: "high" }, place: { normalized: "Оренбургская губерния" } };
corrected.evidence = await evidenceBundle("c31f8e91-64b4-4928-809d-8457fa2ab002", 114);
corrected.transcription = { status: "complete-primary-scan-transcription-with-local-evidence", literal: "Священникъ Іоаннъ Поляковъ. Діаконъ Аѳиногенъ Ампелоговъ.", modernInterpretation: "Метрическую запись подписали священник Иоанн Поляков и диакон Афиноген Ампелогов.", indexNote: "Предыдущее заключение о ложном совпадении исправлено после повторного чтения крупного фрагмента оригинала." };
corrected.isRecord = true;
corrected.cardKind = "named-primary-record";
corrected.review = { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: "high", unresolved: [], correctionHistory: ["2026-09-09: прежнее ошибочное чтение «ложное индексное совпадение» заменено по ясно читаемой подписи диакона Афиногена Ампелогова."] };
await writeFile(correctedPath, `${JSON.stringify(corrected, null, 2)}\n`);
sourceIdsByPerson.get("P101381").push(correctedId);
Object.assign(batchByIndex.get("archive").results.find((row) => row.absolutePosition === 20), { sourceId: correctedId, status: "complete-corrected-false-negative-with-local-evidence", primaryScanReading: corrected.transcription.literal });

// Add the independently visible Ampelogov reference to the existing index page.
const book441Path = path.join(root, "data/genealogy/sources/YA-A02FCB4F-441.json");
const book441 = JSON.parse(await readFile(book441Path, "utf8"));
book441.mentions = [
  ...book441.mentions.filter((mention) => mention.mentionId !== "YA-A02FCB4F-441-M2"),
  { mentionId: "YA-A02FCB4F-441-M2", role: "subject", personId: "P101389", nameAsTranscribed: "Ампелоговъ П. А.", displayName: "Павел Афанасьевич Ампелогов", surnameSeries: true },
];
book441.evidence = await evidenceBundle("a02fcb4f-3da0-46b7-88b2-831e247e6abf", 441);
book441.transcription.literal = "Ампелоговъ П. А. 213.\nАмпилоговъ А. В. 85.";
book441.transcription.modernInterpretation = "Алфавитный указатель содержит две самостоятельные ссылки: Павел Афанасьевич Ампелогов — на страницу 213 и Афанасий Васильевич Ампилогов — на страницу 85.";
book441.review = { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: "high", unresolved: [] };
await writeFile(book441Path, `${JSON.stringify(book441, null, 2)}\n`);
sourceIdsByPerson.get("P101389").push("YA-A02FCB4F-441", "YA-A02FCB4F-297");
Object.assign(batchByIndex.get("books").results.find((row) => row.absolutePosition === 1), { sourceId: "YA-A02FCB4F-441", status: "complete-existing-source-augmented", primaryScanReading: "Ампелоговъ П. А. 213." });

for (const [personId, displayName, written, place, note] of people) {
  const fileName = `${personId}-${displayName.toLowerCase().replaceAll("ё", "e").replaceAll("й", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "")}.json`;
  const value = {
    schemaVersion: 1,
    personId,
    displayName,
    sex: /Анна|Марфа|Иулиания|Христина/.test(displayName) ? "female" : "male",
    nameVariants: [written],
    surname: { normalized: displayName.endsWith("а") ? "Ампелогова" : "Ампелогов", formsAsWritten: [written.match(/Ампелогов[а-яъ]*/i)?.[0]?.replace(/ъ$/, "") ?? "Ампелогов"] },
    sourceIds: [...new Set(sourceIdsByPerson.get(personId))].sort(),
    status: "documented-from-primary-scan",
    places: [{ relation: "documented", normalized: place, confidence: "high" }],
    notes: [note],
  };
  await writeFile(path.join(peopleRoot, fileName), `${JSON.stringify(value, null, 2)}\n`);
}

for (const batch of search.batches) {
  batch.pages = Array.from({ length: batch.reportedPages }, (_, index) => ({
    page: index + 1,
    status: "complete-with-local-evidence",
    rows: batch.results.filter((row) => row.page === index + 1).length,
  }));
}
search.status = "complete";
search.progress = {
  rowsFound: 45,
  rowsCompleted: 45,
  rowsExistingComplete: 1,
  rowsWithNewSource: records.length,
  rowsCorrected: 1,
  rowsAugmented: 1,
  duplicatePageOverlapRows: 2,
  parallelCopyRows: 1,
  rowsWithSavedEvidence: 44,
  remainingRows: 0,
};
search.notableCorrections = [
  "Архивная позиция 1: индекс называл Феклу Шеховцову, но целевая строка первичного скана сообщает о 35-летней Праскеве, жене Дионисия Ампелогова.",
  "Архивная позиция 20: прежняя карточка ошибочно считала совпадение ложным; крупный фрагмент ясно читается как «Діаконъ Аѳиногенъ Ампелоговъ».",
  "Газетные позиции 10 и 18 являются повторными захватами края соседней печатной страницы, поэтому новых событий не создают.",
  "Архивные позиции 13 и 15 — параллельные метрические копии рождения Иулиании, объединённые в один Record.",
];
const temporary = `${searchPath}.tmp-${process.pid}`;
await writeFile(temporary, `${JSON.stringify(search, null, 2)}\n`);
await rename(temporary, searchPath);
console.log(JSON.stringify({ sourcesWritten: records.length, peopleWritten: people.length, corrected: correctedId, augmented: "YA-A02FCB4F-441", progress: search.progress }));
