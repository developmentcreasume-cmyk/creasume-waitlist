import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FONT, MONO } from './influenceData.js'
import { useInfluence } from './InfluenceDataContext.jsx'

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
const PLATFORM_ICON = {
  YouTube: (<svg width="22" height="22" viewBox="0 0 24 24" fill="#FF0000"><path d="M23 12s0-3.8-.5-5.6a2.9 2.9 0 0 0-2-2C18.7 4 12 4 12 4s-6.7 0-8.5.4a2.9 2.9 0 0 0-2 2C1 8.2 1 12 1 12s0 3.8.5 5.6a2.9 2.9 0 0 0 2 2C5.3 20 12 20 12 20s6.7 0 8.5-.4a2.9 2.9 0 0 0 2-2C23 15.8 23 12 23 12ZM9.8 15.3V8.7l5.7 3.3-5.7 3.3Z" /></svg>),
  'Instagram': (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="#E1306C" stroke="none" /></svg>),
  'X (formerly Twitter)': (<svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M18.2 2H21l-6.5 7.4L22 22h-6.2l-4.8-6.3L5.5 22H2.7l7-8L2 2h6.3l4.4 5.8L18.2 2Zm-1.1 18h1.7L7 3.8H5.2L17.1 20Z" /></svg>),
}

export default function ProfessionalPresence() {
  const { SOCIALS, BRAND_SUMMARY } = useInfluence()

  // Scroll-linked sweep: the Brand Collaborations card glides in from the right
  // as the section scrolls into view (slower, tied to scroll, not a one-shot).
  const cardRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ['start end', 'center center'] })
  const cardX = useTransform(scrollYProgress, [0, 0.55], [420, 0])
  const cardOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1])

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

        {/* Platform rows */}
        <motion.div
          className="flex flex-col md:flex-row gap-3 mb-3 max-w-[920px] mx-auto"
          variants={fadeStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {SOCIALS.map((s) => (
            <motion.div
              key={s.name}
              variants={fadeCard}
              className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3.5"
              style={{ background: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="shrink-0">{PLATFORM_ICON[s.name]}</span>
              <div className="min-w-0 flex-1">
                <div className="text-white text-sm font-medium truncate" style={{ fontFamily: FONT }}>{s.name}</div>
                <div className="text-white text-[11px] truncate" style={{ fontFamily: MONO }}>{s.handle}</div>
              </div>
              <span
                className="shrink-0 text-[13px] font-semibold"
                style={{ fontFamily: MONO, color: '#D85A9E' }}
              >
                {s.status}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="rounded-xl px-4 py-3 text-center text-base mb-24 md:mb-32 max-w-[920px] mx-auto" style={{ background: 'rgba(40,46,112,0.30)', border: '1px solid rgba(255,255,255,0.08)', fontFamily: FONT }}>
          <span className="font-semibold" style={{ color: '#D85A9E' }}>✦ </span>
          <span className="font-semibold" style={{ color: '#D85A9E' }}>Professional presence verified across Instagram</span>
        </div>

        {/* Brand collaborations glass card */}
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
                right: '34px',
                background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)',
              },
              { width: '112.75px', height: '104.7px', bottom: '-20px', left: '-50px', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
              { width: '65.61px', height: '65.61px', bottom: '-28px', right: '88px', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
              { width: '70.57px', height: '70.57px', bottom: '34px', left: '144px', background: 'radial-gradient(circle, #3C48F7 0%, #212997 55%, #000320 100%)' },
            ].map(({ width, height, background, ...pos }, i) => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none select-none"
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
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${[100, 50, 75, 100][i]}%`, background: 'rgba(255,255,255,0.95)' }}
                    />
                  </div>
                  <div className="shrink-0 w-[92px] text-right">
                    <div className="text-white font-bold text-2xl leading-none" style={{ fontFamily: FONT }}>{s.value}</div>
                    <div className="text-white/40 text-[9px] tracking-widest mt-1" style={{ fontFamily: MONO }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
