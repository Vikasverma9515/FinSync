'use client'

import { motion } from 'framer-motion'
import { Activity, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'

export function DashboardLoader() {
    const [loadingText, setLoadingText] = useState('Initializing FinSync AI...')

    const loadingStates = [
        'Syncing Market Data...',
        'Analyzing Portfolio Performance...',
        'Calculating AI Predictions...',
        'Optimizing Assets...',
        'Finalizing Dashboard...'
    ]

    useEffect(() => {
        let currentIndex = 0
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % loadingStates.length
            setLoadingText(loadingStates[currentIndex])
        }, 800)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 bg-navy-900 z-50 flex flex-col items-center justify-center overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Central Logo Animation */}
                <div className="relative mb-12">
                    {/* Outer rotating ring */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full border-t-2 border-r-2 border-teal-500/30"
                    />

                    {/* Inner rotating ring (reverse) */}
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute top-2 left-2 w-20 h-20 rounded-full border-b-2 border-l-2 border-purple-500/30"
                    />

                    {/* Center Icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="bg-navy-800 p-4 rounded-full border border-teal-500/20 shadow-[0_0_15px_rgba(100,255,218,0.3)]"
                        >
                            <Activity className="w-8 h-8 text-teal-400" />
                        </motion.div>
                    </div>

                    {/* Orbiting particles */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 w-full h-full"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-teal-400 rounded-full shadow-[0_0_10px_#64ffda]" />
                    </motion.div>
                </div>

                {/* Text and Progress */}
                <div className="text-center space-y-4">
                    <motion.h2
                        key={loadingText}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xl font-medium text-white min-w-[280px]"
                    >
                        {loadingText}
                    </motion.h2>

                    <div className="w-64 h-1 bg-navy-800 rounded-full overflow-hidden mx-auto">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-full h-full bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-50"
                        />
                    </div>
                </div>

                {/* Floating Icons Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                        animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 0 }}
                        className="absolute top-[-100px] left-[-150px]"
                    >
                        <TrendingUp className="w-12 h-12 text-teal-500/20" />
                    </motion.div>
                    <motion.div
                        animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                        className="absolute bottom-[-100px] right-[-150px]"
                    >
                        <BarChart3 className="w-12 h-12 text-purple-500/20" />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
