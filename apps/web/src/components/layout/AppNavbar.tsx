'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect, useTransition, useCallback } from 'react'
import {
  LayoutDashboard, FileText, ShoppingCart, Users, Package,
  BarChart3, Settings, LogOut, ChevronDown, Search,
  BookOpen, Receipt, CreditCard, ArrowRightLeft, Layers,
  User, Building2, X, ArrowRight, Loader2, Plus,
  Hash, TrendingUp, Scale, CalendarDays, Wallet, Download
} from 'lucide-react'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary } from '@/lib/dictionary'
import { getInitials, cn } from '@/lib/utils'
import { globalSearch, type SearchResult } from '@/actions/globalSearch'
import type { Session } from 'next-auth'
import { useTerms } from '@/hooks/useTerms'

declare global {
  interface Window {
    deferredPrompt: any;
  }
}

interface AppNavbarProps {
  session: Session
  businessName?: string | null
}

interface NavChild {
  label: string
  href: string
  icon: React.ElementType
  description: string
  newHref?: string
  newLabel?: string
}

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: NavChild[]
}

// ─── All nav pages for search ─────────────────────────────────────────────────
const NAV_PAGES = [
  { label: 'Dashboard',      href: '/dashboard',              icon: LayoutDashboard  },
  { label: 'Invoices',       href: '/transactions/invoices',  icon: FileText         },
  { label: 'Sales Invoices', href: '/transactions/sales',     icon: FileText         },
  { label: 'Purchase Bills', href: '/transactions/purchases', icon: ShoppingCart     },
  { label: 'Receipts',       href: '/transactions/receipts',  icon: Receipt          },
  { label: 'Payments',       href: '/transactions/payments',  icon: CreditCard       },
  { label: 'Journals',       href: '/transactions/journals',  icon: BookOpen         },
  { label: 'Contra',         href: '/transactions/contra',    icon: ArrowRightLeft   },
  { label: 'Ledgers',        href: '/masters/ledgers',        icon: BookOpen         },
  { label: 'Groups',         href: '/masters/groups',         icon: Layers           },
  { label: 'Voucher Types',  href: '/masters/voucher-types',  icon: FileText         },
  { label: 'Customers',      href: '/parties/customers',      icon: User             },
  { label: 'Suppliers',      href: '/parties/suppliers',      icon: Building2        },
  { label: 'Inventory',      href: '/inventory',              icon: Package          },
  { label: 'Profit & Loss',  href: '/reports/pnl',           icon: TrendingUp       },
  { label: 'Balance Sheet',  href: '/reports/balance-sheet', icon: Scale            },
  { label: 'Day Book',       href: '/reports/daybook',       icon: CalendarDays     },
  { label: 'Cash Flow',      href: '/reports/cashflow',      icon: Wallet           },
  { label: 'Party Ledger',   href: '/reports/party-ledger',  icon: Users            },
  { label: 'Settings',       href: '/settings',              icon: Settings         },
]

const RESULT_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Party:   { icon: Users,     color: 'text-blue-500',              bg: 'bg-blue-500/10'   },
  Voucher: { icon: FileText,  color: 'text-green-500',             bg: 'bg-green-500/10'  },
  Ledger:  { icon: BookOpen,  color: 'text-purple-500',            bg: 'bg-purple-500/10' },
  Product: { icon: Package,   color: 'text-amber-500',             bg: 'bg-amber-500/10'  },
  Page:    { icon: Hash,      color: 'text-muted-foreground',      bg: 'bg-accent'        },
}

// ─── Search Overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [dbResults, setDbResults] = useState<SearchResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const matchedPages = query.trim().length >= 1
    ? NAV_PAGES.filter(p =>
        p.label.toLowerCase().includes(query.trim().toLowerCase()) &&
        p.href !== pathname
      ).slice(0, 5)
    : []

  const pageItems = matchedPages.map(p => ({ label: p.label, href: p.href, sub: 'Page', type: 'Page' as const, icon: p.icon }))
  const allItems = [...pageItems, ...dbResults]

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, allItems.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && allItems[selectedIdx]) {
        router.push(allItems[selectedIdx].href)
        onClose()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, allItems, selectedIdx, router])

  const handleChange = useCallback((val: string) => {
    setQuery(val)
    setSelectedIdx(0)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setDbResults([]); return }
    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await globalSearch(val)
        setDbResults(res)
      })
    }, 220)
  }, [])

  const isEmpty = query.length === 0
  const noResults = query.trim().length >= 2 && !isPending && allItems.length === 0

  const grouped = dbResults.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      <div
        className="relative w-full max-w-[540px] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'scaleIn 0.14s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          {isPending
            ? <Loader2 size={15} className="text-muted-foreground animate-spin flex-shrink-0" />
            : <Search size={15} className="text-muted-foreground flex-shrink-0" />
          }
          <input
            ref={inputRef}
            value={query}
            onChange={e => handleChange(e.target.value)}
            placeholder="Search pages, parties, invoices, products…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setDbResults([]); inputRef.current?.focus() }}
              className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              <X size={10} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-accent border border-border text-[10px] font-mono text-muted-foreground flex-shrink-0">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto overscroll-contain">
          {isEmpty && (
            <div className="p-2">
              <p className="px-3 pt-2 pb-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Navigation
              </p>
              {NAV_PAGES.slice(0, 7).map(p => {
                const Icon = p.icon
                return (
                  <Link
                    key={p.href}
                    href={p.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-75"
                  >
                    <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <Icon size={12} />
                    </div>
                    <span className="text-sm">{p.label}</span>
                  </Link>
                )
              })}
              <p className="text-[11px] text-muted-foreground/40 text-center py-3">
                Type to search parties, invoices, ledgers…
              </p>
            </div>
          )}

          {noResults && (
            <div className="py-12 text-center px-4">
              <p className="text-sm text-muted-foreground/60">
                No results for <span className="text-foreground font-medium">"{query}"</span>
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">Try a name, voucher number, or SKU</p>
            </div>
          )}

          {!isEmpty && !noResults && allItems.length > 0 && (
            <div className="p-2 space-y-1">
              {pageItems.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages</p>
                  {pageItems.map(item => {
                    const flatIdx = allItems.indexOf(item)
                    const isSelected = flatIdx === selectedIdx
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        onMouseEnter={() => setSelectedIdx(flatIdx)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-75',
                          isSelected
                            ? 'bg-accent text-foreground'
                            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                        )}
                      >
                        <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                          <Icon size={12} />
                        </div>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <ArrowRight size={12} className={cn('flex-shrink-0 transition-opacity', isSelected ? 'opacity-50' : 'opacity-0')} />
                      </Link>
                    )
                  })}
                </div>
              )}

              {Object.entries(grouped).map(([type, items]) => {
                const cfg = RESULT_CONFIG[type] ?? RESULT_CONFIG.Page
                const TypeIcon = cfg.icon
                return (
                  <div key={type}>
                    <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {type}s
                    </p>
                    {items.map(item => {
                      const flatIdx = allItems.findIndex(r => r === item)
                      const isSelected = flatIdx === selectedIdx
                      return (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          onClick={onClose}
                          onMouseEnter={() => setSelectedIdx(flatIdx)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-75',
                            isSelected
                              ? 'bg-accent text-foreground'
                              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                          )}
                        >
                          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                            <TypeIcon size={12} className={cfg.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate">{item.sub}</p>
                          </div>
                          <ArrowRight size={12} className={cn('flex-shrink-0 transition-opacity', isSelected ? 'opacity-50' : 'opacity-0')} />
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t border-border bg-accent/20 flex items-center justify-between text-[10px] text-muted-foreground/40">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-accent border border-border rounded text-[10px]">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-accent border border-border rounded text-[10px]">↵</kbd>
              open
            </span>
          </div>
          {allItems.length > 0 && (
            <span>{allItems.length} result{allItems.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  )
}

// ─── Dropdown Install Item ───────────────────────────────────────────────────
function InstallMenuItem({ onClose }: { onClose: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    if (window.deferredPrompt) {
      setDeferredPrompt(window.deferredPrompt)
      setIsInstallable(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      window.deferredPrompt = e
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      window.deferredPrompt = null
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    const checkInterval = setInterval(() => {
      if (window.deferredPrompt) {
        setDeferredPrompt(window.deferredPrompt)
        setIsInstallable(true)
        clearInterval(checkInterval)
      }
    }, 500)
    setTimeout(() => clearInterval(checkInterval), 2500)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearInterval(checkInterval)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      window.deferredPrompt = null
    }
    setDeferredPrompt(null)
    onClose()
  }

  if (!isInstallable) return null

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-teal hover:bg-teal/10 transition-all duration-100"
      >
        <Download size={14} />Install App
      </button>
      <div className="my-1 h-px bg-border" />
    </>
  )
}

// ─── User Dropdown ─────────────────────────────────────────────────────────────
function UserDropdown({ session, userInitials }: { session: Session; userInitials: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-accent transition-all duration-100 group"
      >
        <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center text-[11px] font-bold text-navy-DEFAULT shadow-glow-sm">
          {userInitials}
        </div>
        <span className="hidden sm:block text-xs font-medium text-muted-foreground group-hover:text-foreground max-w-[72px] truncate transition-colors">
          {session.user?.name?.split(' ')[0] ?? 'User'}
        </span>
        <ChevronDown size={11} className={cn('text-muted-foreground transition-transform duration-200 flex-shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
            style={{ animation: 'dropDown 0.13s cubic-bezier(0.32,0.72,0,1)' }}
          >
            <div className="px-4 py-3.5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-gradient flex items-center justify-center text-xs font-bold text-navy-DEFAULT flex-shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{session.user?.name ?? 'N/A'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{session.user?.email ?? 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="p-1.5">
              
              {/* Dropdown Install Button Injected Here */}
              <InstallMenuItem onClose={() => setOpen(false)} />

              <Link href="/settings" onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-100"
              >
                <Settings size={14} />Settings
              </Link>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500/70 hover:text-red-500 hover:bg-red-500/8 transition-all duration-100"
              >
                <LogOut size={14} />Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Nav Dropdown ──────────────────────────────────────────────────────────────
function NavDropdown({
  item, isOpen, isActive, onMouseEnter, onMouseLeave, onClick, pathname,
}: {
  item: NavItem
  isOpen: boolean
  isActive: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: () => void
  pathname: string
}) {
  const Icon = item.icon

  return (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Trigger */}
      <button
        onClick={onClick}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 select-none',
          isActive || isOpen
            ? 'text-foreground bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
        )}
      >
        <Icon size={14} />
        <span>{item.label}</span>
        <ChevronDown
          size={11}
          className={cn(
            'ml-0.5 text-muted-foreground/60 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{
            minWidth: 248,
            animation: 'dropDown 0.14s cubic-bezier(0.32,0.72,0,1)',
          }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="px-3.5 py-2.5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {item.label}
            </p>
          </div>

          <div className="p-1.5">
            {item.children!.map(child => {
              const ChildIcon = child.icon
              const childActive = pathname === child.href || pathname.startsWith(child.href + '/')

              return (
                <div key={child.href} className="group/row relative">
                  <Link
                    href={child.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-100',
                      child.newHref ? 'pr-14' : '',
                      childActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    )}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-100',
                      childActive
                        ? 'bg-primary/15 text-primary'
                        : 'bg-accent text-muted-foreground group-hover/row:text-foreground'
                    )}>
                      <ChildIcon size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-none">{child.label}</p>
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5 leading-tight">
                        {child.description}
                      </p>
                    </div>
                    {childActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mr-1" />
                    )}
                  </Link>

                  {child.newHref && (
                    <Link
                      href={child.newHref}
                      title={child.newLabel ?? `New ${child.label}`}
                      className={cn(
                        'absolute right-2.5 top-1/2 -translate-y-1/2',
                        'flex items-center gap-1 px-2 py-1 rounded-lg',
                        'text-[10px] font-semibold',
                        'bg-primary/10 text-primary border border-primary/20',
                        'opacity-0 translate-x-1',
                        'group-hover/row:opacity-100 group-hover/row:translate-x-0',
                        'transition-all duration-150',
                        'hover:bg-primary/20'
                      )}
                    >
                      <Plus size={9} />
                      New
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function AppNavbar({ session, businessName }: AppNavbarProps) {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [pinned, setPinned] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [])

  useEffect(() => {
    setOpenDropdown(null)
    setPinned(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setPinned(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleMouseEnter = (label: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setOpenDropdown(label)
  }

  const handleMouseLeave = () => {
    if (pinned) return
    hoverTimer.current = setTimeout(() => setOpenDropdown(null), 130)
  }

  const handleClick = (label: string) => {
    if (openDropdown === label && pinned) {
      setOpenDropdown(null)
      setPinned(false)
    } else {
      setOpenDropdown(label)
      setPinned(true)
    }
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + '/')
    return item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false
  }

  const { t } = useTerms();
  
  const NAV_ITEMS: NavItem[] = [
    { label: t('dashboard'), href: '/dashboard', icon: LayoutDashboard },
    {
      label: t('transactions'),
      icon: ArrowRightLeft,
      children: [
        { label: t('salesInvoices'), href: '/transactions/sales', icon: FileText, description: t('descSales'), newHref: '/transactions/sales/new', newLabel: t('newInvoice') },
        { label: t('purchaseBills'), href: '/transactions/purchases', icon: ShoppingCart, description: t('descPurchase'), newHref: '/transactions/purchases/new', newLabel: t('newPurchase') },
        { label: t('receipts'), href: '/transactions/receipts', icon: Receipt, description: t('descReceipts'), newHref: '/transactions/receipts/new', newLabel: t('newReceipt') },
        { label: t('payments'), href: '/transactions/payments', icon: CreditCard, description: t('descPayments'), newHref: '/transactions/payments/new', newLabel: t('newPayment') },
        { label: t('journals'), href: '/transactions/journals', icon: BookOpen, description: t('descJournals'), newHref: '/transactions/journals/new', newLabel: t('newJournal') },
        { label: t('contra'), href: '/transactions/contra', icon: ArrowRightLeft, description: t('descContra'), newHref: '/transactions/contra/new', newLabel: t('newContra') },
      ],
    },
    {
      label: t('invoices'), 
      href: '/invoices',
      icon: FileText,
    },
    {
      label: t('masters'),
      icon: Layers,
      children: [
        { label: t('ledgers'), href: '/masters/ledgers', icon: BookOpen, description: t('descLedgers'), newHref: '/masters/ledgers/new', newLabel: t('newLedger') },
        { label: t('groups'), href: '/masters/groups', icon: Layers, description: t('descGroups') },
        { label: t('voucherTypes'), href: '/masters/voucher-types', icon: FileText, description: t('descVoucherTypes') },
      ],
    },
    {
      label: t('parties'),
      icon: Users,
      children: [
        { label: t('customers'), href: '/parties/customers', icon: User, description: t('descCustomers'), newHref: '/parties/customers/new', newLabel: t('newCustomer') },
        { label: t('suppliers'), href: '/parties/suppliers', icon: Building2, description: t('descSuppliers'), newHref: '/parties/suppliers/new', newLabel: t('newSupplier') },
      ],
    },
    { label: t('inventory'), href: '/inventory', icon: Package },
    {
      label: t('reports'),
      icon: BarChart3,
      children: [
        { label: t('profitAndLoss'), href: '/reports/pnl', icon: BarChart3, description: t('descPnL') },
        { label: t('balanceSheet'), href: '/reports/balance-sheet', icon: Scale, description: t('descBalanceSheet') },
        { label: t('dayBook'), href: '/reports/daybook', icon: BookOpen, description: t('descDayBook') },
        { label: t('cashFlow'), href: '/reports/cashflow', icon: Wallet, description: t('descCashFlow') },
        { label: t('partyLedger'), href: '/reports/party-ledger', icon: Users, description: t('descPartyLedger') },
      ],
    },
  ];

  const userInitials = getInitials(session.user?.name)

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 h-14">
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-b border-border" />

        <div className="relative w-full h-full flex items-center px-4 lg:px-6 gap-1">

          <Link href="/dashboard" className="flex items-center gap-2 mr-2 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <span className="font-display font-bold text-navy-DEFAULT text-xs">L</span>
            </div>
            <span className="font-display font-bold text-sm text-foreground tracking-tight">Ledzer</span>
            {businessName && (
              <span className="hidden md:block text-[10px] text-muted-foreground leading-none truncate max-w-[100px]">
                · {businessName}
              </span>
            )}
          </Link>

          {businessName && (
            <span className="md:hidden text-[10px] text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full truncate max-w-[80px] flex-shrink-0">
              {businessName}
            </span>
          )}

          <div className="hidden lg:block w-px h-4 bg-border mx-1.5 flex-shrink-0" />

          <div className="hidden lg:flex items-center gap-0.5 flex-1 overflow-visible">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon
              const active = isItemActive(item)
              const isOpen = openDropdown === item.label

              if (!item.children) {
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-100 flex-shrink-0',
                      active
                        ? 'text-foreground bg-accent'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                    )}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                )
              }

              return (
                <NavDropdown
                  key={item.label}
                  item={item}
                  isOpen={isOpen}
                  isActive={active}
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(item.label)}
                  pathname={pathname}
                />
              )
            })}
          </div>

          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-accent border border-border text-muted-foreground hover:text-foreground hover:bg-accent/80 transition-all duration-100 text-xs group"
            >
              <Search size={13} />
              <span className="hidden md:inline text-muted-foreground/70 group-hover:text-muted-foreground transition-colors">
                Search…
              </span>
              <div className="hidden lg:flex items-center gap-0.5 ml-1">
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono leading-none">⌘</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[10px] font-mono leading-none">K</kbd>
              </div>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-100"
            >
              <Search size={16} />
            </button>

            <UserDropdown session={session} userInitials={userInitials} />
          </div>
        </div>
      </nav>

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}

      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </>
  )
}