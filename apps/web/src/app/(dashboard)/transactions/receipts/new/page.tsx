import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReceiptPaymentForm } from '@/components/transactions/ReceiptPaymentForm'

export const metadata = { title: 'New Receipt · Ledzer' }

export default async function NewReceiptPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  // Customers (for "received from")
  const customers = await prisma.party.findMany({
    where: { businessId: business.id, type: 'CUSTOMER' },
    select: { id: true, name: true, ledgerId: true },
    orderBy: { name: 'asc' },
  })

  // Cash/Bank ledgers for "deposited into"
  const bankCashLedgers = await prisma.ledger.findMany({
    where: {
      businessId: business.id,
      group: 'ASSET',
      OR: [
        { name: { contains: 'Cash', mode: 'insensitive' } },
        { name: { contains: 'Bank', mode: 'insensitive' } },
        { name: { contains: 'Wallet', mode: 'insensitive' } },
        { name: { contains: 'UPI', mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  // Next voucher number
  const lastReceipt = await prisma.voucher.findFirst({
    where: { businessId: business.id, type: 'RECEIPT' },
    orderBy: { createdAt: 'desc' },
    select: { number: true },
  })

  const nextNumber = generateNextNumber(lastReceipt?.number, 'REC')

  return (
    <div className="w-full max-w-2xl animate-fade-up space-y-6">
      <PageHeader
        title="New Receipt"
        subtitle="Record payment received from a customer."
        badge="Transactions"
        backHref="/transactions/receipts"
      />
      <ReceiptPaymentForm
        mode="RECEIPT"
        parties={customers}
        bankCashLedgers={bankCashLedgers}
        nextNumber={nextNumber}
        currency={business.currency ?? 'INR'}
      />
    </div>
  )
}

function generateNextNumber(last: string | undefined, prefix: string): string {
  if (!last) return `${prefix}-001`
  const match = last.match(/(\d+)$/)
  if (!match) return `${prefix}-001`
  const next = parseInt(match[1], 10) + 1
  return `${prefix}-${String(next).padStart(3, '0')}`
}