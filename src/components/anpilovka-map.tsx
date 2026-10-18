import { AnpilovkaOpenStreetMap } from "@/components/anpilovka-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";

const anpilovka = {
  name: "Анпиловка",
  searchQuery: "Анпиловка, Старооскольский городской округ, Белгородская область, Россия",
  latitude: 51.26,
  longitude: 37.879444,
};

export function AnpilovkaMap() {
  return (
    <figure className="amphilochia-map anpilogovo-map">
      <AnpilovkaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key anpilogovo-map-key is-independent" /> Современная Анпиловка</span>
        <span>Старооскольский округ</span>
        <span>Карту можно двигать и увеличивать</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>Анпиловка у села Бор</strong>
            <small>селение, выросшее рядом с дворами старооскольских Анпиловых</small>
          </div>
          <PlaceMapLinks {...anpilovka} />
        </div>
      </div>
    </figure>
  );
}
