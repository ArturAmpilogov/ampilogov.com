import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familyDir = path.join(root, "data/genealogy/families");
const sourceDir = path.join(root, "data/genealogy/sources/publications");
const placesPath = path.join(root, "data/genealogy/places/index.json");

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

const personRows = [
  ["P0484", "Лев Анпилогов", "male", ["PUB-OGAOO-173-15-443-LEV-ANPILOGOV-MIGRANT-1840", "YA-OGAOO-173-15-443-149"], [], "Курский переселенец из деревни Ампилоговой Фатежского уезда; поручитель при браке 1840 года."],
  ["P0485", "Гавриил Иванович Анпилогов", "male", ["YA-OGAOO-173-11-1734-261"], ["F0105"], "Государственный крестьянин деревни Кармалки, 32 года; второй брак в 1848 году."],
  ["P0486", "Ирина Ивановна", "female", ["YA-OGAOO-173-11-1734-261"], ["F0105"], "Вдова, 35 лет, прямо названа переселенкой из Орловской губернии; второй брак с Гавриилом Анпилоговым."],
  ["P0487", "Агафон Данилович Анпилогов", "male", ["YA-OGAOO-173-11-1734-259"], ["F0106"], "Государственный крестьянин деревни Кармалки, 44 года; второй брак в 1848 году."],
  ["P0488", "Параскева Степановна", "female", ["YA-OGAOO-173-11-1734-259"], ["F0106"], "Вдова, прямо названа переселенкой из Орловской губернии; второй брак с Агафоном Анпилоговым."],
  ["P0489", "Максим Егорович Анпилогов", "male", ["YA-OGAOO-173-11-1734-259"], [], "Государственный крестьянин; поручитель на свадьбе в Оренбургском уезде в 1848 году."],
  ["P0490", "Емельян Никитич Анпилогов", "male", ["YA-OGAOO-173-11-2032-231"], [], "Крестьянин, восприемник в записи 1857 года; тамбовское происхождение относится к родителям ребёнка, а не к нему."],
  ["P0491", "Иван Назарович Анпилогов", "male", ["YA-OGAOO-173-11-2004-50"], ["F0110"], "Оренбургский мещанин, отец ребёнка в метрической записи 1856 года."],
  ["P0492", "Григорий Петрович Анпилогов", "male", ["YA-OGAOO-173-11-1734-259", "YA-OGAOO-173-11-1734-260", "YA-OGAOO-173-11-1734-261", "YA-OGAOO-173-11-2066-127", "YA-OGAOO-173-12-777-56", "YA-OGAOO-173-12-777-173"], [], "Поручитель из деревни Кармалки; несколько записей 1848–1869 годов объединены по полному имени и месту с средней уверенностью."],
  ["P0493", "Александр Павлович Анпилогов", "male", ["YA-OGAOO-173-16-231-16"], ["F0108"], "Вновь причисленный государственный крестьянин Новогеоргиевки; в тексте перед именем стоит неуверенное «Афанасий»."],
  ["P0494", "Николай Григорьевич Ампилогов", "male", ["PUB-OGAOO-389-1-296-NIKOLAI-AMPILOGOV-MIGRANT-1876"], [], "Государственный крестьянин из курских переселенцев; в 1876 году назван восприемником в метрической книге Оренбургской губернии."],
  ["P0495", "Стефан Семёнович Ампилогов", "male", ["YA-OGAOO-173-11-2066-127"], ["F0107"], "Государственный крестьянин деревни Кармалки, 19 лет; жених в 1858 году."],
  ["P0496", "Анастасия Лукинична Покачалова", "female", ["YA-OGAOO-173-11-2066-127"], ["F0107"], "Государственная крестьянка, 18 лет, прямо названа происходящей из тамбовских переселенцев."],
  ["P0497", "Ефим Назарович Ампилогов", "male", ["YA-OGAOO-173-11-2066-127"], [], "Государственный крестьянин деревни Кармалки; поручитель по жениху в 1858 году."],
  ["P0498", "Афанасий Петрович Ампилогов", "male", ["YA-OGAOO-173-11-2066-127"], [], "Государственный крестьянин; поручитель в метрической книге 1858 года."],
  ["P0499", "Юлиан Артемьевич Ампилогов", "male", ["YA-OGAOO-173-11-2066-127"], [], "Государственный крестьянин; поручитель в метрической книге 1858 года."],
  ["P0500", "Сидор Дмитриевич Ампилогов", "male", ["YA-OGAOO-173-11-1968-179", "YA-OGAOO-173-11-1929-162"], [], "Государственный крестьянин деревни Михайловки; умер в возрасте 80 лет. Два цифровых скана отражают ту же запись."],
  ["P0501", "Фёдор Михайлович Ампилогов", "male", ["YA-OGAOO-173-16-363-83"], [], "Крестьянин деревни Гавриловки, восприемник в 1880 году; орловское происхождение относится к родителям ребёнка, не к нему."],
  ["P0502", "Евдокия Емельяновна Баева", "female", ["YA-OGAOO-173-16-363-83"], [], "Крестьянка-восприемница в записи вместе с Фёдором Ампилоговым; супружество между ними не утверждается."],
  ["P0503", "Сергей Ампилогов", "male", ["YA-OGAOO-173-11-2004-83"], [], "Государственный крестьянин, поручитель в Оренбургском уезде в 1856 году; не смешан с симферопольским тёзкой."],
  ["P0504", "Варфоломей Фёдорович Ампилогов", "male", ["YA-OGAOO-173-16-1426-136"], ["F0109"], "Крестьянин села Георгиевки, отец Владимира в записи 1901 года."],
  ["P0505", "Параскева Ивановна Ампилогова", "female", ["YA-OGAOO-173-16-1426-136"], ["F0109"], "Законная жена Варфоломея Фёдоровича Ампилогова, мать Владимира."],
  ["P0506", "Владимир Варфоломеевич Ампилогов", "male", ["YA-OGAOO-173-16-1426-136"], ["F0109"], "Ребёнок Варфоломея Фёдоровича и Параскевы Ивановны; запись 1901 года."],
  ["P0507", "Тимофей Семёнович Ампилогов", "male", ["YA-OGAOO-173-11-1934-271"], [], "Государственный крестьянин, поручитель в метрической книге 1854 года."],
  ["P0508", "Михаил Сергеевич Ампилогов", "male", ["YA-OGAOO-173-16-444-87"], [], "Крестьянин деревни Кармалки, поручитель по жениху в 1882 году."],
  ["P0509", "Алексей Парфёнович Ампилогов", "male", ["YA-OGAOO-173-16-444-87"], [], "Крестьянин деревни Кармалки, поручитель по жениху в 1882 году."],
  ["P0510", "А. Г. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Шахово Фатежского уезда в Томскую губернию; дело 3736."],
  ["P0511", "А. Т. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Троицкого, что на Сучке, Фатежского уезда в Томскую губернию; дело 4543."],
  ["P0512", "А. Ф. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Троицкого, что на Сучке, Фатежского уезда в Томскую губернию; дело 4543."],
  ["P0513", "В. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Сорокино Старооскольского уезда в Енисейскую губернию; дело 1885."],
  ["P0514", "Л. А. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Троицкого, что на Сучке, Фатежского уезда в Томскую губернию; дело 3728."],
  ["P0515", "Л. А. Анпилогов (Фатежский уезд)", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Отдельная строка указателя: Фатежский уезд — Томская губерния; дело 2613. Не объединён с тёзкой без проверки дел."],
  ["P0516", "М. В. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Никольского Фатежского уезда в Оренбургскую губернию; дела 7022 и 7742."],
  ["P0517", "П. Б. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Троицкого, что на Сучке, Фатежского уезда в Томскую губернию; опись 2, дело 4543."],
  ["P0518", "Ф. П. Анпилогов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Уколово Щигровского уезда в Уфимскую губернию; дело 3852."],
  ["P0519", "Неизвестный Анпилогов — переселенец на Украинскую линию", "male", ["PUB-UKRAINIAN-LINE-ANPILOGOV-1732-1748"], [], "Имя не раскрыто в бесплатной части указателя; один носитель фамилии сошёл на Украинскую линию в 1732–1748 годах."],
  ["P0520", "Прокофей Федотович Анпилогов", "male", ["PUB-RGADA-350-2-1693-MOLOTYCHI-1762"], [], "Указан в ревизской сказке села Молотычей 1762 года, 35 лет. Не отождествлён с безымянным переселенцем на Украинскую линию."],
  ["P0521", "Анастасия Александровна Анпилогова", "female", ["YA-OGAOO-173-16-231-16"], ["F0108"], "Дочь Александра Павловича Анпилогова и Наталии Петровны; запись о рождении 1876 года."],
  ["P0522", "Г. Ф. Анпилов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Пороз Грайворонского уезда в Томскую губернию; дела 4537 и 5474. Сохранён отдельно от формы Анпилогов до проверки оригиналов."],
  ["P0523", "М. П. Анпилов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Пороз Грайворонского уезда в Томскую губернию; дело 5474."],
  ["P0524", "П. Б. Анпилов", "male", ["PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX"], [], "Переселенец из села Пороз Грайворонского уезда в Томскую губернию; дело 5474 по повторительному знаку в указателе."]
];

for (const [personId, displayName, sex, sourceIds, familyIds, note] of personRows) {
  const slug = displayName.toLowerCase().replaceAll("ё", "e").replaceAll(" ", "-").replace(/[^a-zа-я0-9-]/g, "");
  writeJson(path.join(peopleDir, `${personId}-${slug}.json`), {
    schemaVersion: 1,
    personId,
    displayName,
    sex,
    surname: /Анпилов|Анпилогов|Ампилогов/.test(displayName) ? {
      normalized: displayName.includes("Анпилогов") ? "Анпилогов" : displayName.includes("Анпилов") ? "Анпилов" : "Ампилогов",
      formsAsWritten: displayName.includes("Анпилогов") ? ["Анпилогов", "Анпилоговъ", "Антилоговъ"] : displayName.includes("Анпилов") ? ["Анпилов", "Анпиловъ"] : ["Ампилогов", "Ампилоговъ"],
    } : undefined,
    sourceIds,
    status: "documented-from-archive-scan-transcription",
    notes: [note],
    ...(familyIds.length ? { familyIds } : {}),
  });
}

const families = [
  ["F0105", "Гавриил Иванович Анпилогов и Ирина Ивановна", ["P0485", "P0486"], [], ["YA-OGAOO-173-11-1734-261"], "Второй брак обоих, 8 октября 1848 года; орловское переселенческое происхождение относится к Ирине."],
  ["F0106", "Агафон Данилович Анпилогов и Параскева Степановна", ["P0487", "P0488"], [], ["YA-OGAOO-173-11-1734-259"], "Второй брак обоих, 26 сентября 1848 года; орловское переселенческое происхождение относится к Параскеве."],
  ["F0107", "Стефан Семёнович Ампилогов и Анастасия Лукинична Покачалова", ["P0495", "P0496"], [], ["YA-OGAOO-173-11-2066-127"], "Первый брак 12 января 1858 года; тамбовское переселенческое происхождение относится к Анастасии."],
  ["F0108", "Александр Павлович Анпилогов и Наталия Петровна", ["P0493"], ["P0521"], ["YA-OGAOO-173-16-231-16"], "Родители Анастасии; имя матери в источнике — Наталия Петрова, отдельная карточка не создана до дополнительной идентификации."],
  ["F0109", "Варфоломей Фёдорович и Параскева Ивановна Ампилоговы", ["P0504", "P0505"], ["P0506"], ["YA-OGAOO-173-16-1426-136"], "Родители Владимира в метрической записи 1901 года."],
  ["F0110", "Иван Назарович Анпилогов и Матрёна Ильинична", ["P0491"], [], ["YA-OGAOO-173-11-2004-50"], "Супружеская пара названа в записи 1856 года; жена пока оставлена без отдельного профиля."],
];

for (const [familyId, label, spouses, children, sourceIds, note] of families) {
  writeJson(path.join(familyDir, `${familyId}-${label.toLowerCase().replaceAll("ё", "e").replaceAll(" ", "-").replace(/[^a-zа-я0-9-]/g, "")}.json`), {
    schemaVersion: 1,
    familyId,
    label,
    spouses,
    children,
    sourceIds,
    status: "documented-from-archive-scan-transcription",
    notes: [note],
  });
}

const mention = (mentionId, role, personId, displayName, extra = {}) => ({
  mentionId,
  role,
  personId,
  displayName,
  modernName: displayName,
  ...extra,
});

const sourceRows = [
  {
    sourceId: "PUB-OGAOO-173-15-443-LEV-ANPILOGOV-MIGRANT-1840", citation: "ОГАОО, ф. 173, оп. 15, д. 443, скан 58", year: "1840", url: "https://yandex.ru/archive/catalog/4f3a30a7-f8c1-4cfb-ba06-32b8ffd82f73/58", placeId: "buzuluk-uezd", place: "село Заплавное, Бузулукский уезд", type: "marriage-surety", primary: "P0484",
    literal: "По невесте Курской губернии из переселян Фатежского округа деревни Ампилоговой государственные крестьяне Лев Анпилогов и Афанасий Пилков.",
    mentions: [mention("M1", "surety", "P0484", "Лев Анпилогов", { socialStatus: { asWritten: "государственный крестьянин из переселян", normalized: "государственный крестьянин-переселенец" }, places: [{ relation: "origin", asWritten: "Курской губернии Фатежского округа деревни Ампилоговой", normalized: "Фатежский уезд, Курская губерния", placeId: "fatezh-uezd", confidence: "high" }] })],
    migrations: [{ personId: "P0484", personName: "Лев Анпилогов", from: { placeId: "fatezh-uezd", normalized: "Фатежский уезд, Курская губерния" }, to: { placeId: "buzuluk-uezd", normalized: "Бузулукский уезд" }, basis: "Поручитель прямо назван выходцем из курских переселенцев деревни Ампилоговой.", confidence: "high" }],
  },
  {
    sourceId: "YA-OGAOO-173-15-443-149", citation: "ОГАОО, ф. 173, оп. 15, д. 443, скан 149", year: "1840", url: "https://yandex.ru/archive/catalog/4f3a30a7-f8c1-4cfb-ba06-32b8ffd82f73/149", placeId: "buzuluk-uezd", place: "село Заплавное, Бузулукский уезд", type: "marriage-surety-copy", primary: "P0484",
    literal: "По невесте Курской губернии из переселян Фатежского округа деревни Анпилоговой государственные крестьяне Лев Анпилогов и Афанасий Пилков.",
    mentions: [mention("M1", "surety", "P0484", "Лев Анпилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-1734-261", citation: "ОГАОО, ф. 173, оп. 11, д. 1734, скан 261", year: "1848", url: "https://yandex.ru/archive/catalog/60745ac7-4693-48f7-83c3-5b76a9196448/261", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage", primary: "P0485",
    literal: "8 октября. Деревни Кармалки государственный крестьянин Гавриил Иванов Анпилогов, 32, вторым браком; из переселенцев Орловской губернии вдова Ирина Иванова, 35, вторым браком.",
    mentions: [mention("M1", "groom", "P0485", "Гавриил Иванович Анпилогов"), mention("M2", "bride", "P0486", "Ирина Ивановна", { places: [{ relation: "origin", asWritten: "из переселенцев Орловской губернии", normalized: "Орловская губерния", placeId: "orel-governorate", confidence: "high" }] }), mention("M3", "surety", "P0492", "Григорий Петрович Анпилогов")],
    migrations: [{ personId: "P0486", personName: "Ирина Ивановна", from: { placeId: "orel-governorate", normalized: "Орловская губерния" }, to: { placeId: "orenburg-uezd", normalized: "Оренбургский уезд" }, basis: "В графе невесты Ирина прямо названа переселенкой из Орловской губернии.", confidence: "high" }],
  },
  {
    sourceId: "YA-OGAOO-173-11-1734-259", citation: "ОГАОО, ф. 173, оп. 11, д. 1734, скан 259", year: "1848", url: "https://yandex.ru/archive/catalog/60745ac7-4693-48f7-83c3-5b76a9196448/259", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage", primary: "P0487",
    literal: "26 сентября. Деревни Кармалки государственный крестьянин Агафон Данилов Анпилогов, 44, вторым браком; из переселенцев Орловской губернии вдова Параскева Степанова, вторым браком.",
    mentions: [mention("M1", "groom", "P0487", "Агафон Данилович Анпилогов"), mention("M2", "bride", "P0488", "Параскева Степановна", { places: [{ relation: "origin", asWritten: "из переселенцев Орловской губернии", normalized: "Орловская губерния", placeId: "orel-governorate", confidence: "high" }] }), mention("M3", "surety", "P0489", "Максим Егорович Анпилогов")],
    migrations: [{ personId: "P0488", personName: "Параскева Степановна", from: { placeId: "orel-governorate", normalized: "Орловская губерния" }, to: { placeId: "orenburg-uezd", normalized: "Оренбургский уезд" }, basis: "В графе невесты Параскева прямо названа переселенкой из Орловской губернии.", confidence: "high" }],
  },
  {
    sourceId: "YA-OGAOO-173-11-2032-231", citation: "ОГАОО, ф. 173, оп. 11, д. 2032, скан 231", year: "1857", url: "https://yandex.ru/archive/catalog/f38580cf-e105-4a13-9778-ff0bead04dd9/231", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "baptism-witness", primary: "P0490",
    literal: "Из тамбовских переселенцев государственные крестьяне Евстафий Карпов и жена его Евдокия Иванова. Восприемники: крестьянин Емельян Никитин Анпилогов и женка Феодосия Леонова.",
    mentions: [mention("M1", "godfather", "P0490", "Емельян Никитич Анпилогов"), mention("M2", "godmother", null, "Феодосия Леоновна")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-2004-50", citation: "ОГАОО, ф. 173, оп. 11, д. 2004, скан 50", year: "1856", url: "https://yandex.ru/archive/catalog/e90d5261-6bdd-4b55-8d31-2aa7e341f292/50", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "birth-parent", primary: "P0491",
    literal: "Оренбургского мещанина Ивана Назарова Анпилогова и законная его жена Матрёна Ильина, оба православные.",
    mentions: [mention("M1", "father", "P0491", "Иван Назарович Анпилогов"), mention("M2", "mother", null, "Матрёна Ильинична")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-1734-260", citation: "ОГАОО, ф. 173, оп. 11, д. 1734, скан 260", year: "1848", url: "https://yandex.ru/archive/catalog/60745ac7-4693-48f7-83c3-5b76a9196448/260", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-surety", primary: "P0492",
    literal: "Государственные крестьяне: Григорий Петров Анпилогов, Афанасий Гаврилов Павлов, Василий и Даниил Фадеевы Пашковы.",
    mentions: [mention("M1", "surety", "P0492", "Григорий Петрович Анпилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-16-231-16", citation: "ОГАОО, ф. 173, оп. 16, д. 231, скан 16", year: "1876", url: "https://yandex.ru/archive/catalog/6ee1f5d2-4f13-498b-a55b-2afaf33d2d0a/16", placeId: "orenburg-uezd", place: "село Новогеоргиевка, Оренбургский уезд", type: "birth", primary: "P0521",
    literal: "Анастасия. Села Новогеоргиевки вновь причисленный государственный крестьянин (Афанасий?) Александр Павлов Анпилогов и законная жена его Наталия Петрова.",
    mentions: [mention("M1", "child", "P0521", "Анастасия Александровна Анпилогова"), mention("M2", "father", "P0493", "Александр Павлович Анпилогов", { uncertainties: ["Перед именем Александр OCR читает заключённое в скобки «Афанасий»; требуется палеографическая сверка."] }), mention("M3", "mother", null, "Наталия Петровна")], migrations: [],
  },
  {
    sourceId: "PUB-OGAOO-389-1-296-NIKOLAI-AMPILOGOV-MIGRANT-1876", citation: "ОГАОО, ф. 389, оп. 1, д. 296, скан 246", year: "1876", url: "https://yandex.ru/archive/catalog/d527ae7b-cdf2-47af-8672-5a03d308bc32/246", placeId: "orenburg-uezd", place: "Оренбургская губерния", type: "baptism-godparent", primary: "P0494",
    literal: "Курской губернии из переселенцев государственный крестьянин Николай Григорьев Ампилогов; той же губернии девица Агафия Афанасьева Иванова.",
    mentions: [mention("M1", "godfather", "P0494", "Николай Григорьевич Ампилогов", { places: [{ relation: "origin", asWritten: "Курской губернии из переселенцев", normalized: "Курская губерния", placeId: "kursk", confidence: "high" }] }), mention("M2", "godmother", null, "Агафия Афанасьевна Иванова")],
    migrations: [{ personId: "P0494", personName: "Николай Григорьевич Ампилогов", from: { placeId: "kursk", normalized: "Курская губерния" }, to: { placeId: "orenburg-uezd", normalized: "Оренбургский уезд" }, basis: "Николай прямо назван государственным крестьянином из курских переселенцев.", confidence: "high" }],
  },
  {
    sourceId: "YA-OGAOO-173-11-2066-127", citation: "ОГАОО, ф. 173, оп. 11, д. 2066, скан 127", year: "1858", url: "https://yandex.ru/archive/catalog/4d8400b3-261f-48b0-8a75-c0df5f624d3a/127", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-and-sureties", primary: "P0495",
    literal: "12 января. Деревни Кармалки государственный крестьянин Стефан Семенов Ампилогов, 19; из тамбовских переселенцев государственная крестьянка Анастасия Лукина Покачалова, 18. По жениху: Григорий Петров и Ефим Назаров Ампилоговы. На том же листе поручители Афанасий Петров и Юлиан Артемьев Ампилоговы.",
    mentions: [mention("M1", "groom", "P0495", "Стефан Семёнович Ампилогов"), mention("M2", "bride", "P0496", "Анастасия Лукинична Покачалова", { places: [{ relation: "origin", asWritten: "из тамбовских переселенцев", normalized: "Тамбовская губерния", placeId: "tambov-governorate", confidence: "high" }] }), mention("M3", "surety", "P0492", "Григорий Петрович Анпилогов"), mention("M4", "surety", "P0497", "Ефим Назарович Ампилогов"), mention("M5", "surety", "P0498", "Афанасий Петрович Ампилогов"), mention("M6", "surety", "P0499", "Юлиан Артемьевич Ампилогов")],
    migrations: [{ personId: "P0496", personName: "Анастасия Лукинична Покачалова", from: { placeId: "tambov-governorate", normalized: "Тамбовская губерния" }, to: { placeId: "orenburg-uezd", normalized: "Оренбургский уезд" }, basis: "В графе невесты Анастасия прямо названа происходящей из тамбовских переселенцев.", confidence: "high" }],
  },
  {
    sourceId: "YA-OGAOO-173-11-1968-179", citation: "ОГАОО, ф. 173, оп. 11, д. 1968, скан 179", year: "1855", url: "https://yandex.ru/archive/catalog/8b338dbb-9fad-4f3d-812d-5d4787589e58/179", placeId: "orenburg-uezd", place: "деревня Михайловка, Оренбургский уезд", type: "death", primary: "P0500",
    literal: "Деревни Михайловки государственный крестьянин Сидор Дмитриев Ампилогов, 80 лет, от старости.", mentions: [mention("M1", "deceased", "P0500", "Сидор Дмитриевич Ампилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-1929-162", citation: "ОГАОО, ф. 173, оп. 11, д. 1929, скан 162", year: "1855", url: "https://yandex.ru/archive/catalog/aa2eb8f9-2a0d-4af2-98d0-04b8a90542c7/162", placeId: "orenburg-uezd", place: "деревня Михайловка, Оренбургский уезд", type: "death-copy", primary: "P0500",
    literal: "Деревни Михайловки государственный крестьянин Сидор Дмитриев Ампилогов, 80 лет, от старости.", mentions: [mention("M1", "deceased", "P0500", "Сидор Дмитриевич Ампилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-16-363-83", citation: "ОГАОО, ф. 173, оп. 16, д. 363, скан 83", year: "1880", url: "https://yandex.ru/archive/catalog/e8e14264-a2af-4dbf-a9de-08346cfbb211/83", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "baptism-godparents", primary: "P0501",
    literal: "Восприемники: деревни Гавриловки крестьянин Феодор Михайлов Ампилогов и женка Евдокия Емельянова Баева. Орловским переселенцем в этой строке назван отец ребёнка Иван Евстафьев Ушаков.", mentions: [mention("M1", "godfather", "P0501", "Фёдор Михайлович Ампилогов"), mention("M2", "godmother", "P0502", "Евдокия Емельяновна Баева")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-2004-83", citation: "ОГАОО, ф. 173, оп. 11, д. 2004, скан 83", year: "1856", url: "https://yandex.ru/archive/catalog/e90d5261-6bdd-4b55-8d31-2aa7e341f292/83", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-surety", primary: "P0503",
    literal: "Государственные крестьяне: Евтихий Пахомов, Сергей Ампилогов, Леон Яковлев и Венедикт Венедиктов.", mentions: [mention("M1", "surety", "P0503", "Сергей Ампилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-16-1426-136", citation: "ОГАОО, ф. 173, оп. 16, д. 1426, скан 136", year: "1901", url: "https://yandex.ru/archive/catalog/a5c333b7-18ad-4d39-8c61-23458f256064/136", placeId: "orenburg-uezd", place: "село Георгиевка, Оренбургский уезд", type: "birth", primary: "P0506",
    literal: "Владимир. Села Георгиевки крестьянин Варфоломей Федоров Ампилогов и законная жена его Параскева Иванова, оба православные.", mentions: [mention("M1", "child", "P0506", "Владимир Варфоломеевич Ампилогов"), mention("M2", "father", "P0504", "Варфоломей Фёдорович Ампилогов"), mention("M3", "mother", "P0505", "Параскева Ивановна Ампилогова")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-11-1934-271", citation: "ОГАОО, ф. 173, оп. 11, д. 1934, скан 271", year: "1854", url: "https://yandex.ru/archive/catalog/9709ab51-5af0-496f-b24d-46e4262b2117/271", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-surety", primary: "P0507",
    literal: "Государственные крестьяне: Николай Харитонов Касимов, Яков Кичигин, Тимофей Семенов Ампилогов, Гавриил Лукьянов.", mentions: [mention("M1", "surety", "P0507", "Тимофей Семёнович Ампилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-16-444-87", citation: "ОГАОО, ф. 173, оп. 16, д. 444, скан 87", year: "1882", url: "https://yandex.ru/archive/catalog/de258f34-11f6-4bfc-be1e-5233c7cf0cf7/87", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-sureties", primary: "P0508",
    literal: "Поручители по женихам: деревни Кармалки крестьянин Михаил Сергеев Ампилогов; деревни Кармалки крестьянин Алексей Парфенов Ампилогов.", mentions: [mention("M1", "surety", "P0508", "Михаил Сергеевич Ампилогов"), mention("M2", "surety", "P0509", "Алексей Парфёнович Ампилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-12-777-56", citation: "ОГАОО, ф. 173, оп. 12, д. 777, скан 56", year: "1869", url: "https://yandex.ru/archive/catalog/3fe14767-e3df-4b19-b6fa-aae8b68da591/56", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-surety", primary: "P0492",
    literal: "Деревни Кармалки Григорий Петров Ампилогов среди поручителей.", mentions: [mention("M1", "surety", "P0492", "Григорий Петрович Анпилогов")], migrations: [],
  },
  {
    sourceId: "YA-OGAOO-173-12-777-173", citation: "ОГАОО, ф. 173, оп. 12, д. 777, скан 173", year: "1869", url: "https://yandex.ru/archive/catalog/3fe14767-e3df-4b19-b6fa-aae8b68da591/173", placeId: "orenburg-uezd", place: "Оренбургский уезд", type: "marriage-surety-copy", primary: "P0492",
    literal: "Деревни Кармалки Григорий Петров Ампилогов среди поручителей.", mentions: [mention("M1", "surety", "P0492", "Григорий Петрович Анпилогов")], migrations: [],
  },
];

for (const row of sourceRows) {
  writeJson(path.join(sourceDir, `${row.sourceId}.json`), {
    schemaVersion: 1,
    sourceId: row.sourceId,
    provider: "ОГА Оренбургской области — цифровой скан и машинная расшифровка Яндекс Архива",
    recordType: "primary-scan-transcription",
    collection: { title: "Метрическая книга Оренбургской епархии", archiveCitation: row.citation },
    repository: { name: "Объединённый государственный архив Оренбургской области", location: "Оренбург", url: row.url },
    links: { scan: row.url },
    primaryPersonId: row.primary,
    event: { type: row.type, date: { display: row.year }, place: { normalized: row.place, placeId: row.placeId } },
    mentions: row.mentions.map((item, index) => ({ ...item, mentionId: `${row.sourceId}-${item.mentionId ?? `M${index + 1}`}` })),
    migrationObservations: row.migrations,
    transcription: { status: "checked-against-visible-full-page-transcription", literal: row.literal, modernInterpretation: row.literal },
    evidence: { captureType: "remote-archive-viewer", publicDisplay: false, rightsNote: "Карточка ведёт на открытый просмотрщик Яндекс Архива; локальная копия изображения не публикуется." },
    review: { status: "complete-with-stated-uncertainties", unresolved: ["При необходимости сверить дореформенную орфографию непосредственно по рукописному изображению высокого разрешения."] },
    summary: { status: "verified-summary", text: row.literal },
    isRecord: true,
  });
}

const placesFile = JSON.parse(fs.readFileSync(placesPath, "utf8"));
const newPlaces = [
  { placeId: "orenburg-uezd", name: "Оренбургский уезд", label: "Оренбургский уезд, Оренбургская губерния", kind: "district", aliases: ["Оренбургский уезд", "Оренбургская губерния"], geo: { latitude: 51.768199, longitude: 55.096955, precision: "district", confidence: "low", source: "OpenStreetMap; рабочая точка в Оренбурге", sourceUrl: "https://www.openstreetmap.org/relation/189866", note: "Метрические книги охватывают несколько селений; до локализации конкретного прихода показан уездный центр." } },
  { placeId: "tambov-governorate", name: "Тамбовская губерния", label: "Тамбовская губерния", kind: "region", aliases: ["Тамбовская губерния", "из тамбовских переселенцев"], geo: { latitude: 52.721246, longitude: 41.452238, precision: "region", confidence: "low", source: "OpenStreetMap; рабочая точка в Тамбове", sourceUrl: "https://www.openstreetmap.org/relation/183491", note: "Источник не называет уезд; показан губернский центр." } },
  { placeId: "tomsk-governorate", name: "Томская губерния", label: "Томская губерния", kind: "region", aliases: ["Томская губерния", "Томская губ."], geo: { latitude: 56.488712, longitude: 84.952324, precision: "region", confidence: "low", source: "OpenStreetMap; рабочая точка в Томске", sourceUrl: "https://www.openstreetmap.org/relation/140295", note: "Направление из именного указателя; показан губернский центр." } },
  { placeId: "yenisei-governorate", name: "Енисейская губерния", label: "Енисейская губерния", kind: "region", aliases: ["Енисейская губерния", "Енисейская губ."], geo: { latitude: 56.010563, longitude: 92.852572, precision: "region", confidence: "low", source: "OpenStreetMap; рабочая точка в Красноярске", sourceUrl: "https://www.openstreetmap.org/relation/190090", note: "Направление из именного указателя; показан губернский центр." } },
  { placeId: "orenburg-governorate", name: "Оренбургская губерния", label: "Оренбургская губерния", kind: "region", aliases: ["Оренбургская губерния", "Оренбургская губ."], geo: { latitude: 51.768199, longitude: 55.096955, precision: "region", confidence: "low", source: "OpenStreetMap; рабочая точка в Оренбурге", sourceUrl: "https://www.openstreetmap.org/relation/189866", note: "Направление из именного указателя; показан губернский центр." } },
  { placeId: "ufa-governorate", name: "Уфимская губерния", label: "Уфимская губерния", kind: "region", aliases: ["Уфимская губерния", "Уфимская губ."], geo: { latitude: 54.726141, longitude: 55.947499, precision: "region", confidence: "low", source: "OpenStreetMap; рабочая точка в Уфе", sourceUrl: "https://www.openstreetmap.org/relation/179293", note: "Направление из именного указателя; показан губернский центр." } },
  { placeId: "shchigry-uezd", name: "Щигровский уезд", label: "Щигровский уезд, Курская губерния", kind: "district", aliases: ["Щигровский уезд", "Щигровский уезд, Курская губерния"], geo: { latitude: 51.875241, longitude: 36.904225, precision: "district", confidence: "low", source: "OpenStreetMap; рабочая точка в Щиграх", sourceUrl: "https://www.openstreetmap.org/relation/1645818", note: "Показан уездный центр." } },
  { placeId: "graivoron-uezd", name: "Грайворонский уезд", label: "Грайворонский уезд, Курская губерния", kind: "district", aliases: ["Грайворонский уезд", "село Пороз Грайворонского уезда"], geo: { latitude: 50.486269, longitude: 35.666295, precision: "district", confidence: "low", source: "OpenStreetMap; рабочая точка в Грайвороне", sourceUrl: "https://www.openstreetmap.org/relation/1644965", note: "Село Пороз в указателе показано через уездный центр до отдельной точной локализации." } },
  { placeId: "ukrainian-line", name: "Украинская линия", label: "Украинская укреплённая линия", kind: "historical-site", aliases: ["Украинская линия", "Украинская укреплённая линия"], geo: { latitude: 49.166, longitude: 35.85, precision: "approximate", confidence: "low", source: "Исторический маршрут Украинской линии", sourceUrl: "https://www.ukrainianline.info/", note: "Указатель не раскрывает крепость назначения; точка показывает центральный участок линии." } },
  { placeId: "molotychi-kursk", name: "Молотычи", label: "Молотычи, Курский уезд", kind: "village", aliases: ["село Молотычи", "Молотычи, Усожский стан, Курский уезд"], geo: { latitude: 52.115, longitude: 36.02, precision: "approximate", confidence: "low", source: "Историческая локализация по Курскому краю", sourceUrl: "https://forum.vgd.ru/2537/130324/", note: "Рабочая историческая точка; требует проверки по карте межевания." } },
];
for (const place of newPlaces) {
  if (!placesFile.places.some((existing) => existing.placeId === place.placeId)) placesFile.places.push(place);
}
writeJson(placesPath, placesFile);

const gakoPath = path.join(sourceDir, "PUB-GAKO-68-1-ANPILOGOV-RESETTLERS-INDEX.json");
const gako = JSON.parse(fs.readFileSync(gakoPath, "utf8"));
gako.recordType = "official-name-index-scan";
gako.isRecord = true;
gako.primaryPersonId = "P0510";
gako.event = { type: "resettler-name-index", date: { display: "около 1890 года; дата на карте условная, точные даты находятся в делах" }, place: { normalized: "Курская губерния", placeId: "kursk" } };
gako.mentions = [...personRows.slice(26, 35), ...personRows.slice(38, 41)].map(([personId, displayName], index) => mention(`${gako.sourceId}-M${index + 1}`, "indexed-resettler", personId, displayName));
gako.migrationObservations = [
  ["P0510", "fatezh-uezd", "tomsk-governorate"], ["P0511", "fatezh-uezd", "tomsk-governorate"], ["P0512", "fatezh-uezd", "tomsk-governorate"],
  ["P0513", "stary-oskol", "yenisei-governorate"], ["P0514", "fatezh-uezd", "tomsk-governorate"], ["P0515", "fatezh-uezd", "tomsk-governorate"],
  ["P0516", "fatezh-uezd", "orenburg-governorate"], ["P0517", "fatezh-uezd", "tomsk-governorate"], ["P0518", "shchigry-uezd", "ufa-governorate"],
  ["P0522", "graivoron-uezd", "tomsk-governorate"], ["P0523", "graivoron-uezd", "tomsk-governorate"], ["P0524", "graivoron-uezd", "tomsk-governorate"],
].map(([personId, fromId, toId]) => ({ personId, from: { placeId: fromId }, to: { placeId: toId }, basis: "Официальный именной указатель переселенцев ГАКО прямо называет исходный уезд, направление и номер дела.", confidence: "high" }));
gako.transcription.literal = "Анпилов Г. Ф. — с. Пороз Грайворонского у., Томская губ., дд. 4537, 5474; Анпилов М. П. — там же, д. 5474; Анпилов П. Б. — там же, д. 5474; Анпилогов А. Г. — с. Шахово Фатежского у., Томская губ., д. 3736; Анпилогов А. Т. — с. Троицкое, что на Сучке Фатежского у., Томская губ., д. 4543; Анпилогов А. Ф. — там же; Анпилогов В. — с. Сорокино Старооскольского у., Енисейская губ., д. 1885; Анпилогов Л. А. — с. Троицкое, что на Сучке Фатежского у., Томская губ., д. 3728; Анпилогов Л. А. — Фатежский у., Томская губ., д. 2613; Анпилогов М. В. — с. Никольское Фатежского у., Оренбургская губ., оп. 1, дд. 7022, 7742; Анпилогов П. Б. — с. Троицкое, что на Сучке Фатежского у., Томская губ., оп. 2, д. 4543; Анпилогов Ф. П. — с. Уколово Щигровского у., Уфимская губ., д. 3852.";
gako.inventoryCrosscheck = {
  status: "verified-against-official-inventory-parts",
  note: "Заголовки большинства дел не называют индексированных Анпиловых/Анпилоговых: человек может упоминаться внутри дела либо указатель использует косвенную связь. Нельзя восстанавливать полные имена только по заголовкам.",
  cases: {
    "1885": "16 января 1864 — 28 декабря 1865, 28 л.; заголовок об уставной грамоте имения Г. П. Шагарова.",
    "2613": "9 августа 1866 — 29 января 1867, 12 л.; земельная жалоба И. П. Зубарева.",
    "3728": "18 мая — 9 июля 1870, 3 л.; переписка о драке крестьян Корягиных при разделе земли.",
    "3736": "2 мая — 13 августа 1870, 7 л.; увольнение из общества И. Д. Четверикова.",
    "3852": "25 сентября 1871 — 18 октября 1872, 24 л.; дело об имении М. А. Поздняковой в деревне Дроняевой.",
    "4537": "8–12 февраля 1871, 2 л.; непринятие в общество И. И. Гребенникова и Е. П. Першина.",
    "4543": "13 марта — 16 июля 1871, 4 л.; удаление из общества И. Е. Кашина.",
    "5474": "23 октября 1872 — 8 декабря 1873, 14 л.; прошение о четвертном праве на землю.",
    "7022": "7 февраля 1877 — 21 июня 1882, 226 л.; увольнение крестьян-собственников из обществ без взноса половины капитального долга.",
    "7742": "9 января 1878 — 7 мая 1883, 383 л.; перечисление крестьян из разных уездов Курской губернии в Оренбургскую и Ставропольскую губернии. Самое прямое по теме переселения дело блока."
  }
};
writeJson(gakoPath, gako);

const linePath = path.join(sourceDir, "PUB-UKRAINIAN-LINE-ANPILOGOV-1732-1748.json");
const line = JSON.parse(fs.readFileSync(linePath, "utf8"));
line.recordType = "compiled-migrant-surname-index";
line.isRecord = true;
line.primaryPersonId = "P0519";
line.event.place = { normalized: "Украинская укреплённая линия", placeId: "ukrainian-line" };
line.mentions = [mention(`${line.sourceId}-M1`, "indexed-resettler", "P0519", "Неизвестный Анпилогов — переселенец на Украинскую линию")];
writeJson(linePath, line);

writeJson(path.join(sourceDir, "PUB-RGADA-350-2-1693-MOLOTYCHI-1762.json"), {
  schemaVersion: 1,
  sourceId: "PUB-RGADA-350-2-1693-MOLOTYCHI-1762",
  provider: "РГАДА — опубликованная исследовательская транскрипция ревизской сказки",
  recordType: "secondary-transcription-of-primary-record",
  collection: { title: "Третья ревизия села Молотычи Усожского стана Курского уезда", archiveCitation: "РГАДА, ф. 350, оп. 2, ч. 1, д. 1693, сканы 32–140; 14 мая 1762 года" },
  repository: { name: "Российский государственный архив древних актов", location: "Москва", url: "https://forum.vgd.ru/2537/130324/" },
  links: { transcript: "https://forum.vgd.ru/2537/130324/" },
  primaryPersonId: "P0520",
  event: { type: "revision-list", date: { display: "14 мая 1762" }, place: { normalized: "село Молотычи, Курский уезд", placeId: "molotychi-kursk" } },
  mentions: [mention("PUB-RGADA-350-2-1693-MOLOTYCHI-1762-M1", "revision-resident", "P0520", "Прокофей Федотович Анпилогов", { age: "35 лет" })],
  transcription: { status: "published-transcript-not-original-scan", literal: "Пракофей Федотов сын Анпилогов, 35 лет.", modernInterpretation: "Прокофей Федотович Анпилогов, 35 лет, записан в ревизской сказке села Молотычи." },
  review: { status: "needs-original-scan", unresolved: ["Не отождествлять Прокофея с безымянным Анпилоговым, сошедшим на Украинскую линию, без оригинальной строки о выбытии."] },
  summary: { status: "verified-secondary-transcription", text: "Прокофей Федотович Анпилогов, 35 лет, присутствует в ревизии Молотычей 1762 года; его переселение на Украинскую линию не доказано." },
  isRecord: true,
});

console.log(`Импортировано: ${personRows.length} профилей, ${families.length} семей, ${sourceRows.length + 3} источника/индекса.`);
