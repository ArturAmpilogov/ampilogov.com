"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "@/i18n/client";
import { defineCopy } from "@/i18n/copy";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";

const copy = defineCopy({
  prilukiName: "Прилуки",
  prilukiDetail: "Давняя вотчина Троице-Сергиева монастыря; в 1536/37 году здесь записан Тонкой Онфилогов, хозяин непашенного двора",
  prilukiLabel: "Прилуки · 1536/37",
  onfilogovoName: "Онфилогово",
  onfilogovoDetail: [
    "Исчезнувшая деревня из четырёх дворов, записанная в 1539/1540 году.",
    "Маркер показывает не дворы, а реконструированный научной ГИС центр владения — Никольское (Свечино).",
    "На плане Генерального межевания отдельная «д. Онфилогова» стоит рядом с Ворониной в даче № 516.",
    "Название означает «селение Онфилога»; конкретный эпоним жил раньше записи, вероятно в XV — начале XVI века.",
  ].join(" "),
  onfilogovoTitle: (name: string) => `${name}: реконструированный центр владения, не точка деревни`,
  onfilogovoLabel: "Онфилогово · центр владения",
  onfilogovoCoordinates: "56.322586, 35.204732 · научная реконструкция Никольского (Свечина)",
  uglichName: "Углич",
  uglichContext: "уездный контекст",
  uglichDetail: "Центр уезда, к которому относились Прилуки. Тверское Онфилогово находилось в другом уезде; общего семейного маршрута документы не называют.",
  leafletTitle: "Открыть сайт Leaflet в новой вкладке",
  region: "Верхняя Волга",
  place: "две записи 1536–1540 годов; родство не установлено",
  ariaLabel: "Интерактивная карта Прилук, научно реконструированного центра владения Онфилогова и Углича",
}, {
  en: {
    prilukiName: "Priluki",
    prilukiDetail: "A long-standing estate of the Trinity-Sergius Monastery; in 1536/37 Tonkoy Onfilogov, holder of a non-arable homestead, was recorded here",
    prilukiLabel: "Priluki · 1536/37",
    onfilogovoName: "Onfilogovo",
    onfilogovoDetail: [
      "A vanished village of four homesteads, recorded in 1539/1540.",
      "The marker shows not the homesteads but the centre of the holding reconstructed in a scholarly GIS: Nikolskoye (Svechino).",
      "On the General Land Survey plan a separate «д. Онфилогова» [“village of Onfilogova”] stands next to Voronina in parcel No. 516.",
      "The name means “Onfilog's settlement”; the particular eponym lived before the record, probably in the 15th or early 16th century.",
    ].join(" "),
    onfilogovoTitle: (name: string) => `${name}: reconstructed centre of the holding, not the village's location`,
    onfilogovoLabel: "Onfilogovo · centre of the holding",
    onfilogovoCoordinates: "56.322586, 35.204732 · scholarly reconstruction of Nikolskoye (Svechino)",
    uglichName: "Uglich",
    uglichContext: "district context",
    uglichDetail: "Seat of the district to which Priluki belonged. Onfilogovo in the Tver lands lay in another district; the documents name no shared family route.",
    leafletTitle: "Open the Leaflet website in a new tab",
    region: "Upper Volga",
    place: "two records of 1536–1540; kinship not established",
    ariaLabel: "Interactive map of Priluki, the scholarly reconstructed centre of the Onfilogovo holding, and Uglich",
  },
  uk: {
    prilukiName: "Прилуки",
    prilukiDetail: "Давня вотчина Троїце-Сергієвого монастиря; у 1536/37 році тут записано Тонкого Онфілогова, господаря неорного двору",
    prilukiLabel: "Прилуки · 1536/37",
    onfilogovoName: "Онфілогово",
    onfilogovoDetail: [
      "Зникле село з чотирьох дворів, записане в 1539/1540 році.",
      "Маркер показує не двори, а реконструйований науковою ГІС центр володіння — Нікольське (Свєчино).",
      "На плані Генерального межування окрема «д. Онфилогова» стоїть поруч із Ворониною в дачі № 516.",
      "Назва означає «поселення Онфілога»; конкретний епонім жив раніше за запис, імовірно в XV — на початку XVI століття.",
    ].join(" "),
    onfilogovoTitle: (name: string) => `${name}: реконструйований центр володіння, не точка села`,
    onfilogovoLabel: "Онфілогово · центр володіння",
    onfilogovoCoordinates: "56.322586, 35.204732 · наукова реконструкція Нікольського (Свєчина)",
    uglichName: "Углич",
    uglichContext: "повітовий контекст",
    uglichDetail: "Центр повіту, до якого належали Прилуки. Тверське Онфілогово було в іншому повіті; спільного родинного маршруту документи не називають.",
    leafletTitle: "Відкрити сайт Leaflet у новій вкладці",
    region: "Верхня Волга",
    place: "два записи 1536–1540 років; спорідненість не встановлено",
    ariaLabel: "Інтерактивна карта Прилук, науково реконструйованого центру володіння Онфілогова та Углича",
  },
  be: {
    prilukiName: "Прылукі",
    prilukiDetail: "Даўняя вотчына Троіца-Сергіева манастыра; у 1536/37 годзе тут запісаны Тонкой Онфілогаў, гаспадар неворнага двара",
    prilukiLabel: "Прылукі · 1536/37",
    onfilogovoName: "Онфілогава",
    onfilogovoDetail: [
      "Зніклая вёска з чатырох двароў, запісаная ў 1539/1540 годзе.",
      "Маркер паказвае не двары, а рэканструяваны навуковай ГІС цэнтр уладання — Нікольскае (Свечына).",
      "На плане Генеральнага межавання асобная «д. Онфилогова» стаіць побач з Варанінай у дачы № 516.",
      "Назва азначае «паселішча Онфілога»; канкрэтны эпонім жыў раней за запіс, верагодна ў XV — пачатку XVI стагоддзя.",
    ].join(" "),
    onfilogovoTitle: (name: string) => `${name}: рэканструяваны цэнтр уладання, не пункт вёскі`,
    onfilogovoLabel: "Онфілогава · цэнтр уладання",
    onfilogovoCoordinates: "56.322586, 35.204732 · навуковая рэканструкцыя Нікольскага (Свечына)",
    uglichName: "Угліч",
    uglichContext: "павятовы кантэкст",
    uglichDetail: "Цэнтр павета, да якога адносіліся Прылукі. Цвярское Онфілогава знаходзілася ў іншым павеце; агульнага сямейнага маршруту дакументы не называюць.",
    leafletTitle: "Адкрыць сайт Leaflet у новай укладцы",
    region: "Верхняя Волга",
    place: "два запісы 1536–1540 гадоў; сваяцтва не ўстаноўлена",
    ariaLabel: "Інтэрактыўная карта Прылук, навукова рэканструяванага цэнтра ўладання Онфілогава і Угліча",
  },
});

const priluki = {
  latitude: 57.365108,
  longitude: 38.037449,
};

const onfilogovo = {
  latitude: 56.3225861843296,
  longitude: 35.2047323324939,
};

const uglich = {
  latitude: 57.5266,
  longitude: 38.3195,
};

export function PrilukiOpenStreetMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const text = copy[useLocale()];

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
        `<a href="https://leafletjs.com/" target="_blank" rel="noreferrer" title="${text.leafletTitle}">Leaflet</a>`,
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
        title: text.prilukiName,
      })
        .addTo(map)
        .bindTooltip(text.prilukiLabel, {
          direction: "left",
          offset: [-12, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label",
        })
        .bindPopup(`<strong>${text.prilukiName}</strong><span>${text.prilukiDetail}</span>`);

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
        title: text.onfilogovoTitle(text.onfilogovoName),
      })
        .addTo(map)
        .bindTooltip(text.onfilogovoLabel, {
          direction: "left",
          offset: [-12, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label is-approximate",
        })
        .bindPopup(
          `<strong>${text.onfilogovoName}</strong><span>${text.onfilogovoDetail}</span><small>${text.onfilogovoCoordinates}</small>`,
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
        title: text.uglichName,
      })
        .addTo(map)
        .bindTooltip(text.uglichName, {
          direction: "right",
          offset: [10, 0],
          permanent: true,
          className: "amphilochia-leaflet-label priluki-leaflet-label is-context",
        })
        .bindPopup(`<strong>${text.uglichName} · ${text.uglichContext}</strong><span>${text.uglichDetail}</span>`);

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context priluki-map-context");
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
  }, [text]);

  return (
    <div
      className="amphilochia-map-canvas priluki-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={text.ariaLabel}
    />
  );
}
