"use client";

import { MotionConfig } from "motion/react";

/** Учитывает системную настройку «уменьшить движение» во всех анимациях сайта. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
