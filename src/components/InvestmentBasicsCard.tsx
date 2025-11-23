'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { TrendingUp, Shield, Zap, BookOpen } from 'lucide-react'

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
        <Card className="bg-navy-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                    Understanding Investment Risk - Simple Guide
                </CardTitle>
                <p className="text-slate-400 text-sm mt-2">
                    Choose your comfort level - there's no "best" option, only what's right for YOU
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
                                className={`bg-gradient-to-br ${risk.bgColor} border-2 ${isSelected ? risk.borderColor : 'border-slate-700/50'} rounded-lg p-4 ${isSelected ? 'ring-2 ring-teal-500/20' : ''}`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`w-6 h-6 ${risk.color}`} />
                                    <h3 className="text-white font-semibold text-sm">{risk.title}</h3>
                                </div>

                                <p className="text-slate-300 text-sm mb-3 leading-relaxed">
                                    {risk.description}
                                </p>

                                <div className="space-y-2 text-xs">
                                    <div className="bg-navy-900/50 rounded p-2">
                                        <span className="text-slate-400">Returns: </span>
                                        <span className={`font-semibold ${risk.color}`}>{risk.expectedReturn}</span>
                                    </div>
                                    <div className="bg-navy-900/50 rounded p-2">
                                        <span className="text-slate-400">Time: </span>
                                        <span className="text-white font-medium">{risk.timeHorizon}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Selected Risk Details */}
                <div className={`bg-gradient-to-br ${selectedRisk.bgColor} border ${selectedRisk.borderColor} rounded-lg p-5`}>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <span className={selectedRisk.color}>●</span>
                        Your Selected Risk Level: {selectedRisk.title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-400 text-sm mb-2">✓ Best for:</p>
                            <ul className="space-y-1">
                                {selectedRisk.suitableFor.map((item, i) => (
                                    <li key={i} className="text-slate-300 text-sm">• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="text-slate-400 text-sm mb-2">💡 Where to invest:</p>
                            <ul className="space-y-1">
                                {selectedRisk.examples.map((item, i) => (
                                    <li key={i} className="text-slate-300 text-sm">• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-4 bg-navy-900/50 rounded-lg p-3">
                        <p className="text-slate-400 text-sm mb-1">What to expect:</p>
                        <p className="text-white text-sm font-medium">{selectedRisk.volatility}</p>
                    </div>
                </div>

                {/* Simple Explanation */}
                <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-4">
                    <h4 className="text-teal-400 font-semibold mb-2 text-sm">💡 Simple Rule of Thumb</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        <strong className="text-white">Low Risk:</strong> Like keeping money in a locker - safe but slow growth.<br />
                        <strong className="text-white">Medium Risk:</strong> Like planting a tree - some care needed, steady growth.<br />
                        <strong className="text-white">High Risk:</strong> Like starting a business - can grow big, but needs patience.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}

export default InvestmentBasicsCard
