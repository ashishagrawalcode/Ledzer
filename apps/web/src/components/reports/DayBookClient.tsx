'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ChevronDown, ChevronUp, Download } from 'lucide-react'
import { formatDate, formatCurrency, getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant, getVoucherTypeLabel } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'

interface VoucherRow {
  id: string; number: string; type: string; date: Date; notes: string | null
  totalDebit: number
  entries: { ledgerName: string; ledgerGroup: string; type: string; amount: number }[]
}

export function DayBookClient({ vouchers, currency, selectedDate, totalForDay }: {
  vouchers: VoucherRow[]; currency: string; selectedDate: string; totalForDay: number
}) {
  const router = useRouter()
  const [date, setDate] = useState(selectedDate.split('T')[0])
  const [expanded, setExpanded] = useState<string | null>(null)
  const isSimple = usePreferencesStore((s) => s.terminologyMode) === 'simple'
  const fmt = (v: number) => formatCurrency(v, currency)

  return (
    <div className="space-y-4">
      {/* Date picker + export */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="settings-label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="settings-input w-auto" />
        </div>
        <button onClick={() => router.push(`/reports/daybook?date=${date}`)}
          className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow">
          View
        </button>
        <button onClick={() => window.print()}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm transition-all">
          <Download size={14} />Export
        </button>
      </div>

      {/* Summary bar */}
      <div className="bg-card border border-border rounded-xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(selectedDate))} · {vouchers.length} transaction{vouchers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Day Total</p>
          <p className={`font-mono text-lg font-bold tabular-nums ${totalForDay > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
            {totalForDay > 0 ? fmt(totalForDay) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Voucher list */}
      {vouchers.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-muted-foreground text-sm">No transactions on {formatDate(new Date(selectedDate))}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="divide-y divide-border/40">
            {vouchers.map((v) => (
              <div key={v.id}>
                {/* Row */}
                <button
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors text-left"
                  style={{ minHeight: '56px' }}
                  onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <StatusBadge label={getVoucherPrefix(v.type)} variant={getVoucherStatusVariant(v.type)} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {v.notes ?? v.number}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {v.number} · {getVoucherTypeLabel(v.type, isSimple)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                    <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                      {v.totalDebit > 0 ? fmt(v.totalDebit) : 'N/A'}
                    </span>
                    {expanded === v.id ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded entries */}
                {expanded === v.id && (
                  <div className="px-6 pb-4 bg-accent/30 animate-fade-in">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">Ledger</th>
                          <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">Group</th>
                          <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">Dr</th>
                          <th className="text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-2">Cr</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {v.entries.map((e, i) => (
                          <tr key={i}>
                            <td className="py-2 text-foreground">{e.ledgerName}</td>
                            <td className="py-2 text-muted-foreground text-xs">{e.ledgerGroup}</td>
                            <td className="py-2 text-right font-mono text-primary">{e.type === 'DEBIT' ? fmt(e.amount) : '—'}</td>
                            <td className="py-2 text-right font-mono text-red-500">{e.type === 'CREDIT' ? fmt(e.amount) : '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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