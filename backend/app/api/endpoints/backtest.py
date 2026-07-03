from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.backtest import BacktestStrategy, BacktestResult, BacktestTrade
from sqlalchemy import select, delete

router = APIRouter()


@router.get("/strategies")
async def get_strategies(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BacktestStrategy).where(BacktestStrategy.user_id == current_user.id).order_by(BacktestStrategy.created_at.desc())
    )
    strategies = result.scalars().all()
    return [
        {
            "id": str(s.id), "name": s.name, "description": s.description,
            "buy_rules": s.buy_rules, "sell_rules": s.sell_rules,
            "stop_loss": s.stop_loss, "target": s.target,
            "created_at": str(s.created_at),
        }
        for s in strategies
    ]


@router.post("/strategies")
async def create_strategy(
    name: str = Body(...), buy_rules: dict = Body(...), sell_rules: dict = Body(None),
    stop_loss: float = Body(None), trailing_stop: float = Body(None),
    target: float = Body(None), risk_per_trade: float = Body(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    strategy = BacktestStrategy(
        user_id=current_user.id, name=name,
        buy_rules=buy_rules, sell_rules=sell_rules,
        stop_loss=stop_loss, trailing_stop=trailing_stop,
        target=target, risk_per_trade=risk_per_trade,
    )
    db.add(strategy)
    await db.commit()
    await db.refresh(strategy)
    return {"id": str(strategy.id), "name": strategy.name, "message": "Strategy created"}


@router.get("/strategies/{strategy_id}/results")
async def get_strategy_results(strategy_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BacktestResult).where(BacktestResult.strategy_id == strategy_id)
    )
    results = result.scalars().all()
    return [
        {
            "id": str(r.id), "symbol": r.symbol,
            "start_date": str(r.start_date), "end_date": str(r.end_date),
            "initial_capital": r.initial_capital, "final_capital": r.final_capital,
            "total_returns": r.total_returns, "cagr": r.cagr,
            "sharpe_ratio": r.sharpe_ratio, "sortino_ratio": r.sortino_ratio,
            "max_drawdown": r.max_drawdown, "win_rate": r.win_rate,
            "profit_factor": r.profit_factor, "total_trades": r.total_trades,
        }
        for r in results
    ]


@router.post("/run")
async def run_backtest(
    strategy_id: str = Body(...), symbol: str = Body(...),
    start_date: str = Body(...), end_date: str = Body(...),
    initial_capital: float = Body(100000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return {
        "message": "Backtest queued",
        "strategy_id": strategy_id,
        "symbol": symbol,
        "status": "pending",
    }
