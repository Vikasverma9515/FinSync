'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Calendar } from 'lucide-react'

interface MonthlyData {
    month: number
    monthName: string
    savings: number
    cumulativeWealth: number
    interestEarned: number
}

interface MonthlyProjectionTableProps {
    data: MonthlyData[]
}

const MonthlyProjectionTable: React.FC<MonthlyProjectionTableProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return null
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    return (
        <div className="space-y-3">
            {data.slice(0, 12).map((item, index) => (
                <motion.div
                    key={item.month}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-navy-900/50 border border-slate-700/50 rounded-lg hover:border-teal-500/30 transition-all duration-200 gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-400/10 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <div className="text-white font-medium">
                                {monthNames[item.month - 1] || item.monthName}
                            </div>
                            <div className="text-xs text-slate-400">
                                Month {item.month}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-6 w-full md:w-auto">
                        <div className="text-left md:text-right">
                            <div className="text-xs text-slate-400">Monthly Savings</div>
                            <div className="text-sm font-semibold text-white">
                                ₹{item.savings?.toLocaleString() || 0}
                            </div>
                        </div>

                        <div className="text-left md:text-right">
                            <div className="text-xs text-slate-400">Interest Earned</div>
                            <div className="text-sm font-semibold text-green-400">
                                +₹{item.interestEarned?.toLocaleString() || 0}
                            </div>
                        </div>

                        <div className="text-left md:text-right col-span-2 md:col-span-1 md:min-w-[120px] pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50 md:border-none">
                            <div className="text-xs text-slate-400 flex items-center gap-1 md:justify-end">
                                <TrendingUp className="w-3 h-3" />
                                Total Wealth
                            </div>
                            <div className="text-base font-bold text-teal-400">
                                ₹{item.cumulativeWealth?.toLocaleString() || 0}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

export default MonthlyProjectionTable
