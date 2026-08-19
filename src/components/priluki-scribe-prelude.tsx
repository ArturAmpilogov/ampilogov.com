/* eslint-disable @next/next/no-img-element */

const commonsHref =
  "https://commons.wikimedia.org/wiki/File:Russian_Manuscript_Miniature_The_Chronicler.GIF";

export function PrilukiScribePrelude() {
  return (
    <figure className="priluki-scribe-prelude">
      <a
        className="priluki-scribe-prelude-image"
        href={commonsHref}
        target="_blank"
        rel="noreferrer"
        aria-label="Открыть описание русской рукописной миниатюры"
      >
        <img
          src="/evidence/manuscripts/russian-manuscript-chronicler-15c.gif"
          alt="Писец за столом переписывает книгу, миниатюра русской рукописи"
        />
      </a>

      <figcaption>
        <strong>Двор за двором, село за селом — из таких перечней и вырастают первые фамилии.</strong>
        <span>
          Русская рукописная миниатюра XV века · общественное достояние ·{" "}
          <a href={commonsHref} target="_blank" rel="noreferrer">Wikimedia Commons ↗</a>
        </span>
      </figcaption>
    </figure>
  );
}
