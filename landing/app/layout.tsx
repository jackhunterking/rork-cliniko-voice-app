import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Analytics } from '@/components/Analytics';
import { PostHogProvider } from '@/components/PostHogProvider';

export const metadata: Metadata = {
  title: 'Cliniko Voice | Voice-to-Notes App Built for Cliniko',
  description:
    'The voice-to-notes app designed exclusively for Cliniko users. Speak your clinical notes, save directly to Cliniko treatment notes. Built by practitioners, for practitioners.',
  keywords: [
    'Cliniko',
    'Cliniko voice notes',
    'Cliniko integration',
    'clinical documentation',
    'voice notes',
    'healthcare',
    'medical notes',
    'speech to text',
    'clinician tools',
    'physiotherapy',
    'allied health',
    'SOAP notes',
    'Cliniko app',
    'treatment notes',
  ],
  authors: [{ name: 'Cliniko Voice' }],
  openGraph: {
    title: 'Cliniko Voice | Voice-to-Notes App Built for Cliniko',
    description: 'The voice-to-notes app designed exclusively for Cliniko users. Speak your notes, save directly to Cliniko.',
    type: 'website',
    locale: 'en_AU',
    siteName: 'Cliniko Voice',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cliniko Voice | Built for Cliniko Users',
    description: 'Speak your clinical notes, save directly to Cliniko treatment notes.',
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
  themeColor: '#0d9488',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen antialiased">
        <PostHogProvider>
          {children}
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
