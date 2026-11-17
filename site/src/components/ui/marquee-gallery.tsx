"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BikePhoto } from "@/data/bikes";

const SPEED = 38; // px в секунду

/**
 * Лента фото: едет сама, её можно листать пальцем, колесом или тащить мышью.
 * Наведение и касание показывают название, не останавливая автодвижение.
 */
function Row({
  photos,
  reverse,
  onOpen,
}: {
  photos: { photo: BikePhoto; index: number }[];
  reverse?: boolean;
  onOpen: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const pointerType = useRef("mouse");
  const [selected, setSelected] = useState<number | null>(null);
  // Каждая половина длиннее широкого экрана: петля не упирается в конец scrollLeft.
  const repeats = Math.max(1, Math.ceil(12 / Math.max(photos.length, 1)));
  const cycleLength = photos.length * repeats;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let pos = 0;
    let lastWritten = 0;
    let last = performance.now();
    let frame = 0;
    let ready = false;

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const first = el.children[0] as HTMLElement | undefined;
      const duplicate = el.children[cycleLength] as HTMLElement | undefined;
      // Расстояние между одинаковыми кадрами учитывает межкарточный зазор.
      const cycle = first && duplicate ? duplicate.offsetLeft - first.offsetLeft : 0;
      if (cycle > 0) {
        if (!ready) {
          pos = reverse ? cycle : 0;
          ready = true;
        } else if (Math.abs(el.scrollLeft - lastWritten) > 1.5 || drag.current.down) {
          pos = el.scrollLeft;
        }
        if (!drag.current.down && !still) pos += (reverse ? -1 : 1) * SPEED * dt;
        pos = ((pos % cycle) + cycle) % cycle;
        el.scrollLeft = pos;
        lastWritten = el.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reverse, cycleLength]);

  const items = Array.from({ length: repeats * 2 }, () => photos).flat();

  return (
    <motion.div
      initial={{ opacity: 0, x: reverse ? -140 : 140 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: [0.23, 1, 0.32, 1], delay: reverse ? 0.15 : 0 }}
    >
      <div
        ref={ref}
        className="no-scrollbar flex cursor-grab gap-3 overflow-x-auto select-none active:cursor-grabbing sm:gap-5"
        onPointerDown={(e) => {
          pointerType.current = e.pointerType;
          drag.current = { down: e.pointerType === "mouse", x: e.clientX, left: ref.current!.scrollLeft, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          const dx = e.clientX - d.x;
          if (e.buttons && Math.abs(dx) > 5) d.moved = true;
          if (d.down) ref.current!.scrollLeft = d.left - dx;
        }}
        onPointerUp={() => (drag.current.down = false)}
        onPointerLeave={() => (drag.current.down = false)}
        onPointerCancel={() => { drag.current.down = false; drag.current.moved = true; }}
      >
        {items.map(({ photo, index }, k) => {
          const copy = k >= photos.length;
          return (
            <button
              key={k}
              type="button"
              tabIndex={copy ? -1 : 0}
              aria-hidden={copy || undefined}
              aria-label={photo.caption ?? photo.alt}
              data-selected={selected === index || undefined}
              onClick={() => {
                if (drag.current.moved) return;
                if (pointerType.current !== "mouse") {
                  setSelected((value) => value === index ? null : index);
                } else {
                  onOpen(index);
                }
              }}
              className="gallery-photo-card group relative h-[clamp(7.5rem,18svh,10.5rem)] shrink-0 overflow-hidden rounded-[10px] bg-graphite-800 sm:h-[clamp(12rem,30svh,19rem)]"
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            >
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 640px) 420px, 230px"
                draggable={false}
                className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {photo.caption ? (
                <span className="gallery-photo-caption absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pt-9 pb-3 text-left text-chalk sm:px-4 sm:pb-4">
                  <span className="block text-base leading-tight font-bold sm:text-lg">{photo.caption}</span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

export function MarqueeGallery({ photos }: { photos: BikePhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const indexed = photos.map((photo, index) => ({ photo, index }));
  const mid = Math.ceil(indexed.length / 2);

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, step]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <div className="flex flex-col gap-3 sm:hidden">
        {[0, 1, 2].map((row) => {
          const rowPhotos = indexed.filter((_, i) => i % 3 === row);
          return rowPhotos.length ? (
            <Row key={row} photos={rowPhotos} reverse={row === 1} onOpen={setOpen} />
          ) : null;
        })}
      </div>
      <div className="hidden flex-col gap-5 sm:flex">
        <Row photos={indexed.slice(0, mid)} onOpen={setOpen} />
        <Row photos={indexed.slice(mid)} reverse onOpen={setOpen} />
      </div>

      <AnimatePresence>
        {current ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-graphite-950/90 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="relative max-h-[85svh] max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt}
                width={current.width}
                height={current.height}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="max-h-[85svh] w-auto rounded-[10px] object-contain"
              />
            </motion.div>
            {[
              { d: -1, label: "Предыдущее фото", Icon: ChevronLeft, pos: "left-3 sm:left-6" },
              { d: 1, label: "Следующее фото", Icon: ChevronRight, pos: "right-3 sm:right-6" },
            ].map(({ d, label, Icon, pos }) => (
              <button
                key={d}
                type="button"
                aria-label={label}
                onClick={(e) => {
                  e.stopPropagation();
                  step(d);
                }}
                className={`absolute top-1/2 ${pos} flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-chalk/20 bg-graphite-900/70 text-chalk backdrop-blur hover:border-copper hover:text-copper`}
              >
                <Icon aria-hidden="true" strokeWidth={1.75} />
              </button>
            ))}
            <button
              type="button"
              aria-label="Закрыть"
              onClick={() => setOpen(null)}
              className="absolute top-4 right-4 flex size-12 items-center justify-center rounded-full border border-chalk/20 bg-graphite-900/70 text-chalk hover:border-copper hover:text-copper"
            >
              <X aria-hidden="true" strokeWidth={1.75} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
