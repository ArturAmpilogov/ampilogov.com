import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  groups: ["Церкви села", "Двор монастырского старца", "Пашенные крестьянские дворы"],
  kicker: "Писцовая книга · 1536/37",
  title: "Как в выписи устроено село",
  listLabel: "Порядок описания села Прилуки в выписи",
  nonArable: "Непашенные дворы",
  caption: "Единственное, что выпись сообщает о Тонком, — где именно стоит его строка.",
}, {
  en: {
    groups: ["The village churches", "The homestead of a monastery elder", "Arable peasant homesteads"],
    kicker: "Cadastral book · 1536/37",
    title: "How the extract lays out the village",
    listLabel: "Order in which the extract describes the village of Priluki",
    nonArable: "Non-arable homesteads",
    caption: "The only thing the extract tells us about Tonkoy is exactly where his line stands.",
  },
  uk: {
    groups: ["Церкви села", "Двір монастирського старця", "Орні селянські двори"],
    kicker: "Писцева книга · 1536/37",
    title: "Як у виписі влаштоване село",
    listLabel: "Порядок опису села Прилуки у виписі",
    nonArable: "Неорні двори",
    caption: "Єдине, що випис повідомляє про Тонкого, — де саме стоїть його рядок.",
  },
  be: {
    groups: ["Цэрквы сяла", "Двор манастырскага старца", "Ворныя сялянскія двары"],
    kicker: "Пісцовая кніга · 1536/37",
    title: "Як у выпісе ўладкавана сяло",
    listLabel: "Парадак апісання сяла Прылукі ў выпісе",
    nonArable: "Неворныя двары",
    caption: "Адзінае, што выпіс паведамляе пра Тонкага, — дзе менавіта стаіць яго радок.",
  },
});

export function PrilukiRecordAnatomy() {
  const text = copy[getLocale()];

  return (
    <figure className="priluki-record-anatomy">
      <header>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
      </header>

      <ol aria-label={text.listLabel}>
        {text.groups.map((title, index) => (
          <li key={title}>
            <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
            <b>{title}</b>
          </li>
        ))}
        <li className="is-expanded">
          <i aria-hidden="true">04</i>
          <div>
            <b>{text.nonArable}</b>
            <p>в. Некраско Данилов</p>
            <p className="is-focus">в. Тонкой Онфилогов</p>
          </div>
        </li>
      </ol>

      <figcaption>{text.caption}</figcaption>
    </figure>
  );
}
