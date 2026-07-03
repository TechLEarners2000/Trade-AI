from app.workers.celery_app import celery_app

BASE_RETRY = dict(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)


@celery_app.task(**BASE_RETRY)
def compute_technical_indicators(symbol: str):
    return {"status": "ok", "symbol": symbol, "indicators_computed": True}


@celery_app.task(**BASE_RETRY)
def detect_patterns(symbol: str):
    return {"status": "ok", "symbol": symbol, "patterns_detected": True}


@celery_app.task(**BASE_RETRY)
def run_backtest(strategy_id: str, symbol: str, start_date: str, end_date: str, initial_capital: float):
    return {"status": "ok", "strategy_id": strategy_id, "message": "Backtest queued"}


@celery_app.task(**BASE_RETRY)
def generate_sentiment_analysis(news_id: str):
    return {"status": "ok", "news_id": news_id, "sentiment": "neutral"}
