import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { DayBookClient } from '@/components/reports/DayBookClient'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Daybook' }

export default async function DayBookPage({ searchParams }: { searchParams: { date?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const selectedDate = searchParams.date ? new Date(searchParams.date) : new Date()
  
  const vouchers = await db.voucher.findMany({
    where: {
      businessId: business.id,
      date: {
        gte: new Date(selectedDate.setHours(0, 0, 0, 0)),
        lte: new Date(selectedDate.setHours(23, 59, 59, 999))
      }
    },
    include: {
      entries: {
        include: { ledger: { select: { name: true, group: true } } }
      }
    },
    orderBy: { date: 'asc' }
  })

  const rows = vouchers.map((v) => ({
    id: v.id,
    number: v.number,
    type: v.type,
    date: v.date,
    notes: v.notes,
    totalDebit: v.entries.filter(e => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0),
    entries: v.entries.map(e => ({
      ledgerName: e.ledger.name,
      ledgerGroup: e.ledger.group,
      type: e.type,
      amount: e.amount
    }))
  }))

  const totalForDay = rows.reduce((s, r) => s + r.totalDebit, 0)

  // Flat export data for CSV
  const exportData = rows.flatMap(v => v.entries.map(e => ({
    Date: v.date.toLocaleDateString(),
    Voucher: v.number,
    Type: v.type,
    Ledger: e.ledgerName,
    Group: e.ledgerGroup,
    Amount: e.amount
  })))

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Daybook"
        subtitle="All transactions for the selected day"
        badge="Reports"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={exportData} filename={`Daybook_${selectedDate.toISOString().split('T')[0]}`} />
          </div>
        }
      />
      <DayBookClient 
        vouchers={rows} 
        currency={business.currency ?? 'INR'} 
        selectedDate={selectedDate.toISOString()}
        totalForDay={totalForDay}
      />
    </div>
  )
}