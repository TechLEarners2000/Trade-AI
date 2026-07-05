from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.advisor_service import AdvisorService
from pydantic import BaseModel

router = APIRouter()


class InvestRequest(BaseModel):
    amount: float


class SellCheckRequest(BaseModel):
    symbol: str
    buy_price: float
    quantity: float


@router.get("/stocks")
async def get_ranked_stocks(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdvisorService(db)
    ranked = await service.list_ranked_stocks()
    return ranked[:limit]


@router.get("/analyze/{symbol}")
async def analyze_stock(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdvisorService(db)
    return await service.analyze_stock(symbol.upper())


@router.post("/invest")
async def suggest_investment(
    body: InvestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdvisorService(db)
    return await service.suggest_investment(body.amount)


@router.post("/sell-check")
async def check_sell(
    body: SellCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AdvisorService(db)
    return await service.evaluate_holding(body.symbol.upper(), body.buy_price, body.quantity)
