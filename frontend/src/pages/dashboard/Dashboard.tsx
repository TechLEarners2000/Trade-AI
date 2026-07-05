import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { dashboardAPI, advisorAPI } from '@/lib/api'
import { useAppSelector } from '@/store/hooks'
import { selectConnected, selectLivePrices } from '@/store/marketSlice'
import { useWebSocket } from '@/hooks/useWebSocket'
import { TrendingUp, TrendingDown, Activity, Zap, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
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

      <AdvisorPreviewCard topGainerSymbol={data?.gainers?.[0]?.symbol} />

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
                  <Badge variant={g.change_percent >= 0 ? 'success' : 'destructive'}>
                    {g.change_percent >= 0 ? '+' : ''}{g.change_percent?.toFixed(2) || '0'}%
                  </Badge>
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
                  <Badge variant={l.change_percent >= 0 ? 'success' : 'destructive'}>
                    {l.change_percent >= 0 ? '+' : ''}{l.change_percent?.toFixed(2) || '0'}%
                  </Badge>
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

function AdvisorPreviewCard({ topGainerSymbol }: { topGainerSymbol?: string }) {
  const navigate = useNavigate()
  const { data: analysis } = useQuery({
    queryKey: ['advisor-preview', topGainerSymbol],
    queryFn: async () => {
      const { data } = await advisorAPI.analyze(topGainerSymbol!)
      return data as { history: { date: string; close: number }[]; current_price: number; change_percent: number; recommendation: string }
    },
    enabled: !!topGainerSymbol,
  })

  if (!analysis || !analysis.history || analysis.history.length === 0) return null

  const chartData = analysis.history.slice(-14).map((h) => ({
    date: h.date.slice(0, 10),
    close: h.close,
  }))

  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="cursor-pointer hover:bg-secondary/10 transition-colors" onClick={() => navigate('/advisor')}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            {topGainerSymbol} — Trend Preview
          </CardTitle>
          <span className="text-xs text-muted-foreground">Click for full Advisor →</span>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-3">
            <div>
              <span className="text-xs text-muted-foreground">Price</span>
              <div className="text-lg font-bold">₹{analysis.current_price.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Change</span>
              <div className={`text-lg font-bold ${analysis.change_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {analysis.change_percent >= 0 ? '+' : ''}{analysis.change_percent.toFixed(2)}%
              </div>
            </div>
          </div>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
