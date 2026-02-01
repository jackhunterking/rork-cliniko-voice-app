import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-slate-900 text-white">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Cliniko Voice Logo" 
              width={40} 
              height={40} 
              className="rounded-xl shadow-lg shadow-cyan-500/30"
            />
            <div>
              <span className="font-bold text-lg">Cliniko Voice</span>
              <span className="text-slate-500 text-sm ml-2">Built for Cliniko</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="/privacy"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Terms
            </a>
            <a
              href="/support"
              className="text-slate-400 hover:text-white transition-colors"
            >
              Support
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Cliniko Voice. All rights reserved.
            </p>
            
            {/* Disclaimer */}
            <p className="text-xs text-slate-600 text-center md:text-right max-w-lg">
              Cliniko Voice is an independent product designed for Cliniko users. It is not affiliated with, 
              endorsed by, or officially connected to Cliniko.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
