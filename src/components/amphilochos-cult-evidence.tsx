/* eslint-disable @next/next/no-img-element */

const inscriptionHref = "https://www.atticinscriptions.com/inscription/IGII34/936";
const coinCatalogueHref = "https://rpc.ashmus.ox.ac.uk/coins/4/6897";
const coinImageHref = "https://commons.wikimedia.org/wiki/File:Cilicia_Mallos_6897.jpg";
const coinLicenseHref = "https://creativecommons.org/licenses/by-sa/4.0/";

export function AmphilochosCultEvidence() {
  return (
    <section className="amphilochos-cult-evidence" aria-label="Амфилохос в надписи и на монете">
      <article className="amphilochos-cult-object">
        <header className="amphilochos-cult-object-heading">
          <div>
            <span>Афины · II век н. э.</span>
            <h3>«Герой-врач» — прямо на камне</h3>
          </div>
          <a href={inscriptionHref} target="_blank" rel="noreferrer">
            IG II³ 4, 936 ↗
          </a>
        </header>

        <p>
          Семья Логоса и Симферусы посвятила Амфилохосу колонну. Их сын Гермий назван
          пожизненным жрецом <strong>«героя-врача Амфилохоса»</strong>. Это самое прямое
          свидетельство того, что в Афинах от героя ждали не только прорицаний, но и исцеления.
        </p>

        <blockquote className="amphilochos-inscription">
          <span lang="grc">
            Ἑρμείας ὁ διὰ βίου ἱερεὺς τοῦ ἥρωος τοῦ ἰατροῦ τοῦ Ἀμφιλόχου
          </span>
          <small>«Гермий, пожизненный жрец героя-врача Амфилохоса»</small>
        </blockquote>

        <p className="amphilochos-cult-note">
          Фотография колонны в открытой публикации не приведена; показана ключевая строка
          опубликованной надписи.
        </p>
      </article>

      <article className="amphilochos-cult-object">
        <header className="amphilochos-cult-object-heading">
          <div>
            <span>Малл · 177–192 годы н. э.</span>
            <h3>Амфилохос на деньгах города</h3>
          </div>
          <a href={coinCatalogueHref} target="_blank" rel="noreferrer">
            RPC IV.3, 6897 ↗
          </a>
        </header>

        <p>
          На лицевой стороне бронзовой монеты — император Коммод. На обороте — городской
          основатель Амфилохос: в лавровом венке, с ветвью в руке; у его ног стоит вепрь.
          Так герой вошёл не только в храмовый культ, но и в повседневный образ самого Малла.
        </p>

        <figure className="amphilochos-coin">
          <a
            href={coinImageHref}
            target="_blank"
            rel="noreferrer"
            aria-label="Открыть фотографию монеты Малла на Wikimedia Commons в новой вкладке"
            title="Открыть оригинал на Wikimedia Commons"
          >
            <img
              src="/evidence/antiquity/mallos-amphilochos-coin-commodus.jpg"
              alt="Бронзовая монета Малла времён Коммода: справа Амфилохос с ветвью и вепрем у ног"
              loading="lazy"
            />
          </a>
          <figcaption>
            Бронза Малла, RPC IV.3, 6897. Фото: CPK2, Wikimedia Commons,
            {" "}
            <a href={coinLicenseHref} target="_blank" rel="noreferrer">CC BY-SA 4.0 ↗</a>;
            изображение уменьшено для страницы.
          </figcaption>
        </figure>

        <p className="amphilochos-cult-note">
          На более позднем выпуске Амфилохос вручает венок богине города, а латинская легенда
          называет Малл <strong>«колонией Амфилохоса»</strong>.
          {" "}
          <a href="https://rpc.ashmus.ox.ac.uk/coins/6/7160" target="_blank" rel="noreferrer">
            RPC VI, 7160 ↗
          </a>
        </p>
      </article>
    </section>
  );
}
