import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const indicators = [
  { name: 'SMA (20)', value: '2,345.60', signal: 'bullish', desc: 'Price above SMA' },
  { name: 'SMA (50)', value: '2,290.45', signal: 'bullish', desc: 'Price above SMA' },
  { name: 'EMA (20)', value: '2,340.20', signal: 'bullish', desc: 'Price above EMA' },
  { name: 'RSI (14)', value: '54.23', signal: 'neutral', desc: 'Range 30-70' },
  { name: 'MACD', value: '12.45', signal: 'bullish', desc: 'Above signal line' },
  { name: 'ADX (14)', value: '28.50', signal: 'trending', desc: 'Trending market' },
  { name: 'Bollinger Bands', value: 'Middle', signal: 'neutral', desc: 'Price at middle' },
  { name: 'Stochastic RSI', value: '0.45', signal: 'neutral', desc: 'Mid-range' },
  { name: 'MFI (14)', value: '52.30', signal: 'neutral', desc: 'No divergence' },
  { name: 'OBV', value: 'Rising', signal: 'bullish', desc: 'Volume confirms' },
]

export default function TechnicalAnalysis() {
  const getSignalIcon = (signal: string) => {
    if (signal === 'bullish') return <TrendingUp className="w-4 h-4 text-green-500" />
    if (signal === 'bearish') return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-yellow-500" />
  }

  const getSignalBadge = (signal: string) => {
    if (signal === 'bullish') return <Badge variant="success">Bullish</Badge>
    if (signal === 'bearish') return <Badge variant="destructive">Bearish</Badge>
    return <Badge variant="warning">Neutral</Badge>
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Technical Analysis</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicators.map((ind) => (
          <Card key={ind.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{ind.name}</span>
                {getSignalIcon(ind.signal)}
              </div>
              <div className="text-lg font-bold mb-1">{ind.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{ind.desc}</span>
                {getSignalBadge(ind.signal)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chart Patterns Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { pattern: 'Double Bottom', direction: 'Bullish', confidence: '78%' },
              { pattern: 'Bullish Engulfing', direction: 'Bullish', confidence: '85%' },
              { pattern: 'Support @ ₹2,280', direction: 'Key Level', confidence: '-' },
            ].map((p) => (
              <div key={p.pattern} className="p-3 rounded-lg bg-secondary/30">
                <div className="text-sm font-medium">{p.pattern}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={p.direction === 'Bullish' ? 'success' : p.direction === 'Bearish' ? 'destructive' : 'secondary'} className="text-xs">
                    {p.direction}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {p.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
