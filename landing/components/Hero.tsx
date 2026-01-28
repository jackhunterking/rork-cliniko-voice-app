'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onCtaClick: () => void;
}

export function Hero({ onCtaClick }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50/30"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orb */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/40 to-emerald-100/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-amber-100/30 to-orange-50/20 rounded-full blur-3xl animate-float" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #0d9488 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container-wide pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200/50 rounded-full mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
              </span>
              <span className="text-sm font-semibold text-teal-700">
                Now accepting early access requests
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Your voice.
              <br />
              <span className="gradient-text">Perfect notes.</span>
            </h1>

            {/* Subheadline with clear benefit */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed font-medium">
              Speak your clinical notes. Get formatted documentation in seconds.
            </p>
            
            {/* Pain point callout */}
            <p className="text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 mb-10">
              No more typing after hours. No more weekend catch-up. 
              <span className="text-slate-700 font-medium"> Get your evenings back.</span>
            </p>

            {/* CTA Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <button
                onClick={onCtaClick}
                className="btn-primary text-lg group"
              >
                <span>Get Early Access</span>
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <a href="#how-it-works" className="btn-secondary">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>See how it works</span>
              </a>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 justify-center lg:justify-start">
              {[
                { icon: '🔒', text: 'HIPAA-ready security' },
                { icon: '⚡', text: 'Works offline' },
                { icon: '🎯', text: 'Built for allied health' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Mockup with App Preview */}
          <div className={`relative flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Decorative elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-teal-400/20 to-emerald-300/10 rounded-full blur-3xl" />
            
            {/* Main phone */}
            <div className="relative">
              <div className="phone-frame w-[300px] md:w-[340px] animate-float-slow">
                <div className="phone-notch" />
                <div className="phone-screen aspect-[9/19.5]">
                  {/* App UI */}
                  <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50">
                    {/* Status bar */}
                    <div className="h-12 flex items-end justify-center pb-1">
                      <span className="text-xs font-medium text-slate-400">9:41</span>
                    </div>
                    
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <div className="text-center">
                          <h3 className="text-base font-semibold text-slate-900">New Note</h3>
                          <div className="flex items-center justify-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-medium text-red-500">Recording</span>
                          </div>
                        </div>
                        <div className="w-6" />
                      </div>
                    </div>
                    
                    {/* Patient badge */}
                    <div className="mx-4 mt-3 px-4 py-2.5 bg-teal-50 rounded-xl border border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-semibold">
                          SM
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">Sarah Mitchell</p>
                          <p className="text-xs text-slate-500">Follow-up • Lower back</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Transcript */}
                    <div className="flex-1 px-5 py-4 overflow-hidden">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Patient reports significant improvement in lower back pain since last session.
                        <span className="text-slate-400"> ROM has increased to 80% with minimal discomfort during extension...</span>
                        <span className="inline-block w-0.5 h-4 bg-teal-500 animate-pulse ml-0.5 align-middle" />
                      </p>
                    </div>
                    
                    {/* Waveform */}
                    <div className="px-6 py-3 flex items-center justify-center gap-[3px]">
                      {[...Array(32)].map((_, i) => (
                        <div
                          key={i}
                          className="waveform-bar w-[3px] rounded-full"
                          style={{
                            '--wave-height': `${12 + Math.sin(i * 0.5) * 16 + Math.random() * 8}px`,
                            animationDelay: `${i * 30}ms`,
                          } as React.CSSProperties}
                        />
                      ))}
                    </div>
                    
                    {/* Controls */}
                    <div className="px-6 py-4 flex items-center justify-center gap-8">
                      <button className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <button className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse-glow">
                        <div className="w-6 h-6 bg-white rounded-sm" />
                      </button>
                      <button className="w-12 h-12 rounded-full border-2 border-teal-500 flex items-center justify-center text-teal-500 hover:bg-teal-50 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Home indicator */}
                    <div className="h-8 flex justify-center items-center">
                      <div className="w-32 h-1 bg-slate-200 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -right-4 md:right-0 top-1/3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100 animate-slide-in-left" style={{ animationDelay: '800ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Note ready!</p>
                    <p className="text-xs text-slate-500">Formatted in 2.3 seconds</p>
                  </div>
                </div>
              </div>
              
              {/* Time saved badge */}
              <div className="absolute -left-4 md:left-0 bottom-1/4 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 rounded-2xl shadow-lg border border-amber-100/50 animate-scale-in" style={{ animationDelay: '1000ms' }}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <p className="text-xs text-amber-700 font-medium">Time saved today</p>
                    <p className="text-lg font-bold text-amber-600">47 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-slate-400">
          <span className="text-xs font-medium">Scroll to explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-slate-300 flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
