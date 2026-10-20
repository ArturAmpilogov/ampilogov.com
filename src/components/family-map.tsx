import type { Feature, FeatureCollection, Geometry } from "geojson";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import { PlaceMapLinks } from "@/components/place-map-links";
import regionsData from "@/data/family-map-regions.json";
import { defineCopy } from "@/i18n/copy";
import { getLocale } from "@/i18n/server";

const copy = defineCopy(
  {
    title: "Карта документальных ядер и фамильных топонимов",
    description: "Орловское и курско-обоянское документальные ядра, деревни 1-е и 2-е Анпилогово и село Анпиловка.",
    // Region labels come from the JSON in Russian; other locales map them by shapeName.
    regionLabels: null as Record<string, string> | null,
    places: ["1-е Анпилогово", "2-е Анпилогово", "Анпиловка"],
    regions: ["Курская область", "Курская область", "Белгородская область"],
    cores: ["Орловское ядро", "Курско-обоянское ядро"],
    villagePair: "1-е и 2-е Анпилогово",
    anpilovka: "Анпиловка",
    coreKey: "Документальное ядро, схематично",
    placeKey: "Сохранившийся топоним",
    note: "Современные границы даны для ориентира и не совпадают с историческими уездами.",
    boundaries: "Границы:",
  },
  {
    en: {
      title: "Map of documentary cores and surname place names",
      description: "The Oryol and Kursk–Oboyan documentary cores, the villages of 1st and 2nd Anpilogovo and the village of Anpilovka.",
      regionLabels: { "Oryol Oblast": "Oryol Oblast", "Kursk Oblast": "Kursk Oblast", "Belgorod Oblast": "Belgorod Oblast" },
      places: ["1st Anpilogovo", "2nd Anpilogovo", "Anpilovka"],
      regions: ["Kursk Oblast", "Kursk Oblast", "Belgorod Oblast"],
      cores: ["Oryol core", "Kursk–Oboyan core"],
      villagePair: "1st and 2nd Anpilogovo",
      anpilovka: "Anpilovka",
      coreKey: "Documentary core, schematic",
      placeKey: "Surviving place name",
      note: "Modern boundaries are shown for orientation and do not match the historical districts (uyezds).",
      boundaries: "Boundaries:",
    },
    uk: {
      title: "Мапа документальних осередків і прізвищевих топонімів",
      description: "Орловський і курсько-обоянський документальні осередки, села 1-ше і 2-ге Анпілогово та село Анпілівка.",
      regionLabels: { "Oryol Oblast": "Орловська область", "Kursk Oblast": "Курська область", "Belgorod Oblast": "Бєлгородська область" },
      places: ["1-ше Анпілогово", "2-ге Анпілогово", "Анпілівка"],
      regions: ["Курська область", "Курська область", "Бєлгородська область"],
      cores: ["Орловський осередок", "Курсько-обоянський осередок"],
      villagePair: "1-ше і 2-ге Анпілогово",
      anpilovka: "Анпілівка",
      coreKey: "Документальний осередок, схематично",
      placeKey: "Збережений топонім",
      note: "Сучасні кордони подано для орієнтиру, вони не збігаються з історичними повітами.",
      boundaries: "Кордони:",
    },
    be: {
      title: "Карта дакументальных ядраў і прозвішчавых тапонімаў",
      description: "Арлоўскае і курска-абаянскае дакументальныя ядры, вёскі 1-е і 2-е Анпілогава і сяло Анпілаўка.",
      regionLabels: { "Oryol Oblast": "Арлоўская вобласць", "Kursk Oblast": "Курская вобласць", "Belgorod Oblast": "Белгарадская вобласць" },
      places: ["1-е Анпілогава", "2-е Анпілогава", "Анпілаўка"],
      regions: ["Курская вобласць", "Курская вобласць", "Белгарадская вобласць"],
      cores: ["Арлоўскае ядро", "Курска-абаянскае ядро"],
      villagePair: "1-е і 2-е Анпілогава",
      anpilovka: "Анпілаўка",
      coreKey: "Дакументальнае ядро, схематычна",
      placeKey: "Захаваны тапонім",
      note: "Сучасныя межы дадзены для арыентыру і не супадаюць з гістарычнымі паветамі.",
      boundaries: "Межы:",
    },
  },
);

type RegionProperties = {
  shapeName: string;
  label: string;
};

type Place = {
  name: string;
  region: string;
  searchQuery: string;
  latitude: number;
  longitude: number;
};

const regions = regionsData as unknown as FeatureCollection<Geometry, RegionProperties>;

const places: Place[] = [
  {
    name: "1-е Анпилогово",
    region: "Курская область",
    searchQuery: "1-е Анпилогово, Курская область, Россия",
    latitude: 51.778333,
    longitude: 36.006667,
  },
  {
    name: "2-е Анпилогово",
    region: "Курская область",
    searchQuery: "2-е Анпилогово, Курская область, Россия",
    latitude: 51.791667,
    longitude: 36.01,
  },
  {
    name: "Анпиловка",
    region: "Белгородская область",
    searchQuery: "Анпиловка, Белгородская область, Россия",
    latitude: 51.26,
    longitude: 37.879444,
  },
];

const cores = [
  {
    name: "Орловское ядро",
    years: "1594–1645",
    coordinates: [36.08, 52.78] as [number, number],
    radius: 74,
  },
  {
    name: "Курско-обоянское ядро",
    years: "1636–1651",
    coordinates: [36.22, 51.48] as [number, number],
    radius: 88,
  },
];

const regionLabelOffsets: Record<string, [number, number]> = {
  "Oryol Oblast": [132, 44],
  "Kursk Oblast": [108, -72],
  "Belgorod Oblast": [34, 66],
};

export function FamilyMap() {
  const text = copy[getLocale()];
  const localizedPlaces = places.map((place, index) => ({
    ...place,
    name: text.places[index] ?? place.name,
    region: text.regions[index] ?? place.region,
  }));
  const width = 760;
  const height = 620;
  const projection = geoMercator().fitExtent(
    [[42, 38], [width - 42, height - 38]],
    regions,
  );
  const path = geoPath(projection);
  const villagePair = projection([
    (places[0].longitude + places[1].longitude) / 2,
    (places[0].latitude + places[1].latitude) / 2,
  ]);
  const anpilovka = projection([places[2].longitude, places[2].latitude]);

  return (
    <figure className="family-map">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="family-map-title family-map-description"
      >
        <title id="family-map-title">{text.title}</title>
        <desc id="family-map-description">
          {text.description}
        </desc>

        <g className="family-map-regions">
          {regions.features.map((feature) => {
            const regionPath = path(feature);
            if (!regionPath) return null;
            return (
              <path
                key={feature.properties.shapeName}
                className="family-map-region"
                data-region={feature.properties.shapeName}
                d={regionPath}
              />
            );
          })}
        </g>

        <g className="family-map-region-labels" aria-hidden="true">
          {regions.features.map((feature) => {
            const point = projection(
              geoCentroid(feature as Feature<Geometry, RegionProperties>),
            );
            if (!point) return null;
            const [offsetX, offsetY] = regionLabelOffsets[feature.properties.shapeName] ?? [0, 0];
            return (
              <text
                key={feature.properties.shapeName}
                x={point[0] + offsetX}
                y={point[1] + offsetY}
              >
                {text.regionLabels?.[feature.properties.shapeName] ?? feature.properties.label}
              </text>
            );
          })}
        </g>

        <g className="family-map-cores">
          {cores.map((core, coreIndex) => {
            const point = projection(core.coordinates);
            if (!point) return null;
            return (
              <g key={core.name}>
                <circle cx={point[0]} cy={point[1]} r={core.radius} />
                <text x={point[0]} y={point[1] - 8}>
                  {text.cores[coreIndex] ?? core.name}
                </text>
                <text className="family-map-years" x={point[0]} y={point[1] + 14}>
                  {core.years}
                </text>
              </g>
            );
          })}
        </g>

        {villagePair ? (
          <g className="family-map-toponym">
            <circle cx={villagePair[0]} cy={villagePair[1]} r="9" />
            <circle className="family-map-toponym-core" cx={villagePair[0]} cy={villagePair[1]} r="3" />
            <text x={villagePair[0] - 18} y={villagePair[1] - 18} textAnchor="end">
              {text.villagePair}
            </text>
          </g>
        ) : null}

        {anpilovka ? (
          <g className="family-map-toponym">
            <circle cx={anpilovka[0]} cy={anpilovka[1]} r="9" />
            <circle className="family-map-toponym-core" cx={anpilovka[0]} cy={anpilovka[1]} r="3" />
            <text x={anpilovka[0] + 16} y={anpilovka[1] - 16} textAnchor="start">
              {text.anpilovka}
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption>
        <span><i className="family-map-key family-map-key--core" /> {text.coreKey}</span>
        <span><i className="family-map-key family-map-key--place" /> {text.placeKey}</span>
      </figcaption>

      <div className="family-map-places">
        {localizedPlaces.map((place) => (
          <div className="family-map-place" key={place.name}>
            <div>
              <strong>{place.name}</strong>
              <span>{place.region}</span>
            </div>
            <PlaceMapLinks {...place} />
          </div>
        ))}
      </div>

      <p className="family-map-note">
        {text.note}
        {" "}{text.boundaries} <a href="https://www.geoboundaries.org/api/current/gbOpen/RUS/ADM1/" target="_blank" rel="noreferrer">geoBoundaries / OpenStreetMap</a>, ODbL 1.0.
      </p>
    </figure>
  );
}
