import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Support | Cliniko Voice',
  description: 'Get help with Cliniko Voice - FAQs, troubleshooting, and contact information.',
};

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="Cliniko Voice Logo" 
                width={36} 
                height={36} 
                className="rounded-xl"
              />
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
            Support
          </h1>
          <p className="text-slate-500 mb-12">We're here to help you get the most out of Cliniko Voice</p>

          {/* Contact Card */}
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-8 mb-12 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-cyan-100 mb-6">
              Our support team is ready to assist you with any questions or issues.
            </p>
            <a 
              href="mailto:hello@clinikovoice.com"
              className="inline-flex items-center gap-2 bg-white text-cyan-600 px-6 py-3 rounded-xl font-semibold hover:bg-cyan-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@clinikovoice.com
            </a>
          </div>

          {/* FAQs */}
          <div className="prose prose-slate prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-8">
              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">How do I connect my Cliniko account?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Go to Settings → API Key in the app. You'll need to generate an API key from your Cliniko account 
                  (Settings → API Keys in Cliniko). Copy the key and paste it into Cliniko Voice. Your patients and 
                  appointments will sync automatically.
                </p>
              </section>

              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Is my patient data secure?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Yes. Your Cliniko API key is stored securely on your device using encrypted storage. Patient data 
                  is fetched directly from Cliniko and is never stored on our servers. Voice recordings are processed 
                  in real-time and are not retained after transcription.
                </p>
              </section>

              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Why isn't the transcription working?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Make sure you've granted microphone permissions to the app. Check your internet connection as 
                  transcription requires an active connection. If issues persist, try restarting the app or 
                  contact support.
                </p>
              </section>

              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">Can I edit notes before saving to Cliniko?</h3>
                <p className="text-slate-600 leading-relaxed">
                  Absolutely! After recording, you'll see a review screen where you can edit any section of your 
                  treatment note. You can also use voice dictation to add more content to specific fields. Only 
                  when you tap "Save & Finalize" will the note be sent to Cliniko.
                </p>
              </section>

              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">What if I need to cancel my subscription?</h3>
                <p className="text-slate-600 leading-relaxed">
                  You can manage your subscription directly through the App Store. Go to Settings on your iPhone → 
                  tap your Apple ID → Subscriptions → Cliniko Voice. From there you can cancel or modify your plan.
                </p>
              </section>

              <section className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-3">How do I delete my account and data?</h3>
                <p className="text-slate-600 leading-relaxed">
                  You can request account deletion from within the app (Settings → Delete Data) or by visiting 
                  our <Link href="/deletion" className="text-cyan-600 hover:underline">data deletion page</Link>. 
                  This will remove all your data from our systems.
                </p>
              </section>
            </div>

            {/* Troubleshooting */}
            <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">Troubleshooting</h2>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-amber-800 mb-3">Before contacting support, try these steps:</h3>
              <ul className="list-disc pl-6 text-amber-700 space-y-2">
                <li>Restart the app</li>
                <li>Check your internet connection</li>
                <li>Verify your Cliniko API key is valid and hasn't expired</li>
                <li>Ensure microphone permissions are granted in iOS Settings</li>
                <li>Update to the latest version of the app</li>
              </ul>
            </div>

            {/* App Info */}
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3">App Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Current Version</p>
                  <p className="font-semibold text-slate-900">1.0.0</p>
                </div>
                <div>
                  <p className="text-slate-500">Requires iOS</p>
                  <p className="font-semibold text-slate-900">15.0 or later</p>
                </div>
                <div>
                  <p className="text-slate-500">Developer</p>
                  <p className="font-semibold text-slate-900">Cliniko Voice</p>
                </div>
                <div>
                  <p className="text-slate-500">Support Email</p>
                  <p className="font-semibold text-cyan-600">hello@clinikovoice.com</p>
                </div>
              </div>
            </div>
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
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/support" className="text-cyan-400 hover:text-white transition-colors">
                Support
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
