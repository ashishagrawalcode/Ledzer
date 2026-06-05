'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createVoucher } from '@/actions/vouchers'

interface Party { id: string; name: string; type: string; ledgerId: string }
interface Ledger { id: string; name: string; group: string; isSystem: boolean }

interface EntryLine {
  id: string
  ledgerId: string
  type: 'DEBIT' | 'CREDIT'
  amount: string
}

interface VoucherFormProps {
  voucherType: string
  businessId: string
  currency: string
  parties: Party[]
  ledgers: Ledger[]
  returnHref: string
  initialPartyId?: string
}

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

const VOUCHER_TYPE_LABELS: Record<string, string> = {
  SALES: 'Sales Invoice',
  PURCHASE: 'Purchase Bill',
  RECEIPT: 'Receipt',
  PAYMENT: 'Payment',
  JOURNAL: 'Journal Entry',
  CONTRA: 'Contra Entry',
}

export function VoucherForm({
  voucherType, businessId, currency, parties, ledgers, returnHref, initialPartyId,
}: VoucherFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState<EntryLine[]>([
    { id: genId(), ledgerId: initialPartyId ?? '', type: 'DEBIT', amount: '' },
    { id: genId(), ledgerId: '', type: 'CREDIT', amount: '' },
  ])

  const allLedgers: { id: string; name: string; group: string }[] = [
    ...parties.map((p) => ({ id: p.ledgerId, name: p.name, group: `${p.type === 'CUSTOMER' ? 'Customer' : 'Supplier'}` })),
    ...ledgers,
  ]

  function addEntry() {
    setEntries([...entries, { id: genId(), ledgerId: '', type: 'DEBIT', amount: '' }])
  }

  function removeEntry(id: string) {
    if (entries.length <= 2) return
    setEntries(entries.filter((e) => e.id !== id))
  }

  function updateEntry(id: string, field: keyof EntryLine, value: string) {
    setEntries(entries.map((e) => e.id === id ? { ...e, [field]: value } : e))
  }

  const totalDebits = entries
    .filter((e) => e.type === 'DEBIT')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const totalCredits = entries
    .filter((e) => e.type === 'CREDIT')
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01
  const hasAmounts = totalDebits > 0

  async function handleSubmit() {
    setError(null)
    if (!isBalanced) { setError('Debits must equal Credits for a valid double-entry voucher.'); return }
    if (!hasAmounts) { setError('Please enter at least one amount.'); return }
    if (entries.some((e) => !e.ledgerId)) { setError('Please select a ledger for all entries.'); return }

    startTransition(async () => {
      const result = await createVoucher({
        businessId,
        type: voucherType,
        date: new Date(date),
        notes: notes || undefined,
        entries: entries.map((e) => ({
          ledgerId: e.ledgerId,
          type: e.type as 'DEBIT' | 'CREDIT',
          amount: parseFloat(e.amount) || 0,
        })),
      })
      if (result.error) { setError(result.error); return }
      router.push(returnHref)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-foreground/70 transition-colors duration-150"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="glass rounded-2xl border border-border/5 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">{VOUCHER_TYPE_LABELS[voucherType] ?? 'Voucher'}</h2>
            <p className="text-xs text-foreground/30 mt-0.5">All entries post to the general ledger</p>
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${
            isBalanced && hasAmounts ? 'bg-teal/10 text-teal border border-teal/20' : 'bg-foreground/5 text-foreground/30 border border-border/8'
          }`}>
            {isBalanced && hasAmounts ? '✓ Balanced' : 'Unbalanced'}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Meta */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground text-sm focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Description / Narration</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Invoice for steel rods supply"
                className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200"
              />
            </div>
          </div>

          {/* Double-entry table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                Ledger Entries (Double-Entry)
              </label>
              <button
                onClick={addEntry}
                className="flex items-center gap-1.5 text-xs text-teal/70 hover:text-teal transition-colors duration-150"
              >
                <Plus size={12} />
                Add line
              </button>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-3 mb-2">
              <div className="col-span-5 text-[10px] text-foreground/25 uppercase font-semibold tracking-wider">Ledger / Account</div>
              <div className="col-span-3 text-[10px] text-foreground/25 uppercase font-semibold tracking-wider">Dr / Cr</div>
              <div className="col-span-3 text-[10px] text-foreground/25 uppercase font-semibold tracking-wider text-right">Amount ({currency})</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-3 items-center">
                  {/* Ledger select */}
                  <div className="col-span-5">
                    <select
                      value={entry.ledgerId}
                      onChange={(e) => updateEntry(entry.id, 'ledgerId', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-foreground/5 border border-border/10 text-foreground text-sm focus:outline-none focus:border-teal/50 transition-all duration-200 appearance-none"
                    >
                      <option value="" className="bg-navy">Select ledger…</option>
                      {parties.length > 0 && (
                        <optgroup label="Parties (Customers / Suppliers)" className="bg-navy">
                          {parties.map((p) => (
                            <option key={p.ledgerId} value={p.ledgerId} className="bg-navy">{p.name} ({p.type})</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Ledgers" className="bg-navy">
                        {ledgers.map((l) => (
                          <option key={l.id} value={l.id} className="bg-navy">{l.name} ({l.group})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Dr/Cr toggle */}
                  <div className="col-span-3">
                    <div className="flex rounded-xl border border-border/10 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateEntry(entry.id, 'type', 'DEBIT')}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-150 ${
                          entry.type === 'DEBIT' ? 'bg-teal text-navy' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        Dr
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEntry(entry.id, 'type', 'CREDIT')}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-all duration-150 ${
                          entry.type === 'CREDIT' ? 'bg-red-400/80 text-foreground' : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                        }`}
                      >
                        Cr
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={entry.amount}
                      onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 rounded-xl bg-foreground/5 border border-border/10 text-foreground font-mono text-sm text-right placeholder:text-foreground/20 focus:outline-none focus:border-teal/50 transition-all duration-200"
                    />
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={entries.length <= 2}
                      className="p-1.5 rounded-lg text-foreground/20 hover:text-red-400 hover:bg-red-400/8 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-border/5 flex justify-end">
              <div className="text-right space-y-1">
                <div className="flex items-center gap-8 text-sm">
                  <span className="text-foreground/40">Total Debits</span>
                  <span className="font-mono font-semibold text-foreground w-32 text-right">{formatCurrency(totalDebits, currency)}</span>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <span className="text-foreground/40">Total Credits</span>
                  <span className="font-mono font-semibold text-foreground w-32 text-right">{formatCurrency(totalCredits, currency)}</span>
                </div>
                <div className="flex items-center gap-8 text-sm pt-2 border-t border-border/5">
                  <span className="text-foreground/40">Difference</span>
                  <span className={`font-mono font-bold w-32 text-right ${isBalanced ? 'text-teal' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits), currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-400/8 border border-red-400/20 text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !isBalanced || !hasAmounts}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {isPending ? 'Saving…' : 'Save Voucher'}
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-border/10 text-foreground/60 hover:text-foreground hover:border-border/20 text-sm font-medium transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}