import { AmphilochiaOpenStreetMap } from "@/components/amphilochia-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

type MapPlace = {
  name: string;
  detail: string;
  searchQuery?: string;
  latitude: number;
  longitude: number;
  coordinateOnly?: boolean;
};

const places: MapPlace[] = [
  {
    name: "Амфилохия",
    detail: "современный город",
    searchQuery: "Amfilochia, Aetolia-Acarnania, Greece",
    latitude: 38.86342,
    longitude: 21.16667,
  },
  {
    name: "Аргос Амфилохийский",
    detail: "ориентировочная локализация древнего города",
    latitude: 38.935912,
    longitude: 21.180267,
    coordinateOnly: true,
  },
];

export function AmphilochiaMap() {
  return (
    <figure className="amphilochia-map">
      <AmphilochiaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Современный город</span>
        <span><i className="amphilochia-map-key is-ancient" /> Область древней локализации</span>
        <span>Карту можно двигать и увеличивать</span>
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

      <p className="amphilochia-map-note">
        Современная Амфилохия открывается как именованный город. Для древнего Аргоса
        оставлена координатная область: академические справочники расходятся в точной
        локализации.
      </p>
    </figure>
  );
}
