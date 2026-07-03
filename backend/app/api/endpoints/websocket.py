from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.websocket_manager import manager
from app.core.security import verify_token
from urllib.parse import parse_qs

router = APIRouter()


@router.websocket("/market")
async def market_websocket(websocket: WebSocket):
    await manager.connect(websocket, "market:prices")
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "subscribe":
                symbol = data.get("symbol")
                if symbol:
                    await manager.connect(websocket, f"stock:{symbol}")
            elif data.get("type") == "unsubscribe":
                symbol = data.get("symbol")
                if symbol:
                    await manager.disconnect(websocket, f"stock:{symbol}")
    except WebSocketDisconnect:
        await manager.disconnect(websocket, "market:prices")


@router.websocket("/user")
async def user_websocket(websocket: WebSocket):
    token = parse_qs(websocket.scope.get("query_string", b"").decode()).get("token", [None])[0]
    if not token:
        await websocket.close(code=4001)
        return

    payload = verify_token(token, "access")
    if not payload:
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    await manager.connect(websocket, f"user:{user_id}", user_id)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, f"user:{user_id}", user_id)
