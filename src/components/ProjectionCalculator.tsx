'use client'

import { useState } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Portfolio } from '@/types'
import type { StockQuote } from '@/lib/stocks'

interface ProjectionCalculatorProps {
  holdings: (Portfolio & { quote?: StockQuote })[]
}

export function ProjectionCalculator({ holdings }: ProjectionCalculatorProps) {
  const [annualGrowthRate, setAnnualGrowthRate] = useState(12)
  
  const totalInvested = holdings.reduce(
    (sum, h) => sum + h.quantity * h.average_price,
    0
  )

  const calculateProjection = (years: number, rate: number) => {
    return totalInvested * Math.pow(1 + rate / 100, years)
  }

  const projection5 = calculateProjection(5, annualGrowthRate)
  const projection10 = calculateProjection(10, annualGrowthRate)
  const projection15 = calculateProjection(15, annualGrowthRate)
  const projection20 = calculateProjection(20, annualGrowthRate)

  const gain5 = projection5 - totalInvested
  const gain10 = projection10 - totalInvested
  const gain15 = projection15 - totalInvested
  const gain20 = projection20 - totalInvested

  if (holdings.length === 0) {
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-semibold text-slate-900">Growth Rate Assumption</h4>
            <p className="text-sm text-slate-600">Adjust the annual growth rate to see projections</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-4 py-3 rounded-xl border border-blue-200">
            <p className="text-3xl font-bold text-blue-600">{annualGrowthRate}%</p>
            <p className="text-xs text-slate-600">per year</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="25"
            value={annualGrowthRate}
            onChange={(e) => setAnnualGrowthRate(Number(e.target.value))}
            className="flex-1 h-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex gap-2 text-xs font-medium text-slate-600">
            <span>1%</span>
            <span>25%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-700 font-semibold">5-Year Projection</p>
            <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full">2029</span>
          </div>
          <p className="text-3xl font-bold text-emerald-600 mb-2">₹{(projection5 / 100000).toFixed(2)}L</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Base: ₹{(totalInvested / 100000).toFixed(2)}L</p>
            <p className="text-sm font-semibold text-emerald-600">Gain: ₹{(gain5 / 100000).toFixed(2)}L</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-700 font-semibold">10-Year Projection</p>
            <span className="text-xs font-bold bg-blue-200 text-blue-800 px-3 py-1 rounded-full">2034</span>
          </div>
          <p className="text-3xl font-bold text-blue-600 mb-2">₹{(projection10 / 100000).toFixed(2)}L</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Base: ₹{(totalInvested / 100000).toFixed(2)}L</p>
            <p className="text-sm font-semibold text-blue-600">Gain: ₹{(gain10 / 100000).toFixed(2)}L</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-700 font-semibold">15-Year Projection</p>
            <span className="text-xs font-bold bg-purple-200 text-purple-800 px-3 py-1 rounded-full">2039</span>
          </div>
          <p className="text-3xl font-bold text-purple-600 mb-2">₹{(projection15 / 100000).toFixed(2)}L</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Base: ₹{(totalInvested / 100000).toFixed(2)}L</p>
            <p className="text-sm font-semibold text-purple-600">Gain: ₹{(gain15 / 100000).toFixed(2)}L</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-5 hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-700 font-semibold">20-Year Projection</p>
            <span className="text-xs font-bold bg-orange-200 text-orange-800 px-3 py-1 rounded-full">2044</span>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-2">₹{(projection20 / 100000).toFixed(2)}L</p>
          <div className="space-y-1">
            <p className="text-sm text-slate-600">Base: ₹{(totalInvested / 100000).toFixed(2)}L</p>
            <p className="text-sm font-semibold text-orange-600">Gain: ₹{(gain20 / 100000).toFixed(2)}L</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-sm text-slate-700">
          <span className="font-semibold">ℹ️ Disclaimer:</span> These projections assume a constant {annualGrowthRate}% annual return. Actual market returns vary. Use this for planning purposes only.
        </p>
      </div>
    </div>
  )
}
