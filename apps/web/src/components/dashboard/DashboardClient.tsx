'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary } from '@/lib/dictionary'
import { formatCurrency, formatCurrencyCompact, formatDate, getVoucherPrefix } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import Link from 'next/link'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

const DashboardChart = dynamic(
  () => import('@/components/dashboard/DashboardChart').then((mod) => mod.DashboardChart),
  { 
    ssr: false, 
    loading: () => <div className="h-48 w-full bg-foreground/[0.02] rounded-xl animate-pulse" /> 
  }
)

interface DashboardData {
  businessName: string
  currency: string
  summary: {
    cashAvailable: number | null
    pendingReceivables: number | null
    pendingPayables: number | null
    monthlyIncome: number | null
    monthlyExpenses: number | null
    monthlyProfit: number | null
  }
  recentVouchers: {
    id: string
    number: string
    type: string
    date: Date
    notes: string | null
    amount: number
    party: string | null
  }[]
  userName: string | null
}

interface DashboardClientProps {
  data: DashboardData
}

const VOUCHER_TYPE_COLORS: Record<string, string> = {
  SALES: 'text-teal',
  RECEIPT: 'text-green-400',
  PURCHASE: 'text-red-400',
  PAYMENT: 'text-orange-400',
  JOURNAL: 'text-blue-400',
  CONTRA: 'text-purple-400',
}

const VOUCHER_TYPE_BG: Record<string, string> = {
  SALES: 'bg-teal/10 border-teal/20',
  RECEIPT: 'bg-green-400/10 border-green-400/20',
  PURCHASE: 'bg-red-400/10 border-red-400/20',
  PAYMENT: 'bg-orange-400/10 border-orange-400/20',
  JOURNAL: 'bg-blue-400/10 border-blue-400/20',
  CONTRA: 'bg-purple-400/10 border-purple-400/20',
}

// Greeting based on time
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardClient({ data }: DashboardClientProps) {
  // 1. Initialize mounting state to block server-side SVG generation
  const [isMounted, setIsMounted] = useState(false)
  
  // 2. Call all hooks at the top level
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const dict = getDictionary(terminologyMode)
  const { summary, currency } = data

  // 3. Return the skeleton until the client is fully hydrated
  if (!isMounted) {
    return <DashboardSkeleton />
  }

  const fmt = (v: number | null) => v !== null ? formatCurrencyCompact(v, currency) : 'N/A'
  const fmtFull = (v: number | null) => v !== null ? formatCurrency(v, currency) : 'N/A'

  const insightCards = [
    {
      label: dict.cashAvailable,
      value: fmt(summary.cashAvailable),
      fullValue: fmtFull(summary.cashAvailable),
      icon: Wallet,
      color: 'text-teal',
      bg: 'bg-teal/8',
      border: 'border-teal/15',
      trend: null,
    },
    {
      label: dict.accountsReceivable,
      value: fmt(summary.pendingReceivables),
      fullValue: fmtFull(summary.pendingReceivables),
      icon: ArrowUpRight,
      color: 'text-blue-400',
      bg: 'bg-blue-400/8',
      border: 'border-blue-400/15',
      trend: null,
    },
    {
      label: dict.accountsPayable,
      value: fmt(summary.pendingPayables),
      fullValue: fmtFull(summary.pendingPayables),
      icon: ArrowDownRight,
      color: 'text-orange-400',
      bg: 'bg-orange-400/8',
      border: 'border-orange-400/15',
      trend: null,
    },
    {
      label: dict.profitAndLoss,
      value: fmt(summary.monthlyProfit),
      fullValue: fmtFull(summary.monthlyProfit),
      icon: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? TrendingUp : TrendingDown,
      color: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'text-green-400' : 'text-red-400',
      bg: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'bg-green-400/8' : 'bg-red-400/8',
      border: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'border-green-400/15' : 'border-red-400/15',
      trend: 'This Month',
    },
  ]

  // Chart placeholder data — actual data would come from monthly aggregation API
  const chartData = [
    { month: 'Jan', income: 0, expenses: 0 },
    { month: 'Feb', income: 0, expenses: 0 },
    { month: 'Mar', income: 0, expenses: 0 },
    { month: 'Apr', income: 0, expenses: 0 },
    { month: 'May', income: 0, expenses: 0 },
    { month: 'Jun', income: summary.monthlyIncome ?? 0, expenses: summary.monthlyExpenses ?? 0 },
  ]

  const hasChartData = chartData.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}{data.userName ? `, ${data.userName.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-foreground/40 text-sm mt-1">{data.businessName} · Today, {formatDate(new Date())}</p>
        </div>
        <Link
          href="/invoices"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow hover:shadow-glow-md"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {insightCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={i}
              className={`glass rounded-2xl p-5 border ${card.border} hover:scale-[1.02] transition-all duration-200 group cursor-default`}
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-medium text-foreground/40 leading-tight pr-2">{card.label}</p>
                <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={15} className={card.color} />
                </div>
              </div>
              <p className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${card.value === 'N/A' ? 'text-foreground/25' : 'text-foreground'}`}>
                {card.value}
              </p>
              {card.trend && (
                <p className="text-xs text-foreground/30 mt-1">{card.trend}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-border/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Income vs Expenses</h3>
              <p className="text-xs text-foreground/30 mt-0.5">Current financial year</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground/40">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-teal/60" />Income</div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-blue-400/40" />Expenses</div>
            </div>
          </div>

          {!hasChartData ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-foreground/3 flex items-center justify-center">
                <TrendingUp size={20} className="text-foreground/15" />
              </div>
              <p className="text-sm text-foreground/25">No transactions yet</p>
              <p className="text-xs text-foreground/15">Start creating invoices to see your chart</p>
            </div>
          ) : (
            <div className="h-48">
              <DashboardChart data={chartData} currency={currency} />
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="glass rounded-2xl p-6 border border-border/5 flex flex-col gap-4">
          <h3 className="font-semibold text-foreground">This Month</h3>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/40">Total Income</span>
              <span className={`font-mono text-sm font-semibold ${summary.monthlyIncome !== null ? 'text-teal' : 'text-foreground/25'}`}>
                {fmtFull(summary.monthlyIncome)}
              </span>
            </div>
            <div className="w-full h-px bg-foreground/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/40">Total Expenses</span>
              <span className={`font-mono text-sm font-semibold ${summary.monthlyExpenses !== null ? 'text-red-400' : 'text-foreground/25'}`}>
                {fmtFull(summary.monthlyExpenses)}
              </span>
            </div>
            <div className="w-full h-px bg-foreground/5" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground/40 font-medium">{dict.netProfit}</span>
              <span className={`font-mono text-sm font-bold ${
                summary.monthlyProfit === null ? 'text-foreground/25'
                : summary.monthlyProfit >= 0 ? 'text-green-400'
                : 'text-red-400'
              }`}>
                {fmtFull(summary.monthlyProfit)}
              </span>
            </div>
          </div>
          <Link
            href="/reports/pnl"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border/8 text-xs text-foreground/50 hover:text-foreground hover:border-border/15 transition-all duration-200"
          >
            View Full Report
            <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass rounded-2xl border border-border/5 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/5">
          <h3 className="font-semibold text-foreground">{dict.recentActivity}</h3>
          <Link href="/transactions/sales" className="text-xs text-teal/70 hover:text-teal transition-colors duration-200">
            View all →
          </Link>
        </div>

        {data.recentVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-foreground/3 flex items-center justify-center">
              <Clock size={20} className="text-foreground/15" />
            </div>
            <p className="text-sm text-foreground/25">No transactions yet</p>
            <Link
              href="/invoices"
              className="text-xs text-teal/60 hover:text-teal transition-colors duration-200 underline underline-offset-2"
            >
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/3">
            {data.recentVouchers.map((voucher) => {
              const prefix = getVoucherPrefix(voucher.type)
              const colorClass = VOUCHER_TYPE_COLORS[voucher.type] ?? 'text-foreground/60'
              const bgClass = VOUCHER_TYPE_BG[voucher.type] ?? 'bg-foreground/5 border-border/10'
              const isIncome = voucher.type === 'SALES' || voucher.type === 'RECEIPT'

              return (
                <div
                  key={voucher.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-foreground/[0.02] transition-colors duration-150 group"
                  style={{ minHeight: '56px' }}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex-shrink-0 px-2 py-1 rounded-lg border text-[10px] font-mono font-semibold ${bgClass} ${colorClass}`}>
                      {prefix}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {voucher.party ?? voucher.notes ?? voucher.number}
                      </p>
                      <p className="text-xs text-foreground/30 mt-0.5">
                        {voucher.number} · {formatDate(voucher.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4">
                    <p className={`font-mono text-sm font-semibold tabular-nums ${isIncome ? 'text-teal' : 'text-red-400'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(voucher.amount, currency)}
                    </p>
                    <p className="text-[10px] text-foreground/25 mt-0.5 capitalize">{voucher.type.toLowerCase()}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}