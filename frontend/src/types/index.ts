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
