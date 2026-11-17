import { bikeSpecRows, type Bike } from "@/data/bikes";
import { cn } from "@/lib/cn";

/** Характеристики модели: список «название — значение» с тонкими разделителями. */
export function SpecList({ bike, className }: { bike: Bike; className?: string }) {
  const rows = bikeSpecRows(bike);

  return (
    <dl className={cn("divide-y divide-graphite-700 border-y border-graphite-700", className)}>
      {rows.map((row) => (
        <div key={row.label} className="flex items-baseline justify-between gap-6 py-3">
          <dt className="text-[0.9375rem] text-silver">{row.label}</dt>
          <dd className="nums text-right text-[0.9375rem] font-medium whitespace-nowrap text-chalk sm:text-base">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
