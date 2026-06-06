import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { PartiesList } from '@/components/parties/PartiesList'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ExportDropdown } from '@/components/shared/ExportDropdown'

export const metadata = { title: 'Suppliers · Ledzer' }

export default async function SuppliersPage({ searchParams }: { searchParams: { search?: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  
  const business = await prisma.business.findFirst({ where: { ownerId: session.user.id } })
  if (!business) redirect('/dashboard')

  const search = searchParams.search?.trim() ?? ''
  const parties = await prisma.party.findMany({
    where: { 
      businessId: business.id, 
      type: 'SUPPLIER', 
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}) 
    },
    include: { ledger: { include: { entries: { select: { type: true, amount: true } } } } },
    orderBy: { name: 'asc' },
  })

  const rows = parties.map((p) => {
    // Safety check: Fallback to empty array if ledger is missing
    const entries = p.ledger?.entries || []
    const balance = entries.reduce((s, e) => e.type === 'DEBIT' ? s + e.amount : s - e.amount, 0)
    
    return { 
      id: p.id, 
      name: p.name, 
      type: p.type, 
      email: p.email, 
      phone: p.phone, 
      gstin: p.gstin, 
      balance, 
      totalTransacted: entries.reduce((s, e) => s + e.amount, 0), 
      txCount: entries.length 
    }
  })

  const totalPayable = rows.reduce((s, r) => s + Math.max(0, -r.balance), 0)
  
  // Dynamic currency formatter based on the business settings
  const formattedPayable = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: business.currency ?? 'INR',
    maximumFractionDigits: 0
  }).format(totalPayable)

  return (
    <div className="w-full animate-fade-up">
      <PageHeader 
        title="Suppliers" 
        subtitle={`${rows.length} supplier${rows.length !== 1 ? 's' : ''} · ${formattedPayable} payable`} 
        badge="Parties"
        actions={
          <div className="flex items-center gap-3">
            <ExportDropdown data={rows} filename="Suppliers" />
            <Link href="/parties/suppliers/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-navy font-semibold text-sm hover:bg-teal-hover transition-all duration-200 shadow-glow">
              <Plus size={15} />
              <span className="hidden sm:inline">New Supplier</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        }
      />
      <PartiesList 
        parties={rows} 
        currency={business.currency ?? 'INR'} 
        search={search} 
        partyType="SUPPLIER" 
      />
    </div>
  )
}