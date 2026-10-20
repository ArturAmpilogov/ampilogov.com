/* eslint-disable @next/next/no-img-element */
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const commonsHref =
  "https://commons.wikimedia.org/wiki/File:Russian_Manuscript_Miniature_The_Chronicler.GIF";

const copy = defineCopy({
  linkLabel: "Открыть описание русской рукописной миниатюры",
  imageAlt: "Писец за столом переписывает книгу, миниатюра русской рукописи",
  title: "Двор за двором, село за селом — из таких перечней и вырастают первые фамилии.",
  credit: "Русская рукописная миниатюра XV века · общественное достояние ·",
}, {
  en: {
    linkLabel: "Open the description of the Russian manuscript miniature",
    imageAlt: "A scribe at a desk copying a book, a miniature from a Russian manuscript",
    title: "Homestead by homestead, village by village: it is from lists like these that the first surnames grow.",
    credit: "Russian manuscript miniature, 15th century · public domain ·",
  },
  uk: {
    linkLabel: "Відкрити опис давньоруської рукописної мініатюри",
    imageAlt: "Писар за столом переписує книгу, мініатюра давньоруського рукопису",
    title: "Двір за двором, село за селом — із таких переліків і виростають перші прізвища.",
    credit: "Давньоруська рукописна мініатюра XV століття · суспільне надбання ·",
  },
  be: {
    linkLabel: "Адкрыць апісанне рускай рукапіснай мініяцюры",
    imageAlt: "Пісар за сталом перапісвае кнігу, мініяцюра рускага рукапісу",
    title: "Двор за дваром, сяло за сялом — з такіх пералікаў і вырастаюць першыя прозвішчы.",
    credit: "Руская рукапісная мініяцюра XV стагоддзя · грамадскі набытак ·",
  },
});

export function PrilukiScribePrelude() {
  const text = copy[getLocale()];

  return (
    <figure className="priluki-scribe-prelude">
      <a
        className="priluki-scribe-prelude-image"
        href={commonsHref}
        target="_blank"
        rel="noreferrer"
        aria-label={text.linkLabel}
      >
        <img
          src="/evidence/manuscripts/russian-manuscript-chronicler-15c.gif"
          alt={text.imageAlt}
        />
      </a>

      <figcaption>
        <strong>{text.title}</strong>
        <span>
          {text.credit}{" "}
          <a href={commonsHref} target="_blank" rel="noreferrer">Wikimedia Commons ↗</a>
        </span>
      </figcaption>
    </figure>
  );
}
