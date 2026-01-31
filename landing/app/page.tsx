'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { Hero } from '@/components/Hero';
import { VisualProof } from '@/components/VisualProof';
import { ProblemSection } from '@/components/ProblemSection';
import { HowItWorks } from '@/components/HowItWorks';
import { TrustSection } from '@/components/TrustSection';
import { SignupForm } from '@/components/SignupForm';
import { Footer } from '@/components/Footer';

export default function LandingPage() {
  const formRef = useRef<HTMLElement>(null);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-white via-white/95 to-transparent md:hidden">
        <button
          onClick={scrollToForm}
          className="btn-primary w-full shadow-xl"
        >
          Get Early Access
        </button>
      </div>

      {/* Navigation - Simple sticky header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Cliniko Voice Logo" 
                width={36} 
                height={36} 
                className="rounded-xl"
              />
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Cliniko Voice</span>
              </div>
            </div>

            {/* Desktop CTA */}
            <button
              onClick={scrollToForm}
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Get Early Access
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <Hero onCtaClick={scrollToForm} />

      {/* Problem Section - Lead with pain */}
      <ProblemSection />

      {/* How It Works - Show the solution */}
      <HowItWorks />

      {/* Visual Proof - Benefits & journey placeholder */}
      <VisualProof />

      {/* Trust Section */}
      <TrustSection />

      {/* Signup Form */}
      <SignupForm formRef={formRef} />

      {/* Footer */}
      <Footer />

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-24 md:hidden" />
    </main>
  );
}
