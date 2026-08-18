"use client";

import { useEffect, useRef } from "react";

const places = [
  {
    name: "1-е Анпилогово",
    detail: "Южная часть прежней единой деревни Анпилогово",
    latitude: 51.778333,
    longitude: 36.006667,
    kind: "shared",
    direction: "bottom",
  },
  {
    name: "2-е Анпилогово",
    detail: "Северная часть прежней единой деревни Анпилогово",
    latitude: 51.791667,
    longitude: 36.01,
    kind: "shared",
    direction: "right",
  },
] as const;

export function AnpilogovoOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [51.785, 36.008],
        zoom: 12,
        minZoom: 8,
        maxZoom: 17,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      map.attributionControl.setPrefix(
        '<a href="https://leafletjs.com/" target="_blank" rel="noreferrer" title="Открыть сайт Leaflet в новой вкладке">Leaflet</a>',
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      const historicVillage = L.latLngBounds([
        [places[0].latitude, places[0].longitude],
        [places[1].latitude, places[1].longitude],
      ]);

      L.circle(historicVillage.getCenter(), {
        radius: 2300,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#a6412f",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(map);

      places.forEach((place) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker anpilogovo-leaflet-marker",
          html: `<span class="amphilochia-leaflet-marker__dot anpilogovo-leaflet-marker__dot is-${place.kind}"></span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const horizontalOffset = place.direction === "right" ? 14 : -14;
        const tooltipOffset: [number, number] = place.direction === "bottom"
          ? [0, 13]
          : [horizontalOffset, -9];

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: place.name,
        })
          .addTo(map!)
          .bindTooltip(place.name, {
            direction: place.direction,
            offset: tooltipOffset,
            permanent: true,
            className: `amphilochia-leaflet-label anpilogovo-leaflet-label is-${place.kind}`,
          })
          .bindPopup(
            `<strong>${place.name}</strong><span>${place.detail}</span>`,
          );
      });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context anpilogovo-map-context");
        const region = document.createElement("strong");
        const subject = document.createElement("span");
        region.textContent = "Курский район";
        subject.textContent = "одно историческое Анпилогово";
        element.append(region, subject);
        return element;
      };
      contextControl.addTo(map);

      const bounds = L.latLngBounds(
        places.map((place) => [place.latitude, place.longitude] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [72, 72], maxZoom: 13 });
      window.requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className="amphilochia-map-canvas anpilogovo-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная OpenStreetMap-карта деревень 1-е Анпилогово и 2-е Анпилогово"
    />
  );
}
