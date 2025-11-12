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
    <div className="min-h-screen bg-white">
      <Header />

      {/* Planner Selection */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <Button
              variant={activePlanner === 'investment' ? 'default' : 'outline'}
              onClick={() => setActivePlanner('investment')}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Investment Planner
            </Button>
            <Button
              variant={activePlanner === 'freedom' ? 'default' : 'outline'}
              onClick={() => setActivePlanner('freedom')}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Financial Freedom Planner
            </Button>
          </div>
        </div>
      </div>

      {/* Planner Content */}
      {activePlanner === 'investment' ? (
        <InvestmentPlannerSuggestor onBack={() => window.history.back()} />
      ) : (
        <FinancialFreedomPlanner onBack={() => window.history.back()} />
      )}
    </div>
  )
}