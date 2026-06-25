import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FONT, MONO, PANEL } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'
import { CountUp } from '../../anim.jsx'

// Follower Growth line chart: left Y-axis ticks use dynamic intervals,
// based on the graph's current scale. Labels are shown in thousands.
const CHART_H = 190
const AXIS_W = 46
// Baseline (the x-axis) sits just above the months; the white line rides on it
// and gently climbs by AMP. Both in % of the chart height (0 = top, 100 = bottom).
const BASELINE_Y = 97
const LINE_AMP = 9

const niceStep = (raw) => {
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const n = (raw || 1) / mag
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return nice * mag
}

// Windowed Y-axis for the follower line. Always exactly TICKS evenly-spaced
// gridlines, so labels never crowd/overlap no matter how small the real growth
// band is. The join-time value sits near the BOTTOM; growth flows upward.
function followerAxisScale(points) {
  const TICKS = 5
  const dataMin = Math.min(...points)
  const dataMax = Math.max(...points)
  const band = dataMax - dataMin > 0 ? dataMax - dataMin : Math.max(dataMax * 0.2, 0.001)
  // No pad below the lowest point — the join-time / lowest value should sit on
  // the BOTTOM gridline (a brand-new creator starts at the floor, then grows up).
  const lo = Math.max(0, dataMin)
  const hi = dataMax + band * 0.6
  // Values are in thousands, so 0.001 = 1 follower. Never step by less than a
  // whole follower — otherwise tiny ranges produce fractional ticks that round
  // to duplicate labels (159, 159, 158, …).
  let step = Math.max(0.001, niceStep((hi - lo) / (TICKS - 1)))
  let axisMin = Math.max(0, Math.floor(lo / step) * step)
  let axisMax = axisMin + step * (TICKS - 1)
  // Make sure the top of the axis clears the highest data point.
  let guard = 0
  while (axisMax < dataMax && guard++ < 6) {
    step = niceStep(step * 1.5)
    axisMin = Math.max(0, Math.floor(lo / step) * step)
    axisMax = axisMin + step * (TICKS - 1)
  }
  const ticks = Array.from({ length: TICKS }, (_, i) => +(axisMin + step * i).toFixed(4))
  return { axisMin, axisMax, ticks }
}

function formatFollowerTick(v) {
  if (v >= 1) {
    return `${Number.isInteger(v) ? v : v.toFixed(2)}k`
  }
  return `${Math.round(v * 1000)}`
}

function formatRangeLabel(dateMs, range) {
  const date = new Date(dateMs)
  if (range === '30D') {
    return date.toLocaleString('en-US', { day: 'numeric', month: 'short' })
  }
  return date.toLocaleString('en-US', { month: 'short' })
}

function buildTimeSeries(points, range, valueKey, transform) {
  const sorted = points
    .map((point) => ({ ...point, date: new Date(point.date).getTime() }))
    .filter((point) => !Number.isNaN(point.date))
    .sort((a, b) => a.date - b.date)

  if (!sorted.length) {
    return { values: [], labels: [] }
  }

  const now = Date.now()
  const msPerDay = 86400000
  const totalDays = range === '1Y' ? 365 : range === '90D' ? 90 : 30
  const start = now - totalDays * msPerDay
  const boundaries = []

  if (range === '30D') {
    // Weekly markers across the month (17 Jun → 24 Jun → …).
    for (let i = 1; i <= 4; i += 1) {
      boundaries.push(start + i * 7 * msPerDay)
    }
  } else if (range === '90D') {
    for (let i = 1; i <= 3; i += 1) {
      boundaries.push(start + i * 30 * msPerDay)
    }
  } else {
    const startDate = new Date(start)
    const baseMonth = startDate.getMonth()
    const baseYear = startDate.getFullYear()
    const startDay = startDate.getDate()
    for (let i = 1; i <= 12; i += 1) {
      boundaries.push(new Date(baseYear, baseMonth + i, startDay).getTime())
    }
  }

  const values = []
  const labels = []
  let lastMatched = sorted[0]
  let idx = 0

  boundaries.forEach((boundary) => {
    while (idx < sorted.length && sorted[idx].date <= boundary) {
      lastMatched = sorted[idx]
      idx += 1
    }
    if (!lastMatched) {
      return
    }
    values.push(transform(lastMatched[valueKey]))
    // Label by the period boundary (the week / month tick), not the matched
    // point's date — otherwise sparse data repeats the same date on every tick.
    labels.push(formatRangeLabel(boundary, range))
  })

  return { values, labels }
}

// Engagement series with EXACT per-period values (no carry-forward): each
// month/week shows its own rate, or 0 if there were no posts. Keeps the chart
// honest — empty periods read 0 instead of repeating the previous value.
function monthlyEngSeries(points, count) {
  const map = new Map(points.map((p) => [String(p.date).slice(0, 7), p.rate]))
  const now = new Date()
  const values = []
  const labels = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    labels.push(d.toLocaleString('en-US', { month: 'short' }))
    values.push(Math.round((map.get(key) ?? 0) * 10) / 10)
  }
  return { values, labels }
}

function weeklyEngSeries(points, count = 5) {
  const map = new Map(points.map((p) => [String(p.date).slice(0, 10), p.rate]))
  const monday = new Date()
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7))
  monday.setUTCHours(0, 0, 0, 0)
  const values = []
  const labels = []
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(monday)
    d.setUTCDate(monday.getUTCDate() - i * 7)
    const key = d.toISOString().slice(0, 10)
    labels.push(d.toLocaleString('en-US', { day: 'numeric', month: 'short' }))
    values.push(Math.round((map.get(key) ?? 0) * 10) / 10)
  }
  return { values, labels }
}

// Catmull-Rom → cubic-bézier so the follower line reads as a smooth curve
// through every point instead of straight zig-zag segments.
function smoothPath(pts) {
  let d = `M${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    // Clamp the control points to the segment's own bounding box. Clamping x
    // stops the curve looping back on itself across a big x-gap (e.g. the flat
    // carry before the recent data); clamping y stops it overshooting past a
    // steep peak/valley into a vertical spike when the next point holds the
    // same value (the follower-graph glitch).
    const loY = Math.min(p1.y, p2.y)
    const hiY = Math.max(p1.y, p2.y)
    const c1x = Math.min(p2.x, Math.max(p1.x, p1.x + (p2.x - p0.x) / 6))
    const c1y = Math.min(hiY, Math.max(loY, p1.y + (p2.y - p0.y) / 6))
    const c2x = Math.min(p2.x, Math.max(p1.x, p2.x - (p3.x - p1.x) / 6))
    const c2y = Math.min(hiY, Math.max(loY, p2.y - (p3.y - p1.y) / 6))
    d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d
}

// Tracks the mobile breakpoint so charts can widen their inner content (and
// scroll horizontally) on small screens while still fitting on desktop.
function useIsMobile() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

// `points`: [{ label, value (thousands, for plotting), count (real followers),
// delta (vs previous point) }]. Renders the exact trend through every snapshot,
// with a hover dot + tooltip (date, count, increase/decrease).
function FollowerGrowthChart({ points, xLabels = [], range }) {
  const [hi, setHi] = useState(null)
  const isMobile = useIsMobile()
  // Only the 1Y view can scroll (its 12 months need ~44px each). The CSS max()
  // below means it only actually scrolls where the panel is too narrow to fit
  // them — wide panels keep 100% and show no scrollbar. 30D/90D never widen.
  const scrollable = range === '1Y'
  const values = points.map((p) => p.value)
  const { axisMin, axisMax, ticks } = followerAxisScale(values.length ? values : [0])
  const span = axisMax - axisMin || 1
  const n = points.length
  const yFor = (v) => +(Math.min(BASELINE_Y, Math.max(0, (axisMax - v) / span) * BASELINE_Y).toFixed(2))
  // Points are pre-positioned by date (p.x in 0–100 across the window). Carry a
  // FLAT straight line from the left edge at the first value (the period before
  // any follower data) up to the first real snapshot, then let the line FLUCTUATE
  // through the actual snapshots, and hold the last value to the right edge.
  const linePts = n < 2
    ? [{ x: 0, y: yFor(values[0] ?? axisMin) }, { x: 100, y: yFor(values[0] ?? axisMin) }]
    : [
        { x: 0, y: yFor(points[0].value) },
        ...points.map((p) => ({ x: p.x, y: yFor(p.value) })),
        { x: 100, y: yFor(points[n - 1].value) },
      ]
  const d = smoothPath(linePts)
  const dFlat = smoothPath(linePts.map((p) => ({ x: p.x, y: BASELINE_Y })))
  const fmtCount = (c) => (c >= 1000 ? `${(c / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(Math.round(c)))
  // Snap the highlighted point to the nearest snapshot under the cursor/finger.
  const scrubAt = (clientX, el) => {
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    let nearest = 0
    let best = Infinity
    points.forEach((p, i) => {
      const dd = Math.abs(p.x - pct)
      if (dd < best) { best = dd; nearest = i }
    })
    setHi(nearest)
  }
  return (
    <div className="pt-3">
      <div className="flex">
        {/* Fixed Y-axis: follower tick labels on the left (don't scroll). */}
        <div className="relative shrink-0" style={{ height: CHART_H, width: AXIS_W }}>
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute left-0 text-white text-[11px]"
              style={{ fontFamily: MONO, top: `${((axisMax - v) / span) * BASELINE_Y}%`, transform: 'translateY(-50%)' }}
            >
              {formatFollowerTick(v)}
            </span>
          ))}
        </div>

        {/* Scrollable plot: gridlines + line + hover layer + month labels share
            the same inner min-width so they scroll together. Only the 1Y view on
            mobile widens (12 months); 30D/90D fit the panel and never scroll. */}
        <div className={`flex-1 min-w-0 pb-1 ${scrollable && isMobile ? 'overflow-x-auto [scrollbar-width:thin]' : 'overflow-x-visible'}`} style={{ marginRight: 6 }}>
          <div style={{ minWidth: scrollable && isMobile ? `max(100%, ${Math.max(xLabels.length, n) * 44}px)` : '100%' }}>
            <div className="relative" style={{ height: CHART_H }}>
              {/* Dashed gridlines (full inner width). */}
              {ticks.map((v) => (
                <div
                  key={v}
                  className="absolute left-0 right-0 border-t border-dashed"
                  style={{ top: `${((axisMax - v) / span) * BASELINE_Y}%`, borderColor: 'rgba(255,255,255,0.45)' }}
                />
              ))}
              {/* Baseline (x-axis). */}
              <div
                className="absolute left-0 right-0 border-t border-dashed"
                style={{ top: `${BASELINE_Y}%`, borderColor: 'rgba(255,255,255,0.45)' }}
              />

              <svg
                className="absolute top-0 left-0"
                style={{ width: '100%', height: '100%' }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <motion.path
                  d={d}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ d: dFlat, opacity: 0 }}
                  whileInView={{ d, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </svg>

              {/* Hover layer spans the full plot width; the dot snaps to the
                  nearest snapshot under the cursor/finger. */}
              <div
                className="absolute inset-0"
                style={{ cursor: 'pointer', touchAction: 'pan-y' }}
                onMouseMove={(e) => scrubAt(e.clientX, e.currentTarget)}
                onMouseLeave={() => setHi(null)}
                onTouchStart={(e) => scrubAt(e.touches[0].clientX, e.currentTarget)}
                onTouchMove={(e) => scrubAt(e.touches[0].clientX, e.currentTarget)}
                onTouchEnd={() => setHi(null)}
              >
                {/* One dot that transitions its position between points on hover. */}
                {hi != null && points[hi] && (
                  <span
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: `${points[hi].x}%`,
                      top: `${yFor(points[hi].value)}%`,
                      width: 11, height: 11,
                      transform: 'translate(-50%, -50%)',
                      background: '#fff',
                      boxShadow: '0 0 0 4px rgba(255,255,255,0.18)',
                      transition: 'left 160ms ease-out, top 160ms ease-out',
                    }}
                  />
                )}

                {hi != null && points[hi] && (
                  <div
                    className="absolute z-20 rounded-lg px-3 py-2 pointer-events-none whitespace-nowrap"
                    style={{
                      left: `${points[hi].x}%`,
                      top: `${yFor(points[hi].value)}%`,
                      transform: 'translate(-50%, calc(-100% - 12px))',
                      background: 'rgba(10,12,30,0.96)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                      transition: 'left 160ms ease-out, top 160ms ease-out',
                    }}
                  >
                    <div className="text-white/55 text-[10px]" style={{ fontFamily: MONO }}>{points[hi].label}</div>
                    <div className="text-white font-semibold text-sm" style={{ fontFamily: FONT }}>{fmtCount(points[hi].count)} followers</div>
                    {hi > 0 && (
                      <div className="text-[11px] font-semibold" style={{ fontFamily: MONO, color: points[hi].delta >= 0 ? '#4DE0B0' : '#FF8FB0' }}>
                        {points[hi].delta >= 0 ? `▲ +${points[hi].delta}` : `▼ ${points[hi].delta}`} vs {points[hi - 1].label}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* X-axis markers spanning the whole window (weekly for 30D, monthly
                for 90D/1Y) — same inner width as the plot, so they line up and
                scroll together. */}
            <div className="relative mt-2 h-4">
              {xLabels.map((l, i) => {
                // Center labels, but anchor the first/last inward so their halves
                // aren't clipped by the scroll container's edges.
                const tx = i === 0 ? '0' : i === xLabels.length - 1 ? '-100%' : '-50%'
                return (
                  <span
                    key={i}
                    className="absolute text-white text-[10px] whitespace-nowrap"
                    style={{ left: `${l.x}%`, transform: `translateX(${tx})`, fontFamily: MONO }}
                  >
                    {l.label}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Engagement Rate: Y-axis scaled to the data (with headroom) so typical low
// rates (~3%) fill the chart instead of sitting squashed at the bottom of a
// fixed 0–100% axis. A vertical bar per period; latest highlighted in cyan.
function engagementAxis(bars) {
  const max = Math.max(0, ...bars)
  if (!(max > 0)) return { axisMax: 5, ticks: [0, 1, 2, 3, 4, 5] }
  const rawStep = (max * 1.15) / 5 // aim for ~5 ticks with ~15% headroom
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const norm = rawStep / mag
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10
  const interval = niceNorm * mag
  // Engagement is capped at 100%, so the axis never exceeds 100 (no 125% tick).
  const axisMax = Math.min(100, Math.ceil((max * 1.05) / interval) * interval)
  const ticks = []
  for (let v = 0; v <= axisMax + interval * 1e-6; v += interval) ticks.push(+v.toFixed(2))
  return { axisMax, ticks }
}

function EngagementChart({ bars, months }) {
  const { axisMax, ticks } = engagementAxis(bars)
  const isMobile = useIsMobile()
  // The long 1.15s base delay + 0.08s stagger is for the initial scroll-in
  // reveal only. Once the chart has revealed, range switches (e.g. 1Y, which
  // adds more bars) should animate the new bars in quickly instead of replaying
  // that staggered delay — otherwise later months pop in up to ~2s late.
  const [revealed, setRevealed] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2200)
    return () => clearTimeout(t)
  }, [])
  const baseDelay = revealed ? 0.05 : 1.15
  const stagger = revealed ? 0.03 : 0.08
  const [hi, setHi] = useState(null)
  // Per-bar sizing: bars don't shrink below BAR_MIN, so when there are many
  // months the row overflows and scrolls horizontally instead of squishing.
  // On desktop bars shrink to fit (no scrollbar); on mobile they keep a 34px
  // min and the row scrolls. Bars and labels share the same flex classes so
  // they always stay aligned.
  return (
    <div className="pt-3">
      <div className="flex">
        {/* Fixed Y-axis: % tick labels on the left (don't scroll). */}
        <div className="relative shrink-0" style={{ height: CHART_H, width: AXIS_W }}>
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute left-0 text-white text-[11px]"
              style={{ fontFamily: MONO, top: `${(1 - v / axisMax) * 100}%`, transform: 'translateY(-50%)' }}
            >
              {v}%
            </span>
          ))}
        </div>

        {/* Scrollable chart: dashed gridlines + bars + month labels, all sharing
            the same inner min-width so they scroll together and stay aligned. */}
        <div className="flex-1 min-w-0 overflow-x-auto md:overflow-x-visible pb-1 [scrollbar-width:thin]" style={{ marginRight: 6 }}>
          {/* On mobile the inner widens to fit all bars (≈44px each) so the
              dashed gridlines span the full scrolled chart (e.g. 1Y's 12 months);
              desktop stays 100% and the bars shrink to fit. */}
          <div style={{ minWidth: isMobile ? `max(100%, ${bars.length * 44}px)` : '100%' }}>
            <div className="relative" style={{ height: CHART_H }}>
              {/* Dashed gridlines (full inner width). */}
              {ticks.map((v) => (
                <div
                  key={v}
                  className="absolute left-0 right-0 border-t border-dashed"
                  style={{ top: `${(1 - v / axisMax) * 100}%`, borderColor: 'rgba(255,255,255,0.45)' }}
                />
              ))}
              {/* Bars. */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end gap-1 md:gap-3" style={{ height: '100%' }}>
                {bars.map((b, i) => {
                  const last = i === bars.length - 1
                  const h = Math.max(3, Math.min(100, (b / axisMax) * 100))
                  return (
                    <motion.div
                      key={i}
                      className="relative rounded-t-md origin-bottom cursor-default grow shrink-0 basis-[34px] md:shrink md:basis-0"
                      style={{ height: `${h}%`, background: last ? '#89DFEC' : 'linear-gradient(180deg,#E731A2 0%,#C04DCC 50%,#A35CE1 100%)', opacity: hi !== null && hi !== i ? 0.55 : 1 }}
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: 'easeOut', delay: baseDelay + i * stagger }}
                      onMouseEnter={() => setHi(i)}
                      onMouseLeave={() => setHi(null)}
                    >
                      {hi === i && (
                        // Anchored just inside the bar's top so it never overflows
                        // the chart — a tooltip placed ABOVE a tall bar gets clipped
                        // by the scroll container into an empty dark box.
                        <div
                          className="absolute left-1/2 -translate-x-1/2 top-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap pointer-events-none z-20 text-center"
                          style={{ background: '#0B0B27', border: '1px solid rgba(255,255,255,0.15)', fontFamily: MONO, boxShadow: '0 6px 18px rgba(0,0,0,0.5)' }}
                        >
                          {months[i] && <div className="text-white/55 text-[10px]">{months[i]}</div>}
                          <div className="text-white font-semibold text-[12px]">{b}%</div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
            {/* Month labels — same flex sizing as the bars, so they line up. */}
            <div className="flex gap-1 md:gap-3 mt-2 text-white text-[8px] md:text-[10px]" style={{ fontFamily: MONO }}>
              {months.slice(0, bars.length).map((m, i) => (
                <span key={`${m}-${i}`} className="text-center grow shrink-0 basis-[34px] md:shrink md:basis-0">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Panel slides into place from a given edge. Spec §3: 500ms ease-out — Follower
// Growth from the left, Engagement Rate from the right, the rest up from below.
const SLIDE_FROM = {
  left: { x: -60, y: 0 },
  right: { x: 60, y: 0 },
  up: { x: 0, y: 60 },
}

// Inner sub-card surface — a darker shade of the page theme so the two halves
// of the Audience panel read as distinct cards (no light glass background).
const SUBCARD = {
  background: 'linear-gradient(155deg, #1b2052 0%, #10133C 60%)',
  border: '1px solid rgba(255,255,255,0.08)',
}

function Panel({ title, children, from = 'up', className = '', bare = false, style }) {
  const off = SLIDE_FROM[from]
  return (
    <motion.div
      className={`rounded-2xl p-5 md:p-6 ${className}`}
      style={bare ? style : { ...PANEL, ...style }}
      initial={{ opacity: 0, ...off }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
    >
      {title && <div className="text-white font-semibold text-base mb-4" style={{ fontFamily: FONT }}>{title}</div>}
      {children}
    </motion.div>
  )
}

export default function LiveAnalytics() {
  const {
    GROWTH, MONTHS, ENGAGEMENT_BARS, ENG_MONTHS, GROWTH_POINTS, ENG_POINTS, ENG_POINTS_WEEKLY, ENG_FROM_POSTS,
    AGE_GROUPS, TOP_LOCATIONS, TOP_COUNTRIES, GENDER_SPLIT,
  } = useInfluence()
  const [range, setRange] = useState('30D')

  // Engagement: real per-period rates — per-WEEK for 30D, per-MONTH for 90D/1Y —
  // exactly the same approach across ranges. A period with no posts reads 0
  // (just like an empty month on 90D/1Y); no flat-rate fallback.
  const engSeries = ENG_FROM_POSTS
    ? (range === '30D'
        ? weeklyEngSeries(ENG_POINTS_WEEKLY || [])
        : monthlyEngSeries(ENG_POINTS || [], range === '1Y' ? 12 : 3))
    : buildTimeSeries(ENG_POINTS || [], range, 'rate', (value) => Math.round(value * 10) / 10)
  const engBars = engSeries.values.length ? engSeries.values : ENGAGEMENT_BARS
  const engMonths = engSeries.labels.length ? engSeries.labels : (ENG_MONTHS || MONTHS)

  // Follower growth: plot the ACTUAL dated snapshots positioned by their real
  // date within the window (no carry-forward resampling), so the trend is exact
  // AND the x-axis can show month/week markers across the whole 30D/90D/1Y range.
  // Position data across the FULL selected window so the x-axis can show the
  // whole range: 30D → weekly markers, 90D → months, 1Y → all 12 months. The
  // line is carried flat from the window start / to "now" (in the chart) so it
  // stays visible even when the real snapshots only cover part of the window.
  // Window the dated snapshots to the selected range, then spread them EVENLY
  // across the width so the trend reads as a clean line (bucketing/by-date crams a
  // recent-only creator's data into a flat-then-spike shape). Longer ranges
  // include more history when it exists; the x-axis labels span the whole range.
  const totalDays = range === '1Y' ? 365 : range === '90D' ? 90 : 30
  const winStart = Date.now() - totalDays * 86400000
  // Dedupe to one snapshot per calendar day (keep the latest reading of the
  // day) — multiple syncs on the same day would otherwise plot on top of each
  // other and draw a vertical line.
  const byDay = new Map()
  ;(GROWTH_POINTS || [])
    .map((p) => ({ t: new Date(p.date).getTime(), f: Number(p.followers) }))
    .filter((p) => !Number.isNaN(p.t) && p.t >= winStart && Number.isFinite(p.f) && p.f > 0)
    .sort((a, b) => a.t - b.t)
    .forEach((p) => byDay.set(new Date(p.t).toISOString().slice(0, 10), p))
  const realGrowth = [...byDay.values()].sort((a, b) => a.t - b.t)

  let growthPoints
  let growthXLabels
  if (realGrowth.length) {
    // Position each snapshot by its REAL date within the window, so 30D / 90D /
    // 1Y genuinely differ: recent data fills the 30D view but sits toward the
    // right of the 90D / 1Y views (where it actually falls in time).
    const winNow = Date.now()
    const winSpan = winNow - winStart || 1
    const gn = realGrowth.length
    const xByDate = (t) => (gn < 2 ? 50 : Math.max(0, Math.min(100, ((t - winStart) / winSpan) * 100)))
    growthPoints = realGrowth.map((p, i) => ({
      x: xByDate(p.t),
      label: new Date(p.t).toLocaleString('en-US', { day: 'numeric', month: 'short' }),
      value: p.f / 1000,
      count: p.f,
      delta: i ? p.f - realGrowth[i - 1].f : 0,
    }))
    // Keep consecutive points at least MIN_GAP apart horizontally so a big
    // jump between near-dated snapshots reads as a slope, never a vertical line.
    const MIN_GAP = 6
    for (let i = 1; i < growthPoints.length; i += 1) {
      if (growthPoints[i].x - growthPoints[i - 1].x < MIN_GAP) {
        growthPoints[i].x = growthPoints[i - 1].x + MIN_GAP
      }
    }
    // If the nudging pushed past the right edge, rescale all points back into 0–100.
    const maxX = growthPoints[growthPoints.length - 1].x
    if (maxX > 100) growthPoints.forEach((p) => { p.x = (p.x / maxX) * 100 })
    const now = new Date()
    if (range === '30D') {
      const weeks = 5
      growthXLabels = Array.from({ length: weeks }, (_, k) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (weeks - 1 - k) * 7)
        return { x: (k / (weeks - 1)) * 100, label: d.toLocaleString('en-US', { day: 'numeric', month: 'short' }) }
      })
    } else {
      const mCount = range === '1Y' ? 12 : 3
      growthXLabels = Array.from({ length: mCount }, (_, k) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (mCount - 1 - k), 1)
        return { x: (k / (mCount - 1)) * 100, label: d.toLocaleString('en-US', { month: 'short' }) }
      })
    }
  } else {
    growthPoints = GROWTH.map((v, i) => ({
      x: GROWTH.length < 2 ? 50 : (i / (GROWTH.length - 1)) * 100,
      label: MONTHS[i] || '',
      value: v,
      count: Math.round(v * 1000),
      delta: i ? Math.round((v - GROWTH[i - 1]) * 1000) : 0,
    }))
    growthXLabels = growthPoints.map((p) => ({ x: p.x, label: p.label }))
  }
  const [hovered, setHovered] = useState(null)
  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-20 overflow-hidden">
      {/* Soft colored ellipse around the section — fades on all sides */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          top: '-220px',
          bottom: '-240px',
          left: '-11%',
          right: '-11%',
          background: 'radial-gradient(80% 70% at 50% 58%, rgba(26,33,92,0.38) 0%, rgba(26,33,92,0.38) 55%, rgba(37,49,133,0) 85%)',
          zIndex: 0,
        }}
      />


      <div className="relative z-10 max-w-[1180px] mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-14">
          <h2 className="text-4xl md:text-5xl font-bold" style={{ fontFamily: FONT }}>Live Analytics</h2>
          <div className="flex items-center gap-2 rounded-full p-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['30D', '90D', '1Y'].map((p) => {
              const active = range === p
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRange(p)}
                  onMouseEnter={() => setHovered(p)}
                  onMouseLeave={() => setHovered((h) => (h === p ? null : h))}
                  className="text-sm font-bold px-5 py-2 rounded-full"
                  style={{
                    fontFamily: FONT,
                    color: '#fff',
                    background: active
                      ? 'linear-gradient(180deg,#8B5CF6,#6D3FD6)'
                      : hovered === p
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(255,255,255,0.03)',
                    border: active ? '1px solid transparent' : '1px solid rgba(255,255,255,0.14)',
                    boxShadow: active ? '0 4px 14px rgba(124,77,216,0.45)' : 'none',
                    transition: 'background 150ms ease-in-out, border 150ms ease-in-out',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pl-4 md:pl-8">
          <Panel title="Follower Growth" from="left" style={{ background: 'linear-gradient(155deg, #1b2052 0%, #10133C 60%)' }}>
            <FollowerGrowthChart points={growthPoints} xLabels={growthXLabels} range={range} />
            <p className="mt-3 ml-3 text-[11px] italic text-white/60" style={{ fontFamily: MONO }}>
              &ldquo;This chart only shows the follower growth of the creator after joining Creasume.&rdquo;
            </p>
          </Panel>

          <Panel title="Engagement Rate" from="right" style={{ background: 'linear-gradient(155deg, #1b2052 0%, #10133C 60%)' }}>
            <EngagementChart bars={engBars} months={engMonths} />
          </Panel>

          {/* Audience Insights + Top Locations / gender — combined card.
              Hidden entirely when no demographics are available (under 100
              followers, or Instagram hasn't returned them yet). */}
          {(AGE_GROUPS.length > 0 || TOP_LOCATIONS.length > 0 || TOP_COUNTRIES.length > 0 || GENDER_SPLIT) && (
          <motion.div
            className="lg:col-span-2 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
            style={PANEL}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            {/* Left sub-card: Audience Insights — age distribution */}
            <div className="rounded-2xl p-5 md:p-6" style={SUBCARD}>
            <div className="text-white font-semibold text-base mb-4" style={{ fontFamily: FONT }}>Audience Insights</div>
            <div className="text-[10px] tracking-widest text-white mb-4" style={{ fontFamily: MONO }}>AGE DISTRIBUTION</div>
            <div className="flex flex-col gap-5">
              {AGE_GROUPS.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="text-white/70 text-xs mb-2" style={{ fontFamily: MONO }}>{label}</div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 md:flex-none md:w-80">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.85, ease: 'easeOut', delay: 1.15 }}
                      />
                    </div>
                    <span className="text-white/80 text-sm w-10 text-right tabular-nums" style={{ fontFamily: MONO }}>{value}%</span>
                  </div>
                </div>
              ))}
            </div>
            </div>

            {/* Right sub-card: Top Cities / Top Countries (flags) + gender split */}
            <div className="relative overflow-hidden flex flex-col gap-6 rounded-2xl py-6 pl-4 pr-6 md:py-7 md:pl-5 md:pr-7 w-full max-w-md mx-auto" style={SUBCARD}>
              {/* Faint glowing purple dots — subtle "global reach" hint */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                {[
                  { top: '22%', left: '70%' },
                  { top: '52%', left: '86%' },
                  { top: '40%', left: '57%' },
                  { bottom: '22%', left: '78%' },
                  { top: '14%', right: '12%' },
                ].map((pos, i) => (
                  <span key={i} className="absolute rounded-full" style={{ width: 5, height: 5, background: '#8B6FFF', opacity: 0.5, filter: 'blur(1px)', boxShadow: '0 0 10px 2px rgba(139,111,255,0.5)', ...pos }} />
                ))}
              </div>

              {/* Two columns with a thin vertical divider */}
              <div className="relative z-10 grid grid-cols-2 gap-x-6 md:gap-x-10">
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: 'rgba(255,255,255,0.09)' }} />

                {/* Top Cities — plain text rows */}
                <div>
                  <div className="flex items-center gap-2 text-white font-semibold text-base mb-4 md:mb-6" style={{ fontFamily: FONT }}>
                    <span aria-hidden="true">📍</span> Top Cities
                  </div>
                  <div className="flex flex-col gap-4 md:gap-5">
                    {TOP_LOCATIONS.map((loc) => {
                      const full = typeof loc === 'string' ? loc : loc.full
                      const short = typeof loc === 'string' ? loc : loc.short
                      // One line each — short "City, ST" on mobile, full name on
                      // desktop (text-sm keeps the full name on a single row).
                      return (
                        <div key={full} className="text-sm font-semibold leading-snug whitespace-nowrap" style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.88)' }}>
                          <span className="md:hidden">{short}</span>
                          <span className="hidden md:inline">{full}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Top Countries — small flag before each name */}
                <div>
                  <div className="flex items-center gap-2 whitespace-nowrap text-white font-semibold text-base mb-4 md:mb-6" style={{ fontFamily: FONT }}>
                    <span aria-hidden="true">🌍</span> Top Countries
                  </div>
                  <div className="flex flex-col gap-4 md:gap-5">
                    {TOP_COUNTRIES.map((c) => (
                      <div key={c.code || c.name} className="flex items-center text-sm font-semibold" style={{ fontFamily: FONT, color: 'rgba(255,255,255,0.88)' }}>
                        {c.code && (
                          <img
                            src={`https://flagcdn.com/w40/${c.code}.png`}
                            alt={c.name}
                            className="w-[18px] md:w-6 h-auto shrink-0"
                            style={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.12)', marginRight: 8, verticalAlign: 'middle' }}
                          />
                        )}
                        <span>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {GENDER_SPLIT && (
              <div className="relative z-10 mt-auto">
                <div className="flex items-center justify-center gap-2 text-white font-semibold text-base mb-3" style={{ fontFamily: FONT }}>
                  <span aria-hidden="true">👥</span> Gender Ratio
                </div>
                <div className="grid grid-cols-2 rounded-2xl overflow-hidden w-full" style={{ background: '#7B45C9' }}>
                  {[
                    { label: 'FEMALE', value: GENDER_SPLIT.female },
                    { label: 'MALE', value: GENDER_SPLIT.male },
                  ].map(({ label, value }, i) => (
                    <div
                      key={label}
                      className="flex flex-col items-center justify-center text-center"
                      style={{ minHeight: 104, ...(i === 1 ? { borderLeft: '1px solid rgba(255,255,255,0.25)' } : {}) }}
                    >
                      <div className="text-white font-bold text-2xl leading-none mb-1.5" style={{ fontFamily: FONT }}>
                        <CountUp value={Number(value)} suffix="%" />
                      </div>
                      <div className="text-white/85 text-[11px] tracking-widest" style={{ fontFamily: MONO }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
