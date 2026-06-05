import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { VoucherTypesClient } from '@/components/masters/VoucherTypesClient'

export const metadata = { title: 'Voucher Types · Masters · Ledzer' }

export default async function VoucherTypesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  // Count vouchers per type for this business
  const counts = await prisma.voucher.groupBy({
    by: ['type'],
    where: { businessId: business.id },
    _count: { id: true },
  })

  const countMap = Object.fromEntries(counts.map((c) => [c.type, c._count.id]))

  return (
    <div className="w-full animate-fade-up space-y-6">
      <PageHeader
        title="Voucher Types"
        subtitle="All transaction categories used in Ledzer. Each voucher type maps to a specific accounting operation."
        badge="Masters"
      />
      <VoucherTypesClient countMap={countMap} />
    </div>
  )
}