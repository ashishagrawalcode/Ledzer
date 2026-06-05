'use client'

import { useState } from 'react'
import { updateBusinessSettings, SettingsInput } from '@/actions/settings'
import { Save, Loader2, Building, ShieldCheck, Globe } from 'lucide-react'

interface SettingsFormProps {
  business: {
    name: string
    gstin: string
    currency: string
    fiscalYearStart: string
  }
}

export function SettingsForm({ business }: SettingsFormProps) {
  const [form, setForm] = useState<SettingsInput>({
    name: business.name,
    gstin: business.gstin || null,
    currency: business.currency,
    fiscalYearStart: business.fiscalYearStart || null,
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await updateBusinessSettings(form)
    setLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'System configuration updated cleanly.' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Something went wrong.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy/40 rounded-2xl p-6 md:p-8 space-y-8 border border-border/5">
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-medium transition-all ${
          message.type === 'success' 
            ? 'bg-teal/10 border-teal/30 text-teal' 
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Section 1: Identity */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground font-semibold text-base border-b border-border/5 pb-2">
          <Building size={18} className="text-teal" />
          <span>Organization Profile</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Business Registered Name</label>
            <input 
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="px-4 py-3 bg-navy-light/50 border border-border/10 rounded-xl text-foreground text-sm focus:outline-none focus:border-teal transition-all"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">GSTIN / Tax Identification</label>
            <input 
              type="text"
              value={form.gstin || ''}
              onChange={(e) => setForm({ ...form, gstin: e.target.value || null })}
              className="px-4 py-3 bg-navy-light/50 border border-border/10 rounded-xl text-foreground text-sm focus:outline-none focus:border-teal transition-all uppercase"
              placeholder="22AAAAA0000A1Z5"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Regional Preferences */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground font-semibold text-base border-b border-border/5 pb-2">
          <Globe size={18} className="text-teal" />
          <span>Localization & Accounting Paradigm</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Currency</label>
            <select
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="px-4 py-3 bg-navy-light/50 border border-border/10 rounded-xl text-foreground text-sm focus:outline-none focus:border-teal transition-all appearance-none"
            >
              <option value="INR">INR (₹) — Indian Rupee</option>
              <option value="NPR">NPR (Rs.) — Nepalese Rupee</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fiscal Year Operational Start</label>
            <input 
              type="date"
              value={form.fiscalYearStart || ''}
              onChange={(e) => setForm({ ...form, fiscalYearStart: e.target.value || null })}
              className="px-4 py-3 bg-navy-light/50 border border-border/10 rounded-xl text-foreground text-sm focus:outline-none focus:border-teal transition-all colors-scheme-dark"
            />
          </div>
        </div>
      </div>

      {/* Form Submission */}
      <div className="flex justify-end pt-4 border-t border-border/5">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover disabled:opacity-50 transition-all duration-200 shadow-glow"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Rules...
            </>
          ) : (
            <>
              <Save size={16} />
              Commit Settings
            </>
          )}
        </button>
      </div>
    </form>
  )
}