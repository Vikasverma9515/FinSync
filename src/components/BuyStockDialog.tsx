'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface BuyStockDialogProps {
  symbol: string
  name: string
  currentPrice: number
  onClose: () => void
  onSuccess: () => void
}

export function BuyStockDialog({ symbol, name, currentPrice, onClose, onSuccess }: BuyStockDialogProps) {
  const [quantity, setQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBuy = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/portfolio/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          name,
          quantity: parseInt(quantity),
          price: currentPrice,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to buy stock')
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

  const totalCost = parseInt(quantity || '0') * currentPrice

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
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Current Price
            </label>
            <div className="text-2xl font-bold text-emerald-400">
              ₹{currentPrice.toFixed(2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of shares"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              min="1"
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Total Cost:</span>
              <span className="text-white font-medium">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleBuy} disabled={isLoading} className="flex-1">
              {isLoading ? 'Buying...' : 'Buy'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
