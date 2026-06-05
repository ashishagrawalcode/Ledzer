import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getDictionary } from '@/lib/dictionary'
import { formatCurrency, formatCurrencyCompact, formatDate, getVoucherPrefix } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, Clock, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'

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
    id: string; number: string; type: string
    date: Date; notes: string | null; amount: number; party: string | null
  }[]
  userName: string | null
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const VOUCHER_COLOR: Record<string, string> = {
  SALES: 'text-primary', RECEIPT: 'text-green-500',
  PURCHASE: 'text-red-500', PAYMENT: 'text-orange-500',
  JOURNAL: 'text-blue-500', CONTRA: 'text-purple-500',
}
const VOUCHER_BADGE: Record<string, string> = {
  SALES:    'bg-primary/10 border-primary/20 text-primary',
  RECEIPT:  'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
  PURCHASE: 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400',
  PAYMENT:  'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
  JOURNAL:  'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
  CONTRA:   'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const dict = getDictionary(terminologyMode)
  const { summary, currency } = data
  const fmt  = (v: number | null) => v !== null ? formatCurrencyCompact(v, currency) : 'N/A'
  const fmtF = (v: number | null) => v !== null ? formatCurrency(v, currency) : 'N/A'

  const cards = [
    { label: dict.cashAvailable,     value: fmt(summary.cashAvailable),     icon: Wallet,         color: 'text-primary',                    ring: 'ring-primary/20',  bg: 'bg-primary/8' },
    { label: dict.accountsReceivable, value: fmt(summary.pendingReceivables), icon: ArrowUpRight,   color: 'text-blue-500',                   ring: 'ring-blue-500/20', bg: 'bg-blue-500/8' },
    { label: dict.accountsPayable,    value: fmt(summary.pendingPayables),    icon: ArrowDownRight, color: 'text-orange-500',                 ring: 'ring-orange-500/20', bg: 'bg-orange-500/8' },
    {
      label: dict.profitAndLoss, value: fmt(summary.monthlyProfit),
      icon: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? TrendingUp : TrendingDown,
      color: summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500',
      ring:  summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'ring-green-500/20' : 'ring-red-500/20',
      bg:    summary.monthlyProfit !== null && summary.monthlyProfit >= 0 ? 'bg-green-500/8' : 'bg-red-500/8',
    },
  ]

  const chartData = [
    { month: 'Jan', income: 0, expenses: 0 }, { month: 'Feb', income: 0, expenses: 0 },
    { month: 'Mar', income: 0, expenses: 0 }, { month: 'Apr', income: 0, expenses: 0 },
    { month: 'May', income: 0, expenses: 0 },
    { month: 'Jun', income: summary.monthlyIncome ?? 0, expenses: summary.monthlyExpenses ?? 0 },
  ]
  const hasChart = chartData.some((d) => d.income > 0 || d.expenses > 0)

  return (
    <div className="w-full space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {getGreeting()}{data.userName ? `, ${data.userName.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data.businessName} · {formatDate(new Date())}
          </p>
        </div>
        <Link href="/transactions/sales/new"
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-glow">
          <Plus size={15} />
          <span className="hidden sm:inline">New Invoice</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i}
              className="bg-card border border-border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 hover:shadow-card">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xs font-medium text-muted-foreground leading-tight pr-2">{card.label}</p>
                <div className={`w-8 h-8 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0 ring-1 ${card.ring}`}>
                  <Icon size={15} className={card.color} />
                </div>
              </div>
              <p className={`font-mono text-xl sm:text-2xl font-bold tabular-nums ${card.value === 'N/A' ? 'text-muted-foreground' : 'text-foreground'}`}>
                {card.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Chart row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-foreground">Income vs Expenses</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Current financial year</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary/60 inline-block" />Income</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400/40 inline-block" />Expenses</span>
            </div>
          </div>
          {!hasChart ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2">
              <TrendingUp size={24} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground/50">No transactions yet</p>
              <p className="text-xs text-muted-foreground/30">Start creating invoices to see your chart</p>
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#14F195" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#14F195" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'currentColor' }} axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10, fill: 'currentColor' }} axisLine={false} tickLine={false} className="text-muted-foreground"
                    tickFormatter={(v) => formatCurrencyCompact(v, currency)} width={52} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(v: number, n: string) => [formatCurrency(v, currency), n === 'income' ? 'Income' : 'Expenses']} />
                  <Area type="monotone" dataKey="income"   stroke="#14F195" strokeWidth={2} fill="url(#incGrad)" />
                  <Area type="monotone" dataKey="expenses" stroke="#3B82F6" strokeWidth={2} fill="url(#expGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly summary */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="font-semibold text-foreground">This Month</h3>
          <div className="space-y-4 flex-1">
            {[
              { label: 'Total Income',   val: summary.monthlyIncome,   color: 'text-primary' },
              { label: 'Total Expenses', val: summary.monthlyExpenses, color: 'text-red-500' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <span className={`font-mono text-sm font-semibold ${row.val !== null ? row.color : 'text-muted-foreground'}`}>
                  {fmtF(row.val)}
                </span>
              </div>
            ))}
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{dict.netProfit}</span>
              <span className={`font-mono text-sm font-bold ${
                summary.monthlyProfit === null ? 'text-muted-foreground'
                : summary.monthlyProfit >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>{fmtF(summary.monthlyProfit)}</span>
            </div>
          </div>
          <Link href="/reports/pnl"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
            View Full Report <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{dict.recentActivity}</h3>
          <Link href="/transactions/sales" className="text-xs text-primary/70 hover:text-primary transition-colors">View all →</Link>
        </div>
        {data.recentVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Clock size={24} className="text-muted-foreground/25" />
            <p className="text-sm text-muted-foreground/50">No transactions yet</p>
            <Link href="/transactions/sales/new"
              className="text-xs text-primary/60 hover:text-primary transition-colors underline underline-offset-2">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {data.recentVouchers.map((v) => {
              const prefix   = getVoucherPrefix(v.type)
              const badgeCls = VOUCHER_BADGE[v.type] ?? 'bg-muted text-muted-foreground border-border'
              const amtCls   = VOUCHER_COLOR[v.type] ?? 'text-foreground'
              const isIncome = v.type === 'SALES' || v.type === 'RECEIPT'
              return (
                <div key={v.id} className="flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors duration-150" style={{ minHeight: '56px' }}>
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold ${badgeCls}`}>{prefix}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{v.party ?? v.notes ?? v.number}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.number} · {formatDate(v.date)}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right ml-4">
                    <p className={`font-mono text-sm font-semibold tabular-nums ${amtCls}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(v.amount, currency)}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{v.type.toLowerCase()}</p>
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