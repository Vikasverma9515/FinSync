'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Globe, Brain, Bell } from 'lucide-react';

const features = [
    {
        icon: <Zap className="w-6 h-6" />,
        title: 'Smart Stock Review',
        description: 'AI summarizes fundamentals, sentiment, and risk in seconds.',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20',
    },
    {
        icon: <Globe className="w-6 h-6" />,
        title: 'Unified Portfolio View',
        description: 'Track stocks, ETFs, and crypto across multiple brokers.',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
    },
    {
        icon: <Brain className="w-6 h-6" />,
        title: 'AI Investment Planner',
        description: 'Get personalized allocation suggestions based on your goals and risk.',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        border: 'border-purple-400/20',
    },
    {
        icon: <Bell className="w-6 h-6" />,
        title: 'Real-time Alerts',
        description: 'Know when your risk score or sector exposure goes off-balance.',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
    },
];

export default function WhyFinSync() {
    return (
        <section id="features" className="py-24 bg-navy-900 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Why <span className="text-teal-400">FinSync</span>?
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Advanced tools for the modern investor, simplified for everyone.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-navy-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-teal-400/30 transition-all group"
                        >
                            <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.border} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <div className={feature.color}>{feature.icon}</div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
