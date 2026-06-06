'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, FileText, CheckCircle2, Loader2, User, ExternalLink } from 'lucide-react'
import { calculateTax } from '@/lib/taxEngine'
import { createInvoice } from '@/actions/invoice'

interface InvoiceBuilderProps {
  businessId: string
  currency: string
  parties: any[]
  products: any[]
}

export function InvoiceBuilder({ businessId, currency, parties, products }: InvoiceBuilderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Customer vs Walk-in State
  const [partyId, setPartyId] = useState('cash')
  const [walkInName, setWalkInName] = useState('')
  
  // Custom Tax State Logic
  const [taxSelection, setTaxSelection] = useState<string>("0")
  const [customTaxRate, setCustomTaxRate] = useState<number>(0)
  
  const [items, setItems] = useState([{ productId: '', description: '', qty: 1, price: 0 }])

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0), [items])
  const actualTaxRate = taxSelection === 'custom' ? customTaxRate : parseFloat(taxSelection) || 0
  const { totalTax, breakdown } = useMemo(() => calculateTax(subtotal, actualTaxRate), [subtotal, actualTaxRate])
  const netAmount = subtotal + totalTax

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      const newItems = [...items]
      newItems[index] = { 
        ...newItems[index], 
        productId: product.id, 
        description: product.name, 
        price: product.salePrice || 0 
      }
      setItems(newItems)
    }
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (netAmount <= 0) return alert('Invoice total must be greater than zero.')
    
    setLoading(true)
    const res = await createInvoice({ 
      businessId, 
      partyId: partyId === 'cash' ? undefined : partyId, 
      walkInName: partyId === 'cash' ? walkInName : undefined,
      items, taxRate: actualTaxRate, totalTax, netAmount 
    })
    setLoading(false)

    if (res.success) {
      router.push(`/transactions/sales/${res.id}`) 
    } else {
      alert(`Error: ${res.error}`)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 bg-[#050505] border border-white/5 rounded-2xl p-6 shadow-2xl">
        
        {/* Customer Selection Logic */}
        <div className="mb-8 flex gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest">Billing Account</label>
              
              {/* NEW: Quick Add Customer Link */}
              <Link 
                href="/parties/customers/new" 
                target="_blank" 
                className="flex items-center gap-1 text-[11px] font-medium text-teal hover:text-teal-hover transition-colors"
              >
                <Plus size={12} /> New Customer <ExternalLink size={10} className="opacity-50" />
              </Link>
            </div>
            
            <select 
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-teal/50"
              value={partyId} onChange={(e) => setPartyId(e.target.value)}
            >
              <option value="cash" className="bg-[#0a0a0a]">Walk-in / Cash Sale (Default)</option>
              <optgroup label="Registered Customers" className="bg-[#0a0a0a]">
                {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </optgroup>
            </select>
          </div>

          {/* Walk-in Name Input */}
          {partyId === 'cash' && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4">
              <label className="block text-xs font-semibold text-white/40 mb-3 uppercase tracking-widest flex items-center gap-1"><User size={12}/> Print Name on Bill</label>
              <input 
                type="text" placeholder="e.g. Ashish Agrawal (Optional)" 
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3.5 text-white text-sm outline-none focus:border-teal/50"
                value={walkInName} onChange={(e) => setWalkInName(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Dynamic Line Items with Inventory Sync */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-white/30 uppercase tracking-widest px-2 pb-2 border-b border-white/5">
            <div className="col-span-6 flex items-center justify-between">
              <span>Item / Product</span>
              
              {/* NEW: Quick Add Inventory Link */}
              <Link 
                href="/inventory" 
                target="_blank" 
                className="flex items-center gap-1 text-teal hover:text-teal-hover transition-colors normal-case tracking-normal text-[11px] font-medium"
              >
                <Plus size={12} /> New Product <ExternalLink size={10} className="opacity-50" />
              </Link>
            </div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Price</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center bg-white/[0.02] p-2 rounded-xl border border-white/5">
              <div className="col-span-6 flex gap-2">
                {/* Inventory Dropdown */}
                <select 
                  className="w-1/3 bg-black/50 border border-white/5 rounded-lg p-2 text-xs text-white outline-none focus:border-teal/50"
                  onChange={(e) => handleProductSelect(index, e.target.value)}
                  value={item.productId || ""}
                >
                  <option value="" disabled>Inventory...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {/* Manual Description Fallback */}
                <input type="text" placeholder="Description" className="w-2/3 bg-transparent text-sm text-white outline-none px-2"
                  value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} />
              </div>
              <div className="col-span-2">
                <input type="number" min="1" className="w-full bg-black/50 border border-white/5 rounded-lg p-2 text-center text-sm text-white outline-none"
                  value={item.qty || ''} onChange={(e) => updateItem(index, 'qty', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-3">
                <input type="number" className="w-full bg-black/50 border border-white/5 rounded-lg p-2 text-right text-sm text-white outline-none"
                  value={item.price || ''} onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-span-1 flex justify-end pr-2">
                <button onClick={() => removeItem(index)} className="text-white/20 hover:text-red-400"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setItems([...items, { productId: '', description: '', qty: 1, price: 0 }])} className="mt-4 flex items-center gap-2 text-xs font-semibold text-teal bg-teal/10 px-4 py-2 rounded-lg hover:bg-teal/20">
          <Plus size={14} /> Add Line Item
        </button>
      </div>

      {/* RIGHT: Live Sidebar */}
      <div className="w-full lg:w-[340px] bg-[#050505] border border-white/5 rounded-2xl p-6 shadow-2xl h-fit lg:sticky lg:top-24">
        <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
          <FileText size={16} className="text-teal" /> Live Summary
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-white/60">
            <span>Subtotal</span>
            <span>{currency} {subtotal.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-3 pb-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Tax Slab</span>
              <select 
                className="bg-white/5 border border-white/10 rounded-lg py-1.5 px-2 text-white outline-none text-right cursor-pointer text-xs focus:border-teal/50"
                value={taxSelection} 
                onChange={(e) => setTaxSelection(e.target.value)}
              >
                <option value="0" className="bg-[#0a0a0a]">0% - No Tax</option>
                <option value="5" className="bg-[#0a0a0a]">5% Slab</option>
                <option value="12" className="bg-[#0a0a0a]">12% Slab</option>
                <option value="18" className="bg-[#0a0a0a]">18% Slab</option>
                <option value="custom" className="bg-[#0a0a0a]">Custom...</option>
              </select>
            </div>

            {taxSelection === 'custom' && (
              <div className="flex items-center justify-between bg-white/[0.02] p-2 rounded-lg border border-white/5">
                <span className="text-white/40 text-xs">Enter Rate (%)</span>
                <input 
                  type="number" min="0" step="0.1"
                  className="w-20 bg-black border border-white/10 rounded p-1 text-right text-xs text-white outline-none focus:border-teal/50"
                  value={customTaxRate || ''} onChange={(e) => setCustomTaxRate(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>

          {breakdown.map((tax, i) => (
            <div key={i} className="flex justify-between text-white/40 text-xs">
              <span>{tax.label}</span>
              <span>+ {currency} {tax.amount.toFixed(2)}</span>
            </div>
          ))}

          <div className="pt-2 flex justify-between items-center mt-4">
            <span className="font-semibold text-white/80">Net Amount</span>
            <span className="font-bold text-teal text-xl">{currency} {netAmount.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={handleSave} disabled={loading || netAmount === 0}
          className="w-full mt-8 flex items-center justify-center gap-2 bg-teal text-navy font-bold py-3.5 rounded-xl hover:bg-teal-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(20,241,149,0.15)]"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Save & Generate Bill</>}
        </button>
      </div>
    </div>
  )
}