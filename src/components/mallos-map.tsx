import { MallosOpenStreetMap } from "@/components/mallos-open-street-map";
import { PlaceMapLinks } from "@/components/place-map-links";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy({
  mallos: "Малл",
  karatas: "Караташ",
  ancientKey: "Область древнего Малла",
  contextKey: "Современные ориентиры",
  pan: "Карту можно двигать и увеличивать",
  mallosTitle: "Малл в Киликии",
  mallosDetail: "ориентировочная локализация возле Кызылтахты",
  karatasDetail: "современный город на средиземноморском берегу",
  note: "Круг показывает не границы города, а область локализации: академические справочники расходятся в координатах Малла на несколько километров.",
}, {
  en: {
    mallos: "Mallos",
    karatas: "Karataş",
    ancientKey: "Area of ancient Mallos",
    contextKey: "Modern landmarks",
    pan: "The map can be panned and zoomed",
    mallosTitle: "Mallos in Cilicia",
    mallosDetail: "approximate location near Kızıltahta",
    karatasDetail: "modern town on the Mediterranean coast",
    note: "The circle marks not the city limits but the area of the location: academic gazetteers differ on the coordinates of Mallos by several kilometres.",
  },
  uk: {
    mallos: "Малл",
    karatas: "Караташ",
    ancientKey: "Область давнього Малла",
    contextKey: "Сучасні орієнтири",
    pan: "Мапу можна рухати й збільшувати",
    mallosTitle: "Малл у Кілікії",
    mallosDetail: "орієнтовна локалізація біля Кизилтахти",
    karatasDetail: "сучасне місто на середземноморському узбережжі",
    note: "Коло показує не межі міста, а область локалізації: академічні довідники розходяться в координатах Малла на кілька кілометрів.",
  },
  be: {
    mallos: "Мал",
    karatas: "Караташ",
    ancientKey: "Вобласць старажытнага Мала",
    contextKey: "Сучасныя арыенціры",
    pan: "Карту можна рухаць і павялічваць",
    mallosTitle: "Мал у Кілікіі",
    mallosDetail: "арыентыровачная лакалізацыя каля Кызылтахты",
    karatasDetail: "сучасны горад на міжземнаморскім беразе",
    note: "Круг паказвае не межы горада, а вобласць лакалізацыі: акадэмічныя даведнікі разыходзяцца ў каардынатах Мала на некалькі кіламетраў.",
  },
});

const mallosPlace = {
  latitude: 36.756188,
  longitude: 35.4852,
  coordinateOnly: true,
};

const karatasPlace = {
  searchQuery: "Karataş, Adana, Türkiye",
  latitude: 36.5627,
  longitude: 35.382,
};

export function MallosMap() {
  const text = copy[getLocale()];
  const mallos = { ...mallosPlace, name: text.mallos };
  const karatas = { ...karatasPlace, name: text.karatas };

  return (
    <figure className="amphilochia-map mallos-map">
      <MallosOpenStreetMap />

      <figcaption>
        <span><i className="amphilochia-map-key is-ancient" /> {text.ancientKey}</span>
        <span><i className="mallos-map-key is-context" /> {text.contextKey}</span>
        <span>{text.pan}</span>
      </figcaption>

      <div className="amphilochia-map-places">
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.mallosTitle}</strong>
            <small>{text.mallosDetail}</small>
          </div>
          <PlaceMapLinks {...mallos} />
        </div>
        <div className="amphilochia-map-place">
          <div>
            <strong>{text.karatas}</strong>
            <small>{text.karatasDetail}</small>
          </div>
          <PlaceMapLinks {...karatas} />
        </div>
      </div>

      <p className="amphilochia-map-note">
        {text.note}
      </p>
    </figure>
  );
}
