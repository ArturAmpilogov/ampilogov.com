// Imports «Память народа» (pamyat-naroda.ru) cards for the surname line.
//
// Input: a harvest of the site's `heroes/search` API, taken in the browser
// (the site answers plain HTTP clients with a security check). Each item is
// `{ tier, q, s }`: `s` is the API `_source` with null fields stripped, `q` the
// queries that returned it. The harvest is kept out of git in
// tmp/pamyat-naroda/.
//
// One Record per person: a pamyat-naroda person card (which already groups its
// documents) plus standalone documents that match it on name, patronymic, year
// and place of birth. One profile per Record, or a link to an existing profile
// when name, patronymic, birth year and birthplace all agree.
//
// Usage: node scripts/genealogy/import-pamyat-naroda.mjs <harvest.json> [--dry-run] [--first-id=114099]
// `--first-id` keeps the numbering of the original import (P114099–) when
// other imports have since taken higher numbers.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const harvestPath = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
// `--families=anfilof,anfilat` adds the cards of these surname families that
// earlier runs did not import, numbering new profiles from `--first-id`.
const familiesArgument = process.argv.find((argument) => argument.startsWith("--families="));
const onlyFamilies = familiesArgument ? new Set(familiesArgument.split("=")[1].split(",")) : null;
if (!harvestPath) throw new Error("Укажите путь к выгрузке «Памяти народа»");

const RETRIEVED_ON = "2026-10-20";
const PUBLIC_END_YEAR = 1950;
const SEARCH_ID = onlyFamilies ? `pamyat-naroda-${[...onlyFamilies].join("-")}-${RETRIEVED_ON}` : `pamyat-naroda-${RETRIEVED_ON}`;
const sourcesDir = path.join(root, "data/genealogy/sources/pamyat-naroda");
const peopleDir = path.join(root, "data/genealogy/people");
const searchesDir = path.join(root, "data/genealogy/searches");
const placesIndex = JSON.parse(readFileSync(path.join(root, "data/genealogy/places/index.json"), "utf8"));
const harvest = JSON.parse(readFileSync(harvestPath, "utf8"));
const typeIndex = harvest.meta?.typeIndex ?? {};

// ---------------------------------------------------------------------------
// Surname scope: every form of the line the site treats as a variant —
// Ампилогов, Анпилогов, Анфилогов, Онпилогов, Онфилогов, Ампилов, Анпилов,
// Анфилов — and the OCR forms of the index (Антилогов, Апилогов…). Families
// only group cards for matching; a person keeps the form of the documents.

const SURNAME_FAMILIES = [
  // Амилогов, Емпилогов, Емпалогов are documentary forms (surname-variants.json).
  ["ampilog", /^(?:ампилог|анпилог|антилог|ампелог|анпелог|апилог|аппилог|аппелог|анпиног|анплог|анпилос|онпилог|аминлог|аменлог|анлог|анклог|анлилог|анинлог|арепилог|алеплог|анчислог|амилог|емпилог|емпалог)/],
  ["anfilog", /^(?:анфилог|онфилог|амфилог)/],
  // Анфилофьев and Анфилатов come from the same baptismal name Анфилофий
  // (owner's decision of 2026-10-20).
  ["anfilof", /^(?:анфилоф|онфилоф|анфилаф)/],
  ["anfilat", /^(?:анфилат)/],
  ["ampilov", /^(?:ампилов|ампелов|импилов)/],
  ["anpilov", /^(?:анпилов|анпалов)/],
  ["anfilov", /^(?:анфилов|амфилов)/],
];

// Index readings such as «Ашпилогов», «Ампилагов», «Аннилогов» are OCR errors
// of the surname (owner's decision, 2026-10-20). The intended form is the
// nearest form of the line; a tie keeps the reading of the index.
const LINE_FORMS = [
  ["Ампилогов", "ampilog"], ["Анпилогов", "ampilog"], ["Онпилогов", "ampilog"], ["Анфилогов", "anfilog"],
  ["Онфилогов", "anfilog"], ["Ампилов", "ampilov"], ["Анпилов", "anpilov"], ["Анфилов", "anfilov"],
  ["Анфилофьев", "anfilof"], ["Анфилатов", "anfilat"],
];
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
// Real surnames one letter away from the line: not misreadings of it.
const OTHER_SURNAMES = /^(?:анфимов|анфалов|анфинов|анфанов|анфисов|панфилов|памфилов|танфилов|санфилов|антипов|амилов|ямпилов|анисимов)/;
// When a misreading is as close to two forms, the far more frequent family
// in the index wins (Анпилоговых in the base are ~50 times more than Анфилоговых).
const FAMILY_PRIOR = ["ampilog", "anpilov", "ampilov", "anfilov", "anfilog", "anfilof", "anfilat"];
function ocrReading(token) {
  const reading = norm(token).replace(/[^а-я]/g, "");
  if (!reading || OTHER_SURNAMES.test(reading)) return null;
  const feminine = /(ова|ева)$/.test(reading);
  const base = feminine ? reading.slice(0, -1) : reading;
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
const first = (value) => lst(value)[0];
const norm = (value) => String(value ?? "").normalize("NFKC").toLocaleLowerCase("ru").replace(/ё/g, "е").trim();

function surnameTokens(value) {
  return lst(value).flatMap((item) => String(item).split(/[\s,()]+/)).map((token) => token.replace(/^\[\.*\]/, "")).filter(Boolean);
}

function surnameFamily(token) {
  const value = norm(token);
  for (const [family, pattern] of SURNAME_FAMILIES) if (pattern.test(value)) return family;
  return null;
}

// ---------------------------------------------------------------------------
// Names

const titleCase = (value) => norm(value).replace(/(^|[\s-])([а-яa-z])/g, (_, lead, letter) => lead + letter.toLocaleUpperCase("ru"));
const MODERN_YO = new Map(Object.entries({
  федор: "фёдор", петр: "пётр", семен: "семён", артем: "артём", алена: "алёна", парфен: "парфён",
  аксен: "аксён", нефед: "нефёд", федорович: "фёдорович", федоровна: "фёдоровна", семенович: "семёнович",
  семеновна: "семёновна", артемович: "артёмович", артемовна: "артёмовна", парфенович: "парфёнович",
  парфеновна: "парфёновна", аксенович: "аксёнович", аксеновна: "аксёновна", нефедович: "нефёдович",
  нефедовна: "нефёдовна",
}));
// «Елизовета (Елизавета)»: the index gives the written form and, in brackets,
// the normalized one; the normalized form is the modern name.
const bracketForm = (value) => String(value ?? "").match(/\(([^()]+)\)\s*$/)?.[1]?.trim() ?? null;
const writtenForm = (value) => String(value ?? "").replace(/\s*\([^()]*\)\s*$/, "").trim();
// The modern name changes orthography only: Феодор is written Фёдор (project
// rule), but Стефан, Иоанн or Симеон stay as the document gives them.
const modernWord = (value) => {
  let base = norm(bracketForm(value) ?? value);
  if (base.startsWith("феодор")) base = `федор${base.slice("феодор".length)}`;
  return titleCase(MODERN_YO.get(base) ?? base);
};
// Church forms in metrical-book profiles (Феодор, Иоанн) against the everyday
// forms of wartime documents (Фёдор, Иван). Used only to find candidates.
const CHURCH_FORMS = [
  ["феодосий", "федосей"], ["феодосия", "федосья"], ["феодор", "федор"], ["иоанн", "иван"], ["симеон", "семен"],
  ["евфими", "ефим"], ["иаков", "яков"], ["косм", "кузьм"], ["димитри", "дмитри"], ["стефан", "степан"],
  ["захари", "захар"], ["параскев", "прасковь"], ["пелаги", "пелаге"], ["иулиани", "ульян"],
];
const canonicalName = (value) => {
  let text = norm(value);
  for (const [church, everyday] of CHURCH_FORMS) {
    if (text.startsWith(church)) return everyday + text.slice(church.length);
  }
  return text;
};

const isInitial = (value) => !value || /\./.test(value) || norm(value).length < 2;

function sexOf(patronymic, surname) {
  if (/(вна|чна|ична)$/.test(norm(patronymic))) return "female";
  if (/(вич|ич)$/.test(norm(patronymic))) return "male";
  if (/(ова|ева|ина)$/.test(norm(surname))) return "female";
  return "male";
}

const TRANSLIT = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l",
  м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh",
  щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};
const slug = (value) => norm(value).split("").map((letter) => TRANSLIT[letter] ?? letter).join("")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// ---------------------------------------------------------------------------
// Dates

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const MONTHS_NOMINATIVE = ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"];
const yearsIn = (value) => [...String(value).matchAll(/(?<!\d)(1[89]\d\d|20[0-2]\d)(?!\d)/g)].map((match) => Number(match[1]));

function parseDate(value) {
  const text = String(value ?? "");
  const full = text.match(/(?<!\d)(\d{1,2})\.(\d{1,2})\.(1[89]\d\d)(?!\d)/);
  if (full) {
    const [, day, month, year] = full.map(Number);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return {
        display: `${day} ${MONTHS[month - 1]} ${year} года`,
        iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        year,
      };
    }
  }
  const monthYear = text.match(/(?<!\d)(?:__|\?\?)\.(\d{1,2})\.(1[89]\d\d)(?!\d)/);
  if (monthYear) {
    const month = Number(monthYear[1]);
    const year = Number(monthYear[2]);
    if (month >= 1 && month <= 12) return { display: `${MONTHS_NOMINATIVE[month - 1]} ${year} года`, year };
  }
  const year = yearsIn(text)[0];
  return year ? { display: `${year} год`, year } : null;
}

const isPostPeriod = (value) => yearsIn(value).some((year) => year > PUBLIC_END_YEAR);

// ---------------------------------------------------------------------------
// Places

const SETTLEMENT_PREFIX = /^(?:с\.|с |село|д\.|дер\.|деревня|х\.|хут\.|хутор|п\.|пос\.|поселок|рп\.?|р\.п\.|пгт|г\.|город|ст-ца|станица|ст\.|сл\.|слобода|аул|м\.|мест\.|местечко|нп|н\.п\.)\s*/;
const REGION_WORD = /(?:обл\.?|область|край|кр\.|асср|сср|(?:^|\s)ао(?:\s|$)|автономн|республик|губ\.?|губерни)/;
const DISTRICT_WORD = /(?:р-н|район|р-на|уезд|(?:^|\s)у\.|округ)/;
const adjectiveStem = (word) => norm(word).replace(/[^а-я-]/g, "").replace(/(ский|ской|ская|ское|цкий|цкая|ный|ная|ний|ий|ый|ой|ая|ое)$/, "");
// «Курская» → «курск»: long enough to search for in place labels.
const regionRoot = (word) => norm(word).replace(/[^а-я-]/g, "").replace(/(ая|ий|ой|ое|ый)$/, "");
// Wartime oblast names and the names place labels use.
const REGION_SYNONYMS = new Map(Object.entries({
  чкаловск: ["оренбургск"], куйбышевск: ["самарск"], сталинск: ["донецк"], молотовск: ["пермск"],
  калининск: ["тверск"], горьковск: ["нижегородск"], орджоникидзевск: ["ставропольск"], белгородск: ["курск", "воронежск"],
  ульяновск: ["симбирск"], краснодарск: ["кубанск"],
}));
const regionRoots = (root) => (root ? [root, ...(REGION_SYNONYMS.get(root) ?? [])] : []);

function parsePlace(raw) {
  const text = norm(raw).replace(/\s+/g, " ");
  const parts = text.split(/[,;]/).map((part) => part.trim()).filter(Boolean);
  const place = { raw, region: null, district: null, settlements: [] };
  for (const part of parts) {
    if (REGION_WORD.test(part)) {
      place.region ??= regionRoot(part.split(" ")[0]);
      continue;
    }
    if (DISTRICT_WORD.test(part)) {
      place.district ??= adjectiveStem(part.split(" ")[0]);
      continue;
    }
    if (/(?:с\/с|сельсовет|волость|вол\.|колхоз|совхоз)/.test(part)) continue;
    const name = part.replace(SETTLEMENT_PREFIX, "").replace(/[«»"()]/g, "").trim();
    if (name && name.length > 2) place.settlements.push(name);
  }
  // «Курская область Черемисиновский район поселок Кучига» — no commas.
  if (parts.length === 1 && !place.settlements.length) {
    const words = text.split(" ");
    const settlementIndex = words.findIndex((word) => /^(?:село|деревня|поселок|хутор|станица|город|с\.|д\.|п\.|х\.|г\.)$/.test(word));
    if (settlementIndex >= 0 && words[settlementIndex + 1]) place.settlements.push(words.slice(settlementIndex + 1).join(" "));
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

// "match" — a shared settlement (or district when neither names a settlement);
// "conflict" — both name settlements (or districts) and none agree.
function comparePlaces(leftPlaces, rightPlaces) {
  const left = leftPlaces.map(parsePlace);
  const right = rightPlaces.map(parsePlace);
  const leftSettlements = left.flatMap((place) => place.settlements);
  const rightSettlements = right.flatMap((place) => place.settlements);
  if (leftSettlements.length && rightSettlements.length) {
    return leftSettlements.some((a) => rightSettlements.some((b) => similar(a, b))) ? "match" : "conflict";
  }
  const leftDistricts = left.map((place) => place.district).filter(Boolean);
  const rightDistricts = right.map((place) => place.district).filter(Boolean);
  if (leftDistricts.length && rightDistricts.length) {
    return leftDistricts.some((a) => rightDistricts.some((b) => similar(a, b))) ? "district" : "conflict";
  }
  return "unknown";
}

const placesById = new Map(placesIndex.places.map((place) => [place.placeId, place]));
// The label without the place's own names: «Никольское» must not confirm a
// «Никольский р-н», nor «Николаевск» a «Николаевская обл.».
const placeContext = (place) => {
  const ownNames = [place.name, ...(place.aliases ?? [])]
    .map((name) => norm(name).split(/[,(]/)[0].replace(SETTLEMENT_PREFIX, "").trim())
    .filter((name) => name.length > 2);
  let text = norm([place.label, ...(place.aliases ?? []), place.geo?.note ?? ""].join(" | "));
  for (const name of ownNames.sort((a, b) => b.length - a.length)) text = text.split(name).join(" ");
  return text;
};
const settlementPlaces = new Map();
const districtPlaces = new Map();
for (const place of placesIndex.places) {
  const names = [place.name, ...(place.aliases ?? []), place.label].filter(Boolean);
  const isDistrict = /district|volost|uezd/.test(place.kind ?? "") || place.geo?.precision === "district";
  for (const name of names) {
    const head = norm(name).split(/[,(]/)[0].replace(SETTLEMENT_PREFIX, "").trim();
    if (!head) continue;
    if (isDistrict) {
      const stem = adjectiveStem(head.split(" ")[0]);
      if (stem.length >= 4) districtPlaces.set(stem, [...new Set([...(districtPlaces.get(stem) ?? []), place.placeId])]);
    } else if (!/governorate|region|oblast|krai|asr|line|razryad/.test(place.placeId)) {
      settlementPlaces.set(head, [...new Set([...(settlementPlaces.get(head) ?? []), place.placeId])]);
    }
  }
}

// A Soviet oblast is not the governorate of the same name; the tag is only a
// regional pointer and always carries low confidence.
const REGION_PLACE_IDS = new Map(Object.entries({
  курская: "kursk-governorate", воронежская: "voronezh-governorate", орловская: "orel-governorate",
  тамбовская: "tambov-governorate", пензенская: "penza-governorate", харьковская: "kharkov-governorate",
  полтавская: "poltava-governorate", черниговская: "chernigov-governorate", херсонская: "kherson-governorate",
  одесская: "odessa-governorate", самарская: "samara-governorate", куйбышевская: "samara-governorate",
  ульяновская: "simbirsk-governorate", оренбургская: "orenburg-governorate", чкаловская: "orenburg-governorate",
  томская: "tomsk-governorate", красноярский: "yenisei-governorate", ставропольский: "stavropol-governorate",
  орджоникидзевский: "stavropol-governorate", костромская: "kostroma-governorate", донецкая: "donetsk-oblast",
  сталинская: "donetsk-oblast", мурманская: "murmansk-oblast", пермская: "perm-region", молотовская: "perm-region",
  коми: "komi-asr", карагандинская: "karaganda-oblast", татарская: "tatar-assr", архангельская: "arkhangelsk-oblast",
  тульская: "tula-governorate", астраханская: "astrakhan-governorate", иркутская: "irkutsk-governorate",
  калининская: "tver-governorate", тверская: "tver-governorate",
}).map(([adjective, placeId]) => [regionRoot(adjective), placeId]));

// Names shared by hundreds of villages: without a district in the index entry
// they say nothing about which village is meant.
const COMMON_SETTLEMENT_NAMES = new Set([
  "михайловка", "михайловское", "никольское", "николаевка", "ивановка", "александровка", "покровка", "покровское",
  "троицкое", "троицкая", "петровка", "петровское", "васильевка", "знаменка", "богородицкое", "воскресенское",
  "успенка", "андреевка", "алексеевка", "дмитриевка", "сергеевка", "григорьевка", "павловка", "владимировка",
  "ольховка", "березовка", "каменка", "степановка", "новоселки", "новоселовка", "красное", "песчанка",
  "веселое", "орловка", "ивановское", "спасское", "богдановка", "федоровка", "марьевка", "екатериновка",
]);

function linkPlace(raw) {
  const parsed = parsePlace(raw);
  const regions = regionRoots(parsed.region);
  const regionFits = (text) => regions.some((root) => root.length >= 4 && text.includes(root));
  const fits = (placeId) => {
    const text = placeContext(placesById.get(placeId));
    return regionFits(text) || Boolean(parsed.district && parsed.district.length >= 4 && text.includes(parsed.district));
  };
  // When the index names a Soviet district for the place, the person's
  // district must agree: «Михайловка» exists in many districts.
  const districtAgrees = (placeId, settlement) => {
    const context = placeContext(placesById.get(placeId));
    if (COMMON_SETTLEMENT_NAMES.has(settlement) && !/(?:р-н|район|уезд|волост|кантон|округ)/.test(context)) return false;
    if (!parsed.district || !/(?:р-н|район)/.test(context)) return true;
    return context.split(/[^а-я-]+/).some((word) => similar(adjectiveStem(word), parsed.district));
  };
  for (const settlement of parsed.settlements) {
    const candidates = (settlementPlaces.get(settlement) ?? []).filter((placeId) => fits(placeId) && districtAgrees(placeId, settlement));
    if (candidates.length === 1) {
      return { placeId: candidates[0], confidence: "medium", basis: "settlement" };
    }
  }
  if (parsed.district) {
    const candidates = (districtPlaces.get(parsed.district) ?? []).filter((placeId) => (
      !parsed.region || regionFits(placeContext(placesById.get(placeId)))
    ));
    if (candidates.length === 1) return { placeId: candidates[0], confidence: "low", basis: "district" };
  }
  if (parsed.region) {
    const placeId = REGION_PLACE_IDS.get(parsed.region);
    if (placeId && placesById.has(placeId)) return { placeId, confidence: "low", basis: "region" };
  }
  return null;
}

function normalizedPlace(raw) {
  return String(raw).replace(/\s+/g, " ").replace(/\s*,\s*/g, ", ").trim();
}

// ---------------------------------------------------------------------------
// Documents

const DOC_TYPES = {
  hero: "Сводная карточка человека",
  chelovek_donesenie: "Донесение о безвозвратных потерях",
  chelovek_dopolnitelnoe_donesenie: "Документ, уточняющий потери",
  chelovek_prikaz: "Приказ об исключении из списков",
  chelovek_gospital: "Документ госпиталя",
  chelovek_kartoteka_memorial: "Учётная картотека ЦАМО",
  chelovek_kniga_pamyati: "Книга памяти",
  chelovek_pechatnoi_knigi_pamyati: "Печатная Книга памяти",
  chelovek_plen: "Документ о пленении",
  chelovek_zahoronenie: "Сведения о захоронении",
  chelovek_eksgumatsiya: "Акт эксгумации",
  chelovek_vpp: "Документ пересыльного пункта",
  chelovek_spisok: "Именной список части",
  chelovek_voenkomat: "Документ военкомата",
  chelovek_nagrazhdenie: "Приказ о награждении",
  chelovek_predstavlenie: "Представление к награде",
  chelovek_kartoteka: "Картотека награждений",
  nagrada_kartoteka: "Карточка награждения",
  chelovek_yubileinaya_kartoteka: "Юбилейная картотека награждений",
  chelovek_in_kartoteka: "Картотека иностранных наград",
  nagrada_in_kartoteka: "Карточка иностранной награды",
  card_ran: "Картотека ранений",
  card_bolezn: "Свидетельство о болезни",
  card_kld: "Картотека личных дел офицеров",
  card_uchet_officer: "Учётно-послужная картотека офицеров",
  card_vmf: "Картотека моряков",
  card_partizan: "Картотека партизан",
  person_doroga: "«Дорога памяти»: сведения родственников",
  person_rvk: "«Дорога памяти»: списки военкомата",
  person_guk: "«Дорога памяти»: учётные данные",
  commander: "Командующий",
};

const FIELD_LABELS = [
  ["last_name", "Фамилия"], ["first_name", "Имя"], ["middle_name", "Отчество"],
  ["date_birth", "Дата рождения"], ["place_birth", "Место рождения"],
  ["data_i_mesto_priziva", "Дата и место призыва"], ["voenkomat", "Военкомат"], ["data_priziva", "Дата призыва"],
  ["s_kakogo_goda_v_ka", "В Красной армии с"],
  ["rank", "Воинское звание"], ["post", "Должность"], ["dolzhnost", "Должность"],
  ["division", "Воинская часть"], ["poslednee_mesto_sluzhbi", "Последнее место службы"],
  ["unit_date_from", "Служба с"], ["unit_date_to", "Служба по"],
  ["partizan_unit_name", "Партизанский отряд"], ["partizan_unit_date_from", "В отряде с"], ["partizan_unit_date_to", "В отряде по"],
  ["naimenovanie_nagradi", "Награда"], ["pervaya_data_podviga", "Дата подвига"], ["kto_nagradil", "Кем награждён"],
  ["data_dokumenta", "Дата документа"], ["nomer_dokumenta", "Номер документа"], ["feat_description", "Из описания подвига"],
  ["nazvanie_vpp", "Пересыльный пункт"], ["otkuda_pribil", "Откуда прибыл"], ["kogda_pribil", "Когда прибыл"],
  ["iz_kakoi_chasti_pribil_data", "Дата прибытия"], ["kuda_vibil", "Куда выбыл"], ["kuda_vibil_nazvanie", "Куда выбыл (часть)"],
  ["kuda_vibil_adres", "Адрес выбытия"], ["kogda_vibil", "Когда выбыл"], ["kogda_vibil_data", "Дата выбытия из пункта"],
  ["nomer_komandi", "Номер команды"], ["gospital", "Госпиталь"],
  ["prichina_vibitiya", "Причина выбытия"], ["data_vibitiya", "Дата выбытия"], ["mesto_vibitiya", "Место выбытия"],
  ["destiny", "Судьба"], ["data_pleneniya", "Дата пленения"], ["mesto_pleneniya", "Место пленения"],
  ["lager", "Лагерь"], ["lagernii_nomer", "Лагерный номер"], ["date_death", "Дата смерти"],
  ["data_i_pervichnoe_mesto_zahoroneniya", "Первичное место захоронения"], ["mesto_zahoroneniya", "Место захоронения"],
  ["region_zahoroneniya", "Регион захоронения"], ["strana_zahoroneniya", "Страна захоронения"], ["mogila", "Могила"],
  ["otkuda_perezahoronen", "Откуда перезахоронен"], ["biography", "Биографические сведения"], ["history", "Дополнительные сведения"],
  ["card_number", "Номер карточки"], ["personal_number", "Личный номер"],
  ["nazvanie_istochnika_informatsii", "Источник информации"], ["arhiv", "Архив"], ["kartoteka", "Картотека"],
  ["nomer_fonda", "Фонд"], ["nomer_opisi", "Опись"], ["nomer_dela", "Дело"], ["shkaf_i_yaschik", "Шкаф и ящик"],
  ["shkaf_number", "Шкаф"], ["box_number", "Ящик"],
];
const DATE_FIELD = /^(?:data_|date_|kogda_|unit_date_|s_kakogo_goda|pervaya_data|iz_kakoi_chasti_pribil_data|partizan_unit_date)/;
const FREE_TEXT_FIELDS = new Set(["history", "biography", "feat_description"]);
const POST_PERIOD_TYPES = new Set(["chelovek_yubileinaya_kartoteka"]);
const POST_PERIOD_DATE_TEXT = /\d{1,2}\.\d{1,2}\.(?:195[1-9]|19[6-9]\d|20[0-2]\d)|(?:195[1-9]|19[6-9]\d|20[0-2]\d)\s*(?:г\.|г\s|г$|год)/;

const docType = (doc) => doc.__type ?? doc._type;
const docId = (doc) => doc.id ?? doc._id;
const docIndex = (doc) => doc._index ?? doc.__index ?? typeIndex[docType(doc)] ?? (docType(doc) === "commander" ? "pamyat" : "memorial");
const docUrl = (doc) => docType(doc) === "hero"
  ? `https://pamyat-naroda.ru/heroes/person-hero${docId(doc)}/`
  : `https://pamyat-naroda.ru/heroes/${docIndex(doc)}-${docType(doc)}${docId(doc)}/`;

// A value is public when it carries no date after 1950. Date fields are read
// as dates; free text is dropped whenever it names a later year.
function publicValue(key, value) {
  const items = lst(value).map((item) => String(item).trim()).filter((item) => item && item !== "0");
  if (!items.length) return null;
  if (DATE_FIELD.test(key) && items.some(isPostPeriod)) return null;
  // Free text loses a field only for a dated mention after 1950, not for a
  // unit or hill number such as «1952 сп» or «высота 1955».
  if (FREE_TEXT_FIELDS.has(key) && items.some((item) => POST_PERIOD_DATE_TEXT.test(item))) return null;
  return [...new Set(items)].join("; ");
}

function docIsPublic(doc) {
  if (POST_PERIOD_TYPES.has(docType(doc))) return false;
  return !isPostPeriod(first(doc.data_dokumenta) ?? "");
}

function archiveCitation(doc) {
  const archive = first(doc.arhiv) ?? first(doc.nazvanie_istochnika_informatsii);
  const fond = first(doc.nomer_fonda);
  const inventory = first(doc.nomer_opisi);
  const file = first(doc.nomer_dela);
  if (archive === "ЦАМО" && fond && inventory && file) return `ЦАМО, ф. ${fond}, оп. ${inventory}, д. ${file}`;
  const parts = [archive, fond, inventory ? `опись ${inventory}` : null, file ? (/^(?:шкаф|ящик)/i.test(String(file)) ? file : `дело ${file}`) : null, first(doc.kartoteka), first(doc.shkaf_i_yaschik)]
    .filter(Boolean);
  return parts.length ? [...new Set(parts)].join(", ") : null;
}

function docText(doc, number) {
  const fields = FIELD_LABELS.flatMap(([key, label]) => {
    const value = publicValue(key, doc[key]);
    return value ? [`${label}: ${value}`] : [];
  });
  const sentences = fields.map((field) => (/[.!?…»]$/.test(field) ? field : `${field}.`));
  return `[${number}] ${DOC_TYPES[docType(doc)] ?? docType(doc)}. ${sentences.join(" ")}`;
}

// ---------------------------------------------------------------------------
// Fates and events

const FATE_PRIORITY = ["execution", "war-death", "missing-in-action", "prisoner-of-war", "conviction", "desertion"];
function fateOf(reason) {
  const text = norm(reason);
  if (!text) return null;
  if (/(?:^|[^а-я])вмн(?:[^а-я]|$)|расстрел/.test(text)) return "execution";
  if (/(?:погиб|умер) в плену/.test(text)) return "war-death";
  if (/пропал без вести/.test(text)) return "missing-in-action";
  if (/убит|погиб|умер/.test(text)) return "war-death";
  if (/плен/.test(text)) return "prisoner-of-war";
  if (/осужд|трибунал/.test(text)) return "conviction";
  if (/дезертир/.test(text)) return "desertion";
  return null;
}

function fateDate(doc, fate) {
  const candidates = fate === "prisoner-of-war"
    ? [doc.data_pleneniya, doc.data_vibitiya]
    : fate === "war-death" || fate === "execution"
      ? [doc.data_vibitiya, doc.date_death]
      : [doc.data_vibitiya];
  for (const candidate of candidates.flatMap(lst)) {
    if (isPostPeriod(candidate)) continue;
    const parsed = parseDate(candidate);
    if (parsed) return parsed;
  }
  return null;
}

const awardDocTypes = new Set(["chelovek_nagrazhdenie", "nagrada_kartoteka", "chelovek_predstavlenie", "chelovek_kartoteka", "nagrada_in_kartoteka", "chelovek_in_kartoteka", "card_partizan"]);

function chooseEvent(person) {
  const docs = person.docs;
  const fates = docs.flatMap((doc) => {
    const reasons = lst(doc.prichina_vibitiya);
    if (docType(doc) === "chelovek_plen" && !reasons.length) reasons.push("попал в плен");
    const datedAfterPeriod = [doc.data_vibitiya, doc.date_death].flatMap(lst).some(isPostPeriod);
    return reasons.map((reason) => ({ fate: fateOf(reason), reason, doc }))
      .filter((item) => item.fate && !datedAfterPeriod);
  });
  fates.sort((left, right) => FATE_PRIORITY.indexOf(left.fate) - FATE_PRIORITY.indexOf(right.fate) ||
    (fateDate(left.doc, left.fate)?.iso ? 0 : 1) - (fateDate(right.doc, right.fate)?.iso ? 0 : 1));
  if (fates.length) {
    const chosen = fates[0];
    const date = fateDate(chosen.doc, chosen.fate);
    return { type: chosen.fate, date, reason: chosen.reason, doc: chosen.doc, fates };
  }
  const awardDates = docs.filter((doc) => awardDocTypes.has(docType(doc)))
    .flatMap((doc) => lst(doc.data_dokumenta).map(parseDate)).filter(Boolean).sort((a, b) => (a.iso ?? `${a.year}`).localeCompare(b.iso ?? `${b.year}`));
  if (docs.some((doc) => awardDocTypes.has(docType(doc)))) {
    return { type: "military-award", date: awardDates[0] ?? null, fates };
  }
  const conscription = docs.flatMap((doc) => [...lst(doc.data_priziva), ...lst(doc.data_i_mesto_priziva)])
    .filter((value) => !isPostPeriod(value)).map(parseDate).find((date) => date && date.year >= 1939);
  if (conscription) return { type: "military-conscription", date: conscription, fates };
  const serviceDate = docs.flatMap((doc) => [doc.kogda_pribil, doc.iz_kakoi_chasti_pribil_data, doc.data_vibitiya, doc.unit_date_from, doc.kogda_vibil])
    .flatMap(lst).filter((value) => !isPostPeriod(value)).map(parseDate).filter((date) => date && date.year >= 1939)
    .sort((a, b) => a.year - b.year)[0];
  return { type: "military-service", date: serviceDate ?? null, fates };
}

const FATE_NOTES = {
  "execution": "ВМН — высшая мера наказания",
};

// ---------------------------------------------------------------------------
// Load cards

// Cards already in a PN Record (any earlier run) are not imported again.
const importedCardIds = new Set();
if (onlyFamilies) {
  for (const name of readdirSync(sourcesDir).filter((file) => file.endsWith(".json"))) {
    const record = JSON.parse(readFileSync(path.join(sourcesDir, name), "utf8"));
    for (const id of record.review?.harvest?.pamyatNarodaIds ?? []) importedCardIds.add(id);
  }
}
const cards = [];
const stats = { cards: 0, inScope: 0, ocrReadings: 0, doubtful: 0, noPublicDocs: 0 };
const doubtfulRows = [];
const postPeriodRows = [];
for (const item of harvest.items) {
  const card = item.s;
  stats.cards += 1;
  const heroDocs = docType(card) === "hero" ? lst(card.docs) : [];
  const docs = heroDocs.length ? heroDocs : [card];
  const tokens = [...surnameTokens(card.last_name), ...docs.flatMap((doc) => surnameTokens(doc.last_name))];
  let families = tokens.map(surnameFamily).filter(Boolean);
  // The site groups documents by person; a card whose own surname is outside
  // the line («Анфимов», «Петрова») and only one document reads «Анфилов» is
  // most likely a misread of the other surname, not of ours.
  const primaryToken = surnameTokens(card.last_name)[0];
  if (families.length && !surnameFamily(primaryToken ?? "") && !ocrReading(primaryToken ?? "") && families.length * 2 < tokens.length) {
    stats.doubtful += 1;
    doubtfulRows.push({
      pamyatNarodaId: `${docIndex(card)}-${docType(card)}${docId(card)}`,
      url: docUrl(card),
      name: [first(card.last_name), first(card.first_name), first(card.middle_name)].filter(Boolean).join(" "),
      birth: first(card.date_birth) ?? null,
      decision: "card-surname-outside-the-line-minority-variant",
    });
    continue;
  }
  let ocr = null;
  if (!families.length) {
    ocr = tokens.map(ocrReading).find(Boolean) ?? null;
    if (!ocr) {
      stats.doubtful += 1;
      doubtfulRows.push({
        pamyatNarodaId: `${docIndex(card)}-${docType(card)}${docId(card)}`,
        url: docUrl(card),
        name: [first(card.last_name), first(card.first_name), first(card.middle_name)].filter(Boolean).join(" "),
        birth: first(card.date_birth) ?? null,
        decision: "surname-form-not-close-to-the-line",
      });
      continue;
    }
    stats.ocrReadings += 1;
    families = [ocr.family];
  }
  const familyCounts = families.reduce((counts, family) => ({ ...counts, [family]: (counts[family] ?? 0) + 1 }), {});
  const family = Object.entries(familyCounts).sort((a, b) => b[1] - a[1])[0][0];
  if (onlyFamilies && (!onlyFamilies.has(family) || importedCardIds.has(`${docIndex(card)}-${docType(card)}${docId(card)}`))) continue;
  const publicDocs = docs.filter(docIsPublic);
  if (!publicDocs.length) {
    stats.noPublicDocs += 1;
    postPeriodRows.push({
      pamyatNarodaId: `${docIndex(card)}-${docType(card)}${docId(card)}`,
      url: docUrl(card),
      name: [first(card.last_name), first(card.first_name), first(card.middle_name)].filter(Boolean).join(" "),
      decision: "only-documents-after-1950",
      documentTypes: [...new Set(docs.map(docType))],
    });
    continue;
  }
  stats.inScope += 1;
  cards.push({
    card,
    hero: docType(card) === "hero",
    family,
    docs: publicDocs,
    omittedDocs: docs.length - publicDocs.length,
    queries: item.q,
    ocr,
  });
}

// ---------------------------------------------------------------------------
// Person facts per card

function inScopeSurnames(card) {
  const forms = [card.card.last_name, ...card.docs.map((doc) => doc.last_name)].flatMap(surnameTokens)
    .filter((token) => surnameFamily(token)).map(titleCase);
  const counts = new Map();
  for (const form of forms) counts.set(form, (counts.get(form) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([form]) => form);
}

function cardFacts(card) {
  const source = card.card;
  const docs = card.docs;
  const firstName = first(source.first_name) ?? docs.map((doc) => first(doc.first_name)).find(Boolean) ?? "";
  const patronymic = first(source.middle_name) ?? docs.map((doc) => first(doc.middle_name)).find(Boolean) ?? "";
  const primarySurnameToken = surnameTokens(source.last_name).find((token) => surnameFamily(token));
  const sex = sexOf(patronymic, titleCase(primarySurnameToken ?? ""));
  // Indexes sometimes give a man the feminine form or a woman the masculine
  // one; the normalized name follows the person's sex.
  const genderForm = (form) => {
    const feminine = /(ова|ева)$/.test(norm(form));
    if (sex === "female") return feminine ? form : `${form}а`;
    return feminine ? form.slice(0, -1) : form;
  };
  const ocrForm = card.ocr ? titleCase(card.ocr.form ?? card.ocr.reading) : null;
  const surnames = [...new Set((ocrForm ? [ocrForm] : inScopeSurnames(card)).map(genderForm))];
  const surname = surnames[0] ?? genderForm(titleCase(primarySurnameToken ?? ""));
  const birthValues = [...lst(source.date_birth), ...docs.flatMap((doc) => lst(doc.date_birth))];
  const birthDates = birthValues.map(parseDate).filter((date) => date && date.year <= PUBLIC_END_YEAR);
  const statedBirth = parseDate(first(source.date_birth));
  const birth = statedBirth && statedBirth.year <= PUBLIC_END_YEAR ? statedBirth : birthDates[0] ?? null;
  const birthYears = [...new Set(birthDates.map((date) => date.year))];
  const birthPlaces = [...new Set([...lst(source.place_birth), ...docs.flatMap((doc) => lst(doc.place_birth))].map(normalizedPlace))];
  return { firstName, patronymic, surname, surnames, birth, birthYears, birthPlaces, sex };
}

for (const card of cards) card.facts = cardFacts(card);

// ---------------------------------------------------------------------------
// Clustering

const nameKey = (value) => canonicalName(bracketForm(value) ?? writtenForm(value));
const personKey = (family, facts) => [family, nameKey(facts.firstName), nameKey(facts.patronymic)].join("|");
const clusters = [];
const byKey = new Map();
const addCluster = (card) => {
  const cluster = { cards: [card], family: card.family, facts: card.facts, possibleSame: new Set() };
  clusters.push(cluster);
  const key = personKey(card.family, card.facts);
  byKey.set(key, [...(byKey.get(key) ?? []), cluster]);
  return cluster;
};
const named = (facts) => !isInitial(facts.firstName);
const sortedCards = [...cards].sort((left, right) => Number(right.hero) - Number(left.hero) || String(docId(left.card)).localeCompare(String(docId(right.card))));

// «Мих. Андреевич», «Ник. Вас.»: an abbreviated name joins a named person only
// when the abbreviation, patronymic, year and place leave a single candidate.
const abbreviation = (value) => {
  const text = norm(value);
  const match = text.match(/^([а-я]{3,})\.$/);
  return match ? match[1] : null;
};
const namePartMatches = (short, full) => {
  const stem = abbreviation(short);
  return stem ? nameKey(full).startsWith(canonicalName(stem)) : nameKey(short) === nameKey(full);
};
const abbreviatedCards = [];

for (const card of sortedCards) {
  if (!card.hero && !named(card.facts) && abbreviation(card.facts.firstName) && card.facts.birth?.year) {
    abbreviatedCards.push(card);
    continue;
  }
  if (card.hero || !named(card.facts)) {
    addCluster(card);
    continue;
  }
  const key = personKey(card.family, card.facts);
  const year = card.facts.birth?.year;
  const candidates = (byKey.get(key) ?? []).filter((cluster) => {
    const clusterYears = cluster.cards.flatMap((member) => member.facts.birthYears);
    const placeCheck = comparePlaces(card.facts.birthPlaces, cluster.cards.flatMap((member) => member.facts.birthPlaces));
    if (placeCheck === "conflict") return false;
    if (year && clusterYears.length) return clusterYears.includes(year);
    // Without a year on one side, only a shared settlement ties the cards.
    return placeCheck === "match";
  });
  if (candidates.length === 1) {
    candidates[0].cards.push(card);
    continue;
  }
  const cluster = addCluster(card);
  for (const candidate of candidates) {
    cluster.possibleSame.add(candidate);
    candidate.possibleSame.add(cluster);
  }
}

for (const card of abbreviatedCards) {
  const year = card.facts.birth.year;
  const candidates = clusters.filter((cluster) => cluster.family === card.family && named(cluster.facts) &&
    namePartMatches(card.facts.firstName, cluster.facts.firstName) &&
    card.facts.patronymic && namePartMatches(card.facts.patronymic, cluster.facts.patronymic) &&
    cluster.cards.some((member) => member.facts.birthYears.includes(year)) &&
    comparePlaces(card.facts.birthPlaces, cluster.cards.flatMap((member) => member.facts.birthPlaces)) !== "conflict");
  if (candidates.length === 1) candidates[0].cards.push(card);
  else addCluster(card);
}

// Same name, patronymic and year in separate clusters: possible duplicates.
for (const sameName of byKey.values()) {
  for (const left of sameName) {
    for (const right of sameName) {
      if (left === right) continue;
      const leftYears = left.cards.flatMap((card) => card.facts.birthYears);
      const rightYears = right.cards.flatMap((card) => card.facts.birthYears);
      if (leftYears.some((year) => rightYears.includes(year)) &&
          comparePlaces(left.cards.flatMap((card) => card.facts.birthPlaces), right.cards.flatMap((card) => card.facts.birthPlaces)) !== "conflict") {
        left.possibleSame.add(right);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Existing profiles

const SITE_VARIANT = /^(?:анфилат|ампилог|ампилов|импилов|амфилог|амфилов|анпилог|анпилов|анфилог|анфилоф|анфилов|онфилог|онфилоф|онпилог|антилог|анпалов|ампелог|ампелов|анпелог|анпилос|анпиног|анплог|апилог|аппилог|аппелог)/;
const existingFiles = readdirSync(peopleDir).filter((name) => name.endsWith(".json"));
const existing = new Map();
let alreadyImported = false;
const existingByKey = new Map();
const existingByPlace = new Map();
let maxPersonNumber = 0;
for (const file of existingFiles) {
  const person = JSON.parse(readFileSync(path.join(peopleDir, file), "utf8"));
  existing.set(person.personId, { person, file });
  if (person.profileOrigin?.method === "pamyat-naroda-import") alreadyImported = true;
  maxPersonNumber = Math.max(maxPersonNumber, Number(person.personId.slice(1)) || 0);
  const parts = String(person.displayName ?? "").split(/\s+/);
  const surname = norm(person.surname?.normalized ?? parts.at(-1));
  if (!SITE_VARIANT.test(surname) || parts.length < 3) continue;
  const family = surnameFamily(surname);
  const birthYear = Number(String(person.birth?.year ?? person.birth?.display ?? person.dates?.birth?.display ?? person.birthEstimate?.year ?? "").match(/1[6-9]\d\d/)?.[0]) || null;
  const places = (person.places ?? []).flatMap((place) => [place.asWritten, place.normalized, placesById.get(place.placeId)?.label]).filter(Boolean);
  if (person.birth?.placeId && placesById.get(person.birth.placeId)) places.push(placesById.get(person.birth.placeId).label);
  const entry = { personId: person.personId, family, birthYear, places, person };
  if (family && birthYear && birthYear >= 1860) {
    const key = [family, canonicalName(parts[0]), canonicalName(parts[1]), birthYear].join("|");
    existingByKey.set(key, [...(existingByKey.get(key) ?? []), entry]);
  }
  for (const place of person.places ?? []) {
    const indexed = placesById.get(place.placeId);
    if (!indexed || /governorate|region|oblast|krai|uezd|district|asr/.test(indexed.placeId)) continue;
    existingByPlace.set(indexed.placeId, [...new Set([...(existingByPlace.get(indexed.placeId) ?? []), person.personId])]);
  }
}

// A second run over its own output would number every profile again.
if (alreadyImported && !dryRun && !onlyFamilies) {
  throw new Error("Профили «Памяти народа» уже импортированы; откатите их перед повторным запуском");
}

function deathYear(person) {
  return Number(String(person.death?.date ?? person.death?.display ?? person.dates?.death?.display ?? "").match(/1[6-9]\d\d/)?.[0]) || null;
}

// ---------------------------------------------------------------------------
// Build records and profiles

const sourceIdOf = (cluster) => {
  const seed = cluster.cards[0].card;
  return docType(seed) === "hero" ? `PN-PERSON-${docId(seed)}` : `PN-${docIndex(seed).toUpperCase()}-${docId(seed)}`;
};

clusters.sort((left, right) => {
  const a = left.facts;
  const b = right.facts;
  return a.surname.localeCompare(b.surname, "ru") || a.firstName.localeCompare(b.firstName, "ru") ||
    a.patronymic.localeCompare(b.patronymic, "ru") || (a.birth?.year ?? 0) - (b.birth?.year ?? 0) ||
    sourceIdOf(left).localeCompare(sourceIdOf(right));
});

const firstIdArgument = process.argv.find((argument) => argument.startsWith("--first-id="));
let nextPersonNumber = firstIdArgument ? Number(firstIdArgument.split("=")[1]) : maxPersonNumber + 1;
const firstPersonNumber = nextPersonNumber;
const newPeople = [];
const updatedPeople = new Map();
const records = [];
const searchRows = [];
const linkStats = { linkedExisting: 0, newProfiles: 0, noProfile: 0, possibleSameExisting: 0 };

for (const cluster of clusters) {
  cluster.sourceId = sourceIdOf(cluster);
  const facts = cluster.facts;
  const year = facts.birth?.year ?? null;
  cluster.year = year;
  if (!named(facts)) continue;
  const key = [cluster.family, nameKey(facts.firstName), nameKey(facts.patronymic), year].join("|");
  const candidates = year ? existingByKey.get(key) ?? [] : [];
  const firstWarYear = 1939;
  const strong = candidates.filter((candidate) => {
    const died = deathYear(candidate.person);
    if (died && died < firstWarYear) return false;
    const check = comparePlaces(cluster.cards.flatMap((card) => card.facts.birthPlaces), candidate.places);
    return check === "match";
  });
  cluster.existingMatch = strong.length === 1 ? strong[0].personId : null;
  cluster.existingCandidates = candidates.filter((candidate) => candidate.personId !== cluster.existingMatch).map((candidate) => candidate.personId);
}

for (const cluster of clusters) {
  if (!named(cluster.facts)) continue;
  if (cluster.existingMatch) cluster.personId = cluster.existingMatch;
  else cluster.personId = `P${nextPersonNumber++}`;
}
for (let number = firstPersonNumber; number < nextPersonNumber; number += 1) {
  if (existing.has(`P${number}`)) throw new Error(`Номер P${number} уже занят; выберите другой --first-id`);
}

function distinct(values) {
  return [...new Set(values.map((value) => String(value).trim()).filter(Boolean))];
}

// «Щигровский РВК, Курская обл.» and «Щигровский РВК Курская обл.» are one
// value; a value whose words are all in a longer one is dropped too.
function distinctPlaces(values) {
  const words = (value) => new Set(norm(value).replace(/[^а-яa-z0-9 ]+/g, " ").split(/\s+/).filter((word) => word.length > 1));
  const list = distinct(values).map((value) => ({ value, words: words(value) }));
  return list.filter((item, index) => !list.some((other, otherIndex) => {
    if (otherIndex === index) return false;
    const covered = [...item.words].every((word) => other.words.has(word));
    if (!covered) return false;
    return other.words.size > item.words.size || otherIndex < index;
  })).map((item) => item.value);
}

function summaryText(parts) {
  const text = parts.filter(Boolean).join("; ");
  if (!text) return "Карточка ОБД «Память народа» без указания судьбы и наград.";
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function capitalizeFirst(value) {
  return value ? value.charAt(0).toLocaleUpperCase("ru") + value.slice(1) : value;
}

function joinLimited(values, limit = 4) {
  const list = distinct(values);
  return list.length > limit ? `${list.slice(0, limit).join("; ")} и др` : list.join("; ");
}

function publicList(docs, key) {
  return distinct(docs.flatMap((doc) => {
    const value = publicValue(key, doc[key]);
    return value ? value.split("; ") : [];
  }));
}

for (const cluster of clusters) {
  const facts = cluster.facts;
  const docs = cluster.cards.flatMap((card) => card.docs.map((doc) => ({ doc, card })));
  const allDocs = docs.map((item) => item.doc);
  // The person card carries the site's consolidated fields; list it first.
  const event = chooseEvent({ docs: allDocs });
  const sourceId = cluster.sourceId;
  const displayName = named(facts)
    ? [modernWord(facts.firstName), modernWord(facts.patronymic), facts.surname].filter(Boolean).join(" ")
    : [facts.surname, facts.firstName, facts.patronymic].filter(Boolean).join(" ");
  const nameAsIndexed = [first(cluster.cards[0].card.last_name), first(cluster.cards[0].card.first_name), first(cluster.cards[0].card.middle_name)]
    .filter(Boolean).join(" ");
  const indexedNames = distinct(allDocs.map((doc) => [first(doc.last_name), first(doc.first_name), first(doc.middle_name)].filter(Boolean).join(" ")))
    .filter((name) => norm(name) !== norm(nameAsIndexed));
  const alternateNames = distinct([
    ...indexedNames,
    ...facts.surnames.slice(1).map((form) => [modernWord(facts.firstName), modernWord(facts.patronymic), form].filter(Boolean).join(" ")),
  ]).filter((name) => norm(name) !== norm(displayName));

  // Fields
  const ranks = publicList(allDocs, "rank");
  const units = distinct([...publicList(allDocs, "division"), ...publicList(allDocs, "poslednee_mesto_sluzhbi")]);
  const conscription = distinctPlaces(publicList(allDocs, "data_i_mesto_priziva"));
  const awards = allDocs.filter((doc) => awardDocTypes.has(docType(doc))).flatMap((doc) => lst(doc.naimenovanie_nagradi).map((award) => {
    const date = publicValue("data_dokumenta", doc.data_dokumenta);
    return date ? `${award} (${date})` : award;
  }));
  const burial = distinctPlaces(allDocs.flatMap((doc) => [
    publicValue("data_i_pervichnoe_mesto_zahoroneniya", doc.data_i_pervichnoe_mesto_zahoroneniya),
    [publicValue("mesto_zahoroneniya", doc.mesto_zahoroneniya), publicValue("region_zahoroneniya", doc.region_zahoroneniya), publicValue("strana_zahoroneniya", doc.strana_zahoroneniya)]
      .filter(Boolean).join(", "),
  ]).filter(Boolean));
  const captivity = allDocs.filter((doc) => doc.data_pleneniya || doc.mesto_pleneniya || doc.lager).map((doc) => [
    publicValue("data_pleneniya", doc.data_pleneniya), publicValue("mesto_pleneniya", doc.mesto_pleneniya),
    publicValue("lager", doc.lager) ? `лагерь: ${publicValue("lager", doc.lager)}` : null,
  ].filter(Boolean).join(", "));
  const fateReasons = [...new Map(event.fates.map((item) => [norm(item.reason), item.reason])).values()];
  const fateDoc = event.doc;
  const fatePlace = fateDoc ? publicValue("mesto_vibitiya", fateDoc.mesto_vibitiya) ?? publicValue("mesto_pleneniya", fateDoc.mesto_pleneniya) : null;
  const birthDisplay = facts.birth?.display ?? null;
  const fields = {
    birthDate: birthDisplay,
    birthPlace: joinLimited(distinctPlaces(facts.birthPlaces), 3) || null,
    conscription: joinLimited(conscription, 3) || null,
    rank: joinLimited(ranks, 4) || null,
    unit: joinLimited(units, 4) || null,
    awards: joinLimited(awards, 6) || null,
    fate: fateReasons.join("; ") || null,
    fateDate: event.date && FATE_PRIORITY.includes(event.type) ? event.date.display : null,
    fatePlace,
    causeOfDeath: ["war-death", "execution"].includes(event.type) ? event.reason : null,
    captivity: joinLimited(captivity, 2) || null,
    burialPlace: burial[0] ?? null,
    documentsCount: String(allDocs.length),
  };
  for (const [key, value] of Object.entries(fields)) if (!value) delete fields[key];

  // Literal text: the person card first, then each document.
  const literal = docs.map(({ doc }, index) => docText(doc, index + 1)).join("\n");

  // Interpretation
  const birthPlaceText = facts.birthPlaces[0] ? `, место рождения — ${facts.birthPlaces[0]}` : "";
  const parts = [
    `${displayName}${facts.birth ? `, ${facts.birth.iso ? `родился ${facts.birth.display}` : `${facts.birth.year} года рождения`}` : ""}${birthPlaceText}.`,
  ];
  if (conscription[0]) parts.push(`Призыв: ${conscription[0]}.`);
  if (ranks.length || units.length) parts.push(`Служба: ${[ranks.slice(0, 2).join(", "), units.slice(0, 2).join("; ")].filter(Boolean).join(", ")}.`);
  if (awards.length) parts.push(`Награды: ${joinLimited(awards, 4)}.`);
  if (FATE_PRIORITY.includes(event.type)) {
    parts.push(`Судьба по документам: «${event.reason}»${FATE_NOTES[event.type] ? ` (${FATE_NOTES[event.type]})` : ""}${event.date ? `, ${event.date.display}` : ""}${fatePlace ? `, ${fatePlace}` : ""}.`);
  }
  if (burial[0]) parts.push(`Место захоронения: ${burial[0]}.`);
  parts.push(`В карточке ${allDocs.length} ${allDocs.length === 1 ? "документ" : allDocs.length < 5 ? "документа" : "документов"} ОБД «Память народа».`);
  const modernInterpretation = parts.join(" ").replace(/\.\./g, ".");

  // Places on the mention
  const birthLinks = facts.birthPlaces.map((place) => ({ place, link: linkPlace(place) }));
  const rank = { settlement: 0, district: 1, region: 2 };
  const linkedBirth = birthLinks.filter((item) => item.link).sort((a, b) => rank[a.link.basis] - rank[b.link.basis])[0];
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
      ...(birthLink && birthLink.basis !== "settlement"
        ? { note: birthLink.basis === "region" ? "Тег указывает только на регион: советская область не равна дореволюционной губернии." : "Тег указывает на район или уезд, а не на селение." }
        : {}),
    });
  }
  if (conscription[0]) mentionPlaces.push({ relation: "conscription", asWritten: conscription[0], normalized: conscription[0], confidence: "high" });
  if (fatePlace && FATE_PRIORITY.includes(event.type)) {
    mentionPlaces.push({
      relation: event.type === "missing-in-action" ? "missing" : event.type === "prisoner-of-war" ? "captivity" : "death",
      asWritten: fatePlace, normalized: fatePlace, confidence: "medium",
    });
  }
  if (burial[0]) mentionPlaces.push({ relation: "burial", asWritten: burial[0], normalized: burial[0], confidence: "medium" });

  const uncertainties = [];
  if (facts.birthYears.length > 1) uncertainties.push(`Год рождения в документах расходится: ${facts.birthYears.join(", ")}.`);
  if (facts.birthPlaces.length > 1) uncertainties.push(`Место рождения в документах записано по-разному: ${joinLimited(facts.birthPlaces, 4)}.`);
  if (facts.surnames.length > 1) uncertainties.push(`Фамилия в документах: ${facts.surnames.join(", ")}.`);
  for (const ocr of distinct(cluster.cards.map((card) => card.ocr && JSON.stringify(card.ocr)).filter(Boolean)).map((value) => JSON.parse(value))) {
    uncertainties.push(ocr.form
      ? `Фамилия в индексе ОБД «${titleCase(ocr.reading)}» — ошибка распознавания; принята ближайшая форма фамильного ряда «${ocr.form}».`
      : `Фамилия в индексе ОБД «${titleCase(ocr.reading)}» — ошибка распознавания; какая форма фамильного ряда имелась в виду, не установлено.`);
  }

  const mention = {
    mentionId: `${sourceId}-M1`,
    // A death role lets profile life dates take the date of death.
    role: ["war-death", "execution"].includes(event.type) ? "deceased-soldier" : "soldier",
    ...(cluster.personId ? { personId: cluster.personId } : {}),
    displayName,
    modernName: displayName,
    nameAsIndexed,
    alternateNames,
    ...(facts.patronymic && named(facts) ? { patronymic: modernWord(facts.patronymic) } : {}),
    sex: facts.sex,
    ...(facts.birth?.year ? { birthEstimate: { year: facts.birth.year, basis: "год рождения по ОБД «Память народа»" } } : {}),
    ...(ranks.length ? { occupation: { asWritten: ranks.join(", "), normalized: "военнослужащий" } } : {}),
    places: mentionPlaces,
    ...(uncertainties.length ? { uncertainties } : {}),
  };

  // Links
  const links = { officialCard: docUrl(cluster.cards[0].card) };
  for (const { doc } of docs) {
    if (docType(doc) === "hero") continue;
    const url = docUrl(doc);
    if (url === links.officialCard) continue;
    const citation = archiveCitation(doc);
    links[`pn-${docIndex(doc)}-${docType(doc)}-${docId(doc)}`] = {
      label: [DOC_TYPES[docType(doc)] ?? docType(doc), citation].filter(Boolean).join(" · "),
      url,
    };
    // The «podvig» index of pamyat-naroda is the «Подвиг народа» database;
    // its document ids open there directly.
    if (docIndex(doc) === "podvig" && ["chelovek_nagrazhdenie", "chelovek_predstavlenie"].includes(docType(doc))) {
      links[`podvig-${docId(doc)}`] = {
        label: `«Подвиг народа»: ${lst(doc.naimenovanie_nagradi).join(", ") || "наградной документ"}`,
        url: `https://podvignaroda.ru/?#id=${docId(doc)}&tab=navDetailDocument`,
      };
    }
  }
  for (const card of cluster.cards.slice(1)) {
    if (card.hero) links[`pn-person-${docId(card.card)}`] = { label: "Ещё одна сводная карточка «Памяти народа»", url: docUrl(card.card) };
  }

  const citations = distinct(allDocs.map(archiveCitation).filter(Boolean));
  const eventDate = event.date
    ? {
      display: event.date.display,
      ...(event.date.iso ? { iso: event.date.iso } : {}),
      ...(event.date.iso && ["war-death", "execution"].includes(event.type) ? { deathIso: event.date.iso } : {}),
      ...(!event.date.iso ? { yearFrom: event.date.year, yearTo: event.date.year } : {}),
    }
    : { display: "годы Великой Отечественной войны (дата в карточке не указана)", yearFrom: 1941, yearTo: 1945 };

  const unresolved = [
    "Сверить карточку с изображениями документов ЦАМО на pamyat-naroda.ru: поля ОБД — индекс, а не чтение проекта.",
  ];
  const linkedPerson = cluster.existingMatch ? existing.get(cluster.existingMatch).person : null;
  const linkedBirthIso = linkedPerson?.birth?.date ?? linkedPerson?.dates?.birth?.iso ?? null;
  const birthDateConflict = linkedBirthIso && facts.birth?.iso && linkedBirthIso !== facts.birth.iso
    ? `Дата рождения в «Памяти народа» (${facts.birth.display}) расходится с профилем ${cluster.existingMatch} (${linkedPerson.birth?.display ?? linkedBirthIso}); профиль связан по имени, отчеству, году и месту рождения.`
    : null;
  if (birthDateConflict) unresolved.push(birthDateConflict);
  if (cluster.possibleSame.size) unresolved.push("В «Памяти народа» есть отдельные карточки с тем же именем, отчеством и годом рождения; возможно, это тот же человек.");
  if (cluster.existingCandidates?.length) unresolved.push(`Проверить тождество с профилями ${cluster.existingCandidates.join(", ")} (совпадают имя, отчество и год рождения, место рождения не подтверждено).`);

  const record = {
    schemaVersion: 1,
    sourceId,
    provider: "Память народа",
    recordType: "published-military-database-entry",
    collection: {
      title: `${nameAsIndexed}${facts.birth?.year ? ` (${facts.birth.year})` : ""}`,
      ...(citations.length ? { archiveCitation: citations.join("; ") } : {}),
    },
    repository: {
      name: "ОБД «Память народа» — Министерство обороны Российской Федерации",
      location: "Онлайн-база; документы хранятся в ЦАМО (Подольск) и других архивах, указанных в карточке",
      url: "https://pamyat-naroda.ru/",
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
      status: "published-secondary-source-copied-from-pamyat-naroda",
      reviewedAt: RETRIEVED_ON,
      harvest: {
        retrievedOn: RETRIEVED_ON,
        method: "Карточки получены из поиска «Памяти народа» по формам фамилии (searches/pamyat-naroda-2026-10-20.json); поля документов перенесены без изменений, служебные поля сайта опущены.",
        pamyatNarodaIds: cluster.cards.map((card) => `${docIndex(card.card)}-${docType(card.card)}${docId(card.card)}`),
        ...(cluster.cards.some((card) => card.omittedDocs) ? { omittedAfter1950: cluster.cards.reduce((sum, card) => sum + card.omittedDocs, 0) } : {}),
      },
      ...(cluster.cards.length > 1 ? {
        identityResolution: `Объединены ${cluster.cards.length} карточки «Памяти народа»: совпадают фамильная форма, имя, отчество${cluster.year ? ", год рождения" : ""} и место рождения не противоречит.`,
      } : {}),
      unresolved,
    },
    summary: {
      status: "published-index-summary",
      text: summaryText([
        ranks[0] ? `${capitalizeFirst(ranks[0])}${facts.birth?.year ? `, ${facts.birth.year} г. р.` : ""}` : facts.birth?.year ? `${facts.birth.year} г. р.` : null,
        FATE_PRIORITY.includes(event.type) ? `«${event.reason}»${event.date ? ` ${event.date.display}` : ""}` : null,
        awards.length ? `награды: ${joinLimited(awards.map((award) => award.replace(/ \(.*\)$/, "")), 3)}` : null,
      ]),
    },
  };
  records.push(record);

  // Profiles
  if (!cluster.personId) {
    linkStats.noProfile += 1;
  } else if (cluster.existingMatch) {
    linkStats.linkedExisting += 1;
    const entry = existing.get(cluster.personId);
    const person = updatedPeople.get(cluster.personId) ?? structuredClone(entry.person);
    person.sourceIds = distinct([...(person.sourceIds ?? []), sourceId]);
    person.notes = [...(person.notes ?? []), `«Память народа» (${sourceId}): ${modernInterpretation} Тождество установлено по совпадению имени, отчества, года и места рождения.${birthDateConflict ? ` ${birthDateConflict}` : ""}`];
    if (["war-death", "execution"].includes(event.type) && !person.death && event.date) {
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
    const birthPlaceEntry = mentionPlaces.find((place) => place.relation === "birth");
    const researchLeads = [];
    const possibleExisting = cluster.existingCandidates ?? [];
    if (possibleExisting.length) {
      linkStats.possibleSameExisting += 1;
      researchLeads.push({
        label: "Возможно тот же человек",
        status: "same-name-patronymic-year-unverified",
        summary: "Совпадают имя, отчество и год рождения; место рождения в «Памяти народа» не подтверждает и не опровергает тождество.",
        personIds: possibleExisting.slice(0, 6),
      });
    }
    const duplicates = [...cluster.possibleSame].map((other) => other.personId).filter((personId) => personId && personId !== cluster.personId);
    if (duplicates.length) {
      researchLeads.push({
        label: "Другая карточка «Памяти народа» с тем же именем",
        status: "possible-duplicate-card-unverified",
        summary: "Совпадают имя, отчество и год рождения, место рождения не противоречит; карточки не объединены, потому что сайт не связал их сам.",
        personIds: [...new Set(duplicates)].slice(0, 6),
      });
    }
    if (birthLink?.basis === "settlement") {
      const sameVillage = (existingByPlace.get(birthLink.placeId) ?? []).filter((personId) => personId !== cluster.personId);
      if (sameVillage.length) {
        researchLeads.push({
          label: `Носители фамилии из места «${placesById.get(birthLink.placeId).name}»`,
          status: "same-village-of-birth-unverified",
          summary: "В этом же селении документированы люди фамильного ряда; родство не установлено.",
          personIds: sameVillage.slice(0, 8),
        });
      }
    }
    const surnameForms = distinct([facts.surname, ...facts.surnames]);
    const person = {
      schemaVersion: 1,
      personId: cluster.personId,
      displayName,
      sex: facts.sex,
      ...(facts.patronymic ? { patronymic: modernWord(facts.patronymic) } : {}),
      nameVariants: distinct([nameAsIndexed, ...alternateNames]),
      surname: { normalized: facts.surname, formsAsWritten: surnameForms },
      ...(facts.birth?.year ? {
        birth: {
          year: facts.birth.year,
          display: facts.birth.iso ? facts.birth.display : `${facts.birth.year} год`,
          ...(facts.birth.iso ? { date: facts.birth.iso } : {}),
          ...(birthPlaceEntry?.placeId ? { placeId: birthPlaceEntry.placeId } : {}),
          sourceIds: [sourceId],
        },
      } : {}),
      ...(["war-death", "execution"].includes(event.type) ? {
        death: {
          ...(event.date?.iso ? { date: event.date.iso } : {}),
          display: event.date?.display ?? "в годы войны",
          cause: event.reason,
          sourceIds: [sourceId],
        },
      } : {}),
      sourceIds: [sourceId],
      status: "documented-from-published-military-database",
      ...(ranks.length ? { occupation: `военнослужащий (${ranks.slice(0, 2).join(", ")})` } : {}),
      places: mentionPlaces.map((place) => Object.fromEntries(Object.entries(place).filter(([key]) => key !== "note"))),
      notes: [
        `Известен по ОБД «Память народа» (Министерство обороны РФ). ${modernInterpretation}`,
        cluster.cards.length > 1
          ? `Профиль заведён по ${cluster.cards.length} карточкам «Памяти народа», объединённым по имени, отчеству, году и месту рождения; тождество с одноимёнными людьми из других записей не установлено.`
          : "Профиль заведён по одной карточке «Памяти народа»; тождество с одноимёнными людьми из других записей не установлено.",
        "ОБД «Память народа» — производный индекс документов ЦАМО: даты, имена и места нужно сверить с изображениями документов.",
      ],
      ...(researchLeads.length ? { researchLeads } : {}),
      profileOrigin: { method: "pamyat-naroda-import", createdOn: RETRIEVED_ON, sourceId },
      ...(facts.birth ? {
        dates: {
          birth: {
            display: facts.birth.iso ? facts.birth.display : `${facts.birth.year} год`,
            ...(facts.birth.iso ? { iso: facts.birth.iso } : {}),
            basis: `дата рождения по ОБД «Память народа» (${sourceId})`,
          },
        },
      } : {}),
    };
    const fileSlug = [slug(displayName), facts.birth?.year].filter(Boolean).join("-");
    newPeople.push({ person, file: `${cluster.personId}-${fileSlug}.json` });
  }

  for (const card of cluster.cards) {
    searchRows.push({
      pamyatNarodaId: `${docIndex(card.card)}-${docType(card.card)}${docId(card.card)}`,
      url: docUrl(card.card),
      name: [first(card.card.last_name), first(card.card.first_name), first(card.card.middle_name)].filter(Boolean).join(" "),
      birth: first(card.card.date_birth) ?? null,
      sourceId,
      ...(cluster.personId ? { personId: cluster.personId } : {}),
      decision: !cluster.personId
        ? "record-without-profile-no-personal-name"
        : cluster.existingMatch
          ? "record-linked-to-existing-profile"
          : card === cluster.cards[0] ? "record-and-new-profile" : "merged-into-person-record",
    });
  }
}

// ---------------------------------------------------------------------------
// Report and write

const eventCounts = records.reduce((counts, record) => ({ ...counts, [record.event.type]: (counts[record.event.type] ?? 0) + 1 }), {});
const placeCounts = records.reduce((counts, record) => {
  const birth = record.mentions[0].places.find((place) => place.relation === "birth");
  const key = !birth ? "no-birthplace" : birth.placeId ? `linked-${birth.confidence}` : "unlinked";
  return { ...counts, [key]: (counts[key] ?? 0) + 1 };
}, {});
const report = {
  stats,
  clusters: clusters.length,
  records: records.length,
  ...linkStats,
  eventCounts,
  placeCounts,
  firstNewPersonId: `P${firstPersonNumber}`,
  lastNewPersonId: `P${nextPersonNumber - 1}`,
  linkedExisting: [...updatedPeople.keys()],
  ...(process.argv.includes("--debug") ? {
    noProfileSample: records.filter((record) => !record.primaryPersonId).slice(0, 40).map((record) => record.mentions[0].nameAsIndexed),
    linkEvidence: clusters.filter((cluster) => cluster.existingMatch).map((cluster) => ({
      personId: cluster.existingMatch,
      existing: existing.get(cluster.existingMatch).person.displayName,
      existingPlaces: (existing.get(cluster.existingMatch).person.places ?? []).map((place) => place.asWritten ?? place.normalized).slice(0, 3),
      pn: cluster.facts.surname + " " + cluster.facts.firstName + " " + cluster.facts.patronymic + " " + cluster.year,
      pnPlaces: cluster.cards.flatMap((card) => card.facts.birthPlaces).slice(0, 3),
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

const queries = Object.entries(harvest.meta?.qstat ?? {}).map(([value, stat]) => ({
  page: "heroes/search",
  field: "Фамилия",
  value,
  resultCount: stat.total,
  retrieved: stat.got,
  ...(stat.note ? { note: `${stat.note} После точных совпадений нечёткий поиск отдаёт Панфиловых, Анфимовых и Анфаловых.` } : {}),
}));
writeJson(path.join(searchesDir, `${SEARCH_ID}.json`), {
  schemaVersion: 1,
  searchId: SEARCH_ID,
  date: RETRIEVED_ON,
  provider: "Память народа",
  site: "https://pamyat-naroda.ru/",
  method: "Поиск «Участники войны» по фамилии через API сайта (entrypoint heroes/search, по 200 строк) в сессии браузера: на прямые HTTP-запросы сайт отвечает страницей проверки безопасности. Поиск нечёткий: выдача включает OCR-формы и соседние фамилии, поэтому каждая строка отнесена к фамильному ряду по фамилиям во всех документах карточки.",
  queries,
  podvigNaroda: "Наградные документы «Подвига народа» входят в выдачу «Памяти народа» (приказы, представления, картотеки награждений); номер документа «Подвига народа» сохранён в ссылках Record. Поиск «Ампилогов» на podvignaroda.ru дал 619 наградных документов; отдельно они не выгружались.",
  scope: {
    ...(onlyFamilies ? {
      addition: `Догрузка семейств ${[...onlyFamilies].join(", ")}: Анфилофьев и Анфилатов включены в фамильный ряд по решению владельца 2026-10-20 (общий источник — крестильное имя Анфилофий). Карточки, уже вошедшие в PN-Records, не повторяются; основной журнал — searches/pamyat-naroda-2026-10-20.json.`,
    } : {}),
    decision: "Импортированы все формы фамильного ряда: Ампилогов, Анпилогов, Анфилогов, Онпилогов, Онфилогов, Ампилов, Анпилов, Анфилов и OCR-формы индекса (Антилогов, Ампелогов, Апилогов и др.). Формы вроде «Ашпилогов», «Ампилагов», «Аннилогов» по решению владельца (2026-10-20) считаются ошибками распознавания: они отнесены к ближайшей форме ряда (расстояние Левенштейна не больше 2), а прочтение индекса сохранено в Record.",
    ocrReadingCards: stats.ocrReadings,
    publicCutoff: "Документы после 1950 года (юбилейная картотека 1985 года, послевоенные награды) и поля с датами после 1950 года в Records не переносились.",
  },
  summary: report,
  results: searchRows,
  doubtfulSurnameForms: onlyFamilies ? [] : doubtfulRows,
  onlyAfter1950: postPeriodRows,
  notCovered: [
    "Карточки, чья фамилия далека от всех форм ряда (больше 2 правок), перечислены в doubtfulSurnameForms без Records.",
    "Места гибели и захоронения не добавлены в индекс мест, поэтому записи о войне пока не выводятся на карту.",
  ],
});
console.log(`Записано: ${records.length} Records, ${newPeople.length} новых профилей, ${updatedPeople.size} обновлённых профилей`);
}
