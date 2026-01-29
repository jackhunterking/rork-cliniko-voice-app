'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const steps = [
  {
    number: '01',
    title: 'Sync your Cliniko patients',
    description: 'Connect your Cliniko account once. Your patients and appointments appear automatically.',
    visual: 'patient-select',
  },
  {
    number: '02',
    title: 'Speak naturally',
    description: 'Talk like you\'re explaining to a colleague. No commands, no special phrases. Just speak.',
    visual: 'recording',
  },
  {
    number: '03',
    title: 'Review & refine',
    description: 'Your words become beautifully structured treatment notes. Make a quick edit if needed.',
    visual: 'review',
  },
  {
    number: '04',
    title: 'Send to Cliniko',
    description: 'One tap to save directly to your Cliniko patient record. Move on knowing admin is handled.',
    visual: 'complete',
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

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

    const elements = sectionRef.current?.querySelectorAll('.reveal, .reveal-left');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Auto-progress through steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="section bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-gradient-to-r from-cyan-100/30 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container-wide relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 rounded-full mb-6">
            <span className="text-cyan-600 text-lg">🔗</span>
            <span className="text-sm font-semibold text-cyan-700">Seamless Cliniko integration</span>
          </div>
          
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Voice to Cliniko in seconds
          </h2>
          
          <p className="reveal text-lg md:text-xl text-slate-600 leading-relaxed">
            Connect your Cliniko account once. From then on, just speak and your 
            treatment notes flow directly into your patient records.
          </p>
        </div>

        {/* Steps with interactive visual */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Steps list */}
          <div className="order-2 lg:order-1">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-6 rounded-2xl transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-white shadow-lg border-2 border-cyan-500'
                      : 'bg-transparent border-2 border-transparent hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step number */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-colors ${
                      activeStep === index
                        ? 'bg-gradient-to-br from-cyan-500 to-cyan-400 text-white shadow-lg shadow-cyan-500/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {step.number}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg font-bold mb-1 transition-colors ${
                        activeStep === index ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm leading-relaxed transition-colors ${
                        activeStep === index ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Active indicator */}
                    {activeStep === index && (
                      <svg className="w-6 h-6 text-cyan-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual preview */}
          <div className="order-1 lg:order-2 reveal-left">
            <div className="relative">
              {/* Phone mockup */}
              <div className="phone-frame w-[280px] md:w-[300px] mx-auto">
                <div className="phone-notch" />
                <div className="phone-screen aspect-[9/19.5] bg-white">
                  {/* Dynamic content based on active step */}
                  <div className="h-full flex flex-col">
                    <div className="h-10" />
                    
                    {/* Step 1: Patient select - Cliniko Sync */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <Image
                        src="/mockups/appointments.png"
                        alt="Today's appointments synced from Cliniko"
                        fill
                        className="object-cover object-top"
                        sizes="300px"
                      />
                    </div>
                    
                    {/* Step 2: Recording - Live Transcription */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 1 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <Image
                        src="/mockups/live-transcription.png"
                        alt="Live transcription - speak naturally while the app transcribes in real-time"
                        fill
                        className="object-cover object-top"
                        sizes="300px"
                      />
                    </div>
                    
                    {/* Step 3: Review - Edit Treatment Note */}
                    <div className={`absolute inset-0 transition-opacity duration-500 ${activeStep === 2 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <Image
                        src="/mockups/review.png"
                        alt="Review and edit your treatment note with structured fields"
                        fill
                        className="object-cover object-top"
                        sizes="300px"
                      />
                    </div>
                    
                    {/* Step 4: Complete */}
                    <div className={`absolute inset-0 pt-10 transition-opacity duration-500 ${activeStep === 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <div className="h-full flex flex-col items-center justify-center p-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Saved to Cliniko!</h3>
                        <p className="text-sm text-slate-500 text-center mb-4">Sarah Mitchell's record updated</p>
                        <div className="px-4 py-2 bg-amber-50 rounded-full">
                          <span className="text-sm font-medium text-amber-700">⏱️ 47 seconds saved</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-6" />
                  </div>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeStep === i ? 'w-8 bg-cyan-500' : 'w-1.5 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Time comparison */}
        <div className="reveal max-w-3xl mx-auto">
          <div className="card-elevated p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
              {/* Before */}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Typing a note</p>
                <p className="text-4xl md:text-5xl font-black text-red-500">5-10</p>
                <p className="text-lg font-medium text-slate-600">minutes</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              {/* After */}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400 mb-2">Speaking a note</p>
                <p className="text-4xl md:text-5xl font-black gradient-text">30-60</p>
                <p className="text-lg font-medium text-slate-600">seconds</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
              <p className="text-lg text-slate-600">
                That's <span className="font-bold text-cyan-600">up to 10x faster</span>. 
                Save hours every week for what actually matters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
