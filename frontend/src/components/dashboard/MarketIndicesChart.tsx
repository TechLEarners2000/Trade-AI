import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardAPI } from '@/lib/api'
import { formatPercent } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'

interface IndexSnapshot {
  symbol: string
  current_value: number
  change: number
  change_percent: number
  high?: number
  low?: number
  is_up: boolean
}

interface PricePoint {
  date: string
  open: number
  high: number
  low: number
  close: number
}

interface IndicesResponse {
  indices: { name: string; data: IndexSnapshot | null }[]
  history: Record<string, PricePoint[]>
}

const INDEX_CONFIG: Record<string, { label: string; color: string }> = {
  NIFTY:    { label: 'NIFTY 50',   color: '#22c55e' },
  SENSEX:   { label: 'SENSEX',     color: '#3b82f6' },
  BANKNIFTY:{ label: 'BANK NIFTY', color: '#f59e0b' },
  INDIAVIX: { label: 'INDIA VIX',  color: '#ef4444' },
}

const KEYS = ['NIFTY', 'SENSEX', 'BANKNIFTY', 'INDIAVIX'] as const

export default function MarketIndicesChart() {
  const [snapshots, setSnapshots] = useState<Record<string, IndexSnapshot>>({})
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({})
  const [mode, setMode] = useState<'percent' | 'absolute'>('percent')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await dashboardAPI.getIndices(30)
        const data: IndicesResponse = res.data
        if (cancelled) return
        const snap: Record<string, IndexSnapshot> = {}
        for (const item of data.indices) {
          if (item.data) snap[item.name] = item.data
        }
        setSnapshots(snap)
        setHistory(data.history || {})
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const chartData = useMemo(() => {
    const allDates = new Set<string>()
    for (const key of KEYS) {
      for (const pt of history[key] || []) allDates.add(pt.date)
    }
    const sortedDates = Array.from(allDates).sort()

    if (mode === 'percent') {
      return sortedDates.map((date) => {
        const row: Record<string, string | number> = { date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
        for (const key of KEYS) {
          const pts = history[key] || []
          if (pts.length > 0) {
            const base = pts[0].close
            const current = pts.find((p) => p.date === date)?.close ?? base
            row[key] = +((current - base) / base * 100).toFixed(2)
          }
        }
        return row
      })
    }

    return sortedDates.map((date) => {
      const row: Record<string, string | number> = { date: new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
      for (const key of KEYS) {
        const pts = history[key] || []
        const pt = pts.find((p) => p.date === date)
        if (pt) row[key] = +pt.close.toFixed(2)
      }
      return row
    })
  }, [history, mode])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Market Indices</CardTitle>
        <div className="flex rounded-lg border bg-secondary/30 p-0.5">
          <button
            onClick={() => setMode('percent')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'percent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            % Change
          </button>
          <button
            onClick={() => setMode('absolute')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'absolute' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Absolute
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {KEYS.map((key) => {
            const s = snapshots[key]
            if (!s) return null
            const cfg = INDEX_CONFIG[key]
            return (
              <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground truncate">{cfg.label}</div>
                  <div className="text-sm font-bold">
                    {s.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs ${s.is_up ? 'text-green-500' : 'text-red-500'}`}>
                    {s.is_up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{formatPercent(s.change_percent)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => mode === 'percent' ? `${v}%` : v.toLocaleString('en-IN')}
                width={mode === 'percent' ? 45 : 70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => {
                  const cfg = INDEX_CONFIG[name]
                  const label = cfg?.label || name
                  if (mode === 'percent') return [`${value.toFixed(2)}%`, label]
                  return [value.toLocaleString('en-IN', { minimumFractionDigits: 2 }), label]
                }}
                labelFormatter={(label: string) => label}
              />
              <Legend
                formatter={(value: string) => INDEX_CONFIG[value]?.label || value}
                wrapperStyle={{ fontSize: '11px' }}
              />
              {KEYS.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={INDEX_CONFIG[key].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
