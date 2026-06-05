'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDownCircle, ArrowUpCircle, Calendar, FileText,
  Loader2, Save, AlertTriangle, CheckCircle, Hash
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createReceiptPayment } from '@/actions/receiptPayment'

type Mode = 'RECEIPT' | 'PAYMENT'

interface Party {
  id: string
  name: string
  ledgerId: string
}

interface Ledger {
  id: string
  name: string
}

interface ReceiptPaymentFormProps {
  mode: Mode
  parties: Party[]                // customers (Receipt) or suppliers (Payment)
  expenseLedgers?: Ledger[]        // only for Payment
  bankCashLedgers: Ledger[]        // Cash/Bank accounts
  nextNumber: string
  currency: string
}

export function ReceiptPaymentForm({
  mode, parties, expenseLedgers = [], bankCashLedgers, nextNumber, currency,
}: ReceiptPaymentFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isReceipt = mode === 'RECEIPT'
  const Icon = isReceipt ? ArrowDownCircle : ArrowUpCircle
  const accentColor = isReceipt ? 'text-blue-500' : 'text-amber-500'

  // Form state
  const [form, setForm] = useState({
    number: nextNumber,
    date: new Date().toISOString().split('T')[0],
    partyLedgerId: '',  // customer/supplier ledger ID
    bankCashLedgerId: '',
    amount: '',
    notes: '',
    paymentMode: 'CASH' as 'CASH' | 'BANK' | 'UPI' | 'CHEQUE',
  })

  // For Payment: also allow paying to expense ledger directly (no party)
  const [payeeType, setPayeeType] = useState<'PARTY' | 'EXPENSE'>('PARTY')

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.partyLedgerId && payeeType === 'PARTY') { setError('Please select a party.'); return }
    if (!form.bankCashLedgerId) { setError('Please select a cash/bank account.'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount.'); return }

    setError(null)
    startTransition(async () => {
      const res = await createReceiptPayment({
        type: mode,
        number: form.number.trim(),
        date: form.date,
        partyLedgerId: payeeType === 'PARTY' ? form.partyLedgerId : null,
        expenseLedgerId: payeeType === 'EXPENSE' ? form.partyLedgerId : null,
        bankCashLedgerId: form.bankCashLedgerId,
        amount: parseFloat(form.amount),
        notes: form.notes.trim() || null,
        paymentMode: form.paymentMode,
      })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => router.push(isReceipt ? '/transactions/receipts' : '/transactions/payments'), 1200)
      } else {
        setError(res.error ?? 'Something went wrong.')
      }
    })
  }

  const currSymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] ?? currency

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center',
          isReceipt ? 'bg-blue-500/10' : 'bg-amber-500/10'
        )}>
          <Icon size={18} className={accentColor} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">
            {isReceipt ? 'Receipt Voucher' : 'Payment Voucher'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isReceipt ? 'Record money received from a customer' : 'Record money paid to a supplier or for an expense'}
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle size={15} />
            {isReceipt ? 'Receipt' : 'Payment'} recorded! Redirecting…
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Voucher No + Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="settings-label">
              <Hash size={11} className="inline mr-1" />Voucher No.
            </label>
            <input
              value={form.number}
              onChange={set('number')}
              className="settings-input font-mono"
              placeholder={isReceipt ? 'REC-001' : 'PAY-001'}
            />
          </div>
          <div>
            <label className="settings-label">
              <Calendar size={11} className="inline mr-1" />Date
            </label>
            <input type="date" value={form.date} onChange={set('date')} className="settings-input" />
          </div>
        </div>

        {/* Payment mode tabs for Payment only */}
        {!isReceipt && (
          <div>
            <label className="settings-label">Payee Type</label>
            <div className="flex gap-2">
              {(['PARTY', 'EXPENSE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setPayeeType(t); setForm(f => ({ ...f, partyLedgerId: '' })) }}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150',
                    payeeType === t
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-border bg-accent/40 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t === 'PARTY' ? '🏪 Supplier / Party' : '📄 Direct Expense'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Party / Expense Ledger */}
        <div>
          <label className="settings-label">
            {isReceipt
              ? 'Received From (Customer)'
              : payeeType === 'PARTY'
              ? 'Paid To (Supplier)'
              : 'Expense Account'}
          </label>
          <select
            value={form.partyLedgerId}
            onChange={set('partyLedgerId')}
            className="settings-input"
          >
            <option value="">— Select —</option>
            {(isReceipt || payeeType === 'PARTY')
              ? parties.map(p => (
                  <option key={p.ledgerId} value={p.ledgerId}>{p.name}</option>
                ))
              : expenseLedgers.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))
            }
          </select>
          {((isReceipt ? parties : payeeType === 'PARTY' ? parties : expenseLedgers).length === 0) && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
              {isReceipt
                ? 'No customers found. Add a customer first.'
                : payeeType === 'PARTY'
                ? 'No suppliers found. Add a supplier first.'
                : 'No expense ledgers found.'}
            </p>
          )}
        </div>

        {/* Cash/Bank Account */}
        <div>
          <label className="settings-label">
            {isReceipt ? 'Deposited Into' : 'Paid From'} (Cash / Bank)
          </label>
          <select
            value={form.bankCashLedgerId}
            onChange={set('bankCashLedgerId')}
            className="settings-input"
          >
            <option value="">— Select Account —</option>
            {bankCashLedgers.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {bankCashLedgers.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1.5">
              No Cash/Bank ledgers found. Create them under Masters → Ledgers.
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="settings-label">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm select-none">
              {currSymbol}
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={set('amount')}
              placeholder="0.00"
              className="settings-input pl-8"
            />
          </div>
        </div>

        {/* Payment Mode */}
        <div>
          <label className="settings-label">Payment Method</label>
          <div className="grid grid-cols-4 gap-2">
            {(['CASH', 'BANK', 'UPI', 'CHEQUE'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setForm(f => ({ ...f, paymentMode: m }))}
                className={cn(
                  'py-2.5 rounded-xl border text-xs font-semibold transition-all duration-150',
                  form.paymentMode === m
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-accent/40 text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'CASH' ? '💵 Cash' : m === 'BANK' ? '🏦 NEFT' : m === 'UPI' ? '📱 UPI' : '🧾 Cheque'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="settings-label">
            <FileText size={11} className="inline mr-1" />Notes / Narration
          </label>
          <textarea
            value={form.notes}
            onChange={set('notes')}
            rows={3}
            placeholder={isReceipt
              ? 'e.g. Received against INV-001 via NEFT...'
              : 'e.g. Monthly rent payment for June 2026...'}
            className="settings-input resize-none"
          />
        </div>

        {/* Double-entry preview */}
        <div className="rounded-xl bg-accent/40 border border-border px-4 py-3.5 space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accounting Entry Preview</p>
          <div className="space-y-1 text-xs font-mono">
            {isReceipt ? (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground">Dr: {bankCashLedgers.find(l => l.id === form.bankCashLedgerId)?.name ?? 'Cash/Bank'}</span>
                  <span className="text-green-600 dark:text-green-400">{form.amount ? `${currSymbol}${form.amount}` : '—'}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-muted-foreground">Cr: {parties.find(p => p.ledgerId === form.partyLedgerId)?.name ?? 'Customer'}</span>
                  <span className="text-red-500">{form.amount ? `${currSymbol}${form.amount}` : '—'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-foreground">
                    Dr: {payeeType === 'PARTY'
                      ? parties.find(p => p.ledgerId === form.partyLedgerId)?.name ?? 'Supplier'
                      : expenseLedgers.find(l => l.id === form.partyLedgerId)?.name ?? 'Expense'
                    }
                  </span>
                  <span className="text-green-600 dark:text-green-400">{form.amount ? `${currSymbol}${form.amount}` : '—'}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-muted-foreground">Cr: {bankCashLedgers.find(l => l.id === form.bankCashLedgerId)?.name ?? 'Cash/Bank'}</span>
                  <span className="text-red-500">{form.amount ? `${currSymbol}${form.amount}` : '—'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || success}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-glow disabled:opacity-50',
            isReceipt
              ? 'bg-blue-500 text-foreground hover:bg-blue-600'
              : 'bg-amber-500 text-foreground hover:bg-amber-600'
          )}
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {isPending ? 'Saving…' : isReceipt ? 'Record Receipt' : 'Record Payment'}
        </button>
      </div>
    </div>
  )
}