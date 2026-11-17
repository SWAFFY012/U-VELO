import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { LeadKind } from "../lib/lead-schema.ts";

/** Заявка в том виде, в каком она хранится и уходит в уведомления. */
export interface LeadRecord {
  id: string;
  /** ISO 8601, UTC. */
  createdAt: string;
  kind: LeadKind;
  name: string;
  /** Нормализованный номер: +7XXXXXXXXXX. */
  phone: string;
  model: string;
  /** ГГГГ-ММ-ДД или пустая строка. */
  date: string;
  message: string;
  page: string;
  ip: string;
  userAgent: string;
}

export interface LeadStore {
  append(record: LeadRecord): Promise<void>;
}

export type LeadNotifier = (record: LeadRecord) => Promise<void>;

export const LEADS_FILE = "leads.jsonl";

/**
 * Одна заявка = одна строка JSON. `JSON.stringify` экранирует \n и \r, а U+2028, U+2029 и U+0085
 * экранируем сами: часть инструментов (например, `str.splitlines()` в Python) считает их переводом строки.
 */
export function serializeLead(record: LeadRecord): string {
  return JSON.stringify(record).replace(
    /[\u0085\u2028\u2029]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

/** Каталог для заявок: `LEADS_DIR` или `./data` относительно рабочего каталога сервера. */
export function resolveLeadsDir(env: Record<string, string | undefined> = process.env): string {
  return path.resolve(env.LEADS_DIR?.trim() || "data");
}

/**
 * Хранилище в файле `<dir>/leads.jsonl`. Записи идут строго по очереди, чтобы строки
 * не перемешивались. Файл содержит персональные данные, поэтому доступ только владельцу.
 */
export function createFileLeadStore(dir: string): LeadStore {
  const file = path.join(dir, LEADS_FILE);
  let queue: Promise<void> = Promise.resolve();

  async function write(record: LeadRecord): Promise<void> {
    await mkdir(dir, { recursive: true, mode: 0o700 });
    await appendFile(file, `${serializeLead(record)}\n`, { encoding: "utf8", mode: 0o600 });
  }

  return {
    append(record) {
      const result = queue.then(() => write(record));
      queue = result.catch(() => {});
      return result;
    },
  };
}
