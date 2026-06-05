'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, getVoucherPrefix, debounce } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant, getVoucherTypeLabel } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { DataTable } from '@/components/shared/DataTable'

interface VoucherRow {
  id: string
  number: string
  date: Date
  type: string
  partyName: string | null
  amount: number
  notes: string | null
}

interface TransactionsListProps {
  vouchers: VoucherRow[]
  currency: string
  total: number
  page: number
  pageSize: number
  search: string
  baseHref: string
  voucherType: string
}

export function TransactionsList({
  vouchers, currency, total, page, pageSize, search, baseHref, voucherType,
}: TransactionsListProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchVal, setSearchVal] = useState(search)
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const isSimple = terminologyMode === 'simple'

  const totalPages = Math.ceil(total / pageSize)

  const pushSearch = useCallback(
    debounce((q: string) => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (q) params.set('search', q)
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 350),
    [pathname, router]
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchVal(e.target.value)
    pushSearch(e.target.value)
  }

  function goPage(p: number) {
    startTransition(() => {
      const params = new URLSearchParams()
      if (searchVal) params.set('search', searchVal)
      params.set('page', String(p))
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const columns = [
    {
      key: 'number',
      header: '#',
      className: 'font-mono text-xs text-foreground/50 w-28',
      render: (row: VoucherRow) => (
        <Link href={`${baseHref}/${row.id}`} className="hover:text-teal transition-colors duration-150 flex items-center gap-1 group">
          <span className="font-mono text-xs">{row.number}</span>
          <ExternalLink size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" />
        </Link>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      className: 'text-foreground/50 text-xs',
      render: (row: VoucherRow) => formatDate(row.date),
    },
    {
      key: 'party',
      header: 'Party',
      render: (row: VoucherRow) => (
        <span className={row.partyName ? 'text-foreground/80' : 'text-foreground/25 italic'}>
          {row.partyName ?? 'N/A'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Description',
      className: 'text-foreground/40 max-w-[200px] truncate',
      render: (row: VoucherRow) => (
        <span className="truncate block max-w-[200px]">{row.notes ?? '—'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: VoucherRow) => (
        <StatusBadge
          label={getVoucherTypeLabel(row.type, isSimple)}
          variant={getVoucherStatusVariant(row.type)}
          dot
        />
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row: VoucherRow) => (
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {formatCurrency(row.amount, currency)}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
          <input
            value={searchVal}
            onChange={handleSearch}
            placeholder="Search by number, party, notes…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-foreground/5 border border-border/8 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-teal/40 focus:bg-teal/3 transition-all duration-200"
          />
          {isPending && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-border/20 border-t-teal rounded-full animate-spin" />
          )}
        </div>
        <div className="text-xs text-foreground/30 hidden sm:block">
          {total} result{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={vouchers}
        keyExtractor={(r) => r.id}
        emptyTitle={`No ${getVoucherTypeLabel(voucherType, isSimple).toLowerCase()} found`}
        emptyDescription={search ? `No results for "${search}"` : 'Start by creating your first transaction.'}
        emptyAction={
          <Link
            href={`${baseHref}/new`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200"
          >
            Create first transaction
          </Link>
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-foreground/30">
            Page {page} of {totalPages} · {total} records
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage(page - 1)}
              disabled={page <= 1 || isPending}
              className="p-2 rounded-lg border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  disabled={isPending}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                    p === page
                      ? 'bg-teal text-navy font-bold'
                      : 'border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15'
                  }`}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => goPage(page + 1)}
              disabled={page >= totalPages || isPending}
              className="p-2 rounded-lg border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}