import { useRef } from 'react'
import { motion, MotionConfig, useScroll } from 'framer-motion'
import { goToPath } from '../router.js'
import { isLoggedIn, getStoredUsername, dashboardBase } from '../services/dashboardApi.js'
import { fadeUp, outlineDraw, staggerParent } from '../motion-variants.js'
import { CountUp, Typewriter } from '../anim.jsx'
import SensesSection from '../SensesSection.jsx'
import LiveDemoCard from '../LiveDemoCard.jsx'
import Footer from '../components/Footer.jsx'
import SiteNav from '../components/SiteNav.jsx'
import { useIsMobile } from '../shared/useIsMobile.js'
import { ScrubCard } from '../shared/ScrubCard.jsx'
import { PERKS } from '../shared/perks.jsx'
import { FeatureCards } from '../shared/FeatureCards.jsx'
import ScrollCue from '../shared/ScrollCue.jsx'
import Testimonials from './Testimonials.jsx'
import Pricing from './Pricing.jsx'
import Application from './Application.jsx'
import Faq from './Faq.jsx'
import '../App.css'

// Reusable Creasume × Meta white pill (security/trust badge).
function MetaBadge() {
  return (
    <div
      className="inline-flex items-center justify-center gap-4 rounded-full bg-white"
      style={{ width: '230px', maxWidth: '100%', height: '50px' }}
    >
      <img src="/Group%201707480613.png" alt="Creasume" width="96" height="26"
        style={{ display: 'block', width: '96px', height: '26px', objectFit: 'contain' }} />
      <span className="text-[#9EA5E2] text-base">×</span>
      <img src="/image%202%20(1).png" alt="Meta" width="75" height="21"
        style={{ display: 'block', width: '75px', height: '21px', objectFit: 'contain' }} />
    </div>
  )
}

// One seamless horizontal marquee. The CSS loop translates the track -50%, so it
// only reads as gapless if EACH half is at least as wide as the viewport. For
// short content (a few words) one copy is narrower than a wide screen, which
// leaves a blank gap in the loop — so `repeat` tiles the children per half until
// the half overflows. Leave it low for already-wide content (rows of cards).
function Marquee({ children, duration = 22, className = '', reverse = false, repeat = 2 }) {
  const half = (aria) => (
    <div className="flex shrink-0" aria-hidden={aria}>
      {Array.from({ length: repeat }).map((_, r) => (
        <div key={r} className="flex shrink-0">{children}</div>
      ))}
    </div>
  )
  return (
    <div className={`lp-marquee-group flex w-full overflow-hidden ${className}`}>
      <div
        className="lp-marquee"
        style={{ animationDuration: `${duration}s`, animationDirection: reverse ? 'reverse' : 'normal' }}
      >
        {half(undefined)}
        {half(true)}
      </div>
    </div>
  )
}

// Spotify-style placeholder brand chip (repeated in the trust marquee).
function BrandChip() {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-9 py-6 mx-3 shrink-0"
      style={{
        width: '270px',
        background: 'linear-gradient(135deg, rgba(20,40,30,0.9) 0%, rgba(10,16,30,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span className="flex items-center justify-center w-12 h-12 rounded-full shrink-0" style={{ background: '#1DB954' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#1DB954" />
          <path d="M7 14.5c2.5-.8 5.5-.6 8 1M7 11.5c3-1 7-.7 10 1.2M7 8.5c3.5-1.1 8.5-.6 12 1.5"
            stroke="#0b0b0b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-white font-semibold text-2xl" style={{ fontFamily: "'Outfit', sans-serif" }}>Spotify</span>
    </div>
  )
}

export default function LandingPage() {
  const isMobile = useIsMobile()

  // If a token is saved ("Remember me"), the visitor is already signed in — send
  // them to their dashboard instead of asking them to sign in / sign up again.
  // Falls back to /connect when we don't yet have a username (e.g. account made
  // but Instagram not linked). Logged-out visitors keep the Start Now → signup
  // flow unchanged.
  const loggedIn = isLoggedIn()
  const dashHref = loggedIn ? (getStoredUsername() ? dashboardBase(getStoredUsername()) : '/connect') : '/signup'
  const primaryLabel = loggedIn ? 'Go to Dashboard' : 'Start Now'

  // Founding Creator perks: cards unstack from a centre pile, scrubbed by scroll.
  const perksHeadingRef = useRef(null)
  const { scrollYProgress: perksProgress } = useScroll({
    target: perksHeadingRef,
    offset: ['start end', 'end start'],
  })

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      {/* "Scroll down for more" hint on the hero (fades out once they scroll) */}
      <ScrollCue />

      {/* Starfield */}
      <div className="starfield" />

      {/* Hero decorative background texture */}
      <img
        src="/image/Group%201707480435.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{ position: 'absolute', top: '-120px', right: '0px', width: '85%', height: '1800px', zIndex: 0, opacity: 0.85, clipPath: 'inset(25% 0 0 0)' }}
      />

      {/* ============ NAVIGATION ============ */}
      <SiteNav
        active="home"
        login={false}
        links={[
          { id: 'home', label: 'Home', href: '#home' },
          { id: 'about', label: 'About', href: '#vision' },
          { id: 'pricing', label: 'Pricing', href: '#/pricing' },
          { id: 'dashboard', label: 'Dashboard', href: '#apply' },
          { id: 'how-it-works', label: 'How it Works', href: '#/how-it-works' },
          // Logged out → "Sign In". Logged in → no extra nav item (the
          // "Go to Dashboard" CTA already handles it).
          ...(loggedIn ? [] : [{ id: 'signin', label: 'Sign In', href: '/login' }]),
        ]}
        cta={loggedIn
          ? { label: 'Go to Dashboard', href: dashHref }
          : { label: 'Get Your Free Resume', href: '/signup' }}
        ctaVariant="gradient"
      />

      {/* ============ HERO ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-6 pb-12 md:pt-20 md:pb-20">
       <div className="w-full max-w-[1280px] mx-auto">
        <motion.div
          className="flex flex-nowrap items-center gap-1.5 sm:gap-9 mb-12 md:mb-10"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div
            variants={outlineDraw}
            className="shine-border shine-animate-mobile cursor-pointer inline-flex items-center justify-center rounded-full backdrop-blur-sm shrink px-2.5 sm:px-6 h-[34px] sm:h-[40px]"
            style={{ backgroundColor: 'rgba(125, 113, 201, 0.09)' }}
          >
            <span className="whitespace-nowrap" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", color: '#FFFFFF', letterSpacing: '0.04em', lineHeight: '0.976', fontSize: 'clamp(6px, 2.0vw, 15.68px)', fontWeight: 300 }}>
              VERIFIED CREATOR IDENTITY PLATFORM
            </span>
          </motion.div>

          <motion.div
            variants={outlineDraw}
            className="shine-border shine-border--tint shine-animate-mobile inline-flex items-center justify-center shrink-0 gap-2 sm:gap-3 rounded-full bg-white px-3 sm:px-0 h-[30px] sm:h-[35.46px] w-auto sm:w-[244.95px]"
          >
            <img src="/creasumelogo.png" alt="Creasume" className="h-[15px] sm:h-[23px] w-auto" style={{ objectFit: 'contain', filter: 'brightness(0)' }} />
            <span className="text-[#9EA5E2] text-[10px] sm:text-sm">×</span>
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <svg viewBox="0 0 287.56 191" className="h-[13px] sm:h-[19px] w-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="lpMetaGrad1" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0064e1" /><stop offset="0.4" stopColor="#0064e1" /><stop offset="0.83" stopColor="#0073ee" /><stop offset="1" stopColor="#0082fb" />
                  </linearGradient>
                  <linearGradient id="lpMetaGrad2" x1="41.42" y1="53" x2="41.42" y2="126" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0082fb" /><stop offset="1" stopColor="#0064e0" />
                  </linearGradient>
                </defs>
                <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" />
                <path fill="url(#lpMetaGrad2)" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" />
                <path fill="url(#lpMetaGrad1)" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3Z" />
              </svg>
              <span className="font-bold leading-none text-[#1c1e21] text-[13px] sm:text-[20px]" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Meta</span>
            </span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-10 items-center">
          <motion.div className="relative" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.h1
              className="mb-6 relative z-10 whitespace-normal md:whitespace-nowrap"
              variants={fadeUp}
              style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 'clamp(52px, 13vw, 102.329px)', lineHeight: '97.63%', width: '747px', maxWidth: '100%' }}
            >
              Your Influence<br />
              <span style={{ color: '#6068DC' }}>Structured &</span><br />
              <span className="gradient-text">Verified.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white font-semibold text-2xl md:text-3xl mb-3 relative z-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Ditch the outdated PDFs.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/80 text-lg md:text-xl max-w-xl mb-12 md:mb-10 leading-snug relative z-10" style={{ fontFamily: "'Gelion', sans-serif" }}>
              Turn your live social analytics into a dynamic professional identity in minutes.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:flex-nowrap gap-6 sm:gap-8 relative z-10">
              <motion.a
                href={dashHref}
                onClick={(e) => { e.preventDefault(); goToPath(dashHref) }}
                className="hover-shine no-underline cursor-pointer rounded-full flex items-center justify-center shrink-0 whitespace-nowrap w-full sm:w-[260px]"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ height: '59px', fontWeight: 600, fontSize: 'clamp(16px, 4.5vw, 22px)', fontFamily: "'Gelion', 'Outfit', sans-serif", background: 'linear-gradient(180deg, #5D65DC 0%, #9CA2E1 100%)', color: '#0B0B27' }}
              >
                {primaryLabel}
              </motion.a>
              <motion.a
                href="/browse"
                onClick={(e) => { e.preventDefault(); goToPath('/browse') }}
                className="no-underline cursor-pointer shine-border shine-animate-mobile rounded-full text-white flex items-center justify-center px-7 shrink-0 whitespace-nowrap w-full sm:w-auto"
                whileHover={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ height: '59px', fontWeight: 600, fontSize: 'clamp(16px, 4.5vw, 22px)', fontFamily: "'Gelion', 'Outfit', sans-serif", backgroundColor: 'rgba(11, 11, 39, 0.4)' }}
              >
                Browse Creators
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Hero live-demo card (reused from the waitlist hero) */}
          <div className="relative flex justify-center lg:justify-end mt-2 lg:mt-0 lg:-translate-y-[50px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full"
              style={{ maxWidth: '480px' }}
            >
             {/* "Check out a live demo here ↓" — same as the waitlist page. */}
             <p
               className="text-center mb-4 text-sm md:text-base font-medium tracking-wide"
               style={{ fontFamily: "'Outfit', sans-serif", color: 'rgba(255,255,255,0.72)' }}
             >
               Check out a live demo{' '}
               <span
                 style={{
                   fontWeight: 700,
                   background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
                   WebkitBackgroundClip: 'text',
                   backgroundClip: 'text',
                   WebkitTextFillColor: 'transparent',
                   color: 'transparent',
                 }}
               >
                 here
               </span>
               <span style={{ color: '#E731A2' }}> ↓</span>
             </p>
             <div className="shine-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 rounded-t-xl" style={{ height: '40px', backgroundColor: '#181B4A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="flex items-center gap-2 shrink-0">
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
                </span>
                <div className="flex items-center justify-center gap-2 ml-2 md:ml-20 mr-auto px-4 rounded-full" style={{ height: '24px', backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="11" width="14" height="9" rx="2" fill="#9CA2E1" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="#9CA2E1" strokeWidth="2" fill="none" />
                  </svg>
                  <span className="text-white/85 text-[12px] font-medium whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>creasume.com/connect</span>
                </div>
              </div>
              <LiveDemoCard />
             </div>
            </motion.div>
          </div>
        </div>
       </div>
      </section>

      {/* ============ FEATURE MARQUEE BAR ============ */}
      <div className="relative z-10 border-y border-white/12 py-5 md:py-6 bg-[#070710]">
        {/* Edge fade so the words dissolve into the bar at both sides instead of
            hard-cutting. Masks only the scrolling content, not the bar bg. */}
        <div
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 10%, #000 90%, transparent 100%)',
          }}
        >
          <Marquee duration={26} repeat={4}>
            {['Real Metrics', 'One Link', 'Professional Identity', 'Verified Accounts'].map((w, i) => (
              <span key={i} className="inline-flex items-center text-white/85 text-xl md:text-2xl font-medium whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="mx-6 md:mx-9 w-2 h-2 rounded-full bg-[#5D65DC]" />
                {w}
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-12 md:pt-24 pb-12 md:pb-24 flex justify-center">
        <div
          className="rounded-2xl px-4 py-6 md:px-0 md:py-0 grid grid-cols-2 md:grid-cols-4 gap-x-0 gap-y-8 md:gap-y-0 items-stretch"
          style={{ width: '1070.05px', maxWidth: '100%', minHeight: '129.24px', backgroundColor: 'rgba(16, 31, 70, 0.59)', border: '1px solid rgba(255, 255, 255, 0.18)' }}
        >
          {[
            { title: 'Dynamic', sub: 'PROFESSIONAL LINK' },
            { title: '$250 Billion', sub: 'CREATOR ECONOMY' },
            { title: '3 Min', sub: 'SETUP' },
            { title: 'Verified', sub: 'CREATOR PROFILES' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center relative flex flex-col items-center justify-center">
              {idx !== 0 && (
                <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2" style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
              )}
              <div className="mb-1" style={{ color: '#FFFFFF', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 'clamp(20px, 5vw, 33.26px)', lineHeight: '97.6%' }}>
                {stat.title === '3 Min' ? (
                  <CountUp value={3} suffix=" Min" />
                ) : stat.title === '$250 Billion' ? (
                  <CountUp value={250} prefix="$" suffix=" Billion" />
                ) : (
                  <Typewriter text={stat.title} startDelay={idx * 0.2} />
                )}
              </div>
              <Typewriter
                text={stat.sub}
                perChar={0.035}
                startDelay={idx * 0.2 + 0.1}
                className="block text-[10px] tracking-[0.2em] font-medium"
                charStyle={{ background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <Testimonials />

      {/* ============ CONSENT BADGE ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-10 md:py-16 text-center">
        <p className="text-2xl md:text-3xl font-bold text-white mb-6">
          <svg aria-hidden="true" className="inline-block mr-3 align-middle" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
          </svg>
          Your consent matters to us
        </p>
        <motion.div
          className="shine-border shine-border--instagram inline-flex items-center gap-4 px-7 py-3 rounded-full bg-white mb-7"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }} viewport={{ once: true, margin: '-60px' }}
        >
          <img src="/creasumelogo.png" alt="Creasume" style={{ height: '24px', width: 'auto', objectFit: 'contain', filter: 'brightness(0)' }} />
          <span className="text-[#9EA5E2] text-lg">×</span>
          <span className="inline-flex items-center gap-2">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <defs>
                <linearGradient id="lpIgGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FEDA75" /><stop offset="0.25" stopColor="#FA7E1E" /><stop offset="0.5" stopColor="#D62976" /><stop offset="0.75" stopColor="#962FBF" /><stop offset="1" stopColor="#4F5BD5" />
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#lpIgGrad)" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" stroke="url(#lpIgGrad)" strokeWidth="2" />
              <circle cx="17.4" cy="6.6" r="1.4" fill="url(#lpIgGrad)" />
            </svg>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '20px', color: '#262626', letterSpacing: '-0.01em' }}>Instagram</span>
          </span>
        </motion.div>
        <p className="text-base md:text-xl text-white/85 font-normal mx-auto max-w-3xl">
          We fetch your verified statistics with your consent directly through Instagram permissions.
        </p>
      </section>

      {/* ============ THREE STEPS ============ */}
      <section id="how-it-works" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">
        <img src="/image/Group%2039850.png" alt="" aria-hidden="true" className="absolute pointer-events-none select-none left-1/2 -translate-x-1/2" style={{ top: '-100px', width: '100%', maxWidth: 'none', height: 'auto', opacity: 0.7, zIndex: 0 }} />
        <img src="/Ellipse%20883.png" alt="" aria-hidden="true" className="absolute pointer-events-none select-none" style={{ left: '-10px', top: '42%', transform: 'translateY(-50%)', opacity: 0.8, zIndex: 0 }} />

        <div className="text-center mb-12 md:mb-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium" style={{ color: '#FFFFFF' }}>
            Three steps to your<br />
            <span style={{ color: '#9EA5E2' }}>verified creator identity</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative pl-4 md:pl-8" initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
            <motion.div className="hidden md:block absolute top-10 left-[16.66%] right-[50%] step-line" style={{ transformOrigin: 'left center' }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.25, ease: 'easeInOut', delay: 0.2 } } }} />
            <motion.div className="hidden md:block absolute top-10 left-[50%] right-[16.66%] step-line" style={{ transformOrigin: 'left center' }} variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.25, ease: 'easeInOut', delay: 0.65 } } }} />

            {[
              {
                icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="#FFFFFF" strokeWidth="1.5" /><circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="1.5" /><circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF" /></svg>),
                title: 'Connect Instagram',
                desc: 'Securely link your Instagram or YouTube to pull live data.',
              },
              {
                icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" /><path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" /><path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" /></svg>),
                title: 'Auto-Generate Identity',
                desc: 'Creasume pulls your stats into a structured, beautiful portfolio.',
              },
              {
                icon: (<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" /></svg>),
                title: 'Share With Brands',
                desc: 'Send your verifiable link to close deals faster and look professional.',
              },
            ].map((step, idx) => (
              <motion.div key={idx} className="text-center relative" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut', delay: [0, 0.45, 0.9][idx] } } }}>
                <div className="w-20 h-20 rounded-full border border-[#36377A] flex items-center justify-center mx-auto mb-5 relative z-10" style={{ background: 'linear-gradient(135deg, #272969 0%, #10113A 100%)' }}>
                  {step.icon}
                </div>
                <h3 className="mb-2" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '25px', color: '#FFFFFF' }}>{step.title}</h3>
                <p className="leading-relaxed max-w-[280px] mx-auto" style={{ fontFamily: "'Gelion', sans-serif", fontSize: '17px', color: '#FFFFFF' }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Start Now CTA + security trust */}
          <div className="mt-24 md:mt-36 text-center relative z-10">
            <a href={dashHref} onClick={(e) => { e.preventDefault(); goToPath(dashHref) }} className="hover-shine inline-flex items-center justify-center rounded-full px-12 h-11 font-semibold text-white mb-16" style={{ background: 'linear-gradient(180deg, #2116B9 0%, #1a1f72 100%)', fontSize: '18px', fontFamily: "'Gelion', 'Outfit', sans-serif" }}>
              {primaryLabel}
            </a>
            <p className="text-2xl md:text-3xl font-bold text-white mb-6">
              <svg aria-hidden="true" className="inline-block mr-3 align-middle" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" />
              </svg>
              Security of your data is our utmost priority
            </p>
            <div className="mb-6 flex justify-center"><MetaBadge /></div>
            <p className="text-base md:text-lg text-white/75 mx-auto max-w-3xl leading-relaxed">
              Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with view-only access to your profile statistics. No third party or even us can access your personal data.
            </p>
          </div>
        </div>
      </section>

      {/* ============ MADE FOR NEXT GENERATION ============ */}
      <SensesSection />

        {/* ============ BUILT FOR EMERGING CREATORS ============ */}
      <section id="vision" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">
        <img src="/Ellipse%20883.png" alt="" aria-hidden="true" className="absolute pointer-events-none select-none" style={{ left: '-10px', top: '35%', transform: 'translateY(-50%)', height: '500px', width: '230px', opacity: 0.8, zIndex: 0 }} />

        <motion.div className="text-center mb-10 md:mb-16" variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-medium mb-16 md:mb-24" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}>
            Built for <span style={{ color: '#9EA5E2' }}>Emerging Creators.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-left md:text-center text-white/90 font-semibold md:font-normal max-w-6xl mx-auto text-xl md:text-xl leading-relaxed mb-10 md:mb-12" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", letterSpacing: '0.01em' }}>
            Content creation has become one of the most powerful marketing tool for modern brands.<br className="hidden md:inline" />
            The creator economy is a $250+ billion industry with more than 80+ million emerging content creators.<br className="hidden md:inline" />
            But most emerging creators still lack the professional identity needed to position themselves effectively.
          </motion.p>
          <motion.p variants={fadeUp} className="text-center text-white font-semibold max-w-none mx-auto text-xl md:text-2xl leading-snug mb-10 md:mb-12 md:whitespace-nowrap" style={{ fontFamily: "'Gelion', sans-serif" }}>
            No media kit. No credibility layer. No way to show brands why they matter.<br className="hidden md:inline" />
            Creasume changes that.
          </motion.p>
          <motion.p variants={fadeUp} className="text-white max-w-none mx-auto text-xl md:text-2xl leading-snug" style={{ fontFamily: "'Gelion', sans-serif" }}>
            Build credibility, improve discoverability, and become<br />
            <span className="font-medium" style={{ background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>brand-ready from day one</span>{' '}
            without needing agencies or management teams.
          </motion.p>
        </motion.div>

        <FeatureCards isMobile={isMobile} />

        <div className="text-center mt-12 md:mt-16 relative z-10">
          <a href={dashHref} onClick={(e) => { e.preventDefault(); goToPath(dashHref) }} className="inline-flex items-center gap-3 rounded-full px-8 h-[52px] font-medium shine-border" style={{ backgroundColor: 'rgba(11,11,39,0.4)', fontSize: '14px', letterSpacing: '0.08em' }}>
            <span style={{ background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {loggedIn ? 'GO TO YOUR DASHBOARD' : 'START YOUR CREATOR CAREER NOW'}
            </span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#E432A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>
      </section>

      {/* ============ BRANDS THAT TRUST CREASUME ============ */}
      <section className="relative z-10 py-12 md:py-20 overflow-hidden">
        <div className="text-center mb-10 md:mb-14 px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-3">Brands that Trust Creasume</h2>
          <p className="text-white/60 text-sm md:text-base">Discover brands that trust Creasume for getting their collaborations</p>
        </div>
        <Marquee duration={22}>
          {Array.from({ length: 6 }).map((_, i) => <BrandChip key={i} />)}
        </Marquee>
      </section>

      {/* ============ YOUR NEXT BRAND DEAL ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-16 md:py-24 text-center overflow-hidden">
        <motion.h2
          className="text-3xl md:text-5xl font-medium mb-8"
          style={{ background: 'linear-gradient(90deg, #9EA5E2 0%, #C7CBF0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Your next brand deal starts here
        </motion.h2>
        <motion.a
          href={dashHref} onClick={(e) => { e.preventDefault(); goToPath(dashHref) }} className="hover-shine inline-flex items-center justify-center rounded-full px-10 h-[54px] font-semibold text-white" style={{ background: 'linear-gradient(180deg, #2116B9 0%, #1a1f72 100%)', fontSize: '18px', fontFamily: "'Gelion', 'Outfit', sans-serif" }}
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
        >
          {primaryLabel}
        </motion.a>
      </section>

      {/* ============ PRICING ============ */}
      <Pricing onGetStarted={() => goToPath(dashHref)} />

      {/* ============ FOUNDING CREATOR PERKS ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">
        <img src="/image/Group%201707480435.png" alt="" aria-hidden="true" className="absolute pointer-events-none select-none" style={{ right: '240px', top: '-300px', width: '1550px', height: '1400px', opacity: 0.8, zIndex: 0 }} />

        <div ref={perksHeadingRef} className="text-center mb-10 md:mb-16 relative z-10">
          <h2 className="font-medium mb-6" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: 'clamp(30px, 7vw, 48px)', lineHeight: '110%' }}>
            Become a<br /><span style={{ color: '#9EA5E2' }}>Founding Creator</span>
          </h2>
          <p className="text-white/75" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontSize: '20px' }}>
            Unlock the following perks and benefits
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={110} stackedY={0} zIndex={5} perk={PERKS[0]} index={0} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={0} stackedY={0} zIndex={4} perk={PERKS[1]} index={1} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={-110} stackedY={0} zIndex={3} perk={PERKS[2]} index={2} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-146.5 md:mx-auto">
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={55} stackedY={-113} zIndex={2} perk={PERKS[3]} index={3} isMobile={isMobile} titleClass="text-white leading-tight max-w-55 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={-55} stackedY={-113} zIndex={1} perk={PERKS[4]} index={4} isMobile={isMobile} titleClass="text-white leading-tight max-w-55 relative z-10" />
          </div>
        </div>
      </section>

      {/* ============ FOUNDING CREATOR APPLICATION ============ */}
      <Application />

      {/* Security trust repeated under the form (matches the design) */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pb-16 md:pb-24 text-center">
        <p className="text-xl md:text-2xl font-bold text-white mb-5">Security of your data is our utmost priority</p>
        <div className="mb-5 flex justify-center"><MetaBadge /></div>
        <p className="text-sm md:text-base text-white/70 mx-auto max-w-3xl leading-relaxed">
          Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with view-only access to your profile statistics. No third party or even us can access your personal data.
        </p>
      </section>

      {/* ============ FAQ ============ */}
      <Faq />

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
    </MotionConfig>
  )
}
