import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@/components/Analytics';

export const metadata: Metadata = {
  title: 'Voice Notes for Clinicians | Document Faster, Finish Sooner',
  description:
    'Turn your voice into polished clinical notes in seconds. Stop typing after hours. Join the waitlist for early access.',
  keywords: [
    'clinical documentation',
    'voice notes',
    'healthcare',
    'medical notes',
    'speech to text',
    'clinician tools',
    'physiotherapy',
    'allied health',
  ],
  authors: [{ name: 'Voice Notes' }],
  openGraph: {
    title: 'Voice Notes for Clinicians',
    description: 'Turn your voice into polished clinical notes in seconds.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'Voice Notes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voice Notes for Clinicians',
    description: 'Turn your voice into polished clinical notes in seconds.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#007FA3',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to font services */}
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        {/* Satoshi Font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/* Cabinet Grotesk for Display */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
