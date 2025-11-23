'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { MapPin, Building2, Landmark, Smartphone, TrendingUp } from 'lucide-react'

interface InvestmentOption {
    name: string
    icon: any
    description: string
    howToStart: string
    minAmount: string
    bestFor: string
    color: string
    difficulty: 'Easy' | 'Medium' | 'Advanced'
}

const WhereToInvestCard: React.FC = () => {
    const options: InvestmentOption[] = [
        {
            name: 'Mutual Funds (SIP)',
            icon: TrendingUp,
            description: 'Start with as little as ₹500/month. Professional managers invest your money in stocks and bonds.',
            howToStart: 'Download apps like Groww, Zerodha Coin, or ET Money. Complete KYC and start SIP.',
            minAmount: '₹500/month',
            bestFor: 'Beginners, regular income earners',
            color: 'text-teal-400',
            difficulty: 'Easy',
        },
        {
            name: 'Stock Market',
            icon: Building2,
            description: 'Buy shares of companies. Higher returns possible, but needs research and patience.',
            howToStart: 'Open Demat account with Zerodha, Upstox, or Groww. Start with blue-chip stocks.',
            minAmount: '₹1,000+',
            bestFor: 'Those willing to learn and research',
            color: 'text-blue-400',
            difficulty: 'Medium',
        },
        {
            name: 'Fixed Deposits',
            icon: Landmark,
            description: 'Safest option. Lock money for fixed period, get guaranteed returns. No risk.',
            howToStart: 'Visit your bank or use net banking. Choose tenure (1-5 years) and deposit.',
            minAmount: '₹1,000',
            bestFor: 'Risk-averse, short-term goals',
            color: 'text-green-400',
            difficulty: 'Easy',
        },
        {
            name: 'Digital Gold',
            icon: Smartphone,
            description: 'Buy gold online without storing physical gold. Good for inflation protection.',
            howToStart: 'Use apps like Paytm, PhonePe, or Google Pay. Buy gold worth any amount.',
            minAmount: '₹1',
            bestFor: 'Diversification, festive savings',
            color: 'text-amber-400',
            difficulty: 'Easy',
        },
    ]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5 text-teal-400" />
                    Where to Invest - Simple Guide for Beginners
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Popular investment options in India - explained in simple language
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {options.map((option, index) => {
                    const Icon = option.icon
                    return (
                        <motion.div
                            key={option.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-4 hover:border-teal-500/30 transition-all duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 bg-slate-700/30 rounded-lg ${option.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-white font-semibold text-lg">{option.name}</h3>
                                        <span className={`text-xs px-2 py-1 rounded ${option.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                                option.difficulty === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-amber-500/20 text-amber-400'
                                            }`}>
                                            {option.difficulty}
                                        </span>
                                    </div>

                                    <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                                        {option.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div className="bg-slate-700/20 rounded p-2">
                                            <p className="text-xs text-slate-400 mb-1">Minimum Amount</p>
                                            <p className={`font-semibold ${option.color}`}>{option.minAmount}</p>
                                        </div>
                                        <div className="bg-slate-700/20 rounded p-2">
                                            <p className="text-xs text-slate-400 mb-1">Best For</p>
                                            <p className="text-white text-sm">{option.bestFor}</p>
                                        </div>
                                    </div>

                                    <div className="bg-teal-500/10 border border-teal-500/30 rounded p-3">
                                        <p className="text-xs text-teal-400 font-medium mb-1">📱 How to Start:</p>
                                        <p className="text-slate-300 text-sm">{option.howToStart}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}

                {/* Quick Tips */}
                <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">💡 Quick Tips for Beginners</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">•</span>
                            <span><strong className="text-white">Start Small:</strong> Begin with ₹500-1000/month and increase gradually</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">•</span>
                            <span><strong className="text-white">Diversify:</strong> Don't put all money in one place - spread it across 2-3 options</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">•</span>
                            <span><strong className="text-white">Be Patient:</strong> Investments need time to grow - minimum 3-5 years</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-teal-400 mt-0.5">•</span>
                            <span><strong className="text-white">Emergency Fund First:</strong> Keep 6 months expenses in savings before investing</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

export default WhereToInvestCard
