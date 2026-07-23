import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import SiteNav from '../components/SiteNav.jsx'
import FooterCard from '../components/FooterCard.jsx'
import Seo from '../shared/Seo.jsx'
import { goToPath } from '../router.js'
import { isLoggedIn, fetchPlans, buyPlan, getStoredUsername, setStoredUsername, fetchMe, dashboardBase } from '../services/dashboardApi.js'

// Standalone "Look at our Plans" pricing page. Renders the full feature
// comparison matrix (three tiers × many rows, grouped into sections) from the
// design. Reuses the site shell — starfield background, glassy nav pill and the
// shared Footer — so it sits naturally alongside the landing and legal pages.

const FONT = "'Outfit', sans-serif"

// Three plan columns. `price` is the headline; `unit` is the small suffix.
const PLANS = [
  // `slug` ties each column to a REAL backend plan (backend/models/Plan.js).
  // Matching on the displayed price string was brittle — if the copy ever drifts
  // from the DB price, no plan matches and checkout can't start. The slug is stable.
  { key: 'free', slug: 'free', name: 'Free', price: '0', unit: '/Lifetime', highlight: false },
  { key: 'pro', slug: 'starter', name: '₹299', unit: '/Month', highlight: false },
  { key: 'premium', slug: 'core', name: '₹499', unit: '/Month', highlight: false },
]

// Feature matrix. Each row has the label and a value per plan in [free, pro,
// premium] order. A value of `true` renders a green check, `false`/'' renders an
// empty cell, and a string renders centered text. Section headers split groups.
const SECTIONS = [
  {
    title: null,
    rows: [
      ['Public Portfolio Page', true, true, true],
      ['Shareable Creasume Link', true, true, true],
      ['Bio, niche tags & social links', true, true, true],
      ['Brand Collab Logos', 'Up to 5', 'Unlimited', 'Unlimited'],
      ['Page Themes', 'Default', 'Limited Sets', '6+ Premium'],
      ['Full Design Control (Custom Color & Font)', false, true, true],
      ['Custom Domain (yourname.com)', false, false, true],
      ['Niche Specific Background', false, false, true],
      ['Featured Content Embeds (Reels, Posts)', false, false, true],
      ['Packages & Pricing Section', false, true, true],
      ['Testimonials From Brands', false, true, true],
      ['Remove "Made with Creasume" Badge', false, true, true],
    ],
  },
  {
    title: 'INSTAGRAM STATS',
    rows: [
      ['Follower Count', true, true, true],
      ['Engagement Rate', true, true, true],
      ['Top Country', true, true, true],
      ['Reach & Impressions (30 Days)', false, true, true],
      ['Follower Growth Trend', false, 'Basic', '30 & 90 Days'],
      ['Top 3 Countries Expanded', false, true, true],
      ['Full Audience', false, false, true],
    ],
  },
  {
    title: 'MEDIA KIT',
    rows: [
      ['Auto-Generated Media Kit', 'Basic', true, true],
      ['Reach & Impressions in Kit', false, true, true],
      ['Packages & Rates Inside Kit', false, true, true],
      ['Full Audience Data in Kit', false, false, true],
      ['Custom Branding on Kit', false, false, true],
      ['Real-Time Auto Updating Kit', false, false, true],
    ],
  },
  {
    title: 'VISIBILITY & BRAND CONNECT',
    rows: [
      ['Portfolio Page View Count', false, true, true],
      ['Direct Brand Inquiry Button', false, false, true],
    ],
  },
]

// Scalloped "verified badge" seal outline (same geometry as the profile badge).
const SEAL_PATH = (() => {
  const N = 24, cx = 12, cy = 12, rOuter = 12, rInner = 10.4
  let d = ''
  for (let i = 0; i < N * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner
    const a = (Math.PI / N) * i - Math.PI / 2
    d += `${i ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)} `
  }
  return `${d}Z`
})()

function Check() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="mx-auto" aria-label="Included">
      <path d={SEAL_PATH} fill="#22C55E" />
      <path d="m8 12 2.5 2.5L16 9" stroke="#0B0B0F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Render one feature cell value.
function Cell({ value }) {
  if (value === true) return <Check />
  if (!value) return <span className="block h-5" aria-hidden="true" />
  return <span className="text-white text-[13px]">{value}</span>
}

export default function PricingPage() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Real DB plans (with their ids + prices) so "Choose This Plan" can start a
  // real Razorpay checkout. /billing/plans is public, so this works logged out too.
  const [dbPlans, setDbPlans] = useState([])
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const loggedIn = isLoggedIn()

  useEffect(() => {
    fetchPlans().then((r) => setDbPlans(r.plans || [])).catch(() => {})
  }, [])

  // Match a pricing column to a real DB plan: by slug first (stable), then by
  // the displayed price as a fallback if the slugs were ever renamed.
  const matchPlan = (list, col) => {
    if (!list || !list.length) return null
    const bySlug = list.find((p) => p.slug === col.slug)
    if (bySlug) return bySlug
    if (col.key === 'free') return list.find((p) => p.pricePaise === 0) || null
    const inr = Number(String(col.name).replace(/[^\d]/g, '')) // "₹299" → 299
    return list.find((p) => Math.round(p.priceInr) === inr) || null
  }

  const goDashboard = () => goToPath(getStoredUsername() ? dashboardBase(getStoredUsername()) : '/connect')

  // Same, but for AFTER a successful payment: someone who just paid must land on
  // their dashboard, so if the username isn't in storage yet we ask the backend
  // for it instead of dumping them on /connect. Falls back to goDashboard() if
  // that lookup fails, so a paid user is never left stranded on this page.
  const goDashboardAfterPay = async () => {
    if (getStoredUsername()) { goDashboard(); return }
    try {
      const me = await fetchMe()
      const username = me?.creator?.username || me?.username
      if (username) {
        setStoredUsername(username)
        goToPath(dashboardBase(username))
        return
      }
    } catch { /* fall through */ }
    goDashboard()
  }

  // Choose This Plan:
  //   • Not logged in → send to Sign Up (they can pay once they have an account).
  //   • Free plan → go to the dashboard (nothing to pay).
  //   • Paid plan → open Razorpay checkout; /billing/verify applies the plan on
  //     success (webhook is the backstop), then we send them to the dashboard.
  const choose = async (col) => {
    if (!loggedIn) { goToPath('/signup'); return }
    // Free has nothing to pay — straight to the dashboard.
    if (col.key === 'free') { goDashboard(); return }

    setBusy(col.key); setNotice('')
    try {
      // The plans list may not have loaded yet (slow network, or the first fetch
      // failed). Fetch it on demand rather than refusing to open checkout.
      let list = dbPlans
      if (!list.length) {
        const r = await fetchPlans().catch(() => null)
        list = (r && r.plans) || []
        if (list.length) setDbPlans(list)
      }

      const plan = matchPlan(list, col)
      if (!plan) throw new Error('That plan isn’t available to buy right now.')
      if (plan.pricePaise === 0) { goDashboard(); return }

      const result = await buyPlan(plan.id)
      // /billing/verify applied it already; the webhook is the backstop.
      setNotice(
        result && result.applied
          ? 'Payment successful — your plan is active.'
          : 'Payment received — activating your plan…'
      )
      // Brief pause so they actually see the confirmation, then to the dashboard.
      setTimeout(goDashboardAfterPay, 1200)
    } catch (e) {
      setNotice(e.message || 'Checkout was closed.')
    } finally {
      setBusy('')
    }
  }

  // Shared grid template: feature label column + three plan columns.
  // minmax(0,…) lets each column size purely by its fr ratio instead of its
  // content's min-width — so every row (short label or long) shares the SAME
  // column widths and the vertical dividers line up across the whole table.
  const gridCols =
    'grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] sm:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]'

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip text-white">
      <Seo
        title="Pricing — Creasume Creator Plans"
        description="Simple plans for creators. Start free with a verified Influence Card, or upgrade for packages, custom branding, analytics and brand inquiries. Cancel anytime."
        path="/pricing"
      />

      {/* Decorative accent — top-right corner */}
      <img
        src="/Rectangle%2089.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute top-0 right-0 z-0 w-[52%] max-w-[680px] h-auto"
      />

      {/* Decorative accent — bottom-left corner */}
      <img
        src="/Rectangle%2090.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute bottom-64 left-0 z-0 w-[52%] max-w-[680px] h-auto"
      />

      <SiteNav active="pricing" />

      {/* Checkout status / errors (Razorpay open, payment received, closed…) */}
      {notice && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-[520px]">
          <div className="rounded-xl px-4 py-3 text-center text-[14px] font-medium text-white" style={{ fontFamily: FONT, background: 'rgba(124,92,255,0.16)', border: '1px solid rgba(124,92,255,0.5)', backdropFilter: 'blur(8px)' }}>
            {notice}
          </div>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-6 md:pt-12 pb-10 md:pb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-semibold leading-[1.05]"
          style={{ fontFamily: FONT, fontSize: 'clamp(40px, 6.5vw, 76px)' }}
        >
          Look at our Plans
        </motion.h1>
        <p className="mt-4 text-white" style={{ fontFamily: FONT, fontSize: 'clamp(16px, 2.4vw, 24px)' }}>
          Know How the platform works, and connect your creasume profile
        </p>
      </section>

      {/* ============ COMPARISON TABLE ============ */}
      {/* On phones the 4-column matrix can't shrink to fit, so the table scrolls
          horizontally inside this wrapper (min-width keeps the columns readable)
          instead of being clipped by the page's overflow-x-clip. */}
      <section id="pricing" className="relative z-10 px-3 sm:px-8 md:px-16 lg:px-24 pb-20">
        <div className="mx-auto max-w-6xl overflow-x-auto demo-scroll rounded-2xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full min-w-0 sm:min-w-125 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.50)', background: 'rgba(10,10,16,0.6)' }}
        >
          {/* Header row */}
          <div className={`grid ${gridCols}`}>
            <div className="p-3 sm:p-6 border-b border-r border-white/50">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="text-white font-semibold text-base sm:text-3xl" style={{ fontFamily: FONT }}>
                  Compare plans
                </span>
                <span className="shrink-0 whitespace-nowrap px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[13px] font-semibold text-white" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.22)' }}>
                  40% Off
                </span>
              </div>
              <p className="mt-2 sm:mt-3 text-white text-[11px] sm:text-[15px] leading-snug hidden sm:block" style={{ fontFamily: FONT }}>
                Choose your workspace plan according to your organisational plan
              </p>
            </div>

            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className="p-2.5 sm:p-6 border-b border-r last:border-r-0 border-white/50 text-center"
                style={{ background: plan.highlight ? 'rgba(34,39,114,0.18)' : 'transparent' }}
              >
                <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 flex-wrap">
                  <span className="text-white font-bold" style={{ fontFamily: FONT, fontSize: 'clamp(15px, 4vw, 34px)' }}>
                    {plan.name}
                  </span>
                  <span className="text-white/55 text-[9px] sm:text-[13px]">{plan.unit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => choose(plan)}
                  disabled={busy === plan.key}
                  className="mt-2 sm:mt-4 w-full rounded-lg py-1.5 sm:py-2.5 px-1 text-[9px] leading-tight sm:text-[13px] font-semibold bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-60"
                  style={{ fontFamily: FONT }}
                >
                  {busy === plan.key ? 'Opening…' : 'Choose This Plan'}
                </button>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          {SECTIONS.map((section, si) => (
            <div key={si}>
              {section.title && (
                <div className={`grid ${gridCols}`}>
                  <div className="px-4 sm:px-6 py-2.5 border-t border-b-2 border-r border-white/50 border-b-white flex items-center">
                    <span className="text-white text-[12px] font-semibold tracking-wide" style={{ fontFamily: FONT }}>
                      {section.title}
                    </span>
                  </div>
                  <div className="border-t border-b-2 border-r border-white/50 border-b-white" />
                  <div className="border-t border-b-2 border-r border-white/50 border-b-white" />
                  <div className="border-t border-b-2 border-white/50 border-b-white" />
                </div>
              )}
              {section.rows.map((row, ri) => {
                const [label, ...values] = row
                return (
                  <div key={ri} className={`grid ${gridCols} border-b border-white/50 last:border-b-0`}>
                    <div className="p-2.5 sm:p-4 border-r border-white/50 flex items-center min-w-0">
                      <span className="text-white text-[12px] sm:text-[14px] leading-tight min-w-0 wrap-anywhere" style={{ fontFamily: FONT }}>
                        {label}
                      </span>
                    </div>
                    {values.map((v, vi) => (
                      <div
                        key={vi}
                        className="p-3 sm:p-4 border-r last:border-r-0 border-white/50 flex items-center justify-center text-center"
                        style={{ background: PLANS[vi].highlight ? 'rgba(34,39,114,0.10)' : 'transparent' }}
                      >
                        <Cell value={v} />
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
        </div>
      </section>

      {/* Shared 3-column footer (same as How It Works / Contact) */}
      <FooterCard />

      {/* Giant CREASUME wordmark at the bottom (same as the shared Footer). */}
      <div className="relative z-10 overflow-hidden -mx-7.5 md:-mx-16 lg:-mx-24 pt-8 md:pt-16 pb-2">
        <h1 className="giant-text text-center select-none whitespace-nowrap">
          CREASUME
        </h1>
      </div>
    </div>
  )
}
