'use client';

import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import WhyFinSync from '@/components/landing/WhyFinSync';
import DashboardPreview from '@/components/landing/DashboardPreview';
import AIPlanner from '@/components/landing/AIPlanner';
import SocialProof from '@/components/landing/SocialProof';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-navy-900 text-white selection:bg-teal-400/30 selection:text-teal-200">
      <Navbar />
      <Hero />
      <WhyFinSync />
      <DashboardPreview />
      <AIPlanner />
      <SocialProof />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}