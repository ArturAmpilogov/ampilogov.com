import type { Feature, FeatureCollection, Geometry } from "geojson";
import { geoCentroid, geoMercator, geoPath } from "d3-geo";
import { PlaceMapLinks } from "@/components/place-map-links";
import regionsData from "@/data/family-map-regions.json";

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
        <title id="family-map-title">Карта документальных ядер и фамильных топонимов</title>
        <desc id="family-map-description">
          Орловское и курско-обоянское документальные ядра, деревни 1-е и 2-е
          Анпилогово и село Анпиловка.
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
                {feature.properties.label}
              </text>
            );
          })}
        </g>

        <g className="family-map-cores">
          {cores.map((core) => {
            const point = projection(core.coordinates);
            if (!point) return null;
            return (
              <g key={core.name}>
                <circle cx={point[0]} cy={point[1]} r={core.radius} />
                <text x={point[0]} y={point[1] - 8}>
                  {core.name}
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
              1-е и 2-е Анпилогово
            </text>
          </g>
        ) : null}

        {anpilovka ? (
          <g className="family-map-toponym">
            <circle cx={anpilovka[0]} cy={anpilovka[1]} r="9" />
            <circle className="family-map-toponym-core" cx={anpilovka[0]} cy={anpilovka[1]} r="3" />
            <text x={anpilovka[0] + 16} y={anpilovka[1] - 16} textAnchor="start">
              Анпиловка
            </text>
          </g>
        ) : null}
      </svg>

      <figcaption>
        <span><i className="family-map-key family-map-key--core" /> Документальное ядро, схематично</span>
        <span><i className="family-map-key family-map-key--place" /> Сохранившийся топоним</span>
      </figcaption>

      <div className="family-map-places">
        {places.map((place) => (
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
        Современные границы даны для ориентира и не совпадают с историческими уездами.
        Границы: <a href="https://www.geoboundaries.org/api/current/gbOpen/RUS/ADM1/" target="_blank" rel="noreferrer">geoBoundaries / OpenStreetMap</a>, ODbL 1.0.
      </p>
    </figure>
  );
}
