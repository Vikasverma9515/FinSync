'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StockSearchDialogProps {
  onSelect: (symbol: string, name: string) => void
  onClose: () => void
}

export function StockSearchDialog({ onSelect, onClose }: StockSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Array<{ symbol: string; name: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setQuery(value)

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg w-full max-w-md border border-slate-700">
        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search stocks..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {isLoading && (
              <div className="text-center py-4 text-slate-400">Searching...</div>
            )}
            
            {!isLoading && results.length === 0 && query && (
              <div className="text-center py-4 text-slate-400">No results found</div>
            )}

            {results.map((result) => (
              <button
                key={result.symbol}
                onClick={() => {
                  onSelect(result.symbol, result.name)
                  onClose()
                }}
                className="w-full text-left p-3 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <div className="font-medium text-white">{result.symbol}</div>
                <div className="text-sm text-slate-400">{result.name}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
