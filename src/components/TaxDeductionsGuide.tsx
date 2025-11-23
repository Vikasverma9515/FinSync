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
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    Tax Deductions Guide - Simple Explanation
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Understand where and how to save tax in plain language
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {deductions.map((section, index) => (
                    <motion.div
                        key={section.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${section.bgColor} border ${section.borderColor} rounded-lg p-4`}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className={`${section.color} font-semibold text-lg mb-1`}>{section.section}</h3>
                                <p className="text-slate-300 text-sm">{section.description}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400">Limit</p>
                                <p className={`${section.color} font-bold`}>{section.limit}</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-3">
                            {section.options.map((option, i) => (
                                <div key={i} className="flex items-start gap-2 bg-navy-900/50 rounded p-2">
                                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-white text-sm font-medium">{option.name}</p>
                                        <p className="text-slate-400 text-xs">{option.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-navy-900/50 border border-slate-700/50 rounded p-3">
                            <p className="text-xs text-teal-400 font-medium mb-1">💡 Pro Tip:</p>
                            <p className="text-slate-300 text-sm">{section.tip}</p>
                        </div>
                    </motion.div>
                ))}

                {/* Simple Calculation Example */}
                <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/30 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-3">📊 Simple Example</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-300">Annual Income:</span>
                            <span className="text-white font-semibold">₹12,00,000</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">80C Investment (ELSS + PPF):</span>
                            <span className="text-white">-₹1,50,000</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">80D Health Insurance:</span>
                            <span className="text-white">-₹25,000</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-300">80CCD(1B) NPS:</span>
                            <span className="text-white">-₹50,000</span>
                        </div>
                        <div className="border-t border-slate-700 pt-2 mt-2 flex justify-between">
                            <span className="text-green-400 font-semibold">Tax Saved (30% bracket):</span>
                            <span className="text-green-400 font-bold text-lg">₹67,500</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TaxDeductionsGuide
