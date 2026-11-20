import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const widgetSrc = "https://www.openstreetmap.org/export/embed.html?bbox=30.102119%2C59.833516%2C30.113119%2C59.838516&layer=mapnik&marker=59.836016%2C30.107619";
export const yandexMapsHref = site.mapsHref;

/**
 * Карта OpenStreetMap с меткой адреса. Контейнер с фиксированными пропорциями,
 * чтобы страница не прыгала, пока виджет загружается.
 */
export function LocationMap({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-[4px] border border-graphite-700 bg-graphite-800 sm:aspect-[4/3]",
        className,
      )}
    >
      <iframe
        src={widgetSrc}
        title={`${site.name} на карте OpenStreetMap: ${site.address}`}
        loading="lazy"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
