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
