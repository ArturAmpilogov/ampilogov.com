/* eslint-disable @next/next/no-img-element */
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  imageAlt: "Служилый человек XVI века у деревянного двора на фоне нераспаханного поля",
  kicker: "Орловское порубежье · конец XVI века",
  title: "Девять помещиков, у каждого — двор, конь и обязанность явиться на службу; распахано у всех вместе меньше, чем лежит впусте.",
  note: "Редакционная реконструкция по описанию служилых дворов в писцовой книге.",
}, {
  en: {
    imageAlt: "A 16th-century serviceman by a wooden homestead against an unploughed field",
    kicker: "Oryol frontier · late 16th century",
    title: "Nine landholders, each with a homestead, a horse and the duty to report for service; together they have less land under the plough than lies idle.",
    note: "Editorial reconstruction based on the description of service homesteads in the cadastral book.",
  },
  uk: {
    imageAlt: "Служилий чоловік XVI століття біля дерев’яного двору на тлі нерозораного поля",
    kicker: "Орловське порубіжжя · кінець XVI століття",
    title: "Дев’ять поміщиків, у кожного — двір, кінь і обов’язок з’явитися на службу; розорано в усіх разом менше, ніж лежить облогом.",
    note: "Редакційна реконструкція за описом служилих дворів у писцевій книзі.",
  },
  be: {
    imageAlt: "Служылы чалавек XVI стагоддзя каля драўлянага двара на фоне неразаранага поля",
    kicker: "Арлоўскае памежжа · канец XVI стагоддзя",
    title: "Дзевяць памешчыкаў, у кожнага — двор, конь і абавязак з’явіцца на службу; разарана ва ўсіх разам менш, чым ляжыць аблогай.",
    note: "Рэдакцыйная рэканструкцыя паводле апісання служылых двароў у пісцовай кнізе.",
  },
});

export function OrelServicePrelude() {
  const text = copy[getLocale()];

  return (
    <figure className="orel-service-prelude">
      <img
        alt={text.imageAlt}
        src="/artwork/orel-service-landholder-1594.png"
      />
      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
        <small>{text.note}</small>
      </figcaption>
    </figure>
  );
}
