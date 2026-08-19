/* eslint-disable @next/next/no-img-element */

const november23SourceHref = "https://www.familysearch.org/ark:/61903/3:1:3QS7-997T-XPLV";
const romanenkoSourceHref = "https://www.familysearch.org/ark:/61903/1:1:6X7Z-ZPFT?lang=en";

export function CalendarNameExamples() {
  return (
    <figure className="calendar-name-pair">
      <div className="calendar-name-pair-item">
        <header>
          <span>Киев · 23 ноября 1803</span>
          <strong>Анфилохий Романенко</strong>
        </header>
        <a
          className="calendar-name-pair-image"
          href={romanenkoSourceHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Открыть карточку Анфилохия Романенко в FamilySearch в новой вкладке"
          title="Открыть карточку в FamilySearch — может потребоваться вход"
        >
          <img
            src="/archive/evidence/familysearch/naming/amphilochius-romanenko-1803-row.png"
            alt="Строка метрической книги о рождении Анфилохия Романенко 23 ноября 1803 года"
          />
        </a>
        <p>
          В записи названы родители Анфилохия Романенко. Он родился в день памяти святителя —
          23 ноября 1803 года. <a href={romanenkoSourceHref} target="_blank" rel="noreferrer">FamilySearch ↗</a>
        </p>
      </div>

      <div className="calendar-name-pair-item">
        <header>
          <span>Самара · 23 ноября 1846 · крещение 24 ноября</span>
          <strong>Незаконнорождённый Анфилохий</strong>
        </header>
        <a
          className="calendar-name-pair-image calendar-name-pair-image--source-crop"
          href={november23SourceHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Открыть метрическую запись о незаконнорождённом Анфилохии в FamilySearch в новой вкладке"
          title="Открыть изображение в FamilySearch — может потребоваться вход"
        >
          <img
            src="/archive/evidence/familysearch/naming/amphilochius-november-23.png"
            alt="Фрагмент метрической книги: незаконнорождённый Анфилохий, рождение в Самаре 23 ноября 1846 года, крещение 24 ноября"
            loading="lazy"
          />
        </a>
        <p>
          Ребёнок родился в Самаре 23 ноября 1846 года и был крещён на следующий день. В метрической
          записи отец не назван. <a href={november23SourceHref} target="_blank" rel="noreferrer">FamilySearch ↗</a>
        </p>
      </div>

      <figcaption>
        Два рождения разделяют 43 года и сотни километров; в обоих случаях имя следует дню церковной
        памяти Амфилохия Иконийского.
      </figcaption>
    </figure>
  );
}
