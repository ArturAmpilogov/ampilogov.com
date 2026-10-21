// FamilySearch images are not republished (rights unclear): both entries are
// quoted as read from the scans and link to the originals.
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy(
  {
    romanenkoPlace: "Киев · 23 ноября 1803",
    romanenkoName: "Анфилохий Романенко",
    romanenkoLabel: "Чтение строки № 92 · частичное",
    romanenkoNote: "Остальной текст строки ещё не расшифрован; фамилия, дата и место — по индексу FamilySearch.",
    romanenkoText: "В записи названы родители Анфилохия Романенко. Он родился в день памяти святителя — 23 ноября 1803 года.",
    samaraPlace: "Самара · 23 ноября 1846 · крещение 24 ноября",
    samaraName: "Незаконнорождённый Анфилохий",
    samaraLabel: "Расшифровка · запись № 61",
    samaraText: "Ребёнок родился в Самаре 23 ноября 1846 года и был крещён на следующий день. В метрической записи отец не назван.",
    caption: "Два рождения разделяют 43 года и сотни километров; в обоих случаях имя следует дню церковной памяти Амфилохия Иконийского.",
  },
  {
    en: {
      romanenkoPlace: "Kyiv · 23 November 1803",
      romanenkoName: "Anfilokhiy Romanenko",
      romanenkoLabel: "Reading of entry 92 · partial",
      romanenkoNote: "The rest of the line is not yet transcribed; surname, date and place follow the FamilySearch index.",
      romanenkoText:
        "The entry names Anfilokhiy Romanenko’s parents. He was born on the saint’s feast day, 23 November 1803.",
      samaraPlace: "Samara · 23 November 1846 · baptised 24 November",
      samaraName: "Anfilokhiy, born out of wedlock",
      samaraLabel: "Transcription · entry 61",
      samaraText:
        "The child was born in Samara on 23 November 1846 and baptised the next day. The register entry does not name the father.",
      caption:
        "The two births are 43 years and hundreds of kilometres apart; in both cases the name follows the church feast of Amphilochius of Iconium.",
    },
    uk: {
      romanenkoPlace: "Київ · 23 листопада 1803",
      romanenkoName: "Анфілохій Романенко",
      romanenkoLabel: "Читання рядка № 92 · часткове",
      romanenkoNote: "Решту рядка ще не розшифровано; прізвище, дата й місце — за індексом FamilySearch.",
      romanenkoText:
        "У записі названо батьків Анфілохія Романенка. Він народився в день пам’яті святителя — 23 листопада 1803 року.",
      samaraPlace: "Самара · 23 листопада 1846 · хрещення 24 листопада",
      samaraName: "Позашлюбний Анфілохій",
      samaraLabel: "Розшифровка · запис № 61",
      samaraText:
        "Дитина народилася в Самарі 23 листопада 1846 року й була охрещена наступного дня. У метричному записі батька не названо.",
      caption:
        "Два народження розділяють 43 роки й сотні кілометрів; в обох випадках ім’я відповідає дню церковної пам’яті Амфілохія Іконійського.",
    },
    be: {
      romanenkoPlace: "Кіеў · 23 лістапада 1803",
      romanenkoName: "Анфілохій Раманенка",
      romanenkoLabel: "Чытанне радка № 92 · частковае",
      romanenkoNote: "Астатні тэкст радка яшчэ не расшыфраваны; прозвішча, дата і месца — паводле індэкса FamilySearch.",
      romanenkoText:
        "У запісе названыя бацькі Анфілохія Раманенкі. Ён нарадзіўся ў дзень памяці святога — 23 лістапада 1803 года.",
      samaraPlace: "Самара · 23 лістапада 1846 · хрышчэнне 24 лістапада",
      samaraName: "Пазашлюбны Анфілохій",
      samaraLabel: "Расшыфроўка · запіс № 61",
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
        <blockquote className="familysearch-transcription" cite={romanenkoSourceHref}>
          <span>{text.romanenkoLabel}</span>
          <p>«…родися сынъ <mark>Анфилохій</mark>…»</p>
        </blockquote>
        <p>
          {text.romanenkoNote} {text.romanenkoText} <a href={romanenkoSourceHref} target="_blank" rel="noreferrer">FamilySearch ↗</a>
        </p>
      </div>

      <div className="calendar-name-pair-item">
        <header>
          <span>{text.samaraPlace}</span>
          <strong>{text.samaraName}</strong>
        </header>
        <blockquote className="familysearch-transcription" cite={november23SourceHref}>
          <span>{text.samaraLabel}</span>
          <p>
            23 ноября [родился], 24 ноября [крещён]. <mark>Анфилохий</mark>, незаконнорождённый, сын
            [часть сословной формулы неразборчива] девки Прасковьи Егоровой Красновой, православного
            исповедания.
          </p>
        </blockquote>
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
