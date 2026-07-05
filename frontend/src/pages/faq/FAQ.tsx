import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: "How are predictions calculated?",
    a: "Predictions are based on a simple linear regression (polyfit degree 1) of the last 14 trading days of closing prices. The trend line is projected 7 days forward. R² is used to determine confidence (high ≥ 0.8, medium ≥ 0.5, low otherwise). This is a basic statistical projection, not a guaranteed forecast.",
  },
  {
    q: "What does BUY / HOLD / AVOID mean?",
    a: "BUY indicates positive momentum: uptrend with price above its 20-day average and RSI below 70 (not overbought). HOLD means neutral signals — no strong directional bias. AVOID means the stock is in a downtrend or overbought (RSI > 75). These are data-driven signals, not investment advice.",
  },
  {
    q: "Is this real trading or a simulation?",
    a: "Simulation. All data is for educational and research purposes only. No real trading, brokerage, or order execution occurs. Prices shown are from Yahoo Finance or seeded sample data. Do not use this platform for actual trading decisions without consulting a SEBI-registered advisor.",
  },
  {
    q: "How is data sourced?",
    a: "Live equity data is fetched via Yahoo Finance (yfinance library) using NSE symbols. When yfinance is unavailable, the platform falls back to the database's last known prices. Historical data may also be seeded with simulated prices for development/demo purposes.",
  },
  {
    q: "What technical indicators are available?",
    a: "25+ indicators: SMA (5/10/20/50/200), EMA (5/10/20/50/200), RSI (14), MACD, Bollinger Bands, ADX, ATR, OBV, MFI, Stochastic RSI, Williams %R, CCI, SuperTrend, and candlestick/chart pattern recognition.",
  },
  {
    q: "How often is data updated?",
    a: "Market overview and gainers/losers are cached for 30 seconds. The Advisor's ranked stock list is cached for 2 minutes. Individual stock analysis is cached for 5 minutes. Cache TTLs are designed to balance freshness with API rate limits.",
  },
  {
    q: "Can I export my portfolio or watchlist?",
    a: "Portfolio and watchlist data can be viewed on-screen. Export functionality is not yet built but is on the roadmap. Data is persisted in PostgreSQL and associated with your account.",
  },
  {
    q: "Is my data secure?",
    a: "Passwords are hashed with bcrypt. Authentication uses JWT tokens with refresh rotation. All API endpoints require authentication. No sensitive financial data (like real brokerage credentials) is stored.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">FAQs</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-lg border border-border/50 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown className={cn(
                  'w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200',
                  openIndex === i && 'rotate-180'
                )} />
              </button>
              <div className={cn(
                'overflow-hidden transition-all duration-200',
                openIndex === i ? 'max-h-96' : 'max-h-0'
              )}>
                <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Not investment advice. Data provided for educational purposes only.
      </p>
    </motion.div>
  )
}
