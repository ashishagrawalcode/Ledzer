import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionListSimple } from '@/components/transactions/TransactionListSimple'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Payments · Ledzer' }

export default async function PaymentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const vouchers = await prisma.voucher.findMany({
    where: { businessId: business.id, type: 'PAYMENT' },
    include: {
      entries: {
        include: { ledger: { select: { name: true, group: true } } },
      },
    },
    orderBy: { date: 'desc' },
    take: 100,
  })

  const rows = vouchers.map((v) => {
    const amount = v.entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
    const party = v.entries.find(e => e.type === 'DEBIT')?.ledger.name ?? 'N/A'
    return {
      id: v.id,
      number: v.number,
      date: format(new Date(v.date), 'dd MMM yyyy'),
      party,
      amount,
      notes: v.notes ?? null,
      type: v.type,
    }
  })

  const total = rows.reduce((s, r) => s + r.amount, 0)

  return (
    <div className="w-full animate-fade-up space-y-6">
      <PageHeader
        title="Payments"
        subtitle={`${rows.length} payment${rows.length !== 1 ? 's' : ''} · Total paid: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: business.currency ?? 'INR', maximumFractionDigits: 0 }).format(total)}`}
        badge="Transactions"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Payments" />
            <Link href="/transactions/payments/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-foreground font-semibold text-sm hover:bg-amber-600 transition-all">
              <Plus size={15} />New Payment
            </Link>
          </div>
        }
      />
      <TransactionListSimple rows={rows} currency={business.currency ?? 'INR'} emptyLabel="payments" />
    </div>
  )
}