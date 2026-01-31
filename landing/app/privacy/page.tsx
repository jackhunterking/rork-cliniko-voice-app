import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Cliniko Voice',
  description: 'Privacy Policy for Cliniko Voice - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="font-bold text-slate-900">Cliniko Voice</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-wide pt-32 pb-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 mb-12">Last updated: January 30, 2026</p>

          <div className="prose prose-slate prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cliniko Voice ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Personal Information</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                When you register for an account, we may collect:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                <li>Email address</li>
                <li>Name (optional)</li>
                <li>Cliniko API credentials (stored securely on your device)</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">Voice and Audio Data</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                Our app records voice notes for transcription purposes. Audio recordings are:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-6">
                <li>Processed in real-time for transcription</li>
                <li>Not stored on our servers after transcription is complete</li>
                <li>Transmitted securely using encryption</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">Patient Data</h3>
              <p className="text-slate-600 leading-relaxed mb-4">
                When you connect your Cliniko account, we access patient information solely to enable you to create and save treatment notes. This data:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Is fetched directly from Cliniko's servers using your API key</li>
                <li>Is not stored on our servers</li>
                <li>Remains under your control at all times</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process voice recordings into text transcriptions</li>
                <li>Facilitate the saving of treatment notes to your Cliniko account</li>
                <li>Send you updates and communications about the service</li>
                <li>Monitor and analyze usage patterns to improve user experience</li>
                <li>Detect, prevent, and address technical issues</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your data:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>End-to-end encryption for voice data transmission</li>
                <li>Secure storage of credentials using device keychain/keystore</li>
                <li>Regular security audits and updates</li>
                <li>Compliance with healthcare data protection standards</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Services</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>AssemblyAI:</strong> For voice-to-text transcription</li>
                <li><strong>Cliniko:</strong> For patient record management (via your API credentials)</li>
                <li><strong>Supabase:</strong> For authentication and data storage</li>
                <li><strong>PostHog:</strong> For anonymous usage analytics</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                Each of these services has their own privacy policy governing their use of data.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Retention</h2>
              <p className="text-slate-600 leading-relaxed">
                We retain your account information for as long as your account is active. Voice recordings are not retained after transcription. You may request deletion of your account and associated data at any time through the app settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Children's Privacy</h2>
              <p className="text-slate-600 leading-relaxed">
                Our service is not intended for use by children under the age of 18. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-slate-600 leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact Us</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-slate-600 mt-4">
                <strong>Email:</strong> hello@clinikovoice.com
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-white">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Cliniko Voice. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-cyan-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/deletion" className="text-slate-400 hover:text-white transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
