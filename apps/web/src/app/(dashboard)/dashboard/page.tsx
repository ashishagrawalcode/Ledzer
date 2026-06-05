import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // 1. Fetch core business data, ledgers, and parties
  const business = await db.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      ledgers: {
        where: { isSystem: true },
        select: { id: true, name: true, group: true, entries: {
          select: { type: true, amount: true }
        }},
      },
      parties: {
        select: {
          id: true, name: true, type: true,
          ledger: {
            select: {
              entries: { select: { type: true, amount: true } }
            }
          }
        }
      },
    },
  })

  if (!business) return null;

  // 2. Fetch the 8 most recent vouchers for the Activity Feed
  const recentVouchersData = await db.voucher.findMany({
    where: { businessId: business.id },
    orderBy: { date: 'desc' },
    take: 8,
    include: {
      entries: {
        include: { ledger: { select: { name: true, group: true } } }
      }
    }
  })

  // 3. Fetch ALL vouchers for the current month for accurate P&L math
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthlyVouchers = await db.voucher.findMany({
    where: {
      businessId: business.id,
      date: { gte: monthStart }
    },
    include: {
      entries: true
    }
  })

  // Compute summary from real ledger entries
  const getLedgerBalance = (ledgerName: string) => {
    const ledger = business.ledgers.find((l) => l.name === ledgerName)
    if (!ledger) return null
    return ledger.entries.reduce((sum, e) => {
      return e.type === 'DEBIT' ? sum + e.amount : sum - e.amount
    }, 0)
  }

  // Cash + Bank
  const cashBalance = getLedgerBalance('Cash')
  const bankBalance = getLedgerBalance('Bank Account')
  const totalCash = (cashBalance ?? 0) + (bankBalance ?? 0)

  // Receivables: customers with positive debit balance (they owe us)
  const totalReceivables = business.parties
    .filter((p) => p.type === 'CUSTOMER')
    .reduce((sum, p) => {
      const balance = p.ledger.entries.reduce((s, e) =>
        e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0)
      return sum + Math.max(0, balance)
    }, 0)

  // Payables: suppliers with positive credit balance (we owe them)
  const totalPayables = business.parties
    .filter((p) => p.type === 'SUPPLIER')
    .reduce((sum, p) => {
      const balance = p.ledger.entries.reduce((s, e) =>
        e.type === 'CREDIT' ? s + e.amount : s - e.amount, 0)
      return sum + Math.max(0, balance)
    }, 0)

  // Calculate accurate monthly income vs expenses
  const monthlyIncome = monthlyVouchers
    .filter((v) => v.type === 'SALES' || v.type === 'RECEIPT')
    .reduce((sum, v) => {
      const debit = v.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
      return sum + debit
    }, 0)
    
  const monthlyExpenses = monthlyVouchers
    .filter((v) => v.type === 'PURCHASE' || v.type === 'PAYMENT')
    .reduce((sum, v) => {
      const credit = v.entries.filter((e) => e.type === 'CREDIT').reduce((s, e) => s + e.amount, 0)
      return sum + credit
    }, 0)

  const dashboardData = {
    businessName: business.name,
    currency: business.currency || 'INR',
    summary: {
      cashAvailable: totalCash > 0 ? totalCash : null,
      pendingReceivables: totalReceivables > 0 ? totalReceivables : null,
      pendingPayables: totalPayables > 0 ? totalPayables : null,
      monthlyIncome: monthlyIncome > 0 ? monthlyIncome : null,
      monthlyExpenses: monthlyExpenses > 0 ? monthlyExpenses : null,
      monthlyProfit: monthlyIncome - monthlyExpenses !== 0 ? monthlyIncome - monthlyExpenses : null,
    },
    recentVouchers: recentVouchersData.map((v) => ({
      id: v.id,
      number: v.number,
      type: v.type,
      date: v.date,
      notes: v.notes,
      amount: v.entries
        .filter((e) => e.type === 'DEBIT')
        .reduce((s, e) => s + e.amount, 0),
      party: v.entries.find((e) => e.ledger.group === 'ASSET' || e.ledger.group === 'LIABILITY')?.ledger.name ?? null,
    })),
    userName: session.user?.name ?? null,
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient data={dashboardData} />
    </Suspense>
  )
}