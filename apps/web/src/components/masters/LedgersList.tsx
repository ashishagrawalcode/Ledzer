'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition } from 'react'
import { Search, Lock, ExternalLink } from 'lucide-react'
import { formatCurrency, debounce } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getGroupLabel } from '@/lib/dictionary'
import Link from 'next/link'
import { StatusBadge } from '@/components/shared/StatusBadge'

interface LedgerRow {
  id: string
  name: string
  group: string
  isSystem: boolean
  partyName: string | null
  partyType: string | null
  balance: number
  entryCount: number
}

const GROUP_COLORS: Record<string, string> = {
  ASSET: 'info',
  LIABILITY: 'warning',
  INCOME: 'teal',
  EXPENSE: 'danger',
  EQUITY: 'neutral',
}

const GROUPS = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY']

export function LedgersList({
  ledgers, currency, search: initialSearch, groupFilter,
}: {
  ledgers: LedgerRow[]
  currency: string
  search: string
  groupFilter: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [searchVal, setSearchVal] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)

  const pushFilters = debounce((q: string, g: string) => {
    startTransition(() => {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (g) params.set('group', g)
      router.push(`${pathname}?${params.toString()}`)
    })
  }, 300)

  // Group ledgers by account group
  const grouped = GROUPS.reduce((acc, g) => {
    const items = ledgers.filter((l) => l.group === g)
    if (items.length > 0) acc[g] = items
    return acc
  }, {} as Record<string, LedgerRow[]>)

  return (
    <div className="space-y-4">
      {/* Search + group filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
          <input
            value={searchVal}
            onChange={(e) => { setSearchVal(e.target.value); pushFilters(e.target.value, groupFilter) }}
            placeholder="Search ledgers…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-border/8 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-teal/40 transition-all duration-200"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => pushFilters(searchVal, '')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${!groupFilter ? 'bg-teal/15 text-teal border border-teal/25' : 'bg-foreground/5 text-foreground/40 border border-border/8 hover:text-foreground'}`}
          >
            All
          </button>
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => pushFilters(searchVal, groupFilter === g ? '' : g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${groupFilter === g ? 'bg-teal/15 text-teal border border-teal/25' : 'bg-foreground/5 text-foreground/40 border border-border/8 hover:text-foreground'}`}
            >
              {getGroupLabel(g, terminologyMode)}
            </button>
          ))}
        </div>
      </div>

      {/* No results */}
      {ledgers.length === 0 && (
        <div className="glass rounded-2xl border border-border/5 flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-foreground/30">No ledgers found</p>
        </div>
      )}

      {/* Grouped tables */}
      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} className="glass rounded-2xl border border-border/5 overflow-hidden">
          {/* Group header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-border/5 bg-foreground/[0.02]">
            <div className="flex items-center gap-2.5">
              <StatusBadge label={getGroupLabel(group, terminologyMode)} variant={GROUP_COLORS[group] as never} dot />
              <span className="text-xs text-foreground/30">{items.length} account{items.length !== 1 ? 's' : ''}</span>
            </div>
            <span className={`font-mono text-sm font-semibold ${
              group === 'INCOME' ? 'text-teal' :
              group === 'EXPENSE' ? 'text-red-400' :
              group === 'ASSET' ? 'text-blue-400' :
              'text-foreground/50'
            }`}>
              {formatCurrency(items.reduce((s, i) => s + i.balance, 0), currency)}
            </span>
          </div>

          <div className="divide-y divide-white/[0.03]">
            {items.map((ledger) => (
              <div
                key={ledger.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-foreground/[0.02] transition-colors duration-150"
                style={{ minHeight: '56px' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {ledger.isSystem && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-md bg-foreground/5 flex items-center justify-center" title="System ledger">
                      <Lock size={10} className="text-foreground/25" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/masters/ledgers/${ledger.id}`}
                        className="text-sm font-medium text-foreground hover:text-teal transition-colors duration-150 flex items-center gap-1 group"
                      >
                        {ledger.name}
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
                      </Link>
                      {ledger.partyType && (
                        <span className="text-[10px] text-foreground/25 bg-foreground/5 px-1.5 py-0.5 rounded">
                          {ledger.partyType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground/25 mt-0.5">
                      {ledger.entryCount} transaction{ledger.entryCount !== 1 ? 's' : ''}
                      {ledger.isSystem ? ' · System' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`font-mono text-sm font-semibold tabular-nums ${
                    ledger.balance > 0 ? 'text-foreground' :
                    ledger.balance < 0 ? 'text-red-400' :
                    'text-foreground/25'
                  }`}>
                    {ledger.balance !== 0 ? formatCurrency(Math.abs(ledger.balance), currency) : 'Nil'}
                  </p>
                  {ledger.balance !== 0 && (
                    <p className="text-[10px] text-foreground/25 mt-0.5">
                      {ledger.balance > 0 ? 'Dr' : 'Cr'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}