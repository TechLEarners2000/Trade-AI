import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple, Any
from app.models.stock import StockPrice
from datetime import datetime


def _clean(val: Any) -> Any:
    if isinstance(val, float):
        return None if (np.isnan(val) or np.isinf(val)) else val
    return val


def _to_series(prices: List) -> pd.DataFrame:
    data = {
        "open": [p["open"] if isinstance(p, dict) else p.open for p in prices],
        "high": [p["high"] if isinstance(p, dict) else p.high for p in prices],
        "low": [p["low"] if isinstance(p, dict) else p.low for p in prices],
        "close": [p["close"] if isinstance(p, dict) else p.close for p in prices],
        "volume": [p["volume"] if isinstance(p, dict) else p.volume for p in prices],
    }
    return pd.DataFrame(data)


class TechnicalAnalysisService:
    @staticmethod
    def compute_sma(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        sma = df["close"].rolling(window=period).mean()
        return sma.dropna().tolist()

    @staticmethod
    def compute_ema(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        ema = df["close"].ewm(span=period, adjust=False).mean()
        return ema.dropna().tolist()

    @staticmethod
    def compute_rsi(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        delta = df["close"].diff()
        gain = delta.where(delta > 0, 0).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.dropna().tolist()

    @staticmethod
    def compute_macd(prices: List[StockPrice]) -> Dict[str, List[float]]:
        df = _to_series(prices)
        ema12 = df["close"].ewm(span=12, adjust=False).mean()
        ema26 = df["close"].ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal = macd_line.ewm(span=9, adjust=False).mean()
        histogram = macd_line - signal
        return {
            "macd": macd_line.dropna().tolist(),
            "signal": signal.dropna().tolist(),
            "histogram": histogram.dropna().tolist(),
        }

    @staticmethod
    def compute_bollinger_bands(prices: List[StockPrice], period: int = 20, std: int = 2) -> Dict[str, List[float]]:
        df = _to_series(prices)
        sma = df["close"].rolling(window=period).mean()
        std_dev = df["close"].rolling(window=period).std()
        upper = sma + (std_dev * std)
        lower = sma - (std_dev * std)
        return {
            "upper": upper.dropna().tolist(),
            "middle": sma.dropna().tolist(),
            "lower": lower.dropna().tolist(),
        }

    @staticmethod
    def compute_adx(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        high, low, close = df["high"], df["low"], df["close"]
        plus_dm = high.diff()
        minus_dm = low.diff()
        tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        plus_di = 100 * (plus_dm.rolling(window=period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=period).mean() / atr)
        dx = abs(plus_di - minus_di) / (plus_di + minus_di) * 100
        adx = dx.rolling(window=period).mean()
        return adx.dropna().tolist()

    @staticmethod
    def compute_atr(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        high, low, close = df["high"], df["low"], df["close"]
        tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr.dropna().tolist()

    @staticmethod
    def compute_obv(prices: List[StockPrice]) -> List[float]:
        df = _to_series(prices)
        obv = (np.sign(df["close"].diff()) * df["volume"]).fillna(0).cumsum()
        return obv.tolist()

    @staticmethod
    def compute_stochastic_rsi(prices: List[StockPrice], period: int = 14) -> List[float]:
        rsi_vals = TechnicalAnalysisService.compute_rsi(prices, period)
        if not rsi_vals:
            return []
        rsi_series = pd.Series(rsi_vals)
        min_rsi = rsi_series.rolling(window=period).min()
        max_rsi = rsi_series.rolling(window=period).max()
        stoch_rsi = (rsi_series - min_rsi) / (max_rsi - min_rsi)
        return stoch_rsi.dropna().tolist()

    @staticmethod
    def compute_williams_r(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        highest_high = df["high"].rolling(window=period).max()
        lowest_low = df["low"].rolling(window=period).min()
        wr = -100 * (highest_high - df["close"]) / (highest_high - lowest_low)
        return wr.dropna().tolist()

    @staticmethod
    def compute_cci(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        tp = (df["high"] + df["low"] + df["close"]) / 3
        sma_tp = tp.rolling(window=period).mean()
        mad = tp.rolling(window=period).apply(lambda x: np.mean(np.abs(x - np.mean(x))))
        cci = (tp - sma_tp) / (0.015 * mad)
        return cci.dropna().tolist()

    @staticmethod
    def compute_mfi(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        typical_price = (df["high"] + df["low"] + df["close"]) / 3
        money_flow = typical_price * df["volume"]
        positive_flow = money_flow.where(typical_price > typical_price.shift(), 0).rolling(window=period).sum()
        negative_flow = money_flow.where(typical_price < typical_price.shift(), 0).rolling(window=period).sum()
        mfi = 100 - (100 / (1 + positive_flow / negative_flow))
        return mfi.dropna().tolist()

    @staticmethod
    def compute_supertrend(prices: List[StockPrice], period: int = 10, multiplier: float = 3.0) -> Dict[str, List]:
        df = _to_series(prices)
        hl_avg = ((df["high"] + df["low"]) / 2).values
        atr = TechnicalAnalysisService.compute_atr(prices, period)
        if not atr:
            return {"trend": [], "upper": [], "lower": []}
        atr_arr = np.array(atr)
        offset = len(df) - len(atr_arr)
        upper_band = np.full(len(df), np.nan)
        lower_band = np.full(len(df), np.nan)
        upper_band[offset:] = hl_avg[offset:] + multiplier * atr_arr
        lower_band[offset:] = hl_avg[offset:] - multiplier * atr_arr
        supertrend = np.full(len(df), True)
        supertrend[offset:] = df["close"].values[offset:] <= upper_band[offset:]
        return {
            "trend": [bool(x) for x in supertrend],
            "upper": [float(x) if not (np.isnan(x) or np.isinf(x)) else None for x in upper_band],
            "lower": [float(x) if not (np.isnan(x) or np.isinf(x)) else None for x in lower_band],
        }

    @staticmethod
    def detect_candlestick_patterns(prices: List[StockPrice]) -> List[Dict]:
        patterns = []
        if len(prices) < 2:
            return patterns
        last = prices[-1]
        prev = prices[-2]

        body = abs(last.close - last.open)
        upper_shadow = last.high - max(last.close, last.open)
        lower_shadow = min(last.close, last.open) - last.low
        total_range = last.high - last.low

        if total_range == 0:
            return patterns

        # Hammer
        if body <= total_range * 0.3 and lower_shadow >= body * 2 and upper_shadow <= body * 0.3:
            patterns.append({"pattern": "Hammer", "direction": "bullish", "confidence": 0.8})

        # Shooting Star
        if body <= total_range * 0.3 and upper_shadow >= body * 2 and lower_shadow <= body * 0.3:
            patterns.append({"pattern": "Shooting Star", "direction": "bearish", "confidence": 0.8})

        # Doji
        if body <= total_range * 0.1:
            patterns.append({"pattern": "Doji", "direction": "neutral", "confidence": 0.6})

        # Bullish Engulfing
        if last.close > last.open and prev.close < prev.open and last.close > prev.open and last.open < prev.close:
            patterns.append({"pattern": "Bullish Engulfing", "direction": "bullish", "confidence": 0.85})

        # Bearish Engulfing
        if last.close < last.open and prev.close > prev.open and last.close < prev.open and last.open > prev.close:
            patterns.append({"pattern": "Bearish Engulfing", "direction": "bearish", "confidence": 0.85})

        # Morning Star (3 candle)
        if len(prices) >= 3:
            c1, c2, c3 = prices[-3], prices[-2], prices[-1]
            if c1.close < c1.open and abs(c3.close - c3.open) > body and c3.close > (c1.open + c1.close) / 2:
                if abs(c2.close - c2.open) <= abs(c1.close - c1.open) * 0.3:
                    patterns.append({"pattern": "Morning Star", "direction": "bullish", "confidence": 0.9})

            if c1.close > c1.open and abs(c3.close - c3.open) > body and c3.close < (c1.open + c1.close) / 2:
                if abs(c2.close - c2.open) <= abs(c1.close - c1.open) * 0.3:
                    patterns.append({"pattern": "Evening Star", "direction": "bearish", "confidence": 0.9})

        # Dragonfly Doji
        if body <= total_range * 0.05 and lower_shadow >= body * 3 and upper_shadow <= body * 0.5:
            patterns.append({"pattern": "Dragonfly Doji", "direction": "bullish", "confidence": 0.7})

        # Gravestone Doji
        if body <= total_range * 0.05 and upper_shadow >= body * 3 and lower_shadow <= body * 0.5:
            patterns.append({"pattern": "Gravestone Doji", "direction": "bearish", "confidence": 0.7})

        return patterns

    @staticmethod
    def detect_chart_patterns(prices: List[StockPrice]) -> List[Dict]:
        patterns = []
        if len(prices) < 30:
            return patterns

        df = _to_series(prices)
        close = df["close"].values

        # Double Top
        window = min(20, len(close) // 5)
        for i in range(len(close) - 2 * window, window, -1):
            left_peak = np.max(close[i - window:i])
            right_peak = np.max(close[i:i + window])
            middle_valley = np.min(close[i - window // 3:i + window // 3])

            if abs(left_peak - right_peak) / max(left_peak, right_peak) < 0.02:
                if middle_valley < min(left_peak, right_peak) * 0.97:
                    patterns.append({
                        "pattern": "Double Top",
                        "direction": "bearish",
                        "confidence": 0.75,
                    })
                    break

        # Double Bottom
        for i in range(len(close) - 2 * window, window, -1):
            left_bottom = np.min(close[i - window:i])
            right_bottom = np.min(close[i:i + window])
            middle_peak = np.max(close[i - window // 3:i + window // 3])

            if abs(left_bottom - right_bottom) / max(abs(left_bottom), abs(right_bottom)) < 0.02:
                if middle_peak > max(left_bottom, right_bottom) * 1.03:
                    patterns.append({
                        "pattern": "Double Bottom",
                        "direction": "bullish",
                        "confidence": 0.75,
                    })
                    break

        # Head and Shoulders
        for i in range(len(close) - 3 * window, window, -1):
            left_shoulder = np.max(close[i - window:i])
            head = np.max(close[i:i + window])
            right_shoulder = np.max(close[i + window:i + 2 * window])
            if head > left_shoulder and head > right_shoulder:
                if abs(left_shoulder - right_shoulder) / max(left_shoulder, right_shoulder) < 0.03:
                    patterns.append({
                        "pattern": "Head and Shoulders",
                        "direction": "bearish",
                        "confidence": 0.7,
                    })
                    break

        return patterns

    @staticmethod
    def compute_support_resistance(prices: List[StockPrice], levels: int = 5) -> Dict[str, List[float]]:
        df = _to_series(prices)
        close = df["close"].values
        high = df["high"].values
        low = df["low"].values

        pivot_points = []
        for i in range(1, len(close) - 1):
            if high[i] > high[i - 1] and high[i] > high[i + 1]:
                pivot_points.append(high[i])
            if low[i] < low[i - 1] and low[i] < low[i + 1]:
                pivot_points.append(low[i])

        if not pivot_points:
            return {"support": [], "resistance": []}

        pivot_points = sorted(set(round(p, 2) for p in pivot_points))
        current_price = close[-1]

        support = sorted([p for p in pivot_points if p < current_price], reverse=True)[:levels]
        resistance = sorted([p for p in pivot_points if p > current_price])[:levels]

        return {"support": support, "resistance": resistance}
