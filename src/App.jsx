import { useState, useRef } from 'react'
import { motion, MotionConfig, useScroll } from 'framer-motion'
import { fadeUp, outlineDraw, staggerParent } from './motion-variants.js'
import { CountUp, Typewriter } from './anim.jsx'
import SensesSection from './SensesSection.jsx'
import LiveDemoCard from './LiveDemoCard.jsx'
import Footer from './components/Footer.jsx'
import SiteNav from './components/SiteNav.jsx'
import { useIsMobile } from './shared/useIsMobile.js'
import { ScrubCard } from './shared/ScrubCard.jsx'
import { PERKS } from './shared/perks.jsx'
import { FeatureCards } from './shared/FeatureCards.jsx'
import { JoinedProof } from './shared/JoinedProof.jsx'
import './App.css'

function App() {
  const isMobile = useIsMobile()

  // Founding Creator perks: cards start stacked and unstack to their grid spots,
  // scrubbed by scroll progress (so it reverses when scrolling up).
  const perksRef = useRef(null)
  // The split is anchored to the heading: progress 0 = heading reaches the
  // vertical middle of the viewport (cards start splitting), progress 1 =
  // heading has scrolled to the top (cards fully placed).
  const perksHeadingRef = useRef(null)
  const { scrollYProgress: perksProgress } = useScroll({
    target: perksHeadingRef,
    // Scrubbed across the widest natural window — from the heading entering the
    // bottom of the viewport ('start end') until it has fully exited the top
    // ('end start') — so the unstack spreads over the most scroll distance
    // possible, reading as slow and smooth.
    offset: ['start end', 'end start'],
  })

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    // Require all fields (trimmed, so whitespace-only doesn't count) and a
    // sane email shape before sending — no blank/junk rows.
    const name = formData.name.trim()
    const email = formData.email.trim()
    const handle = formData.handle.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!name || !email || !handle || !emailOk) {
      setStatus('invalid')
      return
    }

    const endpoint = import.meta.env.VITE_SHEET_ENDPOINT
    // Without an endpoint the row goes nowhere — but a `no-cors` POST to a bad
    // URL still resolves opaquely, which would falsely look like success. Guard
    // it so the form reports an error instead of silently dropping the signup.
    if (!endpoint) {
      console.error(
        'VITE_SHEET_ENDPOINT is not set — the waitlist form has no Google Sheet endpoint to post to. Add it to a .env file (see .env.example).',
      )
      setStatus('error')
      return
    }

    setStatus('sending')

    // Best-effort enrichment: look up the handle's public follower + post count
    // so the sheet row carries those too. Never blocks the signup — if the
    // account isn't a discoverable Business/Creator account (or the lookup
    // fails), we just submit with blank values.
    let followers = ''
    let posts = ''
    const apiBase = import.meta.env.VITE_API_URL
    if (apiBase) {
      try {
        const igHandle = handle.replace(/^@/, '')
        const r = await fetch(`${apiBase}/public/ig-lookup/${encodeURIComponent(igHandle)}`)
        const d = await r.json().catch(() => null)
        if (d?.success && d.profile) {
          followers = d.profile.followers ?? ''
          posts = d.profile.posts ?? ''
        }
      } catch { /* enrichment is optional */ }
    }

    try {
      await fetch(endpoint, {
        method: 'POST',
        // Apps Script web apps don't return CORS headers, so a normal `cors`
        // fetch rejects even when the row is written. `no-cors` lets the POST
        // go through (text/plain keeps it a simple request, no preflight).
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ name, email, handle, followers, posts }),
      })
      setStatus('success')
      setFormData({ name: '', email: '', handle: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen flex flex-col overflow-x-clip bg-black text-white">
      {/* Starfield */}
      <div className="starfield" />

      {/* Hero decorative background texture */}
      <img
        src="/image/Group%201707480435.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none"
        style={{
          position: 'absolute',
          top: '-120px',
          right: '0px',
          width: '85%',
          height: '1800px',
          zIndex: 0,
          opacity: 0.85,
          clipPath: 'inset(25% 0 0 0)',
        }}
      />



      {/* ============ NAVIGATION ============ */}
      {/* Waitlist (pre-launch): no Login / Sign Up — creators can't sign in yet. */}
      <SiteNav login={false} cta={null} />

      {/* ============ HERO SECTION ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-6 pb-12 md:pt-20 md:pb-20">
       <div className="w-full max-w-[1280px] mx-auto">
        {/* Two separate badge pills — outline draws in on load, one after the other */}
        <motion.div
          className="flex flex-nowrap items-center gap-1.5 sm:gap-9 mb-12 md:mb-10"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
        >
          <motion.div
            variants={outlineDraw}
            className="shine-border shine-animate-mobile cursor-pointer inline-flex items-center justify-center rounded-full backdrop-blur-sm shrink px-2.5 sm:px-6 h-[34px] sm:h-[40px]"
            style={{
              backgroundColor: 'rgba(125, 113, 201, 0.09)',
            }}
          >
            <span
              className="whitespace-nowrap"
              style={{
                fontFamily: "'Gelion', 'Outfit', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '0.04em',
                lineHeight: '0.976',
                fontSize: 'clamp(6px, 2.0vw, 15.68px)',
                fontWeight: 300,
              }}
            >
              VERIFIED CREATOR IDENTITY PLATFORM
            </span>
          </motion.div>

          <motion.div
            variants={outlineDraw}
            className="shine-border shine-border--tint shine-animate-mobile inline-flex items-center justify-center shrink-0 gap-2 sm:gap-3 rounded-full bg-white px-3 sm:px-0 h-[30px] sm:h-[35.46px] w-auto sm:w-[244.95px]"
          >
            {/* Hi-res wordmark (172×48) darkened to near-black so it stays crisp
                on retina/scaled displays (it downscales instead of upscaling). */}
            <img
              src="/creasumelogo.png"
              alt="Creasume"
              className="h-[15px] sm:h-[23px] w-auto"
              style={{ objectFit: 'contain', filter: 'brightness(0)' }}
            />
            <span className="text-[#9EA5E2] text-[10px] sm:text-sm">×</span>
            {/* Meta logo as inline SVG (vector → no blur) + wordmark text. */}
            <span className="inline-flex items-center gap-1 sm:gap-1.5">
              <svg viewBox="0 0 287.56 191" className="h-[13px] sm:h-[19px] w-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <defs>
                  <linearGradient id="metaGrad1" x1="62.34" y1="101.45" x2="260.34" y2="91.45" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0064e1" />
                    <stop offset="0.4" stopColor="#0064e1" />
                    <stop offset="0.83" stopColor="#0073ee" />
                    <stop offset="1" stopColor="#0082fb" />
                  </linearGradient>
                  <linearGradient id="metaGrad2" x1="41.42" y1="53" x2="41.42" y2="126" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stopColor="#0082fb" />
                    <stop offset="1" stopColor="#0064e0" />
                  </linearGradient>
                </defs>
                <path fill="#0081fb" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16.05c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z" />
                <path fill="url(#metaGrad2)" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z" />
                <path fill="url(#metaGrad1)" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3Z" />
              </svg>
              <span className="font-bold leading-none text-[#1c1e21] text-[13px] sm:text-[20px]" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>Meta</span>
            </span>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-10 lg:gap-10 items-center">
          <motion.div
            className="relative"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.h1
              className="mb-6 relative z-10 whitespace-normal md:whitespace-nowrap"
              variants={fadeUp}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontStyle: 'normal',
                fontWeight: 600,
                fontSize: 'clamp(52px, 13vw, 102.329px)',
                lineHeight: '97.63%',
                width: '747px',
                maxWidth: '100%',
              }}
            >
              Your Influence<br />
              <span style={{ color: '#6068DC' }}>Structured &</span><br />
              <span className="gradient-text">Verified.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white text-lg md:text-xl max-w-xl mb-16 md:mb-10 leading-snug relative z-10" style={{ fontFamily: "'Gelion', sans-serif" }}>
              Create your dynamic media kit and turn your social presence into a professional creator identity that brands trust.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:flex-nowrap gap-6 sm:gap-10 relative z-10">
              <motion.a
                href="#waitlist"
                className="no-underline cursor-pointer rounded-full flex items-center justify-center shrink-0 whitespace-nowrap w-full sm:w-[360px]"
                whileHover={{ scale: 1.05, boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.5)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{
                  height: '59px',
                  fontWeight: 600,
                  fontSize: 'clamp(16px, 4.5vw, 22px)',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  background: 'linear-gradient(180deg, #5D65DC 0%, #9CA2E1 100%)',
                  color: '#0B0B27',
                }}
              >
                Become A Founding Creator
              </motion.a>
              <motion.a
                href="#vision"
                className="no-underline cursor-pointer shine-border shine-animate-mobile rounded-full text-white flex items-center justify-center px-7 shrink-0 whitespace-nowrap w-full sm:w-auto"
                whileHover={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{
                  height: '59px',
                  fontWeight: 600,
                  fontSize: 'clamp(16px, 4.5vw, 22px)',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  backgroundColor: 'rgba(11, 11, 39, 0.4)',
                }}
              >
                Explore Vision
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Sample Creator card — fades & rises in on load (staggered after the text), then stays put */}
          <div className="relative flex justify-center lg:justify-end mt-2 lg:mt-0 lg:-translate-y-[50px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full"
              style={{ maxWidth: '480px' }}
            >
             {/* Label for the live demo mockup shown right below. */}
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
              {/* Browser chrome bar above the card */}
              <div
                className="flex items-center gap-3 px-4 rounded-t-xl"
                style={{
                  height: '40px',
                  backgroundColor: '#181B4A',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* traffic-light dots */}
                <span className="flex items-center gap-2 shrink-0">
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28C840' }} />
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FEBC2E' }} />
                  <span className="block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#FF5F57' }} />
                </span>
                {/* URL pill */}
                <div
                  className="flex items-center justify-center gap-2 ml-2 md:ml-20 mr-auto px-4 rounded-full"
                  style={{
                    height: '24px',
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="shrink-0">
                    <rect x="5" y="11" width="14" height="9" rx="2" fill="#9CA2E1" />
                    <path d="M8 11V8a4 4 0 018 0v3" stroke="#9CA2E1" strokeWidth="2" fill="none" />
                  </svg>
                  <span className="text-white/85 text-[12px] font-medium whitespace-nowrap" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    creasume.com/connect
                  </span>
                </div>
              </div>

              <LiveDemoCard />
             </div>
            </motion.div>
          </div>
        </div>
       </div>
      </section>

      {/* ============ SECURITY / TRUST ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-12 md:pt-20 pb-4 md:pb-8">
        <div className="text-center relative z-10">
          <p
            className="mb-7"
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '25px',
              color: '#FFFFFF',
              lineHeight: '97.6%',
            }}
          >
            <img src="/Vector%20(5).png" alt="" className="inline-block mr-2 align-middle" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
            Security of your data is our utmost priority
          </p>
          <div
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white mb-10"
            style={{ width: '188px', maxWidth: '100%', height: '38px' }}
          >
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              width="74"
              height="20"
              style={{ display: 'block', width: '74px', height: '20px', objectFit: 'contain', imageRendering: 'auto' }}
            />
            <span className="text-[#9EA5E2] text-sm">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              width="58"
              height="16"
              style={{ display: 'block', width: '58px', height: '16px', objectFit: 'contain', imageRendering: 'auto' }}
            />
          </div>
          <p
            className="mx-auto md:whitespace-nowrap"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(15px, 1.7vw, 26px)',
              maxWidth: '100%',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: '120%',
            }}
          >
            Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with view-only<br />
            access to your profile statistics. No third party or even us can access your personal data.
          </p>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-12 md:pt-24 pb-12 md:pb-24 flex justify-center">
        <div
          className="rounded-2xl px-4 py-6 md:px-0 md:py-0 grid grid-cols-2 md:grid-cols-4 gap-x-0 gap-y-8 md:gap-y-0 items-stretch"
          style={{
            width: '1070.05px',
            maxWidth: '100%',
            minHeight: '129.24px',
            backgroundColor: 'rgba(16, 31, 70, 0.59)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
          }}
        >
          {[
            { title: 'Dynamic', sub: 'PROFESSIONAL LINK' },
            { title: '3 Min', sub: 'SETUP' },
            { title: 'Early Access', sub: 'FOUNDING CREATORS' },
            { title: 'Verified', sub: 'CREATOR PROFILES' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center relative flex flex-col items-center justify-center">
              {idx !== 0 && (
                <span
                  className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2"
                  style={{ width: '1px', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                />
              )}
              <div
                className="mb-1"
                style={{
                  color: '#FFFFFF',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: 'clamp(20px, 5vw, 33.26px)',
                  lineHeight: '97.6%',
                }}
              >
                {stat.title === '3 Min' ? (
                  <CountUp value={3} suffix=" Min" />
                ) : (
                  <Typewriter text={stat.title} startDelay={idx * 0.2} />
                )}
              </div>
              <Typewriter
                text={stat.sub}
                perChar={0.035}
                startDelay={idx * 0.2 + 0.1}
                className="block text-[10px] tracking-[0.2em] font-medium"
                charStyle={{
                  background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ============ BUILT FOR EMERGING CREATORS ============ */}
      <section id="vision" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">

        {/* Soft ellipse glow on the left edge */}
        <img
          src="/Ellipse%20883.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            left: '-10px',
            top: '35%',
            transform: 'translateY(-50%)',
            height: '500px',
            width: '230px',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        <motion.div
          className="text-center mb-10 md:mb-16"
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.h2 variants={fadeUp} className="text-5xl md:text-7xl font-medium mb-16 md:mb-24" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}>
            Built for{' '}
            <span style={{ color: '#9EA5E2' }}>
              Emerging Creators.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-left md:text-center text-white/90 font-semibold md:font-normal max-w-6xl mx-auto text-xl md:text-xl leading-relaxed mb-10 md:mb-12 [word-spacing:normal]" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", letterSpacing: '0.01em' }}>
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
            <span
              className="font-medium"
              style={{
                background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              brand-ready from day one
            </span>{' '}
            without needing agencies or management teams.
          </motion.p>
        </motion.div>

        <FeatureCards isMobile={isMobile} />
      </section>

      {/* ============ MADE FOR NEXT GENERATION (marquee + rotating card) ============ */}
      <SensesSection />

      {/* ============ THREE STEPS ============ */}
      <section id="how-it-works" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">
        <img
          src="/image/Group%2039850.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none left-1/2 -translate-x-1/2"
          style={{
            top: '-100px',
            width: '100%',
            maxWidth: 'none',
            height: 'auto',
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        {/* Soft ellipse glow on the left edge */}
        <img
          src="/Ellipse%20883.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            left: '-10px',
            top: '42%',
            transform: 'translateY(-50%)',
            height: 'auto',
            width: 'auto',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        <div className="text-center mb-12 md:mb-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-medium" style={{ color: '#FFFFFF' }}>
            Three steps to your<br />
            <span style={{ color: '#9EA5E2' }}>verified creator identity</span>
          </h2>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative pl-4 md:pl-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Connecting line segment 1: step 1 → step 2 (draws left → right) */}
            <motion.div
              className="hidden md:block absolute top-10 left-[16.66%] right-[50%] step-line"
              style={{ transformOrigin: 'left center' }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.25, ease: 'easeInOut', delay: 0.2 } } }}
            />
            {/* Connecting line segment 2: step 2 → step 3 (draws left → right) */}
            <motion.div
              className="hidden md:block absolute top-10 left-[50%] right-[16.66%] step-line"
              style={{ transformOrigin: 'left center' }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.25, ease: 'easeInOut', delay: 0.65 } } }}
            />

            {[
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="4" stroke="#FFFFFF" strokeWidth="1.5" />
                    <circle cx="17.5" cy="6.5" r="1" fill="#FFFFFF" />
                  </svg>
                ),
                title: 'Connect Instagram',
                desc: 'Securely link your Instagram or YouTube to pull live data.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 12L12 17L22 12" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                title: 'Auto-Generate Identity',
                desc: 'Creasume pulls your stats into a structured, beautiful portfolio.',
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                title: 'Share With Brands',
                desc: 'Send your verifiable link to close deals faster and look professional.',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut', delay: [0, 0.45, 0.9][idx] } },
                }}
              >
                <div
                  className="w-20 h-20 rounded-full border border-[#36377A] flex items-center justify-center mx-auto mb-5 relative z-10"
                  style={{ background: 'linear-gradient(135deg, #272969 0%, #10113A 100%)' }}
                >
                  {step.icon}
                </div>
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700,
                    fontSize: '25px',
                    color: '#FFFFFF',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="leading-relaxed max-w-[280px] mx-auto"
                  style={{
                    fontFamily: "'Gelion', sans-serif",
                    fontSize: '17px',
                    color: '#FFFFFF',
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-28 md:mt-40 text-center">
            <p className="text-3xl md:text-4xl font-bold text-white mb-6">
              <svg
                aria-hidden="true"
                className="inline-block mr-3 align-middle"
                width="34" height="34" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8.5 12 2.5 2.5 4.5-5" />
              </svg>
              Your consent matters to us
            </p>
            <motion.div
              className="shine-border shine-border--instagram inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white mb-7"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-60px' }}
            >
              {/* Hi-res wordmark darkened → crisp on scaled/retina displays. */}
              <img src="/creasumelogo.png" alt="Creasume" style={{ height: '20px', width: 'auto', objectFit: 'contain', filter: 'brightness(0)' }} />
              <span className="text-[#9EA5E2] text-sm">×</span>
              {/* Instagram glyph as inline SVG (vector → no blur) + wordmark. */}
              <span className="inline-flex items-center gap-1.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <defs>
                    <linearGradient id="igGrad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                      <stop offset="0" stopColor="#FEDA75" />
                      <stop offset="0.25" stopColor="#FA7E1E" />
                      <stop offset="0.5" stopColor="#D62976" />
                      <stop offset="0.75" stopColor="#962FBF" />
                      <stop offset="1" stopColor="#4F5BD5" />
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#igGrad)" strokeWidth="2" />
                  <circle cx="12" cy="12" r="5" stroke="url(#igGrad)" strokeWidth="2" />
                  <circle cx="17.4" cy="6.6" r="1.4" fill="url(#igGrad)" />
                </svg>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '15px', color: '#262626', letterSpacing: '-0.01em' }}>Instagram</span>
              </span>
            </motion.div>
            <p className="text-xl md:text-2xl text-white font-normal mx-auto whitespace-normal md:whitespace-nowrap">
              We fetch your verified statistics with your consent directly through Instagram permissions.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOUNDING CREATOR PERKS ============ */}
      <section ref={perksRef} className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-24 overflow-hidden">
        {/* Diagonal background texture (glow sits in the lower-right of the PNG) */}
        <img
          src="/image/Group%201707480435.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ right: '240px', top: '-300px', width: '1550px', height: '1400px', opacity: 0.8, zIndex: 0 }}
        />

        <div ref={perksHeadingRef} className="text-center mb-10 md:mb-16 relative z-10">
          <h2
            className="font-medium mb-6"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontSize: 'clamp(30px, 7vw, 48px)',
              lineHeight: '110%',
            }}
          >
            Become a<br />
            <span style={{ color: '#9EA5E2' }}>Founding Creator</span>
          </h2>
          <p
            className="text-white/75"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontSize: '20px',
            }}
          >
            Unlock the following perks and benefits
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Top row of 3 — all unstack from the centre to their columns together,
              so they arrive at their grid spots at the same scroll point. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={110} stackedY={0} zIndex={5} perk={PERKS[0]} index={0} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={0} stackedY={0} zIndex={4} perk={PERKS[1]} index={1} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={-110} stackedY={0} zIndex={3} perk={PERKS[2]} index={2} isMobile={isMobile} titleClass="text-white leading-tight max-w-50 relative z-10" />
          </div>

          {/* Bottom row of 2 — slide apart together, in sync with the top row.
              stackedY lifts them up into the top row so all 5 pile at one spot. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:max-w-146.5 md:mx-auto">
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={55} stackedY={-113} zIndex={2} perk={PERKS[3]} index={3} isMobile={isMobile} titleClass="text-white leading-tight max-w-55 relative z-10" />
            <ScrubCard progress={perksProgress} start={0} length={0.85} stackedX={-55} stackedY={-113} zIndex={1} perk={PERKS[4]} index={4} isMobile={isMobile} titleClass="text-white leading-tight max-w-55 relative z-10" />
          </div>
        </div>
      </section>

      {/* ============ RESERVE YOUR IDENTITY ============ */}
      <section id="waitlist" className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-12 md:pt-20 pb-12 md:pb-24 overflow-hidden">

        {/* Soft colored ellipse around the section — fades on all sides */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            top: '-40px',
            bottom: '-40px',
            left: '0%',
            right: '0%',
            background: 'radial-gradient(62% 58% at 50% 50%, rgba(26,33,92,0.38) 0%, rgba(26,33,92,0.38) 52%, rgba(37,49,133,0) 82%)',
            zIndex: 0,
          }}
        />

        {/* Soft ellipse glow on the left edge */}
        <img
          src="/Ellipse%20883.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            left: '-60px',
            top: '75%',
            transform: 'translateY(-50%)',
            height: '850px',
            width: '320px',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        {/* Soft ellipse glow on the right edge */}
        <img
          src="/Ellipse%20879.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            right: '-60px',
            top: '32%',
            transform: 'translateY(-50%)',
            height: 'auto',
            width: 'auto',
            opacity: 0.8,
            zIndex: 0,
          }}
        />

        {/* Horizontal capsule outline peeking from the left edge */}
        <img
          src="/Rounded%20rectangle%20(1).png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{
            left: '0px',
            top: '12%',
            height: '90px',
            width: 'auto',
            opacity: 0.7,
            zIndex: 0,
          }}
        />

        <div className="text-center mb-20 md:mb-36 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 md:mb-10">
            Reserve your<br />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 400,
                fontSize: '59px',
                color: '#9EA5E2',
              }}
            >
              creator identity
            </span>
          </h2>
          <p
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              color: '#FFFFFF',
              fontWeight: 25,
              fontSize: '25px',
              lineHeight: '110%',
            }}
          >
            Be among the first creators to own a verified professional identity.<br />
            Limited spots in our founding cohort.
          </p>
        </div>

        <div className="relative mx-auto z-10" style={{ width: '610px', maxWidth: '100%' }}>
          {/* Four solid blue circles, one half-tucked behind each card corner.
              The fill stays fully opaque out to 90% of the radius and fades only
              in the last 10%, so the round edge is clean and defined; blur(3px)
              keeps a crisp rim and the box-shadow is just a gentle outer glow. */}
          {/* Sizes and offsets use clamp() so the circles shrink and tuck behind
              the card corners on small screens instead of bleeding off-screen,
              while keeping their full desktop size at the upper bound. */}
          {[
            {                                                 // top-left = smallest
              width: 'clamp(72px, 19vw, 120px)',
              height: 'clamp(72px, 19vw, 120px)',
              top: 'clamp(-45px, -4.5vw, -22px)',
              left: 'clamp(-45px, -4.5vw, -22px)',
              background:
                'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
            },
            {                                                 // top-right (dark navy on the outside)
              width: 'clamp(96px, 26vw, 178px)',
              height: 'clamp(96px, 26vw, 178px)',
              top: 'clamp(-55px, -6vw, -26px)',
              right: 'clamp(-55px, -6vw, -26px)',
              background:
                'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
            },
            { width: 'clamp(90px, 24vw, 157px)', height: 'clamp(84px, 22vw, 145px)', bottom: '-8px', left: 'clamp(-58px, -6vw, -26px)' },   // bottom-left
            { width: 'clamp(94px, 25vw, 173px)', height: 'clamp(94px, 25vw, 173px)', bottom: 'clamp(-40px, -4.5vw, -20px)', right: 'clamp(-40px, -4.5vw, -20px)' },  // bottom-right
          ].map(({ width, height, background, ...pos }, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none select-none"
              style={{
                width,
                height,
                zIndex: 0,
                background:
                  background ??
                  'radial-gradient(circle, #4a66f5 0%, #2c3cc0 55%, #141a6e 85%, #0d1250 100%)',
                filter: 'blur(0.5px)',
                boxShadow: '0 0 40px rgba(70,100,255,0.28)',
                ...pos,
              }}
            />
          ))}

          <form
            onSubmit={handleSubmit}
            className="waitlist-form rounded-[28px] mx-auto relative"
            style={{
              minHeight: '440px',
              padding: 'clamp(28px, 6vw, 44px) clamp(20px, 4vw, 28px)',
              zIndex: 1,
              background: 'rgba(18, 18, 22, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 30px 90px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div className="space-y-5">
              <input
                type="text"
                required
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: '501.2px',
                  maxWidth: '100%',
                  padding: '18px 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
              <input
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: '501.2px',
                  maxWidth: '100%',
                  padding: '18px 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
              <input
                type="text"
                required
                placeholder="Instagram username (e.g. @yourhandle)"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="rounded-[14px] outline-none mx-auto block w-full transition-colors focus:border-white/20 placeholder:text-white/45"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  width: '501.2px',
                  maxWidth: '100%',
                  padding: '18px 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '18px',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="gradient-btn rounded-[14px] text-white transition-all hover:scale-[1.015] mx-auto block w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  width: '501.2px',
                  maxWidth: '100%',
                  padding: '19px 22px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: '19px',
                  marginTop: '28px',
                  boxShadow: '0 12px 30px rgba(168, 85, 247, 0.35), 0 6px 18px rgba(236, 72, 153, 0.3)',
                }}
              >
                {status === 'sending' ? 'Joining…' : 'Join the Waitlist'}
              </button>

              {status === 'success' && (
                <p className="text-center mt-4 text-base text-white relative z-10">
                  🎉 You're on the waitlist! We'll be in touch.
                </p>
              )}
              {status === 'invalid' && (
                <p className="text-center mt-4 text-base text-[#F22997] relative z-10">
                  Please fill in your name, a valid email, and Instagram handle.
                </p>
              )}
              {status === 'error' && (
                <p className="text-center mt-4 text-base text-[#F22997] relative z-10">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Social proof — joined creators (self-contained: its 2.5s ticker
                  re-renders only itself, not the whole page) */}
              <JoinedProof />
            </div>
          </form>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
    </MotionConfig>
  )
}

export default App
