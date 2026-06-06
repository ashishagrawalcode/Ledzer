'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Trash2, Save, AlertTriangle, CheckCircle, Hash, 
  Calendar, FileText, Loader2, TrendingUp, ShoppingCart, 
  ArrowRightLeft, BookOpen, FileSpreadsheet
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { createVoucher } from '@/actions/vouchers'
import { useOfflineAction } from '@/hooks/useOfflineAction'

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
  nextNumber?: string // Added so you can pass the generated number!
}

function genId() {
  return Math.random().toString(36).slice(2, 9)
}

const VOUCHER_META: Record<string, { label: string, desc: string, icon: any, color: string, bg: string }> = {
  SALES: { label: 'Sales Invoice', desc: 'Record a sale to a customer', icon: TrendingUp, color: 'text-teal', bg: 'bg-teal/10' },
  PURCHASE: { label: 'Purchase Bill', desc: 'Record a purchase from a supplier', icon: ShoppingCart, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  JOURNAL: { label: 'Journal Entry', desc: 'Record adjustments and non-cash entries', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  CONTRA: { label: 'Contra Entry', desc: 'Transfer funds between Bank and Cash', icon: ArrowRightLeft, color: 'text-blue-500', bg: 'bg-blue-500/10' },
}

export function VoucherForm({
  voucherType, businessId, currency, parties, ledgers, returnHref, initialPartyId, nextNumber = ''
}: VoucherFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const meta = VOUCHER_META[voucherType] || { label: 'Voucher', desc: 'Accounting entry', icon: FileSpreadsheet, color: 'text-primary', bg: 'bg-primary/10' }
  const Icon = meta.icon
  const currSymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] ?? currency

  // Form State
  const [form, setForm] = useState({
    number: nextNumber,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [entries, setEntries] = useState<EntryLine[]>([
    { id: genId(), ledgerId: initialPartyId ?? '', type: 'DEBIT', amount: '' },
    { id: genId(), ledgerId: '', type: 'CREDIT', amount: '' },
  ])

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

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

  const { execute, isSyncing } = useOfflineAction();

  async function handleSubmit() {
  setError(null);
  
  // 1. Validation Logic
  if (!isBalanced) { setError('Debits must equal Credits.'); return; }
  if (!hasAmounts) { setError('Please enter at least one valid amount.'); return; }
  if (entries.some((e) => !e.ledgerId)) { setError('Please select a ledger.'); return; }

  // 2. Prepare the payload
  const voucherData = {
    businessId,
    type: voucherType,
    date: new Date(form.date),
    notes: form.notes.trim() || undefined,
    entries: entries.map((e) => ({
      ledgerId: e.ledgerId,
      type: e.type as 'DEBIT' | 'CREDIT',
      amount: parseFloat(e.amount) || 0,
    })),
  };

  // 3. Execute via the Offline-Aware Hook
  startTransition(async () => {
    const result = await execute(voucherType, voucherData, createVoucher);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      
      if (!result.offline) {
        setTimeout(() => {
          router.push(returnHref);
          router.refresh();
        }, 1200);
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    }
  });
}

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', meta.bg)}>
            <Icon size={18} className={meta.color} />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">{meta.label}</p>
            <p className="text-xs text-muted-foreground">{meta.desc}</p>
          </div>
        </div>
        <div className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors',
          isBalanced && hasAmounts ? 'bg-teal/10 text-teal border border-teal/20' : 'bg-accent text-muted-foreground border border-border'
        )}>
          {isBalanced && hasAmounts ? <><CheckCircle size={12}/> Balanced</> : 'Unbalanced'}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle size={15} />
            Voucher saved successfully! Redirecting…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Voucher Meta Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Hash size={12} /> Voucher No.
            </label>
            <input
              value={form.number}
              onChange={set('number')}
              className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 transition-all"
              placeholder="Auto-generated if empty"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Calendar size={12} /> Date
            </label>
            <input 
              type="date" 
              value={form.date} 
              onChange={set('date')} 
              className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all" 
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText size={12} /> Notes / Narration
          </label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={2}
            placeholder="e.g. Sales invoice for electronics..."
            className="w-full px-4 py-2.5 rounded-xl bg-foreground/5 border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
          />
        </div>

        {/* Double-Entry Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ledger Entries (Double-Entry)
            </label>
            <button
              onClick={addEntry}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Plus size={13} /> Add row
            </button>
          </div>

          <div className="rounded-xl border border-border bg-accent/20 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-accent/40 border-b border-border text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              <div className="col-span-5">Account / Ledger</div>
              <div className="col-span-3">Type (Dr/Cr)</div>
              <div className="col-span-3 text-right">Amount ({currSymbol})</div>
              <div className="col-span-1" />
            </div>

            {/* Table Body */}
            <div className="p-2 space-y-2">
              {entries.map((entry) => (
                <div key={entry.id} className="grid grid-cols-12 gap-3 items-center">
                  {/* Ledger Select */}
                  <div className="col-span-5">
                    <select
                      value={entry.ledgerId}
                      onChange={(e) => updateEntry(entry.id, 'ledgerId', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-sm focus:outline-none focus:border-primary/50 transition-all"
                    >
                      <option value="">— Select Ledger —</option>
                      {parties.length > 0 && (
                        <optgroup label="Parties">
                          {parties.map((p) => (
                            <option key={p.ledgerId} value={p.ledgerId}>{p.name} ({p.type})</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Ledgers">
                        {ledgers.map((l) => (
                          <option key={l.id} value={l.id}>{l.name} ({l.group})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  {/* Dr/Cr Toggle */}
                  <div className="col-span-3">
                    <div className="flex rounded-lg border border-border overflow-hidden bg-background">
                      <button
                        type="button"
                        onClick={() => updateEntry(entry.id, 'type', 'DEBIT')}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-semibold transition-colors',
                          entry.type === 'DEBIT' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:bg-accent'
                        )}
                      >
                        Dr
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEntry(entry.id, 'type', 'CREDIT')}
                        className={cn(
                          'flex-1 py-1.5 text-xs font-semibold transition-colors',
                          entry.type === 'CREDIT' ? 'bg-red-500/20 text-red-500' : 'text-muted-foreground hover:bg-accent'
                        )}
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
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border font-mono text-sm text-right focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  {/* Delete */}
                  <div className="col-span-1 flex justify-center">
                    <button
                      onClick={() => removeEntry(entry.id)}
                      disabled={entries.length <= 2}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Footer */}
            <div className="bg-accent/40 border-t border-border px-4 py-3">
              <div className="flex justify-end items-end flex-col gap-1.5 text-sm">
                <div className="flex items-center gap-6 w-48 justify-between">
                  <span className="text-muted-foreground">Total Dr</span>
                  <span className="font-mono font-medium">{formatCurrency(totalDebits, currency)}</span>
                </div>
                <div className="flex items-center gap-6 w-48 justify-between">
                  <span className="text-muted-foreground">Total Cr</span>
                  <span className="font-mono font-medium">{formatCurrency(totalCredits, currency)}</span>
                </div>
                <div className="flex items-center gap-6 w-48 justify-between pt-1.5 border-t border-border">
                  <span className="text-muted-foreground font-medium">Difference</span>
                  <span className={cn(
                    'font-mono font-bold',
                    isBalanced ? 'text-teal' : 'text-red-500'
                  )}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits), currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-card">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || isSyncing || success || !isBalanced || !hasAmounts}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending || isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isPending || isSyncing ? 'Processing…' : 'Save Voucher'}
        </button>
      </div>
    </div>
  )
}