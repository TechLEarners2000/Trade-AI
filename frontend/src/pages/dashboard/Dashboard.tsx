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
