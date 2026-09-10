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
  ["P101417","Иван Иванович Ампилов","male","Иванъ Ивановъ Ампиловъ","Ампилов","деревня Баклановка, Оренбургская губерния","Записан в девятой ревизии 1850 года; рядом указана жена Марфа Ивановна."],
  ["P101419","Прасковья Никифоровна Ампилова","female","Праскева, дочь Никифора Ларіонова Ампилова","Ампилова","деревня Илларионовка, Оренбургский уезд","Дочь казака Никифора Ларионовича Ампилова и Марфы Фёдоровны."],
  ["P101420","Пётр Ампилов","male","дьячекъ Петръ Ампиловъ","Ампилов","село Грязнуха","Дьячок, назван среди причта, совершавшего крещение."],
  ["P101421","Семён Егорович Ампилов","male","Семеонъ, сынъ Егора Яковлева Ампилова","Ампилов","сельцо Киселево, Бузулукский уезд","Сын государственного крестьянина Егора Яковлевича Ампилова и Елизаветы Васильевны."],
  ["P101422","Яков Егорович Ампилов","male","Яковъ Егоровъ Ампиловъ","Ампилов","деревня Каршанка, Оренбургский уезд","Государственный крестьянин; отец Петра в метрической записи 1852 года."],
  ["P101423","Пётр Яковлевич Ампилов","male","Петръ, сынъ Якова Егорова Ампилова","Ампилов","деревня Каршанка, Оренбургский уезд","Сын Якова Егоровича Ампилова и Ксении Дмитриевны."],
  ["P101424","Константин Амплов","male","пономарь Константинъ Ампловъ","Амплов","село Мордово, Сенгилеевский уезд","Пономарь; назван отцом ребёнка в метрической записи. Имя ребёнка на фрагменте читается неуверенно."],
  ["P101425","Степан Яковлевич Ампилов","male","Степанъ Яковлевъ Ампиловъ","Ампилов","сельцо Киселевка, Бузулукский уезд","18-летний государственный крестьянин; в 1852 году вступил первым браком с Анастасией Петровной."],
];

const records = [
  {p:60,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:40,t:"birth-godparent",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["spouse-of-godmother","P101402","Тимоѳея Иванова Ампилова жена Татьяна Гаврилова"],["godmother",null,"Татьяна Гаврилова"]],l:"Евдокія. [...] Восприемники: Аввакумъ Савельевъ Ярыгинъ; Бахтемировскаго селенія государственнаго крестьянина Тимоѳея Иванова Ампилова жена Татьяна Гаврилова.",x:"Татьяна Гавриловна, жена Тимофея Ивановича Ампилова, была восприемницей Евдокии."},
  {p:63,id:"73a55142-2304-4f4b-bd37-760265e7c4f2",s:229,t:"death",y:"1846–1852",pl:"Бахтемировское, Астраханский уезд",m:[["deceased","P101413","сынъ младенецъ Иванъ"],["father","P101400","государственный крестьянинъ Михаилъ Ивановъ Ампиловъ"]],l:"11 [умер], [погребён]. Бахтемировскаго селенія государственнаго крестьянина Михаила Иванова Ампилова сынъ младенецъ Иванъ, 1 года. Отъ холеры.",x:"Годовалый Иван, сын Михаила Ивановича Ампилова, умер от холеры. Совпадение семьи и возраста позволяет связать запись с Иоанном из записи рождения; отождествление имеет среднюю уверенность.",c:"medium",u:["Связь умершего Ивана с ранее найденной записью рождения Иоанна вероятна, но основана на совпадении семьи, места и возраста."]},
  {p:69,id:"d50fcd8d-bc60-4812-b9b6-2b09bd2d6a87",s:97,t:"marriage-witness",y:"1850",pl:"сельцо Киселево, Бузулукский уезд",m:[["witness","P101396","Егоръ Яковлевъ Ампиловъ"]],l:"Егоръ Яковлевъ Ампиловъ, Моѵрій Ивановъ Сидоровъ, Димитрій Корниліевъ Куликовъ и Тимофей Архиповъ Куликовъ.",x:"Егор Яковлевич Ампилов назван в перечне поручителей метрической записи 1850 года."},
  {p:70,id:"da48ed7d-374f-445f-9d18-f10edbb85f81",s:20,t:"revision-list",y:"1850",pl:"деревня Баклановка, Оренбургская губерния",m:[["revision-person","P101417","Иванъ Ивановъ Ампиловъ"],["spouse",null,"Ивана Ампилова жена Марѳа Иванова"]],l:"Того же уѣзда изъ деревни Баклановки: Иванъ Ивановъ Ампиловъ. [...] И Ивана Ампилова жена Марѳа Иванова, 23 [года].",x:"Девятая ревизия фиксирует Ивана Ивановича Ампилова из деревни Баклановки и его 23-летнюю жену Марфу Ивановну."},
  {p:71,id:"12efe752-637c-4ccc-b338-16aec986aaa3",s:119,t:"birth",y:"1850",pl:"деревня Илларионовка, Оренбургский уезд",m:[["child","P101419","Праскева"],["father","P0842","казакъ Никифоръ Ларіоновъ Ампиловъ"],["mother",null,"жена его Марѳа Феодорова"],["godmother",null,"казака Алексѣя Аплова жена Ольга Васильева"]],l:"Праскева. Деревни Иларіоновки казака Никифора Ларіонова Ампилова и жены его Марѳы Феодоровой. [...] Восприемники: Герасимъ Ивановъ Воробьевъ и у казака Алексѣя Аплова жена Ольга Васильева.",x:"У казака Никифора Ларионовича Ампилова и Марфы Фёдоровны родилась Прасковья. Форма «Аплов» у мужа восприемницы сохранена только как буквальное упоминание."},
  {p:72,id:"c5dd9164-5d7d-46fa-b6e1-a54837cef16b",s:365,t:"confession-list-review",y:"до 1851",pl:"Богородский уезд, Московская губерния",c:"low",m:[["surname-bearer",null,"[жена?] Агафія ... Ампилова"]],l:"[Фрагмент исповедной ведомости:] ... жена Агафія ... Ампилова ... [соседние строки и числовые графы].",x:"На листе уверенно читаются имя Агафия и фамильная форма «Ампилова», однако связь слов и структура семьи неоднозначны. Профиль и карта до проверки полного раздела не создаются.",u:["Необходимо сверить заголовки семейной группы и соседний лист, чтобы установить роль, возраст и состав имени."]},
  {p:73,id:"ef9c8763-f23f-4bce-bf1f-fb098f129a3f",s:80,t:"birth-clergy",y:"до 1851",pl:"село Грязнуха",m:[["clergy","P101420","дьячекъ Петръ Ампиловъ"]],l:"Молитвовалъ и крестилъ приходскій іерей Андрей Тархановъ; діаконъ Димитрій [фамилия неразборчива]; дьячекъ Петръ Ампиловъ; пономарь Феодосій [фамилия неразборчива].",x:"Дьячок Пётр Ампилов назван среди церковного причта, совершавшего таинство."},
  {p:74,id:"cc50c275-3751-4b75-bfe6-cf0913a0fb37",s:122,t:"birth",y:"1851",pl:"сельцо Киселево, Бузулукский уезд",m:[["child","P101421","Семеонъ"],["father","P101396","государственный крестьянинъ Егоръ Яковлевъ Ампиловъ"],["mother",null,"законная жена его Елизавета Васильева"]],l:"Семеонъ. Сельца Киселева государственный крестьянинъ Егоръ Яковлевъ Ампиловъ, законная жена его Елизавета Васильева, оба православнаго исповѣданія.",x:"В 1851 году у Егора Яковлевича Ампилова и Елизаветы Васильевны родился Семён."},
  {p:76,id:"97343409-6d21-4885-80fa-bdc83f89e741",s:152,t:"marriage-witness",y:"1851",pl:"село Георгиевка, Оренбургский уезд",m:[["witness","P101373","Тимофей Максимовъ Ампиловъ"]],l:"Поручители по женихѣ: села Георгіевки [крестьяне] Тимофей Максимовъ Ампиловъ, Иванъ Васильевъ Переверзевъ; [далее поручители по невесте].",x:"Тимофей Максимович Ампилов выступил поручителем по женихе в брачной записи 1851 года."},
  {p:77,id:"cc50c275-3751-4b75-bfe6-cf0913a0fb37",s:140,t:"marriage-witness",y:"1851",pl:"сельцо Киселево, Бузулукский уезд",m:[["witness","P101396","Егоръ Яковлевъ Ампиловъ"]],l:"По невѣстѣ: Гавріилъ Батищевъ и Егоръ Яковлевъ Ампиловъ.",x:"Егор Яковлевич Ампилов назван поручителем по невесте в брачной записи 1851 года."},
  {p:78,id:"af95790b-65b9-4513-b93f-af1ac96433c9",s:176,t:"birth",y:"1852",pl:"деревня Каршанка, Оренбургский уезд",m:[["child","P101423","Петръ"],["father","P101422","государственный крестьянинъ Яковъ Егоровъ Ампиловъ"],["mother",null,"законная жена его Ксенія Дмитріева"]],l:"Петръ. Деревни Каршанки государственный крестьянинъ Яковъ Егоровъ Ампиловъ и законная жена его Ксенія Дмитріева. [...] Восприемникъ отставной солдатъ Онуфрій Апполовъ.",x:"В 1852 году у Якова Егоровича Ампилова и Ксении Дмитриевны родился Пётр; Онуфрий Апполов сохранён только как упомянутый восприемник."},
  {p:79,id:"0a00cffb-51d9-4824-81f1-6caa9c8fec4e",s:14,t:"birth",y:"1852",pl:"село Мордово, Сенгилеевский уезд",c:"medium",m:[["father","P101424","пономарь Константинъ Ампловъ"],["mother",null,"жена его Анна Иванова"],["child",null,"[Иоанн?]"]],l:"[Имя ребёнка не вполне разборчиво.] Того села пономаря Константина Амплова и законной жены его Анны Ивановой, оба православнаго исповѣданія.",x:"Метрическая запись фиксирует ребёнка пономаря Константина Амплова и Анны Ивановны. Индекс Яндекса ошибочно представил карточку как смерть Константина.",u:["Имя ребёнка требует повторного чтения по соседнему кадру."]},
  {p:80,id:"2fc836b6-20a9-4cd2-92ea-55c44e0eb5aa",s:70,t:"marriage",y:"1852",pl:"сельцо Киселевка, Бузулукский уезд",m:[["groom","P101425","государственный крестьянинъ Степанъ Яковлевъ Ампиловъ"],["bride",null,"дѣвица Анастасія Петрова"]],l:"Сельца Киселевки государственный крестьянинъ Степанъ Яковлевъ Ампиловъ, православный, первымъ бракомъ, 18 [лет]. Того же сельца дѣвица Анастасія Петрова, православная, первымъ бракомъ, 18 [лет].",x:"В 1852 году 18-летний государственный крестьянин Степан Яковлевич Ампилов вступил первым браком с 18-летней Анастасией Петровной."},
];

const search = JSON.parse(await readFile(searchPath, "utf8"));
const rows = search.batches[0].results;
const rowAt = (p) => rows.find((row) => row.absolutePosition === p);
const digest = async (f) => createHash("sha256").update(await readFile(f)).digest("hex");
const rel = (f) => path.relative(root, f).split(path.sep).join("/");
const dims = async (f) => { const b = await readFile(f); return `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`; };
const evidence = async (id, s) => { const n=String(s).padStart(4,"0"),d=path.join(root,"data/genealogy/evidence-private/yandex",id),f=path.join(d,`${n}-full-view.png`),h=path.join(d,`${n}-header.png`),t=path.join(d,`${n}-target-entry.png`); await access(f);await access(h);await access(t); return {catalogId:id,scanNumber:s,captureType:"yandex-archive-original-image-download-with-enlarged-fragments",localBackup:rel(f),path:rel(f),capturedAt,sha256:await digest(f),fragments:[{kind:"header",path:rel(h),sha256:await digest(h),description:"Верхняя часть исходного листа с заголовком или структурой граф."},{kind:"target-entry",path:rel(t),sha256:await digest(t),description:"Крупный фрагмент целевой строки с первичным контекстом."}],quality:{documentOnlyVisuallyConfirmed:true,headerVisuallyConfirmed:true,targetRowsVisuallyConfirmed:true,confirmedAt:capturedAt,method:"manual-reading-of-downloaded-original",fullDimensions:await dims(f)},publicDisplay:false,rightsNote:"Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив."}; };
const personMap = new Map(people.map((p) => [p[0], p]));
const sourceIds = new Map(people.map((p) => [p[0], []]));

for (const r of records) {
  const sid = `YA-${r.id.slice(0,8).toUpperCase()}-${String(r.s).padStart(3,"0")}`;
  const meta = JSON.parse(await readFile(path.join(metadataRoot,`${r.id}-${r.s}.json`),"utf8"));
  const value = {schemaVersion:1,sourceId:sid,provider:"Яндекс Архив — первичный скан",recordType:r.t,collection:{catalogId:r.id,scanNumber:r.s,title:meta.pageProps.breadcrumbs?.at(-1)?.name??rowAt(r.p).title},links:{documentUrl:`https://yandex.ru/archive/catalog/${r.id}/${r.s}`},event:{type:r.t,date:{display:r.y,confidence:r.c??"high-for-year"},place:{normalized:r.pl}},mentions:r.m.map(([role,pid,w],i)=>({mentionId:`${sid}-M${i+1}`,role,personId:pid,nameAsTranscribed:w,displayName:personMap.get(pid)?.[1]??w.replaceAll("ъ",""),surnameSeries:Boolean(pid)||/Амп[а-яѣі]+/i.test(w)})),evidence:await evidence(r.id,r.s),transcription:{status:r.u?"complete-with-uncertainties":"complete-primary-scan-transcription-with-local-evidence",literal:r.l,modernInterpretation:r.x,indexNote:"Индекс Яндекса использован только для навигации; чтение выполнено по сохранённому оригиналу."},isRecord:true,cardKind:r.t.includes("review")?"research-note-record":"named-primary-record",publicCore:!r.t.includes("review"),review:{status:"complete-primary-scan-reading-with-local-evidence",transcriptionConfidence:r.c??"high",unresolved:r.u??[]}};
  await writeFile(path.join(sourceRoot,`${sid}.json`),`${JSON.stringify(value,null,2)}\n`);
  for (const [,pid] of r.m) if (pid) sourceIds.get(pid)?.push(sid);
  Object.assign(rowAt(r.p),{sourceId:sid,status:"complete-with-local-evidence",capture:false,primaryScanReading:r.l});
}

for (const [p,sid,reading] of [
  [56,"YA-73A55142-129","Соседний кадр той же брачной записи подтверждает поручителя Тимофея Ивановича Ампилова."],
  [57,"YA-73A55142-157","Соседний кадр той же записи смерти; имя дочери допускает чтения «Меонила» и «Неонила»."],
  [58,"YA-73A55142-142","Соседний кадр той же записи смерти Прасковьи, дочери Тимофея Ивановича Ампилова."],
  [59,"YA-73A55142-239","Соседний кадр той же записи смерти Тимофея Ивановича Ампилова; причина уверенно читается «отъ холеры»."],
  [62,"YA-73A55142-192","Соседний кадр той же записи о жене Тимофея Ампилова как восприемнице."],
  [64,"YA-73A55142-172","Соседний кадр той же записи рождения Иоанна у Михаила Ивановича Ампилова."],
]) {
  const srcPath=path.join(sourceRoot,`${sid}.json`),src=JSON.parse(await readFile(srcPath,"utf8")),r=rowAt(p);
  src.evidence.parallelCopies=[...(src.evidence.parallelCopies??[]),await evidence(r.catalogId,r.scanNumber)];
  src.links.alternateDocumentUrls=[...(src.links.alternateDocumentUrls??[]),r.documentUrl];
  if(p===59){src.transcription.literal=src.transcription.literal.replace("Отъ [причина неразборчива] умеръ.","Отъ холеры умеръ.");src.transcription.modernInterpretation="В книге 1846–1852 годов записана смерть от холеры 40-летнего государственного крестьянина Тимофея Ивановича Ампилова.";}
  if(p===57)src.review.unresolved=[...(src.review.unresolved??[]),"Параллельные кадры допускают варианты имени дочери: «Меонила» и «Неонила». Форма не нормализуется заново без дополнительной копии."];
  await writeFile(srcPath,`${JSON.stringify(src,null,2)}\n`);
  Object.assign(r,{sourceId:sid,status:"complete-parallel-copy-or-page-overlap",capture:false,primaryScanReading:reading});
}

for (const [p,reading] of [
  [61,"На сохранённом листе крещений фамилия Ампилов и предложенный индексом Анастасий Леонтьев не подтверждаются; карточка объединяет соседние строки."],
  [65,"В целевой записи Рузского уезда Анна названа матерью ребёнка, но фамилия Ампилова на первичном листе отсутствует."],
  [66,"В целевых строках могутовской книги фамилия Ампилов не читается; индексное «Якова Ампилова» не подтверждено."],
  [67,"В брачных строках и перечне поручителей Козина фамилия Ампилов не подтверждается; видны другие фамилии."],
  [68,"В целевой записи Корнеевки фамилия Ампилов не подтверждается; индекс объединил имя отца с соседними словами."],
  [75,"Запись смерти относится к дочери крестьянина с другим именованием; фамилия Ампилова на листе не читается."],
]) Object.assign(rowAt(p),{status:"complete-rejected-false-positive",capture:false,rejectionReason:"primary-scan-does-not-confirm-indexed-surname",primaryScanReading:reading});

const existingBacklinks={P101400:["YA-73A55142-229"],P101402:["YA-73A55142-040"],P101413:["YA-73A55142-229"],P101396:["YA-D50FCD8D-097","YA-CC50C275-122","YA-CC50C275-140"],P101373:["YA-97343409-152"],P0842:["YA-12EFE752-119"]};
const peopleFiles=await readdir(peopleRoot);
for(const [personId,additions] of Object.entries(existingBacklinks)){const fileName=peopleFiles.find((name)=>name.startsWith(`${personId}-`)&&name.endsWith(".json"));if(!fileName)throw new Error(`Не найден профиль ${personId}`);const file=path.join(peopleRoot,fileName),value=JSON.parse(await readFile(file,"utf8"));value.sourceIds=[...new Set([...(value.sourceIds??[]),...additions])].sort();if(personId==="P101396"){value.places=[...(value.places??[]),{relation:"documented-1850-1851",normalized:"сельцо Киселево, Бузулукский уезд",confidence:"high"}].filter((v,i,a)=>a.findIndex(x=>x.normalized===v.normalized&&x.relation===v.relation)===i);value.notes=[...(value.notes??[]),"Записи 1850–1851 годов фиксируют Егора Яковлевича с той же женой Елизаветой Васильевной в Киселеве; это документирует перемещение семьи после брака 1835 года."].filter((v,i,a)=>a.indexOf(v)===i);}await writeFile(file,`${JSON.stringify(value,null,2)}\n`);}

for(const [id,name,sex,w,surname,place,note] of people){const slug=name.toLowerCase().replaceAll("ё","e").replaceAll("й","i").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zа-я0-9]+/gi,"-").replace(/^-|-$/g,"");await writeFile(path.join(peopleRoot,`${id}-${slug}.json`),`${JSON.stringify({schemaVersion:1,personId:id,displayName:name,sex,nameVariants:[w],surname:{normalized:surname,formsAsWritten:[w.match(/Амп[а-яѣі]+/i)?.[0]?.replace(/ъ$/,"")??surname]},sourceIds:[...new Set(sourceIds.get(id))].sort(),status:"documented-from-primary-scan",places:[{relation:"documented",normalized:place,confidence:"high"}],notes:[note]},null,2)}\n`);}

const completed=rows.filter(r=>r.capture===false&&!r.status.startsWith("pending-")).length;
const pending=rows.filter(r=>r.capture!==false&&r.status.startsWith("pending-"));
search.progress={...search.progress,rowsCompleted:completed,uniqueScansPending:new Set(pending.map(r=>`${r.catalogId}/${r.scanNumber}`)).size,rowsRemaining:rows.length-completed};
await writeFile(searchPath,`${JSON.stringify(search,null,2)}\n`);
console.log(JSON.stringify({sourcesWritten:records.length,peopleWritten:people.length,rowsCompleted:completed,rowsRemaining:rows.length-completed,uniqueScansPending:search.progress.uniqueScansPending},null,2));
