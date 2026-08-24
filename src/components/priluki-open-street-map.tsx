"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const priluki = {
  name: "Прилуки",
  detail: "Давняя вотчина Троице-Сергиева монастыря; в 1536/37 году здесь записан Тонкой Онфилогов, хозяин непашенного двора",
  latitude: 57.365108,
  longitude: 38.037449,
};

const onfilogovo = {
  name: "Онфилогово",
  detail: [
    "Исчезнувшая деревня из четырёх дворов, записанная в 1539/1540 году.",
    "Маркер показывает не дворы, а реконструированный научной ГИС центр владения — Никольское (Свечино).",
    "На плане Генерального межевания отдельная «д. Онфилогова» стоит рядом с Ворониной в даче № 516.",
    "Название означает «селение Онфилога»; конкретный эпоним жил раньше записи, вероятно в XV — начале XVI века.",
  ].join(" "),
  latitude: 56.3225861843296,
  longitude: 35.2047323324939,
};

const uglich = {
  name: "Углич",
  detail: "Центр общего уезда: до 1521 года Иван Юрлов Меньшой продал село Инково, а в 1536/37 году в монастырских Прилуках записан Тонкой Онфилогов. Это региональная зацепка, не общая владельческая цепочка. Инково отсутствует в полном межевом указателе 1908 года, поэтому отдельный маркер не поставлен.",
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
        center: [56.85, 36.8],
        zoom: 7,
        minZoom: 6,
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

      const onfilogovoIcon = L.divIcon({
        className: "amphilochia-leaflet-marker priluki-leaflet-marker",
        html: '<span class="amphilochia-leaflet-marker__dot priluki-leaflet-marker__dot is-approximate"></span>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      L.circle([onfilogovo.latitude, onfilogovo.longitude], {
        radius: 2200,
        color: "#a6412f",
        weight: 1.5,
        dashArray: "5 7",
        fillColor: "#a6412f",
        fillOpacity: 0.035,
      }).addTo(map);

      L.marker([onfilogovo.latitude, onfilogovo.longitude], {
        icon: onfilogovoIcon,
        keyboard: true,
        title: `${onfilogovo.name}: реконструированный центр владения, не точка деревни`,
      })
        .addTo(map)
        .bindTooltip("Онфилогово · центр владения", {
          direction: "left",
          offset: [-12, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label is-approximate",
        })
        .bindPopup(
          `<strong>${onfilogovo.name}</strong><span>${onfilogovo.detail}</span><small>56.322586, 35.204732 · научная реконструкция Никольского (Свечина)</small>`,
        );

      L.polyline(
        [
          [priluki.latitude, priluki.longitude],
          [onfilogovo.latitude, onfilogovo.longitude],
        ],
        {
          color: "#a6412f",
          weight: 1.5,
          opacity: 0.45,
          dashArray: "3 8",
          interactive: false,
        },
      ).addTo(map);

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
        })
        .bindPopup(`<strong>${uglich.name} · уездный контекст</strong><span>${uglich.detail}</span>`);

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context priluki-map-context");
        const region = document.createElement("strong");
        const place = document.createElement("span");
        region.textContent = "Верхняя Волга";
        place.textContent = "две записи 1536–1540 годов; родство не установлено";
        element.append(region, place);
        return element;
      };
      contextControl.addTo(map);

      map.fitBounds(
        L.latLngBounds([
          [priluki.latitude, priluki.longitude],
          [onfilogovo.latitude, onfilogovo.longitude],
          [uglich.latitude, uglich.longitude],
        ]),
        { padding: [62, 62], maxZoom: 8 },
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
      aria-label="Интерактивная карта Прилук, научно реконструированного центра владения Онфилогова и Углича"
    />
  );
}
