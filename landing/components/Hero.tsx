'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

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
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/30"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large gradient orb */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/40 to-cyan-100/30 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-amber-100/30 to-orange-50/20 rounded-full blur-3xl animate-float" />
        
        {/* Subtle grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #007fa3 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative container-wide pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className={`text-center lg:text-left transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Announcement badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-200/50 rounded-full mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="text-sm font-semibold text-cyan-700">
                🎯 Designed exclusively for Cliniko users
              </span>
            </div>

            {/* Main headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Voice notes for
              <br />
              <span className="gradient-text">Cliniko.</span>
            </h1>

            {/* Subheadline with clear benefit */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-xl mx-auto lg:mx-0 mb-4 leading-relaxed font-medium">
              Speak your treatment notes. Send directly to Cliniko in seconds.
            </p>
            
            {/* Pain point callout */}
            <p className="text-lg text-slate-500 max-w-lg mx-auto lg:mx-0 mb-10">
              The voice documentation app built specifically for Cliniko. 
              <span className="text-slate-700 font-medium"> No more typing. No more admin backlog.</span>
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
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 justify-center lg:justify-start">
              {[
                { icon: '🔗', text: 'Native Cliniko integration' },
                { icon: '🔒', text: 'HIPAA-ready security' },
                { icon: '⚡', text: 'Works offline' },
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
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/20 to-cyan-300/10 rounded-full blur-3xl" />
            
            {/* Main phone */}
            <div className="relative">
              <div className="phone-frame w-[300px] md:w-[340px] animate-float-slow">
                <div className="phone-notch" />
                <div className="phone-screen aspect-[9/19.5] relative overflow-hidden">
                  {/* Real app screenshot */}
                  <Image
                    src="/mockups/live-transcription.png"
                    alt="Live transcription - speak naturally while the app transcribes in real-time"
                    fill
                    className="object-cover object-top"
                    sizes="340px"
                    priority
                  />
                  {/* Subtle animated overlay for "live" effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -right-4 md:right-0 top-1/3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100 animate-slide-in-left" style={{ animationDelay: '800ms' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
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
