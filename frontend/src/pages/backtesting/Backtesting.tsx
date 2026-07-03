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
