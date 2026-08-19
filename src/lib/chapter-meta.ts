export type ChapterGroup = "opening" | "chronology" | "migration" | "appendix";

export type ChapterMeta = {
  order: number;
  group: ChapterGroup;
  groupLabel: string;
  period?: {
    from: string;
    fromEra?: string;
    to?: string;
    toEra?: string;
    label: string;
    note: string;
    axis: {
      start: number;
      end: number;
    };
  };
};

const groupLabels: Record<ChapterGroup, string> = {
  opening: "Вступление",
  chronology: "История по времени",
  migration: "Маршруты",
  appendix: "Дополнительные разделы",
};

const chapterMeta: Record<string, Omit<ChapterMeta, "groupLabel">> = {
  "book/00-overview": { order: 0, group: "opening" },
  "book/01-greek-amphilochus": {
    order: 1,
    group: "chronology",
    period: {
      from: "VIII век",
      fromEra: "до нашей эры",
      to: "IV век",
      toEra: "нашей эры",
      label: "Античная традиция",
      note: "Даты относятся к сохранившимся текстам и надписям, а не к мифической биографии героя.",
      axis: { start: 0, end: 28 },
    },
  },
  "book/02-christian-amphilochius": {
    order: 2,
    group: "chronology",
    period: {
      from: "IV век",
      to: "XIX век",
      label: "Церковная традиция",
      note: "От Иконии IV века и календаря средневековой Руси — до двух поздних метрических свидетельств живого имени.",
      axis: { start: 28, end: 91 },
    },
  },
  "book/03-onfilogov-priluki-1536-1537": {
    order: 3,
    group: "chronology",
    period: {
      from: "1536",
      to: "1537",
      label: "Первая фамильная форма",
      note: "Один непашенный двор в монастырском селе Прилуки и самая ранняя пока проверенная запись формы на -ов.",
      axis: { start: 59, end: 60 },
    },
  },
  "book/04-orel-1594-1596": {
    order: 4,
    group: "chronology",
    period: {
      from: "1594",
      to: "1596",
      label: "Орловское ядро",
      note: "Первые девять служилых землевладельцев и отдельный архивный лист о Павле Анфилогове.",
      axis: { start: 63, end: 64 },
    },
  },
  "book/05-orel-1625-1645": {
    order: 5,
    group: "chronology",
    period: {
      from: "1625",
      to: "1645",
      label: "Следующее поколение",
      note: "Прямые формулы родства и повторяющиеся поместья раскрывают несколько орловских линий.",
      axis: { start: 67, end: 72 },
    },
  },
  "book/06-sergey-kursk-oboyan-1636-1651": {
    order: 6,
    group: "chronology",
    period: {
      from: "1636",
      to: "1651",
      label: "Курск — Обоянь",
      note: "Верстание, пограничная служба и семья Сергея Григорьевича Анпилогова.",
      axis: { start: 69, end: 74 },
    },
  },
  "book/07-bazdyrevo-shchigry-1697": {
    order: 9,
    group: "chronology",
    period: {
      from: "1697",
      label: "Доказанное переселение",
      note: "Один документ связывает Орловский уезд, Ливенские Щигры, Акима и его внука Тита.",
      axis: { start: 80, end: 80 },
    },
  },
  "book/07-anpilogovo-anpilovka": {
    order: 7,
    group: "chronology",
    period: {
      from: "1642",
      to: "наши дни",
      label: "Анпилогово",
      note: "Поместье Анпилоговых, крепостное сельцо, земская школа и разделение одной деревни на две.",
      axis: { start: 71, end: 100 },
    },
  },
  "book/07-anpilovka-stary-oskol": {
    order: 8,
    group: "chronology",
    period: {
      from: "1668",
      to: "наши дни",
      label: "Анпиловка",
      note: "Несколько поколений старооскольских Анпиловых и постепенное появление селения у села Бор.",
      axis: { start: 75, end: 100 },
    },
  },
  "book/08-nobility-1788-1887": {
    order: 10,
    group: "chronology",
    period: {
      from: "1788",
      to: "1887",
      label: "Признанная древняя ветвь",
      note: "Анфилоговы внесены в VI часть Курской родословной книги; дела Герольдии ведут к материалам доказанной ветви.",
      axis: { start: 86, end: 96 },
    },
  },
  "book/09-chernozem-taurida": {
    order: 11,
    group: "migration",
    period: {
      from: "XIX век",
      to: "начало XX века",
      label: "Дорога, ещё не собранная из документов",
      note: "Троицкое и Тимошевка уже видны на южном конце пути; семья, от которой началась дорога из Черноземья, пока не установлена.",
      axis: { start: 90, end: 100 },
    },
  },
  "book/10-taurida-crimea": {
    order: 12,
    group: "migration",
    period: {
      from: "XIX век",
      to: "первая четверть XX века",
      label: "След за Перекопом",
      note: "Семейное предание ведёт в Крым, но документа, который перенесёт через Перекоп конкретную семью, пока нет.",
      axis: { start: 90, end: 100 },
    },
  },
  "book/90-method": { order: 90, group: "appendix" },
};

export function getChapterMeta(slug: string): ChapterMeta | undefined {
  const meta = chapterMeta[slug];
  return meta ? { ...meta, groupLabel: groupLabels[meta.group] } : undefined;
}

export function getChapterGroupLabel(group: ChapterGroup) {
  return groupLabels[group];
}
