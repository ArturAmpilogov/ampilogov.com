import { AnpilogovoOpenStreetMap } from "@/components/anpilogovo-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const places = [
  {
    name: "1-е Анпилогово",
    detail: "южный ориентир на современной карте · Курский район",
    searchQuery: "1-е Анпилогово, Курский район, Курская область, Россия",
    latitude: 51.778333,
    longitude: 36.006667,
  },
  {
    name: "2-е Анпилогово",
    detail: "северный ориентир на современной карте · Курский район",
    searchQuery: "2-е Анпилогово, Курский район, Курская область, Россия",
    latitude: 51.791667,
    longitude: 36.01,
  },
] as const;

export function AnpilogovoMap() {
  return (
    <figure className="amphilochia-map anpilogovo-map">
      <AnpilogovoOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key anpilogovo-map-key is-shared" /> Две деревни с фамильным названием</span>
        <span>Курский район</span>
        <span>Карту можно двигать и увеличивать</span>
      </figcaption>

      <div className="amphilochia-map-places anpilogovo-map-places">
        {places.map((place) => (
          <div className="amphilochia-map-place anpilogovo-map-place" key={place.name}>
            <div>
              <strong>{place.name}</strong>
              <small>{place.detail}</small>
            </div>
            <PlaceMapLinks {...place} />
          </div>
        ))}
      </div>
    </figure>
  );
}
