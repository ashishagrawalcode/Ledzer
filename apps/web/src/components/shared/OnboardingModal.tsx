'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, DollarSign, ChevronRight, Check } from 'lucide-react'
import { saveBusinessOnboarding } from '@/actions/business'

interface OnboardingModalProps {
  userId: string
  existingData: {
    name: string | null
    gstin: string | null
    currency: string | null
    fiscalYearStart: Date | null
  } | null
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
]

const FISCAL_MONTHS = [
  { value: '04', label: 'April (Indian FY — Apr to Mar)' },
  { value: '01', label: 'January (Calendar Year)' },
  { value: '07', label: 'July' },
  { value: '10', label: 'October' },
]

export function OnboardingModal({ userId, existingData }: OnboardingModalProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  // Form state — pre-fill existing data
  const [businessName, setBusinessName] = useState(existingData?.name ?? '')
  const [gstin, setGstin] = useState(existingData?.gstin ?? '')
  const [currency, setCurrency] = useState(existingData?.currency ?? 'INR')
  const [fiscalMonth, setFiscalMonth] = useState(
    existingData?.fiscalYearStart
      ? String(new Date(existingData.fiscalYearStart).getMonth() + 1).padStart(2, '0')
      : '04'
  )

  // Determine which steps are needed
  const needsStep1 = !existingData?.name
  const needsStep2 = !existingData?.currency || !existingData?.fiscalYearStart

  const totalSteps = (needsStep1 ? 1 : 0) + (needsStep2 ? 1 : 0)
  const steps = [
    ...(needsStep1 ? [{ id: 1, title: 'Business Details', icon: Building2 }] : []),
    ...(needsStep2 ? [{ id: 2, title: 'Financial Setup', icon: DollarSign }] : []),
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)
  const isLastStep = currentStepIndex === steps.length - 1

  async function handleSubmit() {
    setError(null)
    startTransition(async () => {
      const result = await saveBusinessOnboarding({
        userId,
        name: businessName || existingData?.name || '',
        gstin: gstin || undefined,
        currency,
        fiscalYearStart: new Date(`2025-${fiscalMonth}-01`),
      })
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  function handleNext() {
    if (step === 1 && !businessName.trim()) {
      setError('Business name is required')
      return
    }
    setError(null)
    if (isLastStep) {
      handleSubmit()
    } else {
      setStep(steps[currentStepIndex + 1].id)
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-lg glass-heavy rounded-2xl border border-border/10 shadow-card-hover animate-scale-in overflow-hidden">
        {/* Progress header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-teal-gradient flex items-center justify-center shadow-glow-sm">
              <span className="font-display font-bold text-navy text-sm">L</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">Welcome to Ledzer</span>
          </div>

          {/* Step indicator */}
          {totalSteps > 1 && (
            <div className="flex items-center gap-2 mb-6">
              {steps.map((s, i) => {
                const Icon = s.icon
                const isCompleted = currentStepIndex > i
                const isCurrent = step === s.id
                return (
                  <div key={s.id} className="flex items-center gap-2 flex-1">
                    <div className={`flex items-center gap-2 ${i > 0 ? 'flex-1' : ''}`}>
                      {i > 0 && (
                        <div className={`flex-1 h-px transition-colors duration-300 ${isCompleted ? 'bg-teal' : 'bg-foreground/10'}`} />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted ? 'bg-teal text-navy' : isCurrent ? 'bg-teal/20 text-teal border border-teal/40' : 'bg-foreground/5 text-foreground/30'
                      }`}>
                        {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            {step === 1 && needsStep1 ? "Tell us about your business" : "Set up your finances"}
          </h2>
          <p className="text-sm text-foreground/40">
            {step === 1 && needsStep1
              ? "We'll use this to personalize your experience."
              : "This helps us configure your reports and currency."}
          </p>
        </div>

        {/* Form content */}
        <div className="px-8 pb-8 space-y-5">
          {step === 1 && needsStep1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => { setBusinessName(e.target.value); setError(null) }}
                  placeholder="e.g. Sharma Enterprises"
                  className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/25 text-sm focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                  GSTIN / Tax ID <span className="text-foreground/25">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAPFU0939F1ZV"
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border/10 text-foreground placeholder:text-foreground/25 text-sm font-mono focus:outline-none focus:border-teal/50 focus:bg-teal/3 transition-all duration-200"
                />
                <p className="text-xs text-foreground/25 mt-1.5">15-character GST Identification Number</p>
              </div>
            </>
          )}

          {(step === 2 || (step === 1 && !needsStep1)) && needsStep2 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                  Base Currency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setCurrency(c.code)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${
                        currency === c.code
                          ? 'bg-teal/10 border-teal/40 text-teal'
                          : 'bg-foreground/3 border-border/8 text-foreground/60 hover:border-border/15 hover:text-foreground'
                      }`}
                    >
                      <span className="font-mono text-base w-5">{c.symbol}</span>
                      <div>
                        <p className="text-xs font-semibold">{c.code}</p>
                        <p className="text-[10px] opacity-60">{c.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">
                  Fiscal Year Start
                </label>
                <div className="space-y-1.5">
                  {FISCAL_MONTHS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setFiscalMonth(m.value)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${
                        fiscalMonth === m.value
                          ? 'bg-teal/10 border-teal/40 text-teal'
                          : 'bg-foreground/3 border-border/8 text-foreground/60 hover:border-border/15 hover:text-foreground'
                      }`}
                    >
                      <span className="text-sm">{m.label}</span>
                      {fiscalMonth === m.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/8 border border-red-400/20 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}

          <button
            onClick={handleNext}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow hover:shadow-glow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
            ) : (
              <>
                {isLastStep ? 'Launch Ledzer' : 'Continue'}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}