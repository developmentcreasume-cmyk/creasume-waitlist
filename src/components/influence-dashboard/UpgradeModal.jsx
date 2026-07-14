// One upgrade prompt for the whole dashboard.
//
// Every plan gate on the backend answers with HTTP 402 + { requiredFeature,
// currentPlan, error }. services/dashboardApi.js turns that into a
// `creasume:upgrade` window event, so ANY blocked action — creating a package,
// adding a 6th collab logo, saving a custom theme, opening a brand inquiry —
// pops this modal without the calling component having to know anything about
// plans. UI that hides a locked control (rather than calling the API) can raise
// the same prompt directly with showUpgrade('mediaKit').
import { useEffect, useState } from 'react'
import { goToPath } from '../../router.js'
import { dashboardUsername, dashboardBase } from '../../services/dashboardApi.js'
import { UPGRADE_EVENT } from './upgradePrompt.js'

const FONT = "'Outfit', sans-serif"

// What each locked feature actually gives them. Keys match config/planFeatures.js
// on the backend. The backend's own error message is the fallback, so a new gate
// still shows something sensible before it's listed here.
const FEATURE_COPY = {
  packagesSection: {
    title: 'Packages & Pricing',
    blurb: 'Show brands exactly what you offer and what it costs, right on your card.',
  },
  maxPackages: {
    title: 'More packages',
    blurb: 'Your plan caps how many packages you can list. Upgrade to add more.',
  },
  maxCollabLogos: {
    title: 'Unlimited brand logos',
    blurb: 'Free cards show up to 5 brand collab logos. Upgrade to showcase every brand you’ve worked with.',
  },
  fullDesignControl: {
    title: 'Full design control',
    blurb: 'Pick your own accent colours, gradients and fonts. Free cards use the default theme.',
  },
  brandInquiryButton: {
    title: 'Brand inquiries',
    blurb: 'Brands can already reach out through your card — upgrade to read their inquiries and reply.',
  },
  reachImpressions: {
    title: 'Reach & impressions',
    blurb: 'Show brands your 30-day reach and impressions, the numbers they actually buy on.',
  },
  fullAudience: {
    title: 'Full audience data',
    blurb: 'Reveal your audience’s cities, age and gender split — not just the top country.',
  },
  mediaKit: {
    title: 'Auto-generated media kit',
    blurb: 'Download your card as a polished PDF media kit you can send to any brand.',
  },
  pageViewCount: {
    title: 'Profile view count',
    blurb: 'See how many brands are actually viewing your card.',
  },
}

export default function UpgradeModal() {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    const onUpgrade = (e) => {
      setDetail(e.detail || {})
      setOpen(true)
    }
    window.addEventListener(UPGRADE_EVENT, onUpgrade)
    return () => window.removeEventListener(UPGRADE_EVENT, onUpgrade)
  }, [])

  // Close on Escape, and lock the page behind the modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const copy = FEATURE_COPY[detail?.feature] || {}
  const title = copy.title || 'This is a paid feature'
  // Prefer our own copy; fall back to whatever the backend said.
  const blurb = copy.blurb || detail?.message || 'Upgrade your plan to unlock this.'
  const plan = detail?.plan

  const goToBilling = () => {
    setOpen(false)
    goToPath(`${dashboardBase(dashboardUsername())}?view=settings&tab=billing`)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(3,4,10,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-3xl p-7 text-center"
        style={{
          background: 'radial-gradient(120% 120% at 0% 0%, #2a3a8f 0%, #16205e 45%, #0d1030 100%)',
          border: '1px solid rgba(155,147,232,0.35)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/45 hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-[20px] leading-none"
        >
          ×
        </button>

        <div
          className="mx-auto mb-5 grid place-items-center rounded-2xl"
          style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.20)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C9C4F0" strokeWidth="1.8" strokeLinecap="round">
            <rect x="4" y="10.5" width="16" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
          </svg>
        </div>

        <h2 className="text-white font-semibold text-[22px] mb-2" style={{ fontFamily: FONT }}>{title}</h2>
        <p className="text-white/65 text-[14.5px] leading-relaxed mb-6" style={{ fontFamily: FONT }}>{blurb}</p>

        {plan && (
          <p className="text-white/35 text-[12px] mb-5" style={{ fontFamily: FONT }}>
            You’re on the {plan} plan.
          </p>
        )}

        <button
          type="button"
          onClick={goToBilling}
          className="w-full rounded-xl py-3 font-semibold text-[15px] transition-transform hover:scale-[1.02]"
          style={{ fontFamily: FONT, color: '#0B0B27', background: 'linear-gradient(180deg, #C9C4F0 0%, #A79FE6 100%)' }}
        >
          See plans & upgrade
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2.5 w-full rounded-xl py-2.5 text-[13px] font-medium text-white/55 hover:text-white/80 transition-colors bg-transparent border-0 cursor-pointer"
          style={{ fontFamily: FONT }}
        >
          Not now
        </button>
      </div>
    </div>
  )
}
