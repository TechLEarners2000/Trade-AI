from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.stock import Stock
from sqlalchemy import select, delete
import uuid

router = APIRouter()


@router.get("/")
async def get_watchlists(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Watchlist).where(Watchlist.user_id == current_user.id).order_by(Watchlist.sort_order)
    )
    watchlists = result.scalars().all()
    data = []
    for wl in watchlists:
        items_result = await db.execute(
            select(WatchlistItem).where(WatchlistItem.watchlist_id == wl.id)
        )
        items = items_result.scalars().all()
        data.append({
            "id": str(wl.id), "name": wl.name, "description": wl.description,
            "item_count": len(items),
            "items": [{"id": str(i.id), "stock_id": str(i.stock_id), "notes": i.notes} for i in items],
        })
    return data


@router.post("/")
async def create_watchlist(name: str = Body(...), description: str = Body(None), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wl = Watchlist(user_id=current_user.id, name=name, description=description)
    db.add(wl)
    await db.commit()
    await db.refresh(wl)
    return {"id": str(wl.id), "name": wl.name, "message": "Watchlist created"}


@router.post("/{watchlist_id}/items")
async def add_to_watchlist(watchlist_id: str, stock_id: str = Body(...), notes: str = Body(None), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = WatchlistItem(watchlist_id=watchlist_id, stock_id=stock_id, notes=notes)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": str(item.id), "message": "Stock added to watchlist"}


@router.delete("/{watchlist_id}/items/{item_id}")
async def remove_from_watchlist(watchlist_id: str, item_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WatchlistItem).where(WatchlistItem.id == item_id, WatchlistItem.watchlist_id == watchlist_id))
    await db.commit()
    return {"message": "Stock removed from watchlist"}


@router.delete("/{watchlist_id}")
async def delete_watchlist(watchlist_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id))
    await db.commit()
    return {"message": "Watchlist deleted"}
