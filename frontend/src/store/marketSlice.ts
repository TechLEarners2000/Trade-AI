import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface LivePrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  close: number
  volume: number
  timestamp: string
}

export interface IndexData {
  symbol: string
  current_value: number
  change: number
  change_percent: number
  high: number
  low: number
  is_up: boolean
}

interface MarketState {
  prices: Record<string, LivePrice>
  indices: Record<string, IndexData>
  connected: boolean
  lastUpdate: string | null
}

const initialState: MarketState = {
  prices: {},
  indices: {},
  connected: false,
  lastUpdate: null,
}

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload
    },
    updatePrice(state, action: PayloadAction<LivePrice>) {
      const p = action.payload
      state.prices[p.symbol] = p
      state.lastUpdate = p.timestamp
    },
    updateIndexData(state, action: PayloadAction<IndexData>) {
      const idx = action.payload
      state.indices[idx.symbol] = idx
      state.lastUpdate = new Date().toISOString()
    },
    updateIndices(state, action: PayloadAction<IndexData[]>) {
      action.payload.forEach((idx) => {
        state.indices[idx.symbol] = idx
      })
      state.lastUpdate = new Date().toISOString()
    },
  },
})

export const { setConnected, updatePrice, updateIndexData, updateIndices } = marketSlice.actions
export default marketSlice.reducer
