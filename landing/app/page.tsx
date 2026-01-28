'use client';

import { useRef, useCallback } from 'react';
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
    <main className="min-h-screen">
      {/* Sticky mobile CTA - appears after scrolling past hero */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-surface via-surface to-transparent md:hidden">
        <button
          onClick={scrollToForm}
          className="btn-primary w-full shadow-elevated"
        >
          Request Early Access
        </button>
      </div>

      {/* Hero Section */}
      <Hero onCtaClick={scrollToForm} />

      {/* Visual Proof Section */}
      <VisualProof />

      {/* Problem Section */}
      <ProblemSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Trust Section */}
      <TrustSection />

      {/* Signup Form Section */}
      <SignupForm formRef={formRef} />

      {/* Footer */}
      <Footer />

      {/* Bottom padding for mobile sticky CTA */}
      <div className="h-20 md:hidden" />
    </main>
  );
}
