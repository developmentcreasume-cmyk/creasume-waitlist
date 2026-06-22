import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent } from '../../motion-variants.js'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'

// Smooth-scroll the page to an absolute Y over `duration` ms. Lenis owns the
// scroll (and its CSS disables native smooth scroll), and its scrollTo({duration})
// wasn't animating here — so we run our own rAF easing and push each frame to
// Lenis with `immediate` (the same approach the paper-plane flight uses).
function smoothScrollTo(y, duration = 900) {
  if (typeof window === 'undefined') return
  const lenis = window.__lenis
  const startY = lenis ? lenis.scroll : window.scrollY
  const target = Math.max(0, y)
  const dist = target - startY
  if (Math.abs(dist) < 1) return
  // easeInOutCubic — gentle start AND finish, so the scroll glides instead of
  // jolting (easeOut starts at full speed, which reads as a jump).
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const t0 = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - t0) / duration)
    const next = startY + dist * ease(p)
    if (lenis) lenis.scrollTo(next, { immediate: true })
    else window.scrollTo(0, next)
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// Mobile peek-carousel sizing: each slide is narrower than the screen so the
// neighbouring cards peek in on both sides.
const CAROUSEL_CARD = 248
const CAROUSEL_GAP = 12

// One package card — reused by the desktop row and the mobile carousel.
function PackageCard({ p, i, isPopular, showCta }) {
  return (
    <div
      id={i === 0 ? 'pkg-starter' : undefined}
      className={`relative rounded-[22px] p-7 md:p-8 flex flex-col ${isPopular ? 'md:-mt-6' : ''}`}
      style={{
        width: 336,
        height: isPopular ? 400.64 : 377.56,
        maxWidth: '100%',
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.75)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {isPopular && (
        <span
          className="absolute -top-3 left-[72%] -translate-x-1/2 text-sm md:text-base font-semibold text-white px-2 py-0.5 rounded-full whitespace-nowrap"
          style={{ background: '#0918E5', fontFamily: FONT }}
        >
          Most Popular
        </span>
      )}
      <div className="text-sm tracking-widest mb-3" style={{ fontFamily: MONO, color: '#8F97FF' }}>{p.tier}</div>
      <div className="text-white font-semibold leading-none mb-1" style={{ fontFamily: FONT, fontSize: 40 }}>{p.price}</div>
      <div className="text-sm mb-6" style={{ fontFamily: MONO, color: '#8F97FF' }}>{p.sub}</div>
      <ul className="flex flex-col gap-2.5 mb-6">
        {p.features.map((f) => (
          <li key={f} className="text-white text-base">{f}</li>
        ))}
      </ul>
      {showCta && (
        <a
          id={isPopular ? 'pkg-book-now' : undefined}
          href="#work-with-me"
          className="no-underline mt-auto w-full rounded-full font-semibold text-sm py-3.5 text-center text-white"
          style={{ fontFamily: FONT, background: '#0918E5' }}
        >
          Book Now
        </a>
      )}
    </div>
  )
}

export default function Packages() {
  const { PACKAGES } = useInfluence()
  // Mobile carousel: start on the "Most Popular" package (front/center).
  const popularIndex = Math.max(0, PACKAGES.findIndex((p) => p.popular))
  const [active, setActive] = useState(popularIndex)
  const n = PACKAGES.length
  // The parked plane is hidden while the click flight runs.
  const [flying, setFlying] = useState(false)
  // Mobile-only left→right fly-across, rendered in a fixed portal so it can't
  // shift the page layout. `flyTop`/`flyLeft` pin it to the parked plane's exact
  // screen position at launch so the flight starts where the plane already is.
  const [flyMobile, setFlyMobile] = useState(false)
  const [flyTop, setFlyTop] = useState(0)
  const [flyLeft, setFlyLeft] = useState(0)
  // 'right' = fly L→R from the parked plane; 'left' = fly R→L across Work With Me.
  const [flyPhase, setFlyPhase] = useState('right')

  // Fire the paper-plane flight (handled by PaperPlaneFlight, which traces a
  // smooth S from here, through the Starter card, to the Send Inquiry button,
  // and scrolls the page along with it).
  const launch = (e) => {
    e.preventDefault()
    setFlying(true)
    // Desktop runs the S-curve flight (PaperPlaneFlight). Only mobile runs the
    // fixed fly-across sequence — running both would make their scrolls fight.
    if (window.innerWidth < 768) {
      const r = document.getElementById('cta-plane-mobile')?.getBoundingClientRect()
      if (r) {
        setFlyTop(r.top + r.height / 2)
        setFlyLeft(r.left + r.width / 2)
      }
      setFlyPhase('right')
      setFlyMobile(true)
    }
    window.dispatchEvent(new Event('plane-launch'))
    setTimeout(() => setFlying(false), 10400)
  }

  // Phase 1 done (plane left the right edge): scroll so the gap above Work With
  // Me sits in the upper-middle of the screen, let it settle, then launch phase 2
  // (a plane in from the right, crossing that visible gap).
  const onFlyRightDone = () => {
    const wwm = document.getElementById('work-with-me')
    if (wwm) {
      // Leave the gap above Work With Me visible in the upper-middle of the view.
      const y = wwm.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5
      smoothScrollTo(y, 850)
    }
    setTimeout(() => {
      // Cross at a row that's always on-screen (the gap region the plane enters).
      setFlyTop(window.innerHeight * 0.53)
      setFlyPhase('left')
    }, 880)
  }

  // Phase 2 done (plane left the left edge): scroll down a bit more to reveal the
  // Send Inquiry button, settle, then launch phase 3 (a plane in from the left
  // that lands on the button's arrow).
  const onFlyLeftDone = () => {
    const btn = document.querySelector('#work-with-me button[type="submit"]')
    if (btn) {
      const y = btn.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.55
      smoothScrollTo(y, 850)
    }
    setTimeout(() => {
      const arrow = document.querySelector('#work-with-me button[type="submit"] svg')
      const r = (arrow || btn)?.getBoundingClientRect()
      if (r) {
        setFlyTop(r.top + r.height / 2)
        setFlyLeft(r.left + r.width / 2)
      }
      setFlyPhase('land')
    }, 880)
  }

  // Phase 3 done (plane reached the arrow): swap the button's arrow for the plane
  // image (WorkWithMe listens for 'plane-landed'), pulse, and end the sequence.
  const onFlyLandDone = () => {
    window.dispatchEvent(new Event('plane-landed'))
    const btn = document.querySelector('#work-with-me button[type="submit"]')
    if (btn) {
      btn.classList.add('plane-arrive-pulse')
      setTimeout(() => btn.classList.remove('plane-arrive-pulse'), 1300)
    }
    setFlyMobile(false)
    setFlyPhase('right')
  }

  // Viewport width for the fly-across travel distances.
  const FLY_W = typeof window !== 'undefined' ? window.innerWidth : 400

  // Per-phase motion config for the mobile fly plane (positions are captured at
  // each phase transition into flyTop/flyLeft).
  const flyConf = {
    right: {
      left: flyLeft,
      scaleX: 1,
      initial: { x: 0, opacity: 1 },
      animate: { x: FLY_W - flyLeft + 80, opacity: [1, 1, 0] },
      transition: { duration: 1.35, ease: 'easeIn', times: [0, 0.85, 1] },
      onDone: onFlyRightDone,
    },
    left: {
      left: 0,
      scaleX: -1,
      initial: { x: FLY_W + 80, opacity: 0 },
      animate: { x: -100, opacity: [0, 1, 1, 0] },
      transition: { duration: 1.45, ease: 'linear', times: [0, 0.12, 0.85, 1] },
      onDone: onFlyLeftDone,
    },
    land: {
      left: flyLeft,
      scaleX: 1,
      // Shrink from full size (56px) toward the button arrow's plane (~26px) so
      // the hand-off to the static button image is seamless, not an instant jump.
      initial: { x: -(flyLeft + 100), opacity: 0, scale: 1 },
      animate: { x: 0, opacity: [0, 1, 1], scale: [1, 1, 0.46] },
      transition: { duration: 1.25, ease: 'easeOut', times: [0, 0.15, 1] },
      onDone: onFlyLandDone,
    },
  }[flyPhase]

  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-32 md:pt-52 pb-12 md:pb-20 overflow-x-clip">
      {/* Decorative diagonal sheen */}
      <img
        src="/image/2nd%20line.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ right: '1%', top: '-8%', width: 900, height: 'auto', opacity: 0.8, zIndex: 0 }}
      />

      {/* Parked plane — static decoration. Takes off when the CTA is clicked.
          Hidden on mobile (too large; the flight is a desktop interaction). */}
      <img
        id="parked-plane"
        src="/PLANE.png"
        alt=""
        draggable={false}
        className="hidden md:block"
        style={{ position: 'absolute', left: 180, top: 60, width: 500, height: 500, objectFit: 'contain', opacity: flying ? 0 : 0.9, transform: 'rotate(8deg)', pointerEvents: 'none', filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.5))', zIndex: -1 }}
      />
      {/* Paper-plane CTA banner — shifted right only on desktop, centered on mobile */}
      <div id="cta-banner" className="max-w-[1180px] mx-auto text-center mb-20 md:mb-28 lg:translate-x-[230px] lg:-translate-y-[60px]">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-2xl md:text-3xl lg:text-4xl font-light mb-6"
          style={{ fontFamily: FONT }}
        >
          Open to new Collaborations in 2026.
        </motion.p>
        {/* CTA button with a small plane tucked at its top-left — mobile only
            (desktop keeps the large parked plane). */}
        <div className="relative inline-block">
          {/* Mobile only: parked decoration. Hidden while the fly-across runs.
              Desktop hides this and uses parked-plane. */}
          <img
            id="cta-plane-mobile"
            src="/PLANE.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="md:hidden absolute -top-10 -left-3 w-14 h-14 object-contain select-none pointer-events-none z-10 transition-opacity duration-300"
            style={{ transform: 'rotate(42deg)', opacity: flyMobile ? 0 : 1, filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))' }}
          />
          <motion.button
            id="cta-button"
            type="button"
            onClick={launch}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-2xl px-10 py-3 font-bold tracking-wide leading-none"
            style={{ fontFamily: FONT, fontSize: 18, color: '#15172b', background: 'linear-gradient(180deg, #5D65DC 0%, #5D65DC 32%, #9CA2E1 100%)', boxShadow: '0 12px 30px rgba(93,101,220,0.4)' }}
          >
            LET&apos;S WORK TOGETHER
          </motion.button>
        </div>
      </div>

      {/* Mobile fly-across: fixed + portaled to <body> so it can never shift the
          page layout or scroll.
          Phase 'right': starts where the parked plane sits, exits the right edge.
          Phase 'left':  enters from the right edge, crosses Work With Me to the
                         left. The `key` remounts the img so each phase animates
                         from its own initial state. */}
      {flyMobile &&
        createPortal(
          <motion.img
            key={flyPhase}
            src="/PLANE.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="md:hidden fixed w-14 h-14 object-contain select-none pointer-events-none"
            style={{
              top: flyTop,
              left: flyConf.left,
              marginTop: -28,
              marginLeft: -28,
              // Level the plane; mirror (scaleX) for the leftward pass so it points
              // left without flipping upside-down like a 180° turn.
              rotate: 42,
              scaleX: flyConf.scaleX,
              zIndex: 9999,
              filter: 'drop-shadow(0 8px 18px rgba(0,0,0,0.5))',
            }}
            initial={flyConf.initial}
            animate={flyConf.animate}
            transition={flyConf.transition}
            onAnimationComplete={flyConf.onDone}
          />,
          document.body,
        )}

      <div className="max-w-[1180px] mx-auto text-center mb-12 md:mb-16">
        <h2 className="text-5xl md:text-6xl font-medium mb-3" style={{ fontFamily: FONT }}>Collaboration Packages</h2>
        <p className="text-white/45 text-sm" style={{ fontFamily: MONO }}>Standard services. Exact quotes provided after alignment.</p>
      </div>

      {/* Desktop: a centered row. The popular card is lifted and has the CTA. */}
      <motion.div
        className="hidden md:flex max-w-[1180px] mx-auto md:flex-row md:flex-wrap justify-center items-start gap-5"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        {PACKAGES.map((p, i) => {
          const isPopular = p.popular && n > 1
          const showCta = isPopular || n === 1
          return (
            <motion.div key={p.tier} variants={fadeUp}>
              <PackageCard p={p} i={i} isPopular={isPopular} showCta={showCta} />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Mobile: a peek carousel — the active package is centered with a sliver
          of the prev/next cards showing. Swipe (or tap a dot) to slide. */}
      <div className="md:hidden relative">
        <div className="overflow-hidden pt-4">
          <motion.div
            className="flex"
            style={{ gap: CAROUSEL_GAP, paddingLeft: `calc(50% - ${CAROUSEL_CARD / 2}px)`, paddingRight: `calc(50% - ${CAROUSEL_CARD / 2}px)` }}
            animate={{ x: -active * (CAROUSEL_CARD + CAROUSEL_GAP) }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            drag={n > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(e, info) => {
              const threshold = 50
              if (info.offset.x < -threshold) setActive((a) => (a + 1) % n)
              else if (info.offset.x > threshold) setActive((a) => (a - 1 + n) % n)
            }}
          >
            {PACKAGES.map((p, i) => {
              const isPopular = p.popular && n > 1
              const showCta = isPopular || n === 1
              return (
                <div
                  key={p.tier}
                  className="shrink-0 flex justify-center transition-all duration-300 origin-center"
                  style={{
                    width: CAROUSEL_CARD,
                    minHeight: 430,
                    opacity: i === active ? 1 : 0.45,
                    transform: i === active ? 'scale(1)' : 'translateY(24px) scale(0.84)',
                  }}
                >
                  <PackageCard p={p} i={i} isPopular={isPopular} showCta={showCta} />
                </div>
              )
            })}
          </motion.div>
        </div>

        {n > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {PACKAGES.map((p, i) => (
              <button
                key={p.tier}
                type="button"
                aria-label={`Go to ${p.tier}`}
                onClick={() => setActive(i)}
                className="rounded-full transition-all duration-300"
                style={{ width: i === active ? 26 : 8, height: 8, background: i === active ? '#0918E5' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
