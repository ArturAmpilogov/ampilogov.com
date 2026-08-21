"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const points = [
  {
    name: "Амфилохия",
    detail: "Современный город · название с 21 ноября 1908 года",
    latitude: 38.86342,
    longitude: 21.16667,
    kind: "modern",
  },
  {
    name: "Аргос Амфилохийский",
    detail: "Ориентировочная локализация древнего города",
    latitude: 38.935912,
    longitude: 21.180267,
    kind: "ancient",
  },
] as const;

export function AmphilochiaOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [38.97, 21.06],
        zoom: 10,
        minZoom: 7,
        maxZoom: 17,
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

      points.forEach((point) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker",
          html: `<span class="amphilochia-leaflet-marker__dot is-${point.kind}"></span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        if (point.kind === "ancient") {
          L.circle([point.latitude, point.longitude], {
            radius: 1700,
            color: "#a6412f",
            weight: 1.5,
            dashArray: "5 6",
            fillColor: "#a6412f",
            fillOpacity: 0.05,
          }).addTo(map!);
        }

        L.marker([point.latitude, point.longitude], {
          icon,
          keyboard: true,
          title: point.name,
        })
          .addTo(map!)
          .bindTooltip(point.name, {
            direction: point.kind === "ancient" ? "top" : "bottom",
            offset: point.kind === "ancient" ? [0, -12] : [0, 12],
            permanent: true,
            className: `amphilochia-leaflet-label is-${point.kind}`,
          })
          .bindPopup(`<strong>${point.name}</strong><span>${point.detail}</span>`);
      });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context");
        const region = document.createElement("strong");
        const place = document.createElement("span");
        region.textContent = "Западная Греция";
        place.textContent = "Амбракийский залив";
        element.append(region, place);
        return element;
      };
      contextControl.addTo(map);

      window.requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className="amphilochia-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная карта Западной Греции: Амфилохия и ориентировочная локализация Аргоса Амфилохийского"
    />
  );
}
