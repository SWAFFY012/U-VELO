import { leadSchema, normalizePhone, type LeadInput, type LeadResponse } from "../lib/lead-schema.ts";
import type { LeadNotifier, LeadRecord, LeadStore } from "./lead-store.ts";
import type { RateLimiter } from "./rate-limit.ts";

/** Максимальный размер тела запроса. Самая длинная честная заявка занимает около 4 КБ. */
export const MAX_BODY_BYTES = 10 * 1024;
const MAX_USER_AGENT_LENGTH = 300;
const MAX_IP_LENGTH = 64;

const messages = {
  contentType: "Заявка должна быть отправлена в формате JSON.",
  tooLarge: "Слишком большая заявка. Сократите сообщение и отправьте ещё раз.",
  badJson: "Не удалось прочитать заявку. Обновите страницу и отправьте ещё раз.",
  invalid: "Проверьте поля формы",
  // Запасной текст для правил схемы без собственного сообщения — чтобы не отдавать английский текст zod.
  invalidField: "Проверьте значение поля",
  rateLimit: "Слишком много заявок. Попробуйте через несколько минут или позвоните нам.",
  failed: "Не удалось сохранить заявку. Позвоните нам, пожалуйста.",
} as const;

export interface LeadLogger {
  error(...args: unknown[]): void;
  info(...args: unknown[]): void;
}

export interface LeadHandlerDeps {
  store: LeadStore;
  limiter: RateLimiter;
  /** Уведомление (Telegram). Не задано — уведомления выключены. */
  notify?: LeadNotifier;
  /**
   * Планировщик фоновой работы (в Next.js — `after`). Если задан, уведомление по уже сохранённой
   * заявке уходит после ответа и не задерживает посетителя. Без него уведомление ждём до ответа.
   */
  defer?: (task: () => Promise<void>) => void;
  now?: () => Date;
  newId?: () => string;
  logger?: LeadLogger;
}

type FieldErrors = Partial<Record<keyof LeadInput, string>>;

function json(body: LeadResponse, status: number, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

const fail = (error: string, status: number, headers?: Record<string, string>) =>
  json({ ok: false, error }, status, headers);

/**
 * IP посетителя. Сначала `x-real-ip`: его выставляет наш прокси (nginx), и клиент его не подделает.
 * Затем первый адрес из `x-forwarded-for`, иначе `unknown`.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = headers.get("x-real-ip")?.trim() || forwarded || "unknown";
  return ip.slice(0, MAX_IP_LENGTH);
}

function isJson(request: Request): boolean {
  const type = request.headers.get("content-type") ?? "";
  return type.split(";")[0].trim().toLowerCase() === "application/json";
}

type Body = { status: "ok"; text: string } | { status: "too-large" } | { status: "unreadable" };

/** Читает тело потоком и останавливается, как только превышен лимит, — Content-Length может врать. */
async function readBody(request: Request, maxBytes: number): Promise<Body> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declared) && declared > maxBytes) return { status: "too-large" };
  if (!request.body) return { status: "ok", text: "" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { status: "too-large" };
      }
      chunks.push(value);
    }
    const text = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
    return { status: "ok", text };
  } catch {
    return { status: "unreadable" };
  }
}

function parseObject(text: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(text);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Honeypot заполнен, если в поле `website` пришло что угодно, кроме пустого значения. */
function isHoneypotFilled(raw: Record<string, unknown>): boolean {
  const trap = raw.website;
  return trap !== undefined && trap !== null && trap !== "";
}

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : "неизвестная ошибка";
}

export function createLeadHandler(deps: LeadHandlerDeps): (request: Request) => Promise<Response> {
  const { store, limiter, notify, defer } = deps;
  const now = deps.now ?? (() => new Date());
  const newId = deps.newId ?? (() => crypto.randomUUID());
  const logger = deps.logger ?? console;

  async function sendNotification(record: LeadRecord): Promise<boolean> {
    if (!notify) return false;
    try {
      await notify(record);
      return true;
    } catch (error) {
      logger.error(`[leads] Telegram: уведомление по заявке ${record.id} не отправлено. ${describeError(error)}`);
      return false;
    }
  }

  async function handle(request: Request): Promise<Response> {
    if (!isJson(request)) return fail(messages.contentType, 415);

    const body = await readBody(request, MAX_BODY_BYTES);
    if (body.status === "too-large") return fail(messages.tooLarge, 413);
    if (body.status === "unreadable") return fail(messages.badJson, 400);

    const raw = parseObject(body.text);
    if (!raw) return fail(messages.badJson, 400);

    // До валидации: схема отвергла бы заполненный honeypot, а бот должен увидеть «успех».
    if (isHoneypotFilled(raw)) return json({ ok: true }, 200);

    const parsed = leadSchema.safeParse(raw, { error: () => messages.invalidField });
    if (!parsed.success) {
      const fields: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key !== "string") continue;
        fields[key as keyof LeadInput] ??= issue.message;
      }
      return json({ ok: false, error: messages.invalid, fields }, 422);
    }

    const ip = clientIp(request.headers);
    const limit = limiter.hit(ip);
    if (!limit.allowed) {
      return fail(messages.rateLimit, 429, {
        "Retry-After": String(Math.max(1, Math.ceil(limit.retryAfterMs / 1000))),
      });
    }

    const lead = parsed.data;
    const record: LeadRecord = {
      id: newId(),
      createdAt: now().toISOString(),
      kind: lead.kind,
      name: lead.name,
      phone: normalizePhone(lead.phone),
      model: lead.model,
      date: lead.date ?? "",
      message: lead.message,
      page: lead.page,
      ip,
      userAgent: (request.headers.get("user-agent") ?? "").slice(0, MAX_USER_AGENT_LENGTH),
    };

    let stored = false;
    try {
      await store.append(record);
      stored = true;
    } catch (error) {
      logger.error(`[leads] Заявка ${record.id} не записана в файл. ${describeError(error)}`);
    }

    if (stored && notify && defer) {
      defer(async () => {
        await sendNotification(record);
      });
    } else if (!(await sendNotification(record)) && !stored) {
      return fail(messages.failed, 500);
    }

    logger.info(`[leads] Принята заявка ${record.id} (${record.kind})`);
    return json({ ok: true }, 200);
  }

  return async (request) => {
    try {
      return await handle(request);
    } catch (error) {
      logger.error(`[leads] Непредвиденная ошибка обработчика. ${describeError(error)}`);
      return fail(messages.failed, 500);
    }
  };
}
