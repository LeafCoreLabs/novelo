/**
 * Lightweight cache abstraction.
 *
 * In production with Upstash we'd use @upstash/redis; in Docker dev we'd use
 * a node redis client. To keep the foundation dependency-light and always
 * runnable, this ships with an in-memory fallback that implements the same
 * interface. Swap `createRedisCache()` for a real client without touching
 * call sites.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
}

class MemoryCache implements CacheStore {
  private store = new Map<string, { value: unknown; expiresAt: number | null }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const globalForCache = globalThis as unknown as { cache: CacheStore | undefined };

export const cache: CacheStore = globalForCache.cache ?? new MemoryCache();

if (process.env.NODE_ENV !== "production") {
  globalForCache.cache = cache;
}

/** Cache-aside helper: returns cached value or computes + stores it. */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const hit = await cache.get<T>(key);
  if (hit !== null) return hit;
  const value = await loader();
  await cache.set(key, value, ttlSeconds);
  return value;
}
