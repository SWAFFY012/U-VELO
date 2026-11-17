import { z } from "zod";

/**
 * Единая схема заявки: используется и формой в браузере, и API `/api/leads`.
 */
export const leadKinds = ["rent", "buy", "repair", "contact"] as const;
export type LeadKind = (typeof leadKinds)[number];

const phoneDigits = (value: string) => value.replace(/\D/g, "");

export const leadSchema = z.object({
  kind: z.enum(leadKinds),
  name: z
    .string()
    .trim()
    .min(2, "Укажите имя")
    .max(80, "Слишком длинное имя"),
  phone: z
    .string()
    .trim()
    .refine((v) => {
      const d = phoneDigits(v);
      return d.length === 11 && (d[0] === "7" || d[0] === "8");
    }, "Укажите телефон в формате +7 900 000-00-00"),
  /** Модель: для аренды и покупки — из каталога, для ремонта — свободный текст. */
  model: z.string().trim().max(120).optional().default(""),
  /** Желаемая дата начала аренды, ГГГГ-ММ-ДД. */
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Укажите дату")
    .refine((v) => {
      const d = new Date(`${v}T00:00:00Z`);
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
    }, "Такой даты нет")
    .optional()
    .or(z.literal("")),
  /** Описание неисправности или сообщение. */
  message: z.string().trim().max(1500, "Слишком длинное сообщение").optional().default(""),
  consent: z.literal(true, { error: "Нужно согласие на обработку персональных данных" }),
  /** Honeypot: люди это поле не видят и не заполняют. */
  website: z.string().max(0).optional().default(""),
  /** Страница, с которой отправлена заявка. */
  page: z.string().max(200).optional().default(""),
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;

/** 89001234567 / +7 (900) 123-45-67 -> +79001234567 */
export function normalizePhone(value: string): string {
  const d = phoneDigits(value);
  return `+7${d.slice(1)}`;
}

export type LeadResponse =
  | { ok: true }
  | { ok: false; error: string; fields?: Partial<Record<keyof LeadInput, string>> };
