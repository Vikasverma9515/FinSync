'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Home, ShoppingBag, PiggyBank, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

interface BudgetRuleProps {
    monthlyIncome: number
    monthlyExpenses: number
}

const BudgetRuleCard: React.FC<BudgetRuleProps> = ({ monthlyIncome, monthlyExpenses }) => {
    const monthlySavings = monthlyIncome - monthlyExpenses
    const savingsRate = (monthlySavings / monthlyIncome) * 100

    // 50/30/20 Rule calculations
    const needs = monthlyIncome * 0.5
    const wants = monthlyIncome * 0.3
    const savings = monthlyIncome * 0.2

    // Current breakdown estimate
    const currentSavingsPercent = (monthlySavings / monthlyIncome) * 100
    const currentNeedsPercent = Math.min(50, (monthlyExpenses / monthlyIncome) * 100 * 0.6)
    const currentWantsPercent = Math.min(30, (monthlyExpenses / monthlyIncome) * 100 * 0.4)

    const budgetCategories = [
        {
            name: 'Needs',
            target: '50%',
            icon: Home,
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            barColor: 'bg-blue-500',
            recommended: needs,
            percentage: 50,
            examples: ['Rent/EMI', 'Groceries', 'Utilities'],
            current: currentNeedsPercent,
        },
        {
            name: 'Wants',
            target: '30%',
            icon: ShoppingBag,
            color: 'from-purple-500/20 to-purple-500/5',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
            barColor: 'bg-purple-500',
            recommended: wants,
            percentage: 30,
            examples: ['Dining out', 'Entertainment', 'Shopping'],
            current: currentWantsPercent,
        },
        {
            name: 'Savings',
            target: '20%',
            icon: PiggyBank,
            color: 'from-teal-500/20 to-teal-500/5',
            borderColor: 'border-teal-500/30',
            textColor: 'text-teal-400',
            barColor: 'bg-teal-500',
            recommended: savings,
            percentage: 20,
            examples: ['Emergency fund', 'Investments', 'Goals'],
            current: currentSavingsPercent,
        },
    ]

    const isFollowingRule = currentSavingsPercent >= 20

    return (
        <Card className="bg-navy-800/50 border-slate-700/50 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-white text-xl">
                            <TrendingUp className="w-6 h-6 text-teal-400" />
                            50/30/20 Budget Rule
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-1">
                            The golden rule of budgeting for financial stability
                        </CardDescription>
                    </div>
                    {isFollowingRule ? (
                        <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 text-teal-400 px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-teal-500/5">
                            <CheckCircle2 className="w-4 h-4" />
                            On Track
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium shadow-lg shadow-amber-500/5">
                            <AlertCircle className="w-4 h-4" />
                            Adjustment Needed
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10 px-4 md:px-6">
                {/* Budget Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {budgetCategories.map((category, index) => {
                        const Icon = category.icon
                        const isOnTrack = Math.abs(category.current - category.percentage) <= 5

                        return (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gradient-to-br ${category.color} border ${category.borderColor} rounded-xl p-5 relative overflow-hidden group hover:shadow-lg transition-all duration-300`}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg bg-navy-900/50 ${category.textColor}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className={`text-xs font-bold ${category.textColor} bg-navy-900/50 px-2 py-1 rounded-md border border-white/5`}>
                                        Target: {category.target}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-slate-300 text-sm font-medium mb-1">{category.name}</h3>
                                    <p className="text-2xl font-bold text-white tracking-tight">
                                        ₹{category.recommended.toLocaleString()}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-400">Current: {category.current.toFixed(0)}%</span>
                                        <span className={isOnTrack ? 'text-teal-400' : 'text-amber-400'}>
                                            {isOnTrack ? 'Good' : category.current > category.percentage ? 'High' : 'Low'}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-navy-900/80 rounded-full overflow-hidden relative">
                                        {/* Target Marker */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-white/50 z-10"
                                            style={{ left: `${category.percentage}%` }}
                                        />
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (category.current / category.percentage) * category.percentage)}%` }} // Scale relative to 100% width but visually represent the value
                                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                            className={`h-full rounded-full ${category.barColor} relative`}
                                        >
                                            <div className="absolute inset-0 bg-white/20" />
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Examples */}
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <div className="flex flex-wrap gap-2">
                                        {category.examples.map((example, i) => (
                                            <span key={i} className="text-[10px] text-slate-400 bg-navy-900/40 px-2 py-1 rounded-full">
                                                {example}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Recommendation Summary */}
                <div className="bg-navy-900/50 border border-slate-700/50 rounded-xl p-5 flex flex-col md:flex-row items-start justify-between gap-4 w-full">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-teal-500/10 rounded-full hidden md:block">
                            <TrendingUp className="w-6 h-6 text-teal-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">Your Monthly Budget Plan</h4>
                            <p className="text-slate-400 text-sm">
                                Based on your income of <span className="text-white font-medium">₹{monthlyIncome.toLocaleString()}</span>,
                                allocate <span className="text-blue-400">₹{needs.toLocaleString()}</span> for needs,
                                <span className="text-purple-400"> ₹{wants.toLocaleString()}</span> for wants, and
                                <span className="text-teal-400"> ₹{savings.toLocaleString()}</span> for savings.
                            </p>
                        </div>
                    </div>
                    {!isFollowingRule && (
                        <div className="flex-shrink-0">
                            <button className="flex items-center gap-2 text-sm font-medium text-navy-900 bg-teal-500 hover:bg-teal-400 px-4 py-2 rounded-lg transition-colors">
                                Adjust Budget <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default BudgetRuleCard
