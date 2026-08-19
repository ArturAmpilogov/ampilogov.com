/* eslint-disable @next/next/no-img-element */

const chapterHref = "/read/book/01-greek-amphilochus#герой-врач-и-знак-города";
const christianChapterHref = "/read/book/02-christian-amphilochius";
const catalogueHref = "https://rpc.ashmus.ox.ac.uk/coins/4/6897";
const licenseHref = "https://creativecommons.org/licenses/by-sa/4.0/";
const menologionHref = "https://digi.vatlib.it/view/MSS_Vat.gr.1613/0145";

export function AmphilochosCoinTeaser() {
  return (
    <div className="amphilochos-legacy">
      <div className="amphilochos-legacy-row amphilochos-legacy-row--antique">
        <p>
          Смысл имени складывался не из буквального перевода, а из памяти о самых
          известных носителях. Античного <a href={chapterHref}>Амфилохоса</a> почитали
          как <strong>провидца</strong> и <strong>героя-целителя</strong>: к нему
          обращались за предсказанием, советом и исцелением.
        </p>
        <figure>
          <a className="amphilochos-legacy-image" href={chapterHref}>
            <img
              src="/evidence/antiquity/mallos-amphilochos-coin-reverse.jpg"
              alt="Амфилохос с лавровой ветвью на бронзовой монете Малла"
              loading="lazy"
            />
          </a>
          <figcaption>
            Амфилохос на монете Малла, II век н. э.{" "}
            <a href={catalogueHref} target="_blank" rel="noreferrer">RPC IV.3, 6897 ↗</a>
            {" "}· фото CPK2 /{" "}
            <a href={licenseHref} target="_blank" rel="noreferrer">CC BY-SA 4.0 ↗</a>
          </figcaption>
        </figure>
      </div>

      <div className="amphilochos-legacy-row amphilochos-legacy-row--christian">
        <figure>
          <a className="amphilochos-legacy-image" href={christianChapterHref}>
            <img
              src="/evidence/christian/amphilochius-iconium-menologion-985-portrait.jpg"
              alt="Амфилохий Иконийский в Минологии Василия II"
              loading="lazy"
            />
          </a>
          <figcaption>
            Амфилохий Иконийский. Минологий Василия II, 985 год.{" "}
            <a href={menologionHref} target="_blank" rel="noreferrer">Ватиканская библиотека ↗</a>
          </figcaption>
        </figure>
        <p>
          Христианский <a href={christianChapterHref}>Амфилохий Иконийский</a>{" "}
          запомнился как <strong>образованный</strong>, <strong>стойкий</strong> и{" "}
          <strong>мужественный</strong> человек: он учил, помогал своей пастве и
          твёрдо защищал свои убеждения. С этими двумя именами современные
          Ампилоговы могут связывать <strong>проницательность</strong>,{" "}
          <strong>знание</strong>, <strong>помощь людям</strong> и{" "}
          <strong>внутреннюю силу</strong>.
        </p>
      </div>
    </div>
  );
}
