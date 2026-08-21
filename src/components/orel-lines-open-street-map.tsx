"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const places = [
  {
    name: "Белая",
    currentName: "ныне Белолунино",
    detail: "Иван Анфилогов; позднее названы его сыновья Илья, Василий и Антон",
    latitude: 52.941863,
    longitude: 35.507563,
    direction: "bottom" as const,
  },
  {
    name: "Баздырево",
    currentName: "ныне Баздрево",
    detail: "Василий Анфилогов; позднее названы его сыновья Алексей и Григорий",
    latitude: 52.98454,
    longitude: 35.439101,
    direction: "top" as const,
  },
];

const orel = {
  name: "Орёл",
  latitude: 52.968543,
  longitude: 36.069247,
};

export function OrelLinesOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [52.96, 35.73],
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

      places.forEach((place) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker orel-estates-leaflet-marker",
          html: '<span class="amphilochia-leaflet-marker__dot orel-estates-leaflet-marker__dot is-matched"></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: `${place.name}, 1625 год`,
        })
          .addTo(map!)
          .bindTooltip(`${place.name} · 1625`, {
            direction: place.direction,
            offset: place.direction === "bottom" ? [0, 12] : [0, -12],
            permanent: true,
            className: "amphilochia-leaflet-label orel-estates-leaflet-label is-matched",
          })
          .bindPopup(
            `<strong>${place.name} · 1625</strong><span>${place.currentName}</span><small>${place.detail}</small>`,
          );
      });

      const orelIcon = L.divIcon({
        className: "amphilochia-leaflet-marker orel-estates-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot orel-estates-leaflet-marker__dot is-context"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([orel.latitude, orel.longitude], {
        icon: orelIcon,
        keyboard: true,
        title: orel.name,
      })
        .addTo(map)
        .bindTooltip(orel.name, {
          direction: "right",
          offset: [10, 0],
          permanent: true,
          className: "amphilochia-leaflet-label orel-estates-leaflet-label is-context",
        });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context orel-estates-map-context");
        const title = document.createElement("strong");
        const subtitle = document.createElement("span");
        title.textContent = "Две земли между поколениями";
        subtitle.textContent = "Белая и Баздырево · 1625";
        element.append(title, subtitle);
        return element;
      };
      contextControl.addTo(map);

      const bounds = L.latLngBounds([
        ...places.map((place) => [place.latitude, place.longitude] as [number, number]),
        [orel.latitude, orel.longitude],
      ]);
      map.fitBounds(bounds, { padding: [54, 54], maxZoom: 11 });
      window.requestAnimationFrame(() => map?.invalidateSize());
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, []);

  return (
    <div
      className="amphilochia-map-canvas orel-estates-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная карта поместий Анфилоговых в Белой и Баздыреве, связывающих записи 1594 и 1625 годов"
    />
  );
}
