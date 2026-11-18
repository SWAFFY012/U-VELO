import assert from "node:assert/strict";
import { test } from "node:test";
import type { LeadRecord } from "./lead-store.ts";
import {
  createTelegramNotifier,
  formatLeadMessage,
  telegramNotifierFromEnv,
} from "./telegram.ts";

const TOKEN = "123456:TEST-secret-token";

function record(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: "id-1",
    createdAt: "2026-11-14T09:00:00.000Z",
    kind: "rent",
    name: "Иван",
    phone: "+79001234567",
    model: "Wenbox U2",
    date: "2026-11-20",
    message: "",
    page: "/uslugi/arenda",
    ip: "203.0.113.7",
    userAgent: "test-agent",
    ...overrides,
  };
}

type FetchCall = { url: string; init: RequestInit };

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: FetchCall[] = [];
  const impl: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), init: init ?? {} });
    return respond();
  };
  return { calls, impl };
}

const okResponse = () => Response.json({ ok: true, result: {} });

test("формат: заявка на аренду со всеми полями", () => {
  assert.equal(
    formatLeadMessage(record()),
    [
      "Новая заявка: Аренда",
      "Имя: Иван",
      "Телефон: +79001234567",
      "Модель: Wenbox U2",
      "Дата: 20.11.2026",
      "Страница: /uslugi/arenda",
    ].join("\n"),
  );
});

test("формат: названия типов заявки", () => {
  const first = (kind: LeadRecord["kind"]) => formatLeadMessage(record({ kind })).split("\n")[0];
  assert.equal(first("rent"), "Новая заявка: Аренда");
  assert.equal(first("buy"), "Новая заявка: Покупка");
  assert.equal(first("repair"), "Новая заявка: Ремонт");
  assert.equal(first("contact"), "Новая заявка: Сообщение");
});

test("формат: пустые необязательные поля пропускаются, сообщение сохраняет переносы", () => {
  const text = formatLeadMessage(
    record({ kind: "repair", model: "", date: "", page: "", message: "Не едет.\nПищит <b>контроллер</b>" }),
  );
  assert.equal(
    text,
    ["Новая заявка: Ремонт", "Имя: Иван", "Телефон: +79001234567", "Сообщение: Не едет.\nПищит <b>контроллер</b>"].join(
      "\n",
    ),
  );
});

test("отправляет sendMessage простым текстом, без parse_mode", async () => {
  const { calls, impl } = fakeFetch(okResponse);
  const notify = createTelegramNotifier({ token: TOKEN, chatId: "-100500", fetchImpl: impl });

  await notify(record());

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, `https://api.telegram.org/bot${TOKEN}/sendMessage`);
  assert.equal(calls[0].init.method, "POST");
  assert.equal(new Headers(calls[0].init.headers).get("content-type"), "application/json");
  assert.ok(calls[0].init.signal instanceof AbortSignal, "есть таймаут через AbortSignal");

  const body = JSON.parse(String(calls[0].init.body)) as Record<string, unknown>;
  assert.equal(body.chat_id, "-100500");
  assert.equal(body.text, formatLeadMessage(record()));
  assert.equal("parse_mode" in body, false);
});

test("HTTP-ошибка Telegram → исключение без токена в тексте", async () => {
  const { impl } = fakeFetch(() =>
    Response.json({ ok: false, error_code: 401, description: "Unauthorized" }, { status: 401 }),
  );
  const notify = createTelegramNotifier({ token: TOKEN, chatId: "1", fetchImpl: impl });

  await assert.rejects(notify(record()), (error: Error) => {
    assert.match(error.message, /401/);
    assert.match(error.message, /Unauthorized/);
    assert.ok(!error.message.includes(TOKEN));
    return true;
  });
});

test("ответ 200 с ok:false тоже считается ошибкой", async () => {
  const { impl } = fakeFetch(() => Response.json({ ok: false, description: "chat not found" }));
  const notify = createTelegramNotifier({ token: TOKEN, chatId: "1", fetchImpl: impl });
  await assert.rejects(notify(record()), /chat not found/);
});

test("сетевая ошибка пробрасывается без токена, даже если он попал в текст", async () => {
  const impl: typeof fetch = async (input) => {
    throw new TypeError(`fetch failed: ${String(input)}`);
  };
  const notify = createTelegramNotifier({ token: TOKEN, chatId: "1", fetchImpl: impl });

  await assert.rejects(notify(record()), (error: Error) => {
    assert.match(error.message, /fetch failed/);
    assert.ok(!error.message.includes(TOKEN));
    assert.ok(!String(error.stack).includes(TOKEN));
    return true;
  });
});

test("telegramNotifierFromEnv: нужен и токен, и чат", () => {
  assert.equal(telegramNotifierFromEnv({}), undefined);
  assert.equal(telegramNotifierFromEnv({ TELEGRAM_BOT_TOKEN: TOKEN }), undefined);
  assert.equal(telegramNotifierFromEnv({ TELEGRAM_CHAT_ID: "1" }), undefined);
  assert.equal(telegramNotifierFromEnv({ TELEGRAM_BOT_TOKEN: " ", TELEGRAM_CHAT_ID: "1" }), undefined);
  assert.equal(typeof telegramNotifierFromEnv({ TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_CHAT_ID: "1" }), "function");
});
