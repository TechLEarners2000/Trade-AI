from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.services.scanner_service import ScannerService
from app.api.deps import get_current_user
from app.models.user import User
from app.models.scanner import SavedScan, ScanHistory
from sqlalchemy import select
import json

router = APIRouter()


@router.post("/execute")
async def execute_scan(
    conditions: list = Body(...),
    logic: str = "AND",
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    service = ScannerService(db)
    results = await service.execute_scan(conditions, logic, limit, offset)
    return {"results": results, "total": len(results), "limit": limit, "offset": offset}


@router.get("/prebuilt")
async def get_prebuilt_scans():
    return {
        "scans": [
            {"id": "breakout", "name": "Breakout Stocks", "category": "momentum"},
            {"id": "rsi_oversold", "name": "RSI Oversold", "category": "oversold"},
            {"id": "golden_cross", "name": "Golden Cross", "category": "technical"},
            {"id": "strong_fundamentals", "name": "Strong Fundamentals", "category": "fundamental"},
            {"id": "high_roe", "name": "High ROE Stocks", "category": "fundamental"},
            {"id": "low_debt", "name": "Low Debt Stocks", "category": "fundamental"},
            {"id": "volume_spike", "name": "Volume Spike", "category": "technical"},
            {"id": "52_week_high", "name": "52 Week High", "category": "momentum"},
            {"id": "52_week_low", "name": "52 Week Low", "category": "bearish"},
            {"id": "small_cap", "name": "Small Cap Gems", "category": "screener"},
            {"id": "mid_cap", "name": "Mid Cap Opportunities", "category": "screener"},
            {"id": "large_cap", "name": "Large Cap Leaders", "category": "screener"},
            {"id": "dividend", "name": "Dividend Stocks", "category": "income"},
            {"id": "growth", "name": "Growth Stocks", "category": "growth"},
            {"id": "death_cross", "name": "Death Cross", "category": "technical"},
        ]
    }


@router.get("/saved")
async def get_saved_scans(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SavedScan).where(SavedScan.user_id == current_user.id).order_by(SavedScan.created_at.desc())
    )
    scans = result.scalars().all()
    return [
        {"id": str(s.id), "name": s.name, "description": s.description, "is_shared": s.is_shared, "created_at": str(s.created_at)}
        for s in scans
    ]


@router.post("/saved")
async def save_scan(
    name: str = Body(...), description: str = Body(...), scan_config: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = SavedScan(user_id=current_user.id, name=name, description=description, scan_config=scan_config)
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return {"id": str(scan.id), "name": scan.name, "message": "Scan saved"}
