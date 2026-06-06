'use client'

import { useState, useTransition } from 'react'
import { useTheme } from 'next-themes'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { updateBusinessSettings } from '@/actions/settings'
import {
  Building2, Sliders, Palette, Save, CheckCircle, AlertCircle,
  Sun, Moon, Monitor, Languages,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STANDARD_TERMS, SIMPLE_TERMS } from '@/lib/dictionary'
import type { TermDictionary } from '@/lib/dictionary'

const TABS = [
  { id: 'company',     label: 'Company',     icon: Building2 },
  { id: 'preferences', label: 'Preferences', icon: Sliders   },
  { id: 'display',     label: 'Display',     icon: Palette   },
] as const
type Tab = typeof TABS[number]['id']

const CURRENCIES = [
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee'     },
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee'   },
  { code: 'USD', symbol: '$',   name: 'US Dollar'        },
  { code: 'EUR', symbol: '€',   name: 'Euro'             },
  { code: 'GBP', symbol: '£',   name: 'British Pound'    },
  { code: 'CAD', symbol: 'C$',  name: 'Canadian Dollar'  },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar'},
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham'       },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
]

const TERM_PREVIEW: Array<{ key: keyof TermDictionary; description: string }> = [
  { key: 'accountsReceivable', description: 'Money owed to you'       },
  { key: 'accountsPayable',    description: 'Money you owe'           },
  { key: 'profitAndLoss',      description: 'Income minus expenses'   },
  { key: 'ledger',             description: 'Record of transactions'  },
  { key: 'voucher',            description: 'A transaction entry'     },
  { key: 'debit',              description: 'Amount coming in'        },
  { key: 'credit',             description: 'Amount going out'        },
  { key: 'journalVoucher',     description: 'Manual correction entry' },
  { key: 'contraVoucher',      description: 'Cash to bank transfer'   },
  { key: 'trialBalance',       description: 'Accounts check'         },
]

interface SettingsClientProps {
  business: { name: string; gstin: string; currency: string; fiscalYearStart: string }
  user: { name: string | null; email: string | null }
}

export function SettingsClient({ business, user }: SettingsClientProps) {
  const [tab, setTab] = useState<Tab>('company')
  const { resolvedTheme, setTheme } = useTheme()
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)
  const setTerminologyMode = usePreferencesStore((s) => s.setTerminologyMode)
  const [isPending, startTransition] = useTransition()
  const [saveState, setSaveState] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName]           = useState(business.name)
  const [gstin, setGstin]         = useState(business.gstin)
  const [currency, setCurrency]   = useState(business.currency)
  const [fiscalStart, setFiscalStart] = useState(business.fiscalYearStart)

  function handleSave() {
    if (!name.trim()) { setSaveState('error'); setErrorMsg('Business name is required.'); return }
    setSaveState('idle')
    startTransition(async () => {
      const res = await updateBusinessSettings({ name, gstin: gstin || null, currency, fiscalYearStart: fiscalStart || null })
      if (res.success) { setSaveState('success'); setTimeout(() => setSaveState('idle'), 3500) }
      else { setSaveState('error'); setErrorMsg(res.error ?? 'Unknown error') }
    })
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-4 pt-4 border-b border-border overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-[13px] font-medium whitespace-nowrap transition-all duration-150 border-b-2 -mb-px',
                tab === t.id ? 'text-primary border-primary bg-primary/5' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent'
              )}>
              <Icon size={14} />{t.label}
            </button>
          )
        })}
      </div>

      <div className="p-6">

        {/* COMPANY */}
        {tab === 'company' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-5 border-b border-border">
              <div className="w-14 h-14 rounded-2xl bg-teal-gradient flex items-center justify-center shadow-glow flex-shrink-0">
                <span className="font-display font-bold text-navy-DEFAULT text-xl">{name?.[0]?.toUpperCase() ?? 'L'}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{name || 'Your Business'}</p>
                <p className="text-sm text-muted-foreground">{user.email ?? 'N/A'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="settings-label">Business Name <span className="text-destructive">*</span></label>
                <input value={name} onChange={(e) => { setName(e.target.value); setSaveState('idle') }}
                  placeholder="e.g. Sharma Enterprises" className="settings-input" />
              </div>
              <div>
                <label className="settings-label">GSTIN / Tax ID <span className="text-muted-foreground font-normal normal-case">(Optional)</span></label>
                <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AAPFU0939F1ZV" maxLength={15} className="settings-input font-mono" />
              </div>
              <div>
                <label className="settings-label">Fiscal Year Start</label>
                <input type="date" value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} className="settings-input" />
                <p className="text-[11px] text-muted-foreground mt-1.5">India: April 1 · Calendar: January 1</p>
              </div>
            </div>

            <div>
              <label className="settings-label">Base Currency</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {CURRENCIES.map((c) => (
                  <button key={c.code} type="button" onClick={() => setCurrency(c.code)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left',
                      currency === c.code
                        ? 'bg-primary/10 border-primary/40 text-primary'
                        : 'bg-accent border-border text-muted-foreground hover:text-foreground hover:border-primary/20'
                    )}>
                    <span className="font-mono text-base w-6 flex-shrink-0 text-center">{c.symbol}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-none">{c.code}</p>
                      <p className="text-[10px] opacity-60 leading-tight mt-0.5 truncate">{c.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {saveState === 'success' && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle size={15} />Changes saved.
              </div>
            )}
            {saveState === 'error' && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={15} />{errorMsg}
              </div>
            )}
            <div className="pt-1">
              <button onClick={handleSave} disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow disabled:opacity-50">
                {isPending ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save size={14} />}
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {tab === 'preferences' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border overflow-hidden">
              {/* Toggle header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Languages size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Terminology Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {terminologyMode === 'simple' ? 'Everyday language is active' : 'Standard accounting terms active'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTerminologyMode(terminologyMode === 'standard' ? 'simple' : 'standard')}
                  className={cn('relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300', terminologyMode === 'simple' ? 'bg-primary shadow-glow' : 'bg-muted')}
                >
                  <div className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300', terminologyMode === 'simple' ? 'left-[26px]' : 'left-0.5')} />
                </button>
              </div>
              {/* Mode pills */}
              <div className="grid grid-cols-2 divide-x divide-border">
                {[
                  { v: 'standard' as const, l: 'Standard', s: 'For accountants & CAs' },
                  { v: 'simple'   as const, l: 'Jargon-Free', s: 'For everyday use' },
                ].map((m) => (
                  <button key={m.v} onClick={() => setTerminologyMode(m.v)}
                    className={cn('flex flex-col items-center gap-0.5 py-3 text-sm font-medium transition-all',
                      terminologyMode === m.v ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
                    {m.l}
                    <span className="text-[11px] font-normal opacity-60">{m.s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comparison table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-accent/30">
                <p className="text-xs font-semibold text-foreground">Live Comparison</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Highlighted column = current mode</p>
              </div>
              <div className="grid grid-cols-3 px-4 py-2 bg-accent/20 border-b border-border">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Concept</span>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider', terminologyMode === 'standard' ? 'text-primary' : 'text-muted-foreground')}>Standard</span>
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider', terminologyMode === 'simple' ? 'text-primary' : 'text-muted-foreground')}>Jargon-Free</span>
              </div>
              <div className="divide-y divide-border">
                {TERM_PREVIEW.map(({ key, description }) => (
                  <div key={key} className="grid grid-cols-3 px-4 py-3 hover:bg-accent/30 transition-colors">
                    <span className="text-[11px] text-muted-foreground/70 self-center pr-2">{description}</span>
                    <span className={cn('text-[12px] font-medium self-center pr-2', terminologyMode === 'standard' ? 'text-primary' : 'text-foreground/70')}>
                      {STANDARD_TERMS[key]}
                    </span>
                    <span className={cn('text-[12px] font-medium self-center', terminologyMode === 'simple' ? 'text-primary' : 'text-foreground/70')}>
                      {SIMPLE_TERMS[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground bg-accent/40 rounded-xl px-4 py-3 border border-border">
              ✓ Your accounting data is <strong>never changed</strong> by this setting.
              Debits, credits, and balances are always accurate.
              Only the display labels switch. Preference saved as a browser cookie — no flicker on reload.
            </p>

            <div className="rounded-xl border border-border p-5 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">Language / भाषा</p>
                  <p className="text-xs text-muted-foreground mt-0.5">English (India) — Hindi interface coming soon</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent text-[11px] text-muted-foreground font-medium border border-border">Coming soon</span>
              </div>
            </div>
          </div>
        )}

        {/* DISPLAY */}
        {tab === 'display' && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div>
                <p className="font-semibold text-foreground text-sm">Theme</p>
                <p className="text-xs text-muted-foreground mt-0.5">Choose how Ledzer looks on your device.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light',  label: 'Light',  Icon: Sun,     preview: 'bg-[#F8FAFC] border-slate-200'                           },
                  { value: 'dark',   label: 'Dark',   Icon: Moon,    preview: 'bg-[#050816] border-slate-800'                           },
                  { value: 'system', label: 'System', Icon: Monitor, preview: 'bg-gradient-to-br from-[#F8FAFC] to-[#050816] border-border' },
                ] as const).map((t) => {
                  const isActive = resolvedTheme === t.value || (t.value === 'system' && !['light','dark'].includes(resolvedTheme ?? ''))
                  return (
                    <button key={t.value} onClick={() => setTheme(t.value)}
                      className={cn('flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                        isActive ? 'border-primary bg-primary/5' : 'border-border bg-accent/30 hover:bg-accent hover:border-primary/30')}>
                      <div className={`w-full h-10 rounded-lg border ${t.preview}`} />
                      <div className="flex items-center gap-1.5">
                        <t.Icon size={13} className={isActive ? 'text-primary' : 'text-muted-foreground'} />
                        <span className={cn('text-xs font-medium', isActive ? 'text-primary' : 'text-foreground')}>{t.label}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border p-5 space-y-3">
              <div>
                <p className="font-semibold text-foreground text-sm">Number Format</p>
                <p className="text-xs text-muted-foreground mt-0.5">How large numbers display across the app.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Indian System', example: '₹1,20,000',  active: true,  note: 'Lakhs & crores' },
                  { label: 'International', example: '₹1,200,000', active: false, note: 'Coming soon'    },
                ].map((f) => (
                  <button key={f.label} disabled={!f.active}
                    className={cn('flex flex-col gap-1.5 px-4 py-3 rounded-xl border text-left transition-all',
                      f.active ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border bg-accent/40 text-muted-foreground opacity-50 cursor-not-allowed')}>
                    <span className="text-xs font-semibold">{f.label}</span>
                    <span className="font-mono text-sm">{f.example}</span>
                    <span className="text-[10px] opacity-70">{f.note}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}