import { AnpilovkaOpenStreetMap } from "@/components/anpilovka-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  name: "Анпиловка",
  key: "Современная Анпиловка",
  region: "Старооскольский округ",
  pan: "Карту можно двигать и увеличивать",
  title: "Анпиловка у села Бор",
  detail: "селение, выросшее рядом с дворами старооскольских Анпиловых",
}, {
  en: {
    name: "Anpilovka",
    key: "Modern Anpilovka",
    region: "Stary Oskol district",
    pan: "The map can be panned and zoomed",
    title: "Anpilovka near the village of Bor",
    detail: "a settlement that grew up next to the homesteads of the Stary Oskol Anpilovs",
  },
  uk: {
    name: "Анпіловка",
    key: "Сучасна Анпіловка",
    region: "Старооскольський округ",
    pan: "Мапу можна рухати й збільшувати",
    title: "Анпіловка біля села Бор",
    detail: "поселення, що виросло поруч із дворами старооскольських Анпілових",
  },
  be: {
    name: "Анпілаўка",
    key: "Сучасная Анпілаўка",
    region: "Старааскольская акруга",
    pan: "Карту можна рухаць і павялічваць",
    title: "Анпілаўка каля сяла Бор",
    detail: "паселішча, якое вырасла побач з дварамі старааскольскіх Анпілавых",
  },
});

const anpilovkaPlace = {
  searchQuery: "Анпиловка, Старооскольский городской округ, Белгородская область, Россия",
  latitude: 51.26,
  longitude: 37.879444,
};

export function AnpilovkaMap() {
  const text = copy[getLocale()];
  const anpilovka = { ...anpilovkaPlace, name: text.name };

  return (
    <figure className="amphilochia-map anpilogovo-map">
      <AnpilovkaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key anpilogovo-map-key is-independent" /> {text.key}</span>
        <span>{text.region}</span>
        <span>{text.pan}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.title}</strong>
            <small>{text.detail}</small>
          </div>
          <PlaceMapLinks {...anpilovka} />
        </div>
      </div>
    </figure>
  );
}
