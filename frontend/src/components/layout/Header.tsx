import { Menu, Bell, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { useState, useEffect, useRef } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ symbol: string; company_name: string }[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    try {
      const { default: api } = await import('@/lib/api')
      const { data } = await api.get(`/stocks/search?query=${query}`)
      setSearchResults(data.slice(0, 8))
    } catch {
      setSearchResults([])
    }
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="w-5 h-5" />
          </Button>

          <div ref={searchRef} className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stocks, sectors..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-80 pl-9 bg-secondary/50 border-0 focus-visible:bg-background"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  navigate(`/stocks/${searchQuery.toUpperCase()}`)
                  setSearchResults([])
                  setSearchQuery('')
                }
              }}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full glass border border-border/50 rounded-lg overflow-hidden shadow-xl">
                {searchResults.map((r) => (
                  <button
                    key={r.symbol}
                    className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors flex items-center gap-3"
                    onClick={() => {
                      navigate(`/stocks/${r.symbol}`)
                      setSearchResults([])
                      setSearchQuery('')
                    }}
                  >
                    <span className="font-medium text-sm">{r.symbol}</span>
                    <span className="text-muted-foreground text-xs truncate">{r.company_name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
