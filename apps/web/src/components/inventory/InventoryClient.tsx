'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  Package, Plus, Search, AlertTriangle, TrendingDown,
  TrendingUp, Edit2, Trash2, X, Save, Loader2, Filter,
  BarChart3, Tag, Hash, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createProduct, updateProduct, deleteProduct } from '@/actions/inventory'
import { ExportDropdown } from '@/components/shared/ExportDropdown'
import { PageHeader } from '@/components/shared/PageHeader'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  sku: string | null
  unit: string | null
  stock: number | null
  reorderLevel: number | null
  salePrice: number | null
  purchasePrice: number | null
  taxRate: number | null
}

interface InventoryClientProps {
  products: Product[]
  currency: string
  search: string
}

// ─── Currency helper ──────────────────────────────────────────────────────────
function fmt(amount: number | null, currency: string) {
  if (amount === null) return <span className="text-muted-foreground">N/A</span>
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount)
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mb-4 border border-border">
        <Package size={28} className="text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground mb-1">
        {search ? 'No products found' : 'No products yet'}
      </p>
      <p className="text-sm text-muted-foreground max-w-xs">
        {search
          ? `No products match "${search}". Try a different search.`
          : 'Add your first product to start tracking inventory.'}
      </p>
    </div>
  )
}

// ─── Stock Badge ──────────────────────────────────────────────────────────────
function StockBadge({ stock, reorderLevel }: { stock: number | null; reorderLevel: number | null }) {
  if (stock === null) return <span className="text-muted-foreground text-sm">N/A</span>
  const isLow = reorderLevel !== null && stock <= reorderLevel
  const isOut = stock === 0
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
      isOut
        ? 'bg-destructive/10 text-destructive border border-destructive/20'
        : isLow
        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        : 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
    )}>
      {isOut ? <TrendingDown size={11} /> : isLow ? <AlertTriangle size={11} /> : <TrendingUp size={11} />}
      {stock}
    </span>
  )
}

// ─── Product Form (Create / Edit) ─────────────────────────────────────────────
interface ProductFormProps {
  product?: Product
  currency: string
  onClose: () => void
}

function ProductForm({ product, currency, onClose }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    sku: product?.sku ?? '',
    unit: product?.unit ?? '',
    stock: product?.stock?.toString() ?? '',
    reorderLevel: product?.reorderLevel?.toString() ?? '',
    salePrice: product?.salePrice?.toString() ?? '',
    purchasePrice: product?.purchasePrice?.toString() ?? '',
    taxRate: product?.taxRate?.toString() ?? '',
  })

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit() {
    if (!form.name.trim()) { setError('Product name is required.'); return }
    setError(null)
    startTransition(async () => {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        unit: form.unit.trim() || null,
        stock: form.stock ? parseFloat(form.stock) : null,
        reorderLevel: form.reorderLevel ? parseFloat(form.reorderLevel) : null,
        salePrice: form.salePrice ? parseFloat(form.salePrice) : null,
        purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : null,
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
      }
      const res = isEdit
        ? await updateProduct(product.id, payload)
        : await createProduct(payload)
      if (res.success) { onClose() }
      else { setError(res.error ?? 'Something went wrong.') }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full sm:max-w-xl bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package size={15} className="text-primary" />
            </div>
            <h2 className="font-semibold text-foreground text-sm">
              {isEdit ? 'Edit Product' : 'New Product'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="settings-label">Product Name *</label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Basmati Rice 5kg"
              className="settings-input"
            />
          </div>

          {/* SKU + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="settings-label">SKU / Code</label>
              <input
                value={form.sku}
                onChange={set('sku')}
                placeholder="e.g. RICE-5KG"
                className="settings-input font-mono"
              />
            </div>
            <div>
              <label className="settings-label">Unit</label>
              <select value={form.unit} onChange={set('unit')} className="settings-input">
                <option value="">— Select —</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="l">Litres (l)</option>
                <option value="ml">Millilitres (ml)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="dozen">Dozen</option>
                <option value="m">Metres (m)</option>
              </select>
            </div>
          </div>

          {/* Stock + Reorder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="settings-label">Opening Stock</label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={set('stock')}
                placeholder="0"
                className="settings-input"
              />
            </div>
            <div>
              <label className="settings-label">Reorder Level</label>
              <input
                type="number"
                min="0"
                value={form.reorderLevel}
                onChange={set('reorderLevel')}
                placeholder="Alert below..."
                className="settings-input"
              />
            </div>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="settings-label">Sale Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
                  {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.salePrice}
                  onChange={set('salePrice')}
                  placeholder="0.00"
                  className="settings-input pl-7"
                />
              </div>
            </div>
            <div>
              <label className="settings-label">Purchase Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
                  {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={set('purchasePrice')}
                  placeholder="0.00"
                  className="settings-input pl-7"
                />
              </div>
            </div>
          </div>

          {/* Tax Rate */}
          <div>
            <label className="settings-label">GST Tax Rate (%)</label>
            <select value={form.taxRate} onChange={set('taxRate')} className="settings-input">
              <option value="">Exempt / N/A</option>
              <option value="0">0% — Nil rated</option>
              <option value="5">5% — Essential goods</option>
              <option value="12">12% — Standard</option>
              <option value="18">18% — Standard</option>
              <option value="28">28% — Luxury goods</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow disabled:opacity-50"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isPending ? 'Saving…' : isEdit ? 'Update' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ product, onClose }: { product: Product; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteProduct(product.id)
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
          <Trash2 size={20} className="text-destructive" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Delete Product?</p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{product.name}</span> will be permanently removed.
            This cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InventoryClient({ products, currency, search }: InventoryClientProps) {
  const router = useRouter()
  const searchRef = useRef<HTMLInputElement>(null)
  const [searchVal, setSearchVal] = useState(search)
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct_, setDeleteProduct_] = useState<Product | null>(null)

  // Stats
  const totalProducts = products.length
  const lowStock = products.filter(p => p.reorderLevel !== null && p.stock !== null && p.stock <= p.reorderLevel && p.stock > 0).length
  const outOfStock = products.filter(p => p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + (p.stock ?? 0) * (p.salePrice ?? 0), 0)

  // Filter
  const filtered = products.filter(p => {
    if (filter === 'low') return p.reorderLevel !== null && p.stock !== null && p.stock <= p.reorderLevel && p.stock > 0
    if (filter === 'out') return p.stock === 0
    return true
  })

  function handleSearch(val: string) {
    setSearchVal(val)
    const params = new URLSearchParams()
    if (val.trim()) params.set('search', val.trim())
    router.push(`/inventory?${params.toString()}`)
  }

  const currSymbol = { INR: '₹', USD: '$', EUR: '€', GBP: '£' }[currency] ?? currency

  return (
    <>
      {/* 1. NEW: The Header is now inside the Client Component! */}
      <PageHeader
        title="Inventory"
        subtitle={`${products.length} product${products.length !== 1 ? 's' : ''}${lowStock > 0 ? ` · ${lowStock} low stock` : ''}`}
        badge="Inventory"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={products} filename="Inventory_Status" />
           
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Products', value: totalProducts, icon: Package, color: 'text-primary' },
          { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'text-amber-500' },
          { label: 'Out of Stock', value: outOfStock, icon: TrendingDown, color: 'text-destructive' },
          {
            label: 'Inventory Value',
            value: new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(totalValue),
            icon: BarChart3,
            color: 'text-green-500',
          },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <s.icon size={17} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              <p className="font-bold text-foreground text-base leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={searchRef}
            value={searchVal}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products or SKU…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-accent border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all"
          />
          {searchVal && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-accent border border-border rounded-xl p-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
                filter === f
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {f === 'all' ? 'All' : f === 'low' ? `Low (${lowStock})` : `Out (${outOfStock})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <EmptyState search={searchVal} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-accent/40">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sale Price</th>
                    <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purchase</th>
                    <th className="text-center px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tax</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-accent/30 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Package size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground leading-tight">{p.name}</p>
                            {p.unit && <p className="text-xs text-muted-foreground mt-0.5">per {p.unit}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-muted-foreground bg-accent px-2 py-1 rounded-md">
                          {p.sku ?? 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StockBadge stock={p.stock} reorderLevel={p.reorderLevel} />
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-foreground">
                        {fmt(p.salePrice, currency)}
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {fmt(p.purchasePrice, currency)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {p.taxRate !== null
                          ? <span className="text-xs font-medium text-muted-foreground">{p.taxRate}%</span>
                          : <span className="text-xs text-muted-foreground">N/A</span>
                        }
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditProduct(p)}
                            className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteProduct_(p)}
                            className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm leading-tight truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">{p.sku ?? 'No SKU'}</p>
                    </div>
                  </div>
                  <StockBadge stock={p.stock} reorderLevel={p.reorderLevel} />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Sale</p>
                    <p className="text-sm font-medium text-foreground">{fmt(p.salePrice, currency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Purchase</p>
                    <p className="text-sm text-muted-foreground">{fmt(p.purchasePrice, currency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Tax</p>
                    <p className="text-sm text-muted-foreground">{p.taxRate !== null ? `${p.taxRate}%` : 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditProduct(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border hover:bg-accent text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteProduct_(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-destructive/20 hover:bg-destructive/10 text-xs font-medium text-destructive transition-all"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {(showForm || editProduct) && (
        <ProductForm
          product={editProduct ?? undefined}
          currency={currency}
          onClose={() => { setShowForm(false); setEditProduct(null) }}
        />
      )}
      {deleteProduct_ && (
        <DeleteConfirm
          product={deleteProduct_}
          onClose={() => setDeleteProduct_(null)}
        />
      )}
    </>
  )
}