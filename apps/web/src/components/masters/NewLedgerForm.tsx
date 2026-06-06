'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react'
import { createLedger } from '@/actions/ledgers'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import { getGroupLabel } from '@/lib/dictionary'
import { useOfflineAction } from '@/hooks/useOfflineAction'
import { toast } from 'sonner'

const GROUPS = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'] as const

export function NewLedgerForm({ businessId }: { businessId: string }) {
  const router = useRouter()
  const { execute, isSyncing } = useOfflineAction()
  const [error, setError] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [group, setGroup] = useState<typeof GROUPS[number]>('ASSET')
  const [openingBalance, setOpeningBalance] = useState('')
  const [openingType, setOpeningType] = useState<'DEBIT' | 'CREDIT'>('DEBIT')
  const terminologyMode = usePreferencesStore((s) => s.terminologyMode)

  const GROUP_DESCRIPTIONS: Record<string, string> = {
    ASSET: 'Cash, bank, receivables, equipment, inventory',
    LIABILITY: 'Loans, payables, credit cards',
    INCOME: 'Sales, service revenue, interest earned',
    EXPENSE: 'Rent, salaries, utilities, purchases',
    EQUITY: 'Capital, retained earnings, drawings',
  }

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) { 
      setError('Ledger name is required')
      return 
    }
    
    const ledgerData = {
      businessId,
      name: name.trim(),
      group,
      openingBalance: openingBalance ? parseFloat(openingBalance) : undefined,
      openingType,
    }

    const result = await execute('LEDGER', ledgerData, createLedger)
    
    if (result?.error) { 
      setError(result.error)
      return 
    }
    
    toast.success('Ledger created!')
    router.push('/masters/ledgers')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-1.5 text-sm text-foreground/40 hover:text-foreground/70 transition-colors"
      >
        <ArrowLeft size={14} />Back
      </button>

      <div className="glass rounded-2xl border border-border/5 p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Ledger Name *</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            placeholder="e.g. HDFC Bank Account"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/20 text-sm focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Account Group *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(g)}
                className={`flex flex-col gap-1 px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                  group === g
                    ? 'bg-teal/10 border-teal/40 text-teal'
                    : 'bg-foreground/3 border-border/8 text-foreground/60 hover:border-border/15 hover:text-foreground'
                }`}
              >
                <span className="text-sm font-semibold">{getGroupLabel(g, terminologyMode)}</span>
                <span className="text-[11px] opacity-60 leading-tight">{GROUP_DESCRIPTIONS[g]}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-2">Opening Balance <span className="text-foreground/20 font-normal normal-case tracking-normal">(Optional)</span></label>
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
                  className={`px-4 py-3 text-xs font-semibold transition-all duration-150 ${
                    openingType === t ? (t === 'DEBIT' ? 'bg-teal text-navy' : 'bg-red-400/80 text-foreground') : 'text-foreground/40 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  {t === 'DEBIT' ? 'Dr' : 'Cr'}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-foreground/25 mt-1.5">Enter the balance as on your financial year start date</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-400/8 border border-red-400/20 text-sm text-red-400">
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSyncing}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow disabled:opacity-50"
          >
            {isSyncing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isSyncing ? 'Saving…' : 'Create Ledger'}
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