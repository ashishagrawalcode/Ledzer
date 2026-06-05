import { LandingNavbar } from '@/components/landing/LandingNavbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { MetricsSection } from '@/components/landing/MetricsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { JargonFreeDemo } from '@/components/landing/JargonFreeDemo'
import { DashboardShowcase } from '@/components/landing/DashboardShowcase'
import { LandingFooter } from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy w-full overflow-x-hidden">
      <LandingNavbar />
      <main>
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <JargonFreeDemo />
        <DashboardShowcase />
      </main>
      <LandingFooter />
    </div>
  )
}