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
  { id: "P101714", name: "Дмитрий Алексеевич Ампилов", sex: "male", w: "крестьянинъ Димитрій Алексіевъ Ампиловъ", sn: "Ампилов", pl: "село Бахтемир, Астраханская губерния", spouses: ["P101699"], children: ["P101715"], note: "Крестьянин села Бахтемира; муж Александры Михайловны и отец Михаила." },
  { id: "P101715", name: "Михаил Дмитриевич Ампилов", sex: "male", w: "Михаилъ, сынъ Димитрія Алексіева Ампилова", sn: "Ампилов", pl: "село Бахтемир, Астраханская губерния", parents: ["P101714", "P101699"], note: "Сын Дмитрия Алексеевича и Александры Михайловны Ампиловых; родился в феврале 1907 года." },
  { id: "P101716", name: "Евдокия Сергеевна Ампилова", sex: "female", w: "Евдокія Сергіева Ампилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянка села Бахтемира, восприемница Михаила Дмитриевича Ампилова в 1907 году." },
  { id: "P101717", name: "Пелагия Даниловна Ампилова", sex: "female", w: "законная его жена Пелагія Данилова", sn: "Ампилова", pl: "село Бахтемир, Астраханская губерния", spouses: ["P101712"], children: ["P101720"], note: "Жена Иосифа Фёдоровича Ампилова и мать Петра; также названа восприемницей в 1908 году." },
  { id: "P101718", name: "Домна Яковлевна Ампилова", sex: "female", w: "крестьянская дѣвица Домна Іаковлева Ампилова", sn: "Ампилова", pl: "село Тримихайловка", note: "Крестьянская девица села Тримихайловки, восприемница в 1908 году." },
  { id: "P101719", name: "Борис Петрович Ампилов (Обильное)", sex: "male", w: "села Обильнаго крестьянинъ Борисъ Петровъ Ампиловъ", sn: "Ампилов", pl: "село Обильное, Астраханская губерния", note: "Крестьянин села Обильного, умерший в 1908 году в возрасте 82 лет. Не объединён с одноимённым поручителем из села Одинокого без самостоятельного доказательства тождества." },
  { id: "P101720", name: "Пётр Иосифович Ампилов", sex: "male", w: "Петръ, сынъ Іосифа Ѳедорова Ампилова", sn: "Ампилов", pl: "село Бахтемир, Астраханская губерния", parents: ["P101712", "P101717"], note: "Сын Иосифа Фёдоровича и Пелагии Даниловны Ампиловых; родился в июне 1908 года." },
  { id: "P101721", name: "Анна Семёновна Ампилова", sex: "female", w: "крестьянская жена Анна Семенова Ампилова", sn: "Ампилова", pl: "село Гамалеевка, Бузулукский уезд", note: "Крестьянская жена села Гамалеевки, восприемница в 1908 году." },
  { id: "P101722", name: "Николай Дмитриевич Ампилов (Бахтемир)", sex: "male", w: "крестьянинъ Николай Димитріевъ Ампиловъ", sn: "Ампилов", pl: "село Бахтемир, Астраханская губерния", note: "Крестьянин села Бахтемира, восприемник в 1908 году; не объединён с тёзками из других приходов." },
  { id: "P101723", name: "Анна Романовна Ампилова", sex: "female", w: "крестьянская дѣвица Анна Романова Ампилова", sn: "Ампилова", places: [{ relation: "origin", normalized: "село Людское, Городищенская волость, Орловский уезд", confidence: "high" }, { relation: "documented-presence", normalized: "Москва", confidence: "high" }], children: ["P101724"], note: "Крестьянская девица из села Людского Орловского уезда; в московской метрической книге названа матерью внебрачной Александры в феврале 1909 года. Запись документирует присутствие в Москве, но не сообщает дату и юридическое основание переезда." },
  { id: "P101724", name: "Александра Аннина Ампилова", sex: "female", w: "Александра, незаконнорождённая дочь Анны Романовой Ампиловой", sn: "Ампилова", pl: "Москва", parents: ["P101723"], note: "Внебрачная дочь Анны Романовны Ампиловой; родилась 7 февраля и крещена 15 февраля 1909 года в Москве." },
  { id: "P101725", name: "Лукьян Ампилов (Кармалка)", sex: "male", w: "крестьянинъ Лукьянъ [отчество читается неуверенно] Ампиловъ", sn: "Ампилов", pl: "село Кармалка", children: ["P101726"], note: "Крестьянин села Кармалки, отец Михаила; отчество на скане читается неуверенно и не нормализовано." },
  { id: "P101726", name: "Михаил Лукьянович Ампилов", sex: "male", w: "Михаилъ, сынъ Лукьяна Ампилова", sn: "Ампилов", pl: "село Кармалка", parents: ["P101725"], note: "Сын Лукьяна Ампилова и Марии Феодотьевны; родился 4 ноября и крещён 7 ноября 1908 года." },
  { id: "P101727", name: "Дарья Стефановна Ампилова", sex: "female", w: "Дарія Стефанова Ампилова", sn: "Ампилова", pl: "село Обильное, Астраханская губерния", note: "Крестьянка села Обильного, восприемница в 1908 году." },
  { id: "P101728", name: "Семён Васильевич Ампилов", sex: "male", w: "крестьянинъ Симеонъ Василіевъ Ампиловъ", sn: "Ампилов", pl: "село Тримихайловка", note: "Крестьянин села Тримихайловки, восприемник в 1908 году." }
];

const rec = [
  { p: 595, id: "9fc4e659-fc31-47d7-849e-a84db47f3121", s: 221, t: "birth-godparents", y: "1907", pl: "село Тримихайловка", m: [["godmother", "P101582", "крестьянская жена села Тримихайловки Марѳа Іоанникіева Ампилова"]], l: "Деревни Яковлевки крестьянинъ Симеонъ Петровъ Литвиновъ и крестьянская жена села Тримихайловки Марѳа Іоанникіева Ампилова.", x: "Марфа Иоанникиевна Ампилова названа восприемницей при крещении в 1907 году." },
  { p: 596, id: "f2b1219b-f9e0-4a56-9048-00c1eccc34b3", s: 7, t: "birth", y: "5 февраля 1907", pl: "село Бахтемир, Астраханская губерния", m: [["child", "P101715", "Михаилъ"], ["father", "P101714", "крестьянинъ Димитрій Алексіевъ Ампиловъ"], ["mother", "P101699", "законная его жена Александра Михаилова"], ["godfather", "P101526", "крестьянинъ Михаилъ Алексіевъ Ампиловъ"], ["godmother", "P101716", "Евдокія Сергіева Ампилова"]], l: "Михаилъ. Крестьянинъ села Бахтемирскаго Димитрій Алексіевъ Ампиловъ и законная его жена Александра Михаилова; оба православные. Восприемники: крестьяне села Бахтемирскаго Михаилъ Алексіевъ Ампиловъ и Евдокія Сергіева Ампилова.", x: "5 февраля 1907 года у Дмитрия Алексеевича и Александры Михайловны Ампиловых родился Михаил; восприемниками были Михаил Алексеевич и Евдокия Сергеевна Ампиловы." },
  { p: 597, id: "45dd26fd-fe80-49ac-a37b-6255991a598a", s: 7, t: "marriage", y: "1907", pl: "село Бахтемир, Астраханская губерния", m: [["groom", "P101712", "крестьянинъ села Бахтемирскаго Іосифъ Ѳедоровъ Ампиловъ"]], l: "Крестьянинъ села Бахтемирскаго Іосифъ Ѳедоровъ Ампиловъ, православнаго вѣроисповѣданія, первымъ бракомъ, 23 лѣтъ.", x: "Иосиф Фёдорович Ампилов вступил первым браком в 1907 году; оригинал указывает возраст 23 года." },
  { p: 598, id: "334dce4d-ee8e-4447-aa5f-db222feea1b1", s: 206, t: "place-name-index-false-positive", y: "1907", pl: "Олёкминский округ", pub: false, m: [["place-name", null, "деревня Ампилова"]], l: "Крестьянка Амгинскаго округа и волости деревни Ампилова Ульянія Димитріева Бояркина; православная.", x: "Слово «Ампилова» относится к названию деревни, а не к фамилии матери. Фамильный профиль и картографическое событие не создаются." },
  { p: 599, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 6, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", par: [607], m: [["godfather", "P101681", "крестьянинъ Петръ Димитріевъ Ампиловъ"], ["godmother", "P101575", "Евдокія Исаева Ампилова"]], l: "Крестьяне села Бахтемирскаго Петръ Димитріевъ Ампиловъ и Евдокія Исаева Ампилова.", x: "Пётр Дмитриевич и Евдокия Исаевна Ампиловы названы восприемниками; карточки 599 и 607 ведут к одному скану." },
  { p: 600, id: "3442a72a-4693-4628-b2ac-91948e00831e", s: 12, t: "marriage", y: "1908", pl: "село Бахтемир, Астраханская губерния", par: [604, 618], m: [["bride", "P101713", "крестьянка села Бахтемирскаго Екатерина Ипатова Ампилова"]], l: "Крестьянка села Бахтемирскаго Екатерина Ипатова Ампилова, православнаго вѣроисповѣданія, первымъ бракомъ, 21 года.", x: "Екатерина Ипатовна Ампилова вступила первым браком в 1908 году; запись повторена карточкой 604 и на соседнем скане 11." },
  { p: 601, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 37, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101575", "Евдокія Исаева Ампилова"]], l: "Крестьяне села Бахтемирскаго Григорій Степановъ Коломицынъ и Евдокія Исаева Ампилова.", x: "Евдокия Исаевна Ампилова названа восприемницей в 1908 году." },
  { p: 602, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 36, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101717", "Пелагія Данилова Ампилова"]], l: "Крестьяне села Бахтемирскаго Павелъ Петровъ Орловъ и Пелагія Данилова Ампилова.", x: "Пелагия Даниловна Ампилова названа восприемницей в 1908 году." },
  { p: 603, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 11, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godfather", "P101686", "крестьянинъ Стефанъ Димитріевъ Ампиловъ"]], l: "Крестьяне села Бахтемирскаго Стефанъ Димитріевъ Ампиловъ и Евдокія Петрова Кузина.", x: "Стефан Дмитриевич Ампилов назван восприемником в 1908 году; индекс ошибочно представил строку как родительскую." },
  { p: 605, id: "a18b44b7-5e87-4665-ba1b-2c22ec1d1315", s: 213, t: "baptism-clergy-multiple-entries", y: "1908", pl: "село Старая Богдановка", m: [["priest", "P1653", "Священникъ Михаилъ Ампиловъ"]], l: "Священникъ Михаилъ Ампиловъ. Псаломщикъ Тимоѳей Горяйновъ. [Подписи повторяются при нескольких крещениях на развороте.]", x: "По оригиналу Михаил Ампилов является священником, а не ребёнком; прежняя отметка о ложном совпадении исправлена." },
  { p: 606, id: "a18b44b7-5e87-4665-ba1b-2c22ec1d1315", s: 237, t: "burial-clergy-multiple-entries", y: "1908", pl: "село Старая Богдановка", m: [["priest", "P1653", "Священникъ Михаилъ Ампиловъ"]], l: "Священникъ Михаилъ Ампиловъ съ псаломщикомъ Тимоѳеемъ Горяйновымъ. [Формула повторяется при погребениях на развороте.]", x: "Михаил Ампилов совершал погребения; индекс смешал его подпись с соседними данными." },
  { p: 608, id: "a18b44b7-5e87-4665-ba1b-2c22ec1d1315", s: 226, t: "burial-clergy-index-correction", y: "1908", pl: "село Старая Богдановка", m: [["priest", "P1653", "Священникъ Михаилъ Ампиловъ"]], l: "Священникъ Михаилъ Ампиловъ съ псаломщикомъ Тимоѳеемъ Горяйновымъ. [Подпись относится к совершавшему погребение.]", x: "Возраст и причина смерти в индексе относятся к умершему соседней строки; Михаил Ампилов здесь священник." },
  { p: 609, id: "c581a7ee-7d14-4e09-b747-35c58bbe67cb", s: 81, t: "birth-godparents", y: "1908", pl: "село Тримихайловка", par: [613], m: [["godmother", "P101718", "крестьянская дѣвица Домна Іаковлева Ампилова"]], l: "Села Тримихайловки крестьянинъ Евѳимій Симеоновъ Боевъ и крестьянская дѣвица Домна Іаковлева Ампилова.", x: "Домна Яковлевна Ампилова названа восприемницей; карточки 609 и 613 дублируют один скан." },
  { p: 610, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 19, t: "birth", y: "24 июня 1908", pl: "село Бахтемир, Астраханская губерния", par: [615], m: [["child", "P101720", "Петръ"], ["father", "P101712", "крестьянинъ Іосифъ Ѳедоровъ Ампиловъ"], ["mother", "P101717", "законная его жена Пелагія Данилова"]], l: "Петръ. Крестьянинъ села Бахтемирскаго Іосифъ Ѳедоровъ Ампиловъ и законная его жена Пелагія Данилова; оба православные.", x: "24 июня 1908 года у Иосифа Фёдоровича и Пелагии Даниловны Ампиловых родился Пётр; карточка 615 повторяет тот же скан." },
  { p: 611, id: "c581a7ee-7d14-4e09-b747-35c58bbe67cb", s: 23, t: "birth-godparents", y: "1908", pl: "село Тримихайловка", m: [["godmother", "P101688", "крестьянская жена Марія Григоріева Ампилова"]], l: "Села Тримихайловки крестьянинъ Іаковъ Ильинъ Щепочкинъ и крестьянская жена Марія Григоріева Ампилова.", x: "Мария Григорьевна Ампилова названа восприемницей в 1908 году." },
  { p: 612, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 71, t: "death", y: "6 июня 1908", pl: "село Обильное, Астраханская губерния", m: [["deceased", "P101719", "села Обильнаго крестьянинъ Борисъ Петровъ Ампиловъ"]], l: "Села Обильнаго крестьянинъ Борисъ Петровъ Ампиловъ. 82 года. Отъ старости.", x: "6 июня 1908 года умер 82-летний Борис Петрович Ампилов из села Обильного; причиной названа старость." },
  { p: 614, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 22, t: "birth-godparents", y: "1908", pl: "село Обильное, Астраханская губерния", m: [["godfather", "P101622", "Петръ Михаиловъ Ампиловъ"]], l: "Того-же села и званія Петръ Михаиловъ Ампиловъ и Васса Ѳеодорова Возледубова.", x: "Пётр Михайлович Ампилов назван восприемником при крещении в 1908 году." },
  { p: 616, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 15, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101713", "Екатерина Ипатова Ампилова"]], l: "Крестьяне села Бахтемирскаго Ѳеодоръ Артемьевъ Лепехинъ и Екатерина Ипатова Ампилова.", x: "Екатерина Ипатовна Ампилова названа восприемницей в 1908 году." },
  { p: 617, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 20, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godmother", "P101575", "крестьянка села Бахтемирскаго Евдокія Исаева Ампилова"]], l: "Пензенской губерніи Н.-Ломовскаго уѣзда Лещиновской волости села Сваречнаго крестьяне Петръ Гавриловъ Воробьевъ и Егоръ Григорьевъ Дружининъ; крестьянка села Бахтемирскаго Евдокія Исаева Ампилова.", x: "Евдокия Исаевна Ампилова названа восприемницей; длинная строка оригинала относится к участникам крещения, а не к её происхождению." },
  { p: 619, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 53, t: "marriage-witness", y: "1908", pl: "село Обильное, Астраханская губерния", par: [622], m: [["surety-for-groom", "P101628", "крестьянинъ Николай Ивановъ Ампиловъ"]], l: "По женихѣ: села Обильнаго крестьяне Андроникъ Исаіевъ Евсеевъ и Николай Ивановъ Ампиловъ.", x: "Николай Иванович Ампилов назван поручителем по женихе; карточки 619 и 622 ведут к одному скану." },
  { p: 620, id: "d2eb849f-3f91-4b5c-8c22-dd5750c81f0c", s: 27, t: "birth-godparents", y: "1908", pl: "село Гамалеевка, Бузулукский уезд", m: [["godmother", "P101721", "крестьянская жена Анна Семенова Ампилова"]], l: "Села Гамалеевки крестьянинъ Ефремій Димитріевъ Сазоновъ и крестьянская жена Анна Семенова Ампилова.", x: "Анна Семёновна Ампилова названа восприемницей в 1908 году." },
  { p: 621, id: "d2eb849f-3f91-4b5c-8c22-dd5750c81f0c", s: 11, t: "birth-family-and-godparent", y: "1908", pl: "село Гамалеевка, Бузулукский уезд", m: [["father", "P101700", "крестьянинъ Миронъ Константиновъ Ампиловъ"], ["mother", null, "жена его Марѳа Иванова"], ["godfather", "P101708", "крестьянинъ Максимъ Антоновъ Ампиловъ"]], l: "Села Гамалеевки крестьянинъ Миронъ Константиновъ Ампиловъ и жена его Марѳа Иванова; православные. Того-же села крестьянинъ Максимъ Антоновъ Ампиловъ [назван восприемником].", x: "Один акт 1908 года называет Мирона Константиновича Ампилова отцом, Марфу Ивановну матерью и Максима Антоновича Ампилова восприемником; имя ребёнка в сохранённом целевом фрагменте не нормализуется." },
  { p: 623, id: "cd3d19cd-3a91-4301-af37-dcf058ee282d", s: 35, t: "birth-godparents", y: "1908", pl: "село Бахтемир, Астраханская губерния", m: [["godfather", "P101722", "крестьянинъ Николай Димитріевъ Ампиловъ"]], l: "Крестьяне села Бахтемирскаго Николай Димитріевъ Ампиловъ и Ольга Иванова Хомякова.", x: "Николай Дмитриевич Ампилов назван восприемником в 1908 году." },
  { p: 624, id: "38d46cd1-3ddb-4f80-bb41-96ef5f0d6f55", s: 299, t: "marriage-witness", y: "1908", pl: "село Кармалка", m: [["surety", "P101352", "крестьянинъ села Кармалки Владимиръ Спиридоновъ Ампиловъ"]], l: "По женихѣ: села Кармалки крестьяне Владимиръ Спиридоновъ Ампиловъ и Терентий Ѳеодоровъ Хвалевъ.", x: "Владимир Спиридонович Ампилов назван поручителем; новый полный скан устраняет прежнюю отметку о недостаточном качестве." },
  { p: 625, id: "c2f44501-ae01-4df3-adcb-e00ab1ba0a77", s: 293, t: "birth-with-origin-context", y: "7 февраля 1909", pl: "Москва", migration: true, m: [["child", "P101724", "Александра"], ["mother", "P101723", "крестьянская дѣвица Анна Романова Ампилова"]], l: "Александра. Орловской губерніи, Орловскаго уѣзда, Городищенской волости, села Людскаго крестьянская дѣвица Анна Романова Ампилова, православная; незаконнорождённая. Родилась 7, крещена 15 февраля 1909 года.", x: "7 февраля 1909 года в Москве у Анны Романовны Ампиловой, происходившей из села Людского Орловского уезда, родилась внебрачная дочь Александра. Запись фиксирует присутствие матери в Москве, но не доказывает формального переселения." },
  { p: 626, id: "38d46cd1-3ddb-4f80-bb41-96ef5f0d6f55", s: 292, t: "birth", y: "4 ноября 1908", pl: "село Кармалка", c: "medium", u: ["Отчество отца Лукьяна читается неуверенно."], m: [["child", "P101726", "Михаилъ"], ["father", "P101725", "крестьянинъ Лукьянъ [отчество неуверенно] Ампиловъ"], ["mother", null, "законная жена его Марія Ѳеодотіева"]], l: "Михаилъ. Села Кармалки крестьянинъ Лукьянъ [отчество читается неуверенно] Ампиловъ и законная жена его Марія Ѳеодотіева; оба православные. Родился 4, крещён 7 ноября 1908 года.", x: "4 ноября 1908 года у Лукьяна Ампилова и Марии Феодотьевны родился Михаил; отчество отца оставлено без нормализации." },
  { p: 627, id: "d8402335-d0d8-4d66-88d3-5f254b893e7f", s: 8, t: "birth-godparents", y: "1908", pl: "село Обильное, Астраханская губерния", m: [["godmother", "P101727", "Дарія Стефанова Ампилова"]], l: "Села Обильнаго крестьянка Дарія Стефанова Ампилова; оба православные. [В строке восприемников.]", x: "Дарья Стефановна Ампилова названа восприемницей в 1908 году." },
  { p: 628, id: "0f95f9ec-79fa-46a5-8682-c1356e946a9c", s: 317, t: "personal-name-patronymic-review", y: "1908", pl: "сельцо Шмелевка", pub: false, c: "medium", m: [["mother", null, "законная жена его Акилина Ампилова"]], l: "Сельца Шмелева государственныхъ крестьянъ Никита Никифоровъ [фамилия читается неуверенно] и законная жена его Акилина Ампилова; оба православные.", x: "«Ампилова» стоит после личного имени Акилина в позиции отчества, а не подтверждённой фамилии. Из-за отсутствия самостоятельного доказательства связи с фамильным рядом профиль и карта не создаются." },
  { p: 629, id: "c581a7ee-7d14-4e09-b747-35c58bbe67cb", s: 33, t: "birth-godparents", y: "1908", pl: "село Тримихайловка", m: [["godfather", "P101728", "крестьянинъ Симеонъ Василіевъ Ампиловъ"]], l: "Села Тримихайловки крестьянинъ Симеонъ Василіевъ Ампиловъ и крестьянская дѣвица Екатерина Сергіева Удова.", x: "Семён Васильевич Ампилов назван восприемником в 1908 году." }
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
    const row = rowAt(position);
    return row.catalogId !== record.id || row.scanNumber !== record.s;
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
    ...(record.migration ? {
      migrationObservations: [{ personId: "P101723", personName: "Анна Романовна Ампилова", from: { normalized: "село Людское, Городищенская волость, Орловский уезд" }, to: { normalized: "Москва" }, basis: "Московская метрическая запись одновременно называет место происхождения матери и фиксирует её присутствие в Москве при рождении дочери.", confidence: "medium" }],
      historicalContext: { text: "Запись доказывает присутствие уроженки/крестьянки села Людского Анны Романовны Ампиловой в Москве к февралю 1909 года, но не содержит даты, маршрута или административного основания переезда." }
    } : {}),
    evidence: primaryEvidence,
    transcription: { status: record.u ? "complete-with-uncertainties" : "complete-primary-scan-transcription-with-local-evidence", literal: record.l, modernInterpretation: record.x, indexNote: "Индекс Яндекса использован только для навигации; чтение выполнено по сохранённому оригиналу." },
    isRecord: true, cardKind: record.pub === false ? "research-review" : "named-primary-record", publicCore: record.pub !== false,
    review: { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: record.c ?? "high", unresolved: record.u ?? (record.pub === false ? ["Совпадение не подтверждает носителя исследуемого фамильного ряда."] : []) }
  };
  await writeFile(await sourceFile(sourceId), `${JSON.stringify(value, null, 2)}\n`);
  for (const [, personId] of record.m) if (personId) sourceIdsByPerson.get(personId)?.push(sourceId);
  Object.assign(rowAt(record.p), { sourceId, status: record.pub === false ? "complete-non-surname-index-hit" : "complete-with-local-evidence", capture: false, primaryScanReading: record.l });
  for (const position of record.par ?? []) Object.assign(rowAt(position), { sourceId, status: "complete-parallel-copy-or-page-overlap", capture: false, primaryScanReading: record.l });
}

const backlinks = {
  P101582: ["YA-9FC4E659-221"], P101699: ["YA-F2B1219B-007"], P101526: ["YA-F2B1219B-007"], P101712: ["YA-45DD26FD-007", "YA-CD3D19CD-019"],
  P101681: ["YA-CD3D19CD-006"], P101575: ["YA-CD3D19CD-006", "YA-CD3D19CD-037", "YA-CD3D19CD-020"], P101713: ["YA-3442A72A-012", "YA-CD3D19CD-015"],
  P101686: ["YA-CD3D19CD-011"], P1653: ["YA-A18B44B7-213", "YA-A18B44B7-237", "YA-A18B44B7-226"], P101688: ["YA-C581A7EE-023"],
  P101622: ["YA-D8402335-022"], P101628: ["YA-D8402335-053"], P101700: ["YA-D2EB849F-011"], P101708: ["YA-D2EB849F-011"], P101352: ["YA-38D46CD1-299"]
};
const childAdds = { P101699: ["P101715"], P101712: ["P101720"] };
const spouseAdds = { P101699: ["P101714"], P101712: ["P101717"] };
const files = await readdir(peopleRoot);
for (const [personId, additions] of Object.entries(backlinks)) {
  const name = files.find((file) => file.startsWith(`${personId}-`) && file.endsWith(".json"));
  if (!name) throw new Error(`Не найден профиль ${personId}`);
  const file = path.join(peopleRoot, name);
  const value = JSON.parse(await readFile(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds ?? []), ...additions])].sort();
  if (childAdds[personId]) value.children = [...new Set([...(value.children ?? []), ...childAdds[personId]])];
  if (spouseAdds[personId]) value.spouses = [...new Set([...(value.spouses ?? []), ...spouseAdds[personId]])];
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

for (const person of people) {
  const slug = person.name.toLowerCase().replaceAll("ё", "e").replaceAll("й", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
  const value = {
    schemaVersion: 1, personId: person.id, displayName: person.name, sex: person.sex, nameVariants: [person.w],
    surname: { normalized: person.sn, formsAsWritten: [person.w.match(/Амп[а-яѣіы]+/i)?.[0]?.replace(/ъ$/g, "") ?? person.sn] },
    sourceIds: [...new Set(sourceIdsByPerson.get(person.id))].sort(), status: "documented-from-primary-scan",
    places: person.places ?? [{ relation: "documented", normalized: person.pl, confidence: "high" }],
    ...(person.parents ? { parents: person.parents } : {}), ...(person.children ? { children: person.children } : {}), ...(person.spouses ? { spouses: person.spouses } : {}), notes: [person.note]
  };
  await writeFile(path.join(peopleRoot, `${person.id}-${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

const completed = rows.filter((row) => row.capture === false && !row.status.startsWith("pending-")).length;
const pending = rows.filter((row) => row.capture !== false && row.status.startsWith("pending-"));
search.progress = { ...search.progress, rowsCompleted: completed, uniqueScansPending: new Set(pending.map((row) => `${row.catalogId}/${row.scanNumber}`)).size, rowsRemaining: rows.length - completed };
await writeFile(searchPath, `${JSON.stringify(search, null, 2)}\n`);
console.log(JSON.stringify({ sourcesWritten: rec.length, peopleWritten: people.length, rowsCompleted: completed, rowsRemaining: rows.length - completed, uniqueScansPending: search.progress.uniqueScansPending }, null, 2));
