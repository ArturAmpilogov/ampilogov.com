"use client";

import Link from "next/link";
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

type MigrationRecordLink = {
  sourceId: string;
  eventLabel: string;
  date: string;
  placeName: string;
};

function escapeHtml(value: string | null | undefined) {
  return (value ?? "")
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
  const peopleKeys = activeEvents.flatMap((event) => event.people.map((person) => (
    person.personId ? `id:${person.personId}` : `name:${person.name}`
  )));

  return {
    place,
    activeEvents,
    familyCount: new Set(activeEvents.flatMap((event) => event.familyIds)).size,
    peopleCount: new Set(peopleKeys).size,
    generationCount: Math.max(...activeEvents.map((event) => event.generation)),
    recordCount: new Set(activeEvents.map((event) => event.sourceId)).size,
    firstYear: Math.min(...years),
    lastYear: Math.max(...years),
  };
}

function placePopup(summary: PlaceSummary) {
  const records = [...summary.activeEvents].reverse().slice(0, 5);
  const latest = records[0];
  const precision = summary.place.approximate
    ? `<small class="settlement-popup-precision">${escapeHtml(summary.place.precisionLabel)}</small>`
    : "";
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
      ${latest ? `<p class="settlement-popup-context"><b>Имена и смысл:</b> ${latest.people.length} ${escapeHtml(plural(latest.people.length, "человек", "человека", "человек"))} · полный разбор открыт в панели точки</p>` : ""}
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
  const approximate = summary.place.approximate;

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
  const [hoveredMigrationId, setHoveredMigrationId] = useState<string | null>(null);
  const [selectedMigrationId, setSelectedMigrationId] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState(false);

  const summaries = useMemo(() => places
    .map((place) => summarizePlace(place, year))
    .filter((summary): summary is PlaceSummary => Boolean(summary)), [places, year]);
  const summariesById = useMemo(() => new Map(
    summaries.map((summary) => [summary.place.placeId, summary]),
  ), [summaries]);
  const selected = selectedPlaceId ? summariesById.get(selectedPlaceId) ?? null : null;
  const activeMigrations = useMemo(() => migrations.filter((migration) =>
    migration.year <= year && summariesById.has(migration.fromPlaceId) && summariesById.has(migration.toPlaceId)
  ), [migrations, summariesById, year]);
  const displayedMigration = useMemo(() => {
    const migrationId = selectedMigrationId ?? hoveredMigrationId;
    if (!migrationId) return null;
    const migration = activeMigrations.find((candidate) => candidate.migrationId === migrationId);
    if (!migration) return null;

    const eventsBySource = new Map<string, { event: FamilyMapPlace["events"][number]; placeName: string }>();
    for (const summary of summaries) {
      for (const event of summary.activeEvents) {
        const existing = eventsBySource.get(event.sourceId);
        if (!existing || existing.event.eventLabel === "Происхождение, указанное в документе") {
          eventsBySource.set(event.sourceId, { event, placeName: summary.place.name });
        }
      }
    }
    const records: MigrationRecordLink[] = migration.sourceIds.map((sourceId) => {
      const match = eventsBySource.get(sourceId);
      return {
        sourceId,
        eventLabel: match?.event.eventLabel ?? "Архивная запись",
        date: match?.event.date ?? String(migration.year),
        placeName: match?.placeName ?? summariesById.get(migration.toPlaceId)?.place.name ?? "",
      };
    });

    return {
      migration,
      from: summariesById.get(migration.fromPlaceId)!,
      to: summariesById.get(migration.toPlaceId)!,
      records,
    };
  }, [activeMigrations, hoveredMigrationId, selectedMigrationId, summaries, summariesById]);
  const totalFamilies = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.familyIds)),
  ).size, [summaries]);
  const totalPeople = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.people.map((person) => (
      person.personId ? `id:${person.personId}` : `name:${person.name}`
    )))),
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

      map.on("click", () => {
        setSelectedPlaceId(null);
        setSelectedMigrationId(null);
      });
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

    for (const migration of activeMigrations) {
      const from = summariesById.get(migration.fromPlaceId)!;
      const to = summariesById.get(migration.toPlaceId)!;
      const related = !selectedPlaceId || migration.fromPlaceId === selectedPlaceId || migration.toPlaceId === selectedPlaceId;
      const documented = migration.migrationId.startsWith("documented:");
      const routeSelected = migration.migrationId === selectedMigrationId;
      const fromLatLng = L.latLng(from.place.geo.latitude, from.place.geo.longitude);
      const toLatLng = L.latLng(to.place.geo.latitude, to.place.geo.longitude);
      const baseWeight = (documented ? 2.5 : 1.5) + Math.min(4, migration.personIds.length);
      const baseOpacity = related ? .68 : .08;
      const route = L.polyline([fromLatLng, toLatLng], {
        className: `settlement-migration-route${documented ? " is-documented" : " is-derived"}${related ? " is-related" : " is-muted"}${routeSelected ? " is-selected" : ""}`,
        color: "#a6412f",
        weight: baseWeight + (routeSelected ? 2 : 0),
        opacity: routeSelected ? .96 : baseOpacity,
        dashArray: documented ? undefined : "5 8",
        interactive: false,
      }).addTo(routeLayer);
      const routeHit = L.polyline([fromLatLng, toLatLng], {
        className: "settlement-migration-hit",
        color: "#a6412f",
        weight: 20,
        opacity: 0,
        interactive: related,
        bubblingMouseEvents: false,
      }).addTo(routeLayer);
      routeHit.bindTooltip(
        `${from.place.name} → ${to.place.name} · ${migration.sourceIds.length} ${plural(migration.sourceIds.length, "запись", "записи", "записей")}`,
        { sticky: true, className: "settlement-map-tooltip settlement-migration-tooltip" },
      );
      routeHit.on("mouseover", () => {
        setHoveredMigrationId(migration.migrationId);
        route.setStyle({ weight: baseWeight + 2, opacity: .96 });
        route.bringToFront();
      });
      routeHit.on("mouseout", () => {
        setHoveredMigrationId((current) => current === migration.migrationId ? null : current);
        route.setStyle({
          weight: baseWeight + (routeSelected ? 2 : 0),
          opacity: routeSelected ? .96 : baseOpacity,
        });
      });
      routeHit.on("click", (event) => {
        L.DomEvent.stopPropagation(event.originalEvent);
        map.closePopup();
        setSelectedPlaceId(null);
        setSelectedMigrationId(migration.migrationId);
      });

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
  }, [activeMigrations, ready, selectedMigrationId, selectedPlaceId, summariesById]);

  function resetMapFocus() {
    mapRef.current?.closePopup();
    expandedClusterRef.current?.unspiderfy();
    setSelectedPlaceId(null);
    setSelectedMigrationId(null);
    setHoveredMigrationId(null);
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
        {displayedMigration ? (
          <aside
            className={`settlement-migration-panel${selectedMigrationId ? " is-pinned" : ""}`}
            aria-live="polite"
            aria-label="Записи направления переезда"
          >
            <div className="settlement-migration-panel__heading">
              <div>
                <span>{selectedMigrationId ? "Выбранное направление" : "Направление переезда"}</span>
                <strong>{displayedMigration.from.place.name} <i aria-hidden="true">→</i> {displayedMigration.to.place.name}</strong>
              </div>
              {selectedMigrationId ? (
                <button type="button" onClick={() => setSelectedMigrationId(null)} aria-label="Закрыть направление">×</button>
              ) : null}
            </div>
            {displayedMigration.migration.personNames.length ? (
              <p>{displayedMigration.migration.personNames.join(", ")}</p>
            ) : null}
            <small>{displayedMigration.migration.basis}</small>
            <nav aria-label="Записи, связанные с направлением">
              {displayedMigration.records.map((record) => (
                <Link
                  key={record.sourceId}
                  href={`/records/${encodeURIComponent(record.sourceId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <strong>{record.eventLabel}</strong>
                    <small>{record.placeName}</small>
                  </span>
                  <span>{record.date}<i aria-hidden="true">↗</i></span>
                </Link>
              ))}
            </nav>
            {!selectedMigrationId ? <em>Нажмите на линию, чтобы закрепить список</em> : null}
          </aside>
        ) : null}
        {selected ? (
          <aside
            className="settlement-place-panel"
            aria-live="polite"
            aria-label={`Имена и смысл: ${selected.place.name}`}
          >
            <header className="settlement-place-panel__heading">
              <div>
                <span>Имена и смысл</span>
                <strong>{selected.place.name}</strong>
                <small>{selected.firstYear}—{selected.lastYear} · {selected.recordCount} {plural(selected.recordCount, "запись", "записи", "записей")}</small>
              </div>
              <button type="button" onClick={resetMapFocus} aria-label="Закрыть сведения о месте">×</button>
            </header>
            <div className="settlement-place-panel__events">
              {[...selected.activeEvents].reverse().map((event) => (
                <article key={event.sourceId}>
                  <header>
                    <span>{event.date}</span>
                    <h3>{event.eventLabel}</h3>
                  </header>
                  {event.people.length ? (
                    <section>
                      <h4>Все названные и восстановленные люди · {event.people.length}</h4>
                      <ul className="settlement-place-panel__people">
                        {event.people.map((person, index) => (
                          <li key={`${person.name}:${index}`}>
                            <strong>{person.name}</strong>
                            <span>{person.role}</span>
                            {person.variants.length ? <small>В источниках: {person.variants.join(" · ")}</small> : null}
                            {person.details.map((detail, detailIndex) => <p key={`${detail}:${detailIndex}`}>{detail}</p>)}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                  {event.meaning ? (
                    <section>
                      <h4>Что это значит</h4>
                      <p className="settlement-place-panel__meaning">{event.meaning}</p>
                    </section>
                  ) : null}
                  {event.nameInsights.length ? (
                    <details open={event.nameInsights.length <= 8}>
                      <summary>Полный разбор имени и доказательств · {event.nameInsights.length} пунктов</summary>
                      <dl>
                        {event.nameInsights.map((insight, index) => (
                          <div key={`${insight.label}:${index}`}>
                            <dt>{insight.label}</dt>
                            <dd>{insight.text}</dd>
                          </div>
                        ))}
                      </dl>
                    </details>
                  ) : null}
                  <Link href={`/records/${encodeURIComponent(event.sourceId)}`} target="_blank" rel="noopener noreferrer">
                    Открыть запись целиком <span aria-hidden="true">↗</span>
                  </Link>
                </article>
              ))}
            </div>
          </aside>
        ) : null}
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
