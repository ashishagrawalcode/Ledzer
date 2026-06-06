'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { formatCurrency, formatDate, getInitials } from '@/lib/utils'
import { getVoucherPrefix } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant } from '@/components/shared/StatusBadge'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

interface Party { id: string; name: string; type: string }
interface Entry {
  id: string; voucherId: string; voucherNumber: string; voucherType: string
  date: Date; notes: string | null; entryType: string; amount: number; balance: number
}

interface Props {
  allParties: Party[]
  selectedPartyData: {
    party: { id: string; name: string; type: string; email: string | null; phone: string | null; gstin: string | null }
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

export function PartyLedgerClient({ allParties, selectedPartyData, currency, selectedPartyId, fromDate, toDate }: Props) {
  const router = useRouter()
  const [partyId, setPartyId] = useState(selectedPartyId ?? '')
  const [from, setFrom] = useState(fromDate ?? new Date(new Date().getFullYear(), 3, 1).toISOString().split('T')[0])
  const [to, setTo] = useState(toDate ?? new Date().toISOString().split('T')[0])

  const fmt = (v: number) => formatCurrency(Math.abs(v), currency)

  function handleView() {
    if (!partyId) return
    router.push(`/reports/party-ledger?partyId=${partyId}&from=${from}&to=${to}`)
  }

  const customers = allParties.filter((p) => p.type === 'CUSTOMER')
  const suppliers = allParties.filter((p) => p.type === 'SUPPLIER')

  const exportData = selectedPartyData?.entries.map((e) => ({
    Date: new Date(e.date).toLocaleDateString('en-IN'),
    Voucher: e.voucherNumber,
    Type: e.voucherType,
    Description: e.notes ?? '',
    Debit: e.entryType === 'DEBIT' ? e.amount : '',
    Credit: e.entryType === 'CREDIT' ? e.amount : '',
    Balance: e.balance,
  })) ?? []

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="settings-label">Party</label>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="settings-input"
            >
              <option value="">— Select a party —</option>
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
          <div>
            <label className="settings-label">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="settings-input w-auto" />
          </div>
          <div>
            <label className="settings-label">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="settings-input w-auto" />
          </div>
          <button
            onClick={handleView}
            disabled={!partyId}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow disabled:opacity-40"
          >
            View Statement
          </button>
          {selectedPartyData && (
            <ExportDropdown data={exportData} filename={`Ledger_${selectedPartyData.party.name.replace(/\s+/g, '_')}`} />
          )}
        </div>
      </div>

      {!selectedPartyData && (
        <div className="bg-card border border-border rounded-2xl flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
            <span className="text-2xl">📒</span>
          </div>
          <p className="font-medium text-foreground">Select a party to view their ledger</p>
          <p className="text-sm text-muted-foreground">Choose a customer or supplier from the dropdown above</p>
        </div>
      )}

      {selectedPartyData && (
        <>
          {/* Party header */}
          <div className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-gradient flex items-center justify-center text-base font-bold text-navy-DEFAULT shadow-glow-sm flex-shrink-0">
              {getInitials(selectedPartyData.party.name)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{selectedPartyData.party.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedPartyData.party.type} · Statement: {formatDate(new Date(selectedPartyData.fromDate))} to {formatDate(new Date(selectedPartyData.toDate))}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center flex-shrink-0">
              {[
                { label: 'Total Dr', value: selectedPartyData.summary.totalDebits, color: 'text-primary' },
                { label: 'Total Cr', value: selectedPartyData.summary.totalCredits, color: 'text-red-500' },
                { label: 'Balance', value: Math.abs(selectedPartyData.summary.closingBalance), color: selectedPartyData.summary.closingBalance >= 0 ? 'text-primary' : 'text-red-500' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className={`font-mono text-sm font-bold tabular-nums ${s.value > 0 ? s.color : 'text-muted-foreground'}`}>
                    {s.value > 0 ? fmt(s.value) : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Statement table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {selectedPartyData.entries.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <p className="text-muted-foreground text-sm">No transactions in this period</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-accent/30">
                      {['Date', 'Voucher', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => (
                        <th key={h} className={`px-5 py-3.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider ${['Debit','Credit','Balance'].includes(h) ? 'text-right' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedPartyData.entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-accent/40 transition-colors" style={{ minHeight: '56px' }}>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">{formatDate(entry.date)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <StatusBadge label={getVoucherPrefix(entry.voucherType)} variant={getVoucherStatusVariant(entry.voucherType)} />
                            <span className="text-xs font-mono text-muted-foreground">{entry.voucherNumber}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-foreground/70 max-w-[160px] truncate">{entry.notes ?? '—'}</td>
                        <td className="px-5 py-4 text-right font-mono text-sm tabular-nums">
                          {entry.entryType === 'DEBIT' ? <span className="text-primary font-semibold">{fmt(entry.amount)}</span> : <span className="text-muted-foreground/30">—</span>}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm tabular-nums">
                          {entry.entryType === 'CREDIT' ? <span className="text-red-500 font-semibold">{fmt(entry.amount)}</span> : <span className="text-muted-foreground/30">—</span>}
                        </td>
                        <td className="px-5 py-4 text-right font-mono text-sm font-semibold tabular-nums">
                          <span className={entry.balance >= 0 ? 'text-foreground' : 'text-red-500'}>{fmt(entry.balance)}</span>
                          <span className="ml-1 text-[10px] text-muted-foreground">{entry.balance >= 0 ? 'Dr' : 'Cr'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-accent/50">
                      <td colSpan={3} className="px-5 py-4 font-bold text-foreground text-sm">Closing Balance</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-primary text-sm">{fmt(selectedPartyData.summary.totalDebits)}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-red-500 text-sm">{fmt(selectedPartyData.summary.totalCredits)}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-sm">
                        <span className={selectedPartyData.summary.closingBalance >= 0 ? 'text-primary' : 'text-red-500'}>{fmt(selectedPartyData.summary.closingBalance)}</span>
                        <span className="ml-1 text-[10px] text-muted-foreground">{selectedPartyData.summary.closingBalance >= 0 ? 'Dr' : 'Cr'}</span>
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