"use client";

import { useEffect, useRef } from "react";
import { leafletInteractionOptions } from "@/lib/leaflet-interactions";
import type { StoryMapConfig } from "@/lib/story-maps";

export function StoryOpenStreetMap({ config }: { config: StoryMapConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    let map: import("leaflet").Map | undefined;

    void import("leaflet").then((L) => {
      if (!active || !containerRef.current) return;

      const points = new Map(config.places.map((place) => [place.id, place]));
      const bounds = L.latLngBounds(config.places.map((place) => [place.latitude, place.longitude]));

      map = L.map(containerRef.current, {
        ...leafletInteractionOptions,
        center: bounds.getCenter(),
        zoom: 6,
        minZoom: 3,
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

      config.routes.forEach((route) => {
        const from = points.get(route.from);
        const to = points.get(route.to);
        if (!from || !to) return;

        L.polyline(
          [
            [from.latitude, from.longitude],
            [to.latitude, to.longitude],
          ],
          {
            color: "#a6412f",
            weight: route.dashed ? 3 : 4,
            opacity: route.dashed ? 0.75 : 0.9,
            dashArray: route.dashed ? "7 9" : undefined,
            lineCap: "square",
          },
        )
          .addTo(map!)
          .bindTooltip(route.label, { sticky: true, className: "amphilochia-leaflet-label" });
      });

      config.places.forEach((place) => {
        const icon = L.divIcon({
          className: "amphilochia-leaflet-marker",
          html: `<span class="amphilochia-leaflet-marker__dot${place.role === "origin" ? " is-ancient" : ""}"></span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const side = place.labelSide ?? "right";
        const offsets = { left: [-12, 0], right: [12, 0], top: [0, -12], bottom: [0, 12] } as const;

        L.marker([place.latitude, place.longitude], { icon, keyboard: true, title: place.name })
          .addTo(map!)
          .bindTooltip(place.name, {
            direction: side,
            offset: L.point(offsets[side][0], offsets[side][1]),
            permanent: place.label === "permanent",
            className: "amphilochia-leaflet-label",
          })
          .bindPopup(`<strong>${place.name}</strong><span>${place.detail}</span>`);
      });

      const contextControl = new L.Control({ position: "topleft" });
      contextControl.onAdd = () => {
        const element = L.DomUtil.create("div", "amphilochia-map-context");
        const title = document.createElement("strong");
        const subtitle = document.createElement("span");
        title.textContent = config.title;
        subtitle.textContent = config.subtitle;
        element.append(title, subtitle);
        return element;
      };
      contextControl.addTo(map);

      // Extra top padding keeps northern points clear of the title panel;
      // side padding leaves room for labels of the outermost points.
      const fitOptions = () => {
        const side = Math.round(Math.min(120, (map?.getSize().x ?? 0) * 0.16));
        return {
          paddingTopLeft: L.point(side, 96),
          paddingBottomRight: L.point(side, 48),
          maxZoom: config.maxZoom ?? 9,
          animate: false,
        };
      };
      map.fitBounds(bounds, fitOptions());
      // The container can still be settling on first paint; fit again once its size is final.
      window.requestAnimationFrame(() => {
        if (!active) return;
        map?.invalidateSize();
        map?.fitBounds(bounds, fitOptions());
      });
    });

    return () => {
      active = false;
      map?.remove();
    };
  }, [config]);

  return (
    <div
      className="amphilochia-map-canvas story-map-canvas"
      ref={containerRef}
      role="region"
      aria-label={config.ariaLabel}
    />
  );
}
