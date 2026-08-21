"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const places = [
  {
    name: "Баздырево",
    currentName: "Баздрево",
    detail: "Сохранившееся топонимическое продолжение",
    latitude: 52.98454,
    longitude: 35.439101,
    kind: "matched",
    direction: "left",
  },
  {
    name: "Белая",
    currentName: "Белолунино",
    detail: "На исторической карте: Белая (Белолунино)",
    latitude: 52.941863,
    longitude: 35.507563,
    kind: "matched",
    direction: "bottom",
  },
  {
    name: "Радомлея",
    currentName: "Радомль",
    detail: "Сохранившееся топонимическое продолжение",
    latitude: 53.036655,
    longitude: 35.491152,
    kind: "matched",
    direction: "top",
  },
  {
    name: "Софоново",
    currentName: "Точная современная точка не установлена",
    detail: "Приблизительная область по исторической карте",
    latitude: 53.0203,
    longitude: 35.535,
    kind: "historical",
    direction: "right",
  },
  {
    name: "Малцовская",
    currentName: "Лаврово",
    detail: "На исторической карте: Малцовская (Лаврово)",
    latitude: 52.838365,
    longitude: 36.009488,
    kind: "matched",
    direction: "left",
  },
] as const;

const orel = {
  name: "Орёл",
  latitude: 52.968543,
  longitude: 36.069247,
};

export function OrelEstatesOpenStreetMap() {
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
        if (place.kind === "historical") {
          L.circle([place.latitude, place.longitude], {
            radius: 2400,
            color: "#a6412f",
            weight: 1.5,
            dashArray: "5 6",
            fillColor: "#a6412f",
            fillOpacity: 0.06,
          }).addTo(map!);
        }

        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker orel-estates-leaflet-marker",
          html: `<span class="amphilochia-leaflet-marker__dot orel-estates-leaflet-marker__dot is-${place.kind}"></span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: place.name,
        })
          .addTo(map!)
          .bindTooltip(place.name, {
            direction: place.direction,
            offset: place.direction === "bottom" ? [0, 12] : place.direction === "top" ? [0, -12] : [place.direction === "right" ? 12 : -12, 0],
            permanent: true,
            className: `amphilochia-leaflet-label orel-estates-leaflet-label is-${place.kind}`,
          })
          .bindPopup(
            `<strong>${place.name}</strong><span>${place.currentName}</span><small>${place.detail}</small>`,
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
        const region = document.createElement("strong");
        const subject = document.createElement("span");
        region.textContent = "Орловский уезд · 1594/95";
        subject.textContent = "пять поместий из писцовой книги";
        element.append(region, subject);
        return element;
      };
      contextControl.addTo(map);

      const bounds = L.latLngBounds([
        ...places.map((place) => [place.latitude, place.longitude] as [number, number]),
        [orel.latitude, orel.longitude],
      ]);
      map.fitBounds(bounds, { padding: [46, 46], maxZoom: 11 });
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
      aria-label="Интерактивная карта пяти поместий Анфилоговых в Орловском уезде по писцовой книге 1594–1595 годов"
    />
  );
}
