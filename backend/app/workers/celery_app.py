from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "trade_worker",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
    include=["app.tasks.market_data", "app.tasks.alerts", "app.tasks.analysis"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    beat_schedule={
        "fetch-market-data": {
            "task": "app.tasks.market_data.fetch_live_prices",
            "schedule": 300.0,
        },
        "check-alerts": {
            "task": "app.tasks.alerts.check_all_alerts",
            "schedule": 120.0,
        },
        "update-indices": {
            "task": "app.tasks.market_data.update_indices",
            "schedule": 600.0,
        },
    },
)
