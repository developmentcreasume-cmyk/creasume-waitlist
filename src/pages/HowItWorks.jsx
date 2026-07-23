import { useEffect } from 'react'
import { motion } from 'framer-motion'
import FooterCard from '../components/FooterCard.jsx'
import SiteNav from '../components/SiteNav.jsx'
import Seo from '../shared/Seo.jsx'

// Standalone "How It Works" page. Mirrors the landing's connect flow but as its
// own route (/how-it-works): hero → consent badge → vertical "Steps to Connect"
// → Meta security badge → shared Footer. Reuses the site shell (starfield bg,
// glassy nav pill) so it matches Pricing / Contact / Legal pages.

const FONT = "'Outfit', sans-serif"

// The four connect steps shown vertically with a down-arrow between each.
const STEPS = [
  {
    title: 'Connect to your instagram',
    desc: 'Securely link your Instagram or YouTube to pull live data.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="hiwIg" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FEDA75" /><stop offset="0.25" stopColor="#FA7E1E" />
            <stop offset="0.5" stopColor="#D62976" /><stop offset="0.75" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#hiwIg)" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" stroke="url(#hiwIg)" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.4" fill="url(#hiwIg)" />
      </svg>
    ),
  },
  {
    title: 'Auto Generate Identity',
    desc: 'Creasume your stats into a structured, beautiful portfolio.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="14" width="3.4" height="5.5" rx="1.4" fill="#2DD4BF" />
        <rect x="8.3" y="10.5" width="3.4" height="9" rx="1.4" fill="#2DD4BF" />
        <rect x="13.6" y="7" width="3.4" height="12.5" rx="1.4" fill="#2DD4BF" />
        <rect x="18.9" y="3.5" width="3.4" height="16" rx="1.4" fill="#2DD4BF" />
      </svg>
    ),
  },
  {
    title: 'Customize your Profile',
    desc: 'Customize your profile with a wide range of options on the platform.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 7a2 2 0 0 1 2-2h6" />
        <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
        <path d="M16 3.5a1.8 1.8 0 0 1 2.5 2.5L11 13.5 7.5 14l.5-3.5Z" />
      </svg>
    ),
  },
  {
    title: 'Share with Brands',
    desc: 'Add your creasume link into your bio for brands to reach you.',
    icon: (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
]

function ConsentCheck() {
  return (
    <svg aria-hidden="true" className="inline-block mr-3 align-middle" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  )
}

function DownArrow() {
  return (
    <svg width="24" height="40" viewBox="0 0 24 40" fill="none" aria-hidden="true" className="my-6">
      <path d="M12 2v32M5 27l7 7 7-7" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function HowItWorks() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      <Seo
        title="How Creasume Works — Build Your Verified Creator Card"
        description="Connect Instagram, auto-generate a verified media kit from your real stats, and share one professional link with brands. See how Creasume works in three steps."
        path="/how-it-works"
      />
      <div className="starfield" />

      <SiteNav active="how-it-works" />

      {/* Hero + consent share the same soft ellipse background as the influence
          card hero section (ProfileHero) — exact same gradient. */}
      <div
        className="relative z-10"
        style={{
          background:
            'radial-gradient(78% 66% at 50% 44%, rgba(26,33,92,0.38) 0%, rgba(26,33,92,0.38) 58%, rgba(37,49,133,0) 84%)',
        }}
      >
      {/* ============ HERO ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 pt-6 md:pt-12 pb-8 md:pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-bold leading-[1.05]"
          style={{ fontFamily: FONT, fontSize: 'clamp(44px, 8vw, 92px)' }}
        >
          How It Works
        </motion.h1>
        <p className="mt-4 text-white/70 mx-auto max-w-2xl" style={{ fontFamily: FONT, fontSize: 'clamp(15px, 2.2vw, 22px)' }}>
          Know How the platform works, and connect your creasume profile
        </p>
      </section>

      {/* ============ CONSENT BADGE ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 py-8 md:py-12 text-center">
        <p className="text-xl md:text-2xl font-bold text-white mb-5">
          <ConsentCheck />
          Your consent matters to us
        </p>
        <motion.div
          className="shine-border shine-border--instagram inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white mb-6"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} viewport={{ once: true, margin: '-60px' }}
        >
          <img src="/creasumelogo.png" alt="Creasume" style={{ height: '18px', width: 'auto', objectFit: 'contain', filter: 'brightness(0)' }} />
          <span className="text-[#9EA5E2] text-sm">×</span>
          <span className="inline-flex items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="hiwIgBadge" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FEDA75" /><stop offset="0.25" stopColor="#FA7E1E" /><stop offset="0.5" stopColor="#D62976" /><stop offset="0.75" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#hiwIgBadge)" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" stroke="url(#hiwIgBadge)" strokeWidth="2" />
              <circle cx="17.4" cy="6.6" r="1.4" fill="url(#hiwIgBadge)" />
            </svg>
            <span style={{ fontFamily: FONT, fontWeight: 600, fontSize: '15px', color: '#262626', letterSpacing: '-0.01em' }}>Instagram</span>
          </span>
        </motion.div>
        <p className="text-base md:text-lg text-white/80 mx-auto max-w-2xl">
          We fetch your verified statistics with your consent directly through Instagram permissions.
        </p>
      </section>
      </div>

      {/* ============ STEPS TO CONNECT ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 py-8 md:py-14">
        <h2 className="text-center font-bold mb-12 md:mb-16" style={{ fontFamily: FONT, fontSize: 'clamp(28px, 5vw, 44px)' }}>
          Steps to Connect
        </h2>

        <div className="flex flex-col items-center">
          {STEPS.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center">
              <motion.div
                className="text-center max-w-md px-4"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="flex justify-center mb-5 [&>svg]:w-16 [&>svg]:h-16">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2" style={{ fontFamily: FONT, fontSize: 'clamp(24px, 4vw, 32px)', color: '#FFFFFF' }}>
                  {step.title}
                </h3>
                <p className="text-white/80 leading-relaxed mx-auto max-w-md" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: '18px' }}>
                  {step.desc}
                </p>
              </motion.div>
              {idx < STEPS.length - 1 && <DownArrow />}
            </div>
          ))}
        </div>
      </section>

      {/* ============ SECURITY (Meta) ============ */}
      <section className="relative z-10 px-6 sm:px-12 md:px-20 py-12 md:py-20 text-center">
        <p className="text-xl md:text-2xl font-bold text-white mb-6">
          Security of your data is our utmost priority
        </p>
        <div className="mb-6 flex justify-center">
          <div className="shine-border shine-border--tint shine-animate-mobile inline-flex items-center justify-center gap-3 rounded-full bg-white px-6" style={{ maxWidth: '100%', height: '44px' }}>
            <img src="/creasumelogo.png" alt="Creasume" style={{ height: '23px', width: 'auto', objectFit: 'contain', filter: 'brightness(0)' }} />
            <span className="text-[#9EA5E2] text-base">×</span>
            <span className="inline-flex items-center gap-1.5">
              <svg viewBox="0 0 287.56 191" className="h-5 w-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="hiwMeta1" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
                  </linearGradient>
                  <linearGradient id="hiwMeta2" x1="41.42" y1="53" x2="41.42" y2="126" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
                  </linearGradient>
                </defs>
                <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" />
                <path fill="url(#hiwMeta2)" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" />
                <path fill="url(#hiwMeta1)" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3Z" />
              </svg>
              <span className="font-bold leading-none text-[#1c1e21] text-[22px]" style={{ fontFamily: FONT, letterSpacing: '-0.02em' }}>Meta</span>
            </span>
          </div>
        </div>
        <p className="text-sm md:text-base text-white/70 mx-auto max-w-3xl leading-relaxed">
          Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with
          view-only access to your profile statistics. No third party or even us can access your personal data.
        </p>
      </section>

      <FooterCard />

      {/* ============ BOTTOM CTA over the giant CREASUME wordmark ============ */}
      <div className="relative z-10 overflow-hidden -mx-7.5 md:-mx-16 lg:-mx-24 pt-40 md:pt-56 pb-3 md:pb-4">
        <div className="relative flex items-center justify-center">
          <h1 className="giant-text text-center select-none whitespace-nowrap">CREASUME</h1>

          {/* "Start now" pill centered over the wordmark */}
          <a
            href="#home"
            className="absolute left-1/2 -top-32 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-2 rounded-full px-7 py-3 font-bold whitespace-nowrap transition-transform hover:scale-[1.04]"
            style={{
              fontFamily: FONT,
              fontSize: '13px',
              letterSpacing: '0.02em',
              color: '#0B0B27',
              background: 'linear-gradient(180deg, #EDEBFF 0%, #B9B5E8 100%)',
            }}
          >
            START NOW– ITS FREE! <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}
