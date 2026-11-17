import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-[6px] font-semibold whitespace-nowrap select-none " +
  "transition-[background-color,border-color,color,transform] duration-150 ease-out " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55";

const variants: Record<Variant, string> = {
  primary: "bg-copper text-graphite-900 hover:bg-amber",
  secondary:
    "border border-graphite-600 bg-transparent text-chalk hover:border-copper hover:text-amber",
  ghost: "text-chalk hover:text-amber",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface Common {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: Common & React.ComponentProps<"button">) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant,
  size,
  className,
  href,
  ...props
}: Common & Omit<React.ComponentProps<"a">, "href"> & { href: string }) {
  const cls = buttonClass(variant, size, className);
  const external = /^(https?:|tel:|mailto:)/.test(href);
  if (external) {
    return <a href={href} className={cls} {...props} />;
  }
  return <Link href={href} className={cls} {...props} />;
}
