import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const popularStocks = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Oil & Gas', price: 2924.50, change: 1.2 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT', price: 3890.00, change: -0.5 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1678.90, change: 0.8 },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT', price: 1567.30, change: 2.1 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', price: 1089.40, change: -0.3 },
  { symbol: 'ITC', name: 'ITC Limited', sector: 'FMCG', price: 445.60, change: 1.5 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 678.90, change: -1.2 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom', price: 1234.50, change: 2.5 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Banking', price: 1876.30, change: 0.6 },
  { symbol: 'WIPRO', name: 'Wipro Limited', sector: 'IT', price: 456.20, change: -1.1 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', price: 789.50, change: 3.2 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', price: 10234.00, change: -0.8 },
]

const sectors = ['All', 'Banking', 'IT', 'Oil & Gas', 'Auto', 'FMCG', 'Telecom', 'Pharma', 'Metal']

export default function Stocks() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('All')

  const filtered = popularStocks.filter(s => {
    const matchesSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    const matchesSector = sector === 'All' || s.sector === sector
    return matchesSearch && matchesSector
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Stocks</h1>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sectors.map(s => (
            <button key={s} onClick={() => setSector(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                sector === s ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">Symbol</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Sector</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">LTP</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Change</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((stock) => (
                  <tr
                    key={stock.symbol}
                    onClick={() => navigate(`/stocks/${stock.symbol}`)}
                    className="border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="font-medium">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{stock.name}</td>
                    <td className="p-4"><Badge variant="secondary" className="text-xs">{stock.sector}</Badge></td>
                    <td className="p-4 text-right font-medium">₹{stock.price.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <div className={`flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {stock.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span className="font-medium">{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</span>
                      </div>
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
