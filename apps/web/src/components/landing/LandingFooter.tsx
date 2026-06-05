import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center">
                <span className="font-display font-bold text-navy text-xs">L</span>
              </div>
              <span className="font-display font-bold text-lg text-white">Ledzer</span>
            </div>
            <p className="text-sm text-white/30 leading-relaxed">
              The Business Operating System for MSMEs. Simple, powerful, beautiful.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Product</p>
            <div className="space-y-2">
              {['Features', 'Pricing', 'Changelog', 'Roadmap'].map((item) => (
                <Link key={item} href="#" className="block text-sm text-white/30 hover:text-white/70 transition-colors duration-200">{item}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Resources</p>
            <div className="space-y-2">
              {['Documentation', 'API Reference', 'Blog', 'Support'].map((item) => (
                <Link key={item} href="#" className="block text-sm text-white/30 hover:text-white/70 transition-colors duration-200">{item}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">Legal</p>
            <div className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <Link key={item} href="#" className="block text-sm text-white/30 hover:text-white/70 transition-colors duration-200">{item}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2026 Ledzer. All rights reserved.</p>
          <p className="text-xs text-white/20">Made with ♥ for Indian MSMEs</p>
        </div>
      </div>
    </footer>
  )
}