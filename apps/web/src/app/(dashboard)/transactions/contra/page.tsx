import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Contra Entries · Ledzer' }

interface SearchParams { page?: string; search?: string }

export default async function ContraPage({ searchParams }: { searchParams: SearchParams }) {
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
        type: 'CONTRA',
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
          include: { ledger: { select: { name: true, group: true } } }
        }
      },
    }),
    db.voucher.count({
      where: { businessId: business.id, type: 'CONTRA', ...(search ? { OR: [{ number: { contains: search, mode: 'insensitive' } }, { notes: { contains: search, mode: 'insensitive' } }] } : {}) },
    }),
  ])

  const rows = vouchers.map((v) => {
    // For Contra, there is no "Party". It's a transfer between accounts.
    // We map the "partyName" field to show the flow of funds: "From (Credit) -> To (Debit)"
    const debitEntry = v.entries.find((e) => e.type === 'DEBIT')
    const creditEntry = v.entries.find((e) => e.type === 'CREDIT')
    const totalDebit = v.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
    
    const transferSummary = debitEntry && creditEntry 
      ? `${creditEntry.ledger.name} → ${debitEntry.ledger.name}`
      : 'Internal Transfer'

    return {
      id: v.id,
      number: v.number,
      date: v.date,
      type: v.type,
      partyName: transferSummary,
      amount: totalDebit,
      notes: v.notes,
    }
  })

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Contra Entries"
        subtitle={`${total} entry${total !== 1 ? 's' : ''} total`}
        badge="Transactions"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Contra_Entries" />
            
            <Link
              href="/transactions/contra/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Contra</span>
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
        baseHref="/transactions/contra"
        voucherType="CONTRA"
      />
    </div>
  )
}