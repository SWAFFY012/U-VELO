"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const SLATS = 7;
/** Время закрытия/открытия жалюзи вместе с задержками ламелей, мс. */
const COVER_MS = 620;

type Phase = "idle" | "cover" | "reveal";

/**
 * Переход между страницами «жалюзи»: по клику на внутреннюю ссылку ламели
 * закрывают экран, страница меняется, ламели открываются.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const timers = useRef<number[]>([]);

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Якорь на этой же странице — обычная прокрутка, без перехода.
      if (url.pathname === window.location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (phaseRef.current !== "idle") {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      go("cover");
      later(() => router.push(url.pathname + url.search + url.hash), COVER_MS);
      // Страховка: если страница не сменилась, жалюзи всё равно откроются.
      later(() => phaseRef.current === "cover" && go("reveal"), COVER_MS + 4000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // Новая страница на месте — открываем жалюзи.
  useEffect(() => {
    if (phaseRef.current !== "cover") return;
    const t1 = window.setTimeout(() => {
      // Ссылка «Арендовать» должна открывать именно форму, а не верх страницы.
      const anchor = window.location.hash.slice(1);
      const target = anchor ? document.getElementById(decodeURIComponent(anchor)) : null;
      if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
      else window.scrollTo(0, 0);
      go("reveal");
    }, 120);
    const t2 = window.setTimeout(() => go("idle"), 120 + COVER_MS + 80);
    timers.current.push(t1, t2);
  }, [pathname]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  return (
    <div className="blinds" data-phase={phase} aria-hidden="true">
      {Array.from({ length: SLATS }, (_, i) => (
        <span key={i} style={{ "--i": i } as React.CSSProperties} />
      ))}
    </div>
  );
}
