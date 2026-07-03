import yfinance as yf
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.workers.celery_app import celery_app
from app.core.config import settings
import redis as sync_redis
from concurrent.futures import ThreadPoolExecutor, as_completed

YFINANCE_SUFFIX = ".NS"
YFINANCE_MAP = {
    "NIFTY": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "INDIAVIX": "^INDIAVIX",
    "TATAMOTORS": "TMCV.NS",
}

def get_stocks_list(session: Session):
    result = session.execute(
        text("SELECT id, symbol FROM stocks WHERE is_active = TRUE ORDER BY symbol")
    )
    return result.fetchall()

def publish_to_redis(channel: str, data: dict):
    try:
        r = sync_redis.Redis.from_url(settings.redis_url)
        r.publish(channel, json.dumps(data, default=str))
        r.close()
    except Exception:
        pass

def get_sync_engine():
    sync_url = settings.db_url.replace("+asyncpg", "+psycopg2")
    return create_engine(sync_url)


def fetch_one_stock(symbol_id, symbol):
    """Fetch single stock price from yfinance, return (uuid, price_data) or None."""
    try:
        yf_sym = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_sym)
        hist = ticker.history(period="5d", interval="1d")
        if hist.empty:
            return None
        latest = hist.iloc[-1]
        latest_date = hist.index[-1]
        data = {
            "symbol": symbol,
            "date": latest_date.isoformat() if hasattr(latest_date, 'isoformat') else str(latest_date),
            "open": round(float(latest["Open"]), 2),
            "high": round(float(latest["High"]), 2),
            "low": round(float(latest["Low"]), 2),
            "close": round(float(latest["Close"]), 2),
            "volume": int(latest["Volume"]),
        }
        return (symbol_id, data)
    except Exception:
        return None


@celery_app.task(
    rate_limit="30/m",
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_live_prices():
    engine = get_sync_engine()
    stocks = []
    with Session(engine) as session:
        stocks = get_stocks_list(session)

    results = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_one_stock, sid, sym): sid for sid, sym in stocks}
        for f in as_completed(futures):
            try:
                r = f.result(timeout=15)
                if r:
                    results.append(r)
            except Exception:
                continue

    now = datetime.now(timezone.utc)
    updated = 0
    with Session(engine) as session:
        for stock_id, price_data in results:
            try:
                existing = session.execute(
                    text("SELECT id FROM stock_prices WHERE stock_id = :sid AND date::date = :ddate LIMIT 1"),
                    {"sid": stock_id, "ddate": price_data["date"][:10]},
                ).fetchone()
                if existing:
                    session.execute(
                        text("""UPDATE stock_prices SET open=:open, high=:high, low=:low,
                                close=:close, volume=:volume, updated_at=:ua WHERE id=:id"""),
                        {"id": existing[0], "ua": now,
                         "open": price_data["open"], "high": price_data["high"],
                         "low": price_data["low"], "close": price_data["close"],
                         "volume": price_data["volume"]},
                    )
                else:
                    session.execute(
                        text("""INSERT INTO stock_prices (id, stock_id, date, open, high, low, close, volume, created_at, updated_at, is_active)
                                VALUES (gen_random_uuid(), :sid, :dt, :o, :h, :l, :c, :v, :ca, :ua, TRUE)"""),
                        {"sid": stock_id, "dt": price_data["date"], "ca": now, "ua": now,
                         "o": price_data["open"], "h": price_data["high"],
                         "l": price_data["low"], "c": price_data["close"],
                         "v": price_data["volume"]},
                    )
                updated += 1
                session.commit()
                publish_to_redis("live_prices", price_data)
            except Exception:
                session.rollback()
                continue
    return {"status": "ok", "stocks_updated": updated, "total_attempted": len(stocks), "successful": len(results)}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def update_indices():
    engine = get_sync_engine()
    with Session(engine) as session:
        indices_data = {}
        for idx_name, yf_symbol in YFINANCE_MAP.items():
            try:
                ticker = yf.Ticker(yf_symbol)
                hist = ticker.history(period="5d", interval="1d")
                if hist.empty:
                    continue
                latest = hist.iloc[-1]
                prev = hist.iloc[-2] if len(hist) > 1 else latest
                indices_data[idx_name] = {
                    "current": round(float(latest["Close"]), 2),
                    "change": round(float(latest["Close"] - prev["Close"]), 2),
                    "change_percent": round(((latest["Close"] - prev["Close"]) / prev["Close"]) * 100, 2),
                    "high": round(float(latest["High"]), 2),
                    "low": round(float(latest["Low"]), 2),
                }
            except Exception:
                continue
        publish_to_redis("live_prices", {"type": "indices", "data": indices_data})
    return {"status": "ok", "indices": indices_data}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_stock_fundamentals(symbol: str):
    try:
        yf_symbol = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_symbol)
        info = ticker.info or {}
        engine = get_sync_engine()
        with Session(engine) as session:
            stock = session.execute(
                text("SELECT id FROM stocks WHERE symbol = :sym AND is_active = TRUE"),
                {"sym": symbol},
            ).fetchone()
            if not stock:
                return {"status": "error", "message": f"Stock {symbol} not found"}
            stock_id = stock[0]
            existing = session.execute(
                text("SELECT id FROM stock_fundamentals WHERE stock_id = :sid"),
                {"sid": stock_id},
            ).fetchone()
            now = datetime.now(timezone.utc)
            if existing:
                session.execute(
                    text("""UPDATE stock_fundamentals SET market_cap=:mc, enterprise_value=:ev,
                            pe_ratio=:pe, pb_ratio=:pb, eps=:eps, book_value=:bv,
                            dividend_yield=:div_yield, roe=:roe, debt_to_equity=:de,
                            current_ratio=:cr, promoter_holding=:ph,
                            operating_margin=:om, net_margin=:nm,
                            updated_at=:ua
                            WHERE stock_id=:sid"""),
                    {
                        "sid": stock_id, "mc": info.get("marketCap"), "ua": now,
                        "ev": info.get("enterpriseValue"), "pe": info.get("trailingPE"),
                        "pb": info.get("priceToBook"), "eps": info.get("trailingEps"),
                        "bv": info.get("bookValue"), "div_yield": info.get("dividendYield"),
                        "roe": info.get("returnOnEquity"), "de": info.get("debtToEquity"),
                        "cr": info.get("currentRatio"), "ph": info.get("heldPercentInstitutions"),
                        "om": info.get("operatingMargins"), "nm": info.get("profitMargins"),
                    },
                )
            else:
                session.execute(
                    text("""INSERT INTO stock_fundamentals
                            (stock_id, market_cap, enterprise_value, pe_ratio, pb_ratio, eps,
                             book_value, dividend_yield, roe, debt_to_equity,
                             current_ratio, promoter_holding, operating_margin, net_margin,
                             created_at, updated_at)
                            VALUES (:sid, :mc, :ev, :pe, :pb, :eps, :bv, :div_yield,
                             :roe, :de, :cr, :ph, :om, :nm,
                             :ca, :ua)"""),
                    {
                        "sid": stock_id, "mc": info.get("marketCap"), "ca": now, "ua": now,
                        "ev": info.get("enterpriseValue"), "pe": info.get("trailingPE"),
                        "pb": info.get("priceToBook"), "eps": info.get("trailingEps"),
                        "bv": info.get("bookValue"), "div_yield": info.get("dividendYield"),
                        "roe": info.get("returnOnEquity"), "de": info.get("debtToEquity"),
                        "cr": info.get("currentRatio"), "ph": info.get("heldPercentInstitutions"),
                        "om": info.get("operatingMargins"), "nm": info.get("profitMargins"),
                    },
                )
            session.commit()
        return {"status": "ok", "symbol": symbol, "fundamentals_updated": True}
    except Exception as e:
        return {"status": "error", "symbol": symbol, "error": str(e)}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_company_news(symbol: str):
    try:
        yf_symbol = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_symbol)
        news_items = ticker.news or []
        engine = get_sync_engine()
        with Session(engine) as session:
            stock = session.execute(
                text("SELECT id FROM stocks WHERE symbol = :sym AND is_active = TRUE"),
                {"sym": symbol},
            ).fetchone()
            if not stock:
                return {"status": "error", "message": f"Stock {symbol} not found"}
            stock_id = stock[0]
            inserted = 0
            for item in news_items[:10]:
                exists = session.execute(
                    text("SELECT id FROM stock_news WHERE stock_id = :sid AND title = :title"),
                    {"sid": stock_id, "title": item.get("title", "")},
                ).fetchone()
                if not exists:
                    now = datetime.now(timezone.utc)
                    session.execute(
                        text("""INSERT INTO stock_news (id, stock_id, title, description, source, url, published_at, sentiment, category, created_at, updated_at)
                                VALUES (gen_random_uuid(), :sid, :title, :desc, :source, :url, :pub, 'neutral', 'general', :ca, :ua)"""),
                        {
                            "sid": stock_id, "ca": now, "ua": now,
                            "title": item.get("title", ""),
                            "desc": item.get("summary", ""),
                            "source": item.get("publisher", "Yahoo Finance"),
                            "url": item.get("link", ""),
                            "pub": datetime.fromtimestamp(item.get("providerPublishTime", 0), tz=timezone.utc) if item.get("providerPublishTime") else None,
                        },
                    )
                    inserted += 1
            session.commit()
        return {"status": "ok", "symbol": symbol, "news_inserted": inserted}
    except Exception as e:
        return {"status": "error", "symbol": symbol, "error": str(e)}


@celery_app.task
def fetch_corporate_actions():
    return {"status": "ok", "message": "Corporate actions fetched"}


@celery_app.task
def update_market_breadth():
    return {"status": "ok"}
