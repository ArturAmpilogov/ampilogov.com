import { KonyaOpenStreetMap } from "@/components/konya-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const konya = {
  name: "Кония",
  searchQuery: "Konya, Türkiye",
  latitude: 37.87464,
  longitude: 32.49316,
};

export function KonyaMap() {
  return (
    <figure className="amphilochia-map konya-map">
      <KonyaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> Один город, два исторических имени</span>
        <span>Центральная Анатолия</span>
        <span>Карту можно двигать и увеличивать</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Икония → Кония</strong>
            <small>позднеантичный и современный город на одном месте</small>
          </div>
          <PlaceMapLinks {...konya} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        Круг показывает городской район, а не границу древнего поселения. Ссылка на
        карты открывает современную Конию как именованный город, без приблизительной
        координатной метки.
      </p>
    </figure>
  );
}
