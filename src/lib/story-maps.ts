import type { Locale } from "@/i18n/config";
import { storyMapTranslations } from "@/lib/story-maps.translations";

export type StoryMapPlace = {
  id: string;
  name: string;
  detail: string;
  latitude: number;
  longitude: number;
  /** "destination" is drawn as a filled dot, "origin" as a hollow one. */
  role: "destination" | "origin";
  /** Permanent labels for the main points; the rest show on hover. */
  label?: "permanent" | "hover";
  /** Side of the marker for the label, to keep close points readable. */
  labelSide?: "left" | "right" | "top" | "bottom";
};

export type StoryMapRoute = {
  from: string;
  to: string;
  label: string;
  /** Dashed when the movement is a direction of search, not a documented trip. */
  dashed?: boolean;
};

export type StoryMapConfig = {
  title: string;
  subtitle: string;
  ariaLabel: string;
  places: StoryMapPlace[];
  routes: StoryMapRoute[];
  legend: string[];
  note: string;
  maxZoom?: number;
};

export const storyMaps: Record<string, StoryMapConfig> = {
  "mtsensk-1626": {
    title: "Мценская служба · 1626",
    subtitle: "Служилые люди семи городов сходились к Мценску",
    ariaLabel: "Карта: служилые люди Орла, Белёва, Болхова, Карачева, Новосиля и Черни несли летнюю службу во Мценске в 1626 году",
    places: [
      { id: "mtsensk", name: "Мценск", detail: "Здесь с весны до осени стояли полки и проходили смотры", latitude: 53.278984, longitude: 36.576077, role: "destination", label: "permanent" },
      { id: "orel", name: "Орёл", detail: "Отсюда пришли Онфилоговы и Василий Онпилогов", latitude: 52.968017, longitude: 36.099499, role: "origin", label: "permanent" },
      { id: "belev", name: "Белёв", detail: "Дворяне и дети боярские Белёва и белёвские казаки", latitude: 53.8106, longitude: 36.134, role: "origin", label: "permanent", labelSide: "right" },
      { id: "bolkhov", name: "Болхов", detail: "Дворяне и дети боярские Болхова", latitude: 53.4427, longitude: 36.0063, role: "origin", label: "permanent", labelSide: "left" },
      { id: "karachev", name: "Карачев", detail: "Дворяне и дети боярские Карачева", latitude: 53.1243, longitude: 34.9811, role: "origin", label: "permanent", labelSide: "left" },
      { id: "novosil", name: "Новосиль", detail: "Дворяне и дети боярские Новосиля", latitude: 52.9739, longitude: 37.044, role: "origin", label: "permanent", labelSide: "right" },
      { id: "chern", name: "Чернь", detail: "Дворяне и дети боярские Черни", latitude: 53.4495, longitude: 36.9106, role: "origin", label: "permanent", labelSide: "right" },
    ],
    routes: [
      { from: "orel", to: "mtsensk", label: "Орловцы на службе во Мценске" },
      { from: "belev", to: "mtsensk", label: "Белёв → Мценск" },
      { from: "bolkhov", to: "mtsensk", label: "Болхов → Мценск" },
      { from: "karachev", to: "mtsensk", label: "Карачев → Мценск" },
      { from: "novosil", to: "mtsensk", label: "Новосиль → Мценск" },
      { from: "chern", to: "mtsensk", label: "Чернь → Мценск" },
    ],
    legend: ["Место службы", "Города, откуда приходили служилые люди"],
    note: "Города взяты из заголовка смотренного списка 1626 года. Линии показывают, кто куда приходил на службу, а не дороги того времени.",
    maxZoom: 8,
  },
  "oskol-1593-1811": {
    title: "Оскол и его окрестности",
    subtitle: "Крепость 1593 года, новая крепость 1647-го и будущая Анпиловка",
    ariaLabel: "Карта: Оскол, новая крепость Царев-Алексеев (Новый Оскол), село Сорокино и деревня Анпиловка",
    places: [
      { id: "oskol", name: "Оскол", detail: "Крепость 1593 года, позднее Старый Оскол", latitude: 51.298038, longitude: 37.833202, role: "destination", label: "permanent", labelSide: "left" },
      { id: "tsarev", name: "Царев-Алексеев", detail: "Новая крепость 1647 года, позднее Новый Оскол", latitude: 50.764474, longitude: 37.863181, role: "destination", label: "permanent", labelSide: "right" },
      { id: "sorokino", name: "Сорокино", detail: "Здесь в 1719 году Денис и Иван Анпиловы держали мельницу на Осколе", latitude: 51.22413, longitude: 37.86403, role: "origin", label: "permanent", labelSide: "left" },
      { id: "anpilovka", name: "Анпиловка у Бора", detail: "Деревня однодворцев Анпиловых, известная с 1780-х годов", latitude: 51.26, longitude: 37.879444, role: "destination", label: "permanent", labelSide: "right" },
    ],
    routes: [
      { from: "oskol", to: "tsarev", label: "1647/48: семью Данилы Анпилова переводят в новую крепость" },
      { from: "sorokino", to: "anpilovka", label: "XVIII век: часть Анпиловых перебирается к Бору", dashed: true },
    ],
    legend: ["Крепости и новое селение", "Сорокино, где стояла мельница", "Пунктир — реконструкция по ревизиям"],
    note: "Анпиловка выросла рядом с селом Бор, в нескольких километрах от Старого Оскола.",
    maxZoom: 10,
  },
  "migration-overview": {
    title: "Куда уходили семьи",
    subtitle: "Главные переселения XVIII–XIX веков",
    ariaLabel: "Обзорная карта переселений: Украинская линия, Тимошевка, Херсонская губерния, Тихорецкое на Кавказе, Кармалка под Оренбургом и Бахтемир в дельте Волги",
    places: [
      { id: "kursk", name: "Курская губерния", detail: "Отсюда вышло большинство переселенцев", latitude: 51.730925, longitude: 36.192312, role: "origin", label: "permanent", labelSide: "top" },
      { id: "kromy", name: "Кромской уезд", detail: "Орловские однодворцы и казённые крестьяне", latitude: 52.689445, longitude: 35.773659, role: "origin" },
      { id: "pavlovsk", name: "Павловский уезд", detail: "Воронежские однодворцы", latitude: 50.16777778, longitude: 40.39666667, role: "origin" },
      { id: "enotaevsk", name: "Енотаевский уезд", detail: "Откуда семья Михаила Анпилогова пришла в Бахтемир", latitude: 47.24559, longitude: 47.02814, role: "origin" },
      { id: "ryazh", name: "Украинская линия · 1732–1764", detail: "Однодворцы на службе у пограничных крепостей", latitude: 49.17738, longitude: 34.91197, role: "destination", label: "permanent", labelSide: "left" },
      { id: "tymoshivka", name: "Тимошевка · 1810", detail: "Курские казённые крестьяне под Мелитополем", latitude: 47.18507, longitude: 35.116734, role: "destination", label: "permanent", labelSide: "right" },
      { id: "kherson", name: "Херсонская губерния · 1811", detail: "Прошение кромских крестьян; участок не установлен", latitude: 46.6401295, longitude: 32.6143922, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "tikhoretskoe", name: "Тихорецкое · 1826", detail: "Ныне станица Фастовецкая", latitude: 45.917324, longitude: 40.154659, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "karmalka", name: "Кармалка · 1828–1838", detail: "Курские и орловские переселенцы под Оренбургом", latitude: 52.963526, longitude: 54.697168, role: "destination", label: "permanent", labelSide: "left" },
      { id: "bakhtemir", name: "Бахтемир · 1837", detail: "Рыбацкое село в дельте Волги", latitude: 46.1576, longitude: 47.8157, role: "destination", label: "permanent", labelSide: "right" },
    ],
    routes: [
      { from: "kursk", to: "ryazh", label: "1732–1764: однодворцы на Украинскую линию" },
      { from: "kursk", to: "tymoshivka", label: "1810: курские переселенцы в Тимошевке", dashed: true },
      { from: "kromy", to: "kherson", label: "1811: прошение о переселении в Херсонскую губернию", dashed: true },
      { from: "pavlovsk", to: "tikhoretskoe", label: "1826: однодворцы Павловского уезда на Кавказе" },
      { from: "kursk", to: "karmalka", label: "1828 и 1838: курские переселенцы" },
      { from: "kromy", to: "karmalka", label: "1829: орловские однодворцы" },
      { from: "enotaevsk", to: "bakhtemir", label: "1837: из Енотаевского уезда в Бахтемир" },
    ],
    legend: ["Куда пришли", "Откуда вышли", "Пунктир — путь семьи не прослежен"],
    note: "Сибирь показана на отдельной карте в разделе о ней. Линии соединяют места, а не повторяют дороги.",
    maxZoom: 6,
  },
  "south-roads": {
    title: "Дороги на юг",
    subtitle: "Украинская линия, Новороссия и вторая волна после 1861 года",
    ariaLabel: "Карта переселений на юг: из Курского уезда на Украинскую линию, из Курской губернии в Тимошевку и Отраду, из Кромского уезда в Херсонскую губернию, из Медынского уезда в Привольное",
    places: [
      { id: "kursk", name: "Курская губерния", detail: "Казённые крестьяне и однодворцы, которым не хватало земли", latitude: 51.730925, longitude: 36.192312, role: "origin", label: "permanent", labelSide: "right" },
      { id: "kromy", name: "Кромской уезд", detail: "Черемошная: две семьи Анпилоговых в прошении 1811 года", latitude: 52.689445, longitude: 35.773659, role: "origin", label: "permanent", labelSide: "left" },
      { id: "medyn", name: "Медынский уезд", detail: "Отсюда пришёл Гавриил Иванович", latitude: 54.969, longitude: 35.857, role: "origin", label: "permanent", labelSide: "right" },
      { id: "ryazh", name: "Ряжская крепость · 1730–1770-е", detail: "Украинская линия: двор Фёдора Ивановича", latitude: 49.17738, longitude: 34.91197, role: "destination", label: "permanent", labelSide: "left" },
      { id: "tymoshivka", name: "Тимошевка · 1810", detail: "Хутор 1809 года, через год — курские переселенцы", latitude: 47.18507, longitude: 35.116734, role: "destination", label: "permanent", labelSide: "right" },
      { id: "kherson", name: "Херсонская губерния · 1811", detail: "Участок № 130; точное место не установлено", latitude: 46.6401295, longitude: 32.6143922, role: "destination", label: "permanent", labelSide: "left" },
      { id: "otrada", name: "Отрада · 1870", detail: "Курские семьи причислены к сельскому обществу", latitude: 46.375134, longitude: 34.446879, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "pryvilne", name: "Привольное · 1887", detail: "Рождение Ивана, сына Гавриила", latitude: 47.493781, longitude: 32.297172, role: "destination", label: "permanent", labelSide: "left" },
    ],
    routes: [
      { from: "kursk", to: "ryazh", label: "1732–1764: пятеро Анпилоговых из Курского уезда на Украинскую линию" },
      { from: "kursk", to: "tymoshivka", label: "1810: курские переселенцы в Тимошевке; путь семьи Ильи не найден", dashed: true },
      { from: "kromy", to: "kherson", label: "1811: прошение кромских крестьян; прибытие не прослежено", dashed: true },
      { from: "kursk", to: "otrada", label: "1870: Кузьма и Василий Анпилоговы причислены к Отраде" },
      { from: "medyn", to: "pryvilne", label: "Медынский уезд → Привольное, 1887" },
    ],
    legend: ["Где семьи оказались", "Откуда пришли", "Пунктир — направление поиска"],
    note: "Линии соединяют место выхода, названное в документе, с местом назначения. Точный путь и год переезда документы обычно не сообщают. Точка Херсонской губернии стоит условно, в губернском городе.",
    maxZoom: 7,
  },
  caucasus: {
    title: "На Кавказ",
    subtitle: "Прошения 1826–1827 годов и селение Тихорецкое",
    ariaLabel: "Карта: из курских сёл Тетеревино и Никольское и из воронежских сёл Верхний Мамон и Буйлово на Кавказ, в селение Тихорецкое",
    places: [
      { id: "teterevino", name: "Тетеревино", detail: "Корочанский уезд: прошение Семёна Анпилогова, 1826", latitude: 50.871667, longitude: 36.616111, role: "origin", label: "permanent", labelSide: "left" },
      { id: "nikolskoe", name: "Никольское под Княжьими", detail: "Фатежский уезд: четверо Анпилоговых в прошении 1827 года", latitude: 52.292945, longitude: 36.419378, role: "origin", label: "permanent", labelSide: "left" },
      { id: "mamon", name: "Верхний Мамон", detail: "Павловский уезд: семья Емельяна Никитича", latitude: 50.16777778, longitude: 40.39666667, role: "origin", label: "permanent", labelSide: "right" },
      { id: "buylovo", name: "Буйлово", detail: "Павловский уезд: семья Леонтия Федосеевича", latitude: 50.3681, longitude: 40.0733, role: "origin", label: "permanent", labelSide: "top" },
      { id: "stavropol", name: "Кавказская область", detail: "Куда просились курские крестьяне; точное место не назначено", latitude: 45.04484, longitude: 41.96902, role: "destination", label: "permanent", labelSide: "right" },
      { id: "tikhoretskoe", name: "Тихорецкое · 1826", detail: "Селение на речке Тихой, ныне станица Фастовецкая", latitude: 45.917324, longitude: 40.154659, role: "destination", label: "permanent", labelSide: "left" },
    ],
    routes: [
      { from: "mamon", to: "tikhoretskoe", label: "Однодворцы Павловского уезда → Тихорецкое" },
      { from: "buylovo", to: "tikhoretskoe", label: "Однодворцы Павловского уезда → Тихорецкое" },
      { from: "teterevino", to: "stavropol", label: "1826: прошение о переселении в Кавказскую область", dashed: true },
      { from: "nikolskoe", to: "stavropol", label: "1827: прошение 213 семей Фатежского уезда", dashed: true },
    ],
    legend: ["Куда шли", "Откуда шли", "Пунктир — прошение, прибытие не прослежено"],
    note: "Сплошные линии — переселение, подтверждённое итоговой пометой дела. Пунктир — только прошения: точка Кавказской области стоит условно, в Ставрополе.",
    maxZoom: 7,
  },
  orenburg: {
    title: "Кармалка под Оренбургом",
    subtitle: "Переселенцы 1828–1840 годов и казачьи посёлки",
    ariaLabel: "Карта переселения Анпилоговых из Курской губернии и Кромского уезда в Кармалку под Оренбургом и в Бузулукский уезд в 1828–1840 годах, а также казачий посёлок Изяк-Никитино",
    places: [
      { id: "kursk", name: "Курская губерния", detail: "Группа Лариона Анпилогова, 1828", latitude: 51.730925, longitude: 36.192312, role: "origin", label: "permanent", labelSide: "bottom" },
      { id: "kromy", name: "Кромской уезд", detail: "Орловские однодворцы, 1829; прошение из Черемошной, 1833", latitude: 52.689445, longitude: 35.773659, role: "origin", label: "permanent", labelSide: "top" },
      { id: "nikolskoe", name: "Никольское под Княжьими", detail: "Фатежский уезд: шестеро Анпилоговых в списке 1832 года", latitude: 52.292945, longitude: 36.419378, role: "origin" },
      { id: "brekhova", name: "Брехова", detail: "Фатежский уезд: ведомость малоземельных крестьян, 1838", latitude: 52.1716317, longitude: 35.9792376, role: "origin" },
      { id: "anpilogova-fatezh", name: "Анпилогова (Фатежский уезд)", detail: "Откуда пришёл Лев Анпилогов, записанный в Заплавном в 1840 году", latitude: 51.7915749, longitude: 36.0086303, role: "origin" },
      { id: "karmalka", name: "Кармалка · 1828–1838", detail: "Переселенцы осели на земле деревни Сарманаевой", latitude: 52.963526, longitude: 54.697168, role: "destination", label: "permanent", labelSide: "top" },
      { id: "zaplavnoe", name: "Заплавное · 1840", detail: "Бузулукский уезд, тогда Оренбургская губерния", latitude: 52.975357, longitude: 51.702946, role: "destination", label: "permanent", labelSide: "top" },
      { id: "orenburg", name: "Оренбург", detail: "Губернский город; в его метриках — потомки переселенцев", latitude: 51.7682, longitude: 55.0969, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "izyak-nikitino", name: "Изяк-Никитино", detail: "Казачий посёлок у Черноотрожской станицы: Анпилоговы — оренбургские казаки", latitude: 51.875, longitude: 56.106667, role: "destination", label: "hover" },
    ],
    routes: [
      { from: "kursk", to: "karmalka", label: "1828: курская группа с поверенным Ларионом Анпилоговым" },
      { from: "kromy", to: "karmalka", label: "1829: орловские однодворцы, четыре двора Анпилоговых" },
      { from: "nikolskoe", to: "karmalka", label: "1832: список желающих осмотреть оренбургские земли", dashed: true },
      { from: "brekhova", to: "karmalka", label: "1838: Прохор Матвеевич из Бреховой" },
      { from: "anpilogova-fatezh", to: "zaplavnoe", label: "До 1840: переселенцы из деревни Анпилоговой" },
    ],
    legend: ["Где семьи осели", "Откуда пришли", "Пунктир — только список желающих"],
    note: "Линии соединяют место выхода, названное в документах, с местом поселения. Кальдяевский отряд и Ларионовка лежали рядом с Изяк-Никитином, у Черноотрожской станицы.",
    maxZoom: 7,
  },
  "volga-delta": {
    title: "Низовья Волги",
    subtitle: "Из Енотаевского уезда в Бахтемир, 1837",
    ariaLabel: "Карта: переселение семьи Михаила Анпилогова из Енотаевского уезда в село Бахтемир в дельте Волги в 1837 году",
    places: [
      { id: "enotaevsk", name: "Енотаевский уезд", detail: "Откуда семья Михаила Анпилогова была причислена в 1837 году", latitude: 47.24559, longitude: 47.02814, role: "origin", label: "permanent", labelSide: "right" },
      { id: "astrakhan", name: "Астрахань", detail: "Губернский город", latitude: 46.3497, longitude: 48.0408, role: "destination", label: "hover" },
      { id: "bakhtemir", name: "Бахтемир · 1837", detail: "Рыбацкое село в дельте Волги; фамилия здесь до 1917 года", latitude: 46.1576, longitude: 47.8157, role: "destination", label: "permanent", labelSide: "left" },
    ],
    routes: [
      { from: "enotaevsk", to: "bakhtemir", label: "1837: вниз по Волге в Бахтемир" },
    ],
    legend: ["Куда пришли", "Откуда пришли"],
    note: "Точка Енотаевского уезда стоит условно, в центре уезда: из какой деревни уезда пришла семья, неизвестно.",
    maxZoom: 9,
  },
  siberia: {
    title: "В Сибирь",
    subtitle: "Переселенцы 1880–1910-х годов",
    ariaLabel: "Карта переселений в Сибирь: из Курской губернии в Томскую, из Орловской губернии в Кожли, из Самарского уезда на Алтай и Бейская волость у Саян",
    places: [
      { id: "anpilogova", name: "Анпилогова (Курский уезд)", detail: "Больше тридцати жителей в прошении 1887 года о переселении в Томскую губернию", latitude: 51.7849, longitude: 36.0076, role: "origin", label: "permanent", labelSide: "bottom" },
      { id: "poroz", name: "Пороз", detail: "Грайворонский уезд: Анпиловы, ушедшие в Томскую губернию", latitude: 50.5766, longitude: 35.45751, role: "origin" },
      { id: "orel", name: "Орловская губерния", detail: "По преданию, откуда пришли братья Максим и Павел Трифоновичи", latitude: 52.968017, longitude: 36.099499, role: "origin" },
      { id: "berezovka", name: "Берёзовка (Самарский уезд)", detail: "Откуда уехала на Алтай Агафья Анпилогова", latitude: 54.138012, longitude: 50.459506, role: "origin", label: "permanent", labelSide: "top" },
      { id: "tomsk", name: "Томская губерния", detail: "Главное направление курских переселенцев", latitude: 56.488712, longitude: 84.952324, role: "destination", label: "permanent", labelSide: "left" },
      { id: "kozhli", name: "Кожли", detail: "Деревня под Томском; Павел Трифонович записан здесь в 1898 году", latitude: 56.583333, longitude: 85.888333, role: "destination", label: "permanent", labelSide: "right" },
      { id: "barnaulskoe", name: "Барнаульское", detail: "Шадринская волость Барнаульского уезда, Алтай", latitude: 52.98, longitude: 82.94, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "beya", name: "Бейская волость · 1911–1917", detail: "Переселенческое дело у Саян", latitude: 53.0533, longitude: 90.9139, role: "destination", label: "permanent", labelSide: "top" },
    ],
    routes: [
      { from: "anpilogova", to: "tomsk", label: "1887: прошение о переселении в Томскую губернию" },
      { from: "poroz", to: "tomsk", label: "Грайворонский уезд → Томская губерния" },
      { from: "orel", to: "kozhli", label: "По семейному преданию: Орловская губерния → Кожли", dashed: true },
      { from: "berezovka", to: "barnaulskoe", label: "Самарский уезд → Алтай" },
    ],
    legend: ["Куда пришли", "Откуда вышли", "Пунктир — по семейному преданию"],
    note: "Откуда пришёл Анпилогов Бейской волости, неизвестно, поэтому линии к ней нет. Енисейское и уфимское направления из указателя ГАКО на карте не показаны: точные места назначения не названы.",
    maxZoom: 6,
  },
  "new-life": {
    title: "Города, шахты и приходы",
    subtitle: "Где носители фамилии жили и работали в 1860–1910-х годах",
    ariaLabel: "Карта: Симферополь, Оренбург и Кармалка, Таганрогский округ, Дружковка, Самара, Новогригорьевка, Мелитополь и Киев, а также уезды, откуда пришли семьи",
    places: [
      { id: "simferopol", name: "Симферополь · 1868", detail: "Смерть восьмидневной Матроны, дочери Сергея из Рыльского уезда", latitude: 44.952146, longitude: 34.102486, role: "destination", label: "permanent", labelSide: "right" },
      { id: "karmalka", name: "Кармалка", detail: "Отсюда Гордей ушёл на службу; здесь в 1915 году служил диакон Дмитрий", latitude: 52.963526, longitude: 54.697168, role: "origin", label: "permanent", labelSide: "right" },
      { id: "orenburg", name: "Оренбург · 1876–1891", detail: "Гордей Григорьевич — унтер-офицер, фельдфебель, жандарм; рядом, в Слоновке, служил диакон Афиноген", latitude: 51.7682, longitude: 55.0969, role: "destination", label: "permanent", labelSide: "right" },
      { id: "taganrog", name: "Таганрогский округ · 1891", detail: "Иногородний Егор Владимирович из Фатежского уезда", latitude: 47.2362, longitude: 38.8969, role: "destination", label: "permanent", labelSide: "bottom" },
      { id: "druzhkovka", name: "Дружковка · 1900", detail: "Семья Павла Ивановича; Гавриил Ефимович записан в том же Бахмутском уезде в 1910 году", latitude: 48.6295, longitude: 37.5446, role: "destination", label: "permanent", labelSide: "right" },
      { id: "samara", name: "Самара · 1901", detail: "Венчание Григория Михайловича, крестьянина Бугульминского уезда", latitude: 53.195626, longitude: 50.101493, role: "destination", label: "permanent", labelSide: "left" },
      { id: "novohryhorivka", name: "Новогригорьевка · 1907", detail: "Крестины Любови; Алексей Авраамович ещё крестьянин", latitude: 47.32274, longitude: 36.283873, role: "destination", label: "hover" },
      { id: "melitopol", name: "Мелитополь · 1915", detail: "Крестины Валентины; Алексей Авраамович уже мещанин", latitude: 46.846727, longitude: 35.382728, role: "destination", label: "permanent", labelSide: "left" },
      { id: "kyiv", name: "Киев · 1916", detail: "Рождение Бориса, сына Егора Космича", latitude: 50.450034, longitude: 30.524136, role: "destination", label: "permanent", labelSide: "left" },
      { id: "kromy", name: "Кромской уезд", detail: "Откуда вышли Алексей Авраамович и Егор Космич", latitude: 52.689445, longitude: 35.773659, role: "origin" },
      { id: "rylsk", name: "Рыльский уезд", detail: "Откуда пришли Сергей и Павел Иванович", latitude: 51.570538, longitude: 34.683506, role: "origin" },
      { id: "fatezh", name: "Фатежский уезд", detail: "Откуда пришла семья Егора Владимировича", latitude: 52.089344, longitude: 35.859486, role: "origin" },
      { id: "korocha", name: "Корочанский уезд", detail: "Откуда пришёл Гавриил Ефимович", latitude: 50.810741, longitude: 37.195316, role: "origin" },
      { id: "bugulma", name: "Бугульминский уезд", detail: "Прежнее общество Григория Михайловича", latitude: 54.5364, longitude: 52.7894, role: "origin" },
    ],
    routes: [
      { from: "rylsk", to: "simferopol", label: "Рыльский уезд → Симферополь" },
      { from: "karmalka", to: "orenburg", label: "Гордей: из Кармалки на службу в Оренбург" },
      { from: "fatezh", to: "taganrog", label: "Фатежский уезд → Таганрогский округ" },
      { from: "rylsk", to: "druzhkovka", label: "Рыльский уезд → Дружковка" },
      { from: "korocha", to: "druzhkovka", label: "Корочанский уезд → Бахмутский уезд" },
      { from: "bugulma", to: "samara", label: "Бугульминский уезд → Самара" },
      { from: "kromy", to: "novohryhorivka", label: "Алексей: Кромской уезд → Новогригорьевка" },
      { from: "novohryhorivka", to: "melitopol", label: "Алексей: Новогригорьевка → Мелитополь" },
      { from: "kromy", to: "kyiv", label: "Кромской уезд → Киев" },
    ],
    legend: ["Где застала запись", "Откуда пришла семья"],
    note: "Линии соединяют уезд, названный в записи, с местом, где семью застал документ; дороги и годы переезда не показаны.",
    maxZoom: 7,
  },
};

/** The story map with its text in the given locale; Russian is the source. */
export function getStoryMap(id: string, locale: Locale): StoryMapConfig | undefined {
  const config = storyMaps[id];
  if (!config || locale === "ru") return config;
  const translation = storyMapTranslations[locale][id];
  if (!translation) return config;

  return {
    ...config,
    title: translation.title,
    subtitle: translation.subtitle,
    ariaLabel: translation.ariaLabel,
    legend: translation.legend,
    note: translation.note,
    places: config.places.map((place) => {
      const [name, detail] = translation.places[place.id] ?? [place.name, place.detail];
      return { ...place, name, detail };
    }),
    routes: config.routes.map((route, index) => ({ ...route, label: translation.routes[index] ?? route.label })),
  };
}
