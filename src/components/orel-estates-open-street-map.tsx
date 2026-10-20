"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  places: [
    { name: "Баздырево", currentName: "Баздрево", detail: "Сохранившееся топонимическое продолжение" },
    { name: "Белая", currentName: "Белолунино", detail: "На исторической карте: Белая (Белолунино)" },
    { name: "Радомлея", currentName: "Радомль", detail: "Сохранившееся топонимическое продолжение" },
    { name: "Софоново", currentName: "Точная современная точка не установлена", detail: "Приблизительная область по исторической карте" },
    { name: "Малцовская", currentName: "Лаврово", detail: "На исторической карте: Малцовская (Лаврово)" },
  ],
  orel: "Орёл",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Орловский уезд · 1594/95",
  subject: "пять поместий из писцовой книги",
  ariaLabel: "Интерактивная карта пяти поместий Анфилоговых в Орловском уезде по писцовой книге 1594–1595 годов",
}, {
  en: {
    places: [
      { name: "Bazdyrevo", currentName: "Bazdrevo", detail: "The name survives in a modern place name" },
      { name: "Belaya", currentName: "Belolunino", detail: "On the historical map: Belaya (Belolunino)" },
      { name: "Radomleya", currentName: "Radoml", detail: "The name survives in a modern place name" },
      { name: "Sofonovo", currentName: "No precise modern point identified", detail: "Approximate area from the historical map" },
      { name: "Maltsovskaya", currentName: "Lavrovo", detail: "On the historical map: Maltsovskaya (Lavrovo)" },
    ],
    orel: "Oryol",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Oryol district · 1594/95",
    subject: "five estates from the cadastral book",
    ariaLabel: "Interactive map of the five Anfilogov estates in Oryol district according to the cadastral book of 1594–1595",
  },
  uk: {
    places: [
      { name: "Баздирево", currentName: "Баздрево", detail: "Збережене топонімічне продовження" },
      { name: "Бєлая", currentName: "Бєлолуніно", detail: "На історичній карті: Бєлая (Бєлолуніно)" },
      { name: "Радомлєя", currentName: "Радомль", detail: "Збережене топонімічне продовження" },
      { name: "Софоново", currentName: "Точну сучасну точку не встановлено", detail: "Приблизна область за історичною картою" },
      { name: "Малцовська", currentName: "Лаврово", detail: "На історичній карті: Малцовська (Лаврово)" },
    ],
    orel: "Орел",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Орловський повіт · 1594/95",
    subject: "п’ять маєтків із писцевої книги",
    ariaLabel: "Інтерактивна карта п’яти маєтків Анфілогових в Орловському повіті за писцевою книгою 1594–1595 років",
  },
  be: {
    places: [
      { name: "Баздырава", currentName: "Баздрава", detail: "Тапонім захаваўся ў сучаснай назве" },
      { name: "Белая", currentName: "Белалуніна", detail: "На гістарычнай карце: Белая (Белалуніна)" },
      { name: "Радамлея", currentName: "Радомль", detail: "Тапонім захаваўся ў сучаснай назве" },
      { name: "Сафонава", currentName: "Дакладны сучасны пункт не ўстаноўлены", detail: "Прыблізная вобласць паводле гістарычнай карты" },
      { name: "Малцоўская", currentName: "Лаўрава", detail: "На гістарычнай карце: Малцоўская (Лаўрава)" },
    ],
    orel: "Арол",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Арлоўскі павет · 1594/95",
    subject: "пяць маёнткаў з пісцовай кнігі",
    ariaLabel: "Інтэрактыўная карта пяці маёнткаў Анфілогаў у Арлоўскім павеце паводле пісцовай кнігі 1594–1595 гадоў",
  },
});

const places = [
  {
    latitude: 52.98454,
    longitude: 35.439101,
    kind: "matched",
    direction: "left",
  },
  {
    latitude: 52.941863,
    longitude: 35.507563,
    kind: "matched",
    direction: "bottom",
  },
  {
    latitude: 53.036655,
    longitude: 35.491152,
    kind: "matched",
    direction: "top",
  },
  {
    latitude: 53.0203,
    longitude: 35.535,
    kind: "historical",
    direction: "right",
  },
  {
    latitude: 52.838365,
    longitude: 36.009488,
    kind: "matched",
    direction: "left",
  },
] as const;

const orel = {
  latitude: 52.968543,
  longitude: 36.069247,
};

export function OrelEstatesOpenStreetMap() {
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
          title: label.name,
        })
          .addTo(map!)
          .bindTooltip(label.name, {
            direction: place.direction,
            offset: place.direction === "bottom" ? [0, 12] : place.direction === "top" ? [0, -12] : [place.direction === "right" ? 12 : -12, 0],
            permanent: true,
            className: `amphilochia-leaflet-label orel-estates-leaflet-label is-${place.kind}`,
          })
          .bindPopup(
            `<strong>${label.name}</strong><span>${label.currentName}</span><small>${label.detail}</small>`,
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
        const region = document.createElement("strong");
        const subject = document.createElement("span");
        region.textContent = text.region;
        subject.textContent = text.subject;
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
