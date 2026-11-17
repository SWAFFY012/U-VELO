import { PickModelButton } from "@/components/pick-model-button";
import type { Bike } from "@/data/bikes";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { BikeGallery } from "./bike-gallery";
import { SpecList } from "./spec-list";

export type CatalogMode = "rent" | "buy";

const priceClass = "nums font-display font-semibold tracking-[-0.02em] whitespace-nowrap text-chalk";
const labelClass = "text-[0.9375rem] text-ash";

function RentPrices({ rent }: { rent: Bike["rent"] }) {
  return (
    <dl className="grid grid-cols-2 gap-y-4">
      <div className="flex min-w-0 flex-col gap-1 pr-4">
        <dt className={labelClass}>Неделя</dt>
        <dd className={cn(priceClass, "text-[1.375rem] sm:text-[1.75rem]")}>{formatPrice(rent.week)}</dd>
      </div>
      <div className="flex min-w-0 flex-col gap-1 border-l border-graphite-700 pl-4 sm:pl-6">
        <dt className={labelClass}>Месяц</dt>
        <dd className={cn(priceClass, "text-[1.375rem] sm:text-[1.75rem]")}>{formatPrice(rent.month)}</dd>
      </div>
      <div className="col-span-2 flex items-baseline gap-2 text-[0.9375rem]">
        <dt className="text-ash">Залог</dt>
        <dd className="nums font-medium text-chalk">{formatPrice(rent.deposit)}</dd>
      </div>
    </dl>
  );
}

function SalePrice({ sale }: { sale: Bike["sale"] }) {
  return (
    <dl className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
      <div className="flex flex-col gap-1">
        <dt className={labelClass}>Цена</dt>
        <dd className={cn(priceClass, "text-[1.625rem] sm:text-[2rem]")}>{formatPrice(sale.price)}</dd>
      </div>
      <div>
        <dt className="sr-only">Наличие</dt>
        {/* Наличие читается по тексту; точка лишь дублирует его: залитая — есть, контур — под заказ. */}
        <dd className="flex min-h-9 items-center gap-2.5 text-[0.9375rem] font-medium text-chalk">
          <span
            aria-hidden="true"
            className={cn(
              "size-2.5 shrink-0 rounded-full",
              sale.inStock ? "bg-success" : "border-2 border-amber",
            )}
          />
          {sale.inStock ? "В наличии" : (sale.note ?? "Под заказ")}
        </dd>
      </div>
    </dl>
  );
}

/** Крупная строка каталога: фото модели слева, описание, характеристики и цена справа. */
export function BikeRow({
  bike,
  mode,
  eager,
}: {
  bike: Bike;
  mode: CatalogMode;
  /** Первая строка на странице: главное фото грузится сразу. */
  eager?: boolean;
}) {
  const headingId = `model-${bike.slug}`;

  return (
    <article
      aria-labelledby={headingId}
      className="grid gap-8 rounded-[4px] border border-graphite-700 p-4 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:p-10 xl:gap-16"
    >
      <BikeGallery photos={bike.photos} eager={eager} />

      <div className="flex min-w-0 flex-col">
        <h2 id={headingId} className="h2">
          {bike.name}
        </h2>
        <p className="mt-3 text-[0.9375rem] text-ash">{bike.color}</p>
        <p className="mt-4 max-w-[46ch] text-silver">{bike.summary}</p>

        <SpecList specs={bike.specs} className="mt-7" />

        <div className="mt-8 flex flex-col gap-7 lg:mt-auto lg:pt-8">
          {mode === "rent" ? <RentPrices rent={bike.rent} /> : <SalePrice sale={bike.sale} />}
          <PickModelButton model={bike.name} className="min-h-13 w-full px-7 text-base sm:w-auto sm:self-start">
            {mode === "rent" ? "Арендовать" : "Купить"}
          </PickModelButton>
        </div>
      </div>
    </article>
  );
}
