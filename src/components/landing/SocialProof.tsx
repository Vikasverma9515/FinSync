'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: 'Arjun Mehta',
        role: 'Side Hustler',
        content: 'FinSync turned my messy accounts into a single clear picture in one evening. The AI insights are spot on.',
        rating: 5,
        initial: 'A',
        color: 'bg-blue-500',
    },
    {
        name: 'Sarah Jenkins',
        role: 'New Investor',
        content: 'I was intimidated by stocks until I found FinSync. The planner helped me set up a safe, growing portfolio.',
        rating: 5,
        initial: 'S',
        color: 'bg-teal-500',
    },
    {
        name: 'Michael Chen',
        role: 'Working Professional',
        content: 'The real-time alerts saved me from a major market dip. Best investment tool I have used in years.',
        rating: 4,
        initial: 'M',
        color: 'bg-purple-500',
    },
];

export default function SocialProof() {
    return (
        <section id="reviews" className="py-16 md:py-24 bg-navy-900 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Trusted by <span className="text-teal-400">Smart Retail Investors</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                        Join thousands of users who are taking control of their financial future.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -5 }}
                            className="bg-navy-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 md:p-8 hover:border-teal-400/30 transition-all shadow-lg"
                        >
                            <div className="flex items-center space-x-1 mb-4 md:mb-6">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 md:w-5 md:h-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-slate-300 mb-6 md:mb-8 leading-relaxed italic text-sm md:text-base">
                                "{testimonial.content}"
                            </p>

                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-bold text-base md:text-lg`}>
                                    {testimonial.initial}
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold text-sm md:text-base">{testimonial.name}</h4>
                                    <p className="text-slate-500 text-xs md:text-sm">{testimonial.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
