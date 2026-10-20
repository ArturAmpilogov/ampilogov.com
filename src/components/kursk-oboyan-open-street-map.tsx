"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  kursk: "Курск",
  kurskDetail: "В Курской десятне 1636 года Сергей впервые записан среди новиков",
  oboyan: "Обоянь",
  oboyanDetail: "В Обоянской десятне 1651 года Сергей назван вместе с сыновьями",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  route: "Две документальные точки: 1636 → 1651",
  title: "Путь Сергея",
  subtitle: "Курск · 1636 → Обоянь · 1651",
  label: "Интерактивная карта документального пути Сергея Анпилогова из Курска в Обоянь между 1636 и 1651 годами",
}, {
  en: {
    kursk: "Kursk",
    kurskDetail: "In the Kursk muster roll (desyatnya) of 1636 Sergei is first listed among the new recruits (noviki)",
    oboyan: "Oboyan",
    oboyanDetail: "In the Oboyan muster roll (desyatnya) of 1651 Sergei is named together with his sons",
    leafletTitle: "Open the Leaflet website in a new tab",
    route: "Two documented points: 1636 → 1651",
    title: "Sergei’s path",
    subtitle: "Kursk · 1636 → Oboyan · 1651",
    label: "Interactive map of the documented path of Sergei Anpilogov from Kursk to Oboyan between 1636 and 1651",
  },
  uk: {
    kursk: "Курськ",
    kurskDetail: "У Курській десятні 1636 року Сергія вперше записано серед новиків",
    oboyan: "Обоянь",
    oboyanDetail: "В Обоянській десятні 1651 року Сергія названо разом із синами",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    route: "Дві документальні точки: 1636 → 1651",
    title: "Шлях Сергія",
    subtitle: "Курськ · 1636 → Обоянь · 1651",
    label: "Інтерактивна мапа документального шляху Сергія Анпілогова з Курська до Обояні між 1636 і 1651 роками",
  },
  be: {
    kursk: "Курск",
    kurskDetail: "У Курскай дзесятні 1636 года Сяргей упершыню запісаны сярод навікоў",
    oboyan: "Абаянь",
    oboyanDetail: "У Абаянскай дзесятні 1651 года Сяргей названы разам з сынамі",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    route: "Дзве дакументальныя кропкі: 1636 → 1651",
    title: "Шлях Сяргея",
    subtitle: "Курск · 1636 → Абаянь · 1651",
    label: "Інтэрактыўная карта дакументальнага шляху Сяргея Анпілогава з Курска ў Абаянь паміж 1636 і 1651 гадамі",
  },
});

export function KurskOboyanOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

  useEffect(() => {
    const kursk = {
      name: text.kursk,
      detail: text.kurskDetail,
      latitude: 51.7308,
      longitude: 36.193,
    };

    const oboyan = {
      name: text.oboyan,
      detail: text.oboyanDetail,
      latitude: 51.212,
      longitude: 36.2786,
    };

    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [51.47, 36.235],
        zoom: 9,
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

      route.bindTooltip(text.route, {
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
        title.textContent = text.title;
        subtitle.textContent = text.subtitle;
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
  }, [text]);

  return (
    <div
      className="amphilochia-map-canvas kursk-oboyan-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.label}
    />
  );
}
