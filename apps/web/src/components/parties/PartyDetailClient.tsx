'use client'

import { formatCurrency, formatDate, getInitials, getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { Mail, Phone, Hash, TrendingUp, TrendingDown, Wallet, ArrowRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

  // Determine if the balance is an asset (they owe you) or liability (you owe them)
  // In standard accounting: Positive = Debit Balance (Asset), Negative = Credit Balance (Liability)
  const isOwedToYou = summary.closingBalance > 0;
  const isSettled = summary.closingBalance === 0;

  return (
    <div className="space-y-6">
      
      {/* 1. HERO SECTION: Profile & Balance (Glassmorphism) */}
      <div className={cn(
        "rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between gap-8 border",
        isOwedToYou && isCustomer ? "glass glow-teal border-teal/20" : "bg-card border-border"
      )}>
        {/* Background Noise Texture */}
        <div className="noise-overlay" />

        {/* Left: Party Info */}
        <div className="relative z-10 flex gap-4 items-start">
          <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center text-xl font-display font-bold text-teal border border-teal/20 flex-shrink-0 shadow-sm">
            {getInitials(party.name)}
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">{party.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 mb-4 font-medium">
              {isCustomer
                ? isSimple ? 'Customer (Owes you money)' : 'Customer (Accounts Receivable)'
                : isSimple ? 'Supplier (You owe them)' : 'Supplier (Accounts Payable)'}
            </p>
            
            {/* Contact Pills */}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {party.phone && (
                <span className="flex items-center gap-1.5 bg-accent/50 px-2.5 py-1.5 rounded-lg border border-border/50"><Phone size={12} />{party.phone}</span>
              )}
              {party.email && (
                <span className="flex items-center gap-1.5 bg-accent/50 px-2.5 py-1.5 rounded-lg border border-border/50"><Mail size={12} />{party.email}</span>
              )}
              {party.gstin && (
                <span className="flex items-center gap-1.5 font-mono bg-accent/50 px-2.5 py-1.5 rounded-lg border border-border/50"><Hash size={12} />{party.gstin}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Closing Balance */}
        <div className="relative z-10 flex flex-col md:items-end justify-center pt-4 md:pt-0 border-t md:border-t-0 border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Wallet size={14} />
            {isSimple ? 'Current Balance' : 'Closing Balance'}
          </p>
          <p className={cn(
            "font-mono text-4xl md:text-5xl font-bold tracking-tight tabular-nums",
            isSettled ? "text-foreground" : (isOwedToYou ? "text-teal glow-teal-text" : "text-red-500")
          )}>
            {fmt(summary.closingBalance)}
          </p>
          <p className="text-sm font-medium mt-2">
            {isSettled ? (
              <span className="text-muted-foreground">Account Settled</span>
            ) : isOwedToYou ? (
              <span className="text-teal bg-teal/10 px-2 py-0.5 rounded text-xs">They owe you (Dr)</span>
            ) : (
              <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs">You owe them (Cr)</span>
            )}
          </p>
        </div>
      </div>

      {/* 2. QUICK STATS GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-border/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center"><TrendingUp size={14} className="text-teal" /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isCustomer ? (isSimple ? 'Total Invoiced' : 'Total Debits') : (isSimple ? 'Total Purchased' : 'Total Debits')}
            </p>
          </div>
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground mt-1">
            {summary.totalDebits > 0 ? fmt(summary.totalDebits) : '₹0.00'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm transition-all hover:border-border/80">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center"><TrendingDown size={14} className="text-red-500" /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isCustomer ? (isSimple ? 'Total Received' : 'Total Credits') : (isSimple ? 'Total Paid' : 'Total Credits')}
            </p>
          </div>
          <p className="font-mono text-2xl font-bold tabular-nums text-foreground mt-1">
            {summary.totalCredits > 0 ? fmt(summary.totalCredits) : '₹0.00'}
          </p>
        </div>
      </div>

      {/* 3. LEDGER STATEMENT SECTION */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-accent/20">
          <div>
            <h3 className="font-display font-semibold text-lg text-foreground">
              {isSimple ? 'Transaction History' : 'Ledger Statement'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{entries.length} entries recorded</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-muted-foreground/50 border border-border">
              <FileText size={24} />
            </div>
            <p className="text-muted-foreground text-sm">No transactions found for this party.</p>
            <Link
              href={isCustomer ? '/transactions/sales/new' : '/transactions/purchases/new'}
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy bg-teal hover:bg-teal-hover px-4 py-2.5 rounded-xl transition-all shadow-glow"
            >
              {isCustomer ? 'Create First Invoice' : 'Record First Purchase'}
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/40">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voucher</th>
                    <th className="text-left px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isSimple ? 'Money In (Dr)' : 'Debit (Dr)'}
                    </th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isSimple ? 'Money Out (Cr)' : 'Credit (Cr)'}
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/transactions/${entry.voucherType.toLowerCase()}s/${entry.voucherId}`} className="flex items-center gap-2 group w-fit">
                          <StatusBadge label={getVoucherPrefix(entry.voucherType)} variant={getVoucherStatusVariant(entry.voucherType)} />
                          <span className="text-xs text-muted-foreground font-mono group-hover:text-foreground transition-colors underline-offset-4 group-hover:underline">
                            {entry.voucherNumber}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-foreground/80 max-w-[200px] truncate text-xs">
                        {entry.notes ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums">
                        {entry.entryType === 'DEBIT' 
                          ? <span className="text-teal font-medium">{fmt(entry.amount)}</span> 
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm tabular-nums">
                        {entry.entryType === 'CREDIT' 
                          ? <span className="text-red-500 font-medium">{fmt(entry.amount)}</span> 
                          : <span className="text-muted-foreground/30">—</span>}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-sm font-semibold tabular-nums">
                        <span className={entry.balance >= 0 ? 'text-foreground' : 'text-red-500'}>
                          {fmt(entry.balance)}
                        </span>
                        <span className="ml-1.5 text-[10px] text-muted-foreground font-sans font-medium">
                          {entry.balance >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS (Visible only on mobile) */}
            <div className="md:hidden divide-y divide-border/50 bg-card">
              {entries.map((entry) => (
                <div key={entry.id} className="p-5 space-y-4 hover:bg-accent/20 transition-colors">
                  {/* Top row: Voucher Info & Date */}
                  <div className="flex items-center justify-between">
                    <Link href={`/transactions/${entry.voucherType.toLowerCase()}s/${entry.voucherId}`} className="flex items-center gap-2">
                      <StatusBadge label={getVoucherPrefix(entry.voucherType)} variant={getVoucherStatusVariant(entry.voucherType)} />
                      <span className="text-xs font-mono font-medium text-foreground">{entry.voucherNumber}</span>
                    </Link>
                    <span className="text-xs font-medium text-muted-foreground bg-accent/50 px-2 py-1 rounded-md">
                      {formatDate(entry.date)}
                    </span>
                  </div>

                  {/* Description */}
                  {entry.notes && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {entry.notes}
                    </p>
                  )}

                  {/* Financials: Amount & Running Balance */}
                  <div className="flex items-end justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        {entry.entryType === 'DEBIT' ? (isSimple ? 'Money In' : 'Debit') : (isSimple ? 'Money Out' : 'Credit')}
                      </p>
                      <p className={cn(
                        "font-mono font-bold text-base",
                        entry.entryType === 'DEBIT' ? "text-teal" : "text-red-500"
                      )}>
                        {entry.entryType === 'DEBIT' ? '+' : '-'}{fmt(entry.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Running Bal</p>
                      <p className={cn("font-mono font-bold text-sm", entry.balance >= 0 ? 'text-foreground' : 'text-red-500')}>
                        {fmt(entry.balance)} <span className="text-[10px] text-muted-foreground ml-0.5">{entry.balance >= 0 ? 'Dr' : 'Cr'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Unified Footer for both views */}
            <div className="bg-accent/30 border-t-2 border-border px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
               <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Final Closing Balance</span>
               <span className={cn(
                 "font-mono text-xl font-bold tabular-nums",
                 summary.closingBalance >= 0 ? 'text-teal glow-teal-text' : 'text-red-500'
               )}>
                 {fmt(summary.closingBalance)} <span className="text-xs text-muted-foreground font-sans font-medium ml-1">{summary.closingBalance >= 0 ? 'Dr' : 'Cr'}</span>
               </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}