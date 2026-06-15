import { MotionConfig } from 'framer-motion'
import ProfileHero from '../components/influence/ProfileHero.jsx'
import LiveAnalytics from '../components/influence/LiveAnalytics.jsx'
import TopPosts from '../components/influence/TopPosts.jsx'
import ProfessionalPresence from '../components/influence/ProfessionalPresence.jsx'
import CampaignShowcase from '../components/influence/CampaignShowcase.jsx'
import Packages from '../components/influence/Packages.jsx'
import WorkWithMe from '../components/influence/WorkWithMe.jsx'
import PaperPlaneFlight from '../components/influence/PaperPlaneFlight.jsx'

// Public-facing Influence Card (creator media kit). Reached via the
// `/influence` route. Each section lives in its own component under
// components/influence/ and is driven by the shared influenceData.js dataset.
export default function InfluenceCard() {
  return (
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
  )
}
