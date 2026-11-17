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
  const tariffs = [
    { label: "1 день", price: rent.day },
    { label: "7 дней", price: rent.week },
    { label: "30 дней", price: rent.month },
  ].filter((item) => item.price !== null);
  if (!tariffs.length) {
    return <p className="text-lg font-semibold text-amber">Стоимость аренды — по запросу</p>;
  }
  return (
    <dl className="grid grid-cols-2 gap-4">
      {tariffs.map((item) => (
        <div key={item.label} className="flex min-w-0 flex-col gap-1">
          <dt className={labelClass}>{item.label}</dt>
          <dd className={cn(priceClass, "text-xl sm:text-2xl")}>{formatPrice(item.price!)}</dd>
        </div>
      ))}
    </dl>
  );
}

function BuyoutPrice({ bike }: { bike: Bike }) {
  const offer = bike.buyout;
  if (!offer) {
    return <p className="text-lg font-semibold text-amber">Условия и стоимость выкупа — по запросу</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <dt className={labelClass}>В неделю</dt>
          <dd className={cn(priceClass, "text-xl sm:text-2xl")}>{formatPrice(offer.week)}</dd>
        </div>
        <div>
          <dt className={labelClass}>Срок выкупа</dt>
          <dd className={cn(priceClass, "text-xl sm:text-2xl")}>{offer.weeks} недель</dd>
        </div>
      </dl>
      <p className="text-sm font-semibold text-amber">Без аккумулятора</p>
      <p className="text-sm text-silver">Всего по графику: {formatPrice(offer.week * offer.weeks)}. Первый платёж — при заключении договора, далее раз в неделю.</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-silver">
        {offer.requirements.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </div>
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
      {bike.photos.length ? <BikeGallery photos={bike.photos} eager={eager} /> : (
        <div className="cut flex min-h-56 flex-col justify-end gap-3 border border-graphite-600 bg-graphite-800 p-8 lg:min-h-80">
          <span className="font-display text-3xl font-semibold text-chalk">{bike.name}</span>
          <span className="text-silver">Комплектация без аккумулятора</span>
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <h2 id={headingId} className="h2">
          {bike.name}
        </h2>
        <p className="mt-3 text-[0.9375rem] text-ash">{bike.color}</p>
        <p className="mt-4 max-w-[46ch] text-silver">{bike.summary}</p>

        <SpecList bike={bike} className="mt-7" />
        {bike.specNote ? <p className="mt-3 text-sm text-ash">{bike.specNote}</p> : null}

        <div className="mt-8 flex flex-col gap-7 lg:mt-auto lg:pt-8">
          {mode === "rent" ? <RentPrices rent={bike.rent} /> : <BuyoutPrice bike={bike} />}
          <PickModelButton model={bike.name} className="min-h-13 w-full px-7 text-base sm:w-auto sm:self-start">
            {mode === "rent" ? "Арендовать" : "Оформить выкуп"}
          </PickModelButton>
        </div>
      </div>
    </article>
  );
}
