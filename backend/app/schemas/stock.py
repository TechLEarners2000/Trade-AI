import uuid
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class StockBasic(BaseModel):
    id: uuid.UUID
    symbol: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class StockPriceResponse(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    delivery_percentage: Optional[float] = None
    vwap: Optional[float] = None
    oi: Optional[int] = None

    class Config:
        from_attributes = True


class StockDetail(StockBasic):
    bse_code: Optional[str] = None
    nse_symbol: Optional[str] = None
    isin: Optional[str] = None
    face_value: Optional[float] = None
    listing_date: Optional[date] = None
    description: Optional[str] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    eps: Optional[float] = None
    book_value: Optional[float] = None
    dividend_yield: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    promoter_holding: Optional[float] = None
    fii_holding: Optional[float] = None
    dii_holding: Optional[float] = None
    mutual_fund_holding: Optional[float] = None

    class Config:
        from_attributes = True


class TechnicalIndicator(BaseModel):
    name: str
    value: float
    signal: Optional[str] = None


class PatternResult(BaseModel):
    pattern_name: str
    direction: str
    confidence: float
    description: Optional[str] = None


class MarketOverview(BaseModel):
    index_name: str
    current_value: float
    change: float
    change_percent: float
    high: Optional[float] = None
    low: Optional[float] = None
    is_up: bool


class MarketMovers(BaseModel):
    symbol: str
    company_name: str
    last_price: float
    change: float
    change_percent: float
    volume: Optional[int] = None


class ScannerCondition(BaseModel):
    field: str
    operator: str
    value: str
    logic_group: Optional[str] = "AND"


class ScannerRequest(BaseModel):
    conditions: List[ScannerCondition]
    logic: str = "AND"
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    limit: int = 50
    offset: int = 0


class ScannerResult(BaseModel):
    symbol: str
    company_name: str
    last_price: float
    change_percent: float
    matched_conditions: List[str]
    score: Optional[float] = None
