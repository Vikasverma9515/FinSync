'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-navy-950 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 rounded-full">
                                <Image
                                    src="/logo.svg"
                                    alt="FinSync Logo"
                                    width={28}
                                    height={28}
                                    className="w-15 h-15"
                                />
                            </div>
                            <span className="text-xl font-bold text-white">
                                Fin<span className="text-teal-400">Sync</span>
                            </span>
                        </Link>
                        <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
                            FinSync provides educational tools and not registered investment advice. We help you track, analyze, and optimize your portfolio with the power of AI.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-slate-400 hover:text-teal-400 transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Product</h3>
                        <ul className="space-y-4">
                            {['Features', 'Pricing', 'AI Planner', 'Security', 'API'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-6">Company</h3>
                        <ul className="space-y-4">
                            {['About Us', 'Blog', 'Careers', 'Contact', 'Press'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-slate-400 hover:text-teal-400 transition-colors text-sm">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-slate-500 text-sm mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} FinSync. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        <Link href="#" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="#" className="text-slate-500 hover:text-teal-400 text-sm transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
