import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, MotionConfig, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { fadeUp, outlineDraw, staggerParent } from './motion-variants.js'
import { CountUp, Typewriter } from './anim.jsx'
import SensesSection from './SensesSection.jsx'
import LiveDemoCard from './LiveDemoCard.jsx'
import Footer from './components/Footer.jsx'
import './App.css'

// Founding Creator perk cards (order = reveal order in the coverflow).
const PERKS = [
  { icon: <img src="/image/Vector.png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Early Access to Creasume' },
  { icon: <img src="/image/Vector%20(1).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Exclusive Founding Creator Badge' },
  { icon: <img src="/image/Vector%20(3).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Lifetime Access to Premium Version' },
  { icon: <img src="/image/Vector%20(4).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Priority listing to brands' },
  { icon: <img src="/image/Vector%20(2).png" alt="" aria-hidden="true" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />, title: 'Chance to work with us as a partner and get paid' },
]

// Tracks whether the viewport is below the `md` breakpoint, so the perk cards
// can swap their scroll-scrubbed desktop unstack for a simpler mobile reveal.
function useIsMobile(query = '(max-width: 767px)') {
  // Read the match synchronously on first render. If we started `false` and
  // flipped in an effect, the cards would already be mounted at rest and
  // framer-motion's `initial` (the off-screen start) would never apply.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return isMobile
}

// One odometer-style digit: a vertical 0–9 strip that slides so the active digit
// sits in the (overflow-clipped) window. Changing `digit` animates the roll up.
function RollingDigit({ digit }) {
  return (
    <span className="relative inline-block overflow-hidden h-[1em] leading-none align-top">
      {/* keep the column width correct without showing a static glyph */}
      <span className="invisible">0</span>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        animate={{ y: `-${digit}em` }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="h-[1em] leading-none flex items-center justify-center">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

// A number whose digits each roll up independently when the value changes.
function RollingNumber({ value }) {
  return (
    <span className="inline-flex tabular-nums leading-none">
      {String(value).split('').map((ch, i) =>
        /\d/.test(ch) ? (
          <RollingDigit key={i} digit={Number(ch)} />
        ) : (
          <span key={i}>{ch}</span>
        ),
      )}
    </span>
  )
}

// A perk card that scrubs from its stacked position (stackedX/Y, in % of its own
// size) to its grid position (0,0) based on the section's scroll progress, over
// the window [start, start+0.16]. Because it's tied to scroll, it moves forward
// as you scroll down and reverses as you scroll up.
//
// On mobile the grid collapses to a single column, so the stacked unstack reads
// oddly. There each card instead slides in from alternating sides (left, right,
// left, …) as it scrolls into view, driven by its `index`.
function ScrubCard({ progress, start, length = 0.30, stackedX, stackedY, zIndex, perk, titleClass, index = 0, isMobile = false }) {
  // Window width = how much scroll the unstack takes. start → end is when it
  // animates; it's fully placed by `end` (tuned to finish as the heading exits).
  const end = start + length
  const x = useTransform(progress, [start, end], [`${stackedX}%`, '0%'])
  const y = useTransform(progress, [start, end], [`${stackedY}%`, '0%'])
  const scale = useTransform(progress, [start, end], [0.92, 1])

  // Mobile: scrub each card in from an alternating side (even = left, odd =
  // right) as it travels through the lower half of the viewport. Because it's
  // tied to the card's own scroll progress it tracks the scroll position and
  // reverses smoothly on scroll up — it's not a one-shot trigger.
  const cardRef = useRef(null)
  const { scrollYProgress: cardProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  })
  const mobileX = useTransform(cardProgress, [0, 1], [index % 2 === 0 ? -90 : 90, 0])
  const mobileOpacity = useTransform(cardProgress, [0, 0.6], [0, 1])

  return (
    <motion.div
      ref={cardRef}
      className="rounded-2xl p-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        // Mobile uses the per-card scrub (mobileX/opacity); desktop uses the
        // shared stacked unstack (x/y/scale).
        ...(isMobile ? { x: mobileX, opacity: mobileOpacity } : { x, y, scale }),
        zIndex,
        height: '260px',
        background:
          'linear-gradient(#000000, #000000) padding-box, linear-gradient(0deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%) border-box',
        border: '1px solid transparent',
      }}
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
        className={titleClass}
        style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", fontWeight: 500, fontSize: '20px' }}
      >
        {perk.title}
      </h3>
    </motion.div>
  )
}

// "Built for Emerging Creators" feature cards. Data lives at module scope so the
// icon/title/desc JSX isn't re-created on every render.
const FEATURE_CARDS = [
  {
    icon: <img src="/Icon%20MK%201.png" alt="Smart Media Kits" style={{ width: '40.95px', height: '37.51px', objectFit: 'contain' }} />,
    title: (<>Smart Media<br />Kits</>),
    desc: 'Auto-generated, brand-ready kits that showcase your reach exactly the way brands want to see it.',
  },
  {
    icon: <img src="/Icon%20ID%201.png" alt="Creator Profiles" style={{ width: '52px', height: '47.63px', objectFit: 'contain' }} />,
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
]

// Self-contained so tapping a card only re-renders this grid — keeping the
// open/close state out of the 1,200-line App component (whose full re-render on
// every tap was what made the mobile expand feel laggy).
function FeatureCards({ isMobile }) {
  const [openCard, setOpenCard] = useState(null)
  return (
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
      {FEATURE_CARDS.map((card, idx) => (
        <motion.div
          key={idx}
          className="relative px-8 pt-6 lg:pt-14 pb-8 flex flex-col rounded-2xl overflow-hidden cursor-pointer"
          style={{ transformOrigin: 'center' }}
          initial="rest"
          whileHover={isMobile ? undefined : 'hover'}
          animate="rest"
          variants={{ rest: {}, hover: {} }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          onClick={() => setOpenCard(openCard === idx ? null : idx)}
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
            {/* Large faded index number at the top */}
            <span
              className="font-bold leading-none select-none pointer-events-none"
              style={{
                fontSize: '64px',
                color: 'rgba(255,255,255,0.06)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>

            {/* Accent line + icon + title anchored to the bottom */}
            <div className="mt-auto">
              <div
                className="mb-6 rounded-full"
                style={{
                  width: '40px',
                  height: '3px',
                  background: '#E432A5',
                }}
              />
              {/* Mobile-only expand arrow on the left; icon + title on the
                  right (right-aligned), vertically centered against it.
                  On lg+ the arrow is gone and the content goes back to left. */}
              <div className="flex items-center justify-between gap-3">
                {/* Mobile-only expand arrow — taps open the description text.
                    Hidden on lg+ where the layout has room to show on hover/click. */}
                <button
                  type="button"
                  aria-label={openCard === idx ? 'Hide details' : 'Show details'}
                  aria-expanded={openCard === idx}
                  className="lg:hidden shrink-0 -translate-y-8.5 flex items-center justify-center w-9 h-9 rounded-full border border-white/25 text-white/80"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-transform duration-300"
                    style={{ transform: openCard === idx ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div className="lg:w-full -translate-y-20.5 lg:translate-y-0">
                  <div className="mb-6 flex justify-end lg:justify-start">{card.icon}</div>
                  <h3
                    className="text-white leading-tight text-right lg:text-left ml-auto lg:ml-0"
                    style={{
                      width: '165.46px',
                      fontWeight: 500,
                      fontSize: '24.27px',
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Description reveal — framer-motion animates height + opacity so
                  the panel slides open and closed smoothly instead of snapping. */}
              <motion.div
                className="overflow-hidden -translate-y-12 lg:translate-y-0"
                initial={false}
                animate={{ height: openCard === idx ? 'auto' : 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.p
                  className="text-white/75 pt-4 text-lg md:text-xl"
                  style={{
                    lineHeight: '140%',
                    fontFamily: "'Gelion', 'Outfit', sans-serif",
                  }}
                  initial={false}
                  animate={{
                    opacity: openCard === idx ? 1 : 0,
                    y: openCard === idx ? 0 : 12,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: 'easeOut',
                    delay: openCard === idx ? 0.1 : 0,
                  }}
                >
                  {card.desc}
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const reduceMotion = useReducedMotion()
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

  // "Joined already" counter that ticks up slowly: 140 → 141 → 142 …
  const [joinedCount, setJoinedCount] = useState(140)
  // The avatar stack shows the 4 most-recent "joiners". Each tick pushes a fresh
  // face onto the right (cycling the image pool) and drops the leftmost, so a new
  // photo slides in for every +1. `key` is unique & monotonic so AnimatePresence
  // treats every push as a genuinely new element to animate in.
  // Six face photos dropped into /public; encodeURI handles the spaces/parens.
  const AVATAR_POOL = ['1 (2).jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'].map(
    (f) => `/${encodeURIComponent(f)}`,
  )
  const [avatars, setAvatars] = useState(() =>
    AVATAR_POOL.slice(0, 4).map((src, key) => ({ key, src })),
  )
  useEffect(() => {
    const id = setInterval(() => {
      setJoinedCount((n) => n + 1)
      setAvatars((prev) => {
        const nextKey = prev[prev.length - 1].key + 1
        const src = AVATAR_POOL[nextKey % AVATAR_POOL.length]
        return [...prev.slice(1), { key: nextKey, src }]
      })
    }, 2500) // one new join every 2.5s
    return () => clearInterval(id)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      await fetch(import.meta.env.VITE_SHEET_ENDPOINT, {
        method: 'POST',
        // Apps Script web apps don't return CORS headers, so a normal `cors`
        // fetch rejects even when the row is written. `no-cors` lets the POST
        // go through (text/plain keeps it a simple request, no preflight).
        mode: 'no-cors',
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
      <nav id="home" className="relative z-50 flex items-center justify-between px-8 sm:px-12 md:px-20 lg:px-28 pt-6 pb-4 md:pb-8 border-b-2 border-white/40">
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
            <img
              src="/Group%201707480613.png"
              alt="Creasume"
              className="h-[16px] sm:h-[26px] w-auto"
              style={{ objectFit: 'contain' }}
            />
            <span className="text-[#9EA5E2] text-[10px] sm:text-sm">×</span>
            <img
              src="/image%202%20(1).png"
              alt="Meta"
              className="h-[13px] sm:h-[21px] w-auto"
              style={{ objectFit: 'contain' }}
            />
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
              <motion.button
                className="rounded-full flex items-center justify-center shrink-0 whitespace-nowrap w-full sm:w-[360px]"
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
              </motion.button>
              <motion.button
                className="shine-border shine-animate-mobile rounded-full text-white flex items-center justify-center px-7 shrink-0 whitespace-nowrap w-full sm:w-auto"
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
              </motion.button>
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
              style={{ maxWidth: '440px' }}
            >
             <div className="shine-border shine-animate-mobile rounded-xl overflow-hidden">
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
                  className="flex items-center justify-center gap-2 ml-2 mr-auto px-4 rounded-full"
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
            { title: '$250 Billion', sub: 'CREATOR ECONOMY' },
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
          <motion.p variants={fadeUp} className="text-left md:text-center text-white/90 font-semibold md:font-normal max-w-6xl mx-auto text-xl md:text-xl leading-relaxed mb-10 md:mb-12 [word-spacing:normal] md:[word-spacing:0.28em]" style={{ fontFamily: "'Gelion', 'Outfit', sans-serif", letterSpacing: '0.01em' }}>
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
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative"
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
            <p className="text-3xl md:text-4xl font-bold text-white mb-6">
              <img
                src="/Vector%20(5).png"
                alt=""
                aria-hidden="true"
                className="inline-block mr-3 align-middle"
                style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
              Your consent matters to us
            </p>
            <motion.div
              className="shine-border shine-border--instagram shine-animate-mobile inline-flex items-center gap-4 px-7 py-3 rounded-full bg-white mb-7"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              viewport={{ once: true, margin: '-60px' }}
            >
              <img src="/Group%201707480613.png" alt="Creasume" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
              <span className="text-[#9EA5E2] text-lg">×</span>
              <img src="/image/image%204.png" alt="Instagram" style={{ height: '28px', width: 'auto', objectFit: 'contain' }} />
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
            className="rounded-[28px] mx-auto relative"
            style={{
              minHeight: '440px',
              padding: 'clamp(28px, 6vw, 44px) clamp(20px, 4vw, 28px)',
              zIndex: 1,
              background: 'rgba(18, 18, 22, 0.55)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow:
                'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 30px 90px rgba(0, 0, 0, 0.55)',
            }}
          >
            <div className="space-y-5">
              <input
                type="text"
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
              {status === 'error' && (
                <p className="text-center mt-4 text-base text-[#F22997] relative z-10">
                  Something went wrong. Please try again.
                </p>
              )}

              {/* Social proof — joined creators */}
              <div className="flex items-center justify-center gap-3 mt-6 relative z-10">
                <div className="flex -space-x-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {avatars.map((a) => (
                      <motion.img
                        key={a.key}
                        layout
                        src={a.src}
                        alt=""
                        aria-hidden="true"
                        initial={{ opacity: 0, scale: 0.4, x: 24 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.4, x: -24 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="w-12 h-12 rounded-full border-2 border-[#15151a] object-cover"
                      />
                    ))}
                  </AnimatePresence>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white pl-1 pr-4 py-1">
                  <span className="flex items-center justify-center rounded-full bg-black text-white font-bold text-sm h-9 px-3 tabular-nums">
                    <RollingNumber value={joinedCount} />
                  </span>
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

      {/* ============ FOOTER ============ */}
      <Footer />
    </div>
    </MotionConfig>
  )
}

export default App
