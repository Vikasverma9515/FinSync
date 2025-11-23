'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CheckCircle2, Circle, ArrowRight, Calendar, Target as TargetIcon } from 'lucide-react'

interface ActionStep {
    title: string
    description: string
    timeline: string
    completed?: boolean
}

interface ActionPlanProps {
    monthlyIncome: number
    monthlyExpenses: number
    savingsGoal: number
    timeHorizon: number
    currentSavings: number
}

const ActionPlan: React.FC<ActionPlanProps> = ({
    monthlyIncome,
    monthlyExpenses,
    savingsGoal,
    timeHorizon,
    currentSavings,
}) => {
    const monthlySavings = monthlyIncome - monthlyExpenses
    const monthlyTarget = (savingsGoal - currentSavings) / (timeHorizon * 12)

    const steps: ActionStep[] = [
        {
            title: 'Set Up Automatic Savings',
            description: `Create an automatic transfer of ₹${Math.round(monthlySavings).toLocaleString()} from your salary account to a separate savings/investment account on the 1st of every month.`,
            timeline: 'This week',
        },
        {
            title: 'Build Emergency Fund',
            description: `Save 6 months of expenses (₹${(monthlyExpenses * 6).toLocaleString()}) in a liquid fund or high-interest savings account before aggressive investing.`,
            timeline: 'First 6-12 months',
        },
        {
            title: 'Start SIP Investments',
            description: `Begin a Systematic Investment Plan (SIP) with ₹${Math.round(monthlySavings * 0.7).toLocaleString()}/month in diversified mutual funds or index funds.`,
            timeline: 'Month 2',
        },
        {
            title: 'Track Monthly Expenses',
            description: 'Use a budgeting app or spreadsheet to track every expense. Review monthly to identify areas where you can cut unnecessary spending.',
            timeline: 'Ongoing',
        },
        {
            title: 'Increase Income Streams',
            description: 'Explore side hustles, freelancing, or skill development to increase your monthly income by 10-20% within a year.',
            timeline: '6-12 months',
        },
        {
            title: 'Review & Rebalance',
            description: 'Review your investment portfolio every 6 months. Rebalance if any asset class deviates by more than 5% from target allocation.',
            timeline: 'Every 6 months',
        },
    ]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <TargetIcon className="w-5 h-5 text-teal-400" />
                    Your Action Plan - Simple Steps to Freedom
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Follow these actionable steps to achieve your ₹{savingsGoal.toLocaleString()} goal in {timeHorizon} years
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-slate-700" />
                            )}

                            <div className="flex gap-4">
                                {/* Step number */}
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-teal-500/20 border-2 border-teal-500 flex items-center justify-center relative z-10">
                                        {step.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-teal-400" />
                                        ) : (
                                            <span className="text-teal-400 font-bold text-sm">{index + 1}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-6">
                                    <div className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-teal-500/30 transition-all duration-200">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="text-white font-semibold">{step.title}</h3>
                                            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded">
                                                <Calendar className="w-3 h-3" />
                                                {step.timeline}
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-white font-semibold mb-2">Quick Summary</h4>
                            <ul className="space-y-1.5 text-sm text-slate-300">
                                <li>• Save ₹{Math.round(monthlySavings).toLocaleString()}/month automatically</li>
                                <li>• Build emergency fund of ₹{(monthlyExpenses * 6).toLocaleString()} first</li>
                                <li>• Invest ₹{Math.round(monthlySavings * 0.7).toLocaleString()}/month in SIPs</li>
                                <li>• Track expenses and review monthly</li>
                                <li>• Increase income through side hustles</li>
                                <li>• Review portfolio every 6 months</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ActionPlan
