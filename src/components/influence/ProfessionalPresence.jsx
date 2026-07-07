import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'
import { RollUp, CountUpText } from '../../anim.jsx'

// Spec §4: platform cards fade in (opacity only), 450ms ease-out, staggered.
const fadeStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
const fadeCard = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

// Brand logo glyphs for the platform rows.
function getSocialUrl(platform, handle) {
  const username = String(handle || '').trim().replace(/^@/, '')
  if (!username) return undefined
  if (platform === 'Instagram') return `https://instagram.com/${username}`
  if (platform === 'YouTube') return `https://www.youtube.com/${username}`
  if (platform === 'X (Twitter)') return `https://x.com/${username}`
  return undefined
}

const PLATFORM_ICON = {
  YouTube: (<svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" /></svg>),
  'Instagram': (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none" /></svg>),
  'X (Twitter)': (<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.8-6.3L5.5 22H2.7l7-8L2 2h6.3l4.4 5.8L18.2 2Zm-1.1 18h1.7L7 3.8H5.2L17.1 20Z" /></svg>),
  TikTok: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M16.5 2h-3v13.2a2.7 2.7 0 1 1-2.1-2.6V9.5a5.8 5.8 0 1 0 5.1 5.8V8.9a6.6 6.6 0 0 0 3.9 1.3V7.1a3.7 3.7 0 0 1-3.8-3.6V2Z" /></svg>),
  LinkedIn: (<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.4 3H3.6A.6.6 0 0 0 3 3.6v16.8a.6.6 0 0 0 .6.6h16.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6ZM8.3 18H5.5V9.7h2.8V18ZM6.9 8.5a1.6 1.6 0 1 1 0-3.3 1.6 1.6 0 0 1 0 3.3ZM18.5 18h-2.8v-4c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7V18H10.2V9.7H13v1.1c.4-.6 1-1.4 2.6-1.4 1.9 0 3 1.2 3 3.8V18Z" /></svg>),
  Website: (<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#9CA2E1" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>),
}

// Fallback glyph for any platform without a dedicated icon (generic link).
const DEFAULT_ICON = (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA2E1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" /></svg>)

export default function ProfessionalPresence() {
  const { SOCIALS, BRAND_SUMMARY } = useInfluence()

  // The horizontal slide is a desktop two-column effect. On mobile (single
  // column) sliding the card in from +420px pushes it off the right edge and
  // clips its content, so we disable the x-slide there and only fade it in.
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // Scroll-linked sweep: the Brand Collaborations card glides in from the right
  // as the section scrolls into view (slower, tied to scroll, not a one-shot).
  const cardRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'center center'] })
  const cardXRaw = useTransform(scrollYProgress, [0, 0.55], [420, 0])
  const cardX = isDesktop ? cardXRaw : 0
  const cardOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])

  // Bar widths reflect the real summary values instead of a fixed pattern: a
  // metric at 0 shows an empty line, and the line grows with the value (each
  // bar scaled against the largest metric, with a small floor so any non-zero
  // value stays visible).
  const parseSummaryValue = (v) => {
    const str = String(v).trim()
    const num = parseFloat(str.replace(/[, ]/g, '').replace('%', ''))
    if (Number.isNaN(num)) return 0
    if (/m$/i.test(str)) return num * 1_000_000
    if (/k$/i.test(str)) return num * 1_000
    return num
  }
  const summaryValues = (BRAND_SUMMARY || []).map((s) => parseSummaryValue(s.value))
  const maxSummary = Math.max(0, ...summaryValues)
  const barWidth = (i) => {
    const v = summaryValues[i] || 0
    if (v <= 0 || maxSummary <= 0) return 0
    return Math.max(8, (v / maxSummary) * 100)
  }

  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-20 overflow-hidden">
      {/* Soft ellipse glow on the left edge, vertically centered */}
      <img
        src="/Ellipse%20883.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          left: '-60px',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '850px',
          width: '320px',
          opacity: 0.9,
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-[1180px] mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-10 md:mb-12" style={{ fontFamily: FONT }}>
          🌐 Professional Presence
        </h2>

        {/* Platform rows. Uses `animate` (not `whileInView`) so the cards always
            become visible when they mount — including when the live data swaps
            the demo rows for the real (possibly fewer) ones after the in-view
            animation has already fired, which otherwise left them at opacity 0. */}
        <motion.div
          className="flex flex-wrap justify-center md:flex-nowrap gap-3 mb-3 max-w-[920px] mx-auto"
          variants={fadeStagger}
          initial="hidden"
          animate="show"
        >
          {SOCIALS.map((s, i) => {
            // Admin-added links carry an explicit url; demo rows derive one from
            // the handle. Ensure a protocol so a bare "youtube.com" opens the real
            // site instead of navigating relatively to /<handle>/youtube.com.
            const rawUrl = s.url || getSocialUrl(s.name, s.handle)
            const url = rawUrl && !/^https?:\/\//i.test(rawUrl) ? `https://${rawUrl}` : rawUrl
            const content = (
              <div className="group w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.03]"
                style={{ background: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="shrink-0 transition-transform duration-300 group-hover:scale-110 [&>svg]:w-[18px] [&>svg]:h-[18px]">{PLATFORM_ICON[s.name] || DEFAULT_ICON}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-white text-[13px] font-medium truncate" style={{ fontFamily: FONT }}>{s.name}</div>
                  <div className="text-white text-[10px] truncate" style={{ fontFamily: MONO }}>{s.handle}</div>
                </div>
                <span
                  className="shrink-0 text-[12px] font-semibold"
                  style={{ fontFamily: MONO, color: '#D85A9E' }}
                >
                  {s.status}
                </span>
              </div>
            )

            return (
              <motion.div key={`${s.name}-${i}`} variants={fadeCard} className="grow basis-[calc(50%-6px)] md:basis-0 md:max-w-[300px] flex">
                {/* basis 50%−gap → 2 per row on mobile; desktop shares the row
                    equally but each card is capped (md:max-w) so a lone card
                    doesn't stretch full width — it stays sized and centred. */}
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full flex-1">
                    {content}
                  </a>
                ) : content}
              </motion.div>
            )
          })}
        </motion.div>

        <div className="rounded-xl px-4 py-3 text-center text-base mb-24 md:mb-32 max-w-[920px] mx-auto" style={{ background: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: FONT }}>
          <span className="font-semibold" style={{ color: '#D85A9E' }}>✦ </span>
          <span className="font-semibold" style={{ color: '#D85A9E' }}>Professional presence verified across Instagram</span>
        </div>

        {/* Brand collaborations glass card — hidden when the creator has no
            collaborations (BRAND_SUMMARY is empty for a real creator with none). */}
        {BRAND_SUMMARY?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.h3
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="font-bold leading-tight"
            style={{ fontFamily: FONT, fontSize: 'clamp(40px, 7vw, 64px)' }}
          >
            Brand<br />Collaborations
          </motion.h3>

          <motion.div ref={cardRef} className="relative" style={{ x: cardX, opacity: cardOpacity }}>
            {/* Four solid blue circles tucked behind each card corner — same as the
                home-page waitlist card. */}
            {[
              {
                width: '86.5px',
                height: '86.5px',
                top: '-36px',
                left: '-26px',
                background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
              },
              {
                width: '128.19px',
                height: '128.18px',
                top: '-45px',
                // Shifted further right on mobile, original 34px on md+.
                cls: '-right-7 md:right-[34px]',
                background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
              },
              { width: '112.75px', height: '104.7px', bottom: '-20px', cls: '-left-6 md:-left-[50px]', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
              { width: '65.61px', height: '65.61px', bottom: '-28px', cls: '-right-2 md:right-[88px]', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
              { width: '70.57px', height: '70.57px', bottom: '34px', left: '144px', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
            ].map(({ width, height, background, cls = '', ...pos }, i) => (
              <div
                key={i}
                className={`absolute rounded-full pointer-events-none select-none ${cls}`}
                style={{
                  width,
                  height,
                  zIndex: 0,
                  background:
                    background ??
                    'radial-gradient(circle, #4a66f5 0%, #2c3cc0 55%, #141a6e 85%, #0d1250 100%)',
                  filter: 'blur(0.5px)',
                  boxShadow: '0 0 40px rgba(70,100,255,0.28)',
                  ...pos,
                }}
              />
            ))}

            <div
              className="relative rounded-[28px] px-9 py-10 flex flex-col justify-center"
              style={{
                width: '502.02px',
                height: '322.82px',
                maxWidth: '100%',
                zIndex: 1,
                background: 'rgba(18, 18, 22, 0.22)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 0 0 1px rgba(255, 255, 255, 0.04), 0 30px 90px rgba(0, 0, 0, 0.55)',
              }}
            >
              {BRAND_SUMMARY.map((s, i) => (
                <div key={s.label} className="flex-1 flex items-center gap-8">
                  <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'rgba(255,255,255,0.95)' }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${barWidth(i)}%` }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 + i * 0.12 }}
                    />
                  </div>
                  <div className="shrink-0 w-[92px] text-right">
                    <CountUpText
                      text={s.value}
                      delay={0.1 + i * 0.12}
                      duration={1.1}
                      className="block text-white font-bold text-2xl leading-none text-right"
                      style={{ fontFamily: FONT }}
                    />
                    <div className="text-white/40 text-[9px] tracking-widest mt-1" style={{ fontFamily: MONO }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
        )}
      </div>
    </section>
  )
}
