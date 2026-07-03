import pytest
import uuid
from datetime import datetime, timezone
from httpx import AsyncClient, ASGITransport
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.core.database import Base, get_engine, get_db


TEST_STOCK_ID = uuid.uuid4()


@pytest.fixture(scope="session", autouse=True)
async def setup_stock_data():
    eng = get_engine()
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        now = datetime.now(timezone.utc)
        await conn.execute(
            text("""INSERT INTO stocks (id, symbol, company_name, sector, is_active, is_index, created_at, updated_at)
                    VALUES (:id, 'TESTCO', 'Test Company Inc', 'Technology', TRUE, FALSE, :now, :now)
                    ON CONFLICT (symbol) DO NOTHING"""),
            {"id": TEST_STOCK_ID, "now": now},
        )
        stock_exists = await conn.execute(
            text("SELECT id FROM stocks WHERE symbol = 'NIFTY'")
        )
        if not stock_exists.fetchone():
            await conn.execute(
                text("""INSERT INTO stocks (id, symbol, company_name, is_active, is_index, created_at, updated_at)
                        VALUES (gen_random_uuid(), 'NIFTY', 'Nifty 50', TRUE, TRUE, :now, :now)"""),
                {"now": now},
            )
        await conn.execute(
            text("""INSERT INTO stock_prices (id, stock_id, date, open, high, low, close, volume, is_active, created_at, updated_at)
                    VALUES (gen_random_uuid(), :sid, :dt, 100.0, 105.0, 99.0, 102.5, 100000, TRUE, :now, :now)
                    ON CONFLICT DO NOTHING"""),
            {"sid": TEST_STOCK_ID, "dt": datetime.now(timezone.utc).replace(tzinfo=None), "now": now},
        )
    yield
    async with eng.begin() as conn:
        await conn.execute(text("DELETE FROM stock_prices WHERE stock_id = :sid"), {"sid": TEST_STOCK_ID})
        await conn.execute(text("DELETE FROM stocks WHERE id = :sid"), {"sid": TEST_STOCK_ID})
    await eng.dispose()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_search_stocks(client: AsyncClient):
    response = await client.get("/api/stocks/search", params={"query": "TESTCO"})
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["symbol"] == "TESTCO"


@pytest.mark.asyncio
async def test_search_stocks_partial(client: AsyncClient):
    response = await client.get("/api/stocks/search", params={"query": "TEST"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_search_stocks_no_results(client: AsyncClient):
    response = await client.get("/api/stocks/search", params={"query": "ZZZZNONEXISTENT"})
    assert response.status_code == 200
    data = response.json()
    assert data == []


@pytest.mark.asyncio
async def test_search_stocks_with_cursor(client: AsyncClient):
    response = await client.get("/api/stocks/search", params={"query": "T", "cursor": "AAA", "limit": 5})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "has_more" in data
    assert "next_cursor" in data


@pytest.mark.asyncio
async def test_get_stock_detail(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "TESTCO"
    assert data["company_name"] == "Test Company Inc"
    assert "fundamentals" in data


@pytest.mark.asyncio
async def test_get_stock_detail_not_found(client: AsyncClient):
    response = await client.get("/api/stocks/NONEXISTENT")
    assert response.status_code == 200
    assert "error" in response.json()


@pytest.mark.asyncio
async def test_get_stock_prices(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO/prices")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "date" in data[0]
        assert "close" in data[0]


@pytest.mark.asyncio
async def test_get_stock_prices_with_cursor(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO/prices", params={"cursor": "AAA", "limit": 10})
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "has_more" in data


@pytest.mark.asyncio
async def test_get_stock_technical(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO/technical")
    assert response.status_code == 200
    data = response.json()
    assert "rsi_14" in data
    assert "sma_20" in data


@pytest.mark.asyncio
async def test_get_stock_patterns(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO/patterns")
    assert response.status_code == 200
    data = response.json()
    assert "candlestick_patterns" in data


@pytest.mark.asyncio
async def test_get_stock_fundamentals_not_found(client: AsyncClient):
    response = await client.get("/api/stocks/TESTCO/fundamentals")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data


@pytest.mark.asyncio
async def test_market_overview(client: AsyncClient):
    response = await client.get("/api/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "indices" in data
    assert "gainers" in data
    assert "losers" in data
    assert "most_active" in data
