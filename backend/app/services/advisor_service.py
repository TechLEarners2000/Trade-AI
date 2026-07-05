import asyncio
import numpy as np
import yfinance as yf
import pandas as pd
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.stock import Stock, StockPrice
from app.services.technical_service import TechnicalAnalysisService as TA
from app.core.redis_client import cached


class AdvisorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _fetch_history(self, yf_symbol: str, period: str = "1mo") -> pd.DataFrame:
        try:
            ticker = yf.Ticker(yf_symbol)
            df = await asyncio.to_thread(ticker.history, period=period)
            if df.empty:
                raise ValueError("Empty response from yfinance")
            return df
        except Exception:
            return pd.DataFrame()

    def _predict(self, closes: List[float], horizon_days: int = 7) -> Tuple[List[float], str]:
        if len(closes) < 3:
            return [], "low"
        recent = closes[-14:] if len(closes) >= 14 else closes
        x = np.arange(len(recent))
        coeffs = np.polyfit(x, recent, 1)
        trend = np.poly1d(coeffs)
        fitted = trend(x)
        residuals = recent - fitted
        ss_res = np.sum(residuals ** 2)
        ss_tot = np.sum((recent - np.mean(recent)) ** 2)
        r_squared = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0
        confidence = "high" if r_squared >= 0.8 else "medium" if r_squared >= 0.5 else "low"
        future_x = np.arange(len(recent), len(recent) + horizon_days)
        predictions = trend(future_x).tolist()
        return [max(0, p) for p in predictions], confidence

    def _score_momentum(self, closes: List[float]) -> Dict:
        if len(closes) < 20:
            return {"recommendation": "HOLD", "signal_strength": 0, "rsi": 50}
        prices = [{"close": c, "open": c, "high": c, "low": c, "volume": 0} for c in closes]
        sma5 = pd.Series(closes).rolling(5).mean().iloc[-1]
        sma20 = pd.Series(closes).rolling(20).mean().iloc[-1]
        current_price = closes[-1]
        x = np.arange(14)
        recent = np.array(closes[-14:])
        slope = np.polyfit(x, recent, 1)[0] if len(recent) >= 2 else 0
        rsi_list = TA.compute_rsi(prices, 14)
        rsi = rsi_list[-1] if rsi_list else 50
        uptrend = slope > 0
        if uptrend and current_price > sma20 and rsi < 70:
            recommendation = "BUY"
            score = min(100, int(
                30 * (1 if uptrend else 0) +
                25 * min(1, (current_price - sma20) / sma20 * 100) +
                25 * (1 - min(1, rsi / 70)) +
                20 * min(1, abs(slope) * 100)
            ))
        elif not uptrend or rsi > 75:
            recommendation = "AVOID"
            score = max(0, int(
                40 * (1 - min(1, abs(slope) * 50)) +
                30 * (1 - min(1, rsi / 100)) +
                30 * (1 if rsi < 75 else 0)
            ))
        else:
            recommendation = "HOLD"
            score = 50
        return {"recommendation": recommendation, "signal_strength": score, "rsi": round(rsi, 1)}

    @cached(ttl=300, skip_args=1)
    async def analyze_stock(self, symbol: str) -> Dict:
        result = await self.db.execute(
            select(Stock).where(Stock.symbol == symbol.upper(), Stock.is_active == True)
        )
        stock = result.scalar_one_or_none()
        if not stock:
            return {"error": "Stock not found"}
        yf_symbol = stock.nse_symbol or f"{symbol}.NS"
        df = await self._fetch_history(yf_symbol)
        history = []
        closes = []
        if not df.empty:
            for date_idx, row in df.iterrows():
                entry = {"date": date_idx.isoformat(), "close": round(float(row["Close"]), 2)}
                history.append(entry)
                closes.append(float(row["Close"]))
        else:
            prices_result = await self.db.execute(
                select(StockPrice)
                .where(StockPrice.stock_id == stock.id)
                .order_by(StockPrice.date.desc())
                .limit(30)
            )
            price_rows = list(reversed(prices_result.scalars().all()))
            if not price_rows:
                return {"error": "No price data available"}
            for p in price_rows:
                history.append({"date": p.date.isoformat(), "close": round(float(p.close), 2)})
                closes.append(float(p.close))
        if len(closes) < 3:
            return {"error": "Insufficient price data"}
        predicted_values, confidence = self._predict(closes)
        momentum = self._score_momentum(closes)
        last_date = datetime.fromisoformat(history[-1]["date"]) if isinstance(history[-1]["date"], str) else history[-1]["date"]
        prediction = []
        for i in range(len(predicted_values)):
            d = (last_date + timedelta(days=i + 1)).isoformat()
            prediction.append({"date": d, "predicted_close": round(predicted_values[i], 2)})
        current_price = closes[-1]
        prev_close = closes[-2] if len(closes) >= 2 else current_price
        change_percent = round((current_price - prev_close) / prev_close * 100, 2) if prev_close else 0
        rationale_lines = []
        if momentum["recommendation"] == "BUY":
            rationale_lines.append(f"{symbol} is in an uptrend with positive momentum.")
            rationale_lines.append(f"RSI at a healthy level suggests room for further upside.")
        elif momentum["recommendation"] == "AVOID":
            rationale_lines.append(f"{symbol} is showing signs of weakness or overbought conditions.")
        else:
            rationale_lines.append(f"{symbol} is in a neutral zone. Waiting for clearer signals is advisable.")
        rationale_lines.append(f"Prediction confidence: {confidence}.")
        return {
            "symbol": stock.symbol,
            "company_name": stock.company_name,
            "history": history,
            "prediction": prediction,
            "current_price": current_price,
            "change_percent": change_percent,
            "recommendation": momentum["recommendation"],
            "signal_strength": momentum["signal_strength"],
            "rationale": " ".join(rationale_lines),
            "confidence": confidence,
            "rsi": momentum["rsi"],
        }

    @cached(ttl=120, skip_args=1)
    async def list_ranked_stocks(self) -> List[Dict]:
        result = await self.db.execute(
            select(Stock).where(Stock.is_active == True, Stock.is_index == False).limit(200)
        )
        stocks = result.scalars().all()
        semaphore = asyncio.Semaphore(10)

        async def _fetch_quote(stock: Stock) -> Optional[Dict]:
            async with semaphore:
                yf_symbol = stock.nse_symbol or f"{stock.symbol}.NS"
                try:
                    df = await self._fetch_history(yf_symbol, period="5d")
                    if df.empty or len(df) < 2:
                        return None
                    closes = df["Close"].tolist()
                    price = float(closes[-1])
                    prev_close = float(closes[-2])
                    change_percent = round((price - prev_close) / prev_close * 100, 2)
                    prices_shim = [{"close": c, "open": c, "high": c, "low": c, "volume": 0} for c in closes]
                    sma5 = pd.Series(closes).rolling(5).mean().iloc[-1] if len(closes) >= 5 else price
                    sma20_val = pd.Series(closes).rolling(20).mean().iloc[-1] if len(closes) >= 20 else price
                    rsi_list = TA.compute_rsi(prices_shim, 14)
                    rsi = rsi_list[-1] if rsi_list else 50
                    uptrend = price > sma20_val
                    if uptrend and price > sma5 and price > sma20_val and rsi < 70:
                        rec = "BUY"
                        strength = min(100, int(50 + 25 * (1 - rsi / 70) + 25 * abs(change_percent) / 5))
                    elif not uptrend or rsi > 75:
                        rec = "AVOID"
                        strength = max(0, int(50 - 25 * abs(rsi - 50) / 25))
                    else:
                        rec = "HOLD"
                        strength = 50
                    return {
                        "symbol": stock.symbol,
                        "company_name": stock.company_name,
                        "price": round(price, 2),
                        "change_percent": change_percent,
                        "recommendation": rec,
                        "signal_strength": strength,
                    }
                except Exception:
                    return None

        tasks = [_fetch_quote(s) for s in stocks]
        results = await asyncio.gather(*tasks)
        ranked = [r for r in results if r is not None]
        ranked.sort(key=lambda x: x["change_percent"], reverse=True)
        return ranked

    async def suggest_investment(self, amount: float) -> Dict:
        ranked = await self.list_ranked_stocks()
        buy_candidates = [s for s in ranked if s["recommendation"] == "BUY"]
        buy_candidates.sort(key=lambda x: x["signal_strength"], reverse=True)
        top_picks = buy_candidates[:5]
        if not top_picks:
            return {"suggestions": [], "unallocated_amount": amount}
        total_strength = sum(s["signal_strength"] for s in top_picks)
        suggestions = []
        remaining = amount
        for stock_data in top_picks:
            if remaining <= 0:
                break
            weight = stock_data["signal_strength"] / total_strength if total_strength > 0 else 1 / len(top_picks)
            allocation = round(amount * weight, 2)
            if allocation > remaining:
                allocation = remaining
            qty = int(allocation / stock_data["price"]) if stock_data["price"] > 0 else 0
            if qty < 1:
                continue
            actual_allocation = round(qty * stock_data["price"], 2)
            if actual_allocation > remaining:
                actual_allocation = remaining
            suggestions.append({
                "symbol": stock_data["symbol"],
                "company_name": stock_data["company_name"],
                "price": stock_data["price"],
                "suggested_qty": qty,
                "allocated_amount": actual_allocation,
                "signal_strength": stock_data["signal_strength"],
                "rationale": f"Strong momentum score of {stock_data['signal_strength']}/100 with positive trend.",
            })
            remaining = round(remaining - actual_allocation, 2)
            total_strength -= stock_data["signal_strength"]
        return {"suggestions": suggestions, "unallocated_amount": remaining}

    async def evaluate_holding(self, symbol: str, buy_price: float, quantity: float) -> Dict:
        analysis = await self.analyze_stock(symbol)
        if "error" in analysis:
            return {"error": analysis["error"]}
        current_price = analysis["current_price"]
        pnl = (current_price - buy_price) * quantity
        pnl_percent = round((current_price - buy_price) / buy_price * 100, 2) if buy_price else 0
        rec = analysis["recommendation"]
        rsi_val = analysis.get("rsi", 50)

        if rec == "AVOID" or rsi_val > 75:
            sell_rec = "SELL"
            if rsi_val > 75:
                rationale = f"RSI is at {rsi_val:.1f} (overbought). Consider booking profits."
            else:
                rationale = f"Trend suggests weakness. Consider exiting to limit downside."
        elif rec == "BUY" and pnl >= 0:
            sell_rec = "HOLD"
            rationale = f"Trend is positive with momentum in your favor. Hold position."
        elif rec == "AVOID" and pnl < 0:
            sell_rec = "SELL"
            rationale = f"In loss with negative outlook. Consider cutting losses."
        else:
            sell_rec = "HOLD"
            rationale = f"Neutral outlook. Monitor price action before deciding."

        return {
            "symbol": symbol,
            "current_price": current_price,
            "buy_price": buy_price,
            "quantity": quantity,
            "pnl": round(pnl, 2),
            "pnl_percent": pnl_percent,
            "sell_recommendation": sell_rec,
            "recommendation": rec,
            "rationale": rationale,
        }
