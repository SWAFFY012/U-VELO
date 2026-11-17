import { after } from "next/server";
import { createRuntimeLeadHandler } from "@/server/lead-runtime";

/**
 * POST /api/leads — приём заявок с форм сайта. Вся логика в `src/server/handle-lead.ts`.
 * Экспортируем только POST: на остальные методы Next.js сам отвечает 405.
 * Сегмент-конфиги (`runtime`, `dynamic`) не задаём — с `cacheComponents` они не поддерживаются.
 */
let handler: ((request: Request) => Promise<Response>) | undefined;

export async function POST(request: Request): Promise<Response> {
  // Создаём при первом запросе, чтобы переменные окружения читались на работающем сервере, а не при сборке.
  handler ??= createRuntimeLeadHandler({ defer: (task) => after(task) });
  return handler(request);
}
