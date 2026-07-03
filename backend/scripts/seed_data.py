"""Seed script to populate database with sample data for development."""
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings
from app.core.database import Base
from app.core.security import hash_password
from app.models.user import User
from app.models.stock import Stock, StockFundamental, StockPrice
from app.models.learning import LearningContent, GlossaryTerm
from app.models.scanner import SavedScan
import random
import math


async def seed():
    engine = create_async_engine(settings.db_url, echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        # Admin user
        admin = User(
            email="admin@tradeai.com",
            full_name="Admin User",
            password_hash=hash_password("admin123"),
            is_admin=True,
            is_verified=True,
        )
        session.add(admin)

        # Demo user
        demo = User(
            email="demo@tradeai.com",
            full_name="Demo User",
            password_hash=hash_password("demo123"),
            is_verified=True,
        )
        session.add(demo)

        # Seed stocks
        stocks_data = [
            ("RELIANCE", "Reliance Industries", "Oil & Gas", "Refining"),
            ("TCS", "Tata Consultancy Services", "IT", "Software"),
            ("HDFCBANK", "HDFC Bank", "Banking", "Private Bank"),
            ("INFY", "Infosys", "IT", "Software"),
            ("ICICIBANK", "ICICI Bank", "Banking", "Private Bank"),
            ("ITC", "ITC Limited", "FMCG", "Diversified"),
            ("SBIN", "State Bank of India", "Banking", "PSU Bank"),
            ("BHARTIARTL", "Bharti Airtel", "Telecom", "Telecom Services"),
            ("KOTAKBANK", "Kotak Mahindra Bank", "Banking", "Private Bank"),
            ("WIPRO", "Wipro Limited", "IT", "Software"),
            ("TATAMOTORS", "Tata Motors", "Auto", "Automobile"),
            ("MARUTI", "Maruti Suzuki", "Auto", "Automobile"),
            ("NIFTY", "Nifty 50 Index", "Index", "Index", True),
            ("SENSEX", "S&P BSE Sensex", "Index", "Index", True),
            ("BANKNIFTY", "Bank Nifty Index", "Index", "Index", True),
            ("INDIAVIX", "India VIX", "Index", "Index", True),
        ]

        for s in stocks_data:
            is_index = len(s) > 4 and s[4]
            stock = Stock(
                symbol=s[0],
                company_name=s[1],
                sector=s[2],
                industry=s[3],
                is_index=is_index,
            )
            session.add(stock)
            await session.flush()

            # Stock fundamentals for non-index stocks
            if not is_index:
                fundamentals = StockFundamental(
                    stock_id=stock.id,
                    market_cap=random.uniform(50000, 1500000),
                    enterprise_value=random.uniform(60000, 1600000),
                    pe_ratio=random.uniform(10, 60),
                    pb_ratio=random.uniform(1, 10),
                    eps=random.uniform(10, 200),
                    book_value=random.uniform(50, 1000),
                    dividend_yield=random.uniform(0, 3),
                    roe=random.uniform(5, 30),
                    roce=random.uniform(8, 35),
                    debt_to_equity=random.uniform(0, 2),
                    current_ratio=random.uniform(0.5, 3),
                    quick_ratio=random.uniform(0.3, 2.5),
                    promoter_holding=random.uniform(40, 75),
                    fii_holding=random.uniform(5, 30),
                    dii_holding=random.uniform(5, 25),
                    mutual_fund_holding=random.uniform(3, 20),
                    sales_growth=random.uniform(-5, 30),
                    profit_growth=random.uniform(-10, 35),
                    operating_margin=random.uniform(10, 40),
                    net_margin=random.uniform(5, 25),
                )
                session.add(fundamentals)

            # Generate price data
            base_price = random.uniform(100, 5000) if not is_index else random.uniform(1000, 80000)
            now = datetime.now()
            for day in range(200):
                date = now - timedelta(days=200 - day)
                change = base_price * random.uniform(-0.03, 0.03)
                open_price = base_price + change
                high = open_price * (1 + random.uniform(0, 0.02))
                low = open_price * (1 - random.uniform(0, 0.02))
                close = random.uniform(low, high)
                volume = int(random.uniform(100000, 5000000))
                base_price = close

                price = StockPrice(
                    stock_id=stock.id,
                    date=date,
                    open=round(open_price, 2),
                    high=round(high, 2),
                    low=round(low, 2),
                    close=round(close, 2),
                    volume=volume,
                    delivery_percentage=random.uniform(20, 80),
                    vwap=round((open_price + high + low + close) / 4, 2),
                )
                session.add(price)

        # Learning content
        content = LearningContent(
            title="Introduction to Stock Market",
            content="The stock market is a platform where shares of publicly listed companies are traded...",
            category="Stock Market Basics",
            difficulty="beginner",
            is_published=True,
        )
        session.add(content)

        content2 = LearningContent(
            title="Understanding Technical Analysis",
            content="Technical analysis involves analyzing statistical trends from trading activity...",
            category="Technical Analysis",
            difficulty="intermediate",
            is_published=True,
        )
        session.add(content2)

        # Glossary terms
        glossary_terms = [
            ("PE Ratio", "Price to Earnings ratio - measures a company's current share price relative to its earnings per share", "Valuation"),
            ("RSI", "Relative Strength Index - a momentum oscillator that measures the speed and change of price movements", "Technical Analysis"),
            ("Market Cap", "Total market value of a company's outstanding shares", "Fundamental Analysis"),
            ("Dividend Yield", "Annual dividend payment divided by the current stock price", "Fundamental Analysis"),
            ("Book Value", "Net asset value of a company calculated as total assets minus intangible assets and liabilities", "Fundamental Analysis"),
            ("ROE", "Return on Equity - net income divided by shareholder's equity", "Fundamental Analysis"),
        ]
        for term, definition, category in glossary_terms:
            session.add(GlossaryTerm(term=term, definition=definition, category=category))

        await session.commit()
        print("Seed data created successfully!")
        print("Demo accounts:")
        print("  Admin: admin@tradeai.com / admin123")
        print("  Demo:  demo@tradeai.com / demo123")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
