import { useRef, useState, useEffect, useLayoutEffect } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { FONT, MONO, LABEL_GRADIENT } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'
import { shortenLocation } from '../../services/influenceApi.js'
import { goToPath } from '../../router.js'
import { RollUp } from '../../anim.jsx'

// Value font size by text length — short numbers stay large; long text shrinks.
const sizeForValue = (v) => {
  const n = String(v).length
  return n > 14 ? 'clamp(16px, 2vw, 22px)' : n > 8 ? 'clamp(20px, 2.8vw, 27px)' : 'clamp(28px, 3.6vw, 36px)'
}

// ---- Outline icons for the metric tiles (inherit stroke colour) ----
const ip = { width: 32, height: 32, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ICONS = {
  chart: (<svg {...ip} width="38" height="38"><path d="M5 4v15h15" /><path d="M6.5 16l4.5-4.5 3 3 5-6" /><path d="M14.5 8.5H19V13" /></svg>),
  eye: (<svg {...ip}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="2.5" /></svg>),
  camera: (<svg {...ip}><path d="M3 8h3l1.5-2h9L18 8h3v11H3Z" /><circle cx="12" cy="13" r="3.2" /></svg>),
  followers: (<svg {...ip}><circle cx="12" cy="10" r="2.6" /><path d="M7 17c0-2.5 2.2-4.2 5-4.2s5 1.7 5 4.2" /><circle cx="12" cy="12" r="9.5" strokeDasharray="2.5 3" /></svg>),
  rocket: (<svg {...ip}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91 0z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>),
  heart: (<svg {...ip}><path d="M12 20s-7-4.5-7-9.5A3.5 3.5 0 0 1 12 8a3.5 3.5 0 0 1 7 2.5C19 15.5 12 20 12 20Z" /></svg>),
  comment: (<svg {...ip}><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 20l1.4-4.1a8.5 8.5 0 0 1-.9-3.8A8.38 8.38 0 0 1 12 3.5a8.38 8.38 0 0 1 9 8Z" /></svg>),
  share: (<svg {...ip}><circle cx="18" cy="5" r="2.6" /><circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="19" r="2.6" /><path d="m8.3 13.3 7.4 4.3M15.7 6.4 8.3 10.7" /></svg>),
  broadcast: (<svg {...ip}><circle cx="12" cy="12" r="1.8" /><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 4.9a10 10 0 0 1 0 14.2M5 19.1a10 10 0 0 1 0-14.2" /></svg>),
  score: (<img src="/creasume-c.png" alt="" width="32" height="32" style={{ display: 'block', objectFit: 'contain' }} />),
  pin: (<svg {...ip} width="38" height="38"><path d="M12 15s3.6-2.9 3.6-6a3.6 3.6 0 0 0-7.2 0c0 3.1 3.6 6 3.6 6Z" /><circle cx="12" cy="8.9" r="1.35" /><path d="M7 15.4c-1.8.4-3 1.1-3 1.9 0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5c0-.8-1.2-1.5-3-1.9" /></svg>),
  handshake: (<svg {...ip}><path d="m11 17 2 2a1 1 0 1 0 3-3" /><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" /><path d="m21 3 1 11h-2" /><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" /><path d="M3 4h8" /></svg>),
}

// Scalloped "verified seal" outline (a 24-bump star around a 24×24 circle),
// computed once. Filled blue with a white check, it reads as the classic
// verified badge instead of a plain circle.
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

// Deck-deal: the grid's cards stack on the "Top City" cell then deal out one by
// one, with Top City landing LAST back on the pile spot. The deal order + pile
// index are computed per-render from the actual tile list (below).

// Flip-in (horizontal axis) used by the four stat pills and the two buttons.
// Spec §1: 600ms ease-in-out, 120ms stagger, back-face → front-face.
const flipIn = {
  hidden: { rotateX: 180, opacity: 0 },
  show: (i) => ({ rotateX: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeInOut', delay: i * 0.12 } }),
}

// Text blocks fade + rise, staggered top-to-bottom. Spec §1: ~500ms ease-out.
const textFade = {
  hidden: { opacity: 0, y: 18 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut', delay: i * 0.12 } }),
}

const viewport = { once: true, margin: '-60px' }

// 3×3 metric grid that "deals" each card from a stack resting on the Top City
// cell out to its grid position. Offsets are measured from the real laid-out
// grid so it works at any breakpoint (2 cols on mobile, 3 on desktop).
function StatsGrid({ includeScore = false }) {
  const { CREATOR } = useInfluence()
  // Desktop shows every tile (incl. Creasume Score); mobile moves the score to
  // the badge under the buttons, so it's filtered out of the mobile grid.
  const tiles = includeScore
    ? CREATOR.tiles
    : CREATOR.tiles.filter((t) => t.label !== 'Creasume Score')
  // The deck rests on the Top City cell; that card lands last in the deal.
  const pileIndex = Math.max(0, tiles.findIndex((t) => t.label === 'Top City'))
  const dealOrder = tiles.map((_, i) => i).filter((i) => i !== pileIndex).concat(pileIndex)
  const containerRef = useRef(null)
  const cardRefs = useRef([])
  const inView = useInView(containerRef, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const [offsets, setOffsets] = useState(null)
  // `dealing` flips on after a short hold so the stacked pile is actually
  // visible ("a deck of cards held in hand") before the cards are thrown out.
  const [dealing, setDealing] = useState(false)

  useLayoutEffect(() => {
    if (reduce) return
    const measure = () => {
      const pile = cardRefs.current[pileIndex]
      if (!pile) return
      const pr = pile.getBoundingClientRect()
      setOffsets(
        cardRefs.current.map((el) => {
          const r = el.getBoundingClientRect()
          return { x: pr.left - r.left, y: pr.top - r.top }
        }),
      )
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [reduce, pileIndex])

  useEffect(() => {
    if (reduce || !inView || !offsets) return
    const t = setTimeout(() => setDealing(true), 120) // brief hold, then deal
    return () => clearTimeout(t)
  }, [reduce, inView, offsets])

  return (
    <div ref={containerRef} className="grid grid-cols-2 md:grid-cols-3 auto-rows-fr gap-2.5 md:gap-3">
      {tiles.map(({ value, label, icon, color, details }, i) => {
        const dealPos = dealOrder.indexOf(i)
        // Shrink the value font for long text (e.g. "Indore, Madhya Pradesh") so
        // it fits the tile; numbers / short values keep the large size.
        const valueSize = sizeForValue(value)
        // Mobile only: abbreviate the Top City state ("Indore, Madhya Pradesh" →
        // "Indore, MP") so it fits one line and uses a larger size like the other
        // tiles. Desktop keeps the full name.
        const isTopCity = label === 'Top City'
        const shortValue = isTopCity ? shortenLocation(value) : value
        // Before measuring, keep cards invisible so the resting layout (used to
        // measure) is never painted. Once measured they sit stacked on the pile;
        // after the hold, `dealing` throws each card out to its grid spot.
        const animate = reduce
          ? { x: 0, y: 0, scale: 1, opacity: 1 }
          : dealing
            ? { x: 0, y: 0, scale: 1, opacity: 1 }
            : offsets
              ? { x: offsets[i].x, y: offsets[i].y, scale: 0.92, opacity: 1 }
              : { opacity: 0 }
        return (
          <motion.div
            key={label}
            ref={(el) => { cardRefs.current[i] = el }}
            initial={false}
            animate={animate}
            // Sequential deal: each card flies 350ms and lands before the next
            // is thrown, with a 120ms gap between throws (spec §2).
            transition={{ duration: 0.25, ease: 'easeOut', delay: dealing ? dealPos * 0.05 : 0 }}
            whileHover={dealing ? { y: -4 } : undefined}
            className="relative rounded-2xl px-4 py-6 md:px-6 md:py-8 flex flex-col justify-center items-center text-center"
            // Tiles with a details row get extra height (and every tile matches it
            // via auto-rows-fr) so the value still centres like the other tiles
            // while the details pin to the bottom.
            style={{ backgroundColor: '#10133C', border: '1px solid rgba(255,255,255,0.08)', minHeight: details ? 150 : undefined, zIndex: offsets && !dealing ? dealPos : undefined }}
          >
            <span className="absolute top-3 right-3 md:top-4 md:right-4 text-white scale-[0.65] md:scale-100 origin-top-right">{ICONS[icon]}</span>
            {/* Value + label roll up from a mask. Each card triggers on its own
                scroll-in, so the delay is keyed to the COLUMN (i % 3) — every row
                rolls up the same quick way. */}
            <div className="mb-2">
              {isTopCity ? (
                <>
                  {/* Mobile: abbreviated state, sized like the other tiles. */}
                  <div className="md:hidden">
                    <RollUp
                      text={shortValue}
                      delay={0.05 + (i % 3) * 0.06}
                      duration={0.4}
                      className="font-semibold leading-none"
                      style={{ fontFamily: FONT, fontSize: sizeForValue(shortValue), color: color || '#ffffff' }}
                    />
                  </div>
                  {/* Desktop: full location. */}
                  <div className="hidden md:block">
                    <RollUp
                      text={value}
                      delay={0.05 + (i % 3) * 0.06}
                      duration={0.4}
                      className="font-semibold leading-none"
                      style={{ fontFamily: FONT, fontSize: valueSize, color: color || '#ffffff' }}
                    />
                  </div>
                </>
              ) : (
                <RollUp
                  text={value}
                  delay={0.05 + (i % 3) * 0.06}
                  duration={0.4}
                  className="font-semibold leading-none"
                  style={{ fontFamily: FONT, fontSize: valueSize, color: color || '#ffffff' }}
                />
              )}
            </div>
            <RollUp
              text={label}
              delay={0.11 + (i % 3) * 0.06}
              duration={0.4}
              className="text-[11px] md:text-[18px] leading-tight font-semibold whitespace-nowrap"
              style={{ fontFamily: MONO, ...LABEL_GRADIENT }}
            />
            {/* Mini-row of likes / comments / shares (Impressions tile only) —
                pinned to the bottom, kept on a single line on every screen. */}
            {details && (
              <div className="absolute inset-x-0 bottom-3.5 md:bottom-4 flex items-center justify-center gap-2 md:gap-3.5 whitespace-nowrap">
                {details.map((d) => (
                  <span key={d.icon} className="inline-flex items-center gap-1 md:gap-1.5 text-white/65">
                    <span className="inline-flex items-center justify-center text-white/55 [&>svg]:w-3 [&>svg]:h-3 md:[&>svg]:w-[17px] md:[&>svg]:h-[17px]">{ICONS[d.icon]}</span>
                    <span className="font-semibold leading-none text-[11px] md:text-[15px]" style={{ fontFamily: FONT }}>{d.value}</span>
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

// Public-facing hero of the influence card: avatar + name + headline pills +
// bio + actions, then the 3×3 metric grid.
export default function ProfileHero() {
  const { CREATOR } = useInfluence()
  // Try each avatar source in turn: backend proxy → raw Instagram CDN URL →
  // (finally) the name initial. The proxy is most reliable once deployed; the
  // raw URL covers the gap before that (Instagram often serves it with
  // referrerPolicy=no-referrer). On each load error we advance to the next.
  const avatarSources = [CREATOR.avatar, CREATOR.avatarRaw].filter(Boolean)
  const [srcIdx, setSrcIdx] = useState(0)
  const avatarSrc = avatarSources[srcIdx]
  // Creasume Score for the badge under the action buttons.
  const score = CREATOR.tiles.find((t) => t.label === 'Creasume Score')?.value ?? '87'
  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
      {/* Creasume wordmark — top-left corner. Clicking it returns to the
          home / waitlist page. */}
      <button
        type="button"
        onClick={() => goToPath('/')}
        aria-label="Go to Creasume home"
        className="absolute top-6 left-6 md:top-4 md:left-4 z-20 cursor-pointer"
      >
        <img
          src="/creasumelogo.png"
          alt="Creasume"
          className="h-7 md:h-9 w-auto select-none"
        />
      </button>

      {/* Soft colored ellipse around the hero + stats — fades on all sides */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          top: '-50px',
          bottom: '-160px',
          left: '-11%',
          right: '-11%',
          background: 'radial-gradient(78% 66% at 50% 44%, rgba(26,33,92,0.38) 0%, rgba(26,33,92,0.38) 58%, rgba(37,49,133,0) 84%)',
          zIndex: 0,
        }}
      />

      {/* Decorative diagonal light streak */}
      <img
        src="/line.png"
        alt=""
        aria-hidden="true"
        className="absolute right-0 bottom-0 translate-x-1/4 translate-y-[33%] -rotate-[10deg] pointer-events-none select-none w-[1300px] max-w-none opacity-40 z-0"
        style={{ mixBlendMode: 'screen' }}
      />

      <div className="relative z-10 max-w-[1080px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10 mb-10 md:mb-14 lg:-ml-16">
          {/* Avatar */}
          <motion.div
            className="shrink-0 mx-auto lg:mx-0 lg:-mt-12"
            custom={0}
            variants={textFade}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <div
              className="rounded-full relative"
              style={{ width: 140, height: 140, padding: 3, background: 'linear-gradient(135deg, #8B5CF6 0%, #C04DCC 50%, #EC4899 100%)' }}
            >
              <div
                className="w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #2a2f6b 0%, #16183c 100%)' }}
              >
                {avatarSrc ? (
                  <img
                    key={avatarSrc}
                    src={avatarSrc}
                    alt={CREATOR.name}
                    className="w-full h-full object-cover"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={() => setSrcIdx((i) => i + 1)}
                  />
                ) : (
                  <span className="text-white font-bold select-none" style={{ fontFamily: FONT, fontSize: 54, lineHeight: 1 }}>
                    {CREATOR.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Verified seal — scalloped blue badge with a white check,
                  bottom-right of the avatar (admin-managed). */}
              {CREATOR.verified && (
                <span
                  className="absolute bottom-0.5 right-0.5 flex items-center justify-center"
                  style={{ width: 38, height: 38, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))' }}
                  title="Verified"
                >
                  <svg width="38" height="38" viewBox="0 0 24 24">
                    <path d={SEAL_PATH} fill="#1D9BF0" stroke="#0b0b1e" strokeWidth="1.2" style={{ paintOrder: 'stroke' }} />
                    <path d="M7.3 12.1 10.4 15.2 16.8 8.4" fill="none" stroke="#fff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
          </motion.div>

          {/* Name + pills + bio + actions */}
          <div className="flex-1 min-w-0 text-center lg:text-left">
            <motion.div
              custom={0}
              variants={textFade}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="flex flex-col items-center lg:flex-row lg:items-center justify-center lg:justify-start gap-2 lg:gap-3 mb-2.5"
            >
              <h1 className="font-bold leading-none" style={{ fontFamily: FONT, fontSize: 'clamp(32px, 5vw, 52px)' }}>
                {CREATOR.username}
              </h1>
              {/* Founding Creator badge — gold-metal pill: glossy gold ring border
                  around a dark interior, with a warm gold glow. */}
              {CREATOR.isFoundingCreator && (
                <span
                  className="inline-flex items-center justify-center rounded-full text-xs md:text-sm font-bold whitespace-nowrap order-first self-center lg:order-none lg:self-auto"
                  style={{
                    fontFamily: FONT,
                    color: '#F6E3A8',
                    padding: '7px 24px',
                    background:
                      'linear-gradient(180deg, #2a1d07 0%, #150e03 100%) padding-box, ' +
                      'linear-gradient(160deg, #FBE7A0 0%, #D8A93C 46%, #9A701F 100%) border-box',
                    border: '3px solid transparent',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                    letterSpacing: '0.02em',
                  }}
                  title="Founding Creator"
                >
                  Founding Creator
                </span>
              )}
            </motion.div>
            <motion.p
              custom={1}
              variants={textFade}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="text-white text-sm md:text-base mb-8 md:mb-10"
              style={{ fontFamily: FONT, fontWeight: 300 }}
            >
              {CREATOR.tagline}
            </motion.p>

            {/* Headline stat pills — flip in on a horizontal axis. Two per row
                (2×2) on small screens; a single flex row on large screens. */}
            <motion.div
              className="grid grid-cols-2 w-full max-w-[460px] mx-auto justify-items-center gap-2.5 mb-9 md:mb-11 lg:flex lg:w-auto lg:max-w-none lg:mx-0 lg:flex-wrap lg:justify-start"
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              style={{ perspective: 800 }}
            >
              {CREATOR.pills.map(({ value, label, color, labelColor }, i) => (
                <motion.span
                  key={label}
                  custom={i}
                  variants={flipIn}
                  className="inline-flex items-baseline gap-1.5 md:gap-2.5 rounded-full px-3 py-2.5 md:px-6 md:py-3 whitespace-nowrap max-w-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', transformOrigin: 'center', backfaceVisibility: 'hidden' }}
                >
                  <span className="font-bold text-lg md:text-2xl" style={{ color }}>{value}</span>
                  <span className="text-xs md:text-lg" style={{ color: labelColor || 'rgba(255,255,255,0.45)' }}>{label}</span>
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              custom={3}
              variants={textFade}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="text-white/90 text-lg mb-10 md:mb-12 leading-snug"
              style={{ fontWeight: 300, whiteSpace: 'pre-line' }}
            >
              {CREATOR.bio}
            </motion.p>

            {/* Action buttons — same flip-in as the pills */}
            <motion.div
              className="flex flex-nowrap justify-center lg:justify-start gap-2 md:gap-3 mb-10 md:mb-12"
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              style={{ perspective: 800 }}
            >
              <motion.a
                custom={4}
                variants={flipIn}
                href="#work-with-me"
                className="no-underline inline-flex items-center whitespace-nowrap gap-2.5 rounded-full bg-white text-[#11132f] font-bold text-sm md:text-base px-4 md:px-7 py-3 md:py-3.5 transition-transform hover:scale-[1.03]"
                style={{ fontFamily: FONT, fontWeight: 700, transformOrigin: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
                </svg>
                Book a Collab
              </motion.a>
              <motion.button
                custom={5}
                variants={flipIn}
                type="button"
                className="inline-flex items-center whitespace-nowrap gap-2.5 rounded-full text-white font-semibold text-sm md:text-base px-4 md:px-7 py-3 md:py-3.5 transition-colors hover:bg-white/5"
                style={{ fontFamily: FONT, border: '1px solid rgba(255,255,255,0.18)', transformOrigin: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v12" /><path d="m7 11 5 5 5-5" /><path d="M5 21h14" />
                </svg>
                Download PDF
              </motion.button>
            </motion.div>

            {/* Creasume Score badge — MOBILE ONLY (on desktop the score is a tile
                in the grid). Dark card: score in a glass circle, gradient label. */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
              className="md:hidden relative inline-flex items-center gap-4 rounded-2xl px-6 py-4 pr-14"
              style={{ backgroundColor: '#10133C', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img src="/creasume-c.png" alt="" aria-hidden="true" className="absolute top-3 right-3 h-6 w-6 object-contain select-none" />
              <span
                className="grid place-items-center rounded-full font-bold shrink-0 text-white"
                style={{
                  width: 48,
                  height: 48,
                  background: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
                  fontFamily: FONT,
                  fontSize: 20,
                }}
              >
                {score}
              </span>
              <span className="font-semibold leading-none text-xl md:text-2xl whitespace-nowrap" style={{ fontFamily: FONT, ...LABEL_GRADIENT }}>
                Creasume Score
              </span>
            </motion.div>
          </div>
        </div>

        {/* Metric grid — deck-deal animation. Desktop includes the Creasume
            Score tile; mobile drops it (shown as the badge above instead). */}
        <div className="hidden md:block">
          <StatsGrid includeScore />
        </div>
        <div className="md:hidden">
          <StatsGrid />
        </div>
      </div>
    </section>
  )
}
