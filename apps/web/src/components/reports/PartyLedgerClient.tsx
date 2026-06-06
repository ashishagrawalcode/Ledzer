'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Filter, BookOpen, Scale } from 'lucide-react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant } from '@/components/shared/StatusBadge'
import { ExportDropdown } from '@/components/shared/ExportDropdown'
import { cn } from '@/lib/utils'

interface Party { id: string; name: string; type: string }

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
  allParties: Party[]
  selectedPartyData: {
    party: {
      id: string; name: string; type: string
      email: string | null; phone: string | null; gstin: string | null
    }
    entries: Entry[]
    summary: { totalDebits: number; totalCredits: number; closingBalance: number }
    fromDate: string
    toDate: string
  } | null
  currency: string
  selectedPartyId: string | null
  fromDate: string | null
  toDate: string | null
}

export function PartyLedgerClient({
  allParties, selectedPartyData, currency, selectedPartyId, fromDate, toDate,
}: Props) {
  const router = useRouter()
  const [partyId, setPartyId] = useState(selectedPartyId ?? '')
  const [from, setFrom] = useState(
    fromDate ?? new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0]
  )
  const [to, setTo] = useState(toDate ?? new Date().toISOString().split('T')[0])

  const fmt = (v: number) => formatCurrency(Math.abs(v), currency)

  function handleView() {
    if (!partyId) return
    router.push(`/reports/party-ledger?partyId=${partyId}&from=${from}&to=${to}`)
  }

  const customers = allParties.filter((p) => p.type === 'CUSTOMER')
  const suppliers  = allParties.filter((p) => p.type === 'SUPPLIER')

  const exportData = selectedPartyData?.entries.map((e) => ({
    Date:        new Date(e.date).toLocaleDateString('en-IN'),
    Voucher:     e.voucherNumber,
    Type:        e.voucherType,
    Description: e.notes ?? '',
    Debit:       e.entryType === 'DEBIT'  ? e.amount : '',
    Credit:      e.entryType === 'CREDIT' ? e.amount : '',
    Balance:     e.balance,
  })) ?? []

  return (
    <div className="space-y-4">

      {/* ── Filter bar ── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        {/* Party selector — full width on mobile */}
        <div>
          <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium block mb-1.5">
            Party
          </label>
          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
          >
            <option value="">— Select a customer or supplier —</option>
            {customers.length > 0 && (
              <optgroup label="Customers">
                {customers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            )}
            {suppliers.length > 0 && (
              <optgroup label="Suppliers">
                {suppliers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Date range + action */}
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
          <div className="flex gap-2 sm:w-auto w-full">
            <button
              onClick={handleView}
              disabled={!partyId}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shadow-glow disabled:opacity-40"
            >
              <Filter size={12} />View
            </button>
            {selectedPartyData && (
              <ExportDropdown
                data={exportData}
                filename={`Ledger_${selectedPartyData.party.name.replace(/\s+/g, '_')}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!selectedPartyData && (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center border border-border">
            <BookOpen size={22} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Select a party to view their ledger</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a customer or supplier from the dropdown above
            </p>
          </div>
        </div>
      )}

      {selectedPartyData && (
        <>
          {/* ── Party header card ── */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-gradient flex items-center justify-center text-sm font-bold text-navy-DEFAULT shadow-glow-sm flex-shrink-0">
                {getInitials(selectedPartyData.party.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground">{selectedPartyData.party.name}</p>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    selectedPartyData.party.type === 'CUSTOMER'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-amber-500/10 text-amber-500'
                  )}>
                    {selectedPartyData.party.type === 'CUSTOMER' ? 'Customer' : 'Supplier'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Statement: {formatDate(new Date(selectedPartyData.fromDate))} to {formatDate(new Date(selectedPartyData.toDate))}
                </p>
              </div>

              {/* Summary nums — stack on mobile */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full sm:w-auto text-center">
                {[
                  { label: 'Total Dr', value: selectedPartyData.summary.totalDebits,  color: 'text-green-600 dark:text-green-400' },
                  { label: 'Total Cr', value: selectedPartyData.summary.totalCredits, color: 'text-red-600 dark:text-red-400'     },
                  {
                    label: 'Balance',
                    value: Math.abs(selectedPartyData.summary.closingBalance),
                    color: selectedPartyData.summary.closingBalance >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                    <p className={cn('font-mono text-sm font-bold tabular-nums mt-0.5', s.value > 0 ? s.color : 'text-muted-foreground')}>
                      {s.value > 0 ? fmt(s.value) : 'Nil'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Statement ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {selectedPartyData.entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
                <Scale size={22} className="text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No transactions in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[580px]">
                  <thead>
                    <tr className="border-b border-border bg-accent/30">
                      {['Date', 'Voucher', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => (
                        <th
                          key={h}
                          className={cn(
                            'px-4 sm:px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider',
                            ['Debit','Credit','Balance'].includes(h) ? 'text-right' : 'text-left'
                          )}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedPartyData.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-accent/40 transition-colors">
                        <td className="px-4 sm:px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(new Date(entry.date))}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <StatusBadge
                              label={getVoucherPrefix(entry.voucherType)}
                              variant={getVoucherStatusVariant(entry.voucherType)}
                            />
                            <span className="text-xs font-mono text-muted-foreground">
                              {entry.voucherNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-muted-foreground max-w-[140px] truncate text-xs">
                          {entry.notes ?? '—'}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-right font-mono text-sm tabular-nums">
                          {entry.entryType === 'DEBIT'
                            ? <span className="text-green-600 dark:text-green-400 font-semibold">{fmt(entry.amount)}</span>
                            : <span className="text-muted-foreground/30">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-right font-mono text-sm tabular-nums">
                          {entry.entryType === 'CREDIT'
                            ? <span className="text-red-600 dark:text-red-400 font-semibold">{fmt(entry.amount)}</span>
                            : <span className="text-muted-foreground/30">—</span>}
                        </td>
                        <td className="px-4 sm:px-5 py-3.5 text-right font-mono text-sm font-semibold tabular-nums">
                          <span className={entry.balance >= 0 ? 'text-foreground' : 'text-red-600 dark:text-red-400'}>
                            {fmt(entry.balance)}
                          </span>
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            {entry.balance >= 0 ? 'Dr' : 'Cr'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-accent/50">
                      <td colSpan={3} className="px-4 sm:px-5 py-4 font-bold text-foreground text-sm">
                        Closing Balance
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-right font-mono font-bold text-green-600 dark:text-green-400 text-sm">
                        {fmt(selectedPartyData.summary.totalDebits)}
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-right font-mono font-bold text-red-600 dark:text-red-400 text-sm">
                        {fmt(selectedPartyData.summary.totalCredits)}
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-right font-mono font-bold text-sm">
                        <span className={selectedPartyData.summary.closingBalance >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                        }>
                          {fmt(selectedPartyData.summary.closingBalance)}
                        </span>
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {selectedPartyData.summary.closingBalance >= 0 ? 'Dr' : 'Cr'}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}