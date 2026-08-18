import { PlaceMapLinks } from "@/components/place-map-links";
import { PrilukiOpenStreetMap } from "@/components/priluki-open-street-map";

const priluki = {
  name: "Прилуки",
  searchQuery: "село Прилуки, Угличский район, Ярославская область, Россия",
  latitude: 57.3675,
  longitude: 38.0464,
};

export function PrilukiMap() {
  return (
    <figure className="amphilochia-map priluki-map">
      <PrilukiOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Прилуки · место записи 1536/37 года</span>
        <span>Углич показан для ориентира</span>
        <span>Карту можно двигать и увеличивать</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Прилуки на Волге</strong>
            <small>современное село сохраняет название исторического поселения</small>
          </div>
          <PlaceMapLinks {...priluki} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        Маркер открывает современное село как именованное место. Он не указывает
        точный двор Тонкого: границы поселения XVI века неизвестны, а старый берег
        Волги изменился после создания Угличского водохранилища.
      </p>
    </figure>
  );
}
