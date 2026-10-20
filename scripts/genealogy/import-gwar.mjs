// Imports «Память героев Великой войны 1914–1918» (gwar.mil.ru) documents for
// the surname line: loss lists, the casualty bureau card index (hospitals),
// prisoner-of-war cards, awards and service records of the РГВИА.
//
// Input: a harvest of the site's `gt_data/?builder=Heroes` API, taken in the
// browser (the site does not open from plain HTTP clients). Each item is
// `{ t, i, id, q, s }`: `t` the document type, `s` the `_source` with empty
// fields stripped, `q` the queries that returned it. `rejected[]` lists the
// documents the browser already set aside as far from every form of the line.
// The harvest is kept out of git in tmp/gwar/.
//
// One Record per person: documents that agree on the surname form, first name,
// patronymic and unit, and whose birthplaces do not conflict. One profile per
// named Record, or a link to an existing profile when name, patronymic and
// birthplace agree.
//
// Usage: node scripts/genealogy/import-gwar.mjs <harvest.json> [--dry-run] [--first-id=121000] [--debug]

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const harvestPath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!harvestPath) throw new Error("Укажите путь к выгрузке gwar.mil.ru");

const RETRIEVED_ON = "2026-10-20";
const SEARCH_ID = `gwar-${RETRIEVED_ON}`;
const PROVIDER = "Память героев Великой войны 1914–1918";
const sourcesDir = path.join(root, "data/genealogy/sources/gwar");
const peopleDir = path.join(root, "data/genealogy/people");
const searchesDir = path.join(root, "data/genealogy/searches");
const placesIndex = JSON.parse(readFileSync(path.join(root, "data/genealogy/places/index.json"), "utf8"));
const harvest = JSON.parse(readFileSync(harvestPath, "utf8"));

// ---------------------------------------------------------------------------
// Surname scope (same families and OCR rule as the «Память народа» import)

const SURNAME_FAMILIES = [
  ["ampilog", /^(?:ампилог|анпилог|антилог|ампелог|анпелог|апилог|аппилог|аппелог|анпиног|анплог|анпилос|онпилог|аминлог|аменлог|анлог|анклог|анлилог|анинлог|арепилог|алеплог|анчислог|амилог|емпилог|емпалог)/],
  ["anfilog", /^(?:анфилог|онфилог|амфилог)/],
  ["anfilof", /^(?:анфилоф|онфилоф|анфилаф)/],
  ["anfilat", /^(?:анфилат)/],
  ["ampilov", /^(?:ампилов|ампелов|импилов)/],
  ["anpilov", /^(?:анпилов|анпалов)/],
  ["anfilov", /^(?:анфилов|амфилов)/],
];

// The index of gwar.mil.ru is typed from handwriting: «Антилогов», «Ампологов»
// are misreadings of the line. The intended form is the nearest form of the
// line; a tie keeps the reading of the index.
const LINE_FORMS = [
  ["Ампилогов", "ampilog"], ["Анпилогов", "ampilog"], ["Онпилогов", "ampilog"], ["Анфилогов", "anfilog"],
  ["Онфилогов", "anfilog"], ["Ампилов", "ampilov"], ["Анпилов", "anpilov"], ["Анфилов", "anfilov"],
  ["Анфилофьев", "anfilof"], ["Анфилатов", "anfilat"],
];
const LINE_FORM_NAMES = new Set(LINE_FORMS.map(([form]) => form.toLocaleLowerCase("ru")));
function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[right.length];
}
// Misreadings of the line found in this index, reviewed one by one: no such
// surname is known, and the reading is one or two letters from a form of the
// line. Neighbouring real surnames of the fuzzy search (Филатов, Антипов,
// Панфилов, Анфимов, Унтилов, Ампилохов, Анпилохов…) are not in the list,
// nor are readings that could be either («Апологов», «Анпилонов»).
const LINE_MISREADINGS = new Set([
  "анпилагов", "ампилагов", "анкилогов", "анпологов", "аннилогов", "антпилогов", "актилогов", "амнилогов", "ампологов",
  "омпилогов", "ампилодов", "ашпилогов", "анпылогов", "анпилозов", "амнелогов", "асипилогов", "анпимогов", "анпулогов",
  "амиклогов", "апелогов", "анилогов", "антилагов", "анпилагев", "анпетогов", "антологов", "анжелогов", "антулогов",
  "онтилогов", "антиогов", "аншлогов", "анпиголов", "анпилоков",
  "антилофьев", "афилофьев", "анфилоньев", "анфелофеев", "амфилофьев", "анфильфьев", "анфилопьев", "анфилорьев",
  "анфилгофьев", "анвилофьев", "анерилофьев", "анфолофиев", "антилафьев", "анвиловьев", "анфилодзьев", "анфинофьев",
  "амфилатов", "афилатов", "онфилатов", "анфиладов", "анфилятов", "анфелатов", "анфалатов", "анфилотов", "анфилапов",
  "антилов", "анпелов", "ампалов", "апилов", "анполов", "аппилов", "амполов", "ахпилов", "ашпилов", "акпилов", "антпилов",
  "анпылов", "анпилом", "аннилов", "анпипов", "анфелов", "анфаилов", "апфилов",
]);
const FAMILY_PRIOR = ["ampilog", "anpilov", "ampilov", "anfilov", "anfilog", "anfilof", "anfilat"];
function ocrReading(token) {
  const reading = norm(token).replace(/[^а-я]/g, "");
  const feminine = /(ова|ева)$/.test(reading);
  const base = feminine ? reading.slice(0, -1) : reading;
  if (!LINE_MISREADINGS.has(base)) return null;
  const scored = LINE_FORMS.map(([form, family]) => ({ form, family, distance: editDistance(base, norm(form)) }));
  const best = Math.min(...scored.map((item) => item.distance));
  if (best > 2) return null;
  const nearestAll = scored.filter((item) => item.distance === best);
  const family = FAMILY_PRIOR.find((candidate) => nearestAll.some((item) => item.family === candidate));
  const nearest = nearestAll.filter((item) => item.family === family);
  const form = nearest.length === 1 ? `${nearest[0].form}${feminine ? "а" : ""}` : null;
  return { reading: token, family, form, distance: best, tie: nearestAll.length > 1 };
}

const lst = (value) => (Array.isArray(value) ? value : [value]).filter((item) => item !== null && item !== undefined && item !== "");
const norm = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru").replace(/ё/g, "е").trim();

// «Анпилов (Анписов)»: the index gives the main reading and, in brackets, an
// alternative one.
function surnameTokens(value) {
  return lst(value).flatMap((item) => String(item).split(/[\s,()/]+/)).map((token) => token.replace(/[^А-Яа-яЁё-]/g, "")).filter(Boolean);
}

function surnameFamily(token) {
  const value = norm(token);
  for (const [family, pattern] of SURNAME_FAMILIES) if (pattern.test(value)) return family;
  return null;
}

// ---------------------------------------------------------------------------
// Names

// Keeps «ё»: the modern form of Фёдор and Пётр is spelled with it.
const titleCase = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru").trim().replace(/(^|[\s-])([а-яa-z])/g, (_, lead, letter) => lead + letter.toLocaleUpperCase("ru"));
const MODERN_YO = new Map(Object.entries({
  федор: "фёдор", петр: "пётр", семен: "семён", артем: "артём", алена: "алёна", парфен: "парфён",
  аксен: "аксён", нефед: "нефёд", федорович: "фёдорович", федоровна: "фёдоровна", семенович: "семёнович",
  семеновна: "семёновна", артемович: "артёмович", артемовна: "артёмовна", парфенович: "парфёнович",
  парфеновна: "парфёновна", аксенович: "аксёнович", аксеновна: "аксёновна", нефедович: "нефёдович",
  нефедовна: "нефёдовна",
}));
// «Ионыч (Ионович)»: the index gives the written form and, in brackets, the
// normalized one; the normalized form is the modern name.
const bracketForm = (value) => String(value ?? "").match(/\(([^()]+)\)\s*$/)?.[1]?.trim() ?? null;
const writtenForm = (value) => String(value ?? "").replace(/\s*\([^()]*\)\s*$/, "").trim();
const modernWord = (value) => {
  let base = norm(bracketForm(value) ?? value);
  if (base.startsWith("феодор")) base = `федор${base.slice("феодор".length)}`;
  return titleCase(MODERN_YO.get(base) ?? base);
};
// «Феодоров», «Григориев» — the old form of the patronymic; the modern name
// gives «Фёдорович», «Григорьевич».
const modernPatronymic = (value, sex) => {
  const word = modernWord(value);
  if (!/(ов|ев)$/.test(norm(word))) return word;
  const stem = word.replace(/иев$/, "ьев");
  return modernWord(sex === "female" ? `${stem}на` : `${stem}ич`);
};
const CHURCH_FORMS = [
  ["феодосий", "федосей"], ["феодосия", "федосья"], ["феодор", "федор"], ["иоанн", "иван"], ["симеон", "семен"],
  ["евфими", "ефим"], ["иаков", "яков"], ["косм", "кузьм"], ["димитри", "дмитри"], ["стефан", "степан"],
  ["захари", "захар"], ["параскев", "прасковь"], ["пелаги", "пелаге"], ["иулиани", "ульян"], ["григори", "григори"],
];
const canonicalName = (value) => {
  const text = norm(bracketForm(value) ?? writtenForm(value));
  for (const [church, everyday] of CHURCH_FORMS) {
    if (text.startsWith(church)) return everyday + text.slice(church.length);
  }
  return text;
};

const isInitial = (value) => !value || /\./.test(value) || norm(value).replace(/[^а-я]/g, "").length < 2;

const MALE_NAMES_IN_A = new Set(["кузьма", "фома", "никита", "илья", "лука", "савва", "данила", "гаврила", "михайла", "фока",
  "сила", "иона", "захария", "мина", "никола", "аникита", "кирилла", "лукьяна", "ананья", "еремея", "иуда"]);
function sexOf(patronymic, surname, firstName) {
  if (/(вна|чна|ична)$/.test(norm(patronymic))) return "female";
  if (/(вич|ич)$/.test(norm(patronymic))) return "male";
  const name = norm(writtenForm(firstName));
  if (MALE_NAMES_IN_A.has(name)) return "male";
  if (/(а|я)$/.test(name)) return "female";
  return /(ова|ева|ина)$/.test(norm(surname)) && !name ? "female" : "male";
}

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
const slug = (value) => norm(value).split("").map((letter) => TRANSLIT[letter] ?? letter).join("")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
// Dates: the index gives ISO dates as they stand in the document (old style
// before February 1918, not recalculated).

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
function parseDate(value) {
  const match = String(value ?? "").match(/^(1[89]\d\d)-(\d\d)-(\d\d)/);
  if (!match) {
    const year = String(value ?? "").match(/(?<!\d)(1[89]\d\d)(?!\d)/)?.[1];
    return year ? { display: `${year} год`, year: Number(year) } : null;
  }
  const [, year, month, day] = match.map(Number);
  return { display: `${day} ${MONTHS[month - 1]} ${year} года`, iso: match.slice(1, 4).join("-"), year };
}
// Prisoner cards often give only the year as «1 января»: shown as the year.
function parseBirthDate(value) {
  const date = parseDate(value);
  if (!date) return null;
  if (date.iso?.endsWith("-01-01")) return { display: `${date.year} год`, year: date.year, yearOnly: true };
  return date;
}
function dateRange(from, to) {
  const start = parseDate(from);
  const end = parseDate(to);
  if (!start) return end;
  if (!end || end.iso === start.iso) return start;
  return { display: `${start.display.replace(/ года$/, "")} — ${end.display}`, iso: start.iso, year: start.year, endIso: end.iso };
}

// ---------------------------------------------------------------------------
// Places

const SETTLEMENT_PREFIX = /^(?:с\.|с |село|д\.|дер\.|деревня|х\.|хут\.|хутор|п\.|пос\.|поселок|г\.|город|ст-ца|станица|ст\.|сл\.|слобода|м\.|мест\.|местечко|кол\.|колония|аул|ус\.|у\.)\s*/;
const REGION_WORD = /(?:губ\.?|губерни|обл\.?|область|край)/;
const DISTRICT_WORD = /(?:уезд|у-д|(?:^|\s)у\.|округ|отдел)/;
const VOLOST_WORD = /(?:вол\.|волост)/;
const adjectiveStem = (word) => norm(word).replace(/[^а-я-]/g, "").replace(/(ский|ской|ская|ское|цкий|цкая|ный|ная|ний|ий|ый|ой|ая|ое)$/, "");
const regionRoot = (word) => norm(word).replace(/[^а-я-]/g, "").replace(/(ая|ий|ой|ое|ый)$/, "");

function birthPlaceOf(doc) {
  const raw = doc.birth_place ? String(doc.birth_place) : "";
  const parts = [doc.birth_place_gubernia, doc.birth_place_uezd, doc.birth_place_volost].filter(Boolean).map(String);
  const missing = parts.filter((part) => !norm(raw).includes(norm(part)));
  const text = [...missing, raw].filter(Boolean).join(", ").replace(/\s+/g, " ").trim();
  return text || null;
}

function parsePlace(raw) {
  const text = norm(raw).replace(/\s+/g, " ");
  const parts = text.split(/[,;]/).map((part) => part.trim()).filter(Boolean);
  const place = { raw, region: null, district: null, volost: null, settlements: [] };
  for (const part of parts) {
    if (REGION_WORD.test(part)) {
      place.region ??= regionRoot(part.split(" ")[0]);
      continue;
    }
    if (DISTRICT_WORD.test(part)) {
      place.district ??= adjectiveStem(part.split(" ")[0]);
      continue;
    }
    if (VOLOST_WORD.test(part)) {
      place.volost ??= adjectiveStem(part.split(" ")[0]);
      continue;
    }
    const name = part.replace(SETTLEMENT_PREFIX, "").replace(/[«»"()?]/g, "").trim();
    if (name && name.length > 2 && !/^(?:губ|уезд|вол)/.test(name)) place.settlements.push(name);
  }
  return place;
}

function similar(left, right) {
  if (!left || !right) return false;
  if (left === right) return true;
  const shorter = Math.min(left.length, right.length);
  if (shorter < 5) return false;
  let common = 0;
  while (common < shorter && left[common] === right[common]) common += 1;
  return common >= Math.max(5, shorter - 2);
}

// "match" — a shared settlement; "volost"/"district" — only these agree;
// "conflict" — both sides name settlements (or districts) and none agree.
function comparePlaces(leftPlaces, rightPlaces) {
  const left = leftPlaces.map(parsePlace);
  const right = rightPlaces.map(parsePlace);
  const leftSettlements = left.flatMap((place) => place.settlements);
  const rightSettlements = right.flatMap((place) => place.settlements);
  if (leftSettlements.length && rightSettlements.length) {
    return leftSettlements.some((a) => rightSettlements.some((b) => similar(a, b))) ? "match" : "conflict";
  }
  for (const level of ["volost", "district"]) {
    const leftValues = left.map((place) => place[level]).filter(Boolean);
    const rightValues = right.map((place) => place[level]).filter(Boolean);
    if (leftValues.length && rightValues.length) {
      return leftValues.some((a) => rightValues.some((b) => similar(a, b))) ? level : "conflict";
    }
  }
  return "unknown";
}

const placesById = new Map(placesIndex.places.map((place) => [place.placeId, place]));
const placeContext = (place) => {
  const ownNames = [place.name, ...(place.aliases ?? [])]
    .map((name) => norm(name).split(/[,(]/)[0].replace(SETTLEMENT_PREFIX, "").trim())
    .filter((name) => name.length > 2);
  let text = norm([place.label, ...(place.aliases ?? []), place.geo?.note ?? ""].join(" | "));
  for (const name of ownNames.sort((a, b) => b.length - a.length)) text = text.split(name).join(" ");
  return text;
};
const placeNames = (place) => [place.name, ...(place.aliases ?? [])]
  .map((name) => norm(name).split(/[,(]/)[0].replace(SETTLEMENT_PREFIX, "").trim()).filter(Boolean);
const settlementPlaces = new Map();
for (const place of placesIndex.places) {
  const isArea = /district|volost|uezd/.test(place.kind ?? "") || ["district", "region"].includes(place.geo?.precision) ||
    /governorate|region|oblast|krai|asr|line|razryad/.test(place.placeId);
  if (isArea) continue;
  for (const head of placeNames(place)) {
    settlementPlaces.set(head, [...new Set([...(settlementPlaces.get(head) ?? []), place.placeId])]);
  }
}

const GOVERNORATE_IDS = new Map(Object.entries({
  курская: "kursk-governorate", воронежская: "voronezh-governorate", орловская: "orel-governorate",
  тамбовская: "tambov-governorate", пензенская: "penza-governorate", харьковская: "kharkov-governorate",
  полтавская: "poltava-governorate", черниговская: "chernigov-governorate", херсонская: "kherson-governorate",
  самарская: "samara-governorate", симбирская: "simbirsk-governorate", оренбургская: "orenburg-governorate",
  томская: "tomsk-governorate", енисейская: "yenisei-governorate", ставропольская: "stavropol-governorate",
  костромская: "kostroma-governorate", тульская: "tula-governorate", астраханская: "astrakhan-governorate",
  иркутская: "irkutsk-governorate", тверская: "tver-governorate", уфимская: "ufa-governorate",
}).map(([adjective, placeId]) => [regionRoot(adjective), placeId]));

// Villages with these names exist in every uezd: the uezd must be named in
// the index entry and agree.
const COMMON_SETTLEMENT_NAMES = new Set([
  "михайловка", "михайловское", "никольское", "николаевка", "ивановка", "александровка", "покровка", "покровское",
  "троицкое", "троицкая", "петровка", "петровское", "васильевка", "знаменка", "богородицкое", "воскресенское",
  "успенка", "андреевка", "алексеевка", "дмитриевка", "сергеевка", "григорьевка", "павловка", "владимировка",
  "ольховка", "березовка", "каменка", "степановка", "новоселки", "новоселовка", "красное", "песчанка",
  "веселое", "орловка", "ивановское", "спасское", "богдановка", "федоровка", "марьевка", "екатериновка",
]);

function linkPlace(raw) {
  const parsed = parsePlace(raw);
  const fits = (placeId) => {
    const text = placeContext(placesById.get(placeId));
    const regionFits = Boolean(parsed.region && parsed.region.length >= 4 && text.includes(parsed.region));
    const districtFits = Boolean(parsed.district && parsed.district.length >= 4 &&
      text.split(/[^а-я-]+/).some((word) => similar(adjectiveStem(word), parsed.district)));
    if (parsed.district && /уезд|район|р-н/.test(text) && !districtFits) return false;
    return districtFits || (regionFits && !COMMON_SETTLEMENT_NAMES.has(norm(placesById.get(placeId).name)));
  };
  for (const settlement of parsed.settlements) {
    const candidates = (settlementPlaces.get(settlement) ?? []).filter(fits);
    if (candidates.length === 1) return { placeId: candidates[0], confidence: "medium", basis: "settlement" };
  }
  // The index has only the mainland uezds of Таврическая губерния.
  if (parsed.region === "таврическ" && ["мелитополь", "бердян", "днепров"].includes(parsed.district)) {
    return { placeId: "mainland-taurida", confidence: "low", basis: "region" };
  }
  if (parsed.region) {
    const placeId = GOVERNORATE_IDS.get(parsed.region);
    if (placeId && placesById.has(placeId)) return { placeId, confidence: "low", basis: "region" };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Documents

const DOC_TYPES = {
  chelovek_donesenie: "Именной список потерь",
  chelovek_gospital: "Карточка картотеки бюро учёта потерь",
  chelovek_plen: "Карточка военнопленного",
  chelovek_nagrazhdenie: "Документ о награждении",
  chelovek_nagradnaya_kartochka: "Наградная карточка",
  chelovek_predstavlenie: "Представление к награде",
  chelovek_posluzhnoi_spisok: "Послужной список",
  chelovek_zahoronenie: "Сведения о захоронении",
};
const SHORT_TYPES = {
  chelovek_donesenie: "LOSS", chelovek_gospital: "CARD", chelovek_plen: "POW", chelovek_nagrazhdenie: "AWARD",
  chelovek_nagradnaya_kartochka: "AWARDCARD", chelovek_predstavlenie: "NOMINATION", chelovek_posluzhnoi_spisok: "SERVICE",
  chelovek_zahoronenie: "BURIAL",
};

// `document_author` of an award letter lists every unit of the order; kept
// only when it is short enough to name the issuing unit.
const FIELD_LABELS = [
  ["last_name", "Фамилия"], ["first_name", "Имя"], ["middle_name", "Отчество"], ["birth_date", "Дата рождения"],
  ["birthPlace", "Место рождения"], ["data_priziva", "На службе с"], ["rank", "Чин"], ["military_unit_name", "Часть"],
  ["document_author", "Автор документа"], ["vibitie_prichina", "Причина выбытия"], ["eventDate", "Дата события"],
  ["vibitieDate", "Дата выбытия"], ["event_place", "Место события"], ["vibitie_mesto", "Место выбытия"],
  ["operationNames", "Операция"], ["camp_name", "Лагерь"], ["camp_location", "Местонахождение лагеря"],
  ["award_name", "Награда"], ["award_num", "Номер знака"], ["prikaz_author", "Приказ"], ["prikaz_num", "Номер приказа"],
  ["prikaz_date", "Дата приказа"], ["award_delivery_date", "Дата вручения"], ["zahoronenie_mesto", "Место захоронения"],
  ["burial_name", "Захоронение"], ["doc_type", "Вид документа"], ["document_name", "Документ"], ["document_num", "Номер документа"],
  ["document_date", "Дата документа"], ["deal", "Дело"],
];

const docType = (doc) => doc.t;
const docUrl = (doc) => `https://gwar.mil.ru/heroes/${doc.t}${doc.id}/`;
const gwarId = (doc) => `${doc.t}${doc.id}`;

function derived(doc) {
  const s = doc.s;
  const event = dateRange(s.event_date_from, s.event_date_to);
  const vibitie = dateRange(s.vibitie_date_from, s.vibitie_date_to);
  return {
    ...s,
    birthPlace: birthPlaceOf(s),
    eventDate: event?.display ?? null,
    vibitieDate: vibitie && vibitie.display !== event?.display ? vibitie.display : null,
    operationNames: lst(s.operations).map((operation) => operation.event_name).filter(Boolean).join("; ") || null,
    birth_date: s.birth_date ? parseBirthDate(s.birth_date)?.display : null,
    data_priziva: s.data_priziva ? parseDate(s.data_priziva)?.display : null,
    prikaz_date: s.prikaz_date ? parseDate(s.prikaz_date)?.display : null,
    award_delivery_date: s.award_delivery_date ? parseDate(s.award_delivery_date)?.display : null,
    document_date: s.document_date ? parseDate(s.document_date)?.display : null,
    document_author: s.document_author && String(s.document_author).length <= 160 && s.document_author !== s.military_unit_name ? s.document_author : null,
  };
}

function archiveCitation(doc) {
  const s = doc.s;
  const archive = s.archive_short ?? s.archive;
  if (s.fund_num && s.inventory_num && s.deal_num) return `${archive}, ф. ${s.fund_num}, оп. ${s.inventory_num}, д. ${s.deal_num}`;
  if (s.deal_num && s.inventory_num) return `${archive}, ${s.fund ? `«${s.fund}», ` : ""}оп. ${s.inventory_num}, д. ${s.deal_num}`;
  const parts = [archive, s.fund ? `«${s.fund}»` : null, s.shkaf && s.shkaf !== "без номера" ? `шкаф ${s.shkaf}` : null, s.box ? `ящик ${s.box}` : null];
  return parts.filter(Boolean).join(", ") || null;
}

function docText(doc, number) {
  const values = derived(doc);
  const fields = FIELD_LABELS.flatMap(([key, label]) => {
    const value = values[key];
    return value ? [`${label}: ${String(value).replace(/\s+/g, " ").trim()}`] : [];
  });
  const citation = archiveCitation(doc);
  if (citation) fields.push(`Архив: ${citation}`);
  const sentences = fields.map((field) => (/[.!?…»]$/.test(field) ? field : `${field}.`));
  return `[${number}] ${DOC_TYPES[docType(doc)] ?? docType(doc)}. ${sentences.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Fates and events

const FATE_PRIORITY = ["war-death", "missing-in-action", "prisoner-of-war", "war-wound", "war-illness"];
function fateOf(reason) {
  const text = norm(reason);
  if (!text) return null;
  if (/убит|умер|погиб|скончал/.test(text)) return "war-death";
  if (/пропал|без вести/.test(text)) return "missing-in-action";
  if (/плен/.test(text)) return "prisoner-of-war";
  if (/ранен|контуж|отравл|газ/.test(text)) return "war-wound";
  if (/болен|болезн|заболе/.test(text)) return "war-illness";
  return null;
}

function docFates(doc) {
  const s = doc.s;
  const reasons = lst(s.vibitie_prichina).flatMap((reason) => String(reason).split(/[;]/)).map((reason) => reason.trim()).filter(Boolean);
  if (doc.t === "chelovek_plen" && !reasons.some((reason) => fateOf(reason) === "prisoner-of-war")) reasons.push("взят в плен");
  if (doc.t === "chelovek_zahoronenie") reasons.push("погребён");
  const date = dateRange(s.event_date_from, s.event_date_to) ?? dateRange(s.vibitie_date_from, s.vibitie_date_to);
  const place = s.event_place ?? s.vibitie_mesto ?? s.zahoronenie_mesto ?? s.burial_name ?? null;
  return reasons.map((reason) => ({ fate: doc.t === "chelovek_zahoronenie" ? "war-death" : fateOf(reason), reason, date, place, doc }))
    .filter((item) => item.fate);
}

const awardDocTypes = new Set(["chelovek_nagrazhdenie", "chelovek_nagradnaya_kartochka", "chelovek_predstavlenie"]);

function chooseEvent(docs) {
  const fates = docs.flatMap(docFates);
  fates.sort((left, right) => FATE_PRIORITY.indexOf(left.fate) - FATE_PRIORITY.indexOf(right.fate) ||
    (left.date?.iso ? 0 : 1) - (right.date?.iso ? 0 : 1) || String(left.date?.iso).localeCompare(String(right.date?.iso)));
  if (fates.length) return { type: fates[0].fate, ...fates[0], fates };
  const awardDocs = docs.filter((doc) => awardDocTypes.has(doc.t));
  if (awardDocs.length) {
    const dates = awardDocs.flatMap((doc) => [doc.s.prikaz_date, doc.s.document_date, doc.s.event_date_from, doc.s.award_delivery_date])
      .map((value) => (value ? parseDate(value) : null)).filter(Boolean).sort((a, b) => String(a.iso ?? a.year).localeCompare(String(b.iso ?? b.year)));
    return { type: "military-award", date: dates[0] ?? null, fates };
  }
  const serviceDates = docs.flatMap((doc) => [doc.s.event_date_to, doc.s.document_date]).map((value) => (value ? parseDate(value) : null))
    .filter((date) => date && date.year >= 1914);
  return { type: "military-service", date: serviceDates[0] ?? null, fates };
}

const FATE_SUMMARY = {
  "war-death": "погиб или умер",
  "missing-in-action": "пропал без вести",
  "prisoner-of-war": "попал в плен",
  "war-wound": "ранен или контужен",
  "war-illness": "выбыл по болезни",
};

// ---------------------------------------------------------------------------
// Load documents

const stats = { documents: 0, browserRejected: (harvest.rejected ?? []).length, inScope: 0, ocrReadings: 0, rejected: 0 };
// A reading one or two letters from an «-логов» form of the line that is not
// in the reviewed list is kept apart from plainly other surnames; the short
// forms (Анпилов, Анфилов) have too many real neighbours for that.
const LOG_FORMS = LINE_FORMS.filter(([form]) => /лог/.test(form)).map(([form]) => norm(form));
const rejectionOf = (name) => {
  const tokens = surnameTokens(name);
  if (tokens.length > 1 && OTHER_SURNAME_MAIN.test(norm(tokens[0])) && tokens.slice(1).some((token) => surnameFamily(token))) {
    return "rejected-main-reading-other-surname";
  }
  const reading = norm(surnameTokens(name)[0] ?? "").replace(/[^а-я]/g, "").replace(/(ов|ев)а$/, "$1");
  return LOG_FORMS.some((form) => editDistance(reading, form) <= 2) ? "rejected-doubtful-reading-not-in-reviewed-list" : "rejected-other-surname";
};
// «Панфилов (Анпилов)», «Ампилохов (Ампилогов)»: the index reads a real other
// surname first and offers a form of the line only as a second reading.
const OTHER_SURNAME_MAIN = /^(?:ампилох|анпилох|амфилох|панфилов|антипов|анфимов|анфинов|антиох|апелов)/;
// `bracketed` holds documents with two readings of the surname that the
// browser's first filter set aside and a second request fetched in full.
const refetched = new Set((harvest.bracketed ?? []).map((item) => `${item.t}${item.id}`));
const rejectedRows = (harvest.rejected ?? []).filter((item) => !refetched.has(`${item.t}${item.id}`)).map((item) => ({
  gwarId: `${item.t}${item.id}`, url: `https://gwar.mil.ru/heroes/${item.t}${item.id}/`, name: item.n, queries: item.q,
  decision: rejectionOf(item.n),
}));
const docs = [];
for (const item of [...harvest.items, ...(harvest.bracketed ?? [])]) {
  stats.documents += 1;
  // «-» marks an empty field of the index.
  for (const [key, value] of Object.entries(item.s)) if (typeof value === "string" && /^[-–—\s]*$/.test(value)) delete item.s[key];
  const tokens = surnameTokens(item.s.last_name);
  if (tokens.length > 1 && OTHER_SURNAME_MAIN.test(norm(tokens[0]))) {
    stats.rejected += 1;
    rejectedRows.push({
      gwarId: gwarId(item), url: docUrl(item), name: [item.s.last_name, item.s.first_name, item.s.middle_name].filter(Boolean).join(" "),
      queries: item.q, decision: "rejected-main-reading-other-surname",
    });
    continue;
  }
  const families = tokens.map(surnameFamily).filter(Boolean);
  let ocr = null;
  if (!families.length) ocr = tokens.map(ocrReading).find(Boolean) ?? null;
  if (!families.length && !ocr) {
    stats.rejected += 1;
    rejectedRows.push({
      gwarId: gwarId(item), url: docUrl(item), name: [item.s.last_name, item.s.first_name, item.s.middle_name].filter(Boolean).join(" "),
      queries: item.q, decision: rejectionOf(item.s.last_name),
    });
    continue;
  }
  if (ocr) stats.ocrReadings += 1;
  stats.inScope += 1;
  docs.push({ ...item, family: families[0] ?? ocr.family, ocr });
}

// ---------------------------------------------------------------------------
// Person facts per document

function docFacts(doc) {
  const s = doc.s;
  const firstName = s.first_name ? String(s.first_name).trim() : "";
  const patronymic = s.middle_name ? String(s.middle_name).trim() : "";
  // «Антилогов (Анпилогов)»: a form of the line in brackets wins over a
  // misreading.
  const tokens = surnameTokens(s.last_name);
  const lineToken = tokens.find((token) => LINE_FORM_NAMES.has(norm(token).replace(/а$/, ""))) ?? tokens.find((token) => surnameFamily(token));
  const indexedSurname = titleCase(lineToken ?? surnameTokens(s.last_name)[0] ?? "");
  const sex = sexOf(patronymic, indexedSurname, firstName);
  const genderForm = (form) => {
    const feminine = /(ова|ева)$/.test(norm(form));
    if (sex === "female") return feminine ? form : `${form}а`;
    return feminine ? form.slice(0, -1) : form;
  };
  const surname = genderForm(doc.ocr ? titleCase(doc.ocr.form ?? doc.ocr.reading) : indexedSurname);
  const birth = s.birth_date ? parseBirthDate(s.birth_date) : null;
  const birthPlace = birthPlaceOf(s);
  const unit = s.military_unit_name ? String(s.military_unit_name).trim() : "";
  return { firstName, patronymic, surname, sex, birth, birthPlaces: birthPlace ? [birthPlace] : [], unit };
}
for (const doc of docs) doc.facts = docFacts(doc);

// ---------------------------------------------------------------------------
// Clustering: surname form, first name, patronymic and unit agree; the
// birthplaces must not conflict. Without a patronymic on either side the
// birthplace must agree at settlement level.

const named = (facts) => !isInitial(facts.firstName);
const personKey = (doc) => [norm(doc.facts.surname), canonicalName(doc.facts.firstName), canonicalName(doc.facts.patronymic), norm(doc.facts.unit)].join("|");
const clusters = [];
const byKey = new Map();
const sortedDocs = [...docs].sort((left, right) => left.t.localeCompare(right.t) || String(left.id).localeCompare(String(right.id)));
for (const doc of sortedDocs) {
  const key = personKey(doc);
  const candidates = named(doc.facts) && doc.facts.unit ? (byKey.get(key) ?? []) : [];
  const fitting = candidates.filter((cluster) => {
    const check = comparePlaces(doc.facts.birthPlaces, cluster.docs.flatMap((member) => member.facts.birthPlaces));
    if (check === "conflict") return false;
    const years = cluster.docs.map((member) => member.facts.birth?.year).filter(Boolean);
    if (doc.facts.birth?.year && years.length && !years.some((year) => Math.abs(year - doc.facts.birth.year) <= 1)) return false;
    if (doc.facts.patronymic) return true;
    return check === "match";
  });
  if (fitting.length === 1) {
    fitting[0].docs.push(doc);
    continue;
  }
  const cluster = { docs: [doc], facts: doc.facts, family: doc.family, possibleSame: new Set(candidates) };
  for (const candidate of candidates) candidate.possibleSame.add(cluster);
  clusters.push(cluster);
  byKey.set(key, [...(byKey.get(key) ?? []), cluster]);
}
// Second pass: the same man under two readings of the surname («Анпилогов»,
// «Антологов») or two spellings of the village («Кермали», «Кармалка»). Name,
// patronymic and unit agree; governorate and uezd, where both documents give
// them, agree too. Volosts are not compared: they were renamed and regrouped.
const editClose = (left, right) => similar(left, right) || (left.length >= 5 && right.length >= 5 && editDistance(left, right) <= 3);
function areasAgree(leftPlaces, rightPlaces) {
  const left = leftPlaces.map(parsePlace);
  const right = rightPlaces.map(parsePlace);
  for (const a of left) {
    for (const b of right) {
      if (a.region && b.region && a.region !== b.region) return false;
      if (a.district && b.district && !similar(a.district, b.district)) return false;
    }
  }
  const leftSettlements = left.flatMap((place) => place.settlements);
  const rightSettlements = right.flatMap((place) => place.settlements);
  return !leftSettlements.length || !rightSettlements.length ||
    leftSettlements.some((a) => rightSettlements.some((b) => editClose(a, b)));
}
// Documents the rule above cannot join, joined after review.
const MANUAL_MERGES = [
  {
    gwarIds: ["chelovek_gospital301354", "chelovek_donesenie14697016"],
    basis: "Николай Григорьевич, рядовой 410-го пехотного Усманского полка, в обоих документах. Список потерь пишет «Тамбовская губ., Усманский уезд, Михайловская вол., Тимошев.»: губерния и уезд повторяют название полка, а Михайловская волость и Тимошевка — место рождения таврического Николая Григорьевича из карточки бюро учёта потерь (Мелитопольский уезд, Тимошевская вол.).",
  },
];
const manualMergeOf = new Map(MANUAL_MERGES.flatMap((merge) => merge.gwarIds.map((id) => [id, merge])));
const clusterOf = new Map(clusters.flatMap((cluster) => cluster.docs.map((doc) => [gwarId(doc), cluster])));
function mergeInto(target, source) {
  target.docs.push(...source.docs);
  for (const other of source.possibleSame) {
    other.possibleSame.delete(source);
    if (other !== target) {
      target.possibleSame.add(other);
      other.possibleSame.add(target);
    }
  }
  target.possibleSame.delete(source);
  target.possibleSame.delete(target);
  for (const doc of source.docs) clusterOf.set(gwarId(doc), target);
  clusters.splice(clusters.indexOf(source), 1);
}
for (const merge of MANUAL_MERGES) {
  const [first, ...rest] = merge.gwarIds.map((id) => clusterOf.get(id));
  for (const other of rest) if (other && first && other !== first) mergeInto(first, other);
  if (first) first.manualMerge = merge.basis;
}
const looseKey = (cluster) => {
  const docsFacts = cluster.docs.map((doc) => doc.facts);
  const withPatronymic = docsFacts.find((facts) => facts.patronymic && !isInitial(facts.patronymic));
  if (!withPatronymic || !named(withPatronymic) || !withPatronymic.unit) return null;
  return [canonicalName(withPatronymic.firstName), canonicalName(withPatronymic.patronymic), norm(withPatronymic.unit)].join("|");
};
const byLooseKey = new Map();
for (const cluster of [...clusters]) {
  const key = looseKey(cluster);
  if (!key) continue;
  const places = cluster.docs.flatMap((doc) => doc.facts.birthPlaces);
  const target = (byLooseKey.get(key) ?? []).find((other) => areasAgree(places, other.docs.flatMap((doc) => doc.facts.birthPlaces)));
  if (target) {
    mergeInto(target, cluster);
    target.looseMerge = true;
  } else {
    byLooseKey.set(key, [...(byLooseKey.get(key) ?? []), cluster]);
  }
}

// Loss lists first, then the bureau cards, prisoner cards and awards; in a
// reviewed merge the document named first leads.
const typeOrder = Object.keys(SHORT_TYPES);
const docOrder = (cluster, doc) => {
  const manual = MANUAL_MERGES.find((merge) => merge.gwarIds.includes(gwarId(doc)));
  return manual && cluster.manualMerge ? manual.gwarIds.indexOf(gwarId(doc)) - 100 : typeOrder.indexOf(doc.t);
};
for (const cluster of clusters) {
  cluster.docs.sort((left, right) => docOrder(cluster, left) - docOrder(cluster, right) || String(left.id).localeCompare(String(right.id)));
  // The fullest reading wins: a patronymic or birthplace from any document.
  const facts = { ...cluster.docs[0].facts };
  for (const member of cluster.docs) {
    if (!facts.patronymic && member.facts.patronymic) facts.patronymic = member.facts.patronymic;
    if (!facts.birth && member.facts.birth) facts.birth = member.facts.birth;
  }
  facts.birthPlaces = [...new Set(cluster.docs.flatMap((member) => member.facts.birthPlaces))];
  facts.surnames = [...new Set(cluster.docs.map((member) => member.facts.surname))];
  facts.units = [...new Set(cluster.docs.map((member) => member.facts.unit).filter(Boolean))];
  cluster.facts = facts;
}

// ---------------------------------------------------------------------------
// Existing profiles of the line

const SITE_VARIANT = /^(?:анфилат|ампилог|ампилов|импилов|амфилог|амфилов|анпилог|анпилов|анфилог|анфилоф|анфилов|онфилог|онфилоф|онпилог|антилог|анпалов|ампелог|ампелов|анпелог|анпилос|анпиног|анплог|апилог|аппилог|аппелог)/;
const existing = new Map();
const lineProfiles = [];
let maxPersonNumber = 0;
let alreadyImported = false;
const yearOf = (value) => Number(String(value ?? "").match(/1[6-9]\d\d/)?.[0]) || null;
for (const file of readdirSync(peopleDir).filter((name) => name.endsWith(".json"))) {
  const person = JSON.parse(readFileSync(path.join(peopleDir, file), "utf8"));
  existing.set(person.personId, { person, file });
  if (person.profileOrigin?.method === "gwar-import") alreadyImported = true;
  maxPersonNumber = Math.max(maxPersonNumber, Number(person.personId.slice(1)) || 0);
  const parts = String(person.displayName ?? "").split(/\s+/);
  const surname = norm(person.surname?.normalized ?? parts.at(-1));
  if (!SITE_VARIANT.test(surname) || parts.length < 3) continue;
  const placeIds = [person.birth?.placeId, person.baptism?.placeId, ...(person.places ?? []).map((place) => place.placeId)].filter(Boolean);
  const indexed = [...new Set(placeIds)].map((placeId) => placesById.get(placeId)).filter(Boolean);
  lineProfiles.push({
    personId: person.personId,
    person,
    first: canonicalName(parts[0]),
    patronymic: canonicalName(parts[1]),
    birthYear: yearOf(person.birth?.year ?? person.birth?.date ?? person.birth?.display ?? person.dates?.birth?.display ?? person.birthEstimate?.year),
    deathYear: yearOf(person.death?.date ?? person.death?.display ?? person.dates?.death?.display),
    names: indexed.filter((place) => !/governorate|region|oblast|krai|uezd|district|asr/.test(place.placeId)).flatMap(placeNames),
    context: indexed.map((place) => norm([place.label, ...(place.aliases ?? [])].join(" | "))).join(" | "),
    wwii: person.profileOrigin?.method === "pamyat-naroda-import",
  });
}
if (alreadyImported && !dryRun) throw new Error("Профили gwar.mil.ru уже импортированы; откатите их перед повторным запуском");

// Settlement agreement: a settlement of the index equals a place of the
// profile. Volost agreement: the volost is named after a place of the profile
// («Тимошевская вол.» — Тимошевка) and the uezd, if both name it, agrees.
// Volosts named after the commonest village names say nothing on their own.
const COMMON_VOLOST_STEMS = new Set([...COMMON_SETTLEMENT_NAMES].map(adjectiveStem));
function profilePlaceMatch(profile, birthPlaces) {
  // Only places whose governorate and uezd agree with the profile's places
  // count: «Тамбовская губ., Усманский уезд, …Тимошев.» is not the Тимошевка
  // of the Мелитопольский уезд.
  const contextWords = profile.context.split(/[^а-я-]+/);
  const parsed = birthPlaces.map(parsePlace).filter((place) =>
    (!place.district || !/уезд|округ/.test(profile.context) || contextWords.some((word) => similar(adjectiveStem(word), place.district))) &&
    (!place.region || !/губерни/.test(profile.context) || profile.context.includes(place.region)));
  const settlements = parsed.flatMap((place) => place.settlements);
  if (settlements.some((settlement) => profile.names.some((name) => similar(settlement, name)))) return "settlement";
  if (parsed.some((place) => place.volost && !COMMON_VOLOST_STEMS.has(place.volost) &&
    profile.names.some((name) => similar(place.volost, adjectiveStem(name))))) return "volost";
  if (parsed.some((place) => place.district && place.district.length >= 5 && profile.context.split(/[^а-я-]+/).some((word) => similar(adjectiveStem(word), place.district)))) return "uezd";
  return null;
}

for (const cluster of clusters) {
  const facts = cluster.facts;
  cluster.existingMatch = null;
  cluster.leads = [];
  if (!named(facts) || !facts.patronymic) continue;
  const candidates = lineProfiles.filter((profile) => !profile.wwii && profile.first === canonicalName(facts.firstName) &&
    profile.patronymic === canonicalName(facts.patronymic) &&
    (!profile.birthYear || (profile.birthYear >= 1845 && profile.birthYear <= 1902)) &&
    (!profile.deathYear || profile.deathYear >= 1914) &&
    (!facts.birth?.year || !profile.birthYear || Math.abs(profile.birthYear - facts.birth.year) <= 2))
    .map((profile) => ({ profile, level: profilePlaceMatch(profile, facts.birthPlaces) }))
    .filter((candidate) => candidate.level);
  const strong = candidates.filter((candidate) => candidate.level === "settlement");
  const volost = candidates.filter((candidate) => candidate.level === "volost");
  const chosen = strong.length === 1 ? strong[0] : !strong.length && volost.length === 1 ? volost[0] : null;
  if (chosen) {
    cluster.existingMatch = chosen.profile.personId;
    cluster.matchLevel = chosen.level;
  }
  cluster.leads = candidates.filter((candidate) => candidate !== chosen).map((candidate) => candidate.profile.personId);
}
// Documents of different units linked to one profile describe one man: one
// Record for him.
const byExistingMatch = new Map();
for (const cluster of [...clusters]) {
  if (!cluster.existingMatch) continue;
  const target = byExistingMatch.get(cluster.existingMatch);
  if (!target) {
    byExistingMatch.set(cluster.existingMatch, cluster);
    continue;
  }
  mergeInto(target, cluster);
  target.profileMerge = true;
  if (cluster.matchLevel === "settlement") target.matchLevel = "settlement";
  target.leads = [...new Set([...target.leads, ...cluster.leads])];
  target.facts.birthPlaces = [...new Set([...target.facts.birthPlaces, ...cluster.facts.birthPlaces])];
  target.facts.surnames = [...new Set([...target.facts.surnames, ...cluster.facts.surnames])];
  target.facts.units = [...new Set([...target.facts.units, ...cluster.facts.units])];
  target.facts.birth ??= cluster.facts.birth;
}

// ---------------------------------------------------------------------------
// Build records and profiles

const sourceIdOf = (cluster) => `GWAR-${SHORT_TYPES[cluster.docs[0].t] ?? "DOC"}-${cluster.docs[0].id}`;

clusters.sort((left, right) => {
  const a = left.facts;
  const b = right.facts;
  return a.surname.localeCompare(b.surname, "ru") || a.firstName.localeCompare(b.firstName, "ru") ||
    a.patronymic.localeCompare(b.patronymic, "ru") || sourceIdOf(left).localeCompare(sourceIdOf(right));
});

const firstIdArgument = process.argv.find((argument) => argument.startsWith("--first-id="));
let nextPersonNumber = firstIdArgument ? Number(firstIdArgument.split("=")[1]) : maxPersonNumber + 1;
const firstPersonNumber = nextPersonNumber;
for (const cluster of clusters) {
  cluster.sourceId = sourceIdOf(cluster);
  if (!named(cluster.facts)) continue;
  cluster.personId = cluster.existingMatch ?? `P${nextPersonNumber++}`;
}
for (let number = firstPersonNumber; number < nextPersonNumber; number += 1) {
  if (existing.has(`P${number}`)) throw new Error(`Номер P${number} уже занят; выберите другой --first-id`);
}

const distinct = (values) => [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
const joinLimited = (values, limit = 4) => {
  const list = distinct(values);
  return list.length > limit ? `${list.slice(0, limit).join("; ")} и др` : list.join("; ");
};
const capitalizeFirst = (value) => (value ? value.charAt(0).toLocaleUpperCase("ru") + value.slice(1) : value);
const plural = (count, one, few, many) => (count % 10 === 1 && count % 100 !== 11 ? one : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? few : many);

const newPeople = [];
const updatedPeople = new Map();
const records = [];
const searchRows = [];
const linkStats = { linkedExisting: 0, newProfiles: 0, noProfile: 0, possibleSameExisting: 0 };

for (const cluster of clusters) {
  const facts = cluster.facts;
  const allDocs = cluster.docs;
  const event = chooseEvent(allDocs);
  const sourceId = cluster.sourceId;
  const displayName = named(facts)
    ? [modernWord(facts.firstName), facts.patronymic && !isInitial(facts.patronymic) ? modernPatronymic(facts.patronymic, facts.sex) : null, facts.surname].filter(Boolean).join(" ")
    : [facts.firstName, facts.patronymic, facts.surname].filter(Boolean).join(" ") || facts.surname;
  const indexedName = (doc) => [doc.s.last_name, doc.s.first_name, doc.s.middle_name].filter(Boolean).join(" ");
  const nameAsIndexed = indexedName(allDocs[0]);
  const alternateNames = distinct([
    ...allDocs.map(indexedName).filter((name) => name !== nameAsIndexed),
    ...facts.surnames.slice(1).map((form) => [modernWord(facts.firstName), facts.patronymic ? modernPatronymic(facts.patronymic, facts.sex) : null, form].filter(Boolean).join(" ")),
  ]).filter((name) => norm(name) !== norm(displayName));

  const ranks = distinct(allDocs.map((doc) => doc.s.rank).filter(Boolean));
  const units = facts.units;
  const awards = allDocs.filter((doc) => awardDocTypes.has(doc.t) && doc.s.award_name).map((doc) => {
    const date = doc.s.prikaz_date ?? doc.s.document_date;
    const parsed = date ? parseDate(date) : null;
    return `${doc.s.award_name}${doc.s.award_num ? ` № ${doc.s.award_num}` : ""}${parsed ? ` (${parsed.display})` : ""}${doc.t === "chelovek_predstavlenie" ? " — представление" : ""}`;
  });
  const captivity = allDocs.filter((doc) => doc.t === "chelovek_plen").map((doc) => [
    doc.s.event_place ? `место пленения: ${doc.s.event_place}` : null,
    doc.s.camp_name ? `лагерь ${doc.s.camp_name}` : null,
    doc.s.camp_location ?? null,
  ].filter(Boolean).join(", ")).filter(Boolean);
  const fateReasons = [...new Map(event.fates.map((item) => [norm(item.reason), item.reason])).values()];
  const isFate = FATE_PRIORITY.includes(event.type);
  const fatePlace = isFate ? event.place : null;
  const operations = distinct(allDocs.flatMap((doc) => lst(doc.s.operations).map((operation) => operation.event_name)));
  const fields = {
    birthDate: facts.birth?.display ?? null,
    birthPlace: joinLimited(facts.birthPlaces, 3) || null,
    rank: joinLimited(ranks, 4) || null,
    unit: joinLimited(units, 4) || null,
    awards: joinLimited(awards, 6) || null,
    fate: fateReasons.join("; ") || null,
    fateDate: isFate && event.date ? event.date.display : null,
    fatePlace,
    operations: joinLimited(operations, 3) || null,
    captivity: joinLimited(captivity, 2) || null,
    documentsCount: String(allDocs.length),
  };
  for (const [key, value] of Object.entries(fields)) if (!value) delete fields[key];

  const literal = allDocs.map((doc, index) => docText(doc, index + 1)).join("\n");

  const parts = [`${displayName}${facts.birth ? `, ${facts.birth.iso ? `родился ${facts.birth.display}` : `${facts.birth.year} года рождения`}` : ""}${facts.birthPlaces[0] ? `, место рождения — ${facts.birthPlaces[0]}` : ""}.`];
  if (ranks.length || units.length) parts.push(`Служба: ${[ranks.slice(0, 2).join(", "), units.slice(0, 2).join("; ")].filter(Boolean).join(", ")}.`);
  if (awards.length) parts.push(`Награды: ${joinLimited(awards, 4)}.`);
  for (const fate of [...new Map(event.fates.map((item) => [`${item.fate}|${item.date?.display}`, item])).values()].slice(0, 4)) {
    parts.push(`${capitalizeFirst(FATE_SUMMARY[fate.fate])} по документам («${fate.reason}»)${fate.date ? `, ${fate.date.display}` : ""}${fate.place ? `, ${fate.place}` : ""}.`);
  }
  if (captivity.length) parts.push(`Плен: ${captivity[0]}.`);
  parts.push(`${allDocs.length} ${plural(allDocs.length, "документ", "документа", "документов")} портала «${PROVIDER}».`);
  const modernInterpretation = parts.join(" ").replace(/\.\./g, ".");

  const birthLinks = facts.birthPlaces.map((place) => ({ place, link: linkPlace(place) }));
  // A settlement wins; otherwise the place of the leading document.
  const linkedBirth = birthLinks.find((item) => item.link?.basis === "settlement") ?? birthLinks[0];
  const birthLink = linkedBirth?.link ?? null;
  const birthWritten = linkedBirth?.place ?? facts.birthPlaces[0];
  const mentionPlaces = [];
  if (birthWritten) {
    mentionPlaces.push({
      relation: "birth",
      asWritten: birthWritten,
      normalized: birthWritten,
      ...(birthLink ? { placeId: birthLink.placeId } : {}),
      confidence: birthLink ? birthLink.confidence : "medium",
      ...(birthLink && birthLink.basis === "region" ? { note: "Тег указывает только на губернию, а не на селение." } : {}),
    });
  }
  if (fatePlace) {
    mentionPlaces.push({
      relation: event.type === "missing-in-action" ? "missing" : event.type === "prisoner-of-war" ? "captivity" : event.type === "war-death" ? "death" : "wound",
      asWritten: fatePlace, normalized: fatePlace, confidence: "medium",
    });
  }
  const camp = allDocs.find((doc) => doc.s.camp_name);
  if (camp) {
    const text = [camp.s.camp_name, camp.s.camp_location].filter(Boolean).join(", ");
    mentionPlaces.push({ relation: "pow-camp", asWritten: text, normalized: text, confidence: "medium" });
  }

  const uncertainties = [];
  if (facts.birthPlaces.length > 1) uncertainties.push(`Место рождения в документах записано по-разному: ${joinLimited(facts.birthPlaces, 4).replace(/\.$/, "")}.`);
  if (facts.surnames.length > 1) uncertainties.push(`Фамилия в документах: ${facts.surnames.join(", ")}.`);
  for (const ocr of distinct(allDocs.map((doc) => doc.ocr && JSON.stringify(doc.ocr)).filter(Boolean)).map((value) => JSON.parse(value))) {
    uncertainties.push(ocr.form
      ? `Фамилия в индексе портала «${ocr.reading}» — вероятно, ошибка прочтения рукописи; принята ближайшая форма фамильного ряда «${ocr.form}».`
      : `Фамилия в индексе портала «${ocr.reading}» — вероятно, ошибка прочтения рукописи; какая форма фамильного ряда имелась в виду, не установлено.`);
  }
  if (/ого$/.test(norm(facts.surname))) uncertainties.push(`Фамилия в индексе портала «${facts.surname}», вероятно, обрезана; полная форма не установлена.`);
  const bracketed = distinct(allDocs.map((doc) => doc.s.last_name).filter((value) => /[()]/.test(value)));
  if (bracketed.length) uncertainties.push(`Индекс даёт два чтения фамилии: ${bracketed.join("; ")}.`);

  const mention = {
    mentionId: `${sourceId}-M1`,
    role: event.type === "war-death" ? "deceased-soldier" : "soldier",
    ...(cluster.personId ? { personId: cluster.personId } : {}),
    displayName,
    modernName: displayName,
    nameAsIndexed,
    alternateNames,
    ...(facts.patronymic && named(facts) && !isInitial(facts.patronymic) ? { patronymic: modernPatronymic(facts.patronymic, facts.sex) } : {}),
    sex: facts.sex,
    ...(facts.birth?.year ? { birthEstimate: { year: facts.birth.year, basis: "год рождения по индексу портала gwar.mil.ru" } } : {}),
    ...(ranks.length ? { occupation: { asWritten: ranks.join(", "), normalized: /сестр|сиделк/.test(norm(ranks.join(" "))) ? "сестра милосердия" : "военнослужащий" } } : {}),
    places: mentionPlaces,
    ...(uncertainties.length ? { uncertainties } : {}),
  };

  const links = { officialCard: docUrl(allDocs[0]) };
  for (const doc of allDocs.slice(1)) {
    links[`gwar-${doc.t}-${doc.id}`] = {
      label: [DOC_TYPES[doc.t] ?? doc.t, archiveCitation(doc)].filter(Boolean).join(" · "),
      url: docUrl(doc),
    };
  }

  const citations = distinct(allDocs.map(archiveCitation).filter(Boolean));
  const eventDate = event.date
    ? {
      display: event.date.display,
      ...(event.date.iso ? { iso: event.date.iso } : { yearFrom: event.date.year, yearTo: event.date.year }),
      ...(event.date.iso && event.type === "war-death" ? { deathIso: event.date.iso } : {}),
      calendar: "source-calendar-unverified",
    }
    : { display: "годы Первой мировой войны (дата в индексе не указана)", yearFrom: 1914, yearTo: 1918 };

  const unresolved = [
    "Сверить запись с изображениями документов РГВИА на gwar.mil.ru: поля портала — индекс, а не чтение проекта.",
  ];
  if (cluster.matchLevel === "volost") {
    unresolved.push(`Профиль ${cluster.existingMatch} связан по совпадению имени, отчества и волости рождения (селение в документе не названо); проверить по скану.`);
  }
  if (cluster.possibleSame.size) unresolved.push("На портале есть отдельные документы с тем же именем, отчеством и частью, которые не сведены в эту запись из-за неполного или расходящегося места рождения; возможно, это тот же человек.");
  if (cluster.leads.length) unresolved.push(`Проверить тождество с профилями ${cluster.leads.join(", ")} (совпадают имя и отчество, место рождения совпадает только частично).`);

  const record = {
    schemaVersion: 1,
    sourceId,
    provider: PROVIDER,
    recordType: "published-military-database-entry",
    collection: {
      title: `${nameAsIndexed}${units[0] ? ` — ${units[0]}` : ""}`,
      ...(citations.length ? { archiveCitation: citations.join("; ") } : {}),
    },
    repository: {
      name: "Портал «Память героев Великой войны 1914–1918» — Министерство обороны Российской Федерации",
      location: "Онлайн-база; документы хранятся в Российском государственном военно-историческом архиве (РГВИА, Москва)",
      url: "https://gwar.mil.ru/",
    },
    links,
    event: { type: event.type, date: eventDate },
    ...(cluster.personId ? { primaryPersonId: cluster.personId } : {}),
    mentions: [mention],
    transcription: {
      status: "published-index-entry-complete",
      literal,
      modernInterpretation,
      fields,
    },
    isRecord: true,
    cardKind: "published-military-database-record",
    review: {
      status: "published-secondary-source-copied-from-gwar",
      reviewedAt: RETRIEVED_ON,
      harvest: {
        retrievedOn: RETRIEVED_ON,
        method: `Документы получены из поиска портала gwar.mil.ru по формам фамилии (searches/${SEARCH_ID}.json); поля индекса перенесены без изменений, служебные поля портала опущены.`,
        gwarIds: allDocs.map(gwarId),
      },
      ...(allDocs.length > 1 ? {
        identityResolution: cluster.manualMerge
          ? `Объединены ${allDocs.length} ${plural(allDocs.length, "документ", "документа", "документов")} портала после проверки: ${cluster.manualMerge}`
          : cluster.profileMerge
            ? `Объединены ${allDocs.length} ${plural(allDocs.length, "документ", "документа", "документов")} портала, отнесённые к одному профилю ${cluster.existingMatch} по имени, отчеству и месту рождения; части в документах разные.`
          : cluster.looseMerge
            ? `Объединены ${allDocs.length} ${plural(allDocs.length, "документ", "документа", "документов")} портала: совпадают имя, отчество и часть, губерния и уезд рождения не противоречат; фамилия или селение в индексе прочитаны по-разному.`
            : `Объединены ${allDocs.length} ${plural(allDocs.length, "документ", "документа", "документов")} портала: совпадают форма фамилии, имя, отчество и часть, место рождения не противоречит.`,
      } : {}),
      ...(cluster.existingMatch ? {
        profileLink: `Связан с профилем ${cluster.existingMatch}: совпадают имя, отчество и ${cluster.matchLevel === "settlement" ? "селение" : "волость"} рождения, другой подходящей карточки фамильного ряда нет.`,
      } : {}),
      unresolved,
    },
    summary: {
      status: "published-index-summary",
      text: (() => {
        const text = [
          ranks[0] ? capitalizeFirst(ranks[0]) : null,
          units[0] ?? null,
          isFate ? `${FATE_SUMMARY[event.type]}${event.date ? ` ${event.date.display}` : ""}` : null,
          awards.length ? `награды: ${joinLimited(awards.map((award) => award.replace(/ \(.*$/, "")), 2)}` : null,
        ].filter(Boolean).join("; ");
        return text ? `${text}.` : "Документ портала «Память героев Великой войны» без указания судьбы.";
      })(),
    },
  };
  records.push(record);

  if (!cluster.personId) {
    linkStats.noProfile += 1;
  } else if (cluster.existingMatch) {
    linkStats.linkedExisting += 1;
    const entry = existing.get(cluster.personId);
    const person = updatedPeople.get(cluster.personId) ?? structuredClone(entry.person);
    person.sourceIds = distinct([...(person.sourceIds ?? []), sourceId]);
    person.notes = [...(person.notes ?? []), `«${PROVIDER}» (${sourceId}): ${modernInterpretation} ${record.review.profileLink}${cluster.matchLevel === "volost" ? " Селение в документе не названо, поэтому тождество требует проверки по скану." : ""}`];
    if (event.type === "war-death" && !person.death && event.date) {
      person.death = {
        ...(event.date.iso ? { date: event.date.iso } : {}),
        display: event.date.display,
        cause: event.reason,
        sourceIds: [sourceId],
      };
    }
    updatedPeople.set(cluster.personId, person);
  } else {
    linkStats.newProfiles += 1;
    const researchLeads = [];
    if (cluster.leads.length) {
      linkStats.possibleSameExisting += 1;
      researchLeads.push({
        label: "Возможно тот же человек",
        status: "same-name-patronymic-place-partly-unverified",
        summary: "Совпадают имя и отчество; место рождения в индексе gwar.mil.ru совпадает с местами профиля лишь частично (волость или уезд).",
        personIds: cluster.leads.slice(0, 6),
      });
    }
    const duplicates = [...cluster.possibleSame].map((other) => other.personId).filter((personId) => personId && personId !== cluster.personId);
    if (duplicates.length) {
      researchLeads.push({
        label: "Другой документ gwar.mil.ru с тем же именем и частью",
        status: "possible-duplicate-document-unverified",
        summary: "Совпадают фамилия, имя, отчество и часть, но место рождения в документах неполное или расходится, поэтому документы не сведены.",
        personIds: [...new Set(duplicates)].slice(0, 6),
      });
    }
    const birthPlaceEntry = mentionPlaces.find((place) => place.relation === "birth");
    const person = {
      schemaVersion: 1,
      personId: cluster.personId,
      displayName,
      sex: facts.sex,
      ...(mention.patronymic ? { patronymic: mention.patronymic } : {}),
      nameVariants: distinct([nameAsIndexed, ...alternateNames]).filter((name) => norm(name) !== norm(displayName)),
      surname: { normalized: facts.surname, formsAsWritten: distinct([facts.surname, ...facts.surnames, ...allDocs.flatMap((doc) => surnameTokens(doc.s.last_name)).map(titleCase)]) },
      ...(facts.birth?.year ? {
        birth: {
          year: facts.birth.year,
          display: facts.birth.display,
          ...(facts.birth.iso ? { date: facts.birth.iso } : {}),
          ...(birthPlaceEntry?.placeId ? { placeId: birthPlaceEntry.placeId } : {}),
          sourceIds: [sourceId],
        },
      } : {}),
      ...(event.type === "war-death" ? {
        death: {
          ...(event.date?.iso ? { date: event.date.iso } : {}),
          display: event.date?.display ?? "в годы Первой мировой войны",
          cause: event.reason,
          sourceIds: [sourceId],
        },
      } : {}),
      sourceIds: [sourceId],
      status: "documented-from-published-military-database",
      ...(ranks.length ? { occupation: mention.occupation.normalized === "сестра милосердия" ? "сестра милосердия" : `военнослужащий (${ranks.slice(0, 2).join(", ")})` } : {}),
      places: mentionPlaces.map((place) => Object.fromEntries(Object.entries(place).filter(([key]) => key !== "note"))),
      notes: [
        `Известен по порталу «${PROVIDER}» (Министерство обороны РФ, документы РГВИА). ${modernInterpretation}`,
        allDocs.length > 1
          ? `Профиль заведён по ${allDocs.length} документам портала, сведённым по фамилии, имени, отчеству и части; тождество с одноимёнными людьми из других записей не установлено.`
          : "Профиль заведён по одному документу портала; тождество с одноимёнными людьми из других записей не установлено.",
        "Портал gwar.mil.ru — производный индекс документов РГВИА: имена, даты и места нужно сверить с изображениями документов.",
      ],
      ...(researchLeads.length ? { researchLeads } : {}),
      profileOrigin: { method: "gwar-import", createdOn: RETRIEVED_ON, sourceId },
      ...(facts.birth ? {
        dates: {
          birth: {
            display: facts.birth.display,
            ...(facts.birth.iso ? { iso: facts.birth.iso } : {}),
            basis: `дата рождения по индексу gwar.mil.ru (${sourceId})`,
          },
        },
      } : {}),
    };
    const fileSlug = [slug(displayName), facts.birth?.year].filter(Boolean).join("-");
    newPeople.push({ person, file: `${cluster.personId}-${fileSlug}.json` });
  }

  for (const doc of allDocs) {
    searchRows.push({
      gwarId: gwarId(doc),
      url: docUrl(doc),
      type: doc.t,
      name: indexedName(doc),
      queries: doc.q,
      sourceId,
      ...(cluster.personId ? { personId: cluster.personId } : {}),
      ...(doc.ocr ? { surnameReading: doc.ocr.form ? `ошибка прочтения → ${doc.ocr.form}` : "ошибка прочтения, форма не установлена" } : {}),
      decision: !cluster.personId
        ? "record-without-profile-no-personal-name"
        : cluster.existingMatch
          ? doc === allDocs[0] ? "record-linked-to-existing-profile" : "merged-into-person-record"
          : doc === allDocs[0] ? "record-and-new-profile" : "merged-into-person-record",
    });
  }
}

// ---------------------------------------------------------------------------
// Report and write

const count = (items, key) => items.reduce((counts, item) => ({ ...counts, [key(item)]: (counts[key(item)] ?? 0) + 1 }), {});
const report = {
  stats,
  documentTypes: count(docs, (doc) => doc.t),
  records: records.length,
  ...linkStats,
  eventCounts: count(records, (record) => record.event.type),
  placeCounts: count(records, (record) => {
    const birth = record.mentions[0].places.find((place) => place.relation === "birth");
    return !birth ? "no-birthplace" : birth.placeId ? `linked-${birth.confidence}` : "unlinked";
  }),
  firstNewPersonId: `P${firstPersonNumber}`,
  lastNewPersonId: `P${nextPersonNumber - 1}`,
  linkedExisting: [...updatedPeople.keys()],
  ...(process.argv.includes("--debug") ? {
    ocrForms: count(docs.filter((doc) => doc.ocr), (doc) => `${doc.ocr.reading} → ${doc.ocr.form ?? "?"}`),
    lineForms: count(docs.filter((doc) => !doc.ocr), (doc) => doc.s.last_name),
    rejectedForms: count(rejectedRows, (row) => row.name.split(" ")[0]),
    linkEvidence: clusters.filter((cluster) => cluster.existingMatch || cluster.leads.length).map((cluster) => ({
      sourceId: cluster.sourceId,
      gwar: `${cluster.facts.firstName} ${cluster.facts.patronymic} ${cluster.facts.surname}`,
      places: cluster.facts.birthPlaces,
      match: cluster.existingMatch ? `${cluster.existingMatch} (${cluster.matchLevel}) ${existing.get(cluster.existingMatch).person.displayName}` : null,
      leads: cluster.leads,
    })),
  } : {}),
};
console.log(JSON.stringify(report, null, 2));

if (!dryRun) writeOutputs();

function writeOutputs() {
  const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
  mkdirSync(sourcesDir, { recursive: true });
  for (const record of records) writeJson(path.join(sourcesDir, `${record.sourceId}.json`), record);
  for (const { person, file } of newPeople) writeJson(path.join(peopleDir, file), person);
  for (const [personId, person] of updatedPeople) writeJson(path.join(peopleDir, existing.get(personId).file), person);

  writeJson(path.join(searchesDir, `${SEARCH_ID}.json`), {
    schemaVersion: 1,
    searchId: SEARCH_ID,
    date: RETRIEVED_ON,
    provider: PROVIDER,
    site: "https://gwar.mil.ru/",
    method: "Поиск «Герои войны» по фамилии через API портала (gt_data/?builder=Heroes, индекс gwar, по 200 документов, с паузами) в сессии браузера: портал не открывается прямыми HTTP-запросами. Поиск нечёткий: выдача включает соседние фамилии и ошибки прочтения рукописи, поэтому каждый документ отнесён к фамильному ряду по фамилии индекса.",
    queries: Object.entries(harvest.meta?.qstat ?? {}).map(([value, stat]) => ({
      page: "gt_data/?builder=Heroes",
      field: "last_name",
      value,
      resultCount: stat.total,
      retrieved: stat.got,
    })),
    scope: {
      decision: "Импортированы все формы фамильного ряда (Ампилогов, Анпилогов, Онпилогов, Анфилогов, Онфилогов, Ампилов, Анпилов, Анфилов, Анфилофьев, Анфилатов, их OCR-формы из импорта «Памяти народа» вроде Антилогов) и проверенный список ошибок прочтения индекса (misreadings: Ампологов, Антологов, Антилов и др.): такая форма отнесена к ближайшей форме ряда, а прочтение индекса сохранено в Record. Реальные соседние фамилии нечёткого поиска (Филатов, Антипов, Панфилов, Анфимов, Унтилов, Ампилохов и др.) и неоднозначные чтения отвергнуты и перечислены в rejected.",
      misreadings: [...LINE_MISREADINGS].join(", "),
      ocrReadingDocuments: stats.ocrReadings,
      publicCutoff: "Все документы портала относятся к 1914–1918 годам и входят в публичный охват.",
      map: "Места событий войны не добавлены в индекс мест, поэтому записи на карту не выводятся (как и записи «Памяти народа»).",
    },
    summary: report,
    results: searchRows,
    rejected: rejectedRows,
  });
  console.log(`Записано: ${records.length} Records, ${newPeople.length} новых профилей, ${updatedPeople.size} обновлённых профилей`);
}
