'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartPoint {
  month: string
  income: number
  expense: number
  net: number
}

interface Category {
  name: string
  type: 'income' | 'expense'
  amount: number
}

interface CashFlowClientProps {
  chartData: ChartPoint[]
  totalIncome: number
  totalExpense: number
  netCashFlow: number
  categories: Category[]
  currency: string
  from: string
  to: string
}

type ChartMode = 'area' | 'bar'

function fmtCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0, notation: 'compact',
  }).format(amount)
}

function fmtFull(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount)
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl p-3.5 text-sm min-w-[180px]">
      <p className="font-semibold text-foreground mb-2.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground text-xs capitalize">{p.dataKey}</span>
          </div>
          <span className="font-medium text-foreground text-xs">
            {fmtCurrency(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function CashFlowClient({
  chartData, totalIncome, totalExpense, netCashFlow, categories, currency, from, to
}: CashFlowClientProps) {
  const router = useRouter()
  const [chartMode, setChartMode] = useState<ChartMode>('area')
  const [fromVal, setFromVal] = useState(from)
  const [toVal, setToVal] = useState(to)

  function applyFilter() {
    router.push(`/reports/cashflow?from=${fromVal}&to=${toVal}`)
  }

  const isPositive = netCashFlow >= 0

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight size={16} className="text-green-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Income</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtFull(totalIncome, currency)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={16} className="text-red-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expense</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtFull(totalExpense, currency)}</p>
        </div>
        <div className={cn(
          'rounded-2xl p-5 border',
          isPositive
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-red-500/5 border-red-500/20'
        )}>
          <div className="flex items-center gap-2 mb-1">
            {isPositive
              ? <TrendingUp size={16} className="text-green-500" />
              : <TrendingDown size={16} className="text-red-500" />
            }
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Cash Flow</p>
          </div>
          <p className={cn('text-2xl font-bold', isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
            {isPositive ? '+' : ''}{fmtFull(netCashFlow, currency)}
          </p>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <p className="font-semibold text-foreground text-sm">Monthly Overview</p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Date filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="settings-input py-1.5 text-xs w-36"
              />
              <span className="text-muted-foreground text-xs">to</span>
              <input
                type="date"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
                className="settings-input py-1.5 text-xs w-36"
              />
              <button
                onClick={applyFilter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all"
              >
                <Filter size={12} />Apply
              </button>
            </div>
            {/* Chart mode toggle */}
            <div className="flex items-center gap-1 bg-accent border border-border rounded-lg p-0.5">
              {(['area', 'bar'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 capitalize',
                    chartMode === m
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-muted-foreground text-sm">
            No transactions in this period.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmtCurrency(v, currency)} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend wrapperStyle={{ fontSize: 12, opacity: 0.7 }} />
                  <Area type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmtCurrency(v, currency)} />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend wrapperStyle={{ fontSize: 12, opacity: 0.7 }} />
                  <Bar dataKey="income" fill="#22c55e" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-foreground text-sm">Top Categories</p>
          <div className="space-y-2.5">
            {categories.map((cat) => {
              const maxAmount = categories[0]?.amount ?? 1
              const pct = Math.round((cat.amount / maxAmount) * 100)
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      )} />
                      <span className="text-foreground font-medium truncate max-w-[180px]">{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono">{fmtFull(cat.amount, currency)}</span>
                  </div>
                  <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}