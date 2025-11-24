'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { TaxDeduction } from '@/types'

interface DeductionTrackerChartProps {
    deductions: TaxDeduction[]
}

const DeductionTrackerChart: React.FC<DeductionTrackerChartProps> = ({ deductions }) => {
    return (
        <div className="space-y-4">
            {deductions.map((deduction, index) => {
                const utilizationPercent = (deduction.utilized / deduction.limit) * 100
                const remainingPercent = (deduction.remaining / deduction.limit) * 100

                return (
                    <motion.div
                        key={deduction.section}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-navy-900/50 border border-slate-700/50 rounded-lg p-3 sm:p-4 md:p-5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm md:text-base text-white font-semibold">Section {deduction.section}</h4>
                            <span className="text-slate-400 text-xs md:text-sm">
                                Limit: ₹{deduction.limit.toLocaleString()}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full h-8 bg-slate-700/30 rounded-full overflow-hidden mb-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${utilizationPercent}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                className="absolute left-0 top-0 h-full bg-teal-500 flex items-center justify-center"
                            >
                                {utilizationPercent > 15 && (
                                    <span className="text-white text-xs font-medium">
                                        ₹{deduction.utilized.toLocaleString()}
                                    </span>
                                )}
                            </motion.div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${remainingPercent}%` }}
                                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                                className="absolute h-full bg-amber-500/40 flex items-center justify-center"
                                style={{ left: `${utilizationPercent}%` }}
                            >
                                {remainingPercent > 15 && (
                                    <span className="text-white text-xs font-medium">
                                        ₹{deduction.remaining.toLocaleString()} left
                                    </span>
                                )}
                            </motion.div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs mb-3">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-teal-500 rounded"></div>
                                <span className="text-slate-400">Utilized: ₹{deduction.utilized.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-amber-500/40 rounded"></div>
                                <span className="text-slate-400">Remaining: ₹{deduction.remaining.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Recommendations */}
                        {deduction.recommendations.length > 0 && (
                            <div className="bg-teal-500/10 border border-teal-500/30 rounded p-2.5 md:p-3">
                                <p className="text-teal-400 text-xs font-medium mb-2">💡 Recommendations:</p>
                                <ul className="space-y-1">
                                    {deduction.recommendations.map((rec, i) => (
                                        <li key={i} className="text-slate-300 text-sm">• {rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )
            })}
        </div>
    )
}

export default DeductionTrackerChart
