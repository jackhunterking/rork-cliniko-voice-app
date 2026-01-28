'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { trackMetaEvent, trackGAEvent } from './Analytics';

const professions = [
  { value: '', label: 'Select your profession' },
  { value: 'physiotherapist', label: 'Physiotherapist' },
  { value: 'chiropractor', label: 'Chiropractor' },
  { value: 'osteopath', label: 'Osteopath' },
  { value: 'occupational_therapist', label: 'Occupational Therapist' },
  { value: 'speech_pathologist', label: 'Speech Pathologist' },
  { value: 'psychologist', label: 'Psychologist' },
  { value: 'podiatrist', label: 'Podiatrist' },
  { value: 'massage_therapist', label: 'Massage Therapist' },
  { value: 'exercise_physiologist', label: 'Exercise Physiologist' },
  { value: 'dietitian', label: 'Dietitian' },
  { value: 'other', label: 'Other Allied Health' },
];

const countries = [
  { value: '', label: 'Select your country' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'NZ', label: '🇳🇿 New Zealand' },
  { value: 'UK', label: '🇬🇧 United Kingdom' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'IE', label: '🇮🇪 Ireland' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'other', label: '🌍 Other' },
];

interface SignupFormProps {
  formRef?: React.RefObject<HTMLElement | null>;
}

export function SignupForm({ formRef }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [profession, setProfession] = useState('');
  const [country, setCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [queuePosition, setQueuePosition] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getUtmParams = () => {
    if (typeof window === 'undefined') return {};
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
    };
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !profession || !country) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          profession,
          country,
          ...getUtmParams(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      trackMetaEvent('Lead', {
        content_name: 'Early Access Signup',
        content_category: profession,
        country,
      });
      trackGAEvent('generate_lead', {
        event_category: 'signup',
        event_label: profession,
      });

      setQueuePosition(Math.floor(Math.random() * 150) + 80);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      ref={(el) => {
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current = el;
        if (formRef && 'current' in formRef) {
          (formRef as React.MutableRefObject<HTMLElement | null>).current = el;
        }
      }}
      id="signup"
      className="section bg-gradient-to-b from-slate-50 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-cyan-100/30 to-transparent rounded-full blur-3xl" />
      
      <div className="container-tight relative">
        {isSuccess ? (
          /* Success State */
          <div className="reveal card-elevated p-8 md:p-12 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-cyan-500/30">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-4">
              You're in! 🎉
            </h2>
            
            <p className="text-lg text-slate-600 max-w-md mx-auto mb-8">
              Thanks for joining the waitlist. We'll be in touch soon with 
              exclusive early access details.
            </p>
            
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-2xl border border-cyan-100">
              <div className="text-left">
                <p className="text-sm text-slate-500">Your queue position</p>
                <p className="text-2xl font-bold text-cyan-600">#{queuePosition}</p>
              </div>
              <div className="w-px h-10 bg-cyan-200" />
              <div className="text-left">
                <p className="text-sm text-slate-500">Expected access</p>
                <p className="text-lg font-semibold text-slate-700">Coming soon</p>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-slate-100">
              <p className="text-sm text-slate-500 mb-4">Share with a colleague who needs this</p>
              <div className="flex justify-center gap-3">
                <button className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </button>
                <button className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                  </svg>
                </button>
                <button className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="reveal card-elevated p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <span className="text-sm font-semibold text-amber-700">Limited early access spots</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 mb-4">
                Get early access
              </h2>
              
              <p className="text-lg text-slate-600 max-w-md mx-auto">
                Join the waitlist and be among the first to transform how you 
                document patient notes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
              {/* Email */}
              <div>
                <label htmlFor="email" className="label">Work email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@clinic.com"
                  className="input"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Profession */}
              <div>
                <label htmlFor="profession" className="label">Your profession</label>
                <select
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="input appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '20px',
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '48px',
                  }}
                  required
                  disabled={isSubmitting}
                >
                  {professions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="label">Country</label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="input appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundSize: '20px',
                    backgroundPosition: 'right 16px center',
                    backgroundRepeat: 'no-repeat',
                    paddingRight: '48px',
                  }}
                  required
                  disabled={isSubmitting}
                >
                  {countries.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-lg py-4"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Securing your spot...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>Request Early Access</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                )}
              </button>

              {/* Trust note */}
              <p className="text-xs text-center text-slate-400 pt-2">
                🔒 We respect your privacy. No spam, ever. Unsubscribe anytime.
              </p>
            </form>

            {/* Social proof hint */}
            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Join <span className="font-semibold text-slate-700">200+</span> clinicians 
                already on the waitlist
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
