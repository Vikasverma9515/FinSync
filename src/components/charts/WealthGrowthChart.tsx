'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { motion } from 'framer-motion'

interface YearlyTarget {
    year: number
    targetSavings?: number
    totalWealth?: number
    passiveIncome?: number
    netWorth?: number
}

interface WealthGrowthChartProps {
    data: YearlyTarget[]
    savingsGoal?: number
}

const WealthGrowthChart: React.FC<WealthGrowthChartProps> = ({ data, savingsGoal }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                No data available for visualization
            </div>
        )
    }

    // Format data for the chart
    const chartData = data.map(item => ({
        year: `Year ${item.year}`,
        wealth: item.totalWealth || item.netWorth || item.targetSavings || 0,
        passiveIncome: item.passiveIncome || 0,
    }))

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-navy-900 border border-teal-500/30 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold mb-2">{payload[0].payload.year}</p>
                    <p className="text-teal-400 text-sm">
                        Total Wealth: ₹{payload[0].value.toLocaleString()}
                    </p>
                    {payload[1] && (
                        <p className="text-blue-400 text-sm">
                            Passive Income: ₹{payload[1].value.toLocaleString()}/year
                        </p>
                    )}
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
            className="w-full h-80"
        >
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64ffda" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#64ffda" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis
                        dataKey="year"
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#94a3b8"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                    />
                    <Area
                        type="monotone"
                        dataKey="wealth"
                        stroke="#64ffda"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorWealth)"
                        name="Total Wealth"
                    />
                    <Area
                        type="monotone"
                        dataKey="passiveIncome"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        name="Passive Income"
                    />
                    {savingsGoal && (
                        <Line
                            type="monotone"
                            dataKey={() => savingsGoal}
                            stroke="#f59e0b"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="Savings Goal"
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

export default WealthGrowthChart
