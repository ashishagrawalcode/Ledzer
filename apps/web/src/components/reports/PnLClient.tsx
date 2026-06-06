'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { TrendingUp, TrendingDown, Filter } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { cn } from '@/lib/utils'

interface Account { id: string; name: string; balance: number }

interface PnLClientProps {
  incomeAccounts: Account[]
  expenseAccounts: Account[]
  totalIncome: number
  totalExpenses: number
  netProfit: number
  currency: string
  fromDate: string
  toDate: string
  businessName: string
}

export function PnLClient({
  incomeAccounts, expenseAccounts, totalIncome, totalExpenses, netProfit,
  currency, fromDate, toDate,
}: PnLClientProps) {
  const router = useRouter()
  const [from, setFrom] = useState(fromDate.split('T')[0])
  const [to, setTo]     = useState(toDate.split('T')[0])
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const isSimple = terminologyMode === 'simple'
  const isProfit = netProfit >= 0
  const fmt = (v: number) => formatCurrency(v, currency)

  function applyFilter() {
    router.push(`/reports/pnl?from=${from}&to=${to}`)
  }

  return (
    <div className="space-y-4">

      {/* ── Date filter ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap w-7">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <label className="text-[11px] text-muted-foreground whitespace-nowrap w-7">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button
            onClick={applyFilter}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-glow sm:w-auto w-full"
          >
            <Filter size={12} />Apply
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={15} className="text-green-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isSimple ? 'Total Earnings' : 'Gross Income'}
            </p>
          </div>
          <p className={cn(
            'font-mono text-xl font-bold tabular-nums',
            totalIncome > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {totalIncome > 0 ? fmt(totalIncome) : 'N/A'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={15} className="text-red-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isSimple ? 'Total Spending' : 'Total Expenses'}
            </p>
          </div>
          <p className={cn(
            'font-mono text-xl font-bold tabular-nums',
            totalExpenses > 0 ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {totalExpenses > 0 ? fmt(totalExpenses) : 'N/A'}
          </p>
        </div>

        <div className={cn(
          'rounded-2xl p-5 border',
          isProfit ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isProfit
              ? <TrendingUp size={15} className="text-green-500" />
              : <TrendingDown size={15} className="text-red-500" />}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {isSimple ? 'Final Profit' : 'Net Profit / Loss'}
            </p>
          </div>
          <p className={cn(
            'font-mono text-xl font-bold tabular-nums',
            netProfit === 0
              ? 'text-muted-foreground'
              : isProfit
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {netProfit === 0
              ? 'N/A'
              : isProfit
              ? fmt(netProfit)
              : `(${fmt(Math.abs(netProfit))})`}
          </p>
        </div>
      </div>

      {/* ── P&L Statement ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">

        {/* Income section */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-5 py-4 bg-green-500/5">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" />
              <span className="font-semibold text-foreground text-sm">
                {isSimple ? 'Money Earned' : 'Income'}
              </span>
            </div>
            <span className={cn(
              'font-mono text-sm font-bold tabular-nums',
              totalIncome > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
            )}>
              {totalIncome > 0 ? fmt(totalIncome) : 'N/A'}
            </span>
          </div>
          {incomeAccounts.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground italic">
              No income recorded for this period
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {incomeAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">{acc.name}</span>
                  <span className="font-mono text-sm text-foreground tabular-nums">{fmt(acc.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expense section */}
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-5 py-4 bg-red-500/5">
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-red-500" />
              <span className="font-semibold text-foreground text-sm">
                {isSimple ? 'Money Spent' : 'Expenses'}
              </span>
            </div>
            <span className={cn(
              'font-mono text-sm font-bold tabular-nums',
              totalExpenses > 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
            )}>
              {totalExpenses > 0 ? fmt(totalExpenses) : 'N/A'}
            </span>
          </div>
          {expenseAccounts.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground italic">
              No expenses recorded for this period
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {expenseAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-accent/40 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">{acc.name}</span>
                  <span className="font-mono text-sm text-foreground tabular-nums">{fmt(acc.balance)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Net row */}
        <div className={cn(
          'flex items-center justify-between px-5 py-5',
          isProfit ? 'bg-green-500/5' : 'bg-red-500/5'
        )}>
          <span className="font-semibold text-foreground">
            {isSimple ? 'Final Profit / Loss' : 'Net Profit / (Loss)'}
          </span>
          <span className={cn(
            'font-mono text-lg sm:text-xl font-bold tabular-nums',
            netProfit === 0
              ? 'text-muted-foreground'
              : isProfit
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}>
            {netProfit === 0
              ? 'N/A'
              : isProfit
              ? fmt(netProfit)
              : `(${fmt(Math.abs(netProfit))})`}
          </span>
        </div>
      </div>
    </div>
  )
}