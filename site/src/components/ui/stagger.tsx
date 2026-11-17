"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/cn";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 70, rotateX: -22, clipPath: "inset(18% 0% 0% 0%)" },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] },
  },
};

/** Световая полоса прочерчивается по верху блока чуть позже самого блока. */
const line: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.8, delay: 0.25, ease: [0.65, 0, 0.35, 1] } },
};

type ListTag = "ul" | "ol" | "dl" | "div";
type ItemTag = "li" | "div";

/**
 * Блоки поднимаются из глубины по очереди (наклон + маска), сверху прочерчивается
 * световая линия. Срабатывает один раз при появлении в зоне видимости.
 */
export function Stagger({
  as = "ul",
  className,
  children,
}: {
  as?: ListTag;
  className?: string;
  children: React.ReactNode;
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={cn("[perspective:1200px]", className)}
      variants={list}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -15% 0px" }}
    >
      {children}
    </Tag>
  );
}

export function StaggerItem({
  as = "li",
  className,
  children,
  glow = true,
}: {
  as?: ItemTag;
  className?: string;
  children: React.ReactNode;
  glow?: boolean;
}) {
  const Tag = motion[as];
  return (
    <Tag variants={item} className={cn("relative origin-bottom", className)}>
      {glow ? (
        <motion.span
          aria-hidden="true"
          variants={line}
          className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-amber via-copper to-transparent shadow-[0_0_12px_rgb(255_138_46/0.6)]"
        />
      ) : null}
      {children}
    </Tag>
  );
}
