import { defineCopy } from "@/i18n/copy";

type RelationKind = "parent" | "spouse" | "child" | "sibling" | "foster-parent" | "foster-child";

type PersonPageCopy = {
  meta: {
    notFound: string;
    description: (name: string) => string;
  };
  back: string;
  eyebrow: string;
  inDocuments: string;
  needsReview: string;
  documented: string;
  life: string;
  birthUnknown: string;
  deathUnknown: string;
  places: string;
  placesPending: string;
  sources: string;
  occupation: string;
  occupationMissing: string;
  nameAnalysisLabel: string;
  nameAnalysisTitle: string;
  nameAnalysisLede: string;
  relationsLabel: string;
  relationsTitle: string;
  relationLabels: Record<RelationKind, string>;
  openRelation: string;
  notesLabel: string;
  notesTitle: string;
  leadsLabel: string;
  leadsTitle: string;
  leadsIntro: string;
  documentsLabel: string;
  documentsTitle: string;
  inDocument: string;
  openRecord: string;
  noSources: string;
};

export const personPageCopy = defineCopy<PersonPageCopy>({
  meta: {
    notFound: "Человек не найден",
    description: (name) => `${name}: документированные события, варианты имени и связанные люди.`,
  },
  back: "← Все люди",
  eyebrow: "Человек",
  inDocuments: "В документах",
  needsReview: "Есть вопросы к чтению",
  documented: "Документирован",
  life: "Жизнь",
  birthUnknown: "Рождение не установлено",
  deathUnknown: "смерть не установлена",
  places: "Места",
  placesPending: "Проверяются",
  sources: "Источники",
  occupation: "Занятие",
  occupationMissing: "Не указано",
  nameAnalysisLabel: "Не только написание",
  nameAnalysisTitle: "Имя и смысл",
  nameAnalysisLede: "Разбираем буквальную форму, патроним, роль человека, время и географию, а также отдельно отмечаем, что документ доказывает и чего из него выводить нельзя.",
  relationsLabel: "Родство",
  relationsTitle: "Семейные связи",
  relationLabels: {
    parent: "Родитель",
    spouse: "Супруг(а)",
    child: "Ребёнок",
    sibling: "Брат / сестра",
    "foster-parent": "Приёмный родитель",
    "foster-child": "Приёмыш",
  },
  openRelation: " · открыть →",
  notesLabel: "Контекст",
  notesTitle: "Заметки",
  leadsLabel: "Отдельные Records, спорные чтения и проверяемые связи",
  leadsTitle: "Интересные находки",
  leadsIntro: "Здесь собраны спорные чтения, возможные повторные упоминания, архивные маршруты и боковые линии, которые нельзя без проверки превращать в подтверждённые события биографии или родство. Ссылка на Record показана там, где уже есть отдельный документ.",
  documentsLabel: "Документы",
  documentsTitle: "Хронология",
  inDocument: "В документе: ",
  openRecord: "Открыть запись ",
  noSources: "Источники ещё не привязаны к этому человеку.",
}, {
  en: {
    meta: {
      notFound: "Person not found",
      description: (name) => `${name}: documented events, name variants and related people.`,
    },
    back: "← All people",
    eyebrow: "Person",
    inDocuments: "In documents",
    needsReview: "Reading needs review",
    documented: "Documented",
    life: "Life",
    birthUnknown: "Birth not established",
    deathUnknown: "death not established",
    places: "Places",
    placesPending: "Being checked",
    sources: "Sources",
    occupation: "Occupation",
    occupationMissing: "Not stated",
    nameAnalysisLabel: "More than spelling",
    nameAnalysisTitle: "Name and meaning",
    nameAnalysisLede: "We analyse the literal form, the patronymic, the person’s role, time and geography, and note separately what the document proves and what cannot be inferred from it.",
    relationsLabel: "Kinship",
    relationsTitle: "Family ties",
    relationLabels: {
      parent: "Parent",
      spouse: "Spouse",
      child: "Child",
      sibling: "Brother / sister",
      "foster-parent": "Foster parent",
      "foster-child": "Foster child",
    },
    openRelation: " · open →",
    notesLabel: "Context",
    notesTitle: "Notes",
    leadsLabel: "Separate Records, disputed readings and links under review",
    leadsTitle: "Notable finds",
    leadsIntro: "Collected here are disputed readings, possible repeated mentions, archival routes and side lines that must not be turned into confirmed biographical events or kinship without checking. A Record link is shown where a separate document already exists.",
    documentsLabel: "Documents",
    documentsTitle: "Timeline",
    inDocument: "In the document: ",
    openRecord: "Open record ",
    noSources: "No sources have been linked to this person yet.",
  },
  uk: {
    meta: {
      notFound: "Людину не знайдено",
      description: (name) => `${name}: задокументовані події, варіанти імені та пов’язані люди.`,
    },
    back: "← Усі люди",
    eyebrow: "Людина",
    inDocuments: "У документах",
    needsReview: "Є питання до прочитання",
    documented: "Задокументовано",
    life: "Життя",
    birthUnknown: "Народження не встановлено",
    deathUnknown: "смерть не встановлено",
    places: "Місця",
    placesPending: "Перевіряються",
    sources: "Джерела",
    occupation: "Заняття",
    occupationMissing: "Не вказано",
    nameAnalysisLabel: "Не лише написання",
    nameAnalysisTitle: "Ім’я та зміст",
    nameAnalysisLede: "Розбираємо дослівну форму, патронім, роль людини, час і географію, а також окремо зазначаємо, що документ доводить і чого з нього виводити не можна.",
    relationsLabel: "Спорідненість",
    relationsTitle: "Родинні зв’язки",
    relationLabels: {
      parent: "Батько / мати",
      spouse: "Чоловік / дружина",
      child: "Дитина",
      sibling: "Брат / сестра",
      "foster-parent": "Прийомний батько / мати",
      "foster-child": "Прийомна дитина",
    },
    openRelation: " · відкрити →",
    notesLabel: "Контекст",
    notesTitle: "Нотатки",
    leadsLabel: "Окремі Records, спірні прочитання і зв’язки, що перевіряються",
    leadsTitle: "Цікаві знахідки",
    leadsIntro: "Тут зібрано спірні прочитання, можливі повторні згадки, архівні маршрути й бічні лінії, які не можна без перевірки перетворювати на підтверджені події біографії чи спорідненість. Посилання на Record показано там, де вже є окремий документ.",
    documentsLabel: "Документи",
    documentsTitle: "Хронологія",
    inDocument: "У документі: ",
    openRecord: "Відкрити запис ",
    noSources: "Джерела ще не прив’язані до цієї людини.",
  },
  be: {
    meta: {
      notFound: "Чалавек не знойдзены",
      description: (name) => `${name}: задакументаваныя падзеі, варыянты імя і звязаныя людзі.`,
    },
    back: "← Усе людзі",
    eyebrow: "Чалавек",
    inDocuments: "У дакументах",
    needsReview: "Ёсць пытанні да чытання",
    documented: "Задакументаваны",
    life: "Жыццё",
    birthUnknown: "Нараджэнне не ўстаноўлена",
    deathUnknown: "смерць не ўстаноўлена",
    places: "Месцы",
    placesPending: "Правяраюцца",
    sources: "Крыніцы",
    occupation: "Занятак",
    occupationMissing: "Не пазначана",
    nameAnalysisLabel: "Не толькі напісанне",
    nameAnalysisTitle: "Імя і сэнс",
    nameAnalysisLede: "Разбіраем даслоўную форму, патронім, ролю чалавека, час і геаграфію, а таксама асобна адзначаем, што дакумент даказвае і чаго з яго выводзіць нельга.",
    relationsLabel: "Сваяцтва",
    relationsTitle: "Сямейныя сувязі",
    relationLabels: {
      parent: "Бацька / маці",
      spouse: "Муж / жонка",
      child: "Дзіця",
      sibling: "Брат / сястра",
      "foster-parent": "Прыёмны бацька / маці",
      "foster-child": "Прыёмнае дзіця",
    },
    openRelation: " · адкрыць →",
    notesLabel: "Кантэкст",
    notesTitle: "Нататкі",
    leadsLabel: "Асобныя Records, спрэчныя чытанні і сувязі, якія правяраюцца",
    leadsTitle: "Цікавыя знаходкі",
    leadsIntro: "Тут сабраны спрэчныя чытанні, магчымыя паўторныя згадкі, архіўныя маршруты і бакавыя лініі, якія нельга без праверкі ператвараць у пацверджаныя падзеі біяграфіі або сваяцтва. Спасылка на Record паказана там, дзе ўжо ёсць асобны дакумент.",
    documentsLabel: "Дакументы",
    documentsTitle: "Храналогія",
    inDocument: "У дакуменце: ",
    openRecord: "Адкрыць запіс ",
    noSources: "Крыніцы яшчэ не прывязаны да гэтага чалавека.",
  },
});
