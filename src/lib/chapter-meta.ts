import type { Locale } from "@/i18n/config";
import { chapterMetaTranslations } from "@/lib/chapter-meta.translations";

export type ChapterGroup = "opening" | "name" | "families" | "geography" | "appendix";

export type ChapterMeta = {
  order: number;
  group: ChapterGroup;
  groupLabel: string;
  description: string;
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
  name: "Как имя стало фамилией",
  families: "Земля, служба и семья",
  geography: "Фамилия на карте",
  appendix: "Продолжить историю",
};

const chapterMeta: Record<string, Omit<ChapterMeta, "groupLabel">> = {
  "book/01-surname-by-ear": { order: 1, group: "opening", description: "Общее имя и разные семейные истории: как устроена книга и где искать свою ветвь." },
  "book/02-greek-amphilochus": {
    order: 2,
    group: "name",
    description: "Ребёнок на древнем сосуде, прорицатель и герой на монетах: культурная жизнь имени до появления русской фамилии.",
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
  "book/03-christian-amphilochius": {
    order: 3,
    group: "name",
    description: "Память о епископе Иконии сохраняет имя в календаре. На Руси книжная форма встречается с живой речью.",
    period: {
      from: "IV век",
      to: "XV век",
      label: "Церковная традиция",
      note: "Епископ Иконии, новгородская Минея 1097 года и русские носители церковного имени.",
      axis: { start: 28, end: 59 },
    },
  },
  "book/04-first-records": {
    order: 4,
    group: "name",
    description: "Личное имя, именование на -ов и название деревни: первые документы показывают, как возникала фамильная форма.",
    period: {
      from: "ок. 1495",
      to: "1595",
      label: "Имя, двор и деревня",
      note: "Личное имя, именование на -ов и название деревни: как документы показывают образование фамильной формы.",
      axis: { start: 58, end: 64 },
    },
  },
  "book/05-orel-1594-1596": {
    order: 5,
    group: "families",
    description: "Девять владельцев, семь земельных долей и служба за поместье. Первый плотный очаг фамилии в Орловском уезде.",
    period: {
      from: "1594",
      to: "1596",
      label: "Орловское ядро",
      note: "Первые девять служилых землевладельцев и отдельный архивный лист о Павле Анфилогове.",
      axis: { start: 63, end: 64 },
    },
  },
  "book/06-orel-1625-1645": {
    order: 6,
    group: "families",
    description: "В земельной выписи появляются дети; повторные смотры и присяга позволяют узнать людей через двадцать лет.",
    period: {
      from: "1625",
      to: "1645",
      label: "Из выписи в присягу",
      note: "Три семьи 1625 года и те же имена в присяжной книге, составленной двадцать лет спустя.",
      axis: { start: 67, end: 72 },
    },
  },
  "book/07-kursk-oboyan-1636-1651": {
    order: 7,
    group: "families",
    description: "Лошадь, оружие, пять рублей и два сына. Служебные списки раскрывают условия жизни у южной крепости.",
    period: {
      from: "1630",
      to: "1651",
      label: "Курск — Обоянь",
      note: "Верстание, пограничная служба и семья Сергея Григорьевича Анпилогова.",
      axis: { start: 69, end: 74 },
    },
  },
  "book/08-akim-bazdyrevo-shchigry-1700": {
    order: 8,
    group: "families",
    description: "Аким рассказывает о потерянном орловском доме и ливенской земле внука. Два уезда связывает семейное свидетельство.",
    period: {
      from: "1700",
      to: "1782",
      label: "Доказанное переселение",
      note: "Личная сказка Акима связывает прежнее орловское поместье с землёй его внука Тита в Ливенском уезде.",
      axis: { start: 80, end: 86 },
    },
  },
  "book/10-anpilogovo-kursk": {
    order: 10,
    group: "geography",
    description: "Название переживает прежних владельцев. За двумя соседними Анпилоговыми обнаруживаются разные общины.",
    period: {
      from: "1642",
      to: "1934",
      label: "Анпилогово",
      note: "Фамильное поместье XVII века, деревня однодворцев Анпилоговых и крепостная деревня по соседству.",
      axis: { start: 71, end: 98 },
    },
  },
  "book/11-anpilovka-stary-oskol": {
    order: 11,
    group: "geography",
    description: "Служилые дворы, мельница на Осколе и новая деревня: семьи появляются в документах раньше селения.",
    period: {
      from: "1647",
      to: "1811",
      label: "Анпиловка",
      note: "Служилые люди Оскола, мельница в Сорокине и деревня однодворцев Анпиловых у села Бор.",
      axis: { start: 72, end: 88 },
    },
  },
  "book/09-anfilogov-nobility": {
    order: 9,
    group: "families",
    description: "Как одна ветвь подтверждала дворянское происхождение и почему её история не определяет сословие всех однофамильцев.",
    period: {
      from: "1826",
      to: "1887",
      label: "Признанная древняя ветвь",
      note: "Анфилоговы внесены в VI часть Курской родословной книги; дела Герольдии ведут к материалам доказанной ветви.",
      axis: { start: 86, end: 96 },
    },
  },
  "book/12-new-lands": {
    order: 12,
    group: "geography",
    description: "Украинская линия, Новороссия, Кавказ, Оренбуржье, низовья Волги и Сибирь: куда и почему уходили семьи.",
    period: {
      from: "1732",
      to: "1917",
      label: "Переселения на новые земли",
      note: "Украинская линия, Тимошевка, Тихорецкое, Кармалка и оренбургские казаки, Бахтемир и Сибирь.",
      axis: { start: 82, end: 98 },
    },
  },
  "book/13-towns-and-parishes": {
    order: 13,
    group: "geography",
    description: "Крым, Дон, Донбасс, города и приходы на рубеже XIX–XX веков, а в итоге — служилый род и его потомки сегодня.",
    period: {
      from: "1868",
      to: "1917",
      label: "География разных семей",
      note: "Симферополь, Оренбург, Дон и Донбасс, Самара, Мелитополь, Киев и сельские приходы.",
      axis: { start: 94, end: 98 },
    },
  },
  "book/14-method": { order: 14, group: "appendix", description: "От знакомого имени к документу: как продолжить историю своей семьи и проверить связи между поколениями." },
};

/** Text fields of a chapter's metadata; the translations override these per locale. */
export type ChapterMetaText = {
  description: string;
  period?: Pick<NonNullable<ChapterMeta["period"]>, "from" | "fromEra" | "to" | "toEra" | "label" | "note">;
};

export type ChapterMetaTranslation = {
  groupLabels: Record<ChapterGroup, string>;
  chapters: Record<string, ChapterMetaText>;
};

export function getChapterMeta(slug: string, locale: Locale = "ru"): ChapterMeta | undefined {
  const meta = chapterMeta[slug];
  if (!meta) return undefined;
  const translation = locale === "ru" ? undefined : chapterMetaTranslations[locale];
  const text = translation?.chapters[slug];
  return {
    ...meta,
    description: text?.description ?? meta.description,
    period: meta.period ? { ...meta.period, ...text?.period } : undefined,
    groupLabel: translation?.groupLabels[meta.group] ?? groupLabels[meta.group],
  };
}

export function getChapterGroupLabel(group: ChapterGroup, locale: Locale = "ru") {
  return (locale === "ru" ? undefined : chapterMetaTranslations[locale]?.groupLabels[group]) ?? groupLabels[group];
}
