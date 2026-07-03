import { useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi, CandlestickSeriesPartialOptions, HistogramSeriesPartialOptions } from 'lightweight-charts'
import { StockPrice } from '@/types'

interface TradingViewChartProps {
  data: StockPrice[]
  symbol?: string
  height?: number
}

export default function TradingViewChart({ data, symbol, height = 400 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const container = containerRef.current
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#a0a0a0',
      },
      grid: {
        vertLines: { color: '#1a1a2e' },
        horzLines: { color: '#1a1a2e' },
      },
      width: container.clientWidth,
      height,
      crosshair: {
        mode: 0,
      },
      timeScale: {
        borderColor: '#2a2a3e',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2a3e',
      },
    })
    chartRef.current = chart

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    } as CandlestickSeriesPartialOptions)

    const volumeSeries = chart.addHistogramSeries({
      color: '#6366f1',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    } as HistogramSeriesPartialOptions)

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    const cdlData = data.map((d) => ({
      time: (new Date(d.date).getTime() / 1000) as any,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    const volData = data.map((d) => ({
      time: (new Date(d.date).getTime() / 1000) as any,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)',
    }))

    candleSeries.setData(cdlData)
    volumeSeries.setData(volData)
    chart.timeScale().fitContent()

    const handleResize = () => {
      if (container) {
        chart.applyOptions({ width: container.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
    }
  }, [data, height])

  return (
    <div ref={containerRef} className="w-full" style={{ height }} />
  )
}
