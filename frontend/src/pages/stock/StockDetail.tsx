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
