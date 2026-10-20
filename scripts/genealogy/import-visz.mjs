// Imports the surname line from «Возвращённые имена» of the National Library
// of Russia (visz.nlr.ru): the Blockade books of memory («Блокада», «Реквием»,
// «Они пережили Блокаду», the list of those who died in military hospitals,
// the centre's own notes) and the repression section.
//
// Input: a harvest of the site's search, kept out of git in tmp/visz/. The
// search form (`POST /blockade`, `POST /person`) was sent for every surname
// form with «искать по началу фамилии», then for the main forms in the
// «дополнительная информация» field; every result page and every
// «Подробнее…» card were saved. `harvest.json` lists one item per card:
// `{ section, id, q, brief, surname, breadcrumb, card, url }`.
//
// One Record per person. The site is small for the line (a few dozen cards),
// so every card was reviewed: the decisions below link a card to an existing
// profile only when name, patronymic and birth date (or year and place)
// agree, and add only a link to an existing Record when the same publication
// is already in the project.
//
// Usage: node scripts/genealogy/import-visz.mjs <harvest.json> [--dry-run] [--first-id=122200]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const harvestPath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!harvestPath) throw new Error("Укажите путь к выгрузке visz.nlr.ru");

const RETRIEVED_ON = "2026-10-21";
const SEARCH_ID = `visz-${RETRIEVED_ON}`;
const PROVIDER = "Возвращённые имена";
const sourcesDir = path.join(root, "data/genealogy/sources/visz");
const peopleDir = path.join(root, "data/genealogy/people");
const searchesDir = path.join(root, "data/genealogy/searches");
const placesIndex = JSON.parse(readFileSync(path.join(root, "data/genealogy/places/index.json"), "utf8"));
const placeIds = new Set(placesIndex.places.map((place) => place.placeId));
const harvest = JSON.parse(readFileSync(harvestPath, "utf8"));

const REPOSITORY = {
  name: "«Возвращённые имена. Книги памяти России» — Российская национальная библиотека",
  location: "Онлайн-база Центра «Возвращённые имена» РНБ, Санкт-Петербург",
  url: "https://visz.nlr.ru/",
};

const norm = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru").replace(/ё/g, "е").trim();

// ---------------------------------------------------------------------------
// Surname scope: the forms of the line, as in the gwar import. «Анфилохиев»
// (from the name Амфилохий) and «Панфилов» are other surnames.

const LINE_SURNAME = /^(?:ампилог|анпилог|антилог|ампелог|анпелог|онпилог|анфилог|онфилог|амфилог|анфилоф|онфилоф|анфилат|ампилов|ампелов|анпилов|анфилов|амфилов)/;
const inScope = (surname) => LINE_SURNAME.test(norm(surname));

// ---------------------------------------------------------------------------
// Reviewed decisions (one entry per card that is not a plain new person).

// Cards that describe the same person: the first card leads.
const MERGES = [
  {
    keys: ["blockade/928054", "blockade/928112"],
    basis: "Обе строки тома 2 «Блокады» называют мальчика Евгения 1940 года рождения с улицы Рубинштейна (детский дом; д. 13, ясли № 4), умершего в 1942 году (во второй строке — в мае). «Антилогов» — искажение фамилии «Анпилогов», обычное для индексов (так же записан, например, Роман Кузьмич в Книге памяти Курской области); отчество названо только в первой строке.",
  },
];

// Cards whose publication is already in the project as a Record: only a link
// is added to that Record.
const LINK_ONLY = {
  "person/4581": {
    sourceIds: ["PUB-MEMORIAL-GRIGORY-ANDREEVICH-ANPILOGOV-1883", "PUB-OPENLIST-GRIGORII-ANDREEVICH-ANPILOGOV-1883"],
    personId: "P99087",
    label: "«Возвращённые имена» РНБ: «Ленинградский мартиролог», т. 2",
    basis: "Та же справка «Ленинградского мартиролога» (т. 2), что в «Открытом списке» и базе «Мемориала»: смазчик фабрики треста «Апатит» из Кировска, уроженец Верхнего Мамона, расстрелян 4 октября 1937 года.",
  },
  "person/78559": {
    sourceIds: ["PUB-MEMORIAL-GRIGORY-ANDREEVICH-ANPILOGOV-1883", "PUB-OPENLIST-GRIGORII-ANDREEVICH-ANPILOGOV-1883"],
    personId: "P99087",
    label: "«Возвращённые имена» РНБ: Книга памяти Кольского полуострова",
    basis: "Справка мурманской Книги памяти о том же Григории Андреевиче (Кировск, ул. Нагорная, д. 24, кв. 15; расстрелян 4 октября 1937 года; реабилитирован 29 октября 1957 года).",
  },
  "person/207762": {
    sourceIds: ["PUB-OPENLIST-ANDREI-MATVEEVICH-ANPILOGOV-1914"],
    personId: "P113944",
    label: "«Возвращённые имена» РНБ: Книга памяти Тверской области («Не предать забвению»)",
    basis: "Та же справка Книги памяти Тверской (Калининской) области, что в «Открытом списке»: сержант 6-го стрелкового полка 109-й дивизии 42-й армии, осуждён 15 сентября 1942 года, умер 3 марта 1943 года.",
  },
  "blockade/1974584": {
    sourceIds: ["PN-PERSON-120580893"],
    personId: "P119496",
    label: "«Возвращённые имена» РНБ: «Умерли в военных госпиталях»",
    basis: "Список умерших в госпиталях повторяет документ госпиталя ЦАМО (ф. 58, оп. А-83627, д. 157), уже перенесённый из «Памяти народа»: ЭГ № 56, умер от болезни 25 февраля 1942 года, Пискарёвское кладбище.",
  },
  "blockade/1974585": {
    sourceIds: ["PN-PERSON-106380253"],
    personId: "P119497",
    label: "«Возвращённые имена» РНБ: «Умерли в военных госпиталях»",
    basis: "Список умерших в госпиталях повторяет документ госпиталя ЦАМО (ф. 58, оп. А-71693, д. 2429), уже перенесённый из «Памяти народа»: 521-й медсанбат, умер от ран 28 января 1942 года, Колпино, братская могила № 4.",
  },
};

// New Records linked to an existing profile.
const PROFILE_LINKS = {
  "blockade/1595267": {
    personId: "P101571",
    basis: "Совпадают имя, отчество, фамилия и полная дата рождения: 9 ноября 1906 года — дата рождения Александры, дочери оренбургского мещанина Романа Гордеевича Анпилогова, по метрической книге (YA-OGAOO-173-16-1640-157-ALEKSANDRA). Метрика даёт дату по старому стилю; книга повторяет её без пересчёта (по новому стилю было бы 22 ноября), что обычно для дат рождения до 1918 года.",
  },
  "blockade/1595268": {
    personId: "P101598",
    basis: "Совпадают имя, отчество и фамилия; книга даёт 14 марта 1907 года, метрическая запись о рождении Антонины, дочери оренбургского мещанина Василия Михайловича Анпилогова (Бузулук), — 1 марта 1907 года по старому стилю, то есть ровно 14 марта по новому.",
  },
  "blockade/928055": {
    personId: "P118744",
    basis: "Совпадают имя, отчество, фамилия и 1906 год рождения; профиль «Памяти народа» — красноармеец, призванный Колпинским военкоматом в январе 1942 года и пропавший без вести в 1942 году, а Книга памяти «Блокада» называет жителя Колпино, умершего в 1942 году.",
  },
  "blockade/1591890": {
    personId: "P114911",
    basis: "Совпадают имя, отчество, фамилия и полная дата рождения 11 декабря 1924 года (учётно-послужная картотека офицеров в «Памяти народа»).",
  },
  "blockade/1591894": {
    personId: "P115699",
    basis: "Совпадают имя, отчество, фамилия и полная дата рождения 2 сентября 1923 года; военкоматский документ «Памяти народа» — Петроградский военкомат Ленинграда, в книге — Петроградский район.",
  },
  "blockade/1591891": {
    personId: "P115693",
    basis: "Совпадают имя, отчество, фамилия и 1922 год рождения; военкоматский документ «Памяти народа» (младший лейтенант Ленинградского фронта) хранится в отделе по Фрунзенскому району Петербурга, в книге — Фрунзенский район.",
  },
};

// Possible identity with existing profiles, not proven.
const LEADS = {
  "blockade/928055": {
    personIds: ["P118743", "P119299"],
    summary: "Другие карточки «Памяти народа» на Романа Кузьмича Анпилогова (Колпинский военкомат) и Антилогова (1906, Курская обл.), вероятно, о том же человеке.",
  },
  "blockade/928054": {
    personIds: ["P118744"],
    summary: "Отчество Романович и год смерти совпадают с Романом Кузьмичом Анпилоговым из Колпино (1906–1942); отцовство не доказано.",
  },
  "blockade/928056": {
    personIds: ["P118744"],
    summary: "Жительница Колпино 1905 года рождения, умершая в 1942 году, как и Роман Кузьмич Анпилогов (1906, Колпино); родство не установлено.",
  },
  "blockade/1595264": {
    personIds: ["P118042"],
    summary: "Отчество Илларионович; Илларион Романович Анпилогов (1903, Чкалов — Оренбург) — инженер-лейтенант по «Памяти народа». Родство не доказано.",
  },
  "blockade/1595265": {
    personIds: ["P101571", "P8111"],
    summary: "Иван Романович родился 9 февраля 1905 года; в Ленинграде блокаду пережили и Александра Романовна (P101571, род. 1906, дочь оренбургского мещанина Романа Гордеевича Анпилогова P8111). Братство не доказано: в оренбургских метриках Иван пока не найден.",
  },
  "blockade/930889": {
    personIds: ["P119491"],
    summary: "Борис Владимирович Анфилов 1919 года рождения призван Ленинским военкоматом Ленинграда 1 июля 1941 года («Память народа»); в книге — житель пр. Красных Командиров (Измайловского), умерший в декабре 1942 года. Тождество не доказано.",
  },
  "person/1611576": {
    personIds: ["P118146"],
    summary: "Кузьма Васильевич Анпилогов 1903 года рождения, призванный Беломорским военкоматом Карелии в 1942 году («Память народа»): трудпосёлок Тунгуда находился в Беломорском районе. Место рождения расходится (Курская обл. в «Памяти народа», хутор Вязовка на Дону здесь).",
  },
};

const OUT_OF_SCOPE = {
  "blockade/1596752": "Анфилохиева — фамилия от имени Амфилохий, не форма фамильного ряда.",
};

// ---------------------------------------------------------------------------
// Repression cards: the text is a free narrative, so the facts were read by
// hand from the card.

const REPRESSION_FACTS = {
  "person/1611576": {
    firstName: "Кузьма", nameWritten: "Казма", patronymic: "Васильевич", surname: "Анпилогов", sex: "male",
    birth: { year: 1903, display: "1903 год" },
    places: [
      { relation: "birth", asWritten: "хутор Вязовка, Гундоровский район Северо-Кавказского края (ныне – Каменский район, Ростовская область РФ)", normalized: "хутор Вязовка, Каменский район, Ростовская область", placeId: "vyazovka-kamensk-rostov", confidence: "high" },
      { relation: "residence", asWritten: "житель хутора Вязовка, Гундоровского района Северо-Кавказского края", normalized: "хутор Вязовка, Каменский район, Ростовская область", placeId: "vyazovka-kamensk-rostov", confidence: "high" },
      { relation: "exile-destination", asWritten: "трудпоселок «Тунгуда-2», затем «Тунгуда-1» 5-го (Тунгудского) отделения БелБалтКомбината НКВД", normalized: "трудпосёлок Тунгуда, Беломорский район, Карелия", placeId: "tunguda-karelia", confidence: "high" },
    ],
    occupation: { asWritten: "из крестьян, крестьянин-кулак, хлебороб, слесарь-монтажник", normalized: "крестьянин, слесарь-монтажник" },
    event: { type: "exile", date: { display: "20 ноября 1933 года", iso: "1933-11-20" }, place: { asWritten: "Гундоровский РИК Ростовской области (решение райтройки)", normalized: "хутор Вязовка, Каменский район, Ростовская область", placeId: "vyazovka-kamensk-rostov" } },
    role: "exiled-household-head",
    summary: "Глава раскулаченной семьи с хутора Вязовка на Дону; выслан по решению райтройки 20 ноября 1933 года, с 10 декабря 1933 года — в трудпосёлке Тунгуда (Карелия).",
    interpretation: "Кузьма (в справке «Казма») Васильевич Анпилогов, 1903 года рождения, уроженец и житель хутора Вязовка Гундоровского района Северо-Кавказского края (ныне Каменский район Ростовской области), грамотный, из крестьян, «крестьянин-кулак», хлебороб, слесарь-монтажник. Семья Анпилоговых выслана на трудпоселение по решению райтройки Гундоровского РИКа от 20 ноября 1933 года; 10 декабря 1933 года прибыла в Карелию, во временный трудпосёлок «Тунгуда-2» 5-го (Тунгудского) отделения БелБалтКомбината НКВД, позднее закреплена за посёлком «Тунгуда-1». Восстановлен в избирательных правах 13 февраля 1937 года; с 1 января 1939 года повторно взят на списочный состав трудпосёлка Тунгуда.",
    family: "В той же справке — брат Борис Васильевич (1916, умер в 1937 году) и сын Борис Кузьмич (1940, эвакуирован в 1941 году в Архангельскую область).",
  },
  "person/1611577": {
    firstName: "Борис", patronymic: "Васильевич", surname: "Анпилогов", sex: "male",
    birth: { year: 1916, display: "1916 год" },
    death: { display: "1937 год", year: 1937 },
    places: [
      { relation: "exile-destination", asWritten: "трудпоселок Тунгуда 5-го (Тунгудского) отделения БелБалтКомбината НКВД", normalized: "трудпосёлок Тунгуда, Беломорский район, Карелия", placeId: "tunguda-karelia", confidence: "medium" },
    ],
    event: { type: "exile", date: { display: "20 ноября 1933 года", iso: "1933-11-20" }, place: { asWritten: "Гундоровский РИК Ростовской области (решение райтройки)", normalized: "хутор Вязовка, Каменский район, Ростовская область", placeId: "vyazovka-kamensk-rostov" } },
    role: "exiled-family-member",
    summary: "Брат главы семьи Кузьмы Васильевича; выслан с семьёй с Дона в трудпосёлок Тунгуда (Карелия), умер в 1937 году.",
    interpretation: "Борис Васильевич Анпилогов, 1916 года рождения, брат главы семьи Кузьмы (Казмы) Васильевича Анпилогова, выслан вместе с семьёй с хутора Вязовка Гундоровского района по решению райтройки от 20 ноября 1933 года в трудпосёлок Тунгуда (Карелия). Восстановлен в избирательных правах записью 5-го отделения от 13 февраля 1937 года; умер в 1937 году.",
    family: "Брат Кузьмы (Казмы) Васильевича Анпилогова (1903), главы высланной семьи.",
  },
  "person/1611578": {
    firstName: "Борис", patronymic: "Кузьмич", nameWritten: "Борис Кузмич", surname: "Анпилогов", sex: "male",
    birth: { year: 1940, display: "1940 год" },
    places: [
      { relation: "residence", asWritten: "в составе семьи, закреплённой за трудпоселком «Тунгуда-1»", normalized: "трудпосёлок Тунгуда, Беломорский район, Карелия", placeId: "tunguda-karelia", confidence: "medium", note: "Место рождения в справке не названо; семья с 1933 года жила в трудпосёлке Тунгуда." },
    ],
    event: { type: "evacuation", date: { display: "1941 год", yearFrom: 1941, yearTo: 1941 }, place: { asWritten: "Архангельская область", normalized: "Архангельская область", placeId: "arkhangelsk-oblast" } },
    role: "evacuated-child",
    summary: "Сын спецпоселенца Кузьмы Васильевича, родился в 1940 году; в 1941 году эвакуирован в Архангельскую область.",
    interpretation: "Борис Кузьмич (в справке «Кузмич») Анпилогов, 1940 года рождения, сын главы высланной семьи Кузьмы (Казмы) Васильевича Анпилогова, жившей в трудпосёлке Тунгуда (Карелия). В 1941 году эвакуирован в Архангельскую область.",
    family: "Сын Кузьмы (Казмы) Васильевича Анпилогова (1903), главы высланной семьи.",
  },
  "person/1611322": {
    firstName: "Евгений", patronymic: "Тихонович", surname: "Ампилогов", sex: "male",
    birth: { year: 1911, display: "1911 год" },
    places: [
      { relation: "birth", asWritten: "уроженец города Киева, Киевской области УССР", normalized: "Киев", placeId: "kyiv", confidence: "high" },
      { relation: "exile-destination", asWritten: "трудпоселки «при 18 шлюзе» ББКанала, «5 километр», «Тунгуда-2», «Рамое» 5-го (Тунгудского) отделения БелБалтКомбината НКВД", normalized: "трудпосёлки Беломорско-Балтийского комбината, Тунгудское отделение, Карелия", placeId: "tunguda-karelia", confidence: "medium", note: "Тег поставлен в Тунгуде — центре 5-го отделения, к которому относился трудпосёлок Рамое." },
    ],
    occupation: { asWritten: "из рабочих, ДЭ (деклассированный элемент), чернорабочий", normalized: "чернорабочий" },
    event: { type: "exile", date: { display: "28 января 1934 года", iso: "1934-01-28" }, place: { asWritten: "тройка при ПП ОГПУ по Башкирии", normalized: "Башкирия (место решения о высылке)" } },
    role: "special-settler",
    summary: "Уроженец Киева, без определённого места жительства; выслан тройкой ПП ОГПУ по Башкирии 28 января 1934 года на трудпоселение в Карелию (Беломорканал, Тунгудское отделение).",
    interpretation: "Евгений Тихонович Ампилогов, русский, 1911 года рождения, уроженец Киева, на момент высылки без определённого места жительства, малограмотный, из рабочих, «деклассированный элемент», чернорабочий. Выслан на трудпоселение по решению тройки при ПП ОГПУ по Башкирии от 28 января 1934 года. 3 марта 1934 года прибыл в Карелию, во временный трудпосёлок «при 18 шлюзе» Беломорско-Балтийского канала (6-е, Сорокское, отделение БелБалтКомбината НКВД), 10 апреля 1934 года переведён в трудпосёлок «5 километр» 2-го отделения, 18 июня 1934 года — в «Тунгуда-2», 18 августа 1934 года закреплён за трудпосёлком «Рамое» 5-го (Тунгудского) отделения.",
  },
};

// ---------------------------------------------------------------------------
// Blockade cards

const MONTHS_NOM = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const MONTHS_PREP = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"];
// «в феврале 1942 года», «в 1942 году», «16 января 1944 года».
function datePhrase(date) {
  if (!date) return "";
  if (/^\d{4}-\d{2}$/.test(date.iso ?? "")) return `в ${MONTHS_PREP[Number(date.iso.slice(5)) - 1]} ${date.year} года`;
  if (!date.iso) return `в ${date.year} году`;
  return date.display;
}
const lcFirst = (value) => value.charAt(0).toLocaleLowerCase("ru") + value.slice(1);
const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function parseVisDate(value) {
  const text = norm(value);
  let match = text.match(/^(\d{1,2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match.map(Number);
    return { display: `${day} ${MONTHS_GEN[month - 1]} ${year} года`, iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, year };
  }
  match = text.match(/^([а-я]+) (\d{4})$/);
  if (match && MONTHS_NOM.includes(match[1])) {
    const month = MONTHS_NOM.indexOf(match[1]) + 1;
    return { display: `${match[1]} ${match[2]} года`, iso: `${match[2]}-${String(month).padStart(2, "0")}`, year: Number(match[2]) };
  }
  match = text.match(/^(\d{4})$/);
  if (match) return { display: `${match[1]} год`, year: Number(match[1]) };
  return null;
}

const BRIEF_LABELS = ["Место проживания", "Дата смерти", "Место захоронения", "Место рождения", "Место призыва", "Место службы", "Звание", "Госпиталь", "Первичное место захоронения", "Источник сведений"];
function briefFields(brief) {
  const fields = {};
  const pattern = new RegExp(`(${BRIEF_LABELS.join("|")}):`, "g");
  const marks = [...brief.matchAll(pattern)];
  marks.forEach((mark, index) => {
    const end = index + 1 < marks.length ? marks[index + 1].index : brief.length;
    const value = brief.slice(mark.index + mark[0].length, end).trim()
      .replace(/\s*\((?:Блокада|Они пережили Блокаду|Реквием)[^)]*\)\s*$/, "")
      .replace(/\s*Ум\. от [а-я]+ \d{2}\.\d{2}\.\d{4}\.?$/, "");
    fields[mark[1]] = (/кладб\.$/.test(value) ? value : value.replace(/\.$/, "")).trim();
  });
  return fields;
}

// «Анпилогов Евгений Романович, 1940 г. р.», «…, род. 14.04.1936», «Анпилова Людмила.»
function briefName(item) {
  const head = item.brief.split(/,|\. Место|\. Дата|\. \(/)[0].trim().replace(/\.$/, "");
  const words = head.split(/\s+/);
  return { surname: words[0], firstName: words[1] ?? "", patronymic: words.slice(2).join(" ") };
}

function briefBirth(brief) {
  let match = brief.match(/род\. (\d{2}\.\d{2}\.\d{4})/);
  if (match) return parseVisDate(match[1]);
  match = brief.match(/род\. (\d{4})/) ?? brief.match(/(\d{4}) г\. ?р\./);
  return match ? parseVisDate(match[1]) : null;
}

function bookOf(item) {
  const volume = item.brief.match(/\((Блокада|Они пережили Блокаду|Реквием), т\. (\d+)\)/);
  if (volume) return { kind: volume[1], volume: volume[2] };
  if (/Госпиталь:/.test(item.brief)) return { kind: "Госпитали" };
  return { kind: item.section === "person" ? "Репрессии" : "Справки" };
}

const BOOK_TITLES = {
  Блокада: "Книга памяти «Блокада, 1941–1944. Ленинград»",
  Реквием: "Книга памяти «Реквием» (блокадный Ленинград)",
  "Они пережили Блокаду": "Книга памяти «Они пережили Блокаду»",
  Госпитали: "Список умерших в военных госпиталях Ленинграда и пригородов (по сведениям Министерства обороны РФ)",
};

// Leningrad addresses of the books name only the street; Колпино and other
// suburbs are named.
function residencePlace(text) {
  if (/колпино/i.test(text)) return { placeId: "kolpino", normalized: "Колпино" };
  if (/нижний тагил/i.test(text)) return null;
  return { placeId: "leningrad-city", normalized: "Ленинград" };
}
function burialPlace(text) {
  if (!text || /неизвестно/i.test(text)) return null;
  if (/колпино/i.test(text)) return { placeId: "kolpino", normalized: "Колпино" };
  // «Ленинградская обл., Чудовский р-н…» is outside the city.
  if (/обл\.|область|р-н/i.test(text)) return null;
  if (/пискарев|богословск|серафимовск|смоленск|большеохтинск|волков|г\. ленинград/i.test(text)) return { placeId: "leningrad-city", normalized: "Ленинград" };
  return null;
}

// ---------------------------------------------------------------------------
// Names

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
const slug = (value) => norm(value).split("").map((letter) => TRANSLIT[letter] ?? letter).join("")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const MODERN_YO = new Map(Object.entries({
  федорович: "Фёдорович", федоровна: "Фёдоровна", семенович: "Семёнович", семеновна: "Семёновна", федор: "Фёдор", петр: "Пётр", семен: "Семён",
}));
const modern = (word) => MODERN_YO.get(norm(word)) ?? word;
const sexOf = (firstName, patronymic, surname) => {
  if (/(вна|чна)$/.test(norm(patronymic))) return "female";
  if (/(вич|ич)$/.test(norm(patronymic))) return "male";
  return /(ова|ева|ина)$/.test(norm(surname)) ? "female" : "male";
};

// ---------------------------------------------------------------------------
// Existing profiles and records

const existing = new Map();
let alreadyImported = false;
for (const file of readdirSync(peopleDir).filter((name) => name.endsWith(".json"))) {
  const person = JSON.parse(readFileSync(path.join(peopleDir, file), "utf8"));
  existing.set(person.personId, { person, file });
  if (person.profileOrigin?.method === "visz-import") alreadyImported = true;
}
if (alreadyImported && !dryRun) throw new Error("Профили visz.nlr.ru уже импортированы; откатите их перед повторным запуском");
const sourceFileOf = (sourceId) => {
  for (const dir of ["publications", "pamyat-naroda", "gwar"]) {
    const file = path.join(root, "data/genealogy/sources", dir, `${sourceId}.json`);
    if (existsSync(file)) return file;
  }
  throw new Error(`Нет Record ${sourceId}`);
};

// ---------------------------------------------------------------------------
// Build

const items = new Map(harvest.items.map((item) => [`${item.section}/${item.id}`, item]));
const mergedInto = new Map(MERGES.flatMap((merge) => merge.keys.slice(1).map((key) => [key, merge])));
const searchRows = [];
const records = [];
const newPeople = [];
const updatedPeople = new Map();
const updatedRecords = new Map();
const firstIdArgument = process.argv.find((argument) => argument.startsWith("--first-id="));
let nextPersonNumber = firstIdArgument ? Number(firstIdArgument.split("=")[1]) : 122200;
const firstPersonNumber = nextPersonNumber;

const cardSourceLine = (item) => {
  const line = item.card.split(/\n+/).map((part) => part.trim()).find((part) => /^(Источник сведений|Из материалов|По сведениям)/.test(part));
  return line ?? null;
};
// The card of the repression section carries the whole family note of the
// book («Семья Анпилоговых… (Справка А-0207.)»).
const familyNote = (item) => {
  const match = item.card.match(/(Семья [^\n]*?\(Справка [^)]*\)\.?\)?)/);
  return match ? match[1].trim() : null;
};

const ordered = [...items.values()].sort((left, right) => left.section.localeCompare(right.section) || Number(left.id) - Number(right.id));
for (const item of ordered) {
  const key = `${item.section}/${item.id}`;
  const base = { visz: key, url: item.url, name: item.surname ? item.brief.split(/[,.]/)[0] : item.brief.slice(0, 60), queries: item.q, brief: item.brief };
  const surname = briefName(item).surname;
  if (!inScope(surname) || OUT_OF_SCOPE[key]) {
    const note = OUT_OF_SCOPE[key] ?? (item.q.every((query) => query.startsWith("memo_"))
      ? "Найден поиском по дополнительной информации: форма ряда стоит в имени, отчестве или названии места, фамилия другая."
      : null);
    searchRows.push({ ...base, decision: "out-of-scope-other-surname", ...(note ? { note } : {}) });
    continue;
  }
  if (mergedInto.has(key)) continue;
  if (LINK_ONLY[key]) {
    const link = LINK_ONLY[key];
    for (const sourceId of link.sourceIds) {
      const file = sourceFileOf(sourceId);
      const record = updatedRecords.get(sourceId)?.record ?? JSON.parse(readFileSync(file, "utf8"));
      record.links = { ...(record.links ?? {}), [`visz-${item.section}-${item.id}`]: { label: link.label, url: item.url } };
      updatedRecords.set(sourceId, { record, file });
    }
    searchRows.push({ ...base, decision: "link-added-to-existing-record", sourceIds: link.sourceIds, personId: link.personId, basis: link.basis });
    continue;
  }

  const group = [item, ...(MERGES.find((merge) => merge.keys[0] === key)?.keys.slice(1).map((other) => items.get(other)) ?? [])];
  const merge = MERGES.find((candidate) => candidate.keys[0] === key);
  const book = bookOf(item);
  const isRepression = item.section === "person";
  const facts = isRepression ? REPRESSION_FACTS[key] : null;
  if (isRepression && !facts) throw new Error(`Справка ${key} не разобрана вручную`);

  const named = briefName(item);
  const firstName = facts?.firstName ?? modern(named.firstName);
  const patronymic = facts?.patronymic ?? modern(group.map(briefName).map((name) => name.patronymic).find(Boolean) ?? "");
  const surnameForm = facts?.surname ?? surname;
  const sex = facts?.sex ?? sexOf(firstName, patronymic, surnameForm);
  const displayName = [firstName, patronymic, surnameForm].filter(Boolean).join(" ");
  const nameAsIndexed = [named.surname, named.firstName, named.patronymic].filter(Boolean).join(" ");
  const alternateNames = [...new Set(group.slice(1).map((other) => {
    const name = briefName(other);
    return [name.surname, name.firstName, name.patronymic].filter(Boolean).join(" ");
  }).concat(facts?.nameWritten ? [`${facts.nameWritten} ${facts.nameWritten.includes(" ") ? "" : patronymic} ${surnameForm}`.replace(/\s+/g, " ").trim()] : []))]
    .filter((name) => norm(name) !== norm(displayName) && norm(name) !== norm(nameAsIndexed));

  const fields = isRepression ? {} : briefFields(item.brief);
  const birth = facts?.birth ?? briefBirth(item.brief);
  const sourceKind = isRepression ? "REP" : book.kind === "Они пережили Блокаду" ? "SURV" : book.kind === "Госпитали" ? "HOSP" : "BLKD";
  const sourceId = `VISZ-${sourceKind}-${item.id}`;
  const link = PROFILE_LINKS[key];
  const personId = link?.personId ?? `P${nextPersonNumber++}`;

  // Event
  let event;
  let death = null;
  const mentionPlaces = [...(facts?.places ?? [])];
  const recordFields = {};
  if (isRepression) {
    event = { type: facts.event.type, date: { ...facts.event.date, calendar: "gregorian" }, place: facts.event.place };
    if (facts.death) death = facts.death;
  } else if (book.kind === "Госпитали") {
    const deathMatch = item.brief.match(/Ум\. (от [а-я]+) (\d{2}\.\d{2}\.\d{4})/);
    const date = deathMatch ? parseVisDate(deathMatch[2]) : null;
    death = { ...(date ?? {}), cause: deathMatch ? `умер ${deathMatch[1]}` : null };
    const burial = fields["Первичное место захоронения"];
    const burialLink = burialPlace(burial);
    event = {
      type: "war-death",
      date: date ? { display: date.display, iso: date.iso, deathIso: date.iso, calendar: "gregorian" } : { display: "годы Великой Отечественной войны", yearFrom: 1941, yearTo: 1945 },
      ...(burialLink ? { place: { asWritten: burial, normalized: burialLink.normalized, placeId: burialLink.placeId } } : {}),
    };
    if (fields["Место рождения"]) {
      const birthLink = /москва/i.test(fields["Место рождения"]) ? "moscow" : /шурово/i.test(fields["Место рождения"]) ? "belokholunitsky-district-kirov" : null;
      mentionPlaces.push({ relation: "birth", asWritten: fields["Место рождения"], normalized: fields["Место рождения"], ...(birthLink ? { placeId: birthLink } : {}), confidence: birthLink === "moscow" ? "high" : "medium", ...(birthLink === "belokholunitsky-district-kirov" ? { note: "Деревня Шурово не локализована; тег указывает на Белохолуницкий район." } : {}) });
    }
    if (fields["Место призыва"]) mentionPlaces.push({ relation: "conscription", asWritten: fields["Место призыва"], normalized: fields["Место призыва"], confidence: "high" });
    if (burial) mentionPlaces.push({ relation: "burial", asWritten: burial, normalized: burial, ...(burialLink ? { placeId: burialLink.placeId } : {}), confidence: "high" });
    Object.assign(recordFields, {
      rank: fields["Звание"], unit: fields["Место службы"], hospital: fields["Госпиталь"], conscription: fields["Место призыва"],
      deathDate: date?.display, cause: death.cause, burialPlace: burial, source: fields["Источник сведений"],
    });
  } else if (book.kind === "Они пережили Блокаду") {
    event = { type: "blockade-survivor", date: { display: "1941–1944 годы (блокада Ленинграда)", yearFrom: 1941, yearTo: 1944 }, place: { asWritten: "блокадный Ленинград (по названию Книги памяти)", normalized: "Ленинград", placeId: "leningrad-city" } };
    mentionPlaces.push({ relation: "documented-presence", asWritten: "блокадный Ленинград (по названию Книги памяти)", normalized: "Ленинград", placeId: "leningrad-city", confidence: "medium", note: "Книга называет переживших блокаду; адрес в ней — на 2003 год и в места не внесён." });
    Object.assign(recordFields, { addressInBook2003: fields["Место проживания"] });
  } else {
    const deathDate = merge ? group.map((member) => parseVisDate(briefFields(member.brief)["Дата смерти"] ?? "")).filter(Boolean).sort((a, b) => String(b.iso ?? "").length - String(a.iso ?? "").length)[0] : parseVisDate(fields["Дата смерти"] ?? "");
    death = deathDate ?? null;
    const residence = fields["Место проживания"];
    const residenceLink = residence ? residencePlace(residence) : null;
    const burial = fields["Место захоронения"];
    const burialLink = burialPlace(burial);
    event = {
      type: "death",
      date: deathDate
        ? { display: deathDate.display, ...(deathDate.iso ? { iso: deathDate.iso, deathIso: deathDate.iso } : { yearFrom: deathDate.year, yearTo: deathDate.year }), calendar: "gregorian" }
        : { display: "годы блокады Ленинграда (дата смерти в книге не указана)", yearFrom: 1941, yearTo: 1944 },
      place: { asWritten: residence ?? "блокадный Ленинград", normalized: residenceLink?.normalized ?? "Ленинград", placeId: residenceLink?.placeId ?? "leningrad-city", note: "Книга называет место жительства; где именно наступила смерть, не указано." },
    };
    if (residence) mentionPlaces.push({ relation: "residence", asWritten: residence, normalized: residenceLink ? `${residenceLink.normalized}, ${residence.replace(/^г\. Колпино,?\s*/, "") || "адрес не указан"}`.replace(/, адрес не указан$/, "") : residence, ...(residenceLink ? { placeId: residenceLink.placeId } : {}), confidence: "high" });
    if (burialLink) mentionPlaces.push({ relation: "burial", asWritten: burial, normalized: burial.replace(/кладб\.$/, "кладбище"), placeId: burialLink.placeId, confidence: "high" });
    Object.assign(recordFields, { residence, deathDate: deathDate?.display, burialPlace: burial });
  }
  if (birth) recordFields.birthDate = birth.display;
  recordFields.memoryBook = isRepression ? cardSourceLine(item)?.replace(/^Источник сведений:\s*/, "").replace(/\.$/, "") : `${BOOK_TITLES[book.kind] ?? book.kind}${book.volume ? `, т. ${book.volume}` : ""}`;
  for (const [field, value] of Object.entries(recordFields)) if (!value) delete recordFields[field];

  const literal = group.map((member, index) => {
    const lines = [`${group.length > 1 ? `[${index + 1}] ` : ""}${member.brief}`];
    const sourceLine = cardSourceLine(member);
    if (sourceLine && !member.brief.includes(sourceLine)) lines.push(sourceLine);
    const note = familyNote(member);
    if (note) lines.push(note);
    return lines.join("\n");
  }).join("\n");

  // Modern interpretation
  let interpretation;
  if (facts) interpretation = facts.interpretation;
  else if (book.kind === "Они пережили Блокаду") {
    interpretation = `${displayName}${birth ? `, ${birth.iso ? `родил${sex === "female" ? "ась" : "ся"} ${birth.display}` : `${birth.year} года рождения`}` : ""}, пережил${sex === "female" ? "а" : ""} блокаду Ленинграда: ${sex === "female" ? "она названа" : "он назван"} в Книге памяти «Они пережили Блокаду» (т. ${book.volume}). Адрес в книге — «${fields["Место проживания"]}» — дан на 2003 год, когда составлялась книга, и под фамилией, которую человек носил тогда.`;
  } else if (book.kind === "Госпитали") {
    const service = [fields["Звание"], fields["Место службы"]].filter(Boolean).join(", ");
    interpretation = [
      `${displayName}${birth ? `, ${birth.year} года рождения` : ""}${fields["Место рождения"] ? `, место рождения — ${fields["Место рождения"]}` : ""}${fields["Место призыва"] ? `, призван: ${fields["Место призыва"]}` : ""}.`,
      service ? `Звание и часть: ${service}.` : null,
      `${death?.cause ? `${death.cause[0].toLocaleUpperCase("ru")}${death.cause.slice(1)}` : "Умер"}${death?.display ? ` ${death.display}` : ""}, госпиталь: ${fields["Госпиталь"]}.`,
      fields["Первичное место захоронения"] ? `Первичное место захоронения: ${fields["Первичное место захоронения"]}.` : null,
      `Сведения Министерства обороны (${fields["Источник сведений"]}).`,
    ].filter(Boolean).join(" ");
  } else {
    interpretation = `${displayName}${birth ? `, ${birth.year} года рождения` : ""}, житель${sex === "female" ? "ница" : ""} блокадного Ленинграда${fields["Место проживания"] ? ` (адрес: ${fields["Место проживания"]})` : ""}, умер${sex === "female" ? "ла" : ""} ${death?.display ? datePhrase(death) : "в годы блокады"}. Место захоронения: ${(fields["Место захоронения"] ?? "не указано").replace(/кладб\.$/, "кладбище")}. Книга памяти «${book.kind}», т. ${book.volume}.`;
  }

  const uncertainties = [];
  if (book.kind === "Они пережили Блокаду") uncertainties.push("Книга «Они пережили Блокаду» называет людей под фамилиями, которые они носили в 2003 году: у замужних женщин это может быть фамилия мужа.");
  if (merge) uncertainties.push(`Книга дважды называет этого ребёнка: «${nameAsIndexed}» и «${alternateNames[0]}».`);
  if (/^антилог/i.test(surnameForm)) uncertainties.push("«Антилогова» — вероятно, искажение фамилии «Анпилогова»; принята форма книги.");
  if (!patronymic) uncertainties.push("Отчество в книге не указано.");

  const role = facts?.role ?? (book.kind === "Они пережили Блокаду" ? "blockade-survivor" : event.type === "war-death" ? "deceased-soldier" : "deceased");
  const mention = {
    mentionId: `${sourceId}-M1`,
    role,
    personId,
    displayName,
    modernName: displayName,
    nameAsIndexed,
    ...(alternateNames.length ? { alternateNames } : {}),
    ...(patronymic ? { patronymic } : {}),
    sex,
    ...(birth?.year ? { birthEstimate: { year: birth.year, basis: `год рождения по ${isRepression ? "справке" : "Книге памяти"} (visz.nlr.ru)` } } : {}),
    ...(facts?.occupation ? { occupation: facts.occupation } : recordFields.rank ? { occupation: { asWritten: recordFields.rank, normalized: "военнослужащий" } } : {}),
    places: mentionPlaces,
    ...(facts?.family ? { relationshipNote: facts.family } : {}),
    ...(uncertainties.length ? { uncertainties } : {}),
  };

  const lead = LEADS[key];
  const unresolved = [];
  if (book.kind === "Они пережили Блокаду") unresolved.push("Установить адрес и судьбу в годы блокады: книга даёт только адрес на 2003 год.");
  if (lead) unresolved.push(`Проверить возможное тождество или родство: ${lead.personIds.join(", ")}. ${lead.summary}`);
  if (book.kind === "Блокада" || book.kind === "Реквием") unresolved.push("Сверить запись с печатным томом Книги памяти и, по возможности, с актовой записью о смерти или домовой книгой.");

  const record = {
    schemaVersion: 1,
    sourceId,
    provider: PROVIDER,
    recordType: isRepression ? "published-memorial-index-entry" : "published-memory-book-entry",
    collection: {
      title: `${nameAsIndexed}${birth ? ` (${birth.year})` : ""} — ${recordFields.memoryBook}`,
      archiveCitation: recordFields.source ?? recordFields.memoryBook,
    },
    repository: REPOSITORY,
    links: Object.fromEntries([
      ["publication", item.url],
      ...group.slice(1).map((other) => [`visz-${other.section}-${other.id}`, { label: `Вторая строка той же книги: ${other.brief.split(",")[0]}`, url: other.url }]),
    ]),
    event,
    primaryPersonId: personId,
    mentions: [mention],
    transcription: {
      status: "published-index-entry-complete",
      literal,
      modernInterpretation: interpretation,
      fields: recordFields,
    },
    isRecord: true,
    cardKind: isRepression ? "published-martyr-book-record" : "published-memory-book-record",
    review: {
      status: "published-secondary-source-copied-from-visz",
      reviewedAt: RETRIEVED_ON,
      harvest: {
        retrievedOn: RETRIEVED_ON,
        method: `Карточка найдена поиском visz.nlr.ru по началу фамилии (searches/${SEARCH_ID}.json); текст выдачи и карточки «Подробнее…» перенесён без изменений.`,
        visz: group.map((member) => `${member.section}/${member.id}`),
      },
      ...(merge ? { identityResolution: `Объединены ${group.length} строки: ${lcFirst(merge.basis)}` } : {}),
      ...(link ? { profileLink: `Связан с профилем ${link.personId}: ${lcFirst(link.basis)}` } : {}),
      unresolved,
    },
    summary: {
      status: "published-index-summary",
      text: facts?.summary ?? (book.kind === "Они пережили Блокаду"
        ? `Пережил${sex === "female" ? "а" : ""} блокаду Ленинграда (Книга памяти «Они пережили Блокаду»).`
        : book.kind === "Госпитали"
          ? `${recordFields.rank ? `${recordFields.rank[0].toLocaleUpperCase("ru")}${recordFields.rank.slice(1)}, ` : ""}${death?.cause ?? "умер"}${death?.display ? ` ${death.display}` : ""} (госпиталь: ${recordFields.hospital}).`
          : `Житель${sex === "female" ? "ница" : ""} блокадного Ленинграда, умер${sex === "female" ? "ла" : ""} ${death?.display ? datePhrase(death) : "в годы блокады"}.`),
    },
  };
  for (const field of ["archiveCitation"]) if (!record.collection[field]) delete record.collection[field];
  records.push(record);

  // Profiles
  const birthPlace = mentionPlaces.find((place) => place.relation === "birth" && place.placeId);
  const deathInfo = death?.display ? {
    ...(death.iso ? { date: death.iso } : {}),
    display: death.display,
    ...(death.cause ? { cause: death.cause } : {}),
    sourceIds: [sourceId],
  } : null;
  const visNote = `«${PROVIDER}» РНБ (${sourceId}): ${interpretation}`;
  if (link) {
    const entry = existing.get(link.personId);
    if (!entry) throw new Error(`Нет профиля ${link.personId}`);
    const person = updatedPeople.get(link.personId) ?? structuredClone(entry.person);
    person.sourceIds = [...new Set([...(person.sourceIds ?? []), sourceId])];
    person.notes = [...(person.notes ?? []), `${visNote} ${record.review.profileLink}`];
    if (deathInfo && !person.death) person.death = { ...deathInfo, ...(link.personId === "P118744" ? { note: "Книга памяти «Блокада» называет 1942 год смерти; донесения о потерях — «пропал без вести» в 1942 году." } : {}) };
    updatedPeople.set(link.personId, person);
  } else {
    const leads = lead ? [{
      label: "Возможно тот же человек или родственник",
      status: "same-name-or-family-unverified",
      summary: lead.summary,
      personIds: lead.personIds,
    }] : [];
    const notes = [
      `Известен по базе «${PROVIDER}» Российской национальной библиотеки (visz.nlr.ru). ${interpretation}`,
      book.kind === "Они пережили Блокаду"
        ? "Книга «Они пережили Блокаду» составлена к 2003 году и называет людей под фамилиями того времени: если это фамилия по мужу, к фамильному ряду принадлежал муж, а собственная фамилия не названа."
        : "Профиль заведён по одной справке; тождество с одноимёнными людьми из других записей не установлено.",
    ];
    if (facts?.family) notes.push(facts.family);
    const person = {
      schemaVersion: 1,
      personId,
      displayName,
      sex,
      ...(patronymic ? { patronymic } : {}),
      ...(alternateNames.length || norm(nameAsIndexed) !== norm(displayName) ? { nameVariants: [...new Set([nameAsIndexed, ...alternateNames])].filter((name) => norm(name) !== norm(displayName)) } : {}),
      surname: { normalized: surnameForm, formsAsWritten: [...new Set([surnameForm, ...group.map((member) => briefName(member).surname)])] },
      ...(birth?.year ? {
        birth: {
          year: birth.year,
          display: birth.display,
          ...(birth.iso ? { date: birth.iso } : {}),
          ...(birthPlace ? { placeId: birthPlace.placeId } : {}),
          sourceIds: [sourceId],
        },
      } : {}),
      ...(deathInfo ? { death: deathInfo } : {}),
      sourceIds: [sourceId],
      status: isRepression ? "documented-from-published-martyrology" : "documented-from-published-memory-book",
      ...(facts?.occupation ? { occupation: facts.occupation.normalized } : recordFields.rank ? { occupation: `военнослужащий (${recordFields.rank})` } : {}),
      places: mentionPlaces.map((place) => Object.fromEntries(Object.entries(place).filter(([field]) => field !== "note"))),
      notes,
      ...(leads.length ? { researchLeads: leads } : {}),
      profileOrigin: { method: "visz-import", createdOn: RETRIEVED_ON, sourceId },
      ...(birth ? { dates: { birth: { display: birth.display, ...(birth.iso ? { iso: birth.iso } : {}), basis: `дата рождения по ${isRepression ? "справке" : "Книге памяти"} (${sourceId})` } } } : {}),
    };
    newPeople.push({ person, file: `${personId}-${[slug(displayName), birth?.year].filter(Boolean).join("-")}.json` });
  }

  for (const member of group) {
    searchRows.push({
      visz: `${member.section}/${member.id}`,
      url: member.url,
      name: member.brief.split(/[,.]/)[0],
      queries: member.q,
      brief: member.brief,
      sourceId,
      personId,
      decision: member !== item ? "merged-into-person-record" : link ? "record-linked-to-existing-profile" : "record-and-new-profile",
    });
  }
}

for (let number = firstPersonNumber; number < nextPersonNumber; number += 1) {
  if (existing.has(`P${number}`)) throw new Error(`Номер P${number} уже занят; выберите другой --first-id`);
}
for (const record of records) {
  for (const place of [record.event.place, ...record.mentions.flatMap((mention) => mention.places)]) {
    if (place?.placeId && !placeIds.has(place.placeId)) throw new Error(`${record.sourceId}: нет места ${place.placeId} в индексе`);
  }
}

// ---------------------------------------------------------------------------
// Report and write

const count = (list, keyOf) => list.reduce((counts, entry) => ({ ...counts, [keyOf(entry)]: (counts[keyOf(entry)] ?? 0) + 1 }), {});
const report = {
  cards: items.size,
  decisions: count(searchRows, (row) => row.decision),
  records: records.length,
  recordKinds: count(records, (record) => record.sourceId.split("-")[1]),
  newProfiles: newPeople.length,
  firstNewPersonId: newPeople.length ? `P${firstPersonNumber}` : null,
  lastNewPersonId: newPeople.length ? `P${nextPersonNumber - 1}` : null,
  linkedExisting: [...updatedPeople.keys()],
  linkedRecords: [...updatedRecords.keys()],
};
console.log(JSON.stringify(report, null, 2));

if (!dryRun) {
  const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  mkdirSync(sourcesDir, { recursive: true });
  for (const record of records) writeJson(path.join(sourcesDir, `${record.sourceId}.json`), record);
  for (const { person, file } of newPeople) writeJson(path.join(peopleDir, file), person);
  for (const [personId, person] of updatedPeople) writeJson(path.join(peopleDir, existing.get(personId).file), person);
  for (const { record, file } of updatedRecords.values()) writeJson(file, record);
  writeJson(path.join(searchesDir, `${SEARCH_ID}.json`), {
    schemaVersion: 1,
    searchId: SEARCH_ID,
    date: RETRIEVED_ON,
    provider: PROVIDER,
    database: "«Возвращённые имена. Книги памяти России» — Центр «Возвращённые имена» Российской национальной библиотеки",
    site: "https://visz.nlr.ru/",
    method: "Форма поиска раздела «Блокада» (POST /blockade: книги «Блокада», «Реквием», «Они пережили Блокаду», список умерших в госпиталях, справки Центра) и раздела «Репрессии» (POST /person) с cookie-сессией и паузой 2,5 с. Сначала поле фамилии с флажком «искать по началу фамилии» по всем формам ряда и известным ошибочным формам, затем поле «дополнительная информация» по основным формам (оно ищет подстроку, поэтому из выдачи взяты только строки, где форма стоит с начала слова, — например, сотни «Панфиловых» по запросу «Анфилов» отброшены). Пройдены все страницы выдачи, открыта каждая карточка «Подробнее…».",
    queries: Object.entries(harvest.queries).map(([query, stat]) => {
      const [mode, rest] = query.includes(":") ? query.split(":") : ["lname", query];
      const [section, value] = rest.split("|");
      return { page: `https://visz.nlr.ru/${section}`, field: mode === "memo" ? "memo" : "lname", value, resultCount: stat.total, pages: stat.pages };
    }),
    scope: {
      forms: "Анпилогов, Ампилогов, Анфилогов, Онфилогов, Онпилогов, Ампелогов, Анпилов, Ампилов, Анфилов, Анфилофьев, Анфилатов и ошибочные формы (Анпелогов, Апилогов, Аппилогов, Антилогов, Анплогов, Амфилогов, Амфилов, Анпалов, Ампелов, Импилов, Омпилогов, Анпилагов, Ампилагов, Онпилов, Онфилов, Анфилафьев, Емпилогов, Анфелогов) с женскими формами — поиск по началу фамилии их покрывает. Анпилохов, Ампилохов, Анфилохиев (от имени Амфилохий) — другие фамилии.",
      publicCutoff: "Все события относятся к 1933–1944 годам. Адреса книги «Они пережили Блокаду» даны на 2003 год: сохранены как поле книги (addressInBook2003), а не как событие или место.",
      map: "Места фамильного ряда привязаны к индексу мест: блокадный Ленинград и Колпино (жительство, смерть, погребение), хутор Вязовка и Киев (рождение), Тунгуда (место высылки). На карте появились Ленинград, Колпино и Вязовка. Места боёв и воинских захоронений вне Ленинграда не тегированы, как в импортах «Памяти народа» и gwar.",
    },
    summary: report,
    results: searchRows,
  });
  console.log(`Записано: ${records.length} Records, ${newPeople.length} новых профилей, ${updatedPeople.size} обновлённых профилей, ссылки в ${updatedRecords.size} Records`);
}
