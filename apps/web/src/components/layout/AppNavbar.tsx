'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import {
  LayoutDashboard, FileText, ShoppingCart, Users, Package,
  BarChart3, Settings, LogOut, ChevronDown, Search,
  BookOpen, Receipt, CreditCard, ArrowRightLeft, Layers, Group,
  User, Building2
} from 'lucide-react'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary } from '@/lib/dictionary'
import { getInitials } from '@/lib/utils'
import type { Session } from 'next-auth'

interface AppNavbarProps {
  session: Session
  businessName?: string | null
}

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  children?: { label: string; href: string; icon: React.ElementType; description: string }[]
}

export function AppNavbar({ session, businessName }: AppNavbarProps) {
  const pathname = usePathname()
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const dict = getDictionary(terminologyMode)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: dict.transactions,
      icon: ArrowRightLeft,
      children: [
        { label: 'Sales Invoices', href: '/transactions/sales', icon: FileText, description: 'Create & manage sales vouchers' },
        { label: 'Purchase Bills', href: '/transactions/purchases', icon: ShoppingCart, description: 'Record purchase vouchers' },
        { label: 'Receipts', href: '/transactions/receipts', icon: Receipt, description: 'Payments received from customers' },
        { label: 'Payments', href: '/transactions/payments', icon: CreditCard, description: 'Payments made to suppliers' },
        { label: 'Journals', href: '/transactions/journals', icon: BookOpen, description: 'Manual adjustment entries' },
        { label: 'Contra', href: '/transactions/contra', icon: ArrowRightLeft, description: 'Cash & bank transfers' },
      ],
    },
    {
      label: dict.masters,
      icon: Layers,
      children: [
        { label: 'Ledgers', href: '/masters/ledgers', icon: BookOpen, description: 'Chart of accounts' },
        { label: 'Groups', href: '/masters/groups', icon: Group, description: 'Account group management' },
        { label: 'Voucher Types', href: '/masters/voucher-types', icon: FileText, description: 'Custom voucher configuration' },
      ],
    },
    {
      label: 'Invoices',
      href: '/invoices',
      icon: FileText,
    },
    {
      label: dict.parties,
      icon: Users,
      children: [
        { label: 'Customers', href: '/parties/customers', icon: User, description: 'People who owe you money' },
        { label: 'Suppliers', href: '/parties/suppliers', icon: Building2, description: 'People you owe money to' },
      ],
    },
    {
      label: dict.inventory,
      href: '/inventory',
      icon: Package,
    },
    {
      label: dict.reports,
      icon: BarChart3,
      children: [
        { label: 'Profit & Loss', href: '/reports/pnl', icon: BarChart3, description: 'Income and expense summary' },
        { label: 'Balance Sheet', href: '/reports/balance-sheet', icon: Layers, description: 'Assets and liabilities' },
        { label: 'Day Book', href: '/reports/daybook', icon: BookOpen, description: 'All transactions for a day' },
        { label: 'Cash Flow', href: '/reports/cashflow', icon: ArrowRightLeft, description: 'Money movement overview' },
        { label: 'Party Ledger', href: '/reports/party-ledger', icon: Users, description: 'Individual party statements' },
      ],
    },
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on route change
  useEffect(() => {
    setOpenDropdown(null)
    setSearchOpen(false)
  }, [pathname])

  const handleMouseEnter = (label: string) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current)
    setOpenDropdown(label)
  }

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setOpenDropdown(null), 150)
  }

  const isActive = (item: NavItem) => {
    if (item.href) return pathname === item.href || pathname.startsWith(item.href + '/')
    return item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/')) ?? false
  }

  const userInitials = getInitials(session.user?.name)

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 h-16 glass border-b border-border/5 shadow-nav"
      >
        <div className="w-full h-full flex items-center px-4 lg:px-6 gap-2">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 mr-4 group flex-shrink-0">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                <span className="font-display font-bold text-navy text-sm">L</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-base text-foreground">Ledzer</span>
              {businessName && (
                <span className="block text-[10px] text-foreground/30 leading-none -mt-0.5 truncate max-w-[120px]">
                  {businessName}
                </span>
              )}
            </div>
          </Link>

          {/* Nav divider */}
          <div className="hidden lg:block w-px h-5 bg-foreground/8 mx-1" />

          {/* Nav items */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              const isOpen = openDropdown === item.label

              if (!item.children) {
                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'text-teal bg-teal/8'
                        : 'text-foreground/55 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </Link>
                )
              }

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active || isOpen
                        ? 'text-teal bg-teal/8'
                        : 'text-foreground/55 hover:text-foreground hover:bg-foreground/5'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {isOpen && (
                    <div
                      className="absolute top-full left-0 mt-1.5 glass-heavy rounded-xl border border-border/8 shadow-card-hover overflow-hidden animate-slide-down min-w-[240px]"
                      onMouseEnter={() => handleMouseEnter(item.label)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="p-1.5">
                        {item.children!.map((child) => {
                          const ChildIcon = child.icon
                          const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group/item ${
                                childActive
                                  ? 'bg-teal/10 text-teal'
                                  : 'hover:bg-foreground/5 text-foreground/70 hover:text-foreground'
                              }`}
                            >
                              <div className={`mt-0.5 flex-shrink-0 ${childActive ? 'text-teal' : 'text-foreground/40 group-hover/item:text-foreground/70'}`}>
                                <ChildIcon size={15} />
                              </div>
                              <div>
                                <p className="text-sm font-medium leading-none mb-0.5">{child.label}</p>
                                <p className="text-xs text-foreground/30 group-hover/item:text-foreground/40">{child.description}</p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 border border-border/8 text-foreground/40 hover:text-foreground/70 hover:border-border/12 transition-all duration-200 text-xs"
            >
              <Search size={13} />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-foreground/8 text-[10px] font-mono">
                ⌘K
              </kbd>
            </button>

            {/* User menu */}
            <UserDropdown session={session} userInitials={userInitials} />
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}

function UserDropdown({ session, userInitials }: { session: Session; userInitials: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative ml-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-foreground/5 transition-all duration-150"
      >
        <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center text-xs font-bold text-navy shadow-glow-sm">
          {userInitials}
        </div>
        <span className="hidden sm:block text-xs font-medium text-foreground/70 max-w-[80px] truncate">
          {session.user?.name?.split(' ')[0] ?? 'User'}
        </span>
        <ChevronDown size={12} className={`text-foreground/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-52 glass-heavy rounded-xl border border-border/8 shadow-card-hover overflow-hidden z-50 animate-slide-down">
            <div className="p-3 border-b border-border/5">
              <p className="text-sm font-medium text-foreground truncate">{session.user?.name ?? 'N/A'}</p>
              <p className="text-xs text-foreground/40 truncate">{session.user?.email ?? 'N/A'}</p>
            </div>
            <div className="p-1.5">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors duration-150"
              >
                <Settings size={14} />
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400/80 hover:text-red-400 hover:bg-red-400/8 transition-colors duration-150"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); onClose() }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl glass-heavy rounded-2xl border border-border/10 shadow-card-hover animate-scale-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/5">
          <Search size={16} className="text-foreground/40 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoices, parties, ledgers..."
            className="flex-1 bg-transparent text-foreground placeholder:text-foreground/25 text-sm outline-none"
          />
          <kbd className="px-2 py-1 rounded bg-foreground/8 text-[10px] font-mono text-foreground/30">ESC</kbd>
        </div>
        <div className="p-3">
          {query.length === 0 ? (
            <div className="py-8 text-center text-foreground/25 text-sm">
              Start typing to search across all your data
            </div>
          ) : (
            <div className="py-6 text-center text-foreground/30 text-sm">
              Searching for &ldquo;{query}&rdquo;...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}