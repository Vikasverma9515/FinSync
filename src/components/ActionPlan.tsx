'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CheckCircle2, Circle, ArrowRight, Calendar, Target as TargetIcon, ChevronRight } from 'lucide-react'

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
            completed: true,
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
        <Card className="bg-navy-800/50 border-slate-700/50 overflow-hidden">
            <CardHeader className="border-b border-slate-700/50 bg-navy-900/30">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-white text-xl">
                            <TargetIcon className="w-6 h-6 text-teal-400" />
                            Your Action Plan
                        </CardTitle>
                        <p className="text-slate-400 text-sm mt-1">
                            Simple steps to reach <span className="text-white font-medium">₹{savingsGoal.toLocaleString()}</span> in {timeHorizon} years
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-medium text-teal-400">
                            {steps.length} Steps to Freedom
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6 py-6">
                <div className="space-y-0 relative w-full">
                    {/* Continuous Timeline Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-teal-500 via-teal-500/30 to-slate-700/20" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pl-12 pb-8 last:pb-0 group"
                        >
                            {/* Step Indicator */}
                            <div className="absolute left-0 top-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${step.completed
                                    ? 'bg-teal-500 shadow-lg shadow-teal-500/20'
                                    : 'bg-navy-900 border-2 border-slate-700 group-hover:border-teal-500/50 group-hover:shadow-lg group-hover:shadow-teal-500/10'
                                    }`}>
                                    {step.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-navy-900" />
                                    ) : (
                                        <span className={`font-bold text-sm ${step.completed ? 'text-navy-900' : 'text-slate-400 group-hover:text-teal-400'}`}>
                                            {index + 1}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Content Card */}
                            <div className="bg-navy-900/50 border border-slate-700/50 rounded-xl p-3 md:p-5 hover:border-teal-500/30 hover:bg-navy-800/80 transition-all duration-300 group-hover:translate-x-1">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                    <h3 className="text-white font-semibold text-lg group-hover:text-teal-400 transition-colors">
                                        {step.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full self-start">
                                        <Calendar className="w-3 h-3" />
                                        {step.timeline}
                                    </div>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-8 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-xl p-6 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex items-start gap-4 relative z-10 w-full">
                        <div className="p-3 bg-teal-500/20 rounded-lg flex-shrink-0">
                            <TargetIcon className="w-6 h-6 text-teal-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-lg mb-3">Quick Summary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <ChevronRight className="w-4 h-4 text-teal-500" />
                                    <span>Save <span className="text-white font-medium">₹{Math.round(monthlySavings).toLocaleString()}</span>/month automatically</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <ChevronRight className="w-4 h-4 text-teal-500" />
                                    <span>Build emergency fund of <span className="text-white font-medium">₹{(monthlyExpenses * 6).toLocaleString()}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <ChevronRight className="w-4 h-4 text-teal-500" />
                                    <span>Invest <span className="text-white font-medium">₹{Math.round(monthlySavings * 0.7).toLocaleString()}</span>/month in SIPs</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <ChevronRight className="w-4 h-4 text-teal-500" />
                                    <span>Review portfolio every 6 months</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ActionPlan
