export function DashboardShowcase() {
  return (
    <section className="py-24 w-full relative">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-4">
          <span className="text-xs font-medium text-teal tracking-wide uppercase">Beautiful by default</span>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
          Looks as good as it works
        </h2>
        <p className="text-lg text-white/40 mb-12 max-w-xl mx-auto">
          Designed for clarity. Built for speed. Feels like the future of business software.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-teal text-navy font-semibold text-base hover:bg-teal-hover transition-all duration-200 shadow-glow hover:shadow-glow-md"
          >
            Start for Free — No Credit Card
          </a>
        </div>
      </div>
    </section>
  )
}