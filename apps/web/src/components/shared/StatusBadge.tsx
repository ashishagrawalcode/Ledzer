import { cn } from '@/lib/utils'

type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'teal'

interface StatusBadgeProps {
  label: string
  variant?: StatusVariant
  dot?: boolean
  className?: string
}

const VARIANT_STYLES: Record<StatusVariant, string> = {
  success: 'bg-green-400/10 text-green-400 border-green-400/20',
  warning: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  danger: 'bg-red-400/10 text-red-400 border-red-400/20',
  info: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  neutral: 'bg-foreground/5 text-foreground/50 border-border/10',
  teal: 'bg-teal/10 text-teal border-teal/20',
}

const DOT_STYLES: Record<StatusVariant, string> = {
  success: 'bg-green-400',
  warning: 'bg-yellow-400',
  danger: 'bg-red-400',
  info: 'bg-blue-400',
  neutral: 'bg-foreground/40',
  teal: 'bg-teal',
}

export function StatusBadge({ label, variant = 'neutral', dot = false, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium',
        VARIANT_STYLES[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_STYLES[variant])} />}
      {label}
    </span>
  )
}

// Helper to get voucher status variant
export function getVoucherStatusVariant(type: string): StatusVariant {
  const map: Record<string, StatusVariant> = {
    SALES: 'teal',
    RECEIPT: 'success',
    PURCHASE: 'danger',
    PAYMENT: 'warning',
    JOURNAL: 'info',
    CONTRA: 'neutral',
  }
  return map[type] ?? 'neutral'
}

export function getVoucherTypeLabel(type: string, simple = false): string {
  const standardMap: Record<string, string> = {
    SALES: 'Sales Voucher',
    PURCHASE: 'Purchase Voucher',
    RECEIPT: 'Receipt',
    PAYMENT: 'Payment',
    JOURNAL: 'Journal',
    CONTRA: 'Contra',
  }
  const simpleMap: Record<string, string> = {
    SALES: 'Invoice',
    PURCHASE: 'Purchase Bill',
    RECEIPT: 'Payment Received',
    PAYMENT: 'Payment Made',
    JOURNAL: 'Adjustment',
    CONTRA: 'Cash Transfer',
  }
  return (simple ? simpleMap[type] : standardMap[type]) ?? type
}