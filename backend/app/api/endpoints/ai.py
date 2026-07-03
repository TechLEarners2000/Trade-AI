from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user_optional
from app.models.user import User
from app.services.ai_service import AIService
from app.models.stock import Stock, StockFundamental
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import Optional

router = APIRouter()
ai_service = AIService()


@router.post("/chat")
async def ai_chat(
    message: str,
    symbol: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    context = None
    if symbol:
        result = await db.execute(
            select(Stock).options(joinedload(Stock.fundamentals)).where(Stock.symbol == symbol.upper(), Stock.is_active == True)
        )
        stock = result.scalar_one_or_none()
        if stock:
            context = {
                "company_name": stock.company_name,
                "sector": stock.sector,
                "industry": stock.industry,
                "symbol": stock.symbol,
            }
            if stock.fundamentals:
                f = stock.fundamentals
                context.update({
                    "market_cap": f.market_cap,
                    "pe_ratio": f.pe_ratio,
                    "roe": f.roe,
                    "eps": f.eps,
                    "promoter_holding": f.promoter_holding,
                    "fii_holding": f.fii_holding,
                })

    response = await ai_service.generate_response(message, context)
    return {"response": response, "context": context}


@router.post("/analyze")
async def analyze_stock(symbol: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Stock).options(joinedload(Stock.fundamentals)).where(Stock.symbol == symbol.upper(), Stock.is_active == True)
    )
    stock = result.scalar_one_or_none()
    if not stock:
        return {"error": "Stock not found"}

    prompt = f"Provide a comprehensive analysis of {stock.company_name} ({stock.symbol}) in the {stock.sector or 'N/A'} sector."
    context = {
        "company_name": stock.company_name,
        "symbol": stock.symbol,
        "sector": stock.sector,
    }
    if stock.fundamentals:
        f = stock.fundamentals
        context.update({
            "market_cap": f.market_cap, "pe_ratio": f.pe_ratio,
            "eps": f.eps, "roe": f.roe, "debt_to_equity": f.debt_to_equity,
        })

    response = await ai_service.generate_response(prompt, context)
    return {"symbol": symbol, "analysis": response}


@router.post("/insights")
async def get_ai_insights(db: AsyncSession = Depends(get_db)):
    return {
        "market_mood": "Neutral",
        "risk_level": "Moderate",
        "top_sectors": ["IT", "Banking", "Pharma"],
        "recommendation": "Maintain diversified portfolio with focus on large caps.",
        "disclaimer": "AI insights are for educational purposes only. Not investment advice.",
    }


@router.post("/portfolio-health")
async def portfolio_health(holdings: list):
    total_value = sum(h.get("value", 0) for h in holdings)
    sectors = {}
    for h in holdings:
        sector = h.get("sector", "Other")
        sectors[sector] = sectors.get(sector, 0) + h.get("value", 0)

    sector_allocation = {k: round(v / total_value * 100, 2) for k, v in sectors.items()} if total_value else {}

    score = 75
    if len(holdings) < 5:
        score -= 15
    if len(sectors) < 3:
        score -= 10
    if total_value <= 0:
        score = 0

    return {
        "health_score": score,
        "total_value": total_value,
        "sector_allocation": sector_allocation,
        "diversification_score": min(len(sectors) * 15, 100),
        "risk_score": 100 - score,
        "suggestions": [
            "Consider adding more sectors for diversification",
            "Review high-risk allocation if any",
        ] if score < 70 else ["Portfolio looks well diversified"],
        "disclaimer": "Not investment advice.",
    }
