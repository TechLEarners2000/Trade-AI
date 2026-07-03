import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, TrendingUp, Search, Star, PieChart,
  Bell, Bot, Newspaper, BookOpen, Settings, Shield,
  BarChart3, LineChart, Activity, Database, LogOut,
  X,
} from 'lucide-react'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/authSlice'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/stocks', icon: TrendingUp, label: 'Stocks' },
  { to: '/scanner', icon: Search, label: 'Scanner' },
  { to: '/charts', icon: BarChart3, label: 'Charts' },
  { to: '/technical-analysis', icon: Activity, label: 'Technical Analysis' },
  { to: '/watchlists', icon: Star, label: 'Watchlists' },
  { to: '/portfolio', icon: PieChart, label: 'Portfolio' },
  { to: '/backtesting', icon: LineChart, label: 'Backtesting' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/ai-insights', icon: Bot, label: 'AI Insights' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/admin', icon: Shield, label: 'Admin' },
]

const bottomItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ open, onClose }: SidebarProps) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: open ? 0 : -300 }}
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 glass border-r border-border/50',
          'lg:translate-x-0 lg:static lg:z-auto',
          'flex flex-col'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TradeAI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link text-sm', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border/50 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn('sidebar-link text-sm', isActive && 'active')
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
          <button onClick={handleLogout} className="sidebar-link text-sm w-full text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
