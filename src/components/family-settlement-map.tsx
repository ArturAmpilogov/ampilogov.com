"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FamilyMapClientDirectory,
  FamilyMapIndexPlace,
  FamilyMapMigration,
  FamilyMapPlaceDetails,
} from "@/lib/genealogy";
import { readVersionedMapJson } from "@/lib/browser-json-cache";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";
import { YearRangeFilter } from "@/components/year-range-filter";

type FamilySettlementMapProps = {
  range: { minYear: number; maxYear: number };
  dataVersion: string;
  directoryPath: string;
};

const EMPTY_PLACES: FamilyMapIndexPlace[] = [];
const EMPTY_MIGRATIONS: FamilyMapMigration[] = [];

type PlaceSummary = {
  place: FamilyMapIndexPlace;
  familyCount: number;
  peopleCount: number;
  generationCount: number;
  recordCount: number;
  firstYear: number;
  lastYear: number;
  activeEvents: FamilyMapIndexPlace["events"];
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

function summarizePlace(place: FamilyMapIndexPlace, startYear: number, endYear: number): PlaceSummary | null {
  const activeEvents = place.events.filter((event) => event.year >= startYear && event.year <= endYear);
  if (!activeEvents.length) return null;
  const years = activeEvents.map((event) => event.year);
  const peopleKeys = activeEvents.flatMap((event) => event.personKeys);

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

function boundedYear(value: string | null, fallback: number, minYear: number, maxYear: number) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(maxYear, Math.max(minYear, parsed)) : fallback;
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

function conciseMapText(value: unknown, maxLength = 210) {
  if (typeof value !== "string") return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  let summary = sentences[0]?.trim() ?? normalized;
  if (summary.length < 90 && sentences[1]) summary = `${summary} ${sentences[1].trim()}`;
  if (summary.length <= maxLength) return summary;

  const clipped = summary.slice(0, maxLength + 1);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > maxLength * 0.72 ? lastSpace : maxLength).trim()}…`;
}

export function FamilySettlementMap({ range, dataVersion, directoryPath }: FamilySettlementMapProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlState = searchParams.toString();
  const [directorySnapshot, setDirectorySnapshot] = useState<{
    version: string;
    directory: FamilyMapClientDirectory;
  } | null>(null);
  const [directoryErrorVersion, setDirectoryErrorVersion] = useState<string | null>(null);
  const [directoryRetry, setDirectoryRetry] = useState(0);
  const directory = directorySnapshot?.version === dataVersion ? directorySnapshot.directory : null;
  const places = directory?.places ?? EMPTY_PLACES;
  const migrations = directory?.migrations ?? EMPTY_MIGRATIONS;
  const directoryState = directory ? "ready" : directoryErrorVersion === dataVersion ? "error" : "loading";
  const placeIds = useMemo(() => new Set(places.map((place) => place.placeId)), [places]);
  const migrationIds = useMemo(() => new Set(migrations.map((migration) => migration.migrationId)), [migrations]);
  const stateFromUrl = useMemo(() => {
    const params = new URLSearchParams(urlState);
    const requestedStart = boundedYear(params.get("from"), range.minYear, range.minYear, range.maxYear);
    const requestedEnd = boundedYear(params.get("to"), range.maxYear, range.minYear, range.maxYear);
    const requestedPlaceId = params.get("place");
    const migrationId = params.get("route");
    const placeId = requestedPlaceId && placeIds.has(requestedPlaceId) ? requestedPlaceId : null;
    return {
      yearRange: {
        startYear: Math.min(requestedStart, requestedEnd),
        endYear: Math.max(requestedStart, requestedEnd),
      },
      placeId,
      migrationId: !placeId && migrationId && migrationIds.has(migrationId) ? migrationId : null,
    };
  }, [migrationIds, placeIds, range.maxYear, range.minYear, urlState]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const clusterRef = useRef<import("leaflet").MarkerClusterGroup | null>(null);
  const expandedClusterRef = useRef<import("leaflet").MarkerCluster | null>(null);
  const markersByPlaceRef = useRef(new Map<string, CountedMarker>());
  const routeLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const routeRendererRef = useRef<import("leaflet").SVG | null>(null);
  const hasFittedInitialBoundsRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [yearRange, setYearRange] = useState(stateFromUrl.yearRange);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(stateFromUrl.placeId);
  const [hoveredMigrationId, setHoveredMigrationId] = useState<string | null>(null);
  const [selectedMigrationId, setSelectedMigrationId] = useState<string | null>(stateFromUrl.migrationId);
  const [expandedCluster, setExpandedCluster] = useState(false);
  const [placeDetailsById, setPlaceDetailsById] = useState(() => new Map<string, FamilyMapPlaceDetails>());
  const [placeDetailsErrorKey, setPlaceDetailsErrorKey] = useState<string | null>(null);
  const locallyWrittenUrlRef = useRef<string | null>(null);
  const shouldFocusSelectionRef = useRef(Boolean(stateFromUrl.placeId || stateFromUrl.migrationId));
  const currentSelectionRef = useRef({ placeId: selectedPlaceId, migrationId: selectedMigrationId });

  useEffect(() => {
    if (directory) return;
    const controller = new AbortController();

    void readVersionedMapJson<FamilyMapClientDirectory>(
      directoryPath,
      dataVersion,
      controller.signal,
    ).then((nextDirectory) => {
      setDirectorySnapshot({ version: dataVersion, directory: nextDirectory });
      setDirectoryErrorVersion((current) => current === dataVersion ? null : current);
    }).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      console.error(error);
      setDirectoryErrorVersion(dataVersion);
    });

    return () => controller.abort();
  }, [dataVersion, directory, directoryPath, directoryRetry]);

  useEffect(() => {
    currentSelectionRef.current = { placeId: selectedPlaceId, migrationId: selectedMigrationId };
  }, [selectedMigrationId, selectedPlaceId]);

  const summaries = useMemo(() => places
    .map((place) => summarizePlace(place, yearRange.startYear, yearRange.endYear))
    .filter((summary): summary is PlaceSummary => Boolean(summary)), [places, yearRange]);
  const summariesById = useMemo(() => new Map(
    summaries.map((summary) => [summary.place.placeId, summary]),
  ), [summaries]);
  const selected = selectedPlaceId ? summariesById.get(selectedPlaceId) ?? null : null;
  const selectedPeopleCount = selected?.peopleCount ?? 0;
  const selectedPlaceDetailsKey = selectedPlaceId ? `${dataVersion}:${selectedPlaceId}` : null;
  const selectedPlaceDetails = selectedPlaceDetailsKey ? placeDetailsById.get(selectedPlaceDetailsKey) ?? null : null;
  const placeDetailsState = !selectedPlaceId || selectedPlaceDetails
    ? "idle"
    : placeDetailsErrorKey === selectedPlaceDetailsKey ? "error" : "loading";
  const selectedDetailEvents = useMemo(() => (
    selectedPlaceDetails?.placeId === selectedPlaceId
      ? selectedPlaceDetails.events.filter((event) => (
        event.year >= yearRange.startYear && event.year <= yearRange.endYear
      ))
      : []
  ), [selectedPlaceDetails, selectedPlaceId, yearRange.endYear, yearRange.startYear]);
  const activeMigrations = useMemo(() => migrations.filter((migration) =>
    migration.year >= yearRange.startYear && migration.year <= yearRange.endYear &&
    summariesById.has(migration.fromPlaceId) && summariesById.has(migration.toPlaceId)
  ), [migrations, summariesById, yearRange]);
  const displayedMigration = useMemo(() => {
    if (selectedPlaceId) return null;
    const migrationId = selectedMigrationId ?? hoveredMigrationId;
    if (!migrationId) return null;
    const migration = activeMigrations.find((candidate) => candidate.migrationId === migrationId);
    if (!migration) return null;

    const eventsBySource = new Map<string, { event: FamilyMapIndexPlace["events"][number]; placeName: string }>();
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
  }, [activeMigrations, hoveredMigrationId, selectedMigrationId, selectedPlaceId, summaries, summariesById]);
  const totalFamilies = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.familyIds)),
  ).size, [summaries]);
  const totalPeople = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.flatMap((event) => event.personKeys)),
  ).size, [summaries]);
  const totalRecords = useMemo(() => new Set(
    summaries.flatMap((summary) => summary.activeEvents.map((event) => event.sourceId)),
  ).size, [summaries]);

  useEffect(() => {
    if (!selectedPlaceId || !selectedPlaceDetailsKey || selectedPlaceDetails) return;

    const controller = new AbortController();
    void readVersionedMapJson<FamilyMapPlaceDetails>(
      `/generated/map/places/${encodeURIComponent(selectedPlaceId)}.${dataVersion}.json`,
      dataVersion,
      controller.signal,
    )
      .then((details) => {
        setPlaceDetailsById((current) => {
          const next = new Map(current);
          next.set(selectedPlaceDetailsKey, details);
          return next;
        });
        setPlaceDetailsErrorKey((current) => current === selectedPlaceDetailsKey ? null : current);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setPlaceDetailsErrorKey(selectedPlaceDetailsKey);
      });

    return () => controller.abort();
  }, [dataVersion, selectedPlaceDetails, selectedPlaceDetailsKey, selectedPlaceId]);

  useEffect(() => {
    if (locallyWrittenUrlRef.current === urlState) {
      locallyWrittenUrlRef.current = null;
      return;
    }

    const currentSelection = currentSelectionRef.current;
    if (
      currentSelection.placeId !== stateFromUrl.placeId ||
      currentSelection.migrationId !== stateFromUrl.migrationId
    ) {
      shouldFocusSelectionRef.current = true;
    }

    const timeout = window.setTimeout(() => {
      setYearRange((current) =>
        current.startYear === stateFromUrl.yearRange.startYear && current.endYear === stateFromUrl.yearRange.endYear
          ? current
          : stateFromUrl.yearRange
      );
      setSelectedPlaceId((current) => current === stateFromUrl.placeId ? current : stateFromUrl.placeId);
      setSelectedMigrationId((current) => current === stateFromUrl.migrationId ? current : stateFromUrl.migrationId);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [stateFromUrl, urlState]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(urlState);

      if (yearRange.startYear !== range.minYear) params.set("from", String(yearRange.startYear));
      else params.delete("from");
      if (yearRange.endYear !== range.maxYear) params.set("to", String(yearRange.endYear));
      else params.delete("to");

      if (selectedPlaceId) {
        params.set("place", selectedPlaceId);
        params.delete("route");
      } else if (selectedMigrationId) {
        params.set("route", selectedMigrationId);
        params.delete("place");
      } else {
        params.delete("place");
        params.delete("route");
      }

      const nextState = params.toString();
      if (nextState !== urlState) {
        locallyWrittenUrlRef.current = nextState;
        window.history.replaceState(
          window.history.state,
          "",
          nextState ? `${pathname}?${nextState}` : pathname,
        );
      }
    }, 180);

    return () => window.clearTimeout(timeout);
  }, [pathname, range.maxYear, range.minYear, selectedMigrationId, selectedPlaceId, urlState, yearRange]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (selectedPlaceId && !summariesById.has(selectedPlaceId)) setSelectedPlaceId(null);
      if (selectedMigrationId && !activeMigrations.some((migration) => migration.migrationId === selectedMigrationId)) {
        setSelectedMigrationId(null);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [activeMigrations, selectedMigrationId, selectedPlaceId, summariesById]);

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
        removeOutsideVisibleBounds: false,
        animate: false,
        animateAddingMarkers: false,
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
      routeRendererRef.current = L.svg({ padding: 1 });
      routeLayerRef.current = L.layerGroup().addTo(map);
      clusterRef.current.addTo(map);

      map.on("click", () => {
        shouldFocusSelectionRef.current = false;
        setSelectedPlaceId(null);
        setSelectedMigrationId(null);
      });
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
      routeRendererRef.current = null;
      hasFittedInitialBoundsRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!ready || !map || !L || !places.length || hasFittedInitialBoundsRef.current) return;

    hasFittedInitialBoundsRef.current = true;
    map.fitBounds(
      L.latLngBounds(places.map((place) => [place.geo.latitude, place.geo.longitude])),
      { padding: [52, 52], maxZoom: 5 },
    );
  }, [places, ready]);

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
      marker.on("click", () => {
        shouldFocusSelectionRef.current = false;
        setHoveredMigrationId(null);
        setSelectedMigrationId(null);
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
    const map = mapRef.current;
    const clusters = clusterRef.current;
    if (!shouldFocusSelectionRef.current || !ready || !map || !clusters || !selectedPlaceId) return;
    const marker = markersByPlaceRef.current.get(selectedPlaceId);
    if (!marker) return;
    shouldFocusSelectionRef.current = false;
    clusters.zoomToShowLayer(marker, () => {
      map.panTo(marker.getLatLng(), { animate: true, duration: 0.35 });
    });
  }, [ready, selectedPlaceId, summaries]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!shouldFocusSelectionRef.current || !ready || !map || !L || !selectedMigrationId) return;
    const migration = activeMigrations.find((candidate) => candidate.migrationId === selectedMigrationId);
    if (!migration) return;
    const from = summariesById.get(migration.fromPlaceId);
    const to = summariesById.get(migration.toPlaceId);
    if (!from || !to) return;
    shouldFocusSelectionRef.current = false;
    map.fitBounds([
      [from.place.geo.latitude, from.place.geo.longitude],
      [to.place.geo.latitude, to.place.geo.longitude],
    ], { padding: [84, 84], maxZoom: 7, animate: true, duration: 0.45 });
  }, [activeMigrations, ready, selectedMigrationId, summariesById]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const routeLayer = routeLayerRef.current;
    const routeRenderer = routeRendererRef.current;
    if (!ready || !L || !map || !routeLayer || !routeRenderer) return;

    routeLayer.clearLayers();

    for (const migration of activeMigrations) {
      const from = summariesById.get(migration.fromPlaceId)!;
      const to = summariesById.get(migration.toPlaceId)!;
      const related = !selectedPlaceId || migration.fromPlaceId === selectedPlaceId || migration.toPlaceId === selectedPlaceId;
      const documented = migration.migrationId.startsWith("documented:");
      const routeSelected = migration.migrationId === selectedMigrationId;
      const fromLatLng = L.latLng(from.place.geo.latitude, from.place.geo.longitude);
      const toLatLng = L.latLng(to.place.geo.latitude, to.place.geo.longitude);
      const baseWeight = (documented ? 1.35 : .9) + Math.min(1.1, Math.sqrt(migration.personIds.length) * .22);
      const baseOpacity = related ? .28 : .05;
      const route = L.polyline([fromLatLng, toLatLng], {
        className: `settlement-migration-route${documented ? " is-documented" : " is-derived"}${related ? " is-related" : " is-muted"}${routeSelected ? " is-selected" : ""}`,
        color: "#a6412f",
        weight: baseWeight + (routeSelected ? 2.6 : 0),
        opacity: routeSelected ? .96 : baseOpacity,
        dashArray: documented ? undefined : "5 8",
        interactive: false,
        renderer: routeRenderer,
      }).addTo(routeLayer);
      const routeHit = L.polyline([fromLatLng, toLatLng], {
        className: "settlement-migration-hit",
        color: "#a6412f",
        weight: 20,
        opacity: 0,
        interactive: related,
        bubblingMouseEvents: false,
        renderer: routeRenderer,
      }).addTo(routeLayer);
      routeHit.bindTooltip(
        `${from.place.name} → ${to.place.name} · ${migration.sourceIds.length} ${plural(migration.sourceIds.length, "запись", "записи", "записей")}`,
        { sticky: true, className: "settlement-map-tooltip settlement-migration-tooltip" },
      );
      routeHit.on("mouseover", () => {
        setHoveredMigrationId(migration.migrationId);
        route.setStyle({ weight: baseWeight + 2.4, opacity: .96 });
        route.bringToFront();
      });
      routeHit.on("mouseout", () => {
        setHoveredMigrationId((current) => current === migration.migrationId ? null : current);
        route.setStyle({
          weight: baseWeight + (routeSelected ? 2.6 : 0),
          opacity: routeSelected ? .96 : baseOpacity,
        });
      });
      routeHit.on("click", (event) => {
        L.DomEvent.stopPropagation(event.originalEvent);
        map.closePopup();
        shouldFocusSelectionRef.current = false;
        setSelectedPlaceId(null);
        setSelectedMigrationId(migration.migrationId);
      });

      const fromPoint = map.latLngToLayerPoint(fromLatLng);
      const toPoint = map.latLngToLayerPoint(toLatLng);
      const routeVector = toPoint.subtract(fromPoint);
      const bearing = Math.atan2(routeVector.y, routeVector.x) * 180 / Math.PI;
      const arrowPositions = [0.58];
      for (const progress of arrowPositions) {
        const arrowPoint = fromPoint.add(routeVector.multiplyBy(progress));
        L.marker(map.layerPointToLatLng(arrowPoint), {
          icon: L.divIcon({
            className: "settlement-migration-direction",
            html: migrationArrowHtml(bearing, documented),
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          }),
          interactive: false,
          keyboard: false,
          opacity: routeSelected ? 0.94 : related ? 0.46 : 0.05,
          zIndexOffset: 240,
        }).addTo(routeLayer);
      }
    }
  }, [activeMigrations, ready, selectedMigrationId, selectedPlaceId, summariesById]);

  function resetMapFocus() {
    mapRef.current?.closePopup();
    expandedClusterRef.current?.unspiderfy();
    shouldFocusSelectionRef.current = false;
    setSelectedPlaceId(null);
    setSelectedMigrationId(null);
    setHoveredMigrationId(null);
  }

  return (
    <section className="settlement-map-workspace" aria-label="Карта расселения рода">
      <div className="settlement-map-controls section-shell">
        <div className="settlement-map-summary" aria-live="polite">
          <div>
            <span>{selected ? "Выбранное место" : "На карте"}</span>
            <strong>{selected?.place.name ?? (
              directoryState === "loading" ? "Загрузка…" : directoryState === "error" ? "Данные недоступны" : `${summaries.length} мест`
            )}</strong>
            {directoryState === "ready" ? (
              <small>
                {selected?.familyCount ?? totalFamilies} {plural(selected?.familyCount ?? totalFamilies, "семья", "семьи", "семей")}
                <i aria-hidden="true"> · </i>
                {selected?.peopleCount ?? totalPeople} {plural(selected?.peopleCount ?? totalPeople, "человек", "человека", "человек")}
                <i aria-hidden="true"> · </i>
                {selected?.recordCount ?? totalRecords} {plural(selected?.recordCount ?? totalRecords, "запись", "записи", "записей")}
              </small>
            ) : null}
          </div>
          {selected ? (
            <button type="button" onClick={resetMapFocus}>← Все места</button>
          ) : directoryState === "error" ? (
            <button
              type="button"
              onClick={() => {
                setDirectoryErrorVersion(null);
                setDirectoryRetry((current) => current + 1);
              }}
            >Повторить</button>
          ) : null}
        </div>

        <div className="settlement-map-timeline">
          <YearRangeFilter
            label="Период"
            minYear={range.minYear}
            maxYear={range.maxYear}
            startYear={yearRange.startYear}
            endYear={yearRange.endYear}
            onChange={setYearRange}
          />
        </div>
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
            <ul className="settlement-migration-panel__people">
              {(displayedMigration.migration.personNames.length
                ? displayedMigration.migration.personNames
                : ["Семья Ампилоговых"]
              ).map((name, index) => {
                const personId = displayedMigration.migration.personIds[index];
                return (
                  <li key={`${personId ?? name}:${index}`}>
                    {personId ? (
                      <Link
                        href={`/people/${encodeURIComponent(personId)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {name}
                      </Link>
                    ) : <strong>{name}</strong>}
                    <span>{displayedMigration.migration.year} · {displayedMigration.from.place.name} → {displayedMigration.to.place.name}</span>
                  </li>
                );
              })}
            </ul>
            <p className="settlement-migration-panel__basis">{conciseMapText(displayedMigration.migration.basis, 180)}</p>
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
            aria-label={`Люди и события: ${selected.place.name}`}
          >
            <header className="settlement-place-panel__heading">
              <div>
                <span>Место на карте</span>
                <strong>{selected.place.name}</strong>
                <div className="settlement-place-panel__meta">
                  <small>{selected.firstYear}—{selected.lastYear}</small>
                  <small>{selected.recordCount} {plural(selected.recordCount, "событие", "события", "событий")}</small>
                  <small>{selectedPeopleCount} {plural(selectedPeopleCount, "человек", "человека", "человек")}</small>
                  {selected.place.approximate ? <small>{selected.place.precisionLabel}</small> : null}
                </div>
              </div>
              <button type="button" onClick={resetMapFocus} aria-label="Закрыть сведения о месте">×</button>
            </header>
            <div
              className="settlement-place-panel__events"
              tabIndex={0}
              aria-label={`Список людей и событий: ${selected.place.name}`}
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                const amount = event.currentTarget.clientHeight * 0.82;
                const positions: Partial<Record<typeof event.key, number>> = {
                  ArrowDown: 48,
                  ArrowUp: -48,
                  PageDown: amount,
                  PageUp: -amount,
                  Home: -event.currentTarget.scrollHeight,
                  End: event.currentTarget.scrollHeight,
                };
                const top = positions[event.key];
                if (top === undefined) return;
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.scrollBy({ top, behavior: "smooth" });
              }}
            >
              {placeDetailsState === "loading" ? (
                <p className="settlement-place-panel__loading" role="status">Загрузка карточек…</p>
              ) : null}
              {placeDetailsState === "error" ? (
                <p className="settlement-place-panel__loading is-error" role="alert">Не удалось загрузить карточки места.</p>
              ) : null}
              {[...selectedDetailEvents].reverse().map((event) => (
                <article className="settlement-place-panel__event" key={event.sourceId}>
                  <header className="settlement-place-panel__event-heading">
                    <time>{event.date}</time>
                    <Link
                      href={`/records/${encodeURIComponent(event.sourceId)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${event.eventLabel}, ${event.date} — открыть запись в новой вкладке`}
                    >
                      Открыть запись <i aria-hidden="true">↗</i>
                    </Link>
                  </header>
                  {event.people.length ? (
                    <ul className="settlement-place-panel__people">
                      {event.people.map((person, index) => (
                        <li key={`${person.personId ?? person.name}:${index}`}>
                          <div className="settlement-place-panel__person-body">
                            {person.personId ? (
                              <Link
                                className="settlement-place-panel__person-link"
                                href={`/people/${encodeURIComponent(person.personId)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${person.name} — открыть карточку человека в новой вкладке`}
                              >
                                <span>{person.name}</span><i aria-hidden="true">↗</i>
                              </Link>
                            ) : <strong>{person.name}</strong>}
                            <span>{person.role}{person.lifeSpan ? ` · ${person.lifeSpan}` : ""}</span>
                            {typeof person.details[0] === "string" && person.details[0].trim()
                              ? <p>{conciseMapText(person.details[0], 125)}</p>
                              : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
              {selected.place.geo.note ? (
                <footer className="settlement-place-panel__geo-note">
                  <div>
                    <span>Положение точки</span>
                    <p>{conciseMapText(selected.place.geo.note, 150)}</p>
                  </div>
                  <a href={selected.place.geo.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Источник <i aria-hidden="true">↗</i>
                  </a>
                </footer>
              ) : null}
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
