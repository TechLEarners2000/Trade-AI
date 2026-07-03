from sqlalchemy import Column, String, Float, Integer, DateTime, Date, Text, JSON, Boolean, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.core.database import Base


class Stock(BaseModel):
    __tablename__ = "stocks"

    symbol = Column(String(50), unique=True, index=True, nullable=False)
    company_name = Column(String(500), nullable=False)
    sector = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    bse_code = Column(String(50), nullable=True, unique=True)
    nse_symbol = Column(String(50), nullable=True, unique=True)
    isin = Column(String(20), nullable=True, unique=True)
    market_cap = Column(Float, nullable=True)
    face_value = Column(Float, nullable=True)
    listing_date = Column(Date, nullable=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    is_index = Column(Boolean, default=False, nullable=False)

    prices = relationship("StockPrice", back_populates="stock", cascade="all, delete-orphan")
    fundamentals = relationship("StockFundamental", back_populates="stock", uselist=False, cascade="all, delete-orphan")
    quarterly_results = relationship("StockQuarterlyResult", back_populates="stock", cascade="all, delete-orphan")
    annual_results = relationship("StockAnnualResult", back_populates="stock", cascade="all, delete-orphan")
    cash_flows = relationship("CashFlow", back_populates="stock", cascade="all, delete-orphan")
    balance_sheets = relationship("BalanceSheet", back_populates="stock", cascade="all, delete-orphan")
    profit_loss = relationship("ProfitLoss", back_populates="stock", cascade="all, delete-orphan")
    ratios = relationship("Ratios", back_populates="stock", uselist=False, cascade="all, delete-orphan")
    shareholding_patterns = relationship("ShareholdingPattern", back_populates="stock", cascade="all, delete-orphan")
    corporate_actions = relationship("CorporateAction", back_populates="stock", cascade="all, delete-orphan")
    news = relationship("StockNews", back_populates="stock", cascade="all, delete-orphan")
    announcements = relationship("StockAnnouncement", back_populates="stock", cascade="all, delete-orphan")
    events = relationship("StockEvent", back_populates="stock", cascade="all, delete-orphan")


class StockPrice(BaseModel):
    __tablename__ = "stock_prices"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(BigInteger, nullable=False)
    delivery_volume = Column(BigInteger, nullable=True)
    delivery_percentage = Column(Float, nullable=True)
    vwap = Column(Float, nullable=True)
    trades = Column(BigInteger, nullable=True)
    oi = Column(BigInteger, nullable=True)
    oi_change = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="prices")


class StockFundamental(BaseModel):
    __tablename__ = "stock_fundamentals"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    market_cap = Column(Float, nullable=True)
    enterprise_value = Column(Float, nullable=True)
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)
    book_value = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)
    roce = Column(Float, nullable=True)
    debt_to_equity = Column(Float, nullable=True)
    current_ratio = Column(Float, nullable=True)
    quick_ratio = Column(Float, nullable=True)
    promoter_holding = Column(Float, nullable=True)
    fii_holding = Column(Float, nullable=True)
    dii_holding = Column(Float, nullable=True)
    public_holding = Column(Float, nullable=True)
    mutual_fund_holding = Column(Float, nullable=True)
    sales_growth = Column(Float, nullable=True)
    profit_growth = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    sector_pe = Column(Float, nullable=True)
    eps_growth_3y = Column(Float, nullable=True)
    eps_growth_5y = Column(Float, nullable=True)
    revenue_growth_3y = Column(Float, nullable=True)
    revenue_growth_5y = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="fundamentals")


class StockQuarterlyResult(BaseModel):
    __tablename__ = "stock_quarterly_results"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    quarter = Column(String(10), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=True)
    expenses = Column(Float, nullable=True)
    operating_profit = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_profit = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="quarterly_results")


class StockAnnualResult(BaseModel):
    __tablename__ = "stock_annual_results"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=True)
    expenses = Column(Float, nullable=True)
    operating_profit = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_profit = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="annual_results")


class CashFlow(BaseModel):
    __tablename__ = "stock_cash_flows"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    operating_cash_flow = Column(Float, nullable=True)
    investing_cash_flow = Column(Float, nullable=True)
    financing_cash_flow = Column(Float, nullable=True)
    free_cash_flow = Column(Float, nullable=True)
    net_cash_flow = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="cash_flows")


class BalanceSheet(BaseModel):
    __tablename__ = "stock_balance_sheets"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    total_assets = Column(Float, nullable=True)
    total_liabilities = Column(Float, nullable=True)
    shareholder_equity = Column(Float, nullable=True)
    total_debt = Column(Float, nullable=True)
    current_assets = Column(Float, nullable=True)
    current_liabilities = Column(Float, nullable=True)
    fixed_assets = Column(Float, nullable=True)
    inventory = Column(Float, nullable=True)
    receivables = Column(Float, nullable=True)
    cash_and_equivalents = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="balance_sheets")


class ProfitLoss(BaseModel):
    __tablename__ = "stock_profit_loss"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    revenue = Column(Float, nullable=True)
    cost_of_goods_sold = Column(Float, nullable=True)
    gross_profit = Column(Float, nullable=True)
    operating_expenses = Column(Float, nullable=True)
    operating_income = Column(Float, nullable=True)
    interest_expense = Column(Float, nullable=True)
    depreciation = Column(Float, nullable=True)
    tax = Column(Float, nullable=True)
    net_income = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)
    dividend_per_share = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="profit_loss")


class Ratios(BaseModel):
    __tablename__ = "stock_ratios"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    fiscal_year = Column(Integer, nullable=True)
    pe_ratio = Column(Float, nullable=True)
    pb_ratio = Column(Float, nullable=True)
    ps_ratio = Column(Float, nullable=True)
    ev_ebitda = Column(Float, nullable=True)
    ev_revenue = Column(Float, nullable=True)
    debt_to_equity = Column(Float, nullable=True)
    current_ratio = Column(Float, nullable=True)
    quick_ratio = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)
    roce = Column(Float, nullable=True)
    roa = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    asset_turnover = Column(Float, nullable=True)
    inventory_turnover = Column(Float, nullable=True)
    dividend_yield = Column(Float, nullable=True)
    dividend_payout = Column(Float, nullable=True)
    interest_coverage = Column(Float, nullable=True)
    eps = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="ratios")


class ShareholdingPattern(BaseModel):
    __tablename__ = "stock_shareholding_patterns"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    quarter = Column(String(10), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    promoter = Column(Float, nullable=True)
    fii = Column(Float, nullable=True)
    dii = Column(Float, nullable=True)
    mutual_fund = Column(Float, nullable=True)
    retail = Column(Float, nullable=True)
    hni = Column(Float, nullable=True)
    government = Column(Float, nullable=True)
    others = Column(Float, nullable=True)

    stock = relationship("Stock", back_populates="shareholding_patterns")


class CorporateAction(BaseModel):
    __tablename__ = "stock_corporate_actions"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    action_type = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    ex_date = Column(Date, nullable=True)
    record_date = Column(Date, nullable=True)
    announced_date = Column(Date, nullable=True)
    value = Column(Float, nullable=True)
    is_approved = Column(Boolean, default=False, nullable=True)

    stock = relationship("Stock", back_populates="corporate_actions")


class StockNews(BaseModel):
    __tablename__ = "stock_news"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    published_at = Column(DateTime, nullable=True)
    sentiment = Column(String(20), nullable=True)
    sentiment_score = Column(Float, nullable=True)
    category = Column(String(100), nullable=True)
    is_market_news = Column(Boolean, default=False, nullable=True)

    stock = relationship("Stock", back_populates="news")


class StockAnnouncement(BaseModel):
    __tablename__ = "stock_announcements"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    source = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    announced_date = Column(DateTime, nullable=True)
    category = Column(String(100), nullable=True)

    stock = relationship("Stock", back_populates="announcements")


class StockEvent(BaseModel):
    __tablename__ = "stock_events"

    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    event_date = Column(DateTime, nullable=True)
    source = Column(String(255), nullable=True)

    stock = relationship("Stock", back_populates="events")
