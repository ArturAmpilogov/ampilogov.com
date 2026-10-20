"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  modernName: "Амфилохия",
  modernDetail: "Современный город · название с 21 ноября 1908 года",
  ancientName: "Аргос Амфилохийский",
  ancientDetail: "Ориентировочная локализация древнего города",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Западная Греция",
  place: "Амбракийский залив",
  label: "Интерактивная карта Западной Греции: Амфилохия и ориентировочная локализация Аргоса Амфилохийского",
}, {
  en: {
    modernName: "Amfilochia",
    modernDetail: "Modern town · name since 21 November 1908",
    ancientName: "Amphilochian Argos",
    ancientDetail: "Approximate location of the ancient city",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Western Greece",
    place: "Ambracian Gulf",
    label: "Interactive map of Western Greece: Amfilochia and the approximate location of Amphilochian Argos",
  },
  uk: {
    modernName: "Амфілохія",
    modernDetail: "Сучасне місто · назва з 21 листопада 1908 року",
    ancientName: "Аргос Амфілохійський",
    ancientDetail: "Орієнтовна локалізація давнього міста",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Західна Греція",
    place: "Амбракійська затока",
    label: "Інтерактивна мапа Західної Греції: Амфілохія та орієнтовна локалізація Аргоса Амфілохійського",
  },
  be: {
    modernName: "Амфілохія",
    modernDetail: "Сучасны горад · назва з 21 лістапада 1908 года",
    ancientName: "Аргас Амфілохійскі",
    ancientDetail: "Арыентыровачная лакалізацыя старажытнага горада",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Заходняя Грэцыя",
    place: "Амбракійскі заліў",
    label: "Інтэрактыўная карта Заходняй Грэцыі: Амфілохія і арыентыровачная лакалізацыя Аргаса Амфілохійскага",
  },
});

export function AmphilochiaOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

  useEffect(() => {
    const points = [
      {
        name: text.modernName,
        detail: text.modernDetail,
        latitude: 38.86342,
        longitude: 21.16667,
        kind: "modern",
      },
      {
        name: text.ancientName,
        detail: text.ancientDetail,
        latitude: 38.935912,
        longitude: 21.180267,
        kind: "ancient",
      },
    ] as const;

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
        `<a href="https://leafletjs.com/" target="_blank" rel="noreferrer" title="${text.leafletTitle}">Leaflet</a>`,
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
        region.textContent = text.region;
        place.textContent = text.place;
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
  }, [text]);

  return (
    <div
      className="amphilochia-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.label}
    />
  );
}
