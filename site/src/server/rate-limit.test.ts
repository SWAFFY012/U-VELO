import assert from "node:assert/strict";
import { test } from "node:test";
import { SlidingWindowRateLimiter } from "./rate-limit.ts";

const MINUTE = 60_000;

function makeLimiter(options: { maxKeys?: number } = {}) {
  const clock = { now: 1_000_000 };
  const limiter = new SlidingWindowRateLimiter({
    limit: 5,
    windowMs: 10 * MINUTE,
    now: () => clock.now,
    ...options,
  });
  return { limiter, clock };
}

test("пропускает первые 5 запросов и блокирует 6-й", () => {
  const { limiter } = makeLimiter();
  for (let i = 0; i < 5; i += 1) {
    assert.equal(limiter.hit("1.1.1.1").allowed, true, `запрос ${i + 1}`);
  }
  const sixth = limiter.hit("1.1.1.1");
  assert.equal(sixth.allowed, false);
  assert.equal(sixth.retryAfterMs, 10 * MINUTE);
});

test("retryAfterMs считает время до освобождения самого старого слота", () => {
  const { limiter, clock } = makeLimiter();
  limiter.hit("ip");
  clock.now += 4 * MINUTE;
  for (let i = 0; i < 4; i += 1) limiter.hit("ip");
  clock.now += MINUTE;
  const blocked = limiter.hit("ip");
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterMs, 5 * MINUTE);
});

test("окно скользящее: слот освобождается, когда истекает самый старый запрос", () => {
  const { limiter, clock } = makeLimiter();
  limiter.hit("ip");
  clock.now += 9 * MINUTE;
  for (let i = 0; i < 4; i += 1) limiter.hit("ip");
  assert.equal(limiter.hit("ip").allowed, false);

  clock.now += MINUTE; // первому запросу ровно 10 минут — он выпал из окна
  assert.equal(limiter.hit("ip").allowed, true);
  assert.equal(limiter.hit("ip").allowed, false);
});

test("полностью восстанавливается после окна", () => {
  const { limiter, clock } = makeLimiter();
  for (let i = 0; i < 6; i += 1) limiter.hit("ip");
  clock.now += 10 * MINUTE;
  for (let i = 0; i < 5; i += 1) {
    assert.equal(limiter.hit("ip").allowed, true);
  }
  assert.equal(limiter.hit("ip").allowed, false);
});

test("отклонённые попытки не продлевают блокировку", () => {
  const { limiter, clock } = makeLimiter();
  for (let i = 0; i < 5; i += 1) limiter.hit("ip");
  for (let i = 0; i < 50; i += 1) {
    clock.now += 10_000;
    limiter.hit("ip");
  }
  clock.now = 1_000_000 + 10 * MINUTE;
  assert.equal(limiter.hit("ip").allowed, true);
});

test("ключи независимы", () => {
  const { limiter } = makeLimiter();
  for (let i = 0; i < 5; i += 1) limiter.hit("a");
  assert.equal(limiter.hit("a").allowed, false);
  assert.equal(limiter.hit("b").allowed, true);
});

test("устаревшие ключи вычищаются, карта не растёт бесконечно", () => {
  const { limiter, clock } = makeLimiter();
  for (let i = 0; i < 1000; i += 1) limiter.hit(`ip-${i}`);
  assert.equal(limiter.size, 1000);

  clock.now += 10 * MINUTE;
  limiter.hit("fresh");
  assert.equal(limiter.size, 1);
});

test("число ключей ограничено maxKeys даже внутри одного окна", () => {
  const { limiter } = makeLimiter({ maxKeys: 100 });
  for (let i = 0; i < 5000; i += 1) {
    limiter.hit(`ip-${i}`);
    assert.ok(limiter.size <= 100);
  }
  // Самый свежий ключ остался под учётом.
  for (let i = 0; i < 4; i += 1) limiter.hit("ip-4999");
  assert.equal(limiter.hit("ip-4999").allowed, false);
});
