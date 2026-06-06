'use client'

import { formatCurrency } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getGroupLabel } from '@/lib/dictionary'
import { cn } from '@/lib/utils'

interface LedgerRow { id: string; name: string; group: string; isSystem: boolean; balance: number }

interface Props {
  grouped: {
    ASSET: LedgerRow[]
    LIABILITY: LedgerRow[]
    EQUITY: LedgerRow[]
    INCOME: LedgerRow[]
    EXPENSE: LedgerRow[]
  }
  currency: string
  businessName: string
}

function SectionTable({
  title, rows, currency, color, emptyLabel,
}: {
  title: string
  rows: LedgerRow[]
  currency: string
  color: string
  emptyLabel?: string
}) {
  const total = rows.reduce((s, r) => s + r.balance, 0)
  const fmt   = (v: number) => formatCurrency(Math.abs(v), currency)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-accent/30">
        <span className={cn('text-sm font-bold', color)}>{title}</span>
        <span className={cn('font-mono text-sm font-bold tabular-nums', total !== 0 ? color : 'text-muted-foreground')}>
          {total !== 0 ? fmt(total) : 'Nil'}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-4 text-sm text-muted-foreground italic">
          {emptyLabel ?? 'No accounts'}
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors"
            >
              <span className="text-sm text-foreground min-w-0 truncate pr-4">{row.name}</span>
              <span className={cn(
                'font-mono text-sm tabular-nums flex-shrink-0',
                row.balance !== 0 ? 'text-foreground' : 'text-muted-foreground'
              )}>
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
  const fmt  = (v: number) => formatCurrency(Math.abs(v), currency)

  const totalAssets      = grouped.ASSET.reduce((s, r) => s + r.balance, 0)
  const totalLiabilities = grouped.LIABILITY.reduce((s, r) => s + r.balance, 0)
  const totalEquity      = grouped.EQUITY.reduce((s, r) => s + r.balance, 0)

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01

  return (
    <div className="space-y-4">

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: getGroupLabel('ASSET', mode),     value: totalAssets,      color: 'text-blue-500',   border: 'border-blue-500/20',   bg: 'bg-blue-500/5'   },
          { label: getGroupLabel('LIABILITY', mode), value: totalLiabilities, color: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
          { label: getGroupLabel('EQUITY', mode),    value: totalEquity,      color: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-2xl p-5 border', s.bg, s.border)}>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-medium">{s.label}</p>
            <p className={cn('font-mono text-xl font-bold tabular-nums', s.value !== 0 ? s.color : 'text-muted-foreground')}>
              {s.value !== 0 ? fmt(s.value) : 'N/A'}
            </p>
          </div>
        ))}
      </div>

      {/* Balanced indicator */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium',
        isBalanced
          ? 'bg-green-500/5 border-green-500/20 text-green-600 dark:text-green-400'
          : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400'
      )}>
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isBalanced ? 'bg-green-500' : 'bg-amber-500')} />
        {isBalanced
          ? 'Balance sheet is balanced — Assets = Liabilities + Equity'
          : 'Balance sheet does not balance — check for missing entries'}
      </div>

      {/* ── Two-column layout on desktop, stacked on mobile ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets side */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            Assets Side
          </p>
          <SectionTable
            title="Assets"
            rows={grouped.ASSET}
            currency={currency}
            color="text-blue-500"
            emptyLabel="No asset accounts"
          />
          <SectionTable
            title="Expenses"
            rows={grouped.EXPENSE}
            currency={currency}
            color="text-red-500"
            emptyLabel="No expense accounts"
          />
        </div>

        {/* Liabilities side */}
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
            Liabilities Side
          </p>
          <SectionTable
            title="Liabilities"
            rows={grouped.LIABILITY}
            currency={currency}
            color="text-orange-500"
            emptyLabel="No liability accounts"
          />
          <SectionTable
            title="Equity / Capital"
            rows={grouped.EQUITY}
            currency={currency}
            color="text-purple-500"
            emptyLabel="No equity accounts"
          />
          <SectionTable
            title="Income"
            rows={grouped.INCOME}
            currency={currency}
            color="text-primary"
            emptyLabel="No income accounts"
          />
        </div>
      </div>
    </div>
  )
}