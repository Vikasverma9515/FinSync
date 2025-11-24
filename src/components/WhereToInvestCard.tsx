'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { MapPin, Building2, Landmark, Smartphone, TrendingUp, Lightbulb } from 'lucide-react'

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
        <Card className="bg-navy-800/50 border-slate-700/50 p-0 overflow-hidden">
            <CardHeader className="p-4 md:p-6 bg-navy-900/50 border-b border-slate-700/50">
                <CardTitle className="flex items-start gap-3 text-white text-lg md:text-xl">
                    <div className="p-2 bg-teal-500/10 rounded-lg mt-1">
                        <MapPin className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        Where to Invest
                        <span className="block text-sm font-normal text-slate-400 mt-1">
                            Popular investment options in India - explained simply
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option, index) => {
                        const Icon = option.icon
                        return (
                            <motion.div
                                key={option.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-navy-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-teal-500/30 transition-all duration-200 flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-slate-800/50 rounded-lg ${option.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-white font-semibold text-sm md:text-base leading-tight">{option.name}</h3>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${option.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        option.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                        {option.difficulty}
                                    </span>
                                </div>

                                <p className="text-slate-300 text-xs mb-4 leading-relaxed flex-grow">
                                    {option.description}
                                </p>

                                <div className="space-y-3 mt-auto">
                                    <div className="flex items-center justify-between text-xs bg-navy-900/50 rounded-lg p-2 border border-white/5">
                                        <div>
                                            <span className="text-slate-500 block mb-0.5">Min Amount</span>
                                            <span className={`font-semibold ${option.color}`}>{option.minAmount}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-500 block mb-0.5">Best For</span>
                                            <span className="text-slate-300">{option.bestFor}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-teal-500/5 rounded-lg p-2 border border-teal-500/10">
                                        <Smartphone className="w-3 h-3 text-teal-400 mt-0.5 flex-shrink-0" />
                                        <span>{option.howToStart}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Quick Tips */}
                <div className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border border-teal-500/20 rounded-xl p-4 md:p-6">
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-400" />
                        Quick Tips for Beginners
                    </h4>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></span>
                            <span><strong className="text-white font-medium">Start Small:</strong> Begin with ₹500-1000/month and increase gradually</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></span>
                            <span><strong className="text-white font-medium">Diversify:</strong> Don't put all money in one place - spread it across 2-3 options</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></span>
                            <span><strong className="text-white font-medium">Be Patient:</strong> Investments need time to grow - minimum 3-5 years</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 flex-shrink-0"></span>
                            <span><strong className="text-white font-medium">Emergency Fund First:</strong> Keep 6 months expenses in savings before investing</span>
                        </li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}

export default WhereToInvestCard
