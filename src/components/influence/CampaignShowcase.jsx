import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'

const CARD_W = 380

// Frosted-glass surface shared by the card and the modal: a faint neutral
// border ring on the outside, a translucent blurred panel inside.
const GLASS_RING = {
  background: 'linear-gradient(135deg, rgba(150,165,255,0.22) 0%, rgba(40,46,112,0.06) 100%)',
}
const GLASS_PANEL = {
  // Frosted glass with a light dark-blue tint — translucent so the card reads as
  // glass with a hint of navy, not a solid block.
  background: 'linear-gradient(150deg, rgba(48,56,130,0.20) 0%, rgba(16,19,60,0.13) 100%)',
  backdropFilter: 'blur(16px) saturate(140%)',
  WebkitBackdropFilter: 'blur(16px) saturate(140%)',
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
  // Outer card shows three stats (no eng. rate — that's in the detail modal).
  const stats = [
    { label: 'REACH', value: data.reach },
    { label: 'VIEWS', value: data.views ?? '0' },
    { label: 'IMPRESSIONS', value: data.engagement },
  ]
  return (
    <div
      onPointerDown={onClick ? handleDown : undefined}
      onPointerUp={onClick ? handleUp : undefined}
      // Press-and-hold on mobile should hold the card (pause the marquee), not
      // pop the browser's text-selection / copy menu — so block selection and
      // the iOS/Android long-press callout on the card and its contents.
      className={`shrink-0 rounded-[20px] p-px transition-transform duration-300 select-none [-webkit-touch-callout:none] ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      style={{ width: sizeW, WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none', ...GLASS_RING }}
    >
      <div className="rounded-[19px] p-7 flex flex-col h-full" style={{ ...GLASS_PANEL, minHeight: 415 }}>
        {/* Brand + date */}
        <div className="text-white leading-none" style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700 }}>{data.brand}</div>
        <div className="text-white/40 mt-2.5 uppercase tracking-[0.15em]" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 400 }}>{data.date}</div>

        {/* Stat boxes */}
        <div className="grid grid-cols-3 gap-2.5 mt-7">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl px-3 py-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="tracking-[0.12em] mb-2 uppercase" style={{ fontFamily: MONO, fontSize: 9, fontWeight: 400, color: 'rgba(255,255,255,0.42)', whiteSpace: 'nowrap' }}>{s.label}</div>
              <div className="leading-none" style={{ fontFamily: FONT, fontSize: 23, fontWeight: 700, color: '#fff' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Deliverable tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {data.deliverables.map((d) => (
            <span key={d} className="rounded-lg px-3 py-1.5" style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 300, color: 'rgba(255,255,255,0.82)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>{d}</span>
          ))}
        </div>

        {/* Tap hint — pinned to the bottom so every card's hint lines up */}
        <div
          className="text-center mt-auto pt-6"
          style={{
            fontFamily: FONT, fontSize: 13.5, fontWeight: 500,
            background: 'linear-gradient(90deg, #8B7CF6 0%, #A88BF0 100%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text',
            WebkitTextFillColor: 'transparent', color: 'transparent',
          }}
        >
          Tap to view full case study →
        </div>
      </div>
    </div>
  )
}

// Overview → stats → audience → deliverables → CTA. Shared by card and modal.
// `ctaIcon` shows the external-link glyph on the button (modal only).
// `pinCta` pushes the button to the card's bottom so all cards' buttons align.
function CampaignBody({ data, ctaIcon = true, pinCta = false, statColors = false }) {
  const stats = [
    { label: 'REACH', value: data.reach, color: '#FFFFFF' },
    { label: 'IMPRESSIONS', value: data.engagement, color: '#FFFFFF' },
    { label: 'VIEWS', value: data.views ?? '0', color: '#FFFFFF' },
    { label: 'ENG. RATE', value: data.engRate, color: statColors ? '#A78BE8' : '#FFFFFF' },
  ]
  // If the thumbnail fails to load (expired CDN URL), fall back to the audience
  // line instead of an empty black box.
  const [imgError, setImgError] = useState(false)
  useEffect(() => { setImgError(false) }, [data.thumbnail])
  const showThumb = data.thumbnail && !imgError
  return (
    <>
      {/* Campaign overview (manual, from admin) */}
      {data.overview && (
        <>
          <SectionLabel>CAMPAIGN OVERVIEW</SectionLabel>
          <p className="text-white/70 mb-6 leading-relaxed break-words" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 300, overflowWrap: 'anywhere' }}>{data.overview}</p>
        </>
      )}

      {/* Stats — one row of 4 */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl px-2.5 py-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="tracking-[0.08em] mb-1.5" style={{ fontFamily: MONO, fontSize: 8, fontWeight: 400, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>{s.label}</div>
            <div className="leading-none" style={{ fontFamily: FONT, fontSize: 18, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Linked post thumbnail (falls back to the audience line when a campaign
          has no linked post — e.g. the bundled demo cards). */}
      {showThumb ? (
        <>
          <SectionLabel>CONTENT</SectionLabel>
          <div className="rounded-xl overflow-hidden mb-6" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            <img
              src={data.thumbnail}
              alt={data.brand}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full object-cover"
              style={{ maxHeight: 150, display: 'block' }}
            />
          </div>
        </>
      ) : (
        <>
          <SectionLabel>AUDIENCE INSIGHTS</SectionLabel>
          <div className="rounded-xl px-4 py-3.5 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-white/70 leading-relaxed" style={{ fontFamily: FONT, fontSize: 13.5, fontWeight: 300 }}>{data.audience}</p>
          </div>
        </>
      )}

      {/* Deliverables */}
      <SectionLabel>DELIVERABLES</SectionLabel>
      <div className="flex flex-wrap gap-2.5 mb-6">
        {data.deliverables.map((d) => (
          <span key={d} className="rounded-lg px-3.5 py-2" style={{ fontFamily: MONO, fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)' }}>{d}</span>
        ))}
      </div>

      {/* CTA — opens the linked Instagram post in a new tab. mt-auto pins it to
          the card's bottom so every card's button lines up on the same row. */}
      <a
        href={data.link || undefined}
        target="_blank"
        rel="noreferrer"
        onClick={(e) => { if (!data.link) e.preventDefault() }}
        className={`no-underline w-full rounded-xl text-white inline-flex items-center justify-center gap-2 py-3 transition-transform hover:scale-[1.02] ${pinCta ? 'mt-auto' : ''} ${data.link ? '' : 'opacity-60 cursor-default'}`}
        style={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, background: 'linear-gradient(90deg, rgba(139,92,246,0.85) 0%, rgba(124,92,255,0.85) 100%)' }}
      >
        {ctaIcon && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
          </svg>
        )}
        View Live Posts
      </a>
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
      className="relative rounded-2xl p-6 flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        width: 'min(460px, 92vw)',
        maxHeight: '88vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        overscrollBehavior: 'contain',
        background: '#0B0B14',
        border: '1px solid #3B82F6',
        boxShadow: '0 0 0 1px rgba(59,130,246,0.35), 0 24px 60px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header: avatar + brand + date, circular close */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="shrink-0 rounded-lg flex items-center justify-center overflow-hidden"
          style={{ width: 48, height: 48, background: 'linear-gradient(135deg,#2a2f6b 0%,#16183c 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {data.logo ? (
            <img src={data.logo} alt={data.brand} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white font-bold" style={{ fontFamily: FONT, fontSize: 22, lineHeight: 1 }}>{data.brand.charAt(0)}</span>
          )}
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
  // Live campaign cards (built from the admin's collaborations). Empty for a real
  // creator with no collaborations (section hidden); the bundled demo set only
  // shows on a bare `/influence`. Showing the first 6.
  const { CAMPAIGNS = [] } = useInfluence()
  const DATA = CAMPAIGNS.slice(0, 6)

  // No collaborations → render nothing. The heading/summary card in
  // ProfessionalPresence is hidden the same way, so the whole Brand
  // Collaborations section disappears for creators with no portfolio.
  if (!DATA.length) return null

  const [openIdx, setOpenIdx] = useState(null)
  const scrollerRef = useRef(null)

  // Lock page scroll while the detail modal is open so scrolling inside it
  // doesn't bleed through to the page behind. Lenis owns the scroll, so we stop
  // it too (just hiding body overflow wouldn't stop Lenis's rAF loop).
  useEffect(() => {
    if (openIdx === null) return
    const lenis = typeof window !== 'undefined' ? window.__lenis : null
    lenis?.stop()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      lenis?.start()
      document.body.style.overflow = prevOverflow
    }
  }, [openIdx])

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
    if (DATA.length <= 2) return // 1–2 cards are static; marquee needs 3+
    const el = scrollerRef.current
    if (!el) return
    let raf = 0
    let last = performance.now()
    const SPEED = 70 // px per second
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      // scrollWidth is 0 when the marquee is hidden (desktop, 2–3 cards) — the
      // half>0 guard makes the loop a harmless no-op until it becomes visible.
      if (!pausedRef.current) {
        el.scrollLeft += SPEED * dt
        const half = el.scrollWidth / 2
        if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [DATA.length])

  // When the row stops, snap to the nearest card boundary so it never rests
  // with a card sliced off at the edge. Cards are CARD_W wide with a 24px
  // (gap-6) gutter, so boundaries fall on multiples of that step.
  const pause = () => {
    pausedRef.current = true
    const el = scrollerRef.current
    if (!el) return
    const step = CARD_W + 24
    // Centre the nearest card in the viewport on narrow (mobile/tablet) screens
    // so it stops with a margin instead of jammed against the faded left edge;
    // left-align on wide desktops (where several cards show at once).
    const peek = el.clientWidth < 700 ? Math.max(0, (el.clientWidth - CARD_W) / 2) : 0
    const i = Math.round((el.scrollLeft + peek) / step)
    el.scrollTo({ left: i * step - peek, behavior: 'smooth' })
  }
  const resume = () => { pausedRef.current = false }

  return (
    <section className="relative z-10 py-20 md:py-28 overflow-hidden" style={{ background: 'transparent' }}>
      {DATA.length <= 2 ? (
        // One or two cards: centered, no marquee/duplication (duplicating a
        // couple of cards into a loop reads as repeated/fake entries).
        <div className="flex justify-center flex-wrap gap-6 px-6">
          {DATA.map((data, i) => (
            <CampaignCard key={i} data={data} onClick={() => setOpenIdx(i)} />
          ))}
        </div>
      ) : (
        <>
          {/* Auto-scrolling marquee for any 2+ cards (all screen sizes), so the
              row always animates instead of stacking or sitting static. Native
              horizontal scroll gives swipe left/right; auto-scroll pauses on
              press; cards block text selection / long-press copy. Cards are
              duplicated for a seamless loop. */}
          <div
            ref={scrollerRef}
            className="flex gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{
              WebkitOverflowScrolling: 'touch',
              // Clip any light glass/backdrop-filter fringe at the scroll edges so
              // the cards meet the black page cleanly (no side "shadow").
              maskImage: 'linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0, #000 20px, #000 calc(100% - 20px), transparent 100%)',
            }}
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
        </>
      )}

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
