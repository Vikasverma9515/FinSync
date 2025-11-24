'use client'

import { useState } from 'react'
import { Search, TrendingUp, TrendingDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StockSearchDialogProps {
  authToken: string
  onClose: () => void
  onStockAdded?: () => void
}

interface StockResult {
  symbol: string
  name: string
  price?: number
  change?: number
  changePercent?: number
}

export function StockSearchDialog({ authToken, onClose, onStockAdded }: StockSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<StockResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockResult | null>(null)
  const [showBuyForm, setShowBuyForm] = useState(false)
  const [buyData, setBuyData] = useState({
    quantity: 1,
    price: 0,
    date: new Date().toISOString().split('T')[0]
  })
  const [isBuying, setIsBuying] = useState(false)

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
      setBuyData({
        quantity: 1,
        price: data.price || 0,
        date: new Date().toISOString().split('T')[0]
      })
      setShowBuyForm(false)
    } catch (error) {
      console.error('Error fetching stock price:', error)
      setSelectedStock(stock)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyStock = async () => {
    if (!selectedStock || buyData.quantity <= 0 || buyData.price <= 0) {
      alert('Please fill in all fields correctly')
      return
    }

    setIsBuying(true)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/portfolio/buy', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          name: selectedStock.name,
          quantity: parseInt(String(buyData.quantity)),
          price: parseFloat(String(buyData.price)),
          date: buyData.date,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to buy stock')
      }

      console.log('Stock added to portfolio successfully')
      alert(`Successfully added ${buyData.quantity} shares of ${selectedStock.symbol}!`)

      onStockAdded?.()
      onClose()
    } catch (error) {
      console.error('Error buying stock:', error)
      alert(`Failed to add stock: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-navy-900 border border-slate-700 shadow-2xl w-full max-w-md rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full pl-10 pr-4 py-3 bg-navy-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isLoading && !selectedStock && (
              <div className="text-center py-4 text-slate-400">Searching...</div>
            )}

            {!isLoading && results.length === 0 && query && (
              <div className="text-center py-4 text-slate-400">No results found</div>
            )}

            {selectedStock && (
              <div className="p-4 bg-teal-400/10 border border-teal-400/20 rounded-lg">
                <p className="font-semibold text-white mb-1">{selectedStock.symbol}</p>
                <p className="text-sm text-slate-400 mb-3">{selectedStock.name}</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-2xl font-bold text-white">
                    ₹{selectedStock.price?.toFixed(2) || '0.00'}
                  </p>
                  <div className={`flex items-center gap-1 text-sm font-medium ${selectedStock.changePercent! >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
                    {selectedStock.changePercent! >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedStock.changePercent! >= 0 ? '+' : ''}{selectedStock.changePercent?.toFixed(2)}%
                  </div>
                </div>

                {!showBuyForm ? (
                  <Button
                    onClick={() => setShowBuyForm(true)}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-navy-900"
                  >
                    Add to Portfolio
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-300">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={buyData.quantity}
                        onChange={(e) => setBuyData({ ...buyData, quantity: parseInt(e.target.value) || 1 })}
                        className="w-full mt-1 px-3 py-2 bg-navy-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Purchase Price (₹)</label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={buyData.price}
                        onChange={(e) => setBuyData({ ...buyData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 px-3 py-2 bg-navy-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-300">Purchase Date</label>
                      <input
                        type="date"
                        value={buyData.date}
                        onChange={(e) => setBuyData({ ...buyData, date: e.target.value })}
                        className="w-full mt-1 px-3 py-2 bg-navy-800 border border-slate-700 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="pt-2 space-y-2">
                      <Button
                        onClick={handleBuyStock}
                        disabled={isBuying}
                        className="w-full bg-teal-500 hover:bg-teal-600 text-navy-900"
                      >
                        {isBuying ? 'Adding...' : 'Confirm Purchase'}
                      </Button>
                      <Button
                        onClick={() => setShowBuyForm(false)}
                        variant="outline"
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedStock && results.map((result) => (
              <button
                key={result.symbol}
                onClick={() => handleSelectStock(result)}
                className="w-full text-left p-3 hover:bg-navy-800 border-slate-700"
              >
                <div className="font-medium text-white">{result.symbol}</div>
                <div className="text-sm text-slate-400">{result.name}</div>
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
