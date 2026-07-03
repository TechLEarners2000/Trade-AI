import json
import functools
import hashlib
from typing import Optional, Callable
from redis.asyncio import Redis
from app.core.config import settings

redis_client: Redis = None


async def get_redis() -> Redis:
    global redis_client
    if redis_client is None:
        redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def cache_get(key: str) -> str | None:
    r = await get_redis()
    return await r.get(key)


async def cache_set(key: str, value: str, ttl: int = 300):
    r = await get_redis()
    await r.set(key, value, ex=ttl)


async def cache_delete(key: str):
    r = await get_redis()
    await r.delete(key)


async def cache_exists(key: str) -> bool:
    r = await get_redis()
    return await r.exists(key) > 0


async def cache_incr(key: str, amount: int = 1) -> int:
    r = await get_redis()
    return await r.incr(key, amount)


def _make_cache_key(prefix: str, args: tuple, kwargs: dict, skip_args: int = 0) -> str:
    parts = [prefix]
    for a in args[skip_args:]:
        parts.append(str(a))
    for k, v in sorted(kwargs.items()):
        if k == "db":
            continue
        parts.append(f"{k}={v}")
    raw = ":".join(parts)
    if len(raw) > 200:
        raw = hashlib.sha256(raw.encode()).hexdigest()
    return raw


def cached(ttl: int = 300, key_prefix: str = "", skip_args: int = 0):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            prefix = key_prefix or f"{func.__module__}.{func.__qualname__}"
            cache_key = _make_cache_key(prefix, args, kwargs, skip_args)
            cached_val = await cache_get(cache_key)
            if cached_val is not None:
                return json.loads(cached_val)
            result = await func(*args, **kwargs)
            await cache_set(cache_key, json.dumps(result, default=str), ttl)
            return result
        return wrapper
    return decorator
