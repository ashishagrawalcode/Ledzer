'use client'

import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { Mail, Phone, Hash, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import Link from 'next/link'

interface Entry {
  id: string
  voucherId: string
  voucherNumber: string
  voucherType: string
  date: Date
  notes: string | null
  entryType: string
  amount: number
  balance: number
}

interface Props {
  party: {
    id: string
    name: string
    type: string
    email: string | null
    phone: string | null
    gstin: string | null
  }
  entries: Entry[]
  summary: { totalDebits: number; totalCredits: number; closingBalance: number }
  currency: string
}

export function PartyDetailClient({ party, entries, summary, currency }: Props) {
  const isSimple = usePreferencesStore((s) => s.terminologyMode) === 'simple'
  const fmt = (v: number) => formatCurrency(Math.abs(v), currency)
  const isCustomer = party.type === 'CUSTOMER'
  const pendingAmt = isCustomer
    ? Math.max(0, summary.closingBalance)
    : Math.max(0, -summary.closingBalance)

  return (
    <div className="space-y-5">
      {/* Party profile card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-gradient flex items-center justify-center text-lg font-bold text-navy-DEFAULT shadow-glow flex-shrink-0">
              {getInitials(party.name)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">{party.name}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isCustomer
                  ? isSimple ? 'Customer (Owes you money)' : 'Customer (Accounts Receivable)'
                  : isSimple ? 'Supplier (You owe them)' : 'Supplier (Accounts Payable)'}
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="sm:ml-auto flex flex-wrap gap-4 text-sm text-muted-foreground">
            {party.phone ? (
              <div className="flex items-center gap-1.5"><Phone size={13} />{party.phone}</div>
            ) : null}
            {party.email ? (
              <div className="flex items-center gap-1.5"><Mail size={13} />{party.email}</div>
            ) : null}
            {party.gstin ? (
              <div className="flex items-center gap-1.5 font-mono text-xs"><Hash size={13} />{party.gstin}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={15} className="text-primary" />
            <p className="text-xs text-muted-foreground">
              {isCustomer ? (isSimple ? 'Total Invoiced' : 'Total Debits') : (isSimple ? 'Total Purchased' : 'Total Debits')}
            </p>
          </div>
          <p className={`font-mono text-xl font-bold tabular-nums ${summary.totalDebits > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {summary.totalDebits > 0 ? fmt(summary.totalDebits) : 'N/A'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={15} className="text-red-500" />
            <p className="text-xs text-muted-foreground">
              {isCustomer ? (isSimple ? 'Total Received' : 'Total Credits') : (isSimple ? 'Total Paid' : 'Total Credits')}
            </p>
          </div>
          <p className={`font-mono text-xl font-bold tabular-nums ${summary.totalCredits > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
            {summary.totalCredits > 0 ? fmt(summary.totalCredits) : 'N/A'}
          </p>
        </div>

        <div className={`bg-card border rounded-2xl p-5 ${
          pendingAmt > 0
            ? isCustomer ? 'border-primary/20 bg-primary/5' : 'border-orange-500/20 bg-orange-500/5'
            : 'border-border'
        }`}>
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={15} className={pendingAmt > 0 ? (isCustomer ? 'text-primary' : 'text-orange-500') : 'text-muted-foreground'} />
            <p className="text-xs text-muted-foreground">
              {isCustomer ? (isSimple ? 'Amount Pending' : 'Outstanding') : (isSimple ? 'Amount You Owe' : 'Payable')}
            </p>
          </div>
          <p className={`font-mono text-xl font-bold tabular-nums ${
            pendingAmt > 0
              ? isCustomer ? 'text-primary' : 'text-orange-500'
              : 'text-muted-foreground'
          }`}>
            {pendingAmt > 0 ? fmt(pendingAmt) : 'Settled'}
          </p>
        </div>
      </div>

      {/* Ledger statement table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            {isSimple ? 'Transaction History' : 'Ledger Statement'}
          </h3>
          <p className="text-xs text-muted-foreground">{entries.length} entries</p>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-muted-foreground text-sm">No transactions yet</p>
            <Link
              href={isCustomer ? '/transactions/sales/new' : '/transactions/purchases/new'}
              className="text-xs text-primary/70 hover:text-primary transition-colors underline underline-offset-2"
            >
              {isCustomer ? 'Create first invoice' : 'Record first purchase'}
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/30">
                    <th className="text-left px-6 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Voucher</th>
                    <th className="text-left px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {isSimple ? 'Money In (Dr)' : 'Debit'}
                    </th>
                    <th className="text-right px-4 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      {isSimple ? 'Money Out (Cr)' : 'Credit'}
                    </th>
                    <th className="text-right px-6 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-accent/40 transition-colors" style={{ minHeight: '56px' }}>
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/transactions/sales/${entry.voucherId}`}
                          className="flex items-center gap-2 group"
                        >
                          <StatusBadge
                            label={getVoucherPrefix(entry.voucherType)}
                            variant={getVoucherStatusVariant(entry.voucherType)}
                          />
                          <span className="text-xs text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                            {entry.voucherNumber}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-foreground/70 max-w-[180px] truncate">
                        {entry.notes ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums">
                        {entry.entryType === 'DEBIT'
                          ? <span className="text-primary font-semibold">{fmt(entry.amount)}</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums">
                        {entry.entryType === 'CREDIT'
                          ? <span className="text-red-500 font-semibold">{fmt(entry.amount)}</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-semibold tabular-nums">
                        <span className={entry.balance >= 0 ? 'text-foreground' : 'text-red-500'}>
                          {fmt(entry.balance)}
                        </span>
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {entry.balance >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Closing balance footer */}
                <tfoot>
                  <tr className="border-t-2 border-border bg-accent/50">
                    <td colSpan={3} className="px-6 py-4 font-semibold text-foreground text-sm">
                      Closing Balance
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-primary tabular-nums text-sm">
                      {fmt(summary.totalDebits)}
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-red-500 tabular-nums text-sm">
                      {fmt(summary.totalCredits)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold tabular-nums text-sm">
                      <span className={summary.closingBalance >= 0 ? 'text-primary' : 'text-red-500'}>
                        {fmt(summary.closingBalance)}
                      </span>
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        {summary.closingBalance >= 0 ? 'Dr' : 'Cr'}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border/40">
              {entries.map((entry) => (
                <div key={entry.id} className="px-4 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        label={getVoucherPrefix(entry.voucherType)}
                        variant={getVoucherStatusVariant(entry.voucherType)}
                      />
                      <span className="text-xs font-mono text-muted-foreground">{entry.voucherNumber}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                  </div>
                  {entry.notes && <p className="text-xs text-muted-foreground truncate">{entry.notes}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-mono font-semibold ${entry.entryType === 'DEBIT' ? 'text-primary' : 'text-red-500'}`}>
                      {entry.entryType === 'DEBIT' ? '+' : '-'}{fmt(entry.amount)}
                    </span>
                    <span className={`font-mono text-xs ${entry.balance >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                      Balance: {fmt(entry.balance)} {entry.balance >= 0 ? 'Dr' : 'Cr'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}