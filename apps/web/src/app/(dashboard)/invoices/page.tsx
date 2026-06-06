import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { InvoiceBuilder } from '@/components/invoices/InvoiceBuilder'
import { PageHeader } from '@/components/shared/PageHeader'

export const metadata = { title: 'Quick Invoice · Ledzer' }

export default async function InvoicesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Fetch Business, Customers, AND Products in one go
  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    include: {
      parties: {
        where: { type: 'CUSTOMER' },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      },
      products: {
        select: { id: true, name: true, salePrice: true },
        orderBy: { name: 'asc' }
      }
    },
  })

  if (!business) redirect('/dashboard')

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-up space-y-6 pb-20">
      <PageHeader
        title="Quick Invoice"
        subtitle="Generate bills, pull from inventory, and update ledgers instantly."
        badge="POS Mode"
      />
      
      <InvoiceBuilder 
        businessId={business.id} 
        currency={business.currency ?? 'INR'} 
        parties={business.parties} 
        products={business.products}
      />
    </div>
  )
}