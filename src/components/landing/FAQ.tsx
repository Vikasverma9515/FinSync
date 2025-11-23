'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    {
        question: 'How do you keep my data secure?',
        answer: 'We use bank-level 256-bit encryption to protect your data. We never store your brokerage credentials directly; we use secure third-party aggregators.',
    },
    {
        question: 'Do you give financial advice?',
        answer: 'FinSync provides educational tools and AI-driven insights based on data. We are not a registered investment advisor, and you should consult a professional for personalized advice.',
    },
    {
        question: 'Which brokers can I connect?',
        answer: 'We support over 50+ major brokers and exchanges including Zerodha, Upstox, Groww, Binance, and Coinbase.',
    },
    {
        question: 'Can I cancel anytime?',
        answer: 'Yes, you can cancel your subscription at any time. Your data will be securely deleted upon account closure if you choose.',
    },
];

export default function FAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 bg-navy-900 relative">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Frequently Asked <span className="text-teal-400">Questions</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="border border-slate-700 rounded-xl overflow-hidden bg-navy-800/30"
                        >
                            <button
                                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="text-lg font-medium text-white">{faq.question}</span>
                                {activeIndex === index ? (
                                    <Minus className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                ) : (
                                    <Plus className="w-5 h-5 text-teal-400 flex-shrink-0" />
                                )}
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-6 text-slate-400 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
