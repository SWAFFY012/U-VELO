"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { nav, site } from "@/lib/site";
import { ButtonLink } from "./ui/button";
import { LedLine } from "./ui/led-line";
import { Logo } from "./ui/logo";
import { scrollToTop } from "./smooth-scroll";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const solid = scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-200",
        solid ? "bg-graphite-900" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[5.5rem] w-full max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label={`${site.name} — на главную`} className="shrink-0"
          onClick={(e) => {
            close();
            if (pathname === "/") {
              e.preventDefault();
              scrollToTop();
            }
          }}
        >
          <Logo eager />
        </Link>

        <nav aria-label="Основное меню" className="hidden flex-1 px-6 xl:block 2xl:px-12">
          <ul className="flex items-center justify-evenly">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center px-3.5 text-[0.9375rem] font-medium whitespace-nowrap transition-colors duration-150",
                    isActive(item.href) ? "text-amber" : "text-silver hover:text-chalk",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={site.phoneHref}
            className="nums hidden min-h-11 items-center gap-2 px-2 text-[0.9375rem] font-semibold whitespace-nowrap text-chalk transition-colors duration-150 hover:text-amber md:flex"
          >
            <Phone aria-hidden="true" strokeWidth={1.75} className="size-4 text-copper" />
            {site.phone}
          </a>
          <ButtonLink href="/kontakty" className="hidden sm:inline-flex">
            Связаться с нами
          </ButtonLink>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-[6px] text-chalk transition-colors duration-150 hover:text-amber xl:hidden"
          >
            {open ? (
              <X aria-hidden="true" strokeWidth={1.75} className="size-6" />
            ) : (
              <Menu aria-hidden="true" strokeWidth={1.75} className="size-6" />
            )}
          </button>
        </div>
      </div>

      <LedLine
        full
        className={cn("transition-opacity duration-200", solid ? "opacity-100" : "opacity-0")}
      />

      {open ? (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 top-[calc(5.5rem+1px)] bottom-0 overflow-y-auto bg-graphite-900 xl:hidden"
        >
          <nav aria-label="Мобильное меню" className="px-5 pt-4 pb-10 sm:px-8">
            <ul className="divide-y divide-graphite-700 border-b border-graphite-700">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "flex min-h-16 items-center font-display text-xl font-medium tracking-[-0.02em]",
                      isActive(item.href) ? "text-amber" : "text-chalk",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink href="/kontakty" size="lg" onClick={close}>
                Связаться с нами
              </ButtonLink>
              <ButtonLink href={site.phoneHref} variant="secondary" size="lg" className="nums">
                <Phone aria-hidden="true" strokeWidth={1.75} className="size-4" />
                {site.phone}
              </ButtonLink>
              <p className="mt-3 text-[0.9375rem] text-ash">{site.hours}</p>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
