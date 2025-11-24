'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function DashboardPreview() {
    return (
        <section className="py-16 md:py-24 bg-navy-900 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 rounded-full blur-[60px] md:blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                        See your entire financial life in one <span className="text-teal-400">synced dashboard</span>
                    </h2>
                </div>

                <div className="relative h-auto md:h-[700px] w-full max-w-5xl mx-auto perspective-1000 flex flex-col md:block gap-6">
                    {/* Card 1: Main Portfolio Graph (Back) */}
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative md:absolute top-0 left-0 right-0 h-[300px] md:h-[500px] bg-navy-800 border border-slate-700 rounded-2xl p-4 md:p-6 shadow-2xl z-10 transform translate-z-0"
                    >
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h3 className="text-white font-semibold text-sm md:text-base">Portfolio Value</h3>
                            <div className="flex space-x-1 md:space-x-2">
                                {['1D', '1W', '1M', '1Y', 'ALL'].map((period) => (
                                    <span key={period} className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded ${period === '1M' ? 'bg-teal-400/20 text-teal-400' : 'text-slate-500'}`}>
                                        {period}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="h-[200px] md:h-[350px] w-full">
                            <svg className="w-full h-full" preserveAspectRatio="none">
                                <path
                                    d="M0,300 C100,280 200,320 300,250 C400,180 500,220 600,150 C700,80 800,100 900,50"
                                    fill="none"
                                    stroke="#64ffda"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M0,300 C100,280 200,320 300,250 C400,180 500,220 600,150 C700,80 800,100 900,50 V350 H0 Z"
                                    fill="url(#dashboardGradient)"
                                    opacity="0.1"
                                />
                                <defs>
                                    <linearGradient id="dashboardGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#64ffda" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                    </motion.div>

                    {/* Card 2: Asset Allocation (Front Left) */}
                    <motion.div
                        initial={{ opacity: 0, x: -50, y: 100 }}
                        whileInView={{ opacity: 1, x: 0, y: 80 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="relative md:absolute bottom-20 left-4 md:left-10 w-full md:w-[350px] bg-navy-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 md:transform md:translate-y-0"
                    >
                        <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Asset Allocation</h3>
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[8px] md:border-[12px] border-teal-400 border-r-blue-500 border-b-purple-500 border-l-teal-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-slate-400">Stocks</span>
                                <span className="text-white">65%</span>
                            </div>
                            <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-slate-400">Crypto</span>
                                <span className="text-white">25%</span>
                            </div>
                            <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-slate-400">Cash</span>
                                <span className="text-white">10%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Card 3: Recent Insights (Front Right) */}
                    <motion.div
                        initial={{ opacity: 0, x: 50, y: 100 }}
                        whileInView={{ opacity: 1, x: 0, y: 120 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="relative md:absolute bottom-0 right-4 md:right-10 w-full md:w-[350px] bg-navy-800/90 backdrop-blur-xl border border-slate-600 rounded-2xl p-4 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 md:transform md:translate-y-0"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                            <h3 className="text-white font-semibold text-sm md:text-base">Smart Insight</h3>
                        </div>
                        <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-4">
                            "Your tech exposure is 42%. Consider diversifying into healthcare and ETFs to reduce volatility."
                        </p>
                        <button className="w-full py-2 bg-teal-400/10 text-teal-400 rounded-lg text-xs md:text-sm font-medium hover:bg-teal-400/20 transition-colors">
                            View Recommendations
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
