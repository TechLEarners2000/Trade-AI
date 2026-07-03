import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Star, Trash2, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react'

export default function Watchlists() {
  const [watchlists] = useState([
    { id: '1', name: 'My Watchlist', items: [
      { symbol: 'RELIANCE', price: 2924.50, change: 1.2 },
      { symbol: 'TCS', price: 3890.00, change: -0.5 },
      { symbol: 'HDFCBANK', price: 1678.90, change: 0.8 },
      { symbol: 'INFY', price: 1567.30, change: 2.1 },
      { symbol: 'ICICIBANK', price: 1089.40, change: -0.3 },
    ]},
    { id: '2', name: 'Favorites', items: [
      { symbol: 'TATAMOTORS', price: 789.50, change: 3.2 },
      { symbol: 'WIPRO', price: 456.20, change: -1.1 },
    ]},
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Watchlists</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Watchlist</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {watchlists.map((wl) => (
          <Card key={wl.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <CardTitle className="text-lg">{wl.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">{wl.items.length}</Badge>
              </div>
              <Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {wl.items.map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold">{item.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.symbol}</div>
                        <div className="text-xs text-muted-foreground">₹{item.price.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.change >= 0 ? 'success' : 'destructive'}>
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
