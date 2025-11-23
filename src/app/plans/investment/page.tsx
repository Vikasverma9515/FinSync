'use client'

import Header from '@/components/Header'
import InvestmentPlannerSuggestor from '@/components/InvestmentPlannerSuggestor'

export default function InvestmentPlanPage() {
    return (
        <div className="min-h-screen bg-navy-900">
            <Header />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <InvestmentPlannerSuggestor onBack={() => window.location.href = '/dashboard'} />
            </div>
        </div>
    )
}
