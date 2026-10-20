"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  first: "1-е Анпилогово",
  firstDetail: "Южный ориентир; связь с историческими общинами ещё проверяется",
  second: "2-е Анпилогово",
  secondDetail: "Северный ориентир; связь с историческими общинами ещё проверяется",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Курский район",
  subject: "две деревни, разные общины",
  label: "Интерактивная OpenStreetMap-карта деревень 1-е Анпилогово и 2-е Анпилогово",
}, {
  en: {
    first: "1st Anpilogovo",
    firstDetail: "Southern landmark; its link to the historical communities is still being checked",
    second: "2nd Anpilogovo",
    secondDetail: "Northern landmark; its link to the historical communities is still being checked",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Kursk district",
    subject: "two villages, different communities",
    label: "Interactive OpenStreetMap map of the villages of 1st Anpilogovo and 2nd Anpilogovo",
  },
  uk: {
    first: "1-ше Анпілогово",
    firstDetail: "Південний орієнтир; зв’язок з історичними громадами ще перевіряється",
    second: "2-ге Анпілогово",
    secondDetail: "Північний орієнтир; зв’язок з історичними громадами ще перевіряється",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Курський район",
    subject: "два села, різні громади",
    label: "Інтерактивна мапа OpenStreetMap сіл 1-ше Анпілогово і 2-ге Анпілогово",
  },
  be: {
    first: "1-е Анпілогава",
    firstDetail: "Паўднёвы арыенцір; сувязь з гістарычнымі абшчынамі яшчэ правяраецца",
    second: "2-е Анпілогава",
    secondDetail: "Паўночны арыенцір; сувязь з гістарычнымі абшчынамі яшчэ правяраецца",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Курскі раён",
    subject: "дзве вёскі, розныя абшчыны",
    label: "Інтэрактыўная карта OpenStreetMap вёсак 1-е Анпілогава і 2-е Анпілогава",
  },
});

export function AnpilogovoOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

  useEffect(() => {
    const places = [
      {
        name: text.first,
        detail: text.firstDetail,
        latitude: 51.778333,
        longitude: 36.006667,
        kind: "shared",
        direction: "bottom",
      },
      {
        name: text.second,
        detail: text.secondDetail,
        latitude: 51.791667,
        longitude: 36.01,
        kind: "shared",
        direction: "right",
      },
    ] as const;

    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: [51.785, 36.008],
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

      const historicVillage = L.latLngBounds([
        [places[0].latitude, places[0].longitude],
        [places[1].latitude, places[1].longitude],
      ]);

      L.circle(historicVillage.getCenter(), {
        radius: 2300,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 6",
        fillColor: "#a6412f",
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(map);

      places.forEach((place) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker anpilogovo-leaflet-marker",
          html: `<span class="amphilochia-leaflet-marker__dot anpilogovo-leaflet-marker__dot is-${place.kind}"></span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const horizontalOffset = place.direction === "right" ? 14 : -14;
        const tooltipOffset: [number, number] = place.direction === "bottom"
          ? [0, 13]
          : [horizontalOffset, -9];

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: place.name,
        })
          .addTo(map!)
          .bindTooltip(place.name, {
            direction: place.direction,
            offset: tooltipOffset,
            permanent: true,
            className: `amphilochia-leaflet-label anpilogovo-leaflet-label is-${place.kind}`,
          })
          .bindPopup(
            `<strong>${place.name}</strong><span>${place.detail}</span>`,
          );
      });

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

      const bounds = L.latLngBounds(
        places.map((place) => [place.latitude, place.longitude] as [number, number]),
      );
      map.fitBounds(bounds, { padding: [72, 72], maxZoom: 13 });
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
