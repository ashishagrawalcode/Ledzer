'use client'

import { formatCurrency } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getGroupLabel } from '@/lib/dictionary'
import { Download } from 'lucide-react'

interface LedgerRow { id: string; name: string; group: string; isSystem: boolean; balance: number }
interface Props {
  grouped: { ASSET: LedgerRow[]; LIABILITY: LedgerRow[]; EQUITY: LedgerRow[]; INCOME: LedgerRow[]; EXPENSE: LedgerRow[] }
  currency: string
  businessName: string
}

const GROUP_STYLE: Record<string, { label: string; sign: 1 | -1; color: string }> = {
  ASSET:     { label: 'ASSET',     sign:  1, color: 'text-blue-500'   },
  LIABILITY: { label: 'LIABILITY', sign: -1, color: 'text-orange-500' },
  EQUITY:    { label: 'EQUITY',    sign: -1, color: 'text-purple-500' },
  INCOME:    { label: 'INCOME',    sign: -1, color: 'text-primary'    },
  EXPENSE:   { label: 'EXPENSE',   sign:  1, color: 'text-red-500'    },
}

function SectionTable({ title, rows, currency, color }: {
  title: string; rows: LedgerRow[]; currency: string; color: string
}) {
  const total = rows.reduce((s, r) => s + r.balance, 0)
  const fmt = (v: number) => formatCurrency(Math.abs(v), currency)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-accent/30">
        <span className={`text-sm font-bold ${color}`}>{title}</span>
        <span className={`font-mono text-sm font-bold tabular-nums ${total !== 0 ? color : 'text-muted-foreground'}`}>
          {total !== 0 ? fmt(total) : 'Nil'}
        </span>
      </div>
      {rows.length === 0 ? (
        <div className="px-6 py-4 text-sm text-muted-foreground italic">No accounts</div>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-accent/40 transition-colors" style={{ minHeight: '48px' }}>
              <span className="text-sm text-foreground">{row.name}</span>
              <span className={`font-mono text-sm tabular-nums ${row.balance !== 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {row.balance !== 0 ? fmt(row.balance) : 'Nil'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function BalanceSheetClient({ grouped, currency, businessName }: Props) {
  const mode = usePreferencesStore((s) => s.terminologyMode)
  const fmt = (v: number) => formatCurrency(Math.abs(v), currency)

  const totalAssets      = grouped.ASSET.reduce((s, r) => s + r.balance, 0)
  const totalLiabilities = grouped.LIABILITY.reduce((s, r) => s + r.balance, 0)
  const totalEquity      = grouped.EQUITY.reduce((s, r) => s + r.balance, 0)

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className="flex justify-end">
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm transition-all">
          <Download size={14} />Export PDF
        </button>
      </div>

      {/* Totals summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: getGroupLabel('ASSET', mode),     value: totalAssets,      color: 'text-blue-500'    },
          { label: getGroupLabel('LIABILITY', mode), value: totalLiabilities, color: 'text-orange-500'  },
          { label: getGroupLabel('EQUITY', mode),    value: totalEquity,      color: 'text-purple-500'  },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{s.label}</p>
            <p className={`font-mono text-xl font-bold tabular-nums ${s.value !== 0 ? s.color : 'text-muted-foreground'}`}>
              {s.value !== 0 ? fmt(s.value) : 'N/A'}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Assets Side</p>
          <SectionTable title="Assets" rows={grouped.ASSET} currency={currency} color="text-blue-500" />
          <SectionTable title="Expenses" rows={grouped.EXPENSE} currency={currency} color="text-red-500" />
        </div>
        <div className="space-y-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Liabilities Side</p>
          <SectionTable title="Liabilities" rows={grouped.LIABILITY} currency={currency} color="text-orange-500" />
          <SectionTable title="Equity / Capital" rows={grouped.EQUITY} currency={currency} color="text-purple-500" />
          <SectionTable title="Income" rows={grouped.INCOME} currency={currency} color="text-primary" />
        </div>
      </div>
    </div>
  )
}