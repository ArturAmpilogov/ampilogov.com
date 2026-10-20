/* eslint-disable @next/next/no-img-element */
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const records = [
  {
    year: "1892",
    form: "Анпилов + «го»",
    image: "/archive/evidence/familysearch/timoshovka/pelageya-anpilogova-1892.png",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC6-MV79?lang=en",
  },
  {
    year: "1896",
    form: "Анпилов",
    image: "/archive/evidence/familysearch/timoshovka/agafya-anpilova-1896.png",
    href: "https://www.familysearch.org/ark:/61903/3:1:3Q9M-CSSW-QSY7-L",
  },
  {
    year: "1897",
    form: "Ампилоговъ",
    image: "/archive/evidence/familysearch/timoshovka/elena-ampilogova-1897.png",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC8-SYSN?lang=en",
  },
] as const;

type RecordCopy = { child: string; detail: string; alt: string };

const copy = defineCopy({
  kicker: "Одна семья · Тимошевка",
  title: "Три записи — три написания фамилии",
  openLabel: (child: string) => `Открыть запись о ${child} в FamilySearch в новой вкладке`,
  openTitle: "Открыть запись в FamilySearch — может потребоваться вход",
  conclusion: "Семья не сменила фамилию трижды. Менялось то, как её услышали и записали.",
  records: [
    {
      child: "Пелагея Анпилогова",
      detail: "Над окончанием фамилии отца приписано «го»: Анпилов превращён в Анпилогов.",
      alt: "Метрическая запись о рождении Пелагеи в Тимошевке 6 октября 1892 года; в фамилии отца над словом Анпилов приписано го",
    },
    {
      child: "Агафия Анпилова",
      detail: "В записи о рождении Агафии фамилия её отца сокращена до формы Анпилов.",
      alt: "Метрическая запись о рождении Агафии Анпиловой в Тимошевке 8 февраля 1896 года",
    },
    {
      child: "Елена Ампилогова",
      detail: "Год спустя в той же семье появляется полная форма Ампилоговъ — в старой орфографии с твёрдым знаком.",
      alt: "Разворот метрической книги с записью о рождении Елены Ампилоговой в Тимошевке 30 апреля 1897 года",
    },
  ] as RecordCopy[],
}, {
  en: {
    kicker: "One family · Timoshevka",
    title: "Three records — three spellings of the surname",
    openLabel: (child) => `Open the record of ${child} on FamilySearch in a new tab`,
    openTitle: "Open the record on FamilySearch — sign-in may be required",
    conclusion: "The family did not change its surname three times. What changed was how it was heard and written down.",
    records: [
      {
        child: "Pelageya Anpilogova",
        detail: "Above the ending of the father’s surname «го» (“go”) has been added: Анпилов (Anpilov) is turned into Анпилогов (Anpilogov).",
        alt: "Parish register entry for the birth of Pelageya in Timoshevka on 6 October 1892; in the father’s surname “go” is written above the word Anpilov",
      },
      {
        child: "Agafiya Anpilova",
        detail: "In the birth record of Agafiya her father’s surname is shortened to the form Анпилов (Anpilov).",
        alt: "Parish register entry for the birth of Agafiya Anpilova in Timoshevka on 8 February 1896",
      },
      {
        child: "Yelena Ampilogova",
        detail: "A year later the same family shows the full form Ампилоговъ (Ampilogov) — in the old orthography with the hard sign.",
        alt: "Spread of a parish register with the birth record of Yelena Ampilogova in Timoshevka on 30 April 1897",
      },
    ],
  },
  uk: {
    kicker: "Одна родина · Тимошівка",
    title: "Три записи — три написання прізвища",
    openLabel: (child) => `Відкрити запис про ${child} у FamilySearch у новій вкладці`,
    openTitle: "Відкрити запис у FamilySearch — може знадобитися вхід",
    conclusion: "Родина не змінювала прізвище тричі. Змінювалося те, як його почули й записали.",
    records: [
      {
        child: "Пелагея Анпілогова",
        detail: "Над закінченням прізвища батька дописано «го»: Анпилов перетворено на Анпилогов.",
        alt: "Метричний запис про народження Пелагеї в Тимошівці 6 жовтня 1892 року; у прізвищі батька над словом Анпилов дописано го",
      },
      {
        child: "Агафія Анпілова",
        detail: "У записі про народження Агафії прізвище її батька скорочено до форми Анпилов.",
        alt: "Метричний запис про народження Агафії Анпілової в Тимошівці 8 лютого 1896 року",
      },
      {
        child: "Олена Ампілогова",
        detail: "Через рік у тій самій родині з’являється повна форма Ампилоговъ — у старій орфографії з твердим знаком.",
        alt: "Розворот метричної книги із записом про народження Олени Ампілогової в Тимошівці 30 квітня 1897 року",
      },
    ],
  },
  be: {
    kicker: "Адна сям’я · Цімашэўка",
    title: "Тры запісы — тры напісанні прозвішча",
    openLabel: (child) => `Адкрыць запіс пра ${child} у FamilySearch у новай укладцы`,
    openTitle: "Адкрыць запіс у FamilySearch — можа спатрэбіцца ўваход",
    conclusion: "Сям’я не мяняла прозвішча тройчы. Мянялася тое, як яго пачулі і запісалі.",
    records: [
      {
        child: "Пелагея Анпілогава",
        detail: "Над канчаткам прозвішча бацькі дапісана «го»: Анпилов ператвораны ў Анпилогов.",
        alt: "Метрычны запіс пра нараджэнне Пелагеі ў Цімашэўцы 6 кастрычніка 1892 года; у прозвішчы бацькі над словам Анпилов дапісана го",
      },
      {
        child: "Агафія Анпілава",
        detail: "У запісе пра нараджэнне Агафіі прозвішча яе бацькі скарочана да формы Анпилов.",
        alt: "Метрычны запіс пра нараджэнне Агафіі Анпілавай у Цімашэўцы 8 лютага 1896 года",
      },
      {
        child: "Алена Ампілогава",
        detail: "Праз год у той самай сям’і з’яўляецца поўная форма Ампилоговъ — у старой арфаграфіі з цвёрдым знакам.",
        alt: "Разварот метрычнай кнігі з запісам пра нараджэнне Алены Ампілогавай у Цімашэўцы 30 красавіка 1897 года",
      },
    ],
  },
});

export function SurnameVariantsEvidence() {
  const text = copy[getLocale()];

  return (
    <figure className="surname-variants-evidence">
      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
      </figcaption>

      <ol>
        {records.map((record, index) => {
          const { child, detail, alt } = text.records[index];
          return (
            <li key={record.year}>
              <header>
                <time>{record.year}</time>
                <div>
                  <span>{child}</span>
                  <strong>{record.form}</strong>
                </div>
              </header>

              <a
                className={`surname-variants-scan surname-variants-scan--${record.year}`}
                href={record.href}
                target="_blank"
                rel="noreferrer"
                aria-label={text.openLabel(child)}
                title={text.openTitle}
              >
                <img src={record.image} alt={alt} loading="lazy" />
              </a>

              <p>{detail}</p>
              <a className="surname-variants-source" href={record.href} target="_blank" rel="noreferrer">
                FamilySearch ↗
              </a>
            </li>
          );
        })}
      </ol>

      <p className="surname-variants-conclusion">
        {text.conclusion}
      </p>
    </figure>
  );
}
