import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Journal Entries · Ledzer' }

interface SearchParams { page?: string; search?: string }

export default async function JournalPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = 20
  const search = searchParams.search?.trim() ?? ''

  const [vouchers, total] = await Promise.all([
    db.voucher.findMany({
      where: {
        businessId: business.id,
        type: 'JOURNAL',
        ...(search ? {
          OR: [
            { number: { contains: search, mode: 'insensitive' } },
            { notes: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        entries: {
          include: { ledger: { select: { name: true, group: true, party: { select: { name: true, type: true } } } } }
        }
      },
    }),
    db.voucher.count({
      where: { businessId: business.id, type: 'JOURNAL', ...(search ? { OR: [{ number: { contains: search, mode: 'insensitive' } }, { notes: { contains: search, mode: 'insensitive' } }] } : {}) },
    }),
  ])

  const rows = vouchers.map((v) => {
    // Journal entries might involve a party (e.g. adjusting a customer balance) or just regular ledgers.
    // We try to find a party first, if none exists, we display the primary Debit Ledger name.
    const partyEntry = v.entries.find((e) => e.ledger.party)
    const primaryDebitEntry = v.entries.find((e) => e.type === 'DEBIT')
    const totalDebit = v.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
    
    return {
      id: v.id,
      number: v.number,
      date: v.date,
      type: v.type,
      partyName: partyEntry?.ledger.party?.name ?? primaryDebitEntry?.ledger.name ?? 'Adjustment',
      amount: totalDebit,
      notes: v.notes,
    }
  })

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Journal Entries"
        subtitle={`${total} entry${total !== 1 ? 's' : ''} total`}
        badge="Transactions"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Journal_Entries" />
            
            <Link
              href="/transactions/journals/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Journal</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        }
      />
      <TransactionsList
        vouchers={rows}
        currency={business.currency ?? 'INR'}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        baseHref="/transactions/journals"
        voucherType="JOURNAL"
      />
    </div>
  )
}