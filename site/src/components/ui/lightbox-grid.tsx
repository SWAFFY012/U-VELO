/*
MIT License

Copyright (c) 2025 kokonutUI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
"use client";

/**
 * Галерея с лайтбоксом: миниатюра «вырастает» в полноэкранный просмотр и
 * возвращается на место. Листание стрелками и свайпом, закрытие — Esc или
 * смахивание вниз.
 *
 * Основа: 21st.dev, «Kokonut UI Lightbox Grid» (@dorianbaffier, kokonutui.com).
 * Адаптировано под Ю-Вело: русские подписи, настраиваемая сетка, токены бренда.
 */
import {
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import Image from "next/image";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export interface LightboxImage {
  src: string;
  alt: string;
  /** Натуральный размер: нужен, чтобы вписать фото в экран без ожидания загрузки. */
  width: number;
  height: number;
  caption?: string;
}

export interface LightboxGridProps {
  images: LightboxImage[];
  className?: string;
  /** Классы сетки миниатюр. По умолчанию 2 колонки на мобильном, 4 на десктопе. */
  gridClassName?: string;
  /** Первая миниатюра крупная (2×2). */
  featureFirst?: boolean;
  /** Атрибут sizes для миниатюр. */
  sizes?: string;
  /** Классы пропорций миниатюры. */
  thumbClassName?: string;
  /** Горизонтальная карусель вместо сетки. */
  carousel?: boolean;
}

const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];
const OPEN = { type: "spring", duration: 0.5, bounce: 0.12 } as const;
const CLOSE = { type: "spring", duration: 0.42, bounce: 0.08 } as const;
const SETTLE = { type: "spring", duration: 0.35, bounce: 0.2 } as const;
const MARGIN = 48;
const MARGIN_SMALL = 12;
const CAPTION_ROOM = 56;
const OPEN_RADIUS = 6;
const DISMISS_DISTANCE = 110;
const DISMISS_SPEED = 0.55;
const SWIPE_SPEED = 0.45;
const AXIS_LOCK = 6;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Frame {
  x: number;
  y: number;
  scale: number;
  clip: string;
}

function fitRect(image: LightboxImage): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = vw < 640 ? MARGIN_SMALL : MARGIN;
  const maxW = vw - margin * 2;
  const maxH = vh - margin * 2 - CAPTION_ROOM;
  const scale = Math.min(maxW / image.width, maxH / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  return {
    left: (vw - width) / 2,
    top: (vh - CAPTION_ROOM - height) / 2,
    width,
    height,
  };
}

const openClip = () => `inset(0px 0px 0px 0px round ${OPEN_RADIUS}px)`;

function thumbFrame(open: Rect, thumb: DOMRect, image: LightboxImage, radius: number): Frame {
  const imageRatio = image.width / image.height;
  const thumbRatio = thumb.width / thumb.height;
  const coverWidth = imageRatio > thumbRatio ? thumb.height * imageRatio : thumb.width;
  const scale = coverWidth / open.width;
  const insetX = (open.width - thumb.width / scale) / 2;
  const insetY = (open.height - thumb.height / scale) / 2;
  return {
    x: thumb.left + thumb.width / 2 - (open.left + open.width / 2),
    y: thumb.top + thumb.height / 2 - (open.top + open.height / 2),
    scale,
    clip: `inset(${insetY}px ${insetX}px ${insetY}px ${insetX}px round ${radius / scale}px)`,
  };
}

function isVisible(rect: DOMRect) {
  return (
    rect.bottom > 0 &&
    rect.top < window.innerHeight &&
    rect.right > 0 &&
    rect.left < window.innerWidth
  );
}

function IconButton({
  label,
  onClick,
  className,
  children,
  buttonRef,
  disabled,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
  buttonRef?: Ref<HTMLButtonElement>;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      className={cn(
        "flex size-11 items-center justify-center rounded-full bg-chalk/10 text-chalk transition-colors duration-150 hover:bg-chalk/20 disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
      onClick={onClick}
      ref={buttonRef}
      type="button"
    >
      {children}
    </button>
  );
}

function Chevron({ flip }: { flip?: boolean }) {
  return (
    <svg aria-hidden="true" className={cn("size-4", flip && "rotate-180")} fill="none" viewBox="0 0 16 16">
      <path
        d="m6 3.5 4.5 4.5L6 12.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

interface ViewerProps {
  images: LightboxImage[];
  index: number;
  rect: Rect;
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  clip: MotionValue<string>;
  alpha: MotionValue<number>;
  fade: MotionValue<number>;
  settled: boolean;
  onClose: (velocity?: { x: number; y: number }) => void;
  onStep: (direction: 1 | -1) => void;
}

function Viewer({
  images,
  index,
  rect,
  x,
  y,
  scale,
  clip,
  alpha,
  fade,
  settled,
  onClose,
  onStep,
}: ViewerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    id: number;
    startX: number;
    startY: number;
    axis: "x" | "y" | null;
    samples: { x: number; y: number; t: number }[];
  } | null>(null);
  const backdrop = useTransform(fade, (v) => v * 0.94);
  const image = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!settled || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      axis: null,
      samples: [{ x: event.clientX, y: event.clientY, t: event.timeStamp }],
    };
  };

  const followVertical = (dx: number, dy: number) => {
    const pull = Math.min(Math.abs(dy) / window.innerHeight, 1);
    x.set(dx);
    y.set(dy);
    scale.set(1 - pull * 0.45);
    fade.set(1 - Math.min(Math.abs(dy) / 360, 1) * 0.85);
  };

  const followHorizontal = (dx: number) => {
    const blocked = (dx > 0 && !hasPrev) || (dx < 0 && !hasNext);
    x.set(blocked ? dx * 0.25 : dx);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const dx = event.clientX - d.startX;
    const dy = event.clientY - d.startY;
    if (!d.axis) {
      if (Math.hypot(dx, dy) < AXIS_LOCK) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    d.samples.push({ x: event.clientX, y: event.clientY, t: event.timeStamp });
    if (d.samples.length > 5) d.samples.shift();
    if (d.axis === "y") followVertical(dx, dy);
    else followHorizontal(dx);
  };

  const releaseVertical = (dy: number, velocity: { x: number; y: number }) => {
    if (Math.abs(dy) > DISMISS_DISTANCE || Math.abs(velocity.y) > DISMISS_SPEED) {
      onClose(velocity);
      return;
    }
    animate(x, 0, SETTLE);
    animate(y, 0, SETTLE);
    animate(scale, 1, SETTLE);
    animate(fade, 1, { duration: 0.2, ease: EASE });
  };

  const releaseHorizontal = (dx: number, vx: number) => {
    const far = Math.abs(dx) > rect.width * 0.22 || Math.abs(vx) > SWIPE_SPEED;
    if (far && dx < 0 && hasNext) onStep(1);
    else if (far && dx > 0 && hasPrev) onStep(-1);
    else animate(x, 0, SETTLE);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    const first = d.samples[0];
    const last = d.samples.at(-1) ?? first;
    const dt = Math.max(1, last.t - first.t);
    const velocity = { x: (last.x - first.x) / dt, y: (last.y - first.y) / dt };
    if (d.axis === "y") releaseVertical(event.clientY - d.startY, velocity);
    else if (d.axis === "x") releaseHorizontal(event.clientX - d.startX, velocity.x);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    } else if (event.key === "ArrowRight" && hasNext) {
      onStep(1);
    } else if (event.key === "ArrowLeft" && hasPrev) {
      onStep(-1);
    } else if (event.key === "Tab") {
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  return (
    <div
      aria-label={image.caption ?? image.alt}
      aria-modal="true"
      className="fixed inset-0 z-[100]"
      onKeyDown={handleKeyDown}
      ref={dialogRef}
      role="dialog"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-graphite-950"
        onClick={() => onClose()}
        style={{ opacity: backdrop }}
      />

      <motion.div
        className="absolute cursor-grab touch-none select-none overflow-hidden active:cursor-grabbing"
        onLostPointerCapture={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          x,
          y,
          scale,
          clipPath: clip,
          opacity: alpha,
          willChange: "transform, clip-path",
        }}
      >
        <Image
          alt={image.alt}
          className="pointer-events-none h-full w-full object-cover"
          draggable={false}
          height={image.height}
          src={image.src}
          sizes="100vw"
          width={image.width}
        />
      </motion.div>

      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: fade }}>
        <div className="pointer-events-auto absolute top-3 right-3 flex items-center gap-3 sm:top-4 sm:right-4">
          <span className="nums text-sm text-chalk/70">
            {index + 1} / {images.length}
          </span>
          <IconButton buttonRef={closeRef} label="Закрыть просмотр" onClick={() => onClose()}>
            <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 16 16">
              <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
            </svg>
          </IconButton>
        </div>
        <IconButton
          className="pointer-events-auto absolute top-1/2 left-4 hidden -translate-y-1/2 sm:flex"
          disabled={!hasPrev}
          label="Предыдущее фото"
          onClick={() => hasPrev && onStep(-1)}
        >
          <Chevron flip />
        </IconButton>
        <IconButton
          className="pointer-events-auto absolute top-1/2 right-4 hidden -translate-y-1/2 sm:flex"
          disabled={!hasNext}
          label="Следующее фото"
          onClick={() => hasNext && onStep(1)}
        >
          <Chevron />
        </IconButton>
        <p
          className="absolute inset-x-4 text-center text-sm text-chalk/80"
          style={{ top: rect.top + rect.height + 18 }}
        >
          {image.caption ?? image.alt}
        </p>
      </motion.div>
    </div>
  );
}

export function LightboxGrid({
  images,
  className,
  gridClassName = "grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4",
  featureFirst = true,
  sizes = "(max-width: 768px) 50vw, 25vw",
  thumbClassName = "aspect-[4/3]",
  carousel = false,
}: LightboxGridProps) {
  const track = useRef<HTMLUListElement>(null);
  const slide = (direction: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };
  const [active, setActive] = useState<number | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [settled, setSettled] = useState(false);
  const [closing, setClosing] = useState(false);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const clip = useMotionValue(openClip());
  const alpha = useMotionValue(1);
  const fade = useMotionValue(0);

  const frameFor = useCallback(
    (index: number, open: Rect): Frame | null => {
      const thumb = thumbs.current[index];
      if (!thumb) return null;
      const box = thumb.getBoundingClientRect();
      if (!isVisible(box)) return null;
      const radius = Number.parseFloat(getComputedStyle(thumb).borderTopLeftRadius) || 0;
      return thumbFrame(open, box, images[index], radius);
    },
    [images],
  );

  const open = useCallback(
    (index: number) => {
      const target = fitRect(images[index]);
      const from = frameFor(index, target);
      setActive(index);
      setRect(target);
      setClosing(false);
      setSettled(false);
      alpha.set(1);
      if (!from || reduceMotion) {
        x.set(0);
        y.set(0);
        scale.set(1);
        clip.set(openClip());
        fade.set(0);
        alpha.set(0);
        animate(alpha, 1, { duration: 0.18 });
        animate(fade, 1, { duration: 0.18 }).then(() => setSettled(true));
        return;
      }
      x.set(from.x);
      y.set(from.y);
      scale.set(from.scale);
      clip.set(from.clip);
      fade.set(0);
      animate(x, 0, OPEN);
      animate(y, 0, OPEN);
      animate(scale, 1, OPEN);
      animate(clip, openClip(), OPEN);
      animate(fade, 1, { duration: 0.3, ease: EASE }).then(() => setSettled(true));
    },
    [alpha, clip, fade, frameFor, images, reduceMotion, scale, x, y],
  );

  const close = useCallback(
    (velocity?: { x: number; y: number }) => {
      if (active === null || !rect || closing) return;
      setClosing(true);
      const index = active;
      thumbs.current[index]?.scrollIntoView({
        behavior: "instant",
        block: "nearest",
        inline: "nearest",
      });
      const to = frameFor(index, rect);
      const finish = () => {
        setActive(null);
        setRect(null);
        setClosing(false);
        thumbs.current[index]?.focus({ preventScroll: true });
      };
      if (!to || reduceMotion) {
        animate(alpha, 0, { duration: 0.16 });
        animate(fade, 0, { duration: 0.16 }).then(finish);
        return;
      }
      const vx = (velocity?.x ?? 0) * 1000;
      const vy = (velocity?.y ?? 0) * 1000;
      animate(x, to.x, { ...CLOSE, velocity: vx });
      animate(y, to.y, { ...CLOSE, velocity: vy });
      animate(scale, to.scale, CLOSE);
      animate(clip, to.clip, CLOSE);
      animate(fade, 0, { duration: 0.28, ease: EASE });
      window.setTimeout(finish, 420);
    },
    [active, alpha, clip, closing, fade, frameFor, rect, reduceMotion, scale, x, y],
  );

  const step = useCallback(
    (direction: 1 | -1) => {
      if (active === null) return;
      const next = active + direction;
      if (next < 0 || next >= images.length) return;
      setActive(next);
      setRect(fitRect(images[next]));
      y.set(0);
      scale.set(1);
      clip.set(openClip());
      fade.set(1);
      if (reduceMotion) {
        x.set(0);
        alpha.set(1);
        return;
      }
      x.set(direction * 72);
      alpha.set(0);
      animate(x, 0, { duration: 0.32, ease: EASE });
      animate(alpha, 1, { duration: 0.22, ease: EASE });
    },
    [active, alpha, clip, fade, images, reduceMotion, scale, x, y],
  );

  useEffect(() => {
    if (active === null) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onResize = () => setRect(fitRect(images[active]));
    window.addEventListener("resize", onResize);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("resize", onResize);
    };
  }, [active, images]);

  return (
    <div className={cn("w-full", className)}>
      {carousel ? (
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[0.9375rem] text-ash">Листайте в сторону, нажмите на фото, чтобы открыть</p>
          <div className="hidden gap-2 sm:flex">
            <IconButton className="bg-graphite-800 hover:bg-graphite-700" label="Назад" onClick={() => slide(-1)}>
              <Chevron flip />
            </IconButton>
            <IconButton className="bg-graphite-800 hover:bg-graphite-700" label="Вперёд" onClick={() => slide(1)}>
              <Chevron />
            </IconButton>
          </div>
        </div>
      ) : null}
      <ul
        ref={track}
        className={
          carousel
            ? "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-2 [perspective:1400px] sm:-mx-8 sm:gap-5 sm:px-8"
            : gridClassName
        }
      >
        {images.map((image, index) => (
          <motion.li
            className={cn(
              carousel
                ? "w-[78%] shrink-0 snap-center sm:w-[46%] lg:w-[31%]"
                : featureFirst && index === 0 && "col-span-2 row-span-2",
            )}
            key={image.src}
            // Как на trionn.com: карточка выходит из наклона и глубины, проявляясь по очереди.
            initial={
              carousel
                ? { opacity: 0, y: 90, rotateY: -32, rotateZ: -5, scale: 0.86 }
                : { clipPath: "inset(100% 0% 0% 0%)", y: 28 }
            }
            whileInView={
              carousel
                ? { opacity: 1, y: 0, rotateY: 0, rotateZ: 0, scale: 1 }
                : { clipPath: "inset(0% 0% 0% 0%)", y: 0 }
            }
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: carousel ? 1.1 : 0.95, delay: Math.min(index, 4) * (carousel ? 0.14 : 0.09), ease: EASE }}
          >
            <button
              aria-label={`Открыть фото: ${image.alt}`}
              className={cn(
                "group relative block h-full w-full overflow-hidden rounded-[4px] bg-graphite-800",
                carousel
                  ? "aspect-[4/5]"
                  : featureFirst && index === 0
                    ? "aspect-[4/3] md:aspect-auto"
                    : thumbClassName,
              )}
              onClick={() => open(index)}
              ref={(node) => {
                thumbs.current[index] = node;
              }}
              style={{ opacity: active === index ? 0 : 1 }}
              type="button"
            >
              <Image
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
                draggable={false}
                fill
                sizes={
                  carousel
                    ? "(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 31vw"
                    : featureFirst && index === 0
                      ? "(max-width: 768px) 100vw, 50vw"
                      : sizes
                }
                src={image.src}
              />
              {carousel && image.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-graphite-950/85 to-transparent px-4 pt-10 pb-4 text-left font-display text-sm font-medium text-chalk">
                  {image.caption}
                </span>
              ) : null}
            </button>
          </motion.li>
        ))}
      </ul>
      {active !== null && rect
        ? createPortal(
            <Viewer
              alpha={alpha}
              clip={clip}
              fade={fade}
              images={images}
              index={active}
              onClose={close}
              onStep={step}
              rect={rect}
              scale={scale}
              settled={settled && !closing}
              x={x}
              y={y}
            />,
            document.body,
          )
        : null}
    </div>
  );
}
