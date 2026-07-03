import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, TrendingUp, TrendingDown, PieChart, DollarSign, BarChart3 } from 'lucide-react'

export default function Portfolio() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Holding</Button>
          <Button size="sm">Import Holdings</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: '₹12,45,678', change: '+₹45,678 (+3.8%)', icon: DollarSign, up: true },
          { label: 'Total Invested', value: '₹10,00,000', change: '—', icon: BarChart3, up: true },
          { label: 'Total P&L', value: '+₹2,45,678', change: '+24.57%', icon: TrendingUp, up: true },
          { label: 'Div. Income', value: '₹12,450', change: 'YTD', icon: PieChart, up: true },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.up ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className="text-lg font-bold">{s.value}</div>
              <div className={`text-xs ${s.up ? 'text-green-500' : 'text-red-500'}`}>{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 font-medium text-muted-foreground">Stock</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Avg Price</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">LTP</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Invested</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">Current</th>
                  <th className="text-right py-3 font-medium text-muted-foreground">P&L</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { symbol: 'RELIANCE', qty: 50, avg: 2850, ltp: 2924.50 },
                  { symbol: 'TCS', qty: 20, avg: 3850, ltp: 3890.00 },
                  { symbol: 'HDFCBANK', qty: 100, avg: 1650, ltp: 1678.90 },
                  { symbol: 'INFY', qty: 75, avg: 1520, ltp: 1567.30 },
                ].map((h) => {
                  const invested = h.qty * h.avg
                  const current = h.qty * h.ltp
                  const pl = current - invested
                  const plPercent = (pl / invested) * 100
                  return (
                    <tr key={h.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="py-3 font-medium">{h.symbol}</td>
                      <td className="text-right py-3">{h.qty}</td>
                      <td className="text-right py-3">₹{h.avg.toFixed(2)}</td>
                      <td className="text-right py-3">₹{h.ltp.toFixed(2)}</td>
                      <td className="text-right py-3">₹{invested.toLocaleString('en-IN')}</td>
                      <td className="text-right py-3">₹{current.toLocaleString('en-IN')}</td>
                      <td className={`text-right py-3 font-medium ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pl >= 0 ? '+' : ''}₹{pl.toLocaleString('en-IN')} ({plPercent.toFixed(2)}%)
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sector Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { sector: 'Banking', percent: 45, color: 'bg-blue-500' },
                { sector: 'IT', percent: 30, color: 'bg-purple-500' },
                { sector: 'Oil & Gas', percent: 15, color: 'bg-orange-500' },
                { sector: 'Auto', percent: 10, color: 'bg-green-500' },
              ].map((s) => (
                <div key={s.sector}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{s.sector}</span>
                    <span className="text-muted-foreground">{s.percent}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Portfolio Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="text-5xl font-bold text-green-500">78</div>
                <div className="text-sm text-muted-foreground mt-2">Health Score</div>
                <Badge variant="success" className="mt-2">Well Diversified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
