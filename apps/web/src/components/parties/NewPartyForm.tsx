'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, Loader2 } from 'lucide-react'
import { createParty } from '@/actions/parties'
import { useOfflineAction } from '@/hooks/useOfflineAction'
import { toast } from 'sonner'

interface NewPartyFormProps {
  businessId: string
  partyType: 'CUSTOMER' | 'SUPPLIER'
  returnHref: string
}

export function NewPartyForm({ businessId, partyType, returnHref }: NewPartyFormProps) {
  const router = useRouter()
  // FIX: Initialize hook with the action type and server action
  const { execute, isPending } = useOfflineAction('PARTY', createParty)
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [gstin, setGstin] = useState('')
  const [openingBalance, setOpeningBalance] = useState('')
  const [openingType, setOpeningType] = useState<'DEBIT' | 'CREDIT'>(partyType === 'CUSTOMER' ? 'DEBIT' : 'CREDIT')

  const label = partyType === 'CUSTOMER' ? 'Customer' : 'Supplier'

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) { 
      setError('Name is required')
      return 
    }
    
    const partyData = {
      businessId,
      name,
      type: partyType,
      email: email || undefined,
      phone: phone || undefined,
      gstin: gstin || undefined,
      openingBalance: openingBalance ? parseFloat(openingBalance) : undefined,
      openingType,
    }

    // FIX: Just pass the payload to execute()
    const result = await execute(partyData)
    
    if (result?.error) { 
      setError(result.error)
      return 
    }
    
    if (result.queued) {
      toast.warning(`${label} saved offline! Will sync soon.`)
    } else {
      toast.success(`${label} saved!`)
    }
    
    router.push(returnHref)
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl border border-border/5 p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">{label} Name *</label>
            <input 
              value={name} 
              onChange={(e) => { setName(e.target.value); setError(null) }} 
              placeholder={`e.g. ${partyType === 'CUSTOMER' ? 'Raj Trading Co.' : 'ABC Suppliers Ltd.'}`}
              autoFocus 
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Phone</label>
            <input 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="+91 98765 43210" 
              type="tel"
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Email</label>
            <input 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="contact@business.com" 
              type="email"
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" 
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">GSTIN <span className="text-foreground/20 font-normal normal-case tracking-normal">(Optional)</span></label>
            <input 
              value={gstin} 
              onChange={(e) => setGstin(e.target.value.toUpperCase())} 
              placeholder="27AAPFU0939F1ZV" 
              maxLength={15}
              className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground font-mono placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" 
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/5">
          <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Opening Balance <span className="text-foreground/20 font-normal normal-case tracking-normal">(Optional)</span></label>
          <div className="flex gap-2">
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              value={openingBalance} 
              onChange={(e) => setOpeningBalance(e.target.value)} 
              placeholder="0.00"
              className="flex-1 px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground font-mono placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 transition-all duration-200" 
            />
            <div className="flex rounded-xl border border-border/10 overflow-hidden">
              {(['DEBIT', 'CREDIT'] as const).map((t) => (
                <button 
                  key={t} 
                  type="button" 
                  onClick={() => setOpeningType(t)}
                  className={`px-4 py-3 text-xs font-semibold transition-all duration-150 ${openingType === t ? (t === 'DEBIT' ? 'bg-teal text-navy' : 'bg-red-400/80 text-foreground') : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'}`}
                >
                  {t === 'DEBIT' ? 'Dr' : 'Cr'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-foreground/20 mt-1.5">
            {partyType === 'CUSTOMER' ? 'Amount this customer already owes you' : 'Amount you already owe this supplier'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-400/8 border border-red-400/20 text-sm text-red-400">
            <AlertCircle size={15} />{error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSubmit} 
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow disabled:opacity-50"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isPending ? 'Saving…' : `Create ${label}`}
          </button>
          <button 
            onClick={() => router.back()} 
            className="px-6 py-3 rounded-xl border border-border/10 text-foreground/60 hover:text-foreground text-sm transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}