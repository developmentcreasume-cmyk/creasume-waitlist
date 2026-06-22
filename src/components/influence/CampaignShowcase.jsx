import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FONT, MONO } from './influenceData.js'

// ---- Editable card content. Showing the first 6. ----
// `metric` is the headline reach shown on the carousel card. The remaining
// fields (date, overview, stats, audience, deliverables) drive the detail modal.
const DATA = [
  {
    brand: 'Spotify', subtitle: 'Wrapped promotion campaign', metric: '3.1M', category: 'TECH',
    date: 'Dec 2023',
    overview: 'Partnered with Spotify to launch their year-end Wrapped campaign. Created a personality-driven Reel unpacking listening stats, followed by a carousel breaking down the data story.',
    reach: '3.1M', engagement: '410K', engRate: '13.2%',
    audience: '58% Female, 18–29 years old. Top cities: London, Berlin, Toronto.',
    deliverables: ['Reel', 'Carousel', '4 Stories'],
  },
  {
    brand: 'Nike', subtitle: 'Run club launch series', metric: '2.4M', category: 'SPORT',
    date: 'Oct 2023',
    overview: "Partnered with Nike to launch their new React Infinity Run shoes. Created a high-energy Reel showcasing the shoe's durability through a 10K run, followed by a 3-part Story series breaking down the technology.",
    reach: '2.4M', engagement: '350K', engRate: '14.5%',
    audience: '65% Female, 18–34 years old. Top cities: New York, London, Los Angeles.',
    deliverables: ['Reel', '3 Stories'],
  },
  {
    brand: 'Glossier', subtitle: 'Skin-first product drop', metric: '1.8M', category: 'BEAUTY',
    date: 'Aug 2023',
    overview: 'Collaborated with Glossier on a skin-first product drop. Produced an honest get-ready-with-me Reel and a tutorial carousel highlighting the dewy, low-effort routine.',
    reach: '1.8M', engagement: '290K', engRate: '16.1%',
    audience: '72% Female, 18–27 years old. Top cities: New York, Los Angeles, Miami.',
    deliverables: ['Reel', 'Tutorial', '3 Stories'],
  },
  {
    brand: 'Airbnb', subtitle: 'City weekender feature', metric: '2.0M', category: 'TRAVEL',
    date: 'Jun 2023',
    overview: 'Teamed up with Airbnb for a city-weekender feature. Filmed a cinematic travel Reel across three stays and a Story series with bookable links to each property.',
    reach: '2.0M', engagement: '260K', engRate: '13.0%',
    audience: '54% Female, 25–40 years old. Top cities: Paris, Lisbon, Barcelona.',
    deliverables: ['Reel', '5 Stories'],
  },
  {
    brand: 'Notion', subtitle: 'Creator workflow showcase', metric: '1.2M', category: 'TECH',
    date: 'Apr 2023',
    overview: 'Worked with Notion to showcase a creator workflow. Built a screen-recorded Reel walking through a content-planning template, paired with a post breaking down the setup.',
    reach: '1.2M', engagement: '180K', engRate: '15.0%',
    audience: '49% Female, 22–35 years old. Top cities: San Francisco, London, Bangalore.',
    deliverables: ['Reel', 'Post', '2 Stories'],
  },
  {
    brand: 'Chipotle', subtitle: 'Limited menu teaser', metric: '3.6M', category: 'FOOD',
    date: 'Feb 2023',
    overview: 'Partnered with Chipotle to tease a limited menu item. Created a fast-cut taste-test Reel and a post with a promo code that drove in-app orders during launch week.',
    reach: '3.6M', engagement: '520K', engRate: '14.4%',
    audience: '51% Male, 18–30 years old. Top cities: Austin, Chicago, Denver.',
    deliverables: ['Reel', 'Post', '3 Stories'],
  },
].slice(0, 6)

const CARD_W = 380

// Frosted-glass surface shared by the card and the modal: a faint neutral
// border ring on the outside, a translucent blurred panel inside.
const GLASS_RING = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 100%)',
}
const GLASS_PANEL = {
  // Genuinely see-through frosted glass: a very faint white film over a blurred,
  // slightly saturated backdrop, so the card takes on whatever is behind it.
  background: 'linear-gradient(150deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)',
  backdropFilter: 'blur(16px) saturate(150%)',
  WebkitBackdropFilter: 'blur(16px) saturate(150%)',
}

// One campaign-highlight glass card — now shows the full campaign layout
// (overview, stats, audience, deliverables, CTA), the same content as the modal.
// The cards live inside a CSS-transform marquee, where the browser's native
// `click` event fires unreliably (the element shifts between pointerdown and
// pointerup). We detect a tap manually: a pointerup close to where pointerdown
// landed counts as a click, so it works whether the row is moving or paused.
function CampaignCard({ data, onClick, sizeW = CARD_W }) {
  const down = useRef({ x: 0, y: 0 })
  const handleDown = (e) => { down.current = { x: e.clientX, y: e.clientY } }
  const handleUp = (e) => {
    if (!onClick) return
    const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y)
    if (moved < 8) onClick()
  }
  return (
    <div
      onPointerDown={onClick ? handleDown : undefined}
      onPointerUp={onClick ? handleUp : undefined}
      className={`shrink-0 rounded-[20px] p-px transition-transform duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ width: sizeW, ...GLASS_RING }}
    >
      <div className="rounded-[19px] p-6 flex flex-col h-full" style={GLASS_PANEL}>
        <CampaignHeader data={data} />
        <div className="mb-5" style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
        <CampaignBody data={data} ctaIcon={false} pinCta />
      </div>
    </div>
  )
}

// Brand name + date header, shared by the card and the modal.
function CampaignHeader({ data }) {
  return (
    <div className="mb-4">
      <div className="text-white leading-none" style={{ fontFamily: FONT, fontSize: 40, fontWeight: 500 }}>{data.brand}</div>
      <div className="text-white/45 mt-2" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 300 }}>{data.date}</div>
    </div>
  )
}

// Overview → stats → audience → deliverables → CTA. Shared by card and modal.
// `ctaIcon` shows the external-link glyph on the button (modal only).
// `pinCta` pushes the button to the card's bottom so all cards' buttons align.
function CampaignBody({ data, ctaIcon = true, pinCta = false, statColors = false }) {
  const stats = [
    { label: 'REACH', value: data.reach, color: '#FFFFFF' },
    { label: 'ENGAGEMENT', value: data.engagement, color: statColors ? '#4DE0B0' : '#FFFFFF' },
    { label: 'ENG. RATE', value: data.engRate, color: statColors ? '#A78BE8' : '#FFFFFF' },
  ]
  return (
    <>
      {/* Campaign overview */}
      <SectionLabel>CAMPAIGN OVERVIEW</SectionLabel>
      <p className="text-white/70 mb-6 leading-relaxed" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300 }}>{data.overview}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl px-3 py-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="tracking-[0.12em] mb-1.5" style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>{s.label}</div>
            <div className="leading-none" style={{ fontFamily: FONT, fontSize: 24, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Audience insights */}
      <SectionLabel>AUDIENCE INSIGHTS</SectionLabel>
      <div className="rounded-xl px-4 py-3.5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <p className="text-white/70 leading-relaxed" style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 300 }}>{data.audience}</p>
      </div>

      {/* Deliverables */}
      <SectionLabel>DELIVERABLES</SectionLabel>
      <div className="flex flex-wrap gap-2.5 mb-6">
        {data.deliverables.map((d) => (
          <span key={d} className="rounded-lg px-3.5 py-2" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)' }}>{d}</span>
        ))}
      </div>

      {/* CTA — mt-auto pins it to the card's bottom so every card's button lines
          up on the same row (cards stretch to equal height in the marquee). */}
      <button
        className={`w-full rounded-xl text-white inline-flex items-center justify-center gap-2 py-3 transition-transform hover:scale-[1.02] ${pinCta ? 'mt-auto' : ''}`}
        style={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, background: 'linear-gradient(90deg, rgba(139,92,246,0.85) 0%, rgba(124,92,255,0.85) 100%)' }}
      >
        {ctaIcon && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
          </svg>
        )}
        View Live Posts
      </button>
    </>
  )
}

// Small "— LABEL" section heading with the page's purple gradient.
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span style={{ width: 14, height: 1.5, background: '#A35CE1', display: 'inline-block' }} />
      <span
        className="tracking-[0.22em] font-semibold"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          background: 'linear-gradient(90deg, #A35CE1 0%, #C04DCC 50%, #E731A2 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        {children}
      </span>
    </div>
  )
}

// Expanded campaign detail shown when a card is tapped — same content, larger,
// centered, with a close button.
function CampaignDetail({ data, onClose }) {
  return (
    <div
      className="relative rounded-2xl p-6 flex flex-col"
      style={{
        width: 'min(460px, 92vw)',
        maxHeight: '88vh',
        overflowY: 'auto',
        background: '#0B0B14',
        border: '1px solid #3B82F6',
        boxShadow: '0 0 0 1px rgba(59,130,246,0.35), 0 24px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header: avatar + brand + date, circular close */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="shrink-0 rounded-lg flex items-center justify-center"
          style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#2a2f6b 0%,#16183c 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="text-white font-bold" style={{ fontFamily: FONT, fontSize: 22, lineHeight: 1 }}>{data.brand.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <div className="text-white font-bold leading-tight" style={{ fontFamily: FONT, fontSize: 22 }}>{data.brand}</div>
          <div className="text-white/45" style={{ fontFamily: MONO, fontSize: 12 }}>{data.date}</div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-auto shrink-0 flex items-center justify-center rounded-full text-white/55 hover:text-white hover:bg-white/10 transition-colors"
          style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.18)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="mb-5" style={{ height: 1, background: 'rgba(255,255,255,0.1)' }} />
      <CampaignBody data={data} statColors />
    </div>
  )
}

export default function CampaignShowcase() {
  const [openIdx, setOpenIdx] = useState(null)
  const scrollerRef = useRef(null)
  // Pause the auto-advance while interacting: hover on desktop, finger-down
  // (tap/hold) on mobile. A ref (not state) so the rAF loop reads it live
  // without re-rendering.
  const pausedRef = useRef(false)

  // Two copies of the cards so the row loops seamlessly.
  const loop = [...DATA, ...DATA]

  // Auto-advance the row by nudging scrollLeft each frame. The row is a real
  // horizontal scroll container, so on touch the user can swipe to slide it
  // manually; auto-scroll pauses while a finger is down. Cards are duplicated,
  // so we wrap back at the halfway point for a seamless loop.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    let last = performance.now()
    const SPEED = 70 // px per second
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!pausedRef.current) {
        el.scrollLeft += SPEED * dt
        const half = el.scrollWidth / 2
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  // When the row stops, snap to the nearest card boundary so it never rests
  // with a card sliced off at the edge. Cards are CARD_W wide with a 24px
  // (gap-6) gutter, so boundaries fall on multiples of that step.
  const pause = () => {
    pausedRef.current = true
    const el = scrollerRef.current
    if (!el) return
    const step = CARD_W + 24
    el.scrollTo({ left: Math.round(el.scrollLeft / step) * step, behavior: 'smooth' })
  }
  const resume = () => { pausedRef.current = false }

  return (
    <section className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: 'transparent' }}>
      <div
        ref={scrollerRef}
        className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
        // Pointer events unify mouse + touch: on desktop these are hover
        // enter/leave (pause while hovering); on touch they fire on finger
        // down/up (pause while dragging). Using only these avoids the synthetic
        // `mouseenter`-with-no-`mouseleave` that left the row stuck paused after
        // a tap on mobile.
        onPointerEnter={pause}
        onPointerLeave={resume}
        onPointerCancel={resume}
      >
        {loop.map((data, i) => (
          <CampaignCard key={i} data={data} onClick={() => setOpenIdx(i % DATA.length)} />
        ))}
      </div>

      {/* Tap-to-open detail of a single card. Rendered through a portal on
          <body> so it escapes this section's `z-10` stacking context — otherwise
          later page sections (paper plane, CTA) paint on top of the modal. */}
      {createPortal(
        <AnimatePresence>
          {openIdx !== null && (
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpenIdx(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <CampaignDetail data={DATA[openIdx]} onClose={() => setOpenIdx(null)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  )
}
