import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@ledzer/database'
import { AppNavbar } from '@/components/layout/AppNavbar'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { OnboardingModal } from '@/components/shared/OnboardingModal'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  // Fetch business — check if onboarding needed
  const business = await db.business.findFirst({
    where: { ownerId: session.user.id },
    select: {
      id: true,
      name: true,
      gstin: true,
      currency: true,
      fiscalYearStart: true,
    },
  })

  // Determine missing fields that need onboarding
  const needsOnboarding = !business || !business.name || !business.currency

  return (
    <div className="min-h-screen bg-background w-full">
      <AppNavbar
        session={session}
        businessName={business?.name ?? null}
      />

      {/* Main content — offset by navbar height */}
      <main className="pt-16 pb-20 lg:pb-6 w-full min-h-screen">
        <div className="w-full app-container py-6">
          {children}
        </div>
      </main>

      <MobileBottomNav />

      {/* Onboarding modal — shown if fields missing */}
      {needsOnboarding && (
        <OnboardingModal
          userId={session.user.id}
          existingData={business ? {
            name: business.name,
            gstin: business.gstin ?? null,
            currency: business.currency ?? null,
            fiscalYearStart: business.fiscalYearStart ?? null,
          } : null}
        />
      )}
    </div>
  )
}