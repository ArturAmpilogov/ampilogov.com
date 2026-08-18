/* eslint-disable @next/next/no-img-element */

const records = [
  {
    year: "1892",
    child: "Пелагея Анпилогова",
    form: "Анпилов + «го»",
    detail: "Над окончанием фамилии отца приписано «го»: Анпилов превращён в Анпилогов.",
    image: "/archive/evidence/familysearch/timoshovka/pelageya-anpilogova-1892.png",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC6-MV79?lang=en",
    alt: "Метрическая запись о рождении Пелагеи в Тимошевке 6 октября 1892 года; в фамилии отца над словом Анпилов приписано го",
  },
  {
    year: "1896",
    child: "Агафия Анпилова",
    form: "Анпилов",
    detail: "В записи о рождении Агафии фамилия её отца сокращена до формы Анпилов.",
    image: "/archive/evidence/familysearch/timoshovka/agafya-anpilova-1896.png",
    href: "https://www.familysearch.org/ark:/61903/3:1:3Q9M-CSSW-QSY7-L",
    alt: "Метрическая запись о рождении Агафии Анпиловой в Тимошевке 8 февраля 1896 года",
  },
  {
    year: "1897",
    child: "Елена Ампилогова",
    form: "Ампилоговъ",
    detail: "Год спустя в той же семье появляется полная форма Ампилоговъ — в старой орфографии с твёрдым знаком.",
    image: "/archive/evidence/familysearch/timoshovka/elena-ampilogova-1897.png",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC8-SYSN?lang=en",
    alt: "Разворот метрической книги с записью о рождении Елены Ампилоговой в Тимошевке 30 апреля 1897 года",
  },
];

export function SurnameVariantsEvidence() {
  return (
    <figure className="surname-variants-evidence">
      <figcaption>
        <span>Одна семья · Тимошевка</span>
        <strong>Три записи — три написания фамилии</strong>
      </figcaption>

      <ol>
        {records.map((record) => (
          <li key={record.year}>
            <header>
              <time>{record.year}</time>
              <div>
                <span>{record.child}</span>
                <strong>{record.form}</strong>
              </div>
            </header>

            <a
              className={`surname-variants-scan surname-variants-scan--${record.year}`}
              href={record.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Открыть запись о ${record.child} в FamilySearch в новой вкладке`}
              title="Открыть запись в FamilySearch — может потребоваться вход"
            >
              <img src={record.image} alt={record.alt} loading="lazy" />
            </a>

            <p>{record.detail}</p>
            <a className="surname-variants-source" href={record.href} target="_blank" rel="noreferrer">
              FamilySearch ↗
            </a>
          </li>
        ))}
      </ol>

      <p className="surname-variants-conclusion">
        Семья не сменила фамилию трижды. Менялось то, как её услышали и записали.
      </p>
    </figure>
  );
}
