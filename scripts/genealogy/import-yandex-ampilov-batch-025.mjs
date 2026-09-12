#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const capturedAt = "2026-09-10";
const searchPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilov-2026-09-10.json");
const sourceRoot = path.join(root, "data/genealogy/sources/yandex");
const legacySourceRoot = path.join(root, "data/genealogy/sources");
const peopleRoot = path.join(root, "data/genealogy/people");
const metadataRoot = path.join(tmpdir(), "yandex-archive-ampilov-2026-09-10-metadata");
await mkdir(sourceRoot, { recursive: true });

const people = [
  { id: "P101746", name: "Александра Михайловна Ампилова", sex: "female", w: "Александра Михаилова Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянка села Бахтемир, восприемница в 1909 году." },
  { id: "P101747", name: "Александра Васильевна Ампилова (деревня Спасская)", sex: "female", w: "крестьянка Александра Васильева Ампилова", sn: "Ампилова", pl: "деревня Спасская, Сухановская волость, Подольский уезд", extraPlaces: [{ relation: "documented-presence", normalized: "село Кусково, Московский уезд", confidence: "high" }], note: "Уроженка или приписанная крестьянка деревни Спасской; документирована как восприемница в приходе Спасской церкви села Кусково. Это наблюдение присутствия, а не доказанный акт переселения." },
  { id: "P101748", name: "Зиновия Михайловна Ампилова", sex: "female", w: "Зиновія Михаилова Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянка села Бахтемир, неоднократно названная восприемницей в 1910 году." },
  { id: "P101749", name: "Евдокия Павловна Ампилова (Гамалеевка)", sex: "female", w: "крестьянка Евдокія Павлова Ампилова", sn: "Ампилова", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянка села Гамалеевки, восприемница в 1910 году; не объединена с одноимёнными женщинами иных приходов." },
  { id: "P101750", name: "Анна Лукьяновна Ампилова", sex: "female", w: "крестьянка Анна Лукіанова Ампилова", sn: "Ампилова", pl: "село Гамалеевка, Бузулукский уезд", note: "Невеста из села Гамалеевки, 18 лет 10 месяцев, вступавшая в первый брак в 1910 году." },
  { id: "P101751", name: "Семён Миронович Ампилов", sex: "male", w: "крестьянинъ Симеонъ Мироновъ Ампиловъ", sn: "Ампилов", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянин села Гамалеевки, восприемник в 1910 году." },
  { id: "P101752", name: "Фёдор Спиридонович Ампилов", sex: "male", w: "крестьянинъ Ѳеодоръ Спиридоновъ Ампиловъ", sn: "Ампилов", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянин села Бахтемир, умерший в 1910 году в возрасте 65 лет." },
  { id: "P101753", name: "Алексей Сергеевич Ампилов", sex: "male", w: "крестьянинъ Алексѣй Сергѣевъ Ампиловъ", sn: "Ампилов", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянин села Гамалеевки, восприемник в 1910 году." },
  { id: "P101754", name: "Анастасия Мироновна Ампилова", sex: "female", w: "дѣвица Анастасія Миронова Ампилова", sn: "Ампилова", pl: "село Гамалеевка, Бузулукский уезд", note: "Девица села Гамалеевки, восприемница в 1910 году." },
  { id: "P101755", name: "Мария Васильевна Ампилова (Песково)", sex: "female", w: "крестьянка Марія Васильева Ампилова", sn: "Ампилова", pl: "село Песково, Алтушевская волость, Вязниковский уезд", extraPlaces: [{ relation: "documented-presence", normalized: "Москва, приход Введенской церкви в Барашах", confidence: "high" }], note: "Крестьянка села Песково, документированная как восприемница в московском приходе. Это наблюдение присутствия, а не доказанный акт переселения." },
  { id: "P101756", name: "Дмитрий Ампилов (псаломщик, Нижне-Чебенька)", sex: "male", w: "Псаломщикъ Димитрій Ампиловъ", sn: "Ампилов", pl: "посёлок Нижне-Чебенька, Оренбургский уезд", note: "Псаломщик прихода, отмеченный в метрической книге за 1910 год как отсутствовавший." },
  { id: "P101757", name: "Анна Михайловна Ампилова", sex: "female", w: "Анна Михаилова Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянка села Бахтемир, восприемница в 1910 году." },
  { id: "P101758", name: "Пелагия Фёдоровна Ампилова", sex: "female", w: "крестьянка Пелагія Ѳедорова Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", note: "Невеста из села Бахтемир, 22 лет, вступавшая в первый брак в 1910 году." }
];

const rec = [
  { p: 662, id: "a06ccf2c-5e94-4659-bc87-e67ca5a3382d", s: 18, t: "birth-godparents", y: "1909", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101746", "Александра Михаилова Ампилова"]], l: "Крестьяне села Бахтемирского Феодор Димитриев Мокеев и Александра Михаилова Ампилова [в строке восприемников].", x: "Оригинал подтверждает Александру Михайловну Ампилову как восприемницу; фамилия вынесена на отдельную строку." },
  { p: 663, id: "a06ccf2c-5e94-4659-bc87-e67ca5a3382d", s: 20, t: "birth-godparents", y: "1909", pl: "село Бахтемир, Астраханская губерния", m: [["godfather", "P101686", "крестьянинъ Стефанъ Димитріевъ Ампиловъ"]], l: "Крестьянин села Бахтемирского Стефан Димитриев Ампилов и крестьянка села Ильинки Филисада Николаева Андреева [в строке восприемников].", x: "Стефан Дмитриевич Ампилов назван восприемником." },
  { p: 664, id: "c50dae78-727f-40f2-ac43-d1ea2d0a0d8e", s: 6, t: "marriage", y: "1909", pl: "село Бахтемир, Астраханская губерния", m: [["groom", "P101590", "крестьянинъ Александръ Ипатовъ Ампиловъ"]], l: "Крестьянин села Бахтемирского Александр Ипатов Ампилов, православного вероисповедания, первым браком, 25 лет. Невеста Зиновия Михайлова, 17 лет.", x: "Александр Ипатьевич Ампилов вступил в первый брак; невеста другой фамилии сохранена только в расшифровке." },
  { p: 665, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 40, t: "birth-godparents", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["godfather", "P101742", "крестьянинъ Сергий Константиновъ Ампиловъ"]], l: "Того же села крестьянин Сергий Константинов Ампилов и девица Фекла Филиппова Михайлова [в строке восприемников].", x: "Сергей Константинович Ампилов назван восприемником." },
  { p: 666, id: "a78cec96-f6d6-4561-a9a1-ae12ad8f2ecd", s: 330, t: "birth-godparents", y: "начало XX века", pl: "село Кусково, Московский уезд", c: "medium", u: ["Год книги неразборчив в заголовке каталога; точная дата события в этой карточке не нормализована."], m: [["godmother", "P101747", "Подольскаго уезда Сухановской волости деревни Спасской крестьянка Александра Васильева Ампилова"]], l: "Подольского уезда Сухановской волости деревни Спасской крестьянка Александра Васильева Ампилова [в строке восприемников Спасской церкви села Кусково].", x: "Скан подтверждает происхождение Александры Васильевны из деревни Спасской и её присутствие в Кусковском приходе; это не приравнено к доказанному переселению." },
  { p: 667, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 5, t: "birth-godparents", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101748", "Зиновія Михаилова Ампилова"]], l: "Крестьяне села Бахтемирского Василий Гаврилов Кожевников и Зиновия Михаилова Ампилова [в строке восприемников].", x: "Зиновия Михайловна Ампилова названа восприемницей." },
  { p: 668, id: "5a928444-5f45-4565-a233-7d389f3c918b", s: 12, t: "birth-family", y: "1910", pl: "село Тримихайловка", m: [["father", "P101574", "крестьянинъ Іаковъ Васильевъ Ампиловъ"], ["mother", null, "законная жена его Агапія Капитонова Попова"]], l: "Села Тримихайловки крестьянин Иаков Васильев Ампилов и законная жена его Агапия Капитонова Попова; оба православные.", x: "Яков Васильевич Ампилов записан отцом ребёнка; имя ребёнка находится вне целевого фрагмента." },
  { p: 669, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 23, t: "birth-godparents", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["godmother", "P101749", "крестьянка Евдокія Павлова Ампилова"]], l: "Того же села крестьянин Иоанн Петров Федорченко и крестьянка Евдокия Павлова Ампилова [в строке восприемников].", x: "Евдокия Павловна Ампилова названа восприемницей." },
  { p: 670, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 51, t: "marriage", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["bride", "P101750", "крестьянка Анна Лукіанова Ампилова"]], l: "Села Гамалеевки крестьянка Анна Лукианова Ампилова, православная, первым браком, 18 лет 10 месяцев.", x: "Анна Лукьяновна Ампилова документирована как невеста; сведения о женихе остаются в полном скане." },
  { p: 671, id: "5a928444-5f45-4565-a233-7d389f3c918b", s: 15, t: "birth-godparents", y: "1910", pl: "село Тримихайловка", m: [["godmother", "P101582", "крестьянская жена Марѳа Іоанникіева Ампилова"]], l: "Деревни Яковлевки крестьянин Антоний Димитриев Овинов и крестьянская жена села Тримихайловки Марфа Иоанникиева Ампилова [в строке восприемников].", x: "Марфа Иоанникиевна Ампилова названа восприемницей." },
  { p: 672, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 33, t: "birth-godparents", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["godfather", "P101751", "крестьянинъ Симеонъ Мироновъ Ампиловъ"], ["godmother", "P101741", "Анисія Максимова Ампилова"]], l: "Того же села крестьянин Симеон Миронов Ампилов и Анисия Максимова Ампилова [в строке восприемников].", x: "Оригинал подтверждает двух восприемников фамильного ряда." },
  { p: 673, id: "caccf917-71e1-4940-8246-41e54b8d8683", s: 15, t: "death", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["deceased", "P101752", "крестьянинъ Ѳеодоръ Спиридоновъ Ампиловъ"]], l: "Крестьянин села Бахтемирского Феодор Спиридонов Ампилов. 65 лет.", x: "В метрической книге умерших документирован 65-летний Фёдор Спиридонович Ампилов." },
  { p: 674, id: "5a928444-5f45-4565-a233-7d389f3c918b", s: 73, t: "birth-godparents", y: "1910", pl: "село Тримихайловка", m: [["godmother", "P101519", "крестьянская дѣвица Марія Іаковлева Ампилова"]], l: "Села Тримихайловки крестьянин Алексей Ильин Коршиков и крестьянская девица Мария Яковлева Ампилова [в строке восприемников].", x: "Мария Яковлевна Ампилова названа восприемницей." },
  { p: 675, id: "b799f230-f104-40e4-b260-fbb17506fe01", s: 160, t: "clergy-register-note", y: "1910", pl: "посёлок Нижне-Чебенька, Оренбургский уезд", m: [["psalm-reader", "P101756", "Псаломщикъ Димитрій Ампиловъ"]], l: "Священник Алексий Гробилин. Псаломщик Димитрий Ампилов — в отсутствии. Запись стоит в заверительной части метрического разворота.", x: "Дмитрий Ампилов документирован как псаломщик прихода; помета сообщает его отсутствие." },
  { p: 676, id: "caccf917-71e1-4940-8246-41e54b8d8683", s: 9, t: "death", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["deceased", "P101712", "крестьянинъ Іосифъ Ѳедоровъ Ампиловъ"]], l: "Крестьянин села Бахтемирского Иосиф Федоров Ампилов [в записи об умерших].", x: "Оригинал подтверждает запись об Иосифе Фёдоровиче Ампилове; точная дата не нормализована без соседних граф." },
  { p: 677, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 11, t: "birth-godparents", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["godfather", "P101753", "крестьянинъ Алексѣй Сергѣевъ Ампиловъ"], ["godmother", "P101754", "дѣвица Анастасія Миронова Ампилова"]], l: "Того же села крестьянин Алексей Сергеев Ампилов и девица Анастасия Миронова Ампилова [в строке восприемников].", x: "Индекс ошибочно представил Алексея как родившегося; по заголовку колонки оба Ампиловы являются восприемниками." },
  { p: 678, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 24, t: "birth-family", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["father", "P101695", "крестьянинъ Ефимъ Ипатовъ Ампиловъ"], ["mother", null, "законная его жена Марія Степанова"]], l: "Крестьянин села Бахтемирского Ефим Ипатов Ампилов и законная его жена Мария Степанова; оба православные.", x: "Ефим Ипатьевич Ампилов записан отцом ребёнка; имя ребёнка находится вне целевого фрагмента." },
  { p: 679, id: "c2cd2991-c9c8-4dba-a299-c29fca7eb660", s: 310, t: "birth-godparents", y: "начало XX века", pl: "Москва, приход Введенской церкви в Барашах", c: "medium", u: ["Точный год не нормализован: заголовок каталога обрезан."], m: [["godmother", "P101755", "Владимирской губерніи Вязниковскаго уѣзда Алтушевской волости села Пескова Марія Васильева Ампилова"]], l: "Крестьянка Владимирской губернии Вязниковского уезда Алтушевской волости села Пескова Мария Васильева Ампилова [в строке восприемников московской метрической книги].", x: "Скан подтверждает происхождение Марии Васильевны из Пескова и её присутствие в Москве; это не приравнено к доказанному переселению." },
  { p: 680, id: "5a928444-5f45-4565-a233-7d389f3c918b", s: 19, t: "birth-family", y: "1910", pl: "село Тримихайловка", par: [684], m: [["father", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"], ["mother", null, "законная жена его Марія Григоріева"]], l: "Села Тримихайловки солдат Герасим Васильев Ампилов и законная жена его Мария Григориева, православные.", x: "Герасим Васильевич Ампилов записан отцом ребёнка; карточки 680 и 684 ведут к одному скану." },
  { p: 681, id: "340ab656-6238-42da-ac08-590ab5c36a0e", s: 116, t: "uncertain-index-hit-review", y: "1910", pl: "Астраханская губерния", pub: false, c: "low", u: ["Фамилия в строке №415 читается как Капылов/Каплов, а не Ампилов; индексный фрагмент смешал соседние поля."], m: [["index-only", null, "[Ампилова] — только ошибочное значение индекса"]], l: "В строке № 415 списка призывников фамилия читается как Капылов (возможен вариант Каплов); имени Ампилов в целевой строке нет.", x: "Ложное срабатывание индекса. Профиль, публичный Record и точка карты не создаются." },
  { p: 682, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 27, t: "birth-godparents", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101757", "Анна Михаилова Ампилова"]], l: "Крестьянин села Бахтемирского Федор Димитриев Мокеев и Анна Михаилова Ампилова [в строке восприемников].", x: "Анна Михайловна Ампилова названа восприемницей." },
  { p: 683, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 4, t: "birth-family", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["father", "P101686", "крестьянинъ Стефанъ Димитріевъ Ампиловъ"], ["mother", "P101716", "законная жена его Евдокія Сергиева"]], l: "Крестьянин села Бахтемирского Стефан Димитриев Ампилов и законная жена его Евдокия Сергиева; оба православные.", x: "Стефан Дмитриевич и Евдокия Сергеевна Ампиловы записаны родителями ребёнка." },
  { p: 685, id: "5a928444-5f45-4565-a233-7d389f3c918b", s: 36, t: "birth-family", y: "1910", pl: "село Тримихайловка", m: [["father", "P101574", "крестьянинъ Іаковъ Васильевъ Ампиловъ"], ["mother", null, "законная жена его Евдокія Павлова"]], l: "Села Тримихайловки крестьянин Иаков Васильев Ампилов и законная жена его Евдокия Павлова; православные.", x: "Яков Васильевич Ампилов записан отцом ребёнка; фамилия супруги отдельно на скане не повторена." },
  { p: 686, id: "5604cc6c-958a-4add-8661-061a47d0b2f4", s: 6, t: "birth-godparents", y: "1910", pl: "село Гамалеевка, Бузулукский уезд", m: [["godmother", "P101741", "дѣвица Анисія Максимова Ампилова"]], l: "Того же села крестьянин Афанасий Стефанов Тихонов, девица Дария Андреева Дудина и девица Анисия Максимова Ампилова [в строке восприемников].", x: "Анисия Максимовна Ампилова названа восприемницей." },
  { p: 687, id: "9eb7410f-bb89-4e9b-8097-484123528168", s: 232, t: "clergy-signature", y: "1910", pl: "село Каргино", m: [["priest", "P101744", "Священникъ Николай Ампиловъ"]], l: "Священник Николай Ампилов с причтом. Подпись «Ампиловъ» стоит в служебной части разворота Николаевской церкви села Каргино.", x: "Подпись подтверждает продолжение службы Николая Ампилова в Каргинском приходе." },
  { p: 688, id: "abe035f8-731b-4197-9975-ff1b64a512cd", s: 160, t: "burial-clergy-multiple-entries", y: "1910", pl: "Слоновский приход", m: [["deacon", "P1543", "Діаконъ Аѳиногенъ Ампилоговъ"]], l: "Священник Иоанн Поляков с диаконом Афиногеном Ампилоговым; формула повторяется при погребениях на развороте.", x: "Оригинал подтверждает службу диакона Афиногена Ампилогова; умершие других фамилий остаются в расшифровке и не получают профилей." },
  { p: 689, id: "80fbb899-4f61-49b4-ae65-cec2a470cbf8", s: 11, t: "marriage", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["bride", "P101758", "крестьянка Пелагія Ѳедорова Ампилова"]], l: "Крестьянка села Бахтемирского Пелагия Федорова Ампилова, православного вероисповедания, первым браком, 22 лет.", x: "Пелагия Фёдоровна Ампилова документирована как невеста; жених другой фамилии сохранён в полном скане." },
  { p: 690, id: "7ef5f5cb-fbcc-4105-8c46-64310d8dcb25", s: 54, t: "false-index-hit-review", y: "1910", pl: "Инсарский уезд", par: [693], pub: false, c: "high", u: ["Яндекс ошибочно распознал фамилию служившего диакона."], m: [["misread-by-index", null, "діаконъ Егоръ Адонисовъ"]], l: "Петр Андреев Алёшин и деревни Оржовки Гавриила Андреева Балаева дочь девица Александра. Таинство совершал диакон Егор Адонисов.", x: "На оригинале ясно читается «Егор Адонисов», не «Ампилов». Карточки 690 и 693 — дубликаты одного ложного совпадения." },
  { p: 691, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 22, t: "birth-godparents", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101748", "Зиновія Михаилова Ампилова"]], l: "Крестьяне села Бахтемирского Иван Михайлов Улзев и Зиновия Михайлова Ампилова [в строке восприемников].", x: "Зиновия Михайловна Ампилова вновь названа восприемницей." },
  { p: 692, id: "23e7cdef-0289-4054-a95d-1c29678efce0", s: 36, t: "birth-godparents", y: "1910", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101716", "Евдокія Сергіева Ампилова"]], l: "Крестьяне села Бахтемирского Федор Димитриев Мокеев и Евдокия Сергиева Ампилова [в строке восприемников].", x: "Евдокия Сергеевна Ампилова названа восприемницей." }
];

const search = JSON.parse(await readFile(searchPath, "utf8"));
const rows = search.batches[0].results;
const rowAt = (position) => rows.find((row) => row.absolutePosition === position);
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const dimensions = async (file) => { const data = await readFile(file); return `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`; };
const evidence = async (id, scan) => {
  const prefix = String(scan).padStart(4, "0");
  const dir = path.join(root, "data/genealogy/evidence-private/yandex", id);
  const full = path.join(dir, `${prefix}-full-view.png`);
  const header = path.join(dir, `${prefix}-header.png`);
  const target = path.join(dir, `${prefix}-target-entry.png`);
  await access(full); await access(header); await access(target);
  return { catalogId: id, scanNumber: scan, captureType: "yandex-archive-original-image-download-with-enlarged-fragments", localBackup: relative(full), path: relative(full), capturedAt, sha256: await digest(full), fragments: [
    { kind: "header", path: relative(header), sha256: await digest(header), description: "Фрагмент исходного листа, фиксирующий структуру и год документа." },
    { kind: "target-entry", path: relative(target), sha256: await digest(target), description: "Крупный фрагмент целевой записи без интерфейса Яндекса." }
  ], quality: { documentOnlyVisuallyConfirmed: true, headerVisuallyConfirmed: true, targetRowsVisuallyConfirmed: true, confirmedAt: capturedAt, method: "manual-reading-of-downloaded-original", fullDimensions: await dimensions(full) }, publicDisplay: false, rightsNote: "Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив." };
};
const pmap = new Map(people.map((person) => [person.id, person]));
const sourceIdsByPerson = new Map(people.map((person) => [person.id, []]));
const sourceFile = async (sourceId) => { const legacy = path.join(legacySourceRoot, `${sourceId}.json`); try { await access(legacy); return legacy; } catch { return path.join(sourceRoot, `${sourceId}.json`); } };

for (const record of rec) {
  const sourceId = `YA-${record.id.slice(0, 8).toUpperCase()}-${String(record.s).padStart(3, "0")}`;
  const metadata = JSON.parse(await readFile(path.join(metadataRoot, `${record.id}-${record.s}.json`), "utf8"));
  const primaryEvidence = await evidence(record.id, record.s);
  const value = {
    schemaVersion: 1, sourceId, provider: "Яндекс Архив — первичный скан", recordType: record.t,
    collection: { catalogId: record.id, scanNumber: record.s, title: metadata.row.title },
    links: { documentUrl: `https://yandex.ru/archive/catalog/${record.id}/${record.s}` },
    event: { type: record.t, date: { display: record.y, confidence: record.c ?? "high-for-year" }, place: { normalized: record.pl } },
    mentions: record.m.map(([role, personId, written], index) => ({ mentionId: `${sourceId}-M${index + 1}`, role, personId, displayName: pmap.get(personId)?.name ?? written.replaceAll("ъ", ""), nameAsTranscribed: written, surnameSeries: Boolean(personId) })),
    evidence: primaryEvidence,
    transcription: { status: record.u ? "complete-with-uncertainties" : "complete-primary-scan-transcription-with-local-evidence", literal: record.l, modernInterpretation: record.x, indexNote: "Индекс Яндекса использован только для навигации; чтение выполнено по сохранённому оригиналу." },
    isRecord: true, cardKind: record.pub === false ? "research-review" : "named-primary-record", publicCore: record.pub !== false,
    review: { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: record.c ?? "high", unresolved: record.u ?? (record.pub === false ? ["Совпадение не подтверждает носителя исследуемого фамильного ряда."] : []) }
  };
  await writeFile(await sourceFile(sourceId), `${JSON.stringify(value, null, 2)}\n`);
  for (const [, personId] of record.m) if (personId) sourceIdsByPerson.get(personId)?.push(sourceId);
  Object.assign(rowAt(record.p), { sourceId, status: record.pub === false ? "complete-unconfirmed-index-hit" : "complete-with-local-evidence", capture: false, primaryScanReading: record.l });
  for (const position of record.par ?? []) Object.assign(rowAt(position), { sourceId, status: "complete-duplicate-card", capture: false, primaryScanReading: record.l });
}

const backlinks = {
  P101686: ["YA-A06CCF2C-020", "YA-23E7CDEF-004"], P101590: ["YA-C50DAE78-006"], P101742: ["YA-5604CC6C-040"],
  P101574: ["YA-5A928444-012", "YA-5A928444-036"], P101582: ["YA-5A928444-015"], P101741: ["YA-5604CC6C-033", "YA-5604CC6C-006"],
  P101519: ["YA-5A928444-073"], P101712: ["YA-CACCF917-009"], P101695: ["YA-23E7CDEF-024"], P101658: ["YA-5A928444-019"],
  P101716: ["YA-23E7CDEF-004", "YA-23E7CDEF-036"], P101744: ["YA-9EB7410F-232"], P1543: ["YA-ABE035F8-160"]
};
const files = await readdir(peopleRoot);
for (const [personId, additions] of Object.entries(backlinks)) {
  const name = files.find((file) => file.startsWith(`${personId}-`) && file.endsWith(".json"));
  if (!name) throw new Error(`Не найден профиль ${personId}`);
  const file = path.join(peopleRoot, name);
  const value = JSON.parse(await readFile(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds ?? []), ...additions])].sort();
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

for (const person of people) {
  const slug = person.name.toLowerCase().replaceAll("ё", "e").replaceAll("й", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
  const value = { schemaVersion: 1, personId: person.id, displayName: person.name, sex: person.sex, nameVariants: [person.w], surname: { normalized: person.sn, formsAsWritten: [person.w.match(/Амп[а-яѣіы]+/i)?.[0]?.replace(/ъ$/g, "") ?? person.sn] }, sourceIds: [...new Set(sourceIdsByPerson.get(person.id))].sort(), status: "documented-from-primary-scan", places: [{ relation: "documented-origin", normalized: person.pl, confidence: "high" }, ...(person.extraPlaces ?? [])], notes: [person.note] };
  await writeFile(path.join(peopleRoot, `${person.id}-${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

const completed = rows.filter((row) => row.capture === false && !row.status.startsWith("pending-")).length;
const pending = rows.filter((row) => row.capture !== false && row.status.startsWith("pending-"));
search.progress = { ...search.progress, rowsCompleted: completed, uniqueScansPending: new Set(pending.map((row) => `${row.catalogId}/${row.scanNumber}`)).size, rowsRemaining: rows.length - completed };
await writeFile(searchPath, `${JSON.stringify(search, null, 2)}\n`);
console.log(JSON.stringify({ sourcesWritten: rec.length, peopleWritten: people.length, rowsCompleted: completed, rowsRemaining: rows.length - completed, uniqueScansPending: search.progress.uniqueScansPending }, null, 2));
