"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, LoaderCircle } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { bikes } from "@/data/bikes";
import { GlassDatePicker } from "@/components/ui/glass-date-picker";
import { cn } from "@/lib/cn";
import { LEAD_MODEL_EVENT } from "@/lib/lead-events";
import { leadSchema, type LeadKind, type LeadResponse } from "@/lib/lead-schema";
import { Button } from "./ui/button";

const copy: Record<LeadKind, { submit: string; done: string }> = {
  rent: { submit: "Отправить заявку на аренду", done: "Заявка на аренду отправлена" },
  buy: { submit: "Отправить заявку на покупку", done: "Заявка на покупку отправлена" },
  repair: { submit: "Отправить заявку на ремонт", done: "Заявка на ремонт отправлена" },
  contact: { submit: "Отправить сообщение", done: "Сообщение отправлено" },
};

type Fields = "name" | "phone" | "model" | "date" | "message" | "consent";
type Errors = Partial<Record<Fields, string>>;

/** 89001234567 -> +7 (900) 123-45-67, по мере ввода. */
function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (!d) return "";
  if (d[0] === "8") d = `7${d.slice(1)}`;
  if (d[0] !== "7") d = `7${d}`;
  d = d.slice(0, 11);
  let out = "+7";
  if (d.length > 1) out += ` (${d.slice(1, 4)}`;
  if (d.length >= 5) out += `) ${d.slice(4, 7)}`;
  if (d.length >= 8) out += `-${d.slice(7, 9)}`;
  if (d.length >= 10) out += `-${d.slice(9, 11)}`;
  return out;
}

/** Дата по местному времени посетителя, ГГГГ-ММ-ДД; offset — сдвиг в днях. */
function dayLocal(offset = 0): string {
  const now = new Date();
  now.setDate(now.getDate() + offset);
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

/** Стеклянная панель формы: полупрозрачная, с размытием фона. */
const glass =
  "rounded-[10px] border border-chalk/15 bg-graphite-950/60 shadow-[0_24px_60px_-20px_rgb(0_0_0_/_0.7),inset_0_1px_0_rgb(255_255_255_/_0.08)] backdrop-blur-xl";

const fieldClass =
  "min-h-14 w-full rounded-[8px] border border-chalk/15 bg-chalk/[0.06] px-4 text-lg text-chalk " +
  "placeholder:text-ash transition-colors duration-150 hover:border-ash " +
  "focus:border-copper focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-copper/35 " +
  "aria-[invalid=true]:border-danger";

function Field({
  label,
  error,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={htmlFor} className="text-base font-medium text-chalk">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-ash">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function LeadForm({
  kind,
  defaultModel = "",
  className,
}: {
  kind: LeadKind;
  defaultModel?: string;
  className?: string;
}) {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const formRef = useRef<HTMLFormElement>(null);
  const [model, setModel] = useState(defaultModel);
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  /** Какая быстрая кнопка даты нажата (сдвиг в днях). Саму дату считаем только по клику. */
  const [chip, setChip] = useState<number | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [formError, setFormError] = useState("");

  const withCatalog = kind === "rent" || kind === "buy";

  // Карточка каталога может подставить модель в форму.
  useEffect(() => {
    if (!withCatalog) return;
    const onPick = (event: Event) => setModel((event as CustomEvent<string>).detail);
    window.addEventListener(LEAD_MODEL_EVENT, onPick);
    return () => window.removeEventListener(LEAD_MODEL_EVENT, onPick);
  }, [withCatalog]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const data = new FormData(event.currentTarget);
    const payload = {
      kind,
      name: String(data.get("name") ?? ""),
      phone,
      model: withCatalog ? model : String(data.get("model") ?? ""),
      date,
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
      website: String(data.get("website") ?? ""),
      page: window.location.pathname,
    };

    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Fields;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setFormError("");
      const first = Object.keys(next)[0];
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setFormError("");
    setStatus("sending");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as LeadResponse | null;
      if (response.ok && result?.ok) {
        setStatus("done");
        return;
      }
      if (result && !result.ok) {
        if (result.fields) setErrors(result.fields as Errors);
        setFormError(result.error);
      } else {
        setFormError("Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.");
      }
    } catch {
      setFormError("Нет связи с сервером. Проверьте интернет и отправьте заявку ещё раз.");
    }
    setStatus("idle");
  }

  if (status === "done") {
    return (
      <div
        role="status"
        tabIndex={-1}
        ref={(node) => node?.focus()}
        className={cn(
          glass,
          "flex flex-col items-start gap-4 p-6 sm:p-9",
          className,
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-copper text-graphite-900">
          <Check aria-hidden="true" strokeWidth={2.25} className="size-5" />
        </span>
        <p className="h3">{copy[kind].done}</p>
        <p className="text-silver">Перезвоним в рабочее время, ежедневно с 10:00 до 22:00.</p>
        <Button
          variant="secondary"
          onClick={() => {
            setStatus("idle");
            setPhone("");
            setDate("");
            setChip(null);
          }}
        >
          Отправить ещё одну
        </Button>
      </div>
    );
  }

  const describe = (name: Fields, hint?: boolean) =>
    errors[name] ? `${id(name)}-error` : hint ? `${id(name)}-hint` : undefined;

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className={cn(
        glass,
        "grid gap-6 p-5 sm:grid-cols-2 sm:p-9",
        className,
      )}
    >
      {withCatalog ? (
        <fieldset className="flex flex-col gap-3 sm:col-span-2">
          <legend className="mb-3 text-base font-medium text-chalk">Модель</legend>
          <div role="radiogroup" aria-label="Модель" className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[...bikes.map((b) => ({ value: b.name, label: b.name, photo: b.photos[0].src })), { value: "", label: "Помогите подобрать", photo: "" }].map(
              (option, i) => {
                const selected = model === option.value;
                return (
                  <motion.button
                    key={option.label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setModel(option.value)}
                    initial={{ opacity: 0, y: 18, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.08 * i, ease: [0.23, 1, 0.32, 1] }}
                    whileTap={{ scale: 0.97 }}
                    className={cn(
                      "relative flex min-h-[7.5rem] flex-col justify-end overflow-hidden rounded-[8px] border p-3 text-left transition-[border-color,box-shadow] duration-200",
                      selected
                        ? "border-copper shadow-[0_0_22px_-2px_rgb(255_138_46_/_0.55)]"
                        : "border-chalk/15 hover:border-chalk/40",
                    )}
                  >
                    {option.photo ? (
                      <Image
                        src={option.photo}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 45vw, 260px"
                        className={cn(
                          "object-cover transition-[transform,opacity] duration-500",
                          selected ? "scale-105 opacity-90" : "opacity-55",
                        )}
                      />
                    ) : (
                      <span aria-hidden="true" className="absolute inset-0 bg-chalk/[0.06]" />
                    )}
                    <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-graphite-950 via-graphite-950/50 to-transparent" />
                    <span className="relative font-display text-[0.9375rem] leading-tight font-semibold tracking-[-0.02em] sm:text-base">
                      {option.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-copper text-graphite-900 transition-[opacity,transform] duration-200",
                        selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
                      )}
                    >
                      <Check strokeWidth={3} className="size-3.5" />
                    </span>
                  </motion.button>
                );
              },
            )}
          </div>
        </fieldset>
      ) : null}

      <Field label="Имя" htmlFor={id("name")} error={errors.name}>
        <input
          id={id("name")}
          name="name"
          type="text"
          autoComplete="given-name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby={describe("name")}
          className={fieldClass}
        />
      </Field>

      <Field label="Телефон" htmlFor={id("phone")} error={errors.phone}>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          required
          placeholder="+7 (900) 000-00-00"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describe("phone")}
          className={cn(fieldClass, "nums")}
        />
      </Field>

      {kind === "rent" ? (
        <Field
          label="Когда хотите забрать"
          htmlFor={id("date")}
          error={errors.date}
          hint="Необязательно. Или выберите день в календаре"
          className="sm:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Сегодня", offset: 0 },
              { label: "Завтра", offset: 1 },
            ].map((option) => {
              const on = chip === option.offset;
              return (
                <button
                  key={option.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setChip(on ? null : option.offset);
                    setDate(on ? "" : dayLocal(option.offset));
                  }}
                  className={cn(
                    "min-h-12 flex-1 rounded-[8px] border px-4 text-base font-medium transition-colors duration-150",
                    on
                      ? "border-copper bg-copper text-graphite-900"
                      : "border-chalk/15 bg-chalk/[0.06] text-chalk hover:border-chalk/40",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <GlassDatePicker
            id={id("date")}
            name="date"
            value={date}
            onChange={(v) => {
              setChip(null);
              setDate(v);
            }}
            invalid={Boolean(errors.date)}
            describedBy={describe("date", true)}
          />
        </Field>
      ) : null}

      {kind === "repair" ? (
        <Field
          label="Модель электровелосипеда"
          htmlFor={id("model")}
          error={errors.model}
          className="sm:col-span-2"
        >
          <input
            id={id("model")}
            name="model"
            type="text"
            placeholder="Например, Wenbox R5"
            aria-invalid={Boolean(errors.model)}
            aria-describedby={describe("model")}
            className={fieldClass}
          />
        </Field>
      ) : null}

      {kind === "repair" || kind === "contact" ? (
        <Field
          label={kind === "repair" ? "Что случилось" : "Сообщение"}
          htmlFor={id("message")}
          error={errors.message}
          hint={kind === "repair" ? "Опишите неисправность: что не работает и когда началось" : undefined}
          className="sm:col-span-2"
        >
          <textarea
            id={id("message")}
            name="message"
            rows={4}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describe("message", kind === "repair")}
            className={cn(fieldClass, "resize-y py-3")}
          />
        </Field>
      ) : null}

      {/* Honeypot: скрыто от людей и скринридеров. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Сайт
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label className="flex min-h-11 cursor-pointer items-center gap-4 text-base text-silver">
          <input
            name="consent"
            type="checkbox"
            required
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={describe("consent")}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="check-box flex size-8 shrink-0 items-center justify-center rounded-[8px] border-2 border-chalk/35 bg-chalk/[0.06] text-graphite-900 transition-[background-color,border-color,box-shadow,transform] duration-200"
          >
            <svg viewBox="0 0 20 20" fill="none" className="size-5">
              <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span>
            Согласен на обработку персональных данных по{" "}
            <Link
              href="/politika-konfidencialnosti"
              className="text-chalk underline decoration-graphite-600 underline-offset-4 transition-colors duration-150 hover:text-amber"
            >
              политике конфиденциальности
            </Link>
          </span>
        </label>
        {errors.consent ? (
          <p id={`${id("consent")}-error`} role="alert" className="text-sm text-danger">
            {errors.consent}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:col-span-2">
        <Button type="submit" size="lg" disabled={status === "sending"} className="w-full sm:w-auto sm:self-start">
          {status === "sending" ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Отправляем
            </>
          ) : (
            copy[kind].submit
          )}
        </Button>
        {formError ? (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        ) : null}
      </div>
    </form>
  );
}
