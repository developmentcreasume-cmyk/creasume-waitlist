import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FONT, MONO, PANEL, GROWTH, MONTHS, ENGAGEMENT_BARS,
  AGE_GROUPS, TOP_LOCATIONS, GENDER_SPLIT,
} from './influenceData.js'

// Follower Growth line chart: left Y-axis ticks (280k…70k), dashed gridlines,
// and a white line. vectorEffect keeps the stroke crisp under the stretched
// (preserveAspectRatio: none) viewBox.
const AXIS_MAX = 280
const Y_TICKS = [280, 210, 140, 70]
const CHART_H = 190
const AXIS_W = 46
// Baseline (the x-axis) sits just above the months; the white line rides on it
// and gently climbs by AMP. Both in % of the chart height (0 = top, 100 = bottom).
const BASELINE_Y = 97
const LINE_AMP = 9

function FollowerGrowthChart({ points }) {
  // One straight line: starts on the baseline (first value) and climbs to the
  // last value. Endpoints are data-driven; the middle isn't drawn.
  const lo = Math.min(...points)
  const span = Math.max(...points) - lo || 1
  const y0 = BASELINE_Y - ((points[0] - lo) / span) * LINE_AMP
  const y1 = BASELINE_Y - ((points[points.length - 1] - lo) / span) * LINE_AMP
  const d = `M0 ${y0.toFixed(1)} L100 ${y1.toFixed(1)}`
  return (
    <div>
      <div className="relative" style={{ height: CHART_H }}>
        {Y_TICKS.map((v) => (
          <div
            key={v}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${(1 - v / AXIS_MAX) * 100}%`, transform: 'translateY(-50%)' }}
          >
            <span className="text-white text-[11px]" style={{ fontFamily: MONO, width: AXIS_W }}>{v}k</span>
            <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.45)' }} />
          </div>
        ))}
        {/* Baseline dotted line just above the months */}
        <div
          className="absolute left-0 right-0 flex items-center"
          style={{ top: `${BASELINE_Y}%`, transform: 'translateY(-50%)' }}
        >
          <span style={{ width: AXIS_W }} />
          <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.45)' }} />
        </div>
        <svg
          className="absolute top-0"
          style={{ left: AXIS_W, width: `calc(100% - ${AXIS_W}px)`, height: '100%' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* One solid continuous stroke. The pathLength draw is avoided here —
              under the stretched viewBox + non-scaling-stroke it renders as
              broken dashes, so the line is faded in instead. */}
          <motion.path
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 1.15 }}
          />
        </svg>
      </div>
      <div className="flex justify-between mt-2 text-white text-[10px]" style={{ fontFamily: MONO, marginLeft: AXIS_W }}>
        {MONTHS.map((m) => <span key={m}>{m}</span>)}
      </div>
    </div>
  )
}

// Engagement Rate: percentage Y-axis (0–8%), dashed gridlines, and a short
// rounded bar cap per month sitting on the 0% baseline. Gradient caps, with the
// latest month highlighted in cyan.
const E_AXIS_MAX = 8
const E_TICKS = [8, 6, 4, 2, 0]

function EngagementChart({ bars }) {
  return (
    <div>
      <div className="relative" style={{ height: CHART_H }}>
        {E_TICKS.map((v) => (
          <div
            key={v}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${(1 - v / E_AXIS_MAX) * 100}%`, transform: 'translateY(-50%)' }}
          >
            <span className="text-white text-[11px]" style={{ fontFamily: MONO, width: AXIS_W }}>{v}%</span>
            <span className="flex-1 border-t border-dashed" style={{ borderColor: 'rgba(255,255,255,0.45)' }} />
          </div>
        ))}
        <div className="absolute bottom-0 flex items-end justify-between gap-3" style={{ left: AXIS_W, right: 6 }}>
          {bars.map((b, i) => {
            const last = i === bars.length - 1
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-full origin-center"
                style={{ height: 7, background: last ? '#89DFEC' : 'linear-gradient(90deg,#A35CE1 0%,#C04DCC 50%,#E731A2 100%)' }}
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeOut', delay: 1.15 + i * 0.08 }}
              />
            )
          })}
        </div>
      </div>
      <div className="flex gap-3 mt-2 text-white text-[10px]" style={{ fontFamily: MONO, marginLeft: AXIS_W, marginRight: 6 }}>
        {MONTHS.slice(0, 6).map((m) => <span key={m} className="flex-1 text-center">{m}</span>)}
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
  const [range, setRange] = useState('30D')
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel title="Follower Growth" from="left" style={{ background: 'linear-gradient(155deg, #1b2052 0%, #10133C 60%)' }}>
            <FollowerGrowthChart points={GROWTH} />
          </Panel>

          <Panel title="Engagement Rate" from="right" style={{ background: 'linear-gradient(155deg, #1b2052 0%, #10133C 60%)' }}>
            <EngagementChart bars={ENGAGEMENT_BARS} />
          </Panel>

          {/* Audience Insights + Top Locations / gender — combined card */}
          <motion.div
            className="lg:col-span-2 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10"
            style={PANEL}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            {/* Left: Audience Insights — age distribution */}
            <div>
            <div className="text-white font-semibold text-base mb-4" style={{ fontFamily: FONT }}>Audience Insights</div>
            <div className="text-[10px] tracking-widest text-white mb-4" style={{ fontFamily: MONO }}>AGE DISTRIBUTION</div>
            <div className="flex flex-col gap-5">
              {AGE_GROUPS.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="text-white/70 text-xs mb-2" style={{ fontFamily: MONO }}>{label}</div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-80">
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

            {/* Right: Top locations + gender split */}
            <div className="flex flex-col gap-6 rounded-2xl p-6 md:p-7 w-full max-w-sm mx-auto" style={{ backgroundColor: '#23232E', border: '1.5px solid rgba(255,255,255,0.32)', boxShadow: '0 0 14px rgba(255,255,255,0.07)' }}>
              <div>
                <div className="text-sm tracking-widest text-white mb-3 pl-7" style={{ fontFamily: MONO }}>TOP LOCATIONS</div>
                <div className="flex flex-wrap gap-2.5 pl-7">
                  {TOP_LOCATIONS.map((loc) => (
                    <span key={loc} className="rounded-full px-4 py-2 text-sm font-medium" style={{ backgroundColor: '#B9BAC0', color: '#11132f', border: '1px solid rgba(255,255,255,0.14)' }}>
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 mt-auto rounded-2xl overflow-hidden w-full" style={{ background: '#7B45C9' }}>
                {[
                  { label: 'FEMALE', value: GENDER_SPLIT.female },
                  { label: 'MALE', value: GENDER_SPLIT.male },
                ].map(({ label, value }, i) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center text-center"
                    style={{ minHeight: 104, ...(i === 1 ? { borderLeft: '1px solid rgba(255,255,255,0.25)' } : {}) }}
                  >
                    <div className="text-white font-bold text-2xl leading-none mb-1.5" style={{ fontFamily: FONT }}>{value}%</div>
                    <div className="text-white/85 text-[11px] tracking-widest" style={{ fontFamily: MONO }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
