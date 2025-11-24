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
    <div className="space-y-8">
      {/* Growth Rate Control Section */}
      <div className="bg-navy-800/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h4 className="text-xl font-bold text-white mb-1">Growth Rate Assumption</h4>
            <p className="text-sm text-slate-400">Adjust the annual growth rate to see projections</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-teal-400">{annualGrowthRate}%</p>
            <p className="text-xs text-slate-400 mt-1">per year</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="25"
            value={annualGrowthRate}
            onChange={(e) => setAnnualGrowthRate(Number(e.target.value))}
            className="flex-1 h-2 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            style={{
              background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((annualGrowthRate - 1) / 24) * 100}%, #1e293b ${((annualGrowthRate - 1) / 24) * 100}%, #1e293b 100%)`
            }}
          />
          <div className="flex gap-3 text-xs font-medium text-slate-500">
            <span>1%</span>
            <span>25%</span>
          </div>
        </div>
      </div>

      {/* Projection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* 5-Year Projection */}
        <div className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-white">5-Year Projection</p>
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
              2029
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-emerald-400 mb-4">₹{(projection5 / 100000).toFixed(2)}L</p>
          <div className="space-y-2 pt-3 border-t border-emerald-500/20">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Base:</p>
              <p className="text-sm font-medium text-slate-300">₹{(totalInvested / 100000).toFixed(2)}L</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-emerald-400 font-semibold">Gain:</p>
              <p className="text-sm font-bold text-emerald-400">₹{(gain5 / 100000).toFixed(2)}L</p>
            </div>
          </div>
        </div>

        {/* 10-Year Projection */}
        <div className="group relative bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/30 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-white">10-Year Projection</p>
            <span className="text-xs font-bold bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full border border-teal-500/30">
              2034
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-teal-400 mb-4">₹{(projection10 / 100000).toFixed(2)}L</p>
          <div className="space-y-2 pt-3 border-t border-teal-500/20">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Base:</p>
              <p className="text-sm font-medium text-slate-300">₹{(totalInvested / 100000).toFixed(2)}L</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-teal-400 font-semibold">Gain:</p>
              <p className="text-sm font-bold text-teal-400">₹{(gain10 / 100000).toFixed(2)}L</p>
            </div>
          </div>
        </div>

        {/* 15-Year Projection */}
        <div className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/30 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-white">15-Year Projection</p>
            <span className="text-xs font-bold bg-purple-500/20 text-purple-400 px-3 py-1.5 rounded-full border border-purple-500/30">
              2039
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-purple-400 mb-4">₹{(projection15 / 100000).toFixed(2)}L</p>
          <div className="space-y-2 pt-3 border-t border-purple-500/20">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Base:</p>
              <p className="text-sm font-medium text-slate-300">₹{(totalInvested / 100000).toFixed(2)}L</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-purple-400 font-semibold">Gain:</p>
              <p className="text-sm font-bold text-purple-400">₹{(gain15 / 100000).toFixed(2)}L</p>
            </div>
          </div>
        </div>

        {/* 20-Year Projection */}
        <div className="group relative bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-5 md:p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base md:text-lg font-bold text-white">20-Year Projection</p>
            <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/30">
              2044
            </span>
          </div>
          <p className="text-3xl md:text-4xl font-bold text-orange-400 mb-4">₹{(projection20 / 100000).toFixed(2)}L</p>
          <div className="space-y-2 pt-3 border-t border-orange-500/20">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-400">Base:</p>
              <p className="text-sm font-medium text-slate-300">₹{(totalInvested / 100000).toFixed(2)}L</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-orange-400 font-semibold">Gain:</p>
              <p className="text-sm font-bold text-orange-400">₹{(gain20 / 100000).toFixed(2)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
        <p className="text-sm text-slate-300 flex items-start gap-2">
          <span className="text-blue-400 text-lg flex-shrink-0">ℹ️</span>
          <span>
            <span className="font-semibold text-blue-400">Disclaimer:</span> These projections assume a constant {annualGrowthRate}% annual return. Actual market returns vary. Use this for planning purposes only.
          </span>
        </p>
      </div>
    </div>
  )
}
