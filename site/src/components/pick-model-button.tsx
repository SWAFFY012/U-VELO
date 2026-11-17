"use client";

import { selectLeadModel } from "@/lib/lead-events";
import { Button } from "./ui/button";

/**
 * Кнопка в карточке модели: подставляет модель в форму заявки на этой же
 * странице и прокручивает к ней (форма должна лежать в блоке с id="zayavka").
 */
export function PickModelButton({
  model,
  children,
  variant = "primary",
  className,
}: {
  model: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        selectLeadModel(model);
        const target = document.getElementById("zayavka");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }}
    >
      {children}
    </Button>
  );
}
