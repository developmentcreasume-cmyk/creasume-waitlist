import { motion } from 'framer-motion'
import { fadeUp, staggerParent } from '../../motion-variants.js'
import { FONT, MONO, BRAND_DEALS } from './influenceData.js'

const TAG_COLORS = {
  FITNESS: '#4DE0B0',
  FASHION: '#E1306C',
  BEAUTY: '#B558F6',
  TRAVEL: '#5D65DC',
}

export default function BrandReach() {
  return (
    <section className="relative z-10 px-8 sm:px-12 md:px-20 lg:px-28 py-12 md:py-20">
      <div className="max-w-[820px] mx-auto">
        <h2 className="text-center text-4xl md:text-5xl font-bold mb-12 md:mb-16" style={{ fontFamily: FONT }}>
          Brands I&apos;ve <span style={{ color: '#9EA5E2' }}>Worked With</span>
        </h2>

        <motion.div
          className="relative pl-8"
          variants={staggerParent}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {/* Timeline spine */}
          <span className="absolute left-[5px] top-2 bottom-2 w-px" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0.04))' }} />

          <div className="flex flex-col gap-5">
            {BRAND_DEALS.map((deal, i) => (
              <motion.div key={deal.brand} variants={fadeUp} className="relative">
                {/* Node */}
                <span className="absolute -left-[27px] top-7 w-2.5 h-2.5 rounded-full" style={{ background: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)', boxShadow: i === 0 ? '0 0 0 4px rgba(255,255,255,0.12)' : 'none' }} />

                <motion.div
                  whileHover={{ x: 6 }}
                  className="rounded-2xl px-6 py-5 flex items-start justify-between gap-4"
                  style={{ background: i === 0 ? '#000' : 'rgba(40,46,112,0.22)', border: i === 0 ? '1px solid rgba(255,255,255,0.5)' : '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-2xl md:text-3xl leading-none mb-2" style={{ fontFamily: FONT }}>{deal.brand}</h3>
                    <p className="text-white/55 text-sm mb-3">{deal.campaign}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {['REEL', 'POST'].map((t) => (
                        <span key={t} className="text-[9px] tracking-widest px-2 py-1 rounded" style={{ fontFamily: MONO, color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.18)' }}>{t}</span>
                      ))}
                      {/* Provenance: verified = pulled from the creator's own Instagram
                          post; otherwise the reach figure is self-reported. */}
                      <span
                        className="text-[9px] tracking-widest px-2 py-1 rounded inline-flex items-center gap-1"
                        style={{
                          fontFamily: MONO,
                          color: deal.verified ? '#4DE0B0' : '#F6C560',
                          border: `1px solid ${deal.verified ? 'rgba(77,224,176,0.4)' : 'rgba(246,197,96,0.4)'}`,
                        }}
                        title={deal.verified
                          ? 'Reach verified from Instagram'
                          : 'Self-reported — entered manually, not verified from Instagram'}
                      >
                        {deal.verified ? '✓ VERIFIED' : 'ⓘ SELF-REPORTED'}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-white font-bold text-3xl leading-none" style={{ fontFamily: FONT }}>{deal.reach}</div>
                    <div className="text-white/40 text-[10px] tracking-widest mt-1 mb-3" style={{ fontFamily: MONO }}>REACH</div>
                    <div className="text-[11px] tracking-widest font-medium" style={{ fontFamily: MONO, color: TAG_COLORS[deal.tag] }}>{deal.tag}</div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
