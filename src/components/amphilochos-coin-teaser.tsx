/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { defineCopy } from "@/i18n/copy";
import { localizeHref } from "@/i18n/routing";
import { getLocale } from "@/i18n/server";

const chapterHref = "/read/book/02-greek-amphilochus#amphilochos-cult";
const christianChapterHref = "/read/book/03-christian-amphilochius";
const catalogueHref = "https://rpc.ashmus.ox.ac.uk/coins/4/6897";
const licenseHref = "https://creativecommons.org/licenses/by-sa/4.0/";
const menologionHref = "https://digi.vatlib.it/view/MSS_Vat.gr.1613/0145";

type Copy = {
  antique: (href: string) => ReactNode;
  antiqueAlt: string;
  antiqueCaption: string;
  photo: string;
  christianAlt: string;
  christianCaption: string;
  vatican: string;
  christian: (href: string) => ReactNode;
};

const copy = defineCopy<Copy>({
  antique: (href) => (
    <>
      Смысл имени складывался не из буквального перевода, а из памяти о самых
      известных носителях. Античного <a href={href}>Амфилохоса</a> почитали
      как <strong>провидца</strong> и <strong>героя-целителя</strong>: к нему
      обращались за предсказанием, советом и исцелением.
    </>
  ),
  antiqueAlt: "Амфилохос с лавровой ветвью на бронзовой монете Малла",
  antiqueCaption: "Амфилохос на монете Малла, II век н. э.",
  photo: "фото",
  christianAlt: "Амфилохий Иконийский в Минологии Василия II",
  christianCaption: "Амфилохий Иконийский. Минологий Василия II, 985 год.",
  vatican: "Ватиканская библиотека",
  christian: (href) => (
    <>
      Христианский <a href={href}>Амфилохий Иконийский</a>{" "}
      запомнился как образованный, стойкий и мужественный человек: он учил,
      помогал своей пастве и твёрдо защищал свои убеждения. Так в истории имени
      соединились <strong>проницательность и знание</strong>,{" "}
      <strong>помощь людям и внутренняя сила</strong>.
    </>
  ),
}, {
  en: {
    antique: (href) => (
      <>
        The meaning of the name grew not from a literal translation but from the memory
        of its most famous bearers. The ancient <a href={href}>Amphilochos</a> was revered
        as a <strong>seer</strong> and a <strong>healer hero</strong>: people turned to him
        for prophecy, advice and healing.
      </>
    ),
    antiqueAlt: "Amphilochos holding a laurel branch on a bronze coin of Mallos",
    antiqueCaption: "Amphilochos on a coin of Mallos, 2nd century AD.",
    photo: "photo",
    christianAlt: "Amphilochius of Iconium in the Menologion of Basil II",
    christianCaption: "Amphilochius of Iconium. Menologion of Basil II, 985.",
    vatican: "Vatican Library",
    christian: (href) => (
      <>
        The Christian <a href={href}>Amphilochius of Iconium</a>{" "}
        was remembered as a learned, steadfast and courageous man: he taught,
        helped his flock and firmly defended his convictions. So the history of the name
        brought together <strong>insight and knowledge</strong>,{" "}
        <strong>help to people and inner strength</strong>.
      </>
    ),
  },
  uk: {
    antique: (href) => (
      <>
        Сенс імені складався не з буквального перекладу, а з пам’яті про найвідоміших
        носіїв. Античного <a href={href}>Амфілохоса</a> шанували
        як <strong>провидця</strong> і <strong>героя-цілителя</strong>: до нього
        зверталися по передбачення, пораду й зцілення.
      </>
    ),
    antiqueAlt: "Амфілохос із лавровою гілкою на бронзовій монеті Малла",
    antiqueCaption: "Амфілохос на монеті Малла, II століття н. е.",
    photo: "фото",
    christianAlt: "Амфілохій Іконійський у Мінології Василія II",
    christianCaption: "Амфілохій Іконійський. Мінологій Василія II, 985 рік.",
    vatican: "Ватиканська бібліотека",
    christian: (href) => (
      <>
        Християнський <a href={href}>Амфілохій Іконійський</a>{" "}
        запам’ятався як освічена, стійка й мужня людина: він навчав,
        допомагав своїй пастві й твердо обстоював свої переконання. Так в історії імені
        поєдналися <strong>проникливість і знання</strong>,{" "}
        <strong>допомога людям і внутрішня сила</strong>.
      </>
    ),
  },
  be: {
    antique: (href) => (
      <>
        Сэнс імя складаўся не з даслоўнага перакладу, а з памяці пра самых
        вядомых носьбітаў. Антычнага <a href={href}>Амфілохаса</a> шанавалі
        як <strong>празорліўца</strong> і <strong>героя-лекара</strong>: да яго
        звярталіся па прадказанне, параду і ацаленне.
      </>
    ),
    antiqueAlt: "Амфілохас з лаўровай галінкай на бронзавай манеце Мала",
    antiqueCaption: "Амфілохас на манеце Мала, II стагоддзе н. э.",
    photo: "фота",
    christianAlt: "Амфілохій Іканійскі ў Міналогіі Васіля II",
    christianCaption: "Амфілохій Іканійскі. Міналогій Васіля II, 985 год.",
    vatican: "Ватыканская бібліятэка",
    christian: (href) => (
      <>
        Хрысціянскі <a href={href}>Амфілохій Іканійскі</a>{" "}
        запомніўся як адукаваны, цвёрды і мужны чалавек: ён навучаў,
        дапамагаў сваёй пастве і цвёрда бараніў свае перакананні. Так у гісторыі імя
        злучыліся <strong>пранікнёнасць і веды</strong>,{" "}
        <strong>дапамога людзям і ўнутраная сіла</strong>.
      </>
    ),
  },
});

export function AmphilochosCoinTeaser() {
  const locale = getLocale();
  const text = copy[locale];
  const chapter = localizeHref(locale, chapterHref);
  const christianChapter = localizeHref(locale, christianChapterHref);

  return (
    <div className="amphilochos-legacy">
      <div className="amphilochos-legacy-row amphilochos-legacy-row--antique">
        <p>
          {text.antique(chapter)}
        </p>
        <figure>
          <a className="amphilochos-legacy-image" href={chapter}>
            <img
              src="/evidence/antiquity/mallos-amphilochos-coin-reverse.jpg"
              alt={text.antiqueAlt}
              loading="lazy"
            />
          </a>
          <figcaption>
            {text.antiqueCaption}{" "}
            <a href={catalogueHref} target="_blank" rel="noreferrer">RPC IV.3, 6897 ↗</a>
            {" "}· {text.photo} CPK2 /{" "}
            <a href={licenseHref} target="_blank" rel="noreferrer">CC BY-SA 4.0 ↗</a>
          </figcaption>
        </figure>
      </div>

      <div className="amphilochos-legacy-row amphilochos-legacy-row--christian">
        <figure>
          <a className="amphilochos-legacy-image" href={christianChapter}>
            <img
              src="/evidence/christian/amphilochius-iconium-menologion-985-portrait.jpg"
              alt={text.christianAlt}
              loading="lazy"
            />
          </a>
          <figcaption>
            {text.christianCaption}{" "}
            <a href={menologionHref} target="_blank" rel="noreferrer">{text.vatican} ↗</a>
          </figcaption>
        </figure>
        <p>
          {text.christian(christianChapter)}
        </p>
      </div>
    </div>
  );
}
