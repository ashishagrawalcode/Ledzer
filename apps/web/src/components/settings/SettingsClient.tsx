'use client'

import { useState, useTransition } from 'react'
import { useTheme } from 'next-themes'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { updateBusinessSettings } from '@/actions/settings'
import { Building2, Sliders, Palette, Save, CheckCircle, AlertCircle, Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STANDARD_TERMS, SIMPLE_TERMS } from '@/lib/dictionary'

const TABS = [
  { id: 'company',     label: 'Company Profile', icon: Building2 },
  { id: 'preferences', label: 'Preferences',     icon: Sliders   },
  { id: 'display',     label: 'Display',          icon: Palette   },
] as const
type Tab = typeof TABS[number]['id']

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

const TERM_PREVIEW = [
  { key: 'accountsReceivable' as const },
  { key: 'accountsPayable'   as const },
  { key: 'profitAndLoss'     as const },
  { key: 'ledger'            as const },
  { key: 'voucher'           as const },
  { key: 'debit'             as const },
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

  // Company form state
  const [name, setName]               = useState(business.name)
  const [gstin, setGstin]             = useState(business.gstin)
  const [currency, setCurrency]       = useState(business.currency)
  const [fiscalStart, setFiscalStart] = useState(business.fiscalYearStart)

  function handleSave() {
    setSaveState('idle')
    startTransition(async () => {
      const res = await updateBusinessSettings({
        name, gstin: gstin || null, currency, fiscalYearStart: fiscalStart || null,
      })
      if (res.success) {
        setSaveState('success')
        setTimeout(() => setSaveState('idle'), 3000)
      } else {
        setSaveState('error')
        setErrorMsg(res.error ?? 'Unknown error')
      }
    })
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 pt-4 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-[13px] font-medium transition-all duration-150 border-b-2 -mb-px',
                tab === t.id
                  ? 'text-primary border-primary bg-primary/5'
                  : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon size={14} />{t.label}
            </button>
          )
        })}
      </div>

      <div className="p-6">

        {/* ── COMPANY PROFILE ── */}
        {tab === 'company' && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-border">
              <div className="w-14 h-14 rounded-2xl bg-teal-gradient flex items-center justify-center shadow-glow">
                <span className="font-display font-bold text-navy-DEFAULT text-xl">
                  {name?.[0]?.toUpperCase() ?? 'L'}
                </span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{name || 'Your Business'}</p>
                <p className="text-sm text-muted-foreground">{user.email ?? 'N/A'}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="settings-label">Business Name *</label>
                <input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sharma Enterprises"
                  className="settings-input" />
              </div>
              <div>
                <label className="settings-label">GSTIN / Tax ID <span className="text-muted-foreground font-normal">(Optional)</span></label>
                <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="27AAPFU0939F1ZV" maxLength={15}
                  className="settings-input font-mono" />
              </div>
              <div>
                <label className="settings-label">Fiscal Year Start</label>
                <input type="date" value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)}
                  className="settings-input" />
                <p className="text-[11px] text-muted-foreground mt-1">Indian FY: April 1 · Calendar: January 1</p>
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
                        : 'bg-accent border-border text-muted-foreground hover:text-foreground hover:border-border'
                    )}>
                    <span className="font-mono text-base w-5 flex-shrink-0">{c.symbol}</span>
                    <div>
                      <p className="text-xs font-semibold">{c.code}</p>
                      <p className="text-[10px] opacity-60 leading-none">{c.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Save feedback */}
            {saveState === 'success' && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
                <CheckCircle size={15} />Changes saved successfully.
              </div>
            )}
            {saveState === 'error' && (
              <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle size={15} />{errorMsg}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-glow disabled:opacity-50">
                {isPending
                  ? <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  : <Save size={14} />}
                {isPending ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ── PREFERENCES ── */}
        {tab === 'preferences' && (
          <div className="space-y-6">
            {/* Terminology toggle */}
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">Terminology Mode</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Switch between standard accounting terms and plain business language.
                  </p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => setTerminologyMode(terminologyMode === 'standard' ? 'simple' : 'standard')}
                  className={cn(
                    'relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300',
                    terminologyMode === 'simple' ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <div className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-foreground shadow-sm transition-all duration-300',
                    terminologyMode === 'simple' ? 'left-6' : 'left-0.5'
                  )} />
                </button>
              </div>

              {/* Mode labels */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn('rounded-lg p-3 border transition-all duration-200',
                  terminologyMode === 'standard' ? 'border-primary/40 bg-primary/5' : 'border-border bg-accent/40'
                )}>
                  <p className="text-xs font-semibold text-foreground mb-2">Standard Accounting</p>
                  <div className="space-y-1">
                    {TERM_PREVIEW.map((t) => (
                      <p key={t.key} className="text-[11px] text-muted-foreground">{STANDARD_TERMS[t.key]}</p>
                    ))}
                  </div>
                </div>
                <div className={cn('rounded-lg p-3 border transition-all duration-200',
                  terminologyMode === 'simple' ? 'border-primary/40 bg-primary/5' : 'border-border bg-accent/40'
                )}>
                  <p className="text-xs font-semibold text-foreground mb-2">Jargon-Free Mode</p>
                  <div className="space-y-1">
                    {TERM_PREVIEW.map((t) => (
                      <p key={t.key} className={cn('text-[11px]', terminologyMode === 'simple' ? 'text-primary' : 'text-muted-foreground')}>
                        {SIMPLE_TERMS[t.key]}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground bg-accent/50 rounded-lg px-3 py-2">
                ✓ The underlying accounting data stays identical — only the display labels change.
                Saved in your browser via a secure cookie.
              </p>
            </div>

            {/* Future: Language preference */}
            <div className="rounded-xl border border-border p-5 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Language</p>
                  <p className="text-sm text-muted-foreground mt-0.5">English (India) — Hindi support coming soon</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-accent text-[11px] text-muted-foreground font-medium border border-border">
                  Coming soon
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── DISPLAY ── */}
        {tab === 'display' && (
          <div className="space-y-6">
            {/* Theme selector */}
            <div className="rounded-xl border border-border p-5 space-y-4">
              <div>
                <p className="font-semibold text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground mt-0.5">Choose how Ledzer looks on your device.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light',  label: 'Light',  Icon: Sun,     preview: 'bg-[#F8FAFC]' },
                  { value: 'dark',   label: 'Dark',   Icon: Moon,    preview: 'bg-[#050816]' },
                  { value: 'system', label: 'System', Icon: Monitor, preview: 'bg-gradient-to-br from-[#F8FAFC] to-[#050816]' },
                ] as const).map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
                      resolvedTheme === t.value || (t.value === 'system' && !['light','dark'].includes(resolvedTheme ?? ''))
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-accent/30 hover:border-border hover:bg-accent'
                    )}
                  >
                    {/* Preview swatch */}
                    <div className={`w-full h-10 rounded-lg ${t.preview} border border-border/50`} />
                    <div className="flex items-center gap-1.5">
                      <t.Icon size={13} className="text-muted-foreground" />
                      <span className="text-xs font-medium text-foreground">{t.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Number format */}
            <div className="rounded-xl border border-border p-5 space-y-3">
              <div>
                <p className="font-semibold text-foreground">Number Format</p>
                <p className="text-sm text-muted-foreground mt-0.5">How large numbers are displayed across the app.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Indian System', example: '₹1,20,000', active: true },
                  { label: 'International', example: '₹120,000',  active: false },
                ].map((f) => (
                  <button key={f.label}
                    className={cn(
                      'flex flex-col gap-1 px-4 py-3 rounded-xl border text-left transition-all duration-150',
                      f.active
                        ? 'border-primary/40 bg-primary/5 text-primary'
                        : 'border-border bg-accent/40 text-muted-foreground hover:text-foreground opacity-60 cursor-not-allowed'
                    )}
                    disabled={!f.active}
                  >
                    <span className="text-xs font-semibold">{f.label}</span>
                    <span className="font-mono text-sm">{f.example}</span>
                    {!f.active && <span className="text-[10px] opacity-50">Coming soon</span>}
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