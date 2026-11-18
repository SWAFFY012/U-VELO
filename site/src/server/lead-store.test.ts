import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test, type TestContext } from "node:test";
import {
  createFileLeadStore,
  resolveLeadsDir,
  serializeLead,
  type LeadRecord,
} from "./lead-store.ts";

async function tempDir(t: TestContext): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "yuvelo-store-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

function record(overrides: Partial<LeadRecord> = {}): LeadRecord {
  return {
    id: "00000000-0000-4000-8000-000000000001",
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

async function readLines(dir: string): Promise<string[]> {
  const text = await readFile(path.join(dir, "leads.jsonl"), "utf8");
  assert.ok(text.endsWith("\n"), "файл заканчивается переводом строки");
  return text.slice(0, -1).split("\n");
}

test("создаёт каталог и дописывает заявки по одной строке", async (t) => {
  const dir = path.join(await tempDir(t), "nested", "data");
  const store = createFileLeadStore(dir);

  await store.append(record());
  await store.append(record({ id: "second", kind: "buy" }));

  const lines = await readLines(dir);
  assert.equal(lines.length, 2);
  assert.deepEqual(JSON.parse(lines[0]), record());
  assert.equal(JSON.parse(lines[1]).id, "second");
});

test("многострочный текст остаётся одной строкой JSONL", async (t) => {
  const dir = await tempDir(t);
  const message = "Не включается.\nМигает индикатор\r\nи пищит\u2028контроллер\u2029\u0085конец";
  await createFileLeadStore(dir).append(record({ kind: "repair", message }));

  const text = await readFile(path.join(dir, "leads.jsonl"), "utf8");
  assert.equal(text.split("\n").length, 2, "одна строка и завершающий перевод");
  assert.doesNotMatch(text.slice(0, -1), /[\n\r\u2028\u2029\u0085]/);
  assert.equal(JSON.parse(text).message, message);
});

test("serializeLead не добавляет перевод строки и сохраняет кириллицу читаемой", () => {
  const line = serializeLead(record({ name: "Пётр" }));
  assert.doesNotMatch(line, /\n/);
  assert.match(line, /"name":"Пётр"/);
});

test("параллельные записи не перемешиваются", async (t) => {
  const dir = await tempDir(t);
  const store = createFileLeadStore(dir);

  await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      store.append(record({ id: `id-${i}`, message: "строка\n".repeat(40) })),
    ),
  );

  const lines = await readLines(dir);
  assert.equal(lines.length, 50);
  const ids = lines.map((line) => (JSON.parse(line) as LeadRecord).id);
  assert.deepEqual(new Set(ids).size, 50);
});

test("ошибка записи отклоняет промис, но не ломает следующие записи", async (t) => {
  const dir = await tempDir(t);
  const store = createFileLeadStore(dir);
  // Каталог на месте файла: appendFile упадёт с EISDIR.
  await mkdir(path.join(dir, "leads.jsonl"));
  await assert.rejects(store.append(record()));

  await rmdir(path.join(dir, "leads.jsonl"));
  await store.append(record({ id: "after-failure" }));
  const lines = await readLines(dir);
  assert.equal(lines.length, 1);
  assert.equal(JSON.parse(lines[0]).id, "after-failure");
});

test("resolveLeadsDir берёт LEADS_DIR, иначе ./data", () => {
  assert.equal(resolveLeadsDir({ LEADS_DIR: "/var/lib/yuvelo" }), "/var/lib/yuvelo");
  assert.equal(resolveLeadsDir({}), path.resolve("data"));
  assert.equal(resolveLeadsDir({ LEADS_DIR: "  " }), path.resolve("data"));
  assert.equal(resolveLeadsDir({ LEADS_DIR: "./leads" }), path.resolve("leads"));
});
