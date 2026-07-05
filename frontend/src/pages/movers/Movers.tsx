import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { dashboardAPI } from '@/lib/api'
import { formatCurrency, formatPercent, getChangeColor } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react'

const SECTORS = ['Banking', 'IT', 'Auto', 'Oil & Gas', 'FMCG', 'Telecom']

export default function Movers() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'gainers' | 'losers'>('gainers')
  const [sectorFilter, setSectorFilter] = useState<string>('')
  const [sortField, setSortField] = useState<'change_percent' | 'price' | 'symbol'>('change_percent')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const { data, isLoading } = useQuery({
    queryKey: ['movers', tab, sectorFilter],
    queryFn: async () => {
      const { data } = await dashboardAPI.getMovers(tab, 200, sectorFilter || undefined)
      return data.data as { symbol: string; company_name: string; sector: string; price: number; change_percent: number }[]
    },
  })

  const sorted = useMemo(() => {
    if (!data) return []
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [data, sortField, sortDir])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'change_percent' ? 'desc' : 'asc')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Top Movers</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border bg-secondary/30 p-0.5">
          <button
            onClick={() => setTab('gainers')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'gainers' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-green-500" /> Gainers
          </button>
          <button
            onClick={() => setTab('losers')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === 'losers' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-red-500" /> Losers
          </button>
        </div>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="h-9 rounded-md border border-border bg-secondary/30 px-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">All Sectors</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                  <th
                    className="text-left py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('symbol')}
                  >
                    Symbol {sortField === 'symbol' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sector</th>
                  <th
                    className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('price')}
                  >
                    Price {sortField === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="text-right py-3 px-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground"
                    onClick={() => toggleSort('change_percent')}
                  >
                    Change % {sortField === 'change_percent' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                )}
                {!isLoading && sorted.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No movers found</td></tr>
                )}
                {sorted.map((m, i) => (
                  <tr
                    key={m.symbol}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/stocks/${m.symbol}`)}
                  >
                    <td className="py-3 px-4 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="py-3 px-4 font-medium">{m.symbol}</td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">{m.company_name}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{m.sector}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(m.price)}</td>
                    <td className={`py-3 px-4 text-right font-medium ${getChangeColor(m.change_percent)}`}>
                      {formatPercent(m.change_percent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
