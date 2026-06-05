'use client'

import { useState } from 'react'
import { ChevronDown, Layers, TrendingUp, TrendingDown, Building, PiggyBank, Scale, Lock, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

type AccountGroup = 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE' | 'EQUITY'

interface Ledger {
  id: string
  name: string
  group: AccountGroup
  isSystem: boolean
}

interface GroupData {
  group: AccountGroup
  ledgers: Ledger[]
  count: number
}

interface AccountGroupsClientProps {
  groups: GroupData[]
}

// ─── Config per group ─────────────────────────────────────────────────────────
const GROUP_CONFIG: Record<AccountGroup, {
  label: string
  description: string
  jargonFree: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  nature: string
}> = {
  ASSET: {
    label: 'Assets',
    description: 'What your business owns — cash, bank, inventory, receivables.',
    jargonFree: 'What You Own',
    icon: Building,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    nature: 'Debit balance',
  },
  LIABILITY: {
    label: 'Liabilities',
    description: 'What your business owes — loans, payables, outstanding dues.',
    jargonFree: 'What You Owe',
    icon: TrendingDown,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    nature: 'Credit balance',
  },
  INCOME: {
    label: 'Income',
    description: 'Revenue streams — sales, service income, other receipts.',
    jargonFree: 'Money Coming In',
    icon: TrendingUp,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    nature: 'Credit balance',
  },
  EXPENSE: {
    label: 'Expenses',
    description: 'Costs incurred — purchases, rent, salaries, utilities.',
    jargonFree: 'Money Going Out',
    icon: PiggyBank,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    nature: 'Debit balance',
  },
  EQUITY: {
    label: 'Equity',
    description: "Owner's capital, retained earnings, and reserves.",
    jargonFree: "Owner's Share",
    icon: Scale,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    nature: 'Credit balance',
  },
}

// ─── Group Card ───────────────────────────────────────────────────────────────
function GroupCard({ data }: { data: GroupData }) {
  const [open, setOpen] = useState(false)
  const cfg = GROUP_CONFIG[data.group]
  const Icon = cfg.icon

  return (
    <div className={cn(
      'bg-card border rounded-2xl overflow-hidden transition-all duration-200',
      open ? `border-${cfg.color.replace('text-', '')}` : 'border-border'
    )}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-accent/30 transition-colors text-left"
      >
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg, `border ${cfg.border}`)}>
          <Icon size={18} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground text-sm">{cfg.label}</p>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-semibold', cfg.bg, cfg.color)}>
              {data.count} ledger{data.count !== 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{cfg.description}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="hidden sm:block text-[10px] font-medium text-muted-foreground bg-accent px-2.5 py-1 rounded-lg border border-border">
            {cfg.nature}
          </span>
          <ChevronDown
            size={16}
            className={cn('text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
          />
        </div>
      </button>

      {/* Ledger List */}
      {open && (
        <div className="border-t border-border">
          {data.ledgers.length === 0 ? (
            <div className="px-5 py-6 flex flex-col items-center gap-2 text-center">
              <BookOpen size={20} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No ledgers in this group yet.</p>
              <p className="text-xs text-muted-foreground">
                Create a ledger under <span className="font-medium">{cfg.label}</span> from the Ledgers page.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.ledgers.map((l) => (
                <div key={l.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.color.replace('text-', 'bg-'))} />
                    <span className="text-sm text-foreground">{l.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {l.isSystem && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent border border-border text-[10px] font-medium text-muted-foreground">
                        <Lock size={9} />
                        System
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── The Accounting Equation Banner ──────────────────────────────────────────
function AccountingEquation() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        The Fundamental Accounting Equation
      </p>
      <div className="flex items-center gap-2 flex-wrap text-sm font-semibold">
        <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">Assets</span>
        <span className="text-muted-foreground font-normal">=</span>
        <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">Liabilities</span>
        <span className="text-muted-foreground font-normal">+</span>
        <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">Equity</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Every transaction in Ledzer maintains this balance automatically through double-entry bookkeeping.
        Income increases equity; expenses decrease it.
      </p>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function AccountGroupsClient({ groups }: AccountGroupsClientProps) {
  return (
    <div className="space-y-4">
      <AccountingEquation />
      <div className="space-y-3">
        {groups.map((g) => (
          <GroupCard key={g.group} data={g} />
        ))}
      </div>
    </div>
  )
}