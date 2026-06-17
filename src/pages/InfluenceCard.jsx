import { MotionConfig } from 'framer-motion'
import ProfileHero from '../components/influence/ProfileHero.jsx'
import LiveAnalytics from '../components/influence/LiveAnalytics.jsx'
import TopPosts from '../components/influence/TopPosts.jsx'
import ProfessionalPresence from '../components/influence/ProfessionalPresence.jsx'
import CampaignShowcase from '../components/influence/CampaignShowcase.jsx'
import Packages from '../components/influence/Packages.jsx'
import WorkWithMe from '../components/influence/WorkWithMe.jsx'
import PaperPlaneFlight from '../components/influence/PaperPlaneFlight.jsx'
import { InfluenceDataProvider } from '../components/influence/InfluenceDataContext.jsx'

// Public-facing Influence Card (creator media kit). Reached at
// `/influence/<username>`, which loads that creator's live data from the
// Creasume backend. A bare `/influence` (no username) renders the bundled
// Sample.Creator demo. Each section lives under components/influence/ and reads
// from InfluenceDataProvider.
export default function InfluenceCard() {
  return (
    <InfluenceDataProvider>
      <MotionConfig reducedMotion="user">
        <div className="relative min-h-screen overflow-x-clip bg-black text-white">
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
    </InfluenceDataProvider>
  )
}
