'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X, Smartphone } from 'lucide-react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        return scrollY.onChange((latest) => {
            setIsScrolled(latest > 50);
        });
    }, [scrollY]);

    const navBackground = isScrolled ? 'rgba(10, 25, 47, 0.85)' : 'transparent';
    const navBackdropBlur = isScrolled ? '12px' : '0px';
    const navBorder = isScrolled ? '1px solid rgba(100, 255, 218, 0.1)' : '1px solid transparent';

    return (
        <motion.nav
            style={{
                backgroundColor: navBackground,
                backdropFilter: `blur(${navBackdropBlur})`,
                borderBottom: navBorder,
            }}
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className=" p-2.5 rounded-full">
                            <Image
                                src="/logo.svg"
                                alt="FinSync Logo"
                                width={28}
                                height={28}
                                className="w-15 h-15"
                            />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            FinSync
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {['Features', 'Reviews', 'AI Planner', 'Pricing', 'FAQ'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2.5 text-sm font-semibold text-navy-900 bg-teal-400 rounded-lg hover:bg-teal-300 transition-colors shadow-[0_0_20px_rgba(100,255,218,0.3)] hover:shadow-[0_0_30px_rgba(100,255,218,0.5)]"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-slate-300 hover:text-white transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="md:hidden bg-navy-900 border-b border-navy-700"
                >
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {['Features', 'Reviews', 'AI Planner', 'Pricing', 'FAQ'].map((item) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase().replace(' ', '-')}`}
                                className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-navy-800 rounded-md"
                                onClick={() => setIsOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <div className="pt-4 space-y-3">
                            <Link
                                href="/login"
                                className="block w-full text-center px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-navy-800 rounded-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="block w-full text-center px-3 py-2 text-base font-medium text-navy-900 bg-teal-400 hover:bg-teal-300 rounded-md"
                                onClick={() => setIsOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
