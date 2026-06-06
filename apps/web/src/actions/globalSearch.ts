'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@ledzer/database'

export interface SearchResult {
  label: string
  sub: string
  href: string
  type: 'Party' | 'Voucher' | 'Ledger' | 'Product'
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const q = query.trim()
  if (q.length < 2) return []

  // Step 1: Always resolve businessId first — never filter by userId directly on child tables
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true },
  })
  if (!business) return []

  const businessId = business.id

  // Step 2: Search in parallel across all entities
  const [parties, vouchers, ledgers, products] = await Promise.allSettled([
    prisma.party.findMany({
      where: {
        businessId,
        name: { contains: q, mode: 'insensitive' },
      },
      take: 5,
      select: { id: true, name: true, type: true, email: true, phone: true },
    }),
    prisma.voucher.findMany({
      where: {
        businessId,
        OR: [
          { number: { contains: q, mode: 'insensitive' } },
          { notes: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: { id: true, number: true, type: true, date: true },
      orderBy: { date: 'desc' },
    }),
    prisma.ledger.findMany({
      where: {
        businessId,
        name: { contains: q, mode: 'insensitive' },
      },
      take: 4,
      select: { id: true, name: true, group: true },
    }),
    // Products — only if model exists; wrapped in allSettled so it fails silently
    prisma.product.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 3,
      select: { id: true, name: true, sku: true },
    }),
  ])

  const results: SearchResult[] = []

  // Parties
  if (parties.status === 'fulfilled') {
    for (const p of parties.value) {
      results.push({
        label: p.name,
        sub: p.email ?? p.phone ?? (p.type === 'CUSTOMER' ? 'Customer' : 'Supplier'),
        href: `/parties/${p.type === 'CUSTOMER' ? 'customers' : 'suppliers'}/${p.id}`,
        type: 'Party',
      })
    }
  }

  // Vouchers
  if (vouchers.status === 'fulfilled') {
    for (const v of vouchers.value) {
      const typeToRoute: Record<string, string> = {
        SALES: 'sales', PURCHASE: 'purchases', RECEIPT: 'receipts',
        PAYMENT: 'payments', JOURNAL: 'journals', CONTRA: 'contra',
      }
      results.push({
        label: v.number,
        sub: v.type.charAt(0) + v.type.slice(1).toLowerCase(),
        href: `/transactions/${typeToRoute[v.type] ?? v.type.toLowerCase()}`,
        type: 'Voucher',
      })
    }
  }

  // Ledgers
  if (ledgers.status === 'fulfilled') {
    for (const l of ledgers.value) {
      results.push({
        label: l.name,
        sub: l.group.charAt(0) + l.group.slice(1).toLowerCase(),
        href: `/masters/ledgers`,
        type: 'Ledger',
      })
    }
  }

  // Products
  if (products.status === 'fulfilled') {
    for (const p of products.value) {
      results.push({
        label: p.name,
        sub: p.sku ? `SKU: ${p.sku}` : 'Product',
        href: `/inventory`,
        type: 'Product',
      })
    }
  }

  return results
}