import { useState } from 'react'
import { motion } from 'framer-motion'
import { fadeUp, staggerParent } from '../../motion-variants.js'
import { FONT, MONO, PACKAGES, LABEL_GRADIENT } from './influenceData.js'

export default function Packages() {
  // The parked plane is hidden while the click flight runs.
  const [flying, setFlying] = useState(false)

  // Fire the paper-plane flight (handled by PaperPlaneFlight, which traces a
  // smooth S from here, through the Starter card, to the Send Inquiry button,
  // and scrolls the page along with it).
  const launch = (e) => {
    e.preventDefault()
    setFlying(true)
    window.dispatchEvent(new Event('plane-launch'))
    setTimeout(() => setFlying(false), 10400)
  }

  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 pt-32 md:pt-52 pb-12 md:pb-20 overflow-hidden">
      {/* Decorative diagonal sheen */}
      <img
        src="/image/2nd%20line.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{ right: '1%', top: '-8%', width: 900, height: 'auto', opacity: 0.8, zIndex: 0 }}
      />

      {/* Parked plane — static decoration. Takes off when the CTA is clicked. */}
      <img
        id="parked-plane"
        src="/PLANE.png"
        alt=""
        draggable={false}
        style={{ position: 'absolute', left: 180, top: 60, width: 500, height: 500, objectFit: 'contain', opacity: flying ? 0 : 0.9, transform: 'rotate(8deg)', pointerEvents: 'none', filter: 'drop-shadow(0 12px 30px rgba(0,0,0,0.5))', zIndex: -1 }}
      />
      {/* Paper-plane CTA banner */}
      <div id="cta-banner" className="max-w-[1180px] mx-auto text-center mb-20 md:mb-28" style={{ transform: 'translate(230px, -60px)' }}>
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
        <motion.button
          type="button"
          onClick={launch}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.1 }}
          whileHover={{ scale: 1.04 }}
          className="inline-flex items-center justify-center rounded-2xl px-8 py-4 font-bold tracking-widest leading-none"
          style={{ fontFamily: FONT, fontSize: 24, color: '#15172b', background: 'linear-gradient(180deg, #5D65DC 0%, #5D65DC 32%, #9CA2E1 100%)', boxShadow: '0 12px 30px rgba(93,101,220,0.4)' }}
        >
          LET&apos;S WORK TOGETHER
        </motion.button>
      </div>

      <div className="relative max-w-[1180px] mx-auto text-center mb-12 md:mb-16">
        {/* Decorative diagonal light streak behind the heading */}
        <img
          src="/line.png"
          alt=""
          aria-hidden="true"
          className="absolute right-0 bottom-0 translate-x-1/2 translate-y-[62%] rotate-[2deg] pointer-events-none select-none w-[1600px] max-w-none opacity-60 z-0"
        />
        <h2 className="relative z-10 text-5xl md:text-6xl font-medium mb-3" style={{ fontFamily: FONT }}>Collaboration Packages</h2>
        <p className="relative z-10 text-white/45 text-sm" style={{ fontFamily: MONO }}>Standard services. Exact quotes provided after alignment.</p>
      </div>

      <motion.div
        className="max-w-[1180px] mx-auto flex flex-nowrap justify-center items-center gap-4"
        variants={staggerParent}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {PACKAGES.map((p) => (
          <motion.div
            key={p.tier}
            id={p.tier === 'STARTER' ? 'pkg-starter' : undefined}
            variants={fadeUp}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl p-7 flex flex-col shrink-0"
            style={{
              ...(p.popular ? { width: '360px', height: '400.64px', maxWidth: '100%', marginTop: '-23px' } : { width: '360px', height: '377.57px', maxWidth: '100%' }),
              background: 'rgba(15,16,24,0.5)',
              border: '1px solid #ffffff',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 18px 50px rgba(0,0,0,0.4)',
            }}
          >
            {p.popular && (
              <span
                className="absolute -top-3 left-[78%] -translate-x-1/2 text-sm font-semibold text-white px-3 py-1 rounded-full whitespace-nowrap"
                style={{ background: '#0918E5', fontFamily: FONT }}
              >
                Most Popular
              </span>
            )}
            <div className="text-sm tracking-widest mb-2" style={{ fontFamily: MONO, color: '#8F97FF' }}>{p.tier}</div>
            <div className="text-white font-semibold leading-none mb-1" style={{ fontFamily: FONT, fontSize: 38 }}>{p.price}</div>
            <div className="text-sm mb-6" style={{ fontFamily: MONO, color: '#8F97FF' }}>{p.sub}</div>
            <ul className="flex flex-col gap-2.5 mb-6">
              {p.features.map((f) => (
                <li key={f} className="text-white text-base">
                  {f}
                </li>
              ))}
            </ul>
            {p.popular && (
              <a
                href="#work-with-me"
                className="no-underline mt-auto w-full rounded-full font-semibold text-sm py-3 text-center transition-all hover:scale-[1.02] text-white"
                style={{ fontFamily: FONT, background: '#0918E5' }}
              >
                Book Now
              </a>
            )}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
