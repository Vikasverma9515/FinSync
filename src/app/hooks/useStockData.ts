import { useState, useEffect } from 'react'
import { StockData } from '@/types/stock' 
import { investmentDataService } from '@/lib/investmentDataService'

export function useStockData(symbol: string) {
  const [data, setData] = useState<StockData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const stockData = await investmentDataService.getCompleteStockData(symbol)
        if (stockData) {
          setData(stockData)
        } else {
          setError('Failed to fetch stock data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [symbol])

  return { data, loading, error }
}

export function usePopularStocks() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await investmentDataService.getPopularStocks()
        setStocks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stocks')
      } finally {
        setLoading(false)
      }
    }

    fetchStocks()
  }, [])

  return { stocks, loading, error }
}