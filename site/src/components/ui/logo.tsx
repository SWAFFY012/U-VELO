import Image from "next/image";
import { cn } from "@/lib/cn";

/** Объёмный логотип «Ю-Вело» (файл заказчика). Высоту задаёт `className`. */
export function Logo({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <Image
      src="/logo-360.png"
      alt="Ю-Вело"
      width={360}
      height={260}
      sizes="140px"
      loading={eager ? "eager" : "lazy"}
      className={cn("h-[4.5rem] w-auto select-none", className)}
      draggable={false}
    />
  );
}
