'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, BarChart3, MoreHorizontal, Package, ArrowRightLeft } from 'lucide-react'
import { useState } from 'react'

const MOBILE_NAV = [
  { label: 'Invoices', href: '/invoices', icon: FileText },
  { label: 'Parties', href: '/parties/customers', icon: Users },
  { spacer: true }, // Spacer for the center Dashboard button
  { label: 'Reports', href: '/reports/pnl', icon: BarChart3 },
  { label: 'More', href: null, icon: MoreHorizontal },
]

const MORE_ITEMS = [
  { label: 'Transactions', href: '/transactions/sales', icon: ArrowRightLeft },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Masters', href: '/masters/ledgers', icon: FileText },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)

  // Check if we are currently on the dashboard to highlight the center button differently
  const isDashboardActive = pathname === '/dashboard'

  return (
    <>
      {/* More drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 left-0 right-0 glass-heavy border-t border-border/8 p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-3">
              {MORE_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors duration-150"
                  >
                    <Icon size={18} className="text-foreground/60" />
                    <span className="text-xs text-foreground/50">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Center Dashboard Button */}
      <div className="lg:hidden fixed left-1/2 -translate-x-1/2 bottom-6 z-[60]">
        <Link
          href="/dashboard"
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-[0_0_30px_rgba(20,241,149,0.3)] hover:scale-105 hover:shadow-[0_0_40px_rgba(20,241,149,0.5)] transition-all duration-300 ${
            isDashboardActive 
              ? 'bg-teal text-navy' 
              : 'bg-card border border-border/10 text-teal'
          }`}
        >
          <LayoutDashboard size={24} strokeWidth={isDashboardActive ? 2.5 : 2} />
        </Link>
      </div>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass border-t border-border/8 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {MOBILE_NAV.map((item, index) => {
            if (item.spacer) {
              return <div key={`spacer-${index}`} className="w-14 flex-shrink-0" />
            }

            const Icon = item.icon!
            const isMore = item.href === null
            const isActive = isMore
              ? moreOpen
              : (pathname === item.href || (item.href && pathname.startsWith(item.href + '/')))

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                    isActive ? 'text-teal' : 'text-foreground/35 hover:text-foreground/60'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href!}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'text-teal'
                    : 'text-foreground/35 hover:text-foreground/60'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal" />
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}