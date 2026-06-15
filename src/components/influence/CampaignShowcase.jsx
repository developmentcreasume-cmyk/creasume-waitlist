import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'

gsap.registerPlugin(MotionPathPlugin)

// ---- Editable card content. One entry per card (8 total). ----
const DATA = [
  { brand: 'Spotify', subtitle: 'Wrapped promotion campaign', metric: '3.1M', category: 'TECH' },
  { brand: 'Nike', subtitle: 'Run club launch series', metric: '2.4M', category: 'SPORT' },
  { brand: 'Glossier', subtitle: 'Skin-first product drop', metric: '1.8M', category: 'BEAUTY' },
  { brand: 'Airbnb', subtitle: 'City weekender feature', metric: '2.0M', category: 'TRAVEL' },
  { brand: 'Notion', subtitle: 'Creator workflow showcase', metric: '1.2M', category: 'TECH' },
  { brand: 'Chipotle', subtitle: 'Limited menu teaser', metric: '3.6M', category: 'FOOD' },
  { brand: 'Sephora', subtitle: 'Holiday GRWM edit', metric: '2.9M', category: 'BEAUTY' },
  { brand: 'Adobe', subtitle: 'Express templates push', metric: '1.5M', category: 'TECH' },
]

const N = DATA.length
const R = 380 // ring radius — tightened so the cards hug the center image
const PARK_DEG = [-90, -135, 180, 135, 90, 45, 0, -45]

// Uniform card size — all cards identical so the ring keeps a consistent shape
// as it spins (per-position sizes made the outline wobble while rotating).
const CARD_W = 270
const CARD_H = 270
const SIZES = Array.from({ length: N }, () => ({ w: CARD_W, h: CARD_H }))

const LINE_Y = -440 // the horizontal line sits above the center (clear of the image)
const LINE_SPACING = 70 // cards overlap slightly in the line
const lineX = (i) => -LINE_SPACING * (N - 1) / 2 + LINE_SPACING * i // centered line

// Build a motion path: start at the card's line position, bridge to the top of
// the circle, then sweep ANTI-CLOCKWISE (decreasing angle) to its park angle.
function uShapePath(fromX, fromY, parkDeg) {
  const startDeg = -90 // top of circle
  let endDeg = parkDeg
  while (endDeg > startDeg) endDeg -= 360 // force anti-clockwise

  const pts = [{ x: fromX, y: fromY }]
  pts.push({ x: R * Math.cos(startDeg * Math.PI / 180), y: R * Math.sin(startDeg * Math.PI / 180) })

  const steps = Math.max(2, Math.round(Math.abs(endDeg - startDeg) / 12))
  for (let s = 1; s <= steps; s++) {
    const deg = startDeg + (s / steps) * (endDeg - startDeg)
    const rad = deg * Math.PI / 180
    pts.push({ x: R * Math.cos(rad), y: R * Math.sin(rad) })
  }
  return pts
}

// One campaign-highlight card. `hovered` brightens the border + adds a glow.
function CampaignCard({ data, hovered = false }) {
  return (
    <div
      className="w-full h-full rounded-2xl p-6 flex flex-col transition-transform duration-300"
      style={{
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
        // Dark glass fill with a plain, flat border (no glow). Hover brightens
        // the border slightly but still no outer shadow.
        background: hovered
          ? 'linear-gradient(150deg, rgba(22,23,38,0.95) 0%, rgba(12,13,24,0.92) 100%)'
          : 'linear-gradient(150deg, rgba(16,17,28,0.92) 0%, rgba(9,10,18,0.9) 100%)',
        border: hovered ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: 'none',
      }}
    >
      <div className="text-white font-bold leading-none mb-3" style={{ fontFamily: FONT, fontSize: 32 }}>{data.brand}</div>
      <div className="text-white/60 leading-snug mb-4" style={{ fontFamily: MONO, fontSize: 14 }}>{data.subtitle}</div>
      <div className="flex gap-2.5 mb-auto">
        {['REEL', 'POST'].map((t) => (
          <span key={t} className="tracking-[0.22em] px-3 py-1.5 rounded-md" style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.18)' }}>{t}</span>
        ))}
      </div>
      <div className="text-white font-bold leading-none mb-1.5" style={{ fontFamily: FONT, fontSize: 42 }}>{data.metric}</div>
      <div
        className="tracking-[0.22em] font-semibold"
        style={{
          display: 'inline-block',
          width: 'fit-content',
          fontFamily: MONO,
          fontSize: 14,
          background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        {data.category}
      </div>
    </div>
  )
}

export default function CampaignShowcase() {
  const { PHOTOS } = useInfluence()
  const stageRef = useRef(null)
  const tlRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)
  const [openIdx, setOpenIdx] = useState(null)

  useEffect(() => {
    let tl
    const ctx = gsap.context(() => {
      tl = gsap.timeline({ paused: true })
      tlRef.current = tl

      // Initial states.
      // Cards start off-screen to the RIGHT, on the line's height, ready to slide in.
      tl.set('#centerImg', { x: 650, y: 0, opacity: 0, scale: 0.8 }, 0)
      tl.set('#ring', { rotation: 0 }, 0)
      tl.set('.card', { x: 850, y: LINE_Y, opacity: 0, rotation: 0, scale: 0.85 }, 0)

      // STEP 1 — center image enters from the RIGHT.
      tl.to('#centerImg', { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }, 0)

      // STEP 2 — cards slide in from the RIGHT, filling the line right-to-left.
      for (let i = N - 1; i >= 0; i--) {
        const order = (N - 1) - i
        tl.to(`#c${i}`, {
          x: lineX(i), y: LINE_Y, opacity: 1, scale: 1,
          duration: 0.5, ease: 'power3.out',
        }, 0.5 + order * 0.1)
      }

      // STEP 3 — curve the line ANTI-CLOCKWISE into the ring (down the left,
      // across the bottom, up the right) once the line has settled.
      const settleAt = 0.5 + (N - 1) * 0.1 + 0.5 + 0.4
      tl.addLabel('curve', settleAt)
      DATA.forEach((_, i) => {
        const path = uShapePath(lineX(i), LINE_Y, PARK_DEG[i])
        const dur = 0.6 + path.length * 0.045
        tl.to(`#c${i}`, {
          motionPath: { path, curviness: 1.3, autoRotate: false },
          rotation: PARK_DEG[i] + 90, // face outward (radial arrangement)
          duration: dur,
          ease: 'power1.inOut',
        }, `curve+=${i * 0.08}`)
      })

      // STEP 4 — spin the whole ring as one rigid unit (one turn / 16s, forever).
      // Cards keep facing outward (radial) as the flower rotates.
      tl.to('#ring', { rotation: '-=360', transformOrigin: '50% 50%', duration: 16, ease: 'none', repeat: -1 })
    }, stageRef)

    // Only play once the section scrolls into view (not on mount), then once.
    const el = stageRef.current
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            tl && tl.play()
            io.disconnect()
          }
        })
      },
      { threshold: 0.35 },
    )
    if (el) io.observe(el)

    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [])

  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-8 md:pt-10 pb-32 md:pb-48 overflow-hidden" style={{ background: '#06060F' }}>
      {/* Animation stage — full-width flex centers the oversized stage on the
          viewport (mx-auto would pin it left and overflow right). */}
      <div className="hidden md:flex justify-center">
        <div ref={stageRef} className="relative" style={{ width: 1340, height: 1340 }}>
          {/* Center image */}
          <img
            id="centerImg"
            src={PHOTOS[0]}
            alt="Creator"
            className="absolute object-cover"
            style={{
              left: '50%', top: '50%', width: 294.26, height: 262.54, marginLeft: -147.13, marginTop: -131.27,
              borderRadius: 18, border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 10,
            }}
          />

          {/* 8 cards — wrapped in a ring group so they can spin around the
              center together (the center image is a sibling, so it stays still). */}
          <div id="ring" className="absolute" style={{ left: '50%', top: '50%', width: 0, height: 0 }}>
            {DATA.map((data, i) => (
              <div
                key={i}
                id={`c${i}`}
                className="card absolute cursor-pointer"
                style={{ left: 0, top: 0, width: SIZES[i].w, height: SIZES[i].h, marginLeft: -SIZES[i].w / 2, marginTop: -SIZES[i].h / 2 }}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                onClick={() => setOpenIdx(i)}
              >
                <CampaignCard data={data} hovered={hoverIdx === i} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile fallback grid */}
      <div className="max-w-[1180px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5 md:hidden place-items-center">
        {DATA.slice(0, 4).map((data, i) => (
          <div key={i} className="cursor-pointer" onClick={() => setOpenIdx(i)} style={{ width: SIZES[i].w, height: SIZES[i].h }}>
            <CampaignCard data={data} />
          </div>
        ))}
      </div>

      {/* Click-to-open detail popover */}
      {openIdx !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setOpenIdx(null)}
        >
          <div style={{ width: 360, height: 360, maxWidth: '100%' }} onClick={(e) => e.stopPropagation()}>
            <CampaignCard data={DATA[openIdx]} hovered />
          </div>
        </div>
      )}
    </section>
  )
}
