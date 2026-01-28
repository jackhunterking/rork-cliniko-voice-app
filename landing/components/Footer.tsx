export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-surface border-t border-border">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <span className="font-semibold text-secondary">Voice Notes</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="mailto:hello@voicenotes.app"
              className="text-secondary-light hover:text-primary transition-colors"
            >
              Contact
            </a>
            <span className="text-border">|</span>
            <span className="text-secondary-light">
              © {currentYear} Voice Notes
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-secondary-light text-center max-w-2xl mx-auto leading-relaxed">
            Voice Notes is an independent product. We are not affiliated with, endorsed by, 
            or officially connected to any practice management software provider. 
            All product names and trademarks are the property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}
