import { useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

// ---- Card icons (purple gradient on the dark card surface) ----
function LinkIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
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
    <svg width="112" height="112" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="cardIcon1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B7FE6" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      <rect x="10" y="8" width="40" height="48" rx="6" fill="url(#cardIcon1)" />
      <rect x="47" y="18" width="9" height="6" rx="3" fill="url(#cardIcon1)" />
      <rect x="47" y="31" width="9" height="6" rx="3" fill="url(#cardIcon1)" />
      <circle cx="29" cy="26" r="6" fill="#1a1a20" />
      <path d="M18 45c0-6.5 5-11 11-11s11 4.5 11 11" fill="#1a1a20" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="112" height="112" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="cardIcon2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7B7FE6" />
          <stop offset="100%" stopColor="#9CA2E1" />
        </linearGradient>
      </defs>
      <rect x="9" y="40" width="9" height="14" rx="2" fill="url(#cardIcon2)" />
      <rect x="23" y="30" width="9" height="24" rx="2" fill="url(#cardIcon2)" />
      <rect x="37" y="21" width="9" height="33" rx="2" fill="url(#cardIcon2)" />
      <rect x="51" y="11" width="9" height="43" rx="2" fill="url(#cardIcon2)" />
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

const repeated = () => Array.from({ length: 8 }, (_, i) => i)

// One horizontal marquee row. `x` is a scroll-driven motion value.
function MarqueeRow({ x, word, variant }) {
  return (
    <div className="flex justify-center">
      <motion.div style={{ x }} className={`marquee-row ${variant}`}>
        {repeated().map((i) => (
          <span key={i} className="marquee-word">
            {word}
            <span className="marquee-dot">·</span>
          </span>
        ))}
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

  // COLLABORATE (top) + ENGAGEMENT (bottom) drift right; the two middle
  // INFLUENCE rows drift left (different ranges add parallax depth).
  const collabX = useTransform(scrollYProgress, [0, 1], [-340, 340])
  const infl1X = useTransform(scrollYProgress, [0, 1], [320, -320])
  const infl2X = useTransform(scrollYProgress, [0, 1], [420, -420])
  const engageX = useTransform(scrollYProgress, [0, 1], [-300, 300])

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
          <MarqueeRow x={collabX} word="COLLABORATE" variant="marquee-row--bright" />
          {/* two INFLUENCE rows grouped in the middle */}
          <div className="flex flex-col gap-1 md:gap-2">
            <MarqueeRow x={infl1X} word="INFLUENCE" variant="marquee-row--sm" />
            <MarqueeRow x={infl2X} word="INFLUENCE" variant="marquee-row--sm" />
          </div>
          <MarqueeRow x={engageX} word="ENGAGEMENT" variant="marquee-row--bright" />
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
                <div className="absolute -bottom-2 -right-2 md:-bottom-1 md:-right-1">{card.icon}</div>
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
