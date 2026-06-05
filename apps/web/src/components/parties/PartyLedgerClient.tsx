'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  User, Phone, Mail, Hash, ArrowLeft, TrendingUp, TrendingDown,
  Scale, Download, Plus, Filter, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

type VoucherType = 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA'
type PartyType = 'CUSTOMER' | 'SUPPLIER'

interface LedgerRow {
  id: string
  date: string
  voucherNumber: string
  voucherType: VoucherType
  notes: string | null
  debit: number | null
  credit: number | null
  balance: number
}

interface PartyLedgerClientProps {
  party: {
    id: string
    name: string
    type: PartyType
    email: string | null
    phone: string | null
    gstin: string | null
  }
  ledgerRows: LedgerRow[]
  totalDebit: number
  totalCredit: number
  closingBalance: number
  currency: string
}

const VOUCHER_TYPE_LABELS: Record<VoucherType, { label: string; color: string; bg: string }> = {
  SALES:    { label: 'Sale',     color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-500/10'  },
  PURCHASE: { label: 'Purchase', color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-500/10'    },
  RECEIPT:  { label: 'Receipt',  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10'   },
  PAYMENT:  { label: 'Payment',  color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10'  },
  JOURNAL:  { label: 'Journal',  color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-500/10' },
  CONTRA:   { label: 'Contra',   color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-500/10'   },
}

function fmt(amount: number | null, currency: string) {
  if (amount === null || amount === 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount)
}

function fmtBalance(amount: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(Math.abs(amount))
}

export function PartyLedgerClient({
  party, ledgerRows, totalDebit, totalCredit, closingBalance, currency,
}: PartyLedgerClientProps) {
  const [typeFilter, setTypeFilter] = useState<VoucherType | 'ALL'>('ALL')

  const filtered = typeFilter === 'ALL'
    ? ledgerRows
    : ledgerRows.filter(r => r.voucherType === typeFilter)

  const isDr = closingBalance > 0
  const isCr = closingBalance < 0

  return (
    <div className="space-y-5">
      {/* Party Info Card */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-xl',
              party.type === 'CUSTOMER' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
            )}>
              {party.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground">{party.name}</p>
                <span className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                  party.type === 'CUSTOMER'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-amber-500/10 text-amber-500'
                )}>
                  {party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1">
                {party.email && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail size={11} />{party.email}
                  </span>
                )}
                {party.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone size={11} />{party.phone}
                  </span>
                )}
                {party.gstin && (
                  <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                    <Hash size={11} />{party.gstin}
                  </span>
                )}
                {!party.email && !party.phone && !party.gstin && (
                  <span className="text-xs text-muted-foreground">No contact details</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={party.type === 'CUSTOMER' ? '/transactions/receipts/new' : '/transactions/payments/new'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
            >
              <Plus size={13} />
              {party.type === 'CUSTOMER' ? 'New Receipt' : 'New Payment'}
            </Link>
          </div>
        </div>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Total Debit</p>
          <p className="font-bold text-foreground">{fmt(totalDebit, currency)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Total Credit</p>
          <p className="font-bold text-foreground">{fmt(totalCredit, currency)}</p>
        </div>
        <div className={cn(
          'rounded-2xl p-4 border',
          isDr ? 'bg-green-500/5 border-green-500/20' :
          isCr ? 'bg-red-500/5 border-red-500/20' :
          'bg-card border-border'
        )}>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Balance</p>
          <div className="flex items-center gap-1.5">
            {isDr && <TrendingUp size={14} className="text-green-500" />}
            {isCr && <TrendingDown size={14} className="text-red-500" />}
            {!isDr && !isCr && <Scale size={14} className="text-muted-foreground" />}
            <p className={cn(
              'font-bold text-sm',
              isDr ? 'text-green-600 dark:text-green-400' :
              isCr ? 'text-red-600 dark:text-red-400' :
              'text-muted-foreground'
            )}>
              {closingBalance === 0
                ? 'Nil'
                : `${fmtBalance(closingBalance, currency)} ${isDr ? 'Dr' : 'Cr'}`}
            </p>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-wrap">
          <p className="font-semibold text-foreground text-sm">
            Transaction History
            <span className="ml-2 text-muted-foreground font-normal text-xs">({ledgerRows.length} entries)</span>
          </p>
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['ALL', 'SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150',
                  typeFilter === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-muted-foreground hover:text-foreground border border-border'
                )}
              >
                {t === 'ALL' ? 'All' : VOUCHER_TYPE_LABELS[t].label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-center px-4">
            <Scale size={24} className="text-muted-foreground" />
            <p className="font-medium text-foreground text-sm">No transactions</p>
            <p className="text-xs text-muted-foreground">
              {typeFilter !== 'ALL' ? `No ${VOUCHER_TYPE_LABELS[typeFilter as VoucherType]?.label} entries for this party.` : 'No transactions recorded for this party yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voucher</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Debit</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Credit</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((row) => {
                    const vtCfg = VOUCHER_TYPE_LABELS[row.voucherType]
                    const balDr = row.balance > 0
                    const balCr = row.balance < 0
                    return (
                      <tr key={row.id} className="hover:bg-accent/20 transition-colors">
                        <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{row.date}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-semibold', vtCfg.bg, vtCfg.color)}>
                              {vtCfg.label}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">{row.voucherNumber}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-muted-foreground text-xs max-w-[200px] truncate">
                          {row.notes ?? '—'}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-sm text-foreground">
                          {fmt(row.debit, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono text-sm text-foreground">
                          {fmt(row.credit, currency)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={cn(
                            'font-mono text-sm font-semibold',
                            balDr ? 'text-green-600 dark:text-green-400' :
                            balCr ? 'text-red-600 dark:text-red-400' :
                            'text-muted-foreground'
                          )}>
                            {row.balance === 0
                              ? 'Nil'
                              : `${fmtBalance(row.balance, currency)} ${balDr ? 'Dr' : 'Cr'}`}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((row) => {
                const vtCfg = VOUCHER_TYPE_LABELS[row.voucherType]
                const balDr = row.balance > 0
                return (
                  <div key={row.id} className="px-4 py-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded-lg text-[10px] font-semibold', vtCfg.bg, vtCfg.color)}>
                          {vtCfg.label}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{row.voucherNumber}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{row.date}</span>
                    </div>
                    {row.notes && (
                      <p className="text-xs text-muted-foreground">{row.notes}</p>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex gap-4">
                        {row.debit !== null && row.debit > 0 && (
                          <div>
                            <p className="text-muted-foreground">Dr</p>
                            <p className="font-mono font-medium text-foreground">{fmt(row.debit, currency)}</p>
                          </div>
                        )}
                        {row.credit !== null && row.credit > 0 && (
                          <div>
                            <p className="text-muted-foreground">Cr</p>
                            <p className="font-mono font-medium text-foreground">{fmt(row.credit, currency)}</p>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Balance</p>
                        <p className={cn(
                          'font-mono font-semibold',
                          balDr ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}>
                          {row.balance === 0 ? 'Nil' : `${fmtBalance(row.balance, currency)} ${balDr ? 'Dr' : 'Cr'}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}