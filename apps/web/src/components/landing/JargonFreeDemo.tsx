'use client'

import { useState } from 'react'

const TERM_PAIRS = [
  { standard: 'Accounts Receivable', simple: 'Who Owes Me', category: 'Balance Sheet' },
  { standard: 'Accounts Payable', simple: 'Who I Owe', category: 'Balance Sheet' },
  { standard: 'Profit & Loss', simple: 'Business Profit', category: 'Reports' },
  { standard: 'General Ledger', simple: 'All Account History', category: 'Masters' },
  { standard: 'Sundry Debtors', simple: 'Customers (Pending)', category: 'Party' },
  { standard: 'Journal Voucher', simple: 'Adjustment Entry', category: 'Transactions' },
  { standard: 'Trial Balance', simple: 'Account Check', category: 'Reports' },
  { standard: 'Contra Entry', simple: 'Cash Transfer', category: 'Transactions' },
]

export function JargonFreeDemo() {
  const [isSimple, setIsSimple] = useState(false)

  return (
    <section id="how-it-works" className="py-24 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal/3 to-transparent pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-4">
              <span className="text-xs font-medium text-teal tracking-wide uppercase">Killer Feature</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
              Speak your language,<br />
              <span className="text-teal">not your CA's.</span>
            </h2>
            <p className="text-lg text-white/40 leading-relaxed mb-8">
              Toggle between standard accounting terminology and plain business language.
              The underlying data stays accurate — only the words change.
            </p>

            {/* Toggle */}
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium transition-colors duration-200 ${!isSimple ? 'text-white' : 'text-white/40'}`}>
                Standard Accounting
              </span>
              <button
                onClick={() => setIsSimple(!isSimple)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                  isSimple ? 'bg-teal shadow-glow' : 'bg-white/10'
                }`}
                aria-label="Toggle terminology mode"
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                    isSimple ? 'left-8' : 'left-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium transition-colors duration-200 ${isSimple ? 'text-teal' : 'text-white/40'}`}>
                Jargon-Free
              </span>
            </div>

            {isSimple && (
              <p className="mt-4 text-xs text-teal/60 animate-fade-in">
                ✓ Same data, same accuracy — just friendlier words
              </p>
            )}
          </div>

          {/* Right — term cards */}
          <div className="grid grid-cols-2 gap-3">
            {TERM_PAIRS.map((pair, i) => (
              <div
                key={i}
                className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 group"
              >
                <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2 font-medium">
                  {pair.category}
                </p>
                <div className="relative overflow-hidden">
                  <p
                    className={`text-sm font-semibold transition-all duration-300 ${
                      isSimple
                        ? 'opacity-0 -translate-y-2 absolute'
                        : 'opacity-100 translate-y-0 text-white/70'
                    }`}
                  >
                    {pair.standard}
                  </p>
                  <p
                    className={`text-sm font-semibold transition-all duration-300 ${
                      isSimple
                        ? 'opacity-100 translate-y-0 text-teal'
                        : 'opacity-0 translate-y-2 absolute'
                    }`}
                  >
                    {pair.simple}
                  </p>
                  {/* Spacer to maintain height */}
                  <p className="text-sm font-semibold opacity-0 pointer-events-none" aria-hidden>
                    {isSimple ? pair.simple : pair.standard}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}