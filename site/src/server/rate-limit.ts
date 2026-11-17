export interface RateLimitResult {
  allowed: boolean;
  /** Через сколько миллисекунд освободится слот. 0, если запрос пропущен. */
  retryAfterMs: number;
}

export interface RateLimiter {
  hit(key: string): RateLimitResult;
}

export interface SlidingWindowOptions {
  /** Сколько запросов разрешено в окне. */
  limit: number;
  /** Длина окна в миллисекундах. */
  windowMs: number;
  /** Часы; подменяются в тестах. */
  now?: () => number;
  /** Потолок числа ключей в памяти. При переполнении вытесняются самые давние. */
  maxKeys?: number;
}

/**
 * Ограничитель «скользящее окно» в памяти процесса.
 * Подходит для одного экземпляра сервера: состояние не разделяется между процессами
 * и сбрасывается при перезапуске.
 */
export class SlidingWindowRateLimiter implements RateLimiter {
  private readonly limit: number;
  private readonly windowMs: number;
  private readonly maxKeys: number;
  private readonly now: () => number;
  /** Ключ -> отметки времени принятых запросов, по возрастанию. */
  private readonly hits = new Map<string, number[]>();
  private nextSweepAt = 0;

  constructor(options: SlidingWindowOptions) {
    this.limit = options.limit;
    this.windowMs = options.windowMs;
    this.maxKeys = options.maxKeys ?? 10_000;
    this.now = options.now ?? Date.now;
  }

  /** Число ключей в памяти (для тестов и диагностики). */
  get size(): number {
    return this.hits.size;
  }

  /**
   * Проверяет лимит и, если запрос пропущен, сразу учитывает его.
   * Отклонённые запросы не учитываются и блокировку не продлевают.
   */
  hit(key: string): RateLimitResult {
    const now = this.now();
    this.sweepIfDue(now);

    const fresh = this.fresh(this.hits.get(key), now);

    if (fresh.length >= this.limit) {
      this.hits.set(key, fresh);
      return { allowed: false, retryAfterMs: Math.max(1, fresh[0] + this.windowMs - now) };
    }

    fresh.push(now);
    // Удаляем и вставляем заново, чтобы активный ключ оказался в конце очереди на вытеснение.
    this.hits.delete(key);
    this.hits.set(key, fresh);
    this.evictOverflow();

    return { allowed: true, retryAfterMs: 0 };
  }

  private fresh(timestamps: number[] | undefined, now: number): number[] {
    if (!timestamps) return [];
    const threshold = now - this.windowMs;
    return timestamps.filter((ts) => ts > threshold);
  }

  /** Раз в окно проходим по всей карте и выбрасываем ключи без свежих запросов. */
  private sweepIfDue(now: number): void {
    if (now < this.nextSweepAt) return;
    this.nextSweepAt = now + this.windowMs;
    for (const [key, timestamps] of this.hits) {
      const fresh = this.fresh(timestamps, now);
      if (fresh.length === 0) this.hits.delete(key);
      else if (fresh.length !== timestamps.length) this.hits.set(key, fresh);
    }
  }

  private evictOverflow(): void {
    while (this.hits.size > this.maxKeys) {
      const oldest = this.hits.keys().next();
      if (oldest.done) return;
      this.hits.delete(oldest.value);
    }
  }
}
