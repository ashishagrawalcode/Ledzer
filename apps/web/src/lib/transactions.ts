import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionsList } from '@/components/transactions/TransactionsList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
// import type { VoucherType } from '@prisma/client'
type VoucherType = 'SALES' | 'PURCHASE' | 'RECEIPT' | 'PAYMENT' | 'JOURNAL' | 'CONTRA'

interface PageConfig {
  voucherType: VoucherType
  title: string
  newLabel: string
  href: string
}

export async function buildTransactionPage(
  userId: string,
  config: PageConfig,
  searchParams: { page?: string; search?: string }
) {
  const business = await db.business.findFirst({ where: { ownerId: userId } })
  if (!business) redirect('/dashboard')

  const page = Math.max(1, Number(searchParams.page ?? 1))
  const pageSize = 20
  const search = searchParams.search?.trim() ?? ''
  const searchFilter = search ? {
    OR: [
      { number: { contains: search, mode: 'insensitive' as const } },
      { notes: { contains: search, mode: 'insensitive' as const } },
    ],
  } : {}

  const [vouchers, total] = await Promise.all([
    db.voucher.findMany({
      where: { businessId: business.id, type: config.voucherType, ...searchFilter },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        entries: {
          include: { ledger: { select: { name: true, group: true, party: { select: { name: true, type: true } } } } }
        }
      },
    }),
    db.voucher.count({ where: { businessId: business.id, type: config.voucherType, ...searchFilter } }),
  ])

  const rows = vouchers.map((v) => {
    const partyEntry = v.entries.find((e) => e.ledger.party)
    const amount = v.entries.filter((e) => e.type === 'DEBIT').reduce((s, e) => s + e.amount, 0)
    return { id: v.id, number: v.number, date: v.date, type: v.type, partyName: partyEntry?.ledger.party?.name ?? null, amount, notes: v.notes }
  })

  return { business, rows, total, page, pageSize, search }
}