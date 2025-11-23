'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import TaxSaverPlanner from '@/components/TaxSaverPlanner'

export default function TaxSaverPage() {
    const router = useRouter()

    const handleBack = () => {
        router.push('/dashboard')
    }

    return (
        <div className="min-h-screen bg-navy-900">
            <Header />
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <TaxSaverPlanner onBack={handleBack} />
            </div>
        </div>
    )
}
