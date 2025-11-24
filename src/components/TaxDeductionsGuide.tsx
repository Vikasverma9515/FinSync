'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { BookOpen, CheckCircle } from 'lucide-react'

const TaxDeductionsGuide: React.FC = () => {
    const deductions = [
        {
            section: '80C - The Big One',
            limit: '₹1,50,000',
            color: 'text-teal-400',
            bgColor: 'bg-teal-500/10',
            borderColor: 'border-teal-500/30',
            description: 'Most popular tax-saving section - save up to ₹46,800 in tax',
            options: [
                { name: 'ELSS Mutual Funds', detail: 'Best returns, 3-year lock-in, market-linked' },
                { name: 'PPF (Public Provident Fund)', detail: 'Safe, 7-8% returns, 15-year lock-in' },
                { name: 'Life Insurance Premium', detail: 'Protection + tax saving' },
                { name: 'Tax Saver FD', detail: 'Safe, fixed returns, 5-year lock-in' },
                { name: 'Home Loan Principal', detail: 'Part of EMI counts as 80C' },
            ],
            tip: 'Mix ELSS (for growth) + PPF (for safety) for best results'
        },
        {
            section: '80D - Health Insurance',
            limit: '₹25,000 (₹50K if senior)',
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30',
            description: 'Save tax while protecting your family\'s health',
            options: [
                { name: 'Self & Family Insurance', detail: 'Up to ₹25,000 deduction' },
                { name: 'Parents Insurance', detail: 'Additional ₹25,000 (₹50K if senior)' },
                { name: 'Preventive Health Checkup', detail: '₹5,000 within the limit' },
            ],
            tip: 'Buy family floater + separate policy for parents to maximize deduction'
        },
        {
            section: '80CCD(1B) - NPS Extra',
            limit: '₹50,000',
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30',
            description: 'Additional deduction OVER 80C limit - save extra ₹15,600',
            options: [
                { name: 'National Pension System', detail: 'Invest for retirement, get tax benefit' },
                { name: 'Tier 1 NPS Account', detail: 'Lock-in till 60, but great returns' },
            ],
            tip: 'This is EXTRA over 80C - total ₹2L deduction possible (₹1.5L + ₹50K)'
        },
        {
            section: 'HRA - House Rent',
            limit: 'Varies by rent',
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            description: 'If you pay rent, claim HRA exemption',
            options: [
                { name: 'Rent Receipts', detail: 'Keep monthly rent receipts' },
                { name: 'Landlord PAN', detail: 'Needed if rent > ₹1L/year' },
                { name: 'Metro vs Non-Metro', detail: '50% vs 40% of basic salary' },
            ],
            tip: 'Even if your company doesn\'t give HRA, you can claim under 80GG'
        },
    ]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50 p-0">
            <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400 flex-shrink-0" />
                    <span>Tax Deductions Guide</span>
                </CardTitle>
                <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-2.5">
                    Understand where and how to save tax in plain language
                </p>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3 space-y-3.5 sm:space-y-4">
                {deductions.map((section, index) => (
                    <motion.div
                        key={section.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${section.bgColor} border ${section.borderColor} rounded-lg p-4 sm:p-5`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-4 mb-4 sm:mb-4">
                            <div className="flex-1">
                                <h3 className={`${section.color} font-semibold text-sm sm:text-base mb-1.5`}>{section.section}</h3>
                                <p className="text-slate-300 text-xs sm:text-sm">{section.description}</p>
                            </div>
                            <div className="bg-navy-900/40 rounded px-3 py-2 mt-3 sm:mt-0 sm:whitespace-nowrap">
                                <p className="text-xs text-slate-400">Limit</p>
                                <p className={`${section.color} font-bold text-sm`}>{section.limit}</p>
                            </div>
                        </div>

                        <div className="space-y-2.5 mb-4 sm:mb-4">
                            {section.options.map((option, i) => (
                                <div key={i} className="flex items-start gap-3 bg-navy-900/50 rounded p-3 sm:p-4">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-white text-xs sm:text-sm font-medium">{option.name}</p>
                                        <p className="text-slate-400 text-xs sm:text-sm">{option.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-navy-900/50 border border-slate-700/50 rounded p-3 sm:p-4">
                            <p className="text-xs sm:text-sm text-teal-400 font-medium mb-2">💡 Pro Tip:</p>
                            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{section.tip}</p>
                        </div>
                    </motion.div>
                ))}

                {/* Simple Calculation Example */}
                <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4 sm:p-5 mt-2 sm:mt-3">
                    <h4 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                        <span>📊</span>
                        <span>Simple Example</span>
                    </h4>
                    <div className="space-y-2.5 text-xs sm:text-sm">
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-300">Annual Income:</span>
                            <span className="text-white font-semibold text-right">₹12,00,000</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-300">80C Investment:</span>
                            <span className="text-white text-right whitespace-nowrap">-₹1,50,000</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-300">80D Health Insurance:</span>
                            <span className="text-white text-right whitespace-nowrap">-₹25,000</span>
                        </div>
                        <div className="flex justify-between gap-3">
                            <span className="text-slate-300">80CCD(1B) NPS:</span>
                            <span className="text-white text-right whitespace-nowrap">-₹50,000</span>
                        </div>
                        <div className="border-t border-slate-700 pt-2.5 mt-2.5 flex justify-between gap-3">
                            <span className="text-green-400 font-semibold">Tax Saved (30%):</span>
                            <span className="text-green-400 font-bold text-right whitespace-nowrap">₹67,500</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TaxDeductionsGuide
