from app.tasks.market_data import get_sync_engine, get_stocks_list, YFINANCE_MAP
from sqlalchemy.orm import Session
import yfinance as yf
from datetime import datetime, timezone

engine = get_sync_engine()
with Session(engine) as session:
    stocks = get_stocks_list(session)
    print(f"Total stocks: {len(stocks)}")
    for sid, sym in stocks[:3]:
        yf_sym = YFINANCE_MAP.get(sym) or (sym + ".NS")
        print(f"Testing {sym} -> {yf_sym}")
        ticker = yf.Ticker(yf_sym)
        hist = ticker.history(period="5d", interval="1d")
        print(f"  History: {hist.shape}")
        if not hist.empty:
            latest = hist.iloc[-1]
            print(f"  Latest: O={latest['Open']} H={latest['High']} L={latest['Low']} C={latest['Close']} V={latest['Volume']}")

            latest_date = hist.index[-1]
            existing = session.execute(
                "SELECT id FROM stock_prices WHERE stock_id = %s AND date::date = %s LIMIT 1",
                (sid, latest_date.date()),
            ).fetchone()
            if existing:
                print(f"  Price record EXISTS: {existing[0]}")
            else:
                print(f"  No existing record for {latest_date.date()}")
        else:
            print("  Empty history")
