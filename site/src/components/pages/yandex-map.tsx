"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

interface YandexMapInstance {
  geoObjects: { add(marker: unknown): void };
  behaviors: { disable(behavior: string): void };
  destroy(): void;
}

interface YandexMapsApi {
  ready(callback: () => void): void;
  Map: new (container: HTMLElement, state: object, options: object) => YandexMapInstance;
  Placemark: new (coordinates: number[], properties: object, options: object) => unknown;
}

const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

export function LocationMap({ className }: { className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    let map: YandexMapInstance | undefined;
    const api = (window as Window & { ymaps?: YandexMapsApi }).ymaps;
    if (!api) return;

    api.ready(() => {
      if (disposed || !container.current) return;
      const position = [59.836016, 30.107619];
      map = new api.Map(container.current, {
        center: position,
        zoom: 17,
        controls: ["zoomControl"],
      }, { suppressMapOpenBlock: true });
      map.behaviors.disable("scrollZoom");
      map.geoObjects.add(new api.Placemark(position, {
        hintContent: site.name,
        balloonContentHeader: site.name,
        balloonContentBody: site.address,
      }, { preset: "islands#redDotIcon" }));
    });

    return () => {
      disposed = true;
      map?.destroy();
    };
  }, [ready]);

  return (
    <div className={cn("relative isolate z-0 aspect-square overflow-hidden rounded-[24px] border border-graphite-700 bg-graphite-800 sm:aspect-[4/3]", className)}>
      {apiKey && (
        <Script
          id="yandex-maps-api"
          src={`https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${encodeURIComponent(apiKey)}`}
          strategy="afterInteractive"
          onReady={() => setReady(true)}
          onError={() => setFailed(true)}
        />
      )}
      <div ref={container} aria-label={`Яндекс Карта — ${site.address}`} className="absolute inset-0" />
      {(!apiKey || failed) && (
        <a href={site.mapsHref} target="_blank" rel="noopener noreferrer" className="absolute inset-0 grid content-center justify-items-center gap-4 bg-graphite-800 p-8 text-center text-chalk">
          <span className="text-xl font-semibold">{site.address}</span>
          <span className="underline underline-offset-4">Открыть в Яндекс Картах</span>
        </a>
      )}
    </div>
  );
}
