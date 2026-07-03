import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.workers.celery_app import celery_app
from app.core.config import settings
import redis as sync_redis


def get_sync_engine():
    sync_url = settings.db_url.replace("+asyncpg", "+psycopg2")
    return create_engine(sync_url)


def publish_to_redis(channel: str, data: dict):
    try:
        r = sync_redis.Redis.from_url(settings.redis_url)
        r.publish(channel, json.dumps(data, default=str))
        r.close()
    except Exception:
        pass


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=2,
    retry_backoff=True,
    retry_backoff_max=30,
    retry_jitter=True,
)
def check_all_alerts():
    engine = get_sync_engine()
    triggered = 0
    checked = 0
    with Session(engine) as session:
        alerts = session.execute(
            text("SELECT id, user_id, stock_id, alert_type, condition, symbol "
                 "FROM alerts WHERE is_active = TRUE")
        ).fetchall()
        for alert in alerts:
            checked += 1
            try:
                condition = alert.condition
                if isinstance(condition, str):
                    condition = json.loads(condition)
                alert_type = condition.get("type", alert.alert_type)
                target = condition.get("value", condition.get("price"))
                operator = condition.get("operator", "above")

                latest_price = session.execute(
                    text("SELECT close FROM stock_prices WHERE stock_id = :sid "
                         "ORDER BY date DESC LIMIT 1"),
                    {"sid": alert.stock_id},
                ).fetchone()

                if not latest_price:
                    continue
                current_price = latest_price[0]

                is_triggered = False
                if operator == "above" and current_price >= target:
                    is_triggered = True
                elif operator == "below" and current_price <= target:
                    is_triggered = True
                elif operator == "cross_above" and current_price >= target:
                    is_triggered = True
                elif operator == "cross_below" and current_price <= target:
                    is_triggered = True

                if is_triggered:
                    triggered += 1
                    session.execute(
                        text("UPDATE alerts SET is_active = FALSE WHERE id = :id"),
                        {"id": alert.id},
                    )
                    session.execute(
                        text("""INSERT INTO alert_history (id, alert_id, stock_id, triggered_price,
                                triggered_at, message)
                                VALUES (gen_random_uuid(), :aid, :sid, :price, :now, :msg)"""),
                        {
                            "aid": alert.id,
                            "sid": alert.stock_id,
                            "price": current_price,
                            "now": datetime.now(timezone.utc),
                            "msg": f"{alert.symbol or 'Stock'} price {operator} {target} at {current_price}",
                        },
                    )
                    publish_to_redis("user:alerts", {
                        "user_id": str(alert.user_id),
                        "alert_id": str(alert.id),
                        "symbol": alert.symbol,
                        "price": current_price,
                        "message": f"{alert.symbol or 'Stock'} price {operator} {target}",
                    })
                session.commit()
            except Exception:
                session.rollback()
                continue
    return {"status": "ok", "checked": checked, "triggered": triggered}
