"use client";

// A client component so every map (server or client) can render it without
// threading the locale through props.
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";

const copy = defineCopy(
  {
    yandex: "Яндекс Карты",
    navLabel: (name: string) => `${name}: открыть на карте`,
    linkTitle: (name: string, service: string) => `Открыть «${name}» в ${service} — новая вкладка`,
  },
  {
    en: {
      yandex: "Yandex Maps",
      navLabel: (name) => `${name}: open on a map`,
      linkTitle: (name, service) => `Open “${name}” in ${service} (new tab)`,
    },
    uk: {
      yandex: "Яндекс Карти",
      navLabel: (name) => `${name}: відкрити на мапі`,
      linkTitle: (name, service) => `Відкрити «${name}» у ${service} — нова вкладка`,
    },
    be: {
      yandex: "Яндэкс Карты",
      navLabel: (name) => `${name}: адкрыць на карце`,
      linkTitle: (name, service) => `Адкрыць «${name}» у ${service} — новая ўкладка`,
    },
  },
);

type PlaceMapLinksProps = {
  name: string;
  searchQuery?: string;
  latitude: number;
  longitude: number;
  coordinateOnly?: boolean;
};

const services = [
  { key: "google", label: "Google Maps" },
  { key: "yandex", label: null },
  { key: "osm", label: "OpenStreetMap" },
] as const;

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M6 3h7v7M13 3 5.5 10.5M11 9.5V13H3V5h3.5" />
    </svg>
  );
}

function buildLinks({
  name,
  searchQuery,
  latitude,
  longitude,
  coordinateOnly = false,
}: PlaceMapLinksProps) {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  const query = encodeURIComponent(searchQuery ?? name);

  if (!coordinateOnly) {
    return {
      google: `https://www.google.com/maps/search/?api=1&query=${query}`,
      yandex: `https://yandex.ru/maps/?text=${query}`,
      osm: `https://www.openstreetmap.org/search?query=${query}`,
    };
  }

  return {
    google: `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lon}`,
    yandex: `https://yandex.ru/maps/?ll=${lon}%2C${lat}&z=14&pt=${lon}%2C${lat}%2Cpm2rdm`,
    osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`,
  };
}

export function PlaceMapLinks(props: PlaceMapLinksProps) {
  const text = copy[useLocale()];
  const links = buildLinks(props);

  return (
    <nav className="map-external-links" aria-label={text.navLabel(props.name)}>
      {services.map((service) => {
        const label = service.label ?? text.yandex;
        const title = text.linkTitle(props.name, label);
        return (
          <a
            href={links[service.key]}
            key={service.key}
            target="_blank"
            rel="noreferrer"
            title={title}
            aria-label={title}
          >
            <span>{label}</span>
            <ExternalLinkIcon />
          </a>
        );
      })}
    </nav>
  );
}
