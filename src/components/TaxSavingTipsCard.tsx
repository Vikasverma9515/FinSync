'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Lightbulb, TrendingDown, Shield, Zap } from 'lucide-react'

const TaxSavingTipsCard: React.FC = () => {
    const tips = [
        {
            category: 'Quick Wins (Do This Month)',
            icon: Zap,
            color: 'text-yellow-400',
            bgColor: 'from-yellow-500/10 to-yellow-500/5',
            borderColor: 'border-yellow-500/30',
            tips: [
                { tip: 'Start SIP in ELSS Mutual Funds', saving: '₹500/month = ₹15,600 tax saved/year', why: 'Invest while saving tax, 3-year lock-in' },
                { tip: 'Buy Health Insurance for Family', saving: '₹25,000 premium = ₹6,250 tax saved', why: 'Protect family + save tax under 80D' },
                { tip: 'Open PPF Account', saving: '₹1.5L/year = ₹46,800 tax saved', why: 'Safe, government-backed, tax-free returns' },
            ]
        },
        {
            category: 'Smart Investments (Plan This Year)',
            icon: TrendingDown,
            color: 'text-blue-400',
            bgColor: 'from-blue-500/10 to-blue-500/5',
            borderColor: 'border-blue-500/30',
            tips: [
                { tip: 'Invest in NPS (National Pension)', saving: '₹50,000 extra = ₹15,600 tax saved', why: 'Additional deduction over 80C limit' },
                { tip: 'Pay Home Loan EMI', saving: 'Up to ₹2L interest = ₹62,400 saved', why: 'Deduct home loan interest from income' },
                { tip: 'Claim HRA if Paying Rent', saving: 'Varies by rent = ₹10K-50K saved', why: 'Reduce taxable income with rent receipts' },
            ]
        },
        {
            category: 'Pro Tips (Maximize Savings)',
            icon: Shield,
            color: 'text-green-400',
            bgColor: 'from-green-500/10 to-green-500/5',
            borderColor: 'border-green-500/30',
            tips: [
                { tip: 'Health Insurance for Parents', saving: '₹25K-50K = ₹7,800-15,600 saved', why: 'Extra 80D deduction for parents' },
                { tip: 'Donate to Charity (80G)', saving: '50-100% of donation deductible', why: 'Help society while saving tax' },
                { tip: 'Education Loan Interest', saving: 'Full interest deductible', why: 'No upper limit on deduction' },
            ]
        },
    ]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50 p-0">
            <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-white">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                    <span>Simple Tax-Saving Strategies</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-2.5">
                    Easy ways to save tax - explained in simple language
                </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3 space-y-4 sm:space-y-5">
                {tips.map((category, index) => {
                    const Icon = category.icon;
                    return (
                        <motion.div
                            key={category.category}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-gradient-to-br ${category.bgColor} border ${category.borderColor} rounded-lg p-4 sm:p-5`}
                        >
                            <div className="flex items-center gap-2.5 mb-4 sm:mb-5">
                                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${category.color} flex-shrink-0`} />
                                <h3 className="text-white font-semibold text-sm sm:text-base">{category.category}</h3>
                            </div>

                            <div className="space-y-3 sm:space-y-3.5">
                                {category.tips.map((item, i) => (
                                    <div key={i} className="bg-navy-900/50 rounded-lg p-3 sm:p-4 border border-slate-700/50">
                                        <div className="flex flex-col gap-2 mb-2">
                                            <h4 className="text-white font-medium text-xs sm:text-sm leading-snug pr-2">{item.tip}</h4>
                                            <span className="text-green-400 font-semibold text-xs sm:text-sm">
                                                {item.saving}
                                            </span>
                                        </div>
                                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{item.why}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}

                {/* Key Takeaway */}
                <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-lg p-4 sm:p-5 mt-2 sm:mt-3">
                    <h4 className="text-teal-400 font-semibold mb-3 flex items-center gap-2.5">
                        <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                        Remember This
                    </h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                        <strong className="text-white">Start early in the financial year!</strong> Don't wait until March to invest. Spread your investments throughout the year using SIPs. This way you save tax AND build wealth through disciplined investing. Even small amounts like ₹500/month in ELSS can save you ₹15,600 in taxes annually!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default TaxSavingTipsCard
