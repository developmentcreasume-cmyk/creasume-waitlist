import { useState, useEffect } from 'react'
import { motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { fadeUp, outlineDraw } from './motion-variants.js'
import { CountUp, Typewriter } from './anim.jsx'
import SensesSection from './SensesSection.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  // Founding Creator perk cards: start stacked, fan out to the grid after
  // ~1.5s (or earlier on hover/click). See the Founding Creator section below.
  const [perksReleased, setPerksReleased] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setPerksReleased(true), 1500)
    return () => clearTimeout(t)
  }, [])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    handle: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      await fetch(import.meta.env.VITE_SHEET_ENDPOINT, {
        method: 'POST',
        // text/plain avoids the CORS preflight that Apps Script web apps don't answer.
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(formData),
      })
      setStatus('success')
      setFormData({ name: '', email: '', handle: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="relative min-h-screen overflow-x-clip bg-black text-white">
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
      <nav id="home" className="relative z-50 flex items-center justify-between px-6 md:px-16 lg:px-24 py-6">
        <div className="flex items-center gap-2">
          <img src="/creasumelogo.png" alt="Creasume" className="h-12 md:h-14 w-auto" />
        </div>
        <div
          className="hidden md:flex items-center justify-between gap-1 px-2 rounded-full bg-[#020423] backdrop-blur-sm ml-auto"
          style={{ height: '52px' }}
        >
          {[
            { id: 'home', label: 'Home', href: '#home' },
            { id: 'vision', label: 'Vision', href: '#vision' },
            { id: 'how-it-works', label: 'How it Works', href: '#how-it-works' },
            { id: 'waitlist', label: 'Join the Waitlist', href: '#waitlist' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <a
                key={tab.id}
                href={tab.href}
                onClick={(e) => {
                  setActiveTab(tab.id)
                  if (tab.id === 'home') {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={`flex items-center justify-center h-[42px] rounded-full font-medium transition-colors duration-150 ease-in-out ${
                  isActive ? 'text-white px-6' : 'text-[#9EA5E2] hover:text-white px-3'
                }`}
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  backgroundColor: isActive ? 'rgba(34, 39, 114, 0.53)' : 'transparent',
                }}
              >
                {tab.label}
              </a>
            )
          })}
        </div>

        {/* Mobile hamburger button */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden flex items-center justify-center w-11 h-11 rounded-full bg-[#020423] text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {menuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden absolute left-6 right-6 top-full mt-2 rounded-2xl bg-[#020423] border border-[#36377A]/50 p-2 z-50 flex flex-col">
            {[
              { id: 'home', label: 'Home', href: '#home' },
              { id: 'vision', label: 'Vision', href: '#vision' },
              { id: 'how-it-works', label: 'How it Works', href: '#how-it-works' },
              { id: 'waitlist', label: 'Join the Waitlist', href: '#waitlist' },
            ].map((tab) => (
              <a
                key={tab.id}
                href={tab.href}
                onClick={(e) => {
                  setActiveTab(tab.id)
                  setMenuOpen(false)
                  if (tab.id === 'home') {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                }}
                className={`px-4 py-3 rounded-xl font-medium transition-colors duration-150 ${
                  activeTab === tab.id ? 'text-white bg-[rgba(34,39,114,0.53)]' : 'text-[#9EA5E2] hover:text-white'
                }`}
                style={{ fontSize: '18px', fontWeight: 500 }}
              >
                {tab.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pt-16 pb-12 md:pt-28 md:pb-20">
        {/* Two separate badge pills */}
        <div className="flex flex-wrap items-center gap-9 mb-10">
          <motion.div
            className="inline-flex items-center justify-center rounded-full border backdrop-blur-sm px-6"
            style={{
              height: '40px',
              backgroundColor: 'rgba(125, 113, 201, 0.09)',
              borderColor: 'rgba(255, 255, 255, 0.43)',
            }}
            variants={outlineDraw}
            initial="hidden"
            animate="show"
          >
            <span
              style={{
                fontFamily: "'Gelion', 'Outfit', sans-serif",
                color: '#FFFFFF',
                letterSpacing: '0.1em',
                lineHeight: '0.976',
                fontSize: '15.68px',
                fontWeight: 300,
              }}
            >
              VERIFIED CREATOR IDENTITY PLATFORM
            </span>
          </motion.div>

          <motion.div
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white"
            style={{ width: '244.95px', height: '35.46px' }}
            variants={outlineDraw}
            initial="hidden"
            animate="show"
          >
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              style={{ width: '96px', height: '26px', objectFit: 'contain' }}
            />
            <span className="text-[#9EA5E2] text-sm">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              style={{ width: '74.67px', height: '21px', objectFit: 'contain' }}
            />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-10 lg:gap-16 items-center">
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
                fontSize: 'clamp(40px, 9vw, 102.329px)',
                lineHeight: '97.63%',
                width: '747px',
                maxWidth: '100%',
              }}
            >
              Your Influence<br />
              <span style={{ color: '#6068DC' }}>Structured &</span><br />
              <span className="gradient-text">Verified.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white text-base md:text-lg max-w-xl mb-10 leading-snug relative z-10" style={{ fontFamily: "'Gelion', sans-serif" }}>
              Create your dynamic media kit and turn your social presence into a professional creator identity that brands trust.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:flex-nowrap gap-10 relative z-10">
              <motion.button
                className="rounded-full flex items-center justify-center shrink-0 whitespace-nowrap w-full sm:w-[360px]"
                whileHover={{ scale: 1.05, boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.5)' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{
                  height: '59px',
                  fontWeight: 600,
                  fontSize: '22px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  background: 'linear-gradient(180deg, #5D65DC 0%, #9CA2E1 100%)',
                  color: '#0B0B27',
                }}
              >
                Become A Founding Creator
              </motion.button>
              <motion.button
                className="rounded-full border border-white text-white flex items-center justify-center px-7 shrink-0 whitespace-nowrap w-full sm:w-auto"
                whileHover={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{
                  height: '59px',
                  fontWeight: 600,
                  fontSize: '22px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  backgroundColor: 'rgba(11, 11, 39, 0.4)',
                }}
              >
                Explore Vision
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Sample Creator card — continuous slow float */}
          <div className="relative flex justify-center lg:justify-end lg:pr-12 lg:-translate-x-[140px] lg:-translate-y-[50px]">
            <motion.img
              src="/image/blurimage.png"
              alt="Sample Creator Profile"
              className="w-full"
              style={{ maxWidth: '440px' }}
              animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 pt-12 md:pt-24 pb-12 md:pb-24 flex justify-center">
        <div
          className="rounded-2xl px-6 md:px-8 py-6 md:py-0 grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch"
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
                {stat.title === '$250 Billion' ? (
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
      <section id="vision" className="relative z-10 px-6 md:px-16 lg:px-24 py-12 md:py-24 overflow-hidden">

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
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2 className="text-5xl md:text-7xl font-medium mb-8" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif" }}>
            Built for{' '}
            <span style={{ color: '#9EA5E2' }}>
              Emerging Creators.
            </span>
          </h2>
          <p className="text-white/70 font-normal max-w-4xl mx-auto text-sm md:text-base leading-snug mb-8" style={{ fontFamily: "'Gelion'" }}>
            Content creation has become one of the most powerful marketing tool for modern brands.<br />
            The creator economy is a $250+ billion industry with more than 80+ million emerging creators.<br />
            But most emerging creators still lack the professional identity needed to position themselves effectively.
          </p>
          <p className="text-white font-semibold max-w-2xl mx-auto text-base md:text-lg leading-snug mb-6" style={{ fontFamily: "'Gelion', sans-serif" }}>
            No media kit. No credibility layer. No way to show brands why they matter.<br />
            <span className="font-normal">Creasume changes that.</span>
          </p>
          <p className="text-white max-w-2xl mx-auto text-sm md:text-base leading-snug" style={{ fontFamily: "'Gelion', sans-serif" }}>
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
          </p>
        </motion.div>

        <div
          className="rounded-2xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:h-[428px]"
          style={{
            width: '858.21px',
            maxWidth: '100%',
            background:
              'linear-gradient(180deg, rgba(16, 31, 70, 0.5) 0%, rgba(0, 9, 32, 0.72) 100%)',
            border: '1px solid rgba(54, 55, 122, 0.4)',
          }}
        >
          {[
            {
              icon: <img src="/Icon%20MK%201.png" alt="Smart Media Kits" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Smart Media<br />Kits</>),
              desc: 'Auto-generated, brand-ready kits that showcase your reach exactly the way brands want to see it.',
            },
            {
              icon: <img src="/Icon%20ID%201.png" alt="Creator Profiles" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Creator<br />Profiles</>),
              desc: 'One verified identity page that replaces scattered links with a single credible presence.',
            },
            {
              icon: <img src="/Vector%20(2).png" alt="Brand Inquiries" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Brand<br />Inquiries</>),
              desc: 'Structured collaboration requests no DM chaos, no back and forth with brands.',
            },
            {
              icon: <img src="/Vector%20(3).png" alt="Stronger Positioning" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
              title: (<>Stronger<br />Positioning</>),
              desc: 'Get discovered. Stand out in front of brands actively looking for creators like you.',
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              className="relative px-8 pt-14 pb-8 flex flex-col rounded-2xl"
              style={{ transformOrigin: 'center' }}
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={{ rest: {}, hover: {} }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Straight white divider between cards */}
              {idx !== 0 && (
                <span className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-white/40 pointer-events-none" />
              )}

              {/* Brighten overlay that fills in on hover (card opening out) */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ background: 'linear-gradient(180deg, rgba(33,22,185,0.22) 0%, rgba(13,8,115,0.10) 100%)' }}
                variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
              <motion.div
                className="relative z-10 flex flex-col h-full"
                variants={{ rest: { scale: 1, y: 0 }, hover: { scale: 1.04, y: -6 } }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <div className="mb-8">{card.icon}</div>
                <div
                  className="mb-8 rounded-full"
                  style={{
                    width: '32px',
                    height: '2px',
                    background: '#E432A5',
                  }}
                />
                <h3
                  className="mb-6 text-white leading-tight"
                  style={{
                    width: '165.46px',
                    height: '52.95px',
                    fontWeight: 500,
                    fontSize: '24.27px',
                  }}
                >
                  {card.title}
                </h3>
                <motion.p
                  className="text-white"
                  style={{
                    fontWeight: 400,
                    fontSize: '14.34px',
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                    lineHeight: '120%',
                  }}
                  variants={{ rest: { opacity: 0.7 }, hover: { opacity: 1 } }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {card.desc}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ MADE FOR NEXT GENERATION (marquee + rotating card) ============ */}
      <SensesSection />

      {/* ============ THREE STEPS ============ */}
      <section id="how-it-works" className="relative z-10 px-6 md:px-16 lg:px-24 py-12 md:py-24 overflow-hidden">
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
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {/* Connecting line segment 1: step 1 → step 2 (draws left → right) */}
            <motion.div
              className="hidden md:block absolute top-7 left-[16.66%] right-[50%] step-line"
              style={{ transformOrigin: 'left center' }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.4, ease: 'easeInOut', delay: 0.35 } } }}
            />
            {/* Connecting line segment 2: step 2 → step 3 (draws left → right) */}
            <motion.div
              className="hidden md:block absolute top-7 left-[50%] right-[16.66%] step-line"
              style={{ transformOrigin: 'left center' }}
              variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.4, ease: 'easeInOut', delay: 1.1 } } }}
            />

            {[
              {
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
                  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', delay: [0, 0.75, 1.5][idx] } },
                }}
              >
                <div
                  className="w-14 h-14 rounded-full border border-[#36377A] flex items-center justify-center mx-auto mb-5 relative z-10"
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
                  className="leading-relaxed max-w-[260px] mx-auto"
                  style={{
                    fontFamily: "'Gelion', sans-serif",
                    fontSize: '15px',
                    color: '#FFFFFF',
                  }}
                >
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-28 md:mt-40 text-center">
            <p className="text-xl md:text-2xl font-bold text-white mb-4">
              <img
                src="/Vector%20(5).png"
                alt=""
                aria-hidden="true"
                className="inline-block mr-2 align-middle"
                style={{ width: '24px', height: '24px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              Your consent matters to us
            </p>
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white mb-5"
              variants={outlineDraw}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <img src="/Group%201707480613.png" alt="Creasume" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
              <span className="text-[#9EA5E2] text-sm">×</span>
              <img src="/image/image%204.png" alt="Instagram" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
            </motion.div>
            <p className="text-lg text-white font-normal mx-auto whitespace-normal md:whitespace-nowrap">
              We fetch your verified statistics with your consent directly through Instagram permissions.
            </p>
          </div>
        </div>
      </section>

      {/* ============ FOUNDING CREATOR PERKS ============ */}
      <section className="relative z-10 px-6 md:px-16 lg:px-24 py-12 md:py-24 overflow-hidden">
        {/* Diagonal background texture (glow sits in the lower-right of the PNG) */}
        <img
          src="/image/Group%201707480435.png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ right: '300px', top: '-300px', width: '1550px', height: '1400px', opacity: 0.8, zIndex: 0 }}
        />


        <div className="text-center mb-10 md:mb-16">
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

        <div
          className="max-w-4xl mx-auto"
          onMouseEnter={() => setPerksReleased(true)}
          onClick={() => setPerksReleased(true)}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-24">
            {[
              {
                icon: (
                  <img src="/image/Vector.png" alt="" aria-hidden="true" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ),
                title: 'Early Access to Creasume',
              },
              {
                icon: (
                  <img src="/image/Vector%20(1).png" alt="" aria-hidden="true" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ),
                title: 'Exclusive Founding Creator Badge',
              },
              {
                icon: (
                  <img src="/image/Vector%20(3).png" alt="" aria-hidden="true" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ),
                title: 'Lifetime Access to Premium Version',
              },
            ].map((perk, idx) => (
              <motion.div
                key={idx}
                className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: '240px',
                  background:
                    'linear-gradient(#000000, #000000) padding-box, linear-gradient(0deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%) border-box',
                  border: '1px solid transparent',
                  zIndex: 3 - idx,
                }}
                initial={reduceMotion ? 'grid' : 'stacked'}
                animate={perksReleased || reduceMotion ? 'grid' : 'stacked'}
                variants={{
                  // Top row stacks toward the centre card (idx 1); approximate overlap.
                  stacked: { x: ['110%', '0%', '-110%'][idx], y: 0, scale: 0.92 },
                  grid: { x: '0%', y: '0%', scale: 1 },
                }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: idx * 0.08 }}
              >
                <img
                  src="/image/shape.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ opacity: 0.5 }}
                />
                <div className="mb-6 relative z-10">{perk.icon}</div>
                <h3
                  className="text-white leading-tight max-w-[180px] relative z-10"
                  style={{
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                    fontWeight: 500,
                    fontSize: '20px',
                  }}
                >
                  {perk.title}
                </h3>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 md:max-w-[calc(66.666%+48px)] md:mx-auto">
            {[
              {
                icon: (
                  <img src="/image/Vector%20(4).png" alt="" aria-hidden="true" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ),
                title: 'Priority listing to brands',
              },
              {
                icon: (
                  <img src="/image/Vector%20(2).png" alt="" aria-hidden="true" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                ),
                title: 'Chance to work with us as a partner and get paid',
              },
            ].map((perk, idx) => (
              <motion.div
                key={idx}
                className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  minHeight: '240px',
                  background:
                    'linear-gradient(#000000, #000000) padding-box, linear-gradient(0deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%) border-box',
                  border: '1px solid transparent',
                  zIndex: idx === 0 ? 2 : 1,
                }}
                initial={reduceMotion ? 'grid' : 'stacked'}
                animate={perksReleased || reduceMotion ? 'grid' : 'stacked'}
                variants={{
                  // Bottom row stacks up onto the top row and toward centre; approximate.
                  stacked: { x: idx === 0 ? '55%' : '-55%', y: '-110%', scale: 0.92 },
                  grid: { x: '0%', y: '0%', scale: 1 },
                }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: (3 + idx) * 0.08 }}
              >
                <img
                  src="/image/shape.png"
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                  style={{ opacity: 0.5 }}
                />
                <div className="mb-6 relative z-10">{perk.icon}</div>
                <h3
                  className="text-white leading-tight max-w-[220px] relative z-10"
                  style={{
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                    fontWeight: 500,
                    fontSize: '20px',
                  }}
                >
                  {perk.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RESERVE YOUR IDENTITY ============ */}
      <section id="waitlist" className="relative z-10 px-6 md:px-16 lg:px-24 pt-24 md:pt-44 pb-12 md:pb-24 overflow-hidden">

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

        <div className="text-center mb-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
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

        <div className="relative mx-auto z-10" style={{ width: '697.37px', maxWidth: '100%' }}>
          {/* Four blue corner orbs around the form — sharp circular edge,
              blur contained inside via an overflow-hidden clip. */}
          {[
            { top: '-60px', left: '-60px' },
            { top: '-60px', right: '-60px' },
            { bottom: '-60px', left: '-60px' },
            { bottom: '-60px', right: '-60px' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute rounded-full overflow-hidden pointer-events-none"
              style={{ width: '180px', height: '180px', zIndex: -1, ...pos }}
            >
              <div
                className="w-full h-full"
                style={{
                  background: 'linear-gradient(135deg, #10155B 0%, #1B2280 41%, #2F39C7 56%, #3C48F7 100%)',
                  filter: 'blur(18px)',
                  transform: 'scale(1.25)',
                }}
              />
            </div>
          ))}

          <form
            onSubmit={handleSubmit}
            className="rounded-[30.64px] mx-auto relative"
            style={{
              minHeight: '520px',
              padding: 'clamp(28px, 6vw, 60px)',
              background:
                'linear-gradient(135deg, rgba(46, 46, 46, 0.75) 0%, rgba(21, 21, 21, 0.82) 45%, rgba(16, 16, 16, 0.88) 75%, rgba(38, 50, 168, 0.35) 100%)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 30px 80px rgba(0, 0, 0, 0.4)',
            }}
          >
            <div className="space-y-8">
              <input
                type="text"
                placeholder="Your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              />
              <input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Instagram username (e.g. @yourhandle)"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="rounded-xl outline-none mx-auto block"
                style={{
                  backgroundColor: '#000000',
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  padding: '0 22px',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '20px',
                  color: '#FFFFFF',
                  border: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="gradient-btn rounded-xl text-white transition-all hover:scale-[1.02] mx-auto block disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  width: '501.2px',
                  maxWidth: '100%',
                  height: '60px',
                  fontFamily: "'Gelion', 'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '24px',
                  marginTop: '40px',
                }}
              >
                {status === 'sending' ? 'Joining…' : 'Join the Waitlist'}
              </button>

              {status === 'success' && (
                <p className="text-center mt-4 text-base text-white relative z-10">
                  🎉 You're on the waitlist! We'll be in touch.
                </p>
              )}
              {status === 'error' && (
                <p className="text-center mt-4 text-base text-[#F22997] relative z-10">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Social proof — joined creators */}
              <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
                <div className="flex -space-x-3">
                  {['884', '885', '886', '887'].map((n) => (
                    <img
                      key={n}
                      src={`/Ellipse%20${n}.png`}
                      alt=""
                      aria-hidden="true"
                      className="w-9 h-9 rounded-full border-2 border-[#0B0B27] object-cover"
                    />
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white pl-1 pr-4 py-1">
                  <span className="flex items-center justify-center rounded-full bg-black text-white font-bold text-xs h-7 px-3">140</span>
                  <span className="text-black text-sm font-medium">Joined already</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="text-center mt-32 md:mt-64 mb-16 md:mb-28 relative z-10">
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
            className="inline-flex items-center justify-center gap-4 rounded-full bg-white mb-10"
            style={{ width: '340px', maxWidth: '100%', height: '50px' }}
          >
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              style={{ width: '135px', height: '37px', objectFit: 'contain' }}
            />
            <span className="text-[#9EA5E2] text-base">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              style={{ width: '105px', height: '30px', objectFit: 'contain' }}
            />
          </div>
          <p
            className="mx-auto"
            style={{
              fontFamily: "'Gelion', 'Outfit', sans-serif",
              fontWeight: 300,
              fontSize: '22px',
              width: '989px',
              maxWidth: '100%',
              color: 'rgba(255, 255, 255, 0.75)',
              lineHeight: '97.6%',
            }}
          >
            Your data is secure and provided directly by Meta APIs. Creasume is a Meta-verified business with view-only
            access to your profile statistics. No third party or even us can access your personal data.
          </p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 px-6 md:px-16 lg:px-24 pt-12 md:pt-16 pb-8 border-t-2 border-white/20 overflow-hidden">
        {/* Ambient glow band behind the footer columns (top region) */}
        <img
          src="/Ellipse%2025%20(1).png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none left-1/2 -translate-x-1/2 top-0"
          style={{ width: '42%', height: '220px', opacity: 0.7, zIndex: 0 }}
        />
        <img
          src="/Ellipse%2024%20(2).png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ left: '-80px', top: '82px', width: '45%', height: '260px', opacity: 0.7, zIndex: 0 }}
        />
        <img
          src="/Ellipse%2024%20(2).png"
          alt=""
          aria-hidden="true"
          className="absolute pointer-events-none select-none"
          style={{ right: '-80px', top: '82px', width: '45%', height: '260px', opacity: 0.7, zIndex: 0 }}
        />

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mb-16">
          <div>
            <h4 className="font-semibold text-2xl mb-6">Creasume</h4>
            <ul className="space-y-4 text-lg text-white font-normal">
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="hover:text-white transition"
                >
                  Home
                </a>
              </li>
              <li><a href="#vision" className="hover:text-white transition">Vision</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How it Works</a></li>
              <li><a href="#waitlist" className="hover:text-white transition">Join the Waitlist</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Follow us</h4>
            <ul className="space-y-4 text-lg text-white">
              <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
              <li><a href="#" className="hover:text-white transition">X</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Contact Us</h4>
            <ul className="space-y-4 text-sm md:text-lg text-white">
              <li><a href="mailto:support@creasume.com" className="hover:text-white transition break-words">support@creasume.com</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-2xl mb-6">Work with Us</h4>
            <ul className="space-y-4 text-sm md:text-lg text-white">
              <li><a href="mailto:partnerships@creasume.com" className="hover:text-white transition break-words">partnerships@creasume.com</a></li>
            </ul>
          </div>
        </div>

        {/* Full-width divider line below the footer links */}
        <div className="relative z-10 border-t-2 border-white/20 -mx-6 md:-mx-16 lg:-mx-24 mb-8" />

        <div className="relative z-10 text-right text-base text-white/75 mb-20 md:mb-28">
          © 2026 Creasume. All rights reserved.
        </div>

        {/* Giant CREASUME text — hollow outline of the real font */}
        <div className="relative z-10 overflow-hidden -mb-8 -mx-6 md:-mx-16 lg:-mx-24">
          <h1 className="giant-text text-center select-none whitespace-nowrap">
            CREASUME
          </h1>
        </div>
      </footer>
    </div>
    </MotionConfig>
  )
}

export default App
