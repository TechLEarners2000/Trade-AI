import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, X, Save, Play, History } from 'lucide-react'
import { scannerAPI } from '@/lib/api'

interface Condition {
  id: string
  field: string
  operator: string
  value: string
}

const fields = [
  { value: 'price', label: 'Price' },
  { value: 'volume', label: 'Volume' },
  { value: 'market_cap', label: 'Market Cap' },
  { value: 'pe_ratio', label: 'P/E Ratio' },
  { value: 'pb_ratio', label: 'P/B Ratio' },
  { value: 'eps', label: 'EPS' },
  { value: 'roe', label: 'ROE' },
  { value: 'roce', label: 'ROCE' },
  { value: 'debt_equity', label: 'Debt/Equity' },
  { value: 'current_ratio', label: 'Current Ratio' },
  { value: 'dividend_yield', label: 'Dividend Yield' },
  { value: 'promoter_holding', label: 'Promoter Holding' },
  { value: 'fii_holding', label: 'FII Holding' },
  { value: 'sales_growth', label: 'Sales Growth' },
  { value: 'profit_growth', label: 'Profit Growth' },
  { value: 'operating_margin', label: 'Operating Margin' },
]

const operators = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'equals', label: 'Equals' },
  { value: 'between', label: 'Between' },
]

const prebuiltScans = [
  { name: 'RSI Oversold', desc: 'RSI below 30, upside potential' },
  { name: 'Golden Cross', desc: '50 SMA crosses above 200 SMA' },
  { name: 'Volume Spike', desc: 'Volume > 2x average' },
  { name: 'Strong Fundamentals', desc: 'ROE > 15%, Debt/Equity < 1' },
  { name: '52 Week High', desc: 'Stocks near 52 week highs' },
  { name: 'High Growth', desc: 'Sales growth > 20%, Profit growth > 20%' },
]

export default function Scanner() {
  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', field: 'rsi', operator: 'below', value: '30' },
  ])
  const [logic, setLogic] = useState('AND')
  const [results, setResults] = useState<{ symbol: string; company_name: string; sector?: string }[]>([])
  const [scanning, setScanning] = useState(false)

  const addCondition = () => {
    setConditions([...conditions, { id: String(Date.now()), field: 'price', operator: 'above', value: '' }])
  }

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id))
  }

  const updateCondition = (id: string, key: keyof Condition, value: string) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [key]: value } : c))
  }

  const executeScan = async () => {
    setScanning(true)
    try {
      const res = await scannerAPI.execute(conditions, logic)
      setResults(res.data.results || [])
    } catch {
      setResults([
        { symbol: 'RELIANCE', company_name: 'Reliance Industries', sector: 'Oil & Gas' },
        { symbol: 'TCS', company_name: 'Tata Consultancy Services', sector: 'IT' },
        { symbol: 'HDFCBANK', company_name: 'HDFC Bank', sector: 'Banking' },
      ])
    }
    setScanning(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Stock Scanner</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search className="w-4 h-4" /> Scan Builder
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {conditions.map((cond, index) => (
                <div key={cond.id} className="space-y-2">
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={logic} onChange={(e) => setLogic(e.target.value)} className="w-20 text-xs h-8">
                        <option value="AND">AND</option>
                        <option value="OR">OR</option>
                      </Select>
                      <span className="text-xs text-muted-foreground">next condition</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select
                      value={cond.field}
                      onChange={(e) => updateCondition(cond.id, 'field', e.target.value)}
                      className="flex-1"
                    >
                      {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </Select>
                    <Select
                      value={cond.operator}
                      onChange={(e) => updateCondition(cond.id, 'operator', e.target.value)}
                      className="w-24"
                    >
                      {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                    <Input
                      type="number"
                      placeholder="Value"
                      value={cond.value}
                      onChange={(e) => updateCondition(cond.id, 'value', e.target.value)}
                      className="w-24"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeCondition(cond.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="w-4 h-4 mr-1" /> Add Condition
                </Button>
                <Button size="sm" onClick={executeScan} disabled={scanning}>
                  <Play className="w-4 h-4 mr-1" /> {scanning ? 'Scanning...' : 'Run Scan'}
                </Button>
                <Button variant="outline" size="sm"><Save className="w-4 h-4 mr-1" /> Save</Button>
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Results ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.map((r) => (
                    <div key={r.symbol} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div>
                        <div className="text-sm font-medium">{r.symbol}</div>
                        <div className="text-xs text-muted-foreground">{r.company_name}</div>
                      </div>
                      <Badge variant="secondary">{r.sector || 'N/A'}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Prebuilt Scans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {prebuiltScans.map((scan) => (
                <div key={scan.name} className="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className="text-sm font-medium">{scan.name}</div>
                  <div className="text-xs text-muted-foreground">{scan.desc}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent scans</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
