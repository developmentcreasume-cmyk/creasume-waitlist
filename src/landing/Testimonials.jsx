import { motion } from 'framer-motion'

// Placeholder testimonial cards — larger empty surfaces with an avatar dot and
// faint skeleton lines, matching the design's not-yet-filled state. Swap the
// array for real quotes/photos later.
const SLOTS = Array.from({ length: 6 })

function TestimonialCard() {
  return (
    <div
      className="shrink-0 w-75 md:w-85 h-65 md:h-70 rounded-2xl p-7 mx-3 flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(20,22,30,0.9) 0%, rgba(10,11,16,0.9) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Avatar + name placeholder */}
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-12 h-12 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="flex flex-col gap-2">
          <span className="block h-3 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="block h-2.5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
      </div>
      {/* Quote placeholder lines */}
      <div className="flex flex-col gap-3">
        {['100%', '92%', '96%', '70%'].map((w, i) => (
          <span key={i} className="block h-2.5 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.07)' }} />
        ))}
      </div>
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="relative z-10 py-16 md:py-24 overflow-hidden">
      {/* Static heading + subtitle (centered, does not move). */}
      <div className="text-center mb-12 md:mb-16 relative z-10 px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">Hear from Our Influencers</h2>
        <p className="text-white/60 text-base md:text-lg mx-auto max-w-2xl leading-relaxed">
          Discover what our satisfied customers have to say about their experiences with our product/services.
        </p>
      </div>

      {/* Auto-scrolling marquee: two identical halves + CSS slide loop. Pauses on
          hover (lp-marquee-group). Edge fade masks the in/out so cards don't pop. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="lp-marquee-group flex w-full overflow-hidden"
        style={{
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
          maskImage: 'linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%)',
        }}
      >
        <div className="lp-marquee" style={{ animationDuration: '40s' }}>
          <div className="flex shrink-0">
            {SLOTS.map((_, i) => <TestimonialCard key={i} />)}
          </div>
          <div className="flex shrink-0" aria-hidden="true">
            {SLOTS.map((_, i) => <TestimonialCard key={i} />)}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
