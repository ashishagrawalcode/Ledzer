'use client'

import {
  ShoppingCart, ShoppingBag, ArrowDownCircle, ArrowUpCircle,
  FileText, Repeat, ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type VoucherType = 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA'

interface VoucherTypesClientProps {
  countMap: Partial<Record<VoucherType, number>>
}

const VOUCHER_CONFIG: Record<VoucherType, {
  label: string
  jargonFree: string
  description: string
  accounting: string
  example: string
  icon: React.ElementType
  color: string
  bg: string
  border: string
  href: string
}> = {
  SALES: {
    label: 'Sales Voucher',
    jargonFree: 'Money-In Bill',
    description: 'Record goods or services sold to a customer. Creates a receivable or records cash received.',
    accounting: 'Debit: Customer / Cash · Credit: Sales',
    example: 'Sold 10 bags of rice to Sharma Stores for ₹5,000',
    icon: ShoppingCart,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    href: '/transactions/sales/new',
  },
  PURCHASE: {
    label: 'Purchase Voucher',
    jargonFree: 'Money-Out Bill',
    description: 'Record goods or services bought from a supplier. Creates a payable or records cash paid.',
    accounting: 'Debit: Purchase / Expense · Credit: Supplier / Cash',
    example: 'Bought stock from Gupta Wholesale for ₹12,000',
    icon: ShoppingBag,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    href: '/transactions/purchases/new',
  },
  RECEIPT: {
    label: 'Receipt Voucher',
    jargonFree: 'Payment Received',
    description: 'Record money received from a customer or debtor — clearing outstanding invoices.',
    accounting: 'Debit: Cash / Bank · Credit: Customer Ledger',
    example: 'Received ₹3,000 from Sharma Stores against INV-001',
    icon: ArrowDownCircle,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    href: '/transactions/receipts/new',
  },
  PAYMENT: {
    label: 'Payment Voucher',
    jargonFree: 'Payment Made',
    description: 'Record money paid to a supplier, vendor, or for an expense.',
    accounting: 'Debit: Supplier / Expense · Credit: Cash / Bank',
    example: 'Paid ₹8,000 rent to landlord via NEFT',
    icon: ArrowUpCircle,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    href: '/transactions/payments/new',
  },
  JOURNAL: {
    label: 'Journal Voucher',
    jargonFree: 'Manual Entry',
    description: 'Record adjustments, depreciation, or any transaction not covered by other types.',
    accounting: 'Any debit / credit combination that balances to zero',
    example: 'Depreciation of machinery: Debit Depreciation ₹500, Credit Asset ₹500',
    icon: FileText,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    href: '/transactions/journals/new',
  },
  CONTRA: {
    label: 'Contra Voucher',
    jargonFree: 'Cash Transfer',
    description: 'Transfer funds between cash and bank accounts. Only Cash / Bank ledgers involved.',
    accounting: 'Debit: Bank · Credit: Cash (or vice-versa)',
    example: 'Deposited ₹20,000 cash into HDFC bank account',
    icon: Repeat,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    href: '/transactions/contra/new',
  },
}

const ORDER: VoucherType[] = ['SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA']

export function VoucherTypesClient({ countMap }: VoucherTypesClientProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ORDER.map((type) => {
        const cfg = VOUCHER_CONFIG[type]
        const Icon = cfg.icon
        const count = countMap[type] ?? 0

        return (
          <div key={type} className="bg-card border border-border rounded-2xl p-5 space-y-4 hover:border-border/80 transition-all duration-200 group">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', cfg.bg, `border ${cfg.border}`)}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm leading-tight">{cfg.label}</p>
                  <p className={cn('text-[11px] font-medium mt-0.5', cfg.color)}>{cfg.jargonFree}</p>
                </div>
              </div>
              <span className={cn(
                'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-bold',
                cfg.bg, cfg.color
              )}>
                {count}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{cfg.description}</p>

            {/* Accounting Entry */}
            <div className="rounded-xl bg-accent/50 border border-border px-3.5 py-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Accounting Effect</p>
              <p className="text-xs font-mono text-foreground leading-relaxed">{cfg.accounting}</p>
            </div>

            {/* Example */}
            <div className="rounded-xl bg-accent/30 border border-dashed border-border px-3.5 py-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Example</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{cfg.example}</p>
            </div>

            {/* CTA */}
            <Link
              href={cfg.href}
              className={cn(
                'flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-150 group/link',
                cfg.border, cfg.bg,
                'hover:opacity-90'
              )}
            >
              <span className={cn('text-xs font-semibold', cfg.color)}>
                Create {cfg.label}
              </span>
              <ArrowRight size={13} className={cn('transition-transform duration-150 group-hover/link:translate-x-0.5', cfg.color)} />
            </Link>
          </div>
        )
      })}
    </div>
  )
}