const cache = new Map<string, { data: unknown; expiry: number }>();
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '30', 10) * 1000;

export function get<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function set(key: string, data: unknown, ttl = DEFAULT_TTL): void {
  cache.set(key, { data, expiry: Date.now() + ttl });
}

export function clear(): void {
  cache.clear();
}
