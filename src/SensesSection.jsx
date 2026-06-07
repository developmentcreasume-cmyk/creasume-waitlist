import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'

// Marquee scroll speed in pixels/second — shared by every row so they all move
// at the same visual pace regardless of word length or font size.
const MARQUEE_SPEED = 40

// ---- Card icons (purple gradient on the dark card surface) ----
function LinkIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 24 24" fill="none" style={{ transform: 'translateY(14px)' }}>
      <defs>
        <linearGradient id="cardIconLink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#363C98" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      <path
        d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
        stroke="url(#cardIconLink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
        stroke="url(#cardIconLink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PortfolioIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="100"
      height="100"
      fill="none"
      stroke="url(#cardIconContact)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <linearGradient id="cardIconContact" gradientUnits="userSpaceOnUse" x1="3" y1="3" x2="21" y2="21">
          <stop offset="0%" stopColor="#5D65DC" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      {/* square book with a barely-there corner radius */}
      <rect x="3.5" y="3" width="17" height="18" rx="0.6" strokeWidth="1.6" />
      {/* spine column split off near the right */}
      <path d="M16 3.2v17.6" strokeWidth="1.6" />
      {/* two tab marks inside the spine */}
      <path d="M18 9.4h1.1" />
      <path d="M18 14.6h1.1" />
      {/* person in the main left area */}
      <circle cx="9.6" cy="10" r="2.4" />
      <path d="M6.1 16.2c0-1.9 1.57-3.1 3.5-3.1s3.5 1.2 3.5 3.1" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="128" height="128" viewBox="0 0 46 46" fill="none" style={{ transform: 'translateY(12px)' }}>
      <defs>
        <linearGradient id="cardIconChart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5D65DC" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      <g stroke="url(#cardIconChart)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* outlined bars with rounded tops, increasing in height, all touching each other and the baseline */}
        <rect x="11" y="26" width="8" height="13" />
        <rect x="19" y="18" width="8" height="21" />
        <rect x="27" y="8" width="8" height="31" />
        {/* baseline */}
        <path d="M9 39h28" />
      </g>
    </svg>
  )
}

// Rotating cards (cross-fade). Add more entries — the dashes auto-match.
const CARDS = [
  {
    title: 'One Professional Link',
    desc: (
      <>
        Share <span className="font-semibold text-white">creasume.com/you</span> instead of
        multiple files. Works flawlessly in brand emails, DMs, and LinkedIn.
      </>
    ),
    icon: <LinkIcon />,
  },
  {
    title: 'Dynamic Media Kit & Portfolio',
    desc: 'Showcase your best content, collaborations, and audience insights, in one brand-ready portfolio that updates automatically.',
    icon: <PortfolioIcon />,
  },
  {
    title: 'Data-Driven Credibility',
    desc: 'Build trust with transparent performance metrics powered by official Meta APIs, with your Instagram data kept secure and protected.',
    icon: <ChartIcon />,
  },
]

// One horizontal marquee row that auto-scrolls forever (independent of page
// scroll). Two identical halves animated by 50% give a seamless loop.
function MarqueeRow({ word, variant, direction = 1 }) {
  // `word` can be a single string or a list of words to cycle through.
  const words = Array.isArray(word) ? word : [word]
  const half = (
    <div className="flex shrink-0">
      {Array.from({ length: 3 }).flatMap((_, rep) =>
        words.map((w, i) => (
          <span key={`${rep}-${i}`} className="marquee-word">
            {w}
            <span className="marquee-dot">·</span>
          </span>
        )),
      )}
    </div>
  )

  // Measure one half's width so the loop distance (and thus duration) tracks the
  // real rendered size — keeps every row at the same pixels/second.
  const trackRef = useRef(null)
  const [halfWidth, setHalfWidth] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setHalfWidth(el.scrollWidth / 2)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const duration = halfWidth ? halfWidth / MARQUEE_SPEED : 30

  return (
    <div className="flex w-full overflow-hidden">
      <motion.div
        ref={trackRef}
        className={`marquee-row ${variant}`}
        animate={{ x: direction > 0 ? [-halfWidth, 0] : [0, -halfWidth] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {half}
        {half}
      </motion.div>
    </div>
  )
}

export default function SensesSection() {
  const ref = useRef(null)
  // The section is tall (one viewport per card). While scrolling through it the
  // inner panel is pinned (sticky) and the scroll progress drives which card is
  // active. Once the last card is past, the section releases to the next one.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  // Card boundaries along the scroll. Card 1 ends sooner (it also shows while
  // the section scrolls in, so it would otherwise feel too long); card 2 gets a
  // longer stretch so it doesn't flash by; card 3 keeps its tail.
  const THRESHOLDS = [0.2, 0.66]
  const [active, setActive] = useState(0)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    let idx = 0
    while (idx < THRESHOLDS.length && p >= THRESHOLDS[idx]) idx++
    setActive(idx)
  })

  const card = CARDS[active]

  return (
    <section ref={ref} className="relative z-10" style={{ height: `${CARDS.length * 160}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* ===== Background scrolling marquee text ===== */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between select-none py-16 md:py-24">
          <MarqueeRow
            word={['COLLABORATE', 'COMMUNITY', 'CONNECT', 'CREATE', 'CONTENT']}
            variant="marquee-row--bright"
            direction={1}
          />
          {/* two INFLUENCE rows grouped in the middle */}
          <div className="flex flex-col gap-1 md:gap-2">
            <MarqueeRow
              word={['INFLUENCE', 'EXPOSURE', 'BRAND READY']}
              variant="marquee-row--sm"
              direction={-1}
            />
            <MarqueeRow
              word={['INFLUENCE', 'CREDIBILITY', 'REACH', 'INSIGHTS']}
              variant="marquee-row--sm"
              direction={1}
            />
          </div>
          <MarqueeRow
            word={['ENGAGEMENT', 'BRAND DEALS', 'MEDIA KIT', 'OPPORTUNITIES', 'PARTNERSHIPS']}
            variant="marquee-row--bright"
            direction={1}
          />
        </div>

        {/* ===== Foreground content ===== */}
        <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: heading + copy */}
        <div>
          <h2
            className="font-bold leading-[1.05] mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(40px, 6vw, 72px)' }}
          >
            Made for the{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #5D65DC 0%, #9CA2E1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              next generation of creators.
            </span>
          </h2>
          <p className="text-white/75 max-w-md text-base md:text-lg leading-relaxed">
            Everything you need to present your influence professionally and get discovered
            by the right brands.
          </p>
        </div>

        {/* Right: rotating card with fade in/out */}
        <div className="relative mx-auto w-full max-w-125">
          <div
            className="relative rounded-[28px] overflow-hidden p-8 md:p-10 min-h-75 md:min-h-80"
            style={{
              background:
                'radial-gradient(90% 150% at 100% 100%, rgba(126, 105, 255, 0.32) 0%, rgba(126, 105, 255, 0) 75%) padding-box, linear-gradient(150deg, #0C0C12 0%, #09090E 58%, #07070D 100%) padding-box, linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(152,255,206,0.25) 40%, rgba(55,113,200,0.3) 73%, rgba(126,105,255,0.45) 100%) border-box',
              border: '1px solid transparent',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative flex flex-col"
              >
                <h3
                  className="text-white leading-tight mb-4 max-w-[70%]"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 'clamp(26px, 3vw, 34px)' }}
                >
                  {card.title}
                </h3>
                <p className="text-white/70 text-sm md:text-[15px] leading-relaxed max-w-[62%]">
                  {card.desc}
                </p>
                <div className="absolute bottom-3 -right-2 md:bottom-4 md:-right-1">{card.icon}</div>
              </motion.div>
            </AnimatePresence>

            {/* progress dashes */}
            <div className="absolute bottom-8 left-8 md:left-10 flex items-center gap-2">
              {CARDS.map((_, i) => (
                <span
                  key={i}
                  className="h-0.75 rounded-full transition-all duration-300"
                  style={{
                    width: i === active ? 32 : 18,
                    backgroundColor: i === active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
