'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (POSTHOG_KEY) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        // Enable session recording
        capture_pageview: true,
        capture_pageleave: true,
        // Session replay configuration
        session_recording: {
          // Mask all text inputs by default for privacy
          maskTextSelector: '*',
          // But allow specific elements to be visible
          maskAllInputs: true,
          // Record console logs
          recordCrossOriginIframes: false,
        },
        // Automatically capture clicks and form submissions
        autocapture: true,
      });
    }
  }, []);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Helper to identify users (e.g., after sign up)
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

// Helper to capture custom events
export function capturePostHogEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

// Helper to reset user (on logout)
export function resetPostHogUser() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.reset();
  }
}
