import { cn } from "@/lib/cn";
import { LedLine } from "./led-line";

/** Заголовок секции: световая линия, h2 и необязательный лид. */
export function SectionHeading({
  title,
  lead,
  as: Tag = "h2",
  className,
  id,
}: {
  title: string;
  lead?: string;
  as?: "h1" | "h2";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <LedLine />
      <Tag id={id} className={Tag === "h1" ? "h1" : "h2"}>
        {title}
      </Tag>
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}
