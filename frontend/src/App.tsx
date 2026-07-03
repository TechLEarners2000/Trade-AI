import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/dashboard/Dashboard'
import Stocks from '@/pages/stock/Stocks'
import StockDetail from '@/pages/stock/StockDetail'
import Charts from '@/pages/charts/Charts'
import TechnicalAnalysis from '@/pages/technical/TechnicalAnalysis'
import Scanner from '@/pages/scanner/Scanner'
import Watchlists from '@/pages/watchlist/Watchlists'
import Portfolio from '@/pages/portfolio/Portfolio'
import Backtesting from '@/pages/backtesting/Backtesting'
import Alerts from '@/pages/alerts/Alerts'
import AIInsights from '@/pages/ai/AIInsights'
import News from '@/pages/news/News'
import Learning from '@/pages/learning/Learning'
import Admin from '@/pages/admin/Admin'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!user?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="stocks/:symbol" element={<StockDetail />} />
            <Route path="charts" element={<Charts />} />
            <Route path="technical-analysis" element={<TechnicalAnalysis />} />
            <Route path="scanner" element={<Scanner />} />
            <Route path="watchlists" element={<Watchlists />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="backtesting" element={<Backtesting />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="ai-insights" element={<AIInsights />} />
            <Route path="news" element={<News />} />
            <Route path="learn" element={<Learning />} />
            <Route path="admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
