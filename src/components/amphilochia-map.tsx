import { AmphilochiaOpenStreetMap } from "@/components/amphilochia-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

type MapPlace = {
  name: string;
  detail: string;
  searchQuery?: string;
  latitude: number;
  longitude: number;
  coordinateOnly?: boolean;
};

const copy = defineCopy({
  modernName: "Амфилохия",
  modernDetail: "современный город",
  ancientName: "Аргос Амфилохийский",
  ancientDetail: "ориентировочная локализация древнего города",
  modernKey: "Современный город",
  ancientKey: "Область древней локализации",
  pan: "Карту можно двигать и увеличивать",
  note: "Современный город до 1908 года назывался Карвасарас, а затем получил имя исторической области. Для древнего Аргоса оставлена координатная область: академические справочники расходятся в точной локализации.",
}, {
  en: {
    modernName: "Amfilochia",
    modernDetail: "modern town",
    ancientName: "Amphilochian Argos",
    ancientDetail: "approximate location of the ancient city",
    modernKey: "Modern town",
    ancientKey: "Area of the ancient location",
    pan: "The map can be panned and zoomed",
    note: "Until 1908 the modern town was called Karvasaras; it then took the name of the historical region. For ancient Argos only a coordinate area is shown: academic gazetteers disagree on its exact location.",
  },
  uk: {
    modernName: "Амфілохія",
    modernDetail: "сучасне місто",
    ancientName: "Аргос Амфілохійський",
    ancientDetail: "орієнтовна локалізація давнього міста",
    modernKey: "Сучасне місто",
    ancientKey: "Область давньої локалізації",
    pan: "Мапу можна рухати й збільшувати",
    note: "Сучасне місто до 1908 року називалося Карвасарас, а потім дістало ім’я історичної області. Для давнього Аргоса залишено координатну область: академічні довідники розходяться щодо точної локалізації.",
  },
  be: {
    modernName: "Амфілохія",
    modernDetail: "сучасны горад",
    ancientName: "Аргас Амфілохійскі",
    ancientDetail: "арыентыровачная лакалізацыя старажытнага горада",
    modernKey: "Сучасны горад",
    ancientKey: "Вобласць старажытнай лакалізацыі",
    pan: "Карту можна рухаць і павялічваць",
    note: "Сучасны горад да 1908 года называўся Карвасарас, а потым атрымаў імя гістарычнай вобласці. Для старажытнага Аргаса пакінута каардынатная вобласць: акадэмічныя даведнікі разыходзяцца ў дакладнай лакалізацыі.",
  },
});

export function AmphilochiaMap() {
  const text = copy[getLocale()];
  const places: MapPlace[] = [
    {
      name: text.modernName,
      detail: text.modernDetail,
      searchQuery: "Amfilochia, Aetolia-Acarnania, Greece",
      latitude: 38.86342,
      longitude: 21.16667,
    },
    {
      name: text.ancientName,
      detail: text.ancientDetail,
      latitude: 38.935912,
      longitude: 21.180267,
      coordinateOnly: true,
    },
  ];

  return (
    <figure className="amphilochia-map">
      <AmphilochiaOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-modern" /> {text.modernKey}</span>
        <span><i className="amphilochia-map-key is-ancient" /> {text.ancientKey}</span>
        <span>{text.pan}</span>
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
        {text.note}
      </p>
    </figure>
  );
}
