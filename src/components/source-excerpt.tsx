import { sourceExcerptCopy, sourceExcerptTranslations } from "@/components/source-excerpt.copy";
import { localizeHref } from "@/i18n/routing";
import { getLocale } from "@/i18n/server";

type SourceExcerptDefinition = {
  eyebrow: string;
  title: string;
  transcription: string;
  citation: string;
  // Full scans under /archive/evidence are private (404 without the backup
  // cookie), so the figure loads a public crop of the page band it shows.
  // x/y/width/height place the crop on the full page; viewBox and focus stay
  // in page coordinates. The crop covers the viewBox plus the side margin the
  // SVG reveals when its 330px height cap letterboxes it at 940px wide.
  image: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    viewBox: [number, number, number, number];
    focus: Array<[number, number, number, number]>;
  };
  sourceHref: string;
  registryHref: string;
};

const excerpts: Record<string, SourceExcerptDefinition> = {
  "novgorod-menaion-amfilogiy-1097": {
    eyebrow: "Текст службы 1097 года",
    title: "Каким видели святителя в Новгороде",
    transcription: "В службе Амфилогия называют «божественным громом и трубой духовной», наставником верующих и противником ересей; затем просят о его непрестанной молитве за всех.",
    citation: "«Служебные минеи за сентябрь, октябрь и ноябрь» / изд. В. Ягич. СПб.: Типография Императорской Академии наук, 1886. С. 436; текст по новгородской Служебной Минее 1097 года.",
    image: {
      src: "/evidence/publications/sluzhebnye-minei-1886/crops/0436-novgorod-menaion-amfilogiy-1097.jpg",
      x: 74,
      y: 1400,
      width: 2192,
      height: 740,
      viewBox: [120, 1400, 2100, 740],
      focus: [
        [339, 1850, 1861, 71],
        [234, 1929, 1966, 75],
        [232, 2010, 1261, 56],
      ],
    },
    sourceHref: "https://archive.org/details/p2sluzhebnyiamin02orthuoft/page/436/mode/2up",
    registryHref: "/read/research/sources#s-name-1097",
  },
  "nikonov-ampilogov": {
    eyebrow: "Две статьи на одной странице",
    title: "Почему появились формы «Анпилов» и «Анпилогов»",
    transcription: "Для формы Анпилов Никонов отдельно объясняет оба изменения: ф → п при освоении заимствованного имени и м → н, чтобы избежать соседства двух губных согласных. Анпилогов он прямо производит от разговорного Анпилог и церковного Амфилохий.",
    citation: "В. А. Никонов. «Опыт словаря русских фамилий. II» // Этимология. 1971. М.: Наука, 1973. С. 279.",
    image: {
      src: "/evidence/publications/ruslang/etymology-1971/crops/0279-nikonov-ampilogov.jpg",
      x: 0,
      y: 480,
      width: 1005,
      height: 360,
      viewBox: [42, 480, 920, 360],
      focus: [
        [50, 521, 906, 211],
        [50, 733, 906, 62],
      ],
    },
    sourceHref: "https://ruslang.ru/doc/etymology/1971/13-nikonov.pdf",
    registryHref: "/read/research/sources#s-name-nikonov",
  },
  "tonkoy-onfilogov": {
    eyebrow: "Научная публикация рукописной копии",
    title: "Тонкой Онфилогов среди непашенных дворов",
    transcription: "«…а непашенных дворов: в. Некраско Данилов, в. Тонкой Онфилогов…»",
    citation: "С. М. Каштанов. «По следам троицких копийных книг XVI в.» // Записки отдела рукописей. Вып. 40. М.: Книга, 1979. С. 43, док. № 3 (в PDF — с. 44).",
    image: {
      src: "/evidence/publications/zor-40-1979/crops/0043-tonkoy-onfilogov.png",
      x: 376,
      y: 790,
      width: 693,
      height: 112,
      viewBox: [390, 790, 665, 112],
      focus: [[736, 823, 284, 27]],
    },
    sourceHref: "https://azbyka.ru/otechnik/assets/uploads/zor/%D0%97%D0%9E%D0%A0_40.pdf#page=44",
    registryHref: "/read/research/sources#s-uglich-1536",
  },
  "pavel-anfilogov": {
    eyebrow: "Оригинальный архивный лист",
    title: "Павел Терентьев сын Анфилогов",
    transcription: "Редакционное чтение строки: «Павел Терентьев сын Анфилогов».",
    citation: "Российский государственный архив древних актов. Ф. 181. Оп. 2. Д. 120. Л. 58 об. Цифровой образ 0060.",
    image: {
      src: "/evidence/rgada/f181-op2-d120/crops/0060-pavel-anfilogov.jpg",
      x: 179,
      y: 390,
      width: 1572,
      height: 260,
      viewBox: [210, 390, 1510, 260],
      focus: [[300, 420, 1260, 96]],
    },
    sourceHref: "http://rgada.info/kueh/1/181_2_120/0060.jpg",
    registryHref: "/read/research/sources#s-orel-1596",
  },
  "onfilogovo-tver-1540": {
    eyebrow: "Писцовая книга Тверского уезда",
    title: "Деревня, названная по человеку",
    transcription: "«Къ тому жъ селу деревни: дер. Онфилогово: 4 дв.; пашни въ полѣ 30 четьи, сѣна 30 коп.» — первая из шести деревень села Никольское Свечино, за Стефанидой, женой Ивана Юрлова. Вдовство источник не указывает.",
    citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб.: Изд. Имп. Русского географического общества, 1877. С. 111. Писцовая книга 7048 (1539/40) года письма Ивана Петровича Заболоцкого и Михаила Иванова Усова-Татищева; рукопись — РГАДА, ф. 1209, оп. 1, кн. 466.",
    image: {
      src: "/evidence/publications/piscovye-knigi-1539-1540-tver/crops/0111-onfilogovo-tver-1540.png",
      x: 51,
      y: 640,
      width: 1721,
      height: 300,
      viewBox: [85, 640, 1670, 300],
      focus: [[95, 810, 1520, 58]],
    },
    sourceHref: "https://archive.org/details/moscha-regia/page/n115/mode/1up",
    registryHref: "/read/research/sources#s-tver-1540",
  },
  "anpilog-onanin-1594": {
    eyebrow: "Орловская писцовая книга · 1594/95",
    title: "Анпилог — ещё имя, а не фамилия",
    transcription: "«За Кондрашкомъ за Вавиловымъ сыномъ Онаньина, что было за дѣдомъ его за Анпилогомъ (sic) за Ивановымъ сыномъ Онаньина въ тойже дер. на Государнинѣ селищѣ, на р. на Орлѣ, подъ Корчаковымъ лѣсомъ…»",
    citation: "«Писцовыя книги Московскаго государства». Ч. I. Отд. 2 / под ред. Н. В. Калачова. СПб., 1877. С. 948; Орловский уезд, Корчаковский стан. Помета «(sic)» принадлежит издателю. Рукопись — РГАДА, ф. 1209, оп. 1, д. 329; старый шифр МАМЮ — № 399.",
    image: {
      src: "/evidence/publications/piscovye-knigi-1594-1595/crops/0948-anpilog-onanin-1594.png",
      x: 61,
      y: 585,
      width: 1711,
      height: 320,
      viewBox: [95, 585, 1660, 320],
      focus: [
        [238, 585, 1492, 54],
        [187, 644, 1541, 54],
      ],
    },
    sourceHref: "https://archive.org/details/moscha-regia/page/n948/mode/1up",
    registryHref: "/read/research/sources#s-orel-1594-anpilog",
  },
  "nes-anfilogovy": {
    eyebrow: "Энциклопедическая статья 1911 года",
    title: "Дворянский род, Василий Дмитриевич и VI часть",
    transcription: "«Анфилоговы (в старину также Анпилоговы и Онпилоговы), русский дворянский род, ведущий начало от Василия Дмитриевича А., „записанного по городу Орлу московского стола в десятках“. Род А. записан в VI ч. род. кн. Курской губ.»",
    citation: "«Новый энциклопедический словарь» / под ред. К. К. Арсеньева. СПб.: Ф. А. Брокгауз, И. А. Ефрон, 1911. Т. 3. Стб. 108.",
    image: {
      src: "/evidence/publications/nes-1911/crops/0069-nes-anfilogovy.jpg",
      x: 459,
      y: 830,
      width: 533,
      height: 185,
      viewBox: [495, 830, 475, 185],
      focus: [
        [502, 884, 463, 17],
        [495, 902, 470, 17],
        [495, 920, 470, 17],
        [495, 939, 470, 17],
        [495, 957, 470, 17],
      ],
    },
    sourceHref: "http://viewer.rusneb.ru/ru/rsl01004103475?page=69",
    registryHref: "/read/research/sources#s-nobility-nes",
  },
  "savelov-anfilogovy": {
    eyebrow: "Генеалогический справочник 1906 года",
    title: "Ранние Анфилоговы, Анпилоговы и Онпилоговы",
    transcription: "«Анфилоговы, в старину также Анпилоговы, Онпилоговы. Василий, Тимофей и Карп Микуловичи, Беляй Васильевич, Иван Першин, Иван Нечаев, Софон Тимофеевич и Ермак Пахомович А. в 1594 г. владели поместьями в Корчаковском стану Орловского у. Василий Семенович О. в 1628 г. был верстан новичным окладом по Курску. Иван Анпилогов, старооскольский сын боярский, в 1695 г. служил в копейщиках.»",
    citation: "Л. М. Савёлов. «Родословные записи: опыт родословного словаря русского древнего дворянства». М., 1906. Вып. 1. С. 66.",
    image: {
      src: "/evidence/publications/savelov-1906/crops/0066-savelov-anfilogovy.jpg",
      x: 176,
      y: 570,
      width: 1148,
      height: 390,
      viewBox: [300, 570, 900, 390],
      focus: [
        [420, 637, 710, 31],
        [418, 668, 781, 32],
        [355, 700, 844, 32],
        [356, 732, 843, 33],
        [355, 765, 842, 31],
        [419, 796, 779, 28],
        [354, 829, 397, 31],
        [418, 860, 781, 32],
        [353, 894, 452, 31],
      ],
    },
    sourceHref: "https://archive.org/details/rodoslovnyiazap00savegoog/page/n71/mode/2up",
    registryHref: "/read/research/sources#s-nobility-savelov",
  },
};

export function SourceExcerpt({ id }: { id: string }) {
  const locale = getLocale();
  const text = sourceExcerptCopy[locale];
  const definition = excerpts[id];
  if (!definition) return null;
  const excerpt = locale === "ru" ? definition : { ...definition, ...sourceExcerptTranslations[locale][id] };

  const [viewX, viewY, viewWidth, viewHeight] = excerpt.image.viewBox;

  return (
    <figure className="source-excerpt">
      <header className="source-excerpt-heading">
        <span>{excerpt.eyebrow}</span>
        <strong>{excerpt.title}</strong>
      </header>

      <a
        className="source-excerpt-image"
        href={excerpt.sourceHref}
        target="_blank"
        rel="noreferrer"
        aria-label={text.openFullSource(excerpt.title)}
      >
        <svg
          viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
          role="img"
          aria-label={excerpt.title}
        >
          <image
            href={excerpt.image.src}
            x={excerpt.image.x}
            y={excerpt.image.y}
            width={excerpt.image.width}
            height={excerpt.image.height}
          />
          {excerpt.image.focus.map(([focusX, focusY, focusWidth, focusHeight], index) => (
            <rect
              className="source-excerpt-focus"
              key={`${focusX}-${focusY}-${index}`}
              x={focusX}
              y={focusY}
              width={focusWidth}
              height={focusHeight}
              rx="2"
            />
          ))}
        </svg>
      </a>

      <blockquote>{excerpt.transcription}</blockquote>

      <figcaption>
        <p>{excerpt.citation}</p>
        <nav aria-label={text.sourceLinks}>
          <a href={excerpt.sourceHref} target="_blank" rel="noreferrer">{text.fullSource}</a>
          <a href={localizeHref(locale, excerpt.registryHref)}>{text.sourceCard}</a>
        </nav>
        <small>{text.highlightNote}</small>
      </figcaption>
    </figure>
  );
}
