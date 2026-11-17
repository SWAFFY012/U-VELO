"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];
const MONTHS_GEN = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];
const WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const iso = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function label(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return `${d} ${MONTHS_GEN[m - 1]} ${y}`;
}

/**
 * Календарь в стеклянной панели. Сегодняшняя дата считается только в браузере
 * в момент открытия (не во время рендера), прошедшие дни недоступны.
 */
export function GlassDatePicker({
  id,
  name,
  value,
  onChange,
  invalid,
  describedBy,
}: {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");
  const [view, setView] = useState({ y: 2026, m: 0 });
  const [dir, setDir] = useState(1);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      const now = new Date();
      setToday(iso(now.getFullYear(), now.getMonth(), now.getDate()));
      const base = value ? value.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
      setView({ y: base[0], m: base[1] - 1 });
    }
    setOpen(!open);
  };

  const shift = (d: number) => {
    setDir(d);
    setView(({ y, m }) => {
      const t = m + d;
      return { y: y + Math.floor(t / 12), m: (t + 12) % 12 };
    });
  };

  const first = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const days = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const canBack = today !== "" && iso(view.y, view.m, 1) > today.slice(0, 8) + "01";

  return (
    <div ref={root} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy}
        onClick={toggle}
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-3 rounded-[10px] border bg-chalk/[0.06] px-5 text-left text-lg transition-colors duration-150",
          open ? "border-copper" : invalid ? "border-danger" : "border-chalk/15 hover:border-chalk/40",
          value ? "text-chalk" : "text-ash",
        )}
      >
        <span className="nums">{value ? label(value) : "Выбрать дату"}</span>
        <CalendarDays aria-hidden="true" strokeWidth={1.75} className="size-5 text-copper" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Выбор даты"
            initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="absolute top-full left-0 z-40 mt-3 w-full origin-top overflow-hidden rounded-[18px] border border-chalk/20 bg-[linear-gradient(145deg,rgb(46_44_42/0.97),rgb(18_17_16/0.97))] p-4 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8),inset_0_1px_0_rgb(242_239_234/0.18)] backdrop-blur-2xl backdrop-saturate-150 sm:max-w-[26rem] sm:p-5"
          >
            {/* Блик «закалённого стекла» */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-1/2 -left-1/4 h-full w-[150%] rotate-[-8deg] bg-gradient-to-b from-chalk/[0.12] to-transparent"
            />
            <div className="relative flex items-center justify-between">
              <button
                type="button"
                aria-label="Предыдущий месяц"
                disabled={!canBack}
                onClick={() => shift(-1)}
                className="flex size-11 items-center justify-center rounded-full text-chalk transition-colors hover:bg-chalk/10 disabled:opacity-25"
              >
                <ChevronLeft aria-hidden="true" strokeWidth={1.75} />
              </button>
              <p className="font-display text-base font-semibold">
                {MONTHS[view.m]} <span className="nums text-ash">{view.y}</span>
              </p>
              <button
                type="button"
                aria-label="Следующий месяц"
                onClick={() => shift(1)}
                className="flex size-11 items-center justify-center rounded-full text-chalk transition-colors hover:bg-chalk/10"
              >
                <ChevronRight aria-hidden="true" strokeWidth={1.75} />
              </button>
            </div>

            <div className="relative mt-3 grid grid-cols-7 text-center text-xs text-ash">
              {WEEK.map((w) => (
                <span key={w} className="py-1">
                  {w}
                </span>
              ))}
            </div>

            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div
                key={`${view.y}-${view.m}`}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                className="relative mt-1 grid grid-cols-7 gap-1"
              >
                {cells.map((d, i) => {
                  if (d === null) return <span key={`e${i}`} />;
                  const day = iso(view.y, view.m, d);
                  const past = day < today;
                  const selected = day === value;
                  const isToday = day === today;
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={past}
                      aria-pressed={selected}
                      aria-label={label(day)}
                      onClick={() => {
                        onChange(day);
                        setOpen(false);
                      }}
                      className={cn(
                        "nums relative flex aspect-square min-h-10 items-center justify-center rounded-[10px] text-base transition-all duration-150",
                        selected
                          ? "bg-copper font-semibold text-graphite-900 shadow-[0_0_18px_rgb(255_138_46/0.55)]"
                          : "text-chalk hover:bg-chalk/12",
                        isToday && !selected && "ring-1 ring-amber/70",
                        past && "pointer-events-none text-ash/40",
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
