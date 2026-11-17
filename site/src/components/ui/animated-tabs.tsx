"use client";

/**
 * Вкладки со скользящим индикатором.
 * Основа: 21st.dev, «Animated Tabs» (@educalvolpz). Адаптировано под Ю-Вело:
 * вариант-подчёркивание в виде световой линии и режим ссылок (`href`) для навигации по страницам.
 */
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useState } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  /** Если задан — вкладка ведёт на страницу (режим навигации). */
  href?: string;
}

export interface AnimatedTabsProps {
  tabs: TabItem[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  layoutId?: string;
  className?: string;
  label?: string;
}

const SPRING = { type: "spring" as const, duration: 0.35, bounce: 0.1 };

export function AnimatedTabs({
  tabs,
  activeTab: controlled,
  defaultTab,
  onChange,
  layoutId: customLayoutId,
  className,
  label = "Разделы",
}: AnimatedTabsProps) {
  const reduce = useReducedMotion();
  const generatedId = useId();
  const layoutId = customLayoutId ?? `tabs-${generatedId}`;
  const [internal, setInternal] = useState(defaultTab ?? tabs[0]?.id ?? "");
  const isControlled = controlled !== undefined;
  const active = isControlled ? controlled : internal;
  const asLinks = tabs.every((t) => t.href);

  const change = useCallback(
    (id: string) => {
      if (!isControlled) setInternal(id);
      onChange?.(id);
    },
    [isControlled, onChange],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      const tab = tabs[next];
      if (!tab) return;
      change(tab.id);
      document.getElementById(`${layoutId}-tab-${tab.id}`)?.focus();
    },
    [tabs, change, layoutId],
  );

  const tabClass = (isActive: boolean) =>
    cn(
      "relative flex min-h-12 items-center justify-center px-4 font-display text-[0.9375rem] font-medium",
      "tracking-[-0.02em] transition-colors duration-150 sm:px-6 sm:text-base",
      isActive ? "text-chalk" : "text-ash hover:text-chalk",
    );

  const indicator = (
    <motion.span
      layoutId={layoutId}
      transition={reduce ? { duration: 0 } : SPRING}
      className="absolute inset-x-0 -bottom-px h-0.5 bg-copper shadow-[0_0_12px_1px_rgb(255_138_46_/_0.6)]"
    />
  );

  if (asLinks) {
    return (
      <nav aria-label={label} className={cn("flex border-b border-graphite-700", className)}>
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href!}
              aria-current={isActive ? "page" : undefined}
              className={tabClass(isActive)}
            >
              {isActive ? indicator : null}
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <div role="tablist" aria-label={label} className={cn("flex border-b border-graphite-700", className)}>
      {tabs.map((tab, index) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`${layoutId}-tab-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => change(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={tabClass(isActive)}
          >
            {isActive ? indicator : null}
            <span className="relative">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
