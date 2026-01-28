'use client';

import { useEffect, useRef } from 'react';

const trustPoints = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: 'Privacy first',
    description:
      'Your patient data stays yours. We use industry-standard encryption and never store voice recordings after processing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
        />
      </svg>
    ),
    title: 'Fits your workflow',
    description:
      'Designed to complement how you already work. Use your existing note templates and documentation style.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: 'Mobile-native',
    description:
      'Built specifically for iOS and Android. Use it between patients, during consultations, or on the go.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    title: 'Built for real clinics',
    description:
      'Developed with input from practising clinicians. We understand the pace and demands of clinical work.',
  },
];

export function TrustSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.animate-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section bg-surface">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <p className="animate-on-scroll opacity-0 text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Why Us
          </p>
          <h2 className="animate-on-scroll opacity-0 animate-delay-100 font-display text-display-sm md:text-display-md text-secondary mb-4">
            Designed for clinicians,
            <br />
            by clinicians
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-200 text-lg text-secondary-light max-w-2xl mx-auto">
            We understand the unique demands of clinical practice. Every feature is built with your workflow in mind.
          </p>
        </div>

        {/* Trust points grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className={`animate-on-scroll opacity-0 animate-delay-${(index + 1) * 100}`}
            >
              <div className="flex gap-4 p-6 rounded-2xl bg-surface-secondary hover:bg-surface-tertiary transition-colors">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                  {point.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {point.title}
                  </h3>
                  <p className="text-secondary-light leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Early access callout */}
        <div className="mt-16 md:mt-20">
          <div className="animate-on-scroll opacity-0 relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-8 md:p-12 text-center">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-white">Early Access</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
                Be among the first to try it
              </h3>
              <p className="text-white/80 max-w-xl mx-auto mb-2">
                We're rolling out access gradually to ensure the best experience. 
                Early testers get free access during our beta period and help shape the product.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
