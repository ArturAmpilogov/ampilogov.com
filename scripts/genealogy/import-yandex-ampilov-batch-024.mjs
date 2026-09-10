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
  { id: "P101729", name: "Марфа Даниловна Ампилова", sex: "female", w: "крестьянская жена Марѳа Данилова Ампилова", sn: "Ампилова", pl: "село Тримихайловка", note: "Крестьянская жена села Тримихайловки, восприемница близнецов Пелагии и Ирины в 1908 году." },
  { id: "P101730", name: "Константин Ампилов (Баклановка)", sex: "male", w: "села Баклановки крестьянинъ Константинъ [отчество неуверенно] Ампиловъ", sn: "Ампилов", pl: "село Баклановка", children: ["P101731"], note: "Крестьянин села Баклановки, отец Анны; отчество на сгибе читается неуверенно и не нормализовано." },
  { id: "P101731", name: "Анна Константиновна Ампилова", sex: "female", w: "Анна, дочь Константина Ампилова", sn: "Ампилова", pl: "село Баклановка", parents: ["P101730"], note: "Дочь крестьянина Константина Ампилова и Устиньи Петровны; родилась 18 и крещена 19 апреля 1908 года." },
  { id: "P101732", name: "Фёдор Парфёнович Ампилов", sex: "male", w: "запасный рядовой Ѳеодоръ Парѳеновъ Ампиловъ", sn: "Ампилов", pl: "село Кармалка", note: "Запасный рядовой, названный восприемником в метрической книге Кармалки за 1908 год." },
  { id: "P101733", name: "Анисим Михайлович Ампилов", sex: "male", w: "Анисимъ Михаиловъ Ампиловъ", sn: "Ампилов", pl: "село Обильное, Астраханская губерния", note: "Крестьянин села Обильного, восприемник в 1908 году." },
  { id: "P101734", name: "Роман Ампилов (Баклановка)", sex: "male", w: "села Баклановки крестьянинъ Романъ [отчество неуверенно] Ампиловъ", sn: "Ампилов", pl: "село Баклановка", children: ["P101735"], note: "Крестьянин села Баклановки, отец Елизаветы; отчество не нормализовано из-за неуверенного чтения." },
  { id: "P101735", name: "Елизавета Романовна Ампилова", sex: "female", w: "Елизавета, дочь Романа Ампилова", sn: "Ампилова", pl: "село Баклановка", parents: ["P101734"], note: "Дочь Романа Ампилова; рождение записано в метрической книге Баклановки за 1908 год." },
  { id: "P101736", name: "Антонина Михайловна Ампилова", sex: "female", w: "Антонина, дочь Михаила Алексіева Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", parents: ["P101526", "P101575"], note: "Дочь Михаила Алексеевича и Евдокии Исаевны Ампиловых; родилась 10 и крещена 12 июня 1909 года." },
  { id: "P101737", name: "Агапия Герасимовна Ампилова", sex: "female", w: "Агапія, дочь Герасима Васильева Ампилова", sn: "Ампилова", pl: "село Тримихайловка", parents: ["P101658"], note: "Дочь Герасима Васильевича Ампилова и Марии Григорьевны; родилась 23 и крещена 25 января 1909 года." },
  { id: "P101738", name: "Анна Васильевна Ампилова (приход Пронькина)", sex: "female", w: "крестьянская жена Анна Васильева Ампилова", sn: "Ампилова", pl: "приход сёл Пронькино, Сарапкина и Каменная Сарма", note: "Крестьянская жена, названная восприемницей в 1909 году; не объединена с тёзками из других приходов." },
  { id: "P101739", name: "Ефим Гаврилович Ампилов", sex: "male", w: "крестьянинъ Евѳимъ Гавриловъ Ампиловъ", sn: "Ампилов", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянин села Гамалеевки, восприемник в 1909 году." },
  { id: "P101740", name: "Михаил Ампилов (младенец, Иркутск)", sex: "male", w: "младенецъ Михаилъ Ампиловъ", sn: "Ампилов", pl: "Иркутск", note: "Младенец Михаил Ампилов умер в Иркутске в возрасте четырёх часов; родители на целевой строке не названы." },
  { id: "P101741", name: "Анисия Максимовна Ампилова (Гамалеевка)", sex: "female", w: "дѣвица Анисія Максимова Ампилова", sn: "Ампилова", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянская девица, восприемница в 1909 году; не объединена с тёзкой из другого прихода." },
  { id: "P101742", name: "Сергей Константинович Ампилов", sex: "male", w: "крестьянинъ Сергей Константиновъ Ампиловъ", sn: "Ампилов", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянин села Гамалеевки, восприемник в 1909 году." },
  { id: "P101743", name: "Анна Филипповна Ампилогова", sex: "female", w: "крестьянская дѣвица Анна Филиппова Ампилогова", sn: "Ампилогова", pl: "село Кармалка", note: "Крестьянская девица села Кармалки, восприемница в 1909 году." },
  { id: "P101744", name: "Николай Ампилов (священник, Каргино)", sex: "male", w: "Священникъ Николай Ампиловъ", sn: "Ампилов", pl: "село Каргино", note: "Священник Николаевской церкви села Каргино, чья подпись стоит в итоговой части записей об умерших за 1909 год; отчество не указано." },
  { id: "P101745", name: "Татьяна Михайловна Ампилова (брак 1909)", sex: "female", w: "крестьянская дочь дѣвица Татьяна Михайлова Ампилова", sn: "Ампилова", pl: "село Кармалка", note: "Невеста из села Кармалки, 19 лет 10 месяцев, вступавшая в первый брак в 1909 году; не объединена с тёзкой без отдельного доказательства тождества." }
];

const rec = [
  { p: 630, id: "c581a7ee-7d14-4e09-b747-35c58bbe67cb", s: 36, t: "birth-godparents", y: "30 апреля 1908", pl: "село Тримихайловка", m: [["godfather", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"], ["godmother", "P101729", "крестьянская жена Марѳа Данилова Ампилова"]], l: "При крещении близнецов Пелагии и Ирины восприемниками записаны солдат Герасим Васильев Ампилов и крестьянская жена Марфа Данилова Ампилова.", x: "Герасим Васильевич и Марфа Даниловна Ампиловы были восприемниками близнецов 30 апреля 1908 года; индекс Яндекса приписал строке другое имя." },
  { p: 631, id: "7869f375-f0e3-4bbc-8f40-05a7e14942cd", s: 12, t: "birth", y: "18 апреля 1908", pl: "село Баклановка", c: "medium", u: ["Отчество отца Константина и имя одного восприемника на сгибе читаются неуверенно."], m: [["child", "P101731", "Анна"], ["father", "P101730", "крестьянинъ Константинъ [отчество неуверенно] Ампиловъ"], ["mother", null, "законная жена его Устинья Петрова"]], l: "Анна. Села Баклановки крестьянин Константин [отчество неуверенно] Ампилов и законная жена его Устинья Петрова; оба православные. Родилась 18, крещена 19 апреля 1908 года.", x: "Первичный скан подтверждает Анну, дочь Константина Ампилова; прежнее заключение о ложном совпадении исправлено." },
  { p: 632, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 66, t: "death-of-child", y: "15 февраля 1908", pl: "село Обильное, Астраханская губерния", m: [["father", "P101625", "села Обильнаго крестьянина Ильи Борисова Ампилова"], ["deceased-child", null, "сынъ Илья"]], l: "Села Обильного крестьянина Ильи Борисова Ампилова сын Илья. Умер 15, погребён 16 февраля 1908 года.", x: "У Ильи Борисовича Ампилова умер малолетний сын Илья; индекс ошибочно смешал эту строку с соседним умершим." },
  { p: 633, id: "c581a7ee-7d14-4e09-b747-35c58bbe67cb", s: 49, t: "birth-godparents", y: "1908", pl: "село Тримихайловка", m: [["godfather", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"]], l: "Села Тримихайловки солдат Герасим Васильев Ампилов и крестьянская жена Мария Петрова Щепоткина [в строке восприемников].", x: "Герасим Васильевич Ампилов назван восприемником в 1908 году." },
  { p: 634, id: "38d46cd1-3ddb-4f80-bb41-96ef5f0d6f55", s: 286, t: "birth-godparents", y: "1908", pl: "село Кармалка", m: [["godfather", "P101732", "запасный рядовой Ѳеодоръ Парѳеновъ Ампиловъ"]], l: "Того же села запасный рядовой Феодор Парфенов Ампилов и крестьянская девица Марфа Федорова [в строке восприемников].", x: "Фёдор Парфёнович Ампилов назван восприемником." },
  { p: 635, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 20, t: "birth-godparents", y: "1908", pl: "село Обильное, Астраханская губерния", m: [["godfather", "P101733", "Анисимъ Михаиловъ Ампиловъ"]], l: "Того же села и звания Анисим Михайлов Ампилов и вдова Иванова Бурдина [в строке восприемников].", x: "Анисим Михайлович Ампилов назван восприемником в 1908 году." },
  { p: 636, id: "7869f375-f0e3-4bbc-8f40-05a7e14942cd", s: 23, t: "birth", y: "1908", pl: "село Баклановка", c: "medium", u: ["Отчество Романа и часть имени матери читаются неуверенно."], m: [["child", "P101735", "Елизавета"], ["father", "P101734", "крестьянинъ Романъ [отчество неуверенно] Ампиловъ"], ["mother", null, "законная жена его [имя читается неуверенно]"]], l: "Елизавета. Села Баклановки крестьянин Роман [отчество неуверенно] Ампилов и законная жена его [имя неуверенно]; оба православные.", x: "Оригинал подтверждает Елизавету, дочь Романа Ампилова; неуверенные части не подменены данными индекса." },
  { p: 637, id: "a06ccf2c-5e94-4659-bc87-e67ca5a3382d", s: 22, t: "birth", y: "10 июня 1909", pl: "село Бахтемир, Астраханская губерния", m: [["child", "P101736", "Антонина"], ["father", "P101526", "крестьянинъ Михаилъ Алексіевъ Ампиловъ"], ["mother", "P101575", "законная его жена Евдокія Исаева"]], l: "Антонина. Крестьянин села Бахтемирского Михаил Алексиев Ампилов и законная его жена Евдокия Исаева; оба православные. Родилась 10, крещена 12 июня 1909 года.", x: "10 июня 1909 года у Михаила Алексеевича и Евдокии Исаевны Ампиловых родилась Антонина." },
  { p: 638, id: "dd13cf8e-ce4d-4262-9ae7-b81da081b741", s: 10, t: "birth", y: "23 января 1909", pl: "село Тримихайловка", m: [["child", "P101737", "Агапія"], ["father", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"], ["mother", null, "законная жена его Марія Григоріева"]], l: "Агапия. Села Тримихайловки солдат Герасим Васильев Ампилов и законная жена его Мария Григориева; православные. Родилась 23, крещена 25 января 1909 года.", x: "23 января 1909 года у Герасима Васильевича Ампилова и Марии Григорьевны родилась Агапия." },
  { p: 639, id: "9c4d1e45-62e5-435d-98e1-f92ce57a4b54", s: 5, t: "birth-godparents", y: "1909", pl: "приход сёл Пронькино, Сарапкина и Каменная Сарма", m: [["godmother", "P101738", "крестьянская жена Анна Васильева Ампилова"]], l: "Той же деревни крестьянин Сергей Васильев Гладков и крестьянская жена Анна Васильева Ампилова [в строке восприемников].", x: "Анна Васильевна Ампилова названа восприемницей; с тёзками из иных приходов не объединена." },
  { p: 640, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 49, t: "marriage-witness", y: "1909", pl: "село Гамалеевка, Бузулукский уезд", par: [641], m: [["surety", "P101708", "крестьянинъ Максимъ Антоновъ Ампиловъ"]], l: "По женихе: села Гамалеевки крестьяне Максим Антонов Ампилов и Николай Михайлов Михайлов; по невесте — Харитон Петров Самков и Степан Яковлев Хомяков.", x: "Максим Антонович Ампилов назван поручителем; карточки 640 и 641 ведут к одному скану." },
  { p: 642, id: "dd13cf8e-ce4d-4262-9ae7-b81da081b741", s: 163, t: "death-of-child", y: "1909", pl: "село Тримихайловка", c: "medium", u: ["Точная дата и возраст находятся вне уверенно читаемой части целевого фрагмента."], m: [["father", "P101639", "крестьянинъ Симеонъ Васильевъ Ампиловъ"], ["deceased-child", null, "дочь Матрона"]], l: "Села Тримихайловки крестьянина Симеона Васильева Ампилова дочь Матрона.", x: "Оригинал называет умершую Матрону дочерью Семёна Васильевича Ампилова; индекс подставил соседнюю строку." },
  { p: 643, id: "a06ccf2c-5e94-4659-bc87-e67ca5a3382d", s: 24, t: "birth-godparents", y: "1909", pl: "село Бахтемир, Астраханская губерния", m: [["godfather", "P101590", "крестьянинъ Александръ Ипатовъ Ампиловъ"]], l: "Крестьяне села Бахтемирского Александр Ипатов Ампилов и Екатерина Ипатова Кожевникова [в строке восприемников].", x: "Александр Ипатьевич Ампилов назван восприемником." },
  { p: 644, id: "dd13cf8e-ce4d-4262-9ae7-b81da081b741", s: 164, t: "death-of-child", y: "18 ноября 1909", pl: "село Тримихайловка", m: [["father", "P101639", "крестьянинъ Симеонъ Васильевъ Ампиловъ"], ["deceased-child", null, "дочь Анна"]], l: "Села Тримихайловки крестьянина Симеона Васильева Ампилова дочь Анна. Умерла 18, погребена 19 ноября 1909 года; 3½ года; от дифтерита.", x: "18 ноября 1909 года от дифтерита умерла трёх с половиной летняя Анна, дочь Семёна Васильевича Ампилова." },
  { p: 645, id: "dd13cf8e-ce4d-4262-9ae7-b81da081b741", s: 34, t: "birth-godparents", y: "1909", pl: "село Тримихайловка", m: [["godfather", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"]], l: "Села Тримихайловки солдат Герасим Васильев Ампилов и жена священника села Тримихайловки Юлия Алексиева Архангельская [в строке восприемников].", x: "Герасим Васильевич Ампилов назван восприемником." },
  { p: 646, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 24, t: "birth-godparents", y: "1909", pl: "село Гамалеевка, Бузулукский уезд", m: [["godfather", "P101739", "крестьянинъ Евѳимъ Гавриловъ Ампиловъ"]], l: "Того же села крестьянин Евфим Гаврилов Ампилов и девица Пелагия Стефанова Маркелова [в строке восприемников].", x: "Ефим Гаврилович Ампилов назван восприемником." },
  { p: 647, id: "4186097b-a072-47f4-9de6-10b0b38be3f5", s: 78, t: "death", y: "8 января 1909", pl: "Иркутск", m: [["deceased", "P101740", "младенецъ Михаилъ Ампиловъ"]], l: "Младенец Михаил Ампилов. 4 часа. От врождённой слабости. Умер 8 января 1909 года.", x: "В Иркутске умер четырёхчасовой младенец Михаил Ампилов; родители в строке не названы." },
  { p: 648, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 37, t: "birth-godparents", y: "1909", pl: "село Гамалеевка, Бузулукский уезд", m: [["godmother", "P101741", "дѣвица Анисія Максимова Ампилова"]], l: "Того же села крестьянин Иван Нефедов Сазонов и девица Анисия Максимова Ампилова [в строке восприемников].", x: "Анисия Максимовна Ампилова названа восприемницей; профиль не смешан с одноимённой женщиной другого прихода." },
  { p: 649, id: "c60fe1e4-04c3-45ac-ad06-62da21d4d2a3", s: 221, t: "baptism-clergy-multiple-entries", y: "1909", pl: "Слоновский приход", m: [["deacon", "P1543", "Діаконъ Аѳиногенъ Ампилоговъ"]], l: "Священник Иоанн Поляков с диаконом Афиногеном Ампилоговым. Подпись повторяется при крещениях на развороте.", x: "Оригинал подтверждает службу диакона Афиногена Ампилогова; прежнее ложное отрицание исправлено." },
  { p: 650, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 56, t: "death", y: "26 февраля 1909", pl: "село Гамалеевка, Бузулукский уезд", m: [["deceased", "P4302", "крестьянинъ Стефанъ Трифоновъ Ампиловъ"]], l: "Села Гамалеевки крестьянин Стефан Трифонов Ампилов. Умер 26, погребён 27 февраля 1909 года; 75 лет; от старости.", x: "26 февраля 1909 года в возрасте 75 лет от старости умер Стефан Трифонович Ампилов; имя, место и возраст связывают запись с ранее документированным Стефаном Трифоновичем Анпилоговым." },
  { p: 651, id: "c5954d03-d4f7-4187-9d9c-a5d61d54eff2", s: 593, t: "uncertain-index-hit-review", y: "1909", pl: "Якутская область", pub: false, c: "low", u: ["Индексное «Егор Ампилов» не подтверждается уверенным чтением доступного целевого фрагмента; часть левой страницы повреждена и уходит в сгиб."], m: [["index-only", null, "Егор [Ампилов] — только значение индекса"]], l: "На сохранённом полном развороте и крупном целевом фрагменте фамилия Ампилов не подтверждается уверенно; повреждённая часть строки уходит в сгиб.", x: "Индекс оставлен поисковой подсказкой. До независимого подтверждения профиль, публичный Record и карта не создаются." },
  { p: 652, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 13, t: "birth-godparents", y: "1909", pl: "село Гамалеевка, Бузулукский уезд", m: [["godmother", "P101693", "крестьянская жена Екатерина Даніилова Ампилова"]], l: "Того же села крестьянин Тихон Петров Клюев и крестьянская жена Екатерина Даниилова Ампилова [в строке восприемников].", x: "Екатерина Данииловна Ампилова названа восприемницей." },
  { p: 653, id: "c60fe1e4-04c3-45ac-ad06-62da21d4d2a3", s: 213, t: "baptism-clergy-multiple-entries", y: "1909", pl: "Слоновский приход", m: [["deacon", "P1543", "Діаконъ Аѳиногенъ Ампилоговъ"]], l: "Священник Иоанн Поляков с диаконом Афиногеном Ампилоговым. Подпись повторяется на развороте.", x: "Крупная копия подтверждает подпись Афиногена Ампилогова; прежнее ложное отрицание исправлено." },
  { p: 654, id: "dd13cf8e-ce4d-4262-9ae7-b81da081b741", s: 135, t: "death-of-child", y: "15 июня 1909", pl: "село Тримихайловка", m: [["father", "P101658", "солдатъ Герасимъ Васильевъ Ампиловъ"], ["deceased-child", null, "дочь Агнія"]], l: "Села Тримихайловки солдата Герасима Васильева Ампилова дочь Агния. Умерла 15, погребена 16 июня 1909 года; 5 месяцев; от скарлатины.", x: "15 июня 1909 года от скарлатины умерла пятимесячная Агния, дочь Герасима Васильевича Ампилова." },
  { p: 655, id: "c7016a16-4822-4f55-86a7-bc5c550d59bd", s: 23, t: "birth-godparents", y: "1909", pl: "село Гамалеевка, Бузулукский уезд", m: [["godfather", "P101742", "крестьянинъ Сергей Константиновъ Ампиловъ"]], l: "Того же села крестьянин Сергей Константинов Ампилов и крестьянская жена Агафия Александрова Башкова [в строке восприемников].", x: "Сергей Константинович Ампилов назван восприемником." },
  { p: 656, id: "c711dedf-0d13-49a7-8d93-e809898b76f3", s: 206, t: "birth-godparents", y: "1909", pl: "село Кармалка", m: [["godfather", "P8183", "крестьянинъ Егоръ Алексѣевъ Ампиловъ"], ["godmother", "P101743", "крестьянская дѣвица Анна Филиппова Ампилогова"]], l: "Того же села крестьянин Егор Алексеев Ампилов и крестьянская девица Анна Филиппова Ампилогова [в строке восприемников].", x: "Оригинал подтверждает двух восприемников фамильного ряда; прежнее заключение о ложном совпадении исправлено. Егор сопоставлен с ранее документированным Егором Алексеевичем Анпилоговым из Кармалки." },
  { p: 657, id: "c60fe1e4-04c3-45ac-ad06-62da21d4d2a3", s: 290, t: "burial-clergy-multiple-entries", y: "1909", pl: "Слоновский приход", m: [["deacon", "P1543", "Діаконъ Аѳиногенъ Ампилоговъ"]], l: "Священник Иоанн Поляков с диаконом Афиногеном Ампилоговым. Формула повторяется при погребениях на развороте.", x: "Индекс ошибочно назвал диакона Иоанном; по повторным подписям оригинала это Афиноген Ампилогов." },
  { p: 658, id: "a06ccf2c-5e94-4659-bc87-e67ca5a3382d", s: 45, t: "birth-godparents", y: "1909", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101575", "крестьянка села Бахтемирскаго Евдокія Исаева Ампилова"]], l: "Нижнеломовского уезда села Скворечного крестьянин Трофим Павлов Привалов и крестьянка села Бахтемирского Евдокия Исаева Ампилова [в строке восприемников].", x: "Евдокия Исаевна Ампилова названа восприемницей; происхождение Нижнеломовского уезда относится к другому участнику." },
  { p: 659, id: "9eb7410f-bb89-4e9b-8097-484123528168", s: 177, t: "burial-clergy-summary", y: "1909", pl: "село Каргино", par: [661], m: [["priest", "P101744", "Священникъ Николай Ампиловъ"]], l: "Священник Николай Ампилов с исправляющим должность псаломщика Березиным. [Подпись в итоговой части записей об умерших.]", x: "Оригинал фиксирует Николая Ампилова как священника Николаевской церкви села Каргино; карточки 659 и 661 дублируют один скан." },
  { p: 660, id: "c711dedf-0d13-49a7-8d93-e809898b76f3", s: 215, t: "marriage", y: "1909", pl: "село Кармалка", c: "medium", u: ["Имя жениха и точная дата находятся вне уверенно читаемой части целевого фрагмента."], m: [["bride", "P101745", "крестьянская дочь дѣвица Татьяна Михайлова Ампилова"]], l: "Невеста того же села крестьянская дочь девица Татьяна Михайлова Ампилова, православная, первым браком, 19 лет 10 месяцев.", x: "Первичный скан подтверждает Татьяну Михайловну Ампилову как невесту; прежнее заключение о ложном совпадении исправлено. Без отдельного мостика она не объединена с одноимённым профилем рождения." }
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
  return {
    catalogId: id, scanNumber: scan, captureType: "yandex-archive-original-image-download-with-enlarged-fragments",
    localBackup: relative(full), path: relative(full), capturedAt, sha256: await digest(full),
    fragments: [
      { kind: "header", path: relative(header), sha256: await digest(header), description: "Фрагмент исходного листа, фиксирующий структуру и год документа." },
      { kind: "target-entry", path: relative(target), sha256: await digest(target), description: "Крупный фрагмент целевой записи без интерфейса Яндекса." }
    ],
    quality: { documentOnlyVisuallyConfirmed: true, headerVisuallyConfirmed: true, targetRowsVisuallyConfirmed: true, confirmedAt: capturedAt, method: "manual-reading-of-downloaded-original", fullDimensions: await dimensions(full) },
    publicDisplay: false,
    rightsNote: "Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив."
  };
};
const pmap = new Map(people.map((person) => [person.id, person]));
const sourceIdsByPerson = new Map(people.map((person) => [person.id, []]));
const sourceFile = async (sourceId) => {
  const legacy = path.join(legacySourceRoot, `${sourceId}.json`);
  try { await access(legacy); return legacy; } catch { return path.join(sourceRoot, `${sourceId}.json`); }
};

for (const record of rec) {
  const sourceId = `YA-${record.id.slice(0, 8).toUpperCase()}-${String(record.s).padStart(3, "0")}`;
  const metadata = JSON.parse(await readFile(path.join(metadataRoot, `${record.id}-${record.s}.json`), "utf8"));
  const primaryEvidence = await evidence(record.id, record.s);
  const parallelRows = (record.par ?? []).filter((position) => {
    const row = rowAt(position); return row.catalogId !== record.id || row.scanNumber !== record.s;
  });
  if (parallelRows.length) primaryEvidence.parallelCopies = await Promise.all(parallelRows.map((position) => {
    const row = rowAt(position); return evidence(row.catalogId, row.scanNumber);
  }));
  const value = {
    schemaVersion: 1, sourceId, provider: "Яндекс Архив — первичный скан", recordType: record.t,
    collection: { catalogId: record.id, scanNumber: record.s, title: metadata.row.title },
    links: { documentUrl: `https://yandex.ru/archive/catalog/${record.id}/${record.s}`, ...(record.par ? { alternateDocumentUrls: [...new Set(record.par.map((position) => rowAt(position).documentUrl))] } : {}) },
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
  P101658: ["YA-C581A7EE-036", "YA-C581A7EE-049", "YA-DD13CF8E-010", "YA-DD13CF8E-034", "YA-DD13CF8E-135"],
  P101625: ["YA-D8402335-066"], P101526: ["YA-A06CCF2C-022"], P101575: ["YA-A06CCF2C-022", "YA-A06CCF2C-045"],
  P101708: ["YA-C7016A16-049"], P101639: ["YA-DD13CF8E-163", "YA-DD13CF8E-164"], P101590: ["YA-A06CCF2C-024"],
  P1543: ["YA-C60FE1E4-221", "YA-C60FE1E4-213", "YA-C60FE1E4-290"], P4302: ["YA-C7016A16-056"],
  P101693: ["YA-C7016A16-013"], P8183: ["YA-C711DEDF-206"]
};
const childAdds = { P101526: ["P101736"], P101575: ["P101736"], P101658: ["P101737"] };
const files = await readdir(peopleRoot);
for (const [personId, additions] of Object.entries(backlinks)) {
  const name = files.find((file) => file.startsWith(`${personId}-`) && file.endsWith(".json"));
  if (!name) throw new Error(`Не найден профиль ${personId}`);
  const file = path.join(peopleRoot, name);
  const value = JSON.parse(await readFile(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds ?? []), ...additions])].sort();
  if (childAdds[personId]) value.children = [...new Set([...(value.children ?? []), ...childAdds[personId]])];
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

for (const person of people) {
  const slug = person.name.toLowerCase().replaceAll("ё", "e").replaceAll("й", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
  const value = {
    schemaVersion: 1, personId: person.id, displayName: person.name, sex: person.sex, nameVariants: [person.w],
    surname: { normalized: person.sn, formsAsWritten: [person.w.match(/Амп[а-яѣіы]+/i)?.[0]?.replace(/ъ$/g, "") ?? person.sn] },
    sourceIds: [...new Set(sourceIdsByPerson.get(person.id))].sort(), status: "documented-from-primary-scan",
    places: [{ relation: "documented", normalized: person.pl, confidence: "high" }],
    ...(person.parents ? { parents: person.parents } : {}), ...(person.children ? { children: person.children } : {}), notes: [person.note]
  };
  await writeFile(path.join(peopleRoot, `${person.id}-${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

const completed = rows.filter((row) => row.capture === false && !row.status.startsWith("pending-")).length;
const pending = rows.filter((row) => row.capture !== false && row.status.startsWith("pending-"));
search.progress = { ...search.progress, rowsCompleted: completed, uniqueScansPending: new Set(pending.map((row) => `${row.catalogId}/${row.scanNumber}`)).size, rowsRemaining: rows.length - completed };
await writeFile(searchPath, `${JSON.stringify(search, null, 2)}\n`);
console.log(JSON.stringify({ sourcesWritten: rec.length, peopleWritten: people.length, rowsCompleted: completed, rowsRemaining: rows.length - completed, uniqueScansPending: search.progress.uniqueScansPending }, null, 2));
