/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const inscriptionHref = "https://www.atticinscriptions.com/inscription/IGII34/936";
const coinCatalogueHref = "https://rpc.ashmus.ox.ac.uk/coins/4/6897";
const coinImageHref = "https://commons.wikimedia.org/wiki/File:Cilicia_Mallos_6897.jpg";
const coinLicenseHref = "https://creativecommons.org/licenses/by-sa/4.0/";

type Copy = {
  label: string;
  inscriptionKicker: string;
  inscriptionTitle: string;
  inscriptionText: ReactNode;
  inscriptionTranslation: string;
  inscriptionNote: string;
  coinKicker: string;
  coinTitle: string;
  coinText: string;
  coinLinkLabel: string;
  coinLinkTitle: string;
  coinAlt: string;
  coinCaption: string;
  coinCaptionTail: string;
  laterIssue: ReactNode;
};

const copy = defineCopy<Copy>({
  label: "Амфилохос в надписи и на монете",
  inscriptionKicker: "Афины · II век н. э.",
  inscriptionTitle: "«Герой-врач» — прямо на камне",
  inscriptionText: (
    <>
      Семья Логоса и Симферусы посвятила Амфилохосу колонну. Их сын Гермий назван
      пожизненным жрецом <strong>«героя-врача Амфилохоса»</strong>. Это самое прямое
      свидетельство того, что в Афинах от героя ждали не только прорицаний, но и исцеления.
    </>
  ),
  inscriptionTranslation: "«Гермий, пожизненный жрец героя-врача Амфилохоса»",
  inscriptionNote: "Фотография колонны в открытой публикации не приведена; показана ключевая строка опубликованной надписи.",
  coinKicker: "Малл · 177–192 годы н. э.",
  coinTitle: "Амфилохос на деньгах города",
  coinText: "На лицевой стороне бронзовой монеты — император Коммод. На обороте — городской основатель Амфилохос: в лавровом венке, с ветвью в руке; у его ног стоит вепрь. Так герой вошёл не только в храмовый культ, но и в повседневный образ самого Малла.",
  coinLinkLabel: "Открыть фотографию монеты Малла на Wikimedia Commons в новой вкладке",
  coinLinkTitle: "Открыть оригинал на Wikimedia Commons",
  coinAlt: "Бронзовая монета Малла времён Коммода: справа Амфилохос с ветвью и вепрем у ног",
  coinCaption: "Бронза Малла, RPC IV.3, 6897. Фото: CPK2, Wikimedia Commons,",
  coinCaptionTail: "изображение уменьшено для страницы.",
  laterIssue: (
    <>
      На более позднем выпуске Амфилохос вручает венок богине города, а латинская легенда
      называет Малл <strong>«колонией Амфилохоса»</strong>.
    </>
  ),
}, {
  en: {
    label: "Amphilochos in an inscription and on a coin",
    inscriptionKicker: "Athens · 2nd century AD",
    inscriptionTitle: "“Healer hero” — right on the stone",
    inscriptionText: (
      <>
        The family of Logos and Symphorousa dedicated a column to Amphilochos. Their son Hermeias is named
        lifelong priest of <strong>“the healer hero Amphilochos”</strong>. This is the most direct
        evidence that in Athens people expected from the hero not only prophecy but also healing.
      </>
    ),
    inscriptionTranslation: "“Hermeias, lifelong priest of the healer hero Amphilochos”",
    inscriptionNote: "The open publication gives no photograph of the column; the key line of the published inscription is shown.",
    coinKicker: "Mallos · AD 177–192",
    coinTitle: "Amphilochos on the city’s money",
    coinText: "The obverse of the bronze coin shows the emperor Commodus. The reverse shows the city’s founder Amphilochos: in a laurel wreath, a branch in his hand, a boar standing at his feet. So the hero entered not only the temple cult but also the everyday image of Mallos itself.",
    coinLinkLabel: "Open the photograph of the Mallos coin on Wikimedia Commons in a new tab",
    coinLinkTitle: "Open the original on Wikimedia Commons",
    coinAlt: "Bronze coin of Mallos from the reign of Commodus: on the right, Amphilochos with a branch and a boar at his feet",
    coinCaption: "Bronze of Mallos, RPC IV.3, 6897. Photo: CPK2, Wikimedia Commons,",
    coinCaptionTail: "image reduced for the page.",
    laterIssue: (
      <>
        On a later issue Amphilochos hands a wreath to the city goddess, and the Latin legend
        calls Mallos <strong>“the colony of Amphilochos”</strong>.
      </>
    ),
  },
  uk: {
    label: "Амфілохос у написі та на монеті",
    inscriptionKicker: "Афіни · II століття н. е.",
    inscriptionTitle: "«Герой-лікар» — просто на камені",
    inscriptionText: (
      <>
        Родина Логоса і Симферуси присвятила Амфілохосу колону. Їхнього сина Гермія названо
        довічним жерцем <strong>«героя-лікаря Амфілохоса»</strong>. Це найпряміше
        свідчення того, що в Афінах від героя чекали не лише пророцтв, а й зцілення.
      </>
    ),
    inscriptionTranslation: "«Гермій, довічний жрець героя-лікаря Амфілохоса»",
    inscriptionNote: "Фотографії колони у відкритій публікації немає; показано ключовий рядок опублікованого напису.",
    coinKicker: "Малл · 177–192 роки н. е.",
    coinTitle: "Амфілохос на грошах міста",
    coinText: "На лицьовому боці бронзової монети — імператор Коммод. На звороті — засновник міста Амфілохос: у лавровому вінку, з гілкою в руці; біля його ніг стоїть вепр. Так герой увійшов не лише в храмовий культ, а й у повсякденний образ самого Малла.",
    coinLinkLabel: "Відкрити фотографію монети Малла на Wikimedia Commons у новій вкладці",
    coinLinkTitle: "Відкрити оригінал на Wikimedia Commons",
    coinAlt: "Бронзова монета Малла часів Коммода: праворуч Амфілохос із гілкою і вепром біля ніг",
    coinCaption: "Бронза Малла, RPC IV.3, 6897. Фото: CPK2, Wikimedia Commons,",
    coinCaptionTail: "зображення зменшено для сторінки.",
    laterIssue: (
      <>
        На пізнішому випуску Амфілохос вручає вінок богині міста, а латинська легенда
        називає Малл <strong>«колонією Амфілохоса»</strong>.
      </>
    ),
  },
  be: {
    label: "Амфілохас у надпісе і на манеце",
    inscriptionKicker: "Афіны · II стагоддзе н. э.",
    inscriptionTitle: "«Герой-лекар» — проста на камені",
    inscriptionText: (
      <>
        Сям’я Логаса і Сімферусы прысвяціла Амфілохасу калону. Іх сын Гермій названы
        пажыццёвым жрацом <strong>«героя-лекара Амфілохаса»</strong>. Гэта найбольш простае
        сведчанне таго, што ў Афінах ад героя чакалі не толькі прароцтваў, але і ацалення.
      </>
    ),
    inscriptionTranslation: "«Гермій, пажыццёвы жрац героя-лекара Амфілохаса»",
    inscriptionNote: "Фатаграфіі калоны ў адкрытай публікацыі няма; паказаны ключавы радок апублікаванага надпісу.",
    coinKicker: "Мал · 177–192 гады н. э.",
    coinTitle: "Амфілохас на грошах горада",
    coinText: "На аверсе бронзавай манеты — імператар Камод. На рэверсе — заснавальнік горада Амфілохас: у лаўровым вянку, з галінкай у руцэ; каля яго ног стаіць вяпрук. Так герой увайшоў не толькі ў храмавы культ, але і ў штодзённы вобраз самога Мала.",
    coinLinkLabel: "Адкрыць фатаграфію манеты Мала на Wikimedia Commons у новай укладцы",
    coinLinkTitle: "Адкрыць арыгінал на Wikimedia Commons",
    coinAlt: "Бронзавая манета Мала часоў Камода: справа Амфілохас з галінкай і вяпруком каля ног",
    coinCaption: "Бронза Мала, RPC IV.3, 6897. Фота: CPK2, Wikimedia Commons,",
    coinCaptionTail: "выява паменшана для старонкі.",
    laterIssue: (
      <>
        На пазнейшым выпуску Амфілохас уручае вянок багіні горада, а лацінская легенда
        называе Мал <strong>«калоніяй Амфілохаса»</strong>.
      </>
    ),
  },
});

export function AmphilochosCultEvidence() {
  const text = copy[getLocale()];

  return (
    <section className="amphilochos-cult-evidence" aria-label={text.label}>
      <article className="amphilochos-cult-object">
        <header className="amphilochos-cult-object-heading">
          <div>
            <span>{text.inscriptionKicker}</span>
            <h3>{text.inscriptionTitle}</h3>
          </div>
          <a href={inscriptionHref} target="_blank" rel="noreferrer">
            IG II³ 4, 936 ↗
          </a>
        </header>

        <p>
          {text.inscriptionText}
        </p>

        <blockquote className="amphilochos-inscription">
          <span lang="grc">
            Ἑρμείας ὁ διὰ βίου ἱερεὺς τοῦ ἥρωος τοῦ ἰατροῦ τοῦ Ἀμφιλόχου
          </span>
          <small>{text.inscriptionTranslation}</small>
        </blockquote>

        <p className="amphilochos-cult-note">
          {text.inscriptionNote}
        </p>
      </article>

      <article className="amphilochos-cult-object">
        <header className="amphilochos-cult-object-heading">
          <div>
            <span>{text.coinKicker}</span>
            <h3>{text.coinTitle}</h3>
          </div>
          <a href={coinCatalogueHref} target="_blank" rel="noreferrer">
            RPC IV.3, 6897 ↗
          </a>
        </header>

        <p>
          {text.coinText}
        </p>

        <figure className="amphilochos-coin">
          <a
            href={coinImageHref}
            target="_blank"
            rel="noreferrer"
            aria-label={text.coinLinkLabel}
            title={text.coinLinkTitle}
          >
            <img
              src="/evidence/antiquity/mallos-amphilochos-coin-commodus.jpg"
              alt={text.coinAlt}
              loading="lazy"
            />
          </a>
          <figcaption>
            {text.coinCaption}
            {" "}
            <a href={coinLicenseHref} target="_blank" rel="noreferrer">CC BY-SA 4.0 ↗</a>;
            {" "}{text.coinCaptionTail}
          </figcaption>
        </figure>

        <p className="amphilochos-cult-note">
          {text.laterIssue}
          {" "}
          <a href="https://rpc.ashmus.ox.ac.uk/coins/6/7160" target="_blank" rel="noreferrer">
            RPC VI, 7160 ↗
          </a>
        </p>
      </article>
    </section>
  );
}
