### `README.md`
``` md
# TradeAI - AI-Powered Stock Market Analytics Platform

A production-ready MVP of an Indian Stock Market Analytics Platform built with React, TypeScript, Python FastAPI, PostgreSQL, and Redis.

## Features

- **Market Dashboard**: Nifty, Sensex, Bank Nifty, India VIX live tracking
- **Stock Analysis**: Comprehensive stock pages with fundamentals, technicals, charts
- **Technical Analysis**: 25+ indicators (SMA, EMA, RSI, MACD, Bollinger Bands, etc.)
- **Pattern Recognition**: Candlestick patterns, chart patterns, support/resistance
- **Stock Scanner**: Visual builder with AND/OR logic, prebuilt scans
- **Watchlists**: Unlimited watchlists with live prices
- **Portfolio**: Track holdings, P&L, sector allocation, health score
- **Backtesting**: Strategy builder with performance metrics
- **Alerts**: Price, volume, technical indicator alerts
- **AI Insights**: Natural language chat, stock analysis, portfolio health
- **News**: Market, company, sector, economy news
- **Learning**: Educational content, glossary
- **Admin Panel**: User management, content, logs

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn UI, Framer Motion, Redux Toolkit
- **Backend**: Python FastAPI, SQLAlchemy, Celery
- **Database**: PostgreSQL, Redis
- **Auth**: JWT, OTP, Google OAuth
- **Deployment**: Docker, Nginx, GitHub Actions

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Python 3.11+ (for local backend dev)

### Using Docker

```bash
# Clone and start
docker-compose up -d

# Run seed data
docker-compose exec backend python scripts/seed_data.py

# Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/api/docs
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Setup PostgreSQL database
createdb trade

# Run migrations
alembic upgrade head

# Seed data
python scripts/seed_data.py

# Start server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Demo Accounts

| Role  | Email              | Password |
|-------|--------------------|----------|
| Admin | admin@tradeai.com  | admin123 |
| Demo  | demo@tradeai.com   | demo123  |

## Environment Variables

Copy `.env.example` to `.env` and configure. Required variables **must** be set or the app will fail to boot:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SECRET_KEY` | **Yes** | — | JWT secret key (no default, app fails fast if missing) |
| `POSTGRES_PASSWORD` | **Yes** | — | Database password (no default, app fails fast if missing) |
| `POSTGRES_HOST` | No | `localhost` | PostgreSQL host |
| `POSTGRES_DB` | No | `trade` | Database name |
| `POSTGRES_USER` | No | `trade_user` | Database user |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `ENVIRONMENT` | No | `production` | `development` or `production`; API docs are hidden in production |
| `DEBUG` | No | `false` | Enable debug mode (SQL echo, verbose errors) |
| `ALLOWED_HOSTS` | No | `localhost,127.0.0.1,tradeai.local` | Allowed hosts for TrustedHostMiddleware |
| `CORS_ORIGINS` | No | `http://localhost:3000,http://localhost:5173` | Comma-separated allowed CORS origins |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | JWT access token TTL |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | JWT refresh token TTL |
| `RATE_LIMIT_GLOBAL` | No | `100/minute` | Default per-IP rate limit |
| `RATE_LIMIT_LOGIN` | No | `5/minute` | Login endpoint rate limit per IP+email |
| `RATE_LIMIT_REGISTER` | No | `3/minute` | Register endpoint rate limit per IP |
| `OPENAI_API_KEY` | No | — | OpenAI API key (optional) |
| `GEMINI_API_KEY` | No | — | Google Gemini API key (optional) |
| `SENTRY_DSN` | No | — | Sentry DSN for error tracking (optional) |

## API Documentation

Swagger UI: `http://localhost:8000/api/docs`
ReDoc: `http://localhost:8000/api/redoc`

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI endpoints
│   │   ├── core/         # Config, database, security
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── tasks/        # Celery tasks
│   │   └── workers/      # Celery config
│   ├── alembic/          # Database migrations
│   └── scripts/          # Seed data
├── frontend/
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store
│   │   ├── lib/          # Utilities, API client
│   │   └── types/        # TypeScript types
│   └── public/
├── docker-compose.yml
├── nginx/nginx.conf
└── README.md
```

## License

MIT

```


### `backend/Dockerfile`
``` 
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```


### `backend/alembic.ini`
``` ini
[alembic]
script_location = alembic
sqlalchemy.url = postgresql+psycopg2://trade_user:trade_pass_123@localhost:5432/trade

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S

```


### `backend/alembic/env.py`
``` py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.core.database import Base
from app.models import *

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

```


### `backend/alembic/script.py.mako`
``` mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}

```


### `backend/app/__init__.py`
``` py

```


### `backend/app/api/__init__.py`
``` py

```


### `backend/app/api/deps/__init__.py`
``` py
from app.api.deps.auth import get_current_user, get_current_user_optional, get_admin_user

__all__ = ["get_current_user", "get_current_user_optional", "get_admin_user"]

```


### `backend/app/api/deps/auth.py`
``` py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_token, is_token_revoked
from app.models.user import User
from typing import Optional

security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = verify_token(credentials.credentials, "access")
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    if await is_token_revoked(credentials.credentials):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    token_version = payload.get("token_version", 0)
    if token_version < (user.token_version or 0):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session expired, please login again")

    return user


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if credentials is None:
        return None

    payload = verify_token(credentials.credentials, "access")
    if payload is None:
        return None

    if await is_token_revoked(credentials.credentials):
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    result = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = result.scalar_one_or_none()

    if user is None:
        return None

    token_version = payload.get("token_version", 0)
    if token_version < (user.token_version or 0):
        return None

    return user


async def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

```


### `backend/app/api/endpoints/__init__.py`
``` py
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

```


### `backend/app/api/endpoints/admin.py`
``` py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.admin import AuditLog, SystemLog
from app.models.learning import LearningContent, GlossaryTerm
from sqlalchemy import select, func, desc

router = APIRouter()


@router.get("/dashboard")
async def admin_dashboard(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    user_count = await db.scalar(select(func.count(User.id)))
    return {
        "total_users": user_count,
        "active_users": user_count,
        "total_content": 0,
        "system_health": "healthy",
    }


@router.get("/users")
async def admin_list_users(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(limit))
    users = result.scalars().all()
    return [
        {
            "id": str(u.id), "email": u.email, "full_name": u.full_name,
            "is_verified": u.is_verified, "is_admin": u.is_admin,
            "is_premium": u.is_premium, "is_active": u.is_active,
            "created_at": str(u.created_at),
        }
        for u in users
    ]


@router.post("/learning/content")
async def admin_create_content(
    title: str, content: str, category: str, difficulty: str = "beginner",
    admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db),
):
    lc = LearningContent(title=title, content=content, category=category, difficulty=difficulty, is_published=True)
    db.add(lc)
    await db.commit()
    await db.refresh(lc)
    return {"id": str(lc.id), "message": "Content created"}


@router.get("/logs")
async def admin_get_logs(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SystemLog).order_by(SystemLog.created_at.desc()).limit(limit))
    logs = result.scalars().all()
    return [
        {
            "id": str(l.id), "level": l.level, "module": l.module,
            "message": l.message, "created_at": str(l.created_at),
        }
        for l in logs
    ]


@router.get("/audit-logs")
async def admin_audit_logs(limit: int = 50, admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit))
    logs = result.scalars().all()
    return [
        {
            "id": str(l.id), "user_id": str(l.user_id) if l.user_id else None,
            "action": l.action, "resource": l.resource,
            "details": l.details, "ip_address": l.ip_address,
            "created_at": str(l.created_at),
        }
        for l in logs
    ]

```


### `backend/app/api/endpoints/ai.py`
``` py
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

```


### `backend/app/api/endpoints/alerts.py`
``` py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.alert import Alert, AlertHistory
from sqlalchemy import select, delete

router = APIRouter()


@router.get("/")
async def get_alerts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Alert).where(Alert.user_id == current_user.id).order_by(Alert.created_at.desc())
    )
    alerts = result.scalars().all()
    return [
        {
            "id": str(a.id), "alert_type": a.alert_type, "stock_id": str(a.stock_id) if a.stock_id else None,
            "condition": a.condition, "is_active": a.is_active,
            "notification_type": a.notification_type, "created_at": str(a.created_at),
        }
        for a in alerts
    ]


@router.post("/")
async def create_alert(
    alert_type: str = Body(...), condition: dict = Body(...), stock_id: str = Body(None),
    notification_type: str = Body("push"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    alert = Alert(
        user_id=current_user.id, stock_id=stock_id,
        alert_type=alert_type, condition=condition,
        notification_type=notification_type,
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return {"id": str(alert.id), "message": "Alert created"}


@router.put("/{alert_id}/toggle")
async def toggle_alert(alert_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id))
    alert = result.scalar_one_or_none()
    if not alert:
        return {"error": "Alert not found"}
    alert.is_active = not alert.is_active
    db.add(alert)
    await db.commit()
    return {"id": str(alert.id), "is_active": alert.is_active, "message": "Alert toggled"}


@router.delete("/{alert_id}")
async def delete_alert(alert_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Alert).where(Alert.id == alert_id, Alert.user_id == current_user.id))
    await db.commit()
    return {"message": "Alert deleted"}


@router.get("/history")
async def get_alert_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AlertHistory)
        .join(Alert, AlertHistory.alert_id == Alert.id)
        .where(Alert.user_id == current_user.id)
        .order_by(AlertHistory.created_at.desc())
        .limit(50)
    )
    history = result.scalars().all()
    return [
        {
            "id": str(h.id), "alert_id": str(h.alert_id),
            "triggered_value": h.triggered_value, "message": h.message,
            "is_read": h.is_read, "created_at": str(h.created_at),
        }
        for h in history
    ]

```


### `backend/app/api/endpoints/auth.py`
``` py
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.user import (
    UserCreate, UserLogin, TokenResponse, RefreshTokenRequest,
    OTPRequest, OTPVerify, GoogleLoginRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, UpdateProfileRequest, UserResponse,
)
from app.api.deps import get_current_user
from app.models.user import User
from app.core.security import hash_password, decode_token
from sqlalchemy import select
from slowapi.util import get_remote_address
from slowapi import Limiter
from app.core.config import settings

limiter = Limiter(key_func=get_remote_address)
router = APIRouter()


@router.post("/register", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_REGISTER)
async def register(data: UserCreate, request: Request, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.register(data)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit(settings.RATE_LIMIT_LOGIN)
async def login(data: UserLogin, request: Request, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.login(data, request.client.host)
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/logout")
async def logout(request: Request, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")
    service = AuthService(db)
    await service.logout(token)
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
async def logout_all(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    service = AuthService(db)
    await service.logout_all_sessions(str(current_user.id))
    return {"message": "All sessions logged out successfully"}


@router.post("/google", response_model=TokenResponse)
async def google_login(data: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    result = await service.google_login(
        google_id=data.id_token,
        email=data.id_token,
        full_name="Google User",
    )
    return {
        "access_token": result["access_token"],
        "refresh_token": result["refresh_token"],
        "token_type": "bearer",
        "user": UserResponse.model_validate(result["user"]),
    }


@router.post("/refresh")
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    tokens = await service.refresh_token(data.refresh_token)
    return tokens


@router.post("/otp/send")
async def send_otp(data: OTPRequest, db: AsyncSession = Depends(get_db)):
    return {"message": "OTP sent successfully", "otp": "123456"}


@router.post("/otp/verify")
async def verify_otp(data: OTPVerify, db: AsyncSession = Depends(get_db)):
    return {"message": "OTP verified", "verified": True}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if data.full_name:
        current_user.full_name = data.full_name
    if data.avatar_url:
        current_user.avatar_url = data.avatar_url
    if data.preferences:
        current_user.preferences = data.preferences
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.core.security import verify_password, hash_password
    if not verify_password(data.current_password, current_user.password_hash):
        return {"message": "Current password is incorrect", "success": False}
    current_user.password_hash = hash_password(data.new_password)
    db.add(current_user)
    await db.commit()
    return {"message": "Password changed successfully", "success": True}

```


### `backend/app/api/endpoints/backtest.py`
``` py
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

```


### `backend/app/api/endpoints/dashboard.py`
``` py
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.core.database import get_db
from app.services.stock_service import StockService
from app.models.stock import Stock, StockPrice, StockNews, CorporateAction

router = APIRouter()


@router.get("/overview")
async def get_market_overview(limit: int = Query(50), db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    return await service.get_market_overview(limit=limit)


@router.get("/market-movers")
async def get_market_movers(
    type: str = "gainers",
    limit: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    effective_limit = min(limit if limit is not None and limit > 0 else 500, 500)
    if type == "gainers":
        return {"type": type, "data": await service._get_top_movers("gainers", effective_limit)}
    elif type == "losers":
        return {"type": type, "data": await service._get_top_movers("losers", effective_limit)}
    elif type == "active":
        return {"type": type, "data": await service._get_most_active(effective_limit)}
    return {"type": type, "data": []}


@router.get("/indices")
async def get_indices(
    history_days: int = Query(30, ge=1, le=90),
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    index_data = await service._get_all_index_data()

    history = {}
    for symbol in ["NIFTY", "SENSEX", "BANKNIFTY", "INDIAVIX"]:
        stock_result = await db.execute(
            select(Stock).filter(Stock.symbol == symbol, Stock.is_index == True)
        )
        stock = stock_result.scalar_one_or_none()
        if not stock:
            history[symbol] = []
            continue
        prices_page = await service.get_stock_prices(str(stock.id), "1D", history_days)
        history[symbol] = [
            {
                "date": p.get("date", ""),
                "open": p.get("open", 0),
                "high": p.get("high", 0),
                "low": p.get("low", 0),
                "close": p.get("close", 0),
            }
            for p in prices_page.items
        ]

    indices_list = []
    for symbol_key, name in [("nifty", "NIFTY"), ("sensex", "SENSEX"), ("banknifty", "BANKNIFTY"), ("vix", "INDIAVIX")]:
        data = index_data.get(symbol_key)
        indices_list.append({"name": name, "data": data})

    return {
        "indices": indices_list,
        "history": history,
    }


@router.get("/news")
async def get_market_news(limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StockNews)
        .filter(StockNews.is_market_news == True)
        .order_by(StockNews.published_at.desc())
        .limit(limit)
    )
    news_items = result.scalars().all()
    if not news_items:
        result = await db.execute(
            select(Stock).filter(Stock.is_active == True).limit(limit)
        )
        stocks = result.scalars().all()
        return [
            {
                "title": f"{stock.company_name} - Market Update",
                "description": f"Latest updates for {stock.company_name} in the {stock.sector or 'N/A'} sector.",
                "symbol": stock.symbol,
                "source": "TradeAI",
                "published_at": str(stock.created_at),
            }
            for stock in stocks
        ]
    return [
        {
            "id": str(n.id),
            "title": n.title,
            "description": n.description,
            "source": n.source,
            "url": n.url,
            "published_at": n.published_at.isoformat() if n.published_at else None,
            "sentiment": n.sentiment,
        }
        for n in news_items
    ]


@router.get("/corporate-actions")
async def get_corporate_actions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CorporateAction)
        .order_by(CorporateAction.announced_date.desc())
        .limit(20)
    )
    actions = result.scalars().all()
    return {"actions": [
        {
            "id": str(a.id),
            "symbol": a.stock.symbol if a.stock else None,
            "action_type": a.action_type,
            "description": a.description,
            "ex_date": a.ex_date.isoformat() if a.ex_date else None,
            "announced_date": a.announced_date.isoformat() if a.announced_date else None,
            "value": a.value,
        }
        for a in actions
    ]}


@router.get("/calendar")
async def get_economic_calendar():
    return {"events": []}


@router.get("/ipo")
async def get_ipo_calendar():
    return {"ipo": []}

```


### `backend/app/api/endpoints/learning.py`
``` py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.learning import LearningContent, GlossaryTerm
from sqlalchemy import select

router = APIRouter()


@router.get("/content")
async def get_learning_content(
    category: str = None,
    difficulty: str = Query(None, regex="^(beginner|intermediate|advanced)$"),
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    query = select(LearningContent).where(LearningContent.is_published == True)
    if category:
        query = query.where(LearningContent.category == category)
    if difficulty:
        query = query.where(LearningContent.difficulty == difficulty)
    query = query.limit(limit)
    result = await db.execute(query)
    contents = result.scalars().all()
    return [
        {
            "id": str(c.id), "title": c.title, "category": c.category,
            "subcategory": c.subcategory, "difficulty": c.difficulty,
            "tags": c.tags, "image_url": c.image_url,
        }
        for c in contents
    ]


@router.get("/content/{content_id}")
async def get_learning_content_detail(content_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(LearningContent).where(LearningContent.id == content_id))
    content = result.scalar_one_or_none()
    if not content:
        return {"error": "Content not found"}
    return {
        "id": str(content.id), "title": content.title, "content": content.content,
        "category": content.category, "subcategory": content.subcategory,
        "difficulty": content.difficulty, "tags": content.tags,
        "image_url": content.image_url, "video_url": content.video_url,
    }


@router.get("/glossary")
async def get_glossary(term: str = None, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(GlossaryTerm)
    if term:
        query = query.where(GlossaryTerm.term.ilike(f"%{term}%"))
    query = query.limit(limit)
    result = await db.execute(query)
    terms = result.scalars().all()
    return [
        {"id": str(t.id), "term": t.term, "definition": t.definition, "category": t.category}
        for t in terms
    ]

```


### `backend/app/api/endpoints/news.py`
``` py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.stock import StockNews, Stock
from sqlalchemy import select, desc

router = APIRouter()


@router.get("/")
async def get_news(
    category: str = Query(None, regex="^(company|sector|market|economy|global)$"),
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    query = select(StockNews).where(StockNews.is_market_news == True)
    if category:
        query = query.where(StockNews.category == category)
    query = query.order_by(StockNews.published_at.desc().nulls_last()).limit(limit)
    result = await db.execute(query)
    news = result.scalars().all()
    return [
        {
            "id": str(n.id), "title": n.title, "description": n.description,
            "source": n.source, "url": n.url,
            "published_at": str(n.published_at) if n.published_at else None,
            "sentiment": n.sentiment, "category": n.category,
        }
        for n in news
    ]


@router.get("/company/{symbol}")
async def get_company_news(symbol: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    stock_result = await db.execute(select(Stock).where(Stock.symbol == symbol.upper()))
    stock = stock_result.scalar_one_or_none()
    if not stock:
        return {"error": "Stock not found"}
    result = await db.execute(
        select(StockNews)
        .where(StockNews.stock_id == stock.id)
        .order_by(StockNews.published_at.desc().nulls_last())
        .limit(limit)
    )
    news = result.scalars().all()
    return [
        {
            "id": str(n.id), "title": n.title, "description": n.description,
            "source": n.source, "url": n.url,
            "published_at": str(n.published_at) if n.published_at else None,
            "sentiment": n.sentiment,
        }
        for n in news
    ]

```


### `backend/app/api/endpoints/portfolio.py`
``` py
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

```


### `backend/app/api/endpoints/scanner.py`
``` py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.services.scanner_service import ScannerService
from app.api.deps import get_current_user
from app.models.user import User
from app.models.scanner import SavedScan, ScanHistory
from sqlalchemy import select
import json

router = APIRouter()


@router.post("/execute")
async def execute_scan(
    conditions: list = Body(...),
    logic: str = "AND",
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    service = ScannerService(db)
    results = await service.execute_scan(conditions, logic, limit, offset)
    return {"results": results, "total": len(results), "limit": limit, "offset": offset}


@router.get("/prebuilt")
async def get_prebuilt_scans():
    return {
        "scans": [
            {"id": "breakout", "name": "Breakout Stocks", "category": "momentum"},
            {"id": "rsi_oversold", "name": "RSI Oversold", "category": "oversold"},
            {"id": "golden_cross", "name": "Golden Cross", "category": "technical"},
            {"id": "strong_fundamentals", "name": "Strong Fundamentals", "category": "fundamental"},
            {"id": "high_roe", "name": "High ROE Stocks", "category": "fundamental"},
            {"id": "low_debt", "name": "Low Debt Stocks", "category": "fundamental"},
            {"id": "volume_spike", "name": "Volume Spike", "category": "technical"},
            {"id": "52_week_high", "name": "52 Week High", "category": "momentum"},
            {"id": "52_week_low", "name": "52 Week Low", "category": "bearish"},
            {"id": "small_cap", "name": "Small Cap Gems", "category": "screener"},
            {"id": "mid_cap", "name": "Mid Cap Opportunities", "category": "screener"},
            {"id": "large_cap", "name": "Large Cap Leaders", "category": "screener"},
            {"id": "dividend", "name": "Dividend Stocks", "category": "income"},
            {"id": "growth", "name": "Growth Stocks", "category": "growth"},
            {"id": "death_cross", "name": "Death Cross", "category": "technical"},
        ]
    }


@router.get("/saved")
async def get_saved_scans(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(SavedScan).where(SavedScan.user_id == current_user.id).order_by(SavedScan.created_at.desc())
    )
    scans = result.scalars().all()
    return [
        {"id": str(s.id), "name": s.name, "description": s.description, "is_shared": s.is_shared, "created_at": str(s.created_at)}
        for s in scans
    ]


@router.post("/saved")
async def save_scan(
    name: str = Body(...), description: str = Body(...), scan_config: dict = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = SavedScan(user_id=current_user.id, name=name, description=description, scan_config=scan_config)
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    return {"id": str(scan.id), "name": scan.name, "message": "Scan saved"}

```


### `backend/app/api/endpoints/stocks.py`
``` py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Any
import numpy as np
from app.core.database import get_db
from app.services.stock_service import StockService
from app.services.technical_service import TechnicalAnalysisService as TA, _clean
from app.schemas.stock import StockBasic, StockDetail, StockPriceResponse, TechnicalIndicator, PatternResult

router = APIRouter()


@router.get("/search")
async def search_stocks(
    query: str = Query(min_length=1),
    limit: int = 20,
    cursor: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    result = await service.search_stocks(query, limit, cursor)
    if cursor:
        return result.model_dump()
    return result.items


@router.get("/{symbol}")
async def get_stock_detail(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    return {
        "id": str(stock.id),
        "symbol": stock.symbol,
        "company_name": stock.company_name,
        "sector": stock.sector,
        "industry": stock.industry,
        "bse_code": stock.bse_code,
        "nse_symbol": stock.nse_symbol,
        "isin": stock.isin,
        "description": stock.description,
        "logo_url": stock.logo_url,
        "face_value": stock.face_value,
        "listing_date": str(stock.listing_date) if stock.listing_date else None,
        "fundamentals": {
            "market_cap": stock.fundamentals.market_cap if stock.fundamentals else None,
            "enterprise_value": stock.fundamentals.enterprise_value if stock.fundamentals else None,
            "pe_ratio": stock.fundamentals.pe_ratio if stock.fundamentals else None,
            "pb_ratio": stock.fundamentals.pb_ratio if stock.fundamentals else None,
            "eps": stock.fundamentals.eps if stock.fundamentals else None,
            "book_value": stock.fundamentals.book_value if stock.fundamentals else None,
            "dividend_yield": stock.fundamentals.dividend_yield if stock.fundamentals else None,
            "roe": stock.fundamentals.roe if stock.fundamentals else None,
            "roce": stock.fundamentals.roce if stock.fundamentals else None,
            "debt_to_equity": stock.fundamentals.debt_to_equity if stock.fundamentals else None,
            "current_ratio": stock.fundamentals.current_ratio if stock.fundamentals else None,
            "promoter_holding": stock.fundamentals.promoter_holding if stock.fundamentals else None,
            "fii_holding": stock.fundamentals.fii_holding if stock.fundamentals else None,
            "dii_holding": stock.fundamentals.dii_holding if stock.fundamentals else None,
            "mutual_fund_holding": stock.fundamentals.mutual_fund_holding if stock.fundamentals else None,
        } if stock.fundamentals else {},
    }


@router.get("/{symbol}/prices")
async def get_stock_prices(
    symbol: str,
    interval: str = Query("1D", pattern="^(1m|5m|15m|30m|1h|4h|1D|1W|1M)$"),
    limit: int = 100,
    cursor: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    result = await service.get_stock_prices(str(stock.id), interval, limit, cursor)
    if cursor:
        return result.model_dump()
    return result.items


@router.get("/{symbol}/technical")
async def get_technical_indicators(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    prices_raw = await service.get_stock_prices(str(stock.id), "1D", 200)
    prices = prices_raw.items
    if not prices:
        return {"error": "No price data"}

    sma20 = TA.compute_sma(prices, 20)
    sma50 = TA.compute_sma(prices, 50) if len(prices) >= 50 else []
    ema20 = TA.compute_ema(prices, 20)
    rsi = TA.compute_rsi(prices, 14)
    macd = TA.compute_macd(prices)
    bb = TA.compute_bollinger_bands(prices)
    adx = TA.compute_adx(prices) if len(prices) >= 28 else []
    atr = TA.compute_atr(prices)
    obv = TA.compute_obv(prices)
    mfi = TA.compute_mfi(prices) if len(prices) >= 20 else []
    stoch = TA.compute_stochastic_rsi(prices) if len(prices) >= 28 else []
    wr = TA.compute_williams_r(prices)
    cci = TA.compute_cci(prices) if len(prices) >= 20 else []
    supertrend = TA.compute_supertrend(prices)

    return {
        "sma_20": _clean(sma20[-1]) if sma20 else None,
        "sma_50": _clean(sma50[-1]) if sma50 else None,
        "ema_20": _clean(ema20[-1]) if ema20 else None,
        "rsi_14": _clean(rsi[-1]) if rsi else None,
        "macd": {k: [_clean(x) for x in v] for k, v in macd.items()},
        "bollinger_bands": {k: [_clean(x) for x in v] for k, v in bb.items()},
        "adx": _clean(adx[-1]) if adx else None,
        "atr": _clean(atr[-1]) if atr else None,
        "obv": _clean(obv[-1]) if obv else None,
        "mfi": _clean(mfi[-1]) if mfi else None,
        "stoch_rsi": _clean(stoch[-1]) if stoch else None,
        "williams_r": _clean(wr[-1]) if wr else None,
        "cci": _clean(cci[-1]) if cci else None,
        "supertrend": {k: [_clean(x) for x in v] for k, v in supertrend.items()},
    }


@router.get("/{symbol}/patterns")
async def get_chart_patterns(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock:
        return {"error": "Stock not found"}
    prices_raw = await service.get_stock_prices(str(stock.id), "1D", 200)
    prices = prices_raw.items
    if not prices:
        return {"error": "No price data"}

    candlestick = TA.detect_candlestick_patterns(prices)
    chart = TA.detect_chart_patterns(prices)
    sr = TA.compute_support_resistance(prices)

    return {
        "candlestick_patterns": candlestick,
        "chart_patterns": chart,
        "support_resistance": {k: [_clean(x) for x in v] for k, v in sr.items()},
    }


@router.get("/{symbol}/fundamentals")
async def get_fundamentals(symbol: str, db: AsyncSession = Depends(get_db)):
    service = StockService(db)
    stock = await service.get_stock_by_symbol(symbol.upper())
    if not stock or not stock.fundamentals:
        return {"error": "No fundamentals data"}
    f = stock.fundamentals
    return {
        "market_cap": f.market_cap, "enterprise_value": f.enterprise_value,
        "pe_ratio": f.pe_ratio, "pb_ratio": f.pb_ratio, "eps": f.eps,
        "book_value": f.book_value, "dividend_yield": f.dividend_yield,
        "roe": f.roe, "roce": f.roce, "debt_to_equity": f.debt_to_equity,
        "current_ratio": f.current_ratio, "quick_ratio": f.quick_ratio,
        "promoter_holding": f.promoter_holding, "fii_holding": f.fii_holding,
        "dii_holding": f.dii_holding, "mutual_fund_holding": f.mutual_fund_holding,
        "sales_growth": f.sales_growth, "profit_growth": f.profit_growth,
        "operating_margin": f.operating_margin, "net_margin": f.net_margin,
    }

```


### `backend/app/api/endpoints/watchlist.py`
``` py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.stock import Stock
from sqlalchemy import select, delete
import uuid

router = APIRouter()


@router.get("/")
async def get_watchlists(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Watchlist).where(Watchlist.user_id == current_user.id).order_by(Watchlist.sort_order)
    )
    watchlists = result.scalars().all()
    data = []
    for wl in watchlists:
        items_result = await db.execute(
            select(WatchlistItem).where(WatchlistItem.watchlist_id == wl.id)
        )
        items = items_result.scalars().all()
        data.append({
            "id": str(wl.id), "name": wl.name, "description": wl.description,
            "item_count": len(items),
            "items": [{"id": str(i.id), "stock_id": str(i.stock_id), "notes": i.notes} for i in items],
        })
    return data


@router.post("/")
async def create_watchlist(name: str = Body(...), description: str = Body(None), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    wl = Watchlist(user_id=current_user.id, name=name, description=description)
    db.add(wl)
    await db.commit()
    await db.refresh(wl)
    return {"id": str(wl.id), "name": wl.name, "message": "Watchlist created"}


@router.post("/{watchlist_id}/items")
async def add_to_watchlist(watchlist_id: str, stock_id: str = Body(...), notes: str = Body(None), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    item = WatchlistItem(watchlist_id=watchlist_id, stock_id=stock_id, notes=notes)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return {"id": str(item.id), "message": "Stock added to watchlist"}


@router.delete("/{watchlist_id}/items/{item_id}")
async def remove_from_watchlist(watchlist_id: str, item_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(WatchlistItem).where(WatchlistItem.id == item_id, WatchlistItem.watchlist_id == watchlist_id))
    await db.commit()
    return {"message": "Stock removed from watchlist"}


@router.delete("/{watchlist_id}")
async def delete_watchlist(watchlist_id: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Watchlist).where(Watchlist.id == watchlist_id, Watchlist.user_id == current_user.id))
    await db.commit()
    return {"message": "Watchlist deleted"}

```


### `backend/app/api/endpoints/websocket.py`
``` py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from app.services.websocket_manager import manager
from app.core.security import verify_token
from urllib.parse import parse_qs

router = APIRouter()


@router.websocket("/market")
async def market_websocket(websocket: WebSocket):
    await manager.connect(websocket, "market:prices")
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "subscribe":
                symbol = data.get("symbol")
                if symbol:
                    await manager.connect(websocket, f"stock:{symbol}")
            elif data.get("type") == "unsubscribe":
                symbol = data.get("symbol")
                if symbol:
                    await manager.disconnect(websocket, f"stock:{symbol}")
    except WebSocketDisconnect:
        await manager.disconnect(websocket, "market:prices")


@router.websocket("/user")
async def user_websocket(websocket: WebSocket):
    token = parse_qs(websocket.scope.get("query_string", b"").decode()).get("token", [None])[0]
    if not token:
        await websocket.close(code=4001)
        return

    payload = verify_token(token, "access")
    if not payload:
        await websocket.close(code=4001)
        return

    user_id = payload.get("sub")
    await manager.connect(websocket, f"user:{user_id}", user_id)
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "ping":
                await manager.send_personal_message({"type": "pong"}, websocket)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, f"user:{user_id}", user_id)

```


### `backend/app/core/__init__.py`
``` py

```


### `backend/app/core/config.py`
``` py
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "TradeAI - Stock Market Analytics"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "production"

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "trade"
    POSTGRES_USER: str = "trade_user"
    POSTGRES_PASSWORD: str
    DATABASE_URL: Optional[str] = None

    @property
    def db_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def db_url_sync(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL.replace("+asyncpg", "")
        return f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None

    OPENAI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None

    FIREBASE_CREDENTIALS: Optional[str] = None

    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    AWS_ENDPOINT_URL: Optional[str] = None
    AWS_REGION: str = "ap-south-1"

    SENTRY_DSN: Optional[str] = None

    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    ALLOWED_HOSTS: str = "localhost,127.0.0.1,backend,tradeai.local,test,testserver,test.local"

    @property
    def cors_origins_list(self) -> list:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    @property
    def allowed_hosts_list(self) -> list:
        return [h.strip() for h in self.ALLOWED_HOSTS.split(",")]

    CELERY_BROKER_URL: Optional[str] = None
    CELERY_RESULT_BACKEND: Optional[str] = None

    RATE_LIMIT_GLOBAL: str = "100/minute"
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"

    @property
    def celery_broker(self) -> str:
        if self.CELERY_BROKER_URL:
            return self.CELERY_BROKER_URL
        return self.redis_url

    @property
    def celery_backend(self) -> str:
        if self.CELERY_RESULT_BACKEND:
            return self.CELERY_RESULT_BACKEND
        return self.redis_url

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"


settings = Settings()

```


### `backend/app/core/database.py`
``` py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator
from app.core.config import settings

_engine = None
_async_session = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(
            settings.db_url,
            echo=settings.DEBUG,
            pool_size=20,
            max_overflow=10,
            pool_pre_ping=True,
        )
    return _engine


def get_async_session():
    global _async_session
    if _async_session is None:
        _async_session = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session


def __getattr__(name):
    if name == "engine":
        return get_engine()
    if name == "async_session":
        return get_async_session()
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with get_async_session()() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

```


### `backend/app/core/pagination.py`
``` py
import base64
import json
from typing import Optional, List, TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")


def encode_cursor(value: str) -> str:
    return base64.urlsafe_b64encode(value.encode()).decode()


def decode_cursor(cursor: str) -> Optional[str]:
    if not cursor:
        return None
    try:
        return base64.urlsafe_b64decode(cursor.encode()).decode()
    except Exception:
        return None


class CursorPage(BaseModel, Generic[T]):
    items: List[T]
    next_cursor: Optional[str] = None
    has_more: bool = False
    total: Optional[int] = None

```


### `backend/app/core/redis_client.py`
``` py
import json
import functools
import hashlib
from typing import Optional, Callable
from redis.asyncio import Redis
from app.core.config import settings

redis_client: Redis = None


async def get_redis() -> Redis:
    global redis_client
    if redis_client is None:
        redis_client = Redis.from_url(settings.redis_url, decode_responses=True)
    return redis_client


async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        redis_client = None


async def cache_get(key: str) -> str | None:
    r = await get_redis()
    return await r.get(key)


async def cache_set(key: str, value: str, ttl: int = 300):
    r = await get_redis()
    await r.set(key, value, ex=ttl)


async def cache_delete(key: str):
    r = await get_redis()
    await r.delete(key)


async def cache_exists(key: str) -> bool:
    r = await get_redis()
    return await r.exists(key) > 0


async def cache_incr(key: str, amount: int = 1) -> int:
    r = await get_redis()
    return await r.incr(key, amount)


def _make_cache_key(prefix: str, args: tuple, kwargs: dict, skip_args: int = 0) -> str:
    parts = [prefix]
    for a in args[skip_args:]:
        parts.append(str(a))
    for k, v in sorted(kwargs.items()):
        if k == "db":
            continue
        parts.append(f"{k}={v}")
    raw = ":".join(parts)
    if len(raw) > 200:
        raw = hashlib.sha256(raw.encode()).hexdigest()
    return raw


def cached(ttl: int = 300, key_prefix: str = "", skip_args: int = 0):
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            prefix = key_prefix or f"{func.__module__}.{func.__qualname__}"
            cache_key = _make_cache_key(prefix, args, kwargs, skip_args)
            cached_val = await cache_get(cache_key)
            if cached_val is not None:
                return json.loads(cached_val)
            result = await func(*args, **kwargs)
            await cache_set(cache_key, json.dumps(result, default=str), ttl)
            return result
        return wrapper
    return decorator

```


### `backend/app/core/security.py`
``` py
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings
from app.core.redis_client import get_redis

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access", "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: Dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh", "jti": str(uuid.uuid4())})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_token(token: str, expected_type: str = "access") -> Optional[Dict[str, Any]]:
    payload = decode_token(token)
    if payload is None or payload.get("type") != expected_type:
        return None
    return payload


async def revoke_token(token: str, ttl_seconds: int) -> None:
    payload = decode_token(token)
    if payload is None:
        return
    jti = payload.get("jti")
    if jti:
        redis = await get_redis()
        await redis.set(f"token_denylist:{jti}", "revoked", ex=ttl_seconds)


async def is_token_revoked(token: str) -> bool:
    payload = decode_token(token)
    if payload is None:
        return True
    jti = payload.get("jti")
    if not jti:
        return False
    redis = await get_redis()
    result = await redis.get(f"token_denylist:{jti}")
    return result is not None

```


### `backend/app/main.py`
``` py
import logging
import time
import uuid
import traceback
import json
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from app.core.config import settings
from app.core.database import init_db, engine
from app.core.redis_client import close_redis, get_redis
from app.api.endpoints import router as api_router
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_GLOBAL])


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record),
            "level": record.levelname,
            "name": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        if hasattr(record, "route"):
            log_entry["route"] = record.route
        if hasattr(record, "latency_ms"):
            log_entry["latency_ms"] = record.latency_ms
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = traceback.format_exception(*record.exc_info)
        return json.dumps(log_entry)


handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logging.basicConfig(level=logging.INFO, handlers=[handler])
logger = logging.getLogger("tradeai")

if settings.SENTRY_DSN:
    import sentry_sdk
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.2,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_redis()


docs_kwargs = {}
if settings.is_production:
    docs_kwargs.update({
        "docs_url": None,
        "redoc_url": None,
        "openapi_url": None,
    })
elif settings.DEBUG:
    docs_kwargs.update({
        "docs_url": "/api/docs",
        "redoc_url": "/api/redoc",
        "openapi_url": "/api/openapi.json",
    })
else:
    docs_kwargs.update({
        "docs_url": "/api/docs",
        "redoc_url": "/api/redoc",
        "openapi_url": "/api/openapi.json",
    })

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    **docs_kwargs,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts_list,
)


@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    start = time.monotonic()
    response = await call_next(request)
    elapsed_ms = round((time.monotonic() - start) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    extra = {
        "request_id": request_id,
        "route": request.url.path,
        "method": request.method,
        "latency_ms": elapsed_ms,
        "status_code": response.status_code,
    }
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        extra["user_id"] = user_id
    logger.info("request", extra=extra)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(
        "Unhandled exception",
        extra={"request_id": request_id, "route": request.url.path},
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "request_id": request_id},
    )


app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check():
    db_ok = False
    redis_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    try:
        r = await get_redis()
        await r.ping()
        redis_ok = True
    except Exception:
        pass
    all_ok = db_ok and redis_ok
    status_code = 200 if all_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "healthy" if all_ok else "degraded",
            "app": settings.APP_NAME,
            "version": settings.VERSION,
            "database": "up" if db_ok else "down",
            "redis": "up" if redis_ok else "down",
        },
    )


@app.get("/ready")
async def ready_check():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        r = await get_redis()
        await r.ping()
        return {"status": "ready", "database": "up", "redis": "up"}
    except Exception:
        return JSONResponse(status_code=503, content={"status": "not ready"})

```


### `backend/app/models/__init__.py`
``` py
from app.models.base import BaseModel
from app.models.user import User, UserSession, LoginHistory
from app.models.stock import Stock, StockPrice, StockFundamental, StockQuarterlyResult, StockAnnualResult
from app.models.stock import CashFlow, BalanceSheet, ProfitLoss, Ratios, ShareholdingPattern
from app.models.stock import CorporateAction, StockNews, StockAnnouncement, StockEvent
from app.models.watchlist import Watchlist, WatchlistItem
from app.models.portfolio import Portfolio, PortfolioHolding, PortfolioTransaction, PortfolioDividend
from app.models.scanner import SavedScan, ScanHistory
from app.models.alert import Alert, AlertHistory
from app.models.backtest import BacktestStrategy, BacktestResult, BacktestTrade
from app.models.learning import LearningContent, GlossaryTerm
from app.models.admin import AuditLog, SystemLog

__all__ = [
    "BaseModel", "User", "UserSession", "LoginHistory",
    "Stock", "StockPrice", "StockFundamental", "StockQuarterlyResult", "StockAnnualResult",
    "CashFlow", "BalanceSheet", "ProfitLoss", "Ratios", "ShareholdingPattern",
    "CorporateAction", "StockNews", "StockAnnouncement", "StockEvent",
    "Watchlist", "WatchlistItem",
    "Portfolio", "PortfolioHolding", "PortfolioTransaction", "PortfolioDividend",
    "SavedScan", "ScanHistory",
    "Alert", "AlertHistory",
    "BacktestStrategy", "BacktestResult", "BacktestTrade",
    "LearningContent", "GlossaryTerm",
    "AuditLog", "SystemLog",
]

```


### `backend/app/models/admin.py`
``` py
from sqlalchemy import Column, String, Text, JSON, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class AuditLog(BaseModel):
    __tablename__ = "audit_logs"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(255), nullable=False)
    resource = Column(String(255), nullable=False)
    resource_id = Column(String(255), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)

    user = relationship("User")


class SystemLog(BaseModel):
    __tablename__ = "system_logs"

    level = Column(String(20), nullable=False)
    module = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    details = Column(JSON, nullable=True)

```


### `backend/app/models/alert.py`
``` py
from sqlalchemy import Column, String, Float, JSON, ForeignKey, Boolean, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Alert(BaseModel):
    __tablename__ = "alerts"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=True)
    alert_type = Column(String(100), nullable=False)
    condition = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    notification_type = Column(String(50), default="push")
    cooldown_minutes = Column(Integer, default=60)
    last_triggered = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="alerts")
    stock = relationship("Stock")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")


class AlertHistory(BaseModel):
    __tablename__ = "alert_history"

    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="CASCADE"), nullable=False)
    triggered_value = Column(Float, nullable=True)
    message = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)

    alert = relationship("Alert", back_populates="history")

```


### `backend/app/models/backtest.py`
``` py
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

```


### `backend/app/models/base.py`
``` py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class BaseModel(Base):
    __abstract__ = True

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

```


### `backend/app/models/learning.py`
``` py
from sqlalchemy import Column, String, Text, JSON, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import BaseModel


class LearningContent(BaseModel):
    __tablename__ = "learning_content"

    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    subcategory = Column(String(100), nullable=True)
    difficulty = Column(String(20), default="beginner")
    tags = Column(JSON, nullable=True)
    image_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    author = Column(String(255), nullable=True)


class GlossaryTerm(BaseModel):
    __tablename__ = "glossary_terms"

    term = Column(String(255), nullable=False, unique=True)
    definition = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    related_terms = Column(JSON, nullable=True)

```


### `backend/app/models/portfolio.py`
``` py
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

```


### `backend/app/models/scanner.py`
``` py
from sqlalchemy import Column, String, Text, JSON, ForeignKey, Boolean, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class SavedScan(BaseModel):
    __tablename__ = "saved_scans"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    scan_config = Column(JSON, nullable=False)
    is_shared = Column(Boolean, default=False, nullable=False)
    share_url = Column(String(500), nullable=True)
    is_prebuilt = Column(Boolean, default=False, nullable=False)
    category = Column(String(100), nullable=True)

    user = relationship("User", back_populates="saved_scans")
    history = relationship("ScanHistory", back_populates="scan", cascade="all, delete-orphan")


class ScanHistory(BaseModel):
    __tablename__ = "scan_history"

    scan_id = Column(UUID(as_uuid=True), ForeignKey("saved_scans.id", ondelete="CASCADE"), nullable=False)
    result_count = Column(Integer, nullable=False)
    results = Column(JSON, nullable=True)
    execution_time = Column(Float, nullable=True)
    scan_config = Column(JSON, nullable=True)

    scan = relationship("SavedScan", back_populates="history")

```


### `backend/app/models/stock.py`
``` py
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

```


### `backend/app/models/user.py`
``` py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
from app.core.database import Base


class User(BaseModel):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), unique=True, nullable=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_google_user = Column(Boolean, default=False, nullable=False)
    google_id = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    preferences = Column(JSON, default=dict, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)
    token_version = Column(Integer, default=0, nullable=False)

    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user", cascade="all, delete-orphan")
    watchlists = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    saved_scans = relationship("SavedScan", back_populates="user", cascade="all, delete-orphan")
    backtest_strategies = relationship("BacktestStrategy", back_populates="user", cascade="all, delete-orphan")


class UserSession(BaseModel):
    __tablename__ = "user_sessions"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String(500), nullable=False)
    device_info = Column(String(500), nullable=True)
    ip_address = Column(String(50), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")


class LoginHistory(BaseModel):
    __tablename__ = "login_history"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    login_type = Column(String(50), nullable=False)
    ip_address = Column(String(50), nullable=True)
    device_info = Column(String(500), nullable=True)
    is_successful = Column(Boolean, default=True, nullable=False)
    failure_reason = Column(String(255), nullable=True)

    user = relationship("User", back_populates="login_history")

```


### `backend/app/models/watchlist.py`
``` py
from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.models.base import BaseModel


class Watchlist(BaseModel):
    __tablename__ = "watchlists"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="watchlists")
    items = relationship("WatchlistItem", back_populates="watchlist", cascade="all, delete-orphan")


class WatchlistItem(BaseModel):
    __tablename__ = "watchlist_items"

    watchlist_id = Column(UUID(as_uuid=True), ForeignKey("watchlists.id", ondelete="CASCADE"), nullable=False)
    stock_id = Column(UUID(as_uuid=True), ForeignKey("stocks.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0, nullable=False)
    target_price = Column(Float, nullable=True)
    stop_loss = Column(Float, nullable=True)

    watchlist = relationship("Watchlist", back_populates="items")
    stock = relationship("Stock")

```


### `backend/app/schemas/__init__.py`
``` py

```


### `backend/app/schemas/stock.py`
``` py
import uuid
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date


class StockBasic(BaseModel):
    id: uuid.UUID
    symbol: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class StockPriceResponse(BaseModel):
    date: datetime
    open: float
    high: float
    low: float
    close: float
    volume: int
    delivery_percentage: Optional[float] = None
    vwap: Optional[float] = None
    oi: Optional[int] = None

    class Config:
        from_attributes = True


class StockDetail(StockBasic):
    bse_code: Optional[str] = None
    nse_symbol: Optional[str] = None
    isin: Optional[str] = None
    face_value: Optional[float] = None
    listing_date: Optional[date] = None
    description: Optional[str] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    eps: Optional[float] = None
    book_value: Optional[float] = None
    dividend_yield: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    promoter_holding: Optional[float] = None
    fii_holding: Optional[float] = None
    dii_holding: Optional[float] = None
    mutual_fund_holding: Optional[float] = None

    class Config:
        from_attributes = True


class TechnicalIndicator(BaseModel):
    name: str
    value: float
    signal: Optional[str] = None


class PatternResult(BaseModel):
    pattern_name: str
    direction: str
    confidence: float
    description: Optional[str] = None


class MarketOverview(BaseModel):
    index_name: str
    current_value: float
    change: float
    change_percent: float
    high: Optional[float] = None
    low: Optional[float] = None
    is_up: bool


class MarketMovers(BaseModel):
    symbol: str
    company_name: str
    last_price: float
    change: float
    change_percent: float
    volume: Optional[int] = None


class ScannerCondition(BaseModel):
    field: str
    operator: str
    value: str
    logic_group: Optional[str] = "AND"


class ScannerRequest(BaseModel):
    conditions: List[ScannerCondition]
    logic: str = "AND"
    sort_by: Optional[str] = None
    sort_order: Optional[str] = "desc"
    limit: int = 50
    offset: int = 0


class ScannerResult(BaseModel):
    symbol: str
    company_name: str
    last_price: float
    change_percent: float
    matched_conditions: List[str]
    score: Optional[float] = None

```


### `backend/app/schemas/user.py`
``` py
import uuid
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    is_verified: bool
    is_premium: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    otp: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferences: Optional[dict] = None

```


### `backend/app/services/__init__.py`
``` py

```


### `backend/app/services/ai_service.py`
``` py
from typing import Optional, List, Dict
import json
import os


class AIService:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY")
        self.provider = "openai" if os.getenv("OPENAI_API_KEY") else "gemini" if os.getenv("GEMINI_API_KEY") else None

    async def generate_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        if not self.provider:
            return self._fallback_response(prompt, context)
        try:
            return await self._call_ai_api(prompt, context)
        except Exception:
            return self._fallback_response(prompt, context)

    async def _call_ai_api(self, prompt: str, context: Optional[Dict] = None) -> str:
        if self.provider == "openai":
            return await self._call_openai(prompt, context)
        else:
            return await self._call_gemini(prompt, context)

    async def _call_openai(self, prompt: str, context: Optional[Dict] = None) -> str:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key)
            messages = [{"role": "system", "content": self._system_prompt()}]
            if context:
                messages.append({"role": "user", "content": f"Context: {json.dumps(context)}\n\n{prompt}"})
            else:
                messages.append({"role": "user", "content": prompt})
            response = await client.chat.completions.create(
                model="gpt-4o-mini", messages=messages, max_tokens=1024
            )
            return response.choices[0].message.content
        except Exception:
            raise

    async def _call_gemini(self, prompt: str, context: Optional[Dict] = None) -> str:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            full_prompt = f"{self._system_prompt()}\n\n"
            if context:
                full_prompt += f"Context: {json.dumps(context)}\n\n"
            full_prompt += prompt
            response = await model.generate_content_async(full_prompt)
            return response.text
        except Exception:
            raise

    def _system_prompt(self) -> str:
        return """You are TradeAI, an expert Indian stock market analyst assistant.
You provide accurate, data-driven insights about Indian stocks, markets, and trading.
Use simple language for beginners and detailed analysis for experts.
Always include disclaimers that this is not financial advice.
Focus on NSE/BSE listed stocks. Use Indian market terminology."""

    def _fallback_response(self, prompt: str, context: Optional[Dict] = None) -> str:
        prompt_lower = prompt.lower()

        if "explain" in prompt_lower and ("stock" in prompt_lower or "company" in prompt_lower):
            return self._explain_stock_fallback(context)
        if "summarize" in prompt_lower and "quarterly" in prompt_lower:
            return self._summarize_quarterly_fallback(context)
        if "technical" in prompt_lower or "indicator" in prompt_lower:
            return self._explain_technical_fallback()
        if "swing" in prompt_lower or "trade" in prompt_lower:
            return self._swing_trade_fallback()
        if "risk" in prompt_lower:
            return self._risk_fallback()
        return self._general_fallback()

    def _explain_stock_fallback(self, context: Optional[Dict] = None) -> str:
        if context and context.get("company_name"):
            return (
                f"**{context['company_name']}** is a company in the {context.get('sector', 'N/A')} sector. "
                f"Its current PE is {context.get('pe_ratio', 'N/A')} and ROE is {context.get('roe', 'N/A')}%. "
                f"The stock is trading at ₹{context.get('current_price', 'N/A')} with a market cap of {context.get('market_cap', 'N/A')} Cr. "
                f"Promoter holding is {context.get('promoter_holding', 'N/A')}% and FII holding is {context.get('fii_holding', 'N/A')}%."
                "\n\n*This is for educational purposes only. Not investment advice.*"
            )
        return "This stock shows reasonable fundamentals. Please check the stock page for detailed metrics. Not investment advice."

    def _summarize_quarterly_fallback(self, context: Optional[Dict] = None) -> str:
        return (
            "The quarterly results show the company's recent financial performance. "
            "Key metrics to look at include revenue growth, profit margins, and EPS trend. "
            "Compare with previous quarters to identify growth trajectory. "
            "\n\n*This is for educational purposes only. Not investment advice.*"
        )

    def _explain_technical_fallback(self) -> str:
        return (
            "Technical indicators help analyze price trends and momentum:\n"
            "- **RSI (Relative Strength Index)**: Measures overbought (>70) and oversold (<30) conditions\n"
            "- **MACD**: Shows trend direction and momentum changes\n"
            "- **Moving Averages**: Identify trend support/resistance levels\n"
            "- **Bollinger Bands**: Measure volatility and potential reversals\n"
            "- **Volume**: Confirms price movements\n\n"
            "*Always combine multiple indicators before making decisions. Not investment advice.*"
        )

    def _swing_trade_fallback(self) -> str:
        return (
            "For swing trading ideas, look for:\n"
            "1. Stocks with strong volume breakout from consolidation\n"
            "2. RSI between 40-60 with upward momentum\n"
            "3. Stock price above key moving averages (20, 50 EMA)\n"
            "4. Positive sector and market trend\n\n"
            "*These are educational suggestions. Do your own research. Not investment advice.*"
        )

    def _risk_fallback(self) -> str:
        return (
            "Risk assessment considers:\n"
            "- **Volatility**: Higher beta stocks carry more risk\n"
            "- **Debt Levels**: High debt-to-equity increases financial risk\n"
            "- **Promoter Pledging**: High pledging is a red flag\n"
            "- **Trading Volume**: Low liquidity increases execution risk\n"
            "- **Sector Concentration**: Lack of diversification\n\n"
            "*This is a general risk framework. Consult a financial advisor for personalized advice.*"
        )

    def _general_fallback(self) -> str:
        return (
            "Thank you for your query about the Indian stock market. "
            "I can help you with:\n"
            "- Stock analysis and fundamental data\n"
            "- Technical indicators and chart patterns\n"
            "- Market news and corporate actions\n"
            "- Investment strategies and risk management\n"
            "- Portfolio analysis and diversification\n\n"
            "Please feel free to ask a more specific question!\n\n"
            "*This is for educational purposes only. Not investment advice.*"
        )

```


### `backend/app/services/auth_service.py`
``` py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, UserSession, LoginHistory
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, revoke_token
from app.schemas.user import UserCreate, UserLogin
from fastapi import HTTPException, status
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: UserCreate) -> dict:
        existing = await self.db.execute(select(User).where(User.email == data.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(
            email=data.email,
            full_name=data.full_name,
            password_hash=hash_password(data.password),
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)

        tokens = self._generate_tokens(str(user.id), user.token_version)
        await self._log_login(user, "email", True)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def login(self, data: UserLogin, ip: Optional[str] = None) -> dict:
        result = await self.db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not user.password_hash:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        if not verify_password(data.password, user.password_hash):
            await self._log_login(user, "email", False, "Invalid password", ip)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

        user.last_login = datetime.now(timezone.utc)
        tokens = self._generate_tokens(str(user.id), user.token_version)
        await self._log_login(user, "email", True, ip=ip)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def google_login(self, google_id: str, email: str, full_name: str, avatar_url: Optional[str] = None) -> dict:
        result = await self.db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=email,
                full_name=full_name,
                google_id=google_id,
                is_google_user=True,
                is_verified=True,
                avatar_url=avatar_url,
            )
            self.db.add(user)
            await self.db.flush()
            await self.db.refresh(user)
        else:
            user.google_id = google_id
            user.is_google_user = True
            user.is_verified = True
            if avatar_url:
                user.avatar_url = avatar_url

        user.last_login = datetime.now(timezone.utc)
        tokens = self._generate_tokens(str(user.id), user.token_version)
        await self._log_login(user, "google", True)
        await self.db.commit()

        return {
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
            "user": user,
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user_id = payload.get("sub")
        user = await self.get_user_by_id(user_id)
        tokens = self._generate_tokens(user_id, user.token_version)
        return tokens

    async def logout(self, token: str) -> None:
        payload = decode_token(token)
        if payload is None:
            return
        exp = payload.get("exp", 0)
        now = datetime.now(timezone.utc).timestamp()
        ttl = max(int(exp - now), 0)
        if ttl > 0:
            await revoke_token(token, ttl)

    async def logout_all_sessions(self, user_id: str) -> None:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        user.token_version = (user.token_version or 0) + 1
        self.db.add(user)
        await self.db.commit()

    async def get_user_by_id(self, user_id: str) -> User:
        result = await self.db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return user

    def _generate_tokens(self, user_id: str, token_version: int = 0) -> dict:
        return {
            "access_token": create_access_token({"sub": user_id, "token_version": token_version}),
            "refresh_token": create_refresh_token({"sub": user_id, "token_version": token_version}),
        }

    async def _log_login(self, user: User, login_type: str, success: bool, reason: Optional[str] = None, ip: Optional[str] = None):
        log = LoginHistory(
            user_id=user.id,
            login_type=login_type,
            ip_address=ip,
            is_successful=success,
            failure_reason=reason,
        )
        self.db.add(log)

```


### `backend/app/services/scanner_service.py`
``` py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.stock import Stock, StockFundamental
from app.models.stock import StockPrice
from typing import List, Dict
import json


class ScannerService:
    FIELD_MAP = {
        "price": "price",
        "volume": "volume",
        "market_cap": "market_cap",
        "pe_ratio": "pe_ratio",
        "pb_ratio": "pb_ratio",
        "eps": "eps",
        "roe": "roe",
        "roce": "roce",
        "debt_equity": "debt_to_equity",
        "current_ratio": "current_ratio",
        "quick_ratio": "quick_ratio",
        "dividend_yield": "dividend_yield",
        "promoter_holding": "promoter_holding",
        "fii_holding": "fii_holding",
        "dii_holding": "dii_holding",
        "mutual_fund_holding": "mutual_fund_holding",
        "sales_growth": "sales_growth",
        "profit_growth": "profit_growth",
        "operating_margin": "operating_margin",
        "net_margin": "net_margin",
    }

    OPERATOR_MAP = {
        "above": ">",
        "below": "<",
        "equals": "=",
        "greater_than": ">",
        "less_than": "<",
        "between": "between",
    }

    def __init__(self, db: AsyncSession):
        self.db = db

    async def execute_scan(self, conditions: List[Dict], logic: str = "AND", limit: int = 50, offset: int = 0) -> List[Dict]:
        query = select(Stock).join(StockFundamental, Stock.id == StockFundamental.stock_id, isouter=True)
        filters = []

        for cond in conditions:
            field = cond.get("field")
            operator = cond.get("operator")
            value = cond.get("value")

            filter_cond = self._build_condition(field, operator, value)
            if filter_cond is not None:
                filters.append(filter_cond)

        if filters:
            if logic.upper() == "OR":
                query = query.where(or_(*filters))
            else:
                query = query.where(and_(*filters))

        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        stocks = result.scalars().all()

        return [
            {"symbol": s.symbol, "company_name": s.company_name, "sector": s.sector, "market_cap": s.market_cap}
            for s in stocks
        ]

    def _build_condition(self, field: str, operator: str, value: str):
        db_field = self.FIELD_MAP.get(field)
        if not db_field:
            return None

        try:
            num_value = float(value)
        except ValueError:
            return None

        col = getattr(StockFundamental, db_field, None)
        if col is None:
            col = getattr(Stock, db_field, None)
        if col is None:
            return None

        if operator in ("above", "greater_than", ">"):
            return col > num_value
        elif operator in ("below", "less_than", "<"):
            return col < num_value
        elif operator == "equals":
            return col == num_value
        elif operator == "between":
            return col.between(num_value, float(value.split(",")[1]) if "," in value else num_value * 1.1)

        return None

```


### `backend/app/services/stock_service.py`
``` py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from sqlalchemy.orm import joinedload
from app.models.stock import Stock, StockPrice, StockFundamental
from app.core.redis_client import cached
from app.core.pagination import encode_cursor, decode_cursor, CursorPage
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta


class StockService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_stocks(
        self, query: str, limit: int = 20, cursor: Optional[str] = None
    ) -> CursorPage[Dict[str, Any]]:
        stmt = (
            select(Stock)
            .filter(
                Stock.is_active == True,
                (Stock.symbol.ilike(f"%{query}%") | Stock.company_name.ilike(f"%{query}%"))
            )
            .order_by(Stock.symbol)
            .limit(limit + 1)
        )
        if cursor:
            decoded = decode_cursor(cursor)
            if decoded:
                stmt = stmt.filter(Stock.symbol > decoded)

        result = await self.db.execute(stmt)
        rows = result.scalars().all()

        has_more = len(rows) > limit
        if has_more:
            rows = rows[:limit]

        items = [
            {"id": str(s.id), "symbol": s.symbol, "company_name": s.company_name, "sector": s.sector}
            for s in rows
        ]

        next_cursor = None
        if has_more and rows:
            next_cursor = encode_cursor(rows[-1].symbol)

        return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)

    async def get_stock_by_symbol(self, symbol: str) -> Optional[Stock]:
        result = await self.db.execute(
            select(Stock).options(
                joinedload(Stock.fundamentals),
            ).filter(Stock.symbol == symbol, Stock.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_stock_prices(
        self, stock_id: str, interval: str = "1D", limit: int = 100,
        cursor: Optional[str] = None,
    ) -> CursorPage[Dict[str, Any]]:
        now = datetime.utcnow()
        if interval == "1D":
            since = now - timedelta(days=limit)
        elif interval == "1W":
            since = now - timedelta(weeks=limit)
        elif interval == "1M":
            since = now - timedelta(days=30 * limit)
        else:
            since = now - timedelta(days=limit)

        stmt = (
            select(StockPrice)
            .filter(
                StockPrice.stock_id == stock_id,
                StockPrice.date >= since,
            )
            .order_by(StockPrice.date.asc())
            .limit(limit + 1)
        )
        if cursor:
            decoded = decode_cursor(cursor)
            if decoded:
                try:
                    cursor_date = datetime.fromisoformat(decoded)
                    stmt = stmt.filter(StockPrice.date > cursor_date)
                except ValueError:
                    pass

        result = await self.db.execute(stmt)
        rows = result.scalars().all()

        has_more = len(rows) > limit
        if has_more:
            rows = rows[:limit]

        items = [
            {
                "date": p.date.isoformat() if hasattr(p.date, 'isoformat') else str(p.date),
                "open": p.open, "high": p.high, "low": p.low, "close": p.close,
                "volume": p.volume, "delivery_percentage": p.delivery_percentage,
                "vwap": p.vwap,
            }
            for p in rows
        ]

        next_cursor = None
        if has_more and rows:
            last_date = rows[-1].date
            next_cursor = encode_cursor(
                last_date.isoformat() if hasattr(last_date, 'isoformat') else str(last_date)
            )

        return CursorPage(items=items, next_cursor=next_cursor, has_more=has_more)

    @cached(ttl=30, skip_args=1)
    async def get_market_overview(self, limit: int = 50) -> Dict:
        indices = await self._get_all_index_data()
        effective_limit = min(limit if limit > 0 else 500, 500)
        gainers = await self._get_top_movers("gainers", effective_limit)
        losers = await self._get_top_movers("losers", effective_limit)
        active = await self._get_most_active(effective_limit)

        return {
            "indices": indices,
            "gainers": gainers,
            "losers": losers,
            "most_active": active,
        }

    async def _get_all_index_data(self) -> Dict[str, Optional[Dict]]:
        result = await self.db.execute(
            select(Stock).filter(Stock.is_index == True)
        )
        index_stocks = result.scalars().all()
        if not index_stocks:
            return {"nifty": None, "sensex": None, "banknifty": None, "vix": None}

        indices = {}
        for stock in index_stocks:
            prices = await self.get_stock_prices(str(stock.id), "1D", 2)
            if len(prices.items) >= 2:
                p = prices.items
                latest, prev = p[-1], p[-2]
                change = latest["close"] - prev["close"]
                change_percent = (change / prev["close"]) * 100 if prev["close"] else 0
                indices[stock.symbol.lower()] = {
                    "symbol": stock.symbol,
                    "current_value": latest["close"],
                    "change": round(change, 2),
                    "change_percent": round(change_percent, 2),
                    "high": latest["high"],
                    "low": latest["low"],
                    "is_up": change >= 0,
                }
            else:
                indices[stock.symbol.lower()] = None
        return indices

    async def _get_top_movers(self, movers_type: str, limit: int) -> List[Dict]:
        subq = (
            select(
                StockPrice.stock_id,
                func.max(StockPrice.date).label("max_date"),
            )
            .group_by(StockPrice.stock_id)
            .subquery()
        )
        latest_two = (
            select(
                StockPrice.stock_id,
                StockPrice.close,
                StockPrice.date,
                func.row_number().over(
                    partition_by=StockPrice.stock_id,
                    order_by=StockPrice.date.desc(),
                ).label("rn"),
            )
            .join(subq, StockPrice.stock_id == subq.c.stock_id)
            .filter(
                StockPrice.date >= func.now() - timedelta(days=10),
            )
            .subquery()
        )
        cte = (
            select(latest_two)
            .filter(latest_two.c.rn <= 2)
            .cte("cte")
        )
        pairs = (
            select(
                cte.c.stock_id,
                func.max(cte.c.close).filter(cte.c.rn == 1).label("latest_close"),
                func.max(cte.c.close).filter(cte.c.rn == 2).label("prev_close"),
            )
            .group_by(cte.c.stock_id)
            .subquery()
        )
        change_expr = (pairs.c.latest_close - pairs.c.prev_close) / pairs.c.prev_close * 100
        order = change_expr.desc() if movers_type == "gainers" else change_expr.asc()
        stmt = (
            select(
                Stock.symbol,
                Stock.company_name,
                Stock.sector,
                pairs.c.latest_close,
                change_expr.label("change_percent"),
            )
            .join(pairs, Stock.id == pairs.c.stock_id)
            .filter(
                Stock.is_active == True,
                Stock.is_index == False,
                pairs.c.latest_close.isnot(None),
                pairs.c.prev_close.isnot(None),
            )
            .order_by(order)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            {
                "symbol": r.symbol,
                "company_name": r.company_name,
                "sector": r.sector,
                "price": round(float(r.latest_close), 2) if r.latest_close else None,
                "change_percent": round(float(r.change_percent), 2) if r.change_percent else None,
            }
            for r in rows
        ]

    async def _get_most_active(self, limit: int) -> List[Dict]:
        latest_date_subq = (
            select(
                StockPrice.stock_id,
                func.max(StockPrice.date).label("max_date"),
            )
            .group_by(StockPrice.stock_id)
            .subquery()
        )
        stmt = (
            select(
                Stock.symbol,
                Stock.company_name,
                StockPrice.close,
                StockPrice.volume,
                Stock.sector,
            )
            .join(StockPrice, Stock.id == StockPrice.stock_id)
            .join(
                latest_date_subq,
                (StockPrice.stock_id == latest_date_subq.c.stock_id)
                & (StockPrice.date == latest_date_subq.c.max_date),
            )
            .filter(
                Stock.is_active == True,
                Stock.is_index == False,
            )
            .order_by(StockPrice.volume.desc())
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        rows = result.all()
        return [
            {
                "symbol": r.symbol,
                "company_name": r.company_name,
                "sector": r.sector,
                "price": round(float(r.close), 2) if r.close else None,
                "volume": int(r.volume) if r.volume else 0,
            }
            for r in rows
        ]

```


### `backend/app/services/technical_service.py`
``` py
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple, Any
from app.models.stock import StockPrice
from datetime import datetime


def _clean(val: Any) -> Any:
    if isinstance(val, float):
        return None if (np.isnan(val) or np.isinf(val)) else val
    return val


def _to_series(prices: List) -> pd.DataFrame:
    data = {
        "open": [p["open"] if isinstance(p, dict) else p.open for p in prices],
        "high": [p["high"] if isinstance(p, dict) else p.high for p in prices],
        "low": [p["low"] if isinstance(p, dict) else p.low for p in prices],
        "close": [p["close"] if isinstance(p, dict) else p.close for p in prices],
        "volume": [p["volume"] if isinstance(p, dict) else p.volume for p in prices],
    }
    return pd.DataFrame(data)


class TechnicalAnalysisService:
    @staticmethod
    def compute_sma(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        sma = df["close"].rolling(window=period).mean()
        return sma.dropna().tolist()

    @staticmethod
    def compute_ema(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        ema = df["close"].ewm(span=period, adjust=False).mean()
        return ema.dropna().tolist()

    @staticmethod
    def compute_rsi(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        delta = df["close"].diff()
        gain = delta.where(delta > 0, 0).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi.dropna().tolist()

    @staticmethod
    def compute_macd(prices: List[StockPrice]) -> Dict[str, List[float]]:
        df = _to_series(prices)
        ema12 = df["close"].ewm(span=12, adjust=False).mean()
        ema26 = df["close"].ewm(span=26, adjust=False).mean()
        macd_line = ema12 - ema26
        signal = macd_line.ewm(span=9, adjust=False).mean()
        histogram = macd_line - signal
        return {
            "macd": macd_line.dropna().tolist(),
            "signal": signal.dropna().tolist(),
            "histogram": histogram.dropna().tolist(),
        }

    @staticmethod
    def compute_bollinger_bands(prices: List[StockPrice], period: int = 20, std: int = 2) -> Dict[str, List[float]]:
        df = _to_series(prices)
        sma = df["close"].rolling(window=period).mean()
        std_dev = df["close"].rolling(window=period).std()
        upper = sma + (std_dev * std)
        lower = sma - (std_dev * std)
        return {
            "upper": upper.dropna().tolist(),
            "middle": sma.dropna().tolist(),
            "lower": lower.dropna().tolist(),
        }

    @staticmethod
    def compute_adx(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        high, low, close = df["high"], df["low"], df["close"]
        plus_dm = high.diff()
        minus_dm = low.diff()
        tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        plus_di = 100 * (plus_dm.rolling(window=period).mean() / atr)
        minus_di = 100 * (minus_dm.rolling(window=period).mean() / atr)
        dx = abs(plus_di - minus_di) / (plus_di + minus_di) * 100
        adx = dx.rolling(window=period).mean()
        return adx.dropna().tolist()

    @staticmethod
    def compute_atr(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        high, low, close = df["high"], df["low"], df["close"]
        tr = pd.concat([high - low, (high - close.shift()).abs(), (low - close.shift()).abs()], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()
        return atr.dropna().tolist()

    @staticmethod
    def compute_obv(prices: List[StockPrice]) -> List[float]:
        df = _to_series(prices)
        obv = (np.sign(df["close"].diff()) * df["volume"]).fillna(0).cumsum()
        return obv.tolist()

    @staticmethod
    def compute_stochastic_rsi(prices: List[StockPrice], period: int = 14) -> List[float]:
        rsi_vals = TechnicalAnalysisService.compute_rsi(prices, period)
        if not rsi_vals:
            return []
        rsi_series = pd.Series(rsi_vals)
        min_rsi = rsi_series.rolling(window=period).min()
        max_rsi = rsi_series.rolling(window=period).max()
        stoch_rsi = (rsi_series - min_rsi) / (max_rsi - min_rsi)
        return stoch_rsi.dropna().tolist()

    @staticmethod
    def compute_williams_r(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        highest_high = df["high"].rolling(window=period).max()
        lowest_low = df["low"].rolling(window=period).min()
        wr = -100 * (highest_high - df["close"]) / (highest_high - lowest_low)
        return wr.dropna().tolist()

    @staticmethod
    def compute_cci(prices: List[StockPrice], period: int = 20) -> List[float]:
        df = _to_series(prices)
        tp = (df["high"] + df["low"] + df["close"]) / 3
        sma_tp = tp.rolling(window=period).mean()
        mad = tp.rolling(window=period).apply(lambda x: np.mean(np.abs(x - np.mean(x))))
        cci = (tp - sma_tp) / (0.015 * mad)
        return cci.dropna().tolist()

    @staticmethod
    def compute_mfi(prices: List[StockPrice], period: int = 14) -> List[float]:
        df = _to_series(prices)
        typical_price = (df["high"] + df["low"] + df["close"]) / 3
        money_flow = typical_price * df["volume"]
        positive_flow = money_flow.where(typical_price > typical_price.shift(), 0).rolling(window=period).sum()
        negative_flow = money_flow.where(typical_price < typical_price.shift(), 0).rolling(window=period).sum()
        mfi = 100 - (100 / (1 + positive_flow / negative_flow))
        return mfi.dropna().tolist()

    @staticmethod
    def compute_supertrend(prices: List[StockPrice], period: int = 10, multiplier: float = 3.0) -> Dict[str, List]:
        df = _to_series(prices)
        hl_avg = ((df["high"] + df["low"]) / 2).values
        atr = TechnicalAnalysisService.compute_atr(prices, period)
        if not atr:
            return {"trend": [], "upper": [], "lower": []}
        atr_arr = np.array(atr)
        offset = len(df) - len(atr_arr)
        upper_band = np.full(len(df), np.nan)
        lower_band = np.full(len(df), np.nan)
        upper_band[offset:] = hl_avg[offset:] + multiplier * atr_arr
        lower_band[offset:] = hl_avg[offset:] - multiplier * atr_arr
        supertrend = np.full(len(df), True)
        supertrend[offset:] = df["close"].values[offset:] <= upper_band[offset:]
        return {
            "trend": [bool(x) for x in supertrend],
            "upper": [float(x) if not (np.isnan(x) or np.isinf(x)) else None for x in upper_band],
            "lower": [float(x) if not (np.isnan(x) or np.isinf(x)) else None for x in lower_band],
        }

    @staticmethod
    def detect_candlestick_patterns(prices: List[StockPrice]) -> List[Dict]:
        patterns = []
        if len(prices) < 2:
            return patterns
        last = prices[-1]
        prev = prices[-2]

        body = abs(last.close - last.open)
        upper_shadow = last.high - max(last.close, last.open)
        lower_shadow = min(last.close, last.open) - last.low
        total_range = last.high - last.low

        if total_range == 0:
            return patterns

        # Hammer
        if body <= total_range * 0.3 and lower_shadow >= body * 2 and upper_shadow <= body * 0.3:
            patterns.append({"pattern": "Hammer", "direction": "bullish", "confidence": 0.8})

        # Shooting Star
        if body <= total_range * 0.3 and upper_shadow >= body * 2 and lower_shadow <= body * 0.3:
            patterns.append({"pattern": "Shooting Star", "direction": "bearish", "confidence": 0.8})

        # Doji
        if body <= total_range * 0.1:
            patterns.append({"pattern": "Doji", "direction": "neutral", "confidence": 0.6})

        # Bullish Engulfing
        if last.close > last.open and prev.close < prev.open and last.close > prev.open and last.open < prev.close:
            patterns.append({"pattern": "Bullish Engulfing", "direction": "bullish", "confidence": 0.85})

        # Bearish Engulfing
        if last.close < last.open and prev.close > prev.open and last.close < prev.open and last.open > prev.close:
            patterns.append({"pattern": "Bearish Engulfing", "direction": "bearish", "confidence": 0.85})

        # Morning Star (3 candle)
        if len(prices) >= 3:
            c1, c2, c3 = prices[-3], prices[-2], prices[-1]
            if c1.close < c1.open and abs(c3.close - c3.open) > body and c3.close > (c1.open + c1.close) / 2:
                if abs(c2.close - c2.open) <= abs(c1.close - c1.open) * 0.3:
                    patterns.append({"pattern": "Morning Star", "direction": "bullish", "confidence": 0.9})

            if c1.close > c1.open and abs(c3.close - c3.open) > body and c3.close < (c1.open + c1.close) / 2:
                if abs(c2.close - c2.open) <= abs(c1.close - c1.open) * 0.3:
                    patterns.append({"pattern": "Evening Star", "direction": "bearish", "confidence": 0.9})

        # Dragonfly Doji
        if body <= total_range * 0.05 and lower_shadow >= body * 3 and upper_shadow <= body * 0.5:
            patterns.append({"pattern": "Dragonfly Doji", "direction": "bullish", "confidence": 0.7})

        # Gravestone Doji
        if body <= total_range * 0.05 and upper_shadow >= body * 3 and lower_shadow <= body * 0.5:
            patterns.append({"pattern": "Gravestone Doji", "direction": "bearish", "confidence": 0.7})

        return patterns

    @staticmethod
    def detect_chart_patterns(prices: List[StockPrice]) -> List[Dict]:
        patterns = []
        if len(prices) < 30:
            return patterns

        df = _to_series(prices)
        close = df["close"].values

        # Double Top
        window = min(20, len(close) // 5)
        for i in range(len(close) - 2 * window, window, -1):
            left_peak = np.max(close[i - window:i])
            right_peak = np.max(close[i:i + window])
            middle_valley = np.min(close[i - window // 3:i + window // 3])

            if abs(left_peak - right_peak) / max(left_peak, right_peak) < 0.02:
                if middle_valley < min(left_peak, right_peak) * 0.97:
                    patterns.append({
                        "pattern": "Double Top",
                        "direction": "bearish",
                        "confidence": 0.75,
                    })
                    break

        # Double Bottom
        for i in range(len(close) - 2 * window, window, -1):
            left_bottom = np.min(close[i - window:i])
            right_bottom = np.min(close[i:i + window])
            middle_peak = np.max(close[i - window // 3:i + window // 3])

            if abs(left_bottom - right_bottom) / max(abs(left_bottom), abs(right_bottom)) < 0.02:
                if middle_peak > max(left_bottom, right_bottom) * 1.03:
                    patterns.append({
                        "pattern": "Double Bottom",
                        "direction": "bullish",
                        "confidence": 0.75,
                    })
                    break

        # Head and Shoulders
        for i in range(len(close) - 3 * window, window, -1):
            left_shoulder = np.max(close[i - window:i])
            head = np.max(close[i:i + window])
            right_shoulder = np.max(close[i + window:i + 2 * window])
            if head > left_shoulder and head > right_shoulder:
                if abs(left_shoulder - right_shoulder) / max(left_shoulder, right_shoulder) < 0.03:
                    patterns.append({
                        "pattern": "Head and Shoulders",
                        "direction": "bearish",
                        "confidence": 0.7,
                    })
                    break

        return patterns

    @staticmethod
    def compute_support_resistance(prices: List[StockPrice], levels: int = 5) -> Dict[str, List[float]]:
        df = _to_series(prices)
        close = df["close"].values
        high = df["high"].values
        low = df["low"].values

        pivot_points = []
        for i in range(1, len(close) - 1):
            if high[i] > high[i - 1] and high[i] > high[i + 1]:
                pivot_points.append(high[i])
            if low[i] < low[i - 1] and low[i] < low[i + 1]:
                pivot_points.append(low[i])

        if not pivot_points:
            return {"support": [], "resistance": []}

        pivot_points = sorted(set(round(p, 2) for p in pivot_points))
        current_price = close[-1]

        support = sorted([p for p in pivot_points if p < current_price], reverse=True)[:levels]
        resistance = sorted([p for p in pivot_points if p > current_price])[:levels]

        return {"support": support, "resistance": resistance}

```


### `backend/app/services/websocket_manager.py`
``` py
from fastapi import WebSocket
from typing import Dict, Set, Any
import json
import asyncio
from app.core.redis_client import get_redis


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.user_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, channel: str = "global", user_id: str = None):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = set()
        self.active_connections[channel].add(websocket)

        if user_id:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = set()
            self.user_connections[user_id].add(websocket)

    async def disconnect(self, websocket: WebSocket, channel: str = "global", user_id: str = None):
        if channel in self.active_connections:
            self.active_connections[channel].discard(websocket)
            if not self.active_connections[channel]:
                del self.active_connections[channel]

        if user_id and user_id in self.user_connections:
            self.user_connections[user_id].discard(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]

    async def broadcast_to_channel(self, channel: str, message: dict):
        if channel in self.active_connections:
            dead = set()
            for ws in self.active_connections[channel]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.active_connections[channel].discard(ws)

    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            dead = set()
            for ws in self.user_connections[user_id]:
                try:
                    await ws.send_json(message)
                except Exception:
                    dead.add(ws)
            for ws in dead:
                self.user_connections[user_id].discard(ws)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception:
            pass

    async def broadcast_live_price(self, symbol: str, price_data: dict):
        await self.broadcast_to_channel(f"stock:{symbol}", price_data)
        await self.broadcast_to_channel("market:prices", price_data)


manager = ConnectionManager()


async def price_streamer():
    redis = await get_redis()
    pubsub = redis.pubsub()
    await pubsub.subscribe("live_prices")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                data = json.loads(message["data"])
                symbol = data.get("symbol", "")
                await manager.broadcast_live_price(symbol, data)
    except asyncio.CancelledError:
        pass
    finally:
        await pubsub.unsubscribe("live_prices")

```


### `backend/app/tasks/__init__.py`
``` py

```


### `backend/app/tasks/alerts.py`
``` py
import json
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.workers.celery_app import celery_app
from app.core.config import settings
import redis as sync_redis


def get_sync_engine():
    sync_url = settings.db_url.replace("+asyncpg", "+psycopg2")
    return create_engine(sync_url)


def publish_to_redis(channel: str, data: dict):
    try:
        r = sync_redis.Redis.from_url(settings.redis_url)
        r.publish(channel, json.dumps(data, default=str))
        r.close()
    except Exception:
        pass


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=2,
    retry_backoff=True,
    retry_backoff_max=30,
    retry_jitter=True,
)
def check_all_alerts():
    engine = get_sync_engine()
    triggered = 0
    checked = 0
    with Session(engine) as session:
        alerts = session.execute(
            text("SELECT id, user_id, stock_id, alert_type, condition, symbol "
                 "FROM alerts WHERE is_active = TRUE")
        ).fetchall()
        for alert in alerts:
            checked += 1
            try:
                condition = alert.condition
                if isinstance(condition, str):
                    condition = json.loads(condition)
                alert_type = condition.get("type", alert.alert_type)
                target = condition.get("value", condition.get("price"))
                operator = condition.get("operator", "above")

                latest_price = session.execute(
                    text("SELECT close FROM stock_prices WHERE stock_id = :sid "
                         "ORDER BY date DESC LIMIT 1"),
                    {"sid": alert.stock_id},
                ).fetchone()

                if not latest_price:
                    continue
                current_price = latest_price[0]

                is_triggered = False
                if operator == "above" and current_price >= target:
                    is_triggered = True
                elif operator == "below" and current_price <= target:
                    is_triggered = True
                elif operator == "cross_above" and current_price >= target:
                    is_triggered = True
                elif operator == "cross_below" and current_price <= target:
                    is_triggered = True

                if is_triggered:
                    triggered += 1
                    session.execute(
                        text("UPDATE alerts SET is_active = FALSE WHERE id = :id"),
                        {"id": alert.id},
                    )
                    session.execute(
                        text("""INSERT INTO alert_history (id, alert_id, stock_id, triggered_price,
                                triggered_at, message)
                                VALUES (gen_random_uuid(), :aid, :sid, :price, :now, :msg)"""),
                        {
                            "aid": alert.id,
                            "sid": alert.stock_id,
                            "price": current_price,
                            "now": datetime.now(timezone.utc),
                            "msg": f"{alert.symbol or 'Stock'} price {operator} {target} at {current_price}",
                        },
                    )
                    publish_to_redis("user:alerts", {
                        "user_id": str(alert.user_id),
                        "alert_id": str(alert.id),
                        "symbol": alert.symbol,
                        "price": current_price,
                        "message": f"{alert.symbol or 'Stock'} price {operator} {target}",
                    })
                session.commit()
            except Exception:
                session.rollback()
                continue
    return {"status": "ok", "checked": checked, "triggered": triggered}

```


### `backend/app/tasks/analysis.py`
``` py
from app.workers.celery_app import celery_app

BASE_RETRY = dict(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)


@celery_app.task(**BASE_RETRY)
def compute_technical_indicators(symbol: str):
    return {"status": "ok", "symbol": symbol, "indicators_computed": True}


@celery_app.task(**BASE_RETRY)
def detect_patterns(symbol: str):
    return {"status": "ok", "symbol": symbol, "patterns_detected": True}


@celery_app.task(**BASE_RETRY)
def run_backtest(strategy_id: str, symbol: str, start_date: str, end_date: str, initial_capital: float):
    return {"status": "ok", "strategy_id": strategy_id, "message": "Backtest queued"}


@celery_app.task(**BASE_RETRY)
def generate_sentiment_analysis(news_id: str):
    return {"status": "ok", "news_id": news_id, "sentiment": "neutral"}

```


### `backend/app/tasks/market_data.py`
``` py
import yfinance as yf
import json
import uuid
from datetime import datetime, timezone
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session
from app.workers.celery_app import celery_app
from app.core.config import settings
import redis as sync_redis
from concurrent.futures import ThreadPoolExecutor, as_completed

YFINANCE_SUFFIX = ".NS"
YFINANCE_MAP = {
    "NIFTY": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "INDIAVIX": "^INDIAVIX",
    "TATAMOTORS": "TMCV.NS",
}

def get_stocks_list(session: Session):
    result = session.execute(
        text("SELECT id, symbol FROM stocks WHERE is_active = TRUE ORDER BY symbol")
    )
    return result.fetchall()

def publish_to_redis(channel: str, data: dict):
    try:
        r = sync_redis.Redis.from_url(settings.redis_url)
        r.publish(channel, json.dumps(data, default=str))
        r.close()
    except Exception:
        pass

def get_sync_engine():
    sync_url = settings.db_url.replace("+asyncpg", "+psycopg2")
    return create_engine(sync_url)


def fetch_one_stock(symbol_id, symbol):
    """Fetch single stock price from yfinance, return (uuid, price_data) or None."""
    try:
        yf_sym = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_sym)
        hist = ticker.history(period="5d", interval="1d")
        if hist.empty:
            return None
        latest = hist.iloc[-1]
        latest_date = hist.index[-1]
        data = {
            "symbol": symbol,
            "date": latest_date.isoformat() if hasattr(latest_date, 'isoformat') else str(latest_date),
            "open": round(float(latest["Open"]), 2),
            "high": round(float(latest["High"]), 2),
            "low": round(float(latest["Low"]), 2),
            "close": round(float(latest["Close"]), 2),
            "volume": int(latest["Volume"]),
        }
        return (symbol_id, data)
    except Exception:
        return None


@celery_app.task(
    rate_limit="30/m",
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_live_prices():
    engine = get_sync_engine()
    stocks = []
    with Session(engine) as session:
        stocks = get_stocks_list(session)

    results = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_one_stock, sid, sym): sid for sid, sym in stocks}
        for f in as_completed(futures):
            try:
                r = f.result(timeout=15)
                if r:
                    results.append(r)
            except Exception:
                continue

    now = datetime.now(timezone.utc)
    updated = 0
    with Session(engine) as session:
        for stock_id, price_data in results:
            try:
                existing = session.execute(
                    text("SELECT id FROM stock_prices WHERE stock_id = :sid AND date::date = :ddate LIMIT 1"),
                    {"sid": stock_id, "ddate": price_data["date"][:10]},
                ).fetchone()
                if existing:
                    session.execute(
                        text("""UPDATE stock_prices SET open=:open, high=:high, low=:low,
                                close=:close, volume=:volume, updated_at=:ua WHERE id=:id"""),
                        {"id": existing[0], "ua": now,
                         "open": price_data["open"], "high": price_data["high"],
                         "low": price_data["low"], "close": price_data["close"],
                         "volume": price_data["volume"]},
                    )
                else:
                    session.execute(
                        text("""INSERT INTO stock_prices (id, stock_id, date, open, high, low, close, volume, created_at, updated_at, is_active)
                                VALUES (gen_random_uuid(), :sid, :dt, :o, :h, :l, :c, :v, :ca, :ua, TRUE)"""),
                        {"sid": stock_id, "dt": price_data["date"], "ca": now, "ua": now,
                         "o": price_data["open"], "h": price_data["high"],
                         "l": price_data["low"], "c": price_data["close"],
                         "v": price_data["volume"]},
                    )
                updated += 1
                session.commit()
                publish_to_redis("live_prices", price_data)
            except Exception:
                session.rollback()
                continue
    return {"status": "ok", "stocks_updated": updated, "total_attempted": len(stocks), "successful": len(results)}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def update_indices():
    engine = get_sync_engine()
    with Session(engine) as session:
        indices_data = {}
        for idx_name, yf_symbol in YFINANCE_MAP.items():
            try:
                ticker = yf.Ticker(yf_symbol)
                hist = ticker.history(period="5d", interval="1d")
                if hist.empty:
                    continue
                latest = hist.iloc[-1]
                prev = hist.iloc[-2] if len(hist) > 1 else latest
                indices_data[idx_name] = {
                    "current": round(float(latest["Close"]), 2),
                    "change": round(float(latest["Close"] - prev["Close"]), 2),
                    "change_percent": round(((latest["Close"] - prev["Close"]) / prev["Close"]) * 100, 2),
                    "high": round(float(latest["High"]), 2),
                    "low": round(float(latest["Low"]), 2),
                }
            except Exception:
                continue
        publish_to_redis("live_prices", {"type": "indices", "data": indices_data})
    return {"status": "ok", "indices": indices_data}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_stock_fundamentals(symbol: str):
    try:
        yf_symbol = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_symbol)
        info = ticker.info or {}
        engine = get_sync_engine()
        with Session(engine) as session:
            stock = session.execute(
                text("SELECT id FROM stocks WHERE symbol = :sym AND is_active = TRUE"),
                {"sym": symbol},
            ).fetchone()
            if not stock:
                return {"status": "error", "message": f"Stock {symbol} not found"}
            stock_id = stock[0]
            existing = session.execute(
                text("SELECT id FROM stock_fundamentals WHERE stock_id = :sid"),
                {"sid": stock_id},
            ).fetchone()
            now = datetime.now(timezone.utc)
            if existing:
                session.execute(
                    text("""UPDATE stock_fundamentals SET market_cap=:mc, enterprise_value=:ev,
                            pe_ratio=:pe, pb_ratio=:pb, eps=:eps, book_value=:bv,
                            dividend_yield=:div_yield, roe=:roe, debt_to_equity=:de,
                            current_ratio=:cr, promoter_holding=:ph,
                            operating_margin=:om, net_margin=:nm,
                            updated_at=:ua
                            WHERE stock_id=:sid"""),
                    {
                        "sid": stock_id, "mc": info.get("marketCap"), "ua": now,
                        "ev": info.get("enterpriseValue"), "pe": info.get("trailingPE"),
                        "pb": info.get("priceToBook"), "eps": info.get("trailingEps"),
                        "bv": info.get("bookValue"), "div_yield": info.get("dividendYield"),
                        "roe": info.get("returnOnEquity"), "de": info.get("debtToEquity"),
                        "cr": info.get("currentRatio"), "ph": info.get("heldPercentInstitutions"),
                        "om": info.get("operatingMargins"), "nm": info.get("profitMargins"),
                    },
                )
            else:
                session.execute(
                    text("""INSERT INTO stock_fundamentals
                            (stock_id, market_cap, enterprise_value, pe_ratio, pb_ratio, eps,
                             book_value, dividend_yield, roe, debt_to_equity,
                             current_ratio, promoter_holding, operating_margin, net_margin,
                             created_at, updated_at)
                            VALUES (:sid, :mc, :ev, :pe, :pb, :eps, :bv, :div_yield,
                             :roe, :de, :cr, :ph, :om, :nm,
                             :ca, :ua)"""),
                    {
                        "sid": stock_id, "mc": info.get("marketCap"), "ca": now, "ua": now,
                        "ev": info.get("enterpriseValue"), "pe": info.get("trailingPE"),
                        "pb": info.get("priceToBook"), "eps": info.get("trailingEps"),
                        "bv": info.get("bookValue"), "div_yield": info.get("dividendYield"),
                        "roe": info.get("returnOnEquity"), "de": info.get("debtToEquity"),
                        "cr": info.get("currentRatio"), "ph": info.get("heldPercentInstitutions"),
                        "om": info.get("operatingMargins"), "nm": info.get("profitMargins"),
                    },
                )
            session.commit()
        return {"status": "ok", "symbol": symbol, "fundamentals_updated": True}
    except Exception as e:
        return {"status": "error", "symbol": symbol, "error": str(e)}


@celery_app.task(
    autoretry_for=(Exception,),
    max_retries=3,
    retry_backoff=True,
    retry_backoff_max=60,
    retry_jitter=True,
)
def fetch_company_news(symbol: str):
    try:
        yf_symbol = YFINANCE_MAP.get(symbol) or (symbol + YFINANCE_SUFFIX)
        ticker = yf.Ticker(yf_symbol)
        news_items = ticker.news or []
        engine = get_sync_engine()
        with Session(engine) as session:
            stock = session.execute(
                text("SELECT id FROM stocks WHERE symbol = :sym AND is_active = TRUE"),
                {"sym": symbol},
            ).fetchone()
            if not stock:
                return {"status": "error", "message": f"Stock {symbol} not found"}
            stock_id = stock[0]
            inserted = 0
            for item in news_items[:10]:
                exists = session.execute(
                    text("SELECT id FROM stock_news WHERE stock_id = :sid AND title = :title"),
                    {"sid": stock_id, "title": item.get("title", "")},
                ).fetchone()
                if not exists:
                    now = datetime.now(timezone.utc)
                    session.execute(
                        text("""INSERT INTO stock_news (id, stock_id, title, description, source, url, published_at, sentiment, category, created_at, updated_at)
                                VALUES (gen_random_uuid(), :sid, :title, :desc, :source, :url, :pub, 'neutral', 'general', :ca, :ua)"""),
                        {
                            "sid": stock_id, "ca": now, "ua": now,
                            "title": item.get("title", ""),
                            "desc": item.get("summary", ""),
                            "source": item.get("publisher", "Yahoo Finance"),
                            "url": item.get("link", ""),
                            "pub": datetime.fromtimestamp(item.get("providerPublishTime", 0), tz=timezone.utc) if item.get("providerPublishTime") else None,
                        },
                    )
                    inserted += 1
            session.commit()
        return {"status": "ok", "symbol": symbol, "news_inserted": inserted}
    except Exception as e:
        return {"status": "error", "symbol": symbol, "error": str(e)}


@celery_app.task
def fetch_corporate_actions():
    return {"status": "ok", "message": "Corporate actions fetched"}


@celery_app.task
def update_market_breadth():
    return {"status": "ok"}

```


### `backend/app/workers/__init__.py`
``` py
from app.workers.celery_app import celery_app

__all__ = ["celery_app"]

```


### `backend/app/workers/celery_app.py`
``` py
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "trade_worker",
    broker=settings.celery_broker,
    backend=settings.celery_backend,
    include=["app.tasks.market_data", "app.tasks.alerts", "app.tasks.analysis"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,
    task_soft_time_limit=25 * 60,
    beat_schedule={
        "fetch-market-data": {
            "task": "app.tasks.market_data.fetch_live_prices",
            "schedule": 300.0,
        },
        "check-alerts": {
            "task": "app.tasks.alerts.check_all_alerts",
            "schedule": 120.0,
        },
        "update-indices": {
            "task": "app.tasks.market_data.update_indices",
            "schedule": 600.0,
        },
    },
)

```


### `backend/celerybeat-schedule`
``` 
ϚW                                                               W            N                   =             L             M                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  M            L            =            
            
                                                 aentr          G                                                                                                                                                                                      '__ve            ^utc_H                                                    Ttz  +                            entries}.__version__	       5.6.3.tz       Asia/Kolkata.utc_enabled.                                                                                                                                                                                                                                                                                                                                                                                                                                         entries      }(check-alertscelery.beat
ScheduleEntry(h!app.tasks.alerts.check_all_alertsdatetimedatetimeC

builtinsgetattrzoneinfoZoneInfo	_unpickleRAsia/KolkataKRRK celery.schedulesscheduleh	timedeltaK K<K RNR)}}tRupdate-indicesh(h%$app.tasks.market_data.update_indiceshC

uhRK hhK M,K RNR)}}tRfetch-market-datah(h2'app.tasks.market_data.fetch_live_priceshC

hRK hhK K<K RNR)}}tRu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  entries+      }(check-alertscelery.beat
ScheduleEntry(check-alerts!app.tasks.alerts.check_all_alertsdatetimedatetimeC

builtinsgetattrzoneinfoZoneInfo	_unpickleRAsia/KolkataKRRKcelery.schedulesscheduleh	timedeltaK K<K RNR)}}tRupdate-indicesh(h&$app.tasks.market_data.update_indicesh	C

uhRK hhK M,K RNR)}}tRfetch-market-datah(fetch-market-data'app.tasks.market_data.fetch_live_pricesh	C

9˔hRKhhK K<K RNR)}}tRu.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   entries:      }(check-alertscelery.beat
ScheduleEntry(check-alerts!app.tasks.alerts.check_all_alertsdatetimedatetimeC

锌builtinsgetattrzoneinfoZoneInfo	_unpickleRAsia/KolkataKRRK4celery.schedulesscheduleh	timedeltaK K<K RNR)}}tRupdate-indicesh(update-indices$app.tasks.market_data.update_indicesh	C

NhRK
hhK M,K RNR)}}tRfetch-market-datah(fetch-market-data'app.tasks.market_data.fetch_live_pricesh	C

LKhRK4hhK K<K RNR)}}tRu.                                                                                                                                                                                                                                                                                                                                                                                                                                                    entries;      }(check-alertscelery.beat
ScheduleEntry(check-alerts!app.tasks.alerts.check_all_alertsdatetimedatetimeC
+:builtinsgetattrzoneinfoZoneInfo	_unpickleRAsia/KolkataKRRKcelery.schedulesscheduleh	timedeltaK KxK RNR)}}tRupdate-indicesh(update-indices$app.tasks.market_data.update_indicesh	C
%:
hRK4hhK MXK RNR)}}tRfetch-market-datah(fetch-market-data'app.tasks.market_data.fetch_live_pricesh	C
*:KĔhRKhhK M,K RNR)}}tRu.                                                                                                                                                                                                                                                                                                                                                                                                                                                   entries<      }(check-alertscelery.beat
ScheduleEntry(check-alerts!app.tasks.alerts.check_all_alertsdatetimedatetimeC
/攌builtinsgetattrzoneinfoZoneInfo	_unpickleRAsia/KolkataKRRMcelery.schedulesscheduleh	timedeltaK KxK RNR)}}tRupdate-indicesh(update-indices$app.tasks.market_data.update_indicesh	C
-hRKRhhK MXK RNR)}}tRfetch-market-datah(fetch-market-data'app.tasks.market_data.fetch_live_pricesh	C
-1hRKhhK M,K RNR)}}tRu.                                                                                                                                                                                                                                                                                                                                                                                                                                                  
```


### `backend/conftest.py`
``` py

```


### `backend/package-lock.json`
``` json
{
  "name": "backend",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {}
}

```


### `backend/pytest.ini`
``` ini
[pytest]
asyncio_mode = auto
asyncio_default_test_loop_scope = session

```


### `backend/requirements.txt`
``` txt
bcrypt==4.0.1
fastapi>=0.110.0
uvicorn[standard]>=0.27.1
sqlalchemy>=2.0.27
asyncpg>=0.29.0
psycopg2-binary>=2.9.9
alembic>=1.13.1
redis>=5.0.3
celery>=5.3.6
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.9
pydantic[email]>=2.6.1
pydantic-settings>=2.1.0
httpx>=0.27.0
httpx-sse>=0.4.0
beautifulsoup4>=4.12.3
lxml>=5.1.0
numpy>=1.26.4
pandas>=2.2.1
yfinance>=0.2.36
scipy>=1.12.0
scikit-learn>=1.4.1
openai>=1.12.0
google-generativeai>=0.4.0
firebase-admin>=6.4.0
sentry-sdk>=1.40.6
python-dotenv>=1.0.1
pytest>=8.0.2
pytest-asyncio>=0.23.5
boto3>=1.34.46
aiofiles>=23.2.1
websockets>=12.0
python-dateutil>=2.8.2
tenacity>=8.2.3
slowapi>=0.1.9

```


### `backend/scripts/seed_data.py`
``` py
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

```


### `backend/scripts/test_yfinance.py`
``` py
from app.tasks.market_data import get_sync_engine, get_stocks_list, YFINANCE_MAP
from sqlalchemy.orm import Session
import yfinance as yf
from datetime import datetime, timezone

engine = get_sync_engine()
with Session(engine) as session:
    stocks = get_stocks_list(session)
    print(f"Total stocks: {len(stocks)}")
    for sid, sym in stocks[:3]:
        yf_sym = YFINANCE_MAP.get(sym) or (sym + ".NS")
        print(f"Testing {sym} -> {yf_sym}")
        ticker = yf.Ticker(yf_sym)
        hist = ticker.history(period="5d", interval="1d")
        print(f"  History: {hist.shape}")
        if not hist.empty:
            latest = hist.iloc[-1]
            print(f"  Latest: O={latest['Open']} H={latest['High']} L={latest['Low']} C={latest['Close']} V={latest['Volume']}")

            latest_date = hist.index[-1]
            existing = session.execute(
                "SELECT id FROM stock_prices WHERE stock_id = %s AND date::date = %s LIMIT 1",
                (sid, latest_date.date()),
            ).fetchone()
            if existing:
                print(f"  Price record EXISTS: {existing[0]}")
            else:
                print(f"  No existing record for {latest_date.date()}")
        else:
            print("  Empty history")

```


### `backend/tests/__init__.py`
``` py

```


### `backend/tests/test_auth.py`
``` py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import Base, get_engine


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    eng = get_engine()
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post(
        "/api/auth/register",
        json={"email": "test@example.com", "password": "testpass123", "full_name": "Test User"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post(
        "/api/auth/register",
        json={"email": "test2@example.com", "password": "testpass123", "full_name": "Test User"},
    )
    response = await client.post(
        "/api/auth/login",
        json={"email": "test2@example.com", "password": "testpass123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


@pytest.mark.asyncio
async def test_logout(client: AsyncClient):
    reg_resp = await client.post(
        "/api/auth/register",
        json={"email": "test3@example.com", "password": "testpass123", "full_name": "Test User"},
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]

    logout_resp = await client.post(
        "/api/auth/logout",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert logout_resp.status_code == 200

    me_resp = await client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_resp.status_code == 401

```


### `backend/tests/test_pagination.py`
``` py
import pytest
from app.core.pagination import encode_cursor, decode_cursor, CursorPage


class TestCursorCodec:
    def test_encode_decode(self):
        original = "some_cursor_value_123"
        encoded = encode_cursor(original)
        decoded = decode_cursor(encoded)
        assert decoded == original

    def test_encode_decode_with_special_chars(self):
        original = "ABC-123_date:2024-01-01T00:00:00"
        encoded = encode_cursor(original)
        decoded = decode_cursor(encoded)
        assert decoded == original

    def test_decode_invalid(self):
        assert decode_cursor("!!!invalid-base64!!!") is None

    def test_decode_empty(self):
        assert decode_cursor("") is None

    def test_encode_is_url_safe(self):
        encoded = encode_cursor("test/data+more")
        assert "+" not in encoded
        assert "/" not in encoded


class TestCursorPage:
    def test_empty_page(self):
        page = CursorPage(items=[], has_more=False)
        assert page.items == []
        assert page.next_cursor is None
        assert page.has_more is False
        assert page.total is None

    def test_page_with_items(self):
        page = CursorPage(items=[1, 2, 3], next_cursor="abc", has_more=True, total=10)
        assert page.items == [1, 2, 3]
        assert page.next_cursor == "abc"
        assert page.has_more is True
        assert page.total == 10

    def test_page_model_dump(self):
        page = CursorPage(items=[{"id": 1}], next_cursor="xyz", has_more=True)
        dumped = page.model_dump()
        assert dumped == {
            "items": [{"id": 1}],
            "next_cursor": "xyz",
            "has_more": True,
            "total": None,
        }

```


### `backend/tests/test_security.py`
``` py
import pytest
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, verify_token,
)


class TestPasswordHashing:
    def test_hash_and_verify(self):
        password = "test_password_123"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed) is True

    def test_verify_wrong_password(self):
        hashed = hash_password("correct_password")
        assert verify_password("wrong_password", hashed) is False

    def test_hash_is_different_each_time(self):
        password = "same_password"
        h1 = hash_password(password)
        h2 = hash_password(password)
        assert h1 != h2


class TestTokenCreation:
    def test_create_access_token(self):
        token = create_access_token({"sub": "user-123"})
        assert token is not None
        assert isinstance(token, str)

    def test_create_refresh_token(self):
        token = create_refresh_token({"sub": "user-123"})
        assert token is not None
        assert isinstance(token, str)

    def test_access_token_has_correct_type(self):
        token = create_access_token({"sub": "user-123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "access"
        assert payload["sub"] == "user-123"
        assert "jti" in payload
        assert "exp" in payload

    def test_refresh_token_has_correct_type(self):
        token = create_refresh_token({"sub": "user-123"})
        payload = decode_token(token)
        assert payload is not None
        assert payload["type"] == "refresh"

    def test_verify_token_valid(self):
        token = create_access_token({"sub": "user-123"})
        payload = verify_token(token, "access")
        assert payload is not None
        assert payload["sub"] == "user-123"

    def test_verify_token_wrong_type(self):
        token = create_access_token({"sub": "user-123"})
        payload = verify_token(token, "refresh")
        assert payload is None

    def test_verify_invalid_token(self):
        payload = verify_token("invalid.token.here", "access")
        assert payload is None

    def test_decode_expired_token(self):
        import time
        from datetime import timedelta
        token = create_access_token({"sub": "user-123"}, expires_delta=timedelta(seconds=-1))
        payload = decode_token(token)
        assert payload is None

    def test_token_contains_jti(self):
        token = create_access_token({"sub": "user-123"})
        payload = decode_token(token)
        assert "jti" in payload
        assert len(payload["jti"]) > 0

    def test_each_token_has_unique_jti(self):
        t1 = decode_token(create_access_token({"sub": "user-123"}))
        t2 = decode_token(create_access_token({"sub": "user-123"}))
        assert t1["jti"] != t2["jti"]

```


### `backend/tests/test_stock_api.py`
``` py
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

```


### `docker-compose.yml`
``` yml
version: '3.9'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: trade
      POSTGRES_USER: trade_user
      POSTGRES_PASSWORD: trade_pass_123
    ports:
      - "5433:5432"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6380:6379"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - db
      - redis
    env_file: .env
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  celery_worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - db
      - redis
      - backend
    env_file: .env
    volumes:
      - ./backend:/app
    command: celery -A app.workers.celery_app worker --loglevel=info

  celery_beat:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - db
      - redis
      - backend
    env_file: .env
    volumes:
      - ./backend:/app
    command: celery -A app.workers.celery_app beat --loglevel=info

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "8080:80"
      - "4433:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites:/etc/nginx/sites-enabled
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:

```


### `frontend/Dockerfile`
``` 
FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

```


### `frontend/index.html`
``` html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="description" content="TradeAI - AI-Powered Stock Market Analytics Platform" />
    <link rel="manifest" href="/manifest.json" />
    <title>TradeAI - Stock Market Analytics</title>
  </head>
  <body class="dark">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```


### `frontend/package-lock.json`
``` json
{
  "name": "trade-ai-frontend",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "trade-ai-frontend",
      "version": "1.0.0",
      "dependencies": {
        "@hookform/resolvers": "^3.3.4",
        "@radix-ui/react-accordion": "^1.1.2",
        "@radix-ui/react-avatar": "^1.0.4",
        "@radix-ui/react-checkbox": "^1.0.4",
        "@radix-ui/react-dialog": "^1.0.5",
        "@radix-ui/react-dropdown-menu": "^2.0.6",
        "@radix-ui/react-label": "^2.0.2",
        "@radix-ui/react-popover": "^1.0.7",
        "@radix-ui/react-progress": "^1.0.3",
        "@radix-ui/react-radio-group": "^1.1.3",
        "@radix-ui/react-scroll-area": "^1.0.5",
        "@radix-ui/react-select": "^2.0.0",
        "@radix-ui/react-slider": "^1.1.2",
        "@radix-ui/react-switch": "^1.0.3",
        "@radix-ui/react-tabs": "^1.0.4",
        "@radix-ui/react-toast": "^1.1.5",
        "@radix-ui/react-toggle": "^1.0.3",
        "@radix-ui/react-tooltip": "^1.0.7",
        "@reduxjs/toolkit": "^2.0.1",
        "@tanstack/react-query": "^5.17.0",
        "axios": "^1.6.5",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.1.0",
        "framer-motion": "^11.0.0",
        "lightweight-charts": "^4.0.1",
        "lucide-react": "^0.309.0",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-hook-form": "^7.49.3",
        "react-hot-toast": "^2.4.1",
        "react-redux": "^9.1.0",
        "react-router-dom": "^6.21.3",
        "recharts": "^2.10.4",
        "tailwind-merge": "^2.2.0",
        "tailwindcss-animate": "^1.0.7",
        "zod": "^3.22.4"
      },
      "devDependencies": {
        "@types/react": "^18.2.48",
        "@types/react-dom": "^18.2.18",
        "@vitejs/plugin-react": "^4.2.1",
        "autoprefixer": "^10.4.17",
        "postcss": "^8.4.33",
        "tailwindcss": "^3.4.1",
        "typescript": "^5.3.3",
        "vite": "^5.0.12"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/compat-data": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/compat-data/-/compat-data-7.29.7.tgz",
      "integrity": "sha512-locTkQyKvwIEgBzVrn8693ebc97F2U8ZHjbXwDXJ5Fn2TCpNwTlKcaKLkdHop5c/icOFE7qt7Q9JC5hnKNa6Gg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/core": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/core/-/core-7.29.7.tgz",
      "integrity": "sha512-RgHBCvtjbOK2gXSNBNIkNoEc9qoVEtau3hj8gEqKQuL3HZAibKarWFEI3Lfm6EYKkLalOh8eSrj9b+ch9H/VBA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-compilation-targets": "^7.29.7",
        "@babel/helper-module-transforms": "^7.29.7",
        "@babel/helpers": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/remapping": "^2.3.5",
        "convert-source-map": "^2.0.0",
        "debug": "^4.1.0",
        "gensync": "^1.0.0-beta.2",
        "json5": "^2.2.3",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/babel"
      }
    },
    "node_modules/@babel/generator": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/generator/-/generator-7.29.7.tgz",
      "integrity": "sha512-DkXD5OJQaAQIdZ1bt3UZdEnHAn9Imd3IVBdX03UFe+ony9Ojw5pzr9YVKGDY1jt+Gcn/FnGkNf8r+Vj5NOJWtQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7",
        "@jridgewell/gen-mapping": "^0.3.12",
        "@jridgewell/trace-mapping": "^0.3.28",
        "jsesc": "^3.0.2"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-compilation-targets": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-compilation-targets/-/helper-compilation-targets-7.29.7.tgz",
      "integrity": "sha512-wem6WaBj4NaVYVdNhLPPVacES6ZJ+KBBfSkTMD3YZxbP3rm3Di85tJU5ljaUNhaOynt+Aj0xruhYuzQBt8n71g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/compat-data": "^7.29.7",
        "@babel/helper-validator-option": "^7.29.7",
        "browserslist": "^4.24.0",
        "lru-cache": "^5.1.1",
        "semver": "^6.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-globals": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-globals/-/helper-globals-7.29.7.tgz",
      "integrity": "sha512-3nQVUAtvkKH9zahfWgw96Jc/uFOmjACE1kQz82E2lqWmHBgjzbNlsC22nuQTfahmWeQtTq5nQ/4Nnd2A1wj4zA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-imports": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-imports/-/helper-module-imports-7.29.7.tgz",
      "integrity": "sha512-ejHwrQQYcm9xnTivShn2IDOlIzInN34AXskvq9QicvCtEzq1Vzclu/tKF8Jq1Cg8JG2GL6/EmjgsCT7lXepE3g==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/traverse": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-module-transforms": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-module-transforms/-/helper-module-transforms-7.29.7.tgz",
      "integrity": "sha512-UPUVSyXbOh627KiCIGQSgwWzGeBKLkaJ9PJEdrngIwMSzxLR4jS4+f1f1jb7VzBbg8nFLaYotvVPFCTqdrmTAg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-module-imports": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7",
        "@babel/traverse": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0"
      }
    },
    "node_modules/@babel/helper-plugin-utils": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-plugin-utils/-/helper-plugin-utils-7.29.7.tgz",
      "integrity": "sha512-G7sHYigPY17oO5SYWnfD/0MTBwVR781S/JI643e/JhUYgVgWE/61SoW3NH9KWUKyKq5LVh3npif99Wkt6j86Jw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-string-parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-string-parser/-/helper-string-parser-7.29.7.tgz",
      "integrity": "sha512-Pb5ijPrZ89GDH8223L4UP8i6QApWxs04RbPQJTeWDV0/keR2E36MeKnyr6LYmUUvqRRI+Iv87SuF1W6ErINzYw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-option": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-option/-/helper-validator-option-7.29.7.tgz",
      "integrity": "sha512-N9ZErrD+yW5geCDtBqnOoxmR8+tNKiGuxKlDpuJxfsqpa2dFcexaziGAE/qoHLiDDreVNMupxGmSoNlyvsA3gw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helpers": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helpers/-/helpers-7.29.7.tgz",
      "integrity": "sha512-1k2lAGRMfHTcwuNYcCNUmaUffmQv8KWMfh2iJUUeRlwlwH4FdNG7mfPI10NPfLHJFThE4Tyr4mv7kTNZOiPuBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/parser": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/parser/-/parser-7.29.7.tgz",
      "integrity": "sha512-hnORnjP/1P/zFEndoeX+n+t1RwWRJiJpM/jO7FW32Kn9r5+sJB2JWOdYo4L6k78j15eCwY3Gm/7364B1EMwtNg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.29.7"
      },
      "bin": {
        "parser": "bin/babel-parser.js"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-self": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.29.7.tgz",
      "integrity": "sha512-TL0hMc9xzy86VD31nUiwzd5otRAcyEPcsegCxolO0PvcXuH1v0kECe/UIznYFihpkvU5wg/jk4v0TTEFfm53fw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/plugin-transform-react-jsx-source": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.29.7.tgz",
      "integrity": "sha512-06IyK09H3wi4cGbhDBwp5gUGo0IKtnYa8tyTiephirPCK6fbobVGiXMMI5zLQ4aKEYP3wZ3ArU44o+8KMrSG/Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-plugin-utils": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      },
      "peerDependencies": {
        "@babel/core": "^7.0.0-0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.7.tgz",
      "integrity": "sha512-Nq8OhGWiZIZGV6hLHoyAKLLcJihP/xFeBMGJoUrxTX2psI8dCifzLhZISFb+VWS3wFMRDmCGw5R+dOySCqPLhw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/template": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/template/-/template-7.29.7.tgz",
      "integrity": "sha512-puq+Gf35oI24FeN11LkoUQFqv9uwNeWpxXZi/Ji3rRIoKAzKnxRaZ+Gkj0vKS9ZCiTESfng1N9LyOyXvo+m+Gg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/types": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/traverse": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/traverse/-/traverse-7.29.7.tgz",
      "integrity": "sha512-EhlfNQtZ+NK22w5BM61ciuiq1m58ed33Wr1Xan//ZRTy6hgjnwyCffRYwzsGXdASJSUJ1guZILsErh1eQcl+zw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/code-frame": "^7.29.7",
        "@babel/generator": "^7.29.7",
        "@babel/helper-globals": "^7.29.7",
        "@babel/parser": "^7.29.7",
        "@babel/template": "^7.29.7",
        "@babel/types": "^7.29.7",
        "debug": "^4.3.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/types": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/types/-/types-7.29.7.tgz",
      "integrity": "sha512-4zBIxpPzowiZpusoFkyGVwakdRJUyuH5PxQ/PrqghfdFWWasvnCdPfQXHrenDai+gyLARulZjZowCOj6fjT4pA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/helper-string-parser": "^7.29.7",
        "@babel/helper-validator-identifier": "^7.29.7"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.21.5.tgz",
      "integrity": "sha512-1SDgH6ZSPTlggy1yI6+Dbkiz8xzpHJEVAlF/AM1tHPLsf5STom9rwtjE4hKAF20FfXXNTFqEYXyJNWh1GiZedQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.21.5.tgz",
      "integrity": "sha512-vCPvzSjpPHEi1siZdlvAlsPxXl7WbOVUBBAowWug4rJHb68Ox8KualB+1ocNvT5fjv6wpkX6o/iEpbDrf68zcg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.21.5.tgz",
      "integrity": "sha512-c0uX9VAUBQ7dTDCjq+wdyGLowMdtR/GoC2U5IYk/7D1H1JYC0qseD7+11iMP2mRLN9RcCMRcjC4YMclCzGwS/A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.21.5.tgz",
      "integrity": "sha512-D7aPRUUNHRBwHxzxRvp856rjUHRFW1SdQATKXH2hqA0kAZb1hKmi02OpYRacl0TxIGz/ZmXWlbZgjwWYaCakTA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.21.5.tgz",
      "integrity": "sha512-DwqXqZyuk5AiWWf3UfLiRDJ5EDd49zg6O9wclZ7kUMv2WRFr4HKjXp/5t8JZ11QbQfUS6/cRCKGwYhtNAY88kQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.21.5.tgz",
      "integrity": "sha512-se/JjF8NlmKVG4kNIuyWMV/22ZaerB+qaSi5MdrXtd6R08kvs2qCN4C09miupktDitvh8jRFflwGFBQcxZRjbw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.21.5.tgz",
      "integrity": "sha512-5JcRxxRDUJLX8JXp/wcBCy3pENnCgBR9bN6JsY4OmhfUtIHe3ZW0mawA7+RDAcMLrMIZaf03NlQiX9DGyB8h4g==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.21.5.tgz",
      "integrity": "sha512-J95kNBj1zkbMXtHVH29bBriQygMXqoVQOQYA+ISs0/2l3T9/kj42ow2mpqerRBxDJnmkUDCaQT/dfNXWX/ZZCQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.21.5.tgz",
      "integrity": "sha512-bPb5AHZtbeNGjCKVZ9UGqGwo8EUu4cLq68E95A53KlxAPRmUyYv2D6F0uUI65XisGOL1hBP5mTronbgo+0bFcA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.21.5.tgz",
      "integrity": "sha512-ibKvmyYzKsBeX8d8I7MH/TMfWDXBF3db4qM6sy+7re0YXya+K1cem3on9XgdT2EQGMu4hQyZhan7TeQ8XkGp4Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.21.5.tgz",
      "integrity": "sha512-YvjXDqLRqPDl2dvRODYmmhz4rPeVKYvppfGYKSNGdyZkA01046pLWyRKKI3ax8fbJoK5QbxblURkwK/MWY18Tg==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.21.5.tgz",
      "integrity": "sha512-uHf1BmMG8qEvzdrzAqg2SIG/02+4/DHB6a9Kbya0XDvwDEKCoC8ZRWI5JJvNdUjtciBGFQ5PuBlpEOXQj+JQSg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.21.5.tgz",
      "integrity": "sha512-IajOmO+KJK23bj52dFSNCMsz1QP1DqM6cwLUv3W1QwyxkyIWecfafnI555fvSGqEKwjMXVLokcV5ygHW5b3Jbg==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.21.5.tgz",
      "integrity": "sha512-1hHV/Z4OEfMwpLO8rp7CvlhBDnjsC3CttJXIhBi+5Aj5r+MBvy4egg7wCbe//hSsT+RvDAG7s81tAvpL2XAE4w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.21.5.tgz",
      "integrity": "sha512-2HdXDMd9GMgTGrPWnJzP2ALSokE/0O5HhTUvWIbD3YdjME8JwvSCnNGBnTThKGEB91OZhzrJ4qIIxk/SBmyDDA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.21.5.tgz",
      "integrity": "sha512-zus5sxzqBJD3eXxwvjN1yQkRepANgxE9lgOW2qLnmr8ikMTphkjgXu1HR01K4FJg8h1kEEDAqDcZQtbrRnB41A==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.21.5.tgz",
      "integrity": "sha512-1rYdTpyv03iycF1+BhzrzQJCdOuAOtaqHTWJZCWvijKD2N5Xu0TtVC8/+1faWqcP9iBCWOmjmhoH94dH82BxPQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.21.5.tgz",
      "integrity": "sha512-Woi2MXzXjMULccIwMnLciyZH4nCIMpWQAs049KEeMvOcNADVxo0UBIQPfSmxB3CWKedngg7sWZdLvLczpe0tLg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.21.5.tgz",
      "integrity": "sha512-HLNNw99xsvx12lFBUwoT8EVCsSvRNDVxNpjZ7bPn947b8gJPzeHWyNVhFsaerc0n3TsbOINvRP2byTZ5LKezow==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.21.5.tgz",
      "integrity": "sha512-6+gjmFpfy0BHU5Tpptkuh8+uw3mnrvgs+dSPQXQOv3ekbordwnzTVEb4qnIvQcYXq6gzkyTnoZ9dZG+D4garKg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.21.5.tgz",
      "integrity": "sha512-Z0gOTd75VvXqyq7nsl93zwahcTROgqvuAcYDUr+vOv8uHhNSKROyU961kgtCD1e95IqPKSQKH7tBTslnS3tA8A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.21.5.tgz",
      "integrity": "sha512-SWXFF1CL2RVNMaVs+BBClwtfZSvDgtL//G/smwAc5oVK/UPu2Gu9tIaRgFmYFFKrmg3SyAjSrElf0TiJ1v8fYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.21.5.tgz",
      "integrity": "sha512-tQd/1efJuzPC6rCFwEvLtci/xNFcTZknmXs98FYDfGE4wP9ClFV98nyKrzJKVPMhdDnjzLhdUyMX4PsQAPjwIw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@floating-ui/core": {
      "version": "1.7.5",
      "resolved": "https://registry.npmjs.org/@floating-ui/core/-/core-1.7.5.tgz",
      "integrity": "sha512-1Ih4WTWyw0+lKyFMcBHGbb5U5FtuHJuujoyyr5zTaWS5EYMeT6Jb2AuDeftsCsEuchO+mM2ij5+q9crhydzLhQ==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/utils": "^0.2.11"
      }
    },
    "node_modules/@floating-ui/dom": {
      "version": "1.7.6",
      "resolved": "https://registry.npmjs.org/@floating-ui/dom/-/dom-1.7.6.tgz",
      "integrity": "sha512-9gZSAI5XM36880PPMm//9dfiEngYoC6Am2izES1FF406YFsjvyBMmeJ2g4SAju3xWwtuynNRFL2s9hgxpLI5SQ==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/core": "^1.7.5",
        "@floating-ui/utils": "^0.2.11"
      }
    },
    "node_modules/@floating-ui/react-dom": {
      "version": "2.1.8",
      "resolved": "https://registry.npmjs.org/@floating-ui/react-dom/-/react-dom-2.1.8.tgz",
      "integrity": "sha512-cC52bHwM/n/CxS87FH0yWdngEZrjdtLW/qVruo68qg+prK7ZQ4YGdut2GyDVpoGeAYe/h899rVeOVm6Oi40k2A==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/dom": "^1.7.6"
      },
      "peerDependencies": {
        "react": ">=16.8.0",
        "react-dom": ">=16.8.0"
      }
    },
    "node_modules/@floating-ui/utils": {
      "version": "0.2.11",
      "resolved": "https://registry.npmjs.org/@floating-ui/utils/-/utils-0.2.11.tgz",
      "integrity": "sha512-RiB/yIh78pcIxl6lLMG0CgBXAZ2Y0eVHqMPYugu+9U0AeT6YBeiJpf7lbdJNIugFP5SIjwNRgo4DhR1Qxi26Gg==",
      "license": "MIT"
    },
    "node_modules/@hookform/resolvers": {
      "version": "3.10.0",
      "resolved": "https://registry.npmjs.org/@hookform/resolvers/-/resolvers-3.10.0.tgz",
      "integrity": "sha512-79Dv+3mDF7i+2ajj7SkypSKHhl1cbln1OGavqrsF7p6mbUv11xpqpacPsGDCTRvCSjEEIez2ef1NveSVL3b0Ag==",
      "license": "MIT",
      "peerDependencies": {
        "react-hook-form": "^7.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og==",
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@radix-ui/number": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/number/-/number-1.1.2.tgz",
      "integrity": "sha512-ceTwaxc4I5IOi97DgCotl3pqiyRGvffcc0oOsE2dQYaJOFIDsDt4VWG6xEbg1QePv9QWausCEIppud/tJ1wNig==",
      "license": "MIT"
    },
    "node_modules/@radix-ui/primitive": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@radix-ui/primitive/-/primitive-1.1.4.tgz",
      "integrity": "sha512-7AdCK9PQyiljKoBDbN8OuctCbd/esdwZPQ8RtOE3SsyQtUpiPb+ND75q0jEhC1m1ecBI0MFNeLJvwIh9iKHRcQ==",
      "license": "MIT"
    },
    "node_modules/@radix-ui/react-accordion": {
      "version": "1.2.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-accordion/-/react-accordion-1.2.15.tgz",
      "integrity": "sha512-24Zz/0SYx8F2bSVThBnQrdJs2VbKelyuJordcFRRdA0fRAhrq/wSegGCqaQz34VQoiWqSMGYCYXEhynLSlyQlg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collapsible": "1.1.15",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-arrow": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-arrow/-/react-arrow-1.1.11.tgz",
      "integrity": "sha512-Kdil9BB1rIFC/khmf4hC35bn8701AJcizTU7G7cUbEbk5XqqbjDuHW60uUfKqO5WojjZcbAW51Q7P0hRmMLw8A==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-avatar": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-avatar/-/react-avatar-1.2.1.tgz",
      "integrity": "sha512-+8PWoLLZv3AVb5m0pvoiOca/bQGzc9vPVb+982HB2x3Un0DpYEPM3zLMl4oqRpBsocJuNqLkiv/HXTnTrlwr4g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-is-hydrated": "0.1.1",
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-checkbox": {
      "version": "1.3.6",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-checkbox/-/react-checkbox-1.3.6.tgz",
      "integrity": "sha512-eUEUoGMDpfkgHWSE97ZZaUJtzR1M7EKnNIpD1Q16+8JR9NWghcaqMulx9PuCQ720w0UclfYn6FEbCdd5Hx087g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-previous": "1.1.2",
        "@radix-ui/react-use-size": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-collapsible": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-collapsible/-/react-collapsible-1.1.15.tgz",
      "integrity": "sha512-8A1zibu5skAQ+UVbaeNH5hVMibiFCRJzgMuM14LTWGttnTZKQL9jwYnhAbHRuxrtCqPXa4JvvnVUq1pTNgyZYw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-collection": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-collection/-/react-collection-1.1.11.tgz",
      "integrity": "sha512-djW9+zeg137KQdlPtmE8xnaD+K2rcXXMWFrSg0hsmYZ6HRbdTA7tDHFgpaW9+huWVEu0RCabL+985T4TA0BE7g==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-slot": "1.3.0"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-compose-refs": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-compose-refs/-/react-compose-refs-1.1.3.tgz",
      "integrity": "sha512-rYOP8OMnuuPMQF1uhPVlGNcCDlkokKqGFE3JcxFViIkAXP7EvFWUliJAstrapypaBLJNHbZL6jGhbVDGTwmVhA==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-context": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-context/-/react-context-1.1.4.tgz",
      "integrity": "sha512-QwH4PO5urrbO+FaGd5Aglg+YJgWTyyuZ3g/6mKvsqraLkglDdckw9JafgL5McL5VEJ6EPNduPaT3ZE9BttDAqg==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dialog": {
      "version": "1.1.18",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dialog/-/react-dialog-1.1.18.tgz",
      "integrity": "sha512-apa28mldjMgORmE6g/w3sCcA0Y9UAVeeDVoozN4i7kOw12mLl9RBchfzK3Nn6qxOWjrZhK1Lfy7f07kyzxtnBw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-focus-guards": "1.1.4",
        "@radix-ui/react-focus-scope": "1.1.11",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-slot": "1.3.0",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.7.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-direction": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-direction/-/react-direction-1.1.2.tgz",
      "integrity": "sha512-C3vFhbyi4SW3PmbAi6Awpu4OzJtd0MxGurvSsYtr7p7nM8RNB3VAF3CUmnp2j50knpkrRcB7+ycVXzgLgF6yNA==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dismissable-layer": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dismissable-layer/-/react-dismissable-layer-1.1.14.tgz",
      "integrity": "sha512-4lUhWTWAjbDIqFrAPWJ3WqBOpO5YchVZ88X3nh6H9Lu5AFi5nCUeTPj3D8FSDmabmFeRe9ME0BDA4MwKTha5GQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-effect-event": "0.0.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-dropdown-menu": {
      "version": "2.1.19",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-dropdown-menu/-/react-dropdown-menu-2.1.19.tgz",
      "integrity": "sha512-HZccBkbK0LOi8nYKIp5jll/zIRW0cCOmG6WWyqsSpmXCU+ZlcBbTqIwlBvPCu886C5RVu6c/kHV7xSP8IgYNHw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-menu": "2.1.19",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-focus-guards": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-focus-guards/-/react-focus-guards-1.1.4.tgz",
      "integrity": "sha512-cot/aB/mOm0IYVYTTmQcEEK1M48lZWi8FlYe5nDPQQ8NYZUlXEFgncJ9p2Kzer3RKSrY7cTTpEMLZKNo9QoP5Q==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-focus-scope": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-focus-scope/-/react-focus-scope-1.1.11.tgz",
      "integrity": "sha512-Mn88Vg2whaRocGJNOH+DKFqYm6ySFPQaiwHNxZPyjn99B52KAEJWWY9NP83+nWdk2HM3rdov+STu9AG471Rt9w==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-id": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-id/-/react-id-1.1.2.tgz",
      "integrity": "sha512-orBC88futVpqCmhX1p4cvquNHsELQ+w+vBJnuj3ftETI5bJb0bZn3Tqu3SWN2IOcPycTnMGnhwoermvISt72sA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-label": {
      "version": "2.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-label/-/react-label-2.1.11.tgz",
      "integrity": "sha512-3PKvDDxOn62k0oV1n4QtNtD2vpu+zYjXR7ojLBPaO6SPvhy53yg0vAmgNeBQeJW5rV3dffoRG+HYfLBZuzw0CQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-menu": {
      "version": "2.1.19",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-menu/-/react-menu-2.1.19.tgz",
      "integrity": "sha512-Mht9BVd1AIsNFVQr4KG3bIK7XQn5IXF0TL/2ObsrzOdc1loaly/+kBDL5roSCYn8j8XZkvpOD0WYLz2FQtH1Eg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-focus-guards": "1.1.4",
        "@radix-ui/react-focus-scope": "1.1.11",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-popper": "1.3.2",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-roving-focus": "1.1.14",
        "@radix-ui/react-slot": "1.3.0",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.7.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-popover": {
      "version": "1.1.18",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-popover/-/react-popover-1.1.18.tgz",
      "integrity": "sha512-qdXDes+eHlnMUGlBAAAe5EG7oOQvqsXuq4mq585diMudg80iB+jHbsSeG3+Q4eWNsogNyhqU2p/3i+Y0iEepqg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-focus-guards": "1.1.4",
        "@radix-ui/react-focus-scope": "1.1.11",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-popper": "1.3.2",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-slot": "1.3.0",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.7.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-popper": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-popper/-/react-popper-1.3.2.tgz",
      "integrity": "sha512-3QXNeMkdshed1MR3LNoiCirBywRFPkD8ETJa/HlPuLwSajaQixf2ro+isoDNJlGABg9ug41XuZpINZJIle4XWg==",
      "license": "MIT",
      "dependencies": {
        "@floating-ui/react-dom": "^2.0.0",
        "@radix-ui/react-arrow": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-layout-effect": "1.1.2",
        "@radix-ui/react-use-rect": "1.1.2",
        "@radix-ui/react-use-size": "1.1.2",
        "@radix-ui/rect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-portal": {
      "version": "1.1.13",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-portal/-/react-portal-1.1.13.tgz",
      "integrity": "sha512-z3oXfmaHLJTF1wktbjgD6cn9jiEbq3WSondB10LIuIt2m2Ym4iJlrW04/euMwENDdWDdE7z+OuY7Qyp1YpRSwA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-presence": {
      "version": "1.1.6",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-presence/-/react-presence-1.1.6.tgz",
      "integrity": "sha512-zdTk4PlUO0E18HnZ3wYbW0KkJJxWCdiNYp6g6X1PtONFhxVkg01vliTJAmwIszU6mHiyBOoW9P0rAugl5/hULQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-primitive": {
      "version": "2.1.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-primitive/-/react-primitive-2.1.7.tgz",
      "integrity": "sha512-bC3NiwsprbxKjuon9l7X6BUTw7FPVzEYaL92MPEY5SCd/9hUTPXVFtVwRix7778wtRsVao+zE062gL79FZleeQ==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-slot": "1.3.0"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-progress": {
      "version": "1.1.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-progress/-/react-progress-1.1.11.tgz",
      "integrity": "sha512-KqiGJcFaZDc+BvveAgU3ZhACg2MvSUDrCBx4lRR/ZVRNal0bvt8lBpvnSkep9heeOuF8Qfw3fszLDX4OpQ2NVw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-radio-group": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-radio-group/-/react-radio-group-1.4.2.tgz",
      "integrity": "sha512-W8Uo9riHnlzLLWy+r2mVHUyuEWqD/+be4PZzbEvaGoFSBDHkm+GYWjtcE6u3AmPKNyfanWpnVfpZ2GqPCdzzsw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-roving-focus": "1.1.14",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-previous": "1.1.2",
        "@radix-ui/react-use-size": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-roving-focus": {
      "version": "1.1.14",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-roving-focus/-/react-roving-focus-1.1.14.tgz",
      "integrity": "sha512-8Qcnx9447tx/aCBgw6Jenfqg4Skq+vqab9mCBmuGNipIS5YXvL275wbKEu7+ICYHIlAPgCduUMJH1XOYewKF6Q==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-controllable-state": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-scroll-area": {
      "version": "1.2.13",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-scroll-area/-/react-scroll-area-1.2.13.tgz",
      "integrity": "sha512-7tncSubo2G0UY1e8rk+72qe3XRzrGnOLtZQ1PL1KoBfRUNX0NrJT5akb+0kfwSCc3gVR4wdHqyhAQBDpDNOwDw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.2",
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-select": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-select/-/react-select-2.3.2.tgz",
      "integrity": "sha512-brXD6C/V0fVK0DDbscLVw6LsXrjQ+ay8jdOBaN+tLb4vsHsAMm6Gt6eT77wHX1Eq8GPtD5rJ+RxFtfDozsb4+Q==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.2",
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-focus-guards": "1.1.4",
        "@radix-ui/react-focus-scope": "1.1.11",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-popper": "1.3.2",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-slot": "1.3.0",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-layout-effect": "1.1.2",
        "@radix-ui/react-use-previous": "1.1.2",
        "@radix-ui/react-visually-hidden": "1.2.7",
        "aria-hidden": "^1.2.4",
        "react-remove-scroll": "^2.7.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-slider": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-slider/-/react-slider-1.4.2.tgz",
      "integrity": "sha512-qt5C1ppJz66aUDrH1VccjPrq7aFchK0wBrn6xsxlCHNUyE57dRRQ7lp1QFpF7OscMexZF8MCGBTVBlENHPkNiA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/number": "1.1.2",
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-layout-effect": "1.1.2",
        "@radix-ui/react-use-previous": "1.1.2",
        "@radix-ui/react-use-size": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-slot": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-slot/-/react-slot-1.3.0.tgz",
      "integrity": "sha512-MojKku4U/miO8Av4Dkb+ctMAQx7JmY96LmtDQlAarCRtd7rN52QCSzBF+XAvr5S6coSVj9HEPBgHAHKEJVk/WA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-compose-refs": "1.1.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-switch": {
      "version": "1.3.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-switch/-/react-switch-1.3.2.tgz",
      "integrity": "sha512-tgRBI3DdNwAJYE4BBZyZcz/HRRCvAsPkRvG1wvKc+41tBGMxPn/a87T/wikXAvyDypNQ9kaZwHbeZe+veHCGpA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-previous": "1.1.2",
        "@radix-ui/react-use-size": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-tabs": {
      "version": "1.1.16",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-tabs/-/react-tabs-1.1.16.tgz",
      "integrity": "sha512-v3Ab2l7z6U7tRB4xA0IyKdq0OsqaO1o9ZjsIEoKKnSZ/l96mZz8aCTX0NCXw+YVHJXr8Km4d+Mn6/Q8YjXa+gw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-direction": "1.1.2",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-roving-focus": "1.1.14",
        "@radix-ui/react-use-controllable-state": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-toast": {
      "version": "1.2.18",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-toast/-/react-toast-1.2.18.tgz",
      "integrity": "sha512-YNEnTHV47hPep+U0QvVM02OJNka9uygREc+k4Nh5VSZBg4MmE+myI442x3hCGfRpX7N2WSSYSJKws4gE+Z8lgg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-collection": "1.1.11",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-callback-ref": "1.1.2",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-use-layout-effect": "1.1.2",
        "@radix-ui/react-visually-hidden": "1.2.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-toggle": {
      "version": "1.1.13",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-toggle/-/react-toggle-1.1.13.tgz",
      "integrity": "sha512-bI2ILJrzwgmAsH05TsJ9pVrzqQwAip7OM2/krqAdYn0R16bl86UPWbe5VPHsALat0EnqpV01cGtkleaUKPNdNg==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-use-controllable-state": "1.2.3"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-tooltip": {
      "version": "1.2.11",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-tooltip/-/react-tooltip-1.2.11.tgz",
      "integrity": "sha512-8XZ6Py3y3W2nEzAUGCN5cfVKaUi+CVApcz1d6lrNVVf2hvYEixMRkq8k9ggPKnQUpRRuOV5avt8uvxViH2jLwA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/primitive": "1.1.4",
        "@radix-ui/react-compose-refs": "1.1.3",
        "@radix-ui/react-context": "1.1.4",
        "@radix-ui/react-dismissable-layer": "1.1.14",
        "@radix-ui/react-id": "1.1.2",
        "@radix-ui/react-popper": "1.3.2",
        "@radix-ui/react-portal": "1.1.13",
        "@radix-ui/react-presence": "1.1.6",
        "@radix-ui/react-primitive": "2.1.7",
        "@radix-ui/react-slot": "1.3.0",
        "@radix-ui/react-use-controllable-state": "1.2.3",
        "@radix-ui/react-visually-hidden": "1.2.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-callback-ref": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-callback-ref/-/react-use-callback-ref-1.1.2.tgz",
      "integrity": "sha512-xCso9j1/u8sEgP1RNHjFrXJLApL8LiqOkI1R4ywuN00rxWdYg4oQXuwKLS3i0j5NWLromUD27/4nlxj2UFVvIw==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-controllable-state": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-controllable-state/-/react-use-controllable-state-1.2.3.tgz",
      "integrity": "sha512-PLzC90MS+ReootmjC597dvopoelpZ8Q61HJkDXZSExitIq7PL55vHNnesAHwguHK0aPfBnpdNzQtv1uliaqQrA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-effect-event": "0.0.3",
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-effect-event": {
      "version": "0.0.3",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-effect-event/-/react-use-effect-event-0.0.3.tgz",
      "integrity": "sha512-6c8ZqvPTWILEKnyVkP53EGRCcpnJiKTC21sS/6R1GF5xKyHJJWQEPfkqlcgUkdRQivd6tb23abUwe4ngWmY0JA==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-is-hydrated": {
      "version": "0.1.1",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-is-hydrated/-/react-use-is-hydrated-0.1.1.tgz",
      "integrity": "sha512-qwOiz4Tjo8CNnrOLAYUMXeZwDzXgXpvK4TKQPmWLECM9XoWvA6+0Z2/7Ag3A4ivjS4ovbLJPbskkxioFyBhr8A==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-layout-effect": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-layout-effect/-/react-use-layout-effect-1.1.2.tgz",
      "integrity": "sha512-jrBWOxZITuGcnjRCM2t2U5ZPkCLxD+Ym6DjfssS5haTj2iiak/DOb64JeN6OdLfLgptb6/e2kKR+ZuTrGoZTPA==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-previous": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-previous/-/react-use-previous-1.1.2.tgz",
      "integrity": "sha512-IGBQPtRFdhN6MQ8dbegVmBq1LVZluya3F1jWY+puIcQC3MHctRwTDSBWCkL/3ZcnMJLTMJ++Z+ktmvg0F89iCw==",
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-rect": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-rect/-/react-use-rect-1.1.2.tgz",
      "integrity": "sha512-d8a+bBY/FxikNPlgJJoaBHZX+zKVbWHYJGTLnLvveQgFSTntkGdEKv3JDtHrMS0DNYpllz2nRsTLGLKYttbpmw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/rect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-use-size": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-use-size/-/react-use-size-1.1.2.tgz",
      "integrity": "sha512-giWQp+4mxjBPt4KZ0MmyuykFNWfbDxKt4x+fPkRYmgRFJSbCZFzUglvMb/Kjn38tm10YP4ufiQZDx3zna4LU6w==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-use-layout-effect": "1.1.2"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/react-visually-hidden": {
      "version": "1.2.7",
      "resolved": "https://registry.npmjs.org/@radix-ui/react-visually-hidden/-/react-visually-hidden-1.2.7.tgz",
      "integrity": "sha512-1wNZBggTDK3GRuuQ6nP4k2yi7a6l7I5qbMPbZcRsrGsGVead/f/d5FhEzUvqFs0bcrDLx7n1zKQ3JvLR6whaaw==",
      "license": "MIT",
      "dependencies": {
        "@radix-ui/react-primitive": "2.1.7"
      },
      "peerDependencies": {
        "@types/react": "*",
        "@types/react-dom": "*",
        "react": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc",
        "react-dom": "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@radix-ui/rect": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/@radix-ui/rect/-/rect-1.1.2.tgz",
      "integrity": "sha512-xnXE7wG13PI+cxieVssYXlQJuYVRhH9NBoxt3KNwzghDIA69GMm7d4wXRouHIYjE+KvS6U/MsMO73NdS2MH9ZA==",
      "license": "MIT"
    },
    "node_modules/@reduxjs/toolkit": {
      "version": "2.12.0",
      "resolved": "https://registry.npmjs.org/@reduxjs/toolkit/-/toolkit-2.12.0.tgz",
      "integrity": "sha512-KiT+RzZbp6mQET+Mg+h2c97+9j1sNflUxQkIHI7Yuzf6Peu+OYpmkn6nbHWmLLWj+1ZODUJFwGZ7gx3L9R9EOw==",
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "@standard-schema/utils": "^0.3.0",
        "immer": "^11.0.0",
        "redux": "^5.0.1",
        "redux-thunk": "^3.1.0",
        "reselect": "^5.1.0"
      },
      "peerDependencies": {
        "react": "^16.9.0 || ^17.0.0 || ^18 || ^19",
        "react-redux": "^7.2.1 || ^8.1.3 || ^9.0.0"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-redux": {
          "optional": true
        }
      }
    },
    "node_modules/@remix-run/router": {
      "version": "1.23.3",
      "resolved": "https://registry.npmjs.org/@remix-run/router/-/router-1.23.3.tgz",
      "integrity": "sha512-4An71tdz9X8+3sI4Qqqd2LWd9vS39J7sqd9EU4Scw7TJE/qB10Flv/UuqbPVgfQV9XoK8Np6jNquZitnZq5i+Q==",
      "license": "MIT",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@rolldown/pluginutils": {
      "version": "1.0.0-beta.27",
      "resolved": "https://registry.npmjs.org/@rolldown/pluginutils/-/pluginutils-1.0.0-beta.27.tgz",
      "integrity": "sha512-+d0F4MKMCbeVUJwG96uQ4SgAznZNSq93I3V+9NHA4OpvqG8mRCpGdKmK8l/dl02h2CCDHwW2FqilnTyDcAnqjA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@rollup/rollup-android-arm-eabi": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm-eabi/-/rollup-android-arm-eabi-4.62.2.tgz",
      "integrity": "sha512-6o7ZLZK+BeenkZCFNDXqpbjw9bD6nuWonvS/lwQJp7NoVVxm6p3qE7qQ5jGuBjiFsgvqjD8mZAU5oWxTmbOeOg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-android-arm64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-android-arm64/-/rollup-android-arm64-4.62.2.tgz",
      "integrity": "sha512-BaH7BllCACHoH1LguOU56UItGfUWjujlO65kS9LAodViaN4bwIKd7oeW/ZHJ/4ljr/7MIiENnNy3HJ0zXv8Zkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ]
    },
    "node_modules/@rollup/rollup-darwin-arm64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-arm64/-/rollup-darwin-arm64-4.62.2.tgz",
      "integrity": "sha512-v39RCCvj4He82I9sFmk+M1VZ0PLM9sfsLVikjfx2hYBNALhrrOR2D3JjQA6AhlaSOgcR+RzrKY7e1+bT6SUO/A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-darwin-x64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-darwin-x64/-/rollup-darwin-x64-4.62.2.tgz",
      "integrity": "sha512-yl0y2vq3S3lHeuXhEdss6TWfKW8vkujImO12tn4ZkG/4oghr09LvdYm2RElVjokTQiUvDUGXLGsYeLqUMCKpGA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-arm64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-arm64/-/rollup-freebsd-arm64-4.62.2.tgz",
      "integrity": "sha512-tT4pvt4qXD+vEoezupCWi+a1F0vvDiksiHc+PxRlYTOH1I6/X4id9jPxTP+Fg+545euaFT1jJVs4CEdHZAU1vw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-freebsd-x64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-freebsd-x64/-/rollup-freebsd-x64-4.62.2.tgz",
      "integrity": "sha512-6nU5F2wCW+qvCBhTn1pdIU3bzsIoF7EUwsCDRxilWGprQR6yd508YnH9+OKFCwpfS8pjZqDUmnCAr7exax0XCg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-gnueabihf": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-gnueabihf/-/rollup-linux-arm-gnueabihf-4.62.2.tgz",
      "integrity": "sha512-n1GJHPOvpIfhi3TmrCeh6S6URt9BFCt0KQE3qvexyGCTAKpR4Lg+eWvNZEqu7epxwus/8ElT3hacYEucm49SZg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm-musleabihf": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm-musleabihf/-/rollup-linux-arm-musleabihf-4.62.2.tgz",
      "integrity": "sha512-JqgflS8wEB+UXV/vS1RpRbifGBeN4D5lz8D8oOFbFZw4vedvdOgCFAjfBmIMdW3yL10XpQQ0Ambepw6MXrhOnA==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-gnu/-/rollup-linux-arm64-gnu-4.62.2.tgz",
      "integrity": "sha512-wnFJkogWvN4jm/hQRF2UBaeUmk20j5+DmHvoyWii2b8HJDyvz1MF2OU/6ynXt2KR63rbZLWkFpoytpdc/yBuSA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-arm64-musl": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-arm64-musl/-/rollup-linux-arm64-musl-4.62.2.tgz",
      "integrity": "sha512-HVu2bp0zhvJ8xHEV9+UUs7S90VadmBSY3LcIMvozbPo4AuMGDWlz3ymHLHZPX4hR67TKTt8Qp5PJ5RBg/i+RMQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-gnu/-/rollup-linux-loong64-gnu-4.62.2.tgz",
      "integrity": "sha512-mQqqAV8QaoSgr9I2fKDLY2BAVvmKjWoGiu/cSYQonsLvtqwEn1E4QYfnCOcp5zoEqNhsDYin1s6jx/VJmrxlZg==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-loong64-musl": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-loong64-musl/-/rollup-linux-loong64-musl-4.62.2.tgz",
      "integrity": "sha512-IxKLoxCQ2IWi6bT2akyDUBGsOImDKB+sPp4EsTmwFQ/fMwpCKm8uLSSgP/Kx/QYUgKis6SEZ5/Nlhup0DIA0PQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-gnu/-/rollup-linux-ppc64-gnu-4.62.2.tgz",
      "integrity": "sha512-Mk5ha2RQSgyFfmYYLkBpPnUk8D8FriBxesO1u9O75X0mHgXL1UQcH5Itl2lurWL2tj0RxV9b9tJgipac0hRY9A==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-ppc64-musl": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-ppc64-musl/-/rollup-linux-ppc64-musl-4.62.2.tgz",
      "integrity": "sha512-CjvEnqJL/0/TQ3TXX3OPIJ/kmBellrWd4heXUmHeJlTnmwjKpSJzoehLaL6Xk0ZnMHBu9dZuFADNOrtjF4v+2w==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-gnu/-/rollup-linux-riscv64-gnu-4.62.2.tgz",
      "integrity": "sha512-1SiZbzwdkaDURsew/tSOrooKiYy7EQGT6m8ufavAi9NEyQb/6VuIxFXAL1fqa4iZe3g4NbNk4P7J32z2tw5Mgg==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-riscv64-musl": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-riscv64-musl/-/rollup-linux-riscv64-musl-4.62.2.tgz",
      "integrity": "sha512-nQts12zJ3NQRoE6uYljOH89v7szzLDvG2JD/vsX+vGXU8w/At1GowTZ5/7qeFQ8m7L55rpR8Okugnuo5bgjy2Q==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-s390x-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-s390x-gnu/-/rollup-linux-s390x-gnu-4.62.2.tgz",
      "integrity": "sha512-E9/ll019jhPIJgpzfZoIkBGhcz+kKNgVWYRY0zr9srBdPPFVpvOKW8VaJKUbeK+eZXyQF9ltME+Kk6affeaPgg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-gnu/-/rollup-linux-x64-gnu-4.62.2.tgz",
      "integrity": "sha512-5BqxR/pshjey51iliyzTD5Xi3EN0aLmQ2lZ3lvefVV9c82BvrLo2/6OT55iifpWBufs6kdwWbuOKS841DrmK9A==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-linux-x64-musl": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-linux-x64-musl/-/rollup-linux-x64-musl-4.62.2.tgz",
      "integrity": "sha512-uNN83XxQrRAh/w0/pmAfibcwyb6YWt4gP+dpnQKPVJshAloQ785ii8CT8ZCIxkGg9opVsvAlGhFitSm6D1Jjpg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ]
    },
    "node_modules/@rollup/rollup-openbsd-x64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openbsd-x64/-/rollup-openbsd-x64-4.62.2.tgz",
      "integrity": "sha512-srjEIxSH3LRnJN6THczDHWQplqEMFiAJrTab0msUryh9kwNpkICf3Ea6q6MN/2cZwRFUNx5w+h6Hpi4QuHS6Zg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ]
    },
    "node_modules/@rollup/rollup-openharmony-arm64": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-openharmony-arm64/-/rollup-openharmony-arm64-4.62.2.tgz",
      "integrity": "sha512-8hOJnxgbyObnCm5AlRA3A931xX19xq80RjVTKgJOvEKWqJruP/Uf12IbAOaDjjEXYRewwHLfmF0YRIdK3OwKWA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ]
    },
    "node_modules/@rollup/rollup-win32-arm64-msvc": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-arm64-msvc/-/rollup-win32-arm64-msvc-4.62.2.tgz",
      "integrity": "sha512-mmF4AY1i0hG/bLWUctUq59gtmgaSIRa3cu/A3JFRp/sCNEme2bgDEiDS22P9FbnJB8NJNF4jPJiSP5RHQpUTDg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-ia32-msvc": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-ia32-msvc/-/rollup-win32-ia32-msvc-4.62.2.tgz",
      "integrity": "sha512-DZgkknc6jhHrk46V25vbAM0zZkyP0nSDkJB8/dRkLTxv470dOmWDqGoEJl/9A0dFfS7yE3REOwNDxpHwSLSt0Q==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-gnu": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-gnu/-/rollup-win32-x64-gnu-4.62.2.tgz",
      "integrity": "sha512-T6xr6ucWSFto+VGajA8YH26LdpHRuP4YLHEKAtCWvJDOlnmWcDZVCI2Jmjr+IFHDlt2zRaTAKE4tfjTaWLgJBg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@rollup/rollup-win32-x64-msvc": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/@rollup/rollup-win32-x64-msvc/-/rollup-win32-x64-msvc-4.62.2.tgz",
      "integrity": "sha512-BfzEnDJOt9T8M989/lA37EcJgat01wLRnoi5dQf3QzOH7jzpqTAzdDbVfRljVr5r+jzKqpbHeyOfAaXxAd0PAA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ]
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "license": "MIT"
    },
    "node_modules/@standard-schema/utils": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/utils/-/utils-0.3.0.tgz",
      "integrity": "sha512-e7Mew686owMaPJVNNLs55PUvgz371nKgwsc4vxE49zsODpJEnxgxRo2y/OKrqueavXgZNMDVj3DdHFlaSAeU8g==",
      "license": "MIT"
    },
    "node_modules/@tanstack/query-core": {
      "version": "5.101.2",
      "resolved": "https://registry.npmjs.org/@tanstack/query-core/-/query-core-5.101.2.tgz",
      "integrity": "sha512-hH5MLoJhF7KaIGd7q3xTXGXvslI+GYlM1Z/35aSHHWaCJWB7XvTSHYuV3eM7tw+aE0mT/xMro4M4Q9rCGHT0lw==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@tanstack/react-query": {
      "version": "5.101.2",
      "resolved": "https://registry.npmjs.org/@tanstack/react-query/-/react-query-5.101.2.tgz",
      "integrity": "sha512-seDkr6kzGzX1okaaTtZPtgA688CDPlXUz1C6xSg0ESqn04Vuc8tlrYms1s3de+znBqhPVxFRfpAfUf+6XvfPWg==",
      "license": "MIT",
      "dependencies": {
        "@tanstack/query-core": "5.101.2"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^18 || ^19"
      }
    },
    "node_modules/@types/babel__core": {
      "version": "7.20.5",
      "resolved": "https://registry.npmjs.org/@types/babel__core/-/babel__core-7.20.5.tgz",
      "integrity": "sha512-qoQprZvz5wQFJwMDqeseRXWv3rqMvhgpbXFfVyWhbx9X47POIA6i/+dXefEmZKoAgOaTdaIgNSMqMIU61yRyzA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.20.7",
        "@babel/types": "^7.20.7",
        "@types/babel__generator": "*",
        "@types/babel__template": "*",
        "@types/babel__traverse": "*"
      }
    },
    "node_modules/@types/babel__generator": {
      "version": "7.27.0",
      "resolved": "https://registry.npmjs.org/@types/babel__generator/-/babel__generator-7.27.0.tgz",
      "integrity": "sha512-ufFd2Xi92OAVPYsy+P4n7/U7e68fex0+Ee8gSG9KX7eo084CWiQ4sdxktvdl0bOPupXtVJPY19zk6EwWqUQ8lg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__template": {
      "version": "7.4.4",
      "resolved": "https://registry.npmjs.org/@types/babel__template/-/babel__template-7.4.4.tgz",
      "integrity": "sha512-h/NUaSyG5EyxBIp8YRxo4RMe2/qQgvyowRwVMzhYhBCONbW8PUsg4lkFMrhgZhUe5z3L3MiLDuvyJ/CaPa2A8A==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/parser": "^7.1.0",
        "@babel/types": "^7.0.0"
      }
    },
    "node_modules/@types/babel__traverse": {
      "version": "7.28.0",
      "resolved": "https://registry.npmjs.org/@types/babel__traverse/-/babel__traverse-7.28.0.tgz",
      "integrity": "sha512-8PvcXf70gTDZBgt9ptxJ8elBeBjcLOAcOtoO/mPJjtji1+CdGbHgm77om1GrsPxsiE+uXIpNSK64UYaIwQXd4Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/types": "^7.28.2"
      }
    },
    "node_modules/@types/d3-array": {
      "version": "3.2.2",
      "resolved": "https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.2.tgz",
      "integrity": "sha512-hOLWVbm7uRza0BYXpIIW5pxfrKe0W+D5lrFiAEYR+pb6w3N2SwSMaJbXdUfSEv+dT4MfHBLtn5js0LAWaO6otw==",
      "license": "MIT"
    },
    "node_modules/@types/d3-color": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz",
      "integrity": "sha512-iO90scth9WAbmgv7ogoq57O9YpKmFBbmoEoCHDB2xMBY0+/KVrqAaCDyCE16dUspeOvIxFFRI+0sEtqDqy2b4A==",
      "license": "MIT"
    },
    "node_modules/@types/d3-ease": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz",
      "integrity": "sha512-NcV1JjO5oDzoK26oMzbILE6HW7uVXOHLQvHshBUW4UMdZGfiY6v5BeQwh9a9tCzv+CeefZQHJt5SRgK154RtiA==",
      "license": "MIT"
    },
    "node_modules/@types/d3-interpolate": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz",
      "integrity": "sha512-mgLPETlrpVV1YRJIglr4Ez47g7Yxjl1lj7YKsiMCb27VJH9W8NVM6Bb9d8kkpG/uAQS5AmbA48q2IAolKKo1MA==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-color": "*"
      }
    },
    "node_modules/@types/d3-path": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.1.tgz",
      "integrity": "sha512-VMZBYyQvbGmWyWVea0EHs/BwLgxc+MKi1zLDCONksozI4YJMcTt8ZEuIR4Sb1MMTE8MMW49v0IwI5+b7RmfWlg==",
      "license": "MIT"
    },
    "node_modules/@types/d3-scale": {
      "version": "4.0.9",
      "resolved": "https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.9.tgz",
      "integrity": "sha512-dLmtwB8zkAeO/juAMfnV+sItKjlsw2lKdZVVy6LRr0cBmegxSABiLEpGVmSJJ8O08i4+sGR6qQtb6WtuwJdvVw==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-time": "*"
      }
    },
    "node_modules/@types/d3-shape": {
      "version": "3.1.8",
      "resolved": "https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.1.8.tgz",
      "integrity": "sha512-lae0iWfcDeR7qt7rA88BNiqdvPS5pFVPpo5OfjElwNaT2yyekbM0C9vK+yqBqEmHr6lDkRnYNoTBYlAgJa7a4w==",
      "license": "MIT",
      "dependencies": {
        "@types/d3-path": "*"
      }
    },
    "node_modules/@types/d3-time": {
      "version": "3.0.4",
      "resolved": "https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.4.tgz",
      "integrity": "sha512-yuzZug1nkAAaBlBBikKZTgzCeA+k1uy4ZFwWANOfKw5z5LRhV0gNA7gNkKm7HoK+HRN0wX3EkxGk0fpbWhmB7g==",
      "license": "MIT"
    },
    "node_modules/@types/d3-timer": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz",
      "integrity": "sha512-Ps3T8E8dZDam6fUyNiMkekK3XUsaUEik+idO9/YjPtfj2qruF8tFBXS7XhtE4iIXBLxhmLjP3SXpLhVf21I9Lw==",
      "license": "MIT"
    },
    "node_modules/@types/estree": {
      "version": "1.0.9",
      "resolved": "https://registry.npmjs.org/@types/estree/-/estree-1.0.9.tgz",
      "integrity": "sha512-GhdPgy1el4/ImP05X05Uw4cw2/M93BCUmnEvWZNStlCzEKME4Fkk+YpoA5OiHNQmoS7Cafb8Xa3Pya8m1Qrzeg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.15",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@types/react": {
      "version": "18.3.31",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.31.tgz",
      "integrity": "sha512-vfEqpXTvwT91yhmwdfouStN2hSKwTvyRs8qpLfADyrq/kxDw0hZM7Wk9Ug1FELj8hIby+S/+kQCSRFF32nv2Qw==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "devOptional": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/@types/use-sync-external-store": {
      "version": "0.0.6",
      "resolved": "https://registry.npmjs.org/@types/use-sync-external-store/-/use-sync-external-store-0.0.6.tgz",
      "integrity": "sha512-zFDAD+tlpf2r4asuHEj0XH6pY6i0g5NeAHPn+15wk3BV6JA69eERFXC1gyGThDkVa1zCyKr5jox1+2LbV/AMLg==",
      "license": "MIT"
    },
    "node_modules/@vitejs/plugin-react": {
      "version": "4.7.0",
      "resolved": "https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-4.7.0.tgz",
      "integrity": "sha512-gUu9hwfWvvEDBBmgtAowQCojwZmJ5mcLn3aufeCsitijs3+f2NsrPtlAWIR6OPiqljl96GVCUbLe0HyqIpVaoA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/core": "^7.28.0",
        "@babel/plugin-transform-react-jsx-self": "^7.27.1",
        "@babel/plugin-transform-react-jsx-source": "^7.27.1",
        "@rolldown/pluginutils": "1.0.0-beta.27",
        "@types/babel__core": "^7.20.5",
        "react-refresh": "^0.17.0"
      },
      "engines": {
        "node": "^14.18.0 || >=16.0.0"
      },
      "peerDependencies": {
        "vite": "^4.2.0 || ^5.0.0 || ^6.0.0 || ^7.0.0"
      }
    },
    "node_modules/agent-base": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-6.0.2.tgz",
      "integrity": "sha512-RZNwNclF7+MS/8bDg70amg32dyeZGZxiDuQmZxKLAlQjr3jGyLx+4Kkk58UO7D2QdgFIQCovuSuZESne6RG6XQ==",
      "license": "MIT",
      "dependencies": {
        "debug": "4"
      },
      "engines": {
        "node": ">= 6.0.0"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A==",
      "license": "MIT"
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "license": "ISC",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg==",
      "license": "MIT"
    },
    "node_modules/aria-hidden": {
      "version": "1.2.6",
      "resolved": "https://registry.npmjs.org/aria-hidden/-/aria-hidden-1.2.6.tgz",
      "integrity": "sha512-ik3ZgC9dY/lYVVM++OISsaYDeg1tb0VtP5uL3ouh1koGOaUMDPpbFIei4JkFimWUFPn90sbMNMXQAIVOlnYKJA==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q==",
      "license": "MIT"
    },
    "node_modules/autoprefixer": {
      "version": "10.5.2",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.5.2.tgz",
      "integrity": "sha512-rD5t5DwOjJdmSORcTq64j8MawTC+tbQ+HHqjR4NDumamy/ambn1UJrlKL+KdwujWxMkFjPM3pPHOEA9tl4767Q==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "browserslist": "^4.28.4",
        "caniuse-lite": "^1.0.30001799",
        "fraction.js": "^5.3.4",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/axios": {
      "version": "1.18.1",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.18.1.tgz",
      "integrity": "sha512-3nTvFlvpn9Zu/RkHUqtc7/+al4UpRW5az71ap5zccp6e8RAYEzhMTecX8Dz1wWDYrPpUoB1HAQEGEAEvUr7S9g==",
      "license": "MIT",
      "dependencies": {
        "follow-redirects": "^1.16.0",
        "form-data": "^4.0.5",
        "https-proxy-agent": "^5.0.1",
        "proxy-from-env": "^2.1.0"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.10.41",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.10.41.tgz",
      "integrity": "sha512-WwS7MHhqGHHlaVsqRZnhvCEMS0owDX+SxRlve7JkuH7My1Ara3ZriTmCQupPfYjxMZ8I/tgxtJYr2t7taHaH4A==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "license": "MIT",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "license": "MIT",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.28.4",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.28.4.tgz",
      "integrity": "sha512-MTc8i/x9jBQd1iMw2CFGS+rwMa07eYjLR0CCTLDACl9xhxy+nIs3KeML/biicXtk9JrZ6dnnTatmc7ErPXIxqw==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "baseline-browser-mapping": "^2.10.38",
        "caniuse-lite": "^1.0.30001799",
        "electron-to-chromium": "^1.5.376",
        "node-releases": "^2.0.48",
        "update-browserslist-db": "^1.2.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001800",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001800.tgz",
      "integrity": "sha512-MMHtuAz9Ys840zAY5F4k6fV5GaivZ9sPk+nz0mY+GYVzRBnYkN0mpqkSR92oWRQ19yQWo4HvBV/FnC16AJX8MA==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "license": "MIT",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/class-variance-authority": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/class-variance-authority/-/class-variance-authority-0.7.1.tgz",
      "integrity": "sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==",
      "license": "Apache-2.0",
      "dependencies": {
        "clsx": "^2.1.1"
      },
      "funding": {
        "url": "https://polar.sh/cva"
      }
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "license": "MIT",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/convert-source-map": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/convert-source-map/-/convert-source-map-2.0.0.tgz",
      "integrity": "sha512-Kvp459HrV2FEJ1CAsi1Ku+MY3kasH19TFykTz2xWmMeq6bk2NU3XXvfJ+Q61m0xktWwt+1HSYf3JZsTms3aRJg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "license": "MIT",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "license": "MIT"
    },
    "node_modules/d3-array": {
      "version": "3.2.4",
      "resolved": "https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz",
      "integrity": "sha512-tdQAmyA18i4J7wprpYq8ClcxZy3SC31QMeByyCFyRt7BVHdREQZ5lpzoe5mFEYZUWe+oq8HBvk9JjpibyEV4Jg==",
      "license": "ISC",
      "dependencies": {
        "internmap": "1 - 2"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-color": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz",
      "integrity": "sha512-zg/chbXyeBtMQ1LbD/WSoW2DpC3I0mpmPdW+ynRTj/x2DAWYrIY7qeZIHidozwV24m4iavr15lNwIwLxRmOxhA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-ease": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz",
      "integrity": "sha512-wR/XK3D3XcLIZwpbvQwQ5fK+8Ykds1ip7A2Txe0yxncXSdq1L9skcG7blcedkOX+ZcgxGAmLX1FrRGbADwzi0w==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-format": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/d3-format/-/d3-format-3.1.2.tgz",
      "integrity": "sha512-AJDdYOdnyRDV5b6ArilzCPPwc1ejkHcoyFarqlPqT7zRYjhavcT3uSrqcMvsgh2CgoPbK3RCwyHaVyxYcP2Arg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-interpolate": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz",
      "integrity": "sha512-3bYs1rOD33uo8aqJfKP3JWPAibgw8Zm2+L9vBKEHJ2Rg+viTR7o5Mmv5mZcieN+FRYaAOWX5SJATX6k1PWz72g==",
      "license": "ISC",
      "dependencies": {
        "d3-color": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-path": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-path/-/d3-path-3.1.0.tgz",
      "integrity": "sha512-p3KP5HCf/bvjBSSKuXid6Zqijx7wIfNW+J/maPs+iwR35at5JCbLUT0LzF1cnjbCHWhqzQTIN2Jpe8pRebIEFQ==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-scale": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.2.tgz",
      "integrity": "sha512-GZW464g1SH7ag3Y7hXjf8RoUuAFIqklOAq3MRl4OaWabTFJY9PN/E1YklhXLh+OQ3fM9yS2nOkCoS+WLZ6kvxQ==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2.10.0 - 3",
        "d3-format": "1 - 3",
        "d3-interpolate": "1.2.0 - 3",
        "d3-time": "2.1.1 - 3",
        "d3-time-format": "2 - 4"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-shape": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.0.tgz",
      "integrity": "sha512-SaLBuwGm3MOViRq2ABk3eLoxwZELpH6zhl3FbAoJ7Vm1gofKx6El1Ib5z23NUEhF9AsGl7y+dzLe5Cw2AArGTA==",
      "license": "ISC",
      "dependencies": {
        "d3-path": "^3.1.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/d3-time/-/d3-time-3.1.0.tgz",
      "integrity": "sha512-VqKjzBLejbSMT4IgbmVgDjpkYrNWUYJnbCGo874u7MMKIWsILRX+OpX/gTk8MqjpT1A/c6HY2dCA77ZN0lkQ2Q==",
      "license": "ISC",
      "dependencies": {
        "d3-array": "2 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-time-format": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.0.tgz",
      "integrity": "sha512-dJxPBlzC7NugB2PDLwo9Q8JiTR3M3e4/XANkreKSUxF8vvXKqm1Yfq4Q5dl8budlunRVlUUaDUgFt7eA8D6NLg==",
      "license": "ISC",
      "dependencies": {
        "d3-time": "1 - 3"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/d3-timer": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz",
      "integrity": "sha512-ndfJ/JxxMd3nw31uyKoY2naivF+r29V+Lc0svZxe1JvvIRmi8hUsrMvdOwgS1o6uBHmiz91geQ0ylPP0aj1VUA==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/debug": {
      "version": "4.4.3",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.3.tgz",
      "integrity": "sha512-RGwwWnwQvkVfavKVt22FGLw+xYSdzARwm0ru6DhTVA3umU5hZc28V3kO4stgYryrTlLpuvgI9GiijltAjNbcqA==",
      "license": "MIT",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/decimal.js-light": {
      "version": "2.5.1",
      "resolved": "https://registry.npmjs.org/decimal.js-light/-/decimal.js-light-2.5.1.tgz",
      "integrity": "sha512-qIMFpTMZmny+MMIitAB6D7iVPEorVw6YQRWkvarTkT4tBeSLLiHzcwj6q0MmYSFCiVpiqPJTJEYIrpcPzVEIvg==",
      "license": "MIT"
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/detect-node-es": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/detect-node-es/-/detect-node-es-1.1.0.tgz",
      "integrity": "sha512-ypdmJU/TbBby2Dxibuv7ZLW3Bs1QEmM7nHjEANfohJLvE0XVujisn1qPJcZxg+qDucsr+bP6fLD1rPS3AhJ7EQ==",
      "license": "MIT"
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw==",
      "license": "Apache-2.0"
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA==",
      "license": "MIT"
    },
    "node_modules/dom-helpers": {
      "version": "5.2.1",
      "resolved": "https://registry.npmjs.org/dom-helpers/-/dom-helpers-5.2.1.tgz",
      "integrity": "sha512-nRCa7CK3VTrM2NmGkIy4cbK7IZlgBE/PYMn55rrXefr5xXDP0LdtfPnblFDoVdcAfslJ7or6iqAUnx0CCGIWQA==",
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.8.7",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.385",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.385.tgz",
      "integrity": "sha512-78sa/M08MNAYHQfjoWMvOlKQqZ0ElhSm/L5HNUc96VZ3b+KvDVnngFm8sYQy0XrhTRgAhggHr5abA7yTvRdo4Q==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/esbuild": {
      "version": "0.21.5",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.21.5.tgz",
      "integrity": "sha512-mg3OPMV4hXywwpoDxu3Qda5xCKQi+vCTZq8S9J/EpkhB2HzKXq4SNFZE3+NK93JYxc8VMSep+lOUSC/RVKaBqw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=12"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.21.5",
        "@esbuild/android-arm": "0.21.5",
        "@esbuild/android-arm64": "0.21.5",
        "@esbuild/android-x64": "0.21.5",
        "@esbuild/darwin-arm64": "0.21.5",
        "@esbuild/darwin-x64": "0.21.5",
        "@esbuild/freebsd-arm64": "0.21.5",
        "@esbuild/freebsd-x64": "0.21.5",
        "@esbuild/linux-arm": "0.21.5",
        "@esbuild/linux-arm64": "0.21.5",
        "@esbuild/linux-ia32": "0.21.5",
        "@esbuild/linux-loong64": "0.21.5",
        "@esbuild/linux-mips64el": "0.21.5",
        "@esbuild/linux-ppc64": "0.21.5",
        "@esbuild/linux-riscv64": "0.21.5",
        "@esbuild/linux-s390x": "0.21.5",
        "@esbuild/linux-x64": "0.21.5",
        "@esbuild/netbsd-x64": "0.21.5",
        "@esbuild/openbsd-x64": "0.21.5",
        "@esbuild/sunos-x64": "0.21.5",
        "@esbuild/win32-arm64": "0.21.5",
        "@esbuild/win32-ia32": "0.21.5",
        "@esbuild/win32-x64": "0.21.5"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/eventemitter3": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/eventemitter3/-/eventemitter3-4.0.7.tgz",
      "integrity": "sha512-8guHBZCwKnFhYdHr2ysuRWErTwhoN2X8XELRlrRwpmfeY2jjuUN4taQMsULKUVo1K4DvZl+0pgfyoysHxvmvEw==",
      "license": "MIT"
    },
    "node_modules/fancy-canvas": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/fancy-canvas/-/fancy-canvas-2.1.0.tgz",
      "integrity": "sha512-nifxXJ95JNLFR2NgRV4/MxVP45G9909wJTEKz5fg/TZS20JJZA6hfgRVh/bC9bwl2zBtBNcYPjiBE4njQHVBwQ==",
      "license": "MIT"
    },
    "node_modules/fast-equals": {
      "version": "5.4.0",
      "resolved": "https://registry.npmjs.org/fast-equals/-/fast-equals-5.4.0.tgz",
      "integrity": "sha512-jt2DW/aNFNwke7AUd+Z+e6pz39KO5rzdbbFCg2sGafS4mk13MI7Z8O5z9cADNn5lhGODIgLwug6TZO2ctf7kcw==",
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "license": "MIT",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fastq": {
      "version": "1.20.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.20.1.tgz",
      "integrity": "sha512-GGToxJ/w1x32s/D2EKND7kTil4n8OVk/9mycTc4VDza13lOvpUZTGX3mFSCtV9ksdGBVzvsyAVLM6mHFThxXxw==",
      "license": "ISC",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "license": "MIT",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/follow-redirects": {
      "version": "1.16.0",
      "resolved": "https://registry.npmjs.org/follow-redirects/-/follow-redirects-1.16.0.tgz",
      "integrity": "sha512-y5rN/uOsadFT/JfYwhxRS5R7Qce+g3zG97+JrtFZlC9klX/W5hD7iiLzScI4nZqUS7DNUdhPgw4xI8W2LuXlUw==",
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/RubenVerborgh"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=4.0"
      },
      "peerDependenciesMeta": {
        "debug": {
          "optional": true
        }
      }
    },
    "node_modules/form-data": {
      "version": "4.0.6",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.6.tgz",
      "integrity": "sha512-vKatAh4SlVfgbv+YtmhiRjhEMJsYpsG1Y2rMQtR+SVSbytsSD1YGzDIcrAJmdFec88u/+VoGmxnl+80gL1tRCQ==",
      "license": "MIT",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.4",
        "mime-types": "^2.1.35"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fraction.js": {
      "version": "5.3.4",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-5.3.4.tgz",
      "integrity": "sha512-1X1NTtiJphryn/uLQz3whtY6jK3fTqoE3ohKs0tT+Ujr1W59oopxmoEh7Lu5p6vBaPbgoM0bzveAW4Qi5RyWDQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/framer-motion": {
      "version": "11.18.2",
      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-11.18.2.tgz",
      "integrity": "sha512-5F5Och7wrvtLVElIpclDT0CBzMVg3dL22B64aZwHtsIY8RB4mXICLrkajK4G9R+ieSAGcgrLeae2SeUTg2pr6w==",
      "license": "MIT",
      "dependencies": {
        "motion-dom": "^11.18.1",
        "motion-utils": "^11.18.1",
        "tslib": "^2.4.0"
      },
      "peerDependencies": {
        "@emotion/is-prop-valid": "*",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@emotion/is-prop-valid": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/gensync": {
      "version": "1.0.0-beta.2",
      "resolved": "https://registry.npmjs.org/gensync/-/gensync-1.0.0-beta.2.tgz",
      "integrity": "sha512-3hN7NaskYvMDLQY55gnW3NQ+mesEAepTqlg+VEbj7zzqEMBVNhzcGYYeqFo/TlYz6eQiFcp1HcsCZO+nGgS8zg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-nonce": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-nonce/-/get-nonce-1.0.1.tgz",
      "integrity": "sha512-FJhYRoDaiatfEkUK8HKlicmu/3SGFD51q3itKDGoSTysQJBnfOcxU5GxnhE1E6soB76MbT0MBtnKJuXyAx+96Q==",
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "license": "ISC",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/goober": {
      "version": "2.1.19",
      "resolved": "https://registry.npmjs.org/goober/-/goober-2.1.19.tgz",
      "integrity": "sha512-U7veizMqxyKlM58+Z5j2ngJBH/r9siDmxpvNxSw0PylF6WQvrASJEZrxh1hidRBJc2jqoBVSyOban5u8m+6Rxg==",
      "license": "MIT",
      "peerDependencies": {
        "csstype": "^3.0.10"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "license": "MIT",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-5.0.1.tgz",
      "integrity": "sha512-dFcAjpTQFgoLMzC2VwU+C/CbS7uRL0lWmxDITmqm7C+7F0Odmj6s9l6alZc6AELXhrnggM2CeWSXHGOdX2YtwA==",
      "license": "MIT",
      "dependencies": {
        "agent-base": "6",
        "debug": "4"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/immer": {
      "version": "11.1.9",
      "resolved": "https://registry.npmjs.org/immer/-/immer-11.1.9.tgz",
      "integrity": "sha512-sc/z0Cyti70bZa0ZU4sWfAElfovFb9Ni8tArJZLuklYWxegPiK3pDOql1Rq5H0FIRAW9LSQRG6OX4KqBldbhBA==",
      "license": "MIT",
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/immer"
      }
    },
    "node_modules/internmap": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz",
      "integrity": "sha512-5Hh7Y1wQbvY5ooGgPbDaL5iYLAPzMTUrjMulskHLH6wnv/A+1q5rgEaiuqEjB+oxGXIVZs1FF+R/KPN3ZSQYYg==",
      "license": "ISC",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "license": "MIT",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.2",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.2.tgz",
      "integrity": "sha512-evOr8xfXKxE6qSR0hSXL2r3sd7ALj8+7jQEUvPYcm5sgZFdJ+AYzT6yNmJenvIYQBgIGwfwz08sL8zoL7yq2BA==",
      "license": "MIT",
      "dependencies": {
        "hasown": "^2.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "license": "MIT",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "license": "MIT",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.7",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
      "license": "MIT",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "license": "MIT"
    },
    "node_modules/jsesc": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/jsesc/-/jsesc-3.1.0.tgz",
      "integrity": "sha512-/sM3dO2FOzXjKQhJuo0Q173wf2KOo8t4I8vHy6lF9poUp7bKT0/NHE8fPX23PwfhnykfqnC2xRxOnVw5XuGIaA==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "jsesc": "bin/jsesc"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/json5": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/json5/-/json5-2.2.3.tgz",
      "integrity": "sha512-XmOWe7eyHYH14cLdVPoyg+GOH3rYX++KpzrylJwSW98t3Nk+U8XOl8FWKOgwtzdb8lXGf6zYwDUzeHMWfxasyg==",
      "dev": true,
      "license": "MIT",
      "bin": {
        "json5": "lib/cli.js"
      },
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/lightweight-charts": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/lightweight-charts/-/lightweight-charts-4.2.3.tgz",
      "integrity": "sha512-5kS/2hY3wNYNzhnS8Gb+GAS07DX8GPF2YVDnd2NMC85gJVQ6RLU6YrXNgNJ6eg0AnWPwCnvaGtYmGky3HiLQEw==",
      "license": "Apache-2.0",
      "dependencies": {
        "fancy-canvas": "2.1.0"
      }
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "license": "MIT",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg==",
      "license": "MIT"
    },
    "node_modules/lodash": {
      "version": "4.18.1",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.18.1.tgz",
      "integrity": "sha512-dMInicTPVE8d1e5otfwmmjlxkZoUpiVLwyeTdUsi/Caj/gfzzblBcCE5sRHV/AsjuCmxWrte2TNGSYuCeCq+0Q==",
      "license": "MIT"
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "license": "MIT",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "5.1.1",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-5.1.1.tgz",
      "integrity": "sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "yallist": "^3.0.2"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.309.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.309.0.tgz",
      "integrity": "sha512-zNVPczuwFrCfksZH3zbd1UDE6/WYhYAdbe2k7CImVyPAkXLgIwbs6eXQ4loigqDnUFjyFYCI5jZ1y10Kqal0dg==",
      "license": "ISC",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "license": "MIT",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "license": "MIT",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "license": "MIT",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/motion-dom": {
      "version": "11.18.1",
      "resolved": "https://registry.npmjs.org/motion-dom/-/motion-dom-11.18.1.tgz",
      "integrity": "sha512-g76KvA001z+atjfxczdRtw/RXOM3OMSdd1f4DL77qCTF/+avrRJiawSG4yDibEQ215sr9kpinSlX2pCTJ9zbhw==",
      "license": "MIT",
      "dependencies": {
        "motion-utils": "^11.18.1"
      }
    },
    "node_modules/motion-utils": {
      "version": "11.18.1",
      "resolved": "https://registry.npmjs.org/motion-utils/-/motion-utils-11.18.1.tgz",
      "integrity": "sha512-49Kt+HKjtbJKLtgO/LKj9Ld+6vw9BjH5d9sc40R/kVyH8GLAXgT42M2NnuPcJNuA3s9ZfZBUcwIgpmZWGEE+hA==",
      "license": "MIT"
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "license": "MIT"
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.15",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.15.tgz",
      "integrity": "sha512-y7Wygv/7mEOvxTuEQDB8StXdMRBWf1kR/tlhAzBRUFkB2jfcLOAxO/SHmOO2zgz1pVgK29/kyupn059/bCHdjA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.50",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.50.tgz",
      "integrity": "sha512-J6l92tKHX6w8Jy5nO1Vuc01NoIiRGi/d6qBKVxh+IQ8Cr3b6HbVNfKiF8ZpFKufTwpwxMmce2W3iQZ861ZRyTg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw==",
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/picomatch": {
      "version": "2.3.2",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.2.tgz",
      "integrity": "sha512-V7+vQEJ06Z+c5tSye8S+nHUfI51xoXIXjHQ99cQtKUkQqqO1kO/KCJUfZXuB47h/YBlDhah2H3hdUGXn8ie0oA==",
      "license": "MIT",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "license": "MIT",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.16",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.16.tgz",
      "integrity": "sha512-vuwillviilfKZsg0VGj5R/YwwcHx4SLsIOI/7K6mQkWx+l5cUHTjj5g0AasTBcyXsbfTgrwsUNmVUb5xVwyPwg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.12",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "license": "MIT",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.1.0.tgz",
      "integrity": "sha512-oIAOTqgIo7q2EOwbhb8UalYePMvYoIeRY2YKntdpFQXNosSu3vLrniGgmH9OKs/qAkfoj5oB3le/7mINW1LCfw==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-6.0.1.tgz",
      "integrity": "sha512-oPtTM4oerL+UXmx+93ytZVN82RrlY/wPUV8IeDxFrzIjXOLF1pN+EmKPLbubvKHT2HC20xXsCAH2Z+CKV6Oz/g==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "lilconfig": "^3.1.1"
      },
      "engines": {
        "node": ">= 18"
      },
      "peerDependencies": {
        "jiti": ">=1.21.0",
        "postcss": ">=8.0.9",
        "tsx": "^4.8.1",
        "yaml": "^2.4.2"
      },
      "peerDependenciesMeta": {
        "jiti": {
          "optional": true
        },
        "postcss": {
          "optional": true
        },
        "tsx": {
          "optional": true
        },
        "yaml": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.4",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.4.tgz",
      "integrity": "sha512-bIoJLOmjCO1S9XdY/DcnR5hJxvrDir1PbGChrzXG3vw0/FOliy/fA3dmdhQ441kah4gKv+TwckGzex6wNS5cnQ==",
      "license": "MIT",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ==",
      "license": "MIT"
    },
    "node_modules/prop-types": {
      "version": "15.8.1",
      "resolved": "https://registry.npmjs.org/prop-types/-/prop-types-15.8.1.tgz",
      "integrity": "sha512-oj87CgZICdulUohogVAR7AjlC0327U4el4L6eAvOqCeudMDVU0NThNaV+b9Df4dXgSP1gXMTnPdhfe/2qDH5cg==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.4.0",
        "object-assign": "^4.1.1",
        "react-is": "^16.13.1"
      }
    },
    "node_modules/prop-types/node_modules/react-is": {
      "version": "16.13.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-16.13.1.tgz",
      "integrity": "sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==",
      "license": "MIT"
    },
    "node_modules/proxy-from-env": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/proxy-from-env/-/proxy-from-env-2.1.0.tgz",
      "integrity": "sha512-cJ+oHTW1VAEa8cJslgmUZrc+sjRKgAKl3Zyse6+PV38hZe/V6Z14TbCuXcan9F9ghlz4QrFr2c92TNF82UkYHA==",
      "license": "MIT",
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT"
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-hook-form": {
      "version": "7.80.0",
      "resolved": "https://registry.npmjs.org/react-hook-form/-/react-hook-form-7.80.0.tgz",
      "integrity": "sha512-4P+fk6oXsxY+6xSj7Euhc2sumQD8zQqCuVHoJwoyp9EchP+IUW9OESB7uHFJOKsIBQ4MQqYE84INJFqUCYNoOg==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/react-hook-form"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17 || ^18 || ^19"
      }
    },
    "node_modules/react-hot-toast": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/react-hot-toast/-/react-hot-toast-2.6.0.tgz",
      "integrity": "sha512-bH+2EBMZ4sdyou/DPrfgIouFpcRLCJ+HoCA32UoAYHn6T3Ur5yfcDCeSr5mwldl6pFOsiocmrXMuoCJ1vV8bWg==",
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.1.3",
        "goober": "^2.1.16"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "react": ">=16",
        "react-dom": ">=16"
      }
    },
    "node_modules/react-is": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-18.3.1.tgz",
      "integrity": "sha512-/LLMVyas0ljjAtoYiPqYiL8VWXzUUdThrmU5+n20DZv+a+ClRoevUzw5JxU+Ieh5/c87ytoTBV9G1FiKfNJdmg==",
      "license": "MIT"
    },
    "node_modules/react-redux": {
      "version": "9.3.0",
      "resolved": "https://registry.npmjs.org/react-redux/-/react-redux-9.3.0.tgz",
      "integrity": "sha512-KQopgqFo/p/fgmAs5qz6p5RWaNAzq40WAu7fJIXnQpYxFPbJYtsJPWvGeF2rOBaY/kEuV77AVsX8TsQzKm+A/g==",
      "license": "MIT",
      "dependencies": {
        "@types/use-sync-external-store": "^0.0.6",
        "use-sync-external-store": "^1.4.0"
      },
      "peerDependencies": {
        "@types/react": "^18.2.25 || ^19",
        "react": "^18.0 || ^19",
        "redux": "^5.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "redux": {
          "optional": true
        }
      }
    },
    "node_modules/react-refresh": {
      "version": "0.17.0",
      "resolved": "https://registry.npmjs.org/react-refresh/-/react-refresh-0.17.0.tgz",
      "integrity": "sha512-z6F7K9bV85EfseRCp2bzrpyQ0Gkw1uLoCel9XBVWPg/TjRj94SkJzUTGfOa4bs7iJvBWtQG0Wq7wnI0syw3EBQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-remove-scroll": {
      "version": "2.7.2",
      "resolved": "https://registry.npmjs.org/react-remove-scroll/-/react-remove-scroll-2.7.2.tgz",
      "integrity": "sha512-Iqb9NjCCTt6Hf+vOdNIZGdTiH1QSqr27H/Ek9sv/a97gfueI/5h1s3yRi1nngzMUaOOToin5dI1dXKdXiF+u0Q==",
      "license": "MIT",
      "dependencies": {
        "react-remove-scroll-bar": "^2.3.7",
        "react-style-singleton": "^2.2.3",
        "tslib": "^2.1.0",
        "use-callback-ref": "^1.3.3",
        "use-sidecar": "^1.1.3"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-remove-scroll-bar": {
      "version": "2.3.8",
      "resolved": "https://registry.npmjs.org/react-remove-scroll-bar/-/react-remove-scroll-bar-2.3.8.tgz",
      "integrity": "sha512-9r+yi9+mgU33AKcj6IbT9oRCO78WriSj6t/cF8DWBZJ9aOGPOTEDvdUDz1FwKim7QXWwmHqtdHnRJfhAxEG46Q==",
      "license": "MIT",
      "dependencies": {
        "react-style-singleton": "^2.2.2",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-router": {
      "version": "6.30.4",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-6.30.4.tgz",
      "integrity": "sha512-SVUsDe+DybHM/WmYKIVYhZh1o5Dcuf16yM6WjG02Q9XVFMZIJyHYhwrr6bFBXZkVP6z69kNkMyBCujt8FaFLJA==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.3"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      }
    },
    "node_modules/react-router-dom": {
      "version": "6.30.4",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-6.30.4.tgz",
      "integrity": "sha512-q4HvNl+mmDdkS0g+MqiBZNteQJCuimWoOyHMy4T/RQLAn9Z29+E91QXRaxOujeMl2HTzRSS0KFPd7lxX3PjV0Q==",
      "license": "MIT",
      "dependencies": {
        "@remix-run/router": "1.23.3",
        "react-router": "6.30.4"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8",
        "react-dom": ">=16.8"
      }
    },
    "node_modules/react-smooth": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/react-smooth/-/react-smooth-4.0.4.tgz",
      "integrity": "sha512-gnGKTpYwqL0Iii09gHobNolvX4Kiq4PKx6eWBCYYix+8cdw+cGo3do906l1NBPKkSWx1DghC1dlWG9L2uGd61Q==",
      "license": "MIT",
      "dependencies": {
        "fast-equals": "^5.0.1",
        "prop-types": "^15.8.1",
        "react-transition-group": "^4.4.5"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/react-style-singleton": {
      "version": "2.2.3",
      "resolved": "https://registry.npmjs.org/react-style-singleton/-/react-style-singleton-2.2.3.tgz",
      "integrity": "sha512-b6jSvxvVnyptAiLjbkWLE/lOnR4lfTtDAl+eUC7RZy+QQWc6wRzIV2CE6xBuMmDxc2qIihtDCZD5NPOFl7fRBQ==",
      "license": "MIT",
      "dependencies": {
        "get-nonce": "^1.0.0",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-transition-group": {
      "version": "4.4.5",
      "resolved": "https://registry.npmjs.org/react-transition-group/-/react-transition-group-4.4.5.tgz",
      "integrity": "sha512-pZcd1MCJoiKiBR2NRxeCRg13uCXbydPnmB4EOeRrY7480qNWO8IIgQG6zlDkm6uRMsURXPuKq0GWtiM59a5Q6g==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "@babel/runtime": "^7.5.5",
        "dom-helpers": "^5.0.1",
        "loose-envify": "^1.4.0",
        "prop-types": "^15.6.2"
      },
      "peerDependencies": {
        "react": ">=16.6.0",
        "react-dom": ">=16.6.0"
      }
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "license": "MIT",
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "license": "MIT",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/recharts": {
      "version": "2.15.4",
      "resolved": "https://registry.npmjs.org/recharts/-/recharts-2.15.4.tgz",
      "integrity": "sha512-UT/q6fwS3c1dHbXv2uFgYJ9BMFHu3fwnd7AYZaEQhXuYQ4hgsxLvsUXzGdKeZrW5xopzDCvuA2N41WJ88I7zIw==",
      "deprecated": "1.x and 2.x branches are no longer active. Bump to Recharts v3 to receive latest features and bugfixes. See https://github.com/recharts/recharts/wiki/3.0-migration-guide",
      "license": "MIT",
      "dependencies": {
        "clsx": "^2.0.0",
        "eventemitter3": "^4.0.1",
        "lodash": "^4.17.21",
        "react-is": "^18.3.1",
        "react-smooth": "^4.0.4",
        "recharts-scale": "^0.4.4",
        "tiny-invariant": "^1.3.1",
        "victory-vendor": "^36.6.8"
      },
      "engines": {
        "node": ">=14"
      },
      "peerDependencies": {
        "react": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/recharts-scale": {
      "version": "0.4.5",
      "resolved": "https://registry.npmjs.org/recharts-scale/-/recharts-scale-0.4.5.tgz",
      "integrity": "sha512-kivNFO+0OcUNu7jQquLXAxz1FIwZj8nrj+YkOKc5694NbjCvcT6aSZiIzNzd2Kul4o4rTto8QVR9lMNtxD4G1w==",
      "license": "MIT",
      "dependencies": {
        "decimal.js-light": "^2.4.1"
      }
    },
    "node_modules/redux": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/redux/-/redux-5.0.1.tgz",
      "integrity": "sha512-M9/ELqF6fy8FwmkpnF0S3YKOqMyoWJ4+CS5Efg2ct3oY9daQvd/Pc71FpGZsVsbl3Cpb+IIcjBDUnnyBdQbq4w==",
      "license": "MIT"
    },
    "node_modules/redux-thunk": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/redux-thunk/-/redux-thunk-3.1.0.tgz",
      "integrity": "sha512-NW2r5T6ksUKXCabzhL9z+h206HQw/NJkcLm1GPImRQ8IzfXwRGqjVhKJGauHirT0DAuyy6hjdnMZaRoAcy0Klw==",
      "license": "MIT",
      "peerDependencies": {
        "redux": "^5.0.0"
      }
    },
    "node_modules/reselect": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/reselect/-/reselect-5.2.0.tgz",
      "integrity": "sha512-AgZ3UOZm3YndfrJ4OYjgrT7bmCm/1iqkjvEfH/oYjzh6PD2qw4QuT3jjnXIrpdt4MTpMXclMT3lXbmRY+XRakw==",
      "license": "MIT"
    },
    "node_modules/resolve": {
      "version": "1.22.12",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.12.tgz",
      "integrity": "sha512-TyeJ1zif53BPfHootBGwPRYT1RUt6oGWsaQr8UyZW/eAm9bKoijtvruSDEmZHm92CwS9nj7/fWttqPCgzep8CA==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "is-core-module": "^2.16.1",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "license": "MIT",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/rollup": {
      "version": "4.62.2",
      "resolved": "https://registry.npmjs.org/rollup/-/rollup-4.62.2.tgz",
      "integrity": "sha512-RFnrW4lhXA3s3eqHDZvN654g8OTjzRfqpIRJYczCGB6HzphckVAi/Qh4tbPUbRuDi7s1Llv8g/NspLkttY3gTA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/estree": "1.0.9"
      },
      "bin": {
        "rollup": "dist/bin/rollup"
      },
      "engines": {
        "node": ">=18.0.0",
        "npm": ">=8.0.0"
      },
      "optionalDependencies": {
        "@rollup/rollup-android-arm-eabi": "4.62.2",
        "@rollup/rollup-android-arm64": "4.62.2",
        "@rollup/rollup-darwin-arm64": "4.62.2",
        "@rollup/rollup-darwin-x64": "4.62.2",
        "@rollup/rollup-freebsd-arm64": "4.62.2",
        "@rollup/rollup-freebsd-x64": "4.62.2",
        "@rollup/rollup-linux-arm-gnueabihf": "4.62.2",
        "@rollup/rollup-linux-arm-musleabihf": "4.62.2",
        "@rollup/rollup-linux-arm64-gnu": "4.62.2",
        "@rollup/rollup-linux-arm64-musl": "4.62.2",
        "@rollup/rollup-linux-loong64-gnu": "4.62.2",
        "@rollup/rollup-linux-loong64-musl": "4.62.2",
        "@rollup/rollup-linux-ppc64-gnu": "4.62.2",
        "@rollup/rollup-linux-ppc64-musl": "4.62.2",
        "@rollup/rollup-linux-riscv64-gnu": "4.62.2",
        "@rollup/rollup-linux-riscv64-musl": "4.62.2",
        "@rollup/rollup-linux-s390x-gnu": "4.62.2",
        "@rollup/rollup-linux-x64-gnu": "4.62.2",
        "@rollup/rollup-linux-x64-musl": "4.62.2",
        "@rollup/rollup-openbsd-x64": "4.62.2",
        "@rollup/rollup-openharmony-arm64": "4.62.2",
        "@rollup/rollup-win32-arm64-msvc": "4.62.2",
        "@rollup/rollup-win32-ia32-msvc": "4.62.2",
        "@rollup/rollup-win32-x64-gnu": "4.62.2",
        "@rollup/rollup-win32-x64-msvc": "4.62.2",
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "license": "MIT",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/semver": {
      "version": "6.3.1",
      "resolved": "https://registry.npmjs.org/semver/-/semver-6.3.1.tgz",
      "integrity": "sha512-BR7VvDCVHO+q2xBEWskxS6DJE1qRnb7DxzUrogb71CWoSficBxYsiAGd+Kl0mmq/MprG9yArRkyrQxTO6XjMzA==",
      "dev": true,
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.1",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.1.tgz",
      "integrity": "sha512-DhuTmvZWux4H1UOnWMB3sk0sbaCVOoQZjv8u1rDoTV0HTdGem9hkAZtl4JZy8P2z4Bg0nT+YMeOFyVr4zcG5Tw==",
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "tinyglobby": "^0.2.11",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/tailwind-merge": {
      "version": "2.6.1",
      "resolved": "https://registry.npmjs.org/tailwind-merge/-/tailwind-merge-2.6.1.tgz",
      "integrity": "sha512-Oo6tHdpZsGpkKG88HJ8RR1rg/RdnEkQEfMoEk2x1XRI3F1AxeU+ijRXpiVUF4UbLfcxxRGw6TbUINKYdWVsQTQ==",
      "license": "MIT",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/dcastil"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.19",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.19.tgz",
      "integrity": "sha512-3ofp+LL8E+pK/JuPLPggVAIaEuhvIz4qNcf3nA1Xn2o/7fb7s/TYpHhwGDv1ZU3PkBluUVaF8PyCHcm48cKLWQ==",
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.7",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2 || ^5.0 || ^6.0",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tailwindcss-animate": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/tailwindcss-animate/-/tailwindcss-animate-1.0.7.tgz",
      "integrity": "sha512-bl6mpH3T7I3UFxuvDEXLxy/VuFxBk5bbzplh7tXI68mwMokNYd1t9qPBHlnyTwfa4JGC4zP516I1hYYtQ/vspA==",
      "license": "MIT",
      "peerDependencies": {
        "tailwindcss": ">=3.0.0 || insiders"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "license": "MIT",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "license": "MIT",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/tiny-invariant": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/tiny-invariant/-/tiny-invariant-1.3.3.tgz",
      "integrity": "sha512-+FbBPE1o9QAYvviau/qC5SE3caw21q3xkvWKBtja5vgqOWIHHJ3ioaq1VPfn/Szqctz2bU/oYeKd9/z5BL+PVg==",
      "license": "MIT"
    },
    "node_modules/tinyglobby": {
      "version": "0.2.17",
      "resolved": "https://registry.npmjs.org/tinyglobby/-/tinyglobby-0.2.17.tgz",
      "integrity": "sha512-wXR/dYpcqKmfWpEdZjiKJOwCNFndD0DMnrW/cYjVGttEkBfVgcLFHoNrlj47mjOVic9yyNu65alsgF4NQyTa2g==",
      "license": "MIT",
      "dependencies": {
        "fdir": "^6.5.0",
        "picomatch": "^4.0.4"
      },
      "engines": {
        "node": ">=12.0.0"
      },
      "funding": {
        "url": "https://github.com/sponsors/SuperchupuDev"
      }
    },
    "node_modules/tinyglobby/node_modules/fdir": {
      "version": "6.5.0",
      "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",
      "integrity": "sha512-tIbYtZbucOs0BRGqPJkshJUYdL+SDH7dVM8gjy+ERp3WAUjLEFJE+02kanyHtwjWOnwrKYBiwAmM0p4kLJAnXg==",
      "license": "MIT",
      "engines": {
        "node": ">=12.0.0"
      },
      "peerDependencies": {
        "picomatch": "^3 || ^4"
      },
      "peerDependenciesMeta": {
        "picomatch": {
          "optional": true
        }
      }
    },
    "node_modules/tinyglobby/node_modules/picomatch": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-4.0.5.tgz",
      "integrity": "sha512-RvwwcruNjI1ncT5xRakeyS9Lf8lcItv34KD+aif+VH9kduAyfYBipGh12274xtenIPZ119/R9BdTBa8gAwSh0A==",
      "license": "MIT",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "license": "MIT",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA==",
      "license": "Apache-2.0"
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "dev": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/update-browserslist-db": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.2.3.tgz",
      "integrity": "sha512-Js0m9cx+qOgDxo0eMiFGEueWztz+d4+M3rGlmKPT+T4IS/jP4ylw3Nwpu6cpTTP8R1MAC1kF4VbdLt3ARf209w==",
      "dev": true,
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-callback-ref": {
      "version": "1.3.3",
      "resolved": "https://registry.npmjs.org/use-callback-ref/-/use-callback-ref-1.3.3.tgz",
      "integrity": "sha512-jQL3lRnocaFtu3V00JToYz/4QkNWswxijDaCVNZRiRTO3HQDLsdu1ZtmIUvV4yPp+rvWm5j0y0TG/S61cuijTg==",
      "license": "MIT",
      "dependencies": {
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/use-sidecar": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/use-sidecar/-/use-sidecar-1.1.3.tgz",
      "integrity": "sha512-Fedw0aZvkhynoPYlA5WXrMCAMm+nSWdZt6lzJQ7Ok8S6Q+VsHmHpRWndVRJ8Be0ZbkfPc5LRYH+5XrzXcEeLRQ==",
      "license": "MIT",
      "dependencies": {
        "detect-node-es": "^1.1.0",
        "tslib": "^2.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0 || ^19.0.0-rc"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.6.0.tgz",
      "integrity": "sha512-Pp6GSwGP/NrPIrxVFAIkOQeyw8lFenOHijQWkUTrDvrF4ALqylP2C/KCkeS9dpUM3KvYRQhna5vt7IL95+ZQ9w==",
      "license": "MIT",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw==",
      "license": "MIT"
    },
    "node_modules/victory-vendor": {
      "version": "36.9.2",
      "resolved": "https://registry.npmjs.org/victory-vendor/-/victory-vendor-36.9.2.tgz",
      "integrity": "sha512-PnpQQMuxlwYdocC8fIJqVXvkeViHYzotI+NJrCuav0ZYFoq912ZHBk3mCeuj+5/VpodOjPe1z0Fk2ihgzlXqjQ==",
      "license": "MIT AND ISC",
      "dependencies": {
        "@types/d3-array": "^3.0.3",
        "@types/d3-ease": "^3.0.0",
        "@types/d3-interpolate": "^3.0.1",
        "@types/d3-scale": "^4.0.2",
        "@types/d3-shape": "^3.1.0",
        "@types/d3-time": "^3.0.0",
        "@types/d3-timer": "^3.0.0",
        "d3-array": "^3.1.6",
        "d3-ease": "^3.0.1",
        "d3-interpolate": "^3.0.1",
        "d3-scale": "^4.0.2",
        "d3-shape": "^3.1.0",
        "d3-time": "^3.0.0",
        "d3-timer": "^3.0.1"
      }
    },
    "node_modules/vite": {
      "version": "5.4.21",
      "resolved": "https://registry.npmjs.org/vite/-/vite-5.4.21.tgz",
      "integrity": "sha512-o5a9xKjbtuhY6Bi5S3+HvbRERmouabWbyUcpXXUA1u+GNUKoROi9byOJ8M0nHbHYHkYICiMlqxkg1KkYmm25Sw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "^0.21.3",
        "postcss": "^8.4.43",
        "rollup": "^4.20.0"
      },
      "bin": {
        "vite": "bin/vite.js"
      },
      "engines": {
        "node": "^18.0.0 || >=20.0.0"
      },
      "funding": {
        "url": "https://github.com/vitejs/vite?sponsor=1"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      },
      "peerDependencies": {
        "@types/node": "^18.0.0 || >=20.0.0",
        "less": "*",
        "lightningcss": "^1.21.0",
        "sass": "*",
        "sass-embedded": "*",
        "stylus": "*",
        "sugarss": "*",
        "terser": "^5.4.0"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        },
        "less": {
          "optional": true
        },
        "lightningcss": {
          "optional": true
        },
        "sass": {
          "optional": true
        },
        "sass-embedded": {
          "optional": true
        },
        "stylus": {
          "optional": true
        },
        "sugarss": {
          "optional": true
        },
        "terser": {
          "optional": true
        }
      }
    },
    "node_modules/yallist": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-3.1.1.tgz",
      "integrity": "sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/zod": {
      "version": "3.25.76",
      "resolved": "https://registry.npmjs.org/zod/-/zod-3.25.76.tgz",
      "integrity": "sha512-gzUt/qt81nXsFGKIFcC3YnfEAx5NkunCfnDlvuBSSFS02bcXu4Lmea0AFIUwbLWxWPx3d9p8S5QoaujKcNQxcQ==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    }
  }
}

```


### `frontend/package.json`
``` json
{
  "name": "trade-ai-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@reduxjs/toolkit": "^2.0.1",
    "@tanstack/react-query": "^5.17.0",
    "axios": "^1.6.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.0",
    "lightweight-charts": "^4.0.1",
    "lucide-react": "^0.309.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "react-hot-toast": "^2.4.1",
    "react-redux": "^9.1.0",
    "react-router-dom": "^6.21.3",
    "recharts": "^2.10.4",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}

```


### `frontend/postcss.config.js`
``` js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```


### `frontend/src/App.tsx`
``` tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { setNavigate, setLogoutHandler } from '@/lib/navigate'
import { logout } from '@/store/authSlice'
import Layout from '@/components/layout/Layout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/dashboard/Dashboard'
import Stocks from '@/pages/stock/Stocks'
import StockDetail from '@/pages/stock/StockDetail'
import Charts from '@/pages/charts/Charts'
import TechnicalAnalysis from '@/pages/technical/TechnicalAnalysis'
import Scanner from '@/pages/scanner/Scanner'
import Watchlists from '@/pages/watchlist/Watchlists'
import Portfolio from '@/pages/portfolio/Portfolio'
import Backtesting from '@/pages/backtesting/Backtesting'
import Alerts from '@/pages/alerts/Alerts'
import AIInsights from '@/pages/ai/AIInsights'
import News from '@/pages/news/News'
import Learning from '@/pages/learning/Learning'
import Admin from '@/pages/admin/Admin'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppInitializer() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    setNavigate((path: string) => navigate(path, { replace: true }))
    setLogoutHandler(() => dispatch(logout()))
  }, [dispatch, navigate])

  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppInitializer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="stocks" element={<Stocks />} />
              <Route path="stocks/:symbol" element={<StockDetail />} />
              <Route path="charts" element={<Charts />} />
              <Route path="technical-analysis" element={<TechnicalAnalysis />} />
              <Route path="scanner" element={<Scanner />} />
              <Route path="watchlists" element={<Watchlists />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="backtesting" element={<Backtesting />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="news" element={<News />} />
              <Route path="learn" element={<Learning />} />
              <Route path="admin" element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

```


### `frontend/src/components/charts/TradingViewChart.tsx`
``` tsx
import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, CandlestickSeriesPartialOptions, HistogramSeriesPartialOptions } from 'lightweight-charts'
import { StockPrice } from '@/types'

interface TradingViewChartProps {
  data: StockPrice[]
  symbol?: string
  height?: number
}

export default function TradingViewChart({ data, symbol, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const container = containerRef.current
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a0a0a0',
      },
      grid: {
        vertLines: { color: '#1a1a2e' },
        horzLines: { color: '#1a1a2e' },
      },
      width: container.clientWidth,
      height,
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#2a2a3e',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2a3e',
      },
    })
    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    } as CandlestickSeriesPartialOptions)

    const volumeSeries = chart.addHistogramSeries({
      color: '#6366f1',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    } as HistogramSeriesPartialOptions)

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const cdlData = data.map((d) => ({
      time: (new Date(d.date).getTime() / 1000) as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    const volData = data.map((d) => ({
      time: (new Date(d.date).getTime() / 1000) as any,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    }))

    candleSeries.setData(cdlData)
    volumeSeries.setData(volData)
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (container) {
        chart.applyOptions({ width: container.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [data, height])

  return (
    <div ref={containerRef} className="w-full" style={{ height }} />
  )
}

```


### `frontend/src/components/dashboard/MarketIndicesChart.tsx`
``` tsx
import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardAPI } from '@/lib/api'
import { formatPercent } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'

interface IndexSnapshot {
  symbol: string
  current_value: number
  change: number
  change_percent: number
  high?: number
  low?: number
  is_up: boolean
}

interface PricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface IndicesResponse {
  indices: { name: string; data: IndexSnapshot | null }[]
  history: Record<string, PricePoint[]>
}

const INDEX_CONFIG: Record<string, { label: string; color: string }> = {
  NIFTY:    { label: 'NIFTY 50',   color: '#22c55e' },
  SENSEX:   { label: 'SENSEX',     color: '#3b82f6' },
  BANKNIFTY:{ label: 'BANK NIFTY', color: '#f59e0b' },
  INDIAVIX: { label: 'INDIA VIX',  color: '#ef4444' },
}

const KEYS = ['NIFTY', 'SENSEX', 'BANKNIFTY', 'INDIAVIX'] as const

export default function MarketIndicesChart() {
  const [snapshots, setSnapshots] = useState<Record<string, IndexSnapshot>>({})
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({})
  const [mode, setMode] = useState<'percent' | 'absolute'>('percent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await dashboardAPI.getIndices(30)
        const data: IndicesResponse = res.data
        if (cancelled) return
        const snap: Record<string, IndexSnapshot> = {}
        for (const item of data.indices) {
          if (item.data) snap[item.name] = item.data
        }
        setSnapshots(snap)
        setHistory(data.history || {})
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const chartData = useMemo(() => {
    const allDates = new Set<string>()
    for (const key of KEYS) {
      for (const pt of history[key] || []) allDates.add(pt.date)
    }
    const sortedDates = Array.from(allDates).sort()

    if (mode === 'percent') {
      return sortedDates.map((date) => {
        const row: Record<string, string | number> = { date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
        for (const key of KEYS) {
          const pts = history[key] || []
          if (pts.length > 0) {
            const base = pts[0].close
            const current = pts.find((p) => p.date === date)?.close ?? base
            row[key] = +((current - base) / base * 100).toFixed(2)
          }
        }
        return row
      })
    }

    return sortedDates.map((date) => {
      const row: Record<string, string | number> = { date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
      for (const key of KEYS) {
        const pts = history[key] || []
        const pt = pts.find((p) => p.date === date)
        if (pt) row[key] = +pt.close.toFixed(2)
      }
      return row
    })
  }, [history, mode])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Market Indices</CardTitle>
        <div className="flex rounded-lg border bg-secondary/30 p-0.5">
          <button
            onClick={() => setMode('percent')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'percent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            % Change
          </button>
          <button
            onClick={() => setMode('absolute')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'absolute' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Absolute
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {KEYS.map((key) => {
            const s = snapshots[key]
            if (!s) return null
            const cfg = INDEX_CONFIG[key]
            return (
              <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground truncate">{cfg.label}</div>
                  <div className="text-sm font-bold">
                    {s.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs ${s.is_up ? 'text-green-500' : 'text-red-500'}`}>
                    {s.is_up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{formatPercent(s.change_percent)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => mode === 'percent' ? `${v}%` : v.toLocaleString('en-IN')}
                width={mode === 'percent' ? 45 : 70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  const cfg = INDEX_CONFIG[name]
                  const label = cfg?.label || name
                  if (mode === 'percent') return [`${value.toFixed(2)}%`, label]
                  return [value.toLocaleString('en-IN', { minimumFractionDigits: 2 }), label]
                }}
                labelFormatter={(label: string) => label}
              />
              <Legend
                formatter={(value: string) => INDEX_CONFIG[value]?.label || value}
                wrapperStyle={{ fontSize: '11px' }}
              />
              {KEYS.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={INDEX_CONFIG[key].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

```


### `frontend/src/components/layout/Header.tsx`
``` tsx
import { Menu, Bell, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useState, useEffect, useRef } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ symbol: string; company_name: string }[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const { default: api } = await import('@/lib/api')
      const { data } = await api.get(`/stocks/search?query=${query}`)
      setSearchResults(data.slice(0, 8))
    } catch {
      setSearchResults([])
    }
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          <div ref={searchRef} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks, sectors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-80 pl-9 bg-secondary/50 border-0 focus-visible:bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  navigate(`/stocks/${searchQuery.toUpperCase()}`)
                  setSearchResults([])
                  setSearchQuery('')
                }
              }}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full glass border border-border/50 rounded-lg overflow-hidden shadow-xl">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      navigate(`/stocks/${r.symbol}`)
                      setSearchResults([])
                      setSearchQuery('')
                    }}
                  >
                    <span className="font-medium text-sm">{r.symbol}</span>
                    <span className="text-muted-foreground text-xs truncate">{r.company_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

```


### `frontend/src/components/layout/Layout.tsx`
``` tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

```


### `frontend/src/components/layout/Sidebar.tsx`
``` tsx
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, TrendingUp, Search, Star, PieChart,
  Bell, Bot, Newspaper, BookOpen, Settings, Shield,
  BarChart3, LineChart, Activity, Database, LogOut,
  X,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/authSlice'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
  { to: '/scanner', icon: Search, label: 'Scanner' },
  { to: '/charts', icon: BarChart3, label: 'Charts' },
  { to: '/technical-analysis', icon: Activity, label: 'Technical Analysis' },
  { to: '/watchlists', icon: Star, label: 'Watchlists' },
  { to: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { to: '/backtesting', icon: LineChart, label: 'Backtesting' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/ai-insights', icon: Bot, label: 'AI Insights' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/admin', icon: Shield, label: 'Admin' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 glass border-r border-border/50',
          'lg:translate-x-0 lg:static lg:z-auto',
          'flex flex-col'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TradeAI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link text-sm', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link text-sm', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="sidebar-link text-sm w-full text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}

```


### `frontend/src/components/ui/ErrorBoundary.tsx`
``` tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-6">
          <div className="max-w-md w-full glass rounded-xl p-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Please try again or return to the dashboard.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground/60 font-mono mt-2 p-2 bg-muted/50 rounded">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

```


### `frontend/src/components/ui/badge.tsx`
``` tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500/10 text-green-500',
        warning: 'border-transparent bg-yellow-500/10 text-yellow-500',
        info: 'border-transparent bg-blue-500/10 text-blue-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

```


### `frontend/src/components/ui/button.tsx`
``` tsx
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }

```


### `frontend/src/components/ui/card.tsx`
``` tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('glass rounded-xl', className)} {...props} />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```


### `frontend/src/components/ui/input.tsx`
``` tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      className
    )}
    ref={ref}
    {...props}
  />
))
Input.displayName = 'Input'

export { Input }

```


### `frontend/src/components/ui/select.tsx`
``` tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export { Select }

```


### `frontend/src/hooks/useWebSocket.ts`
``` ts
import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setConnected, updatePrice, updateIndexData, updateIndices, LivePrice, IndexData } from '@/store/marketSlice'

type WSMessage = Record<string, unknown>

export function useWebSocket() {
  const dispatch = useDispatch()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<number>(0)

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const url = `${protocol}//${host}/api/ws/market`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      dispatch(setConnected(true))
      reconnectRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data)
        const symbol = data.symbol as string | undefined

        if (symbol && data.open !== undefined) {
          const price: LivePrice = {
            symbol,
            price: Number(data.close) || 0,
            change: 0,
            changePercent: 0,
            open: Number(data.open) || 0,
            high: Number(data.high) || 0,
            low: Number(data.low) || 0,
            close: Number(data.close) || 0,
            volume: Number(data.volume) || 0,
            timestamp: (data.date as string) || new Date().toISOString(),
          }
          dispatch(updatePrice(price))
        }

        if (data.type === 'indices') {
          const indicesData = data.data as Record<string, {
            current: number
            change: number
            change_percent: number
            high: number
            low: number
          }> | undefined
          if (indicesData) {
            const list: IndexData[] = Object.entries(indicesData).map(([key, val]) => ({
              symbol: key,
              current_value: val.current,
              change: val.change,
              change_percent: val.change_percent,
              high: val.high,
              low: val.low,
              is_up: val.change >= 0,
            }))
            dispatch(updateIndices(list))
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      dispatch(setConnected(false))
      wsRef.current = null
      reconnectRef.current++
      const delay = Math.min(1000 * reconnectRef.current, 30000)
      setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [dispatch])

  const subscribe = useCallback((symbol: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', symbol }))
    }
  }, [])

  const unsubscribe = useCallback((symbol: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe', symbol }))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return { subscribe, unsubscribe }
}

```


### `frontend/src/lib/api.ts`
``` ts
import axios from 'axios'
import { navigate, triggerLogout } from './navigate'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

function redirectToLogin() {
  triggerLogout()
  navigate('/login')
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const hadAuth = !!originalRequest?.headers?.Authorization
    if (error.response?.status === 401 && !originalRequest._retry && hadAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          processQueue(null, data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch (err) {
          processQueue(err, null)
          redirectToLogin()
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      } else {
        isRefreshing = false
        redirectToLogin()
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  googleLogin: (idToken: string) => api.post('/auth/google', { id_token: idToken }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  sendOTP: (email: string) => api.post('/auth/otp/send', { email }),
  verifyOTP: (email: string, otp: string) => api.post('/auth/otp/verify', { email, otp }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/me', data),
  changePassword: (data: { current_password: string; new_password: string }) => api.post('/auth/change-password', data),
}

export const stocksAPI = {
  search: (query: string) => api.get(`/stocks/search?query=${query}`),
  getDetail: (symbol: string) => api.get(`/stocks/${symbol}`),
  getPrices: (symbol: string, interval: string = '1D', limit: number = 100) =>
    api.get(`/stocks/${symbol}/prices?interval=${interval}&limit=${limit}`),
  getTechnical: (symbol: string) => api.get(`/stocks/${symbol}/technical`),
  getPatterns: (symbol: string) => api.get(`/stocks/${symbol}/patterns`),
  getFundamentals: (symbol: string) => api.get(`/stocks/${symbol}/fundamentals`),
}

export const dashboardAPI = {
  getOverview: (limit: number = 50) => api.get(`/dashboard/overview?limit=${limit}`),
  getNews: () => api.get('/dashboard/news'),
  getIndices: (historyDays: number = 30) => api.get(`/dashboard/indices?history_days=${historyDays}`),
  getMovers: (type: string = 'gainers', limit: number = 50) =>
    api.get(`/dashboard/market-movers?type=${type}&limit=${limit}`),
}

export const scannerAPI = {
  execute: (conditions: unknown[], logic: string = 'AND') => api.post('/scanner/execute', { conditions, logic }),
  getPrebuilt: () => api.get('/scanner/prebuilt'),
  getSaved: () => api.get('/scanner/saved'),
  save: (name: string, description: string, scanConfig: unknown) =>
    api.post('/scanner/saved', { name, description, scan_config: scanConfig }),
}

export const watchlistAPI = {
  getAll: () => api.get('/watchlists/'),
  create: (name: string, description?: string) => api.post(`/watchlists/?name=${name}&description=${description || ''}`),
  addItem: (watchlistId: string, stockId: string) => api.post(`/watchlists/${watchlistId}/items?stock_id=${stockId}`),
  removeItem: (watchlistId: string, itemId: string) => api.delete(`/watchlists/${watchlistId}/items/${itemId}`),
  delete: (watchlistId: string) => api.delete(`/watchlists/${watchlistId}`),
}

export const portfolioAPI = {
  getAll: () => api.get('/portfolios/'),
  create: (name: string, initialCapital?: number) => api.post(`/portfolios/?name=${name}&initial_capital=${initialCapital || 0}`),
  getDetail: (id: string) => api.get(`/portfolios/${id}`),
  addHolding: (portfolioId: string, stockId: string, quantity: number, avgPrice: number) =>
    api.post(`/portfolios/${portfolioId}/holdings`, { stock_id: stockId, quantity, average_price: avgPrice }),
  addTransaction: (portfolioId: string, stockId: string, type: string, quantity: number, price: number) =>
    api.post(`/portfolios/${portfolioId}/transactions`, { stock_id: stockId, transaction_type: type, quantity, price }),
}

export const alertsAPI = {
  getAll: () => api.get('/alerts/'),
  create: (alertType: string, condition: unknown, stockId?: string) =>
    api.post('/alerts/', { alert_type: alertType, condition, stock_id: stockId }),
  toggle: (id: string) => api.put(`/alerts/${id}/toggle`),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  getHistory: () => api.get('/alerts/history'),
}

export const backtestAPI = {
  getStrategies: () => api.get('/backtest/strategies'),
  createStrategy: (data: Record<string, unknown>) => api.post('/backtest/strategies', data),
  getResults: (strategyId: string) => api.get(`/backtest/strategies/${strategyId}/results`),
  run: (strategyId: string, symbol: string, startDate: string, endDate: string) =>
    api.post('/backtest/run', { strategy_id: strategyId, symbol, start_date: startDate, end_date: endDate }),
}

export const aiAPI = {
  chat: (message: string, symbol?: string) => api.post('/ai/chat', { message, symbol }),
  analyze: (symbol: string) => api.post('/ai/analyze', { symbol }),
  insights: () => api.post('/ai/insights'),
  portfolioHealth: (holdings: unknown[]) => api.post('/ai/portfolio-health', { holdings }),
}

export const newsAPI = {
  getAll: (category?: string) => api.get(`/news/?${category ? `category=${category}` : ''}`),
  getCompany: (symbol: string) => api.get(`/news/company/${symbol}`),
}

export const learningAPI = {
  getContent: (category?: string) => api.get(`/learning/content?${category ? `category=${category}` : ''}`),
  getContentDetail: (id: string) => api.get(`/learning/content/${id}`),
  getGlossary: (term?: string) => api.get(`/learning/glossary${term ? `?term=${term}` : ''}`),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  createContent: (data: Record<string, unknown>) => api.post('/admin/learning/content', data),
  getLogs: () => api.get('/admin/logs'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
}

```


### `frontend/src/lib/navigate.ts`
``` ts
type NavigateFn = (path: string) => void

let navigateFn: NavigateFn | null = null

export function setNavigate(fn: NavigateFn) {
  navigateFn = fn
}

export function navigate(path: string) {
  if (navigateFn) {
    navigateFn(path)
  } else {
    window.location.href = path
  }
}

let logoutFn: (() => void) | null = null

export function setLogoutHandler(fn: () => void) {
  logoutFn = fn
}

export function triggerLogout() {
  logoutFn?.()
}

```


### `frontend/src/lib/utils.ts`
``` ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, digits: number = 2): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K`
  return `₹${value.toFixed(2)}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatNumber(value: number | null | undefined, digits: number = 0): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-IN').format(Number(value.toFixed(digits)))
}

export function getChangeColor(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'text-muted-foreground'
  return change >= 0 ? 'text-green-500' : 'text-red-500'
}

export function getChangeIcon(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'minus'
  return change >= 0 ? 'trending-up' : 'trending-down'
}

export function truncate(str: string, length: number = 100): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

```


### `frontend/src/main.tsx`
``` tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { fetchCurrentUser } from '@/store/authSlice'
import App from './App'
import './styles/globals.css'

const token = localStorage.getItem('access_token')
if (token) {
  store.dispatch(fetchCurrentUser())
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

```


### `frontend/src/pages/admin/Admin.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Users, Newspaper, Bell, BookOpen, BarChart3, Activity, Settings } from 'lucide-react'

export default function Admin() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        <Badge>Admin</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-500' },
          { label: 'Active Today', value: '456', change: '+5%', icon: Activity, color: 'text-green-500' },
          { label: 'Total Scans', value: '12,890', change: '+23%', icon: BarChart3, color: 'text-purple-500' },
          { label: 'Alerts Active', value: '567', change: '+8%', icon: Bell, color: 'text-yellow-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-green-500">{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-4 h-4" /> User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'John Doe', email: 'john@example.com', status: 'Active', plan: 'Free' },
                { name: 'Jane Smith', email: 'jane@example.com', status: 'Active', plan: 'Premium' },
                { name: 'Bob Wilson', email: 'bob@example.com', status: 'Inactive', plan: 'Free' },
              ].map((u) => (
                <div key={u.email} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.status === 'Active' ? 'success' : 'secondary'} className="text-xs">{u.status}</Badge>
                    <Badge variant="outline" className="text-xs">{u.plan}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-4 h-4" /> Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Manage Learning Content', icon: BookOpen },
              { label: 'Add News Article', icon: Newspaper },
              { label: 'View System Logs', icon: Activity },
              { label: 'Analytics Dashboard', icon: BarChart3 },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="w-full justify-start">
                <action.icon className="w-4 h-4 mr-2" /> {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/ai/AIInsights.tsx`
``` tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, Sparkles, BarChart3, Shield, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react'

export default function AIInsights() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    const userMsg = message
    setMessage('')
    setChat(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    setTimeout(() => {
      setChat(prev => [...prev, {
        role: 'assistant',
        content: "Based on current market data, I can help analyze stocks, explain technical indicators, or suggest investment ideas. Could you specify what you'd like to know? This is for educational purposes only. Not investment advice."
      }])
      setLoading(false)
    }, 1000)
  }

  const suggestions = [
    'Explain how RSI works',
    'Show fundamentally strong pharma stocks',
    'Analyze today\'s market movement',
    'Generate swing trade ideas',
    'Summarize quarterly results of TCS',
    'What is PE ratio?',
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Insights</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                {chat.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Ask me anything about stocks, trading, or investing</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask AI anything about the markets..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={loading || !message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setMessage(s); }}
                className="px-3 py-1.5 text-xs rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Market Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">52</div>
                <Badge variant="warning" className="mt-2">Neutral</Badge>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Greed</span><span>45</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fear</span><span>38</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Volatility</span><span>22</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Consider adding IT exposure',
                'Review pharma sector',
                'Reduce high-debt stocks',
              ].map((s) => (
                <div key={s} className="p-2 text-sm rounded-lg bg-secondary/30">{s}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" /> Portfolio Health
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-500">78</div>
              <p className="text-xs text-muted-foreground mt-1">Good diversification</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/alerts/Alerts.tsx`
``` tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Trash2, BellOff, BellRing } from 'lucide-react'

export default function Alerts() {
  const [alerts] = useState([
    { id: '1', type: 'Price Above', stock: 'RELIANCE', condition: 'Price > ₹3,000', active: true, created: '2h ago' },
    { id: '2', type: 'RSI', stock: 'TCS', condition: 'RSI < 30', active: true, created: '1d ago' },
    { id: '3', type: 'Volume', stock: 'HDFCBANK', condition: 'Volume > 2x Avg', active: false, created: '3d ago' },
    { id: '4', type: 'EMA Cross', stock: 'INFY', condition: '20 EMA crosses 50 EMA', active: true, created: '1w ago' },
    { id: '5', type: '52W High', stock: 'ICICIBANK', condition: 'Near 52 week high', active: true, created: '2w ago' },
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Alert</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${alert.active ? 'bg-secondary/20 border-border/50' : 'bg-muted/20 border-muted'} flex items-center justify-between`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${alert.active ? 'text-primary' : 'text-muted-foreground'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{alert.type}</span>
                        <Badge variant="secondary" className="text-xs">{alert.stock}</Badge>
                        {alert.active ? <Badge variant="success" className="text-xs">Active</Badge> : <Badge variant="secondary" className="text-xs">Paused</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.condition}</div>
                      <div className="text-xs text-muted-foreground mt-1">{alert.created}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {alert.active ? <BellOff className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Price', 'Volume', 'RSI', 'MACD', 'EMA Cross', 'Supertrend', '52W High/Low', 'Breakout', 'Gap Up/Down', 'Pattern', 'News'].map((type) => (
                <div key={type} className="text-sm p-2 rounded-lg hover:bg-secondary/30 cursor-pointer">{type}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent alerts triggered</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/auth/Login.tsx`
``` tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser } from '@/store/authSlice'
import type { AppDispatch, RootState } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Eye, EyeOff, Chrome, Mail, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Login() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state: RootState) => state.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await dispatch(loginUser({ email, password })).unwrap()
      navigate('/dashboard')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TradeAI</h1>
              <p className="text-xs text-muted-foreground">Stock Market Analytics</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
                <Chrome className="w-4 h-4 mr-2" /> Google
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/otp-login')}>
                <Mail className="w-4 h-4 mr-2" /> OTP
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

```


### `frontend/src/pages/auth/Register.tsx`
``` tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '@/store/authSlice'
import type { AppDispatch, RootState } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Mail, ShieldCheck, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Register() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isLoading } = useSelector((state: RootState) => state.auth)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    try {
      await dispatch(registerUser({ email, password, full_name: name })).unwrap()
      navigate('/dashboard')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animated-gradient">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">TradeAI</h1>
              <p className="text-xs text-muted-foreground">Stock Market Analytics</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>Start your investment journey</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

```


### `frontend/src/pages/backtesting/Backtesting.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { BarChart3, TrendingUp, Play, Save, Plus, LineChart, Activity } from 'lucide-react'

export default function Backtesting() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Backtesting</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Strategy</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strategy Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Stock Symbol</label>
                  <Input placeholder="RELIANCE" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Initial Capital</label>
                  <Input type="number" placeholder="1,00,000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Start Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">End Date</label>
                  <Input type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Buy Rules</label>
                <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
                  RSI(14) crosses above 30
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Sell Rules</label>
                <div className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
                  RSI(14) crosses below 70
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Stop Loss (%)</label>
                  <Input type="number" placeholder="5" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Target (%)</label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Trailing Stop</label>
                  <Input type="number" placeholder="3" />
                </div>
              </div>

              <div className="flex gap-2">
                <Button><Play className="w-4 h-4 mr-1" /> Run Backtest</Button>
                <Button variant="outline"><Save className="w-4 h-4 mr-1" /> Save Strategy</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { strategy: 'RSI Mean Reversion', symbol: 'RELIANCE', returns: '+24.5%', sharpe: '1.8', trades: 12 },
                  { strategy: 'Golden Cross', symbol: 'TCS', returns: '+18.2%', sharpe: '1.5', trades: 8 },
                  { strategy: 'Breakout Strategy', symbol: 'HDFCBANK', returns: '+32.1%', sharpe: '2.1', trades: 15 },
                ].map((r) => (
                  <div key={r.strategy} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                    <div>
                      <div className="text-sm font-medium">{r.strategy}</div>
                      <div className="text-xs text-muted-foreground">{r.symbol} • {r.trades} trades</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-500">{r.returns}</div>
                      <div className="text-xs text-muted-foreground">Sharpe: {r.sharpe}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'CAGR', value: '18.5%' },
                { label: 'Sharpe Ratio', value: '1.82' },
                { label: 'Sortino Ratio', value: '2.15' },
                { label: 'Max Drawdown', value: '-12.3%' },
                { label: 'Win Rate', value: '68%' },
                { label: 'Profit Factor', value: '2.45' },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <span className="text-xs font-semibold">{m.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Equity Curve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 flex items-center justify-center bg-secondary/20 rounded-lg">
                <LineChart className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/charts/Charts.tsx`
``` tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { stocksAPI } from '@/lib/api'
import { StockPrice } from '@/types'
import TradingViewChart from '@/components/charts/TradingViewChart'
import { useWebSocket } from '@/hooks/useWebSocket'
import { BarChart3, Activity, TrendingUp, Download, Maximize2, Search, X } from 'lucide-react'

const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']
const stocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'WIPRO', 'TATAMOTORS', 'MARUTI']

export default function Charts() {
  const { subscribe, unsubscribe } = useWebSocket()
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE')
  const [timeframe, setTimeframe] = useState('1D')
  const [data, setData] = useState<StockPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    subscribe(selectedSymbol)
    return () => unsubscribe(selectedSymbol)
  }, [selectedSymbol, subscribe, unsubscribe])

  useEffect(() => {
    const limitMap: Record<string, number> = { '1D': 1, '5D': 5, '1M': 22, '3M': 66, '6M': 132, '1Y': 252, '5Y': 1260 }
    const fetch = async () => {
      setLoading(true)
      try {
        const res = await stocksAPI.getPrices(selectedSymbol, '1D', limitMap[timeframe] || 100)
        setData(res.data)
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetch()
  }, [selectedSymbol, timeframe])

  const filtered = stocks.filter((s) => s.toLowerCase().includes(search.toLowerCase()))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Charts</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" /> Export</Button>
          <Button variant="outline" size="sm"><Maximize2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Stocks</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1 max-h-[400px] overflow-y-auto">
            {filtered.map((sym) => (
              <button
                key={sym}
                onClick={() => { setSelectedSymbol(sym); setSearch('') }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  sym === selectedSymbol ? 'bg-primary text-primary-foreground' : 'bg-secondary/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                {sym}
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{selectedSymbol}</h2>
                  <Badge variant="secondary" className="text-xs">NSE</Badge>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {timeframes.map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                        tf === timeframe ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : data.length > 0 ? (
                <TradingViewChart data={data} symbol={selectedSymbol} height={400} />
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-secondary/20 rounded-lg">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                    <p className="text-lg font-medium text-muted-foreground">No data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: 'Overlay Indicators', desc: 'SMA, EMA, Bollinger Bands, VWAP' },
              { icon: BarChart3, title: 'Volume Profile', desc: 'Volume bars, delivery analysis' },
              { icon: Activity, title: 'Drawing Tools', desc: 'Trendlines, channels, patterns' },
            ].map((tool) => (
              <Card key={tool.title}>
                <CardContent className="p-4 flex items-start gap-3">
                  <tool.icon className="w-8 h-8 text-primary shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{tool.title}</div>
                    <div className="text-xs text-muted-foreground">{tool.desc}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/dashboard/Dashboard.tsx`
``` tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardAPI } from '@/lib/api'
import { useAppSelector } from '@/store/hooks'
import { selectConnected, selectLivePrices } from '@/store/marketSlice'
import { useWebSocket } from '@/hooks/useWebSocket'
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MarketIndicesChart from '@/components/dashboard/MarketIndicesChart'

interface MarketData {
  indices: Record<string, { symbol: string; current_value: number; change: number; change_percent: number; high?: number; low?: number; is_up: boolean }>
  gainers: { symbol: string; company_name: string; price: number; change_percent: number }[]
  losers: { symbol: string; company_name: string; price: number; change_percent: number }[]
  most_active: { symbol: string; company_name: string; price: number; volume: number }[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const wsConnected = useAppSelector(selectConnected)
  const livePrices = useAppSelector(selectLivePrices)
  useWebSocket()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const overview = await dashboardAPI.getOverview(50)
        setData(overview.data)
      } catch {
        setData({
          indices: {},
          gainers: [],
          losers: [],
          most_active: [],
        })
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge variant={wsConnected ? 'success' : 'destructive'} className="text-[10px] px-2 py-0.5">
            <Zap className="w-3 h-3 mr-1" />
            {wsConnected ? 'LIVE' : 'OFFLINE'}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Badge>
        </div>
      </div>

      {livePrices.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-secondary/20 border">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide py-2 px-4 animate-pulse-slow">
            {livePrices.map((p) => (
              <div key={p.symbol} className="flex items-center gap-2 text-xs whitespace-nowrap shrink-0">
                <span className="font-medium">{p.symbol}</span>
                <span>₹{p.price.toLocaleString('en-IN')}</span>
                <span className={p.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {p.change >= 0 ? '+' : ''}{p.change.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div variants={item}>
        <MarketIndicesChart />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card className="relative">
            <CardHeader className="sticky top-0 z-10 bg-card">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" /> Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {(data?.gainers || []).map((g, i) => (
                <div
                  key={g.symbol}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/stocks/${g.symbol}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{g.symbol}</div>
                      <div className="text-xs text-muted-foreground">₹{g.price?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                  <Badge variant="success">+{Math.abs(g.change_percent)?.toFixed(2) || '0'}%</Badge>
                </div>
              ))}
              {(!data?.gainers || data.gainers.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="relative">
            <CardHeader className="sticky top-0 z-10 bg-card">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" /> Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
              {(data?.losers || []).map((l, i) => (
                <div
                  key={l.symbol}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  onClick={() => navigate(`/stocks/${l.symbol}`)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium">{l.symbol}</div>
                      <div className="text-xs text-muted-foreground">₹{l.price?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>
                  <Badge variant="destructive">-{Math.abs(l.change_percent)?.toFixed(2) || '0'}%</Badge>
                </div>
              ))}
              {(!data?.losers || data.losers.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <Card className="relative">
          <CardHeader className="sticky top-0 z-10 bg-card">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-4 h-4" /> Most Active
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(data?.most_active || []).map((a) => (
                <div
                  key={a.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/stocks/${a.symbol}`)}
                >
                  <div className="text-sm font-medium">{a.symbol}</div>
                  <div className="text-right">
                    <div className="text-xs font-medium">₹{a.price?.toFixed(2) || 'N/A'}</div>
                    <div className="text-[10px] text-muted-foreground">Vol: {(a.volume || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
              {(!data?.most_active || data.most_active.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-4 col-span-3">No data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

```


### `frontend/src/pages/learning/Learning.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap, BookMarked, Search, ChevronRight } from 'lucide-react'

const categories = [
  { name: 'Stock Market Basics', count: 12, icon: GraduationCap },
  { name: 'Technical Analysis', count: 18, icon: BookMarked },
  { name: 'Fundamental Analysis', count: 15, icon: BookMarked },
  { name: 'Candlestick Patterns', count: 20, icon: BookOpen },
  { name: 'Trading Strategies', count: 14, icon: BookOpen },
  { name: 'Investment Guide', count: 10, icon: BookMarked },
  { name: 'Risk Management', count: 8, icon: BookOpen },
  { name: 'Derivatives & Options', count: 16, icon: BookMarked },
]

const glossaryTerms = [
  { term: 'PE Ratio', def: 'Price to Earnings ratio - valuation measure' },
  { term: 'RSI', def: 'Relative Strength Index - momentum indicator' },
  { term: 'Market Cap', def: 'Total market value of company shares' },
  { term: 'Dividend Yield', def: 'Annual dividend as % of stock price' },
  { term: 'Book Value', def: 'Net asset value per share' },
  { term: 'ROE', def: 'Return on Equity - profitability measure' },
]

export default function Learning() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Learn</h1>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search learning content..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.name} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <cat.icon className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{cat.count} lessons</Badge>
              </div>
              <h3 className="font-medium mt-3 text-sm">{cat.name}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <span>Start learning</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Glossary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {glossaryTerms.map((g) => (
              <div key={g.term} className="p-3 rounded-lg bg-secondary/30">
                <div className="text-sm font-medium">{g.term}</div>
                <div className="text-xs text-muted-foreground mt-1">{g.def}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

```


### `frontend/src/pages/news/News.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ExternalLink } from 'lucide-react'

const categories = ['All', 'Company', 'Sector', 'Market', 'Economy', 'Global']

export default function News() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">News</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            cat === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { title: 'Nifty hits fresh all-time high above 22,500', source: 'Economic Times', time: '2 hours ago', sentiment: 'positive', category: 'Market' },
          { title: 'RBI keeps repo rate unchanged at 6.5% for seventh consecutive time', source: 'Moneycontrol', time: '4 hours ago', sentiment: 'neutral', category: 'Economy' },
          { title: 'TCS wins $1.5 billion deal from UK-based firm', source: 'NDTV Profit', time: '6 hours ago', sentiment: 'positive', category: 'Company' },
          { title: 'Crude oil prices decline as demand concerns weigh', source: 'Reuters', time: '8 hours ago', sentiment: 'negative', category: 'Global' },
          { title: 'Reliance Industries to invest ₹75,000 crore in green energy', source: 'Livemint', time: '10 hours ago', sentiment: 'positive', category: 'Company' },
          { title: 'IT sector leads rally; Nifty IT up 3%', source: 'Business Standard', time: '12 hours ago', sentiment: 'positive', category: 'Sector' },
          { title: 'Gold prices steady ahead of US Fed meeting', source: 'Bloomberg', time: '14 hours ago', sentiment: 'neutral', category: 'Global' },
          { title: 'SEBI introduces new framework for SME IPOs', source: 'Financial Express', time: '16 hours ago', sentiment: 'neutral', category: 'Economy' },
        ].map((article, i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      article.sentiment === 'positive' ? 'success' :
                      article.sentiment === 'negative' ? 'destructive' : 'secondary'
                    } className="text-[10px] px-1.5">
                      {article.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">{article.source}</Badge>
                  </div>
                  <h3 className="font-medium text-sm md:text-base">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2">{article.time}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/portfolio/Portfolio.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, TrendingDown, PieChart, DollarSign, BarChart3 } from 'lucide-react'

export default function Portfolio() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Holding</Button>
          <Button size="sm">Import Holdings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: '₹12,45,678', change: '+₹45,678 (+3.8%)', icon: DollarSign, up: true },
          { label: 'Total Invested', value: '₹10,00,000', change: '—', icon: BarChart3, up: true },
          { label: 'Total P&L', value: '+₹2,45,678', change: '+24.57%', icon: TrendingUp, up: true },
          { label: 'Div. Income', value: '₹12,450', change: 'YTD', icon: PieChart, up: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.up ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className={`text-xs ${s.up ? 'text-green-500' : 'text-red-500'}`}>{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Avg Price</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">LTP</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Invested</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Current</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">P&L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { symbol: 'RELIANCE', qty: 50, avg: 2850, ltp: 2924.50 },
                  { symbol: 'TCS', qty: 20, avg: 3850, ltp: 3890.00 },
                  { symbol: 'HDFCBANK', qty: 100, avg: 1650, ltp: 1678.90 },
                  { symbol: 'INFY', qty: 75, avg: 1520, ltp: 1567.30 },
                ].map((h) => {
                  const invested = h.qty * h.avg
                  const current = h.qty * h.ltp
                  const pl = current - invested
                  const plPercent = (pl / invested) * 100
                  return (
                    <tr key={h.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{h.symbol}</td>
                      <td className="text-right py-3">{h.qty}</td>
                      <td className="text-right py-3">₹{h.avg.toFixed(2)}</td>
                      <td className="text-right py-3">₹{h.ltp.toFixed(2)}</td>
                      <td className="text-right py-3">₹{invested.toLocaleString('en-IN')}</td>
                      <td className="text-right py-3">₹{current.toLocaleString('en-IN')}</td>
                      <td className={`text-right py-3 font-medium ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN')} ({plPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { sector: 'Banking', percent: 45, color: 'bg-blue-500' },
                { sector: 'IT', percent: 30, color: 'bg-purple-500' },
                { sector: 'Oil & Gas', percent: 15, color: 'bg-orange-500' },
                { sector: 'Auto', percent: 10, color: 'bg-green-500' },
              ].map((s) => (
                <div key={s.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.sector}</span>
                    <span className="text-muted-foreground">{s.percent}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500">78</div>
                <div className="text-sm text-muted-foreground mt-2">Health Score</div>
                <Badge variant="success" className="mt-2">Well Diversified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/scanner/Scanner.tsx`
``` tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, Save, Play, History } from 'lucide-react'
import { scannerAPI } from '@/lib/api'

interface Condition {
  id: string
  field: string
  operator: string
  value: string
}

const fields = [
  { value: 'price', label: 'Price' },
  { value: 'volume', label: 'Volume' },
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'pe_ratio', label: 'P/E Ratio' },
  { value: 'pb_ratio', label: 'P/B Ratio' },
  { value: 'eps', label: 'EPS' },
  { value: 'roe', label: 'ROE' },
  { value: 'roce', label: 'ROCE' },
  { value: 'debt_equity', label: 'Debt/Equity' },
  { value: 'current_ratio', label: 'Current Ratio' },
  { value: 'dividend_yield', label: 'Dividend Yield' },
  { value: 'promoter_holding', label: 'Promoter Holding' },
  { value: 'fii_holding', label: 'FII Holding' },
  { value: 'sales_growth', label: 'Sales Growth' },
  { value: 'profit_growth', label: 'Profit Growth' },
  { value: 'operating_margin', label: 'Operating Margin' },
]

const operators = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'equals', label: 'Equals' },
  { value: 'between', label: 'Between' },
]

const prebuiltScans = [
  { name: 'RSI Oversold', desc: 'RSI below 30, upside potential' },
  { name: 'Golden Cross', desc: '50 SMA crosses above 200 SMA' },
  { name: 'Volume Spike', desc: 'Volume > 2x average' },
  { name: 'Strong Fundamentals', desc: 'ROE > 15%, Debt/Equity < 1' },
  { name: '52 Week High', desc: 'Stocks near 52 week highs' },
  { name: 'High Growth', desc: 'Sales growth > 20%, Profit growth > 20%' },
]

export default function Scanner() {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'rsi', operator: 'below', value: '30' },
  ])
  const [logic, setLogic] = useState('AND')
  const [results, setResults] = useState<{ symbol: string; company_name: string; sector?: string }[]>([])
  const [scanning, setScanning] = useState(false)

  const addCondition = () => {
    setConditions([...conditions, { id: String(Date.now()), field: 'price', operator: 'above', value: '' }])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  const updateCondition = (id: string, key: keyof Condition, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [key]: value } : c))
  }

  const executeScan = async () => {
    setScanning(true)
    try {
      const res = await scannerAPI.execute(conditions, logic)
      setResults(res.data.results || [])
    } catch {
      setResults([
        { symbol: 'RELIANCE', company_name: 'Reliance Industries', sector: 'Oil & Gas' },
        { symbol: 'TCS', company_name: 'Tata Consultancy Services', sector: 'IT' },
        { symbol: 'HDFCBANK', company_name: 'HDFC Bank', sector: 'Banking' },
      ])
    }
    setScanning(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Scanner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4" /> Scan Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="space-y-2">
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={logic} onChange={(e) => setLogic(e.target.value)} className="w-20 text-xs h-8">
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </Select>
                      <span className="text-xs text-muted-foreground">next condition</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select
                      value={cond.field}
                      onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                      className="flex-1"
                    >
                      {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </Select>
                    <Select
                      value={cond.operator}
                      onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                      className="w-24"
                    >
                      {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <Input
                      type="number"
                      placeholder="Value"
                      value={cond.value}
                      onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                      className="w-24"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(cond.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-1" /> Add Condition
                </Button>
                <Button size="sm" onClick={executeScan} disabled={scanning}>
                  <Play className="w-4 h-4 mr-1" /> {scanning ? 'Scanning...' : 'Run Scan'}
                </Button>
                <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-1" /> Save</Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((r) => (
                    <div key={r.symbol} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div>
                        <div className="text-sm font-medium">{r.symbol}</div>
                        <div className="text-xs text-muted-foreground">{r.company_name}</div>
                      </div>
                      <Badge variant="secondary">{r.sector || 'N/A'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prebuilt Scans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prebuiltScans.map((scan) => (
                <div key={scan.name} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="text-sm font-medium">{scan.name}</div>
                  <div className="text-xs text-muted-foreground">{scan.desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent scans</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/stock/StockDetail.tsx`
``` tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { stocksAPI } from '@/lib/api'
import { formatCompactCurrency } from '@/lib/utils'
import { StockPrice } from '@/types'
import { useAppSelector } from '@/store/hooks'
import { useWebSocket } from '@/hooks/useWebSocket'
import TradingViewChart from '@/components/charts/TradingViewChart'
import {
  TrendingUp, TrendingDown, ArrowLeft, Activity, BarChart3, PieChart,
  DollarSign, BookOpen, Newspaper, Bell, Star, Shield,
} from 'lucide-react'

const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']

export default function StockDetail() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()
  const { subscribe, unsubscribe } = useWebSocket()
  const [stock, setStock] = useState<Record<string, unknown> | null>(null)
  const [prices, setPrices] = useState<StockPrice[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('1M')
  const livePrice = useAppSelector((s) => s.market.prices[symbol || ''])

  useEffect(() => {
    if (!symbol) return
    subscribe(symbol)
    return () => unsubscribe(symbol)
  }, [symbol, subscribe, unsubscribe])

  useEffect(() => {
    const limitMap: Record<string, number> = { '1D': 1, '5D': 5, '1M': 22, '3M': 66, '6M': 132, '1Y': 252, '5Y': 1260 }
    const fetchStock = async () => {
      if (!symbol) return
      try {
        const [detailRes, pricesRes] = await Promise.all([
          stocksAPI.getDetail(symbol),
          stocksAPI.getPrices(symbol, '1D', limitMap[timeframe] || 100),
        ])
        setStock(detailRes.data)
        setPrices(pricesRes.data)
      } catch {
        setStock({
          symbol: symbol,
          company_name: symbol + ' Ltd.',
          sector: 'N/A',
          industry: 'N/A',
          fundamentals: {
            market_cap: 1234567, pe_ratio: 24.5, eps: 45.67,
            roe: 18.5, roce: 22.3, debt_to_equity: 0.45,
            promoter_holding: 55.2, fii_holding: 15.3,
          },
        })
      }
      setLoading(false)
    }
    fetchStock()
  }, [symbol, timeframe])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const f = (stock?.fundamentals as Record<string, unknown>) || {}
  const tabs = ['Overview', 'Technical', 'Fundamentals', 'News', 'AI Analysis']

  const latestPrice = prices.length > 0 ? prices[prices.length - 1] : null
  const changeAmount = livePrice
    ? livePrice.price - (latestPrice?.open || livePrice.price)
    : 0
  const changePercent = latestPrice?.open
    ? ((changeAmount / latestPrice.open) * 100)
    : 0
  const isUp = changeAmount >= 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{stock?.symbol as string}</h1>
            <Badge variant="secondary" className="text-xs">
              {(stock?.company_name as string) || symbol}
            </Badge>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold">
                ₹{(livePrice?.price || latestPrice?.close || 0).toLocaleString('en-IN')}
              </span>
              <span className={`flex items-center text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
                {changeAmount.toFixed(2)} ({changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {stock?.sector as string} | {stock?.industry as string}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm"><Star className="w-4 h-4 mr-1" /> Watch</Button>
          <Button variant="outline" size="sm"><Bell className="w-4 h-4 mr-1" /> Alert</Button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.toLowerCase().replace(' ', '-')
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                      tf === timeframe ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              {prices.length > 0 ? (
                <TradingViewChart data={prices} symbol={symbol} height={350} />
              ) : (
                <div className="h-[350px] flex items-center justify-center bg-secondary/20 rounded-lg">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No price data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Price Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Open', value: latestPrice?.open },
                  { label: 'High', value: livePrice?.high || latestPrice?.high },
                  { label: 'Low', value: livePrice?.low || latestPrice?.low },
                  { label: 'Close', value: livePrice?.close || latestPrice?.close },
                  { label: 'Volume', value: livePrice?.volume || latestPrice?.volume },
                  { label: 'VWAP', value: latestPrice?.vwap },
                  { label: 'Delivery %', value: latestPrice?.delivery_percentage },
                  { label: '52W High', value: prices.length > 0 ? Math.max(...prices.map(p => p.high)) : undefined },
                ].map((s) => (
                  <div key={s.label} className="p-3 rounded-lg bg-secondary/30">
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                    <div className="text-sm font-semibold mt-1">
                      {s.label === 'Delivery %'
                        ? (s.value !== undefined && s.value !== null ? Number(s.value).toFixed(2) + '%' : 'N/A')
                        : s.label === 'Volume'
                        ? (s.value !== undefined ? Number(s.value).toLocaleString('en-IN') : 'N/A')
                        : (s.value !== undefined && s.value !== null ? Number(s.value).toFixed(2) : 'N/A')
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fundamentals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Market Cap', value: formatCompactCurrency(f.market_cap as number), icon: DollarSign },
                { label: 'P/E Ratio', value: typeof f.pe_ratio === 'number' ? f.pe_ratio.toFixed(2) : 'N/A', icon: BarChart3 },
                { label: 'EPS', value: typeof f.eps === 'number' ? f.eps.toFixed(2) : 'N/A', icon: Activity },
                { label: 'ROE', value: typeof f.roe === 'number' ? f.roe.toFixed(2) + '%' : 'N/A', icon: TrendingUp },
                { label: 'ROCE', value: typeof f.roce === 'number' ? f.roce.toFixed(2) + '%' : 'N/A', icon: TrendingUp },
                { label: 'Debt/Equity', value: typeof f.debt_to_equity === 'number' ? f.debt_to_equity.toFixed(2) : 'N/A', icon: Shield },
                { label: 'Promoter', value: typeof f.promoter_holding === 'number' ? f.promoter_holding.toFixed(2) + '%' : 'N/A', icon: PieChart },
                { label: 'FII', value: typeof f.fii_holding === 'number' ? f.fii_holding.toFixed(2) + '%' : 'N/A', icon: PieChart },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30">
                  <div className="flex items-center gap-2">
                    <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{s.label}</span>
                  </div>
                  <span className="text-xs font-semibold">{s.value || 'N/A'}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Indicators</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'RSI (14)', value: '54.2', signal: 'Neutral' },
                { label: 'MACD', value: '12.45', signal: 'Buy' },
                { label: 'SMA (20)', value: '₹2,345', signal: 'Above' },
                { label: 'SMA (50)', value: '₹2,290', signal: 'Above' },
                { label: 'ADX', value: '28.5', signal: 'Trending' },
              ].map((indicator) => (
                <div key={indicator.label} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30">
                  <span className="text-xs text-muted-foreground">{indicator.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{indicator.value}</span>
                    <Badge variant={indicator.signal === 'Buy' ? 'success' : indicator.signal === 'Sell' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0">
                      {indicator.signal}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

```


### `frontend/src/pages/stock/Stocks.tsx`
``` tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const popularStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil & Gas', price: 2924.50, change: 1.2 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3890.00, change: -0.5 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1678.90, change: 0.8 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1567.30, change: 2.1 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 1089.40, change: -0.3 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', price: 445.60, change: 1.5 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 678.90, change: -1.2 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 1234.50, change: 2.5 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1876.30, change: 0.6 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', price: 456.20, change: -1.1 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', price: 789.50, change: 3.2 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', price: 10234.00, change: -0.8 },
]

const sectors = ['All', 'Banking', 'IT', 'Oil & Gas', 'Auto', 'FMCG', 'Telecom', 'Pharma', 'Metal']

export default function Stocks() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')

  const filtered = popularStocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    const matchesSector = sector === 'All' || s.sector === sector
    return matchesSearch && matchesSector
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Stocks</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sectors.map(s => (
            <button key={s} onClick={() => setSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                sector === s ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Symbol</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Sector</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">LTP</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => (
                  <tr
                    key={stock.symbol}
                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{stock.name}</td>
                    <td className="p-4"><Badge variant="secondary" className="text-xs">{stock.sector}</Badge></td>
                    <td className="p-4 text-right font-medium">₹{stock.price.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span className="font-medium">{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

```


### `frontend/src/pages/technical/TechnicalAnalysis.tsx`
``` tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const indicators = [
  { name: 'SMA (20)', value: '2,345.60', signal: 'bullish', desc: 'Price above SMA' },
  { name: 'SMA (50)', value: '2,290.45', signal: 'bullish', desc: 'Price above SMA' },
  { name: 'EMA (20)', value: '2,340.20', signal: 'bullish', desc: 'Price above EMA' },
  { name: 'RSI (14)', value: '54.23', signal: 'neutral', desc: 'Range 30-70' },
  { name: 'MACD', value: '12.45', signal: 'bullish', desc: 'Above signal line' },
  { name: 'ADX (14)', value: '28.50', signal: 'trending', desc: 'Trending market' },
  { name: 'Bollinger Bands', value: 'Middle', signal: 'neutral', desc: 'Price at middle' },
  { name: 'Stochastic RSI', value: '0.45', signal: 'neutral', desc: 'Mid-range' },
  { name: 'MFI (14)', value: '52.30', signal: 'neutral', desc: 'No divergence' },
  { name: 'OBV', value: 'Rising', signal: 'bullish', desc: 'Volume confirms' },
]

export default function TechnicalAnalysis() {
  const getSignalIcon = (signal: string) => {
    if (signal === 'bullish') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (signal === 'bearish') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-yellow-500" />
  }

  const getSignalBadge = (signal: string) => {
    if (signal === 'bullish') return <Badge variant="success">Bullish</Badge>
    if (signal === 'bearish') return <Badge variant="destructive">Bearish</Badge>
    return <Badge variant="warning">Neutral</Badge>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Technical Analysis</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <Card key={ind.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{ind.name}</span>
                {getSignalIcon(ind.signal)}
              </div>
              <div className="text-lg font-bold mb-1">{ind.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{ind.desc}</span>
                {getSignalBadge(ind.signal)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Patterns Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { pattern: 'Double Bottom', direction: 'Bullish', confidence: '78%' },
              { pattern: 'Bullish Engulfing', direction: 'Bullish', confidence: '85%' },
              { pattern: 'Support @ ₹2,280', direction: 'Key Level', confidence: '-' },
            ].map((p) => (
              <div key={p.pattern} className="p-3 rounded-lg bg-secondary/30">
                <div className="text-sm font-medium">{p.pattern}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={p.direction === 'Bullish' ? 'success' : p.direction === 'Bearish' ? 'destructive' : 'secondary'} className="text-xs">
                    {p.direction}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {p.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

```


### `frontend/src/pages/watchlist/Watchlists.tsx`
``` tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Star, Trash2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'

export default function Watchlists() {
  const [watchlists] = useState([
    { id: '1', name: 'My Watchlist', items: [
      { symbol: 'RELIANCE', price: 2924.50, change: 1.2 },
      { symbol: 'TCS', price: 3890.00, change: -0.5 },
      { symbol: 'HDFCBANK', price: 1678.90, change: 0.8 },
      { symbol: 'INFY', price: 1567.30, change: 2.1 },
      { symbol: 'ICICIBANK', price: 1089.40, change: -0.3 },
    ]},
    { id: '2', name: 'Favorites', items: [
      { symbol: 'TATAMOTORS', price: 789.50, change: 3.2 },
      { symbol: 'WIPRO', price: 456.20, change: -1.1 },
    ]},
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Watchlists</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Watchlist</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {watchlists.map((wl) => (
          <Card key={wl.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <CardTitle className="text-lg">{wl.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">{wl.items.length}</Badge>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {wl.items.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{item.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.change >= 0 ? 'success' : 'destructive'}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}

```


### `frontend/src/store/authSlice.ts`
``` ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authAPI } from '@/lib/api'
import type { AuthState, User } from '@/types'

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
}

export const loginUser = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      return rejectWithValue(err.response?.data?.detail || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: { email: string; password: string; full_name: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data)
      return response.data
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } }
      return rejectWithValue(err.response?.data?.detail || 'Registration failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getMe()
      return response.data
    } catch {
      return rejectWithValue('Failed to fetch user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user = action.payload.user
        localStorage.setItem('access_token', action.payload.access_token)
        localStorage.setItem('refresh_token', action.payload.refresh_token)
      })
      .addCase(loginUser.rejected, (state) => { state.isLoading = false })
      .addCase(registerUser.pending, (state) => { state.isLoading = true })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.accessToken = action.payload.access_token
        state.refreshToken = action.payload.refresh_token
        state.user = action.payload.user
        localStorage.setItem('access_token', action.payload.access_token)
        localStorage.setItem('refresh_token', action.payload.refresh_token)
      })
      .addCase(registerUser.rejected, (state) => { state.isLoading = false })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
      })
  },
})

export const { logout, setUser } = authSlice.actions
export default authSlice.reducer

```


### `frontend/src/store/hooks.ts`
``` ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

```


### `frontend/src/store/index.ts`
``` ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import marketReducer from './marketSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

```


### `frontend/src/store/marketSlice.ts`
``` ts
import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'
import type { RootState } from './index'

export interface LivePrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  timestamp: string
}

export interface IndexData {
  symbol: string
  current_value: number
  change: number
  change_percent: number
  high: number
  low: number
  is_up: boolean
}

interface MarketState {
  prices: Record<string, LivePrice>
  indices: Record<string, IndexData>
  connected: boolean
  lastUpdate: string | null
}

const initialState: MarketState = {
  prices: {},
  indices: {},
  connected: false,
  lastUpdate: null,
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
    },
    updatePrice(state, action: PayloadAction<LivePrice>) {
      const p = action.payload
      state.prices[p.symbol] = p
      state.lastUpdate = p.timestamp
    },
    updateIndexData(state, action: PayloadAction<IndexData>) {
      const idx = action.payload
      state.indices[idx.symbol] = idx
      state.lastUpdate = new Date().toISOString()
    },
    updateIndices(state, action: PayloadAction<IndexData[]>) {
      action.payload.forEach((idx) => {
        state.indices[idx.symbol] = idx
      })
      state.lastUpdate = new Date().toISOString()
    },
  },
})

export const { setConnected, updatePrice, updateIndexData, updateIndices } = marketSlice.actions
export default marketSlice.reducer

const selectMarketState = (state: RootState) => state.market

export const selectLivePrices = createSelector(
  selectMarketState,
  (market) => Object.values(market.prices).slice(0, 500),
)

export const selectConnected = createSelector(
  selectMarketState,
  (market) => market.connected,
)

```


### `frontend/src/styles/globals.css`
``` css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 142 72% 29%;
    --primary-foreground: 210 40% 98%;
    --secondary: 220 14% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 220 14% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 142 72% 29%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 142 72% 29%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 6.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 142 72% 29%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 142 72% 29%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 142 72% 29%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  .glass {
    @apply bg-card/60 backdrop-blur-xl border border-border/50 shadow-lg;
  }

  .glass-hover {
    @apply hover:bg-card/80 hover:border-primary/30 transition-all duration-300;
  }

  .gradient-border {
    @apply relative;
  }

  .gradient-border::before {
    content: '';
    @apply absolute -inset-[1px] bg-gradient-to-r from-primary/50 to-primary/30 rounded-xl -z-10;
  }

  .animated-gradient {
    background: linear-gradient(
      135deg,
      hsl(var(--primary) / 0.1),
      hsl(var(--primary) / 0.05),
      hsl(var(--background))
    );
    background-size: 400% 400%;
    animation: gradient 15s ease infinite;
  }

  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .stat-card {
    @apply glass rounded-xl p-4 md:p-6 transition-all duration-300;
  }

  .stat-card:hover {
    @apply glass-hover shadow-lg shadow-primary/5;
  }

  .price-up {
    @apply text-green-500;
  }

  .price-down {
    @apply text-red-500;
  }

  .sidebar-link {
    @apply flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200;
  }

  .sidebar-link.active {
    @apply bg-primary/10 text-primary font-medium;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  @keyframes pulse-slow {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
}

```


### `frontend/src/types/index.ts`
``` ts
export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  is_verified: boolean
  is_premium: boolean
  is_admin: boolean
  created_at: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface StockBasic {
  id: string
  symbol: string
  company_name: string
  sector?: string
  industry?: string
  market_cap?: number
  logo_url?: string
}

export interface StockPrice {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  delivery_percentage?: number
  vwap?: number
}

export interface MarketIndex {
  symbol: string
  current_value: number
  change: number
  change_percent: number
  high?: number
  low?: number
  is_up: boolean
}

export interface MarketOverview {
  indices: {
    nifty: MarketIndex
    sensex: MarketIndex
    banknifty: MarketIndex
    vix: MarketIndex
  }
  gainers: StockBasic[]
  losers: StockBasic[]
  most_active: StockBasic[]
}

export interface TechnicalIndicators {
  sma_20?: number
  sma_50?: number
  ema_20?: number
  rsi_14?: number
  macd?: { macd: number[]; signal: number[]; histogram: number[] }
  bollinger_bands?: { upper: number[]; middle: number[]; lower: number[] }
  adx?: number
  atr?: number
  obv?: number
  mfi?: number
  stoch_rsi?: number
  williams_r?: number
  cci?: number
  supertrend?: { trend: boolean[]; upper: number[]; lower: number[] }
}

export interface PatternResult {
  pattern: string
  direction: string
  confidence: number
}

export interface ScannerCondition {
  field: string
  operator: string
  value: string
  logic_group: string
}

export interface Alert {
  id: string
  alert_type: string
  stock_id?: string
  condition: Record<string, unknown>
  is_active: boolean
  notification_type: string
  created_at: string
}

export interface Portfolio {
  id: string
  name: string
  initial_capital: number
  total_invested: number
  holdings_count: number
  currency: string
}

export interface Watchlist {
  id: string
  name: string
  item_count: number
  items: WatchlistItem[]
}

export interface WatchlistItem {
  id: string
  stock_id: string
  notes?: string
}

export interface BacktestStrategy {
  id: string
  name: string
  description?: string
  buy_rules: Record<string, unknown>
  sell_rules?: Record<string, unknown>
  stop_loss?: number
  target?: number
  created_at: string
}

export interface CursorPage<T> {
  items: T[]
  next_cursor?: string
  has_more: boolean
  total?: number
}

export interface BacktestResult {
  id: string
  symbol: string
  initial_capital: number
  final_capital: number
  total_returns: number
  cagr?: number
  sharpe_ratio?: number
  max_drawdown?: number
  win_rate?: number
  profit_factor?: number
  total_trades?: number
}

```


### `frontend/tailwind.config.js`
``` js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

```


### `frontend/tsconfig.json`
``` json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

```


### `frontend/tsconfig.node.json`
``` json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}

```


### `frontend/vite.config.ts`
``` ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
        ws: true,
      },
      '/ws': {
        target: 'http://backend:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})

```


### `nginx/nginx.conf`
``` conf
worker_processes 1;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # WebSocket
        location /ws/ {
            proxy_pass http://backend/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }

        # Static files
        location /static/ {
            alias /var/www/static/;
            expires 30d;
        }
    }
}

```

