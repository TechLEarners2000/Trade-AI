from sqlalchemy import Column, String, Float, Integer, Date, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Portfolio(BaseModel):
    __tablename__ = "portfolios"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    initial_capital = Column(Float, default=0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("PortfolioHolding", back_populates="portfolio", cascade="all, delete-orphan")
    transactions = relationship("PortfolioTransaction", back_populates="portfolio", cascade="all, delete-orphan")
    dividends = relationship("PortfolioDividend", back_populates="portfolio", cascade="all, delete-orphan")


class PortfolioHolding(BaseModel):
    __tablename__ = "portfolio_holdings"

    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    average_price = Column(Float, nullable=False)
    total_invested = Column(Float, nullable=False)

    portfolio = relationship("Portfolio", back_populates="holdings")
    stock = relationship("Stock")


class PortfolioTransaction(BaseModel):
    __tablename__ = "portfolio_transactions"

    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(10), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    transaction_date = Column(DateTime, nullable=False)
    brokerage = Column(Float, default=0, nullable=True)
    notes = Column(Text, nullable=True)

    portfolio = relationship("Portfolio", back_populates="transactions")
    stock = relationship("Stock")


class PortfolioDividend(BaseModel):
    __tablename__ = "portfolio_dividends"

    portfolio_id = Column(UUID(as_uuid=True), ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    declared_date = Column(Date, nullable=True)
    payment_date = Column(Date, nullable=True)

    portfolio = relationship("Portfolio", back_populates="dividends")
    stock = relationship("Stock")
