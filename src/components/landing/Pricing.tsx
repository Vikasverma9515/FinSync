'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: '/month',
        description: 'Perfect for getting started',
        features: ['Basic portfolio tracking', 'Manual trade entry', 'Daily market summary', '1 Connected Broker'],
        cta: 'Start Free',
        popular: false,
    },
    {
        name: 'Pro',
        price: '₹499',
        period: '/month',
        description: 'For serious investors',
        features: ['AI Investment Planner', 'Unlimited Broker Sync', 'Real-time Risk Alerts', 'Advanced Portfolio Analytics', 'Priority Support'],
        cta: 'Start 14-day Free Trial',
        popular: true,
    },
    {
        name: 'Elite',
        price: '₹999',
        period: '/month',
        description: 'For power users',
        features: ['Everything in Pro', 'Tax Harvesting Reports', '1-on-1 Advisor Call', 'Custom API Access', 'Early Access to Features'],
        cta: 'Contact Sales',
        popular: false,
    },
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-16 md:py-24 bg-navy-950 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Simple, Transparent <span className="text-teal-400">Pricing</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
                        Choose the plan that fits your investment journey. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative bg-navy-800/50 backdrop-blur-sm border ${plan.popular ? 'border-teal-400 shadow-[0_0_30px_rgba(100,255,218,0.1)]' : 'border-slate-700/50'} rounded-2xl p-6 md:p-8 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-400 text-navy-900 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6 md:mb-8">
                                <h3 className="text-lg md:text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-xs md:text-sm mb-4 md:mb-6">{plan.description}</p>
                                <div className="flex items-baseline">
                                    <span className="text-3xl md:text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-500 ml-2 text-sm md:text-base">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-4 h-4 md:w-5 md:h-5 text-teal-400 mr-3 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${plan.popular
                                    ? 'bg-teal-400 text-navy-900 hover:bg-teal-300 shadow-lg'
                                    : 'bg-navy-700 text-white hover:bg-navy-600 border border-slate-600'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
