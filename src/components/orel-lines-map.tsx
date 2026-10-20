import { OrelLinesOpenStreetMap } from "@/components/orel-lines-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import Link from "@/i18n/link";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  places: [
    { name: "Белая", detail: "Иван → Илья, Василий и Антон" },
    { name: "Баздырево", detail: "Василий → Алексей и Григорий" },
  ],
  repeated: "Поместье повторяется в документах",
  orel: "Орёл показан для ориентира",
  points: "Точки обозначают селения, а не границы земли",
  note: "Белая и Баздырево уже названы в писцовой книге 1594/95 года, а в выписях 1625 года рядом с ними появляются дети владельцев. Такое совпадение места помогает различать линии, но само по себе ещё не заменяет прямой записи о родстве.",
  basisLink: "Основа карты",
}, {
  en: {
    places: [
      { name: "Belaya", detail: "Ivan → Ilya, Vasily and Anton" },
      { name: "Bazdyrevo", detail: "Vasily → Alexei and Grigory" },
    ],
    repeated: "Estate recurs in the documents",
    orel: "Oryol shown for orientation",
    points: "Points mark settlements, not land boundaries",
    note: "Belaya and Bazdyrevo are already named in the cadastral book of 1594/95, and in the 1625 extracts the holders' children appear next to them. Such a match of place helps tell the lines apart, but on its own it does not replace a direct record of kinship.",
    basisLink: "Basis of the map",
  },
  uk: {
    places: [
      { name: "Бєлая", detail: "Іван → Ілля, Василь і Антон" },
      { name: "Баздирево", detail: "Василь → Олексій і Григорій" },
    ],
    repeated: "Маєток повторюється в документах",
    orel: "Орел показано для орієнтиру",
    points: "Точки позначають поселення, а не межі землі",
    note: "Бєлая і Баздирево вже названі в писцевій книзі 1594/95 року, а у виписах 1625 року поруч із ними з’являються діти власників. Такий збіг місця допомагає розрізняти лінії, але сам по собі ще не замінює прямого запису про спорідненість.",
    basisLink: "Основа карти",
  },
  be: {
    places: [
      { name: "Белая", detail: "Іван → Ілья, Васілій і Антон" },
      { name: "Баздырава", detail: "Васілій → Аляксей і Грыгорый" },
    ],
    repeated: "Маёнтак паўтараецца ў дакументах",
    orel: "Арол паказаны для арыентыру",
    points: "Пункты абазначаюць паселішчы, а не межы зямлі",
    note: "Белая і Баздырава ўжо названы ў пісцовай кнізе 1594/95 года, а ў выпісах 1625 года побач з імі з’яўляюцца дзеці ўладальнікаў. Такое супадзенне месца дапамагае адрозніваць лініі, але само па сабе яшчэ не замяняе прамога запісу пра сваяцтва.",
    basisLink: "Аснова карты",
  },
});

const places = [
  {
    name: "Белая",
    searchQuery: "Белолунино, Урицкий район, Орловская область, Россия",
    latitude: 52.941863,
    longitude: 35.507563,
  },
  {
    name: "Баздырево",
    searchQuery: "Баздрево, Хотынецкий район, Орловская область, Россия",
    latitude: 52.98454,
    longitude: 35.439101,
  },
];

export function OrelLinesMap() {
  const text = copy[getLocale()];

  return (
    <figure className="amphilochia-map orel-estates-map">
      <OrelLinesOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key orel-estates-map-key is-matched" /> {text.repeated}</span>
        <span>{text.orel}</span>
        <span>{text.points}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        {places.map((place, index) => (
          <div className="amphilochia-map-place" key={place.name}>
            <div>
              <strong>{text.places[index].name}</strong>
              <small>{text.places[index].detail}</small>
            </div>
            <PlaceMapLinks {...place} name={text.places[index].name} />
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note orel-estates-map-note">
        {text.note} <Link href="/read/research/sources#s-orel-geography">{text.basisLink}</Link>.
      </p>
    </figure>
  );
}
