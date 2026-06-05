'use client'

import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-navy pointer-events-none">
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-hero-radial opacity-60" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(20,241,149,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(20,241,149,0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="animate-fade-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal/20 bg-teal/5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
              <span className="text-xs font-medium text-teal tracking-wide uppercase">
                Business Operating System
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Run Your{' '}
              <span className="relative">
                <span className="text-teal glow-teal-text">Business.</span>
              </span>
              <br />
              Not Your
              <br />
              <span className="text-white/40">Accounting</span>
              <br />
              Software.
            </h1>

            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-md">
              Invoices, inventory, ledgers and reports — without the complexity.
              Built for Indian MSMEs who want results, not jargon.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-teal text-navy font-semibold text-base hover:bg-teal-hover transition-all duration-200 shadow-glow hover:shadow-glow-md group"
              >
                Start Free
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-white/5 font-medium text-base transition-all duration-200 group">
                <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:border-teal/50 transition-colors duration-200">
                  <Play size={10} className="ml-0.5 text-white/60 group-hover:text-teal transition-colors duration-200" />
                </div>
                Watch Demo
              </button>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex items-center gap-6 text-sm text-white/30">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {['A', 'R', 'S', 'M'].map((l, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-teal/40 to-teal/20 border-2 border-navy flex items-center justify-center text-xs font-bold text-teal">
                      {l}
                    </div>
                  ))}
                </div>
                <span className="ml-2">500+ businesses</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span>No credit card required</span>
            </div>
          </div>

          {/* Right — Dashboard preview */}
          <div className="relative animate-fade-up" style={{ animationDelay: '150ms' }}>
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-2xl bg-teal/5 blur-3xl scale-110" />

              {/* Mock dashboard card */}
              <div className="relative glass rounded-2xl border border-white/8 overflow-hidden shadow-card-hover">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 mx-4 h-5 rounded bg-white/5 flex items-center px-2">
                    <span className="text-[10px] text-white/20">app.ledzer.in/dashboard</span>
                  </div>
                </div>

                {/* Dashboard content preview */}
                <div className="p-4 space-y-4">
                  {/* Top stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Cash Available', value: '₹1,24,500', change: '+12%', positive: true },
                      { label: 'Pending', value: '₹43,200', change: '3 invoices', positive: false },
                      { label: 'Monthly Profit', value: '₹52,800', change: '+8%', positive: true },
                      { label: 'Low Stock', value: '6 items', change: 'Action needed', positive: false },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/3 rounded-xl p-3 border border-white/5">
                        <p className="text-[10px] text-white/40 mb-1">{stat.label}</p>
                        <p className="font-mono text-sm font-semibold text-white">{stat.value}</p>
                        <p className={`text-[10px] mt-0.5 ${stat.positive ? 'text-teal' : 'text-yellow-400/70'}`}>
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Fake chart */}
                  <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] text-white/40 mb-3">Income vs Expenses — June 2026</p>
                    <div className="flex items-end gap-1 h-16">
                      {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 90, 65].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-0.5">
                          <div
                            className="rounded-sm bg-teal/40"
                            style={{ height: `${h}%` }}
                          />
                          <div
                            className="rounded-sm bg-blue-400/20"
                            style={{ height: `${h * 0.6}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent transactions */}
                  <div className="space-y-1.5">
                    {[
                      { name: 'Rajesh Traders', type: 'Invoice', amount: '+₹12,400', color: 'text-teal' },
                      { name: 'Office Rent', type: 'Expense', amount: '-₹8,000', color: 'text-red-400' },
                      { name: 'Anita Enterprises', type: 'Receipt', amount: '+₹5,600', color: 'text-teal' },
                    ].map((tx, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/3 transition-colors duration-150">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/8 flex items-center justify-center text-[9px] font-bold text-white/60">
                            {tx.name[0]}
                          </div>
                          <div>
                            <p className="text-[10px] font-medium text-white/80">{tx.name}</p>
                            <p className="text-[9px] text-white/30">{tx.type}</p>
                          </div>
                        </div>
                        <span className={`text-[11px] font-mono font-semibold ${tx.color}`}>{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 glass rounded-xl px-4 py-2.5 border border-teal/20 shadow-glow animate-glow-pulse">
                <p className="text-xs text-white/60">Synced just now</p>
                <p className="text-sm font-semibold text-teal font-mono">All data live ✓</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}