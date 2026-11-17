import type { RepairGroup } from "@/data/repair";
import { formatPrice } from "@/lib/format";

/**
 * Прайс одной группы работ. Настоящая таблица с фиксированными колонками цены и срока:
 * колонки совпадают во всех группах, а на узком экране название услуги переносится
 * по строкам и таблица не вылезает за край.
 */
export function RepairTable({ group }: { group: RepairGroup }) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-[0.9375rem] sm:text-base">
      <caption className="sr-only">{group.title}: услуги, цены и сроки</caption>
      <colgroup>
        <col />
        <col className="w-[6.25rem] sm:w-36" />
        <col className="w-24 sm:w-36" />
      </colgroup>
      <thead>
        <tr className="border-b border-graphite-700 text-sm text-ash">
          <th scope="col" className="py-3 pr-3 font-medium">
            Услуга
          </th>
          <th scope="col" className="py-3 text-right font-medium">
            Цена
          </th>
          <th scope="col" className="py-3 pl-4 font-medium sm:pl-10">
            Срок
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-graphite-700 border-b border-graphite-700">
        {group.items.map((item) => (
          <tr key={item.name}>
            <th scope="row" className="py-4 pr-3 align-top font-normal break-words hyphens-auto text-chalk">
              {item.name}
            </th>
            <td className="nums py-4 text-right align-top font-medium whitespace-nowrap text-chalk">
              от&nbsp;{formatPrice(item.priceFrom)}
            </td>
            <td className="py-4 pl-4 align-top whitespace-nowrap text-silver sm:pl-10">{item.term}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
