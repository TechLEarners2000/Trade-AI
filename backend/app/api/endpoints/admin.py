from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.admin import AuditLog, SystemLog
from app.models.learning import LearningContent, GlossaryTerm
from sqlalchemy import select, func, desc

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    user_count = await db.scalar(select(func.count(User.id)))
    return {
        "total_users": user_count,
        "active_users": user_count,
        "total_content": 0,
        "system_health": "healthy",
    }


@router.get("/users")
async def admin_list_users(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id), "email": u.email, "full_name": u.full_name,
            "is_verified": u.is_verified, "is_admin": u.is_admin,
            "is_premium": u.is_premium, "is_active": u.is_active,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.post("/learning/content")
async def admin_create_content(
    title: str, content: str, category: str, difficulty: str = "beginner",
    admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db),
):
    lc = LearningContent(title=title, content=content, category=category, difficulty=difficulty, is_published=True)
    db.add(lc)
    await db.commit()
    await db.refresh(lc)
    return {"id": str(lc.id), "message": "Content created"}


@router.get("/logs")
async def admin_get_logs(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemLog).order_by(SystemLog.created_at.desc()).limit(limit))
    logs = result.scalars().all()
    return [
        {
            "id": str(l.id), "level": l.level, "module": l.module,
            "message": l.message, "created_at": str(l.created_at),
        }
        for l in logs
    ]


@router.get("/audit-logs")
async def admin_audit_logs(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    logs = result.scalars().all()
    return [
        {
            "id": str(l.id), "user_id": str(l.user_id) if l.user_id else None,
            "action": l.action, "resource": l.resource,
            "details": l.details, "ip_address": l.ip_address,
            "created_at": str(l.created_at),
        }
        for l in logs
    ]
