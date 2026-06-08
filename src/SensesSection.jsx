import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform, wrap } from 'framer-motion'

// How many full half-widths each row travels over the section's whole scroll.
// Higher = faster horizontal movement per unit of page scroll.
const MARQUEE_LOOPS = 0.2

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
        stroke="#9CA2E1"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
        stroke="#9CA2E1"
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
      width="104"
      height="104"
      fill="none"
      stroke="#9CA2E1"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: 'translateY(28px)' }}
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
    <svg width="128" height="128" viewBox="0 0 46 46" fill="none" style={{ transform: 'translateY(28px)' }}>
      <defs>
        <linearGradient id="cardIconChart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5D65DC" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      <g stroke="#9CA2E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
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

// One horizontal marquee row whose position is driven by the section's scroll
// progress (not a timer). Two identical halves with a wrap keep it seamless.
function MarqueeRow({ word, variant, direction = 1, progress }) {
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

  // Measure one half's width so the wrap distance tracks the real rendered size.
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

  // Map scroll progress (0→1) to a horizontal offset, wrapped into one half-width
  // so it loops seamlessly. Direction flips which way it slides as you scroll.
  const x = useTransform(progress, (p) => {
    if (!halfWidth) return 0
    const travel = p * halfWidth * MARQUEE_LOOPS
    const signed = direction > 0 ? -travel : travel
    return wrap(-halfWidth, 0, signed)
  })

  return (
    <div className="flex w-full overflow-hidden">
      <motion.div ref={trackRef} className={`marquee-row ${variant}`} style={{ x }}>
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

  // Separate progress for the background marquee: starts the moment the section
  // begins entering the viewport (start hits bottom) rather than when it pins at
  // the top — so the text is already drifting as the section scrolls into view.
  const { scrollYProgress: marqueeProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
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

  // The rotating card surface — shared between the phone and desktop layouts so
  // there's a single source of truth for its markup.
  const cardBlock = (
    <div
      className="relative rounded-[28px] overflow-hidden p-6 md:p-10 min-h-72 md:min-h-96"
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
          className="relative flex flex-col text-left pb-8 md:pb-10"
        >
          <h3
            className="text-white leading-tight mb-4 max-w-[80%] md:max-w-[70%]"
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 'clamp(26px, 3vw, 34px)' }}
          >
            {card.title}
          </h3>
          <p className="text-white/70 text-sm md:text-[18px] leading-relaxed max-w-[70%] md:max-w-[62%]">
            {card.desc}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Card icon, pinned to the card's own bottom-right corner (inside the
          padding) so overflow-hidden can never clip it. Crossfades with the card. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="pointer-events-none absolute bottom-24 right-5 md:bottom-36 md:right-8 scale-[0.72] md:scale-100 origin-bottom-right"
        >
          {card.icon}
        </motion.div>
      </AnimatePresence>

      {/* progress dashes */}
      <div className="absolute bottom-6 left-6 md:bottom-8 md:left-10 flex items-center gap-2">
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
  )

  const headingText = (
    <>
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
    </>
  )

  const copyText =
    'Everything you need to present your influence professionally and get discovered by the right brands.'

  return (
    <section ref={ref} className="relative z-10" style={{ height: `${CARDS.length * 160}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ===================== PHONE LAYOUT (< md) =====================
            One vertical column where the marquee lines and the content are
            SIBLINGS, not stacked layers. justify-between spreads them evenly
            across the screen height, so on every phone the order reads cleanly:
            COLLABORATE → heading → INFLUENCE → card → INFLUENCE → copy →
            ENGAGEMENT, each with breathing room and never overlapping. */}
        <div className="md:hidden h-full flex flex-col justify-between items-center text-center gap-3 py-5 select-none">
          <MarqueeRow
            word={['COLLABORATE', 'COMMUNITY', 'CONNECT', 'CREATE', 'CONTENT']}
            variant="marquee-row--bright"
            direction={1}
            progress={marqueeProgress}
          />

          <h2
            className="shrink-0 font-bold leading-[1.05] px-6"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(28px, 7.5vw, 44px)' }}
          >
            {headingText}
          </h2>

          <MarqueeRow
            word={['INFLUENCE', 'EXPOSURE', 'BRAND READY']}
            variant="marquee-row--sm"
            direction={-1}
            progress={marqueeProgress}
          />

          <div className="shrink-0 w-full max-w-sm px-6">{cardBlock}</div>

          <MarqueeRow
            word={['INFLUENCE', 'CREDIBILITY', 'REACH', 'INSIGHTS']}
            variant="marquee-row--sm"
            direction={1}
            progress={marqueeProgress}
          />

          <p className="shrink-0 text-white/75 text-base leading-snug px-8">
            {copyText}
          </p>

          <MarqueeRow
            word={['ENGAGEMENT', 'BRAND DEALS', 'MEDIA KIT', 'OPPORTUNITIES', 'PARTNERSHIPS']}
            variant="marquee-row--bright"
            direction={1}
            progress={marqueeProgress}
          />
        </div>

        {/* ===================== DESKTOP / TABLET LAYOUT (md+) =====================
            Background marquee layer behind a centred content grid. */}
        <div className="hidden md:flex h-full items-center relative">
          {/* ===== Background scrolling marquee text ===== */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between select-none py-0">
            <div className="flex flex-col gap-2 md:pt-20">
              <MarqueeRow
                word={['COLLABORATE', 'COMMUNITY', 'CONNECT', 'CREATE', 'CONTENT']}
                variant="marquee-row--bright"
                direction={1}
                progress={marqueeProgress}
              />
            </div>

            <div className="flex flex-col gap-2">
              <MarqueeRow
                word={['INFLUENCE', 'EXPOSURE', 'BRAND READY']}
                variant="marquee-row--sm"
                direction={-1}
                progress={marqueeProgress}
              />
              <MarqueeRow
                word={['INFLUENCE', 'CREDIBILITY', 'REACH', 'INSIGHTS']}
                variant="marquee-row--sm"
                direction={1}
                progress={marqueeProgress}
              />
            </div>

            <div className="flex flex-col gap-2 md:pb-20">
              <MarqueeRow
                word={['ENGAGEMENT', 'BRAND DEALS', 'MEDIA KIT', 'OPPORTUNITIES', 'PARTNERSHIPS']}
                variant="marquee-row--bright"
                direction={1}
                progress={marqueeProgress}
              />
            </div>
          </div>

          {/* ===== Foreground content ===== */}
          <div className="relative z-10 w-full px-8 sm:px-12 md:px-20 lg:px-28 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
            <h2
              className="lg:col-start-1 lg:row-start-1 font-bold leading-[1.05] text-center lg:text-left"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(34px, 7vw, 72px)' }}
            >
              {headingText}
            </h2>

            <p className="lg:col-start-1 lg:row-start-2 text-white/75 max-w-xl mx-auto lg:mx-0 text-center lg:text-left text-lg md:text-2xl leading-relaxed lg:-mt-10">
              {copyText}
            </p>

            <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-center relative mx-auto w-full max-w-125">
              {cardBlock}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
