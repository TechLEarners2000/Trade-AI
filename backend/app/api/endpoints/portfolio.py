from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.portfolio import Portfolio, PortfolioHolding, PortfolioTransaction, PortfolioDividend
from app.models.stock import Stock
from sqlalchemy import select, delete
from datetime import datetime, timezone

router = APIRouter()


@router.get("/")
async def get_portfolios(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Portfolio).where(Portfolio.user_id == current_user.id)
    )
    portfolios = result.scalars().all()
    data = []
    for p in portfolios:
        holdings = await db.execute(
            select(PortfolioHolding).where(PortfolioHolding.portfolio_id == p.id)
        )
        h_data = holdings.scalars().all()
        total_invested = sum(h.total_invested for h in h_data)
        data.append({
            "id": str(p.id), "name": p.name, "description": p.description,
            "initial_capital": p.initial_capital, "currency": p.currency,
            "total_invested": total_invested,
            "holdings_count": len(h_data),
        })
    return data


@router.post("/")
async def create_portfolio(name: str = Body(...), initial_capital: float = Body(0), description: str = Body(None), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    p = Portfolio(user_id=current_user.id, name=name, initial_capital=initial_capital, description=description)
    db.add(p)
    await db.commit()
    await db.refresh(p)
    return {"id": str(p.id), "name": p.name, "message": "Portfolio created"}


@router.post("/{portfolio_id}/holdings")
async def add_holding(portfolio_id: str, stock_id: str = Body(...), quantity: float = Body(...), average_price: float = Body(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    total = quantity * average_price
    h = PortfolioHolding(portfolio_id=portfolio_id, stock_id=stock_id, quantity=quantity, average_price=average_price, total_invested=total)
    db.add(h)
    await db.commit()
    await db.refresh(h)
    return {"id": str(h.id), "message": "Holding added"}


@router.get("/{portfolio_id}")
async def get_portfolio_detail(portfolio_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Portfolio).where(Portfolio.id == portfolio_id, Portfolio.user_id == current_user.id))
    portfolio = result.scalar_one_or_none()
    if not portfolio:
        return {"error": "Portfolio not found"}

    holdings = await db.execute(select(PortfolioHolding).where(PortfolioHolding.portfolio_id == portfolio.id))
    h_data = holdings.scalars().all()

    transactions = await db.execute(
        select(PortfolioTransaction).where(PortfolioTransaction.portfolio_id == portfolio.id).order_by(PortfolioTransaction.transaction_date.desc()).limit(50)
    )
    t_data = transactions.scalars().all()

    return {
        "id": str(portfolio.id), "name": portfolio.name,
        "initial_capital": portfolio.initial_capital,
        "holdings": [
            {
                "id": str(h.id), "stock_id": str(h.stock_id),
                "quantity": h.quantity, "average_price": h.average_price,
                "total_invested": h.total_invested,
            } for h in h_data
        ],
        "transactions": [
            {
                "id": str(t.id), "stock_id": str(t.stock_id),
                "type": t.transaction_type, "quantity": t.quantity,
                "price": t.price, "total_amount": t.total_amount,
                "date": str(t.transaction_date),
            } for t in t_data
        ],
    }


@router.post("/{portfolio_id}/transactions")
async def add_transaction(
    portfolio_id: str, stock_id: str = Body(...), transaction_type: str = Body(...),
    quantity: float = Body(...), price: float = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_amount = quantity * price
    t = PortfolioTransaction(
        portfolio_id=portfolio_id, stock_id=stock_id,
        transaction_type=transaction_type, quantity=quantity,
        price=price, total_amount=total_amount,
        transaction_date=datetime.now(timezone.utc),
    )
    db.add(t)

    if transaction_type == "BUY":
        existing = await db.execute(
            select(PortfolioHolding).where(
                PortfolioHolding.portfolio_id == portfolio_id,
                PortfolioHolding.stock_id == stock_id,
            )
        )
        holding = existing.scalar_one_or_none()
        if holding:
            new_qty = holding.quantity + quantity
            holding.average_price = ((holding.average_price * holding.quantity) + (price * quantity)) / new_qty
            holding.quantity = new_qty
            holding.total_invested = holding.quantity * holding.average_price
        else:
            h = PortfolioHolding(portfolio_id=portfolio_id, stock_id=stock_id, quantity=quantity, average_price=price, total_invested=total_amount)
            db.add(h)
    elif transaction_type == "SELL":
        existing = await db.execute(
            select(PortfolioHolding).where(
                PortfolioHolding.portfolio_id == portfolio_id,
                PortfolioHolding.stock_id == stock_id,
            )
        )
        holding = existing.scalar_one_or_none()
        if holding:
            holding.quantity -= quantity
            holding.total_invested = holding.quantity * holding.average_price
            if holding.quantity <= 0:
                await db.delete(holding)

    await db.commit()
    return {"message": "Transaction recorded"}
