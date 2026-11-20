import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const query = encodeURIComponent(site.address);
const widgetSrc = `https://yandex.ru/map-widget/v1/?text=${query}&ll=30.107619%2C59.836016&pt=30.107619%2C59.836016%2Cpm2rdm&z=17`;
export const yandexMapsHref = site.mapsHref;

/**
 * Интерактивная Яндекс Карта. Контейнер с фиксированными пропорциями,
 * чтобы страница не прыгала, пока виджет загружается.
 */
export function YandexMap({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-[4px] border border-graphite-700 bg-graphite-800 sm:aspect-[4/3]",
        className,
      )}
    >
      <iframe
        src={widgetSrc}
        title={`${site.name} на Яндекс Картах: ${site.address}`}
        loading="lazy"
        allowFullScreen
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}
