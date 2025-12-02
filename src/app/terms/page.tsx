'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
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
                            <FileText className="w-8 h-8 text-teal-400" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
                    </div>

                    <div className="bg-navy-800/50 border border-slate-700/50 rounded-2xl p-6 md:p-10 space-y-8 backdrop-blur-sm">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing and using FinSync ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
                            <p className="leading-relaxed">
                                FinSync provides users with financial tracking, investment analysis, and AI-powered wealth management advice. You understand and agree that the Service is provided "AS-IS" and that FinSync assumes no responsibility for the timeliness, deletion, mis-delivery or failure to store any user communications or personalization settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">3. Financial Advice Disclaimer</h2>
                            <p className="leading-relaxed">
                                The content provided by FinSync, including AI-generated recommendations, is for informational purposes only and does not constitute professional financial advice. You should not rely solely on this information for making financial decisions. We strongly recommend consulting with a qualified financial advisor before making any investment decisions.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">4. User Account Security</h2>
                            <p className="leading-relaxed">
                                You are responsible for maintaining the confidentiality of your password and account, and are fully responsible for all activities that occur under your password or account. FinSync cannot and will not be liable for any loss or damage arising from your failure to comply with this Section.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">5. Privacy Policy</h2>
                            <p className="leading-relaxed">
                                Your use of the Service is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-4">6. Modifications to Service</h2>
                            <p className="leading-relaxed">
                                FinSync reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. You agree that FinSync shall not be liable to you or to any third party for any modification, suspension or discontinuance of the Service.
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
