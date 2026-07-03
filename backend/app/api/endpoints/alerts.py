from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.alert import Alert, AlertHistory
from sqlalchemy import select, delete

router = APIRouter()


@router.get("/")
async def get_alerts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.created_at.desc())
    )
    alerts = result.scalars().all()
    return [
        {
            "id": str(a.id), "alert_type": a.alert_type, "stock_id": str(a.stock_id) if a.stock_id else None,
            "condition": a.condition, "is_active": a.is_active,
            "notification_type": a.notification_type, "created_at": str(a.created_at),
        }
        for a in alerts
    ]


@router.post("/")
async def create_alert(
    alert_type: str = Body(...), condition: dict = Body(...), stock_id: str = Body(None),
    notification_type: str = Body("push"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    alert = Alert(
        user_id=current_user.id, stock_id=stock_id,
        alert_type=alert_type, condition=condition,
        notification_type=notification_type,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return {"id": str(alert.id), "message": "Alert created"}


@router.put("/{alert_id}/toggle")
async def toggle_alert(alert_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id))
    alert = result.scalar_one_or_none()
    if not alert:
        return {"error": "Alert not found"}
    alert.is_active = not alert.is_active
    db.add(alert)
    await db.commit()
    return {"id": str(alert.id), "is_active": alert.is_active, "message": "Alert toggled"}


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id))
    await db.commit()
    return {"message": "Alert deleted"}


@router.get("/history")
async def get_alert_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertHistory)
        .join(Alert, AlertHistory.alert_id == Alert.id)
        .where(Alert.user_id == current_user.id)
        .order_by(AlertHistory.created_at.desc())
        .limit(50)
    )
    history = result.scalars().all()
    return [
        {
            "id": str(h.id), "alert_id": str(h.alert_id),
            "triggered_value": h.triggered_value, "message": h.message,
            "is_read": h.is_read, "created_at": str(h.created_at),
        }
        for h in history
    ]
