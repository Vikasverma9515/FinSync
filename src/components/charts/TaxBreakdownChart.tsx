'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface TaxBreakdownChartProps {
    currentTax: number
    optimizedTax: number
    totalSavings: number
}

const TaxBreakdownChart: React.FC<TaxBreakdownChartProps> = ({ currentTax, optimizedTax, totalSavings }) => {
    const data = [
        {
            name: 'Current Tax',
            amount: Math.round(currentTax),
            fill: '#ef4444',
        },
        {
            name: 'Optimized Tax',
            amount: Math.round(optimizedTax),
            fill: '#10b981',
        },
    ]

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-navy-900 border border-teal-500/30 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold mb-1">{payload[0].payload.name}</p>
                    <p className="text-teal-400 text-lg font-bold">
                        ₹{payload[0].value.toLocaleString()}
                    </p>
                </div>
            )
        }
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full sm:p-4"
        >
            <div className="mb-4 text-center">
                <p className="text-slate-400 text-xs sm:text-sm mb-1">Your Tax Savings</p>
                <p className="text-3xl sm:text-4xl font-bold text-green-400">
                    ₹{totalSavings.toLocaleString()}
                </p>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    {((totalSavings / currentTax) * 100).toFixed(1)}% reduction
                </p>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="name"
                        stroke="#94a3b8"
                        style={{ fontSize: '14px' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

export default TaxBreakdownChart
