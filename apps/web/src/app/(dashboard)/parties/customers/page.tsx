import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PartiesList } from '@/components/parties/PartiesList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Customers · Ledzer' }

export default async function CustomersPage({ searchParams }: { searchParams: { search?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const search = searchParams.search?.trim() ?? ''

  const parties = await prisma.party.findMany({
    where: {
      businessId: business.id,
      type: 'CUSTOMER',
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    include: {
      ledger: { include: { entries: { select: { type: true, amount: true } } } }
    },
    orderBy: { name: 'asc' },
  })

  const rows = parties.map((p) => {
    // Safety check: Fallback to empty array if ledger is missing
    const entries = p.ledger?.entries || []
    const balance = entries.reduce((s, e) => e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0)
    const totalTransacted = entries.reduce((s, e) => s + e.amount, 0)
    
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      email: p.email,
      phone: p.phone,
      gstin: p.gstin,
      balance,
      totalTransacted,
      txCount: entries.length,
    }
  })

  const totalReceivable = rows.reduce((s, r) => s + Math.max(0, r.balance), 0)

  // Dynamic currency formatter based on the business settings
  const formattedReceivable = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: business.currency ?? 'INR',
    maximumFractionDigits: 0
  }).format(totalReceivable)

  return (
    <div className="w-full animate-fade-up">
      <PageHeader
        title="Customers"
        subtitle={`${rows.length} customer${rows.length !== 1 ? 's' : ''} · ${formattedReceivable} receivable`}
        badge="Parties"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Customers" />
            <Link
              href="/parties/customers/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">New Customer</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        }
      />
      <PartiesList 
        parties={rows} 
        currency={business.currency ?? 'INR'} 
        search={search} 
        partyType="CUSTOMER" 
      />
    </div>
  )
}