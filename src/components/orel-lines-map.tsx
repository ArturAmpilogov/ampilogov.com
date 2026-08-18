import Link from "next/link";
import { OrelLinesOpenStreetMap } from "@/components/orel-lines-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const places = [
  {
    name: "Белая",
    detail: "Иван → Илья, Василий и Антон",
    searchQuery: "Белолунино, Урицкий район, Орловская область, Россия",
    latitude: 52.941863,
    longitude: 35.507563,
  },
  {
    name: "Баздырево",
    detail: "Василий → Алексей и Григорий",
    searchQuery: "Баздрево, Хотынецкий район, Орловская область, Россия",
    latitude: 52.98454,
    longitude: 35.439101,
  },
];

export function OrelLinesMap() {
  return (
    <figure className="amphilochia-map orel-estates-map">
      <OrelLinesOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key orel-estates-map-key is-matched" /> Поместье повторяется в документах</span>
        <span>Орёл показан для ориентира</span>
        <span>Точки обозначают селения, а не границы земли</span>
      </figcaption>

      <div className="amphilochia-map-places">
        {places.map((place) => (
          <div className="amphilochia-map-place" key={place.name}>
            <div>
              <strong>{place.name}</strong>
              <small>{place.detail}</small>
            </div>
            <PlaceMapLinks {...place} />
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note orel-estates-map-note">
        Белая и Баздырево уже названы в писцовой книге 1594/95 года, а в выписях
        1625 года рядом с ними появляются дети владельцев. Такое совпадение места
        помогает различать линии, но само по себе ещё не заменяет прямой записи о
        родстве. <Link href="/read/research/sources#s-orel-geography">Основа карты</Link>.
      </p>
    </figure>
  );
}
