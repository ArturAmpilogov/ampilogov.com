import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const peopleDir = path.join(root, "data/genealogy/people");
const familiesDir = path.join(root, "data/genealogy/families");
const sourcesDir = path.join(root, "data/genealogy/sources/familysearch");
const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const write = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const unique = (values) => [...new Set(values)];

const profiles = [
  ["P0657-pelageya-seliverstovna-ampilogova.json", {personId:"P0657",displayName:"Пелагея Селиверстовна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Пелагия Ампилогов","[имя неуверенно], дочь Селиверста Ампилогова"]},birthEstimate:{year:1814,basis:"1 год в записи смерти 1 января 1815 года"},death:{date:"1815-01-01",placeId:"pryvilne-kherson"},parents:["P0138"],familyIds:["F0134"],sourceIds:["FS-3QSQ-G937-QZ3R"],status:"documented-from-primary-scan",notes:["Имя Пелагея дано индексом FamilySearch; в оригинале имя читается неуверенно, отец Селиверст Ампилогов читается уверенно."]}],
  ["P0658-anastasia-seliverstovna-ampilogova.json", {personId:"P0658",displayName:"Анастасия Селиверстовна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Анастасия Селиверстова Ампилогова","Анастасия Силиверстова Ампилогов"]},parents:["P0138"],familyIds:["F0134","F0135"],sourceIds:["FS-3QS7-8937-8VYQ"],status:"documented-from-primary-scan",notes:["В брачной записи 1832 года отец назван Селиверстом Антиповичем Ампилоговым; это уточняет отчество P0138."]}],
  ["P0659-mikhail-feodotovich-shubinya.json", {personId:"P0659",displayName:"Михаил Феодотович Шубиня",sex:"male",surname:{normalized:"Шубиня",formsAsWritten:["Михаилъ Феодотовъ Шубиня"]},familyIds:["F0135"],sourceIds:["FS-3QS7-8937-8VYQ"],status:"documented-from-primary-scan",notes:["Жених Анастасии Селиверстовны Ампилоговой в Привольном 12 ноября 1832 года."]}],
  ["P0660-fedor-antipovich-ampilogov-pryvilne.json", {personId:"P0660",displayName:"Фёдор Антипович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Феодоръ Ампилоговъ","Феодор Антипов Ампилогов"]},birthEstimate:{year:1787,basis:"61 год в записи смерти 16 апреля 1848 года"},death:{date:"1848-04-16",placeId:"pryvilne-kherson"},familyIds:["F0136","F0137"],sourceIds:["FS-3QHV-GQ97-29VY","FS-3QHK-MQ97-29KG","FS-3QS7-L937-8WL","FS-3QHK-9Q97-L99F-Y"],status:"documented-probable-identity",notes:["Отчество и возраст даны в записи смерти 1848 года. Упоминания отца Александра, Марфы и Матфея в 1826–1830 годах объединены по имени, фамилии, месту и непрерывной хронологии.","Не объединён с Фёдором P0645, известным только как отец Капитона в 1819 году: без отчества возможен второй одноимённый двор."]}],
  ["P0661-aleksandr-fedorovich-ampilogov-pryvilne.json", {personId:"P0661",displayName:"Александр Фёдорович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Александр, сын Феодора Ампилогова"]},birthEstimate:{year:1824,basis:"2 года в записи смерти 3 января 1826 года"},death:{date:"1826-01-03",placeId:"pryvilne-kherson"},parents:["P0660"],familyIds:["F0136"],sourceIds:["FS-3QHV-GQ97-29VY"],status:"documented-from-primary-scan",notes:["Умер от оспы; мать в записи не названа."]}],
  ["P0662-marfa-fedorovna-ampilogova-pryvilne.json", {personId:"P0662",displayName:"Марфа Фёдоровна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Марфа Феодорова Ампилогова","Марфа Ампилогов"]},parents:["P0660"],familyIds:["F0136","F0138"],sourceIds:["FS-3QHK-MQ97-29KG"],status:"documented-from-primary-scan",notes:["Дочь Фёдора Ампилогова; 28 сентября 1830 года вышла замуж за Иосифа Гурова."]}],
  ["P0663-iosif-gurov.json", {personId:"P0663",displayName:"Иосиф Гуров",sex:"male",surname:{normalized:"Гуров",formsAsWritten:["Иосифъ Гуровъ"]},familyIds:["F0138"],sourceIds:["FS-3QHK-MQ97-29KG"],status:"documented-from-primary-scan",notes:["Жених Марфы Фёдоровны Ампилоговой в Привольном 28 сентября 1830 года."]}],
  ["P0664-matfey-fedorovich-ampilogov-pryvilne.json", {personId:"P0664",displayName:"Матфей Фёдорович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Матфий","Матфей Ампилогов"]},birth:{date:"1830-08-10",placeId:"pryvilne-kherson"},parents:["P0660","P0665"],familyIds:["F0137"],sourceIds:["FS-3QS7-L937-8WL"],status:"documented-from-primary-scan"}],
  ["P0665-efimia-ampilogova-pryvilne.json", {personId:"P0665",displayName:"Ефимия Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Ефимия"]},familyIds:["F0137"],sourceIds:["FS-3QS7-L937-8WL"],status:"documented-from-primary-scan",notes:["Жена Фёдора Ампилогова и мать Матфея; отчество не сообщено."]}],
  ["P0666-zakhariy-ulyanovich-ampilogov.json", {personId:"P0666",displayName:"Захарий Ульянович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Захария Ульянова Ампилогова","Захар Улианов Ампилогов"]},birthEstimate:{year:1809,basis:"25 лет в записи смерти 2 января 1834 года"},death:{date:"1834-01-02",placeId:"pryvilne-kherson"},familyIds:["F0139"],sourceIds:["FS-3QS7-L937-8XMX","FS-3QHK-MQ97-29RK","FS-3QHK-MQ97-2SNJ"],status:"documented-from-primary-scans",notes:["В 1834 году назван неслужащим инвалидом 2-го поселенного эскадрона Бугского уланского полка.","Параллельный индекс записи рождения дочери ошибочно называет его Яковом; оригинал и другая карточка подтверждают Захария Ульяновича."]}],
  ["P0667-matrona-egorovna-ampilogova.json", {personId:"P0667",displayName:"Матрёна Егоровна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Матроны Егоровой","Матрона Егорова"]},familyIds:["F0139"],sourceIds:["FS-3QS7-L937-8XMX","FS-3QHK-MQ97-29RK"],status:"documented-from-primary-scans",notes:["Жена Захария Ульяновича и мать Ирины; фамилия по мужу добавлена по семейной связи."]}],
  ["P0668-irina-zakharyevna-ampilogova.json", {personId:"P0668",displayName:"Ирина Захарьевна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Ирина Ампилогов","Ирина Антилогов"]},birth:{date:"1831-05-03",placeId:"pryvilne-kherson"},parents:["P0666","P0667"],familyIds:["F0139"],sourceIds:["FS-3QS7-L937-8XMX","FS-3QHK-MQ97-29RK"],status:"documented-from-primary-scans",notes:["Две индексные карточки одного акта расходятся в имени отца; оригинал подтверждает Захария Ульяновича."]}],
  ["P0669-gavriil-ulyanovich-ampilogov.json", {personId:"P0669",displayName:"Гавриил Ульянович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Гавріилъ Ампилоговъ","Гавриила Ульянова Ампилогова","Гавріилъ Демьяновъ Ампилоговъ"]},familyIds:["F0140"],sourceIds:["FS-3QHV-GQ97-29V5","FS-3QSQ-G937-898Q-K","FS-3QHK-MQ97-2SVN"],status:"documented-probable-identity",notes:["Оригинал записи 1835 года подтверждает отчество Ульянович; форма Демьянович — ошибка параллельного индекса.","Запись смерти Иулиты 1826 года объединена с этой семьёй по отцу Гавриилу и матери Параскеве из индекса, но имя матери в самом оригинале смерти не видно."]}],
  ["P0670-praskovya-petrovna-ampilogova.json", {personId:"P0670",displayName:"Прасковья Петровна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Параскевы Петровой","Параскева Петрова"]},familyIds:["F0140"],sourceIds:["FS-3QHV-GQ97-29V5","FS-3QSQ-G937-898Q-K","FS-3QHK-MQ97-2SVN"],status:"documented-probable-identity",notes:["Мать Соломонии по оригиналу 1835 года; в записи смерти Иулиты 1826 года имя Параскева дано только индексом."]}],
  ["P0671-iulita-gavriilovna-ampilogova.json", {personId:"P0671",displayName:"Иулита Гаврииловна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Іулита","Иулита Ампилогов"]},birthEstimate:{year:1826,basis:"2 недели в записи смерти 12 июля 1826 года"},death:{date:"1826-07-12",placeId:"pryvilne-kherson"},parents:["P0669","P0670"],familyIds:["F0140"],sourceIds:["FS-3QHV-GQ97-29V5"],status:"documented-from-primary-scan",notes:["Умерла от горячки; связь с матерью Параскевой основана на индексе, не на видимом тексте оригинала."]}],
  ["P0672-solomonia-gavriilovna-ampilogova.json", {personId:"P0672",displayName:"Соломония Гаврииловна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Соломонія","Соломония Ампилогов"]},birth:{date:"1835-08-01",placeId:"pryvilne-kherson"},parents:["P0669","P0670"],familyIds:["F0140"],sourceIds:["FS-3QSQ-G937-898Q-K","FS-3QHK-MQ97-2SVN"],status:"documented-from-primary-scans",notes:["Две параллельные карточки одного акта; оригинал подтверждает отчество отца Ульянович, а не Демьянович."]}],
  ["P0673-gavriil-iulianovich-ampilogov.json", {personId:"P0673",displayName:"Гавриил Иулианович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Гавріилъ Іульяновъ Ампилоговъ","Гавріилъ Іуліановъ Ампилоговъ"]},familyIds:["F0141"],sourceIds:["FS-3QHV-GQ97-2SXZ","FS-3QS7-8937-8PKD"],status:"documented-from-primary-scans",notes:["Сохранён отдельно от Гавриила Ульяновича P0669: различаются отчества и имена жён."]}],
  ["P0674-nadezhda-petrovna-ampilogova.json", {personId:"P0674",displayName:"Надежда Петровна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Надежда Петрова"]},familyIds:["F0141"],sourceIds:["FS-3QHV-GQ97-2SXZ","FS-3QS7-8937-8PKD"],status:"documented-from-primary-scans"}],
  ["P0675-ignatiy-gavriilovich-ampilogov.json", {personId:"P0675",displayName:"Игнатий Гавриилович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Игнатій","Игнатий Ампилогов"]},birth:{date:"1833-01-01",placeId:"pryvilne-kherson"},parents:["P0673","P0674"],familyIds:["F0141"],sourceIds:["FS-3QHV-GQ97-2SXZ","FS-3QS7-8937-8PKD"],status:"documented-from-primary-scans"}],
  ["P0676-ioann-ampilogov-pryvilne.json", {personId:"P0676",displayName:"Иоанн Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Иоанн Ампилогов","Иванъ Ампилоговъ"]},familyIds:["F0142"],sourceIds:["FS-3QHV-GQ97-29VT","FS-3QHK-MQ97-29KX","FS-3QS7-8937-Z9ZZ-N-PAR"],status:"documented-probable-identity",notes:["Брак 1826 года и записи дочерей 1828–1829 годов объединены по имени, фамилии, месту и имени супруги Парасковьи; отчество не установлено."]}],
  ["P0677-paraskovya-koroteyeva.json", {personId:"P0677",displayName:"Парасковья Коротеева",sex:"female",surname:{normalized:"Коротеева",formsAsWritten:["Парасковья Коротеев","Парасковья [Коротеева; окончание фамилии читается неуверенно]"]},familyIds:["F0142"],sourceIds:["FS-3QHV-GQ97-29VT","FS-3QS7-8937-Z9ZZ-N-PAR"],status:"documented-probable-identity",notes:["Невеста Иоанна Ампилогова в 1826 году; с Парасковьей, матерью его дочери в 1829 году, объединена с высокой вероятностью."]}],
  ["P0678-maria-ivanovna-ampilogova-1828.json", {personId:"P0678",displayName:"Мария Ивановна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Мария, дочь Ивана Ампилогова"]},birthEstimate:{year:1828,basis:"1 месяц в записи смерти 14 октября 1828 года"},death:{date:"1828-10-14",placeId:"pryvilne-kherson"},parents:["P0676"],familyIds:["F0142"],sourceIds:["FS-3QHK-MQ97-29KX"],status:"documented-from-primary-scan",notes:["Мать в записи смерти не названа, поэтому родство с Парасковьей Коротеевой остаётся семейной гипотезой и в parents не добавлено."]}],
  ["P0679-paraskeva-ivanovna-ampilogova-1829.json", {personId:"P0679",displayName:"Параскева Ивановна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Параскева Иванова Ампилогова","Параскева Ампилогов"]},birth:{date:"1829-10-29",placeId:"pryvilne-kherson"},parents:["P0676","P0677"],familyIds:["F0142"],sourceIds:["FS-3QS7-8937-Z9ZZ-N-PAR"],status:"documented-from-primary-scan"}],
  ["P0680-mikhail-koroteyev.json", {personId:"P0680",displayName:"Михаил Коротеев",sex:"male",surname:{normalized:"Коротеев",formsAsWritten:["Михаил Коротеев"]},sourceIds:["FS-3QHV-GQ97-29VT"],status:"documented-role-uncertain",notes:["Упомянут в брачной записи Иоанна Ампилогова и Парасковьи Коротеевой; вероятно родственник или поручитель, но точная роль требует чтения оригинала."]}],
  ["P0681-kondrat-fedorovich-ampilogov.json", {personId:"P0681",displayName:"Кондрат Фёдорович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Кондрат Федоров Ампилогов"]},birthEstimate:{year:1829,basis:"19 лет в брачной записи 30 сентября 1848 года"},familyIds:["F0143"],sourceIds:["FS-3QHV-GQ97-L9MG-X"],status:"documented-from-primary-scan"}],
  ["P0682-maria-ivanovna-wife-kondrat-ampilogov.json", {personId:"P0682",displayName:"Мария Ивановна",sex:"female",familyIds:["F0143"],sourceIds:["FS-3QHV-GQ97-L9MG-X"],status:"documented-from-primary-scan",notes:["Невеста Кондрата Фёдоровича Ампилогова; фамилия в доступной записи не установлена."]}],
  ["P0683-mikhail-antonovich-anpilogov.json", {personId:"P0683",displayName:"Михаил Антонович Анпилогов",sex:"male",surname:{normalized:"Анпилогов",formsAsWritten:["Михаилъ Антоновъ Анпилоговъ"]},familyIds:["F0144"],sourceIds:["FS-3QS7-8937-DJ8W"],status:"documented-from-primary-scan",notes:["Сохранён отдельно от Михаила P0647, известного без отчества в 1819 году."]}],
  ["P0684-ksenia-wife-mikhail-anpilogov.json", {personId:"P0684",displayName:"Ксения [фамилия неуверенно]",sex:"female",familyIds:["F0144"],sourceIds:["FS-3QS7-8937-DJ8W"],status:"documented-with-name-uncertainty"}],
  ["P0685-anna-pavlovna-antilogova-1824.json", {personId:"P0685",displayName:"Анна Павловна Антилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Анна Антилогов"]},birth:{date:"1824-09-08",placeId:"pryvilne-kherson"},parents:["P0117","P0200"],familyIds:["F0024"],sourceIds:["FS-3Q9M-CSK4-PWX7-T"],status:"documented-probable-identity",notes:["Родители Павел и Анна отождествлены с документированной парой Павла Семёновича и Анны Петровны, венчавшейся в Привольном в 1823 году."]}],
  ["P0686-prokofiy-nikolaevich-podubny.json", {personId:"P0686",displayName:"Прокофий Николаевич Подубный",sex:"male",surname:{normalized:"Подубный",formsAsWritten:["Прокофий Николаевъ Подубный"]},familyIds:["F0145"],sourceIds:["FS-3QHK-9Q97-2SVG"],status:"documented-from-primary-scan"}],
  ["P0687-anna-mikhailovna-ampilogova.json", {personId:"P0687",displayName:"Анна Михайловна Ампилогова",sex:"female",surname:{normalized:"Ампилогов",formsAsWritten:["Анна Михаилова Ампилогова","Анна Михаилова Ампилогов"]},parents:["P0688"],familyIds:["F0145","F0146"],sourceIds:["FS-3QHK-9Q97-2SVG"],status:"documented-from-primary-scan"}],
  ["P0688-mikhail-antipovich-ampilogov.json", {personId:"P0688",displayName:"Михаил Антипович Ампилогов",sex:"male",surname:{normalized:"Ампилогов",formsAsWritten:["Михаилъ Антиповъ Ампилоговъ"]},familyIds:["F0146"],sourceIds:["FS-3QHK-9Q97-2SVG"],status:"documented-from-primary-scan",notes:["Назван отцом невесты Анны в 1834 году; не объединён с одноимёнными Михаилами без отчества."]}]
];

const families = [
  ["F0134-seliverst-antipovich-ampilogov-daughters.json", {familyId:"F0134",label:"Селиверст Антипович Ампилогов и дочери Пелагея и Анастасия",spouses:["P0138"],children:["P0657","P0658"],sourceIds:["FS-3QSQ-G937-QZ3R","FS-3QS7-8937-8VYQ"],status:"documented-father-child",notes:["Матери дочерей в этих актах не названы; они не приписаны автоматически Гликерии из позднейших записей."]}],
  ["F0135-mikhail-shubinya-and-anastasia-ampilogova.json", {familyId:"F0135",label:"Михаил Феодотович Шубиня и Анастасия Селиверстовна Ампилогова",spouses:["P0659","P0658"],children:[],marriage:{date:"1832-11-12",placeId:"pryvilne-kherson"},sourceIds:["FS-3QS7-8937-8VYQ"],status:"documented-marriage"}],
  ["F0136-fedor-ampilogov-children-aleksandr-marfa.json", {familyId:"F0136",label:"Фёдор Ампилогов и дети Александр и Марфа",spouses:["P0660"],children:["P0661","P0662"],sourceIds:["FS-3QHV-GQ97-29VY","FS-3QHK-MQ97-29KG"],status:"documented-father-child",notes:["Матери Александра и Марфы в этих актах не названы."]}],
  ["F0137-fedor-and-efimia-ampilogovy.json", {familyId:"F0137",label:"Фёдор и Ефимия Ампилоговы",spouses:["P0660","P0665"],children:["P0664"],sourceIds:["FS-3QS7-L937-8WL"],status:"documented-family"}],
  ["F0138-iosif-gurov-and-marfa-ampilogova.json", {familyId:"F0138",label:"Иосиф Гуров и Марфа Фёдоровна Ампилогова",spouses:["P0663","P0662"],children:[],marriage:{date:"1830-09-28",placeId:"pryvilne-kherson"},sourceIds:["FS-3QHK-MQ97-29KG"],status:"documented-marriage"}],
  ["F0139-zakhariy-and-matrona-ampilogovy.json", {familyId:"F0139",label:"Захарий Ульянович и Матрёна Егоровна Ампилоговы",spouses:["P0666","P0667"],children:["P0668"],sourceIds:["FS-3QS7-L937-8XMX","FS-3QHK-MQ97-29RK","FS-3QHK-MQ97-2SNJ"],status:"documented-family"}],
  ["F0140-gavriil-and-praskovya-ampilogovy.json", {familyId:"F0140",label:"Гавриил Ульянович и Прасковья Петровна Ампилоговы",spouses:["P0669","P0670"],children:["P0671","P0672"],sourceIds:["FS-3QHV-GQ97-29V5","FS-3QSQ-G937-898Q-K","FS-3QHK-MQ97-2SVN"],status:"documented-probable-family"}],
  ["F0141-gavriil-iulianovich-and-nadezhda-ampilogovy.json", {familyId:"F0141",label:"Гавриил Иулианович и Надежда Петровна Ампилоговы",spouses:["P0673","P0674"],children:["P0675"],sourceIds:["FS-3QHV-GQ97-2SXZ","FS-3QS7-8937-8PKD"],status:"documented-family"}],
  ["F0142-ioann-ampilogov-and-paraskovya-koroteyeva.json", {familyId:"F0142",label:"Иоанн Ампилогов и Парасковья Коротеева",spouses:["P0676","P0677"],children:["P0678","P0679"],marriage:{date:"1826-02-10",placeId:"pryvilne-kherson"},sourceIds:["FS-3QHV-GQ97-29VT","FS-3QHK-MQ97-29KX","FS-3QS7-8937-Z9ZZ-N-PAR"],status:"documented-probable-family",notes:["Мария связана с отцом Иваном напрямую; её мать в записи не названа."]}],
  ["F0143-kondrat-ampilogov-and-maria-ivanovna.json", {familyId:"F0143",label:"Кондрат Фёдорович Ампилогов и Мария Ивановна",spouses:["P0681","P0682"],children:[],marriage:{date:"1848-09-30",placeId:"pryvilne-kherson"},sourceIds:["FS-3QHV-GQ97-L9MG-X"],status:"documented-marriage"}],
  ["F0144-mikhail-anpilogov-and-ksenia.json", {familyId:"F0144",label:"Михаил Антонович Анпилогов и Ксения",spouses:["P0683","P0684"],children:[],marriage:{date:"1837-02-16",placeId:"pryvilne-kherson"},sourceIds:["FS-3QS7-8937-DJ8W"],status:"documented-marriage"}],
  ["F0145-prokofiy-podubny-and-anna-ampilogova.json", {familyId:"F0145",label:"Прокофий Николаевич Подубный и Анна Михайловна Ампилогова",spouses:["P0686","P0687"],children:[],marriage:{date:"1834-10-25",placeId:"pryvilne-kherson"},sourceIds:["FS-3QHK-9Q97-2SVG"],status:"documented-marriage"}],
  ["F0146-mikhail-antipovich-ampilogov-daughter-anna.json", {familyId:"F0146",label:"Михаил Антипович Ампилогов и дочь Анна",spouses:["P0688"],children:["P0687"],sourceIds:["FS-3QHK-9Q97-2SVG"],status:"documented-father-child"}]
];

for (const [file, profile] of profiles) write(path.join(peopleDir, file), {schemaVersion:1, ...profile});
for (const [file, family] of families) write(path.join(familiesDir, file), {schemaVersion:1, ...family});

const mentionLinks = {
  "3Q9M-CSK4-PWPH-W.json": {"FS-3Q9M-CSK4-PWPH-W-M1":"P0214"},
  "3Q9M-CSK4-PWX7-T.json": {"FS-3Q9M-CSK4-PWX7-T-M1":"P0685","FS-3Q9M-CSK4-PWX7-T-M2":"P0117","FS-3Q9M-CSK4-PWX7-T-M3":"P0200"},
  "3QHK-9Q97-2SVG.json": {"FS-3QHK-9Q97-2SVG-M1":"P0686","FS-3QHK-9Q97-2SVG-M2":"P0687","FS-3QHK-9Q97-2SVG-M3":"P0688"},
  "3QHK-9Q97-L99F-Y.json": {"FS-3QHK-9Q97-L99F-Y-M1":"P0660"},
  "3QHK-MQ97-29KG.json": {"FS-3QHK-MQ97-29KG-M1":"P0663","FS-3QHK-MQ97-29KG-M2":"P0662","FS-3QHK-MQ97-29KG-M3":"P0660"},
  "3QHK-MQ97-29KX.json": {"FS-3QHK-MQ97-29KX-M1":"P0678","FS-3QHK-MQ97-29KX-M2":"P0676"},
  "3QHK-MQ97-29RK.json": {"FS-3QHK-MQ97-29RK-M1":"P0668","FS-3QHK-MQ97-29RK-M2":"P0666","FS-3QHK-MQ97-29RK-M3":"P0667"},
  "3QHK-MQ97-2SNJ.json": {"FS-3QHK-MQ97-2SNJ-M1":"P0666"},
  "3QHK-MQ97-2SVN.json": {"FS-3QHK-MQ97-2SVN-M1":"P0672","FS-3QHK-MQ97-2SVN-M2":"P0669","FS-3QHK-MQ97-2SVN-M3":"P0670"},
  "3QHV-GQ97-29V5.json": {"FS-3QHV-GQ97-29V5-M1":"P0671","FS-3QHV-GQ97-29V5-M2":"P0669","FS-3QHV-GQ97-29V5-M3":"P0670"},
  "3QHV-GQ97-29VT.json": {"FS-3QHV-GQ97-29VT-M1":"P0676","FS-3QHV-GQ97-29VT-M2":"P0677","FS-3QHV-GQ97-29VT-M3":"P0680"},
  "3QHV-GQ97-29VY.json": {"FS-3QHV-GQ97-29VY-M1":"P0661","FS-3QHV-GQ97-29VY-M2":"P0660"},
  "3QHV-GQ97-2SXZ.json": {"FS-3QHV-GQ97-2SXZ-M1":"P0675","FS-3QHV-GQ97-2SXZ-M2":"P0673","FS-3QHV-GQ97-2SXZ-M3":"P0674"},
  "3QHV-GQ97-L9MG-X.json": {"FS-3QHV-GQ97-L9MG-X-M1":"P0681","FS-3QHV-GQ97-L9MG-X-M2":"P0682"},
  "3QS7-8937-8PKD.json": {"FS-3QS7-8937-8PKD-M1":"P0675","FS-3QS7-8937-8PKD-M2":"P0673","FS-3QS7-8937-8PKD-M3":"P0674"},
  "3QS7-8937-8VYQ.json": {"FS-3QS7-8937-8VYQ-M1":"P0659","FS-3QS7-8937-8VYQ-M2":"P0658","FS-3QS7-8937-8VYQ-M3":"P0138"},
  "3QS7-8937-DJ8W.json": {"FS-3QS7-8937-DJ8W-M1":"P0683","FS-3QS7-8937-DJ8W-M2":"P0684"},
  "3QS7-8937-Z9ZZ-N-PAR.json": {"FS-3QS7-8937-Z9ZZ-N-PAR-M1":"P0679","FS-3QS7-8937-Z9ZZ-N-PAR-M2":"P0676","FS-3QS7-8937-Z9ZZ-N-PAR-M3":"P0677"},
  "3QS7-L937-8WL.json": {"FS-3QS7-L937-8WL-M1":"P0664","FS-3QS7-L937-8WL-M2":"P0660","FS-3QS7-L937-8WL-M3":"P0665"},
  "3QS7-L937-8XMX.json": {"FS-3QS7-L937-8XMX-M1":"P0668","FS-3QS7-L937-8XMX-M2":"P0666","FS-3QS7-L937-8XMX-M3":"P0667"},
  "3QSQ-G937-898Q-K.json": {"FS-3QSQ-G937-898Q-K-M1":"P0672","FS-3QSQ-G937-898Q-K-M2":"P0669","FS-3QSQ-G937-898Q-K-M3":"P0670"},
  "3QSQ-G937-QZ3R.json": {"FS-3QSQ-G937-QZ3R-M1":"P0657"}
};

for (const [file, links] of Object.entries(mentionLinks)) {
  const full = path.join(sourcesDir, file);
  const source = read(full);
  source.mentions = (source.mentions || []).map((mention) => links[mention.mentionId] ? {...mention, personId:links[mention.mentionId]} : mention);
  source.primaryPersonId ||= Object.values(links)[0];
  if (source.event?.place?.placeId === "privolnoe-mykolaiv") source.event.place.placeId = "pryvilne-kherson";
  if (!source.event?.place?.placeId && /Привольн/i.test(JSON.stringify(source.event?.place || {}))) source.event.place.placeId = "pryvilne-kherson";
  write(full, source);
}

const amendPerson = (id, changes) => {
  const file = fs.readdirSync(peopleDir).find((name) => name.startsWith(`${id}-`));
  const full = path.join(peopleDir, file);
  const person = read(full);
  for (const [key, values] of Object.entries(changes)) person[key] = Array.isArray(values) ? unique([...(person[key] || []), ...values]) : values;
  write(full, person);
};
amendPerson("P0138", {displayName:"Селиверст Антипович Ампилогов", familyIds:["F0134"], sourceIds:["FS-3QS7-8937-8VYQ"]});
amendPerson("P0214", {sourceIds:["FS-3Q9M-CSK4-PWPH-W"]});
amendPerson("P0117", {sourceIds:["FS-3Q9M-CSK4-PWX7-T"]});
amendPerson("P0200", {sourceIds:["FS-3Q9M-CSK4-PWX7-T"]});

const family0024File = path.join(familiesDir, "F0024-pavel-anna-family.json");
const family0024 = read(family0024File);
family0024.children = unique([...family0024.children, "P0685"]);
family0024.sourceIds = unique([...family0024.sourceIds, "FS-3Q9M-CSK4-PWX7-T"]);
write(family0024File, family0024);

write(path.join(peopleDir, "P0689-savva-kondratovich-ampilogov.json"), {
  schemaVersion: 1,
  personId: "P0689",
  displayName: "Савва Кондратович Ампилогов",
  sex: "male",
  surname: {normalized:"Ампилогов", formsAsWritten:["Савва, сын Кондрата Федорова Ампилогова", "Савва Ампилогов"]},
  birthEstimate: {year:1852, basis:"5 лет в записи смерти 22 августа 1857 года"},
  death: {date:"1857-08-22", placeId:"pryvilne-kherson"},
  parents: ["P0681"],
  familyIds: ["F0147"],
  sourceIds: ["FS-3QHK-SQ97-RN9S"],
  status: "documented-from-primary-scan",
  notes: ["Умер от оспы; мать в записи не названа и не приписана автоматически Марии Ивановне."]
});
write(path.join(familiesDir, "F0147-kondrat-ampilogov-son-savva.json"), {
  schemaVersion: 1,
  familyId: "F0147",
  label: "Кондрат Фёдорович Ампилогов и сын Савва",
  spouses: ["P0681"],
  children: ["P0689"],
  sourceIds: ["FS-3QHK-SQ97-RN9S"],
  status: "documented-father-child",
  notes: ["Мать Саввы в записи смерти 1857 года не названа."]
});
amendPerson("P0681", {
  death: {date:"1893-02-28", placeId:"pryvilne-kherson"},
  familyIds: ["F0147"],
  sourceIds: ["FS-3QHK-SQ97-RN9S", "FS-3Q9M-CS9J-H7XJ-S"],
  status: "documented-probable-identity",
  notes: [
    "Брачная запись 1848 года и запись о сыне Савве 1857 года дают точное полное имя и одно место, поэтому связаны с высокой уверенностью.",
    "Смерть одноимённого 70-летнего вдовца в Привольном в 1893 году отнесена к тому же человеку со средней уверенностью: полное имя и место совпадают, но возраст расходится примерно на шесть лет с возрастом жениха 1848 года."
  ]
});

for (const [file, links, primaryPersonId] of [
  ["3QHK-SQ97-RN9S.json", {"FS-3QHK-SQ97-RN9S-M1":"P0689", "FS-3QHK-SQ97-RN9S-M2":"P0681"}, "P0689"],
  ["3Q9M-CS9J-H7XJ-S.json", {"FS-3Q9M-CS9J-H7XJ-S-M1":"P0681"}, "P0681"]
]) {
  const full = path.join(sourcesDir, file);
  const source = read(full);
  source.mentions = source.mentions.map((mention) => links[mention.mentionId] ? {...mention, personId:links[mention.mentionId]} : mention);
  source.primaryPersonId = primaryPersonId;
  write(full, source);
}

console.log(`Created ${profiles.length + 1} profiles and ${families.length + 1} families; linked ${Object.keys(mentionLinks).length + 2} source files.`);
