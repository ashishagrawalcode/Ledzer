'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { usePreferencesStore } from '@/store/usePreferencesStore'

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
  currency, fromDate, toDate, businessName,
}: PnLClientProps) {
  const router = useRouter()
  const [from, setFrom] = useState(fromDate.split('T')[0])
  const [to, setTo] = useState(toDate.split('T')[0])
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const isSimple = terminologyMode === 'simple'
  const isProfit = netProfit >= 0

  function applyFilter() {
    router.push(`/reports/pnl?from=${from}&to=${to}`)
  }

  const fmt = (v: number) => formatCurrency(v, currency)

  return (
    <div className="space-y-5">
      {/* Date filter */}
      <div className="glass rounded-2xl border border-border/5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-foreground/30 uppercase tracking-wider mb-1.5">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-lg bg-foreground/5 border border-border/10 text-foreground text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-foreground/30 uppercase tracking-wider mb-1.5">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-lg bg-foreground/5 border border-border/10 text-foreground text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" />
          </div>
          <button onClick={applyFilter}
            className="px-4 py-2 rounded-lg bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow">
            Apply
          </button>
          <button onClick={() => window.print()}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg border border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20 text-sm transition-all duration-200">
            <Download size={14} />Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isSimple ? 'Total Earnings' : 'Gross Income', value: totalIncome, color: 'text-teal', bg: 'bg-teal/8 border-teal/15' },
          { label: isSimple ? 'Total Spending' : 'Total Expenses', value: totalExpenses, color: 'text-red-400', bg: 'bg-red-400/8 border-red-400/15' },
          { label: isSimple ? 'Final Profit' : 'Net Profit / Loss', value: Math.abs(netProfit), color: isProfit ? 'text-green-400' : 'text-red-400', bg: isProfit ? 'bg-green-400/8 border-green-400/15' : 'bg-red-400/8 border-red-400/15' },
        ].map((card, i) => (
          <div key={i} className={`glass rounded-2xl p-5 border ${card.bg}`}>
            <p className="text-xs text-foreground/40 mb-2">{card.label}</p>
            <p className={`font-mono text-lg sm:text-2xl font-bold tabular-nums ${card.color} ${card.value === 0 ? '!text-foreground/25' : ''}`}>
              {card.value === 0 ? 'N/A' : (i === 2 && !isProfit ? '(' + fmt(card.value) + ')' : fmt(card.value))}
            </p>
          </div>
        ))}
      </div>

      {/* P&L Statement */}
      <div className="glass rounded-2xl border border-border/5 overflow-hidden">
        {/* Income */}
        <div className="border-b border-border/5">
          <div className="flex items-center justify-between px-6 py-4 bg-teal/3">
            <div className="flex items-center gap-2">
              <TrendingUp size={15} className="text-teal" />
              <span className="font-semibold text-foreground text-sm">{isSimple ? 'Money Earned' : 'Income'}</span>
            </div>
            <span className={`font-mono text-sm font-bold tabular-nums ${totalIncome > 0 ? 'text-teal' : 'text-foreground/25'}`}>
              {totalIncome > 0 ? fmt(totalIncome) : 'N/A'}
            </span>
          </div>
          {incomeAccounts.length === 0 ? (
            <div className="px-6 py-4 text-sm text-foreground/25 italic">No income recorded for this period</div>
          ) : (
            incomeAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-foreground/[0.02] transition-colors" style={{ minHeight: '56px' }}>
                <span className="text-sm text-foreground/60">{acc.name}</span>
                <span className="font-mono text-sm text-foreground/80 tabular-nums">{fmt(acc.balance)}</span>
              </div>
            ))
          )}
        </div>

        {/* Expenses */}
        <div className="border-b border-border/5">
          <div className="flex items-center justify-between px-6 py-4 bg-red-400/3">
            <div className="flex items-center gap-2">
              <TrendingDown size={15} className="text-red-400" />
              <span className="font-semibold text-foreground text-sm">{isSimple ? 'Money Spent' : 'Expenses'}</span>
            </div>
            <span className={`font-mono text-sm font-bold tabular-nums ${totalExpenses > 0 ? 'text-red-400' : 'text-foreground/25'}`}>
              {totalExpenses > 0 ? fmt(totalExpenses) : 'N/A'}
            </span>
          </div>
          {expenseAccounts.length === 0 ? (
            <div className="px-6 py-4 text-sm text-foreground/25 italic">No expenses recorded for this period</div>
          ) : (
            expenseAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-foreground/[0.02] transition-colors" style={{ minHeight: '56px' }}>
                <span className="text-sm text-foreground/60">{acc.name}</span>
                <span className="font-mono text-sm text-foreground/80 tabular-nums">{fmt(acc.balance)}</span>
              </div>
            ))
          )}
        </div>

        {/* Net P&L */}
        <div className={`flex items-center justify-between px-6 py-5 ${isProfit ? 'bg-green-400/5' : 'bg-red-400/5'}`}>
          <span className="font-display font-bold text-foreground">
            {isSimple ? 'Final Profit / Loss' : 'Net Profit / (Loss)'}
          </span>
          <span className={`font-mono text-xl font-bold tabular-nums ${netProfit === 0 ? 'text-foreground/25' : isProfit ? 'text-green-400' : 'text-red-400'}`}>
            {netProfit === 0 ? 'N/A' : (isProfit ? fmt(netProfit) : `(${fmt(Math.abs(netProfit))})`)}
          </span>
        </div>
      </div>
    </div>
  )
}