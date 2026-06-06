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
  Hash, TrendingUp, Scale, CalendarDays, Wallet,
} from 'lucide-react'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary } from '@/lib/dictionary'
import { getInitials, cn } from '@/lib/utils'
import { globalSearch, type SearchResult } from '@/actions/globalsearch'
import type { Session } from 'next-auth'

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

  // Flat combined list for keyboard nav
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
        {/* Input row */}
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

        {/* Body */}
        <div className="max-h-[400px] overflow-y-auto overscroll-contain">

          {/* Empty state — quick nav */}
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

          {/* No results */}
          {noResults && (
            <div className="py-12 text-center px-4">
              <p className="text-sm text-muted-foreground/60">
                No results for <span className="text-foreground font-medium">"{query}"</span>
              </p>
              <p className="text-xs text-muted-foreground/40 mt-1">Try a name, voucher number, or SKU</p>
            </div>
          )}

          {/* Results */}
          {!isEmpty && !noResults && allItems.length > 0 && (
            <div className="p-2 space-y-1">
              {/* Page matches */}
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

              {/* DB results grouped */}
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

        {/* Footer */}
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
          {/* Header */}
          <div className="px-3.5 py-2.5 border-b border-border">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {item.label}
            </p>
          </div>

          {/* Items */}
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

                  {/* "+ New" pill — slides in on row hover */}
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
  const terminologyMode = usePreferencesStore(s => s.terminologyMode)
  const dict = getDictionary(terminologyMode)

  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [pinned, setPinned] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ⌘K shortcut
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

  // Close on route change
  useEffect(() => {
    setOpenDropdown(null)
    setPinned(false)
    setSearchOpen(false)
  }, [pathname])

  // Outside click closes everything
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
    // Don't change pin state on hover — hover shouldn't override a click-pin
  }

  const handleMouseLeave = () => {
    if (pinned) return  // clicked open — keep it
    hoverTimer.current = setTimeout(() => setOpenDropdown(null), 130)
  }

  const handleClick = (label: string) => {
    if (openDropdown === label && pinned) {
      // Already pinned → close
      setOpenDropdown(null)
      setPinned(false)
    } else {
      // Open + pin
      setOpenDropdown(label)
      setPinned(true)
    }
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + '/')
    return item.children?.some(c => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false
  }

  const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      label: dict.transactions ?? 'Transactions',
      icon: ArrowRightLeft,
      children: [
        { label: 'Sales Invoices', href: '/transactions/sales',     icon: FileText,       description: 'Create & manage sales vouchers',   newHref: '/transactions/sales/new',     newLabel: 'New Invoice'  },
        { label: 'Purchase Bills', href: '/transactions/purchases', icon: ShoppingCart,   description: 'Record purchase vouchers',          newHref: '/transactions/purchases/new', newLabel: 'New Purchase' },
        { label: 'Receipts',       href: '/transactions/receipts',  icon: Receipt,        description: 'Payments received from customers',  newHref: '/transactions/receipts/new',  newLabel: 'New Receipt'  },
        { label: 'Payments',       href: '/transactions/payments',  icon: CreditCard,     description: 'Payments made to suppliers',        newHref: '/transactions/payments/new',  newLabel: 'New Payment'  },
        { label: 'Journals',       href: '/transactions/journals',  icon: BookOpen,       description: 'Manual adjustment entries',         newHref: '/transactions/journals/new',  newLabel: 'New Journal'  },
        { label: 'Contra',         href: '/transactions/contra',    icon: ArrowRightLeft, description: 'Cash & bank transfers',             newHref: '/transactions/contra/new',    newLabel: 'New Contra'   },
      ],
    },
    {
      label: dict.masters ?? 'Masters',
      icon: Layers,
      children: [
        { label: 'Ledgers',       href: '/masters/ledgers',       icon: BookOpen, description: 'Chart of accounts',           newHref: '/masters/ledgers/new', newLabel: 'New Ledger' },
        { label: 'Groups',        href: '/masters/groups',        icon: Layers,   description: 'Account group management'    },
        { label: 'Voucher Types', href: '/masters/voucher-types', icon: FileText, description: 'Custom voucher configuration' },
      ],
    },
    {
      label: dict.parties ?? 'Parties',
      icon: Users,
      children: [
        { label: 'Customers', href: '/parties/customers', icon: User,      description: 'People who owe you money', newHref: '/parties/customers/new', newLabel: 'New Customer' },
        { label: 'Suppliers', href: '/parties/suppliers', icon: Building2, description: 'People you owe money to',  newHref: '/parties/suppliers/new', newLabel: 'New Supplier' },
      ],
    },
    { label: dict.inventory ?? 'Inventory', href: '/inventory', icon: Package },
    {
      label: dict.reports ?? 'Reports',
      icon: BarChart3,
      children: [
        { label: 'Profit & Loss', href: '/reports/pnl',           icon: BarChart3,      description: 'Income and expense summary'   },
        { label: 'Balance Sheet', href: '/reports/balance-sheet', icon: Layers,         description: 'Assets and liabilities'       },
        { label: 'Day Book',      href: '/reports/daybook',       icon: BookOpen,       description: 'All transactions for a day'   },
        { label: 'Cash Flow',     href: '/reports/cashflow',      icon: ArrowRightLeft, description: 'Money movement overview'      },
        { label: 'Party Ledger',  href: '/reports/party-ledger',  icon: Users,          description: 'Individual party statements'  },
      ],
    },
  ]

  const userInitials = getInitials(session.user?.name)

  return (
    <>
      <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 h-14">
        {/* Glass background */}
        <div className="absolute inset-0 bg-background/85 backdrop-blur-xl border-b border-border" />

        <div className="relative w-full h-full flex items-center px-4 lg:px-6 gap-1">

          {/* Logo — visible on all sizes */}
          <Link href="/dashboard" className="flex items-center gap-2 mr-2 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
              <span className="font-display font-bold text-navy-DEFAULT text-xs">L</span>
            </div>
            <span className="font-display font-bold text-sm text-foreground tracking-tight">Ledzer</span>
            {/* Business name: inline on desktop, hidden on sm */}
            {businessName && (
              <span className="hidden md:block text-[10px] text-muted-foreground leading-none truncate max-w-[100px]">
                · {businessName}
              </span>
            )}
          </Link>

          {/* Business name pill on mobile (sm only) */}
          {businessName && (
            <span className="md:hidden text-[10px] text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full truncate max-w-[80px] flex-shrink-0">
              {businessName}
            </span>
          )}

          {/* Divider */}
          <div className="hidden lg:block w-px h-4 bg-border mx-1.5 flex-shrink-0" />

          {/* Desktop nav */}
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

          {/* Right controls */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            {/* Search — desktop */}
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

            {/* Search — mobile icon */}
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