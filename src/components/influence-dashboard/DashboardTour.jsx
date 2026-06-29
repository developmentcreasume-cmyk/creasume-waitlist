// First-login guided tour for the dashboard. Blurs + dims the whole screen
// except a "hole" over the current target (via clip-path), draws a purple ring
// around it, and shows a tooltip with dots + Next/Finish. The hole, ring and
// tooltip all animate between steps, so moving from one step to the next glides
// instead of snapping. Steps are passed in with a ref to the element to spotlight.
import { useState, useLayoutEffect } from 'react'
import { FONT } from '../influence/influenceData.js'

const TT_WIDTH = 330
const PAD = 8
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DUR = '0.45s'

export default function DashboardTour({ steps, onDone }) {
  const [i, setI] = useState(0)
  const [rect, setRect] = useState(null)
  const step = steps[i]
  const last = i === steps.length - 1

  useLayoutEffect(() => {
    const el = step?.ref?.current
    // Instant scroll (no smooth) so the measured rect is final immediately; the
    // CSS transitions below provide the smooth glide between steps.
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' })

    const measure = () => {
      const node = step?.ref?.current
      if (!node) { setRect(null); return }
      const r = node.getBoundingClientRect()
      // Hidden target (e.g. sidebar collapsed on mobile) → no spotlight.
      if (r.width === 0 && r.height === 0) { setRect(null); return }
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [i, step])

  const next = () => (last ? onDone() : setI((n) => n + 1))

  // ---- Tooltip placement relative to the spotlight ----
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  let ttTop
  let ttLeft
  if (rect) {
    const placeRight = rect.left < 360 // near the left sidebar
    const placeAbove = rect.top > vh * 0.55
    if (placeRight) { ttLeft = rect.left + rect.width + 20; ttTop = rect.top }
    else if (placeAbove) { ttLeft = rect.left; ttTop = rect.top - 200 }
    else { ttLeft = rect.left; ttTop = rect.top + rect.height + 16 }
  } else {
    ttLeft = vw / 2 - TT_WIDTH / 2
    ttTop = vh / 2 - 90
  }
  ttLeft = Math.max(16, Math.min(ttLeft, vw - TT_WIDTH - 16))
  ttTop = Math.max(16, Math.min(ttTop, vh - 210))

  // ---- Blur + dim overlay with a clip-path hole over the target ----
  // clip-path traces the full viewport, then cuts back through the target rect
  // (reverse winding) to leave a sharp, un-blurred hole. Same vertex count every
  // step, so the hole animates smoothly when `rect` changes.
  const Lx = rect ? rect.left - PAD : 0
  const Ty = rect ? rect.top - PAD : 0
  const Rx = rect ? rect.left + rect.width + PAD : 0
  const By = rect ? rect.top + rect.height + PAD : 0
  const hole = rect
    ? `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${Lx}px ${Ty}px, ${Lx}px ${By}px, ${Rx}px ${By}px, ${Rx}px ${Ty}px, ${Lx}px ${Ty}px)`
    : undefined

  const overlay = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(8,9,18,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    clipPath: hole,
    WebkitClipPath: hole,
    transition: `clip-path ${DUR} ${EASE}, -webkit-clip-path ${DUR} ${EASE}`,
    pointerEvents: 'auto',
  }

  const ring = rect && {
    position: 'fixed',
    top: Ty,
    left: Lx,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
    borderRadius: 14,
    border: '2px solid #8B5CF6',
    boxShadow: '0 0 0 1px rgba(139,92,246,0.35), 0 0 26px rgba(139,92,246,0.45)',
    transition: `top ${DUR} ${EASE}, left ${DUR} ${EASE}, width ${DUR} ${EASE}, height ${DUR} ${EASE}`,
    pointerEvents: 'none',
  }

  return (
    // Wrapper lets clicks pass through the hole to the highlighted element.
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, pointerEvents: 'none' }}>
      <div style={overlay} />
      {rect && <div style={ring} />}

      {/* Tooltip */}
      <div
        style={{
          position: 'fixed',
          top: ttTop,
          left: ttLeft,
          width: TT_WIDTH,
          maxWidth: 'calc(100vw - 32px)',
          background: '#15171f',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
          transition: `top ${DUR} ${EASE}, left ${DUR} ${EASE}`,
          pointerEvents: 'auto',
        }}
      >
        <h3 className="text-white font-bold text-lg mb-1.5" style={{ fontFamily: FONT }}>{step.title}</h3>
        <p className="text-white/60 text-[14px] leading-relaxed mb-5" style={{ fontFamily: FONT }}>{step.desc}</p>

        <div className="flex items-center justify-between">
          {/* progress dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className="rounded-full"
                style={{
                  width: idx === i ? 18 : 7,
                  height: 7,
                  background: idx === i ? 'linear-gradient(90deg,#8B5CF6,#EC4899)' : 'rgba(255,255,255,0.25)',
                  transition: `width ${DUR} ${EASE}, background ${DUR} ${EASE}`,
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {!last && (
              <button
                type="button"
                onClick={onDone}
                className="rounded-full px-4 py-2.5 text-[14px] font-medium text-white/55 hover:text-white hover:bg-white/5 transition-colors"
                style={{ fontFamily: FONT }}
              >
                Skip
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="rounded-full px-6 py-2.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-95"
              style={{ fontFamily: FONT, background: 'linear-gradient(90deg,#8B5CF6 0%, #EC4899 100%)' }}
            >
              {last ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
