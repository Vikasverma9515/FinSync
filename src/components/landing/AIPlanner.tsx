'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AIPlanner() {
    return (
        <section id="ai-planner" className="py-24 bg-navy-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Chat Interface */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="bg-navy-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl"
                    >
                        <div className="bg-navy-900 p-4 border-b border-slate-700 flex items-center space-x-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="ml-4 text-sm text-slate-400">FinSync AI Planner</span>
                        </div>

                        <div className="p-6 space-y-6 h-[400px] overflow-y-auto">
                            {/* User Message */}
                            <div className="flex justify-end">
                                <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%]">
                                    <p className="text-sm">I'm 22, want to start investing with ₹5,000/month. What should I do?</p>
                                </div>
                            </div>

                            {/* AI Message */}
                            <div className="flex justify-start">
                                <div className="bg-navy-700 text-slate-200 p-4 rounded-2xl rounded-tl-none max-w-[85%] border border-slate-600">
                                    <p className="text-sm mb-3">Here's a beginner-friendly plan optimized for long-term growth:</p>
                                    <div className="space-y-2 mb-3">
                                        <div className="flex items-center justify-between text-xs bg-navy-800 p-2 rounded">
                                            <span>Index Funds (Nifty 50)</span>
                                            <span className="text-teal-400 font-bold">70%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs bg-navy-800 p-2 rounded">
                                            <span>Blue-chip Stocks</span>
                                            <span className="text-blue-400 font-bold">20%</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs bg-navy-800 p-2 rounded">
                                            <span>High-growth Small Cap</span>
                                            <span className="text-purple-400 font-bold">10%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400">This allocation balances stability with growth potential suitable for your age.</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-navy-900 border-t border-slate-700">
                            <div className="h-10 bg-navy-800 rounded-lg border border-slate-600 w-full animate-pulse" />
                        </div>
                    </motion.div>

                    {/* Right: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Your Personal <span className="text-teal-400">AI Wealth Manager</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                            Stop guessing. Let our advanced AI analyze your goals, risk tolerance, and market conditions to build the perfect portfolio for you.
                        </p>

                        <div className="space-y-6 mb-8">
                            {[
                                'Risk profiling & Goal-based suggestions',
                                'Automatic rebalancing recommendations',
                                'Tax-saving investment strategies',
                                'Retirement & Emergency fund planning'
                            ].map((item, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                    <span className="text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>

                        <button className="flex items-center text-teal-400 font-semibold hover:text-teal-300 transition-colors group">
                            Try AI Planner Now
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
