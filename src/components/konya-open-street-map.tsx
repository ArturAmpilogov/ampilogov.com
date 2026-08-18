"use client";

import { useEffect, useRef } from "react";

const konya = {
  name: "Икония / Кония",
  detail: "Древний и современный город на одном месте",
  latitude: 37.87464,
  longitude: 32.49316,
};

export function KonyaOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        center: [38.25, 32.5],
        zoom: 6,
        minZoom: 5,
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

      const icon = L.divIcon({
        className: "amphilochia-leaflet-marker konya-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot konya-leaflet-marker__dot"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.circle([konya.latitude, konya.longitude], {
        radius: 18000,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#a6412f",
        fillOpacity: 0.05,
      }).addTo(map);

      L.marker([konya.latitude, konya.longitude], {
        icon,
        keyboard: true,
        title: konya.name,
      })
        .addTo(map)
        .bindTooltip(konya.name, {
          direction: "top",
          offset: [0, -12],
          permanent: true,
          className: "amphilochia-leaflet-label konya-leaflet-label",
        })
        .bindPopup(`<strong>${konya.name}</strong><span>${konya.detail}</span>`);

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context konya-map-context");
        const region = document.createElement("strong");
        const place = document.createElement("span");
        region.textContent = "Центральная Анатолия";
        place.textContent = "Икония → Кония";
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
      className="amphilochia-map-canvas konya-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная карта Центральной Анатолии: древняя Икония и современная Кония на одном месте"
    />
  );
}
