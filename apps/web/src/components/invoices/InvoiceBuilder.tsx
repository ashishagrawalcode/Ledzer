'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Trash2, FileText, CheckCircle2, Loader2,
  User, ExternalLink, ChevronDown, Tag,
} from 'lucide-react'
import { calculateTax } from '@/lib/taxEngine'
import { createInvoice } from '@/actions/invoice'
import { useOfflineAction } from '@/hooks/useOfflineAction'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface InvoiceBuilderProps {
  businessId: string
  currency: string
  parties:  { id: string; name: string }[]
  products: { id: string; name: string; salePrice: number | null }[]
}

const TAX_SLABS = [
  { value: '0',      label: '0% — No Tax'        },
  { value: '5',      label: '5%'                 },
  { value: '12',     label: '12%'                },
  { value: '18',     label: '18%'                },
  { value: '28',     label: '28%'                },
  { value: 'custom', label: 'Custom…'            },
]

export function InvoiceBuilder({ businessId, currency, parties, products }: InvoiceBuilderProps) {
  const router = useRouter()
  
  // FIX: Initialize the hook properly
  const { execute, isPending } = useOfflineAction('INVOICE', createInvoice)

  const [partyId, setPartyId]       = useState('cash')
  const [walkInName, setWalkInName] = useState('')
  const [taxSelection, setTaxSelection] = useState('0')
  const [customTaxRate, setCustomTaxRate] = useState(0)
  const [items, setItems] = useState([{ productId: '', description: '', qty: 1, price: 0 }])

  const subtotal      = useMemo(() => items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0), [items])
  const actualTaxRate = taxSelection === 'custom' ? customTaxRate : parseFloat(taxSelection) || 0
  const { totalTax, breakdown } = useMemo(() => calculateTax(subtotal, actualTaxRate), [subtotal, actualTaxRate])
  const netAmount = subtotal + totalTax

  function selectProduct(index: number, productId: string) {
    const p = products.find((x) => x.id === productId)
    if (!p) return
    const next = [...items]
    next[index] = { ...next[index], productId: p.id, description: p.name, price: p.salePrice ?? 0 }
    setItems(next)
  }

  function updateItem(index: number, field: string, value: string | number) {
    const next = [...items]
    next[index] = { ...next[index], [field]: value }
    setItems(next)
  }

  function removeItem(index: number) {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (netAmount <= 0) return toast.error('Invoice total must be greater than zero.')
    if (items.some(i => !i.productId && !i.description)) return toast.error('Please add a product or description.')

    // 3. Prepare the data payload
    const invoiceData = {
      businessId,
      partyId:    partyId === 'cash' ? undefined : partyId,
      walkInName: partyId === 'cash' ? walkInName : undefined,
      items, 
      taxRate: actualTaxRate, 
      totalTax, 
      netAmount,
    }

    // FIX: Just pass the payload
    const res = await execute(invoiceData)

    if (res?.error) {
      toast.error(`Error: ${res.error}`)
    } else {
      if (res?.queued) {
        toast.warning('Invoice saved offline! Will sync soon.')
      } else {
        toast.success('Invoice saved successfully!')
      }
      
      // FIX: check queued instead of offline
      if (!res.queued && res.id) {
        router.push(`/transactions/sales/${res.id}`)
      } else {
        // If offline, clear the form to let them make another one!
        setItems([{ productId: '', description: '', qty: 1, price: 0 }])
        setWalkInName('')
        router.refresh()
      }
    }
  }

  const currSym = { INR: '₹', USD: '$', EUR: '€', GBP: '£', NPR: 'Rs.', CAD: 'C$', AUD: 'A$', AED: 'د.إ', SGD: 'S$' }[currency] ?? currency

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      {/* ── LEFT: Form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 bg-card border border-border rounded-2xl overflow-hidden">
        {/* Customer row */}
        <div className="p-5 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Bill To
            </label>
            <Link
              href="/parties/customers/new"
              target="_blank"
              className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-80 transition-opacity"
            >
              <Plus size={11} />New Customer<ExternalLink size={10} className="opacity-50" />
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <select
                value={partyId}
                onChange={(e) => setPartyId(e.target.value)}
                className="w-full appearance-none px-4 py-3 pr-8 rounded-xl bg-accent border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
              >
                <option value="cash">Walk-in / Cash Sale</option>
                {parties.length > 0 && (
                  <optgroup label="Registered Customers">
                    {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </optgroup>
                )}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {partyId === 'cash' && (
              <div className="relative flex-1 animate-fade-up">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Print name on bill (optional)"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-accent border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Line items */}
        <div className="p-5 space-y-3">
          {/* Desktop header (hidden on mobile) */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-1 pb-2 border-b border-border">
            <div className="col-span-6 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Item / Product</span>
              <Link href="/inventory" target="_blank" className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-80 transition-opacity">
                <Plus size={11} />New Product<ExternalLink size={10} className="opacity-50" />
              </Link>
            </div>
            <div className="col-span-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Qty</div>
            <div className="col-span-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</div>
            <div className="col-span-1" />
          </div>

          {/* Mobile: show "New Product" link above items */}
          <div className="flex sm:hidden items-center justify-between pb-1 border-b border-border">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Line Items</span>
            <Link href="/inventory" target="_blank" className="flex items-center gap-1 text-[11px] font-medium text-primary">
              <Plus size={11} />New Product
            </Link>
          </div>

          {items.map((item, idx) => (
            <div key={idx}>
              {/* ── Desktop row (12-col grid) ── */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-center bg-accent/40 px-3 py-2.5 rounded-xl border border-border">
                <div className="col-span-6 flex gap-2 min-w-0">
                  <div className="relative w-[38%] flex-shrink-0">
                    <select
                      value={item.productId || ''}
                      onChange={(e) => selectProduct(idx, e.target.value)}
                      className="w-full appearance-none bg-accent border border-border rounded-lg py-2 px-2 pr-6 text-xs text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="" disabled>Pick…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-1"
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="number" min="1"
                    value={item.qty || ''}
                    onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                    className="w-full bg-accent border border-border rounded-lg py-2 px-2 text-center text-sm text-foreground focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currSym}</span>
                    <input
                      type="number"
                      value={item.price || ''}
                      onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-accent border border-border rounded-lg py-2 pl-5 pr-2 text-right text-sm text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="col-span-1 flex justify-center">
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 disabled:opacity-20 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* ── Mobile card ── */}
              <div className="sm:hidden bg-accent/40 rounded-xl border border-border p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <select
                      value={item.productId || ''}
                      onChange={(e) => selectProduct(idx, e.target.value)}
                      className="w-full appearance-none bg-accent border border-border rounded-xl py-2.5 px-3 pr-7 text-sm text-foreground focus:outline-none focus:border-primary/50"
                    >
                      <option value="" disabled>Pick from inventory…</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    disabled={items.length === 1}
                    className="p-2 rounded-xl border border-border text-muted-foreground/40 hover:text-destructive hover:border-destructive/30 disabled:opacity-20 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Description or item name"
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  className="w-full bg-accent border border-border rounded-xl py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Quantity</p>
                    <input
                      type="number" min="1"
                      value={item.qty || ''}
                      onChange={(e) => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)}
                      className="w-full bg-accent border border-border rounded-xl py-2.5 px-3 text-sm text-center text-foreground focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Price / Unit</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{currSym}</span>
                      <input
                        type="number"
                        value={item.price || ''}
                        onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full bg-accent border border-border rounded-xl py-2.5 pl-6 pr-3 text-sm text-right text-foreground focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">Line total</span>
                  <span className="font-mono text-sm font-semibold text-foreground tabular-nums">
                    {currSym}{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => setItems([...items, { productId: '', description: '', qty: 1, price: 0 }])}
            className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 px-4 py-2.5 rounded-xl transition-all w-full sm:w-auto justify-center sm:justify-start border border-primary/20"
          >
            <Plus size={13} />Add Line Item
          </button>
        </div>
      </div>

      {/* ── RIGHT: Summary sidebar ────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] bg-card border border-border rounded-2xl p-5 h-fit lg:sticky lg:top-20 space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText size={15} className="text-primary" />Live Summary
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono tabular-nums text-foreground">{currSym}{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-muted-foreground flex-shrink-0">
              <Tag size={13} />
              <span>Tax Slab</span>
            </div>
            <div className="relative">
              <select
                value={taxSelection}
                onChange={(e) => setTaxSelection(e.target.value)}
                className="appearance-none bg-accent border border-border rounded-lg py-1.5 pl-2.5 pr-6 text-foreground text-xs focus:outline-none focus:border-primary/50 transition-all"
              >
                {TAX_SLABS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {taxSelection === 'custom' && (
            <div className="flex items-center justify-between bg-accent rounded-xl px-3 py-2.5 border border-border animate-fade-up">
              <span className="text-xs text-muted-foreground">Custom rate (%)</span>
              <input
                type="number" min="0" step="0.1"
                value={customTaxRate || ''}
                onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 bg-background border border-border rounded-lg py-1 px-2 text-right text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
            </div>
          )}

          {breakdown.map((tax, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{tax.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">+{currSym}{tax.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-border" />

        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground">Net Amount</span>
          <span className={cn('font-mono text-xl font-bold tabular-nums', netAmount > 0 ? 'text-primary' : 'text-muted-foreground')}>
            {currSym}{netAmount.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || netAmount <= 0}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
        >
          {isPending
            ? <Loader2 size={17} className="animate-spin" />
            : <><CheckCircle2 size={17} />Save &amp; Generate Bill</>}
        </button>

        {items.length > 0 && (
          <p className="text-center text-[11px] text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} · subtotal {currSym}{subtotal.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  )
}