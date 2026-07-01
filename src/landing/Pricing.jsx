import { useState } from 'react'
import { motion } from 'framer-motion'
import { popIn, popInParent } from '../motion-variants.js'

// Three tiers from the landing design. `monthly` is the headline price; `annual`
// is the effective per-month price when billed yearly (a light discount). The
// feature lists are short placeholder-grade bullets so each card reads complete.
const PLANS = [
  {
    badge: 'Free',
    name: 'Creator',
    blurb: 'Your digital identity card. Connect Instagram, go live, share your link with brands.',
    monthly: 0,
    annual: 0,
    note: 'Free forever • no card needed',
    features: ['Verified creator profile', 'One shareable link', 'Basic media kit', 'Instagram connection'],
    highlight: false,
  },
  {
    badge: 'Pro',
    name: 'Pro Creator',
    blurb: 'For creators who want to close brand deals. Full data, full control, full brand identity.',
    monthly: 199,
    annual: 199,
    note: '/month • cancel anytime',
    features: ['Everything in Creator', 'Advanced analytics', 'Custom branding', 'Brand inquiry inbox', 'Priority support'],
    highlight: true,
  },
  {
    badge: 'Premium',
    name: 'Premium Creator',
    blurb: 'For professional creators and agencies. Advanced analytics and collaboration tools.',
    monthly: 499,
    annual: 499,
    note: '/month • cancel anytime',
    features: ['Everything in Pro', 'Team collaboration', 'Multiple profiles', 'Priority brand listing', 'Dedicated manager'],
    highlight: false,
  },
]

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="9" stroke="#5D65DC" strokeWidth="1.6" />
      <path d="m8.5 12 2.5 2.5 4.5-5" stroke="#9EA5E2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Pricing({ onGetStarted }) {
  const [annual, setAnnual] = useState(false)

  return (
    <section id="pricing" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-16 md:py-28 overflow-hidden">
      <div className="text-center mb-10 md:mb-14 relative z-10">
        <h2 className="text-4xl md:text-5xl font-semibold mb-8">Simple pricing. No surprises.</h2>

        {/* Monthly / Annual toggle — frosted glass */}
        <div
          className="inline-flex items-center p-1 rounded-full border border-white/15"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(14px) saturate(140%)',
            WebkitBackdropFilter: 'blur(14px) saturate(140%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          {['Monthly', 'Annual'].map((label, i) => {
            const active = (i === 1) === annual
            return (
              <button
                key={label}
                type="button"
                onClick={() => setAnnual(i === 1)}
                className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors"
                style={{ color: active ? '#fff' : 'rgba(255,255,255,0.55)' }}
              >
                {active && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
                      border: '1px solid rgba(255,255,255,0.28)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.3)',
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <motion.div
        variants={popInParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative z-10"
      >
        {PLANS.map((plan) => {
          const price = annual ? plan.annual : plan.monthly
          return (
            <motion.div
              key={plan.name}
              variants={popIn}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="relative rounded-2xl p-7 flex flex-col cursor-pointer"
              style={{ background: 'transparent', transformOrigin: 'bottom center' }}
            >
              {/* Gradient border ring only — inside stays transparent (no fill).
                  A masked overlay so it keeps the rounded corners. */}
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit', padding: '1px',
                  background: 'linear-gradient(135deg, #141548 0%, rgba(12,13,251,0.10) 50%, rgba(12,13,251,0.16) 100%)',
                  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                  pointerEvents: 'none',
                }}
              />
              <span
                className="inline-flex w-fit items-center px-3 py-1 rounded-full text-[11px] font-semibold mb-5"
                style={{
                  background: plan.highlight ? 'linear-gradient(90deg,#5D65DC,#9CA2E1)' : 'rgba(255,255,255,0.08)',
                  color: plan.highlight ? '#0B0B27' : 'rgba(255,255,255,0.7)',
                }}
              >
                {plan.badge}
              </span>

              <h3 className="text-white text-xl font-semibold mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {plan.name}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 min-h-[40px]">{plan.blurb}</p>

              <div className="flex items-end gap-2 mb-6">
                <span className="text-white font-bold" style={{ fontFamily: "'Outfit', sans-serif", fontSize: '40px', lineHeight: 1 }}>
                  ₹{price}
                </span>
                <span className="text-white/55 text-sm mb-1">{plan.note}</span>
              </div>

              <button
                type="button"
                onClick={onGetStarted}
                className="w-full rounded-xl bg-white text-black font-semibold py-3 mb-6 transition-transform hover:scale-[1.02]"
                style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}
              >
                Get Started
              </button>

              <p className="text-white/80 font-medium text-sm mb-4">What you will get</p>
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-white/70 text-sm">
                    <Check />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
