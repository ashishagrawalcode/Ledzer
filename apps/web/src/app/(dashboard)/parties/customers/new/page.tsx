import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewPartyForm } from '@/components/parties/NewPartyForm'

export const metadata = { title: 'New Customer · Ledzer' }

export default async function NewCustomerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
    select: { id: true }
  })
  if (!business) redirect('/dashboard')

  return (
    <div className="w-full max-w-2xl animate-fade-up space-y-6">
      <PageHeader
        title="New Customer"
        subtitle="Add a new customer to your directory to track receivables."
        badge="Parties"
        backHref="/parties/customers"
      />
      <NewPartyForm
        businessId={business.id}
        partyType="CUSTOMER"
        returnHref="/parties/customers"
      />
    </div>
  )
}