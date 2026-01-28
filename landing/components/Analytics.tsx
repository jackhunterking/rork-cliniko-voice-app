'use client';

import Script from 'next/script';

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export function Analytics() {
  return (
    <>
      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}
    </>
  );
}

// Generate a unique event ID for deduplication between client and server
export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Helper function to track Meta Pixel events
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window !== 'undefined' && window.fbq) {
    const trackParams = eventId ? { ...params, eventID: eventId } : params;
    window.fbq('track', eventName, trackParams);
  }
}

// Helper function to track GA events
export function trackGAEvent(eventName: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: (action: string, eventName: string, params?: Record<string, unknown>) => void;
    gtag: (action: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}
