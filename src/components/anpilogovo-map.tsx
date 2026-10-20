import { AnpilogovoOpenStreetMap } from "@/components/anpilogovo-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  first: "1-е Анпилогово",
  firstDetail: "южный ориентир на современной карте · Курский район",
  second: "2-е Анпилогово",
  secondDetail: "северный ориентир на современной карте · Курский район",
  key: "Две деревни с фамильным названием",
  region: "Курский район",
  pan: "Карту можно двигать и увеличивать",
}, {
  en: {
    first: "1st Anpilogovo",
    firstDetail: "southern landmark on the modern map · Kursk district",
    second: "2nd Anpilogovo",
    secondDetail: "northern landmark on the modern map · Kursk district",
    key: "Two villages bearing the family name",
    region: "Kursk district",
    pan: "The map can be panned and zoomed",
  },
  uk: {
    first: "1-ше Анпілогово",
    firstDetail: "південний орієнтир на сучасній мапі · Курський район",
    second: "2-ге Анпілогово",
    secondDetail: "північний орієнтир на сучасній мапі · Курський район",
    key: "Два села з родовою назвою",
    region: "Курський район",
    pan: "Мапу можна рухати й збільшувати",
  },
  be: {
    first: "1-е Анпілогава",
    firstDetail: "паўднёвы арыенцір на сучаснай карце · Курскі раён",
    second: "2-е Анпілогава",
    secondDetail: "паўночны арыенцір на сучаснай карце · Курскі раён",
    key: "Дзве вёскі з прозвішчавай назвай",
    region: "Курскі раён",
    pan: "Карту можна рухаць і павялічваць",
  },
});

const placeCoordinates = [
  {
    searchQuery: "1-е Анпилогово, Курский район, Курская область, Россия",
    latitude: 51.778333,
    longitude: 36.006667,
  },
  {
    searchQuery: "2-е Анпилогово, Курский район, Курская область, Россия",
    latitude: 51.791667,
    longitude: 36.01,
  },
] as const;

export function AnpilogovoMap() {
  const text = copy[getLocale()];
  const places = [
    { ...placeCoordinates[0], name: text.first, detail: text.firstDetail },
    { ...placeCoordinates[1], name: text.second, detail: text.secondDetail },
  ];

  return (
    <figure className="amphilochia-map anpilogovo-map">
      <AnpilogovoOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key anpilogovo-map-key is-shared" /> {text.key}</span>
        <span>{text.region}</span>
        <span>{text.pan}</span>
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
