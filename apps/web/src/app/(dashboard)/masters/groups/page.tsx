import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { AccountGroupsClient } from '@/components/masters/AccountGroupsClient'

export const metadata = { title: 'Account Groups · Masters · Ledzer' }

export default async function AccountGroupsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  // Fetch all ledgers grouped by AccountGroup, with counts
  const ledgers = await prisma.ledger.findMany({
    where: { businessId: business.id },
    select: { id: true, name: true, group: true, isSystem: true },
    orderBy: { name: 'asc' },
  })

  // Build grouped summary
  const groups = ['ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY'] as const
  const grouped = groups.map((g) => ({
    group: g,
    ledgers: ledgers.filter((l) => l.group === g),
    count: ledgers.filter((l) => l.group === g).length,
  }))

  return (
    <div className="w-full animate-fade-up space-y-6">
      <PageHeader
        title="Account Groups"
        subtitle="The five pillars of double-entry bookkeeping. All ledgers are classified under these groups."
        badge="Masters"
      />
      <AccountGroupsClient groups={grouped} />
    </div>
  )
}