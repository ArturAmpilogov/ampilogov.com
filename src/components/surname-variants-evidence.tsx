import Link from "next/link";
import type { ReactNode } from "react";
import { defineCopy } from "@/i18n/copy";
import { localizeHref } from "@/i18n/routing";
import { getLocale } from "@/i18n/server";

// FamilySearch images are not republished (rights unclear): each card quotes
// the project's reading of the father's line and links to the original.

const records = [
  {
    year: "1892",
    form: "Анпилов + «го»",
    entry: "№ 178",
    transcription: (
      <>
        Тимошевскій крестьянинъ Григорій Андреевъ <mark>Анпило<sup>го</sup>въ</mark> и законная
        жена его Евдокія Исидорова, оба православные.
      </>
    ),
    recordHref: "/records/FS-3Q9M-CSSW-89J7-W",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC6-MV79?lang=en",
  },
  {
    year: "1896",
    form: "Анпилов",
    entry: "№ 39",
    transcription: (
      <>
        Тимошевскій крест. Григорій Андреевъ <mark>Анпиловъ</mark> и зак. жена его Евдокія
        Исидорова, оба православные.
      </>
    ),
    recordHref: "/records/FS-3Q9M-CSSW-QSY7-L",
    href: "https://www.familysearch.org/ark:/61903/3:1:3Q9M-CSSW-QSY7-L",
  },
  {
    year: "1897",
    form: "Ампилоговъ",
    entry: "№ 77",
    transcription: (
      <>
        Тимошевскій крестьянинъ Григорій Андреевъ <mark>Ампилоговъ</mark> и законная жена его
        Евдокія Исидорова; оба православные.
      </>
    ),
    recordHref: "/records/FS-3Q9M-CSSX-4CTH-F",
    href: "https://www.familysearch.org/ark:/61903/1:1:6XC8-SYSN?lang=en",
  },
] satisfies Array<{
  year: string;
  form: string;
  entry: string;
  transcription: ReactNode;
  recordHref: string;
  href: string;
}>;

type RecordCopy = { child: string; detail: string; date: string };

const copy = defineCopy({
  kicker: "Одна семья · Тимошевка",
  title: "Три записи — три написания фамилии",
  transcriptionLabel: "Расшифровка",
  recordLink: "Запись и полная расшифровка",
  conclusion: "Семья не сменила фамилию трижды. Менялось то, как её услышали и записали.",
  records: [
    {
      child: "Пелагея Анпилогова",
      detail: "Над окончанием фамилии отца приписано «го»: Анпилов превращён в Анпилогов.",
      date: "6 октября",
    },
    {
      child: "Агафия Анпилова",
      detail: "В записи о рождении Агафии фамилия её отца сокращена до формы Анпилов.",
      date: "8 февраля",
    },
    {
      child: "Елена Ампилогова",
      detail: "Год спустя в той же семье появляется полная форма Ампилоговъ — в старой орфографии с твёрдым знаком.",
      date: "30 апреля",
    },
  ] as RecordCopy[],
}, {
  en: {
    kicker: "One family · Timoshevka",
    title: "Three records — three spellings of the surname",
    transcriptionLabel: "Transcription",
    recordLink: "Record and full transcription",
    conclusion: "The family did not change its surname three times. What changed was how it was heard and written down.",
    records: [
      {
        child: "Pelageya Anpilogova",
        detail: "Above the ending of the father’s surname «го» (“go”) has been added: Анпилов (Anpilov) is turned into Анпилогов (Anpilogov).",
        date: "6 October",
      },
      {
        child: "Agafiya Anpilova",
        detail: "In the birth record of Agafiya her father’s surname is shortened to the form Анпилов (Anpilov).",
        date: "8 February",
      },
      {
        child: "Yelena Ampilogova",
        detail: "A year later the same family shows the full form Ампилоговъ (Ampilogov) — in the old orthography with the hard sign.",
        date: "30 April",
      },
    ],
  },
  uk: {
    kicker: "Одна родина · Тимошівка",
    title: "Три записи — три написання прізвища",
    transcriptionLabel: "Розшифровка",
    recordLink: "Запис і повна розшифровка",
    conclusion: "Родина не змінювала прізвище тричі. Змінювалося те, як його почули й записали.",
    records: [
      {
        child: "Пелагея Анпілогова",
        detail: "Над закінченням прізвища батька дописано «го»: Анпилов перетворено на Анпилогов.",
        date: "6 жовтня",
      },
      {
        child: "Агафія Анпілова",
        detail: "У записі про народження Агафії прізвище її батька скорочено до форми Анпилов.",
        date: "8 лютого",
      },
      {
        child: "Олена Ампілогова",
        detail: "Через рік у тій самій родині з’являється повна форма Ампилоговъ — у старій орфографії з твердим знаком.",
        date: "30 квітня",
      },
    ],
  },
  be: {
    kicker: "Адна сям’я · Цімашэўка",
    title: "Тры запісы — тры напісанні прозвішча",
    transcriptionLabel: "Расшыфроўка",
    recordLink: "Запіс і поўная расшыфроўка",
    conclusion: "Сям’я не мяняла прозвішча тройчы. Мянялася тое, як яго пачулі і запісалі.",
    records: [
      {
        child: "Пелагея Анпілогава",
        detail: "Над канчаткам прозвішча бацькі дапісана «го»: Анпилов ператвораны ў Анпилогов.",
        date: "6 кастрычніка",
      },
      {
        child: "Агафія Анпілава",
        detail: "У запісе пра нараджэнне Агафіі прозвішча яе бацькі скарочана да формы Анпилов.",
        date: "8 лютага",
      },
      {
        child: "Алена Ампілогава",
        detail: "Праз год у той самай сям’і з’яўляецца поўная форма Ампилоговъ — у старой арфаграфіі з цвёрдым знакам.",
        date: "30 красавіка",
      },
    ],
  },
});

export function SurnameVariantsEvidence() {
  const locale = getLocale();
  const text = copy[locale];

  return (
    <figure className="surname-variants-evidence">
      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
      </figcaption>

      <ol>
        {records.map((record, index) => {
          const { child, detail, date } = text.records[index];
          return (
            <li key={record.year}>
              <header>
                <time>{record.year}</time>
                <div>
                  <span>{child}</span>
                  <strong>{record.form}</strong>
                </div>
              </header>

              <blockquote className="familysearch-transcription" cite={record.href}>
                <span>{text.transcriptionLabel} · {date}, {record.entry}</span>
                <p>{record.transcription}</p>
              </blockquote>

              <p>{detail}</p>
              <div className="surname-variants-links">
                <Link className="surname-variants-source" href={localizeHref(locale, record.recordHref)}>
                  {text.recordLink}
                </Link>
                <a className="surname-variants-source" href={record.href} target="_blank" rel="noreferrer">
                  FamilySearch ↗
                </a>
              </div>
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
