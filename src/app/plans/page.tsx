'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import InvestmentPlannerSuggestor from '@/components/InvestmentPlannerSuggestor'
import FinancialFreedomPlanner from '@/components/FinancialFreedomPlanner'
import { Button } from '@/components/ui/button'
import { Target, TrendingUp, Sparkles } from 'lucide-react'

export default function PlansPage() {
  const [activePlanner, setActivePlanner] = useState<'investment' | 'freedom'>('investment')

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <div className="border-b border-slate-200 bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex gap-3">
            <Button
              onClick={() => setActivePlanner('investment')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                activePlanner === 'investment'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Investment Planner
            </Button>
            <Button
              onClick={() => setActivePlanner('freedom')}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition ${
                activePlanner === 'freedom'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Financial Freedom Planner
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {activePlanner === 'investment' ? (
          <InvestmentPlannerSuggestor onBack={() => window.history.back()} />
        ) : (
          <FinancialFreedomPlanner onBack={() => window.history.back()} />
        )}
      </div>
    </div>
  )
}