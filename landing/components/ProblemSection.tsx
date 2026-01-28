'use client';

import { useEffect, useRef } from 'react';

const painPoints = [
  {
    emoji: '😫',
    stat: '2+ hours',
    statLabel: 'per day',
    title: 'Drowning in documentation',
    description: 'The average clinician spends over 2 hours daily on notes alone. That\'s 10+ hours every week you\'ll never get back.',
    color: 'from-red-500 to-rose-500',
    bgColor: 'from-red-50 to-rose-50',
    borderColor: 'border-red-100',
  },
  {
    emoji: '🌙',
    stat: '67%',
    statLabel: 'work after hours',
    title: 'Your evenings aren\'t yours',
    description: 'Two-thirds of allied health professionals finish their notes outside work hours. Dinner interrupted. Family time stolen.',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-100',
  },
  {
    emoji: '🔥',
    stat: '#1',
    statLabel: 'burnout cause',
    title: 'This isn\'t why you trained',
    description: 'Admin burden is the leading cause of clinician burnout. You became a practitioner to help people, not to type.',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-100',
  },
];

export function ProblemSection() {
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
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50 to-transparent" />
      
      <div className="container-wide relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-6">
            <span className="text-red-500 text-lg">⚠️</span>
            <span className="text-sm font-semibold text-red-600">The documentation crisis</span>
          </div>
          
          <h2 className="reveal font-display text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-6">
            Sound familiar?
          </h2>
          
          <p className="reveal text-lg md:text-xl text-slate-600 leading-relaxed">
            You're not alone. Clinicians everywhere are struggling with the same 
            documentation burden. It's time for a better way.
          </p>
        </div>

        {/* Pain points grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {painPoints.map((point, index) => (
            <div
              key={point.title}
              className="reveal-scale group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className={`h-full p-8 rounded-3xl bg-gradient-to-br ${point.bgColor} border ${point.borderColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}>
                {/* Emoji + Stat */}
                <div className="flex items-start justify-between mb-6">
                  <span className="text-5xl">{point.emoji}</span>
                  <div className="text-right">
                    <div className={`text-3xl font-black bg-gradient-to-r ${point.color} bg-clip-text text-transparent`}>
                      {point.stat}
                    </div>
                    <div className="text-sm text-slate-500 font-medium">{point.statLabel}</div>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {point.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Transition statement */}
        <div className="reveal max-w-2xl mx-auto text-center">
          <div className="relative inline-block">
            <p className="text-2xl md:text-3xl font-bold text-slate-900">
              What if you could just{' '}
              <span className="relative inline-block">
                <span className="gradient-text">speak</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path 
                    d="M0 8 Q25 0, 50 8 T100 8" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#007fa3" />
                      <stop offset="100%" stopColor="#1ecbf5" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              {' '}your notes?
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
