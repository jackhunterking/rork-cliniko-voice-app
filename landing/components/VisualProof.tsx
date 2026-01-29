'use client';

import { useEffect, useRef } from 'react';

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
            <span className="text-sm font-semibold text-cyan-300">Purpose-built for Cliniko</span>
          </div>
          
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            The missing piece for Cliniko
          </h2>
          
          <p className="reveal text-lg md:text-xl text-slate-400 leading-relaxed">
            Cliniko is brilliant for practice management. We built the voice documentation 
            layer it's been missing—designed to work exactly like you'd expect.
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

      </div>
    </section>
  );
}
