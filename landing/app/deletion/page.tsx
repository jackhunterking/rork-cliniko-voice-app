import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Data Deletion | Cliniko Voice',
  description: 'Learn how to delete your data from Cliniko Voice. Request complete removal of your personal information.',
};

export default function DeletionPage() {
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
            Data Deletion
          </h1>
          <p className="text-slate-500 mb-12">Your data, your control</p>

          <div className="prose prose-slate prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Delete Your Data</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Cliniko Voice is committed to your privacy and gives you full control over your data. 
                You can request deletion of your account and all associated data at any time.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Option 1: Delete from Within the App</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                The easiest way to delete your data is directly from the Cliniko Voice app:
              </p>
              <ol className="list-decimal pl-6 text-slate-600 space-y-3 mb-6">
                <li>Open the Cliniko Voice app</li>
                <li>Navigate to <strong>Profile</strong> tab</li>
                <li>Tap on <strong>Settings</strong></li>
                <li>Scroll down to <strong>Delete My Data</strong></li>
                <li>Confirm your deletion request</li>
              </ol>
              <p className="text-slate-600 leading-relaxed">
                This will immediately delete your account and all associated data from our systems.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Option 2: Request Deletion via Email</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you cannot access the app or prefer to request deletion manually, you can email us:
              </p>
              <div className="bg-slate-100 rounded-xl p-6 mb-4">
                <p className="text-slate-700 font-medium mb-2">Send an email to:</p>
                <a 
                  href="mailto:privacy@clinikovoice.com?subject=Data%20Deletion%20Request" 
                  className="text-cyan-600 hover:text-cyan-700 font-semibold text-lg"
                >
                  privacy@clinikovoice.com
                </a>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Please include in your email:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>The email address associated with your Cliniko Voice account</li>
                <li>Subject line: "Data Deletion Request"</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                We will process your request within <strong>30 days</strong> and send confirmation once complete.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">What Data Gets Deleted</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                When you request deletion, we remove the following data from our systems:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Account information:</strong> Email address, name, and profile data</li>
                <li><strong>Authentication data:</strong> Login credentials and session tokens</li>
                <li><strong>Usage data:</strong> App usage statistics and preferences</li>
                <li><strong>Any cached data:</strong> Temporary data stored on our servers</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Data We Don't Store</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                For your peace of mind, please note that we <strong>never store</strong>:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li><strong>Voice recordings:</strong> Audio is processed in real-time and not retained</li>
                <li><strong>Transcription content:</strong> Your transcribed notes are not stored on our servers</li>
                <li><strong>Patient data:</strong> All Cliniko data is fetched directly and not stored by us</li>
                <li><strong>Cliniko API keys:</strong> Stored only on your device, never on our servers</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Third-Party Data</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                Please note that deleting your Cliniko Voice account does not affect:
              </p>
              <ul className="list-disc pl-6 text-slate-600 space-y-2">
                <li>Your Cliniko account or any data stored in Cliniko</li>
                <li>Notes you have already saved to Cliniko</li>
                <li>Any data stored by third-party services you may have connected</li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-4">
                To delete data from these services, please contact them directly.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Facebook Login Users</h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                If you logged in using Facebook, requesting deletion through our app or via email will also 
                remove the connection between your Facebook account and Cliniko Voice. You can also manage 
                app permissions directly in your Facebook settings.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Questions?</h2>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about data deletion or our privacy practices, please contact us at:
              </p>
              <p className="text-slate-600 mt-4">
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@clinikovoice.com" className="text-cyan-600 hover:text-cyan-700">
                  privacy@clinikovoice.com
                </a>
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
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/deletion" className="text-cyan-400 hover:text-white transition-colors">
                Data Deletion
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
