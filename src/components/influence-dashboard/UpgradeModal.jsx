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
import { UPGRADE_EVENT, openBilling } from './upgradePrompt.js'

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
    blurb: 'Show brands your 30-day reach and impressions — the numbers they actually buy on.',
  },
  fullAudience: {
    title: 'Full audience data',
    blurb: 'Reveal your audience’s cities, age and gender split, not just the top country.',
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

  // Two mechanisms, because one alone isn't enough:
  //   • the event flips the view when we're ALREADY on the dashboard (the route
  //     doesn't change there, so nothing would remount and re-read the query);
  //   • the navigation handles every other page (e.g. the Inquiries route),
  //     where the dashboard mounts fresh and reads ?view/?tab.
  const goToBilling = () => {
    setOpen(false)
    // Send them to the Pricing page to pick a plan (logged in → Choose This Plan
    // opens Razorpay right there). Falls back to the in-dashboard billing tab.
    goToPath('/pricing')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(4,5,12,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-[400px] rounded-2xl overflow-hidden"
        style={{
          background: '#0B0B14',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.65)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent hairline — the only colour, so the card stays calm. */}
        <div style={{ height: 3, background: 'linear-gradient(90deg,#7C5CFF,#C04DCC 55%,#EC4899)' }} />

        <div className="p-7">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="absolute top-5 right-4 text-white/35 hover:text-white/80 transition-colors bg-transparent border-0 cursor-pointer text-[22px] leading-none"
          >
            ×
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="grid place-items-center rounded-xl shrink-0"
              style={{ width: 40, height: 40, background: 'rgba(124,92,255,0.14)', border: '1px solid rgba(124,92,255,0.30)' }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="1.9" strokeLinecap="round">
                <rect x="4" y="10.5" width="16" height="10" rx="2" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.14em] uppercase" style={{ fontFamily: FONT, color: '#A78BFA' }}>
                Paid feature
              </div>
              <h2 className="text-white font-semibold text-[19px] leading-tight truncate" style={{ fontFamily: FONT }}>
                {title}
              </h2>
            </div>
          </div>

          <p className="text-white/60 text-[14px] leading-relaxed mb-5" style={{ fontFamily: FONT }}>
            {blurb}
          </p>

          {plan && (
            <div
              className="flex items-center justify-between rounded-lg px-3.5 py-2.5 mb-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="text-white/45 text-[13px]" style={{ fontFamily: FONT }}>Current plan</span>
              <span className="text-white text-[13px] font-semibold capitalize" style={{ fontFamily: FONT }}>{plan}</span>
            </div>
          )}

          <button
            type="button"
            onClick={goToBilling}
            className="w-full rounded-xl py-3 font-semibold text-[14.5px] text-white transition-opacity hover:opacity-95"
            style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#7C5CFF 0%,#C04DCC 55%,#EC4899 100%)' }}
          >
            See plans &amp; upgrade
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 w-full rounded-xl py-2.5 text-[13px] font-medium text-white/45 hover:text-white/75 transition-colors bg-transparent border-0 cursor-pointer"
            style={{ fontFamily: FONT }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
