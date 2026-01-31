import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Cliniko Voice',
  description: 'Terms of Service for Cliniko Voice - Please read these terms carefully before using our application.',
};

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-slate-500 mb-12">Last updated: January 30, 2026</p>

          <div className="prose prose-slate prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                By accessing or using Cliniko Voice ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the Service after any changes indicates your acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Service</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cliniko Voice is a mobile application that provides voice-to-text transcription services designed for healthcare professionals using Cliniko practice management software. The Service enables users to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Record voice notes and convert them to text</li>
                <li>Create treatment notes from voice recordings</li>
                <li>Save treatment notes directly to Cliniko patient records</li>
                <li>Access patient information from their Cliniko account</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. User Accounts</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                To use the Service, you must:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Create an account with accurate and complete information</li>
                <li>Be at least 18 years of age</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-slate-600 leading-relaxed">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Subscription and Payments</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cliniko Voice offers subscription-based access to its features:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Subscription plans and pricing are displayed in the app</li>
                <li>Payments are processed through Apple App Store or Google Play Store</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Refunds are subject to the policies of the respective app store</li>
              </ul>
              <p className="text-slate-600 leading-relaxed">
                We reserve the right to modify pricing with reasonable notice to existing subscribers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Cliniko Integration</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Service integrates with Cliniko using their official API:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>You must have a valid Cliniko account to use integration features</li>
                <li>You are responsible for maintaining valid API credentials</li>
                <li>Cliniko Voice is an independent product and is not affiliated with, endorsed by, or officially connected to Cliniko</li>
                <li>Your use of Cliniko data is subject to Cliniko's own terms of service</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. User Responsibilities</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                As a user of the Service, you agree to:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Maintain appropriate patient consent for recording and documentation</li>
                <li>Review all transcriptions for accuracy before saving to patient records</li>
                <li>Not use the Service for any unlawful or prohibited purpose</li>
                <li>Not attempt to reverse engineer or compromise the security of the Service</li>
                <li>Not share your account credentials with others</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Healthcare Disclaimer</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-4">
                <p className="text-amber-800 font-medium mb-2">Important Notice</p>
                <p className="text-amber-700 text-sm">
                  Cliniko Voice is a documentation tool, not a medical device. The Service does not provide medical advice, diagnosis, or treatment recommendations.
                </p>
              </div>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>You are solely responsible for the accuracy and completeness of all clinical documentation</li>
                <li>Always review and verify transcriptions before saving to patient records</li>
                <li>The Service should not be used as a substitute for professional clinical judgment</li>
                <li>Transcription accuracy may vary based on audio quality, accents, and medical terminology</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Intellectual Property</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are owned by Cliniko Voice and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-slate-600 leading-relaxed">
                You retain ownership of all content you create using the Service, including your voice recordings and treatment notes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>The Service is provided "as is" without warranties of any kind</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
                <li>We are not liable for any indirect, incidental, special, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid by you in the preceding 12 months</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Indemnification</h2>
              <p className="text-slate-600 leading-relaxed">
                You agree to indemnify and hold harmless Cliniko Voice and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Termination</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                <li>Breach of these Terms of Service</li>
                <li>Conduct that we determine to be harmful to other users or the Service</li>
                <li>Fraudulent or illegal activity</li>
              </ul>
              <p className="text-slate-600 leading-relaxed">
                You may terminate your account at any time through the app settings. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Governing Law</h2>
              <p className="text-slate-600 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of Australia, without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">13. Contact Information</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
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
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-cyan-400 hover:text-white transition-colors">
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
