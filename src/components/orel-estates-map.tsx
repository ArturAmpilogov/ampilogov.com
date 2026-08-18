import Link from "next/link";
import { OrelEstatesOpenStreetMap } from "@/components/orel-estates-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const places = [
  {
    name: "Баздырево",
    detail: "ныне Баздрево",
    searchQuery: "Баздрево, Хотынецкий район, Орловская область, Россия",
    latitude: 52.98454,
    longitude: 35.439101,
  },
  {
    name: "Белая",
    detail: "ныне Белолунино",
    searchQuery: "Белолунино, Урицкий район, Орловская область, Россия",
    latitude: 52.941863,
    longitude: 35.507563,
  },
  {
    name: "Радомлея",
    detail: "ныне Радомль",
    searchQuery: "Радомль, Урицкий район, Орловская область, Россия",
    latitude: 53.036655,
    longitude: 35.491152,
  },
  {
    name: "Софоново",
    detail: "историческая локализация; современная точка не установлена",
    latitude: 53.0203,
    longitude: 35.535,
    coordinateOnly: true,
  },
  {
    name: "Малцовская",
    detail: "ныне Лаврово",
    searchQuery: "Лаврово, Орловский муниципальный округ, Орловская область, Россия",
    latitude: 52.838365,
    longitude: 36.009488,
  },
] as const;

export function OrelEstatesMap() {
  return (
    <figure className="amphilochia-map orel-estates-map">
      <OrelEstatesOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key orel-estates-map-key is-matched" /> Сопоставлено с современным местом</span>
        <span><i className="amphilochia-map-key orel-estates-map-key is-historical" /> Приблизительная историческая область</span>
        <span>Орёл показан для ориентира</span>
      </figcaption>

      <div className="amphilochia-map-places orel-estates-map-places">
        {places.map((place) => (
          <div className="amphilochia-map-place orel-estates-map-place" key={place.name}>
            <div>
              <strong>{place.name}</strong>
              <small>{place.detail}</small>
            </div>
            <PlaceMapLinks {...place} />
          </div>
        ))}
      </div>

      <p className="amphilochia-map-note orel-estates-map-note">
        Карта соединяет писцовое описание с современными топонимами. Софоново показано
        областью, а не точной точкой: селение исчезло, и доступная историческая карта
        допускает погрешность. <Link href="/read/research/sources#s-orel-geography">Источники и границы точности</Link>.
      </p>
    </figure>
  );
}
