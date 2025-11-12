'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface SellStockDialogProps {
  symbol: string
  name: string
  currentPrice: number
  quantity: number
  averagePrice: number
  onClose: () => void
  onSuccess: () => void
}

export function SellStockDialog({
  symbol,
  name,
  currentPrice,
  quantity,
  averagePrice,
  onClose,
  onSuccess,
}: SellStockDialogProps) {
  const [sellQuantity, setSellQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSell = async () => {
    if (!sellQuantity || parseInt(sellQuantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (parseInt(sellQuantity) > quantity) {
      setError('Cannot sell more than you own')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/portfolio/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          quantity: parseInt(sellQuantity),
          price: currentPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to sell stock')
      } else {
        onSuccess()
        onClose()
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const sellValue = parseInt(sellQuantity || '0') * currentPrice
  const gain = (currentPrice - averagePrice) * parseInt(sellQuantity || '0')
  const gainPercent = averagePrice > 0 ? ((currentPrice - averagePrice) / averagePrice) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{symbol}</h2>
            <p className="text-sm text-slate-400">{name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Current Price
              </label>
              <div className="text-lg font-bold text-white">₹{currentPrice.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Avg Price
              </label>
              <div className="text-lg font-bold text-slate-300">₹{averagePrice.toFixed(2)}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Held
              </label>
              <div className="text-lg font-bold text-white">{quantity}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Gain/Loss
              </label>
              <div className={`text-lg font-bold ${gain >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {gain >= 0 ? '+' : ''}₹{gain.toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity to Sell
            </label>
            <input
              type="number"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(e.target.value)}
              placeholder="Enter number of shares"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              min="1"
              max={quantity}
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Sell Value:</span>
              <span className="text-white font-medium">₹{sellValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Gain/Loss:</span>
              <span className={gain >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {gain >= 0 ? '+' : ''}₹{gain.toFixed(2)} ({gainPercent.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleSell} disabled={isLoading} className="flex-1">
              {isLoading ? 'Selling...' : 'Sell'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
