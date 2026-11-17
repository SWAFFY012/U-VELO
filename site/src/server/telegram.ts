import type { LeadKind } from "../lib/lead-schema.ts";
import type { LeadNotifier, LeadRecord } from "./lead-store.ts";

const TELEGRAM_API = "https://api.telegram.org";
const DEFAULT_TIMEOUT_MS = 5000;

const kindLabels: Record<LeadKind, string> = {
  rent: "Аренда",
  buy: "Покупка",
  repair: "Ремонт",
  contact: "Сообщение",
};

/** 2026-11-20 -> 20.11.2026 */
function formatDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : date;
}

/**
 * Текст уведомления. Только простой текст: `parse_mode` не используется,
 * поэтому пользовательский ввод не нужно экранировать и он не может сломать разметку.
 */
export function formatLeadMessage(record: LeadRecord): string {
  const lines = [
    `Новая заявка: ${kindLabels[record.kind]}`,
    `Имя: ${record.name}`,
    `Телефон: ${record.phone}`,
  ];
  if (record.model) lines.push(`Модель: ${record.model}`);
  if (record.date) lines.push(`Дата: ${formatDate(record.date)}`);
  if (record.message) lines.push(`Сообщение: ${record.message}`);
  if (record.page) lines.push(`Страница: ${record.page}`);
  return lines.join("\n");
}

export interface TelegramOptions {
  token: string;
  chatId: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

/** Токен входит в URL запроса, поэтому вычищаем его из любых текстов ошибок. */
function redact(text: string, token: string): string {
  return text.split(token).join("[token]");
}

export function createTelegramNotifier(options: TelegramOptions): LeadNotifier {
  const { token, chatId, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  return async (record) => {
    // `fetch` берём в момент вызова, а не при создании: так его можно подменить в тестах.
    const send = options.fetchImpl ?? fetch;

    let response: Response;
    try {
      response = await send(`${TELEGRAM_API}/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatLeadMessage(record),
          link_preview_options: { is_disabled: true },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const reason = error instanceof Error ? `${error.name}: ${error.message}` : "неизвестная ошибка";
      // Новый объект ошибки: у исходного в message, stack или cause может оказаться URL с токеном.
      throw new Error(redact(`Telegram недоступен (${reason})`, token));
    }

    const payload = (await response.json().catch(() => null)) as { ok?: unknown; description?: unknown } | null;
    if (response.ok && payload?.ok === true) return;

    const description = typeof payload?.description === "string" ? payload.description.slice(0, 200) : "нет описания";
    throw new Error(redact(`Telegram отклонил сообщение: HTTP ${response.status}, ${description}`, token));
  };
}

/** Уведомления включаются, только когда заданы и токен бота, и идентификатор чата. */
export function telegramNotifierFromEnv(
  env: Record<string, string | undefined> = process.env,
): LeadNotifier | undefined {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return undefined;
  return createTelegramNotifier({ token, chatId });
}
