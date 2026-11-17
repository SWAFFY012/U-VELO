"use client";

import Image from "next/image";
import { useRef } from "react";
import { LightboxGrid } from "@/components/ui/lightbox-grid";
import type { BikePhoto } from "@/data/bikes";
import { cn } from "@/lib/cn";

/**
 * Фотографии модели: крупное главное фото со срезанным углом и лента миниатюр.
 * Любое фото открывается на весь экран. Главное фото открывает тот же просмотр,
 * что и первая миниатюра, поэтому листание начинается с первого кадра.
 */
export function BikeGallery({
  photos,
  eager,
  className,
}: {
  photos: BikePhoto[];
  /** Первая модель на странице видна сразу: её главное фото грузим без отложенной загрузки. */
  eager?: boolean;
  className?: string;
}) {
  const thumbs = useRef<HTMLDivElement>(null);
  const main = photos[0];
  if (!main) return null;

  const openFirst = () => {
    thumbs.current?.querySelector<HTMLButtonElement>("button")?.click();
  };

  return (
    <div className={cn("flex min-w-0 flex-col gap-2 sm:gap-3", className)}>
      {/* Срез лежит на внутренней обёртке, а не на кнопке: иначе clip-path обрежет рамку фокуса. */}
      <button
        type="button"
        onClick={openFirst}
        aria-label={`Открыть фото на весь экран: ${main.alt}`}
        className="group block w-full rounded-[4px]"
      >
        <span className="cut relative block aspect-[4/3] overflow-hidden rounded-[4px] bg-graphite-800 lg:[--cut:44px]">
          <Image
            src={main.src}
            alt={main.alt}
            fill
            sizes="(max-width: 1024px) 100vw, (max-width: 1320px) 52vw, 680px"
            loading={eager ? "eager" : "lazy"}
            fetchPriority={eager ? "high" : "auto"}
            draggable={false}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </span>
      </button>

      <div ref={thumbs}>
        <LightboxGrid
          images={photos}
          featureFirst={false}
          gridClassName="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3"
          sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 110px"
        />
      </div>
    </div>
  );
}
