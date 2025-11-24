'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingUp, Shield, Zap, BookOpen, Lightbulb } from 'lucide-react'

interface RiskLevel {
    level: 'low' | 'medium' | 'high'
    title: string
    icon: any
    color: string
    bgColor: string
    borderColor: string
    description: string
    suitableFor: string[]
    expectedReturn: string
    volatility: string
    examples: string[]
    timeHorizon: string
}

interface InvestmentBasicsProps {
    riskLevel?: 'low' | 'medium' | 'high'
}

const InvestmentBasicsCard: React.FC<InvestmentBasicsProps> = ({ riskLevel = 'medium' }) => {
    const riskLevels: RiskLevel[] = [
        {
            level: 'low',
            title: 'Low Risk - Safe & Steady',
            icon: Shield,
            color: 'text-green-400',
            bgColor: 'from-green-500/10 to-green-500/5',
            borderColor: 'border-green-500/30',
            description: 'Your money is safe, but grows slowly. Like a savings account with better returns.',
            suitableFor: ['New investors', 'Short-term goals (1-3 years)', 'Risk-averse individuals'],
            expectedReturn: '6-8% per year',
            volatility: 'Very Low - Your money stays stable',
            examples: ['Fixed Deposits (FD)', 'Government Bonds', 'Debt Mutual Funds', 'PPF'],
            timeHorizon: '1-3 years',
        },
        {
            level: 'medium',
            title: 'Medium Risk - Balanced Growth',
            icon: TrendingUp,
            color: 'text-blue-400',
            bgColor: 'from-blue-500/10 to-blue-500/5',
            borderColor: 'border-blue-500/30',
            description: 'Mix of safety and growth. Some ups and downs, but generally grows well over time.',
            suitableFor: ['Most investors', 'Medium-term goals (3-5 years)', 'Balanced approach'],
            expectedReturn: '10-14% per year',
            volatility: 'Moderate - Some fluctuations are normal',
            examples: ['Balanced Mutual Funds', 'Index Funds', 'Blue-chip Stocks', 'Hybrid Funds'],
            timeHorizon: '3-5 years',
        },
        {
            level: 'high',
            title: 'High Risk - Maximum Growth',
            icon: Zap,
            color: 'text-amber-400',
            bgColor: 'from-amber-500/10 to-amber-500/5',
            borderColor: 'border-amber-500/30',
            description: 'Your money can grow a lot, but can also go down. Needs patience and strong nerves.',
            suitableFor: ['Experienced investors', 'Long-term goals (5+ years)', 'High risk tolerance'],
            expectedReturn: '15-20%+ per year',
            volatility: 'High - Expect big ups and downs',
            examples: ['Small-cap Stocks', 'Sector Funds', 'Crypto', 'Growth Stocks'],
            timeHorizon: '5+ years',
        },
    ]

    const selectedRisk = riskLevels.find(r => r.level === riskLevel) || riskLevels[1]

    return (
        <Card className="bg-navy-800/50 border-slate-700/50 p-0 overflow-hidden">
            <CardHeader className="p-4 md:p-6 bg-navy-900/50 border-b border-slate-700/50">
                <CardTitle className="flex items-start gap-3 text-white text-lg md:text-xl">
                    <div className="p-2 bg-teal-500/10 rounded-lg mt-1">
                        <BookOpen className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        Understanding Investment Risk
                        <span className="block text-sm font-normal text-slate-400 mt-1">
                            Choose your comfort level - there's no "best" option, only what's right for YOU
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Risk Level Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {riskLevels.map((risk, index) => {
                        const Icon = risk.icon
                        const isSelected = risk.level === riskLevel

                        return (
                            <motion.div
                                key={risk.level}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-gradient-to-br ${risk.bgColor} border ${isSelected ? risk.borderColor : 'border-slate-700/50'} rounded-xl p-4 ${isSelected ? 'ring-1 ring-teal-500/30 shadow-lg shadow-teal-500/10' : ''}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-lg bg-navy-900/30 ${risk.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-white font-semibold text-sm md:text-base">{risk.title}</h3>
                                </div>

                                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                                    {risk.description}
                                </p>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-navy-900/40 rounded px-2 py-1.5 border border-white/5">
                                        <span className="text-slate-400 block mb-0.5">Returns</span>
                                        <span className={`font-semibold ${risk.color}`}>{risk.expectedReturn}</span>
                                    </div>
                                    <div className="bg-navy-900/40 rounded px-2 py-1.5 border border-white/5">
                                        <span className="text-slate-400 block mb-0.5">Time</span>
                                        <span className="text-white font-medium">{risk.timeHorizon}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Selected Risk Details */}
                <div className={`bg-gradient-to-br ${selectedRisk.bgColor} border ${selectedRisk.borderColor} rounded-xl p-4 md:p-6`}>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${selectedRisk.color.replace('text-', 'bg-')}`}></span>
                        Your Selected Risk Level: {selectedRisk.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">✓ Best for</p>
                            <ul className="space-y-2">
                                {selectedRisk.suitableFor.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                        <span className={`mt-1.5 w-1 h-1 rounded-full ${selectedRisk.color.replace('text-', 'bg-')}`}></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium mb-3">💡 Where to invest</p>
                            <ul className="space-y-2">
                                {selectedRisk.examples.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                        <span className={`mt-1.5 w-1 h-1 rounded-full ${selectedRisk.color.replace('text-', 'bg-')}`}></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-start gap-2">
                            <span className="text-slate-400 text-sm whitespace-nowrap">Expectation:</span>
                            <span className="text-white text-sm font-medium leading-relaxed">{selectedRisk.volatility}</span>
                        </div>
                    </div>
                </div>

                {/* Simple Explanation */}
                <div className="bg-navy-900/50 border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-teal-400 font-semibold mb-3 text-sm flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Simple Rule of Thumb
                    </h4>
                    <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                            <strong className="text-white font-medium">Low Risk:</strong> Like keeping money in a locker - safe but slow growth.
                        </p>
                        <p className="text-slate-300">
                            <strong className="text-white font-medium">Medium Risk:</strong> Like planting a tree - some care needed, steady growth.
                        </p>
                        <p className="text-slate-300">
                            <strong className="text-white font-medium">High Risk:</strong> Like starting a business - can grow big, but needs patience.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default InvestmentBasicsCard
