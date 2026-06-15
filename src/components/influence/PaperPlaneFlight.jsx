import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

const SVGNS = 'http://www.w3.org/2000/svg'
const TRAIL = 0.06 // short trailing streak (~150px); full path stays hidden
const DURATION = 6000
const START_SIZE = 240 // px the plane is at takeoff (large, then shrinks)
const END_SIZE = 34 // px the plane shrinks to near the Send Inquiry button

const centerOf = (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2 + window.scrollX, y: r.top + r.height / 2 + window.scrollY }
}

// Smooth curve through any number of points (Catmull-Rom → cubic beziers).
function buildSmoothPath(pts) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// On click of "Let's Work Together", the parked PLANE.png lifts off and flies a
// smooth S — from the parked plane, through the Starter card, to the Send Inquiry
// button — shrinking with a short fading trail, auto rotation, synced page
// scroll, and a tap pulse on arrival.
export default function PaperPlaneFlight() {
  const [flight, setFlight] = useState(null) // { path, height, baseSize }
  const busy = useRef(false)
  const rafRef = useRef(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useMotionValue(0)
  const scale = useMotionValue(1)
  const trail = useMotionValue(0)
  const dashoffset = useTransform(trail, (v) => TRAIL - v)
  const trailOpacity = useTransform(trail, [0, 0.05, 0.85, 1], [0, 0.65, 0.65, 0])

  useEffect(() => {
    const onLaunch = () => {
      if (busy.current) return
      const parkedEl = document.getElementById('parked-plane')
      const ctaEl = document.getElementById('cta-banner')
      const endEl = document.querySelector('#work-with-me button[type="submit"]')
      if (!parkedEl || !ctaEl || !endEl) return

      // Start at the parked plane's actual size so it shrinks gradually (no pop).
      const baseSize = parkedEl.offsetWidth || START_SIZE
      const start = centerOf(parkedEl) // start from the parked plane's position
      const cr = ctaEl.getBoundingClientRect()
      const ctaTop = cr.top + window.scrollY
      const ctaRight = cr.right + window.scrollX // right edge — past the 2026 text
      // Land on the button's arrow icon (right side), so it swaps to the plane
      // exactly where the plane lands — not at the button centre.
      const arrowEl = endEl.querySelector('svg')
      const endC = centerOf(arrowEl || endEl)
      const end = { x: endC.x, y: endC.y }
      const dy = end.y - start.y
      const aboveY = ctaTop - 50 // the upper line the plane flies along
      // Turn well before the screen edge — the plane is still large here, so
      // leave room for its body (half its current size) plus a margin.
      const rightX = Math.min(ctaRight + 40, window.scrollX + window.innerWidth - 380)

      // Path: parked plane → rise up above the 2026 text → fly right past it →
      // crisscross (S) down to mid-page → turn right → into the Send Inquiry button.
      const points = [
        start,
        { x: start.x + 520, y: aboveY }, // take off up-right (flatter), clearing the text
        { x: rightX, y: aboveY }, // continue right past 2026 (turn before the edge)
        { x: start.x + 120, y: start.y + dy * 0.32 }, // criss back-left, descending
        { x: start.x + 660, y: start.y + dy * 0.54 }, // criss right (~half page)
        { x: end.x - 260, y: end.y }, // line up to the LEFT of the arrow, same height
        end, // glide horizontally onto the arrow (no downward dip)
      ]
      const pathStr = buildSmoothPath(points)
      const endScale = END_SIZE / baseSize

      // Geometry source kept in the DOM so getTotalLength/getPointAtLength work
      // reliably across browsers. Removed when the flight ends.
      const svg = document.createElementNS(SVGNS, 'svg')
      svg.setAttribute('width', '0')
      svg.setAttribute('height', '0')
      svg.style.cssText = 'position:absolute;left:-9999px;top:0;overflow:hidden'
      const geo = document.createElementNS(SVGNS, 'path')
      geo.setAttribute('d', pathStr)
      svg.appendChild(geo)
      document.body.appendChild(svg)
      const L = geo.getTotalLength()
      if (!L) {
        document.body.removeChild(svg)
        return
      }

      busy.current = true
      x.set(start.x)
      y.set(start.y)
      scale.set(1)
      rotate.set(8)
      trail.set(0)
      setFlight({ path: pathStr, height: document.documentElement.scrollHeight, baseSize })

      let t0 = null
      let scrollFloor = window.scrollY // scroll only ever moves down, never up
      const tick = (now) => {
        if (t0 === null) t0 = now
        const lin = Math.min(1, (now - t0) / DURATION)
        const v = easeInOut(lin)
        const pt = geo.getPointAtLength(v * L)
        const ptN = geo.getPointAtLength(Math.min(L, v * L + 1))
        const angle = (Math.atan2(ptN.y - pt.y, ptN.x - pt.x) * 180) / Math.PI
        x.set(pt.x)
        y.set(pt.y)
        // Rotation: ease out of the parked 8° at takeoff, follow the path, then
        // settle into a level landscape (nose right, like the → arrow) on landing.
        const pathRot = angle + 42
        let rot = pathRot
        if (v < 0.18) rot = lerp(8, pathRot, v / 0.18)
        else if (v > 0.82) rot = lerp(pathRot, 42, (v - 0.82) / 0.18) // land in landscape
        rotate.set(rot)
        scale.set(lerp(1, endScale, v))
        trail.set(v)
        // Follow the plane: keep it ~45% down the viewport so it stays in frame.
        // Drive Lenis directly (immediate) so the scroll is locked to the plane
        // rather than lagging behind its smoothing.
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const target = Math.max(0, Math.min(maxScroll, pt.y - window.innerHeight * 0.45))
        scrollFloor = Math.max(scrollFloor, target) // never scroll back up
        if (window.__lenis) window.__lenis.scrollTo(scrollFloor, { immediate: true })
        else window.scrollTo(0, scrollFloor)

        if (lin < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          document.body.removeChild(svg)
          const btn = document.querySelector('#work-with-me button[type="submit"]')
          if (btn) {
            btn.classList.add('plane-arrive-pulse')
            setTimeout(() => btn.classList.remove('plane-arrive-pulse'), 1300)
          }
          // Tell the Send Inquiry button to swap its arrow for the plane image.
          window.dispatchEvent(new Event('plane-landed'))
          setTimeout(() => {
            setFlight(null)
            busy.current = false
          }, 300)
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('plane-launch', onLaunch)
    return () => {
      window.removeEventListener('plane-launch', onLaunch)
      cancelAnimationFrame(rafRef.current)
    }
  }, [x, y, rotate, scale, trail])

  if (!flight) return null

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 w-full pointer-events-none"
      style={{ height: flight.height, zIndex: 120 }}
    >
      {/* The actual PLANE.png image flying along the path */}
      <motion.img
        src="/PLANE.png"
        alt=""
        draggable={false}
        className="absolute top-0 left-0 select-none"
        style={{
          width: flight.baseSize,
          height: flight.baseSize,
          marginLeft: -flight.baseSize / 2,
          marginTop: -flight.baseSize / 2,
          objectFit: 'contain',
          x,
          y,
          rotate,
          scale,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.45))',
        }}
      />
    </div>
  )
}
