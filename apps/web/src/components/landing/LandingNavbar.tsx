'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
]

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-white/5 shadow-nav'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow group-hover:shadow-glow-md transition-all duration-300">
                <span className="font-display font-bold text-navy text-sm">L</span>
              </div>
              <div className="absolute inset-0 rounded-lg bg-teal/20 blur-md group-hover:blur-lg transition-all duration-300 -z-10" />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              Ledzer
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-white/70 hover:text-white transition-colors duration-200 px-4 py-2 font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow hover:shadow-glow-md group overflow-hidden"
            >
              <span className="relative z-10">Start Free</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white/60 hover:text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-b border-white/5 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              <Link
                href="/login"
                className="block text-center px-4 py-2.5 text-white/70 text-sm font-medium"
              >
                Sign in
              </Link>
              <Link
                href="/login"
                className="block text-center px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}