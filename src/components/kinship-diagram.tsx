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
  "orel-1594": {
    eyebrow: "Писцовая книга 1594/95 года",
    title: "Две группы родства в Баздыреве",
    paths: [
      {
        label: "Прямо названы детьми Микулы",
        generations: [
          [{ name: "Микула", note: "отец назван в отчестве" }],
          [
            { name: "Василий", note: "свой помещичий двор" },
            { name: "Тимофей", note: "свой помещичий двор" },
            { name: "Карп", note: "свой помещичий двор" },
          ],
        ],
      },
      {
        label: "Вероятное родство по отчеству и месту",
        certainty: "probable",
        generations: [
          [{ name: "Василий", note: "предполагаемый общий отец" }],
          [
            { name: "Беляй Васильевич", note: "Онфилогов" },
            { name: "Осип Васильевич", note: "Анфилогов" },
          ],
        ],
      },
    ],
    note: "Сплошная связь передаёт формулу источника; пунктир — осторожное сопоставление двух Васильевичей.",
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

export function KinshipDiagram({ id }: { id: string }) {
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
