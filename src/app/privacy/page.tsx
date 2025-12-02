'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Lock } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-navy-900 text-slate-300 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/signup"
                    className="inline-flex items-center text-teal-400 hover:text-teal-300 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign Up
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                            <Shield className="w-8 h-8 text-teal-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
                    </div>

                    <div className="bg-navy-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-10 space-y-8 backdrop-blur-sm">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
                            <p className="leading-relaxed mb-4">
                                We collect information you provide directly to us when you create an account, update your profile, or use our financial planning tools. This includes:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li>Personal identification information (Name, email address)</li>
                                <li>Financial information (Income, expenses, savings goals, portfolio holdings)</li>
                                <li>Risk tolerance and investment preferences</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
                            <p className="leading-relaxed mb-4">
                                We use the information we collect to:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-slate-400">
                                <li>Provide, maintain, and improve our services</li>
                                <li>Generate personalized financial plans and investment recommendations</li>
                                <li>Process your transactions and manage your portfolio data</li>
                                <li>Send you technical notices, updates, and support messages</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Data Security</h2>
                            <p className="leading-relaxed">
                                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. We use industry-standard encryption for data transmission and storage.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. Sharing of Information</h2>
                            <p className="leading-relaxed">
                                We do not sell your personal information to third parties. We may share your information with third-party vendors, consultants and other service providers who need access to such information to carry out work on our behalf, subject to strict confidentiality obligations.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
                            <p className="leading-relaxed">
                                You have the right to access, correct, or delete your personal information at any time. You can manage your account settings within the application or contact us for assistance.
                            </p>
                        </section>

                        <div className="pt-8 border-t border-slate-700/50 text-sm text-slate-500">
                            Last updated: December 2025
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
