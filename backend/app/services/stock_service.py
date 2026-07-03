from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import joinedload
from app.models.stock import Stock, StockPrice, StockFundamental
from typing import Optional, List, Dict
from datetime import datetime, timedelta


class StockService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_stocks(self, query: str, limit: int = 20) -> List[Stock]:
        stmt = (
            select(Stock)
            .filter(
                Stock.is_active == True,
                (Stock.symbol.ilike(f"%{query}%") | Stock.company_name.ilike(f"%{query}%"))
            )
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_stock_by_symbol(self, symbol: str) -> Optional[Stock]:
        result = await self.db.execute(
            select(Stock).options(
                joinedload(Stock.fundamentals),
            ).filter(Stock.symbol == symbol, Stock.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_stock_prices(
        self, stock_id: str, interval: str = "1D", limit: int = 100
    ) -> List[StockPrice]:
        now = datetime.utcnow()
        if interval == "1D":
            since = now - timedelta(days=limit)
        elif interval == "1W":
            since = now - timedelta(weeks=limit)
        elif interval == "1M":
            since = now - timedelta(days=30 * limit)
        else:
            since = now - timedelta(days=limit)

        stmt = (
            select(StockPrice)
            .filter(
                StockPrice.stock_id == stock_id,
                StockPrice.date >= since,
            )
            .order_by(StockPrice.date.asc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_market_overview(self) -> Dict:
        nifty = await self._get_index_data("NIFTY")
        sensex = await self._get_index_data("SENSEX")
        banknifty = await self._get_index_data("BANKNIFTY")
        vix = await self._get_index_data("INDIAVIX")

        gainers = await self._get_top_movers("gainers", 10)
        losers = await self._get_top_movers("losers", 10)
        active = await self._get_most_active(10)

        return {
            "indices": {"nifty": nifty, "sensex": sensex, "banknifty": banknifty, "vix": vix},
            "gainers": gainers,
            "losers": losers,
            "most_active": active,
        }

    async def _get_index_data(self, symbol: str) -> Optional[Dict]:
        result = await self.db.execute(
            select(Stock).filter(Stock.symbol == symbol, Stock.is_index == True)
        )
        stock = result.scalar_one_or_none()
        if not stock:
            return None

        prices = await self.get_stock_prices(str(stock.id), "1D", 2)
        if len(prices) < 2:
            return None

        latest = prices[-1]
        prev = prices[-2]
        change = latest.close - prev.close
        change_percent = (change / prev.close) * 100

        return {
            "symbol": symbol,
            "current_value": latest.close,
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "high": latest.high,
            "low": latest.low,
            "is_up": change >= 0,
        }

    async def _get_top_movers(self, movers_type: str, limit: int) -> List[Dict]:
        subq = (
            select(
                StockPrice.stock_id,
                func.max(StockPrice.date).label("max_date"),
            )
            .group_by(StockPrice.stock_id)
            .subquery()
        )
        latest_two = (
            select(
                StockPrice.stock_id,
                StockPrice.close,
                StockPrice.date,
                func.row_number().over(
                    partition_by=StockPrice.stock_id,
                    order_by=StockPrice.date.desc(),
                ).label("rn"),
            )
            .join(subq, StockPrice.stock_id == subq.c.stock_id)
            .filter(
                StockPrice.date >= func.now() - timedelta(days=10),
            )
            .subquery()
        )
        cte = (
            select(latest_two)
            .filter(latest_two.c.rn <= 2)
            .cte("cte")
        )
        pairs = (
            select(
                cte.c.stock_id,
                func.max(cte.c.close).filter(cte.c.rn == 1).label("latest_close"),
                func.max(cte.c.close).filter(cte.c.rn == 2).label("prev_close"),
            )
            .group_by(cte.c.stock_id)
            .subquery()
        )
        change_expr = (pairs.c.latest_close - pairs.c.prev_close) / pairs.c.prev_close * 100
        order = change_expr.desc() if movers_type == "gainers" else change_expr.asc()
        stmt = (
            select(
                Stock.symbol,
                Stock.company_name,
                Stock.sector,
                pairs.c.latest_close,
                change_expr.label("change_percent"),
            )
            .join(pairs, Stock.id == pairs.c.stock_id)
            .filter(
                Stock.is_active == True,
                Stock.is_index == False,
                pairs.c.latest_close.isnot(None),
                pairs.c.prev_close.isnot(None),
            )
            .order_by(order)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            {
                "symbol": r.symbol,
                "company_name": r.company_name,
                "sector": r.sector,
                "price": round(float(r.latest_close), 2) if r.latest_close else None,
                "change_percent": round(float(r.change_percent), 2) if r.change_percent else None,
            }
            for r in rows
        ]

    async def _get_most_active(self, limit: int) -> List[Dict]:
        latest_date_subq = (
            select(
                StockPrice.stock_id,
                func.max(StockPrice.date).label("max_date"),
            )
            .group_by(StockPrice.stock_id)
            .subquery()
        )
        stmt = (
            select(
                Stock.symbol,
                Stock.company_name,
                StockPrice.close,
                StockPrice.volume,
                Stock.sector,
            )
            .join(StockPrice, Stock.id == StockPrice.stock_id)
            .join(
                latest_date_subq,
                (StockPrice.stock_id == latest_date_subq.c.stock_id)
                & (StockPrice.date == latest_date_subq.c.max_date),
            )
            .filter(
                Stock.is_active == True,
                Stock.is_index == False,
            )
            .order_by(StockPrice.volume.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            {
                "symbol": r.symbol,
                "company_name": r.company_name,
                "sector": r.sector,
                "price": round(float(r.close), 2) if r.close else None,
                "volume": int(r.volume) if r.volume else 0,
            }
            for r in rows
        ]
