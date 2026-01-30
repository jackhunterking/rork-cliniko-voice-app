'use client';

import { useEffect, useRef } from 'react';

const trustPoints = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    title: 'Official Cliniko API',
    description: 'We use Cliniko\'s official API for secure integration. Your credentials are encrypted and stored on your device only.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'HIPAA-ready security',
    description: 'Built with healthcare compliance in mind. Encrypted storage, secure transmission, and audit-ready logging.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Built with Cliniko users',
    description: 'Every feature shaped by real Cliniko practitioners. We understand how you work because we built this with you.',
  },
];

const faqs = [
  {
    q: 'How does it connect to my Cliniko account?',
    a: 'You\'ll generate an API key from your Cliniko settings and enter it once. The app then securely accesses your patients, appointments, and treatment note templates.',
  },
  {
    q: 'How accurate is the transcription?',
    a: 'Our medical-optimized speech recognition achieves 98%+ accuracy for clinical terminology. Plus, you can always edit before sending to Cliniko.',
  },
  {
    q: 'How much does it cost?',
    a: 'We offer flexible subscription plans designed for healthcare professionals. Early access members get special founding member pricing. Sign up to learn more about our plans.',
  },
];

export function TrustSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal, .reveal-scale');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section bg-white relative overflow-hidden">
      <div className="container-wide">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full mb-6">
            <span className="text-slate-600 text-lg">🛡️</span>
            <span className="text-sm font-semibold text-slate-600">Built for trust</span>
          </div>
          
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Security you can count on
          </h2>
          
          <p className="reveal text-lg md:text-xl text-slate-600 leading-relaxed">
            We know you're handling sensitive patient data. That's why security 
            and privacy aren't features—they're foundations.
          </p>
        </div>

        {/* Trust points grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-20">
          {trustPoints.map((point, index) => (
            <div
              key={point.title}
              className="reveal-scale"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="h-full p-6 md:p-8 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                    {point.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {point.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h3 className="reveal text-2xl font-bold text-slate-900 text-center mb-8">
            Common questions
          </h3>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.q}
                className="reveal card p-6"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <h4 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
