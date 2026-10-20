import { OrelEstatesOpenStreetMap } from "@/components/orel-estates-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  places: [
    { name: "Баздырево", detail: "ныне Баздрево" },
    { name: "Белая", detail: "ныне Белолунино" },
    { name: "Радомлея", detail: "ныне Радомль" },
    { name: "Софоново", detail: "историческая локализация; современная точка не установлена" },
    { name: "Малцовская", detail: "ныне Лаврово" },
  ],
  matched: "Сопоставлено с современным местом",
  historical: "Приблизительная историческая область",
  orel: "Орёл показан для ориентира",
  note: "Карта соединяет писцовое описание с современными топонимами. Софоново показано областью, а не точной точкой: селение исчезло, и доступная историческая карта допускает погрешность.",
  sourcesLink: "Источники и границы точности",
}, {
  en: {
    places: [
      { name: "Bazdyrevo", detail: "now Bazdrevo" },
      { name: "Belaya", detail: "now Belolunino" },
      { name: "Radomleya", detail: "now Radoml" },
      { name: "Sofonovo", detail: "historical location; no modern point identified" },
      { name: "Maltsovskaya", detail: "now Lavrovo" },
    ],
    matched: "Matched to a modern place",
    historical: "Approximate historical area",
    orel: "Oryol shown for orientation",
    note: "The map links the cadastral description to modern place names. Sofonovo is shown as an area rather than a precise point: the settlement has disappeared, and the available historical map allows for error.",
    sourcesLink: "Sources and limits of accuracy",
  },
  uk: {
    places: [
      { name: "Баздирево", detail: "нині Баздрево" },
      { name: "Бєлая", detail: "нині Бєлолуніно" },
      { name: "Радомлєя", detail: "нині Радомль" },
      { name: "Софоново", detail: "історична локалізація; сучасну точку не встановлено" },
      { name: "Малцовська", detail: "нині Лаврово" },
    ],
    matched: "Зіставлено із сучасним місцем",
    historical: "Приблизна історична область",
    orel: "Орел показано для орієнтиру",
    note: "Карта поєднує писцевий опис із сучасними топонімами. Софоново показано областю, а не точною точкою: поселення зникло, а доступна історична карта допускає похибку.",
    sourcesLink: "Джерела та межі точності",
  },
  be: {
    places: [
      { name: "Баздырава", detail: "цяпер Баздрава" },
      { name: "Белая", detail: "цяпер Белалуніна" },
      { name: "Радамлея", detail: "цяпер Радомль" },
      { name: "Сафонава", detail: "гістарычная лакалізацыя; сучасны пункт не ўстаноўлены" },
      { name: "Малцоўская", detail: "цяпер Лаўрава" },
    ],
    matched: "Супастаўлена з сучасным месцам",
    historical: "Прыблізная гістарычная вобласць",
    orel: "Арол паказаны для арыентыру",
    note: "Карта звязвае пісцовае апісанне з сучаснымі тапонімамі. Сафонава паказана вобласцю, а не дакладным пунктам: паселішча знікла, а даступная гістарычная карта дапускае хібнасць.",
    sourcesLink: "Крыніцы і межы дакладнасці",
  },
});

const places = [
  {
    name: "Баздырево",
    searchQuery: "Баздрево, Хотынецкий район, Орловская область, Россия",
    latitude: 52.98454,
    longitude: 35.439101,
  },
  {
    name: "Белая",
    searchQuery: "Белолунино, Урицкий район, Орловская область, Россия",
    latitude: 52.941863,
    longitude: 35.507563,
  },
  {
    name: "Радомлея",
    searchQuery: "Радомль, Урицкий район, Орловская область, Россия",
    latitude: 53.036655,
    longitude: 35.491152,
  },
  {
    name: "Софоново",
    latitude: 53.0203,
    longitude: 35.535,
    coordinateOnly: true,
  },
  {
    name: "Малцовская",
    searchQuery: "Лаврово, Орловский муниципальный округ, Орловская область, Россия",
    latitude: 52.838365,
    longitude: 36.009488,
  },
] as const;

export function OrelEstatesMap() {
  const text = copy[getLocale()];

  return (
    <figure className="amphilochia-map orel-estates-map">
      <OrelEstatesOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key orel-estates-map-key is-matched" /> {text.matched}</span>
        <span><i className="amphilochia-map-key orel-estates-map-key is-historical" /> {text.historical}</span>
        <span>{text.orel}</span>
      </figcaption>

      <div className="amphilochia-map-places orel-estates-map-places">
        {places.map((place, index) => (
          <div className="amphilochia-map-place orel-estates-map-place" key={place.name}>
            <div>
              <strong>{text.places[index].name}</strong>
              <small>{text.places[index].detail}</small>
            </div>
            <PlaceMapLinks {...place} name={text.places[index].name} />
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note orel-estates-map-note">
        {text.note} <Link href="/read/research/sources#s-orel-geography">{text.sourcesLink}</Link>.
      </p>
    </figure>
  );
}
