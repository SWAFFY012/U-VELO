import { cn } from "@/lib/cn";

/**
 * Фирменный приём 1: световая линия, как LED-подсветка стойки ресепшен.
 * По умолчанию короткая отметка начала секции; `full` — на всю ширину.
 */
export function LedLine({ full, className }: { full?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block h-px bg-gradient-to-r from-amber via-copper to-copper/0",
        "shadow-[0_0_14px_1px_rgb(255_138_46_/_0.55)]",
        full ? "w-full" : "w-24",
        className,
      )}
    />
  );
}
