"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  places: [
    {
      name: "Белая",
      currentName: "ныне Белолунино",
      detail: "Иван Анфилогов; позднее названы его сыновья Илья, Василий и Антон",
    },
    {
      name: "Баздырево",
      currentName: "ныне Баздрево",
      detail: "Василий Анфилогов; позднее названы его сыновья Алексей и Григорий",
    },
  ],
  markerTitle: (name: string) => `${name}, 1625 год`,
  orel: "Орёл",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  contextTitle: "Две земли между поколениями",
  contextSubtitle: "Белая и Баздырево · 1625",
  ariaLabel: "Интерактивная карта поместий Анфилоговых в Белой и Баздыреве, связывающих записи 1594 и 1625 годов",
}, {
  en: {
    places: [
      {
        name: "Belaya",
        currentName: "now Belolunino",
        detail: "Ivan Anfilogov; his sons Ilya, Vasily and Anton are named later",
      },
      {
        name: "Bazdyrevo",
        currentName: "now Bazdrevo",
        detail: "Vasily Anfilogov; his sons Alexei and Grigory are named later",
      },
    ],
    markerTitle: (name: string) => `${name}, 1625`,
    orel: "Oryol",
    leafletTitle: "Open the Leaflet website in a new tab",
    contextTitle: "Two lands across generations",
    contextSubtitle: "Belaya and Bazdyrevo · 1625",
    ariaLabel: "Interactive map of the Anfilogov estates at Belaya and Bazdyrevo, linking the records of 1594 and 1625",
  },
  uk: {
    places: [
      {
        name: "Бєлая",
        currentName: "нині Бєлолуніно",
        detail: "Іван Анфілогов; пізніше названо його синів Іллю, Василя й Антона",
      },
      {
        name: "Баздирево",
        currentName: "нині Баздрево",
        detail: "Василь Анфілогов; пізніше названо його синів Олексія та Григорія",
      },
    ],
    markerTitle: (name: string) => `${name}, 1625 рік`,
    orel: "Орел",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    contextTitle: "Дві землі між поколіннями",
    contextSubtitle: "Бєлая і Баздирево · 1625",
    ariaLabel: "Інтерактивна карта маєтків Анфілогових у Бєлій і Баздиревому, що пов’язують записи 1594 і 1625 років",
  },
  be: {
    places: [
      {
        name: "Белая",
        currentName: "цяпер Белалуніна",
        detail: "Іван Анфілогаў; пазней названы яго сыны Ілья, Васілій і Антон",
      },
      {
        name: "Баздырава",
        currentName: "цяпер Баздрава",
        detail: "Васілій Анфілогаў; пазней названы яго сыны Аляксей і Грыгорый",
      },
    ],
    markerTitle: (name: string) => `${name}, 1625 год`,
    orel: "Арол",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    contextTitle: "Дзве зямлі паміж пакаленнямі",
    contextSubtitle: "Белая і Баздырава · 1625",
    ariaLabel: "Інтэрактыўная карта маёнткаў Анфілогаў у Белай і Баздыраве, што звязваюць запісы 1594 і 1625 гадоў",
  },
});

const places = [
  {
    latitude: 52.941863,
    longitude: 35.507563,
    direction: "bottom" as const,
  },
  {
    latitude: 52.98454,
    longitude: 35.439101,
    direction: "top" as const,
  },
];

const orel = {
  latitude: 52.968543,
  longitude: 36.069247,
};

export function OrelLinesOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

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
        `<a href="https://leafletjs.com/" target="_blank" rel="noreferrer" title="${text.leafletTitle}">Leaflet</a>`,
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      }).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

      places.forEach((place, index) => {
        const label = text.places[index];
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker orel-estates-leaflet-marker",
          html: '<span class="amphilochia-leaflet-marker__dot orel-estates-leaflet-marker__dot is-matched"></span>',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        L.marker([place.latitude, place.longitude], {
          icon,
          keyboard: true,
          title: text.markerTitle(label.name),
        })
          .addTo(map!)
          .bindTooltip(`${label.name} · 1625`, {
            direction: place.direction,
            offset: place.direction === "bottom" ? [0, 12] : [0, -12],
            permanent: true,
            className: "amphilochia-leaflet-label orel-estates-leaflet-label is-matched",
          })
          .bindPopup(
            `<strong>${label.name} · 1625</strong><span>${label.currentName}</span><small>${label.detail}</small>`,
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
        title: text.orel,
      })
        .addTo(map)
        .bindTooltip(text.orel, {
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
        title.textContent = text.contextTitle;
        subtitle.textContent = text.contextSubtitle;
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
  }, [text]);

  return (
    <div
      className="amphilochia-map-canvas orel-estates-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.ariaLabel}
    />
  );
}
