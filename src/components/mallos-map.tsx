import { MallosOpenStreetMap } from "@/components/mallos-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const mallos = {
  name: "Малл",
  latitude: 36.756188,
  longitude: 35.4852,
  coordinateOnly: true,
};

const karatas = {
  name: "Караташ",
  searchQuery: "Karataş, Adana, Türkiye",
  latitude: 36.5627,
  longitude: 35.382,
};

export function MallosMap() {
  return (
    <figure className="amphilochia-map mallos-map">
      <MallosOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-ancient" /> Область древнего Малла</span>
        <span><i className="mallos-map-key is-context" /> Современные ориентиры</span>
        <span>Карту можно двигать и увеличивать</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Малл в Киликии</strong>
            <small>ориентировочная локализация возле Кызылтахты</small>
          </div>
          <PlaceMapLinks {...mallos} />
        </div>
        <div className="amphilochia-map-place">
          <div>
            <strong>Караташ</strong>
            <small>современный город на средиземноморском берегу</small>
          </div>
          <PlaceMapLinks {...karatas} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        Круг показывает не границы города, а область локализации: академические
        справочники расходятся в координатах Малла на несколько километров.
      </p>
    </figure>
  );
}
