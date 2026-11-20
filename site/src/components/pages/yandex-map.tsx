"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

export function LocationMap({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let resize: ResizeObserver | undefined;

    async function initialize() {
      const L = await import("leaflet");
      if (disposed || !container.current) return;

      const position: [number, number] = [59.836016, 30.107619];
      map = L.map(container.current, { scrollWheelZoom: false }).setView(position, 17);
      map.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(map);

      const icon = L.divIcon({
        className: "location-map__marker",
        html: '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56"><path d="M22 54C18 44 3 31 3 22a19 19 0 1 1 38 0c0 9-15 22-19 32Z" fill="#ef4444" stroke="white" stroke-width="3"/><circle cx="22" cy="21" r="8" fill="white"/></svg>',
        iconSize: [44, 56],
        iconAnchor: [22, 54],
        popupAnchor: [0, -48],
      });
      const popup = document.createElement("div");
      popup.textContent = `${site.name} — ${site.address}`;
      L.marker(position, { icon, title: site.name, alt: site.address }).addTo(map).bindPopup(popup);
      map.zoomControl.getContainer()?.querySelector(".leaflet-control-zoom-in")?.setAttribute("aria-label", "Приблизить карту");
      map.zoomControl.getContainer()?.querySelector(".leaflet-control-zoom-out")?.setAttribute("aria-label", "Отдалить карту");

      resize = new ResizeObserver(() => map?.invalidateSize());
      resize.observe(container.current);
    }

    initialize().catch(() => {
      if (!disposed) setFailed(true);
    });

    return () => {
      disposed = true;
      resize?.disconnect();
      map?.remove();
    };
  }, []);

  return (
    <div className={cn("location-map relative isolate z-0 aspect-square overflow-hidden rounded-[24px] border border-graphite-700 bg-graphite-800 sm:aspect-[4/3]", className)}>
      <div ref={container} aria-label={`Карта — ${site.address}`} className="absolute inset-0" />
      {failed && (
        <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-[1000] grid place-items-center bg-graphite-800 p-6 text-chalk underline">
          Открыть адрес в Яндекс Картах
        </a>
      )}
    </div>
  );
}
