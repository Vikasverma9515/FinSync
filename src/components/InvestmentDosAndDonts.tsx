'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react'

interface Tip {
    text: string
    type: 'do' | 'dont'
}

const InvestmentDosAndDonts: React.FC = () => {
    const dos: string[] = [
        'Start early - even ₹500/month compounds to lakhs over 10-20 years',
        'Invest regularly through SIP - don\'t try to time the market',
        'Keep 6 months emergency fund in savings before investing',
        'Diversify - spread money across stocks, bonds, and gold',
        'Think long-term - minimum 5 years for equity investments',
        'Review portfolio every 6 months and rebalance if needed',
        'Complete KYC once - makes all future investments easier',
        'Use tax-saving options like ELSS, PPF to save on taxes',
    ]

    const donts: string[] = [
        'Don\'t invest money you need in next 1-2 years',
        'Don\'t put all money in one stock or fund',
        'Don\'t panic sell when market goes down - stay invested',
        'Don\'t invest based on tips from friends or social media',
        'Don\'t skip reading fund details before investing',
        'Don\'t invest in things you don\'t understand',
        'Don\'t take loans to invest in stock market',
        'Don\'t expect to get rich quick - investing needs patience',
    ]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Investment Dos and Don'ts - Golden Rules
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Simple rules to follow for successful investing
                </p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* DO's */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg">DO's ✓</h3>
                        </div>
                        <div className="space-y-3">
                            {dos.map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 rounded-lg p-3 hover:border-green-500/40 transition-all duration-200"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* DON'Ts */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg">DON'Ts ✗</h3>
                        </div>
                        <div className="space-y-3">
                            {donts.map((tip, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3 hover:border-red-500/40 transition-all duration-200"
                                >
                                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Key Takeaway */}
                <div className="mt-6 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-lg p-4">
                    <h4 className="text-teal-400 font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Remember This
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        <strong className="text-white">Investing is a marathon, not a sprint.</strong> The key to wealth creation is
                        starting early, investing regularly, staying patient, and not panicking during market downs. Even small amounts
                        invested consistently can grow into significant wealth over 10-20 years through the power of compounding.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default InvestmentDosAndDonts
