from fastapi import APIRouter
from app.api.endpoints import auth, stocks, dashboard, scanner, watchlist, portfolio, alerts, backtest, ai, news, learning, admin, websocket

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(stocks.router, prefix="/stocks", tags=["Stocks"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(scanner.router, prefix="/scanner", tags=["Scanner"])
router.include_router(watchlist.router, prefix="/watchlists", tags=["Watchlists"])
router.include_router(portfolio.router, prefix="/portfolios", tags=["Portfolios"])
router.include_router(alerts.router, prefix="/alerts", tags=["Alerts"])
router.include_router(backtest.router, prefix="/backtest", tags=["Backtesting"])
router.include_router(ai.router, prefix="/ai", tags=["AI"])
router.include_router(news.router, prefix="/news", tags=["News"])
router.include_router(learning.router, prefix="/learning", tags=["Learning"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
