type SourceExcerptDefinition = {
  eyebrow: string;
  title: string;
  transcription: string;
  citation: string;
  image: {
    src: string;
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
      src: "/archive/evidence/publications/sluzhebnye-minei-1886/pages/0436.jpg",
      width: 2346,
      height: 3851,
      viewBox: [120, 1400, 2100, 740],
      focus: [
        [300, 1810, 1900, 82],
        [190, 1900, 2020, 82],
        [120, 1992, 1930, 82],
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
      src: "/archive/evidence/publications/ruslang/etymology-1971/pages/0279.jpg",
      width: 1005,
      height: 1604,
      viewBox: [42, 480, 920, 360],
      focus: [
        [54, 555, 895, 180],
        [54, 735, 895, 90],
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
      src: "/archive/evidence/publications/zor-40-1979/pages/0043-tonkoy-onfilogov.png",
      width: 1127,
      height: 1654,
      viewBox: [390, 790, 665, 112],
      focus: [[744, 812, 300, 36]],
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
      src: "/archive/evidence/rgada/f181-op2-d120/0060.jpg",
      width: 3428,
      height: 2182,
      viewBox: [210, 390, 1510, 260],
      focus: [[300, 420, 1260, 96]],
    },
    sourceHref: "http://rgada.info/kueh/1/181_2_120/0060.jpg",
    registryHref: "/read/research/sources#s-orel-1596",
  },
  "nes-anfilogovy": {
    eyebrow: "Энциклопедическая статья 1911 года",
    title: "Дворянский род, Василий Дмитриевич и VI часть",
    transcription: "«Анфилоговы (в старину также Анпилоговы и Онпилоговы), русский дворянский род, ведущий начало от Василия Дмитриевича А., „записанного по городу Орлу московского стола в десятках“. Род А. записан в VI ч. род. кн. Курской губ.»",
    citation: "«Новый энциклопедический словарь» / под ред. К. К. Арсеньева. СПб.: Ф. А. Брокгауз, И. А. Ефрон, 1911. Т. 3. Стб. 108.",
    image: {
      src: "/archive/evidence/publications/nes-1911/pages/0069.jpg",
      width: 992,
      height: 1512,
      viewBox: [495, 830, 475, 185],
      focus: [
        [535, 881, 435, 20],
        [515, 902, 455, 20],
        [515, 923, 455, 20],
        [515, 944, 455, 20],
        [515, 965, 450, 20],
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
      src: "/archive/evidence/publications/savelov-1906/pages/0066.jpg",
      width: 1448,
      height: 1973,
      viewBox: [300, 570, 900, 390],
      focus: [
        [420, 634, 680, 26],
        [420, 667, 775, 26],
        [356, 700, 840, 26],
        [356, 733, 815, 26],
        [356, 766, 840, 26],
        [418, 798, 775, 26],
        [356, 831, 840, 26],
        [418, 864, 778, 26],
        [356, 897, 730, 26],
      ],
    },
    sourceHref: "https://archive.org/details/rodoslovnyiazap00savegoog/page/n71/mode/2up",
    registryHref: "/read/research/sources#s-nobility-savelov",
  },
};

export function SourceExcerpt({ id }: { id: string }) {
  const excerpt = excerpts[id];
  if (!excerpt) return null;

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
        aria-label={`${excerpt.title}: открыть полный источник`}
      >
        <svg
          viewBox={`${viewX} ${viewY} ${viewWidth} ${viewHeight}`}
          role="img"
          aria-label={excerpt.title}
        >
          <image
            href={excerpt.image.src}
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
        <nav aria-label="Ссылки на источник">
          <a href={excerpt.sourceHref} target="_blank" rel="noreferrer">Полный источник ↗</a>
          <a href={excerpt.registryHref}>Карточка источника</a>
        </nav>
        <small>Показан только фрагмент, необходимый для проверки чтения; золотистая подсветка добавлена редакцией.</small>
      </figcaption>
    </figure>
  );
}
