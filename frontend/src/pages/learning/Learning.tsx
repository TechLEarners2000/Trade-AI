import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap, BookMarked, Search, ChevronRight } from 'lucide-react'

const categories = [
  { name: 'Stock Market Basics', count: 12, icon: GraduationCap },
  { name: 'Technical Analysis', count: 18, icon: BookMarked },
  { name: 'Fundamental Analysis', count: 15, icon: BookMarked },
  { name: 'Candlestick Patterns', count: 20, icon: BookOpen },
  { name: 'Trading Strategies', count: 14, icon: BookOpen },
  { name: 'Investment Guide', count: 10, icon: BookMarked },
  { name: 'Risk Management', count: 8, icon: BookOpen },
  { name: 'Derivatives & Options', count: 16, icon: BookMarked },
]

const glossaryTerms = [
  { term: 'PE Ratio', def: 'Price to Earnings ratio - valuation measure' },
  { term: 'RSI', def: 'Relative Strength Index - momentum indicator' },
  { term: 'Market Cap', def: 'Total market value of company shares' },
  { term: 'Dividend Yield', def: 'Annual dividend as % of stock price' },
  { term: 'Book Value', def: 'Net asset value per share' },
  { term: 'ROE', def: 'Return on Equity - profitability measure' },
]

export default function Learning() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Learn</h1>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search learning content..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Card key={cat.name} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between">
                <cat.icon className="w-8 h-8 text-primary" />
                <Badge variant="secondary">{cat.count} lessons</Badge>
              </div>
              <h3 className="font-medium mt-3 text-sm">{cat.name}</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                <span>Start learning</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Glossary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {glossaryTerms.map((g) => (
              <div key={g.term} className="p-3 rounded-lg bg-secondary/30">
                <div className="text-sm font-medium">{g.term}</div>
                <div className="text-xs text-muted-foreground mt-1">{g.def}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
