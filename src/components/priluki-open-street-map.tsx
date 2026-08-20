"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const priluki = {
  name: "Прилуки",
  detail: "Монастырское село, где в 1536/37 году записан Тонкой Онфилогов",
  latitude: 57.3675,
  longitude: 38.0464,
};

const uglich = {
  name: "Углич",
  latitude: 57.5266,
  longitude: 38.3195,
};

export function PrilukiOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [57.445, 38.18],
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

      const prilukiIcon = L.divIcon({
        className: "amphilochia-leaflet-marker priluki-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot priluki-leaflet-marker__dot"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.circle([priluki.latitude, priluki.longitude], {
        radius: 1200,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#a6412f",
        fillOpacity: 0.05,
      }).addTo(map);

      L.marker([priluki.latitude, priluki.longitude], {
        icon: prilukiIcon,
        keyboard: true,
        title: priluki.name,
      })
        .addTo(map)
        .bindTooltip("Прилуки · 1536/37", {
          direction: "left",
          offset: [-12, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label",
        })
        .bindPopup(`<strong>${priluki.name}</strong><span>${priluki.detail}</span>`);

      const uglichIcon = L.divIcon({
        className: "amphilochia-leaflet-marker priluki-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot priluki-leaflet-marker__dot is-context"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([uglich.latitude, uglich.longitude], {
        icon: uglichIcon,
        keyboard: true,
        title: uglich.name,
      })
        .addTo(map)
        .bindTooltip(uglich.name, {
          direction: "right",
          offset: [10, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label is-context",
        });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context priluki-map-context");
        const region = document.createElement("strong");
        const place = document.createElement("span");
        region.textContent = "Прилуки на Волге";
        place.textContent = "Угличский уезд · 1536/37";
        element.append(region, place);
        return element;
      };
      contextControl.addTo(map);

      map.fitBounds(
        L.latLngBounds([
          [priluki.latitude, priluki.longitude],
          [uglich.latitude, uglich.longitude],
        ]),
        { padding: [58, 58], maxZoom: 11 },
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
      className="amphilochia-map-canvas priluki-map-canvas"
      ref={containerRef}
      role="region"
      aria-label="Интерактивная карта села Прилуки на Волге и Углича"
    />
  );
}
