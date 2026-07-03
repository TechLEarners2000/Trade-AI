from sqlalchemy import Column, String, Float, JSON, ForeignKey, Text, Integer, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class BacktestStrategy(BaseModel):
    __tablename__ = "backtest_strategies"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    buy_rules = Column(JSON, nullable=False)
    sell_rules = Column(JSON, nullable=True)
    stop_loss = Column(Float, nullable=True)
    trailing_stop = Column(Float, nullable=True)
    target = Column(Float, nullable=True)
    risk_per_trade = Column(Float, nullable=True)
    capital_per_trade = Column(Float, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="backtest_strategies")
    results = relationship("BacktestResult", back_populates="strategy", cascade="all, delete-orphan")


class BacktestResult(BaseModel):
    __tablename__ = "backtest_results"

    strategy_id = Column(UUID(as_uuid=True), ForeignKey("backtest_strategies.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=True)
    symbol = Column(String(50), nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_capital = Column(Float, nullable=False)
    final_capital = Column(Float, nullable=False)
    total_returns = Column(Float, nullable=False)
    cagr = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    sortino_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    win_rate = Column(Float, nullable=True)
    profit_factor = Column(Float, nullable=True)
    total_trades = Column(Integer, nullable=True)
    winning_trades = Column(Integer, nullable=True)
    losing_trades = Column(Integer, nullable=True)
    avg_win = Column(Float, nullable=True)
    avg_loss = Column(Float, nullable=True)
    max_win = Column(Float, nullable=True)
    max_loss = Column(Float, nullable=True)

    strategy = relationship("BacktestStrategy", back_populates="results")
    stock = relationship("Stock")
    trades = relationship("BacktestTrade", back_populates="result", cascade="all, delete-orphan")


class BacktestTrade(BaseModel):
    __tablename__ = "backtest_trades"

    result_id = Column(UUID(as_uuid=True), ForeignKey("backtest_results.id", ondelete="CASCADE"), nullable=False)
    entry_date = Column(DateTime, nullable=False)
    exit_date = Column(DateTime, nullable=True)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    quantity = Column(Float, nullable=False)
    trade_type = Column(String(10), nullable=False)
    pnl = Column(Float, nullable=True)
    pnl_percentage = Column(Float, nullable=True)
    exit_reason = Column(String(100), nullable=True)

    result = relationship("BacktestResult", back_populates="trades")
