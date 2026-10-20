import type { MentionProfileGap } from "@/lib/genealogy";
import { defineCopy } from "@/i18n/copy";

type RecordPageCopy = {
  meta: {
    legacyTitle: string;
    legacyDescription: string;
    notFound: string;
    description: (date: string, place: string) => string;
  };
  back: string;
  factsLabel: string;
  textsLabel: string;
  literalLabel: string;
  literalTitle: string;
  indexOnlyTitle: string;
  noTextTitle: string;
  indexOnlyText: string;
  noTextText: string;
  modernLabel: string;
  modernTitlePeople: string;
  modernTitleDocument: string;
  namesHeading: (people: number, explanations: number) => string;
  establishedHeading: string;
  peopleLede: string;
  documentLede: string;
  thesisEyebrow: string;
  thesisTitle: string;
  thesisLede: string;
  nameIndexLabel: string;
  nameIndexTitle: string;
  guideEyebrow: string;
  guideTitle: string;
  guideLede: string;
  guidePersonLink: string;
  guideRecordLink: string;
  dossierLabel: string;
  dossierEyebrow: string;
  dossierTitle: string;
  dossierLede: string;
  parallelHypothesis: string;
  overviewLabel: string;
  overviewKicker: (index: number) => string;
  overviewConclusionLabel: string;
  overviewConclusionTitle: string;
  overviewConclusionText: string;
  eponymKicker: string;
  nameForms: string;
  noListTitle: string;
  noListText: string;
  meaningHeading: string;
  meaningLede: string;
  workingSummary: string;
  extractedLabel: string;
  extractedTitle: string;
  contextLabel: string;
  contextTitle: string;
  geographyLabel: string;
  geographyTitle: string;
  confidencePrefix: string;
  confidence: Record<string, string>;
  archivalCopySuffix: string;
  fullSheet: string;
  fullSheetCaption: string;
  sourceLabel: string;
  collection: string;
  repository: string;
  repositoryLocation: string;
  imageReference: string;
  date: string;
  place: string;
  repositoryLink: string;
  copiesTitle: string;
  copiesText: string;
  originalLink: string;
  indexLink: string;
  noScan: string;
  restricted: string;
  peopleLabel: string;
  peopleTitle: string;
  openPerson: string;
  noProfileBeforeCheck: string;
  possibleMatch: string;
  researchObject: string;
  profileGap: Record<MentionProfileGap, string>;
  noPersonCard: string;
  migrationsLabel: string;
  migrationsTitle: string;
  migrationConfidence: string;
};

export const recordPageCopy = defineCopy<RecordPageCopy>({
  meta: {
    legacyTitle: "Смотренный список 1626 года",
    legacyDescription: "Шесть самостоятельных записей РГАДА, ф. 210, оп. 12, д. 13.",
    notFound: "Запись не найдена",
    description: (date, place) => `${date}, ${place}. Архивная запись, расшифровка и связанные люди.`,
  },
  back: "← Все записи",
  factsLabel: "Ключевые факты и расчёты",
  textsLabel: "Тексты записи",
  literalLabel: "Как в документе",
  literalTitle: "Буквальная расшифровка",
  indexOnlyTitle: "Это сводная карточка именного индекса",
  noTextTitle: "Полного текста пока нет",
  indexOnlyText: "Индексные события, имена, даты и ссылки уже собраны ниже. Буквальные тексты оригинальных актов хранятся в отдельных карточках по мере проверки сканов.",
  noTextText: "Запись остаётся в очереди. Краткое описание не считается расшифровкой.",
  modernLabel: "Современное чтение",
  modernTitlePeople: "Имена, биографии и смысл",
  modernTitleDocument: "Смысл документа",
  namesHeading: (people, explanations) => `Имена: ${people} · пояснений: ${explanations}`,
  establishedHeading: "Что именно установлено",
  peopleLede: "Здесь разобрано не только чтение имён. Для каждого человека показаны его роль, варианты написания, родственные и владельческие связи, хронология, география, сила доказательства и точная граница между фактом и гипотезой.",
  documentLede: "Это общий документ или архивная зацепка без доступного поимённого списка. Ниже показан установленный исторический контекст; персональные карточки появятся только после обнаружения фамилии в оригинале или надёжной расшифровке.",
  thesisEyebrow: "Развёрнутый ответ",
  thesisTitle: "Имя, человек и смысл названия — по слоям доказательства",
  thesisLede: "Здесь краткий вывод отделён от объяснения. Каждый блок показывает не только возможное толкование, но и документальное основание, конкурирующую версию и предел, за которым начиналась бы недоказанная биография.",
  nameIndexLabel: "Указатель имён в разборе",
  nameIndexTitle: "Перейти к человеку",
  guideEyebrow: "Кто есть кто — без смешения владельцев, кандидатов и аналогий",
  guideTitle: "Главные имена, их состав и значение для поиска",
  guideLede: "Статус под именем показывает силу вывода. «Кандидат» означает направление поиска, а не установленного основателя; «параллель» объясняет эпоху и способ именования, но не переносит чужого человека в Тверской уезд.",
  guidePersonLink: "Профиль человека →",
  guideRecordLink: "Отдельный Record →",
  dossierLabel: "Подробный вывод об имени Онфилог и названии Онфилогово",
  dossierEyebrow: "Имя, топоним и найденный человек",
  dossierTitle: "Что уже можно рассказать об Онфилоге",
  dossierLede: "Ниже не словарная справка, а цепочка доказательства: что сообщает само название, каким могло быть крестильное имя, кто найден в документах нужного поколения и где заканчивается установленный факт.",
  parallelHypothesis: "Параллельная владельческая гипотеза",
  overviewLabel: "Что произошло с владением после 1634/1635 года",
  overviewKicker: (index) => `${index} · новый документ XVII века`,
  overviewConclusionLabel: "Вывод из трёх статей",
  overviewConclusionTitle: "Бывшее владение Стефаниды распалось",
  overviewConclusionText: "Анфилогово оказалось у Старкова; Никольское Свечино, Садыково и Ишково — у Булбина; Воронино и Попово — у Юрлова. Все они уже названы пустошами. Это подтверждает продолжение истории именно нашего селения, но ни одного из трёх позднейших держателей нельзя называть основателем.",
  eponymKicker: "Главный человек этой находки",
  nameForms: "Формы имени:",
  noListTitle: "Поимённого списка в доступной части источника нет",
  noListText: "Здесь собраны содержание приказа или ведомости, обстоятельства переселения, маршрут, даты, архивные шифры и направление дальнейшего поиска фамилии.",
  meaningHeading: "Смысл: что эта запись добавляет к истории семьи",
  meaningLede: "Ниже — связное объяснение самого источника: какое событие он фиксирует, кого называет, с какими местами и родственниками связывает и что именно добавляет к истории семьи или её переселения.",
  workingSummary: "Рабочее описание — не расшифровка",
  extractedLabel: "Все данные строки",
  extractedTitle: "Что извлечено из документа",
  contextLabel: "За пределами одной строки",
  contextTitle: "Исторический и исследовательский контекст",
  geographyLabel: "Географические теги",
  geographyTitle: "Все места, связанные с записью",
  confidencePrefix: "уверенность: ",
  confidence: { high: "высокая", medium: "средняя", low: "низкая" },
  archivalCopySuffix: " · архивная копия",
  fullSheet: "Полный лист",
  fullSheetCaption: "Полный лист · архивная копия",
  sourceLabel: "Источник и оригинал",
  collection: "Коллекция",
  repository: "Хранится",
  repositoryLocation: "Место архива",
  imageReference: "Позиция",
  date: "Дата",
  place: "Место события",
  repositoryLink: "Архив-хранитель ↗",
  copiesTitle: "Экземпляры этой записи",
  copiesText: "Это одно событие, подтверждённое несколькими архивными копиями или индексами.",
  originalLink: "Оригинал ↗",
  indexLink: "Индекс ↗",
  noScan: "Скан исходной строки пока не сохранён. ",
  restricted: "Архивная копия сохранена для внутренней проверки, но не публикуется без явно подтверждённого права на повторный показ. Пожалуйста, используйте оригинальный источник. ",
  peopleLabel: "Связи",
  peopleTitle: "Упомянутые люди",
  openPerson: "Открыть человека →",
  noProfileBeforeCheck: "Отдельный профиль не создан до проверки оригинала. ",
  possibleMatch: "Возможное совпадение: ",
  researchObject: "Исследовательский объект, а не отдельный человек: персональный профиль не требуется",
  profileGap: {
    "other-surname": "Другая фамилия: по правилам проекта отдельный профиль не ведётся",
    unnamed: "Личное имя не названо или упоминание групповое: отдельную карточку создать нельзя",
    "doubtful-surname": "Фамилия прочитана неуверенно: карточка появится после проверки оригинала",
    "research-context": "Сравнительное или гипотетическое упоминание: карточка — после доказательства",
  },
  noPersonCard: "Карточка человека ещё не создана",
  migrationsLabel: "География",
  migrationsTitle: "Следы перемещения",
  migrationConfidence: "Уверенность: ",
}, {
  en: {
    meta: {
      legacyTitle: "The 1626 muster list",
      legacyDescription: "Six separate RGADA records, f. 210, op. 12, d. 13.",
      notFound: "Record not found",
      description: (date, place) => `${date}, ${place}. Archival record, transcription and related people.`,
    },
    back: "← All records",
    factsLabel: "Key facts and calculations",
    textsLabel: "Record texts",
    literalLabel: "As in the document",
    literalTitle: "Literal transcription",
    indexOnlyTitle: "This is a summary card of a name index",
    noTextTitle: "No full text yet",
    indexOnlyText: "The indexed events, names, dates and links are collected below. Literal texts of the original acts are kept in separate cards as the scans are checked.",
    noTextText: "The record is still in the queue. A short description does not count as a transcription.",
    modernLabel: "Modern reading",
    modernTitlePeople: "Names, biographies and meaning",
    modernTitleDocument: "What the document means",
    namesHeading: (people, explanations) => `Names: ${people} · notes: ${explanations}`,
    establishedHeading: "What exactly is established",
    peopleLede: "This is more than a reading of the names. For each person we show their role, spelling variants, family and landholding ties, chronology, geography, the strength of the evidence and the exact line between fact and hypothesis.",
    documentLede: "This is a general document or an archival lead without an accessible list of names. The established historical context is shown below; personal cards will appear only once the surname is found in the original or in a reliable transcription.",
    thesisEyebrow: "The full answer",
    thesisTitle: "The name, the man and the meaning of the place name — layer by layer of evidence",
    thesisLede: "Here the short conclusion is kept apart from the explanation. Each block shows not only a possible interpretation but also its documentary basis, the competing version and the limit beyond which an unproven biography would begin.",
    nameIndexLabel: "Index of the names discussed",
    nameIndexTitle: "Go to a person",
    guideEyebrow: "Who is who — without mixing up owners, candidates and analogies",
    guideTitle: "The key names, how they are built and what they mean for the search",
    guideLede: "The status under each name shows how strong the conclusion is. A “candidate” is a direction of search, not an established founder; a “parallel” explains the period and the way of naming, but does not move someone else into Tver uyezd.",
    guidePersonLink: "Person profile →",
    guideRecordLink: "Separate Record →",
    dossierLabel: "Detailed conclusion on the name Onfilog and the place name Onfilogovo",
    dossierEyebrow: "Name, place name and the person found",
    dossierTitle: "What we can already say about Onfilog",
    dossierLede: "Below is not a dictionary entry but a chain of evidence: what the place name itself tells us, what the baptismal name may have been, who has been found in documents of the right generation, and where established fact ends.",
    parallelHypothesis: "Parallel ownership hypothesis",
    overviewLabel: "What happened to the estate after 1634/1635",
    overviewKicker: (index) => `${index} · new 17th-century document`,
    overviewConclusionLabel: "Conclusion from the three entries",
    overviewConclusionTitle: "Stefanida’s former estate broke apart",
    overviewConclusionText: "Anfilogovo passed to Starkov; Nikolskoye Svechino, Sadykovo and Ishkovo to Bulbin; Voronino and Popovo to Yurlov. All of them are already called waste lands (pustoshi). This confirms that the history continues for our very settlement, but none of the three later holders can be called its founder.",
    eponymKicker: "The key person of this find",
    nameForms: "Name forms:",
    noListTitle: "The accessible part of the source has no list of names",
    noListText: "Collected here are the content of the order or register, the circumstances of the resettlement, the route, dates, archival references and the direction for further search for the surname.",
    meaningHeading: "Meaning: what this record adds to the family history",
    meaningLede: "Below is a connected explanation of the source itself: what event it records, whom it names, which places and relatives it links them to, and what exactly it adds to the history of the family or its resettlement.",
    workingSummary: "Working description — not a transcription",
    extractedLabel: "All data in the entry",
    extractedTitle: "What was extracted from the document",
    contextLabel: "Beyond a single line",
    contextTitle: "Historical and research context",
    geographyLabel: "Geographic tags",
    geographyTitle: "All places linked to the record",
    confidencePrefix: "confidence: ",
    confidence: { high: "high", medium: "medium", low: "low" },
    archivalCopySuffix: " · archival copy",
    fullSheet: "Full sheet",
    fullSheetCaption: "Full sheet · archival copy",
    sourceLabel: "Source and original",
    collection: "Collection",
    repository: "Held at",
    repositoryLocation: "Archive location",
    imageReference: "Position",
    date: "Date",
    place: "Place of event",
    repositoryLink: "Holding archive ↗",
    copiesTitle: "Copies of this record",
    copiesText: "This is one event confirmed by several archival copies or indexes.",
    originalLink: "Original ↗",
    indexLink: "Index ↗",
    noScan: "A scan of the source line has not been saved yet. ",
    restricted: "An archival copy is kept for internal checking but is not published without an explicitly confirmed right to republish it. Please use the original source. ",
    peopleLabel: "Connections",
    peopleTitle: "People mentioned",
    openPerson: "Open person →",
    noProfileBeforeCheck: "No separate profile until the original is checked. ",
    possibleMatch: "Possible match: ",
    researchObject: "A research subject rather than a separate person: no personal profile is needed",
    profileGap: {
      "other-surname": "A different surname: by the project’s rules no separate profile is kept",
      unnamed: "The personal name is not given or the mention is collective: a separate card cannot be created",
      "doubtful-surname": "The surname is read with uncertainty: a card will appear once the original is checked",
      "research-context": "A comparative or hypothetical mention: a card only after proof",
    },
    noPersonCard: "No person card has been created yet",
    migrationsLabel: "Geography",
    migrationsTitle: "Traces of movement",
    migrationConfidence: "Confidence: ",
  },
  uk: {
    meta: {
      legacyTitle: "Оглядовий список 1626 року",
      legacyDescription: "Шість самостійних записів РДАДА, ф. 210, оп. 12, спр. 13.",
      notFound: "Запис не знайдено",
      description: (date, place) => `${date}, ${place}. Архівний запис, транскрипція і пов’язані люди.`,
    },
    back: "← Усі записи",
    factsLabel: "Ключові факти й розрахунки",
    textsLabel: "Тексти запису",
    literalLabel: "Як у документі",
    literalTitle: "Дослівна транскрипція",
    indexOnlyTitle: "Це зведена картка іменного покажчика",
    noTextTitle: "Повного тексту поки немає",
    indexOnlyText: "Події, імена, дати й посилання з покажчика вже зібрано нижче. Дослівні тексти оригінальних актів зберігаються в окремих картках у міру перевірки сканів.",
    noTextText: "Запис залишається в черзі. Короткий опис не вважається транскрипцією.",
    modernLabel: "Сучасне прочитання",
    modernTitlePeople: "Імена, біографії та зміст",
    modernTitleDocument: "Зміст документа",
    namesHeading: (people, explanations) => `Імена: ${people} · пояснень: ${explanations}`,
    establishedHeading: "Що саме встановлено",
    peopleLede: "Тут розібрано не лише прочитання імен. Для кожної людини показано її роль, варіанти написання, родинні та володільницькі зв’язки, хронологію, географію, силу доказу й точну межу між фактом і гіпотезою.",
    documentLede: "Це загальний документ або архівна зачіпка без доступного поіменного списку. Нижче показано встановлений історичний контекст; персональні картки з’являться лише після виявлення прізвища в оригіналі або в надійній транскрипції.",
    thesisEyebrow: "Розгорнута відповідь",
    thesisTitle: "Ім’я, людина і зміст назви — шарами доказів",
    thesisLede: "Тут короткий висновок відокремлено від пояснення. Кожен блок показує не лише можливе тлумачення, а й документальну підставу, конкурентну версію та межу, за якою починалася б недоведена біографія.",
    nameIndexLabel: "Покажчик імен у розборі",
    nameIndexTitle: "Перейти до людини",
    guideEyebrow: "Хто є хто — без змішування власників, кандидатів і аналогій",
    guideTitle: "Головні імена, їхня будова та значення для пошуку",
    guideLede: "Статус під ім’ям показує силу висновку. «Кандидат» означає напрям пошуку, а не встановленого засновника; «паралель» пояснює епоху і спосіб іменування, але не переносить чужу людину до Тверського повіту.",
    guidePersonLink: "Профіль людини →",
    guideRecordLink: "Окремий Record →",
    dossierLabel: "Докладний висновок про ім’я Онфілог і назву Онфілогово",
    dossierEyebrow: "Ім’я, топонім і знайдена людина",
    dossierTitle: "Що вже можна розповісти про Онфілога",
    dossierLede: "Нижче не словникова довідка, а ланцюжок доказів: що повідомляє сама назва, яким могло бути хрестильне ім’я, кого знайдено в документах потрібного покоління і де закінчується встановлений факт.",
    parallelHypothesis: "Паралельна володільницька гіпотеза",
    overviewLabel: "Що сталося з володінням після 1634/1635 року",
    overviewKicker: (index) => `${index} · новий документ XVII століття`,
    overviewConclusionLabel: "Висновок із трьох статей",
    overviewConclusionTitle: "Колишнє володіння Стефаніди розпалося",
    overviewConclusionText: "Анфілогово опинилося у Старкова; Нікольське Свечино, Садиково й Ішково — у Булбіна; Вороніно й Попово — в Юрлова. Усі вони вже названі пустками. Це підтверджує продовження історії саме нашого поселення, але жодного з трьох пізніших держателів не можна називати засновником.",
    eponymKicker: "Головна людина цієї знахідки",
    nameForms: "Форми імені:",
    noListTitle: "Поіменного списку в доступній частині джерела немає",
    noListText: "Тут зібрано зміст наказу або відомості, обставини переселення, маршрут, дати, архівні шифри й напрям подальшого пошуку прізвища.",
    meaningHeading: "Зміст: що цей запис додає до історії родини",
    meaningLede: "Нижче — зв’язне пояснення самого джерела: яку подію воно фіксує, кого називає, з якими місцями й родичами пов’язує і що саме додає до історії родини або її переселення.",
    workingSummary: "Робочий опис — не транскрипція",
    extractedLabel: "Усі дані рядка",
    extractedTitle: "Що вилучено з документа",
    contextLabel: "За межами одного рядка",
    contextTitle: "Історичний і дослідницький контекст",
    geographyLabel: "Географічні теги",
    geographyTitle: "Усі місця, пов’язані із записом",
    confidencePrefix: "упевненість: ",
    confidence: { high: "висока", medium: "середня", low: "низька" },
    archivalCopySuffix: " · архівна копія",
    fullSheet: "Повний аркуш",
    fullSheetCaption: "Повний аркуш · архівна копія",
    sourceLabel: "Джерело та оригінал",
    collection: "Колекція",
    repository: "Зберігається",
    repositoryLocation: "Місце архіву",
    imageReference: "Позиція",
    date: "Дата",
    place: "Місце події",
    repositoryLink: "Архів-зберігач ↗",
    copiesTitle: "Примірники цього запису",
    copiesText: "Це одна подія, підтверджена кількома архівними копіями або покажчиками.",
    originalLink: "Оригінал ↗",
    indexLink: "Покажчик ↗",
    noScan: "Скан вихідного рядка поки не збережено. ",
    restricted: "Архівну копію збережено для внутрішньої перевірки, але вона не публікується без явно підтвердженого права на повторний показ. Будь ласка, користуйтеся оригінальним джерелом. ",
    peopleLabel: "Зв’язки",
    peopleTitle: "Згадані люди",
    openPerson: "Відкрити людину →",
    noProfileBeforeCheck: "Окремий профіль не створено до перевірки оригіналу. ",
    possibleMatch: "Можливий збіг: ",
    researchObject: "Дослідницький об’єкт, а не окрема людина: персональний профіль не потрібен",
    profileGap: {
      "other-surname": "Інше прізвище: за правилами проєкту окремий профіль не ведеться",
      unnamed: "Особове ім’я не назване або згадка групова: окрему картку створити не можна",
      "doubtful-surname": "Прізвище прочитане непевно: картка з’явиться після перевірки оригіналу",
      "research-context": "Порівняльна або гіпотетична згадка: картка — після доведення",
    },
    noPersonCard: "Картку людини ще не створено",
    migrationsLabel: "Географія",
    migrationsTitle: "Сліди переміщення",
    migrationConfidence: "Упевненість: ",
  },
  be: {
    meta: {
      legacyTitle: "Аглядны спіс 1626 года",
      legacyDescription: "Шэсць самастойных запісаў РДАСА, ф. 210, воп. 12, спр. 13.",
      notFound: "Запіс не знойдзены",
      description: (date, place) => `${date}, ${place}. Архіўны запіс, расшыфроўка і звязаныя людзі.`,
    },
    back: "← Усе запісы",
    factsLabel: "Ключавыя факты і разлікі",
    textsLabel: "Тэксты запісу",
    literalLabel: "Як у дакуменце",
    literalTitle: "Даслоўная расшыфроўка",
    indexOnlyTitle: "Гэта зводная картка імяннога паказальніка",
    noTextTitle: "Поўнага тэксту пакуль няма",
    indexOnlyText: "Падзеі, імёны, даты і спасылкі з паказальніка ўжо сабраны ніжэй. Даслоўныя тэксты арыгінальных актаў захоўваюцца ў асобных картках па меры праверкі сканаў.",
    noTextText: "Запіс застаецца ў чарзе. Кароткае апісанне не лічыцца расшыфроўкай.",
    modernLabel: "Сучаснае чытанне",
    modernTitlePeople: "Імёны, біяграфіі і сэнс",
    modernTitleDocument: "Сэнс дакумента",
    namesHeading: (people, explanations) => `Імёны: ${people} · тлумачэнняў: ${explanations}`,
    establishedHeading: "Што менавіта ўстаноўлена",
    peopleLede: "Тут разабрана не толькі чытанне імёнаў. Для кожнага чалавека паказаны яго роля, варыянты напісання, сваяцкія і ўладальніцкія сувязі, храналогія, геаграфія, сіла доказу і дакладная мяжа паміж фактам і гіпотэзай.",
    documentLede: "Гэта агульны дакумент або архіўная зачэпка без даступнага паіменнага спіса. Ніжэй паказаны ўстаноўлены гістарычны кантэкст; персанальныя карткі з’явяцца толькі пасля выяўлення прозвішча ў арыгінале або ў надзейнай расшыфроўцы.",
    thesisEyebrow: "Разгорнуты адказ",
    thesisTitle: "Імя, чалавек і сэнс назвы — па слаях доказу",
    thesisLede: "Тут кароткая выснова аддзелена ад тлумачэння. Кожны блок паказвае не толькі магчымае тлумачэнне, але і дакументальную падставу, канкурэнтную версію і мяжу, за якой пачыналася б недаказаная біяграфія.",
    nameIndexLabel: "Паказальнік імёнаў у разборы",
    nameIndexTitle: "Перайсці да чалавека",
    guideEyebrow: "Хто ёсць хто — без змешвання ўладальнікаў, кандыдатаў і аналогій",
    guideTitle: "Галоўныя імёны, іх склад і значэнне для пошуку",
    guideLede: "Статус пад імем паказвае сілу высновы. «Кандыдат» азначае кірунак пошуку, а не ўстаноўленага заснавальніка; «паралель» тлумачыць эпоху і спосаб наймення, але не пераносіць чужога чалавека ў Цвярскі павет.",
    guidePersonLink: "Профіль чалавека →",
    guideRecordLink: "Асобны Record →",
    dossierLabel: "Падрабязная выснова пра імя Онфілог і назву Онфілогава",
    dossierEyebrow: "Імя, тапонім і знойдзены чалавек",
    dossierTitle: "Што ўжо можна расказаць пра Онфілога",
    dossierLede: "Ніжэй не слоўнікавая даведка, а ланцужок доказу: што паведамляе сама назва, якім магло быць хросьбіннае імя, каго знойдзена ў дакументах патрэбнага пакалення і дзе заканчваецца ўстаноўлены факт.",
    parallelHypothesis: "Паралельная ўладальніцкая гіпотэза",
    overviewLabel: "Што адбылося з уладаннем пасля 1634/1635 года",
    overviewKicker: (index) => `${index} · новы дакумент XVII стагоддзя`,
    overviewConclusionLabel: "Выснова з трох артыкулаў",
    overviewConclusionTitle: "Былое ўладанне Стэфаніды распалася",
    overviewConclusionText: "Анфілогава апынулася ў Старкова; Нікольскае Свечына, Садыкава і Ішкова — у Булбіна; Вароніна і Попава — у Юрлова. Усе яны ўжо названы пусткамі. Гэта пацвярджае працяг гісторыі менавіта нашага паселішча, але нікога з трох пазнейшых трымальнікаў нельга называць заснавальнікам.",
    eponymKicker: "Галоўны чалавек гэтай знаходкі",
    nameForms: "Формы імя:",
    noListTitle: "Паіменнага спіса ў даступнай частцы крыніцы няма",
    noListText: "Тут сабраны змест загаду або ведамасці, абставіны перасялення, маршрут, даты, архіўныя шыфры і кірунак далейшага пошуку прозвішча.",
    meaningHeading: "Сэнс: што гэты запіс дадае да гісторыі сям’і",
    meaningLede: "Ніжэй — звязнае тлумачэнне самой крыніцы: якую падзею яна фіксуе, каго называе, з якімі месцамі і сваякамі звязвае і што менавіта дадае да гісторыі сям’і або яе перасялення.",
    workingSummary: "Працоўнае апісанне — не расшыфроўка",
    extractedLabel: "Усе даныя радка",
    extractedTitle: "Што вынята з дакумента",
    contextLabel: "За межамі аднаго радка",
    contextTitle: "Гістарычны і даследчы кантэкст",
    geographyLabel: "Геаграфічныя тэгі",
    geographyTitle: "Усе месцы, звязаныя з запісам",
    confidencePrefix: "упэўненасць: ",
    confidence: { high: "высокая", medium: "сярэдняя", low: "нізкая" },
    archivalCopySuffix: " · архіўная копія",
    fullSheet: "Поўны ліст",
    fullSheetCaption: "Поўны ліст · архіўная копія",
    sourceLabel: "Крыніца і арыгінал",
    collection: "Калекцыя",
    repository: "Захоўваецца",
    repositoryLocation: "Месца архіва",
    imageReference: "Пазіцыя",
    date: "Дата",
    place: "Месца падзеі",
    repositoryLink: "Архіў-захавальнік ↗",
    copiesTitle: "Асобнікі гэтага запісу",
    copiesText: "Гэта адна падзея, пацверджаная некалькімі архіўнымі копіямі або паказальнікамі.",
    originalLink: "Арыгінал ↗",
    indexLink: "Паказальнік ↗",
    noScan: "Скан зыходнага радка пакуль не захаваны. ",
    restricted: "Архіўная копія захавана для ўнутранай праверкі, але не публікуецца без яўна пацверджанага права на паўторны паказ. Калі ласка, карыстайцеся арыгінальнай крыніцай. ",
    peopleLabel: "Сувязі",
    peopleTitle: "Згаданыя людзі",
    openPerson: "Адкрыць чалавека →",
    noProfileBeforeCheck: "Асобны профіль не створаны да праверкі арыгінала. ",
    possibleMatch: "Магчымае супадзенне: ",
    researchObject: "Даследчы аб’ект, а не асобны чалавек: персанальны профіль не патрабуецца",
    profileGap: {
      "other-surname": "Іншае прозвішча: па правілах праекта асобны профіль не вядзецца",
      unnamed: "Асабовае імя не названа або згадка групавая: асобную картку стварыць нельга",
      "doubtful-surname": "Прозвішча прачытана няўпэўнена: картка з’явіцца пасля праверкі арыгінала",
      "research-context": "Параўнальная або гіпатэтычная згадка: картка — пасля доказу",
    },
    noPersonCard: "Картка чалавека яшчэ не створана",
    migrationsLabel: "Геаграфія",
    migrationsTitle: "Сляды перамяшчэння",
    migrationConfidence: "Упэўненасць: ",
  },
});
