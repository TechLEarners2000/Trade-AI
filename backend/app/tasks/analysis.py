from app.workers.celery_app import celery_app


@celery_app.task
def compute_technical_indicators(symbol: str):
    return {"status": "ok", "symbol": symbol, "indicators_computed": True}


@celery_app.task
def detect_patterns(symbol: str):
    return {"status": "ok", "symbol": symbol, "patterns_detected": True}


@celery_app.task
def run_backtest(strategy_id: str, symbol: str, start_date: str, end_date: str, initial_capital: float):
    return {"status": "ok", "strategy_id": strategy_id, "message": "Backtest queued"}


@celery_app.task
def generate_sentiment_analysis(news_id: str):
    return {"status": "ok", "news_id": news_id, "sentiment": "neutral"}
