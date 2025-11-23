'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function CTA() {
    return (
        <section className="py-20 bg-gradient-to-r from-teal-900/20 to-blue-900/20 border-y border-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm -z-10" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                    Ready to invest with <span className="text-teal-400">clarity</span>, not chaos?
                </h2>
                <p className="text-slate-400 text-lg mb-10">
                    Join the new standard of personal finance management today.
                </p>

                <div className="flex flex-col items-center">
                    <Link href="/signup">
                        <button className="px-10 py-4 bg-teal-400 text-navy-900 rounded-full font-bold text-lg hover:bg-teal-300 transition-all shadow-[0_0_20px_rgba(100,255,218,0.4)] hover:shadow-[0_0_30px_rgba(100,255,218,0.6)] flex items-center">
                            Connect Your First Portfolio
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </Link>
                    <p className="mt-4 text-sm text-slate-500">
                        Takes under 2 minutes • No card required
                    </p>
                </div>
            </div>
        </section>
    );
}
