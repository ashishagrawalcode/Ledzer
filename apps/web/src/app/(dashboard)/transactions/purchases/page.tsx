import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import { ExportDropdown } from '@/components/shared/ExportDropdown'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const metadata = { title: 'Purchase Bills' }

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = 20
  const search = searchParams.search?.trim() ?? ''
  const searchFilter = search
    ? { OR: [{ number: { contains: search, mode: 'insensitive' as const } }, { notes: { contains: search, mode: 'insensitive' as const } }] }
    : {}

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where: { businessId: business.id, type: 'PURCHASE', ...searchFilter },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        entries: {
          include: { ledger: { select: { name: true, group: true, party: { select: { name: true, type: true } } } } },
        },
      },
    }),
    prisma.voucher.count({ where: { businessId: business.id, type: 'PURCHASE', ...searchFilter } }),
  ])

  const rows = vouchers.map((v) => {
    const partyEntry = v.entries.find((e) => e.ledger.party)
    return {
      id: v.id,
      number: v.number,
      date: v.date,
      type: v.type,
      partyName: partyEntry?.ledger.party?.name ?? null,
      amount: v.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0),
      notes: v.notes,
    }
  })

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Purchase Bills"
        subtitle={`${total} bill${total !== 1 ? 's' : ''} total`}
        badge="Transactions"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Purchase_Bills" />
            <Link
              href="/transactions/purchases/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-glow"
            >
              <Plus size={15} />
              New Bill
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
        baseHref="/transactions/purchases"
        voucherType="PURCHASE"
      />
    </div>
  )
}