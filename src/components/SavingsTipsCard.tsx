'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Lightbulb, Coffee, Car, Smartphone, Home, ShoppingCart, ArrowUpRight } from 'lucide-react'

interface SavingsTip {
    category: string
    icon: any
    tip: string
    potentialSavings: string
    color: string
    bg: string
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
            potentialSavings: `₹${Math.round(monthlyIncome * 0.05).toLocaleString()}`,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
        },
        {
            category: 'Transportation',
            icon: Car,
            tip: 'Use public transport or carpool 3 days a week',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.03).toLocaleString()}`,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
        },
        {
            category: 'Subscriptions',
            icon: Smartphone,
            tip: 'Cancel unused subscriptions and negotiate better plans',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.02).toLocaleString()}`,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
        },
        {
            category: 'Utilities',
            icon: Home,
            tip: 'Switch to energy-efficient appliances and monitor usage',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.015).toLocaleString()}`,
            color: 'text-green-400',
            bg: 'bg-green-500/10',
        },
        {
            category: 'Shopping',
            icon: ShoppingCart,
            tip: 'Wait 24 hours before non-essential purchases',
            potentialSavings: `₹${Math.round(monthlyIncome * 0.04).toLocaleString()}`,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
        },
    ]

    const totalPotentialSavings = monthlyIncome * (0.05 + 0.03 + 0.02 + 0.015 + 0.04)

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                    Smart Savings Tips
                </CardTitle>
                <p className="text-slate-400 text-sm mt-1">
                    Simple changes that could save you <span className="text-teal-400 font-semibold">₹{Math.round(totalPotentialSavings).toLocaleString()}/month</span>
                </p>
            </CardHeader>
            <CardContent className="px-4 md:px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {tips.map((tip, index) => {
                        const Icon = tip.icon
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-navy-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/5 transition-all duration-300 group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${tip.bg} ${tip.color} group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-white font-semibold truncate">{tip.category}</h4>
                                            <div className="flex items-center gap-1 text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded text-xs font-medium">
                                                <ArrowUpRight className="w-3 h-3" />
                                                {tip.potentialSavings}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                                            {tip.tip}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Total savings highlight */}
                <div className="mt-6 bg-gradient-to-br from-teal-500/20 to-blue-600/20 border border-teal-500/30 rounded-xl p-6 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-teal-500 rounded-full shadow-lg shadow-teal-500/30">
                                <Lightbulb className="w-8 h-8 text-navy-900" />
                            </div>
                            <div>
                                <p className="text-slate-300 text-sm font-medium mb-1">Total Potential Savings</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-3xl font-bold text-white">
                                        ₹{Math.round(totalPotentialSavings).toLocaleString()}
                                    </p>
                                    <span className="text-slate-400 text-sm">/ month</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 text-right">
                            <p className="text-slate-300 text-sm">Annual Impact</p>
                            <p className="text-2xl font-bold text-teal-400">
                                ₹{Math.round(totalPotentialSavings * 12).toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-400">
                                saved per year
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default SavingsTipsCard
