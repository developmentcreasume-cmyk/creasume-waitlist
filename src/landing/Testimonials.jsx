import { motion } from 'framer-motion'

// "Hear from Our Influencers". Real testimonials come from the admin panel
// (Admin → Landing page → Creator testimonials) and are passed in as `items`.
// With none configured we render the original placeholder skeletons, so the
// section never looks broken on a fresh install.
const SLOTS = Array.from({ length: 6 })

const CARD_CLASS = 'shrink-0 w-75 md:w-85 h-65 md:h-70 rounded-2xl p-7 mx-3 flex flex-col'
const CARD_STYLE = {
  background: 'linear-gradient(180deg, rgba(20,22,30,0.9) 0%, rgba(10,11,16,0.9) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
}

// Not-yet-filled state: avatar dot + faint skeleton lines.
function PlaceholderCard() {
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-12 h-12 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <div className="flex flex-col gap-2">
          <span className="block h-3 w-28 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <span className="block h-2.5 w-20 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {['100%', '92%', '96%', '70%'].map((w, i) => (
          <span key={i} className="block h-2.5 rounded-full" style={{ width: w, background: 'rgba(255,255,255,0.07)' }} />
        ))}
      </div>
    </div>
  )
}

// A real testimonial. Falls back to the creator's initial when no photo was
// uploaded, so the avatar circle is never an empty/broken image.
function TestimonialCard({ item }) {
  const initial = (item.name || '?').trim().charAt(0).toUpperCase()
  return (
    <div className={CARD_CLASS} style={CARD_STYLE}>
      <div className="flex items-center gap-3 mb-5">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-12 h-12 rounded-full shrink-0 object-cover"
            style={{ border: '1px solid rgba(255,255,255,0.12)' }}
          />
        ) : (
          <span
            className="grid place-items-center w-12 h-12 rounded-full shrink-0 font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            {initial}
          </span>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-white font-semibold text-[15px] truncate">{item.name}</span>
          {item.handle && <span className="text-white/50 text-[13px] truncate">{item.handle}</span>}
        </div>
      </div>
      <p className="text-white/75 text-[14px] leading-relaxed overflow-hidden">
        {item.quote}
      </p>
    </div>
  )
}

export default function Testimonials({ items = [] }) {
  const hasReal = items.length > 0
  // The marquee slides its track -50%, so each half must hold the same content.
  // With only one or two real testimonials a single pass is too narrow to fill
  // a wide screen, which shows as a gap in the loop — repeat until it's wide.
  const reps = hasReal ? Math.max(1, Math.ceil(6 / items.length)) : 1
  const cards = hasReal
    ? Array.from({ length: reps }).flatMap(() => items)
    : SLOTS

  const half = (hidden) => (
    <div className="flex shrink-0" aria-hidden={hidden}>
      {cards.map((it, i) =>
        hasReal ? <TestimonialCard key={`${it._id || i}-${i}`} item={it} /> : <PlaceholderCard key={i} />
      )}
    </div>
  )

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
          {half(undefined)}
          {half(true)}
        </div>
      </motion.div>
    </section>
  )
}
