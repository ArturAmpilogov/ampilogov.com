/* eslint-disable @next/next/no-img-element */
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy(
  {
    romanenkoPlace: "Киев · 23 ноября 1803",
    romanenkoName: "Анфилохий Романенко",
    romanenkoAria: "Открыть карточку Анфилохия Романенко в FamilySearch в новой вкладке",
    romanenkoTitle: "Открыть карточку в FamilySearch — может потребоваться вход",
    romanenkoAlt: "Строка метрической книги о рождении Анфилохия Романенко 23 ноября 1803 года",
    romanenkoText: "В записи названы родители Анфилохия Романенко. Он родился в день памяти святителя — 23 ноября 1803 года.",
    samaraPlace: "Самара · 23 ноября 1846 · крещение 24 ноября",
    samaraName: "Незаконнорождённый Анфилохий",
    samaraAria: "Открыть метрическую запись о незаконнорождённом Анфилохии в FamilySearch в новой вкладке",
    samaraTitle: "Открыть изображение в FamilySearch — может потребоваться вход",
    samaraAlt:
      "Фрагмент метрической книги: незаконнорождённый Анфилохий, рождение в Самаре 23 ноября 1846 года, крещение 24 ноября",
    samaraText: "Ребёнок родился в Самаре 23 ноября 1846 года и был крещён на следующий день. В метрической записи отец не назван.",
    caption: "Два рождения разделяют 43 года и сотни километров; в обоих случаях имя следует дню церковной памяти Амфилохия Иконийского.",
  },
  {
    en: {
      romanenkoPlace: "Kyiv · 23 November 1803",
      romanenkoName: "Anfilokhiy Romanenko",
      romanenkoAria: "Open the FamilySearch record of Anfilokhiy Romanenko in a new tab",
      romanenkoTitle: "Open the record in FamilySearch (sign-in may be required)",
      romanenkoAlt: "A line of the parish register recording the birth of Anfilokhiy Romanenko on 23 November 1803",
      romanenkoText:
        "The entry names Anfilokhiy Romanenko’s parents. He was born on the saint’s feast day, 23 November 1803.",
      samaraPlace: "Samara · 23 November 1846 · baptised 24 November",
      samaraName: "Anfilokhiy, born out of wedlock",
      samaraAria: "Open the parish register entry for Anfilokhiy, born out of wedlock, in FamilySearch in a new tab",
      samaraTitle: "Open the image in FamilySearch (sign-in may be required)",
      samaraAlt:
        "Parish register fragment: Anfilokhiy, born out of wedlock in Samara on 23 November 1846, baptised on 24 November",
      samaraText:
        "The child was born in Samara on 23 November 1846 and baptised the next day. The register entry does not name the father.",
      caption:
        "The two births are 43 years and hundreds of kilometres apart; in both cases the name follows the church feast of Amphilochius of Iconium.",
    },
    uk: {
      romanenkoPlace: "Київ · 23 листопада 1803",
      romanenkoName: "Анфілохій Романенко",
      romanenkoAria: "Відкрити картку Анфілохія Романенка у FamilySearch у новій вкладці",
      romanenkoTitle: "Відкрити картку у FamilySearch — може знадобитися вхід",
      romanenkoAlt: "Рядок метричної книги про народження Анфілохія Романенка 23 листопада 1803 року",
      romanenkoText:
        "У записі названо батьків Анфілохія Романенка. Він народився в день пам’яті святителя — 23 листопада 1803 року.",
      samaraPlace: "Самара · 23 листопада 1846 · хрещення 24 листопада",
      samaraName: "Позашлюбний Анфілохій",
      samaraAria: "Відкрити метричний запис про позашлюбного Анфілохія у FamilySearch у новій вкладці",
      samaraTitle: "Відкрити зображення у FamilySearch — може знадобитися вхід",
      samaraAlt:
        "Фрагмент метричної книги: позашлюбний Анфілохій, народження в Самарі 23 листопада 1846 року, хрещення 24 листопада",
      samaraText:
        "Дитина народилася в Самарі 23 листопада 1846 року й була охрещена наступного дня. У метричному записі батька не названо.",
      caption:
        "Два народження розділяють 43 роки й сотні кілометрів; в обох випадках ім’я відповідає дню церковної пам’яті Амфілохія Іконійського.",
    },
    be: {
      romanenkoPlace: "Кіеў · 23 лістапада 1803",
      romanenkoName: "Анфілохій Раманенка",
      romanenkoAria: "Адкрыць картку Анфілохія Раманенкі ў FamilySearch у новай укладцы",
      romanenkoTitle: "Адкрыць картку ў FamilySearch — можа спатрэбіцца ўваход",
      romanenkoAlt: "Радок метрычнай кнігі пра нараджэнне Анфілохія Раманенкі 23 лістапада 1803 года",
      romanenkoText:
        "У запісе названыя бацькі Анфілохія Раманенкі. Ён нарадзіўся ў дзень памяці святога — 23 лістапада 1803 года.",
      samaraPlace: "Самара · 23 лістапада 1846 · хрышчэнне 24 лістапада",
      samaraName: "Пазашлюбны Анфілохій",
      samaraAria: "Адкрыць метрычны запіс пра пазашлюбнага Анфілохія ў FamilySearch у новай укладцы",
      samaraTitle: "Адкрыць выяву ў FamilySearch — можа спатрэбіцца ўваход",
      samaraAlt:
        "Фрагмент метрычнай кнігі: пазашлюбны Анфілохій, нараджэнне ў Самары 23 лістапада 1846 года, хрышчэнне 24 лістапада",
      samaraText:
        "Дзіця нарадзілася ў Самары 23 лістапада 1846 года і было ахрышчана на наступны дзень. У метрычным запісе бацька не названы.",
      caption:
        "Два нараджэнні раздзяляюць 43 гады і сотні кіламетраў; у абодвух выпадках імя адпавядае дню царкоўнай памяці Амфілохія Іканійскага.",
    },
  },
);

const november23SourceHref = "https://www.familysearch.org/ark:/61903/3:1:3QS7-997T-XPLV";
const romanenkoSourceHref = "https://www.familysearch.org/ark:/61903/1:1:6X7Z-ZPFT?lang=en";

export function CalendarNameExamples() {
  const text = copy[getLocale()];

  return (
    <figure className="calendar-name-pair">
      <div className="calendar-name-pair-item">
        <header>
          <span>{text.romanenkoPlace}</span>
          <strong>{text.romanenkoName}</strong>
        </header>
        <a
          className="calendar-name-pair-image"
          href={romanenkoSourceHref}
          target="_blank"
          rel="noreferrer"
          aria-label={text.romanenkoAria}
          title={text.romanenkoTitle}
        >
          <img
            src="/archive/evidence/familysearch/naming/amphilochius-romanenko-1803-row.png"
            alt={text.romanenkoAlt}
          />
        </a>
        <p>
          {text.romanenkoText} <a href={romanenkoSourceHref} target="_blank" rel="noreferrer">FamilySearch ↗</a>
        </p>
      </div>

      <div className="calendar-name-pair-item">
        <header>
          <span>{text.samaraPlace}</span>
          <strong>{text.samaraName}</strong>
        </header>
        <a
          className="calendar-name-pair-image calendar-name-pair-image--source-crop"
          href={november23SourceHref}
          target="_blank"
          rel="noreferrer"
          aria-label={text.samaraAria}
          title={text.samaraTitle}
        >
          <img
            src="/archive/evidence/familysearch/naming/amphilochius-november-23.png"
            alt={text.samaraAlt}
            loading="lazy"
          />
        </a>
        <p>
          {text.samaraText} <a href={november23SourceHref} target="_blank" rel="noreferrer">FamilySearch ↗</a>
        </p>
      </div>

      <figcaption>
        {text.caption}
      </figcaption>
    </figure>
  );
}
