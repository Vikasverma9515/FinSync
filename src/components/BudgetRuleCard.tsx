'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Home, ShoppingBag, PiggyBank, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'

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
            name: 'Needs (50%)',
            icon: Home,
            color: 'from-blue-500/20 to-blue-500/5',
            borderColor: 'border-blue-500/30',
            textColor: 'text-blue-400',
            recommended: needs,
            percentage: 50,
            examples: ['Rent/EMI', 'Groceries', 'Utilities', 'Insurance', 'Transportation'],
            current: currentNeedsPercent,
        },
        {
            name: 'Wants (30%)',
            icon: ShoppingBag,
            color: 'from-purple-500/20 to-purple-500/5',
            borderColor: 'border-purple-500/30',
            textColor: 'text-purple-400',
            recommended: wants,
            percentage: 30,
            examples: ['Dining out', 'Entertainment', 'Shopping', 'Hobbies', 'Subscriptions'],
            current: currentWantsPercent,
        },
        {
            name: 'Savings (20%)',
            icon: PiggyBank,
            color: 'from-teal-500/20 to-teal-500/5',
            borderColor: 'border-teal-500/30',
            textColor: 'text-teal-400',
            recommended: savings,
            percentage: 20,
            examples: ['Emergency fund', 'Investments', 'Retirement', 'Goals', 'Debt repayment'],
            current: currentSavingsPercent,
        },
    ]

    const isFollowingRule = currentSavingsPercent >= 20

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-white">
                            <TrendingUp className="w-5 h-5 text-teal-400" />
                            50/30/20 Budget Rule
                        </CardTitle>
                        <CardDescription className="text-slate-400 mt-2">
                            A simple framework to manage your money effectively
                        </CardDescription>
                    </div>
                    {isFollowingRule ? (
                        <div className="flex items-center gap-2 bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            On Track
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-sm font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Needs Adjustment
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Budget Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {budgetCategories.map((category, index) => {
                        const Icon = category.icon
                        const isOnTrack = category.current >= category.percentage - 5

                        return (
                            <motion.div
                                key={category.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gradient-to-br ${category.color} border ${category.borderColor} rounded-lg p-4`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Icon className={`w-6 h-6 ${category.textColor}`} />
                                    <div className={`text-xs font-medium ${category.textColor} bg-white/10 px-2 py-1 rounded`}>
                                        {category.percentage}%
                                    </div>
                                </div>

                                <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                                <p className="text-2xl font-bold text-white mb-2">
                                    ₹{category.recommended.toLocaleString()}
                                </p>

                                {/* Progress bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                                        <span>Your current</span>
                                        <span>{category.current.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-navy-900 rounded-full h-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (category.current / category.percentage) * 100)}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                            className={`h-2 rounded-full ${isOnTrack ? 'bg-teal-500' : 'bg-amber-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Examples */}
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-400">Examples:</p>
                                    {category.examples.slice(0, 3).map((example, i) => (
                                        <p key={i} className="text-xs text-slate-500">• {example}</p>
                                    ))}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Recommendation */}
                <div className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        Your Budget Recommendation
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        Based on your monthly income of <span className="text-teal-400 font-semibold">₹{monthlyIncome.toLocaleString()}</span>,
                        you should aim to spend:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-slate-300">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                            <span className="font-medium">₹{needs.toLocaleString()}</span> on essential needs (rent, food, bills)
                        </li>
                        <li className="flex items-center gap-2 text-slate-300">
                            <div className="w-2 h-2 bg-purple-400 rounded-full" />
                            <span className="font-medium">₹{wants.toLocaleString()}</span> on wants (entertainment, dining out)
                        </li>
                        <li className="flex items-center gap-2 text-slate-300">
                            <div className="w-2 h-2 bg-teal-400 rounded-full" />
                            <span className="font-medium">₹{savings.toLocaleString()}</span> towards savings and investments
                        </li>
                    </ul>

                    {!isFollowingRule && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                            <p className="text-amber-400 text-sm font-medium">
                                💡 Tip: You're currently saving {currentSavingsPercent.toFixed(1)}%.
                                Try to increase it to at least 20% by reducing discretionary spending.
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default BudgetRuleCard
