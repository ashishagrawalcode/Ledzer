import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { ReceiptPaymentForm } from '@/components/transactions/ReceiptPaymentForm'

export const metadata = { title: 'New Payment · Ledzer' }

export default async function NewPaymentPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  const suppliers = await prisma.party.findMany({
    where: { businessId: business.id, type: 'SUPPLIER' },
    select: { id: true, name: true, ledgerId: true },
    orderBy: { name: 'asc' },
  })

  const expenseLedgers = await prisma.ledger.findMany({
    where: { businessId: business.id, group: 'EXPENSE' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

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

  const lastPayment = await prisma.voucher.findFirst({
    where: { businessId: business.id, type: 'PAYMENT' },
    orderBy: { createdAt: 'desc' },
    select: { number: true },
  })

  const nextNumber = generateNextNumber(lastPayment?.number, 'PAY')

  return (
    <div className="w-full max-w-2xl animate-fade-up space-y-6">
      <PageHeader
        title="New Payment"
        subtitle="Record a payment made to a supplier or for an expense."
        badge="Transactions"
        backHref="/transactions/payments"
      />
      <ReceiptPaymentForm
        mode="PAYMENT"
        parties={suppliers}
        expenseLedgers={expenseLedgers}
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