"use client";

import { usePathname } from "next/navigation";
import { AnimatedTabs, type TabItem } from "@/components/ui/animated-tabs";

const tabs: TabItem[] = [
  { id: "arenda", label: "Аренда", href: "/uslugi/arenda" },
  { id: "pokupka", label: "Покупка", href: "/uslugi/pokupka" },
  { id: "remont", label: "Ремонт", href: "/uslugi/remont" },
];

/**
 * Вкладки раздела «Услуги». Живут в общем layout, поэтому при переходе между
 * страницами не перемонтируются, и световой индикатор переезжает на новую вкладку.
 */
export function ServiceTabs() {
  const pathname = usePathname();
  const active =
    tabs.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))?.id ?? "arenda";

  return (
    // Запас на узких экранах: вкладки прокручиваются внутри блока, страница не расползается.
    // Отступы оставляют место для свечения индикатора и рамки фокуса.
    <div className="-mx-1 overflow-x-auto px-1 pt-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <AnimatedTabs
        tabs={tabs}
        activeTab={active}
        layoutId="service-tabs"
        label="Услуги"
        className="w-max min-w-full"
      />
    </div>
  );
}
