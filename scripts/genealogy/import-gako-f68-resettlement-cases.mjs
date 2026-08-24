import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const sourcesDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const inventoryUrls = {
  "o1-5": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_1/5._1876g..doc",
  "o1-6": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_1/6._1878g..doc",
  "o2-1": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_2/1._opisj_1883_-1886_gg._.doc",
  "o2-2": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_2/2._1887_g._.doc",
  "o2-4": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_2/4._1888-1889.doc",
  "o2-5": "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_2/5._1890_g._.doc",
};

const nameIndexUrl = "https://archive.rkursk.ru/sites/default/files/Opisi/1_-_dorev/f.68/opisj_1/imennoi_t1.pdf";

const cases = [
  {
    sourceId: "GAKO-F68-O2-D1885-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-1",
    opis: "2",
    delo: "1885",
    dates: "18 июня 1885 — 3 июня 1886",
    pages: "643 листа",
    title: "О разрешении 497 душам Старооскольского уезда переселиться в Минусинский округ",
    literal: "Дело по отношению Енисейского губернатора о разрешении крестьянам Богуславской, Долгополянской и Казачанской волостей Старооскольского у. (497 душ) переселиться в Минусинский округ Енисейской губ.",
    people: ["P0513"],
    names: ["В. Анпилогов"],
    from: "stary-oskol",
    to: "minusinsk-okrug",
    match: "Именной указатель относит В. Анпилогова из села Сорокино Старооскольского уезда к делу № 1885.",
  },
  {
    sourceId: "GAKO-F68-O2-D2613-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-1",
    opis: "2",
    delo: "2613",
    dates: "23 октября 1886 — 31 августа 1887",
    pages: "413 листов; список получивших разрешение — лл. 23–23 об.",
    title: "О переселении 43 семей Курского уезда в Томскую губернию",
    literal: "Дело о переселении в Томскую губернию крестьян с. Колодное (8 семей), д. Полевая (6), д. Майкова (8), с. Зорино (1), д. Алябьева (11), д. Хвостова (5) и с-ца Якунино (4) Курского у.; список получивших разрешение — лл. 23, 23 об.",
    people: ["P0515"],
    names: ["Л. А. Анпилогов"],
    from: "fatezh-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель даёт Л. А. Анпилогову происхождение «Фатежский уезд» и дело № 2613, тогда как заголовок дела перечисляет только селения Курского уезда. Расхождение сохранено и требует проверки самого списка на лл. 23–23 об.",
  },
  {
    sourceId: "GAKO-F68-O2-D3728-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-2",
    opis: "2",
    delo: "3728",
    dates: "20 мая 1887 — 28 мая 1888",
    pages: "384 листа; семейные списки — лл. 3, 11–12, 16–20, 24–33, 42–43; список разрешённых семей — л. 47",
    title: "О переселении 19 семей Фатежского уезда в Томскую губернию",
    literal: "Дело по прошениям крестьян Большежировской, Меленинской и Нижнереутской волостей Фатежского у. о переселении в Томскую губ. Список 19 семей из с. Гаево, с-ц Дмитриевское и Знаменское, д. Клюшникова, Любаж-Колодезь, Лахтионова, Полевой Колодезь, с. Троицкое, что на Сучку, и с. Шахово — л. 47.",
    people: ["P0514"],
    names: ["Л. А. Анпилогов"],
    from: "fatezh-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель относит Л. А. Анпилогова из села Троицкое, что на Сучке, к делу № 3728.",
  },
  {
    sourceId: "GAKO-F68-O2-D3736-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-2",
    opis: "2",
    delo: "3736",
    dates: "2 мая 1887 — 10 июля 1890",
    pages: "368 листов; семейные и имущественные списки — лл. 74–198; список разрешённых семей — лл. 197–198",
    title: "О переселении 194 семей Дмитриевской волости Фатежского уезда в Томскую губернию",
    literal: "Дело по прошениям крестьян Дмитриевской вол. Фатежского у. о переселении в Томскую губ. Семейные списки и сведения об имуществе — лл. 74–198. Список 194 семей, получивших разрешение, включая с. Шахово, — лл. 197–198.",
    people: ["P0510"],
    names: ["А. Г. Анпилогов"],
    from: "fatezh-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель прямо связывает А. Г. Анпилогова из села Шахово с делом № 3736.",
  },
  {
    sourceId: "GAKO-F68-O2-D3852-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-2",
    opis: "2",
    delo: "3852",
    dates: "14 октября 1887 — 20 марта 1890",
    pages: "990 листов",
    title: "О переселении 13 человек Щигровского уезда в Уфимскую губернию",
    literal: "Дело о переселении крестьян д. Защитная, д. Озерова, с. Уколово и с. Шестопалово Щигровского у. (13 чел.) в Уфимскую губ.",
    people: ["P0518"],
    names: ["Ф. П. Анпилогов"],
    from: "shchigry-uezd",
    to: "ufa-governorate",
    match: "Именной указатель прямо связывает Ф. П. Анпилогова из села Уколово с делом № 3852.",
  },
  {
    sourceId: "GAKO-F68-O2-D4537-ANPILOV-RESETTLEMENT",
    inventory: "o2-4",
    opis: "2",
    delo: "4537",
    dates: "15 января 1888 — 19 февраля 1891",
    pages: "695 листов; семейные и имущественные списки — лл. 15–74; список разрешённых семей — л. 94",
    title: "О переселении 86 семей Грайворонского уезда в Томскую губернию",
    literal: "Дело по прошениям крестьян сл. Перцовка, д. Грязная, с. Дорогощ, д. Ивянка, д. Перовка, с. Пороз, с. Почаево, с. Смородино, с. Становое (Касиново) Грайворонского у. о переселении в Томскую губ. Семейные списки и сведения об имуществе — лл. 15–74; список 86 семей — л. 94.",
    people: ["P0522"],
    names: ["Г. Ф. Анпилов"],
    from: "graivoron-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель относит Г. Ф. Анпилова из села Пороз к делам № 4537 и 5474.",
  },
  {
    sourceId: "GAKO-F68-O2-D4543-ANPILOGOV-RESETTLEMENT",
    inventory: "o2-4",
    opis: "2",
    delo: "4543",
    dates: "24 августа 1888 — 31 августа 1892",
    pages: "912 листов; семейные списки — лл. 2–5, 50–132, 149–150; список разрешённых семей — лл. 142–144",
    title: "О переселении 176 семей нескольких уездов, включая Фатежский, в Томскую губернию",
    literal: "Дело по прошениям крестьян с-ца Кусакова Белица, д. Матвеевка Дмитриевского у.; с-ца Афросимовка и д. Ивановка Суджанского у.; Нижнереутской вол. Фатежского у. о переселении в Томскую губ. Список 176 семей из 28 населённых пунктов — лл. 142–144.",
    people: ["P0511", "P0512", "P0517"],
    names: ["А. Т. Анпилогов", "А. Ф. Анпилогов", "П. Б. Анпилогов"],
    from: "fatezh-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель относит трёх Анпилоговых из села Троицкое, что на Сучке, к делу № 4543.",
  },
  {
    sourceId: "GAKO-F68-O2-D5474-ANPILOV-RESETTLEMENT",
    inventory: "o2-5",
    opis: "2",
    delo: "5474",
    dates: "22 мая 1890 — 26 сентября 1891",
    pages: "387 листов; семейные и имущественные списки — лл. 5–75",
    title: "О переселении 137 семей Грайворонского уезда в Томскую губернию",
    literal: "Дело о переселении крестьян с. Дорогощ, сл-ки Николаевка, с. Пороз, с. Почаево, д. Санкова, с. Смородино Грайворонского у. (137 семей) в Томскую губ. Семейные списки и сведения об их имуществе — лл. 5–75.",
    people: ["P0522", "P0523", "P0524"],
    names: ["Г. Ф. Анпилов", "М. П. Анпилов", "П. Б. Анпилов"],
    from: "graivoron-uezd",
    to: "tomsk-governorate",
    match: "Именной указатель относит трёх Анпиловых из села Пороз к делу № 5474.",
  },
  {
    sourceId: "GAKO-F68-O1-D7022-ANPILOGOV-RESETTLEMENT",
    inventory: "o1-5",
    opis: "1",
    delo: "7022",
    dates: "7 февраля 1877 — 21 июня 1882",
    pages: "691 лист",
    title: "Об увольнении крестьян-собственников из обществ",
    literal: "Дело об увольнении из обществ крестьян-собственников без взноса половины капитального долга.",
    people: ["P0516"],
    names: ["М. В. Анпилогов"],
    from: "fatezh-uezd",
    to: "orenburg-governorate",
    match: "Именной указатель связывает М. В. Анпилогова из села Никольское Фатежского уезда с делами № 7022 и 7742; сам заголовок № 7022 назначения не раскрывает.",
  },
  {
    sourceId: "GAKO-F68-O1-D7742-ANPILOGOV-RESETTLEMENT",
    inventory: "o1-6",
    opis: "1",
    delo: "7742",
    dates: "9 января 1878 — 7 мая 1883",
    pages: "888 листов",
    title: "О перечислении крестьян Курской губернии в Оренбургскую и Ставропольскую губернии",
    literal: "Дело о перечислении крестьян из разных уездов Курской губ. в Оренбургскую и Ставропольскую губернии.",
    people: ["P0516"],
    names: ["М. В. Анпилогов"],
    from: "fatezh-uezd",
    to: "orenburg-governorate",
    match: "Именной указатель уточняет для М. В. Анпилогова из села Никольское направление именно в Оренбургскую губернию и называет дело № 7742.",
  },
];

const personFiles = fs.readdirSync(peopleDir).filter((name) => name.endsWith(".json"));
const personPathById = new Map();
for (const file of personFiles) {
  const fullPath = path.join(peopleDir, file);
  const person = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  if (person.personId) personPathById.set(person.personId, fullPath);
}

for (const item of cases) {
  const mentions = item.people.map((personId, index) => ({
    mentionId: `${item.sourceId}-M${index + 1}`,
    role: "indexed-resettler-in-case",
    personId,
    displayName: item.names[index],
    modernName: item.names[index],
  }));

  writeJson(path.join(sourcesDir, `${item.sourceId}.json`), {
    schemaVersion: 1,
    sourceId: item.sourceId,
    provider: "ОКУ «Государственный архив Курской области»",
    recordType: "official-archive-inventory-entry-linked-to-name-index",
    collection: {
      title: item.title,
      archiveCitation: `ГАКО, ф. 68, оп. ${item.opis}, д. ${item.delo}; ${item.dates}; ${item.pages}.`,
    },
    links: {
      officialInventoryDocument: inventoryUrls[item.inventory],
      officialNameIndexScan: nameIndexUrl,
      archiveFindingAids: "https://archive.rkursk.ru/gako/dorev_opisi",
    },
    event: {
      type: "resettlement-case",
      date: { display: item.dates },
      place: { placeId: item.to },
    },
    transcription: {
      status: "verified-from-official-electronic-inventory-and-official-name-index-scan",
      literal: item.literal,
      modernInterpretation: `${item.match} Фамилия подтверждена именным указателем, а состав и даты дела — официальной электронной описью; страницы самого дела ещё не просмотрены.`,
    },
    migrationObservations: item.people.map((personId, index) => ({
      personId,
      personName: item.names[index],
      from: { placeId: item.from },
      to: { placeId: item.to },
      basis: `${item.match} ${item.literal}`,
      confidence: item.delo === "2613" ? "medium" : "high",
    })),
    isRecord: true,
    cardKind: "named-resettlement-archive-case",
    primaryPersonId: item.people[0],
    mentions,
    review: {
      status: "exact-case-lists-needed",
      unresolved: [`Получить сканы ГАКО, ф. 68, оп. ${item.opis}, д. ${item.delo}; приоритетные листы указаны в архивной цитате.`],
    },
  });

  for (let index = 0; index < item.people.length; index += 1) {
    const personId = item.people[index];
    const personPath = personPathById.get(personId);
    if (!personPath) throw new Error(`Не найден профиль ${personId}`);
    const person = JSON.parse(fs.readFileSync(personPath, "utf8"));
    person.sourceIds = [...new Set([...(person.sourceIds ?? []), item.sourceId])];
    person.notes = [...new Set([...(person.notes ?? []), `${item.match} Производство дела: ${item.dates}; ${item.pages}.`])];
    writeJson(personPath, person);
  }
}

const places = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const minusinsk = {
  placeId: "minusinsk-okrug",
  name: "Минусинский округ",
  label: "Минусинский округ, Енисейская губерния",
  kind: "district",
  aliases: ["Минусинский округ", "Минусинский уезд"],
  geo: {
    latitude: 53.71028,
    longitude: 91.68739,
    precision: "district",
    confidence: "low",
    source: "OpenStreetMap; рабочая точка в Минусинске",
    sourceUrl: "https://www.openstreetmap.org/relation/1794623",
    note: "Дело № 1885 называет округ назначения, но не конкретное поселение; показан окружной центр.",
  },
};
const placeIndex = places.places.findIndex(({ placeId }) => placeId === minusinsk.placeId);
if (placeIndex >= 0) places.places[placeIndex] = { ...places.places[placeIndex], ...minusinsk };
else places.places.push(minusinsk);
writeJson(placesPath, places);

console.log(`Импортировано: ${cases.length} точных архивных дел; обновлено ${new Set(cases.flatMap(({ people }) => people)).size} профилей; добавлено 1 место.`);
