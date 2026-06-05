import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { BalanceSheetClient } from '@/components/reports/BalanceSheetClient'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Balance Sheet' }

export default async function BalanceSheetPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const ledgers = await prisma.ledger.findMany({
    where: { businessId: business.id },
    include: { entries: { select: { type: true, amount: true } } },
    orderBy: [{ group: 'asc' }, { name: 'asc' }],
  })

  const withBalance = ledgers.map((l) => ({
    id: l.id,
    name: l.name,
    group: l.group,
    isSystem: l.isSystem,
    balance: l.entries.reduce((s, e) => e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0),
  }))

  const grouped = {
    ASSET:     withBalance.filter((l) => l.group === 'ASSET'),
    LIABILITY: withBalance.filter((l) => l.group === 'LIABILITY'),
    EQUITY:    withBalance.filter((l) => l.group === 'EQUITY'),
    INCOME:    withBalance.filter((l) => l.group === 'INCOME'),
    EXPENSE:   withBalance.filter((l) => l.group === 'EXPENSE'),
  }

  const exportData = [
    ...grouped.ASSET.map(l => ({ Type: 'Asset', Account: l.name, Balance: l.balance })),
    ...grouped.LIABILITY.map(l => ({ Type: 'Liability', Account: l.name, Balance: l.balance })),
    ...grouped.EQUITY.map(l => ({ Type: 'Equity', Account: l.name, Balance: l.balance })),
    ...grouped.INCOME.map(l => ({ Type: 'Income', Account: l.name, Balance: l.balance })),
    ...grouped.EXPENSE.map(l => ({ Type: 'Expense', Account: l.name, Balance: l.balance })),
  ]

  return (
    <div className="w-full animate-fade-up">
      <PageHeader title="Balance Sheet" subtitle="Assets, Liabilities and Equity" badge="Reports" 
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={exportData} filename="Balance_Sheet" />
          </div>
        }
      />
      <BalanceSheetClient grouped={grouped} currency={business.currency ?? 'INR'} businessName={business.name} />
    </div>
  )
}