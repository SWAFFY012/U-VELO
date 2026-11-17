import { createLeadHandler, type LeadHandlerDeps } from "./handle-lead.ts";
import { createFileLeadStore, resolveLeadsDir } from "./lead-store.ts";
import { SlidingWindowRateLimiter } from "./rate-limit.ts";
import { telegramNotifierFromEnv } from "./telegram.ts";

/** Не больше 5 принятых заявок с одного IP за 10 минут. */
const LEADS_PER_WINDOW = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Лимитер живёт в globalThis, чтобы горячая перезагрузка модулей в `next dev` не обнуляла счётчики.
const globalStore = globalThis as typeof globalThis & { __yuveloLeadLimiter?: SlidingWindowRateLimiter };

function leadLimiter(): SlidingWindowRateLimiter {
  globalStore.__yuveloLeadLimiter ??= new SlidingWindowRateLimiter({
    limit: LEADS_PER_WINDOW,
    windowMs: WINDOW_MS,
  });
  return globalStore.__yuveloLeadLimiter;
}

/** Боевой обработчик: файл в `LEADS_DIR`, Telegram из переменных окружения, лимит в памяти. */
export function createRuntimeLeadHandler(options: Pick<LeadHandlerDeps, "defer"> = {}) {
  return createLeadHandler({
    store: createFileLeadStore(resolveLeadsDir()),
    limiter: leadLimiter(),
    notify: telegramNotifierFromEnv(),
    defer: options.defer,
  });
}
