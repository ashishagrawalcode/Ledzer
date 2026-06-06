'use client'

import { ArrowDownCircle, ArrowUpCircle, FileText, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePendingItems } from '@/hooks/usePendingItems'

type VoucherType = 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA'

interface Row {
  id: string
  number: string
  date: string
  party: string
  amount: number
  notes: string | null
  type: VoucherType
}

interface TransactionListSimpleProps {
  rows: Row[]
  currency: string
  emptyLabel: string
}

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount)
}

export function TransactionListSimple({ rows, currency, emptyLabel }: TransactionListSimpleProps) {
  // 1. Fetch pending items from IndexedDB
  const pendingItems = usePendingItems();

  if (rows.length === 0) {
    const isReceipt = emptyLabel === 'receipts'
    const Icon = isReceipt ? ArrowDownCircle : ArrowUpCircle
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-2xl">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 border border-border">
          <Icon size={24} className="text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground mb-1">No {emptyLabel} yet</p>
        <p className="text-sm text-muted-foreground">Create your first {emptyLabel.slice(0, -1)} to get started.</p>
      </div>
    )
  }

  const isReceipt = rows[0]?.type === 'RECEIPT'

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">No.</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isReceipt ? 'Received From' : 'Paid To'}
                </th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => {
                const isPending = pendingItems.some(p => p.data.number === row.number);
                return (
                  <tr key={row.id} className="hover:bg-accent/20 transition-colors">
                    <td className="px-5 py-4">
                      <span className={cn(
                        'font-mono text-xs px-2 py-1 rounded-lg flex items-center gap-2 w-fit',
                        isReceipt ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                      )}>
                        {row.number}
                        {isPending && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Syncing..." />}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{row.date}</td>
                    <td className="px-4 py-4 font-medium text-foreground">{row.party}</td>
                    <td className="px-4 py-4 text-muted-foreground text-xs max-w-[200px] truncate">{row.notes ?? '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={cn(
                        'font-semibold',
                        isReceipt ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                        {fmt(row.amount, currency)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {rows.map((row) => {
          const isPending = pendingItems.some(p => p.data.number === row.number);
          return (
            <div key={row.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className={cn(
                    'font-mono text-xs px-2 py-1 rounded-lg flex items-center gap-2 w-fit',
                    isReceipt ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
                  )}>
                    {row.number}
                    {isPending && <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" title="Syncing..." />}
                  </span>
                  <p className="font-medium text-foreground text-sm mt-1.5">{row.party}</p>
                  {row.notes && <p className="text-xs text-muted-foreground mt-0.5">{row.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={cn(
                    'font-bold text-sm',
                    isReceipt ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {fmt(row.amount, currency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.date}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}