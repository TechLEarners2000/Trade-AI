import { useEffect, useRef, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { setConnected, updatePrice, updateIndexData, updateIndices, LivePrice, IndexData } from '@/store/marketSlice'

type WSMessage = Record<string, unknown>

export function useWebSocket() {
  const dispatch = useDispatch()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectRef = useRef<number>(0)

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    const url = `${protocol}//${host}/ws/market`

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      dispatch(setConnected(true))
      reconnectRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const data: WSMessage = JSON.parse(event.data)
        const symbol = data.symbol as string | undefined

        if (symbol && data.open !== undefined) {
          const price: LivePrice = {
            symbol,
            price: Number(data.close) || 0,
            change: 0,
            changePercent: 0,
            open: Number(data.open) || 0,
            high: Number(data.high) || 0,
            low: Number(data.low) || 0,
            close: Number(data.close) || 0,
            volume: Number(data.volume) || 0,
            timestamp: (data.date as string) || new Date().toISOString(),
          }
          dispatch(updatePrice(price))
        }

        if (data.type === 'indices') {
          const indicesData = data.data as Record<string, {
            current: number
            change: number
            change_percent: number
            high: number
            low: number
          }> | undefined
          if (indicesData) {
            const list: IndexData[] = Object.entries(indicesData).map(([key, val]) => ({
              symbol: key,
              current_value: val.current,
              change: val.change,
              change_percent: val.change_percent,
              high: val.high,
              low: val.low,
              is_up: val.change >= 0,
            }))
            dispatch(updateIndices(list))
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.onclose = () => {
      dispatch(setConnected(false))
      wsRef.current = null
      reconnectRef.current++
      const delay = Math.min(1000 * reconnectRef.current, 30000)
      setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [dispatch])

  const subscribe = useCallback((symbol: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', symbol }))
    }
  }, [])

  const unsubscribe = useCallback((symbol: string) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe', symbol }))
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return { subscribe, unsubscribe }
}
