import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

const point = `${site.mapCenter.lon},${site.mapCenter.lat}`;

/** Адрес виджета Яндекс Карт (весь город, без метки). */
const widgetSrc = `https://yandex.ru/map-widget/v1/?ll=${point}&z=10`;

/** Та же точка в полной версии Яндекс Карт — на случай, если виджет не загрузился. */
export const yandexMapsHref = `https://yandex.ru/maps/?ll=${point}&z=10`;

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
