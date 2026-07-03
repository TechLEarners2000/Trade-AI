from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.stock import Stock, StockFundamental
from app.models.stock import StockPrice
from typing import List, Dict
import json


class ScannerService:
    FIELD_MAP = {
        "price": "price",
        "volume": "volume",
        "market_cap": "market_cap",
        "pe_ratio": "pe_ratio",
        "pb_ratio": "pb_ratio",
        "eps": "eps",
        "roe": "roe",
        "roce": "roce",
        "debt_equity": "debt_to_equity",
        "current_ratio": "current_ratio",
        "quick_ratio": "quick_ratio",
        "dividend_yield": "dividend_yield",
        "promoter_holding": "promoter_holding",
        "fii_holding": "fii_holding",
        "dii_holding": "dii_holding",
        "mutual_fund_holding": "mutual_fund_holding",
        "sales_growth": "sales_growth",
        "profit_growth": "profit_growth",
        "operating_margin": "operating_margin",
        "net_margin": "net_margin",
    }

    OPERATOR_MAP = {
        "above": ">",
        "below": "<",
        "equals": "=",
        "greater_than": ">",
        "less_than": "<",
        "between": "between",
    }

    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute_scan(self, conditions: List[Dict], logic: str = "AND", limit: int = 50, offset: int = 0) -> List[Dict]:
        query = select(Stock).join(StockFundamental, Stock.id == StockFundamental.stock_id, isouter=True)
        filters = []

        for cond in conditions:
            field = cond.get("field")
            operator = cond.get("operator")
            value = cond.get("value")

            filter_cond = self._build_condition(field, operator, value)
            if filter_cond is not None:
                filters.append(filter_cond)

        if filters:
            if logic.upper() == "OR":
                query = query.where(or_(*filters))
            else:
                query = query.where(and_(*filters))

        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        stocks = result.scalars().all()

        return [
            {"symbol": s.symbol, "company_name": s.company_name, "sector": s.sector, "market_cap": s.market_cap}
            for s in stocks
        ]

    def _build_condition(self, field: str, operator: str, value: str):
        db_field = self.FIELD_MAP.get(field)
        if not db_field:
            return None

        try:
            num_value = float(value)
        except ValueError:
            return None

        col = getattr(StockFundamental, db_field, None)
        if col is None:
            col = getattr(Stock, db_field, None)
        if col is None:
            return None

        if operator in ("above", "greater_than", ">"):
            return col > num_value
        elif operator in ("below", "less_than", "<"):
            return col < num_value
        elif operator == "equals":
            return col == num_value
        elif operator == "between":
            return col.between(num_value, float(value.split(",")[1]) if "," in value else num_value * 1.1)

        return None
