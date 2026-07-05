from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.core.database import get_db
from app.services.stock_service import StockService
from app.models.stock import Stock, StockPrice, StockNews, CorporateAction

router = APIRouter()


@router.get("/overview")
async def get_market_overview(limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    return await service.get_market_overview(limit=limit)


@router.get("/market-movers")
async def get_market_movers(
    type: str = "gainers",
    limit: Optional[int] = Query(None),
    sector: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    effective_limit = min(limit if limit is not None and limit > 0 else 500, 500)
    if type == "gainers":
        return {"type": type, "data": await service._get_top_movers("gainers", effective_limit, sector)}
    elif type == "losers":
        return {"type": type, "data": await service._get_top_movers("losers", effective_limit, sector)}
    elif type == "active":
        return {"type": type, "data": await service._get_most_active(effective_limit)}
    return {"type": type, "data": []}


@router.get("/indices")
async def get_indices(
    history_days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    index_data = await service._get_all_index_data()

    history = {}
    for symbol in ["NIFTY", "SENSEX", "BANKNIFTY", "INDIAVIX"]:
        stock_result = await db.execute(
            select(Stock).filter(Stock.symbol == symbol, Stock.is_index == True)
        )
        stock = stock_result.scalar_one_or_none()
        if not stock:
            history[symbol] = []
            continue
        prices_page = await service.get_stock_prices(str(stock.id), "1D", history_days)
        history[symbol] = [
            {
                "date": p.get("date", ""),
                "open": p.get("open", 0),
                "high": p.get("high", 0),
                "low": p.get("low", 0),
                "close": p.get("close", 0),
            }
            for p in prices_page.items
        ]

    indices_list = []
    for symbol_key, name in [("nifty", "NIFTY"), ("sensex", "SENSEX"), ("banknifty", "BANKNIFTY"), ("vix", "INDIAVIX")]:
        data = index_data.get(symbol_key)
        indices_list.append({"name": name, "data": data})

    return {
        "indices": indices_list,
        "history": history,
    }


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
            for stock in stocks
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
