import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@ledzer/database'
import { PageHeader } from '@/components/shared/PageHeader'
import { SettingsClient } from '@/components/settings/SettingsClient'

export const metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const business = await prisma.business.findFirst({
    where: { ownerId: session.user.id },
  })
  if (!business) redirect('/dashboard')

  return (
    <div className="w-full max-w-3xl animate-fade-up space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your business profile, preferences, and display options."
        badge="System"
      />
      <SettingsClient
        business={{
          name: business.name,
          gstin: business.gstin ?? '',
          currency: business.currency ?? 'INR',
          fiscalYearStart: business.fiscalYearStart
            ? business.fiscalYearStart.toISOString().split('T')[0]
            : '',
        }}
        user={{
          name: session.user?.name ?? null,
          email: session.user?.email ?? null,
        }}
      />
    </div>
  )
}