export function MetricsSection() {
  const metrics = [
    { value: '10,000+', label: 'Invoices Generated', sublabel: 'and counting' },
    { value: '₹50Cr+', label: 'Transactions Managed', sublabel: 'across all businesses' },
    { value: '99.9%', label: 'Sync Reliability', sublabel: 'uptime guaranteed' },
    { value: '500+', label: 'Businesses Onboarded', sublabel: 'and growing daily' },
  ]

  return (
    <section className="relative py-16 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-teal/3 via-transparent to-teal/3" />
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((metric, i) => (
            <div key={i} className="text-center">
              <p className="font-mono text-3xl sm:text-4xl font-bold text-teal tabular-nums glow-teal-text">
                {metric.value}
              </p>
              <p className="mt-1 text-sm font-semibold text-white/80">{metric.label}</p>
              <p className="mt-0.5 text-xs text-white/30">{metric.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}