'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Edit2, Save, X, Plus, Search } from 'lucide-react'
import type { Portfolio } from '@/types'

interface PortfolioUpdaterProps {
  holdings: Portfolio[]
  onUpdate: () => void
  authToken: string
}

interface StockOption {
  symbol: string
  name: string
}

export function PortfolioUpdater({ holdings, onUpdate, authToken }: PortfolioUpdaterProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StockOption[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null)
  const [addFormData, setAddFormData] = useState({
    quantity: 1,
    average_price: 0,
    purchase_date: new Date().toISOString().split('T')[0]
  })

  const handleEditStart = (holding: Portfolio) => {
    setEditingId(holding.id)
    setEditData({
      quantity: holding.quantity,
      average_price: holding.average_price,
      purchase_date: holding.purchase_date ? new Date(holding.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    })
    setMessage(null)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
    setMessage(null)
  }

  const handleSearchStocks = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })
      if (response.ok) {
        const results = await response.json()
        setSearchResults(results.slice(0, 10))
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectStock = (stock: StockOption) => {
    setSelectedStock(stock)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleAddStock = async () => {
    if (!selectedStock || !addFormData.quantity || !addFormData.average_price) {
      setMessage({ type: 'error', text: 'Please fill all fields' })
      return
    }

    setIsLoading(true)
    const payload = {
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      quantity: parseFloat(addFormData.quantity.toString()),
      price: parseFloat(addFormData.average_price.toString()),
      date: addFormData.purchase_date
    }

    console.log('Adding stock with payload:', payload)
    console.log('Auth token:', authToken)

    try {
      const response = await fetch('/api/portfolio/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      })

      console.log('Portfolio buy response status:', response.status)
      const responseText = await response.text()
      console.log('Portfolio buy response:', responseText)

      if (response.ok) {
        setMessage({ type: 'success', text: `${selectedStock.symbol} added successfully` })
        setSelectedStock(null)
        setAddFormData({
          quantity: 1,
          average_price: 0,
          purchase_date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
        console.log('Stock added, calling onUpdate...')
        setTimeout(() => {
          console.log('Triggering portfolio reload after 1.5s delay')
          onUpdate()
          setMessage(null)
        }, 1500)
      } else {
        console.error('Failed to add stock:', responseText)
        setMessage({ type: 'error', text: `Failed to add stock: ${responseText}` })
      }
    } catch (error) {
      console.error('Error adding stock:', error)
      setMessage({ type: 'error', text: `Error: ${String(error)}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelAdd = () => {
    setShowAddForm(false)
    setSelectedStock(null)
    setSearchQuery('')
    setSearchResults([])
    setAddFormData({
      quantity: 1,
      average_price: 0,
      purchase_date: new Date().toISOString().split('T')[0]
    })
    setMessage(null)
  }

  const handleSave = async (holding: Portfolio) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/portfolio/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          symbol: holding.symbol,
          quantity: editData.quantity,
          average_price: editData.average_price,
          purchase_date: editData.purchase_date
        })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: `${holding.symbol} updated successfully` })
        setEditingId(null)
        setEditData({})
        setTimeout(() => {
          onUpdate()
          setMessage(null)
        }, 1500)
      } else {
        const error = await response.text()
        setMessage({ type: 'error', text: `Failed to update: ${error}` })
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Error: ${String(error)}` })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-navy-800/50 border-slate-700/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">Update Portfolio</h4>
        {!showAddForm && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(true)}
            className="bg-teal-500 hover:bg-teal-600 text-navy-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-teal-400/10 border-teal-400/20 text-teal-400' : 'bg-rose-400/10 border-rose-400/20 text-rose-400'} text-sm`}>
          {message.text}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 bg-teal-400/10 border-teal-400/20 rounded-lg space-y-3">
          <h5 className="font-semibold text-white">Add New Stock</h5>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Search Stock</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock symbol or name..."
                value={searchQuery}
                onChange={(e) => handleSearchStocks(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
              />
            </div>

            {isSearching && (
              <div className="mt-2 text-sm text-slate-400">Searching...</div>
            )}

            {searchResults.length > 0 && !selectedStock && (
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => handleSelectStock(result)}
                    className="w-full text-left p-2 bg-navy-900 border-slate-700 hover:bg-navy-800 transition text-sm"
                  >
                    <p className="font-medium text-white">{result.symbol}</p>
                    <p className="text-slate-400 text-xs">{result.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedStock && (
            <>
              <div className="p-2 bg-navy-900 border-slate-700 rounded">
                <p className="font-medium text-white">{selectedStock.symbol}</p>
                <p className="text-sm text-slate-400">{selectedStock.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addFormData.quantity}
                    onChange={(e) => setAddFormData({ ...addFormData, quantity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={addFormData.average_price}
                    onChange={(e) => setAddFormData({ ...addFormData, average_price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={addFormData.purchase_date}
                    onChange={(e) => setAddFormData({ ...addFormData, purchase_date: e.target.value })}
                    className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelAdd}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleAddStock}
                  disabled={isLoading}
                  className="bg-teal-500 hover:bg-teal-600 text-navy-900"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {isLoading ? 'Adding...' : 'Add Stock'}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {holdings.length === 0 ? (
          <div className="text-slate-400 text-sm py-4 text-center">
            No holdings yet. Click "Add Stock" to get started.
          </div>
        ) : (
          holdings.map((holding) => (
            <div key={holding.id} className="p-4 bg-navy-900 border-slate-700">
              {editingId === holding.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.quantity}
                        onChange={(e) => setEditData({ ...editData, quantity: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Price (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.average_price}
                        onChange={(e) => setEditData({ ...editData, average_price: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        value={editData.purchase_date}
                        onChange={(e) => setEditData({ ...editData, purchase_date: e.target.value })}
                        className="w-full px-3 py-2 border bg-navy-900 border-slate-700 text-white focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSave(holding)}
                      disabled={isLoading}
                      className="bg-teal-500 hover:bg-teal-600 text-navy-900"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{holding.name || holding.symbol}</p>
                    <div className="text-sm text-slate-400 mt-1">
                      <p>Qty: {holding.quantity} | Price: ₹{holding.average_price.toFixed(2)} | Date: {holding.purchase_date ? new Date(holding.purchase_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditStart(holding)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
