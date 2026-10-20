"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  mallos: "Малл",
  mallosDetail: "Древний город и центр оракула Амфилохоса",
  mallosLabel: "Малл · древний город",
  karatas: "Караташ",
  adana: "Адана",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Киликия · юг современной Турции",
  place: "Долина Пирама — современного Джейхана",
  label: "Интерактивная карта Киликии: древний Малл, современный Караташ и Адана",
}, {
  en: {
    mallos: "Mallos",
    mallosDetail: "Ancient city and seat of the oracle of Amphilochos",
    mallosLabel: "Mallos · ancient city",
    karatas: "Karataş",
    adana: "Adana",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Cilicia · south of modern Türkiye",
    place: "Valley of the Pyramus — the modern Ceyhan",
    label: "Interactive map of Cilicia: ancient Mallos, modern Karataş and Adana",
  },
  uk: {
    mallos: "Малл",
    mallosDetail: "Давнє місто й осередок оракула Амфілохоса",
    mallosLabel: "Малл · давнє місто",
    karatas: "Караташ",
    adana: "Адана",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Кілікія · південь сучасної Туреччини",
    place: "Долина Пірама — сучасного Джейхана",
    label: "Інтерактивна мапа Кілікії: давній Малл, сучасні Караташ і Адана",
  },
  be: {
    mallos: "Мал",
    mallosDetail: "Старажытны горад і асяродак аракула Амфілохаса",
    mallosLabel: "Мал · старажытны горад",
    karatas: "Караташ",
    adana: "Адана",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Кілікія · поўдзень сучаснай Турцыі",
    place: "Даліна Пірама — сучаснага Джэйхана",
    label: "Інтэрактыўная карта Кілікіі: старажытны Мал, сучасныя Караташ і Адана",
  },
});

export function MallosOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

  useEffect(() => {
    const mallos = {
      name: text.mallos,
      detail: text.mallosDetail,
      latitude: 36.756188,
      longitude: 35.4852,
    };

    const contextPlaces = [
      {
        id: "karatas",
        name: text.karatas,
        latitude: 36.5627,
        longitude: 35.382,
      },
      {
        id: "adana",
        name: text.adana,
        latitude: 36.9914,
        longitude: 35.3308,
      },
    ] as const;

    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [36.78, 35.4],
        zoom: 9,
        minZoom: 6,
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

      const mallosIcon = L.divIcon({
        className: "amphilochia-leaflet-marker mallos-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot is-ancient"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.circle([mallos.latitude, mallos.longitude], {
        radius: 3500,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#a6412f",
        fillOpacity: 0.05,
      }).addTo(map);

      L.marker([mallos.latitude, mallos.longitude], {
        icon: mallosIcon,
        keyboard: true,
        title: mallos.name,
      })
        .addTo(map)
        .bindTooltip(text.mallosLabel, {
          direction: "top",
          offset: [0, -12],
          permanent: true,
          className: "amphilochia-leaflet-label mallos-leaflet-label",
        })
        .bindPopup(`<strong>${mallos.name}</strong><span>${mallos.detail}</span>`);

      const contextIcon = L.divIcon({
        className: "amphilochia-leaflet-marker mallos-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot mallos-leaflet-marker__dot is-context"></span>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      contextPlaces.forEach((place) => {
        L.marker([place.latitude, place.longitude], {
          icon: contextIcon,
          keyboard: true,
          title: place.name,
        })
          .addTo(map!)
          .bindTooltip(place.name, {
            direction: place.id === "adana" ? "top" : "bottom",
            offset: place.id === "adana" ? [0, -9] : [0, 9],
            permanent: true,
            className: "amphilochia-leaflet-label mallos-leaflet-label is-context",
          });
      });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context mallos-map-context");
        const region = document.createElement("strong");
        const place = document.createElement("span");
        region.textContent = text.region;
        place.textContent = text.place;
        element.append(region, place);
        return element;
      };
      contextControl.addTo(map);

      map.fitBounds(
        L.latLngBounds([
          [mallos.latitude, mallos.longitude],
          ...contextPlaces.map((place) => [place.latitude, place.longitude] as [number, number]),
        ]),
        { padding: [58, 58], maxZoom: 10 },
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
      className="amphilochia-map-canvas mallos-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.label}
    />
  );
}
