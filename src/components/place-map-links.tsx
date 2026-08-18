type PlaceMapLinksProps = {
  name: string;
  searchQuery?: string;
  latitude: number;
  longitude: number;
  coordinateOnly?: boolean;
};

const services = [
  { key: "google", label: "Google Maps" },
  { key: "yandex", label: "Яндекс Карты" },
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
  const links = buildLinks(props);

  return (
    <nav className="map-external-links" aria-label={`${props.name}: открыть на карте`}>
      {services.map((service) => {
        const title = `Открыть «${props.name}» в ${service.label} — новая вкладка`;
        return (
          <a
            href={links[service.key]}
            key={service.key}
            target="_blank"
            rel="noreferrer"
            title={title}
            aria-label={title}
          >
            <span>{service.label}</span>
            <ExternalLinkIcon />
          </a>
        );
      })}
    </nav>
  );
}
