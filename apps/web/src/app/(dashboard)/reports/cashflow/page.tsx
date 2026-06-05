import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { CashFlowClient } from '@/components/reports/CashFlowClient'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Cash Flow · Reports · Ledzer' }

export default async function CashFlowPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  // Default: last 6 months
  const toDate = searchParams.to ? new Date(searchParams.to) : endOfMonth(new Date())
  const fromDate = searchParams.from ? new Date(searchParams.from) : startOfMonth(subMonths(toDate, 5))

  // Fetch all voucher entries in date range
  const vouchers = await prisma.voucher.findMany({
    where: {
      businessId: business.id,
      date: { gte: fromDate, lte: toDate },
    },
    include: {
      entries: {
        include: { ledger: { select: { group: true, name: true } } },
      },
    },
    orderBy: { date: 'asc' },
  })

  // Build monthly cash flow data
  // Income = CREDIT entries on INCOME group ledgers
  // Expense = DEBIT entries on EXPENSE group ledgers
  const monthlyMap: Record<string, { income: number; expense: number }> = {}

  for (const v of vouchers) {
    const monthKey = format(new Date(v.date), 'MMM yyyy')
    if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { income: 0, expense: 0 }

    for (const e of v.entries) {
      if (e.ledger.group === 'INCOME' && e.type === 'CREDIT') {
        monthlyMap[monthKey].income += e.amount
      }
      if (e.ledger.group === 'EXPENSE' && e.type === 'DEBIT') {
        monthlyMap[monthKey].expense += e.amount
      }
    }
  }

  // Fill all months between from and to (even empty ones)
  const allMonths: string[] = []
  let cursor = startOfMonth(fromDate)
  while (cursor <= toDate) {
    allMonths.push(format(cursor, 'MMM yyyy'))
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
  }

  const chartData = allMonths.map((month) => ({
    month,
    income: monthlyMap[month]?.income ?? 0,
    expense: monthlyMap[month]?.expense ?? 0,
    net: (monthlyMap[month]?.income ?? 0) - (monthlyMap[month]?.expense ?? 0),
  }))

  // Summary stats
  const totalIncome = chartData.reduce((s, d) => s + d.income, 0)
  const totalExpense = chartData.reduce((s, d) => s + d.expense, 0)
  const netCashFlow = totalIncome - totalExpense

  // Top income / expense categories
  const categoryMap: Record<string, { type: 'income' | 'expense'; amount: number }> = {}
  for (const v of vouchers) {
    for (const e of v.entries) {
      if (e.ledger.group === 'INCOME' && e.type === 'CREDIT') {
        categoryMap[e.ledger.name] = {
          type: 'income',
          amount: (categoryMap[e.ledger.name]?.amount ?? 0) + e.amount,
        }
      }
      if (e.ledger.group === 'EXPENSE' && e.type === 'DEBIT') {
        categoryMap[e.ledger.name] = {
          type: 'expense',
          amount: (categoryMap[e.ledger.name]?.amount ?? 0) + e.amount,
        }
      }
    }
  }

  const categories = Object.entries(categoryMap)
    .map(([name, d]) => ({ name, ...d }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  return (
    <div className="w-full animate-fade-up space-y-6">
      <PageHeader
        title="Cash Flow"
        subtitle={`Income vs. expenses from ${format(fromDate, 'dd MMM yyyy')} to ${format(toDate, 'dd MMM yyyy')}`}
        badge="Reports"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={chartData} filename="Cash_Flow" />
          </div>
        }
      />
      <CashFlowClient
        chartData={chartData}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        netCashFlow={netCashFlow}
        categories={categories}
        currency={business.currency ?? 'INR'}
        from={format(fromDate, 'yyyy-MM-dd')}
        to={format(toDate, 'yyyy-MM-dd')}
      />
    </div>
  )
}