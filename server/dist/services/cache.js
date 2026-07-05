const cache = new Map();
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '30', 10) * 1000;
export function get(key) {
    const entry = cache.get(key);
    if (!entry)
        return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}
export function set(key, data, ttl = DEFAULT_TTL) {
    cache.set(key, { data, expiry: Date.now() + ttl });
}
export function clear() {
    cache.clear();
}
