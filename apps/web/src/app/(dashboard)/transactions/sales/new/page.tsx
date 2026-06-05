import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { VoucherForm } from '@/components/transactions/VoucherForm'

export const metadata = { title: 'New Invoice' }

export default async function NewSalesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await db.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      parties: {
        where: { type: 'CUSTOMER' },
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
    <div className="w-full max-w-4xl animate-fade-up">
      <PageHeader
        title="New Sales Invoice"
        subtitle="Create a sales voucher with double-entry posting"
        badge="Transactions"
      />
      <VoucherForm
        voucherType="SALES"
        businessId={business.id}
        currency={business.currency ?? 'INR'}
        parties={business.parties}
        ledgers={business.ledgers}
        returnHref="/transactions/sales"
      />
    </div>
  )
}