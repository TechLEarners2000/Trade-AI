from fastapi import WebSocket
from typing import Dict, Set, Any
import json
import asyncio
from app.core.redis_client import get_redis


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "global", user_id: str = None):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, channel: str = "global", user_id: str = None):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast_to_channel(self, channel: str, message: dict):
        if channel in self.active_connections:
            dead = set()
            for ws in self.active_connections[channel]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active_connections[channel].discard(ws)

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            dead = set()
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.user_connections[user_id].discard(ws)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast_live_price(self, symbol: str, price_data: dict):
        await self.broadcast_to_channel(f"stock:{symbol}", price_data)
        await self.broadcast_to_channel("market:prices", price_data)


manager = ConnectionManager()


async def price_streamer():
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe("live_prices")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                symbol = data.get("symbol", "")
                await manager.broadcast_live_price(symbol, data)
    except asyncio.CancelledError:
        pass
    finally:
        await pubsub.unsubscribe("live_prices")
