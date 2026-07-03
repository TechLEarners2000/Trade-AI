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

Copy `.env` and configure:

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST` | PostgreSQL host |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `REDIS_HOST` | Redis host |
| `SECRET_KEY` | JWT secret key |
| `OPENAI_API_KEY` | OpenAI API key (optional) |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |

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
