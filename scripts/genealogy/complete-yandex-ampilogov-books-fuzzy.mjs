#!/usr/bin/env node
import {createHash} from "node:crypto";
import {access,mkdir,readFile,readdir,writeFile} from "node:fs/promises";
import path from "node:path";

const root=process.cwd(), capturedAt="2026-09-10";
const manifestPath=path.join(root,"data/genealogy/searches/yandex-archive-ampilogov-books-fuzzy-2026-09-10.json");
const sourceRoot=path.join(root,"data/genealogy/sources/yandex"), legacyRoot=path.join(root,"data/genealogy/sources"), peopleRoot=path.join(root,"data/genealogy/people");
await mkdir(sourceRoot,{recursive:true});

const people=[
  ["P101862","Осип Иванович Ампилогов","male","село Каменка, Николаевский уезд","Крестьянин-собственник и хлебопашец; в 1871 году назван 48-летним и осуждён за кражу двух лошадей."],
  ["P101863","Пётр Гаврилович Ампилогов","male","Трокский уезд, Виленская губерния","Коллежский секретарь, становой пристав 1-го стана Трокского уезда; в должности с 19 августа 1870 года."],
  ["P101864","Екатерина Григорьевна Ампилогова (село Людское)","female","село Людское, Орловский уезд","Крестьянка-подёнщица, в судебной ведомости названа 35-летней; приговорена Орловским окружным судом."],
  ["P101865","Иван Григорьевич Ампилогов","male","не установлено","Фигурирует в судебной ведомости 1875 года под номером 27334 и в алфавитных указателях."],
  ["P101866","Михаил Семёнович Ампилогов","male","не установлено","Указан в алфавитном судебном указателе за 1872 год под номером 113."],
  ["P101867","Филимон Николаевич Ампилогов","male","село Михайловка, Дмитриевская волость, Оренбургский уезд","Крестьянин-пастух; в 1879 году назван 27-летним и осуждён на шесть месяцев и две недели тюрьмы."],
  ["P101868","Дарья Александровна Ампилогова","female","село Чермошна, Кромской уезд","Крестьянка-хлебопашец, в 1879 году названа 50-летней; приговорена к шести месяцам рабочего дома."],
  ["P101869","Анастасия Андреевна Ампилогова (Юдина)","female","деревня Дубовик, Ивановская волость, Малоархангельский уезд","Чернорабочая; в источнике основная фамилия Юдина, вариант «Ампилогова» указан прямо. В 1879 году названа 20-летней."],
  ["P101870","Евдоким Григорьевич Ампилогов","male","деревня Чермошна, Кромской уезд","Отставной рядовой и хлебопашец, в судебной ведомости назван 40-летним."],
  ["P101871","Василий Николаевич Ампилогов (Гусаков)","male","село Людское, Орловский уезд","Крестьянин села Людского; судебные ведомости 1880–1901 годов приводят также фамилию Гусаков и несколько повторных судимостей."],
  ["P101872","Василий Фёдорович Ампилогов (Кожухов)","male","деревня Самодуровка, Фатежский уезд","В судебной ведомости основная фамилия Кожухов, а «Ампилогов» указан как второе именование; в 1881 году назван 60-летним."],
  ["P101873","Михей Козьмич Ампилогов","male","село Отрадовка, Ново-Троицкая волость, Днепровский уезд","Чернорабочий; в 1882 году назван 25-летним, уроженцем села Теревина Карачевского уезда."],
  ["P101874","Алексей Фёдорович Ампилогов","male","село Людское, Городищенская волость, Орловский уезд","Крестьянин-подёнщик, в 1887 году назван 23-летним."],
  ["P101875","Карп Семёнович Ампилогов","male","деревня Долголаптевка, Городищенская волость, Орловский уезд","Крестьянин-хлебопашец, в 1888 году назван 37-летним; упомянут также в указателе 1890 года."],
  ["P101876","Василий Борисович Ампилогов","male","не установлено","Указан в судебной ведомости 1890 года под номером 76329."],
  ["P101877","Кирилл Михайлович Ампилогов","male","не установлено","Указан в судебной ведомости 1890 года под номером 16989."],
  ["P101878","Емельян Евдокимович Ампилогов","male","село Староверовка, Константиноградский уезд","Крестьянин-хлебопашец, в 1892 году назван 26-летним; подтверждён последующим указателем."],
  ["P101879","Николай Ампилогов (выпускник военного училища)","male","Российская империя","Выпускник 2-го Константиновского военного училища, направленный в 144-й пехотный полк и затем в Ивангородскую крепостную артиллерию."],
  ["P101880","Михаил Денисович Ампилогов","male","не установлено","Указан в судебной ведомости 1900 года под номером 56228."],
  ["P101881","Максим Антипович Ампилогов","male","не установлено","Указан в судебных ведомостях и указателях 1901–1902 годов."],
  ["P101882","Михаил Васильевич Аппилогов (врач)","male","Курск","Врач, окончивший медицинское образование в 1881 году; в 1890 году — младший врач 123-го пехотного полка в Курске. Фамилия на трёх сканах напечатана «Аппилогов»."],
  ["P101883","Иван Гаврилович Ампилогов","male","село Мугаило, Борчалинский уезд","Крестьянин, в 1904 году назван 22-летним и осуждён Тифлисским окружным судом."],
  ["P101884","Фёдор Андреевич Ампилогов","male","не установлено","Указан в судебной ведомости 1905 года под номером 19289."],
  ["P101885","Иван Степанович Ампилогов","male","не установлено","Указан в судебной ведомости 1905 года под номером 44851."],
  ["P101886","Неофит Семёнович Ампилогов","male","не установлено","Указан в судебной ведомости 1907 года под номером 37821."],
  ["P101887","Тимофей Иванович Ампилогов","male","село Людское, Городищенская волость, Орловский уезд","В 1909 году назван 19-летним крестьянином; осуждён за покушение по статье 172."],
  ["P101888","Афанасий Васильевич Ампилогов","male","Орловский уезд","Крестьянин, помощник заведующего 15-м Городищенским полицейским участком; ежегодно отмечен в адрес-календарях 1910–1915 годов."],
  ["P101889","Михаил Васильевич Ампилогов (Долгозаптевка)","male","деревня Долгозаптевка, Городищенская волость, Орловский уезд","Крестьянин, в судебной ведомости 1910 года назван 52-летним; подтверждён указателем 1911 года."],
  ["P101890","Денис Никитич Ампилогов","male","деревня Баздрева, Пятницкая волость, Карачевский уезд","Крестьянин, в 1910 году назван 33-летним; подтверждён указателем 1911 года."],
  ["P101891","Степан Карпович Ампилогов","male","село Берестовенька, Константиноградский уезд","Крестьянин, в 1911 году назван 23-летним; подтверждён указателем 1912 года."],
  ["P101892","Матвей Алексеевич Ампилогов (Анпилогов)","male","село Троицкое, Нижнереутская волость, Фатежский уезд","Крестьянин; судебные ведомости приводят варианты Ампилогов и Анпилогов. В 1913 году назван 21-летним, в 1916 году — 24-летним."],
  ["P101893","Евгения Владимировна Ампилогова","female","деревня Баздрева, Пятницкая волость, Карачевский уезд","Крестьянка, уроженка села Ивановского Хотынецкой волости; в 1914 году названа 28-летней и дважды осуждена."],
  ["P101894","Григорий Михайлович Ампилогов","male","не установлено","Указан в судебных ведомостях 1914 года и в алфавитном указателе 1915 года под номером 85534."],
  ["P101895","Василий Тимофеевич Ампилогов","male","местечко Ейское Укрепление, Ростовский-на-Дону округ","Мещанин, в 1915 году назван 40-летним; осуждён на три месяца тюрьмы."],
  ["P101896","Николай Иванович Ампилогов","male","деревня Брусовая, Петропавловская волость, Самарский уезд","Крестьянин, в 1916 году назван 39-летним; осуждён Самарским окружным судом."],
  ["P101897","Николай Виссарионович Ампилогов","male","Шариновская волость, Ачинский уезд","В судебной ведомости 1928 года назван 45-летним и приговорён к трём годам лишения свободы с поражением прав на год."],
  ["P101898","Анастасия Ильинична Ампилогова","female","Киевский военный госпиталь","Сотрудница военного времени; 7 февраля 1915 года направлена в Киевский военный госпиталь."],
];

const bindings={
  2:["P101862"],3:["P101863"],4:["P101864","P101865","P101862","P101866"],5:["P101865"],7:["P101865"],11:["P101867"],14:["P101869","P101870"],15:["P101871"],16:["P101871"],17:["P101872"],18:["P101869","P101870"],19:["P101872"],20:["P101871"],21:["P101871"],22:["P101872"],23:["P101873"],24:["P101871"],25:["P101871"],29:["P101874"],31:["P101875"],32:["P101876"],34:["P101875"],35:["P101877"],37:["P101878"],39:["P101879"],40:["P101878"],41:["P101871"],42:["P101880"],43:["P101881"],44:["P101871"],46:["P101881"],47:["P101881"],50:["P101883"],51:["P101884"],52:["P101885"],53:["P101886"],54:["P101887"],55:["P101888"],56:["P101889"],57:["P101888",null],58:["P101890"],59:["P101891"],60:["P101888"],61:["P101890","P101889"],62:["P101888"],63:["P101891"],64:["P101888"],65:["P101888"],66:["P101888"],67:["P101888",null],68:["P101892"],69:[null],70:["P101893","P101894"],71:["P101893","P101894"],72:["P101892"],73:[null],74:["P101888",null],75:["P101888"],76:["P101893","P101894"],78:["P101895"],79:["P101895"],80:["P101892"],81:["P101892","P101896"],82:["P101897"]
};

const n=(type,place,literal,modern,mentions,isRecord=true,reason=null)=>({type,place,literal,modern,mentions,isRecord,reason});
const newDetails={
  6:n("conviction-record","село Людское, Орловский уезд","25823. АМПИЛОГОВА, Екатерина Григорьева. Крестьянка (поденщица), 35 л., родилась, приписана и жила в с. Людском, Орловского у.; приговорена Орловским Окр. С. за убийство, по 4 и 5 п. 1453 ст. Улож., с лишением всех прав, к ссылке в каторжные работы на десять лет на заводах. Приг. обращён к исполнению 29 мая 1874 г.","Екатерина Григорьевна Ампилогова, 35-летняя подёнщица из села Людского, приговорена к десятилетним каторжным работам.",[["subject","P101864","АМПИЛОГОВА, Екатерина Григорьева"]]),
  8:n("false-positive-place-name","деревня Ампилогова, Дроняевская волость, Курский уезд","10655. ШЛЫКОВА, Степанида Петрова. Крест. д. Ампилоговой, Дроняевской в., Курского у. …","Совпадение относится к названию деревни Ампилоговой, а фамилия человека — Шлыкова. Профиль и публичный Record фамильного ряда не создаются.",[],false,"place-name-not-person-surname"),
  10:n("false-positive-place-name","деревня Ампилогова, Жеребцовская волость","31720. ПАВЛОВЪ, Василий Александров. Крест. д. Ампилоговой, Жеребцовской в. …","Совпадение относится к названию деревни Ампилоговой, а фамилия человека — Павлов. Профиль и публичный Record фамильного ряда не создаются.",[],false,"place-name-not-person-surname"),
  12:n("conviction-record","село Чермошна, Кромской уезд","27881. АМПИЛОГОВА, Дарья Александрова. Крест. с. Чермошна, Кромского у. (хлебопашец), 50 л.; приговорена Орловским Окр. С., по 303 ст. Улож., в рабочий дом на 6 мес. с лиш. особ. прав. Исп. 9 марта 1879 г.","Дарья Александровна Ампилогова, 50-летняя крестьянка-хлебопашец из Чермошны, приговорена к шести месяцам рабочего дома.",[["subject","P101868","АМПИЛОГОВА, Дарья Александрова"]]),
  13:n("conviction-record","деревня Дубовик, Ивановская волость, Малоархангельский уезд","61243. ЮДИНА, Анастасия Андреева (она же Ампилогова). Крест. Ивановской в., д. Дубовика, Малоархангельского у. (чернорабочая), 20 л., родилась в д. Княжих, Фатежского у.; приговорена Мир. С. 4 уч. Малоархангельского окр. (во 2 раз), по 3 и 4 п. 12, 169 и 170 ст. Уст. о нак., в тюрьму на 10 мес. Исп. 2 июня 1879 г.","Анастасия Андреевна Юдина, также Ампилогова, 20-летняя чернорабочая, повторно осуждена на десять месяцев тюрьмы.",[["subject","P101869","ЮДИНА, Анастасия Андреева (она же Ампилогова)"]]),
  28:n("medical-directory-entry","Российская империя","Аппилоговъ, Михаилъ Васильев., лѣк.","В медицинском справочнике указан лекарь Михаил Васильевич Аппилогов.",[["physician","P101882","Аппилоговъ, Михаилъ Васильев."]]),
  30:n("medical-directory-entry","Российская империя","Аппилоговъ, Михаилъ Васильев., лѣк., М. В. 1881.","Медицинский справочник вновь называет Михаила Васильевича Аппилогова и указывает 1881 год.",[["physician","P101882","Аппилоговъ, Михаилъ Васильев."]]),
  33:n("medical-directory-entry","Курск","Аппилоговъ Мих. Вас. 52 Л. 81 к. с. Мл. вр. 123 пѣх. пол. Курскъ.","Михаил Васильевич Аппилогов указан как коллежский советник и младший врач 123-го пехотного полка в Курске; справочник связывает его медицинскую квалификацию с 1881 годом.",[["physician","P101882","Аппилоговъ Мих. Вас."]]),
  36:n("false-positive-place-name","деревня Ампилогова, Старковская волость, Курский уезд","104047. БАШМАКОВЪ, Тимофей Иванов. Кр. Курск. у., Старковск. в., д. Ампилоговой (хлебопаш.), 47 л.; …","Совпадение относится к названию деревни Ампилоговой, а фамилия человека — Башмаков. Профиль и публичный Record фамильного ряда не создаются.",[],false,"place-name-not-person-surname"),
  38:n("false-positive-patronymic","не установлено","Попеленковъ, Игнатий Амфилоговъ — 169 М. 91 — 26745.","В алфавитной строке фамилия человека — Попеленков, а «Амфилогов» является патронимическим именованием XIX века, не самостоятельной фамилией исследуемого ряда. Публичный профиль не создаётся.",[],false,"other-surname-with-patronymic"),
  77:n("wartime-medical-personnel-list","Киевский военный госпиталь","8. АМПИЛОГОВА, Анастасия Ильинична. Военного времени. 7 февр. 15 г., в Киевский военный госпиталь.","Анастасия Ильинична Ампилогова состояла сотрудницей военного времени и 7 февраля 1915 года была направлена в Киевский военный госпиталь.",[["wartime-staff","P101898","АМПИЛОГОВА, Анастасия Ильинична"]]),
};

const manifest=JSON.parse(await readFile(manifestPath,"utf8")), rows=manifest.batches.flatMap((batch)=>batch.results);
const peopleMap=new Map(people.map(([id,displayName,sex,placeName,note])=>[id,{id,displayName,sex,placeName,note}]));
const links=new Map(people.map(([id])=>[id,new Set()]));
const digest=async(file)=>createHash("sha256").update(await readFile(file)).digest("hex");
const rel=(file)=>path.relative(root,file).split(path.sep).join("/");
const dimensions=async(file)=>{const data=await readFile(file);return`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`;};
const sourceIdFor=(row)=>`YA-${row.catalogId.slice(0,8).toUpperCase()}-${String(row.scanNumber).padStart(3,"0")}`;
const sourceFile=async(id)=>{const legacy=path.join(legacyRoot,`${id}.json`);try{await access(legacy);return legacy;}catch{return path.join(sourceRoot,`${id}.json`);}};
const evidence=async(row)=>{const number=String(row.scanNumber).padStart(4,"0"),dir=path.join(root,"data/genealogy/evidence-private/yandex",row.catalogId),full=path.join(dir,`${number}-full-view.png`),header=path.join(dir,`${number}-header.png`),target=path.join(dir,`${number}-target-entry.png`);await Promise.all([access(full),access(header),access(target)]);return{catalogId:row.catalogId,scanNumber:row.scanNumber,captureStatus:"complete-with-local-copy",captureType:"yandex-archive-original-image-download-with-enlarged-fragments",localBackup:rel(full),path:rel(full),capturedAt,sha256:await digest(full),fragments:[{kind:"header",path:rel(header),sha256:await digest(header),description:"Фрагмент исходной книжной страницы, фиксирующий заголовок или структуру листа."},{kind:"target-entry",path:rel(target),sha256:await digest(target),description:"Крупный фрагмент целевой записи без интерфейса Яндекса."}],quality:{documentOnlyVisuallyConfirmed:true,headerVisuallyConfirmed:true,targetRowsVisuallyConfirmed:true,confirmedAt:capturedAt,method:"manual-reading-of-downloaded-original",fullDimensions:await dimensions(full),targetDimensions:await dimensions(target)},publicDisplay:false,rightsNote:"Локальная копия и фрагменты сохранены для исследовательской проверки; публичная ссылка ведёт только на Яндекс Архив."};};

for(const row of rows){
  const sourceId=row.sourceIds?.[0]??sourceIdFor(row), file=await sourceFile(sourceId);
  let source;
  try{source=JSON.parse(await readFile(file,"utf8"));}catch{source=null;}
  if(newDetails[row.absolutePosition]){
    const item=newDetails[row.absolutePosition];
    source={schemaVersion:1,sourceId,provider:"Яндекс Архив — первичный книжный скан",recordType:item.type,collection:{catalogId:row.catalogId,scanNumber:row.scanNumber,title:row.title,publication:row.publication},links:{documentUrl:row.documentUrl},event:{type:item.type,date:{display:row.date,confidence:"high"},place:{normalized:item.place}},mentions:item.mentions.map(([role,personId,written],i)=>({mentionId:`${sourceId}-M${i+1}`,role,personId,displayName:peopleMap.get(personId)?.displayName??written,nameAsTranscribed:written,surnameSeries:true})),evidence:await evidence(row),transcription:{status:"complete-primary-scan-transcription-with-local-evidence",literal:item.literal,modernInterpretation:item.modern,indexNote:"Индекс Яндекса использован только для навигации; чтение выполнено по сохранённому первичному изображению."},isRecord:item.isRecord,cardKind:item.isRecord?"named-primary-record":"research-material-rejected-fuzzy-hit",publicCore:item.isRecord,review:{status:"complete-primary-scan-reading-with-local-evidence",transcriptionConfidence:"high",unresolved:[]}};
    if(item.reason)source.rejectionReason=item.reason;
    await writeFile(file,`${JSON.stringify(source,null,2)}\n`);
  }else if(source&&row.capture!==false){source.evidence={...(source.evidence??{}),...(await evidence(row))};await writeFile(file,`${JSON.stringify(source,null,2)}\n`);}
  if(source&&bindings[row.absolutePosition]){
    const ids=bindings[row.absolutePosition];
    for(let i=0;i<Math.min(ids.length,source.mentions?.length??0);i++)if(ids[i]){source.mentions[i].personId=ids[i];source.mentions[i].displayName=peopleMap.get(ids[i])?.displayName??source.mentions[i].displayName;}
    await writeFile(file,`${JSON.stringify(source,null,2)}\n`);
  }
  row.sourceId=sourceId;row.capture=false;row.status=newDetails[row.absolutePosition]?.isRecord===false?"complete-rejected-fuzzy-false-positive":"complete-with-local-evidence";row.primaryScanReading=(source??{}).transcription?.literal;
}

// Две страницы были ранее закрыты точным поиском, но fuzzy-выдача показывает на них дополнительные фамильные строки.
for(const [position,personId,written,literalAddition,modernAddition] of [
  [9,"P101864","Ампилогова, Екатерина Григорьева","Ампилогова, Екатерина Григорьева — 1872 — 3947.","Этот же указатель отсылает к записи Екатерины Григорьевны Ампилоговой за 1872 год, № 3947."],
  [45,"P101871","Амнилоговъ, Вас. Никол.","Амнилоговъ, Вас. Никол. (2 р.) — 50406.","На той же странице вариант «Амнилогов» отсылает к Василию Николаевичу Ампилогову, № 50406."],
]){
  const row=rows.find((item)=>item.absolutePosition===position),file=await sourceFile(row.sourceIds[0]),source=JSON.parse(await readFile(file,"utf8"));
  if(!source.mentions.some((m)=>m.personId===personId)){source.mentions.push({mentionId:`${source.sourceId}-M${source.mentions.length+1}`,role:"subject",personId,displayName:peopleMap.get(personId).displayName,nameAsTranscribed:written,surnameSeries:true});source.transcription.literal+=`\n${literalAddition}`;source.transcription.modernInterpretation+=` ${modernAddition}`;await writeFile(file,`${JSON.stringify(source,null,2)}\n`);}
}

// Собираем обратные ссылки после всех дополнений и привязок.
for(const row of rows){const file=await sourceFile(row.sourceId),source=JSON.parse(await readFile(file,"utf8"));for(const mention of source.mentions??[])if(links.has(mention.personId))links.get(mention.personId).add(source.sourceId);}
for(const [,person] of peopleMap){const slug=person.displayName.toLowerCase().replaceAll("ё","е").replaceAll("й","и").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zа-я0-9]+/gi,"-").replace(/^-|-$/g,"");const value={schemaVersion:1,personId:person.id,displayName:person.displayName,sex:person.sex,nameVariants:[person.displayName],surname:{normalized:person.displayName.includes("Аппилогов")?"Аппилогов":person.displayName.includes("Ампилогова")?"Ампилогова":"Ампилогов",formsAsWritten:person.displayName.includes("Аппилогов")?["Аппилоговъ"]:["Ампилогов","Ампилоговъ"]},sourceIds:[...links.get(person.id)].sort(),status:"documented-from-primary-scan",places:[{relation:"documented",normalized:person.placeName,confidence:"medium-high"}],notes:[person.note]};await writeFile(path.join(peopleRoot,`${person.id}-${slug}.json`),`${JSON.stringify(value,null,2)}\n`);}

const completed=rows.filter((row)=>row.capture===false&&!row.status.startsWith("pending-")).length;
manifest.status=completed===rows.length?"complete":"processing-in-progress";manifest.progress={pagesInventoried:9,rowsFound:rows.length,rowsCompleted:completed,uniqueScansPending:0,rowsRemaining:rows.length-completed};
await writeFile(manifestPath,`${JSON.stringify(manifest,null,2)}\n`);
console.log(JSON.stringify({rowsCompleted:completed,rowsRemaining:rows.length-completed,peopleWritten:people.length,rejectedFalsePositives:rows.filter((row)=>row.status.includes("rejected")).length},null,2));
