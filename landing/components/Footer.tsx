export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-slate-900 text-white">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg">Voice Notes</span>
              <span className="text-slate-500 text-sm ml-2">for Clinicians</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="mailto:hello@voicenotes.app"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Contact
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Terms
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Voice Notes. All rights reserved.
            </p>
            
            {/* Disclaimer */}
            <p className="text-xs text-slate-600 text-center md:text-right max-w-lg">
              Voice Notes is an independent product and is not affiliated with, endorsed by, 
              or officially connected to any practice management software provider.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
