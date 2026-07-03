import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Plus, Trash2, BellOff, BellRing } from 'lucide-react'

export default function Alerts() {
  const [alerts] = useState([
    { id: '1', type: 'Price Above', stock: 'RELIANCE', condition: 'Price > ₹3,000', active: true, created: '2h ago' },
    { id: '2', type: 'RSI', stock: 'TCS', condition: 'RSI < 30', active: true, created: '1d ago' },
    { id: '3', type: 'Volume', stock: 'HDFCBANK', condition: 'Volume > 2x Avg', active: false, created: '3d ago' },
    { id: '4', type: 'EMA Cross', stock: 'INFY', condition: '20 EMA crosses 50 EMA', active: true, created: '1w ago' },
    { id: '5', type: '52W High', stock: 'ICICIBANK', condition: 'Near 52 week high', active: true, created: '2w ago' },
  ])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alerts</h1>
        <Button size="sm"><Plus className="w-4 h-4 mr-1" /> New Alert</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-lg border ${alert.active ? 'bg-secondary/20 border-border/50' : 'bg-muted/20 border-muted'} flex items-center justify-between`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${alert.active ? 'text-primary' : 'text-muted-foreground'}`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{alert.type}</span>
                        <Badge variant="secondary" className="text-xs">{alert.stock}</Badge>
                        {alert.active ? <Badge variant="success" className="text-xs">Active</Badge> : <Badge variant="secondary" className="text-xs">Paused</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{alert.condition}</div>
                      <div className="text-xs text-muted-foreground mt-1">{alert.created}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {alert.active ? <BellOff className="w-4 h-4" /> : <BellRing className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Price', 'Volume', 'RSI', 'MACD', 'EMA Cross', 'Supertrend', '52W High/Low', 'Breakout', 'Gap Up/Down', 'Pattern', 'News'].map((type) => (
                <div key={type} className="text-sm p-2 rounded-lg hover:bg-secondary/30 cursor-pointer">{type}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent alerts triggered</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
