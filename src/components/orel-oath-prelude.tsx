/* eslint-disable @next/next/no-img-element */
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  records: [
    { name: "Григорий Дмитриевич", leaf: "л. 1160" },
    { name: "Фёдор Дмитриевич", leaf: "л. 1161" },
    { name: "Иван Михайлович", leaf: "л. 1178 об." },
  ],
  stripsLabel: "Три фрагмента крестоприводной книги Орловского уезда 1645 года",
  openFull: (name: string) => `Открыть полный лист: ${name}`,
  imageAlt: (name: string) => `Рукописный присяжный лист XVII века с именем служилого человека — ${name}`,
  kicker: "Орёл · 1645 год",
  title: "Три фрагмента присяжной книги: Григорий и Фёдор Дмитриевичи, Иван Михайлович",
  source: "РГАДА, ф. 210, оп. 6д, д. 54. Нажатие открывает полный архивный лист.",
}, {
  en: {
    records: [
      { name: "Grigory Dmitrievich", leaf: "f. 1160" },
      { name: "Fyodor Dmitrievich", leaf: "f. 1161" },
      { name: "Ivan Mikhailovich", leaf: "f. 1178v" },
    ],
    stripsLabel: "Three fragments of the 1645 oath book of Oryol district",
    openFull: (name: string) => `Open the full leaf: ${name}`,
    imageAlt: (name: string) => `Handwritten 17th-century oath leaf with the name of a serviceman — ${name}`,
    kicker: "Oryol · 1645",
    title: "Three fragments of the oath book: Grigory and Fyodor Dmitrievich, Ivan Mikhailovich",
    source: "RGADA, f. 210, op. 6d, d. 54. Click to open the full archival leaf.",
  },
  uk: {
    records: [
      { name: "Григорій Дмитрович", leaf: "арк. 1160" },
      { name: "Федір Дмитрович", leaf: "арк. 1161" },
      { name: "Іван Михайлович", leaf: "арк. 1178 зв." },
    ],
    stripsLabel: "Три фрагменти хрестоприводної книги Орловського повіту 1645 року",
    openFull: (name: string) => `Відкрити повний аркуш: ${name}`,
    imageAlt: (name: string) => `Рукописний присяжний аркуш XVII століття з ім’ям служилого чоловіка — ${name}`,
    kicker: "Орел · 1645 рік",
    title: "Три фрагменти присяжної книги: Григорій і Федір Дмитровичі, Іван Михайлович",
    source: "РГАДА, ф. 210, оп. 6д, спр. 54. Натискання відкриває повний архівний аркуш.",
  },
  be: {
    records: [
      { name: "Грыгорый Дзмітрыевіч", leaf: "арк. 1160" },
      { name: "Фёдар Дзмітрыевіч", leaf: "арк. 1161" },
      { name: "Іван Міхайлавіч", leaf: "арк. 1178 адв." },
    ],
    stripsLabel: "Тры фрагменты крыжапрывадной кнігі Арлоўскага павета 1645 года",
    openFull: (name: string) => `Адкрыць поўны аркуш: ${name}`,
    imageAlt: (name: string) => `Рукапісны прысяжны аркуш XVII стагоддзя з імем служылага чалавека — ${name}`,
    kicker: "Арол · 1645 год",
    title: "Тры фрагменты прысяжнай кнігі: Грыгорый і Фёдар Дзмітрыевічы, Іван Міхайлавіч",
    source: "РГАДА, ф. 210, воп. 6д, спр. 54. Націск адкрывае поўны архіўны аркуш.",
  },
});

const oathRecords = [
  {
    src: "/evidence/rgada/f210-op6d-d54/crops/grigory-1160.jpg",
    full: "/evidence/rgada/f210-op6d-d54/P1290047.JPG",
  },
  {
    src: "/evidence/rgada/f210-op6d-d54/crops/fedor-1161.jpg",
    full: "/evidence/rgada/f210-op6d-d54/P1290048.JPG",
  },
  {
    src: "/evidence/rgada/f210-op6d-d54/crops/ivan-1178-ob.jpg",
    full: "/evidence/rgada/f210-op6d-d54/P1290065.JPG",
  },
];

export function OrelOathPrelude() {
  const text = copy[getLocale()];

  return (
    <figure className="orel-oath-prelude">
      <div
        className="orel-oath-prelude-strips"
        aria-label={text.stripsLabel}
      >
        {oathRecords.map((record, index) => {
          const { name, leaf } = text.records[index];
          return (
            <a href={record.full} key={record.src} title={text.openFull(name)}>
              <img
                alt={text.imageAlt(name)}
                src={record.src}
              />
              <span>
                <strong>{name}</strong>
                <small>{leaf}</small>
              </span>
            </a>
          );
        })}
      </div>

      <figcaption>
        <span>{text.kicker}</span>
        <strong>{text.title}</strong>
        <small>{text.source}</small>
      </figcaption>
    </figure>
  );
}
