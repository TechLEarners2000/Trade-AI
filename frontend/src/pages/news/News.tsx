import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Newspaper, ExternalLink } from 'lucide-react'

const categories = ['All', 'Company', 'Sector', 'Market', 'Economy', 'Global']

export default function News() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">News</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((cat) => (
          <button key={cat} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            cat === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
          }`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {[
          { title: 'Nifty hits fresh all-time high above 22,500', source: 'Economic Times', time: '2 hours ago', sentiment: 'positive', category: 'Market' },
          { title: 'RBI keeps repo rate unchanged at 6.5% for seventh consecutive time', source: 'Moneycontrol', time: '4 hours ago', sentiment: 'neutral', category: 'Economy' },
          { title: 'TCS wins $1.5 billion deal from UK-based firm', source: 'NDTV Profit', time: '6 hours ago', sentiment: 'positive', category: 'Company' },
          { title: 'Crude oil prices decline as demand concerns weigh', source: 'Reuters', time: '8 hours ago', sentiment: 'negative', category: 'Global' },
          { title: 'Reliance Industries to invest ₹75,000 crore in green energy', source: 'Livemint', time: '10 hours ago', sentiment: 'positive', category: 'Company' },
          { title: 'IT sector leads rally; Nifty IT up 3%', source: 'Business Standard', time: '12 hours ago', sentiment: 'positive', category: 'Sector' },
          { title: 'Gold prices steady ahead of US Fed meeting', source: 'Bloomberg', time: '14 hours ago', sentiment: 'neutral', category: 'Global' },
          { title: 'SEBI introduces new framework for SME IPOs', source: 'Financial Express', time: '16 hours ago', sentiment: 'neutral', category: 'Economy' },
        ].map((article, i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      article.sentiment === 'positive' ? 'success' :
                      article.sentiment === 'negative' ? 'destructive' : 'secondary'
                    } className="text-[10px] px-1.5">
                      {article.category}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5">{article.source}</Badge>
                  </div>
                  <h3 className="font-medium text-sm md:text-base">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-2">{article.time}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
