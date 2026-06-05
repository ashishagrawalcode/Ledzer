import { BarChart3, FileText, Users, Package, Zap, Shield, Download, Smartphone } from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Smart Invoicing',
    description: 'Create professional invoices in seconds with auto-filled GST, customer details, and due dates. Export as PDF instantly.',
    accent: '#14F195',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track stock levels, set reorder alerts, and monitor product value. Never run out of stock unexpectedly.',
    accent: '#3B82F6',
  },
  {
    icon: Users,
    title: 'Customer & Supplier Tracking',
    description: 'Complete party ledgers showing every transaction, pending balance, and payment history at a glance.',
    accent: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'P&L, Day Book, Balance Sheet, and Cash Flow — one click exports to Excel. GST-ready reports.',
    accent: '#F59E0B',
  },
  {
    icon: Zap,
    title: 'Jargon-Free Mode',
    description: 'Toggle between standard accounting terms and plain language. "Accounts Receivable" becomes "Who Owes Me".',
    accent: '#14F195',
  },
  {
    icon: Smartphone,
    title: 'Works Offline',
    description: 'Create invoices even without internet. Data syncs automatically the moment you\'re back online.',
    accent: '#22C55E',
  },
  {
    icon: Download,
    title: 'One-Click Exports',
    description: 'Download perfectly formatted PDF invoices and Excel ledger reports with zero manual formatting.',
    accent: '#EF4444',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Bank-grade security with row-level data isolation. Your business data is only yours. Always.',
    accent: '#06B6D4',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-4">
            <span className="text-xs font-medium text-teal tracking-wide uppercase">Everything you need</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Built for real businesses
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            All the power of enterprise accounting, without the learning curve or the price tag.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                className="group relative glass rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-card cursor-default"
              >
                {/* Accent glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 20% 20%, ${feature.accent}08 0%, transparent 60%)` }}
                />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}25` }}
                >
                  <Icon size={18} style={{ color: feature.accent }} />
                </div>

                <h3 className="font-semibold text-white text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}