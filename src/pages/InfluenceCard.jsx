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
      <img
        src="/loading.png"
        alt="Loading…"
        className="w-24 h-24 animate-pulse select-none"
        style={{ objectFit: 'contain' }}
      />
    </div>
  )
}

// Inner page — reads `ready` from the provider and waits for it before painting.
function InfluenceCardInner() {
  const { ready, THEME } = useInfluence()
  if (!ready) return <Loader />
  // Apply the creator's chosen palette + font + background as CSS variables /
  // inline styles on the root. Every themed element (LABEL_GRADIENT, accent
  // buttons, the avatar ring, fonts, …) reads these, so changing the theme
  // re-skins the whole card. No theme → fall back to the default palette/font/bg.
  // Keys must match FONTS in EditProfileView.jsx and families loaded in index.html.
  const FONT_MAP = {
    outfit: "'Outfit', sans-serif",
    inter: "'Inter', sans-serif",
    poppins: "'Poppins', sans-serif",
    montserrat: "'Montserrat', sans-serif",
    sora: "'Sora', sans-serif",
    spaceGrotesk: "'Space Grotesk', sans-serif",
    dmSans: "'DM Sans', sans-serif",
    bricolage: "'Bricolage Grotesque', sans-serif",
    playfair: "'Playfair Display', serif",
    lora: "'Lora', serif",
  }
  const BG_MAP = {
    mesh: 'radial-gradient(120% 120% at 30% 10%, #2b3aa0 0%, #141a4d 45%, #0a0c1f 100%)',
    solid: 'linear-gradient(160deg,#0b0d18 0%,#05060f 100%)',
  }
  const rootStyle = {
    ...(THEME
      ? {
          '--theme-grad': THEME.grad,
          '--theme-1': THEME.primary,
          '--theme-2': THEME.secondary,
          ...(THEME.font ? { '--card-font': FONT_MAP[THEME.font] || FONT_MAP.outfit } : {}),
        }
      : {}),
    // Default the card background to Solid Dark; Mesh only when explicitly chosen.
    background: BG_MAP[THEME?.bg] || BG_MAP.solid,
  }
  return (
    <MotionConfig reducedMotion="user">
      <div id="influence-card-root" className="relative min-h-screen overflow-x-clip bg-black text-white" style={rootStyle}>
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

// Public-facing Influence Card (creator media kit). Reached at the clean
// `/<username>`, which loads that creator's live data from the Creasume
// backend. Each section lives under components/influence/ and reads from
// InfluenceDataProvider.
export default function InfluenceCard() {
  return (
    <InfluenceDataProvider>
      <InfluenceCardInner />
    </InfluenceDataProvider>
  )
}
