'use client'

import { useState } from 'react'
import { Search, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StockSearchDialogProps {
  authToken: string
  onClose: () => void
}

interface StockResult {
  symbol: string
  name: string
  price?: number
  change?: number
  changePercent?: number
}

export function StockSearchDialog({ authToken, onClose }: StockSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockResult | null>(null)

  const handleSearch = async (value: string) => {
    setQuery(value)
    setSelectedStock(null)

    if (value.length < 1) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(value)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectStock = async (stock: StockResult) => {
    setIsLoading(true)
    try {
      const headers: Record<string, string> = {}
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      const response = await fetch(`/api/stocks/quote?symbol=${stock.symbol}`, { headers })
      if (!response.ok) {
        throw new Error(`Failed to fetch price: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`Fetched price for ${stock.symbol}:`, data)
      
      setSelectedStock({
        ...stock,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
      })
    } catch (error) {
      console.error('Error fetching stock price:', error)
      setSelectedStock(stock)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md border border-slate-200 shadow-lg">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoading && !selectedStock && (
              <div className="text-center py-4 text-slate-400">Searching...</div>
            )}
            
            {!isLoading && results.length === 0 && query && (
              <div className="text-center py-4 text-slate-400">No results found</div>
            )}

            {selectedStock && (
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-semibold text-slate-900 mb-1">{selectedStock.symbol}</p>
                <p className="text-sm text-slate-600 mb-3">{selectedStock.name}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold text-slate-900">
                    ₹{selectedStock.price?.toFixed(2) || '0.00'}
                  </p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${selectedStock.changePercent! >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedStock.changePercent! >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedStock.changePercent! >= 0 ? '+' : ''}{selectedStock.changePercent?.toFixed(2)}%
                  </div>
                </div>
              </div>
            )}

            {!selectedStock && results.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleSelectStock(result)}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              >
                <div className="font-medium text-slate-900">{result.symbol}</div>
                <div className="text-sm text-slate-600">{result.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
