'use client'

import { useState } from 'react'
import { Trash2, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Portfolio } from '@/types'
import type { StockQuote } from '@/lib/stocks'

interface PortfolioManagerProps {
  holdings: (Portfolio & { quote?: StockQuote })[]
  onStockRemoved?: () => void
  authToken?: string
}

export function PortfolioManager({ holdings, onStockRemoved, authToken }: PortfolioManagerProps) {
  const [selectedStock, setSelectedStock] = useState<Portfolio | null>(null)
  const [showSellForm, setShowSellForm] = useState(false)
  const [sellData, setSellData] = useState({
    quantity: 1,
    price: 0,
  })
  const [isSelling, setIsSelling] = useState(false)

  const handleSellStock = async () => {
    if (!selectedStock || sellData.quantity <= 0 || sellData.price <= 0) {
      alert('Please fill in all fields correctly')
      return
    }

    if (sellData.quantity > selectedStock.quantity) {
      alert(`Cannot sell more than ${selectedStock.quantity} shares`)
      return
    }

    setIsSelling(true)
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }

      const response = await fetch('/api/portfolio/sell', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          quantity: parseInt(String(sellData.quantity)),
          price: parseFloat(String(sellData.price)),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to sell stock')
      }

      console.log('Stock removed from portfolio successfully')
      alert(`Successfully sold ${sellData.quantity} shares of ${selectedStock.symbol}!`)

      setShowSellForm(false)
      setSelectedStock(null)
      onStockRemoved?.()
    } catch (error) {
      console.error('Error selling stock:', error)
      alert(`Failed to sell stock: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSelling(false)
    }
  }

  const handleSelectStock = (holding: Portfolio & { quote?: StockQuote }) => {
    setSelectedStock(holding)
    setSellData({
      quantity: 1,
      price: holding.current_price || holding.average_price,
    })
    setShowSellForm(false)
  }

  if (holdings.length === 0) {
    return (
      <Card className="bg-navy-800/50 border-slate-700/50 shadow-sm">
        <div className="text-center py-8 text-slate-400">
          <p>No stocks in portfolio. Add one to get started!</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-navy-800/50 border-slate-700/50 shadow-sm">
      <h4 className="text-lg font-semibold text-white mb-4">Portfolio Holdings</h4>
      <div className="space-y-2">
        {holdings.map((holding) => (
          <div key={holding.symbol} className="p-3 bg-navy-900 border-slate-700 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-white font-medium">{holding.symbol}</p>
              <p className="text-slate-400 text-sm">
                {holding.quantity} shares @ ₹{holding.average_price.toFixed(2)}
              </p>
            </div>
            <div className="text-right mr-3">
              <p className="text-white font-semibold">₹{(holding.quantity * holding.average_price).toFixed(2)}</p>
              <p className="text-slate-400 text-xs">Total invested</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSelectStock(holding)}
              className="text-rose-400 hover:bg-rose-400/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {selectedStock && (
        <div className="mt-6 p-4 bg-rose-400/10 border-rose-400/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-rose-400" />
            <h5 className="font-semibold text-white">Sell {selectedStock.symbol}</h5>
          </div>

          {!showSellForm ? (
            <Button
              onClick={() => setShowSellForm(true)}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            >
              Proceed to Sell
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-300">Quantity to Sell (Max: {selectedStock.quantity})</label>
                <input
                  type="number"
                  min="1"
                  max={selectedStock.quantity}
                  value={sellData.quantity}
                  onChange={(e) => setSellData({ ...sellData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full mt-1 px-3 py-2 border bg-navy-800 border-slate-700 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300">Selling Price (₹)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={sellData.price}
                  onChange={(e) => setSellData({ ...sellData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 border bg-navy-800 border-slate-700 text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
              <div className="p-2 bg-navy-900 rounded text-sm">
                <p className="text-slate-300">
                  Profit/Loss: <span className={sellData.price * sellData.quantity - selectedStock.average_price * sellData.quantity >= 0 ? 'text-teal-400 font-semibold' : 'text-rose-400 font-semibold'}>
                    ₹{(sellData.price * sellData.quantity - selectedStock.average_price * sellData.quantity).toFixed(2)}
                  </span>
                </p>
              </div>
              <div className="pt-2 space-y-2">
                <Button
                  onClick={handleSellStock}
                  disabled={isSelling}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                >
                  {isSelling ? 'Selling...' : 'Confirm Sale'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSellForm(false)
                    setSelectedStock(null)
                  }}
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
    </Card>
  )
}
