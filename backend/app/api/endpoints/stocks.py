from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
import numpy as np
from app.core.database import get_db
from app.services.stock_service import StockService
from app.services.technical_service import TechnicalAnalysisService as TA, _clean
from app.schemas.stock import StockBasic, StockDetail, StockPriceResponse, TechnicalIndicator, PatternResult

router = APIRouter()


@router.get("/search")
async def search_stocks(
    query: str = Query(min_length=1),
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    stocks = await service.search_stocks(query, limit)
    return [{"id": str(s.id), "symbol": s.symbol, "company_name": s.company_name, "sector": s.sector} for s in stocks]


@router.get("/{symbol}")
async def get_stock_detail(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    return {
        "id": str(stock.id),
        "symbol": stock.symbol,
        "company_name": stock.company_name,
        "sector": stock.sector,
        "industry": stock.industry,
        "bse_code": stock.bse_code,
        "nse_symbol": stock.nse_symbol,
        "isin": stock.isin,
        "description": stock.description,
        "logo_url": stock.logo_url,
        "face_value": stock.face_value,
        "listing_date": str(stock.listing_date) if stock.listing_date else None,
        "fundamentals": {
            "market_cap": stock.fundamentals.market_cap if stock.fundamentals else None,
            "enterprise_value": stock.fundamentals.enterprise_value if stock.fundamentals else None,
            "pe_ratio": stock.fundamentals.pe_ratio if stock.fundamentals else None,
            "pb_ratio": stock.fundamentals.pb_ratio if stock.fundamentals else None,
            "eps": stock.fundamentals.eps if stock.fundamentals else None,
            "book_value": stock.fundamentals.book_value if stock.fundamentals else None,
            "dividend_yield": stock.fundamentals.dividend_yield if stock.fundamentals else None,
            "roe": stock.fundamentals.roe if stock.fundamentals else None,
            "roce": stock.fundamentals.roce if stock.fundamentals else None,
            "debt_to_equity": stock.fundamentals.debt_to_equity if stock.fundamentals else None,
            "current_ratio": stock.fundamentals.current_ratio if stock.fundamentals else None,
            "promoter_holding": stock.fundamentals.promoter_holding if stock.fundamentals else None,
            "fii_holding": stock.fundamentals.fii_holding if stock.fundamentals else None,
            "dii_holding": stock.fundamentals.dii_holding if stock.fundamentals else None,
            "mutual_fund_holding": stock.fundamentals.mutual_fund_holding if stock.fundamentals else None,
        } if stock.fundamentals else {},
    }


@router.get("/{symbol}/prices")
async def get_stock_prices(
    symbol: str,
    interval: str = Query("1D", regex="^(1m|5m|15m|30m|1h|4h|1D|1W|1M)$"),
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    prices = await service.get_stock_prices(str(stock.id), interval, limit)
    return [
        {
            "date": p.date.isoformat() if hasattr(p.date, 'isoformat') else str(p.date),
            "open": p.open, "high": p.high, "low": p.low, "close": p.close,
            "volume": p.volume, "delivery_percentage": p.delivery_percentage,
            "vwap": p.vwap,
        }
        for p in prices
    ]


@router.get("/{symbol}/technical")
async def get_technical_indicators(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    prices = await service.get_stock_prices(str(stock.id), "1D", 200)
    if not prices:
        return {"error": "No price data"}

    sma20 = TA.compute_sma(prices, 20)
    sma50 = TA.compute_sma(prices, 50) if len(prices) >= 50 else []
    ema20 = TA.compute_ema(prices, 20)
    rsi = TA.compute_rsi(prices, 14)
    macd = TA.compute_macd(prices)
    bb = TA.compute_bollinger_bands(prices)
    adx = TA.compute_adx(prices) if len(prices) >= 28 else []
    atr = TA.compute_atr(prices)
    obv = TA.compute_obv(prices)
    mfi = TA.compute_mfi(prices) if len(prices) >= 20 else []
    stoch = TA.compute_stochastic_rsi(prices) if len(prices) >= 28 else []
    wr = TA.compute_williams_r(prices)
    cci = TA.compute_cci(prices) if len(prices) >= 20 else []
    supertrend = TA.compute_supertrend(prices)

    return {
        "sma_20": _clean(sma20[-1]) if sma20 else None,
        "sma_50": _clean(sma50[-1]) if sma50 else None,
        "ema_20": _clean(ema20[-1]) if ema20 else None,
        "rsi_14": _clean(rsi[-1]) if rsi else None,
        "macd": {k: [_clean(x) for x in v] for k, v in macd.items()},
        "bollinger_bands": {k: [_clean(x) for x in v] for k, v in bb.items()},
        "adx": _clean(adx[-1]) if adx else None,
        "atr": _clean(atr[-1]) if atr else None,
        "obv": _clean(obv[-1]) if obv else None,
        "mfi": _clean(mfi[-1]) if mfi else None,
        "stoch_rsi": _clean(stoch[-1]) if stoch else None,
        "williams_r": _clean(wr[-1]) if wr else None,
        "cci": _clean(cci[-1]) if cci else None,
        "supertrend": {k: [_clean(x) for x in v] for k, v in supertrend.items()},
    }


@router.get("/{symbol}/patterns")
async def get_chart_patterns(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    prices = await service.get_stock_prices(str(stock.id), "1D", 200)
    if not prices:
        return {"error": "No price data"}

    candlestick = TA.detect_candlestick_patterns(prices)
    chart = TA.detect_chart_patterns(prices)
    sr = TA.compute_support_resistance(prices)

    return {
        "candlestick_patterns": candlestick,
        "chart_patterns": chart,
        "support_resistance": {k: [_clean(x) for x in v] for k, v in sr.items()},
    }


@router.get("/{symbol}/fundamentals")
async def get_fundamentals(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock or not stock.fundamentals:
        return {"error": "No fundamentals data"}
    f = stock.fundamentals
    return {
        "market_cap": f.market_cap, "enterprise_value": f.enterprise_value,
        "pe_ratio": f.pe_ratio, "pb_ratio": f.pb_ratio, "eps": f.eps,
        "book_value": f.book_value, "dividend_yield": f.dividend_yield,
        "roe": f.roe, "roce": f.roce, "debt_to_equity": f.debt_to_equity,
        "current_ratio": f.current_ratio, "quick_ratio": f.quick_ratio,
        "promoter_holding": f.promoter_holding, "fii_holding": f.fii_holding,
        "dii_holding": f.dii_holding, "mutual_fund_holding": f.mutual_fund_holding,
        "sales_growth": f.sales_growth, "profit_growth": f.profit_growth,
        "operating_margin": f.operating_margin, "net_margin": f.net_margin,
    }
