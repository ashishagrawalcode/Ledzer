'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, BarChart3, MoreHorizontal, Package, ArrowRightLeft, ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useTerms } from '@/hooks/useTerms'

export function MobileBottomNav() {
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const [subMenu, setSubMenu] = useState<string | null>(null)

  const { t } = useTerms()

  // Centralized Dictionary for all nested menus
  const SUB_MENUS: Record<string, { label: string; href: string; icon: any }[]> = {
    Transactions: [
      { label: t('salesInvoices'), href: '/transactions/sales', icon: ArrowRightLeft },
      { label: t('purchaseBills'), href: '/transactions/purchases', icon: ArrowRightLeft },
      { label: t('payments'), href: '/transactions/payments', icon: ArrowRightLeft },
      { label: t('receipts'), href: '/transactions/receipts', icon: ArrowRightLeft },
      { label: t('journals'), href: '/transactions/journals', icon: ArrowRightLeft },
      { label: t('contra'), href: '/transactions/contra', icon: ArrowRightLeft },
    ],
    Parties: [
      { label: t('customers'), href: '/parties/customers', icon: Users },
      { label: t('suppliers'), href: '/parties/suppliers', icon: Users },
    ],
    Reports: [
      { label: t('profitAndLoss'), href: '/reports/pnl', icon: BarChart3 },
      { label: t('balanceSheet'), href: '/reports/balance-sheet', icon: BarChart3 },
      { label: t('cashFlow'), href: '/reports/cash-flow', icon: BarChart3 },
      { label: t('dayBook'), href: '/reports/daybook', icon: BarChart3 },
      { label: t('partyLedger'), href: '/reports/party-ledger', icon: BarChart3 },
    ],
    Masters: [
      { label: t('ledgers'), href: '/masters/ledgers', icon: FileText },
      { label: t('groups'), href: '/masters/groups', icon: FileText },
      { label: t('voucherTypes'), href: '/masters/voucher-types', icon: FileText },
    ],
  }

  // Transactions replaced Invoices in the main bar
  const MOBILE_NAV = [
    { label: t('transactions'), href: '/transactions/sales', icon: ArrowRightLeft },
    { label: t('parties'), href: '/parties/customers', icon: Users },
    { spacer: true }, // Spacer for the center Dashboard button
    { label: t('reports'), href: '/reports/pnl', icon: BarChart3 },
    { label: t('more'), href: null, icon: MoreHorizontal },
  ]

  // Invoices moved to the More drawer
  const MORE_ITEMS = [
    { label: t('invoices'), href: '/invoices', icon: FileText },
    { label: t('inventory'), href: '/inventory', icon: Package },
    { label: t('masters'), basePath: '/masters', icon: FileText },
  ]

  // Check if we are currently on the dashboard to highlight the center button differently
  const isDashboardActive = pathname === '/dashboard'

  const handleClose = () => {
    setMoreOpen(false)
    setSubMenu(null)
  }

  return (
    <>
      {/* More drawer */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={handleClose}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-16 left-0 right-0 glass-heavy border-t border-border/8 p-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-3 gap-3">
              {/* Back Button inside grid to preserve layout dimensions */}
              {subMenu && (
                <button
                  onClick={() => setSubMenu(null)}
                  className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors duration-150 text-teal"
                >
                  <ArrowLeft size={18} />
                  <span className="text-xs font-medium">Back</span>
                </button>
              )}

              {subMenu 
                ? SUB_MENUS[subMenu].map((subItem) => {
                    const SubIcon = subItem.icon
                    const isSubActive = pathname === subItem.href
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={handleClose}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors duration-150 ${
                          isSubActive ? 'text-teal border border-teal/10' : ''
                        }`}
                      >
                        <SubIcon size={18} className={isSubActive ? 'text-teal' : 'text-foreground/60'} />
                        <span className={`text-xs ${isSubActive ? 'text-teal font-medium' : 'text-foreground/50'}`}>{subItem.label}</span>
                      </Link>
                    )
                  })
                : MORE_ITEMS.map((item) => {
                    const Icon = item.icon
                    
                    // If it has a basePath instead of an href, it opens a submenu (e.g. Masters)
                    if (item.basePath) {
                      const isParentActive = pathname.startsWith(item.basePath)
                      return (
                        <button
                          key={item.label}
                          onClick={() => setSubMenu(item.label)}
                          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors duration-150 ${
                            isParentActive ? 'text-teal' : ''
                          }`}
                        >
                          <Icon size={18} className={isParentActive ? 'text-teal' : 'text-foreground/60'} />
                          <span className={`text-xs ${isParentActive ? 'text-teal font-medium' : 'text-foreground/50'}`}>{item.label}</span>
                        </button>
                      )
                    }

                    // Standard direct link (e.g. Invoices, Inventory)
                    const isItemActive = item.href && pathname.startsWith(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        onClick={handleClose}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-foreground/5 hover:bg-foreground/8 transition-colors duration-150 ${
                          isItemActive ? 'text-teal' : ''
                        }`}
                      >
                        <Icon size={18} className={isItemActive ? 'text-teal' : 'text-foreground/60'} />
                        <span className={`text-xs ${isItemActive ? 'text-teal font-medium' : 'text-foreground/50'}`}>{item.label}</span>
                      </Link>
                    )
                  })
              }
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
            
            // Extract the base path (e.g., "/transactions/sales" -> "/transactions") to check if active
            const itemBasePath = item.href ? item.href.split('/').slice(0, 2).join('/') : ''
            const isActive = isMore
              ? moreOpen
              : (pathname === item.href || pathname.startsWith(itemBasePath))

            if (isMore) {
              return (
                <button
                  key="more"
                  onClick={() => {
                    setSubMenu(null)
                    setMoreOpen(!moreOpen)
                  }}
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
                onClick={(e) => {
                  // Universal Quality of Life Feature: 
                  // If the user clicks an active main tab that has a sub-menu dictionary, open the drawer.
                  if (isActive && SUB_MENUS[item.label]) {
                    e.preventDefault()
                    setSubMenu(item.label)
                    setMoreOpen(true)
                  } else {
                    handleClose()
                  }
                }}
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