import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency based on currency code and locale.
 * Falls back to INR if no currency provided.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = 'INR',
  locale: string = 'en-IN'
): string {
  if (amount === null || amount === undefined) return 'N/A'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

/**
 * Format compact currency (1,20,000 → ₹1.2L)
 */
export function formatCurrencyCompact(
  amount: number | null | undefined,
  currency: string = 'INR'
): string {
  if (amount === null || amount === undefined) return 'N/A'
  const symbol = getCurrencySymbol(currency)
  if (Math.abs(amount) >= 10000000) return `${symbol}${(amount / 10000000).toFixed(2)}Cr`
  if (Math.abs(amount) >= 100000) return `${symbol}${(amount / 100000).toFixed(2)}L`
  if (Math.abs(amount) >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`
  return `${symbol}${amount.toFixed(2)}`
}

export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AED: 'د.إ', SGD: 'S$',
  }
  return symbols[currency] ?? currency
}

/**
 * Format date with fallback
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return 'N/A'
    return d.toLocaleDateString('en-IN', options ?? {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

export function formatDateShort(date: Date | string | null | undefined): string {
  return formatDate(date, { day: '2-digit', month: 'short' })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return 'N/A'
  }
}

/**
 * Generate voucher number prefix
 */
export function getVoucherPrefix(type: string): string {
  const prefixes: Record<string, string> = {
    SALES: 'INV',
    PURCHASE: 'BILL',
    RECEIPT: 'REC',
    PAYMENT: 'PAY',
    JOURNAL: 'JV',
    CONTRA: 'CTR',
  }
  return prefixes[type] ?? 'VCH'
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return 'N/A'
  return str.length > maxLength ? `${str.slice(0, maxLength)}…` : str
}

/**
 * Get initials from name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

/**
 * Calculate days overdue
 */
export function getDaysOverdue(dueDate: Date | string | null | undefined): number | null {
  if (!dueDate) return null
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
}

/**
 * Debounce function for search
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}