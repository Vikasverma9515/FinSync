'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, TrendingUp, Activity, PieChart } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-24 pb-12 md:pt-20 md:pb-0 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-blue-900/10 rounded-full blur-[80px] md:blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-teal-900/10 rounded-full blur-[60px] md:blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-400 text-xs md:text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span>AI-Powered Investment Tracking</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Sync Your Money, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                                Smarter.
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            FinSync brings stock insights, portfolio tracking, and an AI investment planner into one intelligent dashboard. Stop guessing, start growing.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto px-8 py-4 bg-teal-400 text-navy-900 rounded-lg font-bold hover:bg-teal-300 transition-all shadow-[0_0_20px_rgba(100,255,218,0.3)] hover:shadow-[0_0_30px_rgba(100,255,218,0.5)] flex items-center justify-center">
                                    Start Free Portfolio Scan
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            </Link>
                            <button className="w-full sm:w-auto px-8 py-4 border border-slate-700 text-white rounded-lg font-semibold hover:bg-white/5 transition-all flex items-center justify-center group">
                                <Play className="w-5 h-5 mr-2 text-teal-400 group-hover:scale-110 transition-transform" />
                                Explore Demo Dashboard
                            </button>
                        </div>

                        <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-slate-500">
                            <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-2 text-teal-400" />
                                Bank-level encryption
                            </div>
                            <div className="flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-teal-400" />
                                Real-time data
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - SVG Dashboard */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative mt-8 lg:mt-0"
                    >
                        {/* Main Dashboard Card */}
                        <div className="relative z-10 bg-navy-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 md:p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6 md:mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-700/50" />
                                    <div className="space-y-2">
                                        <div className="h-3 md:h-4 w-24 md:w-32 bg-slate-700/50 rounded" />
                                        <div className="h-2 md:h-3 w-16 md:w-20 bg-slate-700/30 rounded" />
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs md:text-sm font-medium">
                                    +12.4%
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="h-32 md:h-48 w-full mb-6 md:mb-8 relative">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 450 200">
                                    <path
                                        d="M0,150 C50,120 100,140 150,100 C200,60 250,80 300,50 C350,20 400,40 450,10"
                                        fill="none"
                                        stroke="#64ffda"
                                        strokeWidth="3"
                                        className="drop-shadow-[0_0_10px_rgba(100,255,218,0.5)]"
                                    />
                                    <path
                                        d="M0,150 C50,120 100,140 150,100 C200,60 250,80 300,50 C350,20 400,40 450,10 V190 H0 Z"
                                        fill="url(#gradient)"
                                        opacity="0.2"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#64ffda" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Floating Points */}
                                <div className="absolute top-[20%] left-[60%]">
                                    <div className="relative">
                                        <div className="w-4 h-4 bg-teal-400 rounded-full border-4 border-navy-900 shadow-lg" />
                                        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-navy-900 border border-slate-700 px-3 py-1 rounded text-xs text-teal-400 whitespace-nowrap">
                                            AAPL $182.50
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Stats */}
                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-navy-900/50 rounded-lg p-2 md:p-3 border border-slate-700/30">
                                        <div className="h-2 md:h-3 w-8 md:w-12 bg-slate-700/30 rounded mb-2" />
                                        <div className="h-4 md:h-5 w-16 md:w-20 bg-slate-700/50 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-4 md:-top-8 -right-4 md:-right-8 z-20 bg-navy-800/90 backdrop-blur-md border border-slate-700/50 p-3 md:p-4 rounded-xl shadow-xl max-w-[160px] md:max-w-[200px]"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-slate-400 mb-1">AI Insight</p>
                                    <p className="text-xs md:text-sm text-white font-medium">Rebalance 5% to ETFs.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 z-20 bg-navy-800/90 backdrop-blur-md border border-slate-700/50 p-3 md:p-4 rounded-xl shadow-xl"
                        >
                            <div className="flex items-center space-x-3">
                                <PieChart className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                                <div>
                                    <p className="text-xs md:text-sm text-white font-bold">Portfolio Health</p>
                                    <div className="w-20 md:w-24 h-1.5 bg-navy-900 rounded-full mt-1 overflow-hidden">
                                        <div className="w-[85%] h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
