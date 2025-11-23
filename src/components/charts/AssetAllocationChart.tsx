'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface AllocationData {
    stocks?: number
    bonds?: number
    cash?: number
    other?: number
}

interface AssetAllocationChartProps {
    allocation: AllocationData
}

const COLORS = {
    stocks: '#64ffda',
    bonds: '#3b82f6',
    cash: '#f59e0b',
    other: '#8b5cf6',
}

const LABELS = {
    stocks: 'Stocks/Equity',
    bonds: 'Bonds/Debt',
    cash: 'Cash/FD',
    other: 'Others',
}

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ allocation }) => {
    if (!allocation) {
        return (
            <div className="flex items-center justify-center h-64 text-slate-400">
                No allocation data available
            </div>
        )
    }

    const data = Object.entries(allocation)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
            name: LABELS[key as keyof typeof LABELS] || key,
            value: value,
            color: COLORS[key as keyof typeof COLORS] || '#94a3b8',
        }))

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-navy-900 border border-teal-500/30 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">{payload[0].name}</p>
                    <p className="text-teal-400 text-lg font-bold">{payload[0].value}%</p>
                </div>
            )
        }
        return null
    }

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180)
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180)

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-80"
        >
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-slate-300 text-sm">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </motion.div>
    )
}

export default AssetAllocationChart
