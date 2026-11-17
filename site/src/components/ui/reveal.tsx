"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/cn";

/**
 * Появление блока при прокрутке: сдвиг 16px и прозрачность, один раз.
 * При prefers-reduced-motion сдвиг отключает MotionConfig в корневом layout.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.55, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
