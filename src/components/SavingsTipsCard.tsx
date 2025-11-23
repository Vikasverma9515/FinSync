'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Lightbulb, Coffee, Car, Smartphone, Home, ShoppingCart } from 'lucide-react'

interface SavingsTip {
    category: string
    icon: any
    tip: string
    potentialSavings: string
    color: string
}

interface SavingsTipsProps {
    monthlyIncome: number
}

const SavingsTipsCard: React.FC<SavingsTipsProps> = ({ monthlyIncome }) => {
    const tips: SavingsTip[] = [
        {
            category: 'Food & Dining',
            icon: Coffee,
            tip: 'Cook at home 5 days a week instead of ordering out',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.05).toLocaleString()}/month`,
            color: 'text-amber-400',
        },
        {
            category: 'Transportation',
            icon: Car,
            tip: 'Use public transport or carpool 3 days a week',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.03).toLocaleString()}/month`,
            color: 'text-blue-400',
        },
        {
            category: 'Subscriptions',
            icon: Smartphone,
            tip: 'Cancel unused subscriptions and negotiate better plans',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.02).toLocaleString()}/month`,
            color: 'text-purple-400',
        },
        {
            category: 'Utilities',
            icon: Home,
            tip: 'Switch to energy-efficient appliances and monitor usage',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.015).toLocaleString()}/month`,
            color: 'text-green-400',
        },
        {
            category: 'Shopping',
            icon: ShoppingCart,
            tip: 'Wait 24 hours before non-essential purchases',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.04).toLocaleString()}/month`,
            color: 'text-pink-400',
        },
    ]

    const totalPotentialSavings = monthlyIncome * (0.05 + 0.03 + 0.02 + 0.015 + 0.04)

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Smart Savings Tips
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Simple changes that could save you ₹{Math.round(totalPotentialSavings).toLocaleString()}/month
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tips.map((tip, index) => {
                        const Icon = tip.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-teal-500/30 transition-all duration-200"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 bg-slate-700/30 rounded-lg ${tip.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h4 className="text-white font-medium">{tip.category}</h4>
                                            <span className="text-teal-400 font-semibold text-sm">
                                                {tip.potentialSavings}
                                            </span>
                                        </div>
                                        <p className="text-slate-300 text-sm">{tip.tip}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Total savings highlight */}
                <div className="mt-4 bg-gradient-to-r from-teal-500/10 to-green-500/10 border border-teal-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Potential Savings</p>
                            <p className="text-2xl font-bold text-teal-400">
                                ₹{Math.round(totalPotentialSavings).toLocaleString()}/month
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-slate-400 text-sm">Per Year</p>
                            <p className="text-xl font-bold text-white">
                                ₹{Math.round(totalPotentialSavings * 12).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-300 text-sm mt-3">
                        💡 Implementing just 3 of these tips could boost your savings by{' '}
                        <span className="text-teal-400 font-semibold">
                            {((totalPotentialSavings * 0.6 / monthlyIncome) * 100).toFixed(1)}%
                        </span>
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default SavingsTipsCard
