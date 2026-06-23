import { MotionConfig } from 'framer-motion'
import ProfileHero from '../components/influence/ProfileHero.jsx'
import LiveAnalytics from '../components/influence/LiveAnalytics.jsx'
import TopPosts from '../components/influence/TopPosts.jsx'
import ProfessionalPresence from '../components/influence/ProfessionalPresence.jsx'
import CampaignShowcase from '../components/influence/CampaignShowcase.jsx'
import Packages from '../components/influence/Packages.jsx'
import WorkWithMe from '../components/influence/WorkWithMe.jsx'
import PaperPlaneFlight from '../components/influence/PaperPlaneFlight.jsx'
import { InfluenceDataProvider, useInfluence } from '../components/influence/InfluenceDataContext.jsx'

// Full-screen loader shown until the first data fetch resolves, so the page
// never flashes empty/placeholder content before the real creator lands.
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div
        className="rounded-full animate-spin"
        style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: '#8B5CF6' }}
      />
    </div>
  )
}

// Inner page — reads `ready` from the provider and waits for it before painting.
function InfluenceCardInner() {
  const { ready } = useInfluence()
  if (!ready) return <Loader />
  return (
    <MotionConfig reducedMotion="user">
      <div id="influence-card-root" className="relative min-h-screen overflow-x-clip bg-black text-white">
        {/* Ambient brand background */}
        <div className="starfield" />

        {/* Click-driven paper-airplane flight (fired by the CTA button) */}
        <PaperPlaneFlight />

        <ProfileHero />
        <LiveAnalytics />
        <TopPosts />
        <ProfessionalPresence />
        <CampaignShowcase />
        <Packages />
        <WorkWithMe />
      </div>
    </MotionConfig>
  )
}

// Public-facing Influence Card (creator media kit). Reached at
// `/influence/<username>`, which loads that creator's live data from the
// Creasume backend. Each section lives under components/influence/ and reads
// from InfluenceDataProvider.
export default function InfluenceCard() {
  return (
    <InfluenceDataProvider>
      <InfluenceCardInner />
    </InfluenceDataProvider>
  )
}
