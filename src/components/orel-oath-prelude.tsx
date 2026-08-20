/* eslint-disable @next/next/no-img-element */

const oathRecords = [
  {
    name: "Григорий Дмитриевич",
    leaf: "л. 1160",
    src: "/evidence/rgada/f210-op6d-d54/crops/grigory-1160.jpg",
    full: "/archive/evidence/rgada/f210-op6d-d54/P1290047.JPG",
  },
  {
    name: "Фёдор Дмитриевич",
    leaf: "л. 1161",
    src: "/evidence/rgada/f210-op6d-d54/crops/fedor-1161.jpg",
    full: "/archive/evidence/rgada/f210-op6d-d54/P1290048.JPG",
  },
  {
    name: "Иван Михайлович",
    leaf: "л. 1178 об.",
    src: "/evidence/rgada/f210-op6d-d54/crops/ivan-1178-ob.jpg",
    full: "/archive/evidence/rgada/f210-op6d-d54/P1290065.JPG",
  },
];

export function OrelOathPrelude() {
  return (
    <figure className="orel-oath-prelude">
      <div
        className="orel-oath-prelude-strips"
        aria-label="Три фрагмента крестоприводной книги Орловского уезда 1645 года"
      >
        {oathRecords.map((record) => (
          <a href={record.full} key={record.name} title={`Открыть полный лист: ${record.name}`}>
            <img
              alt={`Рукописный присяжный лист XVII века с именем служилого человека — ${record.name}`}
              src={record.src}
            />
            <span>
              <strong>{record.name}</strong>
              <small>{record.leaf}</small>
            </span>
          </a>
        ))}
      </div>

      <figcaption>
        <span>Орёл · 1645 год</span>
        <strong>
          Летом 1645 года служилых людей уезда собрали к присяге новому царю — и фамилия
          попала на бумагу трижды
        </strong>
        <small>РГАДА, ф. 210, оп. 6д, д. 54. Нажатие открывает полный архивный лист.</small>
      </figcaption>
    </figure>
  );
}
