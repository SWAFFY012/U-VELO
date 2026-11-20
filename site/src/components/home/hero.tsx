"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { LedLine } from "@/components/ui/led-line";

export interface HeroStat {
  value: string;
  label: string;
}

const ease = [0.23, 1, 0.32, 1] as const;

/** Первый экран: заголовок поднимается из маски, световая линия прочерчивается, фото проявляется. */
export function Hero({
  lead,
  stats,
  photo,
}: {
  lead: string;
  stats: HeroStat[];
  photo: { src: string; alt: string; width: number; height: number };
}) {
  // Одинаковая разметка на сервере и в браузере; reduced-motion учитывает MotionConfig в layout.
  const still = false;
  // При первом заходе ждём, пока уйдёт загрузочный экран (см. preloader.tsx).
  const [base] = useState(() =>
    // Экран идёт только сразу после загрузки страницы; при возврате на главную ждать нечего.
    typeof document !== "undefined" &&
    document.documentElement.dataset.preloader !== "seen" &&
    performance.now() < 3500
      ? 2.95
      : 0,
  );

  return (
    <section aria-labelledby="home-title" className="home-hero overflow-hidden">
      <div className="hero-main relative pt-24 pb-14 sm:pt-28 lg:pt-40 lg:pb-24">
        <div className="hero-photo px-5 sm:px-8 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[56%] lg:px-0">
          <motion.div
            initial={still ? false : { scale: 1.04 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.9, delay: base + 0.15, ease }}
            className="cut relative aspect-[4/3] overflow-hidden bg-graphite-800 lg:aspect-auto lg:h-full lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 56vw, 100vw"
              loading="eager"
              fetchPriority="high"
              className="size-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hidden bg-gradient-to-r from-graphite-900 via-graphite-900/30 to-transparent lg:block"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 hidden h-44 bg-gradient-to-b from-graphite-900/85 to-transparent lg:block"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-graphite-900/80 to-transparent"
            />
          </motion.div>
        </div>

        <Container className="hero-copy relative mt-8 lg:mt-0">
          <div className="flex flex-col gap-6 lg:w-[54%] lg:pr-6 lg:py-8">
            <div className="overflow-hidden pb-2">
              <motion.h1
                id="home-title"
                className="hero-title h1 lg:text-[clamp(2.25rem,3.7vw,3.25rem)]"
                initial={still ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: base, ease }}
              >
                {"Электро\u00ADвелосипед на неделю, на месяц или насовсем"}
              </motion.h1>
            </div>
            <motion.p
              className="hero-lead lead"
              initial={still ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: base + 0.35, ease }}
            >
              {lead}
            </motion.p>
            <motion.div
              className="hero-desktop-actions flex flex-col gap-3 sm:flex-row"
              initial={still ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: base + 0.45, ease }}
            >
              <ButtonLink href="/uslugi/arenda" size="lg">
                Арендовать
              </ButtonLink>
              <ButtonLink href="/kontakty" variant="secondary" size="lg">
                Связаться с нами
              </ButtonLink>
            </motion.div>
          </div>
        </Container>
      </div>

      <Container className="hero-stats pb-16 lg:pb-24">
        <motion.div
          className="hero-stats-line origin-left"
          initial={still ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: base + 0.5, ease }}
        >
          <LedLine full />
        </motion.div>
        <dl className="mt-8 grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={
                "flex min-w-0 flex-col-reverse justify-end gap-1 border-graphite-700 py-5 lg:py-2 " +
                (i % 2 === 1 ? "border-l pl-5 " : "pr-5 ") +
                (i >= 2 ? "border-t lg:border-t-0 " : "") +
                (i > 0 ? "lg:border-l lg:pl-8 " : "") +
                (i === 2 ? "lg:pr-5 " : "")
              }
            >
              <dt className="text-sm text-ash">{s.label}</dt>
              <dd className="nums font-display text-[1.375rem] leading-tight font-semibold tracking-[-0.02em] whitespace-nowrap sm:text-2xl xl:text-3xl">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
      <Container className="hero-mobile-actions grid grid-cols-2 gap-2 lg:hidden">
        <ButtonLink href="/kontakty" className="min-h-11 px-2 text-sm">
          Арендовать
        </ButtonLink>
        <ButtonLink href="/kontakty" variant="secondary" className="min-h-11 px-2 text-sm">
          Связаться с нами
        </ButtonLink>
      </Container>
    </section>
  );
}
