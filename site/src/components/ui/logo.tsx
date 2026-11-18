import Image from "next/image";
import { cn } from "@/lib/cn";

export const brandLogo = { src: "/yu-velo-logo.webp", width: 930, height: 274 };

export function Logo({ className, eager, decorative }: { className?: string; eager?: boolean; decorative?: boolean }) {
  return (
    <Image
      {...brandLogo}
      alt={decorative ? "" : "Ю-Вело"}
      unoptimized
      loading={eager ? "eager" : "lazy"}
      className={cn("h-auto w-40 select-none", className)}
      draggable={false}
    />
  );
}
