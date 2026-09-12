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
  ["P101405","Павел Ампилов","male","Павла Ампилова","Ампилов","Севастополь","Назван в рукописном указателе рождений как отец ребёнка; полный акт ещё предстоит связать по номеру 109."],
  ["P101406","Варвара Амплиева","female","Варвара Ампліева","Амплиева","деревня Лапино, Серпуховской уезд","Законная жена вольного хлебопашца Филиппа Ивановича; мать Евфимии в метрической записи."],
  ["P101407","Павел Карпович Ампилов","male","Павелъ Карповъ сынъ Ампиловъ","Ампилов","Севастополь","Боцман 30-го флотского экипажа; отец Кирилла в 1841 году."],
  ["P101408","Михаил Иванович Ампилов","male","Михайло Ивановъ Ампиловъ","Ампилов","Астраханская губерния","Записан в именном списке крестьян 1841 года; без названия селения не отождествлён автоматически с бахтемировским тёзкой."],
  ["P101409","Фёдор Тимофеевич Ампилонов","male","Ѳеодоръ, сынъ Тимоѳея Максимова Ампилонова","Ампилонов","Егоровка, Оренбургский уезд","Родился у Тимофея Максимовича Ампилонова/Ампелогова и Анны Дорофеевны; орфография фамилии на листе вариантна."],
  ["P101410","Вера Васильевна Ампилогова","female","Вѣра, дочь Василія Кирилова Ампилогова","Ампилогова","Егоровка, Оренбургский уезд","Родилась у Василия Кирилловича Ампилогова и Матрёны Никифоровны в книге 1840–1845 годов."],
  ["P101411","Авдотья Амплиева Налакова","female","Авдотья Ампліева Налакова","Амплиева","деревня Тяжино, Бронницкий уезд","Жена удельного крестьянина Ивана Матвеева; восприемница Наталии в московской метрике."],
  ["P101412","Прасковья Тимофеевна Ампилова","female","дочь Прасковья ... Тимоѳея Иванова Ампилова","Ампилова","Бахтемировское, Астраханский уезд","Дочь Тимофея Ивановича Ампилова; умерла семимесячной."],
  ["P101413","Иоанн Михайлович Ампилов","male","Іоаннъ, сынъ Михаила Иванова Ампилова","Ампилов","Бахтемировское, Астраханский уезд","Сын Михаила Ивановича Ампилова и Анны Даниловны; рождение записано в книге 1846–1852 годов."],
  ["P101414","Меонила Тимофеевна Ампилова","female","дочь Меонила ... Тимофея Иванова Ампилова","Ампилова","Бахтемировское, Астраханский уезд","Дочь Тимофея Ивановича Ампилова; умерла от детской болезни."],
  ["P101415","Павел Ефремович Ампилосов","male","Павелъ Ефремовъ Ампилосовъ","Ампилосов","деревня Дракина, Бузулукский уезд","Государственный крестьянин, 25 лет; вступил первым браком с Евгенией Тихоновной Сидоровой в 1846 году."],
  ["P101416","Василий Михайлович Ампилов","male","сынъ младенецъ Василій ... Михаила Иванова Ампилова","Ампилов","Бахтемировское, Астраханский уезд","Сын Михаила Ивановича Ампилова; умер в возрасте трёх месяцев."],
];

const records = [
  {p:33,id:"a01a2853-4cb3-4998-8ec6-aea50ee9b49c",s:77,t:"birth-index",y:"1820–1846",pl:"Севастополь",m:[["father","P101405","Павла Ампилова"]],l:"Кириллъ. 109. Павла Ампилова. Марія. Михайла Михайловъ.",x:"В рукописном указателе рождений рядом с Кириллом и номером 109 назван Павел Ампилов. Полный акт по одному указателю не реконструируется."},
  {p:34,id:"f0bc8097-bdae-4949-b3d6-6d1e46a087cf",s:1532,t:"birth",y:"до 1853",pl:"деревня Лапино, Серпуховской уезд",m:[["mother","P101406","законная жена Варвара Ампліева"],["father",null,"вольнаго хлѣбопашества крестьянинъ Филиппъ Ивановъ"],["child",null,"Евфимія"]],l:"Евфимія. Вольнаго хлѣбопашества деревни Лапина крестьянинъ Филиппъ Ивановъ и законная жена его Варвара Ампліева, православнаго исповѣданія.",x:"У вольного хлебопашца Филиппа Ивановича и его законной жены Варвары Амплиевой родилась Евфимия."},
  {p:35,id:"3106b9de-0bce-4891-9576-e0620cf2b019",s:50,t:"birth",y:"1841",pl:"Севастополь",m:[["father","P101407","30-го Флотскаго Экипажа боцманъ Павелъ Карповъ сынъ Ампиловъ"],["child",null,"Кириллъ"],["mother",null,"жена его Анастасія Васильева дочь"]],l:"Кириллъ. 30-го Флотскаго экипажа боцманъ Павелъ Карповъ сынъ Ампиловъ и жена его Анастасія Васильева дочь, оба православнаго исповѣданія.",x:"В 1841 году у боцмана 30-го флотского экипажа Павла Карповича Ампилова и Анастасии Васильевны родился Кирилл."},
  {p:36,id:"153482f4-bcae-4cd5-b13b-2ce36cae9b27",s:331,t:"index-discrepancy-review",y:"1841",pl:"Алексеевка, Бузулукский уезд",c:"low",m:[["uncertain-surname",null,"[... ]ева Ампилова"]],l:"[На повреждённой строке читается только окончание:] ...ева Ампилова. № 185. 6.",x:"Фрагмент подтверждает форму «Ампилова», но имя и роль носительницы утрачены/неразборчивы. Профиль и карта не создаются.",u:["Имя, родство и событие не восстанавливаются с достаточной уверенностью."]},
  {p:37,id:"c1fb8fa3-28ea-448e-87a5-d5615d344d5a",s:36,t:"peasant-name-list",y:"1841",pl:"Астраханская губерния",m:[["household-head","P101408","Михайло Ивановъ Ампиловъ"]],l:"№ 79. Михайло Ивановъ Ампиловъ. [Далее в строке:] Михайлѣ Плимѣнныхъ Трофимъ Ільинъ; Михайлѣ братъ Тимофей; Тимофеевъ сынъ Егоръ. 49. 12.",x:"Именной список крестьян 1841 года фиксирует Михаила Ивановича Ампилова и перечисляет соседних/связанных членов строки; структура родства требует сверки заголовка ведомости."},
  {p:38,id:"f47d6a7e-3846-469b-9556-c36bb8794f19",s:85,t:"births",y:"1840–1845",pl:"Егоровка, Оренбургский уезд",m:[["father","P101373","крестьянинъ Тимоѳей Максимовъ Ампилоновъ"],["child","P101409","Ѳеодоръ"],["father","P101375","крестьянинъ Василій Кириловъ Ампилоговъ"],["child","P101410","Вѣра"]],l:"Ѳеодоръ. Сельца Егоровки крестьянинъ Тимоѳей Максимовъ Ампилоновъ и жена Анна Дорофеева, оба православные. [...] Вѣра. Сельца Егоровки крестьянинъ Василій Кириловъ Ампилоговъ и жена его Матрена Никифорова, оба православные.",x:"Один лист содержит две записи фамильной группы: рождение Фёдора у Тимофея Максимовича и Анны Дорофеевны и рождение Веры у Василия Кирилловича и Матрёны Никифоровны."},
  {p:39,id:"56d70941-8ba7-431f-a5f3-c6dd59f41151",s:332,t:"birth",y:"1838–1847",pl:"Ключищи, Симбирская губерния",m:[["mother","P101404","законная жена Анисья Ампліева"],["father",null,"дьячекъ Петръ Мефодьевъ"],["child",null,"Тихонъ"]],l:"Тихонъ. Того села Покровской церкви дьячекъ Петръ Мефодьевъ, законная его жена Анисья Ампліева, оба православнаго исповѣданія.",x:"В Ключищах у дьячка Петра Мефодиева и Анисии Амплиевой родился Тихон. Это второй акт той же супружеской пары."},
  {p:40,id:"14490ba4-5bae-4fde-b955-d6c4fdcbfffd",s:908,t:"birth-godparent",y:"до 1853",pl:"Москва / деревня Тяжино Бронницкого уезда",m:[["godmother","P101411","Ивана Матвѣева жена Авдотья Ампліева Налакова"]],l:"Наталія. [...] Сошествинской на Даниловскомъ кладбищѣ церкви пономарь Петръ Матвѣевъ Уразовъ и Бронницкаго уѣзда деревни Тяжина удѣльнаго крестьянина Ивана Матвѣева жена Авдотья Ампліева Налакова.",x:"Авдотья Амплиева Налакова, жена удельного крестьянина Ивана Матвеева из Тяжина, была восприемницей Наталии."},
  {p:41,id:"d4ed2e69-38fc-47e2-bb7b-eedcafb1232a",s:544,t:"index-discrepancy-review",y:"1842",pl:"Большие Березняки, Карсунский уезд",c:"low",m:[["indexed-person",null,"Семен Феодоров [Ампилов]"],["indexed-father",null,"Феодор Егоров [Ампилов]"]],l:"В целевом участке первичного листа фамилия в строке Семёна и Феодора не читается достаточно уверенно; индекс Яндекса предлагает «Семен Феодоров Ампилов» и «Феодор Егоров Ампилов».",x:"Индексное совпадение сохранено как исследовательская заметка, но не принято за доказанную фамилию. Профили и карта не создаются.",u:["Нужен более точный повторный фрагмент левой части целевой строки."]},
  {p:44,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:239,t:"death",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["deceased","P101402","государственный крестьянинъ Тимофей Ивановъ Ампиловъ"]],l:"17 [умер], 18 [погребён]. Бахтемировскаго селенія государственный крестьянинъ Тимофей Ивановъ Ампиловъ. 40 [лет]. Отъ [причина неразборчива] умеръ.",x:"В книге 1846–1852 годов записана смерть 40-летнего государственного крестьянина Тимофея Ивановича Ампилова."},
  {p:46,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:142,t:"death",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["deceased","P101412","дочь Прасковья"],["father","P101402","государственный крестьянинъ Тимоѳей Ивановъ Ампиловъ"]],l:"13 [умерла], 14 [погребена]. Бахтемировскаго селенія государственнаго крестьянина Тимоѳея Иванова Ампилова дочь Прасковья, 7-го мѣсяца.",x:"Семимесячная Прасковья, дочь Тимофея Ивановича Ампилова, умерла в период 1846–1852 годов."},
  {p:47,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:172,t:"birth",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["father","P101400","государственный крестьянинъ Михаилъ Ивановъ Ампиловъ"],["child","P101413","Іоаннъ"],["godfather","P101402","государственный крестьянинъ Тимофей Ивановъ Ампиловъ"],["mother",null,"жена его Анна Данилова"]],l:"Іоаннъ. Бахтемировскаго селенія государственный крестьянинъ Михаилъ Ивановъ Ампиловъ, жена его Анна Данилова, оба православнаго исповѣданія. Восприемникъ: Бахтемировскаго селенія государственный крестьянинъ Тимофей Ивановъ Ампиловъ.",x:"У Михаила Ивановича Ампилова и Анны Даниловны родился Иоанн; восприемником был Тимофей Иванович Ампилов."},
  {p:49,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:192,t:"birth-godparent",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["spouse-of-godmother","P101402","крестьянинъ Тимофей Ампиловъ"],["godmother",null,"жена [имя на сгибе утрачено]"]],l:"Бахтемировскаго селенія государственнаго крестьянина Тимофея Ампилова жена [имя скрыто сгибом].",x:"Жена Тимофея Ампилова названа восприемницей; её имя не восстанавливается из-за сгиба листа."},
  {p:50,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:129,t:"marriage-witness",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["witness","P101402","государственный крестьянинъ Тимофей Ивановъ Ампиловъ"]],l:"По женихѣ: Бахтемировскаго селенія государственные крестьяне Савелій Меркуловъ Поповъ и Федоръ Гвоздаревъ. По невѣстѣ: того же селенія государственные крестьяне Тимофей Ивановъ Ампиловъ и Евлампъ Петровъ Кизинъ.",x:"Тимофей Иванович Ампилов выступил поручителем по невесте при браке в Бахтемировском."},
  {p:51,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:157,t:"death",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["deceased","P101414","дочь Меонила"],["father","P101402","государственный крестьянинъ Тимофей Ивановъ Ампиловъ"]],l:"25 [умерла], 26 [погребена]. Бахтемировскаго селенія государственнаго крестьянина Тимофея Иванова Ампилова дочь Меонила. Отъ дѣтской [болезни].",x:"В книге 1846–1852 годов записана смерть Меонилы, дочери Тимофея Ивановича Ампилова."},
  {p:52,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:18,t:"birth",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["father","P101400","государственный крестьянинъ Михаилъ Ивановъ Ампиловъ"],["mother",null,"жена его Анна Данилова"]],l:"Бахтемировскаго селенія государственный крестьянинъ Михаилъ Ивановъ Ампиловъ, жена его Анна Данилова, оба православнаго исповѣданія.",x:"Запись рождения фиксирует супругов Михаила Ивановича Ампилова и Анну Даниловну; имя ребёнка находится за пределом уверенно читаемого фрагмента.",par:[{p:48,s:19}]},
  {p:53,id:"6932a9a4-61a7-488c-9c9e-b19ac551e2cd",s:45,t:"marriage",y:"1846",pl:"деревня Дракина, Бузулукский уезд",m:[["groom","P101415","государственный крестьянинъ Павелъ Ефремовъ Ампилосовъ"],["bride",null,"дѣвица Евгенія, дочь государственнаго крестьянина Тихона Иванова Сидорова"]],l:"Деревни Дракиной государственный крестьянинъ Павелъ Ефремовъ Ампилосовъ, православный, первымъ бракомъ, 25 [лет]. Дѣвица Евгенія, православная, дочь той же деревни государственнаго крестьянина Тихона Иванова Сидорова.",x:"В 1846 году 25-летний государственный крестьянин Павел Ефремович Ампилосов вступил первым браком с Евгенией Тихоновной Сидоровой."},
  {p:54,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:308,t:"death",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["deceased","P101416","сынъ младенецъ Василій"],["father","P101400","государственный крестьянинъ Михаилъ Ивановъ Ампиловъ"]],l:"25 [умер], 26 [погребён]. Бахтемировскаго селенія государственнаго крестьянина Михаила Иванова Ампилова сынъ младенецъ Василій, 3 мѣсяц. Отъ младенческой.",x:"Трёхмесячный Василий, сын Михаила Ивановича Ампилова, умер от младенческой болезни.",par:[{p:55,s:307}]},
];

const search = JSON.parse(await readFile(searchPath,"utf8"));
const rows = search.batches[0].results;
const rowAt = (p) => rows.find((row) => row.absolutePosition === p);
const digest = async (f) => createHash("sha256").update(await readFile(f)).digest("hex");
const rel = (f) => path.relative(root,f).split(path.sep).join("/");
const dims = async (f) => { const b=await readFile(f); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; };
const evidence = async (id,s) => { const n=String(s).padStart(4,"0"), d=path.join(root,"data/genealogy/evidence-private/yandex",id), f=path.join(d,`${n}-full-view.png`), h=path.join(d,`${n}-header.png`), t=path.join(d,`${n}-target-entry.png`); await access(f);await access(h);await access(t); return {catalogId:id,scanNumber:s,captureType:"yandex-archive-original-image-download-with-enlarged-fragments",localBackup:rel(f),path:rel(f),capturedAt,sha256:await digest(f),fragments:[{kind:"header",path:rel(h),sha256:await digest(h),description:"Верхняя часть исходного листа с заголовком или структурой граф."},{kind:"target-entry",path:rel(t),sha256:await digest(t),description:"Крупный фрагмент целевой строки с первичным контекстом."}],quality:{documentOnlyVisuallyConfirmed:true,headerVisuallyConfirmed:true,targetRowsVisuallyConfirmed:true,confirmedAt:capturedAt,method:"manual-reading-of-downloaded-original",fullDimensions:await dims(f)},publicDisplay:false,rightsNote:"Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив."}; };
const personMap = new Map(people.map((p)=>[p[0],p]));
const sourceIds = new Map(people.map((p)=>[p[0],[]]));

for (const r of records) {
  const sid=`YA-${r.id.slice(0,8).toUpperCase()}-${String(r.s).padStart(3,"0")}`;
  const meta=JSON.parse(await readFile(path.join(metadataRoot,`${r.id}-${r.s}.json`),"utf8"));
  const ev=await evidence(r.id,r.s);
  if(r.par?.length){ev.parallelCopies=[];for(const q of r.par)ev.parallelCopies.push(await evidence(r.id,q.s));}
  const value={schemaVersion:1,sourceId:sid,provider:"Яндекс Архив — первичный скан",recordType:r.t,collection:{catalogId:r.id,scanNumber:r.s,title:meta.pageProps.breadcrumbs?.at(-1)?.name??rowAt(r.p).title},links:{documentUrl:`https://yandex.ru/archive/catalog/${r.id}/${r.s}`,...(r.par?{alternateDocumentUrls:r.par.map(q=>`https://yandex.ru/archive/catalog/${r.id}/${q.s}`)}:{})},event:{type:r.t,date:{display:r.y,confidence:r.c??"high-for-year"},place:{normalized:r.pl}},mentions:r.m.map(([role,pid,w],i)=>({mentionId:`${sid}-M${i+1}`,role,personId:pid,nameAsTranscribed:w,displayName:personMap.get(pid)?.[1]??w.replaceAll("ъ",""),surnameSeries:Boolean(pid)})),evidence:ev,transcription:{status:r.u?"complete-with-uncertainties":"complete-primary-scan-transcription-with-local-evidence",literal:r.l,modernInterpretation:r.x,indexNote:"Индекс Яндекса использован только для навигации; чтение выполнено по сохранённому оригиналу."},isRecord:true,cardKind:r.t==="index-discrepancy-review"?"research-note-record":"named-primary-record",publicCore:r.t!=="index-discrepancy-review",review:{status:"complete-primary-scan-reading-with-local-evidence",transcriptionConfidence:r.c??"high",unresolved:r.u??[]}};
  await writeFile(path.join(sourceRoot,`${sid}.json`),`${JSON.stringify(value,null,2)}\n`);
  for(const [,pid] of r.m)if(pid)sourceIds.get(pid)?.push(sid);
  Object.assign(rowAt(r.p),{sourceId:sid,status:"complete-with-local-evidence",capture:false,primaryScanReading:r.l});
  for(const q of r.par??[])Object.assign(rowAt(q.p),{sourceId:sid,status:"complete-parallel-copy-or-page-overlap",capture:false,primaryScanReading:r.l});
}

for(const [p,sid,reading] of [[31,"YA-E2BF6102-034","Соседний кадр того же акта: Тимофея Ампилова жена Татьяна Гаврилова."],[32,"YA-E2BF6102-085","Соседний кадр того же акта: Тимофея Иванова Ампилова жена Татьяна Гаврилова."]]){
  const srcPath=path.join(sourceRoot,`${sid}.json`),src=JSON.parse(await readFile(srcPath,"utf8")),r=rowAt(p);
  src.evidence.parallelCopies=[...(src.evidence.parallelCopies??[]),await evidence(r.catalogId,r.scanNumber)];
  src.links.alternateDocumentUrls=[...(src.links.alternateDocumentUrls??[]),r.documentUrl];
  await writeFile(srcPath,`${JSON.stringify(src,null,2)}\n`);
  Object.assign(r,{sourceId:sid,status:"complete-parallel-copy-or-page-overlap",capture:false,primaryScanReading:reading});
}

for(const [p,reason,reading] of [
  [42,"primary-scan-does-not-confirm-indexed-surname","В строке о кангаласской семье и восприемниках фамилия Ампилов не читается; индексное дополнение не подтверждено."],
  [43,"primary-scan-does-not-confirm-indexed-surname","На листе метрической книги Ключей фамилия Ампилов в указанной карточке не подтверждается ни строкой, ни текстовым слоем."],
  [45,"primary-scan-does-not-confirm-indexed-surname","В записи Магнитной/Кизильской крепости фамилия Ампилов не подтверждена; индекс объединил соседние имена."],
])Object.assign(rowAt(p),{status:"complete-rejected-false-positive",capture:false,rejectionReason:reason,primaryScanReading:reading});

const existingBacklinks = {
  P101373: ["YA-F47D6A7E-085"],
  P101375: ["YA-F47D6A7E-085"],
  P101400: ["YA-73A55142-018", "YA-73A55142-172", "YA-73A55142-308"],
  P101402: ["YA-73A55142-129", "YA-73A55142-142", "YA-73A55142-157", "YA-73A55142-172", "YA-73A55142-192", "YA-73A55142-239"],
  P101404: ["YA-56D70941-332"],
};
const peopleFiles = await readdir(peopleRoot);
for (const [personId, additions] of Object.entries(existingBacklinks)) {
  const fileName = peopleFiles.find((name) => name.startsWith(`${personId}-`) && name.endsWith(".json"));
  if (!fileName) throw new Error(`Не найден профиль ${personId}`);
  const file = path.join(peopleRoot, fileName);
  const value = JSON.parse(await readFile(file, "utf8"));
  value.sourceIds = [...new Set([...(value.sourceIds ?? []), ...additions])].sort();
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

for(const [id,name,sex,w,surname,place,note] of people){const slug=name.toLowerCase().replaceAll("ё","e").replaceAll("й","i").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zа-я0-9]+/gi,"-").replace(/^-|-$/g,"");await writeFile(path.join(peopleRoot,`${id}-${slug}.json`),`${JSON.stringify({schemaVersion:1,personId:id,displayName:name,sex,nameVariants:[w],surname:{normalized:surname,formsAsWritten:[w.match(/Амп[а-яѣі]+/i)?.[0]?.replace(/ъ$/,"")??surname]},sourceIds:[...new Set(sourceIds.get(id))].sort(),status:"documented-from-primary-scan",places:[{relation:"documented",normalized:place,confidence:"high"}],notes:[note]},null,2)}\n`);}

const completed=rows.filter(r=>r.capture===false&&!r.status.startsWith("pending-")).length;
const pending=rows.filter(r=>r.capture!==false&&r.status.startsWith("pending-"));
search.progress={...search.progress,rowsCompleted:completed,uniqueScansPending:new Set(pending.map(r=>`${r.catalogId}/${r.scanNumber}`)).size,rowsRemaining:rows.length-completed};
await writeFile(searchPath,`${JSON.stringify(search,null,2)}\n`);
console.log(JSON.stringify({sourcesWritten:records.length,peopleWritten:people.length,rowsCompleted:completed,rowsRemaining:rows.length-completed,uniqueScansPending:search.progress.uniqueScansPending},null,2));
