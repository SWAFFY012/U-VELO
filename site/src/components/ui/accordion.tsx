"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  q: string;
  a: string;
}

/** Аккордеон для FAQ: открыт один пункт, управляется с клавиатуры. */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const uid = useId();

  return (
    <ul className={cn("divide-y divide-graphite-700 border-y border-graphite-700", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${uid}-panel-${i}`;
        const buttonId = `${uid}-button-${i}`;
        return (
          <li key={item.q}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span
                  className={cn(
                    "text-[1.0625rem] font-medium transition-colors duration-150 sm:text-lg",
                    isOpen ? "text-amber" : "text-chalk group-hover:text-amber",
                  )}
                >
                  {item.q}
                </span>
                <Plus
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className={cn(
                    "size-5 shrink-0 text-copper transition-transform duration-200 ease-out",
                    isOpen && "rotate-45",
                  )}
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[68ch] pb-6 text-silver">{item.a}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
