import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0E17] relative overflow-hidden flex flex-col items-center pt-24 sm:pt-32">
      {/* Center Glow Effect */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[400px] bg-teal/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Typography & Action */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6 mb-16 sm:mb-24">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
          Lost in the Ledgers?
        </h1>
        <p className="text-base sm:text-lg text-white/50 mb-10 max-w-md mx-auto">
          This page doesn't exist... yet. But your financial journey continues!
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-teal text-navy font-bold text-sm hover:bg-teal-hover transition-all duration-300 shadow-[0_0_30px_rgba(20,241,149,0.25)] hover:shadow-[0_0_50px_rgba(20,241,149,0.4)] hover:-translate-y-0.5"
        >
          <ArrowLeft size={16} />
          Go Back Home
        </Link>
      </div>

      {/* Faded Dashboard Mockup */}
      <div 
        className="w-full max-w-5xl mx-auto px-6 relative z-0 pointer-events-none select-none"
        style={{
          // This creates the seamless fade to black at the bottom of the mockup
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: '-webkit-linear-gradient(top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)'
        }}
      >
        <div className="w-full rounded-t-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 sm:p-8 flex flex-col gap-6 shadow-2xl">
          {/* Mockup Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5" />
              <div className="space-y-2">
                <div className="w-32 h-4 rounded-md bg-white/10" />
                <div className="w-20 h-3 rounded-md bg-white/5" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/5" />
              <div className="w-24 h-8 rounded-lg bg-white/5" />
            </div>
          </div>
          
          {/* Mockup Body Elements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent" />
            <div className="space-y-4">
              <div className="h-28 rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent" />
              <div className="h-32 rounded-xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}