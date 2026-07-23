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
import SyncProgressBar from '../shared/SyncProgressBar.jsx'
import Seo from '../shared/Seo.jsx'
import { isLoggedIn, getStoredUsername, dashboardBase } from '../services/dashboardApi.js'
import { goToPath } from '../router.js'

// Floating "Dashboard" button — shown ONLY when the creator is inspecting their
// own card FROM the dashboard, i.e. the URL carries ?owner=1 ("View Live
// Profile") or ?preview (the Edit-Profile iframe). The plain shareable link is
// what brands and visitors open, so it must stay clean — no Dashboard button —
// even when the owner themselves opens it. Same rule as the "Upgrade to
// unlock" overlays, so owner-only chrome appears in exactly one place.
function DashboardFab() {
  const uname = getStoredUsername()
  if (!isLoggedIn() || !uname) return null
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  if (!q.has('owner') && !q.has('preview')) return null
  // First path segment is the card's username (/<username>/<publicId>).
  const seg = decodeURIComponent(window.location.pathname.split('/').filter(Boolean)[0] || '')
  if (seg.toLowerCase() !== uname.toLowerCase()) return null
  return (
    <button
      type="button"
      data-pdf-hide
      onClick={() => goToPath(dashboardBase(uname))}
      aria-label="Go to your dashboard"
      className="fixed top-4 right-4 z-[60] inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white transition-transform hover:scale-[1.03]"
      style={{
        fontFamily: "'Outfit', sans-serif",
        background: 'var(--theme-grad, linear-gradient(90deg,#7C5CFF,#C04DCC))',
        boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
      Dashboard
    </button>
  )
}

// Full-screen loader shown until the first data fetch resolves, so the page
// never flashes empty/placeholder content before the real creator lands.
function Loader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black">
      <img
        src="/loading.png"
        alt="Loading…"
        className="w-24 h-24 animate-pulse select-none"
        style={{ objectFit: 'contain' }}
      />
      <p className="text-white/60 text-[14px] tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Syncing data…
      </p>
      <SyncProgressBar />
    </div>
  )
}

// Shown when the URL handle doesn't resolve to a creator — e.g. someone tried a
// @username instead of the card's unguessable link. We don't render the card
// template, so a card can't be opened by guessing a username.
function NotAvailable() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-black text-white px-6 text-center">
      {/* A dead/private link shouldn't be indexed as a real page. */}
      <Seo title="Card not available — Creasume" noindex />
      <img src="/loading.png" alt="" className="w-16 h-16 opacity-70 select-none" style={{ objectFit: 'contain' }} />
      <h1 className="text-2xl font-bold mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>This card isn&apos;t available</h1>
      <p className="text-white/55 text-sm max-w-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
        This link isn&apos;t valid, or the creator&apos;s card is private. Ask them for their Creasume link.
      </p>
    </div>
  )
}

// Inner page — reads `ready` from the provider and waits for it before painting.
function InfluenceCardInner() {
  const { ready, notFound, THEME, CREATOR } = useInfluence()
  if (!ready) return <Loader />
  if (notFound) return <NotAvailable />
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
  // Normalise the accent to a 6-digit hex so we can append an alpha channel
  // (#RRGGBBAA) below. Falls back to the brand purple for the default theme.
  const toHex6 = (c) => {
    if (typeof c !== 'string') return '#5D65DC'
    const m = c.trim().match(/^#?([0-9a-fA-F]{6})$/) || c.trim().match(/^#?([0-9a-fA-F]{3})$/)
    if (!m) return '#5D65DC'
    const h = m[1]
    return '#' + (h.length === 3 ? h.split('').map((x) => x + x).join('') : h)
  }
  const accent = toHex6(THEME?.primary)

  // Mesh = the SELECTED accent tinting the dark card (an orange pick → warm mesh,
  // green → green mesh, matching the picker). Solid/Dark stays near-black,
  // independent of the accent color.
  const meshBg =
    `radial-gradient(125% 90% at 50% -5%, ${accent}59 0%, ${accent}24 42%, rgba(0,0,0,0) 78%), ` +
    `linear-gradient(180deg, ${accent}14 0%, #070709 72%)`
  const solidBg = 'linear-gradient(180deg, #0a0b10 0%, #050507 100%)'

  const rootStyle = {
    ...(THEME
      ? {
          '--theme-grad': THEME.grad,
          '--theme-1': THEME.primary,
          '--theme-2': THEME.secondary,
          ...(THEME.font ? { '--card-font': FONT_MAP[THEME.font] || FONT_MAP.outfit } : {}),
        }
      : {}),
    // Default the card background to Solid Dark; Mesh (accent-tinted) only when chosen.
    background: THEME?.bg === 'mesh' ? meshBg : solidBg,
  }
  // Per-creator SEO built from their live profile data, so each card ranks and
  // shares with its own title/description instead of the generic site default.
  const seoName = CREATOR?.name || 'Creator'
  const seoNiche = (CREATOR?.niche || '').trim()
  const seoBio = (CREATOR?.bio || '').trim()
  const seoTitle = `${seoName}${seoNiche ? ` · ${seoNiche} Creator` : ''} — Media Kit | Creasume`
  const seoDesc = seoBio
    ? `${seoBio} — ${seoName}'s verified creator media kit on Creasume.`
    : `${seoName}'s verified creator media kit${seoNiche ? ` in ${seoNiche}` : ''} — real Instagram stats, top posts and collaboration packages on Creasume.`

  return (
    <MotionConfig reducedMotion="user">
      <div id="influence-card-root" className="relative min-h-screen overflow-x-clip bg-black text-white" style={rootStyle}>
        <Seo
          title={seoTitle}
          description={seoDesc}
          image={CREATOR?.profilePicture || undefined}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'ProfilePage',
            mainEntity: {
              '@type': 'Person',
              name: seoName,
              ...(CREATOR?.username ? { alternateName: `@${CREATOR.username}` } : {}),
              ...(seoBio ? { description: seoBio } : {}),
              ...(CREATOR?.profilePicture ? { image: CREATOR.profilePicture } : {}),
            },
          }}
        />
        {/* Ambient brand background */}
        <div className="starfield" />

        {/* Signed-in creator: quick link back to their dashboard */}
        <DashboardFab />

        {/* Click-driven paper-airplane flight (fired by the CTA button) */}
        <PaperPlaneFlight />

        <ProfileHero />
        <LiveAnalytics />
        <TopPosts />
        <ProfessionalPresence />
        <CampaignShowcase />
        <Packages />
        {/* (27) Brand inquiries are NEVER gated on the card — every creator keeps
            the "Work With Me" form so a brand can always reach out and no lead is
            lost. The plan gates READING them in the dashboard, not receiving them. */}
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
