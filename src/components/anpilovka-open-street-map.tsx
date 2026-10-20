"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  name: "Анпиловка",
  detail: "Селение старооскольских Анпиловых рядом с селом Бор",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Староосколье",
  subject: "Анпиловка у села Бор",
  label: "Интерактивная OpenStreetMap-карта Анпиловки у села Бор в Старооскольском округе",
}, {
  en: {
    name: "Anpilovka",
    detail: "Settlement of the Stary Oskol Anpilovs next to the village of Bor",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Stary Oskol area",
    subject: "Anpilovka near the village of Bor",
    label: "Interactive OpenStreetMap map of Anpilovka near the village of Bor in the Stary Oskol district",
  },
  uk: {
    name: "Анпіловка",
    detail: "Поселення старооскольських Анпілових поруч із селом Бор",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Старооскольщина",
    subject: "Анпіловка біля села Бор",
    label: "Інтерактивна мапа OpenStreetMap Анпіловки біля села Бор у Старооскольському окрузі",
  },
  be: {
    name: "Анпілаўка",
    detail: "Паселішча старааскольскіх Анпілавых побач з сялом Бор",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Старааскольшчына",
    subject: "Анпілаўка каля сяла Бор",
    label: "Інтэрактыўная карта OpenStreetMap Анпілаўкі каля сяла Бор у Старааскольскай акрузе",
  },
});

export function AnpilovkaOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

  useEffect(() => {
    const anpilovka = {
      name: text.name,
      detail: text.detail,
      latitude: 51.26,
      longitude: 37.879444,
    };

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
        `<a href="https://leafletjs.com/" target="_blank" rel="noreferrer" title="${text.leafletTitle}">Leaflet</a>`,
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
        region.textContent = text.region;
        subject.textContent = text.subject;
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
  }, [text]);

  return (
    <div
      className="amphilochia-map-canvas anpilogovo-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.label}
    />
  );
}
