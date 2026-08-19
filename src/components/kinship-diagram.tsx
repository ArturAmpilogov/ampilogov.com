type Person = {
  name: string;
  note?: string;
};

type KinshipPath = {
  label: string;
  certainty?: "documented" | "probable";
  generations: Person[][];
};

const diagrams: Record<string, { eyebrow: string; title: string; paths: KinshipPath[]; note?: string }> = {
  amphilochos: {
    eyebrow: "Фиванский цикл",
    title: "Семья прорицателя",
    paths: [
      {
        label: "Родство в античной традиции",
        generations: [
          [
            { name: "Амфиарай", note: "прорицатель" },
            { name: "Эрифила", note: "мать героев" },
          ],
          [
            { name: "Алкмеон", note: "предводитель эпигонов" },
            { name: "Амфилохос", note: "прорицатель и герой-врач" },
          ],
        ],
      },
    ],
  },
  "orel-1625": {
    eyebrow: "Выписи 1625 года",
    title: "Три прямо названные ветви",
    paths: [
      {
        label: "Карповы дети",
        generations: [
          [{ name: "Карп Анфилогов" }],
          [{ name: "Мартын" }, { name: "Кузьма" }],
        ],
      },
      {
        label: "Ивановы дети · деревня Белая",
        generations: [
          [{ name: "Иван Анфилогов" }],
          [{ name: "Илья" }, { name: "Василий" }, { name: "Антон" }],
        ],
      },
      {
        label: "Васильевы дети · Баздырево",
        generations: [
          [{ name: "Василий Анфилогов" }],
          [{ name: "Алексей" }, { name: "Григорий" }],
        ],
      },
    ],
    note: "Все три связи отец — дети прямо названы в выписи 1625 года; схема не добавляет предполагаемых поколений.",
  },
  sergey: {
    eyebrow: "Три поколения в одной записи",
    title: "Семья Сергея Григорьевича",
    paths: [
      {
        label: "Обоянская десятня 1651 года",
        generations: [
          [{ name: "Григорий", note: "назван только в отчестве сына" }],
          [{ name: "Сергей Григорьевич", note: "городовой сын боярский" }],
          [
            { name: "Сидор", note: "20 лет" },
            { name: "Еремей", note: "10 лет" },
          ],
        ],
      },
    ],
  },
  anpilovka: {
    eyebrow: "Старооскольские служилые книги",
    title: "Анпиловы до появления селения",
    paths: [
      {
        label: "Линия Герасима",
        generations: [
          [{ name: "Герасим Анпилов", note: "записан в 1668 году" }],
          [{ name: "Степан Герасимов", note: "копейщик" }],
        ],
      },
      {
        label: "Линия Иева Михайлова",
        generations: [
          [{ name: "Михаил", note: "назван в отчествах сыновей" }],
          [{ name: "Иев Михайлов", note: "копейщик" }],
          [
            { name: "Ларион Иевлев", note: "копейная служба" },
            { name: "Анисим Иевлев", note: "копейная служба" },
          ],
        ],
      },
      {
        label: "Линия Григория Михайлова",
        generations: [
          [{ name: "Михаил", note: "назван в отчестве сына" }],
          [{ name: "Григорий Михайлов", note: "служилый двор" }],
        ],
      },
    ],
  },
  bazdyrevo: {
    eyebrow: "Сказка 1697 года",
    title: "Три поколения между двумя уездами",
    paths: [
      {
        label: "Родство названо в документе",
        generations: [
          [{ name: "Аким Иванович", note: "бывший помещик Баздырева" }],
          [{ name: "имя утрачено", note: "сын или дочь Акима" }],
          [{ name: "Тит Анпилогов", note: "внук · поместье в Щиграх" }],
        ],
      },
    ],
  },
};

function AmphilochosFamilyTree() {
  return (
    <figure className="kinship-diagram kinship-diagram--family-tree">
      <figcaption>
        <span>Фиванский цикл</span>
        <strong>Семья прорицателя</strong>
      </figcaption>

      <div
        className="kinship-family-tree"
        aria-label="Амфиарай и Эрифила — родители Алкмеона и Амфилохоса"
        role="group"
      >
        <svg aria-hidden="true" className="kinship-family-tree-lines" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path className="kinship-family-tree-line" d="M24 19 H76" />
          <path className="kinship-family-tree-line" d="M50 19 V57 H24 V82" />
          <path className="kinship-family-tree-line" d="M50 57 H76 V82" />
          <circle className="kinship-family-tree-joint" cx="50" cy="19" r="1.35" />
          <circle className="kinship-family-tree-end" cx="24" cy="82" r="1.1" />
          <circle className="kinship-family-tree-end" cx="76" cy="82" r="1.1" />
        </svg>

        <section aria-label="Родители" className="kinship-family-tier kinship-family-tier--parents">
          <small>Родители</small>
          <div>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>Амфиарай</strong>
              <em>прорицатель</em>
            </span>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>Эрифила</strong>
              <em>мать героев</em>
            </span>
          </div>
        </section>

        <section aria-label="Дети" className="kinship-family-tier kinship-family-tier--children">
          <small>Сыновья</small>
          <div>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>Алкмеон</strong>
              <em>предводитель эпигонов</em>
            </span>
            <span className="kinship-family-person" tabIndex={0}>
              <strong>Амфилохос</strong>
              <em>прорицатель и герой-врач</em>
            </span>
          </div>
        </section>
      </div>
    </figure>
  );
}

type OrelBranch = {
  certainty: "documented" | "probable";
  label: string;
  explanation: string;
  parent: Person;
  children: Person[];
};

const orelBranches: OrelBranch[] = [
  {
    certainty: "documented",
    label: "Родство названо прямо",
    explanation: "Василий, Тимофей и Карп записаны Микулиными детьми.",
    parent: { name: "Микула", note: "отец назван в отчествах сыновей" },
    children: [
      { name: "Василий", note: "Микулин сын Анфилогов" },
      { name: "Тимофей", note: "Микулин сын Анфилогов" },
      { name: "Карп", note: "Микулин сын Анфилогов" },
    ],
  },
  {
    certainty: "probable",
    label: "Вероятное родство",
    explanation: "Одинаковое отчество и одна деревня позволяют предполагать общего отца.",
    parent: { name: "Василий", note: "предполагаемый общий отец" },
    children: [
      { name: "Беляй", note: "Васильев сын Онфилогов" },
      { name: "Осип", note: "Васильев сын Анфилогов" },
    ],
  },
];

function Orel1594FamilyTree() {
  return (
    <figure className="kinship-diagram kinship-diagram--orel-tree">
      <figcaption>
        <span>Писцовая книга 1594/95 года</span>
        <strong>Родство в Баздыреве</strong>
      </figcaption>

      <div
        className="orel-kinship-trees"
        aria-label="Документированная семья Микулы и предполагаемая семья Василия"
        role="group"
      >
        {orelBranches.map((branch) => {
          const childCount = branch.children.length;
          const childPositions = childCount === 3 ? [16.67, 50, 83.33] : [25, 75];
          const left = childPositions[0];
          const right = childPositions[childPositions.length - 1];

          return (
            <section
              className={`orel-kinship-branch is-${branch.certainty}`}
              key={branch.label}
            >
              <header>
                <strong>{branch.label}</strong>
                <p>{branch.explanation}</p>
              </header>

              <div className="orel-family-tree">
                <span className="orel-family-person is-parent">
                  <strong>{branch.parent.name}</strong>
                  <em>{branch.parent.note}</em>
                </span>

                <svg
                  aria-hidden="true"
                  className="orel-family-connectors"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 60"
                >
                  <path d={`M50 0 V28 M${left} 28 H${right}`} />
                  {childPositions.map((position) => (
                    <path d={`M${position} 28 V60`} key={position} />
                  ))}
                  <circle cx="50" cy="28" r="1.35" />
                </svg>

                <div className={`orel-family-children has-${childCount}-children`}>
                  {branch.children.map((child) => (
                    <span className="orel-family-person is-child" key={child.name}>
                      <strong>{child.name}</strong>
                      <em>{child.note}</em>
                    </span>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <p>
        Сплошная линия повторяет прямую формулу писцовой книги; пунктир показывает вероятную связь,
        которую документ не называет родством.
      </p>
    </figure>
  );
}

export function KinshipDiagram({ id }: { id: string }) {
  if (id === "amphilochos") return <AmphilochosFamilyTree />;
  if (id === "orel-1594") return <Orel1594FamilyTree />;

  const diagram = diagrams[id];
  if (!diagram) return null;

  return (
    <figure className="kinship-diagram">
      <figcaption>
        <span>{diagram.eyebrow}</span>
        <strong>{diagram.title}</strong>
      </figcaption>

      <div className="kinship-diagram-paths">
        {diagram.paths.map((path) => (
          <section
            className={`kinship-path${path.certainty === "probable" ? " is-probable" : ""}`}
            key={path.label}
          >
            <h3>{path.label}</h3>
            <ol aria-label={path.label}>
              {path.generations.map((generation, generationIndex) => (
                <li key={`${path.label}-${generationIndex}`}>
                  <small>{generationIndex + 1}-е поколение</small>
                  <div>
                    {generation.map((person) => (
                      <span className="kinship-person" key={`${person.name}-${person.note ?? ""}`} tabIndex={0}>
                        <strong>{person.name}</strong>
                        {person.note ? <em>{person.note}</em> : null}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      {diagram.note ? <p>{diagram.note}</p> : null}
    </figure>
  );
}
