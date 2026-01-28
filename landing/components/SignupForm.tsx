'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { trackMetaEvent, trackGAEvent, generateEventId } from './Analytics';

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
  { value: 'naturopath', label: 'Naturopath' },
  { value: 'acupuncturist', label: 'Acupuncturist' },
  { value: 'other', label: 'Other Allied Health' },
];

const countries = [
  { value: '', label: 'Select your country' },
  { value: 'AU', label: 'Australia' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'IE', label: 'Ireland' },
  { value: 'SG', label: 'Singapore' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'other', label: 'Other' },
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

  const sectionRef = useRef<HTMLElement>(null);

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

  // Get UTM params from URL
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

    // Basic validation
    if (!email || !profession || !country) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Generate event ID for Meta deduplication (same ID sent to both client and server)
    const eventId = generateEventId();

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          profession,
          country,
          event_id: eventId, // Send event ID for server-side deduplication
          ...getUtmParams(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Track conversion events with same event ID for deduplication
      trackMetaEvent(
        'Lead',
        {
          content_name: 'Early Access Signup',
          content_category: profession,
          country,
        },
        eventId
      );
      trackGAEvent('generate_lead', {
        event_category: 'signup',
        event_label: profession,
      });

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
      className="section bg-surface-secondary"
    >
      <div className="container-narrow">
        <div className="animate-on-scroll opacity-0 card p-8 md:p-12">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-accent-mint/10 flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-accent-mint"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-display font-bold text-secondary mb-3">
                You're on the list!
              </h3>
              <p className="text-secondary-light max-w-md mx-auto mb-6">
                Thanks for your interest. We'll be in touch soon with early access details. 
                Check your inbox for a confirmation.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light rounded-full">
                <span className="text-sm text-primary font-medium">
                  Position #{Math.floor(Math.random() * 200) + 50} in the queue
                </span>
              </div>
            </div>
          ) : (
            /* Form */
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-display font-bold text-secondary mb-3">
                  Request early access
                </h2>
                <p className="text-secondary-light">
                  Join the waitlist and be first to try voice notes when we launch.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="label">
                    Work email
                  </label>
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
                  <label htmlFor="profession" className="label">
                    Profession
                  </label>
                  <select
                    id="profession"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="input appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235B667A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: '20px',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '44px',
                    }}
                    required
                    disabled={isSubmitting}
                  >
                    {professions.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="label">
                    Country
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="input appearance-none bg-no-repeat bg-right"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%235B667A'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundSize: '20px',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '44px',
                    }}
                    required
                    disabled={isSubmitting}
                  >
                    {countries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Error message */}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full text-lg py-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Request Early Access'
                  )}
                </button>

                {/* Privacy note */}
                <p className="text-xs text-center text-secondary-light">
                  We respect your privacy. No spam, ever. Unsubscribe anytime.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
