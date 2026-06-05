import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { NewLedgerForm } from '@/components/masters/NewLedgerForm'

export const metadata = { title: 'New Ledger' }

export default async function NewLedgerPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const business = await db.business.findFirst({ where: { ownerId: session.user.id }, select: { id: true, currency: true } })
  if (!business) redirect('/dashboard')

  return (
    <div className="w-full max-w-2xl animate-fade-up">
      <PageHeader title="New Ledger" subtitle="Add an account to your chart of accounts" badge="Masters" />
      <NewLedgerForm businessId={business.id} />
    </div>
  )
}