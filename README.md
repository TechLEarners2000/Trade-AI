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
