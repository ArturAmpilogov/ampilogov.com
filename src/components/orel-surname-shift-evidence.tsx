import { defineCopy } from "@/i18n/copy";
import { localizeHref } from "@/i18n/routing";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  persons: ["Иван Васильевич", "Алексей Васильевич", "Марк Карпович"],
  july: "2 июля",
  october: "4 октября",
  leaf: (leaf: string) => `л. ${leaf}`,
  lineGloss: {} as Record<string, string>,
  kicker: "Одно дело · одна служебная смена",
  title: "Как фамилия изменилась между двумя смотрами",
  personHead: "Служилый человек",
  julyHead: "2 июля 1626",
  octoberHead: "4 октября 1626",
  changed: "Он- → Ан-",
  stable: "форма не изменилась",
  openCard: "открыть карточку →",
  note: "Сопоставлены повторные записи тех же людей в опубликованной построчной транскрипции дела. Иван и Алексей стоят рядом и в июле, и в октябре; поэтому различие их октябрьских форм нельзя объяснить общей заменой во всём списке.",
  caveat: "Фотокопии лл. 105, 106, 149 и 151 пока не получены. До сверки с рукописью это доказательство по научно проверяемой публикации текста, а не по цифровому образу листа.",
  source: "Полная публикация смотренного списка на VGD ↗",
}, {
  en: {
    persons: ["Ivan Vasilyevich", "Alexei Vasilyevich", "Mark Karpovich"],
    july: "2 July",
    october: "4 October",
    leaf: (leaf: string) => `f. ${leaf}`,
    lineGloss: {
      "Ивашка Васильев сын Онфилогов": "Ivashka, son of Vasily, Onfilogov",
      "Ивашко Васильев сын Анфилогов": "Ivashko, son of Vasily, Anfilogov",
      "Олешка Васильев сын Онфилогов": "Oleshka, son of Vasily, Onfilogov",
      "Марка Карпов сын Онфилогов": "Marka, son of Karp, Onfilogov",
      "Марко Карпов сын Анфилогов": "Marko, son of Karp, Anfilogov",
    } as Record<string, string>,
    kicker: "One file · one service shift",
    title: "How the surname changed between two musters",
    personHead: "Serviceman",
    julyHead: "2 July 1626",
    octoberHead: "4 October 1626",
    changed: "On- → An-",
    stable: "form unchanged",
    openCard: "open the record →",
    note: "The comparison uses repeated entries for the same men in the published line-by-line transcription of the file. Ivan and Alexei stand side by side in both July and October, so the difference between their October forms cannot be explained by a blanket change across the whole list.",
    caveat: "Photocopies of ff. 105, 106, 149 and 151 have not yet been obtained. Until checked against the manuscript, this is evidence from a verifiable scholarly publication of the text, not from a digital image of the leaf.",
    source: "Full publication of the muster roll on VGD ↗",
  },
  uk: {
    persons: ["Іван Васильович", "Олексій Васильович", "Марко Карпович"],
    july: "2 липня",
    october: "4 жовтня",
    leaf: (leaf: string) => `арк. ${leaf}`,
    lineGloss: {},
    kicker: "Одна справа · одна служила зміна",
    title: "Як прізвище змінилося між двома оглядами",
    personHead: "Служилий чоловік",
    julyHead: "2 липня 1626",
    octoberHead: "4 жовтня 1626",
    changed: "Он- → Ан-",
    stable: "форма не змінилася",
    openCard: "відкрити картку →",
    note: "Зіставлено повторні записи тих самих людей в опублікованій порядковій транскрипції справи. Іван і Олексій стоять поруч і в липні, і в жовтні; тому різницю їхніх жовтневих форм не можна пояснити загальною заміною в усьому списку.",
    caveat: "Фотокопії арк. 105, 106, 149 і 151 поки не отримано. До звіряння з рукописом це доказ за науково перевірюваною публікацією тексту, а не за цифровим образом аркуша.",
    source: "Повна публікація оглядового списку на VGD ↗",
  },
  be: {
    persons: ["Іван Васільевіч", "Аляксей Васільевіч", "Марк Карпавіч"],
    july: "2 ліпеня",
    october: "4 кастрычніка",
    leaf: (leaf: string) => `арк. ${leaf}`,
    lineGloss: {},
    kicker: "Адна справа · адна служылая змена",
    title: "Як прозвішча змянілася паміж двума аглядамі",
    personHead: "Служылы чалавек",
    julyHead: "2 ліпеня 1626",
    octoberHead: "4 кастрычніка 1626",
    changed: "Он- → Ан-",
    stable: "форма не змянілася",
    openCard: "адкрыць картку →",
    note: "Супастаўлены паўторныя запісы тых самых людзей у апублікаванай радковай транскрыпцыі справы. Іван і Аляксей стаяць побач і ў ліпені, і ў кастрычніку; таму розніцу іх кастрычніцкіх формаў нельга растлумачыць агульнай заменай ва ўсім спісе.",
    caveat: "Фотакопіі арк. 105, 106, 149 і 151 пакуль не атрыманы. Да зверкі з рукапісам гэта доказ па навукова правяральнай публікацыі тэксту, а не па лічбавым вобразе аркуша.",
    source: "Поўная публікацыя аглядавага спіса на VGD ↗",
  },
});

const comparisons = [
  {
    july: {
      form: "Онфилогов",
      line: "Ивашка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L105",
      leaf: "105",
    },
    october: {
      form: "Анфилогов",
      line: "Ивашко Васильев сын Анфилогов",
      href: "/records/RGADA-210-12-13-L149",
      leaf: "149",
    },
    changed: true,
  },
  {
    july: {
      form: "Онфилогов",
      line: "Олешка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L105",
      leaf: "105",
    },
    october: {
      form: "Онфилогов",
      line: "Олешка Васильев сын Онфилогов",
      href: "/records/RGADA-210-12-13-L149",
      leaf: "149",
    },
    changed: false,
  },
  {
    july: {
      form: "Онфилогов",
      line: "Марка Карпов сын Онфилогов",
      href: "/records/RGADA-210-12-13-L106",
      leaf: "106",
    },
    october: {
      form: "Анфилогов",
      line: "Марко Карпов сын Анфилогов",
      href: "/records/RGADA-210-12-13-L151",
      leaf: "151",
    },
    changed: true,
  },
];

export function OrelSurnameShiftEvidence() {
  const locale = getLocale();
  const text = copy[locale];

  return (
    <figure className="orel-surname-shift">
      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
      </figcaption>

      <div className="orel-surname-shift-head" aria-hidden="true">
        <span>{text.personHead}</span>
        <span>{text.julyHead}</span>
        <span>{text.octoberHead}</span>
      </div>

      <ol>
        {comparisons.map((entry, index) => {
          const person = text.persons[index];
          return (
            <li className={entry.changed ? "is-changed" : "is-stable"} key={person}>
              <div className="orel-surname-shift-person">
                <strong>{person}</strong>
                <span>{entry.changed ? text.changed : text.stable}</span>
              </div>

              {[
                { ...entry.july, date: text.july },
                { ...entry.october, date: text.october },
              ].map((record) => (
                <a href={localizeHref(locale, record.href)} key={`${person}-${record.date}`}>
                  <span className="orel-surname-shift-mobile-date">{record.date}</span>
                  <strong>{record.form}</strong>
                  <q>{record.line}</q>
                  {text.lineGloss[record.line] ? <> [{text.lineGloss[record.line]}]</> : null}
                  <small>{text.leaf(record.leaf)} · {text.openCard}</small>
                </a>
              ))}
            </li>
          );
        })}
      </ol>

      <footer>
        <p>{text.note}</p>
        <p className="orel-surname-shift-caveat">{text.caveat}</p>
        <a
          className="orel-surname-shift-source"
          href="https://forum.vgd.ru/6766/189781/"
          target="_blank"
          rel="noreferrer"
        >
          {text.source}
        </a>
      </footer>
    </figure>
  );
}
