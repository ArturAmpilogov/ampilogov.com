import { KurskOboyanOpenStreetMap } from "@/components/kursk-oboyan-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const places = [
  {
    name: "Курск",
    detail: "Курская десятня · 1636 год",
    searchQuery: "Курск, Курская область, Россия",
    latitude: 51.7308,
    longitude: 36.193,
  },
  {
    name: "Обоянь",
    detail: "Обоянская десятня · 1651 год",
    searchQuery: "Обоянь, Курская область, Россия",
    latitude: 51.212,
    longitude: 36.2786,
  },
];

export function KurskOboyanMap() {
  return (
    <figure className="amphilochia-map kursk-oboyan-map">
      <KurskOboyanOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Курск · 1636</span>
        <span><i className="amphilochia-map-key is-modern" /> Обоянь · 1651</span>
        <span>Линия показывает направление, а не восстановленную дорогу</span>
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
        Десятни подтверждают присутствие Сергея в Курске в 1636 году и в Обояни
        в 1651-м. Отдельного документа о его переводе или точной дороге пока не
        найдено, поэтому линия соединяет только две установленные точки.
      </p>
    </figure>
  );
}
