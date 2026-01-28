'use client';

import { useEffect, useRef } from 'react';

const benefits = [
  {
    icon: '🎯',
    title: 'Built for allied health',
    description: 'Designed specifically for physios, chiros, osteos, and allied health practitioners. Not a generic dictation tool.',
  },
  {
    icon: '📋',
    title: 'Your templates, your format',
    description: 'Uses your existing note structure. SOAP, DAP, or custom—it adapts to how you already work.',
  },
  {
    icon: '⚡',
    title: 'Real-time transcription',
    description: 'See your words appear as you speak. Edit on the fly or review when you\'re done.',
  },
  {
    icon: '🔄',
    title: 'Seamless workflow',
    description: 'Works alongside your practice management software. Copy, export, or save directly.',
  },
];

const stats = [
  { value: '10x', label: 'Faster than typing', color: 'text-cyan-500' },
  { value: '47min', label: 'Saved per day avg.', color: 'text-cyan-400' },
  { value: '98%', label: 'Transcription accuracy', color: 'text-cyan-500' },
];

export function VisualProof() {
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
    <section ref={sectionRef} className="section bg-slate-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>
      
      <div className="container-wide relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <span className="text-cyan-400 text-lg">🏥</span>
            <span className="text-sm font-semibold text-cyan-300">Purpose-built for clinical work</span>
          </div>
          
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            More than just dictation
          </h2>
          
          <p className="reveal text-lg md:text-xl text-slate-400 leading-relaxed">
            We didn't build another voice-to-text tool. We built a clinical documentation 
            system that understands how practitioners actually work.
          </p>
        </div>

        {/* Stats bar */}
        <div className="reveal flex flex-wrap justify-center gap-8 md:gap-16 mb-16 md:mb-20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-4xl md:text-5xl font-black ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="reveal-scale"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="group p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{benefit.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Journey preview placeholder */}
        <div className="reveal">
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-sm font-medium text-cyan-400 mb-2">THE CLINICIAN JOURNEY</p>
              <h3 className="text-2xl font-bold text-white">See how it fits your day</h3>
            </div>
            
            {/* Mockup placeholder for journey screens */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {[
                  { time: 'Morning', title: 'Quick setup', desc: 'Open app, select patient from today\'s schedule' },
                  { time: 'During session', title: 'Hands-free notes', desc: 'Speak while treating, review between patients' },
                  { time: 'End of day', title: 'All done', desc: 'No backlog. Head home on time.' },
                ].map((item, i) => (
                  <div key={item.time} className="relative">
                    <div className="text-xs font-semibold text-cyan-400 mb-3">{item.time.toUpperCase()}</div>
                    {/* Placeholder for mockup image */}
                    <div className="aspect-[9/16] bg-slate-800 rounded-2xl border border-slate-700 mb-4 flex items-center justify-center group hover:border-cyan-500/50 transition-colors">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">{['📱', '🎤', '✅'][i]}</span>
                        </div>
                        <p className="text-sm text-slate-500">App mockup placeholder</p>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-sm text-slate-500 mt-8">
                🖼️ Full journey mockups coming soon — you'll be able to see every screen in detail
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
