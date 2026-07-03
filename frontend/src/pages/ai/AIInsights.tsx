import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bot, Send, Sparkles, BarChart3, Shield, TrendingUp, Lightbulb, MessageSquare } from 'lucide-react'

export default function AIInsights() {
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    const userMsg = message
    setMessage('')
    setChat(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    setTimeout(() => {
      setChat(prev => [...prev, {
        role: 'assistant',
        content: "Based on current market data, I can help analyze stocks, explain technical indicators, or suggest investment ideas. Could you specify what you'd like to know? This is for educational purposes only. Not investment advice."
      }])
      setLoading(false)
    }, 1000)
  }

  const suggestions = [
    'Explain how RSI works',
    'Show fundamentally strong pharma stocks',
    'Analyze today\'s market movement',
    'Generate swing trade ideas',
    'Summarize quarterly results of TCS',
    'What is PE ratio?',
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">AI Insights</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> AI Chat Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide">
                {chat.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-secondary/50 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                {chat.length === 0 && (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Ask me anything about stocks, trading, or investing</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask AI anything about the markets..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button onClick={handleSend} disabled={loading || !message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => { setMessage(s); }}
                className="px-3 py-1.5 text-xs rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Market Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">52</div>
                <Badge variant="warning" className="mt-2">Neutral</Badge>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Greed</span><span>45</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Fear</span><span>38</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Volatility</span><span>22</span></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Consider adding IT exposure',
                'Review pharma sector',
                'Reduce high-debt stocks',
              ].map((s) => (
                <div key={s} className="p-2 text-sm rounded-lg bg-secondary/30">{s}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-4 h-4" /> Portfolio Health
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-500">78</div>
              <p className="text-xs text-muted-foreground mt-1">Good diversification</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
