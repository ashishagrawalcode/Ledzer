import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { VoucherForm } from '@/components/transactions/VoucherForm'

export const metadata = { title: 'New Purchase · Ledzer' }

export default async function NewPurchasePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      parties: {
        where: { type: 'SUPPLIER' },
        select: { id: true, name: true, type: true, ledgerId: true },
        orderBy: { name: 'asc' },
      },
      ledgers: {
        select: { id: true, name: true, group: true, isSystem: true },
        orderBy: { name: 'asc' },
      },
    },
  })
  if (!business) redirect('/dashboard')

  return (
    <div className="w-full max-w-4xl animate-fade-up space-y-6">
      <PageHeader
        title="New Purchase"
        subtitle="Record a new purchase bill from a supplier"
        badge="Transactions"
        backHref="/transactions/purchases"
      />
      <VoucherForm
        voucherType="PURCHASE"
        businessId={business.id}
        currency={business.currency ?? 'INR'}
        parties={business.parties}
        ledgers={business.ledgers}
        returnHref="/transactions/purchases"
      />
    </div>
  )
}