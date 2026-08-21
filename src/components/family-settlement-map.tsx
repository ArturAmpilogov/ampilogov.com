"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FamilyMapMigration, FamilyMapPlace } from "@/lib/genealogy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

type FamilySettlementMapProps = {
  places: FamilyMapPlace[];
  migrations: FamilyMapMigration[];
  range: { minYear: number; maxYear: number };
};

type PlaceSummary = {
  place: FamilyMapPlace;
  familyCount: number;
  peopleCount: number;
  generationCount: number;
  recordCount: number;
  firstYear: number;
  lastYear: number;
  activeEvents: FamilyMapPlace["events"];
};

type CountedMarker = import("leaflet").Marker & {
  familyCount?: number;
  generationCount?: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function summarizePlace(place: FamilyMapPlace, year: number): PlaceSummary | null {
  const activeEvents = place.events.filter((event) => event.year <= year);
  if (!activeEvents.length) return null;
  const years = activeEvents.map((event) => event.year);

  return {
    place,
    activeEvents,
    familyCount: new Set(activeEvents.flatMap((event) => event.familyIds)).size,
    peopleCount: new Set(activeEvents.flatMap((event) => event.personIds)).size,
    generationCount: Math.max(...activeEvents.map((event) => event.generation)),
    recordCount: new Set(activeEvents.map((event) => event.sourceId)).size,
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
  };
}

function placePopup(summary: PlaceSummary) {
  const records = [...summary.activeEvents].reverse().slice(0, 5);
  const precision = summary.place.geo.precision === "settlement" || summary.place.geo.precision === "historical-site"
    ? ""
    : `<small class="settlement-popup-precision">${escapeHtml(summary.place.precisionLabel)}</small>`;
  const recordLinks = records.map((event) => (
    `<a href="/records/${encodeURIComponent(event.sourceId)}">` +
    `<span>${escapeHtml(event.eventLabel)}</span>` +
    `<small>${escapeHtml(event.date)}</small>` +
    `</a>`
  )).join("");

  return `
    <div class="settlement-popup">
      <strong>${escapeHtml(summary.place.name)}</strong>
      <span>${summary.familyCount} семейных групп · ${summary.generationCount} поколений</span>
      <small>${summary.firstYear}—${summary.lastYear} · ${summary.recordCount} записей</small>
      ${precision}
      <nav aria-label="Последние записи места">${recordLinks}</nav>
    </div>
  `;
}

function markerHtml(summary: PlaceSummary, selected: boolean) {
  const size = Math.min(68, 22 + Math.sqrt(summary.familyCount) * 8);
  const rings = Math.min(6, summary.generationCount);
  const ringMarkup = Array.from({ length: rings }, (_, index) => (
    `<i style="--ring:${index + 1}" aria-hidden="true"></i>`
  )).join("");
  const approximate = ["district", "region", "approximate"].includes(summary.place.geo.precision);

  return `
    <span class="settlement-map-marker${selected ? " is-selected" : ""}${approximate ? " is-approximate" : ""}" style="--marker-size:${size}px">
      ${ringMarkup}
      <b>${summary.familyCount}</b>
    </span>
  `;
}

function migrationArrowHtml(bearing: number, documented: boolean) {
  return `
    <span
      class="settlement-migration-direction__arrow ${documented ? "is-documented" : "is-derived"}"
      style="--migration-bearing:${bearing}deg"
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <path class="settlement-migration-direction__halo" d="M2.5 12h16M13 6.5l5.5 5.5-5.5 5.5" />
        <path class="settlement-migration-direction__shaft" d="M2.5 12h16" />
        <path class="settlement-migration-direction__head" d="M13 6.5l5.5 5.5-5.5 5.5" />
      </svg>
    </span>
  `;
}

function plural(value: number, one: string, few: string, many: string) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function FamilySettlementMap({ places, migrations, range }: FamilySettlementMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const clusterRef = useRef<import("leaflet").MarkerClusterGroup | null>(null);
  const expandedClusterRef = useRef<import("leaflet").MarkerCluster | null>(null);
  const markersByPlaceRef = useRef(new Map<string, CountedMarker>());
  const routeLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [ready, setReady] = useState(false);
  const [year, setYear] = useState(range.maxYear);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState(false);

  const summaries = useMemo(() => places
    .map((place) => summarizePlace(place, year))
    .filter((summary): summary is PlaceSummary => Boolean(summary)), [places, year]);
  const summariesById = useMemo(() => new Map(
    summaries.map((summary) => [summary.place.placeId, summary]),
  ), [summaries]);
  const selected = selectedPlaceId ? summariesById.get(selectedPlaceId) ?? null : null;
  const totalFamilies = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.familyIds)),
  ).size, [summaries]);
  const totalPeople = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.personIds)),
  ).size, [summaries]);
  const totalRecords = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.map((event) => event.sourceId)),
  ).size, [summaries]);

  useEffect(() => {
    let active = true;
    const markersByPlace = markersByPlaceRef.current;

    void (async () => {
      const leafletModule = await import("leaflet");
      if (!active || !containerRef.current) return;
      const L = leafletModule.default;
      (window as typeof window & { L?: typeof L }).L = L;
      await import("leaflet.markercluster");
      if (!active || !containerRef.current) return;
      leafletRef.current = L;

      const map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [51.2, 39],
        zoom: 4,
        minZoom: 3,
        maxZoom: 16,
        zoomControl: false,
      });
      mapRef.current = map;

      if (window.matchMedia("(pointer: coarse)").matches) {
        map.dragging.disable();
      }

      map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com/" target="_blank" rel="noreferrer">Leaflet</a>',
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      clusterRef.current = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 54,
        spiderfyOnMaxZoom: true,
        iconCreateFunction(cluster) {
          const markers = cluster.getAllChildMarkers() as CountedMarker[];
          const familyCount = markers.reduce((sum, marker) => sum + (marker.familyCount ?? 0), 0);
          const generationCount = Math.max(1, ...markers.map((marker) => marker.generationCount ?? 1));
          const size = Math.min(72, 30 + Math.sqrt(familyCount) * 7);
          return L.divIcon({
            className: "settlement-proximity-cluster",
            html: `<span style="--cluster-size:${size}px"><i></i><b>${familyCount}</b><small>${generationCount} пок.</small></span>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
          });
        },
      });
      clusterRef.current.on("spiderfied", (event) => {
        expandedClusterRef.current = event.cluster;
        setExpandedCluster(true);
      });
      clusterRef.current.on("unspiderfied", () => {
        expandedClusterRef.current = null;
        setExpandedCluster(false);
      });
      routeLayerRef.current = L.layerGroup().addTo(map);
      clusterRef.current.addTo(map);

      map.on("click", () => setSelectedPlaceId(null));
      const bounds = L.latLngBounds(places.map((place) => [place.geo.latitude, place.geo.longitude]));
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 5 });
      window.requestAnimationFrame(() => map.invalidateSize());
      setReady(true);
    })();

    return () => {
      active = false;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      clusterRef.current = null;
      expandedClusterRef.current = null;
      markersByPlace.clear();
      routeLayerRef.current = null;
    };
  }, [places]);

  useEffect(() => {
    const L = leafletRef.current;
    const clusters = clusterRef.current;
    if (!ready || !L || !clusters) return;

    clusters.clearLayers();
    markersByPlaceRef.current.clear();

    for (const summary of summaries) {
      const size = Math.min(68, 22 + Math.sqrt(summary.familyCount) * 8);
      const marker = L.marker([summary.place.geo.latitude, summary.place.geo.longitude], {
        icon: L.divIcon({
          className: "settlement-map-marker-wrap",
          html: markerHtml(summary, false),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2 + 8)],
        }),
        keyboard: true,
        title: summary.place.name,
        riseOnHover: true,
      }) as CountedMarker;
      marker.familyCount = summary.familyCount;
      marker.generationCount = summary.generationCount;
      marker.bindTooltip(
        `${summary.place.name} · ${summary.familyCount} ${plural(summary.familyCount, "семья", "семьи", "семей")}`,
        { direction: "top", offset: [0, -(size / 2 + 4)], className: "settlement-map-tooltip" },
      );
      marker.bindPopup(placePopup(summary), { maxWidth: 320, minWidth: 240 });
      marker.on("click", () => {
        setSelectedPlaceId(summary.place.placeId);
      });
      markersByPlaceRef.current.set(summary.place.placeId, marker);
      clusters.addLayer(marker);
    }
  }, [ready, summaries]);

  useEffect(() => {
    if (!ready) return;

    for (const [placeId, marker] of markersByPlaceRef.current) {
      marker.getElement()
        ?.querySelector<HTMLElement>(".settlement-map-marker")
        ?.classList.toggle("is-selected", placeId === selectedPlaceId);
    }
  }, [ready, selectedPlaceId, summaries]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    if (!ready || !L || !map || !routeLayer) return;

    routeLayer.clearLayers();

    const activeMigrations = migrations.filter((migration) =>
      migration.year <= year && summariesById.has(migration.fromPlaceId) && summariesById.has(migration.toPlaceId)
    );
    for (const migration of activeMigrations) {
      const from = summariesById.get(migration.fromPlaceId)!;
      const to = summariesById.get(migration.toPlaceId)!;
      const related = !selectedPlaceId || migration.fromPlaceId === selectedPlaceId || migration.toPlaceId === selectedPlaceId;
      const documented = migration.migrationId.startsWith("documented:");
      const fromLatLng = L.latLng(from.place.geo.latitude, from.place.geo.longitude);
      const toLatLng = L.latLng(to.place.geo.latitude, to.place.geo.longitude);
      const route = L.polyline([fromLatLng, toLatLng], {
        className: `settlement-migration-route${documented ? " is-documented" : " is-derived"}${related ? " is-related" : " is-muted"}`,
        color: "#a6412f",
        weight: (documented ? 2.5 : 1.5) + Math.min(4, migration.personIds.length),
        opacity: related ? .68 : .08,
        dashArray: documented ? undefined : "5 8",
        interactive: related,
      }).addTo(routeLayer);
      route.bindTooltip(
        `${from.place.name} → ${to.place.name} · ${migration.personNames.join(", ")} · ${migration.basis}`,
        { sticky: true, className: "settlement-map-tooltip" },
      );

      const fromPoint = map.latLngToLayerPoint(fromLatLng);
      const toPoint = map.latLngToLayerPoint(toLatLng);
      const routeVector = toPoint.subtract(fromPoint);
      const bearing = Math.atan2(routeVector.y, routeVector.x) * 180 / Math.PI;
      const arrowPositions = fromPoint.distanceTo(toPoint) > 460 ? [0.38, 0.7] : [0.62];
      for (const progress of arrowPositions) {
        const arrowPoint = fromPoint.add(routeVector.multiplyBy(progress));
        L.marker(map.layerPointToLatLng(arrowPoint), {
          icon: L.divIcon({
            className: "settlement-migration-direction",
            html: migrationArrowHtml(bearing, documented),
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
          interactive: false,
          keyboard: false,
          opacity: related ? 0.94 : 0.08,
          zIndexOffset: 240,
        }).addTo(routeLayer);
      }
    }
  }, [migrations, ready, selectedPlaceId, summaries, summariesById, year]);

  function resetMapFocus() {
    mapRef.current?.closePopup();
    expandedClusterRef.current?.unspiderfy();
    setSelectedPlaceId(null);
  }

  return (
    <section className="settlement-map-workspace" aria-label="Карта расселения рода">
      <div className="settlement-map-summary section-shell" aria-live="polite">
        <div>
          <span>{selected ? "Выбранное место" : `Данные по ${year} год`}</span>
          <strong>{selected?.place.name ?? `${summaries.length} мест`}</strong>
        </div>
        <dl>
          <div><dt>Семейные группы</dt><dd>{selected?.familyCount ?? totalFamilies}</dd></div>
          <div><dt>Люди</dt><dd>{selected?.peopleCount ?? totalPeople}</dd></div>
          <div><dt>{selected ? "Поколения" : "Записи"}</dt><dd>{selected?.generationCount ?? totalRecords}</dd></div>
          {selected ? <div><dt>Период</dt><dd>{selected.firstYear}—{selected.lastYear}</dd></div> : null}
        </dl>
        {selected ? (
          <button type="button" onClick={resetMapFocus}>← Все места</button>
        ) : null}
      </div>

      <div className="settlement-map-timeline section-shell">
        <label htmlFor="settlement-map-year">
          <span>Исторический срез</span>
          <strong>{year}</strong>
        </label>
        <input
          id="settlement-map-year"
          type="range"
          min={range.minYear}
          max={range.maxYear}
          value={year}
          onInput={(event) => setYear(Number(event.currentTarget.value))}
          onChange={(event) => setYear(Number(event.target.value))}
        />
        <div aria-hidden="true"><span>{range.minYear}</span><span>{range.maxYear}</span></div>
      </div>

      <div className="settlement-map-stage section-shell">
        <div
          className="settlement-map-canvas"
          ref={containerRef}
          role="region"
          aria-label="Интерактивная карта OpenStreetMap с семейными центрами и переселениями"
        />
        {expandedCluster ? (
          <button
            className="settlement-map-collapse"
            type="button"
            onClick={resetMapFocus}
          >
            <span aria-hidden="true">↙</span>
            Свернуть группу
          </button>
        ) : null}
      </div>

      <footer className="settlement-map-legend section-shell">
        <span><i className="is-family" /> размер — семейные группы</span>
        <span><i className="is-generation" /> кольца — документированные поколения</span>
        <span><i className="is-approximate" /> пунктир — приблизительное место</span>
        <span><i className="is-route is-documented" /> сплошная — происхождение прямо указано в записи</span>
        <span><i className="is-route is-derived" /> пунктир — смена места между документами человека</span>
      </footer>
    </section>
  );
}
