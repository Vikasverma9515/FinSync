'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, TrendingUp, Activity, PieChart } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-teal-900/10 rounded-full blur-[100px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/20 text-teal-400 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                            </span>
                            <span>AI-Powered Investment Tracking</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                            Sync Your Money, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                                Smarter.
                            </span>
                        </h1>

                        <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
                            FinSync brings stock insights, portfolio tracking, and an AI investment planner into one intelligent dashboard. Stop guessing, start growing.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
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

                        <div className="flex items-center space-x-6 text-sm text-slate-500">
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
                        className="relative"
                    >
                        {/* Main Dashboard Card */}
                        <div className="relative z-10 bg-navy-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-700/50" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-slate-700/50 rounded" />
                                        <div className="h-3 w-20 bg-slate-700/30 rounded" />
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                                    +12.4%
                                </div>
                            </div>

                            {/* Chart Area */}
                            <div className="h-48 w-full mb-8 relative">
                                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
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
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="bg-navy-900/50 rounded-lg p-3 border border-slate-700/30">
                                        <div className="h-3 w-12 bg-slate-700/30 rounded mb-2" />
                                        <div className="h-5 w-20 bg-slate-700/50 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-8 -right-8 z-20 bg-navy-800/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-xl max-w-[200px]"
                        >
                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-teal-400/20 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="w-4 h-4 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">AI Insight</p>
                                    <p className="text-sm text-white font-medium">Rebalance 5% to ETFs for lower risk.</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            className="absolute -bottom-6 -left-6 z-20 bg-navy-800/90 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-xl"
                        >
                            <div className="flex items-center space-x-3">
                                <PieChart className="w-8 h-8 text-blue-400" />
                                <div>
                                    <p className="text-sm text-white font-bold">Portfolio Health</p>
                                    <div className="w-24 h-1.5 bg-navy-900 rounded-full mt-1 overflow-hidden">
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
