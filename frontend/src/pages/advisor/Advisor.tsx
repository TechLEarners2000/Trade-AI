import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sparkles, TrendingUp, TrendingDown, DollarSign, Search } from 'lucide-react'
import { advisorAPI } from '@/lib/api'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'
import type { RankedStock, StockAnalysis, InvestResult, SellCheckResult } from '@/types'

const recColors: Record<string, string> = {
  BUY: 'bg-green-500/10 text-green-500 border-green-500/20',
  HOLD: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  AVOID: 'bg-red-500/10 text-red-500 border-red-500/20',
}

const sellRecColors: Record<string, string> = {
  BUY_MORE: 'bg-green-500/10 text-green-500 border-green-500/20',
  HOLD: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  SELL: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export default function Advisor() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('')
  const [investAmount, setInvestAmount] = useState<string>('')
  const [investResult, setInvestResult] = useState<InvestResult | null>(null)
  const [investLoading, setInvestLoading] = useState(false)
  const [sellSymbol, setSellSymbol] = useState<string>('')
  const [sellPrice, setSellPrice] = useState<string>('')
  const [sellQty, setSellQty] = useState<string>('')
  const [sellResult, setSellResult] = useState<SellCheckResult | null>(null)
  const [sellLoading, setSellLoading] = useState(false)

  const { data: ranked, isLoading: rankedLoading } = useQuery({
    queryKey: ['advisor-ranked'],
    queryFn: async () => {
      const { data } = await advisorAPI.getRanked()
      return data as RankedStock[]
    },
    refetchInterval: 120000,
  })

  const { data: analysis, isLoading: analysisLoading } = useQuery({
    queryKey: ['advisor-analyze', selectedSymbol],
    queryFn: async () => {
      const { data } = await advisorAPI.analyze(selectedSymbol)
      return data as StockAnalysis
    },
    enabled: !!selectedSymbol,
  })

  const chartData = analysis ? [
    ...analysis.history.map((h) => ({ date: h.date.slice(0, 10), close: h.close })),
    ...analysis.prediction.map((p) => ({ date: p.date.slice(0, 10), predicted_close: p.predicted_close })),
  ] : []

  const todayIndex = analysis ? analysis.history.length - 1 : 0

  const handleInvest = async () => {
    const amount = parseFloat(investAmount)
    if (!amount || amount <= 0) return
    setInvestLoading(true)
    try {
      const { data } = await advisorAPI.suggestInvestment(amount)
      setInvestResult(data as InvestResult)
    } catch {
      setInvestResult(null)
    } finally {
      setInvestLoading(false)
    }
  }

  const handleSellCheck = async () => {
    if (!sellSymbol.trim()) return
    const price = parseFloat(sellPrice)
    const qty = parseFloat(sellQty)
    if (isNaN(price) || isNaN(qty)) return
    setSellLoading(true)
    try {
      const { data } = await advisorAPI.checkSell(sellSymbol.toUpperCase(), price, qty)
      setSellResult(data as SellCheckResult)
    } catch {
      setSellResult(null)
    } finally {
      setSellLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Advisor</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Ranked Stocks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Symbol</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer">Change %</th>
                      <th className="text-center py-3 px-4 font-medium text-muted-foreground">Signal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankedLoading && (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    )}
                    {!rankedLoading && (!ranked || ranked.length === 0) && (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No stocks available</td></tr>
                    )}
                    {ranked?.map((s) => (
                      <tr
                        key={s.symbol}
                        className={`border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer ${
                          selectedSymbol === s.symbol ? 'bg-secondary/50' : ''
                        }`}
                        onClick={() => setSelectedSymbol(s.symbol)}
                      >
                        <td className="py-3 px-4 font-medium">{s.symbol}</td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">{s.company_name}</td>
                        <td className="py-3 px-4 text-right">{formatCurrency(s.price)}</td>
                        <td className={`py-3 px-4 text-right font-medium ${getChangeColor(s.change_percent)}`}>
                          {formatPercent(s.change_percent)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline" className={recColors[s.recommendation] || ''}>
                            {s.recommendation}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {selectedSymbol && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> {selectedSymbol} — Trend & Projection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisLoading && <div className="text-center py-8 text-muted-foreground">Loading analysis...</div>}
                {analysis && !analysisLoading && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div>
                        <span className="text-xs text-muted-foreground">Current Price</span>
                        <div className="text-lg font-bold">{formatCurrency(analysis.current_price)}</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Change</span>
                        <div className={`text-lg font-bold ${getChangeColor(analysis.change_percent)}`}>
                          {formatPercent(analysis.change_percent)}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Signal</span>
                        <Badge variant="outline" className={recColors[analysis.recommendation] || ''}>
                          {analysis.recommendation}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Strength</span>
                        <div className="text-lg font-bold">{analysis.signal_strength}/100</div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">RSI (14)</span>
                        <div className="text-lg font-bold">{analysis.rsi?.toFixed(1)}</div>
                      </div>
                    </div>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 11 }}
                            stroke="hsl(var(--muted-foreground))"
                          />
                          <Tooltip
                            contentStyle={{
                              background: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="close"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={false}
                            name="Price"
                          />
                          {analysis.prediction.length > 0 && (
                            <Line
                              type="monotone"
                              dataKey="predicted_close"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              strokeDasharray="6 4"
                              dot={false}
                              opacity={0.6}
                              name="Projected"
                            />
                          )}
                          <ReferenceLine
                            x={chartData[todayIndex]?.date}
                            stroke="hsl(var(--muted-foreground))"
                            strokeDasharray="4 4"
                            label={{ value: 'Today', position: 'top', fontSize: 11 }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-muted-foreground italic">
                      Projected trend, not a guarantee. Based on linear regression of recent price data.
                    </p>
                    <p className="text-sm text-muted-foreground">{analysis.rationale}</p>
                  </div>
                )}
                {!analysis && !analysisLoading && (
                  <div className="text-center py-8 text-muted-foreground">Select a stock from the list above</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Invest
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Amount (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 100000"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                />
              </div>
              <Button onClick={handleInvest} disabled={investLoading || !investAmount} className="w-full">
                {investLoading ? 'Analyzing...' : 'Suggest Allocation'}
              </Button>
              {investResult && (
                <div className="space-y-3 mt-4">
                  {investResult.suggestions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No suitable BUY candidates found.</p>
                  )}
                  {investResult.suggestions.map((s) => (
                    <div key={s.symbol} className="p-3 rounded-lg bg-secondary/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{s.symbol}</span>
                        <span className="text-xs text-muted-foreground">{s.company_name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Qty: <strong>{s.suggested_qty}</strong></span>
                        <span>{formatCurrency(s.allocated_amount)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.rationale}</p>
                    </div>
                  ))}
                  {investResult.unallocated_amount > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Unallocated: {formatCurrency(investResult.unallocated_amount)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4" /> Sell Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Symbol</label>
                <Input
                  placeholder="e.g. RELIANCE"
                  value={sellSymbol}
                  onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Buy Price (₹)</label>
                <Input
                  type="number"
                  placeholder="e.g. 2500"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Quantity</label>
                <Input
                  type="number"
                  placeholder="e.g. 10"
                  value={sellQty}
                  onChange={(e) => setSellQty(e.target.value)}
                />
              </div>
              <Button onClick={handleSellCheck} disabled={sellLoading || !sellSymbol || !sellPrice || !sellQty} className="w-full">
                {sellLoading ? 'Checking...' : 'Evaluate'}
              </Button>
              {sellResult && 'error' in sellResult && (
                <p className="text-sm text-red-500">{sellResult.error as string}</p>
              )}
              {sellResult && !('error' in sellResult) && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">P&L</span>
                    <span className={`text-lg font-bold ${sellResult.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(sellResult.pnl)} ({sellResult.pnl_percent >= 0 ? '+' : ''}{sellResult.pnl_percent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Price</span>
                    <span className="font-medium">{formatCurrency(sellResult.current_price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Buy Price</span>
                    <span className="font-medium">{formatCurrency(sellResult.buy_price)}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className={sellRecColors[sellResult.sell_recommendation] || ''}>
                      {sellResult.sell_recommendation}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{sellResult.rationale}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
