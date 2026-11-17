import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test, type TestContext } from "node:test";
import { leadKinds, type LeadInput, type LeadResponse } from "../lib/lead-schema.ts";
import { clientIp, createLeadHandler, MAX_BODY_BYTES, type LeadHandlerDeps } from "./handle-lead.ts";
import { createFileLeadStore, type LeadNotifier, type LeadRecord, type LeadStore } from "./lead-store.ts";
import { SlidingWindowRateLimiter } from "./rate-limit.ts";
import { createTelegramNotifier } from "./telegram.ts";

const URL = "http://localhost/api/leads";
const TOKEN = "123456:TEST-secret-token";
const RATE_LIMIT_ERROR = "Слишком много заявок. Попробуйте через несколько минут или позвоните нам.";
const STORAGE_ERROR = "Не удалось сохранить заявку. Позвоните нам, пожалуйста.";

type Failure = Extract<LeadResponse, { ok: false }>;

function validLead(overrides: Partial<Record<keyof LeadInput, unknown>> = {}) {
  return {
    kind: "rent",
    name: "  Иван ",
    phone: "8 (900) 123-45-67",
    model: "Wenbox R5",
    date: "2026-11-20",
    message: "",
    consent: true,
    website: "",
    page: "/uslugi/arenda",
    ...overrides,
  };
}

function post(body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      "user-agent": "node-test",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

async function setup(t: TestContext, overrides: Partial<LeadHandlerDeps> = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), "yuvelo-leads-"));
  t.after(() => rm(dir, { recursive: true, force: true }));

  const clock = { now: Date.parse("2026-11-14T09:00:00.000Z") };
  const errors: unknown[][] = [];
  let seq = 0;
  const handler = createLeadHandler({
    store: createFileLeadStore(dir),
    limiter: new SlidingWindowRateLimiter({ limit: 5, windowMs: 600_000, now: () => clock.now }),
    now: () => new Date(clock.now),
    newId: () => `id-${(seq += 1)}`,
    logger: { error: (...args: unknown[]) => errors.push(args), info: () => {} },
    ...overrides,
  });

  const stored = async (): Promise<LeadRecord[]> => {
    const text = await readFile(path.join(dir, "leads.jsonl"), "utf8").catch(() => "");
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LeadRecord);
  };

  return { handler, stored, clock, errors, dir };
}

function assertJsonHeaders(response: Response) {
  assert.match(response.headers.get("content-type") ?? "", /^application\/json/);
  assert.equal(response.headers.get("cache-control"), "no-store");
}

async function failure(response: Response, status: number): Promise<Failure> {
  assert.equal(response.status, status);
  assertJsonHeaders(response);
  const body = (await response.json()) as LeadResponse;
  assert.equal(body.ok, false);
  return body as Failure;
}

async function success(response: Response) {
  assert.equal(response.status, 200);
  assertJsonHeaders(response);
  assert.deepEqual(await response.json(), { ok: true });
}

const failingStore: LeadStore = {
  append: async () => {
    throw new Error("EACCES: permission denied");
  },
};

for (const kind of leadKinds) {
  test(`корректная заявка «${kind}» сохраняется`, async (t) => {
    const { handler, stored } = await setup(t);

    await success(await handler(post(validLead({ kind, message: "Позвоните после 18:00" }))));

    assert.deepEqual(await stored(), [
      {
        id: "id-1",
        createdAt: "2026-11-14T09:00:00.000Z",
        kind,
        name: "Иван",
        phone: "+79001234567",
        model: "Wenbox R5",
        date: "2026-11-20",
        message: "Позвоните после 18:00",
        page: "/uslugi/arenda",
        ip: "203.0.113.7",
        userAgent: "node-test",
      },
    ]);
  });
}

test("минимальная заявка: необязательные поля сохраняются пустыми строками", async (t) => {
  const { handler, stored } = await setup(t);

  await success(await handler(post({ kind: "contact", name: "Анна", phone: "+7 900 000-00-00", consent: true })));

  const [lead] = await stored();
  assert.equal(lead.model, "");
  assert.equal(lead.date, "");
  assert.equal(lead.message, "");
  assert.equal(lead.page, "");
  assert.equal(lead.phone, "+79000000000");
});

test("в файл не попадают honeypot, согласие и посторонние поля", async (t) => {
  const { handler, stored } = await setup(t);
  await success(await handler(post({ ...validLead(), extra: "x", id: "evil", createdAt: "1970" })));

  const [lead] = await stored();
  assert.deepEqual(Object.keys(lead).sort(), [
    "createdAt",
    "date",
    "id",
    "ip",
    "kind",
    "message",
    "model",
    "name",
    "page",
    "phone",
    "userAgent",
  ]);
  assert.equal(lead.id, "id-1");
});

test("User-Agent обрезается до 300 символов", async (t) => {
  const { handler, stored } = await setup(t);
  await success(await handler(post(validLead(), { "user-agent": "a".repeat(1000) })));
  assert.equal((await stored())[0].userAgent, "a".repeat(300));
});

test("неверный телефон → 422 с сообщением для поля", async (t) => {
  const { handler, stored } = await setup(t);

  const body = await failure(await handler(post(validLead({ phone: "12345" }))), 422);

  assert.equal(body.error, "Проверьте поля формы");
  assert.deepEqual(body.fields, { phone: "Укажите телефон в формате +7 900 000-00-00" });
  assert.deepEqual(await stored(), []);
});

test("нет согласия → 422 с сообщением для поля", async (t) => {
  const { handler, stored } = await setup(t);

  for (const consent of [false, undefined]) {
    const body = await failure(await handler(post(validLead({ consent }))), 422);
    assert.deepEqual(body.fields, { consent: "Нужно согласие на обработку персональных данных" });
  }
  assert.deepEqual(await stored(), []);
});

test("несколько ошибок: по одному сообщению на поле, всё по-русски, без эха ввода", async (t) => {
  const { handler } = await setup(t);
  const secret = "SECRET-INPUT-VALUE";

  const response = await handler(
    post(validLead({ kind: secret, name: "Я", phone: secret, model: secret.repeat(10), date: secret, consent: false })),
  );
  const text = await response.clone().text();
  const body = await failure(response, 422);

  assert.ok(!text.includes(secret));
  assert.deepEqual(Object.keys(body.fields ?? {}).sort(), ["consent", "date", "kind", "model", "name", "phone"]);
  assert.equal(body.fields?.name, "Укажите имя");
  assert.equal(body.fields?.date, "Укажите дату");
  for (const message of Object.values(body.fields ?? {})) {
    assert.match(message, /^[А-ЯЁ]/, `сообщение на русском: ${message}`);
  }
});

test("honeypot заполнен → ok, но ничего не сохраняется и не отправляется", async (t) => {
  let notified = 0;
  const { handler, stored } = await setup(t, {
    notify: async () => {
      notified += 1;
    },
  });

  await success(await handler(post(validLead({ website: "https://spam.example" }))));
  // Даже если остальные поля невалидны, бот не должен видеть разницы.
  await success(await handler(post({ website: "x" })));

  assert.deepEqual(await stored(), []);
  assert.equal(notified, 0);
});

test("honeypot не расходует лимит честного посетителя", async (t) => {
  const { handler, stored } = await setup(t);
  for (let i = 0; i < 20; i += 1) {
    await success(await handler(post(validLead({ website: "spam" }))));
  }
  await success(await handler(post(validLead())));
  assert.equal((await stored()).length, 1);
});

test("лимит: 6-я заявка с одного IP → 429 с Retry-After, после окна снова можно", async (t) => {
  const { handler, stored, clock } = await setup(t);

  for (let i = 0; i < 5; i += 1) {
    await success(await handler(post(validLead())));
    clock.now += 1000;
  }

  const blocked = await handler(post(validLead()));
  assert.equal(blocked.headers.get("retry-after"), "595");
  const body = await failure(blocked, 429);
  assert.equal(body.error, RATE_LIMIT_ERROR);
  assert.equal((await stored()).length, 5);

  // Другой посетитель не страдает.
  await success(await handler(post(validLead(), { "x-forwarded-for": "198.51.100.2" })));

  clock.now += 600_000;
  await success(await handler(post(validLead())));
  assert.equal((await stored()).length, 7);
});

test("невалидные заявки лимит не расходуют", async (t) => {
  const { handler, stored } = await setup(t);
  for (let i = 0; i < 10; i += 1) {
    await failure(await handler(post(validLead({ phone: "1" }))), 422);
  }
  await success(await handler(post(validLead())));
  assert.equal((await stored()).length, 1);
});

test("слишком большое тело → 413", async (t) => {
  const { handler, stored } = await setup(t);

  const huge = JSON.stringify(validLead({ message: "я".repeat(MAX_BODY_BYTES) }));
  const body = await failure(await handler(post(huge)), 413);
  assert.match(body.error, /^[А-ЯЁ]/);

  // Заявленный Content-Length больше лимита — отклоняем, не читая тело.
  await failure(await handler(post(validLead(), { "content-length": String(MAX_BODY_BYTES + 1) })), 413);

  assert.deepEqual(await stored(), []);
});

test("тело ровно на границе лимита принимается к разбору", async (t) => {
  const { handler } = await setup(t);
  const base = JSON.stringify({ pad: "" });
  const padded = JSON.stringify({ pad: "a".repeat(MAX_BODY_BYTES - base.length) });
  assert.equal(Buffer.byteLength(padded), MAX_BODY_BYTES);
  await failure(await handler(post(padded)), 422);
});

test("невалидный JSON → 400", async (t) => {
  const { handler, stored } = await setup(t);

  for (const raw of ["{not json", "", "[1,2,3]", "null", '"строка"', "42"]) {
    const body = await failure(await handler(post(raw)), 400);
    assert.match(body.error, /^[А-ЯЁ]/);
    assert.equal(body.fields, undefined);
  }
  assert.deepEqual(await stored(), []);
});

test("не application/json → 415", async (t) => {
  const { handler, stored } = await setup(t);
  const json = JSON.stringify(validLead());

  for (const contentType of ["text/plain", "application/x-www-form-urlencoded", "application/jsonp"]) {
    await failure(await handler(post(json, { "content-type": contentType })), 415);
  }
  await success(await handler(post(json, { "content-type": "application/json; charset=utf-8" })));
  assert.equal((await stored()).length, 1);
});

test("многострочное сообщение остаётся одной строкой JSONL", async (t) => {
  const { handler, dir } = await setup(t);
  const message = "Не включается.\nМигает индикатор\r\n\r\nи \"пищит\" контроллер";

  await success(await handler(post(validLead({ kind: "repair", message }))));
  await success(await handler(post(validLead({ kind: "repair", message }))));

  const text = await readFile(path.join(dir, "leads.jsonl"), "utf8");
  const lines = text.split("\n");
  assert.equal(lines.length, 3);
  assert.equal(lines[2], "");
  assert.equal((JSON.parse(lines[0]) as LeadRecord).message, message);
  assert.equal((JSON.parse(lines[1]) as LeadRecord).message, message);
});

test("Telegram получает уже нормализованную заявку", async (t) => {
  const received: LeadRecord[] = [];
  const { handler, stored } = await setup(t, {
    notify: async (lead) => {
      received.push(lead);
    },
  });

  await success(await handler(post(validLead())));

  assert.deepEqual(received, await stored());
  assert.equal(received[0].phone, "+79001234567");
});

test("сбой Telegram не ломает заявку: она сохранена, ошибка в логе без токена", async (t) => {
  const failingFetch: typeof fetch = async (input) => {
    throw new TypeError(`fetch failed ${String(input)}`);
  };
  const { handler, stored, errors } = await setup(t, {
    notify: createTelegramNotifier({ token: TOKEN, chatId: "1", fetchImpl: failingFetch }),
  });

  await success(await handler(post(validLead())));

  assert.equal((await stored()).length, 1);
  assert.equal(errors.length, 1);
  const logged = errors.flat().map(String).join(" ");
  assert.match(logged, /Telegram/);
  assert.ok(!logged.includes(TOKEN));
  assert.ok(!logged.includes("79001234567"));
});

test("Telegram ответил ошибкой HTTP — заявка всё равно принята", async (t) => {
  const { handler, stored, errors } = await setup(t, {
    notify: createTelegramNotifier({
      token: TOKEN,
      chatId: "1",
      fetchImpl: async () => Response.json({ ok: false, description: "Bad Gateway" }, { status: 502 }),
    }),
  });

  await success(await handler(post(validLead())));
  assert.equal((await stored()).length, 1);
  assert.equal(errors.length, 1);
});

test("хранилище упало, но Telegram доставил — успех", async (t) => {
  let notified = 0;
  const { handler, errors } = await setup(t, {
    store: failingStore,
    notify: async () => {
      notified += 1;
    },
  });

  await success(await handler(post(validLead())));
  assert.equal(notified, 1);
  assert.equal(errors.length, 1);
});

test("хранилище упало, Telegram не настроен → 500", async (t) => {
  const { handler } = await setup(t, { store: failingStore });
  const body = await failure(await handler(post(validLead())), 500);
  assert.equal(body.error, STORAGE_ERROR);
});

test("хранилище и Telegram упали → 500", async (t) => {
  const notify: LeadNotifier = async () => {
    throw new Error("telegram down");
  };
  const { handler, errors } = await setup(t, { store: failingStore, notify });

  const body = await failure(await handler(post(validLead())), 500);
  assert.equal(body.error, STORAGE_ERROR);
  assert.equal(errors.length, 2);
});

test("defer: после сохранения Telegram отправляется в фоне и не задерживает ответ", async (t) => {
  const deferred: Array<() => Promise<void>> = [];
  let notified = 0;
  const { handler, errors } = await setup(t, {
    defer: (task) => deferred.push(task),
    notify: async () => {
      notified += 1;
      throw new Error("telegram down");
    },
  });

  await success(await handler(post(validLead())));
  assert.equal(notified, 0);
  assert.equal(deferred.length, 1);

  await deferred[0](); // фоновая задача не должна бросать исключение
  assert.equal(notified, 1);
  assert.equal(errors.length, 1);
});

test("defer не используется, если хранилище упало: исход зависит от Telegram", async (t) => {
  const deferred: Array<() => Promise<void>> = [];
  let notified = 0;
  const { handler } = await setup(t, {
    store: failingStore,
    defer: (task) => deferred.push(task),
    notify: async () => {
      notified += 1;
    },
  });

  await success(await handler(post(validLead())));
  assert.equal(notified, 1);
  assert.equal(deferred.length, 0);
});

test("неожиданное исключение → 500 в формате LeadResponse", async (t) => {
  const { handler, errors } = await setup(t, {
    limiter: {
      hit: () => {
        throw new Error("boom");
      },
    },
  });
  const body = await failure(await handler(post(validLead())), 500);
  assert.match(body.error, /^[А-ЯЁ]/);
  assert.equal(errors.length, 1);
});

test("clientIp: x-real-ip, затем первый адрес из x-forwarded-for, иначе unknown", () => {
  assert.equal(clientIp(new Headers({ "x-forwarded-for": " 203.0.113.7 , 10.0.0.1", "x-real-ip": "10.0.0.9" })), "10.0.0.9");
  assert.equal(clientIp(new Headers({ "x-real-ip": " 198.51.100.2 " })), "198.51.100.2");
  assert.equal(clientIp(new Headers({ "x-forwarded-for": " , ", "x-real-ip": "198.51.100.2" })), "198.51.100.2");
  assert.equal(clientIp(new Headers()), "unknown");
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "a".repeat(500) })).length, 64);
});

test("IP из x-real-ip попадает в заявку и в лимит", async (t) => {
  const { handler, stored } = await setup(t);
  const request = () =>
    new Request(URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "198.51.100.2" },
      body: JSON.stringify(validLead()),
    });

  for (let i = 0; i < 5; i += 1) await success(await handler(request()));
  await failure(await handler(request()), 429);

  const leads = await stored();
  assert.equal(leads[0].ip, "198.51.100.2");
  assert.equal(leads[0].userAgent, "");
});
