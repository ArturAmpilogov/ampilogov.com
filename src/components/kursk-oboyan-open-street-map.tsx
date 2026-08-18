"use client";

import { useEffect, useRef } from "react";

const kursk = {
  name: "Курск",
  detail: "В Курской десятне 1636 года Сергей впервые записан среди новиков",
  latitude: 51.7308,
  longitude: 36.193,
};

const oboyan = {
  name: "Обоянь",
  detail: "В Обоянской десятне 1651 года Сергей назван вместе с сыновьями",
  latitude: 51.212,
  longitude: 36.2786,
};

export function KurskOboyanOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [51.47, 36.235],
        zoom: 9,
        minZoom: 7,
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

      const route = L.polyline(
        [
          [kursk.latitude, kursk.longitude],
          [oboyan.latitude, oboyan.longitude],
        ],
        {
          color: "#a6412f",
          weight: 4,
          opacity: 0.9,
          lineCap: "square",
          className: "kursk-oboyan-route",
        },
      ).addTo(map);

      route.bindTooltip("Две документальные точки: 1636 → 1651", {
        sticky: true,
        className: "amphilochia-leaflet-label kursk-oboyan-route-label",
      });

      const places = [
        { ...kursk, year: "1636", labelDirection: "right" as const },
        { ...oboyan, year: "1651", labelDirection: "right" as const },
      ];

      places.forEach((place) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker kursk-oboyan-leaflet-marker",
          html: '<span class="amphilochia-leaflet-marker__dot kursk-oboyan-leaflet-marker__dot"></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: `${place.name}, ${place.year}`,
        })
          .addTo(map!)
          .bindTooltip(`${place.name} · ${place.year}`, {
            direction: place.labelDirection,
            offset: [12, 0],
            permanent: true,
            className: "amphilochia-leaflet-label kursk-oboyan-leaflet-label",
          })
          .bindPopup(`<strong>${place.name} · ${place.year}</strong><span>${place.detail}</span>`);
      });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context kursk-oboyan-map-context");
        const title = document.createElement("strong");
        const subtitle = document.createElement("span");
        title.textContent = "Путь Сергея";
        subtitle.textContent = "Курск · 1636 → Обоянь · 1651";
        element.append(title, subtitle);
        return element;
      };
      contextControl.addTo(map);

      map.fitBounds(
        L.latLngBounds([
          [kursk.latitude, kursk.longitude],
          [oboyan.latitude, oboyan.longitude],
        ]),
        { padding: [62, 62], maxZoom: 10 },
      );
      window.requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className="amphilochia-map-canvas kursk-oboyan-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная карта документального пути Сергея Анпилогова из Курска в Обоянь между 1636 и 1651 годами"
    />
  );
}
