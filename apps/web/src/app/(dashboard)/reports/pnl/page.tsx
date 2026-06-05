import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PnLClient } from '@/components/reports/PnLClient'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Profit & Loss' }

export default async function PnLPage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await db.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  // Default: current fiscal year
  const now = new Date()
  const fyStart = business.fiscalYearStart ? new Date(business.fiscalYearStart) : new Date(now.getFullYear(), 3, 1)
  const fromDate = searchParams.from ? new Date(searchParams.from) : new Date(fyStart.getFullYear(), fyStart.getMonth(), 1)
  const toDate = searchParams.to ? new Date(searchParams.to) : now

  // Fetch all ledger entries in range grouped by ledger
  const ledgers = await db.ledger.findMany({
    where: {
      businessId: business.id,
      group: { in: ['INCOME', 'EXPENSE'] },
    },
    include: {
      entries: {
        where: {
          voucher: { date: { gte: fromDate, lte: toDate } }
        },
        select: { type: true, amount: true },
      },
    },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  })

  const incomeAccounts = ledgers
    .filter((l) => l.group === 'INCOME')
    .map((l) => ({
      id: l.id,
      name: l.name,
      balance: l.entries.reduce((s, e) => e.type === 'CREDIT' ? s + e.amount : s - e.amount, 0),
    }))
    .filter((l) => l.balance !== 0)

  const expenseAccounts = ledgers
    .filter((l) => l.group === 'EXPENSE')
    .map((l) => ({
      id: l.id,
      name: l.name,
      balance: l.entries.reduce((s, e) => e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0),
    }))
    .filter((l) => l.balance !== 0)

  const totalIncome = incomeAccounts.reduce((s, l) => s + l.balance, 0)
  const totalExpenses = expenseAccounts.reduce((s, l) => s + l.balance, 0)
  const netProfit = totalIncome - totalExpenses
  const exportData = [
    ...incomeAccounts.map(acc => ({ Category: 'Income', Account: acc.name, Balance: acc.balance })),
    ...expenseAccounts.map(acc => ({ Category: 'Expense', Account: acc.name, Balance: acc.balance })),
    { Category: 'Summary', Account: 'Total Income', Balance: totalIncome },
    { Category: 'Summary', Account: 'Total Expenses', Balance: totalExpenses },
    { Category: 'Summary', Account: 'Net Profit', Balance: netProfit }
  ]

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Profit & Loss"
        subtitle={`${fromDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} to ${toDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        badge="Reports"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={exportData} filename="Profit_and_Loss" />
          </div>
        }
      />
      <PnLClient
        incomeAccounts={incomeAccounts}
        expenseAccounts={expenseAccounts}
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netProfit={netProfit}
        currency={business.currency ?? 'INR'}
        fromDate={fromDate.toISOString()}
        toDate={toDate.toISOString()}
        businessName={business.name}
      />
    </div>
  )
}