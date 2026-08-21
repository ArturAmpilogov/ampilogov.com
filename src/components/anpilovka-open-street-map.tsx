"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const anpilovka = {
  name: "Анпиловка",
  detail: "Селение старооскольских Анпиловых рядом с селом Бор",
  latitude: 51.26,
  longitude: 37.879444,
};

export function AnpilovkaOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [anpilovka.latitude, anpilovka.longitude],
        zoom: 12,
        minZoom: 8,
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

      const icon = L.divIcon({
        className: "amphilochia-leaflet-marker anpilogovo-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot anpilogovo-leaflet-marker__dot is-independent"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.circle([anpilovka.latitude, anpilovka.longitude], {
        radius: 1800,
        color: "#b8892e",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#b8892e",
        fillOpacity: 0.05,
        interactive: false,
      }).addTo(map);

      L.marker([anpilovka.latitude, anpilovka.longitude], {
        icon,
        keyboard: true,
        title: anpilovka.name,
      })
        .addTo(map)
        .bindTooltip(anpilovka.name, {
          direction: "top",
          offset: [0, -12],
          permanent: true,
          className: "amphilochia-leaflet-label anpilogovo-leaflet-label is-independent",
        })
        .bindPopup(`<strong>${anpilovka.name}</strong><span>${anpilovka.detail}</span>`);

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context anpilogovo-map-context");
        const region = document.createElement("strong");
        const subject = document.createElement("span");
        region.textContent = "Староосколье";
        subject.textContent = "Анпиловка у села Бор";
        element.append(region, subject);
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
      className="amphilochia-map-canvas anpilogovo-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная OpenStreetMap-карта Анпиловки у села Бор в Старооскольском округе"
    />
  );
}
