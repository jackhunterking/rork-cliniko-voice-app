'use client';

import { useEffect, useRef } from 'react';

export function VisualProof() {
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
    <section ref={sectionRef} className="section bg-surface-secondary overflow-hidden">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="animate-on-scroll opacity-0 font-display text-display-sm md:text-display-md text-secondary mb-4">
            See it in action
          </h2>
          <p className="animate-on-scroll opacity-0 animate-delay-100 text-lg text-secondary-light max-w-2xl mx-auto">
            A seamless mobile experience designed for the realities of clinical practice.
          </p>
        </div>

        {/* Mockup display */}
        <div className="relative flex justify-center items-end gap-4 md:gap-8">
          {/* Left phone - smaller, angled */}
          <div className="animate-on-scroll opacity-0 animate-delay-100 hidden sm:block">
            <div className="relative w-[200px] md:w-[240px] -rotate-6 transform-gpu">
              <div className="bg-secondary rounded-[2.5rem] p-2 shadow-elevated">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
                <div className="bg-surface rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                  {/* Patient list screen mockup */}
                  <div className="absolute inset-0 flex flex-col p-3">
                    <div className="h-8" />
                    <div className="px-2 py-2">
                      <div className="h-3 w-20 bg-secondary/10 rounded mb-1" />
                      <div className="h-2 w-24 bg-secondary/5 rounded" />
                    </div>
                    {/* Patient cards */}
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="mt-2 bg-surface-secondary rounded-xl p-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-light" />
                          <div className="flex-1">
                            <div className="h-2 bg-secondary/10 rounded w-3/4 mb-1" />
                            <div className="h-1.5 bg-secondary/5 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-secondary">Patient List</p>
              </div>
            </div>
          </div>

          {/* Center phone - main, larger */}
          <div className="animate-on-scroll opacity-0 animate-delay-200 z-10">
            <div className="relative w-[280px] md:w-[320px]">
              {/* Glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-t from-primary/20 to-transparent rounded-full blur-3xl opacity-50" />
              
              <div className="relative bg-secondary rounded-[3rem] p-3 shadow-elevated">
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-10" />
                <div className="bg-surface rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                  {/* Live recording screen mockup */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-12" />
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-secondary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-secondary">New Note</h3>
                        <p className="text-2xs text-red-500 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          Recording
                        </p>
                      </div>
                      <div className="w-5" />
                    </div>
                    
                    {/* Patient badge */}
                    <div className="px-4 py-2 bg-primary-light/50 flex items-center gap-2">
                      <span className="text-xs text-secondary-light">Recording for</span>
                      <span className="text-xs font-medium text-primary">Sarah Mitchell</span>
                    </div>
                    
                    {/* Transcript area */}
                    <div className="flex-1 p-4">
                      <p className="text-sm text-secondary leading-relaxed">
                        Patient presents with lower back pain radiating to the left leg. 
                        <span className="text-secondary-light"> Pain started three weeks ago after lifting...</span>
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
                      </p>
                    </div>
                    
                    {/* Waveform visualization */}
                    <div className="px-6 py-4 flex items-center justify-center gap-1">
                      {[...Array(24)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-full"
                          style={{
                            height: `${Math.random() * 24 + 8}px`,
                            opacity: 0.3 + Math.random() * 0.7,
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Recording controls */}
                    <div className="p-4 flex items-center justify-center gap-6">
                      <div className="w-12 h-12 rounded-full border-2 border-secondary/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-secondary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 bg-white rounded-sm" />
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-primary flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="h-8 flex justify-center items-center">
                      <div className="w-32 h-1 bg-secondary/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-secondary">Live Recording</p>
              </div>
            </div>
          </div>

          {/* Right phone - smaller, angled */}
          <div className="animate-on-scroll opacity-0 animate-delay-300 hidden sm:block">
            <div className="relative w-[200px] md:w-[240px] rotate-6 transform-gpu">
              <div className="bg-secondary rounded-[2.5rem] p-2 shadow-elevated">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
                <div className="bg-surface rounded-[2rem] overflow-hidden aspect-[9/19.5]">
                  {/* Note editor screen mockup */}
                  <div className="absolute inset-0 flex flex-col p-3">
                    <div className="h-8" />
                    <div className="px-2 py-2 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="h-2 w-16 bg-secondary/10 rounded" />
                        <div className="px-2 py-0.5 bg-accent-mint/10 rounded">
                          <span className="text-2xs text-accent-mint font-medium">Ready</span>
                        </div>
                      </div>
                    </div>
                    {/* Note fields */}
                    <div className="p-2 space-y-3">
                      <div>
                        <div className="h-1.5 w-16 bg-primary/20 rounded mb-1" />
                        <div className="h-2 w-full bg-secondary/10 rounded mb-0.5" />
                        <div className="h-2 w-4/5 bg-secondary/10 rounded" />
                      </div>
                      <div>
                        <div className="h-1.5 w-20 bg-primary/20 rounded mb-1" />
                        <div className="h-2 w-full bg-secondary/10 rounded mb-0.5" />
                        <div className="h-2 w-3/4 bg-secondary/10 rounded" />
                      </div>
                      <div>
                        <div className="h-1.5 w-12 bg-primary/20 rounded mb-1" />
                        <div className="h-2 w-full bg-secondary/10 rounded" />
                      </div>
                    </div>
                    {/* Save button */}
                    <div className="mt-auto p-3">
                      <div className="h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-2xs text-white font-medium">Save Note</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="text-center mt-4">
                <p className="text-sm font-medium text-secondary">Formatted Note</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { icon: '🎤', label: 'Voice Input', desc: 'Speak naturally' },
            { icon: '⚡', label: 'Real-time', desc: 'Instant transcription' },
            { icon: '✨', label: 'Smart Format', desc: 'Auto-structured notes' },
            { icon: '📋', label: 'Templates', desc: "Your clinic's format" },
          ].map((feature, i) => (
            <div
              key={feature.label}
              className={`animate-on-scroll opacity-0 animate-delay-${(i + 1) * 100} text-center p-4`}
            >
              <div className="text-3xl mb-2">{feature.icon}</div>
              <p className="font-medium text-secondary">{feature.label}</p>
              <p className="text-sm text-secondary-light">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
