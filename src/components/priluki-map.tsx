import { PlaceMapLinks } from "@/components/place-map-links";
import { PrilukiOpenStreetMap } from "@/components/priluki-open-street-map";

const priluki = {
  name: "Прилуки",
  searchQuery: "село Прилуки, Угличский район, Ярославская область, Россия",
  latitude: 57.365108,
  longitude: 38.037449,
};

const onfilogovo = {
  name: "Район деревни Онфилогово",
  latitude: 57.82,
  longitude: 37.761667,
  coordinateOnly: true,
};

export function PrilukiMap() {
  return (
    <figure className="amphilochia-map priluki-map">
      <PrilukiOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Прилуки · 1536/37</span>
        <span><i className="amphilochia-map-key is-approximate" /> Онфилогово · 1539/40, приблизительно</span>
        <span>Углич показан для ориентира</span>
        <span>Линия показывает порядок записей, не путь</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Прилуки на Волге</strong>
            <small>современное село сохраняет название исторического поселения</small>
          </div>
          <PlaceMapLinks {...priluki} />
        </div>
        <div className="amphilochia-map-place">
          <div>
            <strong>Онфилогово при Никольском Свечине</strong>
            <small>исчезнувшая деревня; показана область связанного села, а не точное место</small>
          </div>
          <PlaceMapLinks {...onfilogovo} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        Прилуки отмечены по современному селу; точный двор Тонкого неизвестен, а
        старый берег Волги изменился после создания Угличского водохранилища.
        Онфилогово показано у современного Николо-Свечина, к которому писцовая
        книга относит деревню. Родственная связь между двумя записями не установлена.
      </p>
    </figure>
  );
}
