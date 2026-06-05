import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { LedgersList } from '@/components/masters/LedgersList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Ledgers' }

export default async function LedgersPage({ searchParams }: { searchParams: { search?: string; group?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const search = searchParams.search?.trim() ?? ''
  const group = searchParams.group ?? ''

  const ledgers = await db.ledger.findMany({
    where: {
      businessId: business.id,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(group ? { group: group as never } : {}),
    },
    include: {
      party: { select: { name: true, type: true } },
      entries: { select: { type: true, amount: true } },
    },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  })

  const rows = ledgers.map((l) => {
    const balance = l.entries.reduce((s, e) => e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0)
    return {
      id: l.id,
      name: l.name,
      group: l.group,
      isSystem: l.isSystem,
      partyName: l.party?.name ?? null,
      partyType: l.party?.type ?? null,
      balance,
      entryCount: l.entries.length,
    }
  })

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Ledgers"
        subtitle={`${rows.length} account${rows.length !== 1 ? 's' : ''} · Chart of Accounts`}
        badge="Masters"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Ledgers" />
          <Link
            href="/masters/ledgers/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow"
          >
            <Plus size={15} />
            New Ledger
          </Link>
          </div>
        }
      />
      <LedgersList
        ledgers={rows}
        currency={business.currency ?? 'INR'}
        search={search}
        groupFilter={group}
      />
    </div>
  )
}