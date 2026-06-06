'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter, CalendarDays } from 'lucide-react'
import { formatDate, formatCurrency, getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant, getVoucherTypeLabel } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { cn } from '@/lib/utils'

interface VoucherRow {
  id: string
  number: string
  type: string
  date: Date
  notes: string | null
  totalDebit: number
  entries: { ledgerName: string; ledgerGroup: string; type: string; amount: number }[]
}

interface DayBookClientProps {
  vouchers: VoucherRow[]
  currency: string
  selectedDate: string
  totalForDay: number
}

export function DayBookClient({ vouchers, currency, selectedDate, totalForDay }: DayBookClientProps) {
  const router = useRouter()
  const [date, setDate]         = useState(selectedDate.split('T')[0])
  const [expanded, setExpanded] = useState<string | null>(null)
  const isSimple = usePreferencesStore((s) => s.terminologyMode) === 'simple'
  const fmt = (v: number) => formatCurrency(v, currency)

  return (
    <div className="space-y-4">

      {/* ── Date picker ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap w-7">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button
            onClick={() => router.push(`/reports/daybook?date=${date}`)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-glow sm:w-auto w-full"
          >
            <Filter size={12} />View
          </button>
        </div>
      </div>

      {/* ── Summary bar ── */}
      <div className="bg-card border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <CalendarDays size={15} className="text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground truncate">
            {formatDate(new Date(selectedDate))}
            <span className="ml-2 text-xs">
              · {vouchers.length} transaction{vouchers.length !== 1 ? 's' : ''}
            </span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Day Total</p>
          <p className={cn(
            'font-mono text-lg font-bold tabular-nums',
            totalForDay > 0 ? 'text-primary' : 'text-muted-foreground'
          )}>
            {totalForDay > 0 ? fmt(totalForDay) : 'N/A'}
          </p>
        </div>
      </div>

      {/* ── Voucher list ── */}
      {vouchers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
          <CalendarDays size={24} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            No transactions on {formatDate(new Date(selectedDate))}
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border/40">
            {vouchers.map((v) => (
              <div key={v.id}>
                {/* Row trigger */}
                <button
                  className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-accent/50 transition-colors text-left"
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusBadge
                      label={getVoucherPrefix(v.type)}
                      variant={getVoucherStatusVariant(v.type)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {v.notes ?? v.number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v.number} · {getVoucherTypeLabel(v.type, isSimple)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {v.totalDebit > 0 ? fmt(v.totalDebit) : 'N/A'}
                    </span>
                    {expanded === v.id
                      ? <ChevronUp size={13} className="text-muted-foreground" />
                      : <ChevronDown size={13} className="text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* Expanded double-entry detail */}
                {expanded === v.id && (
                  <div className="px-4 sm:px-6 pb-4 bg-accent/20 border-t border-border/40">
                    <div className="overflow-x-auto -mx-1">
                      <table className="w-full text-sm mt-3 min-w-[360px]">
                        <thead>
                          <tr className="border-b border-border">
                            {['Ledger', 'Group', 'Dr', 'Cr'].map((h, i) => (
                              <th
                                key={h}
                                className={cn(
                                  'pb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider',
                                  i >= 2 ? 'text-right' : 'text-left'
                                )}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          {v.entries.map((e, i) => (
                            <tr key={i} className="hover:bg-accent/30 transition-colors">
                              <td className="py-2.5 pr-3 text-foreground text-sm">{e.ledgerName}</td>
                              <td className="py-2.5 pr-3 text-muted-foreground text-xs">{e.ledgerGroup}</td>
                              <td className="py-2.5 text-right font-mono text-xs text-green-600 dark:text-green-400">
                                {e.type === 'DEBIT' ? fmt(e.amount) : '—'}
                              </td>
                              <td className="py-2.5 text-right font-mono text-xs text-red-600 dark:text-red-400">
                                {e.type === 'CREDIT' ? fmt(e.amount) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}