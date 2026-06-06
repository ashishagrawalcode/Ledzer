'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Phone, Mail, ExternalLink, Loader2 } from 'lucide-react'
import { formatCurrency, getInitials, debounce, truncate } from '@/lib/utils'
import Link from 'next/link'
import { usePendingItems } from '@/hooks/usePendingItems' // IMPORTANT: Import the hook

interface PartyRow {
  id: string
  name: string
  type: string
  email: string | null
  phone: string | null
  gstin: string | null
  balance: number
  totalTransacted: number
  txCount: number
  isPending?: boolean // Required for offline state
}

export function PartiesList({ parties, currency, search: initialSearch, partyType }: {
  parties: PartyRow[]
  currency: string
  search: string
  partyType: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchVal, setSearchVal] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()

  // 1. Fetch pending parties from offline queue
  const pendingItems = usePendingItems()
  const pendingParties = pendingItems
    .filter((item) => item.type === 'PARTY' && item.data.type === partyType)
    .map((item) => ({
      id: `pending-${item.id}`,
      name: item.data.name,
      type: item.data.type,
      email: item.data.email || null,
      phone: item.data.phone || null,
      gstin: item.data.gstin || null,
      balance: (item.data.openingType === 'CREDIT' ? -1 : 1) * (parseFloat(item.data.openingBalance) || 0),
      totalTransacted: 0,
      txCount: 0,
      isPending: true,
    })) as PartyRow[]

  // 2. Merge server parties with offline parties
  const allParties = [...pendingParties, ...parties]

  const pushSearch = debounce((q: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      router.push(`${pathname}?${params.toString()}`)
    })
  }, 300)

  const isCustomer = partyType === 'CUSTOMER'

  if (allParties.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
          <input value={searchVal} onChange={(e) => { setSearchVal(e.target.value); pushSearch(e.target.value) }}
            placeholder={`Search ${partyType.toLowerCase()}s…`}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-border/8 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-teal/40 transition-all duration-200" />
        </div>
        <div className="glass rounded-2xl border border-border/5 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-foreground/3 flex items-center justify-center">
            <span className="text-2xl text-foreground/10">👥</span>
          </div>
          <p className="text-foreground/30 text-sm">{searchVal ? `No results for "${searchVal}"` : `No ${partyType.toLowerCase()}s yet`}</p>
          <Link href={`/parties/${partyType.toLowerCase()}s/new`}
            className="text-xs text-teal/60 hover:text-teal transition-colors underline underline-offset-2">
            Add your first {partyType.toLowerCase()}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
        <input value={searchVal} onChange={(e) => { setSearchVal(e.target.value); pushSearch(e.target.value) }}
          placeholder={`Search ${partyType.toLowerCase()}s…`}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-border/8 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-teal/40 transition-all duration-200" />
        {isPending && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-border/20 border-t-teal rounded-full animate-spin" />}
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allParties.map((party) => {
          const pendingAmt = isCustomer ? Math.max(0, party.balance) : Math.max(0, -party.balance)

          return (
            <Link
              key={party.id}
              href={party.isPending ? '#' : `/parties/${party.id}`}
              className={`glass rounded-2xl p-5 border transition-all duration-200 group block ${
                party.isPending 
                  ? 'border-amber-500/20 opacity-80 cursor-default' 
                  : 'border-border/5 hover:border-border/10 hover:scale-[1.01] hover:shadow-card'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-gradient flex items-center justify-center text-sm font-bold text-navy flex-shrink-0 shadow-glow-sm relative">
                  {getInitials(party.name)}
                  {party.isPending && <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-background animate-pulse" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`font-semibold text-sm truncate transition-colors duration-150 ${
                      party.isPending ? 'text-foreground/70' : 'text-foreground group-hover:text-teal'
                    }`}>
                      {party.name}
                    </p>
                    {party.isPending ? (
                       <span className="text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                         <Loader2 size={8} className="animate-spin" /> Syncing
                       </span>
                    ) : (
                      <ExternalLink size={10} className="opacity-0 group-hover:opacity-40 transition-opacity flex-shrink-0" />
                    )}
                  </div>
                  {party.gstin && <p className="text-[10px] text-foreground/25 font-mono mt-0.5">{party.gstin}</p>}
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1 mb-4">
                {party.phone ? (
                  <div className="flex items-center gap-2 text-xs text-foreground/35">
                    <Phone size={11} />{party.phone}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-foreground/15 italic">
                    <Phone size={11} />N/A
                  </div>
                )}
                {party.email ? (
                  <div className="flex items-center gap-2 text-xs text-foreground/35">
                    <Mail size={11} />{truncate(party.email, 28)}
                  </div>
                ) : null}
              </div>

              {/* Balance */}
              <div className="pt-3 border-t border-border/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-foreground/25 uppercase tracking-wider">
                    {isCustomer ? 'Receivable' : 'Payable'}
                  </p>
                  <p className={`font-mono text-sm font-bold tabular-nums mt-0.5 ${
                    pendingAmt > 0 ? (isCustomer ? 'text-teal' : 'text-red-400') : 'text-foreground/25'
                  }`}>
                    {pendingAmt > 0 ? formatCurrency(pendingAmt, currency) : 'Nil'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-foreground/25 uppercase tracking-wider">Transactions</p>
                  <p className="font-mono text-sm font-semibold text-foreground/60 mt-0.5">
                    {party.txCount > 0 ? party.txCount : 'N/A'}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}