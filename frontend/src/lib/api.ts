import axios from 'axios'
import { navigate, triggerLogout } from './navigate'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token!)
    }
  })
  failedQueue = []
}

function redirectToLogin() {
  triggerLogout()
  navigate('/login')
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const hadAuth = !!originalRequest?.headers?.Authorization
    if (error.response?.status === 401 && !originalRequest._retry && hadAuth) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', { refresh_token: refreshToken })
          localStorage.setItem('access_token', data.access_token)
          localStorage.setItem('refresh_token', data.refresh_token)
          processQueue(null, data.access_token)
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`
          return api(originalRequest)
        } catch (err) {
          processQueue(err, null)
          redirectToLogin()
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      } else {
        isRefreshing = false
        redirectToLogin()
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  googleLogin: (idToken: string) => api.post('/auth/google', { id_token: idToken }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  sendOTP: (email: string) => api.post('/auth/otp/send', { email }),
  verifyOTP: (email: string, otp: string) => api.post('/auth/otp/verify', { email, otp }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/me', data),
  changePassword: (data: { current_password: string; new_password: string }) => api.post('/auth/change-password', data),
}

export const stocksAPI = {
  search: (query: string) => api.get(`/stocks/search?query=${query}`),
  getDetail: (symbol: string) => api.get(`/stocks/${symbol}`),
  getPrices: (symbol: string, interval: string = '1D', limit: number = 100) =>
    api.get(`/stocks/${symbol}/prices?interval=${interval}&limit=${limit}`),
  getTechnical: (symbol: string) => api.get(`/stocks/${symbol}/technical`),
  getPatterns: (symbol: string) => api.get(`/stocks/${symbol}/patterns`),
  getFundamentals: (symbol: string) => api.get(`/stocks/${symbol}/fundamentals`),
}

export const dashboardAPI = {
  getOverview: (limit: number = 50) => api.get(`/dashboard/overview?limit=${limit}`),
  getNews: () => api.get('/dashboard/news'),
  getIndices: (historyDays: number = 30) => api.get(`/dashboard/indices?history_days=${historyDays}`),
  getMovers: (type: string = 'gainers', limit: number = 50, sector?: string) =>
    api.get(`/dashboard/market-movers?type=${type}&limit=${limit}${sector ? `&sector=${sector}` : ''}`),
}

export const scannerAPI = {
  execute: (conditions: unknown[], logic: string = 'AND') => api.post('/scanner/execute', { conditions, logic }),
  getPrebuilt: () => api.get('/scanner/prebuilt'),
  getSaved: () => api.get('/scanner/saved'),
  save: (name: string, description: string, scanConfig: unknown) =>
    api.post('/scanner/saved', { name, description, scan_config: scanConfig }),
}

export const watchlistAPI = {
  getAll: () => api.get('/watchlists/'),
  create: (name: string, description?: string) => api.post(`/watchlists/?name=${name}&description=${description || ''}`),
  addItem: (watchlistId: string, stockId: string) => api.post(`/watchlists/${watchlistId}/items?stock_id=${stockId}`),
  removeItem: (watchlistId: string, itemId: string) => api.delete(`/watchlists/${watchlistId}/items/${itemId}`),
  delete: (watchlistId: string) => api.delete(`/watchlists/${watchlistId}`),
}

export const portfolioAPI = {
  getAll: () => api.get('/portfolios/'),
  create: (name: string, initialCapital?: number) => api.post(`/portfolios/?name=${name}&initial_capital=${initialCapital || 0}`),
  getDetail: (id: string) => api.get(`/portfolios/${id}`),
  addHolding: (portfolioId: string, stockId: string, quantity: number, avgPrice: number) =>
    api.post(`/portfolios/${portfolioId}/holdings`, { stock_id: stockId, quantity, average_price: avgPrice }),
  addTransaction: (portfolioId: string, stockId: string, type: string, quantity: number, price: number) =>
    api.post(`/portfolios/${portfolioId}/transactions`, { stock_id: stockId, transaction_type: type, quantity, price }),
}

export const alertsAPI = {
  getAll: () => api.get('/alerts/'),
  create: (alertType: string, condition: unknown, stockId?: string) =>
    api.post('/alerts/', { alert_type: alertType, condition, stock_id: stockId }),
  toggle: (id: string) => api.put(`/alerts/${id}/toggle`),
  delete: (id: string) => api.delete(`/alerts/${id}`),
  getHistory: () => api.get('/alerts/history'),
}

export const backtestAPI = {
  getStrategies: () => api.get('/backtest/strategies'),
  createStrategy: (data: Record<string, unknown>) => api.post('/backtest/strategies', data),
  getResults: (strategyId: string) => api.get(`/backtest/strategies/${strategyId}/results`),
  run: (strategyId: string, symbol: string, startDate: string, endDate: string) =>
    api.post('/backtest/run', { strategy_id: strategyId, symbol, start_date: startDate, end_date: endDate }),
}

export const aiAPI = {
  chat: (message: string, symbol?: string) => api.post('/ai/chat', { message, symbol }),
  analyze: (symbol: string) => api.post('/ai/analyze', { symbol }),
  insights: () => api.post('/ai/insights'),
  portfolioHealth: (holdings: unknown[]) => api.post('/ai/portfolio-health', { holdings }),
}

export const newsAPI = {
  getAll: (category?: string) => api.get(`/news/?${category ? `category=${category}` : ''}`),
  getCompany: (symbol: string) => api.get(`/news/company/${symbol}`),
}

export const learningAPI = {
  getContent: (category?: string) => api.get(`/learning/content?${category ? `category=${category}` : ''}`),
  getContentDetail: (id: string) => api.get(`/learning/content/${id}`),
  getGlossary: (term?: string) => api.get(`/learning/glossary${term ? `?term=${term}` : ''}`),
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  createContent: (data: Record<string, unknown>) => api.post('/admin/learning/content', data),
  getLogs: () => api.get('/admin/logs'),
  getAuditLogs: () => api.get('/admin/audit-logs'),
}

export const advisorAPI = {
  getRanked: (limit: number = 50) => api.get(`/advisor/stocks?limit=${limit}`),
  analyze: (symbol: string) => api.get(`/advisor/analyze/${symbol}`),
  suggestInvestment: (amount: number) => api.post('/advisor/invest', { amount }),
  checkSell: (symbol: string, buyPrice: number, quantity: number) =>
    api.post('/advisor/sell-check', { symbol, buy_price: buyPrice, quantity }),
}
