from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, text
from app.core.database import get_db
from app.services.stock_service import StockService
from app.models.stock import Stock, StockPrice, StockNews, CorporateAction

router = APIRouter()


@router.get("/overview")
async def get_market_overview(db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    return await service.get_market_overview()


@router.get("/market-movers")
async def get_market_movers(type: str = "gainers", limit: int = 10, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    if type == "gainers":
        return {"type": type, "data": await service._get_top_movers("gainers", limit)}
    elif type == "losers":
        return {"type": type, "data": await service._get_top_movers("losers", limit)}
    elif type == "active":
        return {"type": type, "data": await service._get_most_active(limit)}
    return {"type": type, "data": []}


@router.get("/indices")
async def get_indices(db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    nifty = await service._get_index_data("NIFTY")
    sensex = await service._get_index_data("SENSEX")
    banknifty = await service._get_index_data("BANKNIFTY")
    vix = await service._get_index_data("INDIAVIX")
    return {"indices": [
        {"name": "NIFTY", "data": nifty},
        {"name": "SENSEX", "data": sensex},
        {"name": "BANKNIFTY", "data": banknifty},
        {"name": "INDIAVIX", "data": vix},
    ]}


@router.get("/news")
async def get_market_news(limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StockNews)
        .filter(StockNews.is_market_news == True)
        .order_by(StockNews.published_at.desc())
        .limit(limit)
    )
    news_items = result.scalars().all()
    if not news_items:
        result = await db.execute(
            select(Stock).filter(Stock.is_active == True).limit(limit)
        )
        stocks = result.scalars().all()
        return [
            {
                "title": f"{stock.company_name} - Market Update",
                "description": f"Latest updates for {stock.company_name} in the {stock.sector or 'N/A'} sector.",
                "symbol": stock.symbol,
                "source": "TradeAI",
                "published_at": str(stock.created_at),
            }
            for stock in stocks[:10]
        ]
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "description": n.description,
            "source": n.source,
            "url": n.url,
            "published_at": n.published_at.isoformat() if n.published_at else None,
            "sentiment": n.sentiment,
        }
        for n in news_items
    ]


@router.get("/corporate-actions")
async def get_corporate_actions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CorporateAction)
        .order_by(CorporateAction.announced_date.desc())
        .limit(20)
    )
    actions = result.scalars().all()
    return {"actions": [
        {
            "id": str(a.id),
            "symbol": a.stock.symbol if a.stock else None,
            "action_type": a.action_type,
            "description": a.description,
            "ex_date": a.ex_date.isoformat() if a.ex_date else None,
            "announced_date": a.announced_date.isoformat() if a.announced_date else None,
            "value": a.value,
        }
        for a in actions
    ]}


@router.get("/calendar")
async def get_economic_calendar():
    return {"events": []}


@router.get("/ipo")
async def get_ipo_calendar():
    return {"ipo": []}
