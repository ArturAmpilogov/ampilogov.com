import { PlaceMapLinks } from "@/components/place-map-links";
import { PrilukiOpenStreetMap } from "@/components/priluki-open-street-map";

const priluki = {
  name: "Прилуки",
  searchQuery: "село Прилуки, Угличский район, Ярославская область, Россия",
  latitude: 57.365108,
  longitude: 38.037449,
};

const onfilogovo = {
  name: "Никольское (Свечино), центр владения с деревней Онфилогово",
  latitude: 56.3225861843296,
  longitude: 35.2047323324939,
  coordinateOnly: true,
};

export function PrilukiMap() {
  return (
    <figure className="amphilochia-map priluki-map">
      <PrilukiOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Прилуки · 1536/37</span>
        <span><i className="amphilochia-map-key is-approximate" /> Онфилогово · реконструированный центр владения</span>
        <span>Прилуки — Угличский уезд; Онфилогово — Тверской</span>
        <span>Линия показывает порядок записей, не путь</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Прилуки на Волге</strong>
            <small>монастырское село; точное место двора Тонкого неизвестно</small>
          </div>
          <PlaceMapLinks {...priluki} />
        </div>
        <div className="amphilochia-map-place">
          <div>
            <strong>Онфилогово при Никольском Свечине</strong>
            <small>центр владения в научной ГИС; точка самой деревни пока не установлена</small>
          </div>
          <PlaceMapLinks {...onfilogovo} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        Прилуки показаны по современному селу. Для Онфилогова отмечен центр
        владения — Никольское Свечино в волости Хорвач. Ни точный двор Тонкого,
        ни положение четырёх дворов деревни пока не установлены. Родство между
        носителями имени в этих местах неизвестно.
      </p>
    </figure>
  );
}
