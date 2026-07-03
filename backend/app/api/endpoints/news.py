from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.stock import StockNews, Stock
from sqlalchemy import select, desc

router = APIRouter()


@router.get("/")
async def get_news(
    category: str = Query(None, regex="^(company|sector|market|economy|global)$"),
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = select(StockNews).where(StockNews.is_market_news == True)
    if category:
        query = query.where(StockNews.category == category)
    query = query.order_by(StockNews.published_at.desc().nulls_last()).limit(limit)
    result = await db.execute(query)
    news = result.scalars().all()
    return [
        {
            "id": str(n.id), "title": n.title, "description": n.description,
            "source": n.source, "url": n.url,
            "published_at": str(n.published_at) if n.published_at else None,
            "sentiment": n.sentiment, "category": n.category,
        }
        for n in news
    ]


@router.get("/company/{symbol}")
async def get_company_news(symbol: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    stock_result = await db.execute(select(Stock).where(Stock.symbol == symbol.upper()))
    stock = stock_result.scalar_one_or_none()
    if not stock:
        return {"error": "Stock not found"}
    result = await db.execute(
        select(StockNews)
        .where(StockNews.stock_id == stock.id)
        .order_by(StockNews.published_at.desc().nulls_last())
        .limit(limit)
    )
    news = result.scalars().all()
    return [
        {
            "id": str(n.id), "title": n.title, "description": n.description,
            "source": n.source, "url": n.url,
            "published_at": str(n.published_at) if n.published_at else None,
            "sentiment": n.sentiment,
        }
        for n in news
    ]
