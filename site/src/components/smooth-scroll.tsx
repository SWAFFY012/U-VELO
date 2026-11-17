"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Плавная инерционная прокрутка всего сайта (Lenis). Отключается при «уменьшить движение». */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      // Чем меньше lerp, тем длиннее и мягче «докат» после прокрутки.
      lerp: 0.06,
      wheelMultiplier: 0.9,
      anchors: true,
      // Сам останавливается, когда страница заблокирована (лайтбокс, мобильное меню).
      autoToggle: true,
    });
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
    };
  }, []);
  return null;
}

/** Плавно вернуться к первому экрану (hero). */
export function scrollToTop() {
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(0, { duration: 1.4 });
  else window.scrollTo({ top: 0, behavior: "smooth" });
}
