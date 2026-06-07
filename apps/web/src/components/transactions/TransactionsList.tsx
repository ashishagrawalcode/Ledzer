'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useTransition, useCallback, useRef, useEffect } from 'react'
import {
  Search, ChevronLeft, ChevronRight, ExternalLink,
  MoreHorizontal, Pencil, Trash2, Loader2, X, Check, AlertTriangle, 
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, debounce } from '@/lib/utils'
import { StatusBadge, getVoucherStatusVariant, getVoucherTypeLabel } from '@/components/shared/StatusBadge'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { DataTable } from '@/components/shared/DataTable'
import { usePendingItems } from '@/hooks/usePendingItems'
import { toast } from 'sonner'
import { deleteVoucher, updateVoucher } from '@/actions/vouchers'

interface VoucherRow {
  id: string
  number: string
  date: Date
  type: string
  partyName: string | null
  amount: number
  notes: string | null
  taxRate?: number
  totalTax?: number
  businessId: string
}

interface TransactionsListProps {
  vouchers: VoucherRow[]
  currency: string
  total: number
  page: number
  pageSize: number
  search: string
  baseHref: string
  voucherType: string
  businessId: string
}

// ─── Tiny hook: close on outside click ───────────────────────────────────────
function useOutsideClick(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [ref, onClose])
}

// ─── Edit Popover ─────────────────────────────────────────────────────────────
interface EditPopoverProps {
  row: VoucherRow
  onClose: () => void
  onSaved: () => void
  currency: string
}

function EditPopover({ row, onClose, onSaved, currency }: EditPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, onClose)

  const [date,    setDate]    = useState(new Date(row.date).toISOString().split('T')[0])
  const [notes,   setNotes]   = useState(row.notes ?? '')
  const [amount,  setAmount]  = useState(String(row.amount))
  const [taxRate, setTaxRate] = useState(String(row.taxRate ?? 0))
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const currSym = { INR: '₹', USD: '$', EUR: '€', GBP: '£', NPR: 'Rs.', CAD: 'C$', AUD: 'A$' }[currency] ?? currency

  async function handleSave() {
    const parsedAmount  = parseFloat(amount)
    const parsedTaxRate = parseFloat(taxRate) || 0

    if (!date)               { setError('Date is required.');          return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Enter a valid amount.'); return }

    const totalTax = (parsedAmount * parsedTaxRate) / 100
    const netAmount = parsedAmount + totalTax

    setSaving(true)
    setError(null)

    const result = await updateVoucher(row.id, row.businessId, {
      date:      new Date(date),
      notes:     notes.trim() || null,
      netAmount,
      taxRate:   parsedTaxRate,
      totalTax,
    })

    setSaving(false)

    if (result?.error) {
      setError(result.error)
    } else {
      toast.success('Transaction updated!')
      onSaved()
      onClose()
    }
  }

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-full max-w-sm glass border border-border/10 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground text-sm">Edit Transaction</p>
            <p className="text-xs text-foreground/40 font-mono mt-0.5">{row.number}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-foreground/8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <div className="space-y-3">
          {/* Date */}
          <div>
            <label className="block text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => { setDate(e.target.value); setError(null) }}
              className="w-full px-3 py-2.5 rounded-xl bg-foreground/5 border border-border/10 text-foreground text-sm focus:outline-none focus:border-teal/50 transition-all"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">Amount (before tax)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm select-none">{currSym}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(null) }}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-foreground/5 border border-border/10 text-foreground font-mono text-sm focus:outline-none focus:border-teal/50 transition-all"
              />
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="block text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">Tax Rate</label>
            <div className="flex gap-1.5">
              {[0, 5, 12, 18, 28].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTaxRate(String(t))}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                    taxRate === String(t)
                      ? 'bg-teal text-navy'
                      : 'bg-foreground/5 border border-border/10 text-foreground/50 hover:text-foreground hover:border-border/20'
                  }`}
                >
                  {t}%
                </button>
              ))}
            </div>
            {/* Net amount preview */}
            {parseFloat(amount) > 0 && (
              <p className="text-[11px] text-foreground/30 mt-1.5 font-mono">
                Net: {currSym}{(parseFloat(amount) * (1 + (parseFloat(taxRate) || 0) / 100)).toFixed(2)}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-semibold text-foreground/40 uppercase tracking-wider mb-1.5">Notes / Description</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional description…"
              className="w-full px-3 py-2.5 rounded-xl bg-foreground/5 border border-border/10 text-foreground text-sm placeholder:text-foreground/20 focus:outline-none focus:border-teal/50 transition-all"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-400/8 border border-red-400/20 text-xs text-red-400">
            <AlertTriangle size={12} />{error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border/10 text-foreground/50 hover:text-foreground text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Popover ───────────────────────────────────────────────────────────
interface DeletePopoverProps {
  row: VoucherRow
  onClose: () => void
  onDeleted: () => void
}

function DeletePopover({ row, onClose, onDeleted }: DeletePopoverProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, onClose)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteVoucher(row.id, row.businessId)
    setDeleting(false)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success(`${row.number} deleted.`)
      onDeleted()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={ref}
        className="relative w-full max-w-xs glass border border-border/10 rounded-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-10 h-10 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center">
          <Trash2 size={17} className="text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">Delete Transaction?</p>
          <p className="text-xs text-foreground/40 mt-1">
            <span className="font-mono text-foreground/60">{row.number}</span> will be permanently removed along with all its accounting entries. This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border/10 text-foreground/50 hover:text-foreground text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-400/90 text-white font-semibold text-sm hover:bg-red-400 transition-all disabled:opacity-50"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────
function RowActions({ row, onEdit, onDelete }: { row: VoucherRow; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick(ref, () => setOpen(false))

  // Pending items can't be edited/deleted (they have no real DB id yet)
  if (row.id.startsWith('pending-')) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-foreground/8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-all"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-40 w-36 glass border border-border/10 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => { setOpen(false); onEdit() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
          >
            <Pencil size={12} />Edit
          </button>
          <button
            onClick={() => { setOpen(false); onDelete() }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-400/8 transition-colors"
          >
            <Trash2 size={12} />Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function TransactionsList({
  vouchers, currency, total, page, pageSize, search, baseHref, voucherType, businessId,
}: TransactionsListProps) {
  const router   = useRouter()
  const pathname = usePathname()
  const [routerPending, startTransition] = useTransition()
  const [searchVal, setSearchVal] = useState(search)
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const isSimple = terminologyMode === 'simple'

  const pendingItems = usePendingItems()
  const totalPages   = Math.ceil(total / pageSize)

  // Active popover state
  const [editRow,   setEditRow]   = useState<VoucherRow | null>(null)
  const [deleteRow, setDeleteRow] = useState<VoucherRow | null>(null)

  // ── Search: debounced URL push ──────────────────────────────────────────────
  const pushSearch = useCallback(
    debounce((q: string) => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (q) params.set('search', q)
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 350),
    [pathname, router]
  )

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value
    setSearchVal(q)
    pushSearch(q)
  }

  function clearSearch() {
    setSearchVal('')
    pushSearch('')
  }

  function goPage(p: number) {
    startTransition(() => {
      const params = new URLSearchParams()
      if (searchVal) params.set('search', searchVal)
      params.set('page', String(p))
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'number',
      header: '#',
      className: 'font-mono text-xs text-foreground/50 w-32',
      render: (row: VoucherRow) => {
        const isRowPending = pendingItems.some((p) => p.data?.number === row.number)
        return (
          <Link
            href={row.id.startsWith('pending-') ? '#' : `${baseHref}/${row.id}`}
            className="hover:text-teal transition-colors duration-150 flex items-center gap-1.5 group"
          >
            <span className="font-mono text-xs">{row.number}</span>
            {isRowPending && (
              <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                Syncing
              </span>
            )}
            {!row.id.startsWith('pending-') && (
              <ExternalLink size={10} className="opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
            )}
          </Link>
        )
      },
    },
    {
      key: 'date',
      header: 'Date',
      className: 'text-foreground/50 text-xs',
      render: (row: VoucherRow) => formatDate(row.date),
    },
    {
      key: 'party',
      header: 'Party',
      render: (row: VoucherRow) => (
        <span className={row.partyName ? 'text-foreground/80' : 'text-foreground/25 italic'}>
          {row.partyName ?? 'N/A'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Description',
      className: 'text-foreground/40 max-w-[200px] truncate',
      render: (row: VoucherRow) => (
        <span className="truncate block max-w-[200px]">{row.notes ?? '—'}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row: VoucherRow) => (
        <StatusBadge
          label={getVoucherTypeLabel(row.type, isSimple)}
          variant={getVoucherStatusVariant(row.type)}
          dot
        />
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row: VoucherRow) => (
        <span className="font-mono font-semibold tabular-nums text-foreground">
          {formatCurrency(row.amount, currency)}
        </span>
      ),
    },
    // Actions column — hidden for pending rows
    {
      key: 'actions',
      header: '',
      className: 'w-10',
      render: (row: VoucherRow) => (
        <RowActions
          row={{ ...row, businessId }}
          onEdit={() => setEditRow({ ...row, businessId })}
          onDelete={() => setDeleteRow({ ...row, businessId })}
        />
      ),
    },
  ]

  return (
    <>
      <div className="space-y-4">
        {/* ── Search bar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 pointer-events-none" />
            <input
              value={searchVal}
              onChange={handleSearch}
              placeholder="Search by number, party, notes…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-foreground/5 border border-border/8 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-teal/40 focus:bg-teal/3 transition-all duration-200"
            />
            {/* Clear button when there's a query */}
            {searchVal ? (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
              >
                <X size={13} />
              </button>
            ) : routerPending ? (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border border-border/20 border-t-teal rounded-full animate-spin" />
            ) : null}
          </div>
          <div className="text-xs text-foreground/30 hidden sm:block">
            {total} result{total !== 1 ? 's' : ''}
            {searchVal && (
              <span className="ml-1 text-teal/60">
                for &quot;{searchVal}&quot;
              </span>
            )}
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────────── */}
        <DataTable
          columns={columns}
          data={vouchers}
          keyExtractor={(r) => r.id}
          rowClassName={() => "group"}
          emptyTitle={`No ${getVoucherTypeLabel(voucherType, isSimple).toLowerCase()} found`}
          emptyDescription={
            searchVal
              ? `No results for "${searchVal}" — try a different term.`
              : 'Start by creating your first transaction.'
          }
          emptyAction={
            searchVal ? (
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/10 text-foreground/50 hover:text-foreground text-sm transition-all"
              >
                <X size={13} />Clear search
              </button>
            ) : (
              <Link
                href={`${baseHref}/new`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200"
              >
                Create first transaction
              </Link>
            )
          }
        />

        {/* ── Pagination ───────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground/30">
              Page {page} of {totalPages} · {total} records
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1 || routerPending}
                className="p-2 rounded-lg border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => goPage(p)}
                    disabled={routerPending}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150 ${
                      p === page
                        ? 'bg-teal text-navy font-bold'
                        : 'border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= totalPages || routerPending}
                className="p-2 rounded-lg border border-border/8 text-foreground/40 hover:text-foreground hover:border-border/15 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Popovers (rendered outside the table to avoid z-index issues) ──── */}
      {editRow && (
        <EditPopover
          row={editRow}
          currency={currency}
          onClose={() => setEditRow(null)}
          onSaved={() => router.refresh()}
        />
      )}
      {deleteRow && (
        <DeletePopover
          row={deleteRow}
          onClose={() => setDeleteRow(null)}
          onDeleted={() => router.refresh()}
        />
      )}
    </>
  )
}