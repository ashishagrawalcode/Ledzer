'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Filter, LayoutGrid, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartPoint { month: string; income: number; expense: number; net: number }
interface Category   { name: string; type: 'income' | 'expense'; amount: number }

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

function fmtCompact(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 0, notation: 'compact',
  }).format(amount)
}

function fmtFull(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount)
}

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-xl shadow-xl p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground text-xs capitalize">{p.dataKey}</span>
          </div>
          <span className="font-medium text-foreground text-xs">{fmtCompact(p.value, currency)}</span>
        </div>
      ))}
    </div>
  )
}

export function CashFlowClient({
  chartData, totalIncome, totalExpense, netCashFlow, categories, currency, from, to,
}: CashFlowClientProps) {
  const router = useRouter()
  const [chartMode, setChartMode] = useState<ChartMode>('area')
  const [fromVal, setFromVal]     = useState(from)
  const [toVal, setToVal]         = useState(to)
  const isPositive = netCashFlow >= 0

  function applyFilter() {
    router.push(`/reports/cashflow?from=${fromVal}&to=${toVal}`)
  }

  return (
    <div className="space-y-4">

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownRight size={15} className="text-green-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Income</p>
          </div>
          <p className={`font-mono text-xl font-bold tabular-nums ${totalIncome > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {totalIncome > 0 ? fmtFull(totalIncome, currency) : 'N/A'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight size={15} className="text-red-500" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</p>
          </div>
          <p className={`font-mono text-xl font-bold tabular-nums ${totalExpense > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {totalExpense > 0 ? fmtFull(totalExpense, currency) : 'N/A'}
          </p>
        </div>

        <div className={cn(
          'rounded-2xl p-5 border',
          isPositive ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isPositive
              ? <TrendingUp size={15} className="text-green-500" />
              : <TrendingDown size={15} className="text-red-500" />}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Net Cash Flow</p>
          </div>
          <p className={cn('font-mono text-xl font-bold tabular-nums',
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
            {netCashFlow !== 0 ? `${isPositive ? '+' : ''}${fmtFull(netCashFlow, currency)}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* ── Chart Panel ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">

        {/* Toolbar — stacked on mobile, inline on desktop */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground text-sm">Monthly Overview</p>
            {/* Chart mode toggle */}
            <div className="flex items-center gap-1 bg-accent border border-border rounded-lg p-0.5">
              <button
                onClick={() => setChartMode('area')}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-150',
                  chartMode === 'area' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Area chart"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={cn(
                  'p-1.5 rounded-md transition-all duration-150',
                  chartMode === 'bar' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                )}
                title="Bar chart"
              >
                <BarChart2 size={14} />
              </button>
            </div>
          </div>

          {/* Date filter — always stacks cleanly */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[11px] text-muted-foreground whitespace-nowrap w-7">From</label>
              <input
                type="date"
                value={fromVal}
                onChange={(e) => setFromVal(e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <label className="text-[11px] text-muted-foreground whitespace-nowrap w-7">To</label>
              <input
                type="date"
                value={toVal}
                onChange={(e) => setToVal(e.target.value)}
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

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <TrendingUp size={24} className="text-muted-foreground/25" />
            <p className="text-sm text-muted-foreground/50">No transactions in this period</p>
          </div>
        ) : (
          <div className="h-56 sm:h-64 w-full overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cfIncGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}   />
                    </linearGradient>
                    <linearGradient id="cfExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.45 }}
                    axisLine={false} tickLine={false}
                    // On mobile, only show every 2nd label
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.45 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmtCompact(v, currency)}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, opacity: 0.6, paddingTop: '8px' }}
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Area type="monotone" dataKey="income"  stroke="#22c55e" strokeWidth={2} fill="url(#cfIncGrad)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#cfExpGrad)" />
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.45 }}
                    axisLine={false} tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.45 }}
                    axisLine={false} tickLine={false}
                    tickFormatter={(v) => fmtCompact(v, currency)}
                    width={48}
                  />
                  <Tooltip content={<CustomTooltip currency={currency} />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, opacity: 0.6, paddingTop: '8px' }}
                    formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <Bar dataKey="income"  fill="#22c55e" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Category Breakdown ── */}
      {categories.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-foreground text-sm">Top Categories</p>
          <div className="space-y-3">
            {categories.map((cat) => {
              const maxAmt = categories[0]?.amount ?? 1
              const pct    = Math.round((cat.amount / maxAmt) * 100)
              return (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('w-2 h-2 rounded-full flex-shrink-0', cat.type === 'income' ? 'bg-green-500' : 'bg-red-500')} />
                      <span className="text-foreground font-medium truncate">{cat.name}</span>
                    </div>
                    <span className="text-muted-foreground font-mono flex-shrink-0">
                      {fmtFull(cat.amount, currency)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-accent rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', cat.type === 'income' ? 'bg-green-500' : 'bg-red-500')}
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