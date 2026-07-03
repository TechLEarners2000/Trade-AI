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
    await r.setex(key, ttl, value)


async def cache_delete(key: str):
    r = await get_redis()
    await r.delete(key)


async def cache_exists(key: str) -> bool:
    r = await get_redis()
    return await r.exists(key) > 0


async def cache_incr(key: str, amount: int = 1) -> int:
    r = await get_redis()
    return await r.incr(key, amount)
