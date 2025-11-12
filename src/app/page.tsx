'use client';
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChartBar, Calculator, Wallet, PiggyBank } from "lucide-react";

export default function HomePage() {
  const features = [
    {
      src: "/investment1.svg",
      title: "Track Investments",
      icon: <ChartBar className="w-12 h-12" />
    },
    {
      src: "/investment2.svg",
      title: "Smart Analytics",
      icon: <Calculator className="w-12 h-12" />
    },
    {
      src: "/investment3.svg",
      title: "Portfolio Management",
      icon: <Wallet className="w-12 h-12" />
    },
    {
      src: "/investment4.svg",
      title: "Wealth Growth",
      icon: <PiggyBank className="w-12 h-12" />
    },
  ];

  return (
    <main className="relative z-10 min-h-screen bg-[#fefee3]">
      {/* Navigation Breadcrumb */}
      <motion.div
        className="flex items-center justify-center pt-12 pb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-3 text-sm text-[#4c956c]">
          <Wallet className="w-4 h-4 text-[#2c6e49]" />
          <span>→</span>
          <ChartBar className="w-4 h-4" />
          <span className="text-[#2c6e49]">Smart-Investing</span>
          <span>→</span>
          <Calculator className="w-4 h-4" />
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="mb-6 text-[#2c6e49]" style={{
            fontSize: "clamp(2.0rem, 7vw, 4.0rem)",
            lineHeight: "1.0",
            letterSpacing: "-0.01em",
            fontWeight: "600"
          }}>
            Smart Investment Tracking,
            <br />
            <span className="text-[#d68c45]">
              Powered by AI!
            </span>
          </h1>

          <motion.p
            className="mx-auto mb-8 text-[#4c956c]"
            style={{
              fontSize: "1.125rem",
              lineHeight: "1.6",
              maxWidth: "600px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Track all your investments in one place with AI-powered insights.
            Make smarter decisions and grow your wealth with FinSync.
          </motion.p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link href="/signup">
            <motion.button
              className="inline-flex items-center text-white px-8 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl bg-[#2c6e49]"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Start Tracking</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="relative mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
        >
          <div className="hidden lg:grid lg:grid-cols-4 gap-12 items-center justify-center">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.3 + index * 0.15 }}
                whileHover={{
                  scale: 1.1,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="relative p-4 bg-[#ffc9b9] rounded-2xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-[#2c6e49] font-medium">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </div>

          {/* Mobile Features Grid */}
          <div className="lg:hidden grid grid-cols-2 gap-8 max-w-md mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center group cursor-pointer"
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.3 + index * 0.15 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div className="mb-3 flex justify-center">
                  <div className="p-3 bg-[#ffc9b9] rounded-xl">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-[#2c6e49] text-sm font-medium">
                  {feature.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}