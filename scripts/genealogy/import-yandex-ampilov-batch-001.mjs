#!/usr/bin/env node

import { createHash } from "node:crypto";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

const root = process.cwd();
const capturedAt = "2026-09-10";
const searchPath = path.join(root, "data/genealogy/searches/yandex-archive-ampilov-2026-09-10.json");
const sourceRoot = path.join(root, "data/genealogy/sources/yandex");
const peopleRoot = path.join(root, "data/genealogy/people");
const metadataRoot = path.join(tmpdir(), "yandex-archive-ampilov-2026-09-10-metadata");
await mkdir(sourceRoot, { recursive: true });

const people = [
  { id: "P101390", name: "Иван Ампилов", sex: "male", written: "Иванъ Ампиловъ", surname: "Ампилов", place: "Сасыколи, Енотаевский уезд, Астраханская губерния", note: "Назван среди участников совершения погребения в метрической книге Покровской церкви; должность в строке не разделена однозначно." },
  { id: "P101391", name: "Максим Ампилов", sex: "male", written: "Максимъ Ампиловъ", surname: "Ампилов", place: "Зеркло, Оренбургский уезд", note: "Однодворец деревни Зеркло; восприемник Феодора, сына Стефана Симеонова, в июне 1830 года." },
  { id: "P101392", name: "Григорий Григорьевич Ампилов", sex: "male", written: "Григорій Григорьевъ Ампиловъ", surname: "Ампилов", place: "Китойская слобода, Иркутская губерния", note: "Крестьянин; вступил первым браком со Стефанидой Григорьевной Самохваловой в 1831–1832 годах." },
  { id: "P101393", name: "Илья Григорьевич Ампалов", sex: "male", written: "Илья Григорьевъ Ампаловъ", surname: "Ампалов", place: "Китойская слобода, Иркутская губерния", note: "Крестьянин и поручитель при браке Григория Григорьевича Ампилова; форма «Ампалов» сохранена буквально." },
  { id: "P101394", name: "Анна Ампилова", sex: "female", written: "Анны Ампиловой", surname: "Ампилова", place: "деревня Промзино, Спасский уезд", note: "Законная жена Андрея Терентьевича Тазина и мать Константина, родившегося в мае 1833 года." },
  { id: "P101395", name: "Мавра Амплова", sex: "female", written: "Мавра Амплова", surname: "Амплова", place: "Иркутский или Верхоленский уезд", note: "Жена Петра Васильевича Прошутинского; восприемница Марфы Ивановны Высоших в 1833 году. Форма «Амплова» ясно читается в оригинале." },
  { id: "P101396", name: "Егор Яковлевич Ампилов", sex: "male", written: "Егоръ Яковлевъ Ампиловъ", surname: "Ампилов", place: "Болотово и Кундравы, Троицкий уезд", note: "Однодворец; женился на Елизавете Васильевне Баташевой и в том же корпусе назван отцом Степана." },
  { id: "P101397", name: "Степан Егорович Ампилов", sex: "male", written: "сынъ Стефанъ", surname: "Ампилов", place: "Кундравы, Троицкий уезд", note: "Сын Егора Яковлевича Ампилова и Вассы Васильевны; рождение записано в 1835 году." },
  { id: "P101398", name: "Флор Никитич Ампилов", sex: "male", written: "Ѳлора Никитина Ампилова", surname: "Ампилов", place: "Кармалка, Оренбургский уезд", note: "Назван через жену Степаниду Сидоровну, бывшую восприемницей близнецов Марфы и Михаила в 1836 году." },
  { id: "P101399", name: "Тимофей Максимович Ампилов", sex: "male", written: "Тимофей Максимовъ Ампиловъ", surname: "Ампилов", place: "Зеркло, Оренбургский уезд", note: "Однодворец деревни Зеркло; восприемник Михаила Ивановича Алехина в 1837 году. Возможная связь с Максимом Ампиловым 1830 года не объявлена доказанной." },
  { id: "P101400", name: "Михаил Иванович Ампилов", sex: "male", written: "Михайла Ивановъ Ампиловъ", surname: "Ампилов", place: "Бахтемировское, Астраханский уезд", note: "Однодворец/государственный крестьянин Бахтемировского; отец Елизаветы и Вассы, участник записей 1838–1846 годов." },
  { id: "P101401", name: "Елизавета Михайловна Ампилова", sex: "female", written: "Елизавѣта Михайлова дочь ... Михайлы Иванова Ампилова", surname: "Ампилова", place: "Бахтемировское, Астраханский уезд", note: "В шестнадцать лет вступила в брак с Фирсом Савельевичем Поповым; запись датируется корпусом 1838–1843 годов." },
  { id: "P101402", name: "Тимофей Иванович Ампилов", sex: "male", written: "Тимофей Ивановъ Ампиловъ", surname: "Ампилов", place: "Бахтемировское, Астраханский уезд", note: "Государственный крестьянин и восприемник; жена Татьяна Гавриловна дважды названа восприемницей в том же метрическом корпусе." },
  { id: "P101403", name: "Васса Михайловна Ампилова", sex: "female", written: "Васса", surname: "Ампилова", place: "Бахтемировское, Астраханский уезд", note: "Дочь Михаила Ивановича Ампилова и Ефимии Варфоломеевны; фамильная принадлежность следует из прямой формулы об отце." },
  { id: "P101404", name: "Анисия Амплиева", sex: "female", written: "Анисіа Ампліева", surname: "Амплиева", place: "Ключищи, Симбирская губерния", note: "Законная жена дьячка Петра Мефодиева; форма «Ампліева» сохранена как документированный орфографический вариант исследуемого ряда." },
];

const records = [
  { pos:4, id:"eac5d08c-9fb7-47a6-80b9-09d5a37b6afc", scan:252, type:"burial-clergy-or-attendant", year:"1811–1838", place:"Сасыколи, Енотаевский уезд, Астраханская губерния", confidence:"medium", mentions:[["burial-participant","P101390","Иванъ Ампиловъ"]], literal:"Священникъ Іоанъ Ацѣтовъ, дьячки Александръ [Фортунатовъ], Григорій Поповъ, Иванъ Ампиловъ. На приходскомъ кладбищѣ.", modern:"Иван Ампилов назван в графе о совершивших погребение и месте захоронения. Разделение должностей между перечисленными лицами на этом листе неоднозначно." },
  { pos:12, id:"55da7b90-667c-4af3-a209-f40e4a832b12", scan:5, type:"birth-godparent", year:"июнь 1830", place:"Зеркло, Оренбургский уезд", mentions:[["godfather","P101391","Оной же деревни однодворецъ Максимъ Ампиловъ"]], literal:"Іюня. Деревни Зерыклы у однодворца Стефана Симеонова и жены его Гликерии Тихоновой сынъ Феодоръ. Оной же деревни однодворецъ Максимъ Ампиловъ.", modern:"В июне 1830 года однодворец Максим Ампилов из Зеркло был восприемником Феодора, сына Стефана Симеонова и Гликерии Тихоновны." },
  { pos:13, id:"b7af3947-551a-4d8c-9b24-0db41c461aaf", scan:679, type:"marriage", year:"1831–1832", place:"Китойская слобода, Иркутская губерния", mentions:[["groom","P101392","крестьянинъ Григорій Григорьевъ Ампиловъ"],["witness","P101393","крестьянинъ Илья Григорьевъ Ампаловъ"],["bride",null,"Стефанида Григорьева, дочь умершаго крестьянина Григорія Григорьева Самохвалова"]], literal:"Дватцать пятаго числа крестьянинъ Григорій Григорьевъ Ампиловъ на дочери умершаго крестьянина Китойской слободы Григорія Григорьева Самохвалова Стефанидѣ Григорьевой первымъ бракомъ. Поручители были той же слободы крестьяне Илья Григорьевъ Ампаловъ, Афонасій Агаповъ Бояркинъ; Жилкинской слободы Антонъ Нефедовъ Чубаринъ и архиерейскаго дома служитель Яковъ Павловъ Куркутовъ.", modern:"Двадцать пятого числа крестьянин Григорий Григорьевич Ампилов вступил первым браком со Стефанидой Григорьевной Самохваловой. Поручителем был, среди прочих, Илья Григорьевич Ампалов." },
  { pos:14, id:"4db1baac-24d1-4f54-92d4-c8fa398c8413", scan:789, type:"birth", year:"май 1833", place:"деревня Промзино, Спасский уезд", confidence:"medium", mentions:[["mother","P101394","законная жена Анна Ампилова"],["father",null,"Андрей Терентьевъ Тазинъ"],["child",null,"сынъ Константинъ"]], literal:"[Мая, дата в колонке читается неуверенно.] Того жъ числа деревни Промзиной у Андрея Терентьева Тазина и законной его жены Анны Ампиловой родился сынъ Константинъ.", modern:"В мае 1833 года у Андрея Терентьевича Тазина и его законной жены Анны Ампиловой родился сын Константин; точный день требует повторной проверки колонок." },
  { pos:15, id:"02d8b612-5e8b-458d-870f-b052a7364a55", scan:610, type:"birth-godparent", year:"1833", place:"Иркутский или Верхоленский уезд", mentions:[["godmother","P101395","Петра Васильева Прошутинскаго жена его Мавра Амплова"],["child",null,"Марѳа"],["father",null,"Иванъ Адріановъ Высошихъ"],["mother",null,"Афанасія Иванова"]], literal:"Перваго числа, Головской, у крестьянина Ивана Адріанова Высошихъ и законной жены его Афанасьи Ивановой родилась дочь Марѳа. Отцемъ [восприемнымъ] Иванъ Гавріиловъ Томшинъ; матерію Петра Васильева Прошутинскаго жена его Мавра Амплова.", modern:"Мавра Амплова, жена Петра Васильевича Прошутинского, названа восприемницей Марфы в метрической записи 1833 года." },
  { pos:16, id:"98c3877d-a00d-42fe-8198-5397f997a936", scan:138, type:"marriage", year:"1835", place:"деревня Болотова, Троицкий уезд", mentions:[["groom","P101396","деревни Болотовой однодворецъ Егоръ Яковлевъ Ампиловъ"],["bride",null,"дѣвица Елизавѣта Васильева, дочь однодворца Василья Андреева Баташева"]], literal:"Того же числа деревни Болотовой однодворецъ Егоръ Яковлевъ Ампиловъ, холостъ, съ дѣвицей Елизавѣтой Васильевой, дочерью той же деревни однодворца Василья Андреева Баташева. По женихѣ: деревни Болотовой однодворцы Егоръ Ивановъ Севроповъ, Сергей Ивановъ Летвинцевъ и Николай Ивановъ Севрюковъ; по невѣстѣ: той же деревни однодворецъ Гавріилъ Васильевъ Батышевъ.", modern:"В 1835 году однодворец Егор Яковлевич Ампилов из Болотовой вступил в брак с Елизаветой Васильевной Баташевой." },
  { pos:17, id:"7de8cbe1-415b-4ae3-96df-1f458a18bb87", scan:82, type:"birth-godparent-uncertain-surname", year:"1831–1837", place:"деревня Зубачёва, Московская губерния", confidence:"low", mentions:[["godmother",null,"Праскева Ам[?]ева, жена крестьянина Карпа Стефанова"]], literal:"Четырнадцатаго числа экономическаго вѣдомства деревни Зубачевой у крестьянина Григорья Николаева и законной жены его Агафіи Евдокимовой родился сынъ Феодоръ; крещенъ того жъ мѣсяца 17 дня. Воспріемницею была той же деревни крестьянина Карпа Стефанова жена Праскева Ам[?]ева.", modern:"Восприемница Праскева, жена Карпа Стефанова, имеет неясно написанную фамилию «Ам[?]ева». Связь с фамильным рядом Ампиловых не подтверждена, поэтому профиль и картографическое событие не создаются.", unresolved:["Середина фамилии Праскевы неразборчива; индексное чтение «Ампилова» оригиналом уверенно не подтверждается."] },
  { pos:18, id:"8eec7fb9-94c8-4410-a406-ecdd793e7a7a", scan:109, type:"birth", year:"1835", place:"село Кундравы, Троицкий уезд", mentions:[["father","P101396","крестьянинъ Егоръ Яковлевъ Ампиловъ"],["child","P101397","сынъ Стефанъ"],["mother",null,"законная жена Васса Васильева"]], literal:"Того же числа села Кундравовъ у крестьянина Егора Яковлева Ампилова и законной жены его Вассы Васильевой родился сынъ Стефанъ. [Крещен] 27-го. Воспріемники: села же Кундравовъ однодворецъ Феодоръ Васильевъ Чурсинъ и однодворца Семена Збитнева жена Марья Петрова.", modern:"В 1835 году в Кундравах у крестьянина Егора Яковлевича Ампилова и Вассы Васильевны родился сын Степан." },
  { pos:19, id:"e02cec5c-8bc4-481b-b328-2a70ce95d6a2", scan:271, type:"birth-godparent", year:"5–6 [месяц не установлен] 1836", place:"деревня Кармалка, Оренбургский уезд", confidence:"medium", mentions:[["spouse-of-godmother","P101398","Ѳлора Никитина Ампилова"],["godmother",null,"жена Степанида Сидорова"],["children",null,"дочь Марѳа и сынъ Михаилъ"]], literal:"Пятаго числа деревни Кармалки у однодворца Аѳанасія Гаврилова Банникова и законной его жены Татіаны Прохоровой родились дочь Марѳа и сынъ Михаилъ; [крещены] 6-го. Той же деревни однодворецъ Александръ Михаиловъ Тепловъ и Ѳлора Никитина Ампилова жена Степанида Сидорова, и той же деревни Терентья Панкратова Овсянникова дочь дѣвица Надежда.", modern:"Степанида Сидоровна, жена Флора Никитича Ампилова, названа одной из восприемниц близнецов Марфы и Михаила. Запись подтверждена тремя архивными копиями/кадрами.", parallels:[{pos:20,id:"c7779c49-6050-40bb-b2a6-361fbc2f5f88",scan:12},{pos:21,id:"28ad9379-ae01-40ee-80fe-cf0139b0056d",scan:238}] },
  { pos:22, id:"e5924818-ce8f-442f-840f-2303b3c10c30", scan:172, type:"birth-godparent", year:"1837", place:"деревня Зеркло, Оренбургский уезд", mentions:[["godfather","P101399","однодворецъ Тимофей Максимовъ Ампиловъ"],["child",null,"сынъ Михаилъ"],["father",null,"экономическій крестьянинъ Иванъ Ильинъ Алехинъ"],["mother",null,"Ирина Трифонова"]], literal:"Девятаго надесять деревни Зерской у экономическаго крестьянина Ивана Ильина Алехина и законной жены его Ирины Трифоновой сынъ Михаилъ; [крещен] 21-го. Той же деревни изъ однодворцевъ Тимофей Максимовъ Ампиловъ, Стефана Симеонова жена Гликерія Тихонова.", modern:"В 1837 году однодворец Тимофей Максимович Ампилов из Зеркло был восприемником Михаила, сына Ивана Ильича Алехина и Ирины Трифоновны." },
  { pos:23, id:"3dabd54b-ed52-4fca-9d7b-a518f9eba794", scan:357, type:"marriage", year:"1838–1843", place:"Бахтемировское, Астраханский уезд", mentions:[["bride","P101401","дѣвица Елизавѣта, Михайлова дочь ... Михайлы Иванова Ампилова"],["father-of-bride","P101400","однодворецъ Михайла Ивановъ Ампиловъ"],["groom",null,"Фирсъ Савельевъ Поповъ"]], literal:"Дѣвица Елизавѣта, 16 лѣт, Михайлова дочь Астраханскаго уѣзда села Бахтемировскаго однодворца Михайлы Иванова Ампилова. [Жених:] Фирсъ Савельевъ Поповъ, 18 лѣт. По женихѣ: села Бахтемировскаго однодворцы Савѣлій Меркуловъ Поповъ, Ѳедоръ Кизинъ, Ѳедотъ Гнучевъ; а по невѣстѣ того же села однодворцы Михайла Ивановъ Ампиловъ, Петръ Кизинъ, Василій Зубковъ.", modern:"Шестнадцатилетняя Елизавета, дочь однодворца Михаила Ивановича Ампилова из Бахтемировского, вступила в брак с восемнадцатилетним Фирсом Савельевичем Поповым.", parallels:[{pos:24,id:"3dabd54b-ed52-4fca-9d7b-a518f9eba794",scan:356}] },
  { pos:25, id:"e2bf6102-73d2-429d-9cab-e3dbc016bb40", scan:52, type:"birth", year:"1839–1846", place:"Бахтемировское, Астраханский уезд", confidence:"medium", mentions:[["father","P101400","государственный крестьянинъ Михаилъ Ивановъ Ампиловъ"],["child","P101403","Васса"],["godfather","P101402","государственный крестьянинъ Тимофей Ивановъ Ампиловъ"],["mother",null,"жена Ефимія Варѳоломѣева"]], literal:"Васса. Бахтемировскаго селенія государственный крестьянинъ Михаилъ Ивановъ Ампиловъ, жена его Ефимія Варѳоломѣева, оба православнаго исповѣданія. Того же селенія государственный крестьянинъ Тимофей Ивановъ Ампиловъ; того же селенія государственнаго крестьянина Аввакума Савельева Ярыгина жена его Матрона Григорьева.", modern:"В Бахтемировском у государственного крестьянина Михаила Ивановича Ампилова и Ефимии Варфоломеевны родилась дочь Васса; восприемником был Тимофей Иванович Ампилов. Три соседних поисковых результата показывают один и тот же акт.", parallels:[{pos:26,id:"e2bf6102-73d2-429d-9cab-e3dbc016bb40",scan:54},{pos:28,id:"e2bf6102-73d2-429d-9cab-e3dbc016bb40",scan:53}] },
  { pos:27, id:"56d70941-8ba7-431f-a5f3-c6dd59f41151", scan:84, type:"birth", year:"1838–1847", place:"село Ключищи, Симбирская губерния", confidence:"medium", mentions:[["mother","P101404","законная жена Анисіа Ампліева"],["father",null,"дьячекъ Петръ Мефодіевъ"],["child",null,"Димитрій"]], literal:"18 [родился], 20 [крещен]. Димитрій. Села Ключищъ Покровской церкви дьячекъ Петръ Мефодіевъ, законная его жена Анисіа Ампліева, оба православнаго исповѣданія.", modern:"В метрической книге Ключищ у дьячка Петра Мефодиева и его законной жены Анисии Амплиевой записан сын Дмитрий. Год внутри диапазона дела 1838–1847 требует уточнения по разделителю тома." },
  { pos:29, id:"e2bf6102-73d2-429d-9cab-e3dbc016bb40", scan:34, type:"birth-godparent", year:"1839–1846", place:"Бахтемировское, Астраханский уезд", confidence:"medium", mentions:[["spouse-of-godmother","P101402","крестьянинъ Тимофей Ампиловъ"],["godmother",null,"жена его Татьяна Гаврилова"]], literal:"Того же селенія и вѣдомства крестьянина Тимофея Ампилова жена его Татьяна Гаврилова.", modern:"Татьяна Гавриловна, жена Тимофея Ампилова, названа восприемницей; имя крещаемого и остальные участники сохранены на полном листе, но не нормализуются в фамильное ядро." },
  { pos:30, id:"e2bf6102-73d2-429d-9cab-e3dbc016bb40", scan:85, type:"birth-godparent", year:"1839–1846", place:"Бахтемировское, Астраханский уезд", confidence:"medium", mentions:[["spouse-of-godmother","P101402","Тимофей Ивановъ Ампиловъ"],["godmother",null,"жена его Татьяна Гаврилова"]], literal:"Того же селенія государственнаго крестьянина Тимофея Иванова Ампилова жена его Татьяна Гаврилова.", modern:"Татьяна Гавриловна, жена государственного крестьянина Тимофея Ивановича Ампилова, вновь названа восприемницей в метрической книге Бахтемировского." },
];

const search = JSON.parse(await readFile(searchPath, "utf8"));
const results = search.batches[0].results;
const rowAt = (position) => results.find((row) => row.absolutePosition === position);
const digest = async (file) => createHash("sha256").update(await readFile(file)).digest("hex");
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const pngDimensions = async (file) => { const bytes = await readFile(file); return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`; };
const metadataFor = async (id, scan) => JSON.parse(await readFile(path.join(metadataRoot, `${id}-${scan}.json`), "utf8"));

const evidenceBundle = async (id, scan) => {
  const prefix = String(scan).padStart(4, "0");
  const dir = path.join(root, "data/genealogy/evidence-private/yandex", id);
  const names = await readdir(dir);
  const full = path.join(dir, `${prefix}-full-view.png`);
  const header = path.join(dir, `${prefix}-header.png`);
  const target = path.join(dir, `${prefix}-target-entry.png`);
  await access(full); await access(header); await access(target);
  return {
    catalogId: id,
    scanNumber: scan,
    captureType: "yandex-archive-original-image-download-with-enlarged-fragments",
    localBackup: relative(full),
    path: relative(full),
    capturedAt,
    sha256: await digest(full),
    fragments: [
      { kind: "header", path: relative(header), sha256: await digest(header), description: "Верхняя часть исходного листа с заголовком или структурой граф." },
      { kind: "target-entry", path: relative(target), sha256: await digest(target), description: "Крупный фрагмент целевой строки с соседним первичным контекстом." },
    ],
    quality: { documentOnlyVisuallyConfirmed: true, headerVisuallyConfirmed: true, targetRowsVisuallyConfirmed: true, confirmedAt: capturedAt, method: "manual-reading-of-downloaded-original", fullDimensions: await pngDimensions(full) },
    publicDisplay: false,
    rightsNote: "Локальная копия оригинального листа и крупные фрагменты сохранены только для исследовательской проверки; публичная ссылка ведёт исключительно на Яндекс Архив.",
  };
};

const sourceIdsByPerson = new Map(people.map((person) => [person.id, []]));
for (const record of records) {
  const sourceId = `YA-${record.id.slice(0, 8).toUpperCase()}-${String(record.scan).padStart(3, "0")}`;
  const metadata = await metadataFor(record.id, record.scan);
  const source = {
    schemaVersion: 1,
    sourceId,
    provider: "Яндекс Архив — первичный скан",
    recordType: record.type,
    collection: { catalogId: record.id, scanNumber: record.scan, title: metadata.pageProps.breadcrumbs?.at(-1)?.name ?? rowAt(record.pos).title },
    links: { documentUrl: `https://yandex.ru/archive/catalog/${record.id}/${record.scan}` },
    event: { type: record.type, date: { display: record.year, confidence: record.confidence ?? "high-for-year" }, place: { normalized: record.place } },
    mentions: record.mentions.map(([role, personId, written], index) => ({ mentionId: `${sourceId}-M${index + 1}`, role, personId, nameAsTranscribed: written, displayName: personId ? people.find((person) => person.id === personId).name : written.replaceAll("ъ", ""), surnameSeries: Boolean(personId) })),
    evidence: await evidenceBundle(record.id, record.scan),
    transcription: { status: record.unresolved ? "complete-with-uncertainties" : "complete-primary-scan-transcription-with-local-evidence", literal: record.literal, modernInterpretation: record.modern, indexNote: "Индекс Яндекса использован только для навигации; чтение выполнено заново по сохранённому оригиналу." },
    isRecord: true,
    cardKind: "named-primary-record",
    review: { status: "complete-primary-scan-reading-with-local-evidence", transcriptionConfidence: record.confidence ?? "high", unresolved: record.unresolved ?? [] },
  };
  if (record.parallels?.length) {
    source.evidence.parallelCopies = [];
    source.links.alternateDocumentUrls = [];
    for (const parallel of record.parallels) {
      source.evidence.parallelCopies.push(await evidenceBundle(parallel.id, parallel.scan));
      source.links.alternateDocumentUrls.push(`https://yandex.ru/archive/catalog/${parallel.id}/${parallel.scan}`);
    }
  }
  await writeFile(path.join(sourceRoot, `${sourceId}.json`), `${JSON.stringify(source, null, 2)}\n`);
  for (const [, personId] of record.mentions) if (personId) sourceIdsByPerson.get(personId)?.push(sourceId);
  Object.assign(rowAt(record.pos), { sourceId, status: "complete-with-local-evidence", capture: false, primaryScanReading: record.literal });
  for (const parallel of record.parallels ?? []) Object.assign(rowAt(parallel.pos), { sourceId, status: "complete-parallel-copy-or-page-overlap", capture: false, primaryScanReading: record.literal });
}

Object.assign(rowAt(11), {
  status: "complete-rejected-false-positive",
  capture: false,
  primaryScanReading: "В строке № 53 родилась Марфа у крестьянина Аммоса Агапитова и Марьи Андреевой. Фамилии Ампилова на листе нет; квадратные скобки индекса — ошибочная автоматическая подстановка.",
  rejectionReason: "primary-scan-does-not-contain-studied-surname",
});

for (const person of people) {
  const slug = person.name.toLowerCase().replaceAll("ё", "e").replaceAll("й", "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
  const value = {
    schemaVersion: 1,
    personId: person.id,
    displayName: person.name,
    sex: person.sex,
    nameVariants: [person.written],
    surname: { normalized: person.surname, formsAsWritten: [person.written.match(/Амп[а-яѣі]+/i)?.[0]?.replace(/ъ$/, "") ?? person.surname] },
    sourceIds: [...new Set(sourceIdsByPerson.get(person.id))].sort(),
    status: "documented-from-primary-scan",
    places: [{ relation: "documented", normalized: person.place, confidence: "high" }],
    notes: [person.note],
  };
  await writeFile(path.join(peopleRoot, `${person.id}-${slug}.json`), `${JSON.stringify(value, null, 2)}\n`);
}

const completed = results.filter((row) => row.capture === false && !row.status.startsWith("pending-")).length;
const pending = results.filter((row) => row.capture !== false && row.status.startsWith("pending-"));
search.progress = {
  ...search.progress,
  rowsCompleted: completed,
  uniqueScansPending: new Set(pending.map((row) => `${row.catalogId}/${row.scanNumber}`)).size,
  rowsRemaining: results.length - completed,
};
search.status = "inventory-complete-processing-in-progress";
await writeFile(searchPath, `${JSON.stringify(search, null, 2)}\n`);

console.log(JSON.stringify({ sourcesWritten: records.length, peopleWritten: people.length, rowsCompleted: completed, rowsRemaining: results.length - completed, uniqueScansPending: search.progress.uniqueScansPending }, null, 2));
